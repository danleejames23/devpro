'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, Users, FileText, MessageSquare, Settings, LogOut, 
  Zap, Bot, Shield, Activity, Target, Award, Bell, Search,
  ChevronRight, Home, Briefcase, CreditCard, DollarSign, Database, Mail,
  Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
  unreadMessages?: number
  pendingQuotes?: number
  newInquiries?: number
}

const sidebarItems = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
    gradient: 'from-neon-purple to-cosmic-blue',
    description: 'Business Overview'
  },
  {
    id: 'quotes',
    label: 'Quote Management',
    icon: <FileText className="w-5 h-5" />,
    gradient: 'from-cosmic-blue to-cyber-mint',
    description: 'Client Requests',
    badge: 'pendingQuotes'
  },
  {
    id: 'projects',
    label: 'Project Management',
    icon: <Briefcase className="w-5 h-5" />,
    gradient: 'from-cyber-mint to-plasma-pink',
    description: 'Active Projects'
  },
  {
    id: 'customers',
    label: 'Client Management',
    icon: <Users className="w-5 h-5" />,
    gradient: 'from-plasma-pink to-neon-purple',
    description: 'Client Directory'
  },
  {
    id: 'inquiries',
    label: 'Inquiries',
    icon: <Mail className="w-5 h-5" />,
    gradient: 'from-cosmic-blue to-neon-purple',
    description: 'Lead Management',
    badge: 'newInquiries'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <MessageSquare className="w-5 h-5" />,
    gradient: 'from-neon-purple to-cosmic-blue',
    description: 'Client Communications',
    badge: 'unreadMessages'
  },
  {
    id: 'invoices',
    label: 'Invoicing',
    icon: <CreditCard className="w-5 h-5" />,
    gradient: 'from-cosmic-blue to-cyber-mint',
    description: 'Financial Management'
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: <DollarSign className="w-5 h-5" />,
    gradient: 'from-cyber-mint to-plasma-pink',
    description: 'Payment Tracking'
  },
  {
    id: 'analytics',
    label: 'Reports & Analytics',
    icon: <Activity className="w-5 h-5" />,
    gradient: 'from-plasma-pink to-neon-purple',
    description: 'Business Insights'
  }
]

export default function FuturisticSidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  unreadMessages = 0, 
  pendingQuotes = 0,
  newInquiries = 0
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (isMobile) setIsMobileOpen(false)
  }

  const getBadgeCount = (badgeType: string) => {
    if (badgeType === 'unreadMessages') return unreadMessages
    if (badgeType === 'pendingQuotes') return pendingQuotes
    if (badgeType === 'newInquiries') return newInquiries
    return 0
  }

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 glass-card rounded-xl border border-neon-purple/30 text-silver-glow hover:text-cyber-mint transition-colors"
        style={{ backgroundColor: '#1f1f2e' }}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: isMobile ? (isMobileOpen ? 0 : -320) : 0, 
          opacity: isMobile ? (isMobileOpen ? 1 : 0) : 1 
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed left-0 top-0 h-screen w-72 lg:w-64 glass-card border-r border-neon-purple/20 backdrop-blur-xl z-50 flex flex-col"
        style={{ backgroundColor: '#1f1f2e' }}
      >
      {/* Header */}
      <div className="p-6 border-b border-neon-purple/20">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-cyber-mint rounded-2xl flex items-center justify-center animate-pulse-glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-silver-glow font-accent">Admin Panel</h2>
            <p className="text-sm text-silver-glow/60">Business Management</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const isActive = activeTab === item.id
          const badgeCount = item.badge ? getBadgeCount(item.badge) : 0

          return (
            <motion.button
              key={item.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => handleTabChange(item.id)}
              className={`w-full p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'glass-card border border-cyber-mint/50 bg-cyber-mint/10'
                  : 'hover:glass-card hover:border-neon-purple/30'
              }`}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} text-white animate-pulse-glow` 
                    : 'bg-space-gray/50 text-silver-glow/70 group-hover:text-cyber-mint'
                }`}>
                  {item.icon}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold font-accent ${
                      isActive ? 'text-cyber-mint' : 'text-silver-glow group-hover:text-cyber-mint'
                    }`}>
                      {item.label}
                    </span>
                    {badgeCount > 0 && (
                      <Badge className="bg-gradient-to-r from-plasma-pink to-neon-purple text-white border-0 animate-pulse-glow text-xs">
                        {badgeCount}
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isActive ? 'text-cyber-mint/70' : 'text-silver-glow/50 group-hover:text-cyber-mint/70'
                  }`}>
                    {item.description}
                  </p>
                </div>
                
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                  isActive 
                    ? 'text-cyber-mint rotate-90' 
                    : 'text-silver-glow/40 group-hover:text-cyber-mint group-hover:translate-x-1'
                }`} />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neon-purple/20 space-y-3">
        {/* System Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-3 rounded-xl border border-cyber-mint/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-cyber-mint rounded-full animate-pulse" />
            <span className="text-sm text-silver-glow/80 font-accent">System Online</span>
          </div>
          <p className="text-xs text-silver-glow/60 mt-1">All services operational</p>
        </motion.div>

        {/* Settings & Logout */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-silver-glow/70 hover:text-cyber-mint hover:bg-cyber-mint/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="flex-1 text-silver-glow/70 hover:text-plasma-pink hover:bg-plasma-pink/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </motion.div>
    </>
  )
}
