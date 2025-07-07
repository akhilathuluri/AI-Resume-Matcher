import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, FileText, ExternalLink, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  resumes?: Array<{
    id: string
    filename: string
    similarity: number
    file_path: string
    content?: string
  }>
}

// Custom markdown component for AI responses
const FormattedMessage: React.FC<{ content: string; role: 'user' | 'assistant' }> = ({ content, role }) => {
  if (role === 'user') {
    return <p className="text-sm text-white leading-relaxed">{content}</p>
  }

  return (
    <div className="text-sm prose prose-sm max-w-none prose-gray">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for different markdown elements
          p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-900 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-gray-900 leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-3 mt-2 text-gray-900 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-3 text-gray-900 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-medium mb-2 mt-2 text-gray-900 first:mt-0">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700 my-3 bg-blue-50 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              )
            }
            return (
              <pre className="bg-gray-200 p-3 rounded-md overflow-x-auto my-3">
                <code className="text-xs font-mono text-gray-800">{children}</code>
              </pre>
            )
          },
          hr: () => <hr className="border-gray-400 my-4" />,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              {children}
            </a>
          ),
          // Handle tables if they appear in responses
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-gray-300 text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-200">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-medium text-gray-900 border-r border-gray-300 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-gray-900 border-r border-gray-300 last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function ChatbotPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load chat history from database
  const loadChatHistory = useCallback(async () => {
    if (!user) return

    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map(msg => ({
          id: msg.message_id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          resumes: msg.resumes || undefined
        }))
        setMessages(loadedMessages)
      } else {
        // If no history, show welcome message
        const welcomeMessage: Message = {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: 'Hello! I\'m your resume matching assistant. Please provide a job description, and I\'ll find the top 10 most relevant resumes from your collection.',
        }
        setMessages([welcomeMessage])
        // Save welcome message to database
        await saveChatMessage(welcomeMessage)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      // Show welcome message on error
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'Hello! I\'m your resume matching assistant. Please provide a job description, and I\'ll find the top 10 most relevant resumes from your collection.',
      }
      setMessages([welcomeMessage])
    } finally {
      setLoadingHistory(false)
    }
  }, [user])

  // Save a single message to database
  const saveChatMessage = async (message: Message) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            user_id: user.id,
            message_id: message.id,
            role: message.role,
            content: message.content,
            resumes: message.resumes || null
          }
        ])

      if (error) throw error
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  // Clear chat history
  const clearChatHistory = async () => {
    if (!user) return
    
    if (!confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      // Reset to welcome message
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'Hello! I\'m your resume matching assistant. Please provide a job description, and I\'ll find the top 10 most relevant resumes from your collection.',
      }
      setMessages([welcomeMessage])
      await saveChatMessage(welcomeMessage)
    } catch (error) {
      console.error('Error clearing chat history:', error)
      alert('Error clearing chat history. Please try again.')
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadChatHistory()
  }, [loadChatHistory])

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

  const findSimilarResumes = async (jobDescription: string) => {
    if (!user) return []

    try {
      // Generate embedding for job description
      const jobEmbedding = await generateEmbedding(jobDescription)
      
      if (jobEmbedding.length === 0) {
        throw new Error('Failed to generate job description embedding')
      }

      // Get all resumes with embeddings
      const { data: resumes, error } = await supabase
        .from('resumes')
        .select('id, filename, content, embedding, file_path')
        .eq('user_id', user.id)
        .not('embedding', 'is', null)

      if (error) throw error

      // Calculate similarity scores
      const resumesWithSimilarity = resumes
        .map(resume => {
          if (!resume.embedding) return null
          
          // Parse embedding if it's a string
          let embeddingArray: number[]
          if (typeof resume.embedding === 'string') {
            try {
              embeddingArray = JSON.parse(resume.embedding)
            } catch (parseError) {
              console.error('Error parsing embedding:', parseError)
              return null
            }
          } else if (Array.isArray(resume.embedding)) {
            embeddingArray = resume.embedding
          } else {
            console.error('Embedding is neither string nor array:', typeof resume.embedding)
            return null
          }

          // Ensure embeddingArray is actually an array
          if (!Array.isArray(embeddingArray)) {
            console.error('Parsed embedding is not an array:', embeddingArray)
            return null
          }
          
          // Calculate cosine similarity
          const dotProduct = jobEmbedding.reduce((sum, a, i) => sum + a * embeddingArray[i], 0)
          const normA = Math.sqrt(jobEmbedding.reduce((sum, a) => sum + a * a, 0))
          const normB = Math.sqrt(embeddingArray.reduce((sum: number, b: number) => sum + b * b, 0))
          const similarity = dotProduct / (normA * normB)

          return {
            id: resume.id,
            filename: resume.filename,
            similarity: similarity,
            file_path: resume.file_path,
            content: resume.content, // Include content for AI analysis
          }
        })
        .filter(Boolean)
        .sort((a, b) => (b?.similarity || 0) - (a?.similarity || 0))
        .slice(0, 10)

      return resumesWithSimilarity as Array<{
        id: string
        filename: string
        similarity: number
        file_path: string
        content: string
      }>
    } catch (error) {
      console.error('Error finding similar resumes:', error)
      return []
    }
  }

  const generateChatResponse = async (jobDescription: string, matchingResumes: any[]) => {
    try {
      // Prepare detailed resume information for analysis
      let resumeDetails = ''
      if (matchingResumes.length > 0) {
        resumeDetails = matchingResumes.map((resume, index) => {
          const content = resume.content || 'Content not available - this may affect analysis accuracy'
          return `**Resume ${index + 1}: ${resume.filename}** (${Math.round(resume.similarity * 100)}% match)\n` +
            `Content: ${content.substring(0, 1500)}${content.length > 1500 ? '...' : ''}\n\n`
        }).join('')
      } else {
        return "I couldn't find any resumes in your collection that match this job description. Please make sure you have uploaded some resumes first."
      }

      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert resume analyzer and career consultant. Your job is to provide detailed, specific analysis of how well resumes match job descriptions.

CRITICAL INSTRUCTIONS:
- Always analyze the ACTUAL content of each resume against the SPECIFIC job requirements
- For each resume, provide concrete examples of what MATCHES and what DOESN'T MATCH
- Quote specific skills, experiences, and keywords from both the job description and resumes
- Explain WHY the similarity percentage is what it is based on the content
- Be specific and factual - avoid generic responses
- Use markdown formatting for clarity
- If match percentages seem low, explain exactly what's missing

FORMAT YOUR RESPONSE LIKE THIS:
## Resume Analysis for Job Position

### Job Requirements Summary:
- [Extract and list key requirements from the job description]

### Detailed Resume Analysis:

#### Resume 1: [filename] - [X]% Match
**What Matches:**
- [Quote specific skills/experience from resume that align with job requirements]
- [Mention specific technologies, years of experience, etc.]

**What Doesn't Match:**
- [List specific missing requirements]
- [Mention gaps in experience or skills]

**Why [X]% Match:**
[Explain the scoring based on how many requirements are met vs missing]

[Repeat for each resume]

### Hiring Recommendations:
[Provide specific recommendations based on the analysis]`,
            },
            {
              role: 'user',
              content: `Please analyze these resumes against this job description and explain the match percentages.

**JOB DESCRIPTION:**
${jobDescription}

**RESUMES TO ANALYZE:**
${resumeDetails}

For each resume, I need you to:
1. Identify specific skills/experience that MATCH the job requirements
2. Identify what's MISSING or doesn't match
3. Explain why the match percentage is what it is
4. Use actual content from the resumes and job description in your analysis`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate chat response')
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || 'I found matching resumes for your job description.'
    } catch (error) {
      console.error('Error generating chat response:', error)
      return 'I found matching resumes for your job description. Please review them below.'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Save user message to database
    await saveChatMessage(userMessage)

    try {
      // Find similar resumes
      const matchingResumes = await findSimilarResumes(input)
      
      // Generate AI response
      const aiResponse = await generateChatResponse(input, matchingResumes)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        resumes: matchingResumes,
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Save assistant message to database
      await saveChatMessage(assistantMessage)
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Save error message to database
      await saveChatMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const viewResume = async (filePath: string, content?: string, filename?: string) => {
    try {
      // If no file path (text-only entry), show content in a new window
      if (!filePath || filePath === '') {
        if (content) {
          const newWindow = window.open('', '_blank')
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>${filename || 'Resume Content'}</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .content { white-space: pre-wrap; background: #f5f5f5; padding: 20px; border-radius: 8px; }
                  </style>
                </head>
                <body>
                  <h1>${filename || 'Resume Content'}</h1>
                  <p><em>Note: This is text-only content. The original file was not stored.</em></p>
                  <div class="content">${content}</div>
                </body>
              </html>
            `)
            newWindow.document.close()
          }
        } else {
          alert('No content available to display')
        }
        return
      }

      // Normal file viewing for stored files
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 h-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">AI Resume Matcher</h1>
          <p className="mt-2 text-sm text-gray-700">
            Describe a job position and I'll find the most relevant resumes from your collection.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={clearChatHistory}
            disabled={loading || loadingHistory}
            className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear all chat history"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border h-[calc(100vh-240px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingHistory ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading chat history...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    message.role === 'user' ? 'ml-3' : 'mr-3'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <FormattedMessage content={message.content} role={message.role} />
                  
                  {/* Resume matches */}
                  {message.resumes && message.resumes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Top {message.resumes.length} Matching Resumes:
                      </p>
                      <div className="space-y-2">
                        {message.resumes.map((resume, index) => (
                          <div
                            key={resume.id}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-gray-500 mr-2">
                                #{index + 1}
                              </span>
                              <FileText className="w-4 h-4 text-blue-500 mr-2" />
                              <span className="text-sm text-gray-900">
                                {resume.filename}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({Math.round(resume.similarity * 100)}% match)
                              </span>
                            </div>
                            <button
                              onClick={() => viewResume(resume.file_path, resume.content, resume.filename)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the job position you're looking to fill..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
