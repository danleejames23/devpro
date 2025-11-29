'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FuturisticSidebar from '@/components/admin/futuristic-sidebar'
import FuturisticStats from '@/components/admin/futuristic-stats'
import { useNotificationPopup } from '@/components/notification-popup'

// Interfaces
interface AdminQuote {
  id: string
  quote_id: string
  customer_id: string
  customer_name: string
  name: string
  email: string
  company?: string
  description: string
  estimated_cost: number
  estimatedCost: number
  estimated_timeline: string
  estimatedTimeline: number
  timeline?: number
  rush_delivery: 'standard' | 'priority' | 'express'
  selected_package?: any
  selectedFeatures: string[]
  services?: string[]
  complexity: 'basic' | 'standard' | 'premium'
  status: 'pending' | 'under_review' | 'quoted' | 'approved' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  createdAt: string
  updated_at: string
  updatedAt: string
  admin_notes?: string
  adminNotes?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  attachments: string[]
  additionalItems?: string[]
  depositPercentage?: number
  paymentTerms?: string
  lateFeePercentage?: number
  notes?: string
  finalQuote?: {
    cost: number
    timeline: number
    additionalItems: string[]
    terms: string
    depositAmount: number
    depositPercentage: number
  }
}

interface AdminCustomer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  location?: string
  status: 'active' | 'inactive' | 'pending'
  total_projects: number
  total_spent: number
  amount_owed?: number
  last_activity: string
  created_at: string
  updated_at: string
  avatar?: string
  timezone?: string
}

