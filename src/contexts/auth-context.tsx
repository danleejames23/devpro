'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Customer {
  id: string
  name: string
  email: string
  company?: string
}

interface AuthContextType {
  customer: Customer | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Verify token with server
        const apiBase = typeof window !== 'undefined' && window.location.origin.startsWith('http')
          ? window.location.origin
          : 'http://localhost:3000'
        const response = await fetch(`${apiBase}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCustomer(data.customer)
          } else {
            // Token invalid, remove it
            localStorage.removeItem('auth_token')
          }
        } else {
          localStorage.removeItem('auth_token')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const apiBase = typeof window !== 'undefined' && window.location.origin.startsWith('http')
        ? window.location.origin
        : 'http://localhost:3000'
      const response = await fetch(`${apiBase}/api/auth/simple-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (data.success) {
        // Store auth token
        localStorage.setItem('auth_token', data.token)
        setCustomer(data.customer)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setCustomer(null)
  }

  return (
    <AuthContext.Provider value={{
      customer,
      login,
      logout,
      isLoading
    }}>
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
