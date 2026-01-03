'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Phone, Send, CheckCircle, MessageCircle, Clock, ArrowRight, X, LogIn, MapPin, Sparkles, Globe, Smartphone, Bot, Zap } from 'lucide-react'
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
  const [selectedProjectType, setSelectedProjectType] = useState('')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        setIsSubmitted(true)
        setSelectedProjectType('')
        reset()
      } else {
        alert('Failed to submit inquiry. Please try again.')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    }
  }

  const projectTypes = [
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'webapp', label: 'Web App', icon: Zap },
    { id: 'ai', label: 'AI Integration', icon: Bot },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone },
    { id: 'ecommerce', label: 'E-commerce', icon: Globe },
    { id: 'other', label: 'Other', icon: Sparkles }
  ]

  if (isSubmitted) {
    return (
      <main className="pt-24 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="max-w-md mx-auto px-4 text-center relative">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Message Sent Successfully!</h1>
            <p className="text-slate-400 mb-6">
              Thank you for reaching out. We&apos;ll get back to you within 24 hours.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/20 mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Let&apos;s Build Something
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                Amazing Together
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Have a project in mind? We&apos;d love to hear about it. Send us a message and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {[
              { value: '50+', label: 'Projects Delivered' },
              { value: '<24h', label: 'Response Time' },
              { value: '100%', label: 'Client Satisfaction' },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-6 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-8 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="mailto:hello@lumora.dev"
              className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 text-center hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">Email Us</h3>
              <p className="text-cyan-400 text-sm">hello@lumora.dev</p>
            </a>
            
            <a 
              href="https://wa.me/447359792577"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 text-center hover:shadow-xl hover:shadow-green-500/10"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1 group-hover:text-green-400 transition-colors">WhatsApp</h3>
              <p className="text-green-400 text-sm">+44 7359 792 577</p>
            </a>
            
            <div className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Location</h3>
              <p className="text-purple-400 text-sm">London, United Kingdom</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Chat Notice */}
      <section className="pb-12 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-green-400 mb-1 flex items-center justify-center md:justify-start gap-2">
                  Live Developer Chat
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full animate-pulse">Live</span>
                </h3>
                <p className="text-slate-400 text-sm">
                  Register for our <span className="text-white font-medium">Client Portal</span> to access live chat with our development team. 
                  Get instant answers, real-time project updates, and direct communication with the developers working on your project.
                </p>
              </div>
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 flex-shrink-0"
              >
                <LogIn className="w-4 h-4" />
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-16 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
              <p className="text-slate-400 text-sm">Fill out the form below and we&apos;ll get back to you shortly</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  What type of project do you need?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {projectTypes.map((type) => (
                    <label key={type.id} className="cursor-pointer">
                      <input
                        {...register('projectType')}
                        type="radio"
                        value={type.id}
                        className="sr-only"
                        onChange={(e) => setSelectedProjectType(e.target.value)}
                      />
                      <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300 ${
                        selectedProjectType === type.id 
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10' 
                          : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-700/30'
                      }`}>
                        <type.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                  <input
                    {...register('name')}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
                <input
                  {...register('subject')}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="What's your project about?"
                />
                {errors.subject && <p className="text-sm text-red-400 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message *</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                  placeholder="Tell us about your project, goals, and timeline..."
                />
                {errors.message && <p className="text-sm text-red-400 mt-1">{errors.message.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
              >
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Ready to Start?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need a Quick Quote?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Use our instant quote form for faster response with detailed pricing estimates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
            >
              Get Free Quote
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/custom-quote"
              className="group inline-flex items-center justify-center px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50"
            >
              Custom Project
              <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Please login to access live chat support.
                </p>
                <Link 
                  href="/client"
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Portal
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
