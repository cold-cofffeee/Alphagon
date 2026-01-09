# 🎯 Alphagon - Intelligence over volume

**Alphagon** is an enterprise-grade, full-stack AI-powered content intelligence web application for content creators. Transform a single video or audio file into multiple high-impact, platform-specific content assets using Google Gemini AI with intelligent caching, modular on-demand generation, and a comprehensive admin control panel.

> **CRITICAL**: This application uses a **Single Source of Truth Architecture** where the Admin Panel controls all tool availability, prompts, settings, and content. The frontend dynamically reads configuration from the database.

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

## 📞 Next Steps

1. ✅ Run `npm install`
2. ✅ Set up `.env` with your API keys
3. ✅ Run `setup.sql` in Supabase
4. ✅ Run `npm run dev`
5. ✅ Open `http://localhost:3000`
6. ✅ Sign up and start creating

For issues or questions, check the code comments in `src/` files for detailed implementation notes.

