'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import AIAssistantBubble from './ai-assistant-bubble'
import ClientMessaging from './client-messaging'

export default function ConditionalAIAssistant() {
  const pathname = usePathname()
  const { customer, isLoading } = useAuth()
  
  // Don't show on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }
  
  // Don't show on client dashboard pages (they have their own chat widget)
  if (pathname.startsWith('/client/dashboard')) {
    return null
  }
  
  // Show messaging system for logged-in clients
  if (!isLoading && customer) {
    return <ClientMessaging />
  }
  
  // Show AI assistant for non-logged-in users
  return <AIAssistantBubble />
}
