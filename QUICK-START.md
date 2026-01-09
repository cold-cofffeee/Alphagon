# 🚀 Alphagon Setup Instructions

## Step 1: Install & Configure

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
```

Edit `.env` and add your keys:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `GEMINI_API_KEY` - Your Google Gemini API key

## Step 2: Apply Database Schema

1. Open the file: `supabase/database-setup.sql` (should be open in VS Code)
2. Select ALL (Ctrl+A) and Copy (Ctrl+C)
3. Go to: https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq/editor
4. Paste (Ctrl+V) into the SQL Editor
5. Click "RUN" button
6. Wait ~5 seconds for success message

## Step 3: Start the App

```bash
npm run dev
```

App will be available at: http://localhost:3000

## Step 4: Create Account & Make Yourself Admin

1. Sign up through the app
2. Go back to Supabase SQL Editor
3. Run this query (replace with your email):

```sql
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';
```

4. Refresh the app - you now have admin access!

## ✅ Done!

Your app is now running with full database integration.

---

### Need Help?

Check the main [README.md](README.md) for detailed documentation.
