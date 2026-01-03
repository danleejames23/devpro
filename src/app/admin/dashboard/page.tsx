'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import FuturisticSidebar from '@/components/admin/futuristic-sidebar'
import FuturisticStats from '@/components/admin/futuristic-stats'
import AdminChatWidget from '@/components/admin/chat-widget'
import CustomQuotesTab from '@/components/admin/custom-quotes-tab'
import { useNotificationPopup } from '@/components/notification-popup'
import { formatCurrency } from '@/lib/utils'
import ConfirmDialog from '@/components/confirm-dialog'
import { 
  Edit, Send, Eye, X, Save, Plus, Trash2, Download, Share2, 
  MessageSquare, FileText, Calendar, DollarSign, Clock, CheckCircle, AlertCircle,
  Upload, Folder, Search, Filter, RefreshCw, Star, Tag, Archive, ExternalLink,
  Users, Award, TrendingUp, Activity, Target, Globe, Phone, Mail, Copy, Link, Code
} from 'lucide-react'

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
  preferred_contact?: string
  job_title?: string
  industry?: string
  company_size?: string
  business_type?: string
  vat_number?: string
  country?: string
  city?: string
  postal_code?: string
  address?: string
  website?: string
  linkedin?: string
  twitter?: string
  bio?: string
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
  selected_package?: any
  features?: any[]
  complexity?: string
  rush_delivery?: string
  folder_number?: string
  github_url?: string
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
  const [payments, setPayments] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  const [isInvoiceDeleteModalOpen, setIsInvoiceDeleteModalOpen] = useState(false)
  const [deletingInvoice, setDeletingInvoice] = useState<any | null>(null)
  
  // UI states for modals and forms
  const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null)
  const [isEditingQuote, setIsEditingQuote] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isFileShareModalOpen, setIsFileShareModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null)
  const [reviewingQuote, setReviewingQuote] = useState<AdminQuote | null>(null)
  const [deletingQuote, setDeletingQuote] = useState<AdminQuote | null>(null)
  const [invoicingQuote, setInvoicingQuote] = useState<AdminQuote | null>(null)
  
  // Quote management states
  const [isQuoteViewModalOpen, setIsQuoteViewModalOpen] = useState(false)
  const [isQuoteEditModalOpen, setIsQuoteEditModalOpen] = useState(false)
  const [isQuoteDeleteModalOpen, setIsQuoteDeleteModalOpen] = useState(false)
  const [isQuoteCancelModalOpen, setIsQuoteCancelModalOpen] = useState(false)
  const [isQuoteApproveModalOpen, setIsQuoteApproveModalOpen] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  
  // Inquiry management states
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null)
  const [isInquiryViewModalOpen, setIsInquiryViewModalOpen] = useState(false)
  const [isInquiryDeleteModalOpen, setIsInquiryDeleteModalOpen] = useState(false)
  const [deletingInquiry, setDeletingInquiry] = useState<any | null>(null)
  
  // Client management states
  const [isClientDeleteModalOpen, setIsClientDeleteModalOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<AdminCustomer | null>(null)
  
  // Project management states
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null)
  const [isProjectViewModalOpen, setIsProjectViewModalOpen] = useState(false)
  const [isProjectEditModalOpen, setIsProjectEditModalOpen] = useState(false)
  const [isProjectDeleteModalOpen, setIsProjectDeleteModalOpen] = useState(false)
  const [deletingProject, setDeletingProject] = useState<AdminProject | null>(null)
  const [isGithubUrlModalOpen, setIsGithubUrlModalOpen] = useState(false)
  const [githubUrlProject, setGithubUrlProject] = useState<AdminProject | null>(null)
  const [githubUrlForm, setGithubUrlForm] = useState({ url: '' })
  
  // Chat system states
  const [selectedChatCustomer, setSelectedChatCustomer] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<AdminMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [groupedMessages, setGroupedMessages] = useState<{[key: string]: AdminMessage[]}>({})
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  // Client view modal states
  const [isClientViewModalOpen, setIsClientViewModalOpen] = useState(false)
  const [viewingClient, setViewingClient] = useState<AdminCustomer | null>(null)
  
  // Form states
  const [quoteForm, setQuoteForm] = useState({
    cost: 0,
    timeline: 0,
    additionalItems: [''],
    terms: 'Standard terms and conditions apply.',
    depositPercentage: 20,
    adminNotes: ''
  })
  
  const [reviewForm, setReviewForm] = useState({
    status: 'under_review' as const,
    adminNotes: '',
    estimatedCost: 0,
    estimatedTimeline: ''
  })
  
  const [messageForm, setMessageForm] = useState({
    customerId: '',
    subject: '',
    message: '',
    priority: 'medium' as const
  })
  
  const [invoiceForm, setInvoiceForm] = useState({
    amount: 0,
    description: '',
    dueDate: '',
    terms: '',
    items: [{ description: '', quantity: 1, rate: 0 }]
  })
  
  const [projectForm, setProjectForm] = useState({
    name: '',
    client: '',
    description: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'on_hold',
    progress: 0,
    budget: 0,
    start_date: '',
    end_date: ''
  })
  
  const [quoteEditForm, setQuoteEditForm] = useState({
    name: '',
    email: '',
    company: '',
    description: '',
    estimated_cost: 0,
    estimated_timeline: '',
    status: 'pending' as 'pending' | 'under_review' | 'quoted' | 'approved' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  })
  
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
          loadInquiries(),
          loadProjects(),
          loadPayments(),
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

  // Update chat messages when grouped messages change
  useEffect(() => {
    if (selectedChatCustomer && groupedMessages[selectedChatCustomer]) {
      setChatMessages(groupedMessages[selectedChatCustomer])
    }
  }, [groupedMessages, selectedChatCustomer])

  const loadQuotes = async () => {
    try {
      console.log('🔍 Loading quotes from admin dashboard...')
      const response = await fetch('/api/admin/quotes')
      console.log('📡 Quotes API response status:', response.status)
      
      const data = await response.json()
      console.log('📋 Quotes API response data:', data)
      
      if (data.success) {
        console.log('✅ Setting quotes:', data.quotes?.length || 0, 'quotes')
        setQuotes(data.quotes || [])
      } else {
        console.error('❌ Quotes API returned error:', data.error)
        setQuotes([])
      }
    } catch (error) {
      console.error('❌ Error loading quotes:', error)
      setQuotes([])
    }
  }

  const handleDeleteProject = (project: AdminProject) => {
    setDeletingProject(project)
    setIsProjectDeleteModalOpen(true)
  }

  const handleSetGithubUrl = (project: AdminProject) => {
    console.log('🔗 Opening GitHub URL modal for project:', project)
    console.log('🌐 Current GitHub URL:', project.github_url)
    setGithubUrlProject(project)
    setGithubUrlForm({ url: project.github_url || '' })
    setIsGithubUrlModalOpen(true)
  }

  const handleSaveGithubUrl = async () => {
    if (!githubUrlProject) return

    try {
      showLoading('Saving', 'Updating GitHub URL...')
      
      const requestBody = {
        ...githubUrlProject,
        github_url: githubUrlForm.url
      }
      
      console.log('🔗 Saving GitHub URL for project:', githubUrlProject.id)
      console.log('📝 Request body:', requestBody)
      console.log('🌐 GitHub URL:', githubUrlForm.url)
      
      const response = await fetch(`/api/admin/projects/${githubUrlProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('📡 Response status:', response.status)
      const responseData = await response.json()
      console.log('📊 Response data:', responseData)

      if (response.ok) {
        // Close modal first, then show success to avoid overlay overlap
        setIsGithubUrlModalOpen(false)
        setGithubUrlProject(null)
        setGithubUrlForm({ url: '' })
        await loadProjects()
        // Ensure loading overlay is gone before success popup
        hideNotification()
        setTimeout(() => {
          showSuccess('Success', 'GitHub URL updated successfully!')
        }, 100)
      } else {
        console.error('❌ API Error:', responseData)
        throw new Error(`Failed to update GitHub URL: ${responseData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Save GitHub URL error:', error)
      showError('Error', error instanceof Error ? error.message : 'Failed to update GitHub URL')
    } finally {
      hideNotification()
    }
  }

  const confirmDeleteProject = async () => {
    if (!deletingProject) return
    
    // Close the confirmation dialog first
    setIsProjectDeleteModalOpen(false)
    const projectToDelete = deletingProject
    setDeletingProject(null)
    
    try {
      // Small delay to ensure modal closes before showing loading
      setTimeout(() => {
        showLoading('Deleting', 'Deleting project...')
      }, 100)
      
      const response = await fetch(`/api/admin/projects/${projectToDelete.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        showSuccess('Deleted', 'Project deleted successfully!')
        await loadProjects()
      } else {
        showError('Error', 'Failed to delete project')
      }
    } catch (error) {
      showError('Error', 'Failed to delete project')
    } finally {
      hideNotification()
    }
  }

  const handleDeleteInvoice = (invoice: any) => {
    setDeletingInvoice(invoice)
    setIsInvoiceDeleteModalOpen(true)
  }

  const confirmDeleteInvoice = async () => {
    if (!deletingInvoice) return
    
    // Close the confirmation dialog first
    setIsInvoiceDeleteModalOpen(false)
    const invoiceToDelete = deletingInvoice
    setDeletingInvoice(null)
    
    try {
      // Small delay to ensure modal closes before showing loading
      setTimeout(() => {
        showLoading('Deleting', 'Deleting invoice...')
      }, 100)
      
      const response = await fetch(`/api/admin/invoices/${invoiceToDelete.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        showSuccess('Deleted', 'Invoice deleted successfully!')
        await loadInvoices()
      } else {
        showError('Error', 'Failed to delete invoice')
      }
    } catch (error) {
      showError('Error', 'Failed to delete invoice')
    } finally {
      hideNotification()
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

  const loadInquiries = async () => {
    try {
      const response = await fetch('/api/admin/inquiries')
      const data = await response.json()
      if (data.success) {
        setInquiries(data.inquiries || [])
        console.log('✅ Inquiries loaded:', data.inquiries?.length || 0)
      } else {
        console.error('❌ Failed to load inquiries:', data.error)
      }
    } catch (error) {
      console.error('❌ Error loading inquiries:', error)
    }
  }

  const markInquiryAsRead = async (inquiryId: string) => {
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: inquiryId,
          markAsRead: true
        }),
      })

      const result = await response.json()

      if (result.success) {
        await loadInquiries() // Refresh the list to update counters
      }
    } catch (error) {
      console.error('❌ Error marking inquiry as read:', error)
    }
  }

  const markInquiryAsContacted = async (inquiryId: string) => {
    try {
      showLoading('Updating Inquiry', 'Marking as contacted...')
      
      const response = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: inquiryId,
          status: 'contacted'
        }),
      })

      const result = await response.json()

      if (result.success) {
        hideNotification()
        showSuccess('Success', 'Inquiry marked as contacted!')
        await loadInquiries() // Refresh the list
      } else {
        hideNotification()
        showError('Error', result.error || 'Failed to update inquiry')
      }
    } catch (error) {
      console.error('❌ Error updating inquiry:', error)
      hideNotification()
      showError('Error', 'Failed to update inquiry')
    }
  }

  const deleteInquiry = async (inquiryId: string) => {
    try {
      showLoading('Deleting Inquiry', 'Removing inquiry...')
      
      const response = await fetch(`/api/admin/inquiries?id=${inquiryId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        hideNotification()
        showSuccess('Success', 'Inquiry deleted successfully!')
        await loadInquiries() // Refresh the list
        setIsInquiryDeleteModalOpen(false)
        setDeletingInquiry(null)
      } else {
        hideNotification()
        showError('Error', result.error || 'Failed to delete inquiry')
      }
    } catch (error) {
      console.error('❌ Error deleting inquiry:', error)
      hideNotification()
      showError('Error', 'Failed to delete inquiry')
    }
  }

  const deleteClient = async (clientId: string) => {
    try {
      showLoading('Deleting Client', 'Removing client...')
      
      const response = await fetch(`/api/admin/customers?id=${clientId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        hideNotification()
        showSuccess('Success', 'Client deleted successfully!')
        await loadCustomers() // Refresh the list
        setIsClientDeleteModalOpen(false)
        setDeletingClient(null)
      } else {
        hideNotification()
        showError('Error', result.error || 'Failed to delete client')
      }
    } catch (error) {
      console.error('❌ Error deleting client:', error)
      hideNotification()
      showError('Error', 'Failed to delete client')
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages')
      const data = await response.json()
      if (data.success) {
        const messagesData = data.messages || []
        setMessages(messagesData)
        
        // Group messages by customer for chat interface
        const grouped = messagesData.reduce((acc: {[key: string]: AdminMessage[]}, message: AdminMessage) => {
          const customerId = message.customer_id
          if (!acc[customerId]) {
            acc[customerId] = []
          }
          acc[customerId].push(message)
          return acc
        }, {})
        
        // Sort messages within each group by date
        Object.keys(grouped).forEach(customerId => {
          grouped[customerId].sort((a: AdminMessage, b: AdminMessage) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        })
        
        setGroupedMessages(grouped)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadProjects = async () => {
    try {
      console.log('🔍 Loading projects...')
      
      // Ensure required columns exist
      try {
        await fetch('/api/admin/add-github-url-column', { method: 'POST' })
        await fetch('/api/admin/add-paid-date-column', { method: 'POST' })
      } catch (columnError) {
        console.warn('⚠️ Could not ensure database columns exist:', columnError)
      }
      
      const response = await fetch('/api/admin/projects')
      console.log('📡 Projects API response status:', response.status)
      
      const data = await response.json()
      console.log('📊 Projects API response:', data)
      
      if (data.success) {
        console.log('✅ Setting projects:', data.projects?.length || 0, 'projects')
        setProjects(data.projects || [])
      } else {
        console.error('❌ Projects API returned error:', data.error)
        setProjects([])
      }
    } catch (error) {
      console.error('❌ Error loading projects:', error)
      setProjects([])
    }
  }

  const loadPayments = async () => {
    try {
      // Derive payments from invoices to ensure the tab shows data even without a payments API
      const resp = await fetch('/api/admin/invoices')
      const json = await resp.json()
      if (json.success) {
        const invs: any[] = json.invoices || []
        const derived: any[] = []
        invs.forEach((inv: any) => {
          const amount = parseAmount(inv.amount)
          const depositAmt = parseAmount(inv.deposit_amount ?? (amount ? amount * 0.2 : 0))
          const remainingAmt = parseAmount(inv.remaining_amount ?? (amount ? amount * 0.8 : 0))
          if (inv.deposit_paid) {
            derived.push({
              id: `${inv.id}-dep`,
              customer_name: inv.customer_name,
              invoice_id: inv.id,
              amount: depositAmt,
              payment_type: 'deposit',
              payment_method: 'manual',
              status: 'completed',
              created_at: inv.updated_at || inv.issue_date || inv.created_at || new Date().toISOString(),
            })
          }
          if (String(inv.status) === 'paid') {
            derived.push({
              id: `${inv.id}-final`,
              customer_name: inv.customer_name,
              invoice_id: inv.id,
              amount: remainingAmt,
              payment_type: 'final',
              payment_method: 'manual',
              status: 'completed',
              created_at: inv.paid_date || inv.issue_date || inv.created_at || new Date().toISOString(),
            })
          }
        })
        setPayments(derived)
      }
    } catch (error) {
      console.error('Error loading payments:', error)
      setPayments([])
    }
  }

  const loadInvoices = async () => {
    try {
      console.log('🔍 Loading invoices...')
      const response = await fetch('/api/admin/invoices')
      const data = await response.json()
      console.log('📊 Invoices API response:', data)
      if (data.success) {
        console.log('✅ Setting invoices:', data.invoices?.length || 0)
        setInvoices(data.invoices || [])
      } else {
        console.error('❌ Invoices API error:', data.error)
      }
    } catch (error) {
      console.error('❌ Error loading invoices:', error)
    }
  }

  // Admin invoice actions
  const handleViewInvoice = (invoice: any) => {
    const key = invoice?.quote_id || invoice?.quoteId || invoice?.id
    if (!key) return
    window.open(`/client/invoice/${key}?admin=1`, '_blank')
  }

  const handlePdfInvoice = (invoice: any) => {
    const key = invoice?.quote_id || invoice?.quoteId || invoice?.id
    if (!key) return
    window.open(`/client/invoice/${key}?admin=1&print=1`, '_blank')
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

  const parseAmount = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '')
      const parsed = Number.parseFloat(cleaned)
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }

  // Enhanced statistics
  const getAdvancedStats = () => {
    const totalQuotes = quotes.length
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length
    const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'pending').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const totalRevenue = quotes
      .filter(q => q.status === 'completed')
      .reduce((sum, q) => sum + (q.estimated_cost || q.estimatedCost || 0), 0)
    const monthlyRevenue = quotes
      .filter(q => q.status === 'completed' && new Date(q.updated_at || q.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, q) => sum + (q.estimated_cost || q.estimatedCost || 0), 0)
    
    // Calculate revenue from invoices (account for deposit payments)
    const totalPaidRevenue = invoices.reduce((sum, inv) => {
      const amount = parseAmount((inv as any).amount)
      const depositAmount = parseAmount((inv as any).deposit_amount ?? (inv as any).depositAmount)
      const remainingAmount = parseAmount((inv as any).remaining_amount ?? (inv as any).remainingAmount)
      const status = (inv as any).status ?? 'pending'
      const depositPaid = !!((inv as any).deposit_paid ?? (inv as any).depositPaid)
      if (status === 'paid') return sum + amount
      if (depositPaid) return sum + depositAmount
      return sum
    }, 0)

    const owedRevenue = invoices.reduce((sum, inv) => {
      const amount = parseAmount((inv as any).amount)
      const depositAmount = parseAmount((inv as any).deposit_amount ?? (inv as any).depositAmount)
      const remainingAmount = parseAmount((inv as any).remaining_amount ?? (inv as any).remainingAmount)
      const status = (inv as any).status ?? 'pending'
      const depositPaid = !!((inv as any).deposit_paid ?? (inv as any).depositPaid)
      if (status === 'paid') return sum
      if (depositPaid) return sum + (remainingAmount > 0 ? remainingAmount : Math.max(amount - depositAmount, 0))
      return sum + amount
    }, 0)
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'active').length
    const unreadMessages = messages.filter(m => !m.is_read && !m.is_from_admin).length
    const unreadInquiries = inquiries.filter(i => !i.read_at).length
    const urgentQuotes = quotes.filter(q => q.priority === 'urgent' && q.status === 'pending').length
    const avgProjectProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0
    const totalFiles = typeof (analytics as any)?.totalFiles === 'number' ? (analytics as any).totalFiles : 0
    const sharedFiles = typeof (analytics as any)?.sharedFiles === 'number' ? (analytics as any).sharedFiles : 0

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
      unreadInquiries,
      urgentQuotes,
      avgProjectProgress,
      totalPaidRevenue,
      owedRevenue,
      totalFiles,
      sharedFiles,
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/admin'
  }

  // Handler functions for various actions
  const handleQuoteAction = async (quoteId: string, action: string) => {
    try {
      showLoading('Processing', `${action} quote...`)
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        showSuccess('Success', `Quote ${action} successfully!`)
        loadQuotes()
      } else {
        showError('Error', `Failed to ${action} quote`)
      }
    } catch (error) {
      showError('Error', `Failed to ${action} quote`)
    } finally {
      hideNotification()
    }
  }

  const handleSendMessage = async () => {
    try {
      showLoading('Sending', 'Sending message...')
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: messageForm.customerId,
          subject: messageForm.subject,
          message: messageForm.message,
          is_from_admin: true,
          priority: messageForm.priority
        })
      })
      
      if (response.ok) {
        showSuccess('Success', 'Message sent successfully!')
        setIsMessageModalOpen(false)
        setMessageForm({ customerId: '', subject: '', message: '', priority: 'medium' })
        await loadMessages()
        
        // If this creates a new conversation, open it
        if (messageForm.customerId) {
          setActiveTab('messages')
          setTimeout(() => openChat(messageForm.customerId), 500)
        }
      } else {
        showError('Error', 'Failed to send message')
      }
    } catch (error) {
      showError('Error', 'Failed to send message')
    } finally {
      hideNotification()
    }
  }

  const handleMarkMessageRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_ids: [messageId], is_read: true })
      })
      
      if (response.ok) {
        loadMessages()
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  const openChat = (customerId: string) => {
    setSelectedChatCustomer(customerId)
    setChatMessages(groupedMessages[customerId] || [])
    setIsChatOpen(true)
    
    // Mark all messages from this customer as read
    const customerMessages = groupedMessages[customerId] || []
    const unreadMessageIds = customerMessages
      .filter(msg => !msg.is_read && !msg.is_from_admin)
      .map(msg => msg.id)
    
    if (unreadMessageIds.length > 0) {
      handleMarkMultipleMessagesRead(unreadMessageIds)
    }
  }

  const handleMarkMultipleMessagesRead = async (messageIds: string[]) => {
    try {
      const response = await fetch(`/api/admin/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_ids: messageIds, is_read: true })
      })
      
      if (response.ok) {
        loadMessages()
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !selectedChatCustomer) return
    
    const messageToSend = newMessage.trim()
    const customerId = selectedChatCustomer
    
    try {
      showLoading('Sending', 'Sending message...')
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          subject: 'Chat Message',
          message: messageToSend,
          is_from_admin: true
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Immediately add the new message to chat display
        const newMsg: AdminMessage = {
          id: data.message?.id || `temp-${Date.now()}`,
          customer_id: customerId,
          customer_name: chatMessages[0]?.customer_name || 'Customer',
          subject: 'Chat Message',
          message: messageToSend,
          is_from_admin: true,
          created_at: new Date().toISOString(),
          is_read: true,
          priority: 'medium' as const,
          tags: []
        }
        
        setChatMessages(prev => [...prev, newMsg])
        setNewMessage('')
        
        // Also update grouped messages
        setGroupedMessages(prev => ({
          ...prev,
          [customerId]: [...(prev[customerId] || []), newMsg]
        }))
        
        hideNotification()
        showSuccess('Success', 'Message sent successfully!')
        
        // Refresh from server in background
        loadMessages()
      } else {
        hideNotification()
        showError('Error', data.error || 'Failed to send message')
      }
    } catch (error) {
      hideNotification()
      showError('Error', 'Failed to send message')
    }
  }

  // Project management handlers
  const handleViewProject = (project: AdminProject) => {
    setSelectedProject(project)
    setIsProjectViewModalOpen(true)
  }

  const handleEditProject = (project: AdminProject) => {
    setSelectedProject(project)
    setProjectForm({
      name: project.name,
      client: project.client,
      description: project.description || '',
      status: project.status,
      progress: project.progress,
      budget: project.budget,
      start_date: project.start_date,
      end_date: project.end_date
    })
    setIsProjectEditModalOpen(true)
  }

  const handleUpdateProject = async () => {
    if (!selectedProject) return

    try {
      // Close the edit modal first to avoid overlay overlap with notifications
      const updatingId = selectedProject.id
      setIsProjectEditModalOpen(false)

      showLoading('Updating', 'Updating project...')
      const response = await fetch(`/api/admin/projects/${updatingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      })

      if (response.ok) {
        showSuccess('Success', 'Project updated successfully!')
        setSelectedProject(null)
        await loadProjects()
      } else {
        showError('Error', 'Failed to update project')
      }
    } catch (error) {
      showError('Error', 'Failed to update project')
    } finally {
      hideNotification()
    }
  }

  // Quote management handlers
  const handleViewQuote = (quote: AdminQuote) => {
    setSelectedQuote(quote)
    setIsQuoteViewModalOpen(true)
  }

  const handleEditQuote = (quote: AdminQuote) => {
    setSelectedQuote(quote)
    setQuoteEditForm({
      name: quote.name || quote.customer_name,
      email: quote.email,
      company: quote.company || '',
      description: quote.description,
      estimated_cost: quote.estimated_cost,
      estimated_timeline: quote.estimated_timeline,
      status: quote.status
    })
    setIsQuoteEditModalOpen(true)
  }

  const handleDeleteQuote = (quote: AdminQuote) => {
    setSelectedQuote(quote)
    setIsQuoteDeleteModalOpen(true)
  }

  const handleCancelQuote = (quote: AdminQuote) => {
    setSelectedQuote(quote)
    setIsQuoteCancelModalOpen(true)
  }

  const handleApproveQuote = (quote: AdminQuote) => {
    setSelectedQuote(quote)
    setIsQuoteApproveModalOpen(true)
  }

  const handleReviewQuote = async (quote: AdminQuote) => {
    try {
      showLoading('Review', 'Moving quote to under review...')
      const response = await fetch('/api/admin/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, status: 'under_review' })
      })
      if (response.ok) {
        showSuccess('Under Review', 'Quote is now under review')
        await loadQuotes()
      } else {
        showError('Error', 'Failed to start review')
      }
    } catch (e) {
      showError('Error', 'Failed to start review')
    } finally {
      hideNotification()
    }
  }

  const confirmUpdateQuote = async () => {
    if (!selectedQuote) return

    // Close the edit modal first to avoid overlay overlap with notifications
    setIsQuoteEditModalOpen(false)
    const updatingId = selectedQuote.id

    try {
      showLoading('Updating', 'Updating quote...')
      const response = await fetch('/api/admin/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatingId,
          ...quoteEditForm
        })
      })

      if (response.ok) {
        showSuccess('Success', 'Quote updated successfully!')
        setIsQuoteEditModalOpen(false)
        setSelectedQuote(null)
        await loadQuotes()
      } else {
        showError('Error', 'Failed to update quote')
      }
    } catch (error) {
      showError('Error', 'Failed to update quote')
    } finally {
      hideNotification()
    }
  }

  const confirmDeleteQuote = async () => {
    if (!selectedQuote) return

    setIsQuoteDeleteModalOpen(false)
    const deletingId = selectedQuote.id

    try {
      showLoading('Deleting', 'Deleting quote...')
      const response = await fetch(`/api/admin/quotes?id=${deletingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showSuccess('Success', 'Quote deleted successfully!')
        setIsQuoteDeleteModalOpen(false)
        setSelectedQuote(null)
        await loadQuotes()
      } else {
        showError('Error', 'Failed to delete quote')
      }
    } catch (error) {
      showError('Error', 'Failed to delete quote')
    } finally {
      hideNotification()
    }
  }

  const confirmCancelQuote = async () => {
    if (!selectedQuote) return

    setIsQuoteCancelModalOpen(false)
    const cancellingId = selectedQuote.id

    try {
      showLoading('Cancelling', 'Cancelling quote...')
      const response = await fetch('/api/admin/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cancellingId,
          status: 'cancelled'
        })
      })

      if (response.ok) {
        showSuccess('Success', 'Quote cancelled successfully!')
        setIsQuoteCancelModalOpen(false)
        setSelectedQuote(null)
        await loadQuotes()
      } else {
        showError('Error', 'Failed to cancel quote')
      }
    } catch (error) {
      showError('Error', 'Failed to cancel quote')
    } finally {
      hideNotification()
    }
  }

  const confirmApproveQuote = async () => {
    if (isApproving) return
    setIsApproving(true)
    if (!selectedQuote) return

    setIsQuoteApproveModalOpen(false)
    const approving = { ...selectedQuote }

    try {
      showLoading('Approving', 'Approving quote and creating invoice & project...')
      
      // 1. Update quote status to approved
      const quoteResponse = await fetch('/api/admin/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: approving.id,
          status: 'approved'
        })
      })

      if (!quoteResponse.ok) {
        throw new Error('Failed to approve quote')
      }

      // 2. Create invoice with deposit information
      const totalAmount = approving.estimated_cost
      const depositAmount = totalAmount * 0.2
      const remainingAmount = totalAmount - depositAmount
      
      const invoiceResponse = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: approving.customer_id,
          quote_id: approving.id,
          amount: totalAmount,
          description: `Invoice for: ${approving.description}`,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          line_items: [
            {
              description: approving.description,
              quantity: 1,
              rate: totalAmount,
              total: totalAmount,
              package_name: approving.selected_package?.name || approving.selected_package?.title || 'Custom Package',
              features: approving.selectedFeatures || approving.services || approving.selected_package?.features || []
            },
            {
              description: "20% Deposit Required Before Work Starts",
              quantity: 1,
              rate: depositAmount,
              total: depositAmount
            }
          ],
          notes: `PAYMENT TERMS: 20% deposit (${formatCurrency(depositAmount)}) is required before work begins. Remaining balance (${formatCurrency(remainingAmount)}) due upon completion.`,
          deposit_amount: depositAmount,
          deposit_required: true
        })
      })

      if (!invoiceResponse.ok) {
        throw new Error('Failed to create invoice')
      }

      const invoiceData = await invoiceResponse.json()

      // 3. Create project
      const projectResponse = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (approving as any).project_name || `Project: ${approving.description.substring(0, 50)}...`,
          client: approving.name || approving.customer_name,
          customer_id: approving.customer_id,
          description: approving.description,
          status: 'pending',
          progress: 0,
          budget: approving.estimated_cost,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
          quote_id: approving.id,
          selected_package: approving.selected_package,
          features: approving.selectedFeatures || approving.services || approving.selected_package?.features || [],
          complexity: approving.complexity,
          rush_delivery: approving.rush_delivery
        })
      })

      if (!projectResponse.ok) {
        throw new Error('Failed to create project')
      }

      // 4. Send deposit notification to client
      try {
        await fetch('/api/admin/notify-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: approving.customer_id,
            invoice_id: invoiceData.invoice?.id,
            deposit_amount: formatCurrency(depositAmount),
            total_amount: formatCurrency(totalAmount)
          })
        })
      } catch (notificationError) {
        console.warn('Failed to send deposit notification:', notificationError)
        // Don't fail the whole process if notification fails
      }

      showSuccess('Success', 'Quote approved! Invoice and project created successfully! Client notified about 20% deposit requirement.')
      setIsQuoteApproveModalOpen(false)
      setSelectedQuote(null)
      
      // Reload all data
      await Promise.all([loadQuotes(), loadProjects(), loadInvoices()])
      
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to approve quote')
    } finally {
      hideNotification()
    }
  }

  const handleDatabaseSetup = async () => {
    try {
      showLoading('Setting up', 'Adding database columns for packages and deposits...')
      
      const response = await fetch('/api/admin/setup-all', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('Setup Complete', 'Database columns added successfully! Package and deposit features are now ready.')
        // Reload all data to reflect changes
        await Promise.all([loadQuotes(), loadProjects(), loadInvoices()])
      } else {
        showError('Setup Failed', data.error || 'Failed to setup database')
      }
    } catch (error) {
      showError('Setup Failed', error instanceof Error ? error.message : 'Failed to setup database')
    } finally {
      hideNotification()
    }
  }

  const handleCheckSetup = async () => {
    try {
      const response = await fetch('/api/debug/check-setup')
      const data = await response.json()
      
      console.log('🔍 Setup Check Results:', data)
      
      if (data.success) {
        const results = data.debug_results
        let message = 'Setup Status:\n'
        message += `Database: ${results.database_connection ? '✅' : '❌'}\n`
        message += `Projects columns: ${Object.values(results.columns_exist.projects || {}).every(Boolean) ? '✅' : '❌'}\n`
        message += `Invoice columns: ${Object.values(results.columns_exist.invoices || {}).every(Boolean) ? '✅' : '❌'}\n`
        message += `Quotes with packages: ${results.sample_data.quotes?.filter((q: any) => q.has_package).length || 0}\n`
        
        alert(message)
      }
    } catch (error) {
      console.error('Check failed:', error)
    }
  }

  const handleAddTestData = async () => {
    try {
      showLoading('Adding', 'Adding test data with packages and deposits...')
      
      const response = await fetch('/api/debug/add-test-data', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('Test Data Added', 'Sample quote with package and invoice with deposit created!')
        await Promise.all([loadQuotes(), loadProjects(), loadInvoices()])
      } else {
        showError('Failed', data.error || 'Failed to add test data')
      }
    } catch (error) {
      showError('Failed', error instanceof Error ? error.message : 'Failed to add test data')
    } finally {
      hideNotification()
    }
  }

  const stats = getAdvancedStats()

  const analyticsData = analytics || {}
  const analyticsSummary: { reportingPeriod: string; monthlyGrowth: number } = {
    reportingPeriod: analyticsData.reportingPeriod || 'Last 30 Days',
    monthlyGrowth: typeof analyticsData.monthlyGrowth === 'number' ? analyticsData.monthlyGrowth : 0,
  }

  // Fallback: infer top services from real invoice data if analytics API doesn't provide them
  const inferredTopServices = (() => {
    try {
      const map = new Map<string, { name: string; revenue: number; count: number }>()
      ;(invoices || []).forEach((inv: any) => {
        const amount = parseAmount(inv?.amount)
        const deposit = parseAmount((inv as any)?.deposit_amount ?? (amount ? amount * 0.2 : 0))
        const depositPaid = !!((inv as any)?.deposit_paid ?? (inv as any)?.depositPaid)
        const status = String((inv as any)?.status || '')
        const paidContribution = status === 'paid' ? amount : (depositPaid ? deposit : 0)

        let name = (inv as any)?.project_name || 'Custom'
        try {
          const raw = (inv as any)?.line_items ?? (inv as any)?.items
          const items = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : [])
          const main = items?.find((it: any) => it?.package_name || it?.service || it?.name) || items?.[0]
          if (main) {
            name = main?.package_name || main?.service || main?.name || name
          }
        } catch {}

        const key = String(name || 'Custom')
        if (!map.has(key)) {
          map.set(key, { name: key, revenue: 0, count: 0 })
        }
        const entry = map.get(key)!
        entry.count += 1
        entry.revenue += paidContribution
      })
      return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8)
    } catch {
      return [] as any[]
    }
  })()

  // Always use real app data for Service Performance
  const topServices = inferredTopServices
  const totalServiceRevenue = topServices.reduce((sum: number, service: any) => sum + parseAmount(service?.revenue), 0)

  const invoiceTotals = invoices.reduce(
    (acc, invoice) => {
      const amount = parseAmount(invoice?.amount)
      const deposit = parseAmount((invoice as any)?.deposit_amount ?? (invoice as any)?.depositAmount)
      const remaining = parseAmount((invoice as any)?.remaining_amount ?? (invoice as any)?.remainingAmount ?? (amount - deposit))
      const status = (invoice as any)?.status
      const depositPaid = !!((invoice as any)?.deposit_paid ?? (invoice as any)?.depositPaid)
      acc.invoiced += amount
      if (status === 'paid') {
        acc.paid += amount
      } else if (depositPaid) {
        acc.paid += deposit
        acc.outstanding += remaining
      } else {
        acc.outstanding += amount
      }
      acc.deposits += deposit
      return acc
    },
    { invoiced: 0, paid: 0, outstanding: 0, deposits: 0 }
  )

  const outstandingInvoices = invoices.filter((invoice) => (invoice as any)?.status !== 'paid')

  type SummaryCard = {
    key: string
    label: string
    value: string
    helper: string
    gradient: string
    icon: ReactNode
  }

  const summaryCards: SummaryCard[] = [
    {
      key: 'revenue',
      label: 'Owed Revenue',
      value: formatCurrency(invoiceTotals.outstanding),
      helper: 'Remaining unpaid (after deposits)',
      gradient: 'from-cyber-mint to-cosmic-blue',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      key: 'pendingQuotes',
      label: 'Pending Quotes',
      value: (stats.pendingQuotes || 0).toLocaleString(),
      helper: 'Awaiting follow-up',
      gradient: 'from-neon-purple to-cosmic-blue',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      key: 'activeProjects',
      label: 'Active Projects',
      value: (stats.activeProjects || 0).toLocaleString(),
      helper: 'In progress',
      gradient: 'from-cosmic-blue to-plasma-pink',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      key: 'clients',
      label: 'Active Clients',
      value: (stats.activeCustomers || 0).toLocaleString(),
      helper: `${stats.totalCustomers || 0} total clients`,
      gradient: 'from-plasma-pink to-neon-purple',
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: 'collected',
      label: 'Collected Revenue',
      value: formatCurrency(stats.totalPaidRevenue || 0),
      helper: 'Payments received to date',
      gradient: 'from-neon-purple to-cyber-mint',
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ]

  type QuotePipelineGroup = {
    key: string
    label: string
    count: number
    badgeClass: string
    barClass: string
  }

  const quoteStatusBreakdown: QuotePipelineGroup[] = [
    {
      key: 'pending',
      label: 'Pending Approval',
      count: quotes.filter((quote) => quote.status === 'pending').length,
      badgeClass: 'bg-neon-purple/20 text-neon-purple',
      barClass: 'bg-neon-purple',
    },
    {
      key: 'quoted',
      label: 'Quoted',
      count: quotes.filter((quote) => ['quoted', 'approved'].includes(quote.status)).length,
      badgeClass: 'bg-cosmic-blue/20 text-cosmic-blue',
      barClass: 'bg-cosmic-blue',
    },
    {
      key: 'accepted',
      label: 'Accepted',
      count: quotes.filter((quote) => ['accepted', 'in_progress'].includes(quote.status)).length,
      badgeClass: 'bg-cyber-mint/20 text-cyber-mint',
      barClass: 'bg-cyber-mint',
    },
    {
      key: 'completed',
      label: 'Completed',
      count: quotes.filter((quote) => quote.status === 'completed').length,
      badgeClass: 'bg-plasma-pink/20 text-plasma-pink',
      barClass: 'bg-plasma-pink',
    },
  ]

  const totalPipelineCount = quoteStatusBreakdown.reduce((sum, group) => sum + group.count, 0)

  // Build Recent Activity from real app data only
  const recentActivity = (() => {
    const activities: { type: string; message: string; time: string }[] = []

    // Quotes: submissions and status updates
    for (const q of quotes) {
      const when = new Date((q as any).updated_at || (q as any).updatedAt || (q as any).created_at || (q as any).createdAt || Date.now())
      activities.push({
        type: 'quote',
        message: `Quote ${(q as any).quote_id || (q as any).id} ${q.status === 'pending' ? 'submitted' : `updated to ${q.status}`}`,
        time: when.toISOString(),
      })
    }

    // Invoices: created and fully paid
    for (const inv of invoices) {
      const created = (inv as any).issue_date || (inv as any).created_at
      if (created) {
        activities.push({
          type: 'payment',
          message: `Invoice #${(inv as any).invoice_number ?? (inv as any).id} created for ${formatCurrency(parseAmount((inv as any).amount))}`,
          time: new Date(created as any).toISOString(),
        })
      }
      if ((inv as any).status === 'paid') {
        const paidAt = (inv as any).paid_date || (inv as any).updated_at || created
        activities.push({
          type: 'payment',
          message: `Invoice #${(inv as any).invoice_number ?? (inv as any).id} fully paid` ,
          time: new Date(paidAt as any).toISOString(),
        })
      }
    }

    // Projects: created
    for (const p of projects) {
      const created = (p as any).created_at
      if (created) {
        activities.push({
          type: 'project',
          message: `Project created: ${(p as any).name}`,
          time: new Date(created as any).toISOString(),
        })
      }
    }

    // Sort by time desc and take top 6
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    return activities.slice(0, 6)
  })()

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-slate-400">Preparing your workspace...</p>
        </div>
      </main>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <FuturisticSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        unreadMessages={stats.unreadMessages}
        pendingQuotes={stats.pendingQuotes}
        pendingCustomQuotes={stats.pendingCustomQuotes || 0}
        newInquiries={stats.unreadInquiries}
        admin={admin}
      />

      {/* Main Content Area */}
      <div className="lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {activeTab === 'overview' && `Welcome back, ${admin?.username || 'Admin'}!`}
                {activeTab === 'quotes' && 'Quote Management'}
                {activeTab === 'custom-quotes' && 'Custom Quote Requests'}
                {activeTab === 'projects' && 'Project Management'}
                {activeTab === 'customers' && 'Client Management'}
                {activeTab === 'inquiries' && 'Inquiries'}
                {activeTab === 'messages' && 'Messages'}
                {activeTab === 'invoices' && 'Invoices'}
                {activeTab === 'payments' && 'Payments'}
                {activeTab === 'analytics' && 'Analytics & Reports'}
              </h1>
              <p className="text-slate-400 mt-1 text-sm lg:text-base">
                {activeTab === 'overview' && 'Here\'s your business overview'}
                {activeTab === 'quotes' && 'Manage and respond to client quote requests'}
                {activeTab === 'custom-quotes' && 'Review and approve enterprise project requests'}
                {activeTab === 'projects' && 'Track and manage active projects'}
                {activeTab === 'customers' && 'View and manage your clients'}
                {activeTab === 'inquiries' && 'Handle incoming inquiries'}
                {activeTab === 'messages' && 'Communicate with your clients'}
                {activeTab === 'invoices' && 'Manage invoices and billing'}
                {activeTab === 'payments' && 'Track payment history'}
                {activeTab === 'analytics' && 'View business insights and reports'}
              </p>
            </motion.div>
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
                <div className="space-y-6">
                  <FuturisticStats stats={stats} />
                  
                  {/* Owed Revenue Breakdown */}
                  {stats.owedRevenue > 0 && (
                    <div className="glass-card p-6 rounded-2xl border border-plasma-pink/20">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-silver-glow font-accent">Outstanding Payments</h3>
                        <Badge className="bg-plasma-pink/20 text-plasma-pink">
                          {invoices.filter(inv => inv.status !== 'paid').length} Unpaid
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {invoices
                          .filter(inv => inv.status !== 'paid')
                          .slice(0, 5)
                          .map(invoice => {
                            const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))
                            const isOverdue = daysOverdue > 0
                            
                            return (
                              <Card key={invoice.id} className={`glass-card border ${isOverdue ? 'border-plasma-pink/40 bg-plasma-pink/5' : 'border-cosmic-blue/20'}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <h4 className="font-semibold text-silver-glow">Invoice #{invoice.invoice_number ?? invoice.id}</h4>
                                        <Badge className={`${
                                          invoice.status === 'overdue' ? 'bg-plasma-pink/20 text-plasma-pink' :
                                          invoice.status === 'pending' ? 'bg-neon-purple/20 text-neon-purple' :
                                          'bg-cosmic-blue/20 text-cosmic-blue'
                                        }`}>
                                          {invoice.status}
                                        </Badge>
                                        {isOverdue && (
                                          <Badge className="bg-plasma-pink/20 text-plasma-pink text-xs">
                                            {daysOverdue} days overdue
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-silver-glow/70 mt-1">{invoice.client_name}</p>
                                      {invoice.due_date && (
                                        <p className="text-xs text-silver-glow/60 mt-1">
                                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-silver-glow">{formatCurrency(invoice.amount)}</p>
                                      <Button size="sm" variant="outline" className="border-plasma-pink/30 mt-2">
                                        <Send className="w-3 h-3 mr-1" />
                                        Send Reminder
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        
                        {invoices.filter(inv => inv.status !== 'paid').length > 5 && (
                          <div className="text-center pt-2">
                            <Button variant="outline" className="border-cosmic-blue/30">
                              View All {invoices.filter(inv => inv.status !== 'paid').length} Outstanding Invoices
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quotes' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-neon-purple/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-silver-glow font-accent">Quote Management</h2>
                      <Button onClick={() => window.location.reload()} className="btn-neon">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                    
                    {/* Quotes Grid */}
                    <div className="grid gap-4">
                      {quotes.length === 0 ? (
                        <div className="text-center py-8 text-silver-glow/60">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No quotes found. Check console for details.</p>
                          <p className="text-xs mt-2">Loading state: {loading ? 'Loading...' : 'Complete'}</p>
                        </div>
                      ) : (
                        quotes.map((quote) => (
                          <Card key={quote.id} className="glass-card border border-neon-purple/20 hover:border-cyber-mint/40 transition-all">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {/* Quote Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-silver-glow">{quote.customer_name}</h3>
                                    <p className="text-sm text-silver-glow/70">{quote.email}</p>
                                    {quote.company && (
                                      <p className="text-xs text-silver-glow/60">{quote.company}</p>
                                    )}
                                    <Badge className={`mt-2 ${
                                      quote.status === 'pending' ? 'bg-neon-purple/20 text-neon-purple' :
                                      quote.status === 'approved' ? 'bg-cyber-mint/20 text-cyber-mint' :
                                      quote.status === 'cancelled' ? 'bg-plasma-pink/20 text-plasma-pink' :
                                      'bg-cosmic-blue/20 text-cosmic-blue'
                                    }`}>
                                      {quote.status === 'pending' ? 'Pending Approval' : quote.status}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-silver-glow">{formatCurrency(quote.estimated_cost)}</p>
                                    <p className="text-xs text-silver-glow/60">{quote.estimated_timeline}</p>
                                  </div>
                                </div>

                                {/* Quote Description */}
                                <div>
                                  <p className="text-sm text-silver-glow/80 line-clamp-2">{quote.description}</p>
                                </div>

                                {(quote.selected_package || (quote.selectedFeatures && quote.selectedFeatures.length > 0) || (quote.services && quote.services.length > 0) || quote.complexity || quote.rush_delivery) && (
                                  <div className="mt-2 space-y-2">
                                    <div className="text-xs text-silver-glow/80">
                                      {quote.selected_package && (
                                        <div><span className="font-semibold">Package:</span> {quote.selected_package.name || quote.selected_package.title || 'Custom'}</div>
                                      )}
                                      {quote.complexity && (
                                        <div><span className="font-semibold">Complexity:</span> {quote.complexity}</div>
                                      )}
                                      {quote.rush_delivery && (
                                        <div><span className="font-semibold">Delivery:</span> {quote.rush_delivery}</div>
                                      )}
                                    </div>
                                    {(quote.selected_package?.features?.length > 0 || (quote.selectedFeatures && quote.selectedFeatures.length > 0) || (quote.services && quote.services.length > 0)) && (
                                      <div className="flex flex-wrap gap-2">
                                        {(quote.selected_package?.features || quote.selectedFeatures || quote.services || []).slice(0, 6).map((feat: any, idx: number) => (
                                          <Badge key={idx} className="bg-space-gray/50 border border-neon-purple/20 text-silver-glow text-[10px]">{typeof feat === 'string' ? feat : feat?.name || feat?.title || 'Feature'}</Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                {quote.status === 'cancelled' ? (
                                  <div className="flex gap-2 pt-2">
                                    <Button 
                                      size="sm" 
                                      className="bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 hover:text-red-200"
                                      onClick={() => handleDeleteQuote(quote)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  quote.status === 'pending' ? null : (
                                    <div className="flex gap-2 pt-2">
                                      <Button 
                                        size="sm" 
                                        className="border-cyber-mint/30 flex-1"
                                        variant="outline"
                                        onClick={() => handleViewQuote(quote)}
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        className="border-neon-purple/30 flex-1"
                                        variant="outline"
                                        onClick={() => handleEditQuote(quote)}
                                      >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Edit
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        className="bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 hover:text-red-200"
                                        onClick={() => handleDeleteQuote(quote)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )
                                )}

                                {/* Status-specific Actions */}
                                {quote.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 hover:text-amber-200 flex-1"
                                      onClick={() => handleReviewQuote(quote)}
                                    >
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Review
                                    </Button>
                                  </div>
                                )}

                                {quote.status === 'under_review' && (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      className="bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 hover:text-red-200 flex-1"
                                      onClick={() => handleCancelQuote(quote)}
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancel
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 hover:text-emerald-200 flex-1"
                                      onClick={() => handleApproveQuote(quote)}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-cyber-mint/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-silver-glow font-accent">Project Management</h2>
                      <div className="flex gap-2">
                        <Button onClick={() => loadProjects()} className="btn-neon">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                        <Button className="btn-gradient">
                          <Plus className="w-4 h-4 mr-2" />
                          New Project
                        </Button>
                      </div>
                    </div>
                    
                    {/* Projects Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-silver-glow/60">
                          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No projects found. Loading data...</p>
                        </div>
                      ) : (
                        projects.map((project) => (
                          <Card key={project.id} className="glass-card border border-cyber-mint/20 hover:border-neon-purple/40 transition-all">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-silver-glow truncate">{project.name}</h3>
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${
                                      project.status === 'completed' ? 'bg-cyber-mint/20 text-cyber-mint' :
                                      project.status === 'in_progress' ? 'bg-neon-purple/20 text-neon-purple' :
                                      'bg-plasma-pink/20 text-plasma-pink'
                                    }`}>
                                      {project.status.replace('_', ' ')}
                                    </Badge>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                      project.github_url 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                      <Code className="w-3 h-3" />
                                      {project.github_url ? '✓' : '!'}
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-silver-glow/70">{project.client}</p>
                                
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-silver-glow/70 font-medium">Progress</span>
                                    <span className="text-silver-glow font-semibold">{Math.min(100, Math.max(0, project.progress || 0))}%</span>
                                  </div>
                                  <div className="w-full bg-space-gray/80 rounded-full h-3 border border-space-gray/40">
                                    <div 
                                      className="bg-gradient-to-r from-cyber-mint to-neon-purple h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                                      style={{ 
                                        width: `${Math.min(100, Math.max(0, project.progress || 0))}%`,
                                        boxShadow: project.progress > 0 ? '0 0 8px rgba(0, 224, 176, 0.3)' : 'none'
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                {/* Package and Features */}
                                {(project.selected_package || project.features || project.complexity) && (
                                  <div className="space-y-2">
                                    {project.selected_package && (
                                      <div className="text-xs text-silver-glow/80">
                                        <span className="font-semibold text-neon-purple">Package:</span> {typeof project.selected_package === 'string' ? JSON.parse(project.selected_package)?.name || 'Custom' : project.selected_package?.name || 'Custom'}
                                      </div>
                                    )}
                                    {project.complexity && (
                                      <div className="text-xs text-silver-glow/80">
                                        <span className="font-semibold text-cyber-mint">Complexity:</span> {project.complexity}
                                      </div>
                                    )}
                                    {project.features && (
                                      <div className="flex flex-wrap gap-1">
                                        {(typeof project.features === 'string' ? JSON.parse(project.features) : project.features).slice(0, 3).map((feature: any, idx: number) => (
                                          <Badge key={idx} className="bg-space-gray/50 border border-cosmic-blue/20 text-silver-glow text-[10px]">
                                            {typeof feature === 'string' ? feature : feature?.name || feature?.title || 'Feature'}
                                          </Badge>
                                        ))}
                                        {(typeof project.features === 'string' ? JSON.parse(project.features) : project.features).length > 3 && (
                                          <Badge className="bg-space-gray/50 border border-cosmic-blue/20 text-silver-glow text-[10px]">
                                            +{(typeof project.features === 'string' ? JSON.parse(project.features) : project.features).length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between text-xs text-silver-glow/60">
                                  <span>Budget: {formatCurrency(project.budget)}</span>
                                  <span>{new Date(project.end_date).toLocaleDateString()}</span>
                                </div>
                                
                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-cyber-mint/30 flex-1"
                                    onClick={() => handleViewProject(project)}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-neon-purple/30 flex-1"
                                    onClick={() => handleEditProject(project)}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleSetGithubUrl(project)}
                                    className={project.github_url ? "border-green-500/30 text-green-400" : "border-orange-500/30 text-orange-400"}
                                  >
                                    <Code className="w-3 h-3 mr-1" />
                                    GitHub
                                    <span className="ml-2 text-xs">
                                      {project.github_url ? "✓ Set" : "Not Set"}
                                    </span>
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-plasma-pink/30 text-plasma-pink flex-1"
                                    onClick={() => handleDeleteProject(project)}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-cosmic-blue/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-silver-glow font-accent">Client Management</h2>
                      <div className="flex gap-2">
                        <Button onClick={() => loadCustomers()} className="btn-neon">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                        <Button className="btn-gradient">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Client
                        </Button>
                      </div>
                    </div>
                    
                    {/* Customers Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customers.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-silver-glow/60">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No clients found. Loading data...</p>
                        </div>
                      ) : (
                        customers.map((customer) => {
                          const customerId = String(customer.id)
                          // Deposit-aware outstanding owed for this customer
                          const owed = invoices
                            .filter((inv: any) => String(inv.customer_id) === customerId)
                            .reduce((sum: number, inv: any) => {
                              const amount = parseAmount(inv?.amount)
                              const deposit = parseAmount(inv?.deposit_amount ?? (amount ? amount * 0.2 : 0))
                              const remaining = parseAmount(inv?.remaining_amount ?? (amount - deposit))
                              const status = inv?.status
                              const depositPaid = !!inv?.deposit_paid
                              if (status === 'paid') return sum
                              if (depositPaid) return sum + remaining
                              return sum + amount
                            }, 0)
                          const activeProjects = projects.filter((p: any) => String(p.customer_id) === customerId && p.status !== 'completed').length
                          const lastActivity = (customer as any).last_activity ? new Date((customer as any).last_activity).toLocaleDateString() : '-'

                          return (
                            <Card key={customer.id} className="glass-card border border-cosmic-blue/20 hover:border-cyber-mint/40 transition-all">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cosmic-blue to-cyber-mint rounded-full flex items-center justify-center text-white font-semibold">
                                      {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-silver-glow truncate">
                                        {customer.first_name} {customer.last_name}
                                      </h3>
                                      <p className="text-sm text-silver-glow/70 truncate">{customer.email}</p>
                                    </div>
                                    <Badge className={`${
                                      customer.status === 'active' ? 'bg-cyber-mint/20 text-cyber-mint' :
                                      customer.status === 'inactive' ? 'bg-plasma-pink/20 text-plasma-pink' :
                                      'bg-neon-purple/20 text-neon-purple'
                                    }`}>
                                      {customer.status}
                                    </Badge>
                                  </div>

                                  {/* Contact & Company */}
                                  {(customer.phone || customer.company) && (
                                    <div className="text-xs text-silver-glow/70 flex flex-wrap gap-4">
                                      {customer.phone && (
                                        <span>
                                          Phone: <span className="text-silver-glow font-medium">{customer.phone}</span>
                                        </span>
                                      )}
                                      {customer.company && (
                                        <span>
                                          Company: <span className="text-silver-glow font-medium">{customer.company}</span>
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Stats */}
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="p-2 rounded bg-space-gray/40 border border-cosmic-blue/20">
                                      <span className="block text-silver-glow/60">Projects</span>
                                      <span className="text-cyber-mint font-semibold">{activeProjects}/{customer.total_projects}</span>
                                    </div>
                                    <div className="p-2 rounded bg-space-gray/40 border border-neon-purple/20">
                                      <span className="block text-silver-glow/60">Owed</span>
                                      <span className="text-neon-purple font-semibold">{formatCurrency(owed)}</span>
                                    </div>
                                    <div className="p-2 rounded bg-space-gray/40 border border-plasma-pink/20">
                                      <span className="block text-silver-glow/60">Last Activity</span>
                                      <span className="text-silver-glow font-semibold">{lastActivity}</span>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-cosmic-blue/30 flex-1"
                                      onClick={() => {
                                        setActiveTab('messages')
                                        setTimeout(() => openChat(customer.id), 100)
                                      }}
                                    >
                                      <MessageSquare className="w-3 h-3 mr-1" />
                                      Message
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-neon-purple/30 flex-1"
                                      onClick={() => {
                                        setViewingClient(customer)
                                        setIsClientViewModalOpen(true)
                                      }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                      onClick={() => {
                                        setDeletingClient(customer)
                                        setIsClientDeleteModalOpen(true)
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'custom-quotes' && (
                <CustomQuotesTab
                  showSuccess={showSuccess}
                  showError={showError}
                  showLoading={showLoading}
                  hideNotification={hideNotification}
                />
              )}

              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-cosmic-blue/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-silver-glow font-accent">Lead Inquiries</h2>
                      <div className="flex gap-2">
                        <Button onClick={() => loadInquiries()} className="btn-neon">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    
                    {/* Inquiry Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                      <div className="glass-card p-4 border border-neon-purple/20">
                        <div className="text-2xl font-bold text-neon-purple">{inquiries.filter(i => !i.read_at).length}</div>
                        <div className="text-sm text-silver-glow/70">Unread Inquiries</div>
                      </div>
                      <div className="glass-card p-4 border border-cyber-mint/20">
                        <div className="text-2xl font-bold text-cyber-mint">{inquiries.length}</div>
                        <div className="text-sm text-silver-glow/70">Total Inquiries</div>
                      </div>
                    </div>

                    {/* Inquiries List */}
                    <div className="space-y-4">
                      {inquiries.length === 0 ? (
                        <div className="text-center py-12">
                          <Mail className="w-16 h-16 text-silver-glow/30 mx-auto mb-4" />
                          <p className="text-silver-glow/70">No inquiries yet</p>
                        </div>
                      ) : (
                        inquiries.map((inquiry) => (
                          <div key={inquiry.id} className={`glass-card p-4 border transition-all duration-300 ${
                            !inquiry.read_at 
                              ? 'border-neon-purple/40 bg-neon-purple/5 hover:border-cyber-mint/60' 
                              : 'border-neon-purple/20 hover:border-cyber-mint/40'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-silver-glow">{inquiry.name}</h3>
                                  <Badge className={`
                                    ${inquiry.status === 'new' ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' : ''}
                                    ${inquiry.status === 'contacted' ? 'bg-cyber-mint/20 text-cyber-mint border-cyber-mint/30' : ''}
                                    ${inquiry.status === 'in_progress' ? 'bg-plasma-pink/20 text-plasma-pink border-plasma-pink/30' : ''}
                                    ${inquiry.status === 'converted' ? 'bg-cosmic-blue/20 text-cosmic-blue border-cosmic-blue/30' : ''}
                                    ${inquiry.status === 'closed' ? 'bg-silver-glow/20 text-silver-glow border-silver-glow/30' : ''}
                                  `}>
                                    {inquiry.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <Badge className={`
                                    ${inquiry.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                                    ${inquiry.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
                                    ${inquiry.priority === 'normal' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                                    ${inquiry.priority === 'low' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : ''}
                                  `}>
                                    {inquiry.priority.toUpperCase()}
                                  </Badge>
                                  {inquiry.project_type && (
                                    <Badge variant="outline" className="text-silver-glow/70">
                                      {inquiry.project_type}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-silver-glow/80 mb-2">
                                  <strong>Email:</strong> {inquiry.email}
                                </div>
                                <div className="text-silver-glow/80 mb-2">
                                  <strong>Subject:</strong> {inquiry.subject}
                                </div>
                                <div className="text-silver-glow/70 text-sm mb-3">
                                  {inquiry.message.length > 150 ? inquiry.message.substring(0, 150) + '...' : inquiry.message}
                                </div>
                                <div className="text-xs text-silver-glow/50">
                                  Inquiry ID: {inquiry.inquiry_id} • Created: {new Date(inquiry.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Button 
                                  size="sm" 
                                  className="btn-neon"
                                  onClick={() => {
                                    setSelectedInquiry(inquiry)
                                    setIsInquiryViewModalOpen(true)
                                    // Mark as read when viewed
                                    if (!inquiry.read_at) {
                                      markInquiryAsRead(inquiry.id)
                                    }
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                {inquiry.status === 'new' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-cyber-mint/20 hover:bg-cyber-mint/30 text-cyber-mint border border-cyber-mint/30"
                                    onClick={() => markInquiryAsContacted(inquiry.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Contacted
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                                  onClick={() => {
                                    setDeletingInquiry(inquiry)
                                    setIsInquiryDeleteModalOpen(true)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-plasma-pink/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-silver-glow font-accent">Communications Hub</h2>
                      <div className="flex gap-2">
                        <Button onClick={() => loadMessages()} className="btn-neon">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                        <Button onClick={() => setIsMessageModalOpen(true)} className="btn-gradient">
                          <Plus className="w-4 h-4 mr-2" />
                          New Message
                        </Button>
                      </div>
                    </div>
                    
                    {/* Chat Interface */}
                    <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                      {/* Customer List */}
                      <div className="lg:col-span-1">
                        <h3 className="text-lg font-semibold text-silver-glow mb-4">Conversations</h3>
                        <div className="space-y-2 max-h-[550px] overflow-y-auto">
                          {Object.keys(groupedMessages).length === 0 ? (
                            <div className="text-center py-8 text-silver-glow/60">
                              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No conversations found</p>
                            </div>
                          ) : (
                            Object.entries(groupedMessages).map(([customerId, customerMessages]) => {
                              const latestMessage = customerMessages[customerMessages.length - 1]
                              const unreadCount = customerMessages.filter(msg => !msg.is_read && !msg.is_from_admin).length
                              const customer = customers.find(c => c.id === customerId)
                              
                              return (
                                <Card 
                                  key={customerId} 
                                  className={`glass-card border cursor-pointer transition-all hover:border-cyber-mint/40 ${
                                    selectedChatCustomer === customerId 
                                      ? 'border-cyber-mint/60 bg-cyber-mint/5' 
                                      : unreadCount > 0 
                                        ? 'border-plasma-pink/40 bg-plasma-pink/5' 
                                        : 'border-plasma-pink/20'
                                  }`}
                                  onClick={() => openChat(customerId)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-plasma-pink to-neon-purple rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {latestMessage.customer_name.charAt(0)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-semibold text-silver-glow truncate">{latestMessage.customer_name}</h4>
                                          {unreadCount > 0 && (
                                            <Badge className="bg-plasma-pink/20 text-plasma-pink text-xs">
                                              {unreadCount}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-silver-glow/70 truncate">
                                          {latestMessage.is_from_admin ? 'You: ' : ''}{latestMessage.message}
                                        </p>
                                        <p className="text-xs text-silver-glow/50">
                                          {new Date(latestMessage.created_at).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })
                          )}
                        </div>
                      </div>
                      
                      {/* Chat Window */}
                      <div className="lg:col-span-2">
                        {selectedChatCustomer ? (
                          <div className="glass-card border border-cyber-mint/20 rounded-2xl h-full flex flex-col">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-cyber-mint/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-cyber-mint to-neon-purple rounded-full flex items-center justify-center text-white font-semibold">
                                    {chatMessages[0]?.customer_name.charAt(0)}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-silver-glow">{chatMessages[0]?.customer_name}</h3>
                                    <p className="text-sm text-silver-glow/60">
                                      {customers.find(c => c.id === selectedChatCustomer)?.email}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setIsChatOpen(false)}
                                  className="border-cyber-mint/30"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Messages */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                              {chatMessages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.is_from_admin ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                      message.is_from_admin
                                        ? 'bg-cyber-mint/20 text-silver-glow border border-cyber-mint/30'
                                        : 'bg-plasma-pink/20 text-silver-glow border border-plasma-pink/30'
                                    }`}
                                  >
                                    <p className="text-sm">{message.message}</p>
                                    <p className="text-xs text-silver-glow/60 mt-1">
                                      {new Date(message.created_at).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Message Input */}
                            <div className="p-4 border-t border-cyber-mint/20">
                              <div className="flex gap-2">
                                <Input
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  placeholder="Type your message..."
                                  className="flex-1 bg-space-gray/50 border-cyber-mint/30 text-silver-glow"
                                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                />
                                <Button onClick={sendChatMessage} className="btn-gradient">
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="glass-card border border-cyber-mint/20 rounded-2xl h-full flex items-center justify-center">
                            <div className="text-center text-silver-glow/60">
                              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <p>Select a conversation to start chatting</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-neon-purple/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-silver-glow font-accent">Financial Hub</h2>
                      <div className="flex gap-2">
                        <Button onClick={() => loadInvoices()} className="btn-neon">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                        <Button className="btn-gradient">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Invoice
                        </Button>
                      </div>
                    </div>
                    
                    {/* Invoices Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {invoices.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-silver-glow/60">
                          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No invoices found. Loading data...</p>
                        </div>
                      ) : (
                        invoices.map((invoice) => (
                          <Card key={invoice.id} className="glass-card border border-neon-purple/20 hover:border-cyber-mint/40 transition-all">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold text-silver-glow">Invoice #{invoice.invoice_number ?? invoice.id}</h3>
                                    <p className="text-sm text-silver-glow/70">{invoice.client_name}</p>
                                  </div>
                                  <Badge className={`${
                                    invoice.status === 'paid' ? 'bg-cyber-mint/20 text-cyber-mint' :
                                    invoice.status === 'pending' ? 'bg-neon-purple/20 text-neon-purple' :
                                    invoice.status === 'overdue' ? 'bg-plasma-pink/20 text-plasma-pink' :
                                    'bg-cosmic-blue/20 text-cosmic-blue'
                                  }`}>
                                    {invoice.status}
                                  </Badge>
                                </div>
                                
                                {/* Package and Features from line_items */}
                                {invoice.line_items && (() => {
                                  try {
                                    const lineItems = typeof invoice.line_items === 'string' ? JSON.parse(invoice.line_items) : invoice.line_items
                                    const mainItem = lineItems.find((item: any) => item.package_name || item.features)
                                    if (mainItem) {
                                      return (
                                        <div className="space-y-1">
                                          {mainItem.package_name && (
                                            <div className="text-xs text-silver-glow/80">
                                              <span className="font-semibold text-neon-purple">Package:</span> {mainItem.package_name}
                                            </div>
                                          )}
                                          {mainItem.features && mainItem.features.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {mainItem.features.slice(0, 3).map((feature: any, idx: number) => (
                                                <Badge key={idx} className="bg-space-gray/50 border border-neon-purple/20 text-silver-glow text-[10px]">
                                                  {typeof feature === 'string' ? feature : feature?.name || feature?.title || 'Feature'}
                                                </Badge>
                                              ))}
                                              {mainItem.features.length > 3 && (
                                                <Badge className="bg-space-gray/50 border border-neon-purple/20 text-silver-glow text-[10px]">
                                                  +{mainItem.features.length - 3} more
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }
                                  } catch (e) {
                                    return null
                                  }
                                  return null
                                })()}
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-silver-glow/60">Total Amount</span>
                                    <span className="text-silver-glow font-semibold">{formatCurrency(invoice.amount)}</span>
                                  </div>
                                  {invoice.deposit_required && (
                                    <>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-neon-purple/80">Deposit (20%)</span>
                                        <span className="text-neon-purple font-semibold">{formatCurrency(invoice.deposit_amount || invoice.amount * 0.2)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-silver-glow/60">Remaining</span>
                                        <span className="text-silver-glow">{formatCurrency(invoice.amount - (invoice.deposit_amount || invoice.amount * 0.2))}</span>
                                      </div>
                                    </>
                                  )}
                                  {invoice.due_date && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-silver-glow/60">Due Date</span>
                                      <span className="text-silver-glow">{new Date(invoice.due_date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {(invoice.issue_date || (invoice as any).created_at) && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-silver-glow/60">Created</span>
                                      <span className="text-silver-glow">{new Date((invoice.issue_date || (invoice as any).created_at) as any).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {invoice.status === 'overdue' && (
                                  <div className="flex items-center gap-2 p-2 bg-plasma-pink/10 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-plasma-pink" />
                                    <span className="text-xs text-plasma-pink">
                                      Overdue by {Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                  </div>
                                )}
                                
                                {invoice.deposit_required && !invoice.deposit_paid && (
                                  <div className="flex items-center gap-2 p-2 bg-neon-purple/10 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-neon-purple" />
                                    <span className="text-xs text-neon-purple">
                                      20% deposit required before work starts
                                    </span>
                                  </div>
                                )}
                                
                                {invoice.deposit_required && invoice.deposit_paid && invoice.status !== 'paid' && (
                                  <div className="flex items-center gap-2 p-2 bg-cyber-mint/10 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-cyber-mint" />
                                    <span className="text-xs text-cyber-mint">
                                      Deposit paid - work can begin
                                    </span>
                                  </div>
                                )}
                                
                                {invoice.status === 'paid' && (
                                  <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-emerald-400">
                                      Invoice fully paid - project complete
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex gap-2 pt-2">
                                  <Button size="sm" variant="outline" className="border-neon-purple/30 flex-1" onClick={() => handleViewInvoice(invoice)}>
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-cyber-mint/30 flex-1" onClick={() => handlePdfInvoice(invoice)}>
                                    <Download className="w-3 h-3 mr-1" />
                                    PDF
                                  </Button>
                                  {invoice.status !== 'paid' && (
                                    <Button size="sm" variant="outline" className="border-plasma-pink/30">
                                      <Send className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-plasma-pink/30 text-plasma-pink"
                                    onClick={() => handleDeleteInvoice(invoice)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-cyber-mint/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-silver-glow font-accent">Payment Tracking</h2>
                      <div className="flex gap-2">
                        <Button onClick={() => loadPayments()} className="btn-neon">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    
                    {payments.length === 0 ? (
                      <div className="text-center py-12 text-silver-glow/60">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No payments recorded yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="text-left text-sm text-silver-glow/60 border-b border-cyber-mint/20">
                              <th className="py-3 px-2">Payment ID</th>
                              <th className="py-3 px-2">Customer</th>
                              <th className="py-3 px-2">Invoice</th>
                              <th className="py-3 px-2 text-right">Amount</th>
                              <th className="py-3 px-2">Type</th>
                              <th className="py-3 px-2">Method</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((payment) => (
                              <tr key={payment.id} className="border-b border-cyber-mint/10 hover:bg-cyber-mint/5">
                                <td className="py-3 px-2 text-silver-glow">#{payment.id}</td>
                                <td className="py-3 px-2 text-silver-glow">{payment.customer_name}</td>
                                <td className="py-3 px-2 text-silver-glow/80">{payment.invoice_id}</td>
                                <td className="py-3 px-2 text-right font-semibold text-cyber-mint">
                                  {formatCurrency(payment.amount)}
                                </td>
                                <td className="py-3 px-2">
                                  <Badge className={payment.payment_type === 'deposit' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}>
                                    {payment.payment_type === 'deposit' ? 'Deposit' : 'Final Payment'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-2 text-silver-glow/80 capitalize">{payment.payment_method}</td>
                                <td className="py-3 px-2">
                                  <Badge className="bg-green-500/20 text-green-400">
                                    {payment.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-2 text-silver-glow/60 text-sm">
                                  {new Date(payment.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl border border-plasma-pink/20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-silver-glow font-accent mb-1">Reports & Analytics</h2>
                        <p className="text-silver-glow/70 text-sm">
                          Professional insight into revenue, project delivery, and sales performance.
                        </p>
                      </div>
                      <div className="flex flex-col gap-4 text-right sm:flex-row sm:items-center sm:gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-silver-glow/50">Reporting Period</p>
                          <p className="text-sm font-semibold text-silver-glow">{analyticsSummary.reportingPeriod}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-silver-glow/50">Growth</p>
                          <p
                            className={`text-sm font-semibold ${
                              analyticsSummary.monthlyGrowth >= 0 ? 'text-cyber-mint' : 'text-plasma-pink'
                            }`}
                          >
                            {analyticsSummary.monthlyGrowth >= 0 ? '+' : ''}
                            {analyticsSummary.monthlyGrowth.toFixed(1)}% MoM
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                      {summaryCards.map((card) => (
                        <Card key={card.key} className="glass-card border border-neon-purple/20">
                          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-silver-glow/70">{card.label}</CardTitle>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white`}>
                              {card.icon}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-silver-glow">{card.value}</div>
                            <p className="text-xs text-silver-glow/60 mt-1">{card.helper}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-card border border-neon-purple/20">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-silver-glow">Service Performance</CardTitle>
                          <Badge className="bg-cyber-mint/20 text-cyber-mint">Revenue Mix</Badge>
                        </div>
                        <CardDescription className="text-silver-glow/60">
                          Top services ranked by revenue and engagement.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {topServices.length === 0 ? (
                          <p className="text-sm text-silver-glow/60">No service performance data available.</p>
                        ) : (
                          topServices.map((service: any) => {
                            const revenue = parseAmount(service.revenue)
                            const share = totalServiceRevenue > 0 ? Math.round((revenue / totalServiceRevenue) * 100) : 0

                            return (
                              <div key={service.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-silver-glow">{service.name}</p>
                                    <p className="text-xs text-silver-glow/60">{service.count ?? 0} engagements</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-silver-glow">{formatCurrency(revenue)}</p>
                                    <p className="text-xs text-silver-glow/60">{share}% of revenue</p>
                                  </div>
                                </div>
                                <div className="h-2 rounded-full bg-space-gray/50">
                                  <div className="h-2 rounded-full bg-cyber-mint" style={{ width: `${share}%` }} />
                                </div>
                              </div>
                            )
                          })
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass-card border border-cyber-mint/20">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-silver-glow">Financial Overview</CardTitle>
                          <Badge className="bg-cosmic-blue/20 text-cosmic-blue">Invoices</Badge>
                        </div>
                        <CardDescription className="text-silver-glow/60">
                          Snapshot of invoicing progress and outstanding balances.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-silver-glow/50">Invoiced</p>
                            <p className="text-lg font-semibold text-silver-glow">{formatCurrency(invoiceTotals.invoiced)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-silver-glow/50">Collected</p>
                            <p className="text-lg font-semibold text-cyber-mint">{formatCurrency(invoiceTotals.paid)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-silver-glow/50">Outstanding</p>
                            <p className="text-lg font-semibold text-plasma-pink">{formatCurrency(invoiceTotals.outstanding)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-silver-glow/50">Deposits</p>
                            <p className="text-lg font-semibold text-cosmic-blue">{formatCurrency(invoiceTotals.deposits)}</p>
                          </div>
                        </div>

                        <div className="space-y-3"></div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-card border border-neon-purple/20">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-silver-glow">Quote Pipeline</CardTitle>
                          <Badge className="bg-neon-purple/20 text-neon-purple">{totalPipelineCount} active quotes</Badge>
                        </div>
                        <CardDescription className="text-silver-glow/60">
                          Conversion progress across each stage of the sales cycle.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {quoteStatusBreakdown.map((group) => {
                          const percentage = totalPipelineCount > 0 ? Math.round((group.count / totalPipelineCount) * 100) : 0
                          return (
                            <div key={group.key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge className={group.badgeClass}>{group.label}</Badge>
                                  <span className="text-sm text-silver-glow/70">{group.count.toLocaleString()} quotes</span>
                                </div>
                                <span className="text-sm font-semibold text-silver-glow">{percentage}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-space-gray/50">
                                <div className={`h-2 rounded-full ${group.barClass}`} style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>

                    <Card className="glass-card border border-cosmic-blue/20">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-silver-glow">Recent Activity</CardTitle>
                          <Badge className="bg-cosmic-blue/20 text-cosmic-blue">Live Feed</Badge>
                        </div>
                        <CardDescription className="text-silver-glow/60">
                          Latest quote approvals, project milestones, and payment events.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {recentActivity.length === 0 ? (
                          <p className="text-sm text-silver-glow/60">
                            Recent activity will appear here as new events are recorded.
                          </p>
                        ) : (
                          recentActivity.slice(0, 6).map((activity: any, index: number) => {
                            const type = String(activity.type || 'update').toLowerCase()
                            const activityBadgeClass =
                              type === 'quote'
                                ? 'bg-neon-purple/20 text-neon-purple'
                                : type === 'project'
                                ? 'bg-cyber-mint/20 text-cyber-mint'
                                : type === 'payment'
                                ? 'bg-plasma-pink/20 text-plasma-pink'
                                : 'bg-space-gray/30 text-silver-glow/70'

                            return (
                              <div key={`${activity.message}-${index}`} className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge className={activityBadgeClass}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Badge>
                                    <span className="text-sm font-semibold text-silver-glow">{activity.message}</span>
                                  </div>
                                  <p className="text-xs text-silver-glow/60 mt-1">{activity.time || 'Just now'}</p>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup />

      {/* Confirm Delete Project */}
      <ConfirmDialog
        isOpen={isProjectDeleteModalOpen && !!deletingProject}
        onClose={() => { setIsProjectDeleteModalOpen(false); setDeletingProject(null) }}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        description={`This action will permanently delete the project "${deletingProject?.name || ''}". This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Confirm Delete Invoice */}
      <ConfirmDialog
        isOpen={isInvoiceDeleteModalOpen && !!deletingInvoice}
        onClose={() => { setIsInvoiceDeleteModalOpen(false); setDeletingInvoice(null) }}
        onConfirm={confirmDeleteInvoice}
        title="Delete Invoice"
        description={`This action will permanently delete invoice #${(deletingInvoice?.invoice_number || deletingInvoice?.id || '')}. This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />


      {/* New Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border border-neon-purple/30 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-silver-glow font-accent">New Message</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMessageModalOpen(false)}
                className="border-neon-purple/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-silver-glow mb-2">Customer</label>
                <select
                  value={messageForm.customerId}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full p-2 bg-space-gray/50 border border-neon-purple/30 rounded-lg text-silver-glow"
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-silver-glow mb-2">Subject</label>
                <Input
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Message subject"
                  className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-silver-glow mb-2">Message</label>
                <Textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message..."
                  rows={4}
                  className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setIsMessageModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-neon-purple/30"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  className="flex-1 btn-gradient"
                  disabled={!messageForm.customerId || !messageForm.subject || !messageForm.message}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Project View Modal */}
      <AnimatePresence>
        {isProjectViewModalOpen && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsProjectViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-black/80 p-6 rounded-2xl border border-cyber-mint/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-silver-glow">Project Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProjectViewModalOpen(false)}
                  className="text-silver-glow/70 hover:text-silver-glow"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-silver-glow mb-4">Project Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-silver-glow/70">Project Name</label>
                        <p className="text-silver-glow font-medium">{selectedProject.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-silver-glow/70">Client</label>
                        <p className="text-silver-glow font-medium">{selectedProject.client}</p>
                      </div>
                      <div>
                        <label className="text-sm text-silver-glow/70">Status</label>
                        <Badge className={`${
                          selectedProject.status === 'completed' ? 'bg-cyber-mint/20 text-cyber-mint' :
                          selectedProject.status === 'in_progress' ? 'bg-neon-purple/20 text-neon-purple' :
                          'bg-plasma-pink/20 text-plasma-pink'
                        }`}>
                          {selectedProject.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-silver-glow mb-4">Project Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-silver-glow/70">Budget</label>
                        <p className="text-silver-glow font-medium">{formatCurrency(selectedProject.budget)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-silver-glow/70">Progress</label>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-silver-glow">{selectedProject.progress}%</span>
                          </div>
                          <div className="w-full bg-space-gray rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyber-mint to-neon-purple h-2 rounded-full"
                              style={{ width: `${selectedProject.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-silver-glow/70">Timeline</label>
                        <p className="text-silver-glow font-medium">
                          {new Date(selectedProject.start_date).toLocaleDateString()} - {new Date(selectedProject.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedProject.description && (
                  <div>
                    <label className="text-sm text-silver-glow/70">Description</label>
                    <p className="text-silver-glow mt-1">{selectedProject.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Edit Modal */}
      <AnimatePresence>
        {isProjectEditModalOpen && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsProjectEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-black/90 backdrop-blur-sm p-6 rounded-2xl border border-neon-purple/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-silver-glow">Edit Project</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProjectEditModalOpen(false)}
                  className="text-silver-glow/70 hover:text-silver-glow"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Project Name</label>
                    <Input
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                      className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Client</label>
                    <Input
                      value={projectForm.client}
                      onChange={(e) => setProjectForm({...projectForm, client: e.target.value})}
                      className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Status</label>
                    <select
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({...projectForm, status: e.target.value as any})}
                      className="w-full p-2 bg-space-gray/50 border border-neon-purple/30 rounded-md text-silver-glow"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Progress (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={projectForm.progress}
                      onChange={(e) => setProjectForm({...projectForm, progress: parseInt(e.target.value) || 0})}
                      className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neon-purple/30 text-silver-glow"
                        onClick={() => setProjectForm({ ...projectForm, progress: 25 })}
                      >
                        25%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neon-purple/30 text-silver-glow"
                        onClick={() => setProjectForm({ ...projectForm, progress: 50 })}
                      >
                        50%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neon-purple/30 text-silver-glow"
                        onClick={() => setProjectForm({ ...projectForm, progress: 75 })}
                      >
                        75%
                      </Button>
                      <Button
                        size="sm"
                        className="btn-gradient"
                        onClick={() => setProjectForm({ ...projectForm, progress: 100, status: 'completed' })}
                        title="Sets progress to 100% and marks project as completed"
                      >
                        100%
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Budget</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={projectForm.budget}
                      onChange={(e) => setProjectForm({...projectForm, budget: parseFloat(e.target.value) || 0})}
                      className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-silver-glow mb-2">Description</label>
                  <Textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpdateProject}
                    className="btn-gradient flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsProjectEditModalOpen(false)}
                    className="border-silver-glow/30 text-silver-glow"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote View Modal */}
      <AnimatePresence>
        {isQuoteViewModalOpen && selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsQuoteViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-black/80 p-6 rounded-2xl border border-cyber-mint/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-silver-glow">Quote Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsQuoteViewModalOpen(false)}
                  className="text-silver-glow/70 hover:text-silver-glow"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-silver-glow mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-silver-glow/70">Name</label>
                        <p className="text-silver-glow font-medium">{selectedQuote.customer_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-silver-glow/70">Email</label>
                        <p className="text-silver-glow font-medium">{selectedQuote.email}</p>
                      </div>
                      {selectedQuote.company && (
                        <div>
                          <label className="text-sm text-silver-glow/70">Company</label>
                          <p className="text-silver-glow font-medium">{selectedQuote.company}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-silver-glow/70">Status</label>
                        <Badge className={`${
                          selectedQuote.status === 'pending' ? 'bg-neon-purple/20 text-neon-purple' :
                          selectedQuote.status === 'approved' ? 'bg-cyber-mint/20 text-cyber-mint' :
                          selectedQuote.status === 'cancelled' ? 'bg-plasma-pink/20 text-plasma-pink' :
                          'bg-cosmic-blue/20 text-cosmic-blue'
                        }`}>
                          {selectedQuote.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-silver-glow mb-4">Quote Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-silver-glow/70">Estimated Cost</label>
                        <p className="text-silver-glow font-medium text-xl">{formatCurrency(selectedQuote.estimated_cost)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-silver-glow/70">Timeline</label>
                        <p className="text-silver-glow font-medium">{selectedQuote.estimated_timeline}</p>
                      </div>
                      <div>
                        <label className="text-sm text-silver-glow/70">Created</label>
                        <p className="text-silver-glow font-medium">
                          {new Date(selectedQuote.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-silver-glow/70">Description</label>
                  <p className="text-silver-glow mt-1">{selectedQuote.description}</p>
                </div>

                {(selectedQuote.selected_package || (selectedQuote.selectedFeatures && selectedQuote.selectedFeatures.length > 0) || (selectedQuote.services && selectedQuote.services.length > 0) || selectedQuote.complexity || selectedQuote.rush_delivery) && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-silver-glow mb-3">Package & Features</h3>
                    <div className="space-y-2 text-silver-glow/80">
                      {selectedQuote.selected_package && (
                        <div><span className="font-medium text-silver-glow">Package:</span> {selectedQuote.selected_package.name || selectedQuote.selected_package.title || 'Custom'}</div>
                      )}
                      {selectedQuote.complexity && (
                        <div><span className="font-medium text-silver-glow">Complexity:</span> {selectedQuote.complexity}</div>
                      )}
                      {selectedQuote.rush_delivery && (
                        <div><span className="font-medium text-silver-glow">Delivery:</span> {selectedQuote.rush_delivery}</div>
                      )}
                      {(selectedQuote.selected_package?.features?.length > 0 || (selectedQuote.selectedFeatures && selectedQuote.selectedFeatures.length > 0) || (selectedQuote.services && selectedQuote.services.length > 0)) && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(selectedQuote.selected_package?.features || selectedQuote.selectedFeatures || selectedQuote.services || []).map((feat: any, idx: number) => (
                            <Badge key={idx} className="bg-space-gray/60 border border-cyber-mint/20 text-silver-glow text-xs">{typeof feat === 'string' ? feat : feat?.name || feat?.title || 'Feature'}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Edit Modal */}
      <AnimatePresence>
        {isQuoteEditModalOpen && selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsQuoteEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-black/80 p-6 rounded-2xl border border-neon-purple/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-silver-glow">Edit Quote</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsQuoteEditModalOpen(false)}
                  className="text-silver-glow/70 hover:text-silver-glow"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Customer Name</label>
                    <Input
                      value={quoteEditForm.name}
                      onChange={(e) => setQuoteEditForm({...quoteEditForm, name: e.target.value})}
                      className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Email</label>
                    <Input
                      type="email"
                      value={quoteEditForm.email}
                      onChange={(e) => setQuoteEditForm({...quoteEditForm, email: e.target.value})}
                      className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-glow mb-2">Company</label>
                  <Input
                    value={quoteEditForm.company}
                    onChange={(e) => setQuoteEditForm({...quoteEditForm, company: e.target.value})}
                    className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Estimated Cost</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quoteEditForm.estimated_cost}
                      onChange={(e) => setQuoteEditForm({...quoteEditForm, estimated_cost: parseFloat(e.target.value) || 0})}
                      className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-silver-glow mb-2">Timeline</label>
                    <Input
                      value={quoteEditForm.estimated_timeline}
                      onChange={(e) => setQuoteEditForm({...quoteEditForm, estimated_timeline: e.target.value})}
                      className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                      placeholder="e.g., 2-3 weeks"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-glow mb-2">Status</label>
                  <select
                    value={quoteEditForm.status}
                    onChange={(e) => setQuoteEditForm({...quoteEditForm, status: e.target.value as any})}
                    className="w-full p-2 bg-space-gray/50 border border-neon-purple/30 rounded-md text-silver-glow"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="quoted">Quoted</option>
                    <option value="approved">Approved</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-glow mb-2">Description</label>
                  <Textarea
                    value={quoteEditForm.description}
                    onChange={(e) => setQuoteEditForm({...quoteEditForm, description: e.target.value})}
                    className="bg-space-gray/50 border-neon-purple/30 text-silver-glow"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={confirmUpdateQuote}
                    className="btn-gradient flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Quote
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsQuoteEditModalOpen(false)}
                    className="border-silver-glow/30 text-silver-glow"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Delete Confirmation Modal */}
      <AnimatePresence>
        {isQuoteDeleteModalOpen && selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsQuoteDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-black/80 p-6 rounded-2xl border border-plasma-pink/30 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-plasma-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-plasma-pink" />
                </div>
                <h3 className="text-xl font-bold text-silver-glow mb-2">Delete Quote</h3>
                <p className="text-silver-glow/80 mb-6">
                  Are you sure you want to delete this quote for <strong>{selectedQuote.customer_name}</strong>? 
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsQuoteDeleteModalOpen(false)}
                    className="flex-1 border-silver-glow/30 text-silver-glow"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteQuote}
                    className="flex-1 bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 hover:text-red-200"
                  >
                    Delete Quote
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Cancel Confirmation Modal */}
      <AnimatePresence>
        {isQuoteCancelModalOpen && selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsQuoteCancelModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-black/80 p-6 rounded-2xl border border-plasma-pink/30 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-plasma-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-plasma-pink" />
                </div>
                <h3 className="text-xl font-bold text-silver-glow mb-2">Cancel Quote</h3>
                <p className="text-silver-glow/80 mb-6">
                  Are you sure you want to cancel this quote for <strong>{selectedQuote.customer_name}</strong>? 
                  The quote status will be changed to cancelled.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsQuoteCancelModalOpen(false)}
                    className="flex-1 border-silver-glow/30 text-silver-glow"
                  >
                    Keep Quote
                  </Button>
                  <Button
                    onClick={confirmCancelQuote}
                    className="flex-1 bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 hover:text-red-200"
                  >
                    Cancel Quote
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Approve Confirmation Modal */}
      <AnimatePresence>
        {isQuoteApproveModalOpen && selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsQuoteApproveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-black/80 p-6 rounded-2xl border border-cyber-mint/30 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-cyber-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-cyber-mint" />
                </div>
                <h3 className="text-xl font-bold text-silver-glow mb-2">Approve Quote</h3>
                <p className="text-silver-glow/70 mb-6">
                  Approving this quote for <strong>{selectedQuote.customer_name}</strong> will:
                </p>
                <div className="text-left bg-space-gray/30 rounded-lg p-4 mb-6">
                  <ul className="space-y-2 text-sm text-silver-glow/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyber-mint" />
                      Update quote status to "Approved"
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyber-mint" />
                      Generate invoice for {formatCurrency(selectedQuote.estimated_cost)}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyber-mint" />
                      Create new project in Project Management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neon-purple" />
                      Notify client: 20% deposit ({formatCurrency(selectedQuote.estimated_cost * 0.2)}) due before work starts
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsQuoteApproveModalOpen(false)}
                    className="flex-1 border-silver-glow/30 text-silver-glow"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmApproveQuote}
                    className="flex-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 hover:text-emerald-200"
                  >
                    Approve Quote
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub URL Modal */}
      <AnimatePresence>
        {isGithubUrlModalOpen && githubUrlProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => setIsGithubUrlModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-black/80 p-6 rounded-2xl border border-cyber-mint/30 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-cyber-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-cyber-mint" />
                </div>
                <h3 className="text-xl font-bold text-silver-glow mb-2">Set GitHub Repository</h3>
                <p className="text-silver-glow/70">
                  Set the GitHub repository URL for <strong>{githubUrlProject.name}</strong>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-silver-glow mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={githubUrlForm.url}
                    onChange={(e) => setGithubUrlForm({ url: e.target.value })}
                    placeholder="https://github.com/username/repository"
                    className="w-full px-3 py-2 bg-space-gray/50 border border-silver-glow/20 rounded-lg text-silver-glow placeholder-silver-glow/50 focus:outline-none focus:border-cyber-mint/50"
                  />
                  <p className="text-xs text-silver-glow/50 mt-1">
                    Clients will be redirected to this URL when they click the GitHub button
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsGithubUrlModalOpen(false)}
                  className="flex-1 border-silver-glow/30 text-silver-glow"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveGithubUrl}
                  className="flex-1 bg-cyber-mint/20 text-cyber-mint border border-cyber-mint/30 hover:bg-cyber-mint/30"
                >
                  Save URL
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client View Modal */}
      <AnimatePresence>
        {isClientViewModalOpen && viewingClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsClientViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-black/80 p-6 rounded-2xl border border-cyber-mint/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cosmic-blue to-cyber-mint rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {viewingClient.first_name.charAt(0)}{viewingClient.last_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-silver-glow">
                      {viewingClient.first_name} {viewingClient.last_name}
                    </h2>
                    <p className="text-cyber-mint">{viewingClient.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClientViewModalOpen(false)}
                  className="border-silver-glow/30 text-silver-glow"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyber-mint border-b border-cyber-mint/30 pb-2">
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Name:</span>
                      <span className="text-silver-glow font-medium">
                        {viewingClient.first_name} {viewingClient.last_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Email:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Phone:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Preferred Contact:</span>
                      <span className="text-silver-glow font-medium capitalize">
                        {viewingClient.preferred_contact || 'Email'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyber-mint border-b border-cyber-mint/30 pb-2">
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Company:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.company || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Job Title:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.job_title || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Industry:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.industry || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Company Size:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.company_size || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Business Type:</span>
                      <span className="text-silver-glow font-medium capitalize">
                        {viewingClient.business_type?.replace('_', ' ') || 'Individual'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">VAT Number:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.vat_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyber-mint border-b border-cyber-mint/30 pb-2">
                    Location & Address
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Country:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.country || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">City:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.city || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Postal Code:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.postal_code || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Timezone:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.timezone || 'Not provided'}</span>
                    </div>
                    {viewingClient.address && (
                      <div>
                        <span className="text-silver-glow/70">Full Address:</span>
                        <p className="text-silver-glow font-medium mt-1 p-2 bg-space-gray/30 rounded">
                          {viewingClient.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Online Presence */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyber-mint border-b border-cyber-mint/30 pb-2">
                    Online Presence
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Website:</span>
                      <span className="text-silver-glow font-medium">
                        {viewingClient.website ? (
                          <a href={viewingClient.website} target="_blank" rel="noopener noreferrer" 
                             className="text-cyber-mint hover:underline">
                            {viewingClient.website}
                          </a>
                        ) : 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">LinkedIn:</span>
                      <span className="text-silver-glow font-medium">
                        {viewingClient.linkedin ? (
                          <a href={viewingClient.linkedin} target="_blank" rel="noopener noreferrer" 
                             className="text-cyber-mint hover:underline">
                            {viewingClient.linkedin}
                          </a>
                        ) : 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver-glow/70">Twitter:</span>
                      <span className="text-silver-glow font-medium">{viewingClient.twitter || 'Not provided'}</span>
                    </div>
                    {viewingClient.bio && (
                      <div>
                        <span className="text-silver-glow/70">Bio:</span>
                        <p className="text-silver-glow font-medium mt-1 p-2 bg-space-gray/30 rounded">
                          {viewingClient.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-cyber-mint/30">
                <Button
                  onClick={() => setIsClientViewModalOpen(false)}
                  className="bg-cyber-mint/20 text-cyber-mint border border-cyber-mint/30 hover:bg-cyber-mint/30"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inquiry View Modal */}
      <AnimatePresence>
        {isInquiryViewModalOpen && selectedInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsInquiryViewModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-br from-space-gray to-deep-space border border-cyber-mint/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-silver-glow font-accent">
                  Inquiry Details
                </h3>
                <Button
                  onClick={() => setIsInquiryViewModalOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-silver-glow/60 hover:text-silver-glow"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="glass-card p-4 border border-neon-purple/20">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-xl font-semibold text-silver-glow">{selectedInquiry.name}</h4>
                    <Badge className={`
                      ${selectedInquiry.status === 'new' ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' : ''}
                      ${selectedInquiry.status === 'contacted' ? 'bg-cyber-mint/20 text-cyber-mint border-cyber-mint/30' : ''}
                    `}>
                      {selectedInquiry.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={`
                      ${selectedInquiry.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                      ${selectedInquiry.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
                      ${selectedInquiry.priority === 'normal' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                      ${selectedInquiry.priority === 'low' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : ''}
                    `}>
                      {selectedInquiry.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-silver-glow/60">Email:</span>
                      <div className="text-silver-glow font-medium">{selectedInquiry.email}</div>
                    </div>
                    <div>
                      <span className="text-silver-glow/60">Inquiry ID:</span>
                      <div className="text-silver-glow font-medium">{selectedInquiry.inquiry_id}</div>
                    </div>
                    <div>
                      <span className="text-silver-glow/60">Project Type:</span>
                      <div className="text-silver-glow font-medium">{selectedInquiry.project_type || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="text-silver-glow/60">Created:</span>
                      <div className="text-silver-glow font-medium">{new Date(selectedInquiry.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="glass-card p-4 border border-cyber-mint/20">
                  <h5 className="text-lg font-semibold text-silver-glow mb-2">Subject</h5>
                  <p className="text-silver-glow/80">{selectedInquiry.subject}</p>
                </div>

                {/* Message */}
                <div className="glass-card p-4 border border-plasma-pink/20">
                  <h5 className="text-lg font-semibold text-silver-glow mb-2">Message</h5>
                  <div className="text-silver-glow/80 whitespace-pre-wrap leading-relaxed">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Technical Info */}
                <div className="glass-card p-4 border border-cosmic-blue/20">
                  <h5 className="text-lg font-semibold text-silver-glow mb-2">Technical Information</h5>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-silver-glow/60">Source:</span>
                      <div className="text-silver-glow/80">{selectedInquiry.source || 'Contact Form'}</div>
                    </div>
                    <div>
                      <span className="text-silver-glow/60">IP Address:</span>
                      <div className="text-silver-glow/80">{selectedInquiry.ip_address || 'Unknown'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-cyber-mint/30">
                {selectedInquiry.status === 'new' && (
                  <Button
                    onClick={() => {
                      markInquiryAsContacted(selectedInquiry.id)
                      setIsInquiryViewModalOpen(false)
                    }}
                    className="bg-cyber-mint/20 text-cyber-mint border border-cyber-mint/30 hover:bg-cyber-mint/30"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Contacted
                  </Button>
                )}
                <Button
                  onClick={() => setIsInquiryViewModalOpen(false)}
                  className="bg-silver-glow/20 text-silver-glow border border-silver-glow/30 hover:bg-silver-glow/30 ml-auto"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inquiry Delete Confirmation Modal */}
      <AnimatePresence>
        {isInquiryDeleteModalOpen && deletingInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsInquiryDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-br from-space-gray to-deep-space border border-red-500/30 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-silver-glow mb-4 font-accent">
                  Delete Inquiry
                </h3>
                
                <p className="text-silver-glow/80 mb-2">
                  Are you sure you want to delete this inquiry from:
                </p>
                <p className="text-cyber-mint font-semibold mb-6">
                  {deletingInquiry.name} ({deletingInquiry.email})
                </p>
                <p className="text-red-400 text-sm mb-8">
                  This action cannot be undone.
                </p>
                
                <div className="flex gap-4">
                  <Button
                    onClick={() => setIsInquiryDeleteModalOpen(false)}
                    className="flex-1 bg-silver-glow/20 text-silver-glow border border-silver-glow/30 hover:bg-silver-glow/30"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => deleteInquiry(deletingInquiry.id)}
                    className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Delete Confirmation Modal */}
      <AnimatePresence>
        {isClientDeleteModalOpen && deletingClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsClientDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-br from-space-gray to-deep-space border border-red-500/30 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-silver-glow mb-4 font-accent">
                  Delete Client
                </h3>
                
                <p className="text-silver-glow/80 mb-2">
                  Are you sure you want to delete this client:
                </p>
                <p className="text-cyber-mint font-semibold mb-6">
                  {deletingClient.first_name} {deletingClient.last_name} ({deletingClient.email})
                </p>
                <p className="text-red-400 text-sm mb-8">
                  This will also delete all associated projects, invoices, and messages. This action cannot be undone.
                </p>
                
                <div className="flex gap-4">
                  <Button
                    onClick={() => setIsClientDeleteModalOpen(false)}
                    className="flex-1 bg-silver-glow/20 text-silver-glow border border-silver-glow/30 hover:bg-silver-glow/30"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => deleteClient(deletingClient.id)}
                    className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Client
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </main>
  )
}
