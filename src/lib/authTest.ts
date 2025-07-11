// Quick test to debug authentication issues
// This file can be deleted after debugging

console.log('=== Environment Variables Check ===')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING')
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')

console.log('=== Supabase Client Test ===')
import { supabase } from './supabase'

// Test Supabase connection
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Supabase session check:', { data: !!data, error })
})

export const testAuth = async (email: string, password: string) => {
  console.log('Testing authentication with:', email)
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('Auth test result:', { 
      user: data.user?.email, 
      session: !!data.session, 
      error: error?.message 
    })
    
    return { data, error }
  } catch (err) {
    console.error('Auth test failed:', err)
    return { data: null, error: err }
  }
}
