'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface Message {
  id: any // Database ID can be string or number
  sender_type: 'client' | 'admin'
  message: string
  created_at: string
  read_at: string | null | boolean
}

export default function ClientMessaging() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { customer } = useAuth()

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch messages helper
  const fetchMessages = useCallback(async () => {
    if (!customer) {
      console.log('❌ No customer, skipping fetch')
      return
    }

    try {
      console.log('🔍 Fetching messages for customer:', customer.id)
      const response = await fetch(`/api/client/messages?customer_id=${customer.id}`)

      if (response.ok) {
        const data = await response.json()
        console.log('📨 Messages API response:', data)
        if (data.success) {
          console.log('✅ Setting messages:', data.messages)
          setMessages(data.messages || [])
          
          // Count unread admin messages
          const unread = (data.messages || []).filter((msg: Message) => 
            msg.sender_type === 'admin' && !msg.read_at
          ).length
          setUnreadCount(unread)
        } else {
          console.error('❌ API returned error:', data.error)
        }
      } else {
        console.error('❌ Response not ok:', response.status)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [customer])

  // Mark admin messages as read when chat is opened
  const markAdminMessagesAsRead = useCallback(async () => {
    if (!customer) return
    try {
      const res = await fetch('/api/client/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id, action: 'mark_read' })
      })
      if (res.ok) {
        // Refresh after marking read to update unread counter
        await fetchMessages()
      }
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }, [customer, fetchMessages])

  // Load messages immediately when customer becomes available (after login)
  useEffect(() => {
    if (customer) {
      fetchMessages()
    }
  }, [customer, fetchMessages])

  // When chat opens, mark admin messages as read
  useEffect(() => {
    if (isOpen) {
      markAdminMessagesAsRead()
    }
  }, [isOpen, markAdminMessagesAsRead])

  useEffect(() => {
    scrollToBottom()
    console.log('💬 Messages updated:', messages)
  }, [messages])

  // Fetch messages when component opens
  useEffect(() => {
    if (isOpen && customer) {
      console.log('🚀 Chat opened, fetching initial messages')
      fetchMessages()
    }
  }, [isOpen, customer, fetchMessages])

  // Listen for custom event to open chat
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true)
    }
    
    window.addEventListener('openChat', handleOpenChat)
    return () => window.removeEventListener('openChat', handleOpenChat)
  }, [])

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (customer && isOpen) {
      console.log('⏰ Starting message polling every 10 seconds')
      const interval = setInterval(() => {
        console.log('🔄 Polling for new messages...')
        fetchMessages()
      }, 10000)
      
      return () => {
        console.log('🛑 Clearing message polling interval')
        clearInterval(interval)
      }
    }
  }, [customer, isOpen, fetchMessages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !customer || loading) return

    console.log('📤 Sending message:', newMessage.trim(), 'for customer:', customer.id)
    setLoading(true)
    try {
      const response = await fetch('/api/client/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          customer_id: customer.id,
          message: newMessage.trim() 
        })
      })

      console.log('📤 Send response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📤 Send response data:', data)
        if (data.success) {
          setNewMessage('')
          console.log('✅ Message sent, fetching updated messages...')
          await fetchMessages() // Reload messages to show the new one
        }
      } else {
        console.error('Failed to send message:', response.status)
        const errorData = await response.text()
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (!customer) return null

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-transparent border border-border shadow-lg hover:bg-muted/20 hover:shadow-xl transition-all duration-300 animate-pulse-glow relative"
        >
          <MessageCircle className="w-6 h-6 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[500px]"
          >
            <Card className="h-full flex flex-col shadow-2xl bg-card/95 backdrop-blur-md border border-border">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b border-border/50">
                <CardTitle className="text-lg font-bold text-cyber-mint">💻 Development Team</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet. Start a conversation!</p>
                        <p className="text-xs mt-2">Messages count: {messages.length}</p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender_type === 'client' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium opacity-80">
                                {message.sender_type === 'client' ? '👤 You' : '💻 Dev Team'}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={loading}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={loading || !newMessage.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
