'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Analytics component for tracking page views
// Replace with your preferred analytics service (Google Analytics, Plausible, etc.)
export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined') {
      // Example: Google Analytics 4
      // gtag('config', 'GA_MEASUREMENT_ID', {
      //   page_path: pathname,
      // })
      
      // Example: Plausible
      // plausible('pageview')
      
      // Example: Custom analytics
      console.log('Page view:', pathname)
    }
  }, [pathname])

  return null
}

// Event tracking function
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Example: Google Analytics 4
    // gtag('event', eventName, properties)
    
    // Example: Plausible
    // plausible(eventName, { props: properties })
    
    // Example: Custom analytics
    console.log('Event:', eventName, properties)
  }
}

// Common events
export const events = {
  quoteRequested: (data: any) => trackEvent('quote_requested', data),
  contactFormSubmitted: (data: any) => trackEvent('contact_form_submitted', data),
  projectViewed: (projectId: string) => trackEvent('project_viewed', { project_id: projectId }),
  serviceViewed: (serviceId: string) => trackEvent('service_viewed', { service_id: serviceId }),
  blogPostViewed: (postId: string) => trackEvent('blog_post_viewed', { post_id: postId }),
}
