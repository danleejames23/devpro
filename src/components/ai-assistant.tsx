'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Bot, X, Send, MessageCircle, Sparkles, ArrowRight, Clock, Star } from 'lucide-react'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: "👋 Hello! I'm your assistant. I can help you understand our services, pricing, and guide you through getting started with your project. What would you like to know?",
        isBot: true,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  const predefinedResponses = {
    'pricing': "Our pricing is very competitive! 💰\n\n• Landing Page: £199 (2-3 days)\n• Business Website: £399 (5-7 days)\n• AI Chatbot: £499 (3-7 days)\n• E-commerce Store: £549 (7-10 days)\n\nAll prices include revisions and support. Would you like details on any specific service?",
    'services': "We offer both traditional web development AND cutting-edge AI solutions! 🚀\n\n**Web Development:**\n• Landing Pages & Business Websites\n• E-commerce Stores\n• Custom Web Applications\n\n**AI Services:**\n• AI Chatbots for customer support\n• AI Website Agents for automation\n• Custom AI integrations\n\nWhat type of project are you interested in?",
    'timeline': "We pride ourselves on fast delivery! ⚡\n\n• Landing Pages: 2-3 days\n• Business Websites: 5-7 days\n• AI Chatbots: 3-7 days\n• E-commerce: 7-10 days\n• Custom Apps: 14-21 days\n\nWe also offer rush delivery options for even faster turnaround. Need something urgently?",
    'ai': "Our AI services are our specialty! 🤖\n\n**AI Chatbots (£499):**\n• 24/7 customer support\n• Lead generation\n• Custom training on your data\n\n**AI Website Agents (£899):**\n• Automated data extraction\n• Competitor monitoring\n• Custom reporting\n\n**AI Integrations (£699):**\n• GPT/Claude API integration\n• Document processing\n• Content generation\n\nWhich AI solution interests you most?",
    'process': "Our process is simple and transparent! 📋\n\n1. **Get Quote** - Tell us your requirements\n2. **Consultation** - We discuss your project\n3. **Development** - We build your solution\n4. **Delivery** - You get your finished project\n\nEverything is fixed-price with guaranteed delivery times. Ready to start?",
    'support': "We provide comprehensive support! 🛟\n\n• Free consultation included\n• Revisions during development\n• 24/7 project communication\n• Post-launch support\n• Maintenance packages available\n\nYou'll have direct access to your developer throughout the project. Any specific concerns?"
  }

  const getResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('pricing')) {
      return predefinedResponses.pricing
    }
    if (lowerInput.includes('service') || lowerInput.includes('what do you do')) {
      return predefinedResponses.services
    }
    if (lowerInput.includes('time') || lowerInput.includes('fast') || lowerInput.includes('delivery') || lowerInput.includes('timeline')) {
      return predefinedResponses.timeline
    }
    if (lowerInput.includes('ai') || lowerInput.includes('chatbot') || lowerInput.includes('agent') || lowerInput.includes('automation')) {
      return predefinedResponses.ai
    }
    if (lowerInput.includes('process') || lowerInput.includes('how') || lowerInput.includes('work')) {
      return predefinedResponses.process
    }
    if (lowerInput.includes('support') || lowerInput.includes('help') || lowerInput.includes('maintenance')) {
      return predefinedResponses.support
    }
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return "Hello! 👋 Great to meet you! I'm here to help you understand our web development and AI services. What would you like to know about our offerings?"
    }
    if (lowerInput.includes('start') || lowerInput.includes('begin') || lowerInput.includes('quote')) {
      return "Excellent! Let's get your project started! 🚀\n\nYou can:\n• Click 'Get Quote' in the navigation\n• Choose a package from our services page\n• Tell me more about your project here\n\nWhat type of project do you have in mind?"
    }
    
    return "I'd be happy to help! I can tell you about:\n\n• 💰 **Pricing** - Our competitive rates\n• 🚀 **Services** - Web development & AI solutions\n• ⚡ **Timeline** - Fast delivery times\n• 🤖 **AI Solutions** - Chatbots, agents, integrations\n• 📋 **Process** - How we work\n• 🛟 **Support** - What's included\n\nJust ask me about any of these topics, or tell me about your project!"
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const quickActions = [
    { text: "View Pricing", action: () => setInputValue("What are your prices?") },
    { text: "AI Services", action: () => setInputValue("Tell me about AI services") },
    { text: "Get Started", action: () => setInputValue("How do I start a project?") },
  ]

  return (
    <>
      {/* Assistant Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Bot className="w-6 h-6 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg"
          >
            Need help? Ask me anything!
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-foreground rotate-45" />
          </motion.div>
        )}
      </motion.div>

      {/* Assistant Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl border-primary/20 bg-white border-2">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <Bot className="w-5 h-5 mr-2" />
                  Assistant
                  <div className="ml-auto flex items-center text-sm opacity-90">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    Online
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-white">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.isBot 
                          ? 'bg-gray-100 text-gray-900 border border-gray-300' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        <div className="text-sm whitespace-pre-line">{message.text}</div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2">
                    <div className="text-xs text-muted-foreground mb-2">Quick questions:</div>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={action.action}
                          className="text-xs h-7"
                        >
                          {action.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
