'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import QuoteTypeModal from '@/components/quote-type-modal'
import QuoteDetailsModal from '@/components/quote-details-modal'
import ConfirmDialog from '@/components/confirm-dialog'
import SuccessNotification from '@/components/success-notification'
import NotificationDropdown from '@/components/notification-dropdown'
import { Notification } from '@/lib/database'
import { useAuth } from '@/contexts/auth-context'
import ClientMessaging from '@/components/client-messaging'

// Billing data interfaces
interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'amex' | 'paypal'
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  customerId: string
}

interface Invoice {
  id: string
  customerId: string
  projectId?: string
  projectName: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  // Deposit fields
  depositRequired?: boolean
  depositAmount?: number
  depositPaid?: boolean
  depositDueDate?: string
  remainingAmount?: number
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface BillingSettings {
  customerId: string
  emailInvoices: boolean
  autoPayEnabled: boolean
  billingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  taxId?: string
}
import { 
  User, FileText, Clock, DollarSign, LogOut, Mail, Building, Calendar, CheckCircle, AlertCircle,
  Eye, Settings, Bell, Download, MessageSquare, CreditCard, BarChart3, Plus, Edit, Lock, Save, X,
  Phone, MapPin, Globe, Briefcase, TrendingUp, Activity, Star, Shield, Zap, Award, Upload, Search,
  Filter, Video, FileImage, Paperclip, Send, Archive, Trash2, ExternalLink, Copy, RefreshCw,
  PlayCircle, CheckSquare, AlertTriangle, Info, HelpCircle, BookOpen, Headphones, Package,
  Monitor, Smartphone, Laptop, Server, Database, Code, Palette, Layers, Target, Rocket, Timer,
  Users, Heart, ThumbsUp, MessageCircle, Share2, Flag, Bookmark, Tag, Folder, FolderOpen, Image,
  FileVideo, FileAudio, FileSpreadsheet, FileCode, CloudUpload, CloudDownload,
  Wifi, WifiOff, BatteryCharging, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw,
  ZoomIn, ZoomOut, Move, Crop, Scissors, PaintBucket, Brush, Eraser, Type, AlignLeft, AlignCenter,
  AlignRight, Bold, Italic, Underline, List, ListOrdered, Quote, Link2, Unlink, Table, Grid,
  Layout, Sidebar, PanelLeft, PanelRight, PanelTop, PanelBottom, Columns, Rows, Square, Circle,
  Triangle, Hexagon, Hash, AtSign, Percent, Euro, Bitcoin, Wallet, Receipt, Calculator,
  PieChart, LineChart, AreaChart, ScatterChart, TrendingDown, Gauge, Thermometer, Battery, Signal,
  Antenna, Radio, Tv, Camera, Mic, MicOff, Speaker, Music, PlaySquare,
  SkipBack, SkipForward, Rewind, FastForward, Repeat, Repeat1, Shuffle, Volume, Volume1, VolumeOff,
  Play, Pause, Power, PowerOff, Sun, Moon, Cloud, CloudRain,
  CloudSnow, CloudLightning, Umbrella, Wind, Droplets, EyeOff, Glasses, Lightbulb, Flashlight,
  Home, Building2, Linkedin, Twitter, ArrowRight, Code as CodeIcon
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Resolve an appropriate invoice id for payment (prefer latest pending & deposit not paid)
const resolveInvoiceIdHelper = (billingData: any): string | undefined => {
  try {
    const invoices = (billingData?.invoices as any[]) || []
    const normalized = invoices.map((inv: any) => ({
      id: inv.id,
      status: inv.status,
      depositPaid: inv?.depositPaid ?? inv?.deposit_paid ?? false,
      issueDate: inv?.issueDate ?? inv?.issue_date ?? null,
      createdAt: inv?.createdAt ?? inv?.created_at ?? null,
    }))
    const candidates = normalized.filter(i => i.status !== 'paid' && !i.depositPaid)
    if (candidates.length === 0) return undefined
    const sorted = candidates.sort((a, b) => new Date(a.createdAt || a.issueDate || 0).getTime() - new Date(b.createdAt || b.issueDate || 0).getTime())
    return sorted[sorted.length - 1]?.id
  } catch {
    return undefined
  }
}

interface CustomerAccount {
  id: string
  name: string
  email: string
  company?: string
  password?: string
  createdAt: string
  updatedAt?: string
  quotes?: string[]
  phone?: string
  address?: string
  website?: string
  jobTitle?: string
  industry?: string
  companySize?: string
  timezone?: string
  preferredContact?: string
  linkedin?: string
  twitter?: string
  bio?: string
  avatar?: string
  country?: string
  city?: string
  postalCode?: string
  vatNumber?: string
  businessType?: string
}

interface QuoteData {
  id: string
  quote_id: string
  name: string
  email: string
  company?: string
  description: string
  selectedFeatures: string[]
  selectedPackage?: {
    id: string
    name: string
    price: number
    features: string[]
    deliveryTime: string
    category: string
    complexity: string
  }
  complexity: 'basic' | 'standard' | 'premium' | string
  estimatedCost: number
  estimatedTimeline: number | string
  status: 'pending' | 'under_review' | 'quoted' | 'approved' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export default function ClientDashboard() {
  const router = useRouter()
  const { customer: authCustomer, isLoading, logout } = useAuth()
  const [customer, setCustomer] = useState<CustomerAccount | null>(null)
  const [quotes, setQuotes] = useState<QuoteData[]>([])
  const [customQuotes, setCustomQuotes] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [clientMessages, setClientMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState('')
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isQuoteDetailsOpen, setIsQuoteDetailsOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [pendingCancelQuoteId, setPendingCancelQuoteId] = useState<string | null>(null)
  const [confirmCancelFunction, setConfirmCancelFunction] = useState<(() => Promise<void>) | null>(null)
  const [isSuccessNotificationOpen, setIsSuccessNotificationOpen] = useState(false)
  const [successNotification, setSuccessNotification] = useState({
    title: '',
    message: ''
  })
  
  // Notification system state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    website: '',
    jobTitle: '',
    industry: '',
    companySize: '',
    timezone: '',
    preferredContact: 'email',
    linkedin: '',
    twitter: '',
    bio: '',
    avatar: '',
    country: '',
    city: '',
    postalCode: '',
    vatNumber: '',
    businessType: 'individual'
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [billingData, setBillingData] = useState<{
    stats: { totalSpent: number; outstanding: number; nextPaymentAmount: number; nextPaymentDate: string | null }
    paymentMethods: PaymentMethod[]
    invoices: Invoice[]
    settings: BillingSettings | null
  }>({
    stats: { totalSpent: 0, outstanding: 0, nextPaymentAmount: 0, nextPaymentDate: null },
    paymentMethods: [],
    invoices: [],
    settings: null
  })
  const [showGithubNotSetModal, setShowGithubNotSetModal] = useState(false)
  const [githubNotSetProject, setGithubNotSetProject] = useState<any | null>(null)
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  const loadClientMessages = async () => {
    if (!authCustomer) return
    try {
      const res = await fetch(`/api/messages?customerId=${authCustomer.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setClientMessages(data.messages || [])
        } else {
          console.warn('Failed to load client messages:', data.error)
        }
      } else {
        console.warn('Failed to load client messages:', res.status)
      }
    } catch (error) {
      console.error('Error loading client messages:', error)
    }
  }

  const sendClientMessage = async () => {
    if (!authCustomer || !messageText.trim()) return
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText.trim()
        })
      })
      const data = await res.json().catch(() => ({ success: false }))
      if (res.ok && data.success) {
        setMessageText('')
        await loadClientMessages()
      } else {
        console.warn('Send client message failed:', data)
      }
    } catch (e) {
      console.error('Error sending client message:', e)
    }
  }

  useEffect(() => {
    if (authCustomer && activeTab === 'messages') {
      loadClientMessages()
    }
  }, [authCustomer, activeTab])

  useEffect(() => {
    if (activeTab !== 'messages' || !authCustomer) return
    const interval = setInterval(() => {
      loadClientMessages()
    }, 10000)
    return () => clearInterval(interval)
  }, [activeTab, authCustomer])

  // Authentication check
  useEffect(() => {
    if (!isLoading && !authCustomer) {
      router.push('/client')
      return
    }
    
    if (authCustomer) {
      setCustomer({
        id: authCustomer.id,
        name: authCustomer.name,
        email: authCustomer.email,
        company: authCustomer.company || '',
        phone: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        quotes: []
      })
    }
  }, [authCustomer, isLoading, router])

  useEffect(() => {
    if (!authCustomer) return

    const loadData = async () => {
      try {
        // Load real quotes data
        const quotesResponse = await fetch(`/api/quotes?customerId=${authCustomer.id}`)
        if (quotesResponse.ok) {
          const quotesData = await quotesResponse.json()
          console.log('📊 Loaded quotes data:', quotesData)
          console.log('🔍 First quote structure:', quotesData.quotes?.[0])
          
          // Debug package data specifically
          if (quotesData.quotes && quotesData.quotes.length > 0) {
            quotesData.quotes.forEach((quote: any, idx: number) => {
              console.log(`📦 Quote ${idx + 1} package data:`, {
                id: quote.id,
                hasSelectedPackage: !!quote.selectedPackage,
                selectedPackage: quote.selectedPackage,
                packageName: quote.selectedPackage?.name || 'No package',
                hasSelectedFeatures: !!quote.selectedFeatures,
                selectedFeatures: quote.selectedFeatures,
                featuresCount: quote.selectedFeatures?.length || 0,
                complexity: quote.complexity
              })
              
              // Log the full quote object for the first quote
              if (idx === 0) {
                console.log('🔍 Full first quote object:', JSON.stringify(quote, null, 2))
              }
            })
          }
          
          setQuotes(quotesData.quotes || [])

          // Load custom quotes
          try {
            const customQuotesResponse = await fetch(`/api/custom-quotes?customerId=${authCustomer.id}`)
            if (customQuotesResponse.ok) {
              const customQuotesData = await customQuotesResponse.json()
              if (customQuotesData.success) {
                setCustomQuotes(customQuotesData.customQuotes || [])
              }
            }
          } catch (cqErr) {
            console.error('Error loading custom quotes:', cqErr)
          }

          // Load client projects (mirror admin projects for accurate status/progress)
          try {
            const projectsResponse = await fetch(`/api/client/projects?customer_id=${authCustomer.id}`)
            if (projectsResponse.ok) {
              const projectsData = await projectsResponse.json()
              console.log('📊 Loaded client projects:', projectsData)
              if (projectsData.success) {
                setProjects(projectsData.projects || [])
              }
            } else {
              console.warn('Failed to load client projects:', projectsResponse.status)
            }
          } catch (projErr) {
            console.error('Error loading client projects:', projErr)
          }
        } else {
          console.error('Failed to load quotes:', quotesResponse.status)
          setQuotes([])

          // Still try to load client projects so Projects tab can render
          try {
            const projectsResponse = await fetch(`/api/client/projects?customer_id=${authCustomer.id}`)
            if (projectsResponse.ok) {
              const projectsData = await projectsResponse.json()
              console.log('📊 Loaded client projects (quotes failed):', projectsData)
              if (projectsData.success) {
                setProjects(projectsData.projects || [])
              }
            } else {
              console.warn('Failed to load client projects (quotes failed):', projectsResponse.status)
            }
          } catch (projErr) {
            console.error('Error loading client projects (quotes failed):', projErr)
          }
        }
        
        // Load notifications
        await fetchNotifications()
        
        // Load billing data
        const billingResponse = await fetch(`/api/billing?customerId=${authCustomer.id}`)
        if (billingResponse.ok) {
          const billingResult = await billingResponse.json()
          if (billingResult.success) {
            setBillingData(billingResult.data)
          }
        }

        // Load updated customer profile data from database
        try {
          const customerResponse = await fetch(`/api/customers/${authCustomer.id}`)
          if (customerResponse.ok) {
            const customerResult = await customerResponse.json()
            if (customerResult.success) {
              console.log('📊 Loaded updated customer data:', customerResult.customer)
              setCustomer(customerResult.customer)
              // Update localStorage with latest data
              localStorage.setItem('customer', JSON.stringify(customerResult.customer))
            }
          }
        } catch (customerErr) {
          console.error('Error loading customer data:', customerErr)
        }
        
        // Files tab removed: project files available via per-project modal
        
      } catch (error) {
        console.error('Error loading customer data:', error)
        // Don't redirect on data loading errors, just log them
      }
      
      setLoading(false)
    }

    loadData()
  }, [authCustomer])

  const handleLogout = () => {
    logout()
    router.push('/client')
  }

  const handleProfileSave = async () => {
    try {
      if (!customer && !authCustomer) {
        console.error('No customer data available')
        alert('Error: No customer data available')
        return
      }
      
      console.log('Saving profile:', profileData)
      
      // Prepare update data for database
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        company: profileData.company,
        phone: profileData.phone,
        address: profileData.address,
        website: profileData.website,
        job_title: profileData.jobTitle,
        industry: profileData.industry,
        company_size: profileData.companySize,
        timezone: profileData.timezone,
        preferred_contact: profileData.preferredContact,
        linkedin: profileData.linkedin,
        twitter: profileData.twitter,
        bio: profileData.bio,
        avatar: profileData.avatar,
        country: profileData.country,
        city: profileData.city,
        postal_code: profileData.postalCode,
        vat_number: profileData.vatNumber,
        business_type: profileData.businessType
      }
      
      // Update customer in database via API
      if (!customer?.id) {
        console.error('No customer ID available')
        return
      }
      
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Profile updated successfully:', result)
        
        // Update local customer data with response
        const updatedCustomer = result.customer
        setCustomer(updatedCustomer)
        
        // Update localStorage
        localStorage.setItem('customer', JSON.stringify(updatedCustomer))
        
        // Show success notification
        showSuccessNotification(
          'Profile Updated Successfully!',
          'Your profile information has been saved.'
        )
        
        setIsEditingProfile(false)
      } else {
        const error = await response.json()
        console.error('Failed to update profile:', error)
        alert(`Failed to update profile: ${error.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }

    try {
      // In a real app, this would call an API to change password
      console.log('Changing password for:', customer?.email)
      
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password. Please try again.')
    }
  }

  // Billing management functions
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false)
  const [showBillingSettingsDialog, setShowBillingSettingsDialog] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({
    cardType: 'visa',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    isDefault: false
  })
  const [billingSettingsData, setBillingSettingsData] = useState({
    emailInvoices: true,
    autoPayEnabled: false,
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    taxId: ''
  })
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)

  const handleAddPaymentMethod = async () => {
    if (!paymentFormData.cardNumber || !paymentFormData.expiryMonth || !paymentFormData.expiryYear || !customer) {
      alert('Please fill in all payment method fields')
      return
    }
    
    setIsAddingPayment(true)
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment-method',
          customerId: customer.id,
          ...paymentFormData
        })
      })
      
      const result = await response.json()
      if (result.success) {
        // Reload billing data
        const billingResponse = await fetch(`/api/billing?customerId=${customer.id}`)
        if (billingResponse.ok) {
          const billingResult = await billingResponse.json()
          if (billingResult.success) {
            setBillingData(billingResult.data)
          }
        }
        
        setShowAddPaymentDialog(false)
        setPaymentFormData({
          cardType: 'visa',
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          isDefault: false
        })
        alert('Payment method added successfully!')
      } else {
        alert('Failed to add payment method. Please try again.')
      }
    } catch (error) {
      console.error('Error adding payment method:', error)
      alert('Failed to add payment method. Please try again.')
    }
    setIsAddingPayment(false)
  }

  const handleUpdateBillingSettings = async () => {
    if (!customer) return
    
    setIsUpdatingSettings(true)
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'billing-settings',
          customerId: customer.id,
          ...billingSettingsData
        })
      })
      
      const result = await response.json()
      if (result.success) {
        // Reload billing data
        const billingResponse = await fetch(`/api/billing?customerId=${customer.id}`)
        if (billingResponse.ok) {
          const billingResult = await billingResponse.json()
          if (billingResult.success) {
            setBillingData(billingResult.data)
          }
        }
        
        setShowBillingSettingsDialog(false)
        alert('Billing settings updated successfully!')
      } else {
        alert('Failed to update billing settings. Please try again.')
      }
    } catch (error) {
      console.error('Error updating billing settings:', error)
      alert('Failed to update billing settings. Please try again.')
    }
    setIsUpdatingSettings(false)
  }

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return
    if (!customer) return
    
    try {
      const response = await fetch(`/api/billing/payment-method/${paymentMethodId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      if (result.success) {
        // Reload billing data
        const billingResponse = await fetch(`/api/billing?customerId=${customer.id}`)
        if (billingResponse.ok) {
          const billingResult = await billingResponse.json()
          if (billingResult.success) {
            setBillingData(billingResult.data)
          }
        }
        
        alert('Payment method removed successfully!')
      } else {
        alert('Failed to remove payment method. Please try again.')
      }
    } catch (error) {
      console.error('Error removing payment method:', error)
      alert('Failed to remove payment method. Please try again.')
    }
  }

  const handleGitHubConnect = async () => {
    if (!customer) return
    
    try {
      // Redirect to GitHub OAuth
      window.location.href = `/api/github/auth?customerId=${customer.id}`
    } catch (error) {
      console.error('Error connecting to GitHub:', error)
      alert('Failed to connect to GitHub. Please try again.')
    }
  }

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/download?fileId=${fileId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download file.')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleViewQuoteDetails = (quote: any) => {
    setSelectedQuote(quote)
    setIsQuoteDetailsOpen(true)
  }

  // Handle accepting a custom quote - creates project and quote
  const handleAcceptCustomQuote = async (customQuote: any) => {
    try {
      const response = await fetch('/api/custom-quotes/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customQuoteId: customQuote.id })
      })
      
      const result = await response.json()
      
      if (result.success) {
        showSuccessNotification(
          'Quote Accepted!',
          'Your project has been created and will begin shortly.'
        )
        // Refresh data
        if (customer) {
          const [quotesRes, customQuotesRes] = await Promise.all([
            fetch(`/api/quotes?customerId=${customer.id}`),
            fetch(`/api/custom-quotes?customerId=${customer.id}`)
          ])
          if (quotesRes.ok) {
            const quotesData = await quotesRes.json()
            setQuotes(quotesData.quotes || [])
          }
          if (customQuotesRes.ok) {
            const customQuotesData = await customQuotesRes.json()
            setCustomQuotes(customQuotesData.customQuotes || [])
          }
        }
      } else {
        alert(result.error || 'Failed to accept quote')
      }
    } catch (error) {
      console.error('Error accepting custom quote:', error)
      alert('An error occurred. Please try again.')
    }
  }

  // Handle declining a custom quote
  const handleDeclineCustomQuote = async (customQuote: any) => {
    if (!confirm('Are you sure you want to decline this quote?')) return
    
    try {
      const response = await fetch('/api/custom-quotes/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customQuoteId: customQuote.id })
      })
      
      const result = await response.json()
      
      if (result.success) {
        showSuccessNotification(
          'Quote Declined',
          'The quote has been declined. Feel free to request a new quote anytime.'
        )
        // Refresh custom quotes
        if (customer) {
          const customQuotesRes = await fetch(`/api/custom-quotes?customerId=${customer.id}`)
          if (customQuotesRes.ok) {
            const customQuotesData = await customQuotesRes.json()
            setCustomQuotes(customQuotesData.customQuotes || [])
          }
        }
      } else {
        alert(result.error || 'Failed to decline quote')
      }
    } catch (error) {
      console.error('Error declining custom quote:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleCancelQuote = (quoteId: string) => {
    console.log('Setting up cancel for quote:', quoteId)
    
    if (!quoteId || quoteId === 'undefined' || quoteId === 'null') {
      console.error('Cannot cancel quote: Invalid quote ID:', quoteId)
      alert('Error: Cannot cancel quote - invalid quote ID')
      return
    }
    
    // Check if this is a temporary ID and warn user
    if (quoteId.startsWith('TEMP-')) {
      console.log('Warning: Using temporary quote ID for cancellation')
    }
    
    const confirmCancel = async () => {
      console.log('confirmCancel called for quote:', quoteId)
      
      try {
        const response = await fetch(`/api/quotes/${quoteId}/cancel`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log('Cancel response status:', response.status)
        const result = await response.json()
        console.log('Cancel response data:', result)
        
        if (result.success) {
          // Show success message
          showSuccessNotification(
            'Quote Cancelled Successfully!',
            'Your quote has been cancelled and will no longer be processed.'
          )
          
          // Close the quote details modal if it's open
          setIsQuoteDetailsOpen(false)
          
          // Refresh quotes data
          if (customer) {
            console.log('Refreshing quotes for customer:', customer.id)
            const quotesResponse = await fetch(`/api/quotes?customerId=${customer.id}`)
            if (quotesResponse.ok) {
              const quotesData = await quotesResponse.json()
              console.log('Refreshed quotes data:', quotesData)
              setQuotes(quotesData.quotes || [])
            } else {
              console.error('Failed to refresh quotes:', quotesResponse.status)
            }
          }
        } else {
          console.error('Failed to cancel quote:', result.error)
          alert(`Failed to cancel quote: ${result.error || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Error canceling quote:', error)
        alert('Error canceling quote. Please try again.')
      }
    }
    
    // Store the confirmation function and open dialog
    console.log('About to store confirmation function')
    setPendingCancelQuoteId(quoteId)
    setConfirmCancelFunction(() => confirmCancel)
    console.log('Stored confirmation function, opening dialog')
    setIsConfirmDialogOpen(true)
  }

  const confirmCancelQuote = async () => {
    console.log('confirmCancelQuote called, confirmCancelFunction is:', confirmCancelFunction)
    if (!confirmCancelFunction) {
      console.error('No confirmation function available')
      return
    }
    
    await confirmCancelFunction()
  }

  // Helper function to show success notifications
  const showSuccessNotification = (title: string, message: string) => {
    setSuccessNotification({ title, message })
    setIsSuccessNotificationOpen(true)
  }

  // Notification system functions
  const fetchNotifications = async () => {
    if (!customer) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        
        // Also get unread count
        const unreadResponse = await fetch('/api/notifications?unreadOnly=true', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (unreadResponse.ok) {
          const unreadData = await unreadResponse.json()
          setUnreadCount(unreadData.unreadCount || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    if (!customer) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'markRead' })
      })
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    if (!customer) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'markAllRead' })
      })
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!customer) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Update local state
        const deletedNotification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const fetchBillingData = async () => {
    if (!customer) return
    
    try {
      const billingResponse = await fetch(`/api/billing?customerId=${customer.id}`)
      if (billingResponse.ok) {
        const billingResult = await billingResponse.json()
        if (billingResult.success) {
          setBillingData(billingResult.data)
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    }
  }

  const handlePayNow = async (invoiceId: string) => {
    console.log('🔄 Pay Now clicked for invoice:', invoiceId)
    console.log('👤 Customer ID:', customer?.id)
    
    try {
      setIsPaymentLoading(true)
      console.log('⏳ Setting loading state...')
      
      const requestBody = {
        invoice_id: invoiceId,
        action: 'pay_now',
        customer_id: customer?.id
      }
      console.log('📤 Sending request:', requestBody)
      
      const response = await fetch('/api/billing', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (data.success) {
        console.log('✅ Payment successful, refreshing data...')
        // Refresh billing data to show updated payment status
        await fetchBillingData()
        
        setSuccessNotification({
          title: 'Payment Processed',
          message: 'Your payment has been processed successfully!'
        })
        setIsSuccessNotificationOpen(true)
      } else {
        console.error('❌ Payment failed:', data.error)
        throw new Error(data.error || 'Payment failed')
      }
    } catch (error: any) {
      console.error('💥 Payment error:', error)
      setSuccessNotification({
        title: 'Payment Failed',
        message: `There was an error processing your payment: ${error?.message || 'Please try again.'}`
      })
      setIsSuccessNotificationOpen(true)
    } finally {
      console.log('🏁 Clearing loading state...')
      setIsPaymentLoading(false)
    }
  }

  const getProjectStats = () => {
    const totalQuotes = quotes.length
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length
    const approvedQuotes = quotes.filter(q => ['approved', 'accepted'].includes(q.status)).length
    const totalProjects = projects.length
    const activeProjects = projects.filter((p: any) => p.status === 'in_progress').length
    const completedProjects = projects.filter((p: any) => p.status === 'completed').length
    // Calculate total investment including paid deposits and final payments
    const totalValue = quotes.filter(q => ['accepted', 'in_progress', 'completed'].includes(q.status)).reduce((sum, q) => sum + q.estimatedCost, 0)
    
    // Invoice stats (normalize fields to camelCase locally)
    const invoices = (billingData.invoices as any[]).map((inv: any) => ({
      ...inv,
      dueDate: inv?.dueDate ?? inv?.due_date ?? null,
      depositPaid: inv?.depositPaid ?? inv?.deposit_paid ?? false,
      depositAmount: inv?.depositAmount ?? inv?.deposit_amount ?? (inv?.amount ? inv.amount * 0.2 : 0),
      remainingAmount: inv?.remainingAmount ?? inv?.remaining_amount ?? (inv?.amount ? inv.amount * 0.8 : 0),
    }))

    // Calculate actual paid amount (deposits + final payments)
    const totalPaidAmount = invoices.reduce((sum, inv) => {
      let paidAmount = 0
      if (inv.status === 'paid') {
        // Fully paid invoice
        paidAmount = inv.amount || 0
      } else if (inv.depositPaid) {
        // Only deposit paid
        paidAmount = inv.depositAmount || 0
      }
      return sum + paidAmount
    }, 0)

    // Total Amount Due across unpaid invoices (deposit due or remaining due)
    const totalAmountDue = invoices.reduce((sum, inv) => {
      if (inv.status === 'paid') return sum
      const due = !inv.depositPaid ? (inv.depositAmount || 0) : (inv.remainingAmount || 0)
      return sum + (due || 0)
    }, 0)

    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length
    const nextDueInvoice = invoices
      .filter(inv => inv.status === 'pending')
      .sort((a: any, b: any) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())[0]

    // Calculate actual amount due based on normalized fields
    const nextDueAmount = nextDueInvoice
      ? (!nextDueInvoice.depositPaid ? nextDueInvoice.depositAmount : nextDueInvoice.remainingAmount)
      : 0

    // Find the project status for the next due invoice
    let relatedProjectCompleted = false
    if (nextDueInvoice) {
      // Try to find the related project by matching invoice ID/quote ID to project quote_id
      const relatedProject = projects.find((p: any) => 
        String(p.quote_id) === String(nextDueInvoice.quoteId || nextDueInvoice.quote_id || nextDueInvoice.id)
      )
      
      // If no project found, check if the related quote is marked as completed
      if (!relatedProject) {
        const relatedQuote = quotes.find(q => 
          String(q.id || (q as any).quote_id) === String(nextDueInvoice.quoteId || nextDueInvoice.quote_id || nextDueInvoice.id)
        )
        relatedProjectCompleted = relatedQuote?.status === 'completed'
      } else {
        relatedProjectCompleted = relatedProject.status === 'completed'
      }
    }
    
    return { 
      totalQuotes, 
      pendingQuotes, 
      approvedQuotes,
      totalProjects, 
      activeProjects, 
      completedProjects, 
      totalValue,
      totalPaidAmount,
      totalAmountDue,
      overdueInvoices,
      pendingInvoices,
      nextDueInvoice,
      nextDueAmount,
      relatedProjectCompleted
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-300 border border-yellow-400/30'
      case 'approved': return 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/30'
      case 'under_review': return 'bg-blue-500/10 text-blue-300 border border-blue-400/30'
      case 'quoted': return 'bg-purple-500/10 text-purple-300 border border-purple-400/30'
      case 'accepted': return 'bg-green-500/10 text-green-300 border border-green-400/30'
      case 'in_progress': return 'bg-indigo-500/10 text-indigo-300 border border-indigo-400/30'
      case 'completed': return 'bg-teal-500/10 text-teal-300 border border-teal-400/30'
      case 'cancelled': return 'bg-red-500/10 text-red-300 border border-red-400/30'
      default: return 'bg-gray-500/10 text-gray-300 border border-gray-400/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'under_review': return <Eye className="w-4 h-4" />
      case 'quoted': return <FileText className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <Package className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

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

  if (!customer) {
    return null
  }

  const stats = getProjectStats()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar for Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 hidden lg:flex flex-col z-40">
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <CodeIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-white">Lumora Pro</h1>
              <p className="text-xs text-slate-400">Client Portal</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
        
        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{customer.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{customer.name}</p>
              <p className="text-xs text-slate-400 truncate">{customer.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <CodeIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-white">Lumora Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
            onDelete={deleteNotification}
            onRefresh={fetchNotifications}
          />
          <Button onClick={handleLogout} size="sm" variant="ghost" className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-40 px-2 flex items-center justify-around">
        {tabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>

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
                {activeTab === 'overview' && `Welcome back, ${customer.name?.split(' ')[0]}!`}
                {activeTab === 'quotes' && 'Your Quotes'}
                {activeTab === 'invoices' && 'Invoices & Payments'}
                {activeTab === 'projects' && 'Your Projects'}
                {activeTab === 'billing' && 'Billing & Payments'}
                {activeTab === 'profile' && 'Your Profile'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-slate-400 mt-1 text-sm lg:text-base">
                {activeTab === 'overview' && 'Here\'s what\'s happening with your projects'}
                {activeTab === 'quotes' && 'Manage and track all your quote requests'}
                {activeTab === 'invoices' && 'View and pay your invoices'}
                {activeTab === 'projects' && 'Track progress on your active projects'}
                {activeTab === 'billing' && 'Manage payment methods and billing info'}
                {activeTab === 'profile' && 'Update your personal information'}
                {activeTab === 'settings' && 'Configure your account preferences'}
              </p>
            </motion.div>
            
            <div className="hidden lg:flex items-center gap-3">
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
                onDelete={deleteNotification}
                onRefresh={fetchNotifications}
              />
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
              <div className="space-y-6">
                {/* Key Metrics - Modern Glass Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-5 hover:border-cyan-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                      </div>
                      {stats.completedProjects > 0 && (
                        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                          +{stats.completedProjects} done
                        </span>
                      )}
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats.activeProjects}</p>
                    <p className="text-sm text-slate-400 mt-1">Active Projects</p>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-5 hover:border-amber-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{formatCurrency(stats.totalAmountDue)}</p>
                    <p className="text-sm text-slate-400 mt-1">Amount Due</p>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-5 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{formatCurrency(stats.totalPaidAmount)}</p>
                    <p className="text-sm text-slate-400 mt-1">Total Invested</p>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-5 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stats.pendingInvoices > 0 ? 'bg-purple-500/20' : 'bg-slate-700/50'
                      }`}>
                        <CreditCard className={`w-5 h-5 ${
                          stats.pendingInvoices > 0 ? 'text-purple-400' : 'text-slate-500'
                        }`} />
                      </div>
                      {stats.pendingInvoices > 0 && (
                        <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
                          Action needed
                        </span>
                      )}
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stats.pendingInvoices}</p>
                    <p className="text-sm text-slate-400 mt-1">Pending Invoices</p>
                  </div>
                </div>

                {/* Payment Alert Banner */}
                {(stats.overdueInvoices > 0 || (stats.nextDueInvoice && (!stats.nextDueInvoice.depositPaid || stats.relatedProjectCompleted))) && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Payment Action Required</h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {stats.overdueInvoices > 0 
                              ? `You have ${stats.overdueInvoices} overdue invoice${stats.overdueInvoices > 1 ? 's' : ''}`
                              : !stats.nextDueInvoice?.depositPaid 
                                ? 'Project deposit required to begin work'
                                : 'Final payment due for completed project'
                            }
                          </p>
                          {stats.nextDueAmount > 0 && (
                            <p className="text-xl font-bold text-amber-400 mt-2">{formatCurrency(stats.nextDueAmount)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 lg:flex-shrink-0">
                        <Button 
                          onClick={() => setActiveTab('invoices')}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          onClick={() => setActiveTab('billing')}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Recent Activity */}
                  <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Recent Activity
                      </h3>
                      {quotes.length > 0 && (
                        <button 
                          onClick={() => setActiveTab('quotes')}
                          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          View all
                        </button>
                      )}
                    </div>
                    
                    {quotes.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                          <Activity className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 mb-4">No recent activity yet</p>
                        <Button 
                          onClick={() => setIsQuoteModalOpen(true)}
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Request Your First Quote
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {quotes.slice(0, 4).map((quote, index) => (
                          <div 
                            key={`activity-${quote.id || index}`} 
                            className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                            onClick={() => handleViewQuoteDetails(quote)}
                          >
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                Quote #{(quote.quote_id || quote.id || '').toString().slice(-8)}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(quote.createdAt).toLocaleDateString('en-GB', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              quote.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              quote.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400' :
                              quote.status === 'accepted' ? 'bg-purple-500/20 text-purple-400' :
                              quote.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-600/50 text-slate-400'
                            }`}>
                              {(quote.status || '').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-purple-400" />
                      Quick Actions
                    </h3>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => setIsQuoteModalOpen(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">New Quote</p>
                          <p className="text-xs text-slate-400">Request project estimate</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('projects')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">View Projects</p>
                          <p className="text-xs text-slate-400">Track progress</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('invoices')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">Manage Billing</p>
                          <p className="text-xs text-slate-400">Payments & invoices</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">Account Settings</p>
                          <p className="text-xs text-slate-400">Update profile</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Project Status Summary */}
                {stats.activeProjects > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                        Project Status
                      </h3>
                      <button 
                        onClick={() => setActiveTab('projects')}
                        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        View all
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 lg:gap-4">
                      <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <p className="text-2xl lg:text-3xl font-bold text-cyan-400">{stats.activeProjects}</p>
                        <p className="text-xs lg:text-sm text-slate-400 mt-1">In Progress</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-2xl lg:text-3xl font-bold text-emerald-400">{stats.completedProjects}</p>
                        <p className="text-xs lg:text-sm text-slate-400 mt-1">Completed</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <p className="text-2xl lg:text-3xl font-bold text-purple-400">{stats.totalQuotes}</p>
                        <p className="text-xs lg:text-sm text-slate-400 mt-1">Total Quotes</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent rounded-2xl p-6 lg:p-8 border border-slate-700/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl lg:text-3xl font-bold text-white">{customer?.name?.charAt(0) || 'U'}</span>
                      </div>
                      <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-white">{customer?.name || 'Your Profile'}</h2>
                        <p className="text-slate-400 mt-1">{customer?.email}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-slate-500">
                            {customer?.company && `${customer.company} • `}
                            Member since {new Date().getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                      onClick={() => {
                        if (isEditingProfile) {
                          handleProfileSave()
                        } else {
                          const nameParts = (customer?.name || authCustomer?.name || '').split(' ')
                          setProfileData({
                            firstName: nameParts[0] || '',
                            lastName: nameParts.slice(1).join(' ') || '',
                            email: customer?.email || authCustomer?.email || '',
                            company: customer?.company || authCustomer?.company || '',
                            phone: customer?.phone || '',
                            address: customer?.address || '',
                            website: customer?.website || '',
                            jobTitle: customer?.jobTitle || '',
                            industry: customer?.industry || '',
                            companySize: customer?.companySize || '',
                            timezone: customer?.timezone || '',
                            preferredContact: customer?.preferredContact || 'email',
                            linkedin: customer?.linkedin || '',
                            twitter: customer?.twitter || '',
                            bio: customer?.bio || '',
                            avatar: customer?.avatar || '',
                            country: customer?.country || '',
                            city: customer?.city || '',
                            postalCode: customer?.postalCode || '',
                            vatNumber: customer.vatNumber || '',
                            businessType: customer.businessType || 'individual'
                          })
                          setIsEditingProfile(true)
                        }
                      }}
                    >
                      {isEditingProfile ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Profile Information</h3>
                    <div className="space-y-6">
                    {isEditingProfile ? (
                      <div className="grid gap-6">
                        {/* Basic Information */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-primary" />
                            Basic Information
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">First Name *</label>
                              <Input
                                value={profileData.firstName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                placeholder="Your first name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Last Name *</label>
                              <Input
                                value={profileData.lastName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                placeholder="Your last name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Email *</label>
                              <Input
                                value={profileData.email}
                                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="your@email.com"
                                type="email"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Phone</label>
                              <Input
                                value={profileData.phone}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+44 123 456 7890"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Preferred Contact</label>
                              <select
                                value={profileData.preferredContact}
                                onChange={(e) => setProfileData(prev => ({ ...prev, preferredContact: e.target.value }))}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                              >
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="both">Both</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Business Information */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-primary" />
                            Business Information
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Business Type</label>
                              <select
                                value={profileData.businessType}
                                onChange={(e) => setProfileData(prev => ({ ...prev, businessType: e.target.value }))}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                              >
                                <option value="individual">Individual</option>
                                <option value="small_business">Small Business</option>
                                <option value="medium_business">Medium Business</option>
                                <option value="enterprise">Enterprise</option>
                                <option value="startup">Startup</option>
                                <option value="non_profit">Non-Profit</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Company Name</label>
                              <Input
                                value={profileData.company}
                                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                                placeholder="Your company name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Job Title</label>
                              <Input
                                value={profileData.jobTitle}
                                onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                placeholder="CEO, CTO, Marketing Manager, etc."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Industry</label>
                              <Input
                                value={profileData.industry}
                                onChange={(e) => setProfileData(prev => ({ ...prev, industry: e.target.value }))}
                                placeholder="Technology, Healthcare, Finance, etc."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Company Size</label>
                              <select
                                value={profileData.companySize}
                                onChange={(e) => setProfileData(prev => ({ ...prev, companySize: e.target.value }))}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                              >
                                <option value="">Select size</option>
                                <option value="1">Just me</option>
                                <option value="2-10">2-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="500+">500+ employees</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">VAT Number</label>
                              <Input
                                value={profileData.vatNumber}
                                onChange={(e) => setProfileData(prev => ({ ...prev, vatNumber: e.target.value }))}
                                placeholder="GB123456789 (if applicable)"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Location Information */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-primary" />
                            Location & Address
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Country</label>
                              <Input
                                value={profileData.country}
                                onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                                placeholder="United Kingdom"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">City</label>
                              <Input
                                value={profileData.city}
                                onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="London"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Postal Code</label>
                              <Input
                                value={profileData.postalCode}
                                onChange={(e) => setProfileData(prev => ({ ...prev, postalCode: e.target.value }))}
                                placeholder="SW1A 1AA"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Timezone</label>
                              <select
                                value={profileData.timezone}
                                onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                              >
                                <option value="">Select timezone</option>
                                <option value="GMT">GMT (London)</option>
                                <option value="EST">EST (New York)</option>
                                <option value="PST">PST (Los Angeles)</option>
                                <option value="CET">CET (Paris)</option>
                                <option value="JST">JST (Tokyo)</option>
                                <option value="AEST">AEST (Sydney)</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Full Address</label>
                            <Textarea
                              value={profileData.address}
                              onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Your complete business address"
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Online Presence */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-primary" />
                            Online Presence
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Website</label>
                              <Input
                                value={profileData.website}
                                onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                                placeholder="https://yourwebsite.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">LinkedIn</label>
                              <Input
                                value={profileData.linkedin}
                                onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                                placeholder="https://linkedin.com/in/yourprofile"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Twitter</label>
                              <Input
                                value={profileData.twitter}
                                onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                                placeholder="@yourusername"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Bio / About</label>
                            <Textarea
                              value={profileData.bio}
                              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                              placeholder="Tell us about yourself and your business..."
                              rows={4}
                            />
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button onClick={handleProfileSave} className="btn-gradient">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-primary" />
                            Basic Information
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">First Name</p>
                                <p className="font-medium">{customer.name?.split(' ')[0] || ''}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Last Name</p>
                                <p className="font-medium">{customer.name?.split(' ').slice(1).join(' ') || ''}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{customer.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Phone className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{customer.phone || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <MessageSquare className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Preferred Contact</p>
                                <p className="font-medium capitalize">{customer.preferredContact || 'Email'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Business Information */}
                        <div className="border-t pt-6">
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-primary" />
                            Business Information
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3">
                              <Building2 className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Business Type</p>
                                <p className="font-medium capitalize">{customer.businessType?.replace('_', ' ') || 'Individual'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Building className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Company Name</p>
                                <p className="font-medium">{customer.company || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Briefcase className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Job Title</p>
                                <p className="font-medium">{customer.jobTitle || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Building2 className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Industry</p>
                                <p className="font-medium">{customer.industry || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Users className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Company Size</p>
                                <p className="font-medium">{customer.companySize || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">VAT Number</p>
                                <p className="font-medium">{customer.vatNumber || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Location & Address */}
                        <div className="border-t pt-6">
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-primary" />
                            Location & Address
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3">
                              <Globe className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Country</p>
                                <p className="font-medium">{customer.country || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">City</p>
                                <p className="font-medium">{customer.city || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Postal Code</p>
                                <p className="font-medium">{customer.postalCode || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Timezone</p>
                                <p className="font-medium">{customer.timezone || 'GMT (London)'}</p>
                              </div>
                            </div>
                            
                            {customer.address && (
                              <div className="flex items-start space-x-3 md:col-span-2">
                                <Home className="w-5 h-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                  <p className="text-sm text-muted-foreground">Full Address</p>
                                  <p className="font-medium">{customer.address}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Online Presence */}
                        <div className="border-t pt-6">
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-primary" />
                            Online Presence
                          </h4>
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                              {customer.website && (
                                <div className="flex items-center space-x-3">
                                  <Globe className="w-5 h-5 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Website</p>
                                    <p className="font-medium">
                                      <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {customer.website}
                                      </a>
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {customer.linkedin && (
                                <div className="flex items-center space-x-3">
                                  <Linkedin className="w-5 h-5 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">LinkedIn</p>
                                    <p className="font-medium">
                                      <a href={customer.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {customer.linkedin}
                                      </a>
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {customer.twitter && (
                                <div className="flex items-center space-x-3">
                                  <Twitter className="w-5 h-5 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">Twitter</p>
                                    <p className="font-medium">
                                      <a href={customer.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {customer.twitter}
                                      </a>
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {customer.bio && (
                              <div className="flex items-start space-x-3">
                                <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                  <p className="text-sm text-muted-foreground">Bio / About</p>
                                  <p className="font-medium whitespace-pre-wrap">{customer.bio}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Show placeholders for empty online presence fields */}
                            {!customer.website && !customer.linkedin && !customer.twitter && !customer.bio && (
                              <div className="text-center py-8 text-muted-foreground">
                                <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No online presence information provided</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Account Information */}
                        <div className="border-t pt-6">
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-primary" />
                            Account Information
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Member Since</p>
                                <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>

                {/* Password Change Section */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    Security Settings
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">Keep your account secure by updating your password regularly</p>
                  
                  {!isChangingPassword ? (
                    <Button
                      onClick={() => setIsChangingPassword(true)}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                        <Input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                        <Input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                        <Input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          onClick={handlePasswordChange} 
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Update Password
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          onClick={() => {
                            setIsChangingPassword(false)
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}

            {/* Quotes Tab */}
            {activeTab === 'quotes' && (
              <div className="space-y-6">
                {/* Request New Quote CTA */}
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Need a New Quote?</h3>
                        <p className="text-slate-400 text-sm">Choose from packages or request a custom solution</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold px-6"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Request Quote
                    </Button>
                  </div>
                </div>

                {/* Custom Quote Requests Section - Show First */}
                {customQuotes.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-4 lg:p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-orange-400" />
                        Custom Quote Requests
                      </h3>
                      <span className="text-sm text-slate-400">{customQuotes.length} request{customQuotes.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-4">
                      {customQuotes
                        .slice()
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((cq, index) => (
                        <div
                          key={`custom-quote-${cq.id || index}`}
                          className="p-4 lg:p-6 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-xl"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                            <div>
                              <h4 className="font-semibold text-white">{cq.project_title}</h4>
                              <p className="text-sm text-slate-400">
                                {new Date(cq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <Badge className={
                              cq.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              cq.status === 'reviewing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              cq.status === 'quoted' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              cq.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              cq.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            }>
                              {cq.status === 'pending' ? 'Awaiting Review' :
                               cq.status === 'reviewing' ? 'Under Review' :
                               cq.status === 'quoted' ? 'Quote Ready' :
                               cq.status === 'approved' ? 'Approved' :
                               cq.status === 'rejected' ? 'Rejected' :
                               cq.status.charAt(0).toUpperCase() + cq.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-slate-300 mb-4 line-clamp-2">{cq.project_description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                              {cq.project_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                            {cq.budget_range && (
                              <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                                Budget: £{cq.budget_range.replace('-', ' - £').replace('+', '+')}
                              </span>
                            )}
                            {cq.preferred_timeline && (
                              <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                                {cq.preferred_timeline.replace(/-/g, ' ')}
                              </span>
                            )}
                          </div>

                          {/* Show quoted price and accept/decline buttons when status is 'quoted' */}
                          {cq.status === 'quoted' && cq.quoted_price && (
                            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-purple-400 font-medium">Your Quote is Ready!</span>
                                <span className="text-2xl font-bold text-purple-400">£{Number(cq.quoted_price).toLocaleString()}</span>
                              </div>
                              {cq.quoted_timeline && (
                                <p className="text-sm text-slate-400 mb-4">Estimated Timeline: {cq.quoted_timeline}</p>
                              )}
                              {cq.admin_notes && (
                                <p className="text-sm text-slate-300 mb-4 p-3 bg-slate-800/50 rounded-lg">{cq.admin_notes}</p>
                              )}
                              <div className="flex gap-3">
                                <Button 
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                  onClick={() => handleAcceptCustomQuote(cq)}
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Accept Quote
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  onClick={() => handleDeclineCustomQuote(cq)}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          )}

                          {cq.status === 'approved' && cq.quoted_price && (
                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-green-400 font-medium">Accepted - Project Started!</span>
                                <span className="text-xl font-bold text-green-400">£{Number(cq.quoted_price).toLocaleString()}</span>
                              </div>
                              {cq.quoted_timeline && (
                                <p className="text-sm text-slate-400 mt-1">Timeline: {cq.quoted_timeline}</p>
                              )}
                            </div>
                          )}

                          {cq.status === 'pending' && (
                            <div className="flex items-center gap-2 text-sm text-yellow-400">
                              <Clock className="w-4 h-4" />
                              <span>Our team will review your request within 24-48 hours</span>
                            </div>
                          )}

                          {cq.status === 'rejected' && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <p className="text-red-400 text-sm">This request was declined. Please contact us for more information.</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standard Quotes Section - Only show if user has quotes OR no custom quotes */}
                {(quotes.length > 0 || customQuotes.length === 0) && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Your Quotes
                    </h3>
                    <span className="text-sm text-slate-400">{quotes.length} total</span>
                  </div>
                  <div>
                    {quotes.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Quotes Yet</h3>
                        <p className="text-slate-400 mb-6">
                          Start by requesting your first quote
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white" 
                          onClick={() => setIsQuoteModalOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Request New Quote
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {quotes
                          .slice()
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((quote, index) => (
                          <div
                            key={`quote-${quote.id || index}`}
                            className="p-4 lg:p-6 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-cyan-500/30 transition-all duration-300"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                              <div>
                                <h4 className="font-semibold text-white">Quote #{(quote.quote_id || quote.id || '').toString().slice(-8)}</h4>
                                <p className="text-sm text-slate-400">{new Date(quote.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="text-xl lg:text-2xl font-bold text-cyan-400">
                                  {formatCurrency(quote.estimatedCost)}
                                </div>
                                <div className="text-sm text-slate-400">
                                  {quote.estimatedTimeline || 'Timeline TBD'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Package and Features Information */}
                            {(quote.selectedPackage || (quote.selectedFeatures && quote.selectedFeatures.length > 0)) && (
                              <div className="mb-4 p-3 lg:p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
                                {quote.selectedPackage && (
                                  <div className="mb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                      <h5 className="font-semibold text-cyan-400 flex items-center">
                                        <Package className="w-4 h-4 mr-2" />
                                        {quote.selectedPackage.name}
                                      </h5>
                                      <span className="text-xs text-slate-400">
                                        {quote.selectedPackage.category} • {quote.selectedPackage.deliveryTime}
                                      </span>
                                    </div>
                                    {quote.selectedPackage.complexity && (
                                      <div className="text-xs text-purple-400">
                                        Complexity: {quote.selectedPackage.complexity}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Features */}
                                {((quote.selectedPackage?.features && quote.selectedPackage.features.length > 0) || 
                                  (quote.selectedFeatures && quote.selectedFeatures.length > 0)) && (
                                  <div>
                                    <h6 className="text-xs font-medium text-slate-400 mb-2">Included Features:</h6>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(quote.selectedPackage?.features || quote.selectedFeatures || []).slice(0, 6).map((feature: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-lg border border-cyan-500/20"
                                        >
                                          {typeof feature === 'string' ? feature : feature?.name || 'Feature'}
                                        </span>
                                      ))}
                                      {(quote.selectedPackage?.features || quote.selectedFeatures || []).length > 6 && (
                                        <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-lg">
                                          +{(quote.selectedPackage?.features || quote.selectedFeatures || []).length - 6} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                quote.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                quote.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400' :
                                quote.status === 'accepted' ? 'bg-purple-500/20 text-purple-400' :
                                quote.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-600/50 text-slate-400'
                              }`}>
                                {(quote.status || '').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewQuoteDetails(quote)}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                )}
                
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      Your Invoices
                    </h3>
                    <span className="text-sm text-slate-400">View and pay your invoices</span>
                  </div>
                  <div>
                    {quotes.filter(q => ['quoted', 'accepted', 'approved'].includes(q.status)).length === 0 ? (
                      <div className="text-center py-12">
                        <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Your approved quotes will appear here as payable invoices
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Once your quote is approved by admin, it will become a payable invoice
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {quotes.filter(q => ['quoted', 'accepted', 'approved'].includes(q.status)).map((quote, index) => (
                          <div
                            key={`invoice-${quote.id || index}`}
                            className="p-6 border border-border rounded-lg hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{quote.id}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Created {new Date(quote.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  {formatCurrency(quote.estimatedCost)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {quote.status === 'quoted' ? 'Ready to Pay' : 'Invoice'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Package Information */}
                            {quote.selectedPackage && (
                              <div className="bg-gradient-to-r from-cyber-mint/10 to-cosmic-blue/10 border border-cyber-mint/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center mb-2">
                                  <Package className="w-4 h-4 text-cyber-mint mr-2" />
                                  <h4 className="font-medium text-cyber-mint">Package Details</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="font-medium text-silver-glow">{quote.selectedPackage.name}</p>
                                    <p className="text-xs text-silver-glow/70">{quote.selectedPackage.category} • {quote.selectedPackage.deliveryTime}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-silver-glow/70">Complexity: {quote.selectedPackage.complexity}</p>
                                  </div>
                                </div>
                                {quote.selectedPackage.features && quote.selectedPackage.features.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium text-silver-glow mb-2">Included Features:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {quote.selectedPackage.features.slice(0, 6).map((feature: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-cosmic-blue/20 text-cosmic-blue text-xs rounded border border-cosmic-blue/30"
                                        >
                                          {typeof feature === 'string' ? feature : feature?.name || 'Feature'}
                                        </span>
                                      ))}
                                      {quote.selectedPackage.features.length > 6 && (
                                        <span className="px-2 py-1 bg-silver-glow/20 text-silver-glow text-xs rounded">
                                          +{quote.selectedPackage.features.length - 6} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Payment Structure (restyled) */}
                            <div className="bg-gradient-to-r from-cyber-mint/10 to-cosmic-blue/10 border border-cyber-mint/20 rounded-lg p-4 mb-4">
                              <div className="flex items-center mb-2">
                                <Info className="w-4 h-4 text-cyber-mint mr-2" />
                                <h4 className="font-medium text-cyber-mint">Payment Structure</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-green-200 font-medium">20% Deposit Required</p>
                                    {(() => {
                                      // Find corresponding invoice for this quote via quoteId or id
                                      const correspondingInvoice = billingData?.invoices?.find((inv: any) =>
                                        String(inv.quoteId || inv.quote_id) === String(quote.id || quote.quote_id) ||
                                        String(inv.id) === String(quote.id || quote.quote_id)
                                      )
                                      const isDepositPaid = correspondingInvoice?.depositPaid || false
                                      
                                      if (isDepositPaid) {
                                        return (
                                          <div className="px-3 py-1 bg-green-500/20 text-green-200 border border-green-400/30 rounded text-xs font-semibold">
                                            ✓ Paid
                                          </div>
                                        )
                                      } else {
                                        return (
                                          <Button 
                                            size="sm" 
                                            className="btn-gradient px-3 py-1 text-xs"
                                            onClick={() => {
                                              console.log('💳 Deposit Pay Now clicked from Invoices tab:', quote)
                                              const invId = correspondingInvoice?.id || (((billingData?.invoices as any[]) || [])
                                                .filter((inv: any) => (inv?.status ?? 'pending') !== 'paid' && !(inv?.depositPaid ?? false))
                                                .sort((a: any, b: any) => new Date(a?.issueDate || a?.dueDate || 0).getTime() - new Date(b?.issueDate || b?.dueDate || 0).getTime())
                                                .map((inv: any) => inv?.id)
                                                .pop())
                                              if (invId) {
                                                handlePayNow(invId)
                                              } else {
                                                console.error('No corresponding invoice found for payment')
                                                setSuccessNotification({
                                                  title: 'No Invoice Found',
                                                  message: 'We could not find an invoice for this quote. Please contact support.'
                                                })
                                                setIsSuccessNotificationOpen(true)
                                              }
                                            }}
                                            disabled={isPaymentLoading}
                                          >
                                            {isPaymentLoading ? 'Processing...' : 'Pay Now'}
                                          </Button>
                                        )
                                      }
                                    })()}
                                  </div>
                                  <p className="text-white">{formatCurrency(quote.estimatedCost * 0.2)}</p>
                                  <p className="text-xs text-white/80 mt-1">Due before work starts</p>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-green-200 font-medium">Remaining Amount (80%)</p>
                                    {(() => {
                                      const correspondingInvoice = billingData?.invoices?.find((inv: any) =>
                                        String(inv.quoteId || inv.quote_id) === String(quote.id || quote.quote_id) ||
                                        String(inv.id) === String(quote.id || quote.quote_id)
                                      )
                                      const isDepositPaid = correspondingInvoice?.depositPaid || false
                                      const isFullyPaid = correspondingInvoice?.status === 'paid'
                                      const relatedProject = projects.find((p: any) => String(p.quote_id) === String(quote.id || (quote as any).quote_id))
                                      const isProjectCompleted = (relatedProject?.status || '') === 'completed'
                                      
                                      if (isFullyPaid) {
                                        return (
                                          <div className="px-3 py-1 bg-green-500/20 text-green-200 border border-green-400/30 rounded text-xs font-semibold">
                                            ✓ Paid
                                          </div>
                                        )
                                      } else if (isDepositPaid) {
                                        return (
                                          <Button 
                                            size="sm" 
                                            className={`btn-gradient px-3 py-1 text-xs ${!isProjectCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => {
                                              console.log('💳 Pay Remaining clicked from Invoices tab:', quote)
                                              const invId = correspondingInvoice?.id || (((billingData?.invoices as any[]) || [])
                                                .filter((inv: any) => (inv?.status ?? 'pending') !== 'paid' && !!(inv?.depositPaid ?? false))
                                                .sort((a: any, b: any) => new Date(a?.issueDate || a?.dueDate || 0).getTime() - new Date(b?.issueDate || b?.dueDate || 0).getTime())
                                                .map((inv: any) => inv?.id)
                                                .pop())
                                              if (invId) {
                                                handlePayNow(invId)
                                              } else {
                                                console.error('No corresponding invoice found for remaining payment')
                                                setSuccessNotification({
                                                  title: 'No Invoice Found',
                                                  message: 'We could not find an invoice for this quote. Please contact support.'
                                                })
                                                setIsSuccessNotificationOpen(true)
                                              }
                                            }}
                                            disabled={isPaymentLoading || !isProjectCompleted}
                                            title={isProjectCompleted ? undefined : 'Pay Remaining becomes available when the project is marked as completed.'}
                                          >
                                            {isPaymentLoading ? 'Processing...' : 'Pay Remaining'}
                                          </Button>
                                        )
                                      } else {
                                        return (
                                          <div className="px-3 py-1 bg-white/10 text-white/80 border border-white/20 rounded text-xs">
                                            Awaiting Deposit
                                          </div>
                                        )
                                      }
                                    })()}
                                  </div>
                                  <p className="text-white">{formatCurrency(quote.estimatedCost * 0.8)}</p>
                                  <p className="text-xs text-white/80 mt-1">Due upon completion</p>
                                </div>
                              </div>
                            </div>
                            
                            {(() => {
                              const quoteId = (quote as any).quote_id || quote.id
                              return (
                                <div className="mt-2 text-xs text-muted-foreground text-center">
                                  For bank transfer, use your quote ID as the payment reference: <span className="font-medium">{quoteId}</span>
                                </div>
                              )
                            })()}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Badge className={getStatusColor(quote.status)}>
                                    {(quote.status || '').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  className="btn-gradient text-white"
                                  size="sm"
                                  onClick={() => {
                                    console.log('🔍 View Invoice clicked:', { id: quote.id, quote_id: quote.quote_id, quote })
                                    const invoiceId = quote.id || quote.quote_id
                                    if (invoiceId) {
                                      router.push(`/client/invoice/${invoiceId}`)
                                    } else {
                                      console.error('❌ No invoice ID found:', quote)
                                    }
                                  }}
                                >
                                  View Invoice
                                </Button>
                                
                              </div>
                              
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                      Your Projects
                    </h3>
                    <span className="text-sm text-slate-400">Track progress on all your projects</span>
                  </div>
                  <div>
                    {(() => {
                      const projectQuotes = projects.length > 0
                        ? quotes.filter(q => projects.some((p: any) => p.quote_id === (q.id || (q as any).quote_id)))
                        : quotes.filter(q => ['approved', 'accepted', 'in_progress', 'completed'].includes(q.status))
                      console.log('🏗️ Project quotes found:', projectQuotes)
                      console.log('📊 All quote statuses:', quotes.map(q => ({ id: q.id, status: q.status })))
                      console.log('📁 Projects available:', projects.length)
                      return projectQuotes.length === 0 && projects.length === 0
                    })() ? (
                      <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Active Projects Yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Your approved and active quotes will appear here as projects
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submit a quote request to get started with your project
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projects.length > 0 ? (
                          projects.map((p: any, index: number) => {
                            const relatedQuote = quotes.find(q => (q.id || (q as any).quote_id) === p.quote_id)
                            return (
                              <div
                                key={`project-${p.id || index}`}
                                className="p-6 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    {(p.name || (p as any).project_name) && (
                                      <h2 className="font-bold text-xl text-cyber-mint mb-1">{p.name || (p as any).project_name}</h2>
                                    )}
                                    <h3 className="font-semibold text-lg">{p.quote_id || p.name || `Project ${p.id}`}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Created {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center space-x-2">
                                      <Badge className={getStatusColor(p.status)}>
                                        {(String(p.status || '')).split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Project Progress</span>
                                    <span className="text-sm text-gray-500">{typeof p.progress === 'number' ? `${Math.min(Math.max(p.progress, 0), 100)}%` : '0%'}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        (typeof p.progress === 'number' && p.progress >= 100) || p.status === 'completed' ? 'bg-green-500' :
                                        (typeof p.progress === 'number' && p.progress >= 50) || p.status === 'in_progress' ? 'bg-blue-500' :
                                        'bg-primary'
                                      }`}
                                      style={{ width: typeof p.progress === 'number' ? `${Math.min(Math.max(p.progress, 0), 100)}%` : '0%' }}
                                    ></div>
                                  </div>
                                </div>


                                <div className="flex flex-wrap gap-2 mb-4">
                                  {(() => {
                                    const features = Array.isArray((relatedQuote as any)?.selectedFeatures)
                                      ? (relatedQuote as any).selectedFeatures
                                      : Array.isArray((p as any)?.features)
                                        ? (p as any).features
                                        : []
                                    return features.map((feature: string, i: number) => (
                                      <span key={`feat-${i}`} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                                        {String(feature).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </span>
                                    ))
                                  })()}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {relatedQuote && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleViewQuoteDetails(relatedQuote)}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      if (p.github_url) {
                                        window.open(p.github_url, '_blank')
                                      } else {
                                        setGithubNotSetProject(p)
                                        setShowGithubNotSetModal(true)
                                      }
                                    }}
                                  >
                                    <Code className="w-4 h-4 mr-2" />
                                    GitHub
                                  </Button>
                                  {p.status === 'completed' && (
                                    <Button variant="outline" size="sm">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          quotes.filter(q => ['approved', 'accepted', 'in_progress', 'completed'].includes(q.status)).map((quote, index) => (
                            <div
                              key={`project-quote-${quote.id || index}`}
                              className="p-6 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                            >
                              {/* Fallback rendering from quotes (no projects data available) */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{quote.id}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Created {new Date(quote.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getStatusColor(quote.status)}>
                                      {(quote.status || '').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {/* Simple progress approximation */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Project Progress</span>
                                  <span className="text-sm text-gray-500">
                                    {quote.status === 'approved' ? '10%' : 
                                     quote.status === 'accepted' ? '25%' : 
                                     quote.status === 'in_progress' ? '60%' : 
                                     quote.status === 'completed' ? '100%' : '0%'}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      quote.status === 'completed' ? 'bg-green-500' :
                                      quote.status === 'in_progress' ? 'bg-blue-500' :
                                      'bg-primary'
                                    }`}
                                    style={{
                                      width: quote.status === 'approved' ? '10%' : 
                                             quote.status === 'accepted' ? '25%' : 
                                             quote.status === 'in_progress' ? '60%' : 
                                             quote.status === 'completed' ? '100%' : '0%'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Files Tab removed */}

            {/* Messages Tab removed - using chat widget instead */}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Bank Transfer Details */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Bank Transfer Details
                  </h3>
                  
                  <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 rounded-xl p-4 lg:p-6">
                    <p className="text-sm text-slate-400 mb-4">Use these details to pay via bank transfer:</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-cyan-400 font-medium">Currency</span>
                        <span className="text-white">British Pound (GBP)</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-cyan-400 font-medium">Account Name</span>
                        <span className="text-white">Daniel James</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-cyan-400 font-medium">Account Number</span>
                        <span className="text-white font-mono">84726350</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-cyan-400 font-medium">Sort Code</span>
                        <span className="text-white font-mono">04-29-09</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-cyan-400 font-medium">Bank</span>
                        <span className="text-white">Revolut Ltd</span>
                      </div>
                      <div className="py-2 border-b border-slate-700/50">
                        <div className="text-cyan-400 font-medium mb-1">Bank Address</div>
                        <div className="text-slate-300 text-sm">30 South Colonnade, E14 5HX, London, United Kingdom</div>
                      </div>
                      <div className="py-2">
                        <div className="text-cyan-400 font-medium mb-1">Reference</div>
                        <div className="text-white font-mono bg-slate-700/50 px-3 py-2 rounded-lg inline-block">Use your quote ID</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PayPal Section */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">PayPal Checkout</h3>
                  {!paypalClientId ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <p className="text-amber-400 text-sm">PayPal checkout is not configured yet. It will be available once credentials are added.</p>
                      <Button disabled className="mt-3 opacity-50 cursor-not-allowed bg-slate-700 text-slate-400">
                        Pay with PayPal
                      </Button>
                    </div>
                  ) : (
                    <div id="paypal-buttons-billing" />
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Account Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-white">Email Notifications</h4>
                        <p className="text-sm text-slate-400">Receive updates about your projects</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-400">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Shield className="w-4 h-4 mr-2" />
                        Enable
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-white">Export Data</h4>
                        <p className="text-sm text-slate-400">Download your account data</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* GitHub Repository Not Set Modal */}
      <AnimatePresence>
        {showGithubNotSetModal && githubNotSetProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGithubNotSetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 animate-pulse"></div>
                  <Code className="w-10 h-10 text-blue-400 relative z-10" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-2 border-dashed border-blue-400/30 rounded-full"
                  ></motion.div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-foreground mb-3"
                >
                  Repository Coming Soon
                </motion.h3>

                {/* Project Name */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground mb-4 font-medium"
                >
                  {githubNotSetProject.name}
                </motion.p>

                {/* Main Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4 mb-8"
                >
                  <p className="text-muted-foreground leading-relaxed">
                    Our development team is currently setting up your project repository. 
                    You'll be able to access your project files, documentation, and track 
                    development progress once it's ready.
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-400">Development Status</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Repository setup is in progress. You'll receive a notification when it's available.
                    </p>
                  </div>
                </motion.div>

                {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={() => setShowGithubNotSetModal(false)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span className="flex items-center gap-2">
                      Got it
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Payment Method Dialog */}
      <AnimatePresence>
        {showAddPaymentDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAddPaymentDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Type</label>
                  <select
                    value={paymentFormData.cardType}
                    onChange={(e) => setPaymentFormData({...paymentFormData, cardType: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="amex">American Express</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <Input
                    type="text"
                    value={paymentFormData.cardNumber}
                    onChange={(e) => setPaymentFormData({...paymentFormData, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Month</label>
                    <Input
                      type="text"
                      value={paymentFormData.expiryMonth}
                      onChange={(e) => setPaymentFormData({...paymentFormData, expiryMonth: e.target.value})}
                      placeholder="12"
                      maxLength={2}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Year</label>
                    <Input
                      type="text"
                      value={paymentFormData.expiryYear}
                      onChange={(e) => setPaymentFormData({...paymentFormData, expiryYear: e.target.value})}
                      placeholder="25"
                      maxLength={2}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={paymentFormData.isDefault}
                    onChange={(e) => setPaymentFormData({...paymentFormData, isDefault: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium">
                    Set as default payment method
                  </label>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddPaymentMethod}
                    disabled={!paymentFormData.cardNumber || !paymentFormData.expiryMonth || !paymentFormData.expiryYear || isAddingPayment}
                    className="btn-gradient flex-1"
                  >
                    {isAddingPayment ? 'Adding...' : 'Add Payment Method'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddPaymentDialog(false)
                      setPaymentFormData({
                        cardType: 'visa',
                        cardNumber: '',
                        expiryMonth: '',
                        expiryYear: '',
                        isDefault: false
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing Settings Dialog */}
      <AnimatePresence>
        {showBillingSettingsDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowBillingSettingsDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Billing Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailInvoices"
                    checked={billingSettingsData.emailInvoices}
                    onChange={(e) => setBillingSettingsData({...billingSettingsData, emailInvoices: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="emailInvoices" className="text-sm font-medium">
                    Email invoices and payment confirmations
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoPayEnabled"
                    checked={billingSettingsData.autoPayEnabled}
                    onChange={(e) => setBillingSettingsData({...billingSettingsData, autoPayEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="autoPayEnabled" className="text-sm font-medium">
                    Enable auto-pay for invoices
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Billing Address</label>
                  <div className="space-y-2">
                    <Input
                      value={billingSettingsData.billingAddress.street}
                      onChange={(e) => setBillingSettingsData({
                        ...billingSettingsData,
                        billingAddress: {...billingSettingsData.billingAddress, street: e.target.value}
                      })}
                      placeholder="Street Address"
                      className="w-full"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={billingSettingsData.billingAddress.city}
                        onChange={(e) => setBillingSettingsData({
                          ...billingSettingsData,
                          billingAddress: {...billingSettingsData.billingAddress, city: e.target.value}
                        })}
                        placeholder="City"
                        className="w-full"
                      />
                      <Input
                        value={billingSettingsData.billingAddress.state}
                        onChange={(e) => setBillingSettingsData({
                          ...billingSettingsData,
                          billingAddress: {...billingSettingsData.billingAddress, state: e.target.value}
                        })}
                        placeholder="State"
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={billingSettingsData.billingAddress.postalCode}
                        onChange={(e) => setBillingSettingsData({
                          ...billingSettingsData,
                          billingAddress: {...billingSettingsData.billingAddress, postalCode: e.target.value}
                        })}
                        placeholder="Postal Code"
                        className="w-full"
                      />
                      <Input
                        value={billingSettingsData.billingAddress.country}
                        onChange={(e) => setBillingSettingsData({
                          ...billingSettingsData,
                          billingAddress: {...billingSettingsData.billingAddress, country: e.target.value}
                        })}
                        placeholder="Country"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tax ID</label>
                  <Input
                    value={billingSettingsData.taxId}
                    onChange={(e) => setBillingSettingsData({...billingSettingsData, taxId: e.target.value})}
                    placeholder="Tax identification number"
                    className="w-full"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleUpdateBillingSettings}
                    disabled={isUpdatingSettings}
                    className="btn-gradient flex-1"
                  >
                    {isUpdatingSettings ? 'Updating...' : 'Update Settings'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBillingSettingsDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quote Type Modal */}
      <QuoteTypeModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
      
      {/* Quote Details Modal */}
      <QuoteDetailsModal 
        isOpen={isQuoteDetailsOpen} 
        onClose={() => setIsQuoteDetailsOpen(false)} 
        quote={selectedQuote}
        onCancelQuote={handleCancelQuote}
      />
      
      {/* Confirm Cancel Dialog */}
      <ConfirmDialog 
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          console.log('ConfirmDialog onClose called, resetting state')
          setIsConfirmDialogOpen(false)
          setPendingCancelQuoteId(null)
          setConfirmCancelFunction(null)
        }}
        onConfirm={confirmCancelQuote}
        title="Cancel Quote"
        description="Are you sure you want to cancel this quote? This action cannot be undone."
        confirmText="Cancel Quote"
        cancelText="Keep Quote"
        variant="destructive"
      />
      
      {/* Success Notification */}
      <SuccessNotification
        isOpen={isSuccessNotificationOpen}
        onClose={() => setIsSuccessNotificationOpen(false)}
        title={successNotification.title}
        message={successNotification.message}
      />
      
      {/* Chat Widget */}
      <ClientMessaging />
      </main>
  )
}
