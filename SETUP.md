# 🎯 QUICK START GUIDE - Alphagon Setup

This guide will get your Alphagon platform up and running in minutes.

## ✅ Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## 🚀 Step-by-Step Setup

### 1. Verify Environment Variables ✓

Your `.env` file should already be configured with:
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY  
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ VITE_ENVIRONMENT

### 2. Install Dependencies

```bash
npm install
```

### 3. Apply Database Migrations

**Choose ONE of these methods:**

#### Method A: Via Supabase Dashboard (Easiest for first time)

1. Open: https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq
2. Click "SQL Editor" in left sidebar
3. Create a "New Query"
4. Copy & paste each file from `supabase/migrations/` in order:
   - `001_initial_schema.sql` → Run
   - `002_rls_policies.sql` → Run
   - `003_functions_triggers.sql` → Run
   - `004_seed_data.sql` → Run
5. Verify no errors

#### Method B: Via Supabase CLI (Recommended for teams)

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref zrlotbiptnwakwedgovq

# Push migrations
supabase db push
```

### 4. Verify Setup

```bash
npm run verify
```

This will check:
- ✓ Database connection
- ✓ Tables created
- ✓ Functions installed
- ✓ RLS policies active
- ✓ Seed data loaded

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 6. Create Your Admin Account

1. Sign up through the app UI
2. Go to Supabase SQL Editor
3. Run this query (replace with your email):

```sql
UPDATE users
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

4. Refresh your app - you now have admin access!

## 🎉 You're Done!

Your Alphagon platform is now fully operational with:
- ✅ User authentication
- ✅ Credit system
- ✅ AI generation tracking
- ✅ Admin panel
- ✅ Audit logging
- ✅ Role-based access control

## 🔧 Common Issues

### "Cannot connect to database"
- Check `.env` file exists and has correct values
- Verify Supabase project is active
- Check your internet connection

### "Table does not exist"
- Migrations not applied yet
- Follow Step 3 above to apply migrations
- Run `npm run verify` to check status

### "Permission denied" errors
- RLS policies are working correctly!
- Make sure you're signed in
- Check your user role in the database

## 📚 Next Steps

- Read [README.md](./README.md) for detailed documentation
- Check [supabase/queries.sql](./supabase/queries.sql) for useful admin queries
- Review [services/](./services/) folder for API integration examples
- Explore [hooks/](./hooks/) for React hook examples

## 🆘 Need Help?

1. Check the main [README.md](./README.md)
2. Review Supabase logs in the dashboard
3. Check the GitHub issues
4. Review migration files for SQL errors

---

**Pro Tip:** Bookmark the Supabase Dashboard for quick access to logs, SQL editor, and database monitoring!

🔗 Your Dashboard: https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq
