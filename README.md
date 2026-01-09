# 🎯 Alphagon - Intelligence over volume

**Alphagon** is an enterprise-grade, full-stack AI-powered content intelligence web application for content creators. Transform a single video or audio file into multiple high-impact, platform-specific content assets using Google Gemini AI with intelligent caching, modular on-demand generation, and a comprehensive admin control panel.

> **CRITICAL**: This application uses a **Single Source of Truth Architecture** where the Admin Panel controls all tool availability, prompts, settings, and content. The frontend dynamically reads configuration from the database.

---

## ✅ Current Status

**Build Status**: ✓ Compiled successfully  
**Server Status**: ✓ Running on http://localhost:3000  
**Database**: Comprehensive merged schema ready (`database-schema.sql`)

### ✅ Completed & Working:
- ✅ **Backend API**: Complete TypeScript/Express server with all routes
  - Auth routes (signup, login, logout)
  - User routes (profile, stats)
  - Project routes (CRUD operations)
  - Generate routes (AI content generation with caching)
  - Admin routes (complete admin panel API)
  - Config routes (public configuration for frontend)
- ✅ **Admin Panel**: Full enterprise admin UI with backend API
  - Dashboard with overview stats
  - User management with restrictions
  - Tool configuration (enable/disable, rate limits, order)
  - Prompt template management with versioning
  - System settings control
  - Content moderation
  - Activity audit logs
- ✅ **Frontend Pages**: All pages created and functional
  - Homepage (`/`)
  - Dashboard (`/dashboard`) - config-driven, reads from admin
  - Login (`/login`)
  - Signup (`/signup`)
  - Settings (`/settings`)
  - About (`/about`)
  - Admin Panel (`/admin`)
- ✅ **Database**: Merged comprehensive schema
  - Core tables (users, projects, generations, logs, stats)
  - Admin tables (roles, tool_config, prompts, settings, content)
  - RLS policies on all tables
  - Helper functions (is_admin, get_active_prompt, etc.)
  - Triggers (auto-update counts, timestamps)
  - 15 default tools pre-configured
- ✅ **Security**: Production-ready security
  - RLS policies on all tables
  - JWT authentication
  - Admin authorization with role-based permissions
  - Rate limiting
  - Input validation
  - Helmet security headers
- ✅ **Services**: Complete integrations
  - Supabase service with caching
  - Gemini AI service with 15 tool prompts
  - Admin service with all operations
- ✅ **Configuration**: Config-driven architecture
  - Frontend reads tools from `/api/config/tools`
  - Frontend reads settings from `/api/config/settings`
  - Maintenance mode control
  - Dynamic defaults from admin panel

### 📋 Project Structure (Cleaned):
```
Alphagon/
├── database-schema.sql       # ✅ Complete merged schema
├── src/                      # ✅ Backend source
│   ├── server.ts
│   ├── config/index.ts
│   ├── services/            # supabase, gemini, admin
│   ├── routes/              # auth, user, project, generate, admin, config
│   ├── middleware/          # auth, admin, error
│   ├── types/
│   └── utils/
├── pages/                    # ✅ All frontend pages
│   ├── dashboard.html
│   ├── login.html
│   ├── signup.html
│   ├── settings.html
│   └── about.html
├── public/
│   ├── index.html           # Homepage
│   └── admin/index.html     # Admin panel
├── css/
│   ├── main.css
│   └── admin.css
├── js/
│   ├── dashboard-v2.js      # Config-driven dashboard
│   └── admin.js             # Admin panel client
├── dist/                     # Compiled TypeScript
├── .env                      # Environment variables
└── README.md                 # This file
```

### 🎯 What You Get:

**1. Single Source of Truth Architecture**
   - Admin panel controls everything
   - Frontend dynamically reads configuration
   - No hardcoded tools or settings in frontend
   - Real-time updates when admin changes config

**2. Complete Admin Control**
   - Enable/disable any tool instantly
   - Change tool order, rate limits, visibility
   - Manage prompt templates with versioning
   - Control maintenance mode
   - Restrict users
   - Moderate content
   - View complete audit trail

**3. Intelligent Caching System**
   - SHA-256 hash of (transcription + settings + tool)
   - Instant cache hits save API costs
   - Prevents duplicate AI calls
   - Cache stats tracked per tool

**4. Enterprise Security**
   - Row Level Security on all tables
   - JWT authentication with Supabase
   - Admin role-based permissions
   - Rate limiting per route
   - Secure helper functions
   - Complete audit logging

**5. Production-Ready Code**
   - TypeScript with strict mode
   - Error handling on all routes
   - Environment configuration
   - Database connection pooling
   - Request validation
   - CORS configuration
   - Security headers (Helmet)

### Next Steps to Deploy:
1. ✅ Run `database-schema.sql` in your Supabase SQL Editor
2. ✅ Add your Gemini API key to `.env`
3. ✅ Server is running on http://localhost:3000
4. ✅ Create first user via signup
5. ✅ Grant admin role via SQL query
6. ✅ Access admin panel at http://localhost:3000/admin
7. ✅ Configure tools, prompts, and settings
8. ✅ Start creating content!

---

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + TypeScript + Express
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI Provider**: Google Gemini 2.0 Flash (via Generative Language API)
- **Frontend**: Vanilla JavaScript (multi-page application, config-driven)
- **Authentication**: Supabase Auth with JWT
- **Admin Panel**: Enterprise-grade control interface

### Key Features
- **🔐 Secure Authentication**: Signup/login with Supabase
- **💾 Smart Caching**: AI responses cached in database to save tokens
- **🎯 Modular AI Tools**: 15+ specialized content generation tools
- **👨‍💼 Admin Panel**: Complete control over tools, prompts, settings, users
- **📊 Usage Tracking**: Token usage, cache hits, generation stats
- **🌐 Multi-language**: English, Bangla, Mixed (admin-configurable)
- **🎨 Clean UI**: Professional SaaS-style interface
- **⚙️ Config-Driven**: Frontend reads all configuration from admin panel

### Architecture Principles

**Single Source of Truth**: The admin panel database is the authority for all configuration:
- Tool availability, order, and visibility
- Prompt templates with versioning
- Rate limits and restrictions
- System settings (maintenance mode, defaults)
- Website content (dynamic rendering)

**Frontend as Consumer**: The user-facing application:
- Queries `/api/config/*` endpoints for configuration
- Never hardcodes tool lists or settings
- Respects admin-controlled maintenance mode
- Adapts to tool enable/disable in real-time

---

## 📁 Project Structure

```
Alphagon/
├── src/
│   ├── server.ts                 # Main Express server
│   ├── config/
│   │   └── index.ts              # Environment configuration
│   ├── services/
│   │   ├── supabase.service.ts   # Database operations
│   │   ├── gemini.service.ts     # AI generation with Gemini
│   │   └── admin.service.ts      # Admin panel operations
│   ├── routes/
│   │   ├── auth.routes.ts        # Authentication endpoints
│   │   ├── user.routes.ts        # User profile & settings
│   │   ├── project.routes.ts     # Project CRUD
│   │   ├── generate.routes.ts    # AI content generation
│   │   ├── admin.routes.ts       # Admin panel API
│   │   └── config.routes.ts      # Public config endpoints
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── admin.middleware.ts   # Admin authorization
│   │   └── error.middleware.ts   # Error handling
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   └── utils/
│       └── helpers.ts            # Utility functions
├── public/
│   ├── index.html                # Homepage
│   └── admin/
│       └── index.html            # Admin panel interface
├── pages/
│   ├── dashboard.html            # Main app workspace
│   ├── login.html                # Login page
│   ├── signup.html               # Signup page
│   ├── settings.html             # User settings
│   └── about.html                # About/philosophy
├── css/
│   ├── main.css                  # Global styles
│   └── admin.css                 # Admin panel styles
├── js/
│   ├── dashboard-v2.js           # Config-driven dashboard client
│   └── admin.js                  # Admin panel client logic
├── setup.sql                     # Main database schema
├── admin-setup.sql               # Admin panel schema
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- Supabase account
- Google Gemini API key

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire content of `database-schema.sql` (comprehensive merged schema)
4. Run the SQL script
5. This creates:
   - ✅ Core tables: users, projects, generations, usage stats, error logs
   - ✅ Admin tables: admin_roles, tool_config, prompts, settings, content
   - ✅ Security: RLS policies on all tables
   - ✅ Functions: Helper functions for admin checks, prompt resolution
   - ✅ Triggers: Auto-update counts and timestamps
   - ✅ Default data: 15 tools configured, system settings initialized
4. This creates: admin roles, tool config, prompts, settings, content management

### 3. Create Your Admin Account

1. Sign up through the application first (this creates your user account)
2. In Supabase SQL Editor, run:
```sql
-- Replace with your actual user ID from user_profiles table
INSERT INTO admin_roles (user_id, role, permissions)
VALUES ('your-user-id-here', 'super_admin', '{
  "manage_users": true,
  "manage_tools": true,
  "manage_prompts": true,
  "manage_settings": true,
  "manage_content": true,
  "moderate_content": true,
  "manage_admins": true
}'::jsonb);
```

### 4. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:
```env
# Your values are already in .env.example
# Just add your Gemini API key:
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 7. Build for Production

