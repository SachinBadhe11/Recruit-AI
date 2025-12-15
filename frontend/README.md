# Recruit-AI Frontend - README

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Layout.jsx      # Main layout with sidebar navigation
│   ├── FileUpload.jsx  # Single file upload component
│   ├── BulkUpload.jsx  # Bulk resume upload component
│   ├── CandidateCard.jsx    # AI analysis results display
│   └── ScreeningHistory.jsx # Candidate history dashboard
├── services/
│   └── api.js          # API integration (mock & live modes)
├── App.jsx             # Main application component
├── index.css           # Global styles & Tailwind config
└── main.jsx            # Application entry point
```

## 🎨 Features

### Core Functionality
- ✅ Single candidate screening
- ✅ Bulk resume upload (up to 50 resumes)
- ✅ AI-powered candidate analysis
- ✅ Screening history with stats
- ✅ Sidebar navigation
- ✅ Settings page

### UI/UX
- ✅ Premium glassmorphism design
- ✅ Animated gradient background
- ✅ Smooth transitions with Framer Motion
- ✅ Responsive layout
- ✅ Click & drag-drop file upload
- ✅ Interactive hover effects
- ✅ Loading states & animations

## 🔧 Configuration

### Mock Mode (Default)
The app runs in mock mode by default with simulated AI responses.

### Live Mode (n8n Backend)
To connect to the real n8n backend:

1. Open `src/services/api.js`
2. Set `USE_MOCK = false`
3. Update `N8N_WEBHOOK_URL` with your n8n webhook URL
4. Ensure your n8n workflow is active with OpenAI credentials configured

## 🎯 Usage

### Single Screening
1. Click "Single Screening" tab
2. Upload job description (PDF/DOCX)
3. Upload candidate resume (PDF/DOCX)
4. Click "Run AI Analysis"
5. Review results with score and recommendation

### Bulk Upload
1. Click "Bulk Upload" tab
2. Upload one job description
3. Upload multiple resumes (drag & drop or click)
4. Click "Analyze X Candidates"
5. View results for all candidates

### Navigation
- **Dashboard**: Main screening interface
- **Candidates**: View all candidates
- **Settings**: Configure API keys and integrations

## 🛠️ Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool & dev server
- **Tailwind CSS v3**: Utility-first styling
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "framer-motion": "^11.15.0",
  "lucide-react": "^0.468.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Surface**: Gray shades
- **Accents**: Purple, Pink

### Typography
- **Display**: Outfit (Google Fonts)
- **Body**: Inter (Google Fonts)

### Effects
- Glassmorphism with backdrop blur
- Subtle shadows and glows
- Smooth transitions (300ms)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output will be in the `dist/` directory.

### Deploy Options
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Use `gh-pages` package

## 📝 Notes

- File upload is visual only in mock mode
- Real file parsing requires backend integration
- All animations are optimized for performance
- Design is fully responsive (mobile, tablet, desktop)

## 🎓 Capstone Project

This is part of the Masai Capstone Project demonstrating:
- Modern React development
- Premium UI/UX design
- AI integration concepts
- Full-stack thinking

---

**Version**: 1.0.0  
**Last Updated**: November 2025