interface AdminMessage {
  id: string
  customer_id: string
  customer_name: string
  customer_avatar?: string
  subject: string
  message: string
  is_from_admin: boolean
  created_at: string
  is_read: boolean
  attachments?: string[]
  thread_id?: string
  reply_to?: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

interface AdminProject {
  id: string
  customer_id: string
  name: string
  client: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
  start_date: string
  end_date: string
  budget: number
  quote_id?: string
  created_at?: string
  updated_at?: string
}

interface AdminFile {
  id: string
  customer_id: string
  customer_name: string
  project_id?: string
  file_name: string
  file_size: number
  file_type: string
  folder_name: string
  description?: string
  uploaded_by_admin: boolean
  created_at: string
  download_count: number
  is_shared: boolean
  access_level: 'private' | 'client' | 'public'
}

export default function AdvancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)
  
  // Data states
  const [quotes, setQuotes] = useState<AdminQuote[]>([])
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [files, setFiles] = useState<AdminFile[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  
  const { showSuccess, showError, showLoading, hideNotification, NotificationPopup } = useNotificationPopup()

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      window.location.href = '/admin'
      return
    }

    const loadData = async () => {
      try {
        const parsedAdmin = JSON.parse(adminData)
        setAdmin(parsedAdmin)
        
        showLoading('Loading Dashboard', 'Fetching your data...')
        
        // Load all admin data in parallel
        await Promise.all([
          loadQuotes(),
          loadCustomers(),
          loadMessages(),
          loadProjects(),
          loadFiles(),
          loadInvoices(),
          loadAnalytics()
        ])
        
        hideNotification()
        showSuccess('Dashboard Loaded', 'All data loaded successfully!', 2000)
      } catch (error) {
        console.error('Error loading admin data:', error)
        hideNotification()
        showError('Loading Error', 'Failed to load dashboard data')
        window.location.href = '/admin'
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadQuotes = async () => {
    try {
      const response = await fetch('/api/admin/quotes')
      const data = await response.json()
      if (data.success) {
        setQuotes(data.quotes || [])
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      const data = await response.json()
      if (data.success) {
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages')
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects')
      const data = await response.json()
      if (data.success) {
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/admin/files')
      const data = await response.json()
      if (data.success) {
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices')
      const data = await response.json()
      if (data.success) {
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics || {})
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  // Enhanced statistics
  const getAdvancedStats = () => {
    const totalQuotes = quotes.length
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length
    const activeProjects = projects.filter(p => p.status === 'in_progress').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const totalRevenue = quotes
      .filter(q => q.status === 'completed')
      .reduce((sum, q) => sum + (q.estimated_cost || q.estimatedCost || 0), 0)
    const monthlyRevenue = quotes
      .filter(q => q.status === 'completed' && new Date(q.updated_at || q.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, q) => sum + (q.estimated_cost || q.estimatedCost || 0), 0)
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'active').length
    const unreadMessages = messages.filter(m => !m.is_read && !m.is_from_admin).length
    const urgentQuotes = quotes.filter(q => q.priority === 'urgent' && q.status === 'pending').length
    const totalFiles = files.length
    const sharedFiles = files.filter(f => f.is_shared).length
    const avgProjectProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0

    return {
      totalQuotes,
      pendingQuotes,
      activeProjects,
      completedProjects,
      totalRevenue,
      monthlyRevenue,
      totalCustomers,
      activeCustomers,
      unreadMessages,
      urgentQuotes,
      totalFiles,
      sharedFiles,
      avgProjectProgress,
      totalPaidRevenue: 0,
      owedRevenue: 0
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/admin'
  }

  const stats = getAdvancedStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-space via-space-gray to-deep-space">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyber-mint border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-silver-glow font-accent text-lg">Initializing Neural Networks...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-space via-space-gray to-deep-space">
      {/* Futuristic Sidebar */}
      <FuturisticSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        unreadMessages={stats.unreadMessages}
        pendingQuotes={stats.pendingQuotes}
      />

      {/* Main Content Area */}
      <div className="ml-80 min-h-screen">
        {/* Cosmic Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-neon-purple/10 to-cyber-mint/5 rounded-full blur-3xl animate-cosmic-drift"></div>
          <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-gradient-to-br from-cosmic-blue/8 to-plasma-pink/5 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '10s'}}></div>
        </div>

        <div className="relative z-10 p-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="glass-card p-6 rounded-2xl border border-neon-purple/20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-silver-glow font-accent mb-2">
                    Welcome back, <span className="text-cyber-mint">{admin.name || admin.username}</span>
                  </h1>
                  <p className="text-silver-glow/70">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} • Neural systems online
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <FuturisticStats stats={stats} />
              )}

              {activeTab === 'quotes' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-neon-purple/20">
                    <h2 className="text-2xl font-bold text-silver-glow font-accent mb-4">Quote Management</h2>
                    <p className="text-silver-glow/70">Manage incoming quote requests and client communications.</p>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-cyber-mint/20">
                    <h2 className="text-2xl font-bold text-silver-glow font-accent mb-4">Active Projects</h2>
                    <p className="text-silver-glow/70">Monitor project progress and deliverables.</p>
                  </div>
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-cosmic-blue/20">
                    <h2 className="text-2xl font-bold text-silver-glow font-accent mb-4">Client Database</h2>
                    <p className="text-silver-glow/70">Manage client relationships and contact information.</p>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-plasma-pink/20">
                    <h2 className="text-2xl font-bold text-silver-glow font-accent mb-4">Communications Hub</h2>
                    <p className="text-silver-glow/70">Handle client messages and communications.</p>
                  </div>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-neon-purple/20">
                    <h2 className="text-2xl font-bold text-silver-glow font-accent mb-4">Financial Hub</h2>
                    <p className="text-silver-glow/70">Manage invoices and financial operations.</p>
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-cyber-mint/20">
                    <h2 className="text-2xl font-bold text-silver-glow font-accent mb-4">Data Vault</h2>
                    <p className="text-silver-glow/70">Secure file storage and sharing system.</p>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-plasma-pink/20">
                    <h2 className="text-2xl font-bold text-silver-glow font-accent mb-4">Intelligence Dashboard</h2>
                    <p className="text-silver-glow/70">AI-powered business insights and analytics.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup />
    </div>
  )
}
