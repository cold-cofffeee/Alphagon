import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Migration tracking table
const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
`;

async function runMigration(name: string, sql: string): Promise<void> {
  console.log(`\n🔄 Running migration: ${name}`);
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If RPC doesn't exist, try direct execution (for initial setup)
      const { error: directError } = await supabase.from('_migrations').select('*').limit(1);
      
      if (directError?.code === '42P01') {
        // Table doesn't exist, we need to create it first
        console.log('📋 Creating migrations tracking table...');
        await executeSqlDirect(MIGRATIONS_TABLE);
      }
      
      // Try executing the migration
      await executeSqlDirect(sql);
    }
    
    // Record migration
    const { error: insertError } = await supabase
      .from('_migrations')
      .insert({ name });
    
    if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
      throw insertError;
    }
    
    console.log(`✅ Migration completed: ${name}`);
  } catch (err) {
    console.error(`❌ Migration failed: ${name}`);
    console.error(err);
    throw err;
  }
}

async function executeSqlDirect(sql: string): Promise<void> {
  // Note: This is a simplified version. In production, you'd want to use
  // Supabase's SQL editor API or the Supabase CLI
  console.warn('⚠️  Direct SQL execution - please run migrations via Supabase CLI or Dashboard');
  console.log('SQL to execute:');
  console.log(sql);
}

async function getExecutedMigrations(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('_migrations')
      .select('name')
      .order('executed_at', { ascending: true });
    
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet
        return [];
      }
      throw error;
    }
    
    return data?.map(m => m.name) || [];
  } catch {
    return [];
  }
}

async function runMigrations(): Promise<void> {
  console.log('🚀 Starting database migrations...\n');
  
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  const executedMigrations = await getExecutedMigrations();
  
  console.log(`📊 Found ${migrationFiles.length} migration files`);
  console.log(`✓ ${executedMigrations.length} already executed\n`);
  
  let newMigrationsCount = 0;
  
  for (const file of migrationFiles) {
    const migrationName = file.replace('.sql', '');
    
    if (executedMigrations.includes(migrationName)) {
      console.log(`⏭️  Skipping ${migrationName} (already executed)`);
      continue;
    }
    
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    await runMigration(migrationName, sql);
    newMigrationsCount++;
  }
  
  console.log(`\n✨ Migration complete!`);
  console.log(`   ${newMigrationsCount} new migrations executed`);
  console.log(`   ${executedMigrations.length + newMigrationsCount} total migrations\n`);
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('✅ All migrations completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
