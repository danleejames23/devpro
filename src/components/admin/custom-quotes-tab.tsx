'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, X, Check, Clock, AlertCircle, DollarSign, Calendar, 
  Building2, Mail, Phone, User, FileText, Sparkles, Search,
  Filter, ChevronDown, ChevronUp
} from 'lucide-react'

interface CustomQuote {
  id: string
  customer_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  company: string | null
  project_type: string
  project_title: string
  project_description: string
  features: string[]
  integrations: string[]
  target_audience: string | null
  competitors: string | null
  preferred_tech_stack: string | null
  hosting_preference: string | null
  has_existing_system: boolean
  existing_system_details: string | null
  preferred_timeline: string | null
  budget_range: string | null
  additional_notes: string | null
  status: 'pending' | 'reviewing' | 'quoted' | 'approved' | 'rejected'
  admin_notes: string | null
  quoted_price: number | null
  quoted_timeline: string | null
  reviewed_at: string | null
  resulting_quote_id: string | null
  resulting_project_id: string | null
  created_at: string
  updated_at: string
}

interface CustomQuotesTabProps {
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
  showLoading: (title: string, message: string) => void
  hideNotification: () => void
}

const projectTypeLabels: Record<string, string> = {
  'enterprise_web_app': 'Enterprise Web Application',
  'saas': 'SaaS Platform',
  'ecommerce': 'Complex E-Commerce',
  'ai_solution': 'AI/ML Solution',
  'custom_web_app': 'Custom Web App',
  'api_integration': 'API & Integration',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  reviewing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  quoted: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  approved: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function CustomQuotesTab({ showSuccess, showError, showLoading, hideNotification }: CustomQuotesTabProps) {
  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<CustomQuote | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [approveForm, setApproveForm] = useState({
    quotedPrice: '',
    quotedTimeline: '',
    adminNotes: ''
  })

  useEffect(() => {
    loadCustomQuotes()
  }, [filterStatus])

  const loadCustomQuotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/custom-quotes?status=${filterStatus}`)
      const data = await response.json()
      
      if (data.success) {
        setCustomQuotes(data.customQuotes)
      }
    } catch (error) {
      console.error('Error loading custom quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewQuote = (quote: CustomQuote) => {
    setSelectedQuote(quote)
    setIsViewModalOpen(true)
  }

  const handleOpenApprove = (quote: CustomQuote) => {
    setSelectedQuote(quote)
    setApproveForm({
      quotedPrice: quote.quoted_price?.toString() || '',
      quotedTimeline: quote.quoted_timeline || quote.preferred_timeline || '',
      adminNotes: quote.admin_notes || ''
    })
    setIsApproveModalOpen(true)
  }

  const handleUpdateStatus = async (quoteId: string, status: string) => {
    try {
      showLoading('Updating', 'Updating quote status...')
      
      const response = await fetch('/api/admin/custom-quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customQuoteId: quoteId,
          status
        })
      })

      const data = await response.json()

      if (data.success) {
        hideNotification()
        showSuccess('Success', `Quote marked as ${status}`)
        loadCustomQuotes()
        setIsViewModalOpen(false)
      } else {
        hideNotification()
        showError('Error', data.error || 'Failed to update status')
      }
    } catch (error) {
      hideNotification()
      showError('Error', 'Failed to update status')
    }
  }

  const handleApproveWithPrice = async () => {
    if (!selectedQuote || !approveForm.quotedPrice) {
      showError('Error', 'Please enter a quoted price')
      return
    }

    try {
      showLoading('Approving', 'Creating quote and project...')
      
      const response = await fetch('/api/admin/custom-quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customQuoteId: selectedQuote.id,
          status: 'approved',
          quotedPrice: parseFloat(approveForm.quotedPrice),
          quotedTimeline: approveForm.quotedTimeline,
          adminNotes: approveForm.adminNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        hideNotification()
        showSuccess('Success', 'Quote approved! Formal quote and project created.')
        loadCustomQuotes()
        setIsApproveModalOpen(false)
        setSelectedQuote(null)
      } else {
        hideNotification()
        showError('Error', data.error || 'Failed to approve quote')
      }
    } catch (error) {
      hideNotification()
      showError('Error', 'Failed to approve quote')
    }
  }

  const filteredQuotes = customQuotes.filter(quote => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase()
      return (
        quote.first_name.toLowerCase().includes(search) ||
        quote.last_name.toLowerCase().includes(search) ||
        quote.email.toLowerCase().includes(search) ||
        quote.project_title.toLowerCase().includes(search) ||
        (quote.company && quote.company.toLowerCase().includes(search))
      )
    }
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatBudget = (range: string | null) => {
    if (!range) return 'Not specified'
    return range.replace('-', ' - £').replace('+', '+')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Custom Quote Requests</h2>
          <p className="text-slate-400">Review and approve custom project quotes</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="quoted">Quoted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: customQuotes.length, color: 'text-white' },
          { label: 'Pending', count: customQuotes.filter(q => q.status === 'pending').length, color: 'text-yellow-400' },
          { label: 'Reviewing', count: customQuotes.filter(q => q.status === 'reviewing').length, color: 'text-blue-400' },
          { label: 'Approved', count: customQuotes.filter(q => q.status === 'approved').length, color: 'text-green-400' },
          { label: 'Rejected', count: customQuotes.filter(q => q.status === 'rejected').length, color: 'text-red-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quotes List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading custom quotes...</div>
      ) : filteredQuotes.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No custom quote requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        {quote.first_name[0]}{quote.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white">{quote.project_title}</h3>
                          <Badge className={statusColors[quote.status]}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">
                          {quote.first_name} {quote.last_name} • {quote.email}
                          {quote.company && ` • ${quote.company}`}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                            {projectTypeLabels[quote.project_type] || quote.project_type}
                          </span>
                          <span className="px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                            Budget: £{formatBudget(quote.budget_range)}
                          </span>
                          <span className="px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                            {quote.preferred_timeline?.replace(/-/g, ' ') || 'Flexible timeline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{formatDate(quote.created_at)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQuote(quote)}
                      className="border-slate-600"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {quote.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(quote.id, 'reviewing')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Start Review
                      </Button>
                    )}
                    {(quote.status === 'pending' || quote.status === 'reviewing') && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenApprove(quote)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedQuote.project_title}</h3>
                <p className="text-slate-400">{selectedQuote.first_name} {selectedQuote.last_name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsViewModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-white">{selectedQuote.first_name} {selectedQuote.last_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="text-white">{selectedQuote.email}</span>
                    </div>
                    {selectedQuote.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="text-white">{selectedQuote.phone}</span>
                      </div>
                    )}
                    {selectedQuote.company && (
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span className="text-white">{selectedQuote.company}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Budget & Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span className="text-white">£{formatBudget(selectedQuote.budget_range)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-white">{selectedQuote.preferred_timeline?.replace(/-/g, ' ') || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-white">Submitted {formatDate(selectedQuote.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Details */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-500">Project Type</span>
                    <p className="text-white">{projectTypeLabels[selectedQuote.project_type] || selectedQuote.project_type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Description</span>
                    <p className="text-white whitespace-pre-wrap">{selectedQuote.project_description}</p>
                  </div>
                  {selectedQuote.target_audience && (
                    <div>
                      <span className="text-xs text-slate-500">Target Audience</span>
                      <p className="text-white">{selectedQuote.target_audience}</p>
                    </div>
                  )}
                  {selectedQuote.competitors && (
                    <div>
                      <span className="text-xs text-slate-500">Reference Sites</span>
                      <p className="text-white">{selectedQuote.competitors}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              {selectedQuote.features && selectedQuote.features.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Required Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuote.features.map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical */}
              <div className="grid md:grid-cols-2 gap-6">
                {(selectedQuote.preferred_tech_stack || selectedQuote.hosting_preference) && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-400">Technical Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedQuote.preferred_tech_stack && (
                        <div>
                          <span className="text-xs text-slate-500">Tech Stack</span>
                          <p className="text-white">{selectedQuote.preferred_tech_stack}</p>
                        </div>
                      )}
                      {selectedQuote.hosting_preference && (
                        <div>
                          <span className="text-xs text-slate-500">Hosting</span>
                          <p className="text-white">{selectedQuote.hosting_preference}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedQuote.has_existing_system && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-400">Existing System</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white">{selectedQuote.existing_system_details || 'Has existing system to integrate'}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Additional Notes */}
              {selectedQuote.additional_notes && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white whitespace-pre-wrap">{selectedQuote.additional_notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                {selectedQuote.status === 'pending' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedQuote.id, 'reviewing')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Review
                  </Button>
                )}
                {(selectedQuote.status === 'pending' || selectedQuote.status === 'reviewing') && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus(selectedQuote.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setIsViewModalOpen(false)
                        handleOpenApprove(selectedQuote)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve with Price
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg">
            <div className="border-b border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white">Approve Custom Quote</h3>
              <p className="text-slate-400">{selectedQuote.project_title}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quoted Price (£) *</label>
                <Input
                  type="number"
                  value={approveForm.quotedPrice}
                  onChange={(e) => setApproveForm(prev => ({ ...prev, quotedPrice: e.target.value }))}
                  placeholder="e.g., 2500"
                  className="bg-slate-800 border-slate-700"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Client budget: £{formatBudget(selectedQuote.budget_range)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Timeline</label>
                <Input
                  value={approveForm.quotedTimeline}
                  onChange={(e) => setApproveForm(prev => ({ ...prev, quotedTimeline: e.target.value }))}
                  placeholder="e.g., 6-8 weeks"
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Admin Notes</label>
                <Textarea
                  value={approveForm.adminNotes}
                  onChange={(e) => setApproveForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Internal notes about this quote..."
                  rows={3}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
                <p>Approving will:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create a formal quote for the client</li>
                  <li>Create a project in &quot;Planning&quot; status</li>
                  <li>Notify the client via email</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-700 p-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApproveWithPrice}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve & Create Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
