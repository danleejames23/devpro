'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, Users, FileText, MessageSquare, Settings, LogOut, 
  Activity, Briefcase, CreditCard, DollarSign, Mail, Code,
  Menu, X, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
  unreadMessages?: number
  pendingQuotes?: number
  pendingCustomQuotes?: number
  newInquiries?: number
  admin?: { username?: string } | null
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'quotes', label: 'Quotes', icon: FileText, badge: 'pendingQuotes' },
  { id: 'custom-quotes', label: 'Custom Quotes', icon: Sparkles, badge: 'pendingCustomQuotes' },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'customers', label: 'Clients', icon: Users },
  { id: 'inquiries', label: 'Inquiries', icon: Mail, badge: 'newInquiries' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 'unreadMessages' },
  { id: 'invoices', label: 'Invoices', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: Activity },
]

export default function FuturisticSidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  unreadMessages = 0, 
  pendingQuotes = 0,
  pendingCustomQuotes = 0,
  newInquiries = 0,
  admin = null
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (isMobile) setIsMobileOpen(false)
  }

  const getBadgeCount = (badgeType: string) => {
    if (badgeType === 'unreadMessages') return unreadMessages
    if (badgeType === 'pendingQuotes') return pendingQuotes
    if (badgeType === 'pendingCustomQuotes') return pendingCustomQuotes
    if (badgeType === 'newInquiries') return newInquiries
    return 0
  }

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && isMobile && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 z-50 flex flex-col transition-transform duration-300 ${
          isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        } ${isMobile ? '' : 'hidden lg:flex'}`}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Code className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-white">Lumora Pro</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const badgeCount = item.badge ? getBadgeCount(item.badge) : 0

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {badgeCount > 0 && (
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 text-xs px-2">
                    {badgeCount}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>
        
        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{admin?.username?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.username || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
          <Button 
            onClick={onLogout} 
            variant="outline" 
            className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
