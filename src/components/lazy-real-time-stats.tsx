'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// Lazy load the RealTimeStats component only on homepage
const RealTimeStats = dynamic(() => import('./real-time-stats'), {
  ssr: false,
  loading: () => null
})

export default function LazyRealTimeStats() {
  const pathname = usePathname()
  
  // Only render on homepage to improve performance on other pages
  if (pathname !== '/') {
    return null
  }
  
  return <RealTimeStats />
}
