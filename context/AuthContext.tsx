'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { DEV_USER } from '@/lib/devAuth'

interface AuthUser {
  id: string
  username: string
  role: string
  isSuperAdmin: boolean
  companyId: string | null
  companyName?: string
  companySubdomain?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TEMPORARY: Use dev user
    setUser(DEV_USER)
    setLoading(false)
  }, [])

  const signOut = async () => {
    // In dev mode, just reset to the dev user
    setUser(DEV_USER)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}