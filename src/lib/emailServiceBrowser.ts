import emailjs from '@emailjs/browser'

export interface EmailData {
  to: string[]
  subject: string
  message: string
  senderName?: string
  senderEmail?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  recipient?: string
}

/**
 * Send emails using EmailJS (browser-compatible)
 * EmailJS Setup required:
 * 1. Create account at https://emailjs.com
 * 2. Set up email service (Gmail, Outlook, etc.)
 * 3. Create email template
 * 4. Get Service ID, Template ID, and Public Key
 */
export async function sendBulkEmailJS(emailData: EmailData): Promise<EmailResult[]> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  console.log('EmailJS Configuration Check:', {
    serviceId: serviceId ? `${serviceId.substring(0, 8)}...` : 'NOT SET',
    templateId: templateId ? `${templateId.substring(0, 8)}...` : 'NOT SET',
    publicKey: publicKey ? `${publicKey.substring(0, 8)}...` : 'NOT SET'
  })

  if (!serviceId || !templateId || !publicKey) {
    console.error('EmailJS not configured. Missing environment variables.')
    return emailData.to.map(recipient => ({
      success: false,
      error: 'EmailJS not configured. Please add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY to your environment variables.',
      recipient
    }))
  }

  const results: EmailResult[] = []

  // Initialize EmailJS
  emailjs.init(publicKey)

  // Send emails individually
  for (const recipient of emailData.to) {
    try {
      // Template parameters that match EmailJS template variables
      const templateParams = {
        to_email: recipient,
        to_name: 'Candidate', // You might extract this from resume content
        subject: emailData.subject,
        message: emailData.message,
        from_name: emailData.senderName || 'ResumeAI Team',
        reply_to: emailData.senderEmail || 'noreply@yourdomain.com',
        // Additional common template variables
        user_name: 'Candidate',
        user_email: recipient
      }

      console.log('Sending email via EmailJS:', {
        recipient,
        serviceId,
        templateId,
        templateParams: { ...templateParams, message: templateParams.message.substring(0, 50) + '...' }
      })

      const response = await emailjs.send(serviceId, templateId, templateParams)
      
      console.log('EmailJS Response:', response)
      
      if (response.status === 200) {
        results.push({
          success: true,
          messageId: response.text,
          recipient
        })
        console.log(`✅ Email sent successfully to ${recipient}`)
      } else {
        results.push({
          success: false,
          error: `Email service returned status: ${response.status} - ${response.text}`,
          recipient
        })
        console.error(`❌ Email failed for ${recipient}:`, response)
      }
    } catch (error) {
      console.error(`❌ Error sending email to ${recipient}:`, error)
      
      // More detailed error handling
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Specific EmailJS error messages
        if (error.message.includes('Invalid')) {
          errorMessage = 'Invalid EmailJS configuration. Please check your Service ID, Template ID, and Public Key.'
        } else if (error.message.includes('template')) {
          errorMessage = 'Template error. Please check your EmailJS template configuration and variable names.'
        } else if (error.message.includes('service')) {
          errorMessage = 'Service error. Please check your EmailJS service configuration.'
        }
      }
      
      results.push({
        success: false,
        error: errorMessage,
        recipient
      })
    }

    // Add small delay between emails
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

/**
 * Alternative: Simple mailto fallback for development/testing
 * Opens default email client with pre-filled content
 */
export function sendViaMailto(emailData: EmailData): EmailResult[] {
  try {
    const subject = encodeURIComponent(emailData.subject)
    const body = encodeURIComponent(emailData.message)
    const recipients = emailData.to.join(',')
    
    const mailtoLink = `mailto:${recipients}?subject=${subject}&body=${body}`
    window.open(mailtoLink)
    
    return emailData.to.map(recipient => ({
      success: true,
      messageId: 'mailto-opened',
      recipient
    }))
  } catch (error) {
    return emailData.to.map(recipient => ({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to open email client',
      recipient
    }))
  }
}

/**
 * Server-side email sending using Netlify/Vercel Functions
 * This would require a serverless function to be deployed
 */
export async function sendViaServerlessFunction(emailData: EmailData): Promise<EmailResult[]> {
  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    const results = await response.json()
    return results
  } catch (error) {
    console.error('Error calling serverless function:', error)
    return emailData.to.map(recipient => ({
      success: false,
      error: error instanceof Error ? error.message : 'Serverless function error',
      recipient
    }))
  }
}

/**
 * Extract email from resume content (enhanced version)
 */
export function extractEmailFromContent(content: string): string | null {
  // More comprehensive email regex
  const emailRegex = /\b[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\b/g
  const matches = content.match(emailRegex)
  
  if (matches) {
    // Filter out common false positives
    const validEmails = matches.filter(email => {
      const domain = email.split('@')[1]
      return domain && 
             !domain.includes('example.com') && 
             !domain.includes('test.com') && 
             !domain.includes('sample.com') &&
             domain.includes('.')
    })
    
    return validEmails.length > 0 ? validEmails[0] : null
  }
  
  return null
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * Main email sending function that tries different methods
 */
export async function sendBulkEmail(emailData: EmailData): Promise<EmailResult[]> {
  console.log('Attempting to send emails to:', emailData.to.length, 'recipients')
  
  // Try EmailJS first (if configured)
  if (import.meta.env.VITE_EMAILJS_SERVICE_ID && 
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID && 
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
    console.log('Using EmailJS for email sending')
    
    try {
      const results = await sendBulkEmailJS(emailData)
      
      // Check if all emails failed - might be configuration issue
      const allFailed = results.every(r => !r.success)
      if (allFailed && results.length > 0) {
        console.warn('All EmailJS emails failed, falling back to mailto')
        console.warn('First error:', results[0].error)
        
        // Show user-friendly error and offer mailto fallback
        const useMailto = confirm(
          '❌ EmailJS Configuration Issue\n\n' +
          `Error: ${results[0].error}\n\n` +
          'Would you like to:\n' +
          '• Click "OK" to open your email client instead\n' +
          '• Click "Cancel" to fix EmailJS configuration\n\n' +
          'See EMAILJS_TROUBLESHOOTING.md for setup help.'
        )
        
        if (useMailto) {
          console.log('User chose mailto fallback')
          return sendViaMailto(emailData)
        } else {
          return results // Return the original errors for debugging
        }
      }
      
      return results
    } catch (error) {
      console.error('EmailJS completely failed:', error)
      // Fall through to mailto
    }
  }
  
  // Fallback to mailto for development/testing
  console.log('Using mailto fallback (opens email client)')
  return sendViaMailto(emailData)
}
