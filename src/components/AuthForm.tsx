import React, { useState, useEffect } from 'react'
import { Upload, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function AuthForm() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect to files page if user is already signed in
  useEffect(() => {
    if (user) {
      navigate('/files')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Basic validation
    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Password is required')
      setLoading(false)
      return
    }

    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    console.log('Auth attempt:', { isSignUp, email: email.substring(0, 3) + '***' })

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      console.log('Auth result:', { error: error?.message })

      if (error) {
        setError(error.message)
      } else {
        // Successful authentication
        if (isSignUp) {
          setSuccess('Account created successfully! Please check your email for verification.')
        } else {
          setSuccess('Welcome back! Redirecting to dashboard...')
        }
        // Reset form on success
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md space-y-6 sm:space-y-8">
        {/* Back to Home Button */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:border-slate-300/80 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
            Back to Home
          </button>
        </div>

        {/* Main Auth Card */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-2xl shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-slate-50/30"></div>
          
          <div className="relative p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Welcome to ResumeAI
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-medium">
                {isSignUp ? 'Create your account to get started' : 'Sign in to continue your journey'}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Email Field */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 bg-white/80 border border-slate-200/60 hover:border-slate-300/80 focus:border-blue-500/60 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-slate-500 text-slate-900 font-medium"
                      placeholder="Enter your email address"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-4 pr-12 bg-white/80 border border-slate-200/60 hover:border-slate-300/80 focus:border-blue-500/60 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-slate-500 text-slate-900 font-medium"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-2xl p-4 animate-fade-in-scale">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl p-4 animate-fade-in-scale">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-green-700">{success}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    {loading && (
                      <div className="absolute left-6">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                    <span className="text-base font-semibold">
                      {loading ? (
                        isSignUp ? 'Creating Account...' : 'Signing In...'
                      ) : (
                        isSignUp ? 'Create Account' : 'Sign In'
                      )}
                    </span>
                  </div>
                </button>
              </div>

              {/* Toggle Sign Up/Sign In */}
              <div className="text-center pt-4 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError('')
                    setSuccess('')
                  }}
                  className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 bg-slate-50/80 hover:bg-blue-50/80 border border-slate-200/60 hover:border-blue-200/60 rounded-xl px-4 py-2.5 transition-all duration-300"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>

              {/* Debug Section - Development Only */}
              <div className="text-center pt-4 border-t border-slate-200/60 space-y-3">
                <div className="text-xs text-slate-500 font-mono bg-slate-100/80 rounded-xl px-3 py-2">
                  Debug: Email: {email ? '✓' : '✗'} | Password: {password ? '✓' : '✗'} | Loading: {loading ? '✓' : '✗'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('test@example.com')
                    setPassword('password123')
                    setIsSignUp(false)
                  }}
                  className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 hover:border-slate-300/80 rounded-lg px-3 py-2 transition-all duration-300"
                >
                  Fill Test Credentials
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}
