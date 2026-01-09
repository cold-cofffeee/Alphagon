@echo off
REM Script to guide migration application on Windows
echo ========================================
echo Alphagon Migration Guide for Windows
echo ========================================
echo.
echo This script will guide you through applying migrations to your Supabase database.
echo.
echo WARNING: Migrations must be run in order!
echo.
echo Option 1: Using Supabase Dashboard (Recommended for first-time setup)
echo ----------------------------------------------------------------------
echo 1. Go to: https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq
echo 2. Navigate to: SQL Editor (left sidebar)
echo 3. Click: 'New Query'
echo 4. Copy and paste each migration file in order:
echo    - supabase/migrations/001_initial_schema.sql
echo    - supabase/migrations/002_rls_policies.sql
echo    - supabase/migrations/003_functions_triggers.sql
echo    - supabase/migrations/004_seed_data.sql
echo 5. Click 'Run' after pasting each file
echo 6. Verify no errors appear
echo.
echo Option 2: Using Supabase CLI (Best for version control)
echo -------------------------------------------------------
echo 1. Install Supabase CLI:
echo    npm install -g supabase
echo.
echo 2. Login:
echo    supabase login
echo.
echo 3. Link your project:
echo    supabase link --project-ref zrlotbiptnwakwedgovq
echo.
echo 4. Push migrations:
echo    supabase db push
echo.
echo After migrations are complete:
echo ------------------------------
echo 1. Test the connection by running: npm run dev
echo 2. Try signing up a user
echo 3. Check Supabase dashboard to verify tables were created
echo 4. Promote your account to admin using the SQL query in README.md
echo.
echo Need help? Check the README.md or Supabase documentation.
echo.
pause
