# Recruit-AI Frontend - Complete Documentation for AI Coding Assistants

> **Purpose**: This document provides a comprehensive overview of the Recruit-AI frontend architecture, data flow, components, and implementation details. Use this as context when working with AI coding assistants (Cursor, GitHub Copilot, etc.) to make changes or add features.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Application Architecture](#application-architecture)
4. [Data Flow](#data-flow)
5. [Component Hierarchy](#component-hierarchy)
6. [Detailed Component Documentation](#detailed-component-documentation)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Styling System](#styling-system)
10. [Authentication Flow](#authentication-flow)
11. [File Structure](#file-structure)
12. [Common Patterns](#common-patterns)
13. [How to Make Changes](#how-to-make-changes)

---

## 🎯 Project Overview

**Recruit-AI** is an AI-powered recruitment screening application that analyzes candidate resumes against job descriptions and provides structured recommendations.

### Key Features
- ✅ Single candidate screening with AI analysis
- ✅ Bulk resume upload and batch processing
- ✅ Screening history and candidate management
- ✅ User authentication (Email + Google OAuth)
- ✅ Settings panel for integrations
- ✅ Premium glassmorphism UI with animations

### User Journey
```
Login/Signup → Dashboard → Upload JD & Resume → AI Analysis → View Results → History
```

---

## 🛠 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 19.2.0 |
| **Vite** | Build Tool & Dev Server | 7.2.4 |
| **Tailwind CSS** | Styling Framework | 3.4.17 |
| **Framer Motion** | Animations | 12.23.24 |
| **Lucide React** | Icon Library | 0.555.0 |
| **LocalStorage** | Data Persistence | Native |

---

## 🏗 Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      App.jsx                            │
│  (Root Component - Auth, Routing, State Management)    │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼─────────────────────────────────┐
│ Login  │      │          Layout.jsx                  │
│        │      │  (Sidebar, Header, Main Content)     │
└────────┘      └──────────┬───────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐   ┌──────▼──────┐
   │Dashboard│      │ Candidates  │   │  Settings   │
   │  View   │      │    View     │   │    View     │
   └────┬────┘      └──────┬──────┘   └──────┬──────┘
        │                  │                  │
   ┌────┴─────────┐        │           ┌──────▼──────┐
   │              │        │           │ Settings    │
┌──▼──┐  ┌───────▼───┐    │           │   Panel     │
│Single│  │Bulk Upload│    │           └─────────────┘
│Screen│  │           │    │
└──┬───┘  └─────┬─────┘    │
   │            │          │
┌──▼──────┐  ┌──▼────┐  ┌──▼──────────┐
│FileUpload│  │Bulk   │  │Screening    │
│          │  │Upload │  │History      │
└────┬─────┘  └───┬───┘  └─────────────┘
     │            │
┌────▼────────────▼───┐
│   CandidateCard     │
│  (Results Display)  │
└─────────────────────┘
```

---

## 🔄 Data Flow

### 1. Authentication Flow

```javascript
User Input (Login/Signup)
  ↓
Validation (email format, password length)
  ↓
LocalStorage Check/Update
  ↓
Set User State in App.jsx
  ↓
Render Dashboard
```

**Key Files:**
- `Login.jsx` - Handles authentication UI and logic
- `App.jsx` - Manages user state
- LocalStorage keys: `user`, `users`

### 2. Candidate Analysis Flow

```javascript
User uploads JD + Resume
  ↓
FileUpload.jsx validates files
  ↓
App.jsx.handleAnalyze() called
  ↓
api.js.analyzeCandidate() makes API call
  ↓
Result stored in App.jsx state
  ↓
CandidateCard.jsx displays results
```

**Key Files:**
- `FileUpload.jsx` - File upload UI
- `App.jsx` - Analysis orchestration
- `services/api.js` - API integration
- `CandidateCard.jsx` - Results display

### 3. Navigation Flow

```javascript
User clicks sidebar item
  ↓
Layout.jsx calls onNavigate()
  ↓
App.jsx updates activeView state
  ↓
Conditional rendering in App.jsx
  ↓
Appropriate view component renders
```

---

## 🧩 Component Hierarchy

```
App.jsx (Root)
├── Login.jsx (if not authenticated)
└── Layout.jsx (if authenticated)
    ├── Sidebar (Navigation)
    ├── Header (Search, Notifications)
    └── Main Content Area
        ├── Dashboard View
        │   ├── Tab Navigation
        │   ├── FileUpload.jsx (Single Screening)
        │   ├── BulkUpload.jsx (Bulk Upload)
        │   └── ScreeningHistory.jsx (History Tab)
        ├── Candidates View
        │   └── ScreeningHistory.jsx
        ├── Settings View
        │   └── SettingsPanel.jsx
        └── Profile Modal
            └── Profile.jsx
```

---

## 📦 Detailed Component Documentation

### **App.jsx** (Root Component)

**Purpose**: Main application component that manages global state, authentication, and routing.

**State Variables:**
```javascript
user          // Current authenticated user object
showProfile   // Boolean for profile modal visibility
activeTab     // Current tab in dashboard ('single', 'bulk', 'history')
activeView    // Current view ('dashboard', 'candidates', 'settings')
isAnalyzing   // Boolean for loading state during analysis
result        // Analysis result from API
error         // Error message string
```

**Key Functions:**
```javascript
handleLogin(userData)           // Sets user and saves to localStorage
handleLogout()                  // Clears user and resets state
handleAnalyze(jdText, resumeText) // Calls API and updates result
handleNavigation(view)          // Changes active view
handleUpdateUser(updatedUser)   // Updates user profile
```

**Props Flow:**
- Passes `user`, `activeView`, `onNavigate` to `Layout`
- Passes `onAnalyze`, `isAnalyzing` to `FileUpload`/`BulkUpload`
- Passes `result` to `CandidateCard`

---

### **Layout.jsx** (Shell Component)

**Purpose**: Provides the application shell with sidebar navigation and header.

**Props:**
```javascript
children      // Main content to render
activeView    // Current active view
onNavigate    // Function to change views
user          // Current user object
onProfileClick // Function to open profile modal
onLogout      // Function to logout
```

**Structure:**
- **Sidebar**: Fixed left sidebar with navigation items
- **Header**: Sticky top header with search and notifications
- **Main**: Content area that renders children

**Navigation Items:**
```javascript
- Dashboard (LayoutDashboard icon)
- Candidates (Users icon)
- Settings (Settings icon)
- Logout (LogOut icon)
```

---

### **Login.jsx** (Authentication)

**Purpose**: Handles user authentication with email/password and Google OAuth.

**State:**
```javascript
isSignUp      // Toggle between login and signup
showPassword  // Toggle password visibility
error         // Validation error messages
formData      // { name, email, password }
```

**Key Functions:**
```javascript
validateEmail(email)      // Email format validation
handleGoogleLogin()       // Simulates Google OAuth
handleSubmit(e)          // Handles form submission
```

**Validation Rules:**
- Email: Must match regex pattern
- Password: Minimum 6 characters
- Name (signup only): Minimum 2 characters
- Duplicate email check on signup

**LocalStorage Structure:**
```javascript
users: [
  {
    name: "User Name",
    email: "user@example.com",
    password: "hashed_password",
    avatar: "url or null",
    role: "Talent Acquisition",
    loginMethod: "email" or "google"
  }
]
user: { /* current user object */ }
```

---

### **FileUpload.jsx** (Single Screening)

**Purpose**: Handles single candidate screening with JD and resume upload.

**Props:**
```javascript
onAnalyze     // Function to call API
isAnalyzing   // Loading state
```

**State:**
```javascript
jdFile        // Job description file object
resumeFile    // Resume file object
jdText        // Manual JD text input
resumeText    // Manual resume text input
uploadMode    // 'file' or 'text'
```

**Key Functions:**
```javascript
handleAnalyze()          // Validates and calls onAnalyze
hasValidInput()          // Checks if inputs are valid
```

**Upload Modes:**
1. **File Upload**: Drag & drop or click to upload PDF/DOCX
2. **Text Input**: Manual text entry in textarea

**Validation:**
- At least one JD input (file or text)
- At least one resume input (file or text)

---

### **BulkUpload.jsx** (Bulk Screening)

**Purpose**: Handles bulk candidate screening with multiple resumes.

**Props:**
```javascript
onAnalyze     // Function to call API for each resume
```

**State:**
```javascript
jdFile        // Single job description file
resumeFiles   // Array of resume files
isProcessing  // Loading state
results       // Array of analysis results
```

**Key Functions:**
```javascript
handleResumeDrop(e)      // Handles multiple file drop
removeResume(index)      // Removes a resume from list
handleBulkAnalyze()      // Processes all resumes sequentially
```

**Features:**
- Upload up to 50 resumes
- Progress tracking during analysis
- Individual result cards for each candidate

---

### **CandidateCard.jsx** (Results Display)

**Purpose**: Displays AI analysis results in a structured card format.

**Props:**
```javascript
result: {
  score: 0-100,
  summary: "string",
  recommendation: "Interview" or "Reject",
  details: [
    { criteria: "string", status: "match/partial/miss", reason: "string" }
  ],
  candidateName: "string",
  candidateEmail: "string"
}
```

**Visual Elements:**
- Score badge with color coding (green/yellow/red)
- Recommendation chip
- Summary text
- Criteria breakdown with status icons
- Animated entrance with Framer Motion

**Color Coding:**
```javascript
90-100: Green (Excellent)
75-89:  Blue (Good)
60-74:  Yellow (Fair)
0-59:   Red (Poor)
```

---

### **ScreeningHistory.jsx** (History View)

**Purpose**: Displays past screening results with filtering and sorting.

**State:**
```javascript
candidates    // Array of candidate objects
filterStatus  // 'all', 'interview', 'reject'
sortBy        // 'date', 'score'
```

**Features:**
- Filter by recommendation status
- Sort by date or score
- Export functionality (placeholder)
- Individual candidate cards

**Data Structure:**
```javascript
candidates: [
  {
    id: "unique_id",
    name: "Candidate Name",
    email: "email@example.com",
    score: 85,
    recommendation: "Interview",
    date: "2025-12-08",
    position: "Senior React Developer"
  }
]
```

---

### **SettingsPanel.jsx** (Settings)

**Purpose**: Configuration panel for API keys and integrations.

**Sections:**
1. **API Configuration**: OpenAI, Perplexity, Gemini API keys
2. **Email Integration**: SMTP settings
3. **Calendar Integration**: Google Calendar OAuth
4. **Preferences**: Theme, notifications, etc.

**State:**
```javascript
apiKeys       // Object with provider keys
emailConfig   // SMTP configuration
calendarAuth  // OAuth status
```

---

### **Profile.jsx** (User Profile Modal)

**Purpose**: User profile editing modal.

**Props:**
```javascript
user          // Current user object
onUpdateUser  // Function to update user
onClose       // Function to close modal
```

**Editable Fields:**
- Name
- Email
- Role
- Avatar (upload)

---

## 🗂 State Management

### Global State (App.jsx)

```javascript
// Authentication
user: {
  name: string,
  email: string,
  avatar: string | null,
  role: string,
  loginMethod: 'email' | 'google'
}

// Navigation
activeView: 'dashboard' | 'candidates' | 'settings'
activeTab: 'single' | 'bulk' | 'history'
showProfile: boolean

// Analysis
isAnalyzing: boolean
result: AnalysisResult | null
error: string | null
```

### Local State (Component-Level)

Each component manages its own form state, loading states, and UI state.

### Persistence

**LocalStorage Keys:**
- `user`: Current authenticated user
- `users`: Array of all registered users
- `candidates`: Array of screening results (optional)
- `settings`: User preferences (optional)

---

## 🔌 API Integration

### File: `services/api.js`

**Configuration:**
```javascript
const USE_MOCK = true;  // Toggle mock/live mode
const N8N_WEBHOOK_URL = "YOUR_WEBHOOK_URL";
```

**Function: `analyzeCandidate(jdText, resumeText)`**

**Mock Mode:**
- Returns simulated response after 2s delay
- No backend required

**Live Mode:**
- POSTs to n8n webhook
- Expects JSON response with:
  ```javascript
  {
    score: number,
    summary: string,
    recommendation: "Interview" | "Reject",
    details: Array<{criteria, status, reason}>,
    candidateName: string,
    candidateEmail: string
  }
  ```

**Error Handling:**
- Try-catch wrapper
- Throws error on failure
- App.jsx catches and displays error

---

## 🎨 Styling System

### Tailwind CSS Configuration

**Custom Colors:**
```javascript
primary: {
  50-900: Blue shades
}
surface: {
  50-900: Gray shades
}
```

**Custom Classes (index.css):**
```css
.glass              // Glassmorphism effect
.glass-card         // Glass card with shadow
.shadow-glow        // Glowing shadow effect
```

**Design Tokens:**
- **Font Family**: 
  - Display: 'Outfit' (headings)
  - Body: 'Inter' (text)
- **Border Radius**: Rounded-xl (12px), Rounded-2xl (16px), Rounded-3xl (24px)
- **Shadows**: Layered shadows for depth
- **Transitions**: 300ms ease for all interactions

**Animation Patterns:**
```javascript
// Framer Motion
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

---

## 🔐 Authentication Flow

### Signup Flow

```
1. User fills form (name, email, password)
2. Validate email format
3. Validate password length (min 6)
4. Check if email already exists
5. Create user object
6. Save to localStorage.users
7. Set as current user
8. Redirect to dashboard
```

### Login Flow

```
1. User fills form (email, password)
2. Validate email format
3. Find user in localStorage.users
4. Compare password
5. Set as current user
6. Redirect to dashboard
```

### Google OAuth Flow (Simulated)

```
1. User clicks "Continue with Google"
2. Create demo user object
3. Save to localStorage
4. Set as current user
5. Redirect to dashboard
```

### Session Persistence

```javascript
// On app load
useEffect(() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }
}, []);
```

---

## 📁 File Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           // App shell
│   │   ├── Login.jsx            // Authentication
│   │   ├── Profile.jsx          // User profile modal
│   │   ├── FileUpload.jsx       // Single screening
│   │   ├── BulkUpload.jsx       // Bulk screening
│   │   ├── CandidateCard.jsx    // Results display
│   │   ├── ScreeningHistory.jsx // History view
│   │   └── SettingsPanel.jsx    // Settings
│   ├── services/
│   │   └── api.js               // API integration
│   ├── App.jsx                  // Root component
│   ├── App.css                  // Component styles
│   ├── index.css                // Global styles + Tailwind
│   └── main.jsx                 // Entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🔄 Common Patterns

### 1. Conditional Rendering

```javascript
{activeView === 'dashboard' && (
  <DashboardContent />
)}
```

### 2. State Updates

```javascript
const handleUpdate = (newValue) => {
  setState(prevState => ({
    ...prevState,
    field: newValue
  }));
};
```

### 3. Form Handling

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  // Validation
  // API call
  // State update
};
```

### 4. File Upload

```javascript
const handleDrop = (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  // Process files
};
```

### 5. API Calls

```javascript
const fetchData = async () => {
  setLoading(true);
  try {
    const result = await apiFunction();
    setData(result);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🛠 How to Make Changes

### Adding a New Component

1. Create file in `src/components/ComponentName.jsx`
2. Import React and required dependencies
3. Define component with props
4. Export default
5. Import in parent component
6. Add to component hierarchy

### Adding a New View

1. Create component in `src/components/`
2. Add navigation item in `Layout.jsx`
3. Add conditional rendering in `App.jsx`
4. Update `activeView` state handling

### Modifying API Integration

1. Open `src/services/api.js`
2. Update `N8N_WEBHOOK_URL`
3. Toggle `USE_MOCK` to false
4. Modify request/response format if needed

### Adding New State

1. Add state variable in appropriate component
2. Create handler functions
3. Pass as props to children if needed
4. Update LocalStorage if persistence needed

### Styling Changes

1. Use Tailwind utility classes
2. Add custom classes in `index.css` if needed
3. Use Framer Motion for animations
4. Follow existing color scheme

---

## 🎯 Quick Reference for AI Coding

### When Adding Features:

**"Add a new filter to ScreeningHistory"**
- Location: `src/components/ScreeningHistory.jsx`
- Pattern: Add state variable, create filter function, update UI

**"Add email validation"**
- Location: `src/components/Login.jsx`
- Pattern: Use regex validation, show error message

**"Add new API endpoint"**
- Location: `src/services/api.js`
- Pattern: Create new async function, handle errors

**"Add new navigation item"**
- Location: `src/components/Layout.jsx` and `src/App.jsx`
- Pattern: Add to nav array, add conditional rendering

### Common Tasks:

```javascript
// Add loading state
const [isLoading, setIsLoading] = useState(false);

// Add error handling
try { /* code */ } catch (error) { setError(error.message); }

// Add form validation
if (!validateInput(value)) { setError('Invalid input'); return; }

// Add animation
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

// Add localStorage
localStorage.setItem('key', JSON.stringify(data));
const data = JSON.parse(localStorage.getItem('key'));
```

---

## 📝 Notes for AI Assistants

- **Always maintain existing patterns** - Follow the established code style
- **Use TypeScript-style JSDoc** - Add comments for complex functions
- **Test in mock mode first** - Before connecting to real backend
- **Preserve animations** - Keep Framer Motion animations smooth
- **Follow Tailwind conventions** - Use utility classes, avoid inline styles
- **Update this doc** - When making significant architectural changes

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Maintained by**: Recruit-AI Team
