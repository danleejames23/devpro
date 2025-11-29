'use client'

import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
    />
  </div>
)

// Lazy load heavy components
export const LazyClientMessaging = lazy(() => import('./client-messaging'))
export const LazyAdminMessaging = lazy(() => import('./admin-messaging'))
export const LazyAIAssistant = lazy(() => import('./ai-assistant-bubble'))

// Wrapper component for lazy loading with suspense
export function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

// Optimized conditional AI assistant
export function OptimizedConditionalAIAssistant() {
  const { usePathname } = require('next/navigation')
  const { useAuth } = require('@/contexts/auth-context')
  
  const pathname = usePathname()
  const { customer, isLoading } = useAuth()
  
  // Don't show on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }
  
  // Show messaging system for logged-in clients
  if (!isLoading && customer) {
    return (
      <LazyWrapper>
        <LazyClientMessaging />
      </LazyWrapper>
    )
  }
  
  // Show AI assistant for non-logged-in users
  return (
    <LazyWrapper>
      <LazyAIAssistant />
    </LazyWrapper>
  )
}
