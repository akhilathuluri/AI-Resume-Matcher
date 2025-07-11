// EmailJS Configuration Tester
// Copy this code into your browser console to test EmailJS setup

async function testEmailJSConfig() {
  console.log('🔧 Testing EmailJS Configuration...')
  
  // Check environment variables
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  
  console.log('📋 Environment Variables:')
  console.log('  Service ID:', serviceId ? `✅ ${serviceId}` : '❌ Not set')
  console.log('  Template ID:', templateId ? `✅ ${templateId}` : '❌ Not set')
  console.log('  Public Key:', publicKey ? `✅ ${publicKey.substring(0, 10)}...` : '❌ Not set')
  
  if (!serviceId || !templateId || !publicKey) {
    console.error('❌ Missing EmailJS configuration. Please add to .env.local:')
    console.log(`
VITE_EMAILJS_SERVICE_ID=service_your_id_here
VITE_EMAILJS_TEMPLATE_ID=template_your_id_here
VITE_EMAILJS_PUBLIC_KEY=user_your_key_here
    `)
    return
  }
  
  // Test EmailJS
  try {
    console.log('📧 Testing EmailJS send...')
    
    // Initialize EmailJS
    emailjs.init(publicKey)
    
    // Test email
    const testParams = {
      to_email: 'test@example.com', // Change this to your email for testing
      subject: 'EmailJS Test',
      message: 'This is a test message from EmailJS configuration test.',
      from_name: 'EmailJS Tester',
      reply_to: 'noreply@test.com'
    }
    
    console.log('📤 Sending test email with params:', testParams)
    
    const result = await emailjs.send(serviceId, templateId, testParams)
    
    console.log('✅ EmailJS test successful!')
    console.log('📊 Result:', result)
    
    if (result.status === 200) {
      console.log('🎉 EmailJS is configured correctly!')
    } else {
      console.warn('⚠️ Unexpected status:', result.status)
    }
    
  } catch (error) {
    console.error('❌ EmailJS test failed:', error)
    
    if (error.message.includes('Invalid')) {
      console.log('💡 Fix: Check your Service ID, Template ID, and Public Key in EmailJS dashboard')
    } else if (error.message.includes('template')) {
      console.log('💡 Fix: Check your template configuration and variable names')
    } else if (error.message.includes('service')) {
      console.log('💡 Fix: Ensure your email service is connected and active')
    }
    
    console.log('📖 See EMAILJS_TROUBLESHOOTING.md for detailed setup help')
  }
}

// Auto-run if EmailJS is available
if (typeof emailjs !== 'undefined') {
  testEmailJSConfig()
} else {
  console.log('⚠️ EmailJS not loaded. Make sure @emailjs/browser is installed.')
}

// Export for manual testing
window.testEmailJSConfig = testEmailJSConfig
