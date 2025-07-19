import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Files, MessageCircle, Settings, LogOut, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (signingOut) return // Prevent multiple clicks
    
    setSigningOut(true)
    try {
      console.log('Layout: Starting sign out...')
      await signOut()
      console.log('Layout: Sign out completed, navigating to home...')
      
      // Navigate to home page and force a full page reload to clear any cached state
      navigate('/')
      
      // Small delay then force reload to ensure all state is cleared
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('Sign out failed:', error)
      // Even if sign out fails, still navigate and reload
      navigate('/')
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } finally {
      setSigningOut(false)
    }
  }

  const navigation = [
    { name: 'Candidates', href: '/files', icon: Files },
    { name: 'AI Recruiter', href: '/chatbot', icon: MessageCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center group">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  ResumeAI
                </span>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                        active
                          ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-2 transition-colors duration-200 ${
                        active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                      }`} />
                      <span className="hidden md:inline">{item.name}</span>
                      <span className="md:hidden">{item.name.split(' ')[0]}</span>
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl"></div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* User Email - Hidden on mobile */}
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700 truncate max-w-40">{user?.email}</span>
                <span className="text-xs text-slate-500">
                  {user ? 'Authenticated' : 'Not signed in'}
                </span>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="group relative inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/80 border border-slate-200/60 hover:border-slate-300/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="hidden sm:inline">Signing out...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="hidden sm:inline">Sign out</span>
                    <span className="sm:hidden">Exit</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="sm:hidden border-t border-slate-200/60 py-2">
            <div className="flex justify-around items-center">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative group flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 min-w-0 flex-1 mx-1 ${
                      active
                        ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/80 active:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-1 transition-all duration-200 ${
                      active ? 'text-blue-600 scale-110' : 'text-slate-500 group-hover:text-slate-700 group-active:scale-95'
                    }`} />
                    <span className={`text-xs font-medium truncate ${
                      active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                    }`}>
                      {item.name.split(' ')[0]}
                    </span>
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
