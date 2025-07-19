import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, FileText, ExternalLink, Trash2, Mail } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { sendBulkEmail, extractEmailFromContent, validateEmail, type EmailResult } from '../lib/emailServiceBrowser'

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
    return <p className="text-sm text-white leading-relaxed font-medium">{content}</p>
  }

  return (
    <div className="text-sm prose prose-sm max-w-none prose-slate">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for different markdown elements with improved contrast
          p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-800 leading-relaxed font-medium">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-slate-700 leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-3 mt-2 text-slate-900 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 text-slate-900 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-2 text-slate-900 first:mt-0">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 pl-4 italic text-slate-700 my-3 bg-blue-50/80 py-3 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-slate-200/80 text-slate-800 px-2 py-1 rounded-md text-xs font-mono font-semibold">
                  {children}
                </code>
              )
            }
            return (
              <pre className="bg-slate-100/80 border border-slate-200/60 p-4 rounded-xl overflow-x-auto my-4">
                <code className="text-xs font-mono text-slate-800">{children}</code>
              </pre>
            )
          },
          hr: () => <hr className="border-slate-300 my-4" />,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline font-semibold transition-colors duration-200"
            >
              {children}
            </a>
          ),
          // Handle tables with improved styling
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-slate-200/60">
              <table className="min-w-full text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100/80">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white/80">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-slate-200/60 hover:bg-slate-50/50 transition-colors duration-200">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-slate-900 border-r border-slate-200/60 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-slate-800 border-r border-slate-200/60 last:border-r-0">
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
  
  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedResume, setSelectedResume] = useState<{
    id: string
    filename: string
    content?: string
    file_path: string
  } | null>(null)
  const [emailTitle, setEmailTitle] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendRealEmails, setSendRealEmails] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle single resume email
  const handleSingleEmail = async () => {
    if (!user || !selectedResume || !emailTitle.trim() || !emailMessage.trim()) {
      alert('Please fill in title and message')
      return
    }

    setEmailSending(true)
    try {
      let emailResults: EmailResult[] = []
      let successful_deliveries = 0
      let failed_deliveries = 0

      if (sendRealEmails) {
        // Extract email from resume content
        const email = selectedResume.content ? extractEmailFromContent(selectedResume.content) : null
        
        if (!email || !validateEmail(email)) {
          alert('No valid email address found in this resume')
          setEmailSending(false)
          return
        }

        // Send email
        emailResults = await sendBulkEmail({
          to: [email],
          subject: emailTitle.trim(),
          message: emailMessage.trim(),
          senderName: 'ResumeAI Team',
        })

        successful_deliveries = emailResults.filter(r => r.success).length
        failed_deliveries = emailResults.filter(r => !r.success).length

        if (successful_deliveries === 0) {
          alert('Failed to send email. Please check your email configuration.')
          setEmailSending(false)
          return
        }
      } else {
        // Mock successful delivery for tracking only
        successful_deliveries = 1
        failed_deliveries = 0
      }

      // Create communication record
      const { data: communication, error: commError } = await supabase
        .from('communications')
        .insert([{
          user_id: user.id,
          title: emailTitle.trim(),
          message: emailMessage.trim(),
          communication_type: sendRealEmails ? 'email' : 'bulk_update',
          status: failed_deliveries === 0 ? 'sent' : (successful_deliveries > 0 ? 'sent' : 'failed'),
          total_recipients: 1,
          successful_deliveries,
          failed_deliveries
        }])
        .select()
        .single()

      if (commError) throw commError

      // Create recipient record
      const { error: recipientError } = await supabase
        .from('communication_recipients')
        .insert([{
          communication_id: communication.id,
          resume_id: selectedResume.id,
          user_id: user.id,
          delivery_status: sendRealEmails 
            ? (emailResults[0]?.success ? 'delivered' : 'failed') 
            : 'delivered',
          delivered_at: sendRealEmails && emailResults[0]?.success 
            ? new Date().toISOString() 
            : (sendRealEmails ? null : new Date().toISOString()),
          error_message: sendRealEmails && !emailResults[0]?.success 
            ? emailResults[0]?.error 
            : null
        }])

      if (recipientError) throw recipientError

      // Show success message
      if (sendRealEmails) {
        if (failed_deliveries === 0) {
          alert('Email sent successfully!')
        } else {
          alert('Failed to send email')
        }
      } else {
        alert('Communication recorded successfully')
      }

      // Reset modal
      setEmailTitle('')
      setEmailMessage('')
      setShowEmailModal(false)
      setSendRealEmails(false)
      setSelectedResume(null)
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error sending email. Please try again.')
    } finally {
      setEmailSending(false)
    }
  }

  // Open email modal for specific resume
  const openEmailModal = (resume: {
    id: string
    filename: string
    content?: string
    file_path: string
  }) => {
    setSelectedResume(resume)
    setEmailTitle(`Follow-up regarding your application`)
    setEmailMessage(`Dear Candidate,

Thank you for your interest in our position. We have reviewed your resume and would like to discuss next steps.

Best regards,
ResumeAI Team`)
    setShowEmailModal(true)
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
          content: 'Hello! I\'m your AI recruiting assistant. I\'m here to help you with all aspects of hiring and talent management:\n\n• **Resume Analysis**: Upload job descriptions and I\'ll find the best candidates from your talent pool\n• **Hiring Guidance**: Best practices for interviewing, screening, and making job offers\n• **Market Intelligence**: Salary ranges, skill trends, and recruiting strategies\n• **General Questions**: Ask me anything about recruitment, HR processes, or candidate evaluation\n• **Follow-up Discussions**: I remember our conversation and can clarify or expand on previous responses\n\nWhat would you like to discuss today?',
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
        content: 'Hello! I\'m your AI recruiting assistant. I\'m here to help you with all aspects of hiring and talent management:\n\n• **Resume Analysis**: Upload job descriptions and I\'ll find the best candidates from your talent pool\n• **Hiring Guidance**: Best practices for interviewing, screening, and making job offers\n• **Market Intelligence**: Salary ranges, skill trends, and recruiting strategies\n• **General Questions**: Ask me anything about recruitment, HR processes, or candidate evaluation\n• **Follow-up Discussions**: I remember our conversation and can clarify or expand on previous responses\n\nWhat would you like to discuss today?',
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
        content: 'Hello! I\'m your AI recruiting assistant. I\'m here to help you with all aspects of hiring and talent management:\n\n• **Resume Analysis**: Upload job descriptions and I\'ll find the best candidates from your talent pool\n• **Hiring Guidance**: Best practices for interviewing, screening, and making job offers\n• **Market Intelligence**: Salary ranges, skill trends, and recruiting strategies\n• **General Questions**: Ask me anything about recruitment, HR processes, or candidate evaluation\n• **Follow-up Discussions**: I remember our conversation and can clarify or expand on previous responses\n\nWhat would you like to discuss today?',
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
          model: 'text-embedding-3-large', // Changed to match FilesPage
          input: text.substring(0, 7500), // Ensure within limits
          // Using full 3072 dimensions for better accuracy
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

          // Ensure embeddingArray is actually an array and has correct dimensions
          if (!Array.isArray(embeddingArray)) {
            console.error('Parsed embedding is not an array:', embeddingArray)
            return null
          }
          
          // Check dimension compatibility
          if (jobEmbedding.length !== embeddingArray.length) {
            console.warn(`Dimension mismatch: job ${jobEmbedding.length} vs resume ${embeddingArray.length}`)
            return null
          }
          
          // Calculate enhanced cosine similarity (matching FilesPage)
          const dotProduct = jobEmbedding.reduce((sum, a, i) => sum + a * embeddingArray[i], 0)
          const normA = Math.sqrt(jobEmbedding.reduce((sum, a) => sum + a * a, 0))
          const normB = Math.sqrt(embeddingArray.reduce((sum: number, b: number) => sum + b * b, 0))
          
          if (normA === 0 || normB === 0) {
            console.warn('Zero magnitude vector detected')
            return null
          }
          
          const cosineSim = dotProduct / (normA * normB)
          
          // Normalize cosine similarity to [0, 1] range like in FilesPage
          const normalizedSimilarity = Math.max(0, (cosineSim + 1) / 2)
          
          // Add keyword matching for better accuracy
          const jobKeywords = jobDescription.toLowerCase().split(/\s+/).filter((word: string) => word.length > 3)
          const resumeKeywords = (resume.content || '').toLowerCase().split(/\s+/).filter((word: string) => word.length > 3)
          const intersection = jobKeywords.filter(k => resumeKeywords.includes(k))
          const keywordScore = intersection.length / Math.max(jobKeywords.length, resumeKeywords.length, 1)
          
          // Combined score (70% cosine + 30% keyword matching)
          const finalSimilarity = (normalizedSimilarity * 0.7) + (keywordScore * 0.3)
          
          console.log(`Resume: ${resume.filename}`)
          console.log(`- Cosine similarity: ${cosineSim.toFixed(4)} (normalized: ${normalizedSimilarity.toFixed(4)})`)
          console.log(`- Keyword score: ${keywordScore.toFixed(4)}`)
          console.log(`- Final similarity: ${finalSimilarity.toFixed(4)} (${(finalSimilarity * 100).toFixed(1)}%)`)

          return {
            id: resume.id,
            filename: resume.filename,
            similarity: finalSimilarity,
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

  const generateChatResponse = async (jobDescription: string, matchingResumes: any[], conversationHistory: Message[]) => {
    try {
      // Check if this is a greeting or simple question first
      const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|sup|what's up|whats up)$/i.test(jobDescription.trim())
      const isSimpleQuestion = jobDescription.trim().length < 15 && !/\b(job|position|role|hiring|recruit)\b/i.test(jobDescription.toLowerCase())
      
      // Check if this looks like a resume matching request (more strict criteria)
      const hasJobKeywords = /\b(job description|position|role|candidate|hire|hiring|recruit|looking for|seeking|need|require|want)\b/i.test(jobDescription.toLowerCase())
      const hasJobContext = /\b(years of experience|skills|requirements|qualifications|responsibilities|developer|engineer|manager|analyst|designer|consultant|senior|junior)\b/i.test(jobDescription.toLowerCase())
      const isResumeMatchingRequest = !isGreeting && !isSimpleQuestion && 
                                    (hasJobKeywords || (hasJobContext && jobDescription.length > 30))

      // If it's a resume matching request and we have resumes
      if (isResumeMatchingRequest && matchingResumes.length > 0) {
        // Prepare detailed resume information for analysis
        const resumeDetails = matchingResumes.map((resume, index) => {
          const content = resume.content || 'Content not available - this may affect analysis accuracy'
          return `**Resume ${index + 1}: ${resume.filename}** (${Math.round(resume.similarity * 100)}% match)\n` +
            `Content: ${content.substring(0, 1500)}${content.length > 1500 ? '...' : ''}\n\n`
        }).join('')

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
      } 
      // If it's a resume matching request but no resumes found
      else if (isResumeMatchingRequest && matchingResumes.length === 0) {
        return "I couldn't find any resumes in your collection that match this job description. Please make sure you have uploaded some resumes first, or the job requirements might be very specific and don't match your current resume collection."
      }
      // Handle general conversation, questions about previous responses, or non-resume topics
      else {
        console.log('Processing follow-up/general question:', jobDescription)
        console.log('Conversation history length:', conversationHistory.length)
        
        // Prepare conversation history for context, including resume data from previous analyses
        const recentMessages = conversationHistory.slice(-6).map(msg => {
          let content = msg.content
          
          // If this message has resume matches, include them in the context with more detail
          if (msg.resumes && msg.resumes.length > 0) {
            const resumeContext = msg.resumes.map(resume => {
              // Limit content to avoid token limits
              const contentPreview = resume.content ? resume.content.substring(0, 500) + '...' : 'Content not available'
              return `${resume.filename} (${Math.round(resume.similarity * 100)}% match) - Resume content: ${contentPreview}`
            }).join('\n\n')
            
            content += '\n\n[Previous resume analysis context:\n' + resumeContext + ']'
          }
          
          return {
            role: msg.role,
            content: content
          }
        })

        console.log('Recent messages for context:', recentMessages.length)

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
                content: `You are a helpful AI assistant specializing in career guidance, HR, recruitment, and resume analysis. You can:

1. **Answer general questions** about careers, job searching, interviewing, resume writing, workplace advice, etc.
2. **Clarify previous responses** - explain your analysis in more detail, answer follow-up questions about SPECIFIC resumes and analyses you just provided
3. **Provide career guidance** - salary expectations, career paths, skill development, etc.
4. **Help with job descriptions** - explain requirements, suggest improvements, etc.
5. **Resume matching** - when users provide job descriptions, you analyze their uploaded resumes

CRITICAL INSTRUCTIONS FOR FOLLOW-UP QUESTIONS:
- When users ask about "that resume" or "the first resume" or "why did X get Y%", they are referring to resumes from your IMMEDIATELY PREVIOUS analysis
- The conversation history includes [Previous resume analysis context] sections with actual resume content and match percentages
- USE THE ACTUAL RESUME CONTENT PROVIDED in the context to explain your previous analysis
- NEVER create new fake resume analyses - only reference and explain what you actually analyzed before using the provided resume content
- If asked to clarify match percentages, explain based on the SPECIFIC resume content and job requirements from the conversation history
- If you don't have enough context from previous messages, ask the user to clarify which specific analysis they're referring to
- Maintain consistency with your previous analysis - don't contradict yourself

EXAMPLE: If asked "Why did that first resume only get 51%?", look at the conversation history for the resume analysis context, find the specific resume with 51% match, and explain based on that resume's actual content versus the job requirements.

FORMATTING:
- Use markdown formatting for clarity
- Be specific and factual when referencing previous analyses
- Provide actionable advice when possible
- Be encouraging and professional

If the user asks about resume matching specifically, tell them to provide a job description and you'll analyze their uploaded resumes against it.`,
              },
              ...recentMessages,
              {
                role: 'user',
                content: jobDescription
              }
            ],
            max_tokens: 800,
            temperature: 0.5,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error:', response.status, response.statusText, errorText)
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        return data.choices[0]?.message?.content || 'I\'m here to help with your questions!'
      }
    } catch (error) {
      console.error('Error generating chat response:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API request failed')) {
          return 'I\'m having trouble connecting to the AI service. Please check your internet connection and try again.'
        } else if (error.message.includes('token')) {
          return 'Your question was too complex for me to process. Please try asking a simpler or shorter question.'
        }
      }
      
      return 'Sorry, I encountered an error while processing your request. Please try again with a shorter question.'
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
      // Only find similar resumes if it looks like a job description (not for greetings or simple questions)
      const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|sup|what's up|whats up)$/i.test(input.trim())
      const isSimpleQuestion = input.trim().length < 15 && !/\b(job|position|role|hiring|recruit)\b/i.test(input.toLowerCase())
      const shouldSearchResumes = !isGreeting && !isSimpleQuestion
      
      const matchingResumes = shouldSearchResumes ? await findSimilarResumes(input) : []
      
      // Generate AI response with conversation context
      const aiResponse = await generateChatResponse(input, matchingResumes, messages)

      // Only attach resumes if this was actually a resume matching request
      const isGreetingCheck = /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|sup|what's up|whats up)$/i.test(input.trim())
      const isSimpleQuestionCheck = input.trim().length < 15 && !/\b(job|position|role|hiring|recruit)\b/i.test(input.toLowerCase())
      const hasJobKeywordsCheck = /\b(job description|position|role|candidate|hire|hiring|recruit|looking for|seeking|need|require|want)\b/i.test(input.toLowerCase())
      const hasJobContextCheck = /\b(years of experience|skills|requirements|qualifications|responsibilities|developer|engineer|manager|analyst|designer|consultant|senior|junior)\b/i.test(input.toLowerCase())
      const wasResumeMatchingRequest = !isGreetingCheck && !isSimpleQuestionCheck && 
                                     (hasJobKeywordsCheck || (hasJobContextCheck && input.length > 30))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        resumes: wasResumeMatchingRequest && matchingResumes.length > 0 ? matchingResumes : undefined,
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
    <div className="min-h-[calc(100vh-5rem)] flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-slate-200/60 mb-4 sm:mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  AI Recruiting Assistant
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed mt-1 hidden sm:block">
                  Your intelligent recruiting companion for candidate analysis and hiring insights
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={clearChatHistory}
              disabled={loading || loadingHistory}
              className="group inline-flex items-center px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50/80 hover:bg-red-100/80 border border-red-200/60 hover:border-red-300/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear all chat history"
            >
              <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline">Clear History</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-xl shadow-blue-500/5 flex flex-col overflow-hidden">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {loadingHistory ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-slate-600 font-medium">Loading conversation...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex animate-fade-in-scale ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`flex max-w-full sm:max-w-4xl ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 ${
                            message.role === 'user' ? 'ml-3 sm:ml-4' : 'mr-3 sm:mr-4'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                              message.role === 'user'
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'
                            }`}
                          >
                            {message.role === 'user' ? (
                              <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </div>
                        </div>
                        
                        {/* Message Content */}
                        <div
                          className={`group rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                              : 'bg-gradient-to-br from-white to-slate-50/50 text-slate-900 border border-slate-200/60'
                          }`}
                        >
                          <FormattedMessage content={message.content} role={message.role} />
                          
                          {/* Resume Matches */}
                          {message.resumes && message.resumes.length > 0 && (
                            <div className="mt-6 space-y-4">
                              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200/60">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <p className="text-sm font-semibold text-slate-700">
                                  Top {message.resumes.length} Matching Candidates
                                </p>
                              </div>
                              <div className="grid gap-3">
                                {message.resumes.map((resume, index) => (
                                  <div
                                    key={resume.id}
                                    className="group/resume flex items-center justify-between p-3 sm:p-4 bg-white/80 hover:bg-white/90 rounded-xl border border-slate-200/60 hover:border-slate-300/80 shadow-sm hover:shadow-md transition-all duration-300"
                                  >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                          {resume.filename}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                                              style={{ width: `${Math.round(resume.similarity * 100)}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs font-semibold text-slate-600">
                                            {Math.round(resume.similarity * 100)}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => openEmailModal({
                                          id: resume.id,
                                          filename: resume.filename,
                                          content: resume.content,
                                          file_path: resume.file_path
                                        })}
                                        className="flex-shrink-0 p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 group-hover/resume:scale-110"
                                        title="Send email"
                                      >
                                        <Mail className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => viewResume(resume.file_path, resume.content, resume.filename)}
                                        className="flex-shrink-0 p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group-hover/resume:scale-110"
                                        title="View resume"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading Animation */}
                  {loading && (
                    <div className="flex justify-start animate-fade-in-scale">
                      <div className="flex">
                        <div className="mr-3 sm:mr-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center shadow-lg">
                            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-slate-600 font-medium">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="flex space-x-3 sm:space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about careers, or describe a job position for resume matching..."
                    className="w-full bg-white/80 border border-slate-200/60 hover:border-slate-300/80 focus:border-blue-500/60 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-slate-500 shadow-sm hover:shadow-md"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="group flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 disabled:hover:shadow-lg"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedResume && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-8 mx-auto p-5 w-11/12 md:w-3/4 lg:w-1/2 max-w-2xl">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-2xl shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-slate-50/30"></div>
              
              <div className="relative p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Send Email
                      </h3>
                      <p className="text-sm text-slate-600 font-medium">
                        Contact {selectedResume.filename}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="w-10 h-10 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-all duration-200"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={emailTitle}
                      onChange={(e) => setEmailTitle(e.target.value)}
                      placeholder="e.g., Follow-up regarding your application..."
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200/60 hover:border-slate-300/80 focus:border-green-500/60 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 placeholder-slate-500 text-slate-900 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Message Content
                    </label>
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Enter your message for the candidate..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200/60 hover:border-slate-300/80 focus:border-green-500/60 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 placeholder-slate-500 text-slate-900 font-medium resize-none"
                    />
                  </div>

                  {/* Email Configuration */}
                  <div className="relative overflow-hidden bg-slate-50/80 border border-slate-200/60 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="sendRealEmailsSingle"
                        checked={sendRealEmails}
                        onChange={(e) => setSendRealEmails(e.target.checked)}
                        className="rounded border-slate-300 text-green-600 focus:ring-green-500/30"
                      />
                      <label htmlFor="sendRealEmailsSingle" className="text-sm font-semibold text-slate-700">
                        📧 Send real email to candidate
                      </label>
                    </div>
                    
                    {sendRealEmails && (
                      <div className={`p-4 rounded-xl border ${
                        import.meta.env.VITE_EMAILJS_SERVICE_ID 
                          ? 'bg-green-50/80 border-green-200/60' 
                          : 'bg-yellow-50/80 border-yellow-200/60'
                      }`}>
                        <div className="text-sm">
                          {import.meta.env.VITE_EMAILJS_SERVICE_ID ? (
                            <div className="text-green-700">
                              <strong>✅ EmailJS configured</strong> - Ready for professional email sending
                              <br />Email will be sent to extracted candidate address
                            </div>
                          ) : (
                            <div className="text-yellow-700">
                              <strong>⚠️ EmailJS not configured</strong> - Will use email client fallback
                              <br />Set up EmailJS for direct sending
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!sendRealEmails && (
                      <div className="p-4 bg-blue-50/80 border border-blue-200/60 rounded-xl">
                        <p className="text-sm text-blue-700">
                          <strong>📋 Tracking Mode:</strong> Creates communication record for tracking only. No email sent.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-200/60">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-3 bg-white/80 hover:bg-white border border-slate-200/60 hover:border-slate-300/80 text-slate-700 hover:text-slate-900 font-medium rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSingleEmail}
                    disabled={!emailTitle.trim() || !emailMessage.trim() || emailSending}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {emailSending ? 'Sending...' : sendRealEmails ? 'Send Email' : 'Create Record'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
