# Recruit-AI - Project Structure

## 📁 Complete File & Folder Structure

```
Recruit-AI/
│
├── 📄 README.md                          # Complete setup and run guide
│
├── 📂 frontend/                          # React Frontend Application
│   ├── 📂 public/                        # Public static assets
│   │   └── vite.svg                      # Vite logo
│   │
│   ├── 📂 src/                           # Source code
│   │   ├── 📂 components/                # React components
│   │   │   ├── BulkUpload.jsx           # Bulk candidate screening (with text/file toggle)
│   │   │   ├── CandidateCard.jsx        # Individual candidate result display
│   │   │   ├── FileUpload.jsx           # Single screening file upload
│   │   │   ├── Layout.jsx               # Main app layout with sidebar
│   │   │   ├── Login.jsx                # Authentication (Supabase)
│   │   │   ├── Profile.jsx              # User profile management
│   │   │   ├── ScreeningHistory.jsx     # Screening history with filters
│   │   │   └── SettingsPanel.jsx        # Multi-LLM provider settings
│   │   │
│   │   ├── 📂 lib/                       # Library utilities
│   │   │   └── supabase.js              # Supabase client & helper functions
│   │   │
│   │   ├── 📂 services/                  # API services
│   │   │   └── api.js                   # API calls (analyze, screenings, email, calendar)
│   │   │
│   │   ├── App.jsx                      # Main app component with routing
│   │   ├── App.css                      # App-specific styles
│   │   ├── index.css                    # Global styles & Tailwind imports
│   │   └── main.jsx                     # App entry point
│   │
│   ├── 📄 .env                          # Environment variables (gitignored)
│   ├── 📄 .env.example                  # Environment variables template
│   ├── 📄 .gitignore                    # Git ignore rules
│   ├── 📄 eslint.config.js              # ESLint configuration
│   ├── 📄 index.html                    # HTML entry point
│   ├── 📄 package.json                  # Dependencies & scripts
│   ├── 📄 package-lock.json             # Locked dependencies
│   ├── 📄 postcss.config.js             # PostCSS configuration
│   ├── 📄 tailwind.config.js            # Tailwind CSS configuration
│   └── 📄 vite.config.js                # Vite build configuration
│
├── 📂 backend/                           # Backend Configuration & Workflows
│   ├── 📄 recruit-ai-workflow.json      # n8n workflow (AI analysis)
│   ├── 📄 supabase-schema.sql           # Database schema (5 tables + RLS)
│   ├── 📄 SUPABASE_SETUP.md             # Supabase setup guide
│   └── 📄 N8N_MULTI_LLM_SETUP.md        # n8n multi-LLM configuration guide
│
└── 📂 .gemini/                           # AI Assistant artifacts (optional)
    └── antigravity/brain/.../
        ├── task.md                       # Task tracking
        ├── implementation_plan.md        # Implementation plan
        └── walkthrough.md                # Completion walkthrough
```

---

## 📊 Detailed Component Breakdown

### Frontend Components (`frontend/src/components/`)

| File | Purpose | Key Features |
|------|---------|-------------|
| **BulkUpload.jsx** | Bulk candidate screening | Text/file toggle for JD, multiple resume upload, batch processing |
| **CandidateCard.jsx** | Display analysis results | Score visualization, recommendation badge, detailed criteria |
| **FileUpload.jsx** | Single screening interface | Drag-and-drop, file preview, text input option |
| **Layout.jsx** | App shell | Sidebar navigation, user menu, responsive design |
| **Login.jsx** | Authentication | Email/password, Google OAuth, Supabase integration |
| **Profile.jsx** | User profile | Avatar upload, name/email edit, role management |
| **ScreeningHistory.jsx** | History management | Filtering, sorting, CSV export, stats cards |
| **SettingsPanel.jsx** | LLM configuration | 4 providers (OpenAI, Perplexity, Gemini, Custom), API key management |

### API Services (`frontend/src/services/`)

| Function | Purpose | Returns |
|----------|---------|---------|
| `analyzeCandidate()` | Send JD+resume to n8n | Analysis result |
| `saveScreening()` | Save result to Supabase | void |
| `getScreenings()` | Fetch screening history | Array of screenings |
| `sendEmail()` | Trigger email via n8n | Email result |
| `scheduleInterview()` | Create calendar event | Event result |
| `getUserSettings()` | Get active LLM provider | Settings object |
| `updateSettings()` | Save provider config | void |

### Database Schema (`backend/supabase-schema.sql`)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **profiles** | User profiles | id, name, email, avatar_url, role |
| **settings** | LLM configurations | user_id, active_provider, provider_config (JSONB) |
| **screenings** | Screening results | user_id, candidate_name, score, recommendation, details (JSONB) |
| **email_logs** | Email audit trail | user_id, screening_id, email_type, status |
| **calendar_events** | Interview events | user_id, screening_id, event_id, start_time |

---

## 🔧 Configuration Files

### Frontend Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: React, Vite, Tailwind, Framer Motion, Supabase |
| `vite.config.js` | Vite build settings, plugins |
| `tailwind.config.js` | Custom colors, fonts, animations |
| `postcss.config.js` | Tailwind processing |
| `eslint.config.js` | Code linting rules |
| `.env` | Environment variables (Supabase, n8n URLs) |
| `.env.example` | Environment template |

### Backend Configuration

| File | Purpose |
|------|---------|
| `recruit-ai-workflow.json` | n8n workflow with LLM integration |
| `supabase-schema.sql` | Complete database schema with RLS |
| `SUPABASE_SETUP.md` | Step-by-step Supabase setup |
| `N8N_MULTI_LLM_SETUP.md` | n8n configuration guide |

