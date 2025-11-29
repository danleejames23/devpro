'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageCircle, Calendar, Zap, Globe, Shield, Star, Bot, Code, Rocket, X, UserPlus, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  projectType: z.string().optional(),
})

type ContactForm = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectProjectType, setSelectLumorajectType] = useState('')
  const { customer } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Inquiry submitted successfully:', result.inquiry)
        setIsSubmitted(true)
        setSelectLumorajectType('')
        reset()
      } else {
        console.error('❌ Failed to submit inquiry:', result.error)
        // You could show an error message here
        alert('Failed to submit inquiry. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error submitting inquiry:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      description: 'Drop us a line anytime',
      value: 'hello@lumora.dev',
      href: 'mailto:hello@lumora.dev',
      color: 'from-cyber-mint to-cosmic-blue',
      delay: 0.1
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Real-time support',
      value: 'Available 24/7',
      href: '#',
      color: 'from-neon-purple to-plasma-pink',
      delay: 0.2,
      requiresAuth: true
    },
    {
      icon: Phone,
      title: 'Phone',
      description: 'Call for urgent matters',
      value: '+447 359 792 577',
      href: 'tel:+447359792577',
      color: 'from-cosmic-blue to-cyber-mint',
      delay: 0.3
    }
  ]

  const handleContactMethod = (method: any) => {
    if (method.requiresAuth && !customer) {
      setShowLoginModal(true)
      return
    }
    
    if (method.href === '#') {
      // Open chat widget for logged-in users
      const chatEvent = new CustomEvent('openChat')
      window.dispatchEvent(chatEvent)
    } else {
      window.open(method.href, '_blank')
    }
  }

  const projectTypes = [
    { id: 'website', label: '🌐 Website Development', icon: Globe },
    { id: 'webapp', label: '⚡ Web Application', icon: Zap },
    { id: 'ai', label: '🤖 AI Integration', icon: Bot },
    { id: 'mobile', label: '📱 Mobile App', icon: Code },
    { id: 'ecommerce', label: '🛒 E-commerce', icon: Star },
    { id: 'other', label: '🚀 Other Project', icon: Rocket }
  ]

  const stats = [
    { number: '24hrs', label: 'Response Time', icon: Clock },
    { number: '100%', label: 'Satisfaction', icon: Shield },
    { number: '5+', label: 'Projects Done', icon: CheckCircle },
    { number: '24/7', label: 'Support', icon: Zap }
  ]

  if (isSubmitted) {
    return (
      <main className="pt-16 min-h-screen bg-gradient-to-br from-deep-space via-space-gray to-deep-space flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl mx-auto px-4 text-center"
        >
          <div className="glass-card p-12 border border-cyber-mint/30 animate-neon-pulse">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-r from-cyber-mint to-cosmic-blue rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-glow"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-4xl font-bold text-silver-glow mb-4 font-accent"
            >
              Message Sent Successfully!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-xl text-silver-glow/80 mb-8 leading-relaxed"
            >
              Thank you for reaching out! We'll get back to you within 24 hours with a detailed response.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="btn-gradient px-8 py-4 text-lg font-semibold"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Another Message
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-br from-deep-space via-space-gray to-deep-space">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-neon-purple/10 to-cyber-mint/5 rounded-full blur-3xl animate-cosmic-drift"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-cosmic-blue/10 to-plasma-pink/5 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '10s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cyber-mint/5 to-neon-purple/10 rounded-full blur-xl animate-cosmic-drift" style={{animationDelay: '5s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="inline-block glass-card px-6 py-3 rounded-full border border-neon-purple/30 animate-neon-pulse mb-8">
              <span className="text-cyber-mint font-accent font-semibold text-sm tracking-wider uppercase">
                💬 Get In Touch
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-accent font-bold leading-tight">
              <span className="block text-silver-glow">Let's Build</span>
              <span className="block text-white">Something Amazing</span>
              <span className="block text-silver-glow">Together</span>
            </h1>

            <p className="text-xl md:text-2xl text-silver-glow/80 leading-relaxed max-w-4xl mx-auto font-light">
              Ready to transform your ideas into reality? Let's discuss your project and create 
              <br />
              <span className="text-cyber-mint font-medium">intelligent solutions that drive results.</span>
            </p>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="glass-card p-4 text-center border border-cyber-mint/20 animate-pulse-glow"
                  style={{animationDelay: `${index * 0.5}s`}}
                >
                  <div className="w-8 h-8 bg-cyber-mint/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="w-4 h-4 text-cyber-mint" />
                  </div>
                  <div className="text-2xl font-bold text-cyber-mint mb-1 font-accent">{stat.number}</div>
                  <div className="text-xs text-silver-glow/70 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-silver-glow mb-4 font-accent">
              Choose Your <span className="text-cyber-mint">Communication</span> Method
            </h2>
            <p className="text-xl text-silver-glow/70 max-w-2xl mx-auto">
              Multiple ways to reach us - pick what works best for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: method.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="glass-card border border-neon-purple/20 hover:border-cyber-mint/40 transition-all duration-500 h-full bg-gradient-to-br from-space-gray/50 to-deep-space/50 backdrop-blur-md">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow`}>
                      <method.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-silver-glow mb-2 font-accent">{method.title}</h3>
                    <p className="text-silver-glow/60 text-sm mb-4">{method.description}</p>
                    <div className="text-cyber-mint font-medium mb-4">{method.value}</div>
                    <Button 
                      onClick={() => handleContactMethod(method)}
                      className="btn-gradient w-full group-hover:scale-105 transition-transform duration-300"
                    >
                      Contact Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-silver-glow mb-4 font-accent">
              Start Your <span className="text-cyber-mint">Project</span> Today
            </h2>
            <p className="text-xl text-silver-glow/70">
              Tell us about your vision and we'll make it reality
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card border border-neon-purple/30 bg-gradient-to-br from-space-gray/30 to-deep-space/30 backdrop-blur-md">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-silver-glow font-accent">
                  Project Inquiry Form
                </CardTitle>
                <CardDescription className="text-silver-glow/70 text-lg">
                  Fill out the details below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Project Type Selection */}
                  <div>
                    <label className="block text-lg font-medium text-silver-glow mb-4">
                      What type of project are you interested in?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {projectTypes.map((type) => (
                        <label key={type.id} className="cursor-pointer">
                          <input
                            {...register('projectType')}
                            type="radio"
                            value={type.id}
                            name="projectType"
                            className="sr-only"
                            onChange={(e) => setSelectLumorajectType(e.target.value)}
                          />
                          <div className={`glass-card p-3 text-center border transition-all duration-300 ${
                            selectProjectType === type.id 
                              ? 'border-cyber-mint bg-cyber-mint/10' 
                              : 'border-neon-purple/20 hover:border-cyber-mint/40'
                          }`}>
                            <div className="text-sm text-silver-glow font-medium">{type.label}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-medium text-silver-glow mb-3">Name *</label>
                      <input
                        {...register('name')}
                        className="w-full px-4 py-3 glass-card border border-neon-purple/30 rounded-lg bg-space-gray/20 text-silver-glow placeholder-silver-glow/50 focus:outline-none focus:border-cyber-mint focus:ring-2 focus:ring-cyber-mint/20 transition-all duration-300"
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-sm text-red-400 mt-2">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-silver-glow mb-3">Email *</label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 glass-card border border-neon-purple/30 rounded-lg bg-space-gray/20 text-silver-glow placeholder-silver-glow/50 focus:outline-none focus:border-cyber-mint focus:ring-2 focus:ring-cyber-mint/20 transition-all duration-300"
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-sm text-red-400 mt-2">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-silver-glow mb-3">Subject *</label>
                    <input
                      {...register('subject')}
                      className="w-full px-4 py-3 glass-card border border-neon-purple/30 rounded-lg bg-space-gray/20 text-silver-glow placeholder-silver-glow/50 focus:outline-none focus:border-cyber-mint focus:ring-2 focus:ring-cyber-mint/20 transition-all duration-300"
                      placeholder="What's your project about?"
                    />
                    {errors.subject && <p className="text-sm text-red-400 mt-2">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-silver-glow mb-3">Project Details *</label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      className="w-full px-4 py-3 glass-card border border-neon-purple/30 rounded-lg bg-space-gray/20 text-silver-glow placeholder-silver-glow/50 focus:outline-none focus:border-cyber-mint focus:ring-2 focus:ring-cyber-mint/20 transition-all duration-300 resize-none"
                      placeholder="Tell us about your project goals, timeline, budget range, and any specific requirements. The more details you provide, the better we can help you!"
                    />
                    {errors.message && <p className="text-sm text-red-400 mt-2">{errors.message.message}</p>}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full btn-gradient py-4 text-lg font-semibold group" 
                      disabled={isSubmitting}
                    >
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      {isSubmitting ? 'Sending Your Message...' : 'Send Project Inquiry'}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-12 border border-cyber-mint/30 bg-gradient-to-br from-cyber-mint/5 to-cosmic-blue/5"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-silver-glow mb-6 font-accent">
              Ready to Start Your <span className="text-cyber-mint">Digital Journey</span>?
            </h3>
            <p className="text-xl text-silver-glow/80 mb-8 leading-relaxed">
              Join our satisfied clients and transform your business with cutting-edge technology solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-gradient px-8 py-4 text-lg font-semibold">
                <Link href="/quote">
                  <Zap className="w-5 h-5 mr-2" />
                  Get Free Quote
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-cyber-mint text-cyber-mint hover:bg-cyber-mint/10 px-8 py-4 text-lg font-semibold">
                <Link href="/services">
                  <Star className="w-5 h-5 mr-2" />
                  View Services
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-br from-space-gray to-deep-space border border-cyber-mint/30 rounded-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-silver-glow/60 hover:text-silver-glow transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-cyber-mint rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-silver-glow mb-4 font-accent">
                  Live Chat Access Required
                </h3>
                
                <p className="text-silver-glow/80 mb-8 leading-relaxed">
                  To access our live chat support, you need to be registered in our client portal. 
                  This helps us provide personalized assistance and track your project history.
                </p>
                
                <div className="space-y-4">
                  <Button asChild className="btn-gradient w-full py-3 text-lg font-semibold">
                    <Link href="/client">
                      <LogIn className="w-5 h-5 mr-2" />
                      Login to Client Portal
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full py-3 text-lg font-semibold border-cyber-mint text-cyber-mint hover:bg-cyber-mint/10">
                    <Link href="/quote">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Register New Account
                    </Link>
                  </Button>
                </div>
                
                <p className="text-silver-glow/60 text-sm mt-6">
                  Need immediate help? Use our contact form below or email us directly.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
