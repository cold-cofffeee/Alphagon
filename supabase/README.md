# Supabase Migrations

This directory contains all database migrations for Alphagon. All schema changes must be made through migration files to ensure reproducibility across environments.

## Migration Files

Migrations are numbered sequentially and executed in order:

- `001_initial_schema.sql` - Core tables, enums, and indexes
- `002_rls_policies.sql` - Row Level Security policies
- `003_functions_triggers.sql` - Database functions and triggers
- `004_seed_data.sql` - Initial seed data (plans, feature flags)

## Running Migrations

### Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref zrlotbiptnwakwedgovq

# Run migrations
supabase db push

# Or apply migrations from SQL files
supabase db reset
```

### Manual Method via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Execute each migration

### Using the Migration Script

```bash
npm run migrate
```

## Creating New Migrations

1. Create a new file with format: `XXX_description.sql`
2. Add your SQL changes
3. Test locally first if possible
4. Run the migration
5. Commit the file to version control

## Environment-Specific Migrations

- **Local**: Use `VITE_ENVIRONMENT=local`
- **Staging**: Use `VITE_ENVIRONMENT=staging`
- **Production**: Use `VITE_ENVIRONMENT=production`

## Best Practices

1. **Never modify existing migrations** - Create new ones for changes
2. **Test migrations locally** before applying to production
3. **Include rollback instructions** in comments if applicable
4. **Keep migrations small and focused** on a single concern
5. **Always review RLS policies** when adding new tables

## Troubleshooting

If migrations fail:

1. Check Supabase logs in the dashboard
2. Verify environment variables are set correctly
3. Ensure you have the correct permissions
4. Try running migrations one at a time manually

## Schema Documentation

See the main README for detailed schema documentation and entity relationships.
