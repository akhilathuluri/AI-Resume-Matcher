import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'No session')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      console.error('Error getting session:', error)
      setSession(null)
      setUser(null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email || 'No session')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // If we get a SIGNED_OUT event, ensure everything is cleared
      if (_event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    try {
      console.log('Starting sign out process...')
      
      // Clear local state immediately
      setUser(null)
      setSession(null)
      
      // Clear all localStorage items related to Supabase
      const keysToRemove = [
        'supabase.auth.token',
        'sb-vjenjzbyaakuanqbxsww-auth-token',
        'supabase.auth.refreshToken',
        'supabase.auth.expiresAt',
        'supabase.auth.user'
      ]
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      
      // Clear all Supabase-related localStorage keys (dynamic approach)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          localStorage.removeItem(key)
        }
      }
      
      // Clear sessionStorage as well
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          sessionStorage.removeItem(key)
        }
      }
      
      // Try to sign out from Supabase server (don't worry if it fails)
      try {
        await supabase.auth.signOut({ scope: 'global' })
      } catch (serverError) {
        console.log('Server signout failed (expected if session expired):', serverError)
        // Don't throw - local cleanup is more important
      }
      
      console.log('Sign out completed successfully')
      
    } catch (error) {
      console.error('Failed to sign out:', error)
      // Even if everything fails, ensure local state is cleared
      setUser(null)
      setSession(null)
      
      // Force clear storage as last resort
      localStorage.clear()
      sessionStorage.clear()
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
