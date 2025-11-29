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
  PieChart, Activity, Target, Award, Briefcase, Globe, Phone, MapPin
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { notifyQuoteStatusChange, notifyPaymentDue, notifyNewMessage } from '@/lib/notification-integration'

// Enhanced interfaces for admin system
interface AdminQuote {
  id: string
  quote_id: string
  customer_id: string
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
  final_quote?: {
    cost: number
    timeline: string
    terms: string
    breakdown: Array<{ item: string; cost: number }>
  }
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
}

interface AdminMessage {
  id: string
  customer_id: string
  customer_name: string
  subject: string
  message: string
  is_from_admin: boolean
  created_at: string
  is_read: boolean
  attachments?: string[]
}

interface AdminService {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  features: string[]
  is_active: boolean
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)
  
  // Data states
  const [quotes, setQuotes] = useState<AdminQuote[]>([])
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [services, setServices] = useState<AdminService[]>([])
  const [notifications, setNotifications] = useState([])
  
  // UI states
  const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  
  // Form states
  const [quoteForm, setQuoteForm] = useState({
    cost: '',
    timeline: '',
    terms: '',
    notes: '',
    breakdown: [{ item: '', cost: 0 }]
  })
  const [messageForm, setMessageForm] = useState({
    customer_id: '',
    subject: '',
    message: '',
    attachments: []
  })
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    base_price: 0,
    category: '',
    features: [''],
    is_active: true
  })

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
        
        // Load all admin data
        await Promise.all([
          loadQuotes(),
          loadCustomers(),
          loadMessages(),
          loadServices()
        ])
      } catch (error) {
        console.error('Error loading admin data:', error)
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

  const loadServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  // Quote management functions
  const handleQuoteStatusChange = async (quoteId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await loadQuotes()
        
        // Send notification to client
        const quote = quotes.find(q => q.id === quoteId)
        if (quote) {
          await notifyQuoteStatusChange(quote.customer_id, quoteId, newStatus, quote.description)
        }
      }
    } catch (error) {
      console.error('Error updating quote status:', error)
    }
  }

  const handleQuoteToInvoice = async (quote: AdminQuote) => {
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: quote.customer_id,
          quote_id: quote.id,
          amount: quote.final_quote?.cost || quote.estimated_cost,
          description: quote.description,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update quote status to accepted
        await handleQuoteStatusChange(quote.id, 'accepted')
        
        // Send notification
        await notifyPaymentDue(
          quote.customer_id, 
          quote.final_quote?.cost || quote.estimated_cost,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          result.invoice.id
        )
        
        alert('Invoice created and sent to client!')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice')
    }
  }

  // Message functions
  const handleSendMessage = async () => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageForm,
          is_from_admin: true
        })
      })

      if (response.ok) {
        await loadMessages()
        
        // Send notification to client
        await notifyNewMessage(messageForm.customer_id)
        
        setMessageForm({ customer_id: '', subject: '', message: '', attachments: [] })
        setIsMessageModalOpen(false)
        alert('Message sent successfully!')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    }
  }

  // Service management functions
  const handleSaveService = async () => {
    try {
      const method = serviceForm.name ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm)
      })

      if (response.ok) {
        await loadServices()
        setServiceForm({
          name: '',
          description: '',
          base_price: 0,
          category: '',
          features: [''],
          is_active: true
        })
        setIsServiceModalOpen(false)
        alert('Service saved successfully!')
      }
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Failed to save service')
    }
  }

  // Statistics calculations
  const getStats = () => {
    const totalQuotes = quotes.length
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length
    const activeProjects = quotes.filter(q => ['accepted', 'in_progress'].includes(q.status)).length
    const totalRevenue = quotes
      .filter(q => q.status === 'completed')
      .reduce((sum, q) => sum + (q.final_quote?.cost || q.estimated_cost), 0)
    const totalCustomers = customers.length
    const unreadMessages = messages.filter(m => !m.is_read && !m.is_from_admin).length

    return {
      totalQuotes,
      pendingQuotes,
      activeProjects,
      totalRevenue,
      totalCustomers,
      unreadMessages
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/admin'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  const stats = getStats()
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'files', label: 'Files', icon: Folder },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {admin.name}! Manage your freelance business
            </p>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {stats.unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              )}
            </Button>
            
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'messages' && stats.unreadMessages > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {stats.unreadMessages}
                    </Badge>
                  )}
                  {tab.id === 'quotes' && stats.pendingQuotes > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {stats.pendingQuotes}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

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
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                          <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
                        </div>
                        <Briefcase className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Quotes</p>
                          <p className="text-2xl font-bold text-orange-600">{stats.pendingQuotes}</p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                          <p className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recent Quotes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {quotes.slice(0, 5).map((quote) => (
                          <div key={quote.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{quote.name}</p>
                              <p className="text-sm text-muted-foreground">{quote.description.substring(0, 50)}...</p>
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
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Recent Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {messages.slice(0, 5).map((message) => (
                          <div key={message.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{message.customer_name}</p>
                                {!message.is_read && !message.is_from_admin && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{message.subject}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(message.created_at).toLocaleDateString()}
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

            {/* Additional tabs will be implemented in the next parts */}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
