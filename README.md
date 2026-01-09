# Alphagon - AI SaaS Platform

A fully integrated AI-powered SaaS platform with Supabase backend, featuring code-first schema management, role-based access control, and comprehensive audit logging.

## ⚡ Quick Start

**New to the project?** Start with [SETUP.md](./SETUP.md) for a step-by-step guide!

```bash
# 1. Install dependencies
npm install

# 2. Apply migrations (see SETUP.md for detailed instructions)
#    Go to: https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq
#    SQL Editor → Run each migration file in order

# 3. Verify setup
npm run verify

# 4. Start development
npm run dev
```

## 🚀 Features

- **Code-First Database**: All schema defined in migration files
- **Authentication**: Supabase Auth with role-based access (user, support, admin, super_admin)
- **Row Level Security**: Comprehensive RLS policies for data protection
- **Credit System**: Flexible credit management with transactions and refunds
- **AI Generations**: Track and version all AI-generated content
- **Audit Logging**: Immutable audit trail for all critical actions
- **Feature Flags**: Dynamic feature rollout with user targeting
- **Risk Management**: Automated risk flagging and monitoring
- **AI Usage Tracking**: Detailed token and cost tracking

## 📦 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS (if needed)

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Alphagon
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your Supabase credentials (already done):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_ENVIRONMENT=local
```

### 3. Database Setup

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref zrlotbiptnwakwedgovq

# Push migrations
supabase db push
```

#### Option B: Manual via Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq)
2. Navigate to SQL Editor
3. Copy and execute each file in `supabase/migrations/` in order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_triggers.sql`
   - `004_seed_data.sql`

### 4. Run Development Server

```bash
npm run dev
```

## 📁 Project Structure

```
Alphagon/
├── supabase/
│   ├── migrations/           # Database migration files
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions_triggers.sql
│   │   └── 004_seed_data.sql
│   ├── migrate.ts           # Migration runner
│   └── README.md            # Migration documentation
├── lib/
│   └── supabase.ts          # Supabase client setup
├── types/
│   └── database.types.ts    # TypeScript database types
├── services/                # Data access layer
│   ├── authService.ts       # Authentication
│   ├── userService.ts       # User management
│   ├── creditService.ts     # Credit transactions
│   ├── generationService.ts # AI generations
│   ├── planService.ts       # Subscription plans
│   ├── auditService.ts      # Audit logging
│   ├── supportServices.ts   # Vault, flags, risk
│   └── index.ts             # Service exports
├── contexts/
│   └── AuthContext.tsx      # Auth state management
├── components/              # React components
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example env file
└── package.json
```

## 🗄️ Database Schema

### Core Tables

- **users**: User profiles with roles, credits, and ban management
- **sessions**: User session tracking
- **plans**: Subscription/credit plans
- **credit_transactions**: All credit movements with audit trail
- **generations**: AI generation requests and results
- **vault_versions**: Content version history
- **audit_logs**: Immutable audit trail
- **ai_usage**: Token and cost tracking
- **risk_flags**: Automated risk detection
- **feature_flags**: Dynamic feature control

### User Roles

- **user**: Standard user with basic access
- **support**: Support team with read access to user data
- **admin**: Full administrative access
- **super_admin**: System-level administrative access

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Users can only access their own data
- Admins have full access
- Support has read-only access where appropriate
- Audit logs are append-only

### Environment Safety

- Production credentials never in code
- Separate configs for local/staging/production
- Service role key only for server-side operations

## 📊 Key Services

### Auth Service
```typescript
import { authService } from './services';

// Sign up with welcome bonus
await authService.signUp('user@example.com', 'password', 'Full Name');

// Sign in with audit logging
await authService.signIn('user@example.com', 'password');

// Check permissions
const isAdmin = await authService.isAdmin();
```

### Credit Service
```typescript
import { creditService } from './services';

// Add credits
await creditService.addCredits(userId, 100, 'purchase', 'Starter plan');

// Deduct credits
await creditService.deductCredits(userId, 10, 'AI generation', generationId);

// Check balance
const hasCredits = await creditService.hasEnoughCredits(userId, 10);
```

### Generation Service
```typescript
import { generationService } from './services';

