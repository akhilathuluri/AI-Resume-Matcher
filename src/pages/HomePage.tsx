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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/6 to-pink-400/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Glass Morphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-blue-50/20 to-indigo-50/30 backdrop-blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-24 sm:pb-32 lg:pb-40">
          <div className="text-center">
            {/* Enhanced Logo/Brand */}
            <div className="flex justify-center items-center mb-8 sm:mb-12">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-full p-6 sm:p-8 shadow-2xl shadow-blue-500/20 border border-white/60 hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-500 group-hover:scale-110">
                  <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text" style={{ WebkitBackgroundClip: 'text' }} />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Main Headline */}
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x bg-300% font-extrabold">
                  ResumeAI
                </span>
              </h1>
              
              <div className="relative">
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-slate-700 font-semibold max-w-4xl mx-auto leading-relaxed">
                  The Ultimate AI-Powered Resume Management Platform
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60"></div>
              </div>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Upload, analyze, and manage resumes with cutting-edge AI technology. 
                Streamline your recruitment process with intelligent automation.
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12">
              <button
                onClick={handleGetStarted}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold text-base sm:text-lg rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>
                <Sparkles className="relative h-5 w-5 sm:h-6 sm:w-6 mr-3 group-hover:animate-spin transition-transform duration-500" />
                <span className="relative font-bold tracking-wide">
                  {user ? 'Go to Dashboard' : 'Get Started Free'}
                </span>
                <ArrowRight className="relative h-5 w-5 sm:h-6 sm:w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-white/80 backdrop-blur-md text-slate-700 font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 border border-white/60 hover:border-white/80 transform hover:scale-105 transition-all duration-500 hover:bg-white/90"
              >
                <Search className="h-5 w-5 sm:h-6 sm:w-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold tracking-wide">Explore Features</span>
              </button>
            </div>

            {/* Enhanced User Status Badge */}
            {user && (
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 text-green-700 rounded-2xl text-sm sm:text-base font-semibold shadow-lg shadow-green-500/10 backdrop-blur-md">
                <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
                <span className="font-bold">Welcome back! Ready to manage your resumes.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="relative -mt-16 sm:-mt-20 lg:-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-blue-500/20 hover:shadow-3xl hover:shadow-blue-500/25 transition-all duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-slate-50/30"></div>
          
          <div className="relative p-6 sm:p-8 lg:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-4">
                    <div className="relative p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg shadow-blue-500/10 group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-500 group-hover:scale-110">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      <div className="relative text-blue-600 group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6">
              <span className="px-6 py-2 bg-white rounded-xl text-sm sm:text-base font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text shadow-sm">
                Powerful Features
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
              Modern Recruitment
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Everything you need to streamline your resume management workflow with AI-powered automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden p-6 sm:p-8 lg:p-10 bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-[1.02] transition-all duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-slate-50/30 group-hover:from-blue-50/30 group-hover:to-indigo-50/20 transition-all duration-500"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-700"></div>
                
                <div className="relative">
                  <div className="mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500">
                    <div className="relative inline-flex p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg shadow-blue-500/10 group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      <div className="relative group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-base sm:text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/20"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl mb-6">
              <span className="px-6 py-2 bg-white rounded-xl text-sm sm:text-base font-bold text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text shadow-sm">
                Simple Process
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
              Get Started in
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Three Easy Steps
              </span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform your recruitment process with our intuitive AI-powered platform
            </p>
          </div>

          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              {[
                {
                  number: "1",
                  title: "Upload Resumes",
                  description: "Drag and drop PDF, DOCX, or TXT files. Our AI instantly extracts and processes the content with advanced parsing.",
                  icon: <Upload className="h-8 w-8 sm:h-10 sm:w-10" />,
                },
                {
                  number: "2", 
                  title: "AI Analysis",
                  description: "Advanced AI generates embeddings and enables semantic search across all resume content with precision matching.",
                  icon: <Brain className="h-8 w-8 sm:h-10 sm:w-10" />,
                },
                {
                  number: "3",
                  title: "Manage & Export",
                  description: "Bulk operations, email integration, and smart export features streamline your entire recruitment workflow.",
                  icon: <Zap className="h-8 w-8 sm:h-10 sm:w-10" />,
                }
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="relative group text-center"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Step Number */}
                  <div className="relative mx-auto mb-6 sm:mb-8 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110"></div>
                    <div className="absolute inset-2 bg-white/90 backdrop-blur-md rounded-full border border-white/60 shadow-xl shadow-blue-500/20 group-hover:shadow-2xl group-hover:shadow-blue-500/30 transition-all duration-500">
                      <div className="flex items-center justify-center w-full h-full">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {step.number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step Icon */}
                  <div className="mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500">
                    <div className="inline-flex p-4 sm:p-5 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg shadow-slate-200/50 group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-500">
                      <div className="text-blue-600 group-hover:text-indigo-600 transition-colors duration-300">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="relative p-6 sm:p-8 bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl shadow-lg shadow-slate-200/50 group-hover:shadow-xl group-hover:shadow-blue-500/20 transform group-hover:scale-[1.02] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-slate-50/30 group-hover:from-blue-50/30 group-hover:to-indigo-50/20 rounded-3xl transition-all duration-500"></div>
                    
                    <div className="relative">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-medium text-base sm:text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Connector (Hidden on mobile) */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-1/2 -right-8 xl:-right-10 transform -translate-y-1/2 text-blue-300 group-hover:text-blue-500 transition-colors duration-300">
                      <ArrowRight className="w-6 h-6 xl:w-8 xl:h-8" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/3 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center p-2 bg-white/10 backdrop-blur-md rounded-2xl mb-6 sm:mb-8">
            <span className="px-6 py-2 bg-white/90 backdrop-blur-md rounded-xl text-sm sm:text-base font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text shadow-sm">
              Get Started Today
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              Resume Management?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Join thousands of recruiters who have streamlined their workflow with our AI-powered platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center px-8 sm:px-10 py-4 sm:py-5 bg-white/95 backdrop-blur-md text-blue-600 font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-500 border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <Star className="relative h-5 w-5 sm:h-6 sm:w-6 mr-3 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300" />
              <span className="relative text-lg sm:text-xl">
                {user ? 'Go to Dashboard' : 'Start Free Today'}
              </span>
            </button>
            
            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="group inline-flex items-center px-8 sm:px-10 py-4 sm:py-5 bg-transparent text-white font-bold rounded-2xl border-2 border-white/30 backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all duration-500 transform hover:scale-105"
              >
                <span className="text-lg sm:text-xl">Sign In</span>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}
          </div>
          
          <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-blue-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm sm:text-base font-medium">AI-Powered Processing</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="text-sm sm:text-base font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span className="text-sm sm:text-base font-medium">No Setup Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative bg-slate-900 text-white py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl mb-6 sm:mb-8">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400 mr-3" />
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ResumeAI
              </span>
            </div>
            
            <p className="text-slate-400 mb-6 sm:mb-8 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed font-medium">
              AI-powered resume management platform designed for modern recruitment workflows. 
              Secure, intelligent, and efficient recruitment solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base text-slate-500 font-medium">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                © 2025 ResumeAI
              </span>
              <span className="hidden sm:block text-slate-600">•</span>
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                Built with ❤️ and AI
              </span>
              <span className="hidden sm:block text-slate-600">•</span>
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                Powered by Supabase
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