```bash
npm run build
npm start
```

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### User
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update settings
- `GET /api/user/stats` - Dashboard statistics
- `GET /api/user/usage` - Usage statistics

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/generations` - Get all generations

### AI Generation
- `POST /api/generate/content` - Generate AI content (with caching)
- `POST /api/generate/transcribe` - Transcribe audio
- `POST /api/generate/:id/rate` - Rate generation

### Admin Panel (Protected)
All routes require admin authentication.

#### Dashboard & Analytics
- `GET /api/admin/dashboard` - Overview stats, tool usage, recent logs
- `GET /api/admin/analytics/tool-usage` - Tool usage statistics

#### User Management
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - User details
- `POST /api/admin/users/:userId/restrict` - Restrict user access
- `DELETE /api/admin/restrictions/:restrictionId` - Remove restriction

#### Tool Configuration
- `GET /api/admin/tools` - List all tools (enabled and disabled)
- `GET /api/admin/tools/:toolName` - Get tool configuration
- `PATCH /api/admin/tools/:toolName` - Update tool (enable/disable, rate limits, order)

#### Prompt Management
- `GET /api/admin/prompts` - List all prompt templates
- `GET /api/admin/prompts/active/:toolName` - Get active prompt for tool
- `POST /api/admin/prompts` - Create new prompt version
- `PATCH /api/admin/prompts/:promptId` - Update prompt
- `POST /api/admin/prompts/:promptId/activate` - Activate prompt version

#### System Settings
- `GET /api/admin/settings` - List all system settings
- `GET /api/admin/settings/:key` - Get specific setting
- `PATCH /api/admin/settings/:key` - Update setting value

#### Website Content
- `GET /api/admin/content` - List website content
- `PATCH /api/admin/content/:contentId` - Update content

#### Content Moderation
- `GET /api/admin/flags` - List flagged content
- `POST /api/admin/flags/:flagId/resolve` - Resolve flag

#### Admin Role Management
- `GET /api/admin/admins` - List all admins
- `POST /api/admin/admins` - Grant admin access
- `PATCH /api/admin/admins/:userId` - Update admin role/permissions

#### Activity Logs
- `GET /api/admin/logs` - Admin activity audit trail

### Public Configuration (No Auth Required)
Frontend uses these to read admin-controlled configuration:

- `GET /api/config/tools` - List enabled, visible tools
- `GET /api/config/tools/:toolName` - Get tool configuration
- `GET /api/config/settings` - System settings (maintenance mode, defaults)
- `GET /api/config/content` - Dynamic website content

---

## 👨‍💼 Admin Panel

### Overview

The Admin Panel is the **single source of truth** for the entire application. It provides enterprise-grade control over:

- ✅ **Tool Management**: Enable/disable tools, set display order, rate limits
- ✅ **Prompt Control**: Version prompts, A/B test, condition-based selection
- ✅ **System Settings**: Maintenance mode, AI toggle, defaults
- ✅ **User Management**: View users, apply restrictions, monitor usage
- ✅ **Content Moderation**: Flag and review generated content
- ✅ **Analytics**: Dashboard with tool usage, user growth, generation stats
- ✅ **Audit Logs**: Complete activity trail of all admin actions

### Access

Navigate to `/admin` after logging in with an admin account.

### Admin Privileges

Admin accounts have granular permissions:
- `manage_users` - User management and restrictions
- `manage_tools` - Tool configuration
- `manage_prompts` - Prompt template management
- `manage_settings` - System settings
- `manage_content` - Website content
- `moderate_content` - Content flagging and moderation
- `manage_admins` - Admin role management (super admin only)

### Key Features

#### 1. Tool Configuration
Control every aspect of each tool:
- **Enable/Disable**: Turn tools on/off instantly
- **Visibility**: Hide tools without disabling
- **Display Order**: Control tool appearance order
- **Rate Limits**: Set per-hour and per-day limits
- **Regional/Language Availability**: Restrict by region/language

#### 2. Prompt Management
Advanced prompt control system:
- **Versioning**: Create multiple versions, activate best one
- **Conditional Prompts**: Different prompts for regions/languages/tones
- **A/B Testing**: Compare prompt performance
- **Template Variables**: Dynamic prompt construction
- **Rollback**: Easy revert to previous versions

#### 3. System Settings
Critical system controls:
- **Maintenance Mode**: Put system into maintenance (frontend shows message)
- **AI Generation Toggle**: Disable AI calls without downtime
- **Signup Control**: Enable/disable new registrations
- **Default Values**: Set default language, tone, region
- **Performance Tuning**: Cache TTL, max generation length

#### 4. User Management
Complete user control:
- **User Search**: Find users by email/name
- **Usage Stats**: Per-user generation counts
- **Restrictions**: Temporary or permanent access restrictions
- **Account Details**: View full user activity

#### 5. Content Moderation
Flag and review content:
- **Auto-flagging**: System flags potentially problematic content
- **Manual Review**: Admin reviews and resolves flags
- **User Actions**: Restrict users based on flagged content
- **Audit Trail**: Complete moderation history

#### 6. Analytics Dashboard
Real-time insights:
- **User Growth**: Daily/weekly/monthly user signups
- **Tool Popularity**: Usage counts per tool
- **Cache Performance**: Cache hit rates, token savings
- **Generation Trends**: Time-series generation patterns
- **Error Monitoring**: Track and resolve errors

### UI Design

The admin panel follows enterprise design principles:
- **Data-Dense**: Maximum information, minimal scrolling
- **Fast Navigation**: Keyboard shortcuts (Cmd/Ctrl+K for search, Cmd/Ctrl+S to save)
- **Clear Hierarchy**: Sidebar navigation with 9 main sections
- **White/Light Theme**: Professional, clean, high contrast
- **Responsive Tables**: Sortable, filterable, bulk actions
- **Instant Feedback**: Real-time updates, success/error messages

---

## 🧠 AI Tools (15 Modular Generators)

All tools use Google Gemini 2.0 Flash with custom prompt templates:

### Content Generation
1. **Thumbnail Text Copy** - Eye-catching thumbnail text
2. **SEO Title** - Search-optimized titles

### Platform-Specific
3. **YouTube** - Title + description with timestamps
4. **Facebook** - Engagement-driven posts
5. **Twitter/X** - Viral tweets under 280 chars
6. **Instagram Reels** - Hashtag-rich captions
7. **Blog** - Article title + introduction

### Descriptions
8. **Short Description** - 100-150 word summaries
9. **Long-Form Description** - Comprehensive descriptions

### Marketing
10. **Ad Copy** - Conversion-focused variations
11. **Hooks** - Attention-grabbing openers

### Content Expansion
12. **More Ideas (Same Angle)** - Similar variations
13. **More Ideas (Fresh Angles)** - New perspectives

### Optimization
14. **Improvement Suggestions** - Strategic recommendations
15. **Competitor Analysis** - Niche-based insights

---

## 💾 Database Schema

The `setup.sql` file creates:

### Tables
- `user_profiles` - Extended user data & preferences
- `projects` - User projects with media & transcriptions
- `ai_generations` - All AI outputs with caching
- `error_logs` - Error tracking for debugging
- `usage_stats` - Daily usage metrics per user

### Key Features
- **Row Level Security (RLS)** - Users can only access their own data
- **Automatic Triggers** - Update counts, cache stats automatically
- **Smart Caching** - Hash-based deduplication of AI generations
- **Usage Tracking** - Token usage, cache hit rates, per-tool analytics

---

## 🔒 Security

- **Environment Variables**: Never hardcode API keys
- **Row Level Security**: Database-level access control
- **JWT Authentication**: Supabase-managed tokens
- **Rate Limiting**: Prevent API abuse
- **Helmet.js**: Security headers
- **Input Sanitization**: XSS prevention

---

## 💰 Cost Optimization

### Intelligent Caching
- AI responses are hashed and cached in database
- Identical requests return cached results instantly
- Saves Gemini API tokens and reduces costs
- Cache hit rate tracked per user

### Token Tracking
- Every generation logs input/output tokens
- Usage stats aggregated daily
- View token consumption in dashboard

---

## 📱 Application Pages

### Public Pages
1. **Homepage** (`/`) - Landing page with product overview
2. **Login** (`/login`) - User authentication
3. **Signup** (`/signup`) - New account creation
4. **About** (`/about`) - Philosophy and mission

### Authenticated Pages
5. **Dashboard** (`/dashboard`) - Main workspace with all tools
6. **Settings** (`/settings`) - User preferences and defaults

---

## 🎨 Design Philosophy

- **White Mode Only**: Clean, professional appearance
- **Desktop-First**: Optimized for creator workflows
- **Modular Control**: Each tool triggers independently
- **No Auto-Generation**: User maintains full control
- **Precision over Automation**: Intelligence over volume

---

## �️ Development

### Adding New AI Tools

1. Add tool definition to `src/types/index.ts`:
```typescript
export const TOOLS: ToolConfig[] = [
  // ... existing tools
  {
    name: 'new-tool',
    label: 'New Tool Name',
    description: 'What this tool does',
    category: 'generation',
    promptTemplate: 'new-tool'
  }
];
```

2. Add prompt template to `src/services/gemini.service.ts`:
```typescript
private getToolPrompt(tool: ToolName): string {
  const prompts: Record<ToolName, string> = {
    // ... existing prompts
    'new-tool': `Your custom prompt template here`
  };
}
```

3. Add UI card to `pages/dashboard.html`

### Extending the API

Add new routes in `src/routes/` and register in `src/server.ts`

---

## 📊 Monitoring & Analytics

### Built-in Metrics
- Total projects per user
- Total generations per user
- Token usage tracking
- Cache hit rate
- Per-tool usage statistics
- Daily usage trends

### Error Logging
All errors automatically logged to `error_logs` table with:
- Error type and message
- Stack trace
- Request context
- User and project IDs

Access via Supabase dashboard for debugging

---

## 🚨 Troubleshooting

### Common Issues

**Database connection fails**
- Verify Supabase credentials in `.env`
- Check if `setup.sql` has been run
- Ensure RLS policies are enabled

**Gemini API errors**
- Verify API key is correct
- Check API quota/limits in Google AI Studio
- Ensure model name is correct (`gemini-2.0-flash-exp`)

**Authentication fails**
- Clear browser localStorage
- Check Supabase Auth settings
- Verify JWT token expiration

**No generations appearing**
- Check browser console for errors
- Verify project has transcription
- Check API endpoint in Network tab

---

## � Security Overview

### Database Security
- ✅ **Row Level Security (RLS)**: Enabled on all tables
- ✅ **User Isolation**: Users can only access their own data
- ✅ **Admin Protection**: Admin tables require `is_admin()` check
- ✅ **Public Read**: Only enabled tools/settings visible to public
- ✅ **Secure Functions**: Helper functions use `SECURITY DEFINER`

### API Security
- ✅ **JWT Authentication**: All protected routes require valid token
- ✅ **Admin Authorization**: Admin routes check role and permissions
- ✅ **Rate Limiting**: Express rate limiter on all API routes
- ✅ **Input Validation**: Request validation on all endpoints
- ✅ **Error Sanitization**: No sensitive data in error responses

### Admin Panel Security
- ✅ **Role-Based Access**: Granular permissions per admin role
- ✅ **Audit Logging**: All admin actions logged with details
- ✅ **Session Management**: JWT-based authentication
- ✅ **Restricted Access**: Frontend checks admin status before rendering

### Best Practices
- ✅ Environment variables for sensitive config
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)
- ✅ No hardcoded credentials

---

## 📊 Database Schema

The `database-schema.sql` file includes:

### Core Tables
- `user_profiles` - User accounts with preferences
- `projects` - Media projects with transcriptions
- `ai_generations` - Generated content with caching (unique index on input_hash)
- `usage_stats` - Aggregated metrics per user/day
- `error_logs` - Application error tracking

### Admin Tables
- `admin_roles` - Role assignments with permissions JSON
- `admin_activity_logs` - Complete audit trail
- `tool_config` - Tool settings (enabled, visible, rate limits, order)
- `prompt_templates` - Versioned prompts with conditions
- `system_settings` - Global settings (maintenance, defaults)
- `website_content` - Dynamic CMS for frontend
- `content_flags` - Content moderation queue
- `user_restrictions` - Admin-applied user restrictions

### Security Features
- RLS policies on all tables
- Admin-only access to sensitive tables
- Public read for configuration tables (tools, settings)
- Triggers for auto-updating counts and timestamps
- Helper functions with security definer

### Interconnections
- `user_profiles.id` → Referenced by all user-owned tables
- `projects.id` → Referenced by `ai_generations`
- `admin_roles.user_id` → Links users to admin status
- `tool_config.tool_name` → Used by generations and prompts
- Cascading deletes preserve referential integrity

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🙏 Acknowledgments

- **Google Gemini** - AI generation
- **Supabase** - Database and authentication
- **Express.js** - Backend framework
- **TypeScript** - Type safety

---

**Built with precision. Designed for creators. Powered by intelligence.**

**Alphagon** - *Intelligence over volume.*

---

## 📞 Quick Start Summary

1. ✅ Run `database-schema.sql` in Supabase SQL Editor
2. ✅ Copy `.env.example` to `.env` and add your Gemini API key
3. ✅ Run `npm install`
4. ✅ Run `npm run dev`
5. ✅ Open `http://localhost:3000`
6. ✅ Sign up, then grant yourself admin via SQL
7. ✅ Access admin panel at `/admin`

For detailed implementation notes, check the comprehensive comments in all source files.

