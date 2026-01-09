import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

/**
 * Database Connection Verification Script
 * Run this to verify your Supabase setup is complete
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please check your .env file has:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verifying Alphagon Database Setup...\n');

  const checks = {
    connection: false,
    tables: false,
    functions: false,
    policies: false,
  };

  try {
    // 1. Check connection
    console.log('1️⃣  Checking database connection...');
    const { data: healthCheck, error: connError } = await supabase
      .from('_migrations')
      .select('count')
      .limit(1);

    if (!connError) {
      checks.connection = true;
      console.log('   ✅ Connected to Supabase\n');
    } else {
      console.error('   ❌ Connection failed:', connError.message, '\n');
      return checks;
    }

    // 2. Check if migrations table exists and has data
    console.log('2️⃣  Checking migrations...');
    const { data: migrations, error: migError } = await supabase
      .from('_migrations')
      .select('name, executed_at')
      .order('executed_at', { ascending: true });

    if (!migError && migrations) {
      console.log(`   ✅ Found ${migrations.length} applied migrations:`);
      migrations.forEach((m) => {
        console.log(`      - ${m.name}`);
      });
      console.log('');
    } else {
      console.log('   ⚠️  No migrations found. Please apply migrations first.\n');
    }

    // 3. Check if core tables exist
    console.log('3️⃣  Checking core tables...');
    const tables = [
      'users',
      'sessions',
      'plans',
      'credit_transactions',
      'generations',
      'audit_logs',
      'feature_flags',
    ];

    let allTablesExist = true;
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (!error) {
        console.log(`   ✅ Table '${table}' exists`);
      } else {
        console.log(`   ❌ Table '${table}' missing`);
        allTablesExist = false;
      }
    }
    checks.tables = allTablesExist;
    console.log('');

    // 4. Check if stored functions exist
    console.log('4️⃣  Checking database functions...');
    const { data: funcs, error: funcError } = await supabase.rpc('add_credits', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_amount: 0,
      p_type: 'bonus',
      p_description: 'test',
      p_admin_id: null,
    });

    if (!funcError || funcError.message.includes('violates foreign key')) {
      // If we get a foreign key error, it means the function exists
      checks.functions = true;
      console.log('   ✅ Database functions are installed\n');
    } else {
      console.log('   ❌ Database functions missing or not working\n');
    }

    // 5. Check RLS policies
    console.log('5️⃣  Checking Row Level Security...');
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.log('   ⚠️  Not authenticated - cannot test RLS policies');
      console.log('   💡 Sign up to test RLS\n');
    } else {
      // Try to access own user record
      const { data: profile, error: rlsError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (!rlsError && profile) {
        checks.policies = true;
        console.log('   ✅ RLS policies are active and working\n');
      } else {
        console.log('   ❌ RLS policies may not be configured correctly\n');
      }
    }

    // 6. Check seed data
    console.log('6️⃣  Checking seed data...');
    const { data: plans, error: planError } = await supabase
      .from('plans')
      .select('count');

    if (!planError && plans && plans.length > 0) {
      console.log(`   ✅ Found ${plans.length} plans in database\n`);
    } else {
      console.log('   ⚠️  No plans found - seed data may not be loaded\n');
    }

    // Summary
    console.log('📊 Setup Summary:');
    console.log('─────────────────────────────────────');
    console.log(`Connection:       ${checks.connection ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Tables:           ${checks.tables ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Functions:        ${checks.functions ? '✅ OK' : '⚠️  UNKNOWN'}`);
    console.log(`RLS Policies:     ${checks.policies ? '✅ OK' : '⚠️  UNKNOWN'}`);
    console.log('─────────────────────────────────────\n');

    if (checks.connection && checks.tables) {
      console.log('🎉 Your database is ready!');
      console.log('Next steps:');
      console.log('  1. Run: npm run dev');
      console.log('  2. Sign up for an account');
      console.log('  3. Promote yourself to admin (see README.md)\n');
    } else {
      console.log('⚠️  Setup incomplete. Please:');
      console.log('  1. Check your .env file has correct credentials');
      console.log('  2. Apply migrations via Supabase Dashboard or CLI');
      console.log('  3. See README.md for detailed instructions\n');
    }
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
verifySetup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
