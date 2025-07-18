import { useState, useEffect } from 'react'
import { User, Store as Storage, FileText, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface StorageStats {
  total_storage_used?: number
  total_size?: number // Alternative field name
  total_files: number
  updated_at: string
}

export function SettingsPage() {
  const { user } = useAuth()
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStorageStats()
  }, [])

  const fetchStorageStats = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get storage stats
      const { data: stats, error: statsError } = await supabase
        .from('user_storage')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError
      }

      if (stats) {
        setStorageStats(stats)
      } else {
        // Calculate stats if not exists
        const { data: resumes, error: resumesError } = await supabase
          .from('resumes')
          .select('file_size')
          .eq('user_id', user.id)

        if (resumesError) throw resumesError

        const totalSize = resumes?.reduce((sum, resume) => sum + resume.file_size, 0) || 0
        const totalFiles = resumes?.length || 0

        const newStats = {
          total_storage_used: totalSize,
          total_files: totalFiles,
          updated_at: new Date().toISOString(),
        }

        // Insert new stats
        const { error: insertError } = await supabase
          .from('user_storage')
          .insert([
            {
              user_id: user.id,
              ...newStats,
            },
          ])

        if (insertError) throw insertError
        setStorageStats(newStats)
      }
    } catch (error) {
      console.error('Error fetching storage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStoragePercentage = () => {
    if (!storageStats) return 0
    const maxStorage = 500 * 1024 * 1024 // 500MB in bytes
    const usedStorage = storageStats.total_storage_used || storageStats.total_size || 0
    const percentage = Math.min((usedStorage / maxStorage) * 100, 100)
    
    // Debug logging
    console.log('Storage Debug:', {
      total_storage_used: storageStats.total_storage_used,
      total_size: storageStats.total_size,
      usedStorage,
      maxStorage,
      percentage,
      formatted_used: formatFileSize(usedStorage)
    })
    
    return percentage
  }

  const getVisualPercentage = () => {
    const actualPercentage = getStoragePercentage()
    // Set minimum visual width of 1% if there's any storage used, so the bar is always visible
    if (actualPercentage > 0 && actualPercentage < 1) {
      return 1
    }
    return actualPercentage
  }

  const getFormattedPercentage = () => {
    const percentage = getStoragePercentage()
    if (percentage === 0) return '0%'
    if (percentage < 0.01) return '<0.01%'
    if (percentage < 1) return percentage.toFixed(3) + '%'
    return percentage.toFixed(1) + '%'
  }

  const getUsedStorage = () => {
    if (!storageStats) return 0
    return storageStats.total_storage_used || storageStats.total_size || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Account Settings
                </h1>
                <p className="text-slate-600 text-sm leading-relaxed mt-1">
                  Manage your profile, monitor usage, and control your account preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Storage Overview Card */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Storage className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Storage Analytics</h2>
                  <p className="text-sm text-slate-600 hidden sm:block">Monitor your data usage and limits</p>
                </div>
              </div>
              {loading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Analyzing...</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Loading Skeletons */}
                <div className="space-y-3">
                  <div className="h-3 sm:h-4 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="h-6 sm:h-8 bg-slate-200 rounded-2xl animate-pulse"></div>
                  <div className="h-2 sm:h-3 bg-slate-200 rounded-full w-1/3 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 sm:h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : storageStats ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Storage Progress */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <span className="text-sm font-medium text-slate-700">Storage Usage</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatFileSize(getUsedStorage())}
                      </span>
                      <span className="text-sm text-slate-500">/ 500 MB</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full h-2 sm:h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${getVisualPercentage()}%` }}
                      ></div>
                    </div>
                    <div className="absolute -top-0.5 sm:-top-1 left-0 w-full h-3 sm:h-5 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-600/20 blur-sm opacity-50 animate-pulse"></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">
                      {getFormattedPercentage()} used
                    </span>
                    <span className="text-slate-500">
                      {formatFileSize(500 * 1024 * 1024 - getUsedStorage())} remaining
                    </span>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200/60 hover:border-blue-300/80 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold text-blue-900">{storageStats.total_files}</div>
                        <div className="text-xs text-blue-600 font-medium">Total Files</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-700 opacity-75">Documents uploaded</div>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-indigo-200/60 hover:border-indigo-300/80 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Storage className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg sm:text-2xl font-bold text-indigo-900">{formatFileSize(getUsedStorage())}</div>
                        <div className="text-xs text-indigo-600 font-medium">Data Size</div>
                      </div>
                    </div>
                    <div className="text-xs text-indigo-700 opacity-75">Storage consumed</div>
                  </div>

                  <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200/60 hover:border-purple-300/80 transition-all duration-300 hover:shadow-lg sm:col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-purple-900 leading-tight">
                          {formatDate(storageStats.updated_at).split(',')[0]}
                        </div>
                        <div className="text-xs text-purple-600 font-medium">Last Updated</div>
                      </div>
                    </div>
                    <div className="text-xs text-purple-700 opacity-75">
                      {formatDate(storageStats.updated_at).split(',')[1]?.trim()}
                    </div>
                  </div>
                </div>

                {/* Storage Warning */}
                {getStoragePercentage() > 80 && (
                  <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-2">Storage Alert</h3>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          You're using {getFormattedPercentage()} of your storage quota. Consider removing unused files to optimize space.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Storage className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No storage data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Information Card */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Profile Information</h2>
                <p className="text-sm text-slate-600 hidden sm:block">Your account details and authentication data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="group hover:bg-slate-50/50 rounded-xl p-3 sm:p-4 transition-colors duration-200">
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</dt>
                  <dd className="text-slate-900 font-medium text-base sm:text-lg break-all">{user?.email}</dd>
                </div>
                
                <div className="group hover:bg-slate-50/50 rounded-xl p-3 sm:p-4 transition-colors duration-200">
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Account Created</dt>
                  <dd className="text-slate-900 font-medium text-sm sm:text-base">
                    {user?.created_at ? formatDate(user.created_at) : 'Not available'}
                  </dd>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="group hover:bg-slate-50/50 rounded-xl p-3 sm:p-4 transition-colors duration-200">
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">User ID</dt>
                  <dd className="text-slate-900 font-mono text-xs sm:text-sm bg-slate-100 rounded-lg px-3 py-2 break-all">
                    {user?.id}
                  </dd>
                </div>
                
                <div className="group hover:bg-slate-50/50 rounded-xl p-3 sm:p-4 transition-colors duration-200">
                  <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Last Sign In</dt>
                  <dd className="text-slate-900 font-medium text-sm sm:text-base">
                    {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Not available'}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines Card */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Platform Guidelines</h2>
                <p className="text-sm text-slate-600 hidden sm:block">Important limits and supported file formats</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">File Specifications</h3>
                <div className="space-y-3">
                  {[
                    { label: "Maximum file size", value: "100 MB per file" },
                    { label: "Supported formats", value: "PDF, TXT, and DOCX files" },
                    { label: "Total storage limit", value: "500 MB per account" },
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-100/60 space-y-1 sm:space-y-0">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Security & Processing</h3>
                <div className="space-y-3">
                  {[
                    { label: "AI processing", value: "Automatic analysis" },
                    { label: "Data encryption", value: "Industry standard" },
                    { label: "DOCX handling", value: "Text-only if binary restricted" },
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-100/60 space-y-1 sm:space-y-0">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
