'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, Clock, Award, Zap, Globe } from 'lucide-react'

interface Stat {
  id: string
  label: string
  value: number
  suffix: string
  icon: React.ReactNode
  gradient: string
  increment: number
}

const initialStats: Stat[] = [
  {
    id: 'projects',
    label: 'Projects Completed',
    value: 13,
    suffix: '+',
    icon: <Award className="w-4 h-4" />,
    gradient: 'from-neon-purple to-cosmic-blue',
    increment: 1
  },
  {
    id: 'clients',
    label: 'Happy Clients',
    value: 13,
    suffix: '+',
    icon: <Users className="w-4 h-4" />,
    gradient: 'from-cosmic-blue to-cyber-mint',
    increment: 1
  },
  {
    id: 'uptime',
    label: 'System Uptime',
    value: 99.8,
    suffix: '%',
    icon: <Zap className="w-4 h-4" />,
    gradient: 'from-cyber-mint to-plasma-pink',
    increment: 0.01
  },
  {
    id: 'response',
    label: 'Avg Response Time',
    value: 1.12,
    suffix: 'hrs',
    icon: <Clock className="w-4 h-4" />,
    gradient: 'from-plasma-pink to-neon-purple',
    increment: 0.01
  }
]

export default function RealTimeStats() {
  const [stats, setStats] = useState(initialStats)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Load stats from localStorage if available
    const savedStats = localStorage.getItem('liveStats')
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats)
        setStats(prevStats => 
          prevStats.map(stat => {
            const savedStat = parsedStats.find((s: any) => s.id === stat.id)
            return savedStat ? { ...stat, value: savedStat.value } : stat
          })
        )
      } catch (error) {
        console.error('Error loading saved stats:', error)
      }
    }

    // Show stats after a delay
    const showTimer = setTimeout(() => setIsVisible(true), 500)

    // Only update stats on homepage to reduce unnecessary re-renders
    const isHomePage = window.location.pathname === '/'
    let interval: NodeJS.Timeout | null = null
    
    if (isHomePage) {
      // Update only uptime and response time periodically
      interval = setInterval(() => {
        setStats(prevStats => 
          prevStats.map(stat => {
            // Only update uptime and response time automatically
            if (stat.id === 'projects' || stat.id === 'clients') {
              return stat // Don't auto-increment projects/clients
            }
            
            const randomFactor = Math.random() * 0.5 + 0.75 // 0.75 to 1.25
            let newValue = stat.value + (stat.increment * randomFactor)
            
            // Keep values within reasonable bounds
            if (stat.id === 'uptime') {
              newValue = Math.min(99.9, Math.max(99.5, newValue))
            } else if (stat.id === 'response') {
              newValue = Math.min(1.5, Math.max(0.8, newValue)) // Response time between 0.8-1.5 hrs
            }
            
            return {
              ...stat,
              value: Math.round(newValue * 100) / 100
            }
          })
        )
      }, 10000) // Update every 10 seconds
    }

    // Listen for project completion events
    const handleProjectCompletion = () => {
      setStats(prevStats => {
        const newStats = prevStats.map(stat => {
          if (stat.id === 'projects') {
            return { ...stat, value: stat.value + 1 }
          }
          return stat
        })
        // Save to localStorage
        localStorage.setItem('liveStats', JSON.stringify(newStats))
        return newStats
      })
    }

    // Listen for new client events
    const handleNewClient = () => {
      setStats(prevStats => {
        const newStats = prevStats.map(stat => {
          if (stat.id === 'clients') {
            return { ...stat, value: stat.value + 1 }
          }
          return stat
        })
        // Save to localStorage
        localStorage.setItem('liveStats', JSON.stringify(newStats))
        return newStats
      })
    }

    // Add event listeners for custom events
    window.addEventListener('projectCompleted', handleProjectCompletion)
    window.addEventListener('newClient', handleNewClient)

    return () => {
      clearTimeout(showTimer)
      if (interval) clearInterval(interval)
      window.removeEventListener('projectCompleted', handleProjectCompletion)
      window.removeEventListener('newClient', handleNewClient)
    }
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-2"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="glass-card border border-neon-purple/20 hover:border-cyber-mint/40 transition-all duration-300 w-48">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white animate-pulse-glow`}>
                  {stat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      key={stat.value}
                      initial={{ scale: 1.2, color: '#00e0b0' }}
                      animate={{ scale: 1, color: '#e2e8f0' }}
                      transition={{ duration: 0.3 }}
                      className="text-lg font-bold text-silver-glow font-mono"
                    >
                      {stat.value}
                    </motion.span>
                    <span className="text-sm text-silver-glow/80">{stat.suffix}</span>
                  </div>
                  <p className="text-xs text-silver-glow/60 truncate">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 text-xs text-silver-glow/60 mt-2"
      >
        <div className="w-2 h-2 bg-cyber-mint rounded-full animate-pulse"></div>
        <span>Live Stats</span>
      </motion.div>
    </motion.div>
  )
}
