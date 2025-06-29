import React, { useState, useEffect } from 'react'
import { User, Store as Storage, FileText, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface StorageStats {
  total_storage_used: number
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
    const maxStorage = 10 * 1024 * 1024 * 1024 // 10GB in bytes
    return Math.min((storageStats.total_storage_used / maxStorage) * 100, 100)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your account settings and view storage information.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {/* Account Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-400" />
              Account Information
            </h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Storage Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Storage className="h-5 w-5 mr-2 text-gray-400" />
              Storage Usage
            </h3>
          </div>
          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Loading storage information...</div>
              </div>
            ) : storageStats ? (
              <div className="space-y-6">
                {/* Storage Usage Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Storage Used</span>
                    <span>{formatFileSize(storageStats.total_storage_used)} / 10 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getStoragePercentage()}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {getStoragePercentage().toFixed(1)}% of storage used
                  </div>
                </div>

                {/* Storage Stats */}
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <FileText className="h-4 w-4 mr-2" />
                      Total Files
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {storageStats.total_files}
                    </dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <Storage className="h-4 w-4 mr-2" />
                      Total Size
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {formatFileSize(storageStats.total_storage_used)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Last Updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(storageStats.updated_at)}
                    </dd>
                  </div>
                </dl>

                {/* Storage Warning */}
                {getStoragePercentage() > 80 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Storage Warning
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>You're using {getStoragePercentage().toFixed(1)}% of your storage. Consider removing unused files to free up space.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">No storage information available</div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Usage Guidelines</h3>
          </div>
          <div className="px-6 py-4">
            <div className="prose prose-sm text-gray-600">
              <ul className="space-y-2">
                <li>Maximum file size: 500 MB per file</li>
                <li>Supported formats: PDF and TXT files only</li>
                <li>Total storage limit: 10 GB per account</li>
                <li>Files are processed for AI matching capabilities</li>
                <li>All data is securely stored and encrypted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}