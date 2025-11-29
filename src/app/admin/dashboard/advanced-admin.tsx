'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, Users, FileText, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle,
  LogOut, Settings, BarChart3, MessageSquare, Edit, Send, Eye, X, Save, Plus, Minus,
  Calculator, CreditCard, Mail, Upload, Download, Folder, Search, Filter, Bell,
  Calendar, Package, Zap, Archive, Trash2, ExternalLink, RefreshCw, Star, Tag,
  PieChart, Activity, Target, Award, Briefcase, Globe, Phone, MapPin, PlayCircle,
  PauseCircle, MoreHorizontal, ChevronDown, ChevronRight, FolderOpen, FileImage,
  FileVideo, Music, Code, Database, Server, Layers, Palette, Smartphone, Monitor,
  Headphones, Video, Image, Paperclip, Link, Copy, Share2, BookOpen, HelpCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useNotificationPopup } from '@/components/notification-popup'

// Enhanced interfaces
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
  estimated_timeline: string
  rush_delivery: 'standard' | 'priority' | 'express'
  selected_package?: any
  status: 'pending' | 'under_review' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  admin_notes?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  attachments: string[]
}

interface AdminCustomer {
  id: string
  first_name: string
  last_name: string
  email: string
  company?: string
  phone?: string
  created_at: string
  total_projects: number
  total_spent: number
  status: 'active' | 'inactive' | 'pending'
  last_activity: string
  avatar?: string
  location?: string
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
  customer_name: string
  title: string
  description: string
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold'
  progress: number
  start_date: string
  due_date: string
  budget: number
  spent: number
  team_members: string[]
  files_count: number
  tasks_completed: number
  tasks_total: number
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

interface AdminInvoice {
  id: string
  customer_id: string
  customer_name: string
  project_id?: string
  project_name?: string
  amount: number
  amount_due: number
  status: 'pending' | 'paid' | 'overdue' | string
  issue_date?: string
  due_date?: string
  paid_date?: string
  items?: any[]
  deposit_required: boolean
  deposit_amount: number
  deposit_paid: boolean
  deposit_due_date?: string
  remaining_amount: number
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
  const [analytics, setAnalytics] = useState<any>({})
  const [invoices, setInvoices] = useState<AdminInvoice[]>([])
  
  // UI states
  const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null)
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  
  // Modal states
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isFileModalOpen, setIsFileModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  
  const { showSuccess, showError, showLoading, hideNotification, NotificationPopup } = useNotificationPopup()

