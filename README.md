# AI Resume Matcher - Resume Management System

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.0-green)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-blue)](https://tailwindcss.com/)

A modern, AI-powered resume management system that helps recruiters and hiring managers efficiently store, analyze, and match resumes to job descriptions using advanced embedding technology and intelligent chatbot assistance.

## 🚀 Features

### 📁 **Resume Management**
- **Upload & Storage**: Support for PDF and TXT resume files
- **Cloud Storage**: Secure file storage with Supabase Storage
- **File Organization**: Automatic file naming and organization
- **Orphaned File Cleanup**: Smart detection and removal of orphaned database records

### 🤖 **AI-Powered Matching**
- **Semantic Search**: Advanced embedding-based resume matching
- **Intelligent Analysis**: AI-powered job description analysis
- **Similarity Scoring**: Precise matching percentage calculations
- **Top 10 Results**: Curated list of best-matching candidates

### 💬 **Smart Chatbot Assistant**
- **Interactive Interface**: Natural language job description input
- **Persistent Memory**: Chat history saved across sessions
- **Markdown Formatting**: Beautifully formatted AI responses
- **Real-time Analysis**: Instant resume matching and insights

### 🔐 **Authentication & Security**
- **Supabase Auth**: Secure user authentication
- **Row Level Security**: Protected data access
- **Session Management**: Persistent login sessions
- **User Isolation**: Complete data separation between users

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Professional color scheme
- **Interactive Elements**: Smooth animations and transitions
- **Accessibility**: WCAG compliant interface

## 🛠 Tech Stack

### **Frontend**
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.2** - Lightning-fast build tool
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **React Router DOM 6.22.0** - Client-side routing
- **Lucide React 0.344.0** - Beautiful icon library

### **Backend & Database**
- **Supabase 2.39.0** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level security
- **Real-time subscriptions** - Live data updates

### **AI & Processing**
- **PDF.js 4.0.379** - PDF text extraction
- **OpenAI Embeddings** - Text embedding generation
- **GPT-4o-mini** - AI response generation
- **Cosine Similarity** - Mathematical matching algorithm

### **Markdown & Formatting**
- **React Markdown** - Rich text rendering
- **Remark GFM** - GitHub Flavored Markdown support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd resume-management-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GITHUB_TOKEN=your_github_token_for_ai_models
```

### 4. Database Setup
Run the following SQL migrations in your Supabase SQL editor:

#### Create Tables
```sql
-- Users table (automatically created by Supabase Auth)

-- User storage tracking
CREATE TABLE user_storage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_files INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Resumes table
CREATE TABLE resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    content TEXT,
    embedding JSONB,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    resumes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Enable Row Level Security
```sql
-- Enable RLS
ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own storage" ON user_storage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own storage" ON user_storage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own storage" ON user_storage FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON chat_messages FOR DELETE USING (auth.uid() = user_id);
```

### 5. Storage Setup
Create a storage bucket named `resumes` in your Supabase project:
1. Go to Storage in Supabase Dashboard
2. Create new bucket: `resumes`
3. Set as public bucket
4. Configure RLS policies for the bucket

### 6. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see your application running!

## 📖 Usage Guide

### **Getting Started**
1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Upload Resumes**: Navigate to "Files" and upload PDF/TXT resume files
3. **Start Chatting**: Go to "Chatbot" and describe job positions
4. **Review Matches**: Get AI-powered analysis and top matching candidates

### **File Management**
- **Upload**: Drag & drop or click to upload resume files
- **View**: Click the external link icon to view stored resumes
- **Cleanup**: Use "Cleanup Orphaned Records" to remove broken references
- **Refresh**: Update file list with latest uploads

### **AI Chatbot**
- **Job Descriptions**: Describe the position you're hiring for
- **Get Analysis**: Receive detailed AI analysis of why resumes match
- **View Matches**: See top 10 matching resumes with similarity scores
- **Chat History**: All conversations are saved and persist across sessions
- **Clear History**: Remove all chat history when needed

### **Settings**
- **Profile Management**: Update account information
- **Preferences**: Customize application settings

## 🏗 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AuthForm.tsx     # Authentication form
│   └── Layout.tsx       # Main layout wrapper
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                 # Utility libraries
│   └── supabase.ts      # Supabase client configuration
├── pages/               # Main application pages
│   ├── ChatbotPage.tsx  # AI chatbot interface
│   ├── FilesPage.tsx    # File management
│   └── SettingsPage.tsx # User settings
├── App.tsx              # Root application component
├── main.tsx            # Application entry point
└── index.css           # Global styles

supabase/
└── migrations/         # Database migrations
    ├── 20250626180929_dry_mouse.sql
    ├── 20250626181444_divine_temple.sql
    └── 20250626181515_rough_truth.sql
```

## 🔧 Configuration

### **Vite Configuration** (`vite.config.ts`)
- PDF.js worker configuration
- Build optimizations
- Development server settings

### **Tailwind Configuration** (`tailwind.config.js`)
- Custom color schemes
- Responsive breakpoints
- Component classes

### **TypeScript Configuration** (`tsconfig.json`)
- Strict type checking
- Path aliases
- Build targets

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

### **Deploy to Vercel**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Deploy to Netlify**
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables in Netlify dashboard

## 🧪 Testing

### **Run Linting**
```bash
npm run lint
```

### **Type Checking**
```bash
npx tsc --noEmit
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Add comments for complex logic
- Test thoroughly before submitting

## 🐛 Troubleshooting

### **Common Issues**

#### **PDF.js Worker Error**
```
Error: Setting up fake worker failed
```
**Solution**: The app uses CDN-hosted PDF.js worker. Ensure internet connectivity.

#### **Supabase Connection Issues**
```
Error: Invalid API key
```
**Solution**: Check your `.env.local` file and ensure correct Supabase credentials.

#### **File Upload Failures**
```
Error: Storage bucket not found
```
**Solution**: Create `resumes` bucket in Supabase Storage with proper RLS policies.

#### **AI Model Rate Limits**
```
Error: Rate limit exceeded
```
**Solution**: Check your GitHub token limits or implement request throttling.

## 📄 License

This project is licensed under the MIT License - see the for details.

## 🙏 Acknowledgments

- **Supabase Team** - For the amazing BaaS platform
- **OpenAI** - For powerful AI models and embeddings
- **Vercel** - For the excellent React and Vite tooling
- **Tailwind Labs** - For the beautiful CSS framework


---

**Made with ❤️ by Athuluri Akhil**

*AI Resume Matcher - Revolutionizing recruitment with artificial intelligence*