// Create generation
const generation = await generationService.createGeneration(
  userId,
  'Create a landing page',
  'gemini-pro'
);

// Update with results
await generationService.updateGeneration(generation.id, {
  status: 'completed',
  result: { content: '...' },
  credits_used: 10,
});
```

### Audit Service
```typescript
import { auditService } from './services';

// All critical actions are automatically logged via triggers
// Manual logging for custom events
await auditService.createAuditLog({
  userId,
  action: 'custom_action',
  entityType: 'custom_entity',
  metadata: { custom: 'data' },
});
```

## 🎣 React Hooks

### useAuth Hook
```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, profile, loading, signIn, signOut, refreshProfile } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return (
    <div>
      <h1>Welcome {profile?.full_name}</h1>
      <p>Credits: {profile?.credits}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### useGeneration Hook
```typescript
import { useGeneration } from './hooks';

function GenerateContent() {
  const { generate, loading, error } = useGeneration();
  
  const handleGenerate = async () => {
    const result = await generate({
      prompt: 'Create a landing page',
      model: 'gemini-pro',
      creditsRequired: 10,
    });
    
    if (result?.success) {
      console.log('Generated:', result.content);
    }
  };
  
  return (
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : 'Generate'}
    </button>
  );
}
```

### useCredits Hook
```typescript
import { useCredits } from './hooks';

function CreditDisplay() {
  const { credits, loading, refetch } = useCredits();
  
  return (
    <div>
      <p>Credits: {loading ? '...' : credits}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## 🔄 Migrations

### Creating New Migrations

1. Create file: `supabase/migrations/XXX_description.sql`
2. Add your SQL changes
3. Test locally
4. Push to Supabase

### Best Practices

- Never modify existing migrations
- Always include rollback instructions in comments
- Test migrations on staging first
- Keep migrations small and focused
- Review RLS policies for new tables

## 🧪 Testing Database Connection

```typescript
import { supabase } from './lib/supabase';

// Test connection
const { data, error } = await supabase
  .from('users')
  .select('count')
  .single();

console.log('Database connected:', !error);
```

## 📈 Monitoring

### Admin Dashboard Queries

```sql
-- Active users count
SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND NOT is_banned;

-- Total credits issued vs used
SELECT 
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as issued,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as used
FROM credit_transactions;

-- Generation success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM generations
GROUP BY status;
```

## 🚨 Troubleshooting

### Migration Errors

1. Check Supabase logs in dashboard
2. Verify environment variables are set
3. Ensure service role key has correct permissions
4. Run migrations one at a time manually

### RLS Issues

1. Check user's role in `users` table
2. Verify RLS policies are enabled
3. Use service role key for admin operations
4. Check Supabase logs for policy violations

### Connection Issues

1. Verify `.env` file exists and is loaded
2. Check Supabase project is active
3. Verify API keys are correct
4. Check network/firewall settings

## 🚀 Deployment

### Deploying to Production

#### 1. Set Up Environment Variables

On your hosting platform (Vercel, Netlify, etc.), set these environment variables:

```env
VITE_SUPABASE_URL=https://zrlotbiptnwakwedgovq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ENVIRONMENT=production
```

**Never expose the service role key in production frontend!**

#### 2. Build the Application

```bash
npm run build
```

#### 3. Deploy

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Manual:**
```bash
# Upload the dist/ folder to your hosting provider
npm run build
# Upload contents of dist/ folder
```

### Environment-Specific Migrations

For staging/production databases:

1. Create separate Supabase projects for each environment
2. Update `.env` with appropriate credentials
3. Run migrations on each environment:

```bash
# Staging
VITE_ENVIRONMENT=staging npm run migrate

# Production
VITE_ENVIRONMENT=production npm run migrate
```

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Run database migrations
- [ ] Test authentication flow
- [ ] Test credit purchases
- [ ] Test AI generation
- [ ] Verify RLS policies are working
- [ ] Check audit logs are being created
- [ ] Monitor error tracking
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Enable CORS if needed

## 📊 Production Monitoring

### Key Metrics to Track

1. **User Metrics**
   - New signups per day
   - Active users
   - Churn rate

2. **Credit Metrics**
   - Credits purchased vs used
   - Average credits per user
   - Revenue per user

3. **AI Metrics**
   - Generations per day
   - Success/failure rate
   - Average processing time
   - Token costs

4. **System Health**
   - API response times
   - Database query performance
   - Error rates
   - RLS policy performance

### Supabase Dashboard Access

Monitor your production database:
- Dashboard: https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq
- SQL Editor: For running manual queries
- Logs: Real-time error and query logs
- Database: Monitor table sizes and connections

## 🔧 Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check unresolved risk flags
- Review failed generations

**Weekly:**
- Audit user activity
- Review credit transactions
- Check AI costs vs revenue
- Database performance review

**Monthly:**
- Clean up old sessions
- Archive old audit logs
- Database maintenance (VACUUM)
- Security audit
- Update dependencies

### Database Maintenance Queries

```sql
-- Clean up expired sessions
DELETE FROM sessions WHERE expires_at < NOW();

-- Archive old audit logs (older than 1 year)
-- Run this after backing up to cold storage
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';

-- Database health check
VACUUM ANALYZE;

-- Check for bloated tables
SELECT 
  schemaname, 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📝 License

Private - All Rights Reserved

## 🤝 Contributing

1. Create feature branch
2. Make changes with migrations if needed
3. Test locally
4. Submit PR with description

## 📧 Support

For issues or questions, contact the development team.

---

**Note**: This is a production-ready setup with all best practices for database management, security, and scalability. The database schema is fully reproducible from code, ensuring consistency across environments.

## 🎯 Next Steps

### Immediate Actions

1. **Run Migrations**: Apply database schema to your Supabase project
2. **Create First Admin**: Sign up and manually promote to admin role
3. **Test Authentication**: Verify signup/login flows
4. **Test Credit System**: Add credits and test deduction
5. **Integrate AI Service**: Connect your existing Gemini service

### Integration Checklist

- [ ] Apply all migrations to Supabase
- [ ] Test database connection
- [ ] Verify RLS policies work
- [ ] Create test user account
- [ ] Test credit transactions
- [ ] Test generation workflow
- [ ] Verify audit logs are created
- [ ] Test admin functions
- [ ] Set up production environment
- [ ] Deploy to hosting platform

### Quick Start Commands

```bash
# Development
npm run dev

# Run migrations (after setting up .env)
# Option 1: Via Supabase Dashboard (copy SQL files)
# Option 2: Via Supabase CLI
supabase db push

# Build for production
npm run build

# Preview production build
npm run preview
```

### Creating Your First Admin User

After migrations are applied:

1. Sign up normally through the app
2. Go to Supabase SQL Editor
3. Run this query with your email:

```sql
UPDATE users
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

### API Keys Reference

All keys are stored in `.env` (gitignored):

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anon key (safe for frontend)
- `SUPABASE_SERVICE_ROLE_KEY`: Admin key (server-side only)
- `VITE_ENVIRONMENT`: Current environment (local/staging/production)

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq/editor)

## 💡 Pro Tips

1. **Always test migrations on staging first** before production
2. **Use the service role key only server-side** - never expose it in frontend code
3. **Monitor your RLS policies** - they're your primary security layer
4. **Set up database backups** in Supabase dashboard
5. **Use audit logs** to track all critical user and admin actions
6. **Implement rate limiting** to prevent abuse
7. **Monitor AI costs** - track token usage and set budgets
8. **Keep migrations small** - easier to debug and rollback
9. **Document custom queries** in supabase/queries.sql
10. **Regular maintenance** - clean old sessions, vacuum database

## 🔐 Security Best Practices

1. ✅ Environment variables properly configured
2. ✅ `.env` file in `.gitignore`
3. ✅ RLS enabled on all tables
4. ✅ Role-based access control implemented
5. ✅ Service role key never exposed to frontend
6. ✅ Audit logging for all critical actions
7. ✅ User ban system in place
8. ✅ Soft deletes for data retention
9. ⚠️ TODO: Implement rate limiting
10. ⚠️ TODO: Add email verification
11. ⚠️ TODO: Set up 2FA for admins
12. ⚠️ TODO: Configure CORS properly