  // Load admin data
  useEffect(() => {
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
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Data loading functions
  const loadQuotes = async () => {
    try {
      const response = await fetch('/api/admin/quotes')
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes || [])
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/admin/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices((data.invoices || []).map((inv: any) => ({
          ...inv,
          amount: Number(inv.amount) || 0,
          amount_due: Number(inv.amount_due) || 0,
          deposit_amount: Number(inv.deposit_amount) || Math.round((Number(inv.amount) || 0) * 0.2),
          remaining_amount: Number(inv.remaining_amount) || Math.round((Number(inv.amount) || 0) * 0.8),
        })))
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
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
      .reduce((sum, q) => sum + q.estimated_cost, 0)
    const monthlyRevenue = quotes
      .filter(q => q.status === 'completed' && new Date(q.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, q) => sum + q.estimated_cost, 0)
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
      avgProjectProgress
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/admin'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Admin Dashboard</h2>
          <p className="text-muted-foreground">Preparing your comprehensive business overview...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  const stats = getAdvancedStats()
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: null },
    { id: 'quotes', label: 'Quotes', icon: FileText, count: stats.pendingQuotes },
    { id: 'projects', label: 'Projects', icon: Briefcase, count: stats.activeProjects },
    { id: 'customers', label: 'Customers', icon: Users, count: stats.activeCustomers },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: stats.unreadMessages },
    { id: 'files', label: 'File Manager', icon: Folder, count: stats.totalFiles },
    { id: 'invoices', label: 'Invoices', icon: CreditCard, count: null },
    { id: 'analytics', label: 'Analytics', icon: PieChart, count: null },
    { id: 'settings', label: 'Settings', icon: Settings, count: null }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Command Center
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {admin.name}! • {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6 mr-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.activeProjects}</div>
                <div className="text-xs text-muted-foreground">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.pendingQuotes}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {(stats.unreadMessages + stats.urgentQuotes) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {stats.unreadMessages + stats.urgentQuotes}
                </span>
              )}
            </Button>
            
            {/* Quick Actions */}
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
            
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-xl overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center space-x-2 whitespace-nowrap relative"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <Badge 
                      variant={activeTab === tab.id ? "secondary" : "default"} 
                      className="ml-1 text-xs"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="card-hover gradient-primary text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Total Revenue</p>
                          <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                          <p className="text-white/60 text-xs mt-1">
                            +{formatCurrency(stats.monthlyRevenue)} this month
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover gradient-secondary text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Active Projects</p>
                          <p className="text-3xl font-bold">{stats.activeProjects}</p>
                          <p className="text-white/60 text-xs mt-1">
                            {Math.round(stats.avgProjectProgress)}% avg progress
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover gradient-accent text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Pending Quotes</p>
                          <p className="text-3xl font-bold">{stats.pendingQuotes}</p>
                          <p className="text-white/60 text-xs mt-1">
                            {stats.urgentQuotes} urgent
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover gradient-success text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Active Customers</p>
                          <p className="text-3xl font-bold">{stats.activeCustomers}</p>
                          <p className="text-white/60 text-xs mt-1">
                            of {stats.totalCustomers} total
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('quotes')}
                  >
                    <FileText className="w-6 h-6" />
                    <span>New Quote</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('messages')}
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span>Send Message</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('files')}
                  >
                    <Upload className="w-6 h-6" />
                    <span>Upload Files</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>View Reports</span>
                  </Button>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Recent Quotes
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('quotes')}>
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {quotes.slice(0, 5).map((quote) => (
                          <div key={quote.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{quote.customer_name || quote.name}</p>
                                {quote.priority === 'urgent' && (
                                  <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{quote.description.substring(0, 60)}...</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(quote.estimated_cost)} • {new Date(quote.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              quote.status === 'pending' ? 'secondary' :
                              quote.status === 'quoted' ? 'default' :
                              quote.status === 'accepted' ? 'default' : 'outline'
                            }>
                              {quote.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Recent Messages
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('messages')}>
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {messages.slice(0, 5).map((message) => (
                          <div key={message.id} className="flex items-start gap-3 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {message.customer_name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{message.customer_name}</p>
                                {!message.is_read && !message.is_from_admin && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                                {message.priority === 'high' && (
                                  <Badge variant="destructive" className="text-xs">High</Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">{message.subject}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(message.created_at).toLocaleDateString()} • 
                                {message.is_from_admin ? ' Sent by you' : ' From client'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Invoices
                      </span>
                      <Button variant="outline" size="sm" onClick={loadInvoices}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Track deposits and final payments. Badges indicate deposit vs full payment status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invoices.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No invoices found</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="text-left text-sm text-muted-foreground border-b">
                              <th className="py-3 px-2">Invoice</th>
                              <th className="py-3 px-2">Customer</th>
                              <th className="py-3 px-2 text-right">Total</th>
                              <th className="py-3 px-2 text-right">Deposit</th>
                              <th className="py-3 px-2 text-right">Remaining</th>
                              <th className="py-3 px-2">Badges</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2">Due</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map((inv) => {
                              const isDepositPaid = !!inv.deposit_paid
                              const isFullyPaid = String(inv.status) === 'paid'
                              return (
                                <tr key={inv.id} className="border-b hover:bg-muted/50">
                                  <td className="py-3 px-2 align-top">
                                    <div className="font-medium">{inv.id}</div>
                                    <div className="text-xs text-muted-foreground">{inv.project_name || '—'}</div>
                                  </td>
                                  <td className="py-3 px-2 align-top">
                                    <div className="font-medium">{inv.customer_name || inv.customer_id}</div>
                                  </td>
                                  <td className="py-3 px-2 text-right align-top">{formatCurrency(inv.amount)}</td>
                                  <td className="py-3 px-2 text-right align-top">
                                    <div>{formatCurrency(inv.deposit_amount)}</div>
                                    <div className="mt-1">
                                      <Badge variant={isDepositPaid ? 'secondary' : 'outline'} className={isDepositPaid ? 'bg-green-100 text-green-800' : ''}>
                                        {isDepositPaid ? 'Deposit Paid' : 'Deposit Due'}
                                      </Badge>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 text-right align-top">{formatCurrency(isFullyPaid ? 0 : inv.remaining_amount)}</td>
                                  <td className="py-3 px-2 align-top">
                                    <div className="flex flex-wrap gap-2">
                                      {isFullyPaid && (
                                        <Badge className="bg-green-100 text-green-800" variant="secondary">Fully Paid</Badge>
                                      )}
                                      {isDepositPaid && !isFullyPaid && (
                                        <Badge className="bg-blue-100 text-blue-800" variant="secondary">Deposit Paid</Badge>
                                      )}
                                      {!isDepositPaid && (
                                        <Badge variant="outline">Payment Pending</Badge>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 align-top">
                                    <Badge className={
                                      isFullyPaid ? 'bg-green-100 text-green-800' :
                                      inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    } variant="secondary">
                                      {isFullyPaid ? 'paid' : inv.status}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-2 align-top text-sm text-muted-foreground">
                                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Additional tabs will be implemented in the next parts */}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Notification Popup */}
      <NotificationPopup />
    </div>
  )
}