---

## 📦 Dependencies

### Frontend (`package.json`)

**Core:**
- `react` ^18.3.1 - UI library
- `react-dom` ^18.3.1 - React DOM renderer
- `vite` ^7.2.4 - Build tool

**UI & Styling:**
- `tailwindcss` ^3.4.17 - Utility-first CSS
- `framer-motion` ^12.0.0 - Animations
- `lucide-react` ^0.469.0 - Icons

**Backend Integration:**
- `@supabase/supabase-js` ^2.x.x - Supabase client

**Dev Dependencies:**
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` - Code linting
- `autoprefixer` - CSS vendor prefixes
- `postcss` - CSS processing

---

## 🌐 Environment Variables

### Frontend (`.env`)

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# n8n Webhooks
VITE_N8N_WEBHOOK_URL_ANALYZE=http://localhost:5678/webhook/analyze
VITE_N8N_WEBHOOK_URL_EMAIL=http://localhost:5678/webhook/send-email
VITE_N8N_WEBHOOK_URL_CALENDAR=http://localhost:5678/webhook/schedule-interview

# Optional
VITE_USE_MOCK=false
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Backend (n8n Environment)

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG... (service_role key)

# LLM Providers
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
GEMINI_API_KEY=AIza...
CUSTOM_API_KEY=your-key
```

---

## 🚀 Key Features by File

### Authentication Flow
- `Login.jsx` - UI & form handling
- `App.jsx` - Auth state management
- `lib/supabase.js` - Supabase client & helpers

### Screening Flow
- `FileUpload.jsx` - Single screening input
- `BulkUpload.jsx` - Bulk screening input
- `services/api.js` - API calls to n8n
- `CandidateCard.jsx` - Results display
- `ScreeningHistory.jsx` - History management

### Settings & Configuration
- `SettingsPanel.jsx` - UI for provider config
- `services/api.js` - Settings CRUD
- Database: `settings` table

### Data Persistence
- `services/api.js` - Save/load functions
- Database: `screenings`, `email_logs`, `calendar_events` tables
- RLS policies for data security

---

## 📈 Data Flow

```
User Input (JD + Resume)
    ↓
FileUpload.jsx / BulkUpload.jsx
    ↓
services/api.js → analyzeCandidate()
    ↓
n8n Webhook (recruit-ai-workflow.json)
    ↓
LLM API (OpenAI/Perplexity/Gemini)
    ↓
n8n Response Parsing
    ↓
services/api.js → saveScreening()
    ↓
Supabase Database (screenings table)
    ↓
CandidateCard.jsx (Display)
    ↓
ScreeningHistory.jsx (History)
```

---

## 🔒 Security Architecture

### Frontend
- ✅ Uses `anon` key (public, safe for browser)
- ✅ JWT tokens for API authentication
- ✅ No secrets in code
- ✅ Environment variables for config

### Backend (Supabase)
- ✅ Row Level Security (RLS) on all tables
- ✅ Users can only access their own data
- ✅ `service_role` key only in n8n (server-side)
- ✅ Foreign key constraints

### n8n
- ✅ Environment variables for API keys
- ✅ Webhook authentication
- ✅ CORS configuration

---

## 📝 File Sizes & Complexity

| Category | Files | Lines of Code (approx) |
|----------|-------|------------------------|
| **Components** | 8 files | ~2,500 lines |
| **Services** | 1 file | ~300 lines |
| **Utilities** | 1 file | ~100 lines |
| **Configuration** | 7 files | ~200 lines |
| **Backend** | 4 files | ~500 lines |
| **Documentation** | 3 files | ~1,500 lines |
| **Total** | **24 files** | **~5,100 lines** |

---

## 🎯 Entry Points

### Development
1. **Frontend**: `npm run dev` → `main.jsx` → `App.jsx`
2. **Backend**: `npx n8n` → Workflow activated

### Production
1. **Frontend**: `npm run build` → `dist/` folder
2. **Backend**: n8n Cloud or self-hosted

---

## 📚 Documentation Files

| File | Purpose | Location |
|------|---------|----------|
| `README.md` | Complete setup guide | Root |
| `SUPABASE_SETUP.md` | Supabase configuration | `backend/` |
| `N8N_MULTI_LLM_SETUP.md` | n8n workflow setup | `backend/` |
| `walkthrough.md` | Implementation summary | `.gemini/` (artifact) |
| `task.md` | Task tracking | `.gemini/` (artifact) |
| `implementation_plan.md` | Technical plan | `.gemini/` (artifact) |

---

## 🔄 Git Structure

```
.gitignore includes:
- node_modules/
- dist/
- .env (but not .env.example)
- .DS_Store
- *.log
```

---

## 💡 Quick Reference

### To Add a New Component:
1. Create in `frontend/src/components/`
2. Import in `App.jsx`
3. Add to routing/navigation

### To Add a New API Function:
1. Add to `frontend/src/services/api.js`
2. Import in component
3. Call with proper error handling

### To Add a New Database Table:
1. Add SQL to `backend/supabase-schema.sql`
2. Run in Supabase SQL Editor
3. Add RLS policies
4. Update API functions

### To Add a New LLM Provider:
1. Update `SettingsPanel.jsx` UI
2. Update `services/api.js` provider list
3. Update n8n workflow configuration
4. Add environment variable

---

**Last Updated**: 2025-12-09  
**Total Project Size**: ~5,100 lines of code across 24 files  
**Tech Stack**: React + Vite + Tailwind + Supabase + n8n
