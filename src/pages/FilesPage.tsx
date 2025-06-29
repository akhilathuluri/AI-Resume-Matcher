import React, { useState, useCallback, useEffect } from 'react'
import { Upload, File, Trash2, Eye, Search, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker with reliable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

interface Resume {
  id: string
  filename: string
  file_size: number
  file_type: string
  created_at: string
  file_path: string
}

export function FilesPage() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null)

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const fetchResumes = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResumes(data || [])
    } catch (error) {
      console.error('Error fetching resumes:', error)
      // Clear local state on error to ensure UI reflects actual data
      setResumes([])
    } finally {
      setLoading(false)
    }
  }, [user])

  // Manual refresh function
  const handleRefresh = async () => {
    await cleanupOrphanedRecords()
    await fetchResumes()
    await updateStorageStats()
  }

  // Clean up orphaned database records (files deleted directly from storage)
  const cleanupOrphanedRecords = async () => {
    if (!user) return

    try {
      showNotification('Checking for orphaned records...', 'info')
      
      const { data: resumes, error } = await supabase
        .from('resumes')
        .select('id, file_path, filename')
        .eq('user_id', user.id)

      if (error) throw error

      if (resumes && resumes.length > 0) {
        // Check which files actually exist in storage
        const orphanedIds: string[] = []

        for (const resume of resumes) {
          try {
            const { error: fileError } = await supabase.storage
              .from('resumes')
              .download(resume.file_path)
            
            if (fileError) {
              // File doesn't exist in storage, mark for deletion
              orphanedIds.push(resume.id)
            }
          } catch {
            // File doesn't exist, mark for deletion
            orphanedIds.push(resume.id)
          }
        }

        // Delete orphaned records
        if (orphanedIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('resumes')
            .delete()
            .in('id', orphanedIds)

          if (deleteError) throw deleteError

          showNotification(`Cleaned up ${orphanedIds.length} orphaned records`, 'success')
          
          // Refresh the list and storage stats
          await fetchResumes()
          await updateStorageStats()
        } else {
          showNotification('No orphaned records found', 'info')
        }
      } else {
        showNotification('No records to check', 'info')
      }
    } catch (error) {
      console.error('Error cleaning up orphaned records:', error)
      showNotification('Error during cleanup', 'error')
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      await cleanupOrphanedRecords()
      await fetchResumes()
    }
    initializeData()
  }, [fetchResumes, user])

  // Check for data consistency when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchResumes()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchResumes, user])

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        disableAutoFetch: true
      })
      
      const pdf = await loadingTask.promise
      let fullText = ''

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ')
          fullText += pageText + '\n'
        } catch (pageError) {
          console.warn(`Error extracting text from page ${i}:`, pageError)
          // Continue with other pages even if one fails
        }
      }

      return fullText.trim() || 'No text content could be extracted from this PDF'
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('worker')) {
          throw new Error('PDF processing failed. Please try again or check your internet connection.')
        } else if (error.message.includes('Invalid PDF')) {
          throw new Error('This PDF file appears to be corrupted or invalid.')
        } else if (error.message.includes('password')) {
          throw new Error('This PDF is password protected and cannot be processed.')
        }
      }
      
      throw new Error('Failed to extract text from PDF. The file may be corrupted or contain only images.')
    }
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(file)
    } else if (file.type === 'text/plain') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const text = event.target?.result as string
          resolve(text)
        }
        reader.onerror = reject
        reader.readAsText(file)
      })
    } else {
      throw new Error('Unsupported file type')
    }
  }

  const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
      const response = await fetch('https://models.inference.ai.azure.com/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate embedding')
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      return []
    }
  }

  const uploadFile = async (file: File) => {
    if (!user) return

    setUploading(true)
    try {
      // Extract text content
      const content = await extractTextFromFile(file)
      
      // Generate embedding
      const embedding = await generateEmbedding(content)

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save to database
      const { error: dbError } = await supabase
        .from('resumes')
        .insert([
          {
            user_id: user.id,
            filename: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            content,
            embedding,
          },
        ])

      if (dbError) throw dbError

      // Update storage stats
      await updateStorageStats()
      
      // Refresh the list
      fetchResumes()
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const updateStorageStats = async () => {
    if (!user) return

    try {
      const { data: resumes } = await supabase
        .from('resumes')
        .select('file_size')
        .eq('user_id', user.id)

      const totalSize = resumes?.reduce((sum, resume) => sum + resume.file_size, 0) || 0
      const totalFiles = resumes?.length || 0

      const { error } = await supabase
        .from('user_storage')
        .upsert(
          {
            user_id: user.id,
            total_storage_used: totalSize,
            total_files: totalFiles,
          },
          {
            onConflict: 'user_id'
          }
        )

      if (error) {
        console.error('Error updating storage stats:', error)
      }
    } catch (error) {
      console.error('Error updating storage stats:', error)
    }
  }

  const deleteResume = async (id: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      // Delete from storage
      await supabase.storage.from('resumes').remove([filePath])

      // Delete from database
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update storage stats
      await updateStorageStats()
      
      // Refresh the list
      fetchResumes()
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Error deleting resume. Please try again.')
    }
  }

  const viewResume = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 3600)

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error viewing resume:', error)
      alert('Error viewing resume. Please try again.')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        if (file.size <= 500 * 1024 * 1024) { // 500MB limit
          uploadFile(file)
        } else {
          alert('File size exceeds 500MB limit')
        }
      } else {
        alert('Only PDF and TXT files are allowed')
      }
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        if (file.size <= 500 * 1024 * 1024) { // 500MB limit
          uploadFile(file)
        } else {
          alert('File size exceeds 500MB limit')
        }
      } else {
        alert('Only PDF and TXT files are allowed')
      }
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredResumes = resumes.filter(resume =>
    resume.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Resume Files</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload and manage your resume files. Supports PDF and TXT formats up to 500MB.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={cleanupOrphanedRecords}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clean up database records for files that no longer exist"
            >
              🧹 Cleanup
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mt-8">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Drop files here or click to upload
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept=".pdf,.txt"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                PDF, TXT up to 500MB each
              </p>
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <div className="text-sm text-gray-600">Uploading...</div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search resumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Resume List */}
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">Loading resumes...</div>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-12">
            <File className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first resume.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="h-8 w-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {resume.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(resume.file_size)} • {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewResume(resume.file_path)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id, resume.file_path)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}