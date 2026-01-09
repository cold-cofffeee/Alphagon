# 🎯 Alphagon - Intelligence over volume

**Alphagon** is a production-ready, full-stack AI-powered content intelligence web application for content creators. Transform a single video or audio file into multiple high-impact, platform-specific content assets using Google Gemini AI with intelligent caching and modular, on-demand generation.

---

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + TypeScript + Express
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI Provider**: Google Gemini 2.0 Flash (via Generative Language API)
- **Frontend**: Vanilla JavaScript (multi-page application)
- **Authentication**: Supabase Auth

### Key Features
- **🔐 Secure Authentication**: Signup/login with Supabase
- **💾 Smart Caching**: AI responses cached in database to save tokens
- **🎯 Modular AI Tools**: 15+ specialized content generation tools
- **📊 Usage Tracking**: Token usage, cache hits, generation stats
- **🌐 Multi-language**: English, Bangla, Mixed
- **🎨 Clean UI**: Professional SaaS-style interface

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
│   │   └── gemini.service.ts     # AI generation with Gemini
│   ├── routes/
│   │   ├── auth.routes.ts        # Authentication endpoints
│   │   ├── user.routes.ts        # User profile & settings
│   │   ├── project.routes.ts     # Project CRUD
│   │   └── generate.routes.ts    # AI content generation
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   └── error.middleware.ts   # Error handling
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   └── utils/
│       └── helpers.ts            # Utility functions
├── public/
│   └── index.html                # Homepage
├── pages/
│   ├── dashboard.html            # Main app workspace
│   ├── login.html                # Login page
│   ├── signup.html               # Signup page
│   ├── settings.html             # User settings
│   └── about.html                # About/philosophy
├── css/
│   └── main.css                  # Global styles
├── js/
│   └── dashboard.js              # Dashboard client logic
├── setup.sql                     # Supabase database schema
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
3. Copy and paste the entire content of `setup.sql`
4. Run the SQL script
5. This will create all tables, indexes, RLS policies, triggers, and functions

### 3. Environment Configuration

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

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 6. Build for Production

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

