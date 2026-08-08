import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const MOCK_USER_STORAGE_KEY = 'ml_quest_demo_user'
const ONBOARDING_STORAGE_KEY = 'ml_quest_onboarding_data'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [onboardingData, setOnboardingData] = useState(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Real Supabase session management
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } else {
      // Demo / Local session persistence
      try {
        const savedDemo = localStorage.getItem(MOCK_USER_STORAGE_KEY)
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo)
          setUser(parsed)
          setSession({ user: parsed, access_token: 'demo-token' })
        }
      } catch (e) {
        console.warn('Demo session restore error', e)
      }
      setLoading(false)
    }
  }, [])

  // Login Handler
  const login = async (email, password) => {
    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSession(data.session)
        setUser(data.user)
        return { user: data.user, session: data.session }
      } else {
        // Fallback local demo auth
        await new Promise((r) => setTimeout(r, 800))
        const demoUser = {
          id: 'demo-user-1',
          email,
          user_metadata: { full_name: email.split('@')[0] || 'AI Explorer', role: 'ML Engineer' }
        }
        localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(demoUser))
        setUser(demoUser)
        setSession({ user: demoUser, access_token: 'demo-token' })
        return { user: demoUser }
      }
    } finally {
      setLoading(false)
    }
  }

  // Signup Handler
  const signup = async (email, password, metadata = {}) => {
    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata }
        })
        if (error) throw error

        let activeSession = data.session
        let activeUser = data.user

        if (!activeSession && activeUser) {
          try {
            const { data: signInData } = await supabase.auth.signInWithPassword({ email, password })
            if (signInData?.session) {
              activeSession = signInData.session
              activeUser = signInData.user
            }
          } catch (e) {
            // Email confirmation required by Supabase project settings
          }
        }

        if (activeSession) {
          setSession(activeSession)
          setUser(activeUser)
        }

        return {
          user: activeUser,
          session: activeSession,
          requiresConfirmation: !activeSession && Boolean(activeUser)
        }
      } else {
        await new Promise((r) => setTimeout(r, 1000))
        const demoUser = {
          id: `user-${Date.now()}`,
          email,
          user_metadata: { full_name: metadata.full_name || 'AI Researcher', role: metadata.role || 'ML Specialist' }
        }
        localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(demoUser))
        setUser(demoUser)
        setSession({ user: demoUser, access_token: 'demo-token' })
        return { user: demoUser }
      }
    } finally {
      setLoading(false)
    }
  }

  // Social OAuth Handler
  const loginWithOAuth = async (provider) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({ provider })
      if (error) throw error
    } else {
      await new Promise((r) => setTimeout(r, 800))
      const demoUser = {
        id: `oauth-${provider}-${Date.now()}`,
        email: `researcher@${provider}.demo`,
        user_metadata: { full_name: `AI Explorer (${provider})`, role: 'Data Scientist' }
      }
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(demoUser))
      setUser(demoUser)
      setSession({ user: demoUser, access_token: 'demo-token' })
    }
  }

  // Reset Password Handler
  const resetPassword = async (email) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    } else {
      await new Promise((r) => setTimeout(r, 600))
    }
  }

  // Update User Profile Metadata
  const updateProfile = async (profileData) => {
    if (!user) return null
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.updateUser({
        data: profileData
      })
      if (error) throw error
      if (data?.user) {
        setUser(data.user)
      }
      await supabaseService.updateUserProfile(user.id, profileData)
      return data.user
    } else {
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user?.user_metadata,
          ...profileData
        }
      }
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(updatedUser))
      setUser(updatedUser)
      await supabaseService.updateUserProfile(user.id, profileData)
    }
  }

  // Onboarding Data Handler
  const saveOnboarding = (data) => {
    setOnboardingData(data)
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data))
  }

  // Logout Handler
  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY)
    }
    setUser(null)
    setSession(null)
  }

  // Instant Demo User Handler
  const loginAsDemoUser = (customEmail, customName, customRole) => {
    const demoUser = {
      id: `demo-${Date.now()}`,
      email: customEmail || 'explorer@algorithm.ai',
      user_metadata: {
        full_name: customName || customEmail?.split('@')[0] || 'AI Explorer',
        role: customRole || 'ML Engineer'
      }
    }
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
    setSession({ user: demoUser, access_token: 'demo-token' })
    return demoUser
  }

  const value = {
    user,
    session,
    loading,
    login,
    signup,
    loginWithOAuth,
    loginAsDemoUser,
    logout,
    resetPassword,
    updateProfile,
    onboardingData,
    saveOnboarding
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
