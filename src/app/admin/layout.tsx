'use client'

import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Hide the navigation component for admin pages
    const nav = document.querySelector('nav')
    if (nav) {
      nav.style.display = 'none'
    }
    
    // Hide the footer for admin pages
    const footer = document.querySelector('footer')
    if (footer) {
      footer.style.display = 'none'
    }
    
    // Cleanup function to restore navigation when leaving admin
    return () => {
      if (nav) {
        nav.style.display = ''
      }
      if (footer) {
        footer.style.display = ''
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {children}
    </div>
  )
}
