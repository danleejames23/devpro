'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Settings,
  BarChart3,
  MessageSquare,
  Edit,
  Send,
  Eye,
  X,
  Save,
  Plus,
  Minus,
  Calculator,
  CreditCard,
  Mail
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Quote {
  id: string
  name: string
  email: string
  company?: string
  description: string
  selectedFeatures: string[]
  complexity: 'basic' | 'standard' | 'premium'
  estimatedCost: number
  estimatedTimeline: number
  status: 'pending' | 'under_review' | 'quoted' | 'accepted' | 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
  adminNotes?: string
  finalQuote?: {
    cost: number
    timeline: number
    additionalItems: string[]
    terms: string
    depositAmount: number
    depositPercentage: number
  }
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isEditingQuote, setIsEditingQuote] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    cost: 0,
    timeline: 0,
    additionalItems: [''],
    terms: 'Standard terms and conditions apply.',
    depositPercentage: 20,
    adminNotes: ''
  })

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      window.location.href = '/admin'
      return
    }

    try {
      const parsedAdmin = JSON.parse(adminData)
      setAdmin(parsedAdmin)
      loadQuotes()
    } catch (error) {
      console.error('Error loading admin data:', error)
      window.location.href = '/admin'
    }
    
    setLoading(false)
  }, [])

  const loadQuotes = async () => {
    try {
      const response = await fetch('/api/quotes')
      const data = await response.json()
      if (data.success) {
        setQuotes(data.quotes)
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
    }
  }

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setQuoteForm({
      cost: quote.finalQuote?.cost || quote.estimatedCost,
      timeline: quote.finalQuote?.timeline || quote.estimatedTimeline,
      additionalItems: quote.finalQuote?.additionalItems || [''],
      terms: quote.finalQuote?.terms || 'Standard terms and conditions apply.',
      depositPercentage: quote.finalQuote?.depositPercentage || 20,
      adminNotes: quote.adminNotes || ''
    })
    setIsEditingQuote(true)
  }

  const handleSaveFinalQuote = async () => {
    if (!selectedQuote) return

    const depositAmount = Math.round((quoteForm.cost * quoteForm.depositPercentage) / 100)
    
    const finalQuote = {
      cost: quoteForm.cost,
      timeline: quoteForm.timeline,
      additionalItems: quoteForm.additionalItems.filter(item => item.trim()),
      terms: quoteForm.terms,
      depositAmount,
      depositPercentage: quoteForm.depositPercentage
    }

    try {
      // Update the quote with final quote details
      setQuotes(prev => prev.map(quote => 
        quote.id === selectedQuote.id 
          ? { 
              ...quote, 
              finalQuote,
              adminNotes: quoteForm.adminNotes,
              status: 'quoted',
              updatedAt: new Date().toISOString()
            }
          : quote
      ))
      
      setIsEditingQuote(false)
      setSelectedQuote(null)
      alert('Final quote saved and sent to customer!')
    } catch (error) {
      console.error('Error saving final quote:', error)
      alert('Failed to save final quote')
    }
  }

  const addAdditionalItem = () => {
    setQuoteForm(prev => ({
      ...prev,
      additionalItems: [...prev.additionalItems, '']
    }))
  }

  const removeAdditionalItem = (index: number) => {
    setQuoteForm(prev => ({
      ...prev,
      additionalItems: prev.additionalItems.filter((_, i) => i !== index)
    }))
  }

  const updateAdditionalItem = (index: number, value: string) => {
    setQuoteForm(prev => ({
      ...prev,
      additionalItems: prev.additionalItems.map((item, i) => i === index ? value : item)
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/admin'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'quoted': return 'bg-purple-100 text-purple-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-200 text-green-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'quotes', label: 'Quote Management', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
  ]

  if (loading) {
    return (
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </main>
    )
  }

  if (!admin) {
    return null
  }

  // Calculate real stats from quotes
  const stats = {
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    underReview: quotes.filter(q => q.status === 'under_review').length,
    quoted: quotes.filter(q => q.status === 'quoted').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    inProgress: quotes.filter(q => q.status === 'in_progress').length,
    completed: quotes.filter(q => q.status === 'completed').length,
    totalValue: quotes.reduce((sum, q) => sum + (q.finalQuote?.cost || q.estimatedCost), 0),
  }

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Shield className="w-8 h-8 mr-3 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {admin.username}! Manage quotes, customers, and business operations.
            </p>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Button onClick={() => loadQuotes()} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <Card className="card-hover gradient-primary text-white">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{stats.totalQuotes}</p>
                        <p className="text-xs opacity-90">Total Quotes</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover bg-yellow-500 text-white">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{stats.pendingQuotes}</p>
                        <p className="text-xs opacity-90">Pending</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover bg-blue-500 text-white">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Eye className="w-6 h-6 mx-auto mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{stats.underReview}</p>
                        <p className="text-xs opacity-90">Under Review</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover bg-purple-500 text-white">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Send className="w-6 h-6 mx-auto mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{stats.quoted}</p>
                        <p className="text-xs opacity-90">Quoted</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover bg-green-500 text-white">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <CheckCircle className="w-6 h-6 mx-auto mb-2 opacity-80" />
                        <p className="text-2xl font-bold">{stats.accepted}</p>
                        <p className="text-xs opacity-90">Accepted</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover gradient-accent text-white">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-80" />
                        <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
                        <p className="text-xs opacity-90">Total Value</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Quotes Overview */}
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      Recent Quote Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quotes.slice(0, 5).map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div>
                            <p className="font-medium">{quote.id}</p>
                            <p className="text-sm text-muted-foreground">{quote.name} • {quote.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(quote.finalQuote?.cost || quote.estimatedCost)}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                              {quote.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => setActiveTab('quotes')} 
                      className="w-full mt-4" 
                      variant="outline"
                    >
                      Manage All Quotes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Quote Management</h2>
                  <div className="text-sm text-muted-foreground">
                    {quotes.length} total quotes
                  </div>
                </div>

                <div className="grid gap-6">
                  {quotes.map((quote) => (
                    <Card key={quote.id} className="card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{quote.id}</h3>
                            <p className="text-muted-foreground">{quote.name} • {quote.email}</p>
                            {quote.company && <p className="text-sm text-muted-foreground">{quote.company}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              {formatCurrency(quote.finalQuote?.cost || quote.estimatedCost)}
                            </p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                              {quote.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Project Description:</p>
                          <p className="text-sm">{quote.description}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Selected Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {quote.selectedFeatures.map((feature) => (
                              <span key={feature} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                                {feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            ))}
                          </div>
                        </div>

                        {quote.finalQuote && (
                          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-800 mb-2">Final Quote Details</h4>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-green-700">Final Cost: <span className="font-semibold">{formatCurrency(quote.finalQuote.cost)}</span></p>
                                <p className="text-green-700">Timeline: <span className="font-semibold">{quote.finalQuote.timeline} days</span></p>
                              </div>
                              <div>
                                <p className="text-green-700">Deposit ({quote.finalQuote.depositPercentage}%): <span className="font-semibold">{formatCurrency(quote.finalQuote.depositAmount)}</span></p>
                                <p className="text-green-700">Remaining: <span className="font-semibold">{formatCurrency(quote.finalQuote.cost - quote.finalQuote.depositAmount)}</span></p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleEditQuote(quote)}
                            size="sm"
                            className="btn-gradient"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {quote.status === 'pending' ? 'Create Quote' : 'Edit Quote'}
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Customer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {quotes.length === 0 && (
                  <Card className="card-hover">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Quotes Yet</h3>
                      <p className="text-muted-foreground">
                        Quotes will appear here when customers submit quote requests
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'customers' && (
              <Card className="card-hover">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
                  <p className="text-muted-foreground">
                    Customer management features coming soon
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quote Editing Modal */}
        {isEditingQuote && selectedQuote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-2xl"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Edit Quote - {selectedQuote.id}</h2>
                  <Button
                    onClick={() => setIsEditingQuote(false)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1">
                  {selectedQuote.name} • {selectedQuote.email}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Final Quote Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Create Final Quote</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Final Cost (£)</label>
                      <Input
                        type="number"
                        value={quoteForm.cost}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
                        placeholder="Enter final cost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Timeline (days)</label>
                      <Input
                        type="number"
                        value={quoteForm.timeline}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, timeline: Number(e.target.value) }))}
                        placeholder="Enter timeline"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Deposit Percentage (%)</label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="number"
                        min="10"
                        max="50"
                        value={quoteForm.depositPercentage}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, depositPercentage: Number(e.target.value) }))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        = {formatCurrency(Math.round((quoteForm.cost * quoteForm.depositPercentage) / 100))} deposit
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Items</label>
                    <div className="space-y-2">
                      {quoteForm.additionalItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={item}
                            onChange={(e) => updateAdditionalItem(index, e.target.value)}
                            placeholder="Additional service or requirement"
                          />
                          <Button
                            onClick={() => removeAdditionalItem(index)}
                            variant="outline"
                            size="sm"
                            disabled={quoteForm.additionalItems.length === 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={addAdditionalItem}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Terms & Conditions</label>
                    <Textarea
                      value={quoteForm.terms}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, terms: e.target.value }))}
                      placeholder="Enter terms and conditions"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Quote Summary */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">Quote Summary</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <p><strong>Total Cost:</strong> {formatCurrency(quoteForm.cost)}</p>
                      <p><strong>Timeline:</strong> {quoteForm.timeline} days</p>
                    </div>
                    <div>
                      <p><strong>Deposit ({quoteForm.depositPercentage}%):</strong> {formatCurrency(Math.round((quoteForm.cost * quoteForm.depositPercentage) / 100))}</p>
                      <p><strong>Remaining:</strong> {formatCurrency(quoteForm.cost - Math.round((quoteForm.cost * quoteForm.depositPercentage) / 100))}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleSaveFinalQuote}
                    className="btn-gradient"
                    disabled={!quoteForm.cost || !quoteForm.timeline}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Final Quote to Customer
                  </Button>
                  <Button
                    onClick={() => setIsEditingQuote(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}
