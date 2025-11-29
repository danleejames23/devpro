'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, Search, Filter, MoreHorizontal, Reply, Forward, 
  Archive, Trash2, Star, Clock, User, Paperclip, Send, Plus,
  Mail, MailOpen, AlertCircle, CheckCircle, Eye, Edit
} from 'lucide-react'

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

interface MessagesTabProps {
  messages: AdminMessage[]
  onSendMessage: (messageData: any) => void
  onMarkAsRead: (messageIds: string[]) => void
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
}

export default function MessagesTab({ 
  messages, 
  onSendMessage, 
  onMarkAsRead, 
  showSuccess, 
  showError 
}: MessagesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [replyTo, setReplyTo] = useState<AdminMessage | null>(null)
  const [viewMode, setViewMode] = useState<'inbox' | 'sent' | 'all'>('all')

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    customer_id: '',
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    attachments: [] as File[]
  })

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !message.is_read) ||
      (filterStatus === 'read' && message.is_read)
    
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority
    
    const matchesView = 
      viewMode === 'all' ||
      (viewMode === 'inbox' && !message.is_from_admin) ||
      (viewMode === 'sent' && message.is_from_admin)
    
    return matchesSearch && matchesStatus && matchesPriority && matchesView
  })

  // Group messages by thread
  const groupedMessages = filteredMessages.reduce((acc, message) => {
    const threadId = message.thread_id || message.id
    if (!acc[threadId]) {
      acc[threadId] = []
    }
    acc[threadId].push(message)
    return acc
  }, {} as Record<string, AdminMessage[]>)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const handleSendMessage = async () => {
    try {
      if (!composeForm.customer_id || !composeForm.subject || !composeForm.message) {
        showError('Validation Error', 'Please fill in all required fields')
        return
      }

      await onSendMessage({
        ...composeForm,
        is_from_admin: true,
        thread_id: replyTo?.thread_id || replyTo?.id
      })

      setComposeForm({
        customer_id: '',
        subject: '',
        message: '',
        priority: 'medium',
        attachments: []
      })
      setIsComposeOpen(false)
      setReplyTo(null)
      showSuccess('Message Sent', 'Your message has been sent successfully')
    } catch (error) {
      showError('Send Failed', 'Failed to send message')
    }
  }

  const handleReply = (message: AdminMessage) => {
    setReplyTo(message)
    setComposeForm({
      customer_id: message.customer_id,
      subject: message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`,
      message: '',
      priority: message.priority,
      attachments: []
    })
    setIsComposeOpen(true)
  }

  const handleMarkAsRead = async (messageIds: string[]) => {
    try {
      await onMarkAsRead(messageIds)
      showSuccess('Messages Updated', 'Messages marked as read')
    } catch (error) {
      showError('Update Failed', 'Failed to update messages')
    }
  }

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.is_read && !m.is_from_admin).length,
    sent: messages.filter(m => m.is_from_admin).length,
    received: messages.filter(m => !m.is_from_admin).length,
    high_priority: messages.filter(m => m.priority === 'high').length
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-sm text-muted-foreground">Sent</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.received}</div>
            <div className="text-sm text-muted-foreground">Received</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.high_priority}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search messages, customers, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('all')}
                >
                  All
                </Button>
                <Button
                  variant={viewMode === 'inbox' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('inbox')}
                >
                  Inbox
                </Button>
                <Button
                  variant={viewMode === 'sent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('sent')}
                >
                  Sent
                </Button>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead(filteredMessages.filter(m => !m.is_read).map(m => m.id))}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button 
                size="sm"
                onClick={() => setIsComposeOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groupedMessages).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No messages found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start a conversation with your clients'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedMessages).map(([threadId, threadMessages], index) => {
              const latestMessage = threadMessages[threadMessages.length - 1]
              const unreadCount = threadMessages.filter(m => !m.is_read && !m.is_from_admin).length
              
              return (
                <motion.div
                  key={threadId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
                      unreadCount > 0 ? 'border-l-blue-500 bg-blue-50/50' : 'border-l-gray-200'
                    }`}
                    onClick={() => setSelectedMessage(latestMessage)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                            {latestMessage.customer_name.charAt(0)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{latestMessage.customer_name}</h3>
                              
                              {unreadCount > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {unreadCount} new
                                </Badge>
                              )}
                              
                              <Badge className={getPriorityColor(latestMessage.priority)}>
                                {latestMessage.priority}
                              </Badge>
                              
                              {latestMessage.attachments && latestMessage.attachments.length > 0 && (
                                <Paperclip className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            
                            <p className="font-medium text-sm mb-2 truncate">{latestMessage.subject}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{latestMessage.message}</p>
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(latestMessage.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                {latestMessage.is_from_admin ? (
                                  <>
                                    <Send className="w-3 h-3" />
                                    Sent by you
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3 h-3" />
                                    From client
                                  </>
                                )}
                              </div>
                              {threadMessages.length > 1 && (
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {threadMessages.length} messages
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReply(latestMessage)
                            }}
                          >
                            <Reply className="w-4 h-4" />
                          </Button>
                          
                          {unreadCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(threadMessages.filter(m => !m.is_read).map(m => m.id))
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Message Detail / Compose */}
        <div className="space-y-4">
          {isComposeOpen ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{replyTo ? 'Reply to Message' : 'New Message'}</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsComposeOpen(false)}>
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer ID</label>
                  <Input
                    value={composeForm.customer_id}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, customer_id: e.target.value }))}
                    placeholder="Enter customer ID"
                    disabled={!!replyTo}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={composeForm.priority}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={composeForm.message}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Type your message..."
                    rows={6}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSendMessage} className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Message Details</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                    {selectedMessage.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedMessage.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-lg">{selectedMessage.subject}</p>
                  <Badge className={getPriorityColor(selectedMessage.priority)}>
                    {selectedMessage.priority} priority
                  </Badge>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Attachments</p>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={() => handleReply(selectedMessage)} className="flex-1">
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline">
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Select a message</h3>
                <p className="text-muted-foreground">Choose a message from the list to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
