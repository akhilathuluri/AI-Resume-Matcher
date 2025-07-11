import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Brain, 
  FileText, 
  Users, 
  Mail, 
  MessageSquare, 
  Download, 
  Search, 
  Zap, 
  Shield, 
  Cloud,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Upload
} from 'lucide-react'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (user) {
      navigate('/files')
    } else {
      // This will be handled by the AuthForm component in App.tsx
      navigate('/auth')
    }
  }

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Resume Analysis",
      description: "Advanced AI technology extracts and analyzes resume content with intelligent text processing and semantic search capabilities."
    },
    {
      icon: <Upload className="h-8 w-8 text-green-600" />,
      title: "Multi-Format Support",
      description: "Upload PDF, DOCX, and TXT files up to 100MB. Automatic text extraction with smart content parsing."
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Bulk Operations",
      description: "Select multiple candidates and perform bulk actions like mass export, communication tracking, and candidate management."
    },
    {
      icon: <Mail className="h-8 w-8 text-red-600" />,
      title: "Email Integration",
      description: "Send real emails to candidates with EmailJS integration. Automatic email extraction from resume content."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-indigo-600" />,
      title: "Communication History",
      description: "Track all touchpoints with candidates. Complete audit trail of communications with delivery status."
    },
    {
      icon: <Download className="h-8 w-8 text-orange-600" />,
      title: "Smart Export",
      description: "Export actual PDF files, not just metadata. Convert text-only resumes to professional printable formats."
    }
  ]

  const stats = [
    { label: "File Formats Supported", value: "3+", icon: <FileText className="h-6 w-6" /> },
    { label: "Max File Size", value: "100MB", icon: <Cloud className="h-6 w-6" /> },
    { label: "Storage Limit", value: "500MB", icon: <Shield className="h-6 w-6" /> },
    { label: "AI Processing", value: "Real-time", icon: <Zap className="h-6 w-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="flex justify-center items-center mb-8">
              <div className="relative animate-float">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-xl hover-glow">
                  <Brain className="h-12 w-12 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ResumeAI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              The Ultimate AI-Powered Resume Management Platform
            </p>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Upload, analyze, and manage resumes with cutting-edge AI technology. 
              Streamline your recruitment process with intelligent automation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 gradient-bg hover-lift"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-gray-300 transform hover:scale-105 transition-all duration-300 hover-lift"
              >
                <Search className="h-5 w-5 mr-2" />
                Explore Features
              </button>
            </div>

            {/* User Status Badge */}
            {user && (
              <div className="mt-8 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Welcome back! Ready to manage your resumes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Recruitment
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline your resume management workflow with AI-powered automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-gray-200 transform hover:scale-105 transition-all duration-300 hover-lift hover-glow"
              >
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes with our intuitive workflow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Resumes",
                description: "Drag and drop PDF, DOCX, or TXT files. Our AI instantly extracts and processes the content.",
                icon: <Upload className="h-8 w-8 text-blue-600" />,
                color: "blue"
              },
              {
                step: "2", 
                title: "AI Analysis",
                description: "Advanced AI generates embeddings and enables semantic search across all resume content.",
                icon: <Brain className="h-8 w-8 text-purple-600" />,
                color: "purple"
              },
              {
                step: "3",
                title: "Manage & Export",
                description: "Bulk operations, email integration, and smart export features streamline your workflow.",
                icon: <Zap className="h-8 w-8 text-green-600" />,
                color: "green"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 ${
                    step.color === 'blue' ? 'bg-blue-100' :
                    step.color === 'purple' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {step.icon}
                  </div>
                  <div className={`inline-flex items-center justify-center w-8 h-8 text-white text-sm font-bold rounded-full absolute -top-3 -right-3 ${
                    step.color === 'blue' ? 'bg-blue-600' :
                    step.color === 'purple' ? 'bg-purple-600' : 'bg-green-600'
                  }`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
                
                {/* Connector Arrow */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Resume Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of recruiters who have streamlined their workflow with AI-powered resume management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Star className="h-5 w-5 mr-2" />
              {user ? 'Go to Dashboard' : 'Start Free Today'}
            </button>
            
            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Sign In
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <Brain className="h-8 w-8 text-blue-400 mr-3" />
              <span className="text-2xl font-bold">ResumeAI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              AI-powered resume management platform designed for modern recruitment workflows. 
              Secure, intelligent, and efficient.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2025 ResumeAI</span>
              <span>•</span>
              <span>Built with ❤️ and AI</span>
              <span>•</span>
              <span>Powered by Supabase</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
