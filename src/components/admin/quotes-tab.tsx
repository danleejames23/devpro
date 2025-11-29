'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, Search, Filter, MoreHorizontal, Edit, Eye, Trash2, 
  Clock, CheckCircle, AlertCircle, DollarSign, Calendar, User,
  Plus, Download, Send, Star, Tag, Zap, Package
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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

interface QuotesTabProps {
  quotes: AdminQuote[]
  onQuoteUpdate: (quoteId: string, updates: any) => void
  onQuoteToInvoice: (quote: AdminQuote) => void
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
}

export default function QuotesTab({ 
  quotes, 
  onQuoteUpdate, 
  onQuoteToInvoice, 
  showSuccess, 
  showError 
}: QuotesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Filter quotes based on search and filters
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus
    const matchesPriority = filterPriority === 'all' || quote.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'quoted': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-blue-500 text-white'
      case 'low': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
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
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    try {
      await onQuoteUpdate(quoteId, { status: newStatus })
      showSuccess('Status Updated', `Quote status changed to ${newStatus}`)
    } catch (error) {
      showError('Update Failed', 'Failed to update quote status')
    }
  }

  const handlePriorityChange = async (quoteId: string, newPriority: string) => {
    try {
      await onQuoteUpdate(quoteId, { priority: newPriority })
      showSuccess('Priority Updated', `Quote priority changed to ${newPriority}`)
    } catch (error) {
      showError('Update Failed', 'Failed to update quote priority')
    }
  }

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    quoted: quotes.filter(q => q.status === 'quoted').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    urgent: quotes.filter(q => q.priority === 'urgent').length,
    totalValue: quotes.reduce((sum, q) => sum + q.estimated_cost, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Quotes</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.quoted}</div>
            <div className="text-sm text-muted-foreground">Quoted</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <div className="text-sm text-muted-foreground">Urgent</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search quotes, customers, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="quoted">Quoted</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No quotes found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first quote to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(quote.status)}
                          <h3 className="text-lg font-semibold">
                            {quote.customer_name || quote.name}
                          </h3>
                        </div>
                        
                        <Badge className={getPriorityColor(quote.priority)}>
                          {quote.priority}
                        </Badge>
                        
                        <Badge variant="outline" className={getStatusColor(quote.status)}>
                          {quote.status.replace('_', ' ')}
                        </Badge>

                        {quote.rush_delivery !== 'standard' && (
                          <Badge variant="secondary">
                            <Zap className="w-3 h-3 mr-1" />
                            {quote.rush_delivery}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="font-medium">{quote.description.substring(0, 100)}...</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Cost</p>
                          <p className="font-bold text-lg text-green-600">{formatCurrency(quote.estimated_cost)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Timeline</p>
                          <p className="font-medium">{quote.estimated_timeline}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {quote.email}
                        </div>
                        {quote.company && (
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {quote.company}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(quote.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {quote.tags && quote.tags.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          {quote.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuote(quote)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      {quote.status === 'quoted' && (
                        <Button
                          size="sm"
                          onClick={() => onQuoteToInvoice(quote)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Invoice
                        </Button>
                      )}

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(quote.id, 'quoted')}
                          disabled={quote.status === 'quoted'}
                        >
                          Quote
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(quote.id, 'accepted')}
                          disabled={quote.status === 'accepted'}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
