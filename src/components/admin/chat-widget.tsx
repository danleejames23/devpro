'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, X, Users, Clock } from 'lucide-react'

interface Message {
  id: string
  customer_id: string
  customer_name: string
  message: string
  is_from_admin: boolean
  created_at: string
  is_read: boolean
}

interface Conversation {
  customer_id: string
  customer_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export default function AdminChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/admin/messages')
      const data = await response.json()
      if (data.success) {
        // Group messages by customer
        const conversationMap = new Map<string, Conversation>()
        
        data.messages.forEach((msg: Message) => {
          const existing = conversationMap.get(msg.customer_id)
          if (!existing || new Date(msg.created_at) > new Date(existing.last_message_at)) {
            conversationMap.set(msg.customer_id, {
              customer_id: msg.customer_id,
              customer_name: msg.customer_name,
              last_message: msg.message,
              last_message_at: msg.created_at,
              unread_count: data.messages.filter((m: Message) => 
                m.customer_id === msg.customer_id && !m.is_from_admin && !m.is_read
              ).length
            })
          }
        })
        
        setConversations(Array.from(conversationMap.values()))
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadMessages = async (customerId: string) => {
    try {
      const response = await fetch('/api/admin/messages')
      const data = await response.json()
      if (data.success) {
        const customerMessages = data.messages
          .filter((msg: Message) => msg.customer_id === customerId)
          .sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        setMessages(customerMessages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedConversation,
          message: newMessage.trim()
        })
      })

      if (response.ok) {
        setNewMessage('')
        await loadMessages(selectedConversation)
        await loadConversations()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectConversation = (customerId: string) => {
    setSelectedConversation(customerId)
    loadMessages(customerId)
  }

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0)

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-neon-purple to-cyber-mint hover:from-neon-purple/80 hover:to-cyber-mint/80 shadow-lg relative"
        >
          <MessageSquare className="w-6 h-6" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-plasma-pink text-white border-0 min-w-[20px] h-5 text-xs">
              {totalUnread}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-24 z-50 w-96 h-[500px] glass-card border border-neon-purple/30 rounded-2xl overflow-hidden"
          >
            <div className="flex h-full">
              {/* Conversations List */}
              <div className={`${selectedConversation ? 'w-0 overflow-hidden' : 'w-full'} transition-all duration-300 border-r border-neon-purple/20`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-silver-glow">Messages</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-silver-glow/70 hover:text-silver-glow"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[400px] overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-silver-glow/60">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.customer_id}
                        onClick={() => selectConversation(conv.customer_id)}
                        className="p-3 border-b border-neon-purple/10 hover:bg-neon-purple/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-silver-glow text-sm">{conv.customer_name}</span>
                          {conv.unread_count > 0 && (
                            <Badge className="bg-plasma-pink text-white border-0 text-xs">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-silver-glow/70 truncate">{conv.last_message}</p>
                        <div className="flex items-center text-xs text-silver-glow/50 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(conv.last_message_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </div>

              {/* Chat Messages */}
              {selectedConversation && (
                <div className="flex-1 flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-cyber-mint">
                          💻 {conversations.find(c => c.customer_id === selectedConversation)?.customer_name}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        className="text-silver-glow/70 hover:text-silver-glow"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-0 overflow-y-auto">
                    <div className="p-3 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.is_from_admin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl ${
                              message.is_from_admin
                                ? 'bg-gradient-to-r from-neon-purple to-cyber-mint text-white'
                                : 'bg-space-gray/50 text-silver-glow'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium opacity-80">
                                {message.is_from_admin ? '🛠️ Admin' : '👤 Client'}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-3 border-t border-neon-purple/20">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-space-gray/30 border-neon-purple/30 text-silver-glow"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={loading}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="bg-gradient-to-r from-neon-purple to-cyber-mint hover:from-neon-purple/80 hover:to-cyber-mint/80"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
