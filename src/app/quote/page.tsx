'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getPackageById } from '@/data/service-packages'
import { services as fallbackServices } from '@/data/services'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, Clock, ArrowRight, Zap, Star, Shield, Calculator, Sparkles, Users, MessageSquare, Send, Target, Globe, Paintbrush, Code, Server, Bot, Smartphone, Palette, Brain } from 'lucide-react'
import QuoteConfirmationModal from '@/components/quote-confirmation-modal'
import { useAuth } from '@/contexts/auth-context'

const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  company: z.string().optional(),
  projectName: z.string().min(2, 'Project name must be at least 2 characters').optional(),
  description: z.string().min(50, 'Please provide a detailed description of your requirements (minimum 50 characters)').optional(),
  rushDelivery: z.enum(['standard', 'priority', 'express']).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

export default function QuotePage() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package')
  const serviceId = searchParams.get('service')
  const selectedPackage = packageId ? getPackageById(packageId) : null
  const [selectedService, setSelectedService] = useState<any>(null)
  const { customer, isLoading } = useAuth()

  // Fetch service details if serviceId is provided
  useEffect(() => {
    if (serviceId) {
      const fetchService = async () => {
        try {
          const response = await fetch('/api/services')
          const data = await response.json()
          let service = null
          
          if (data.success && data.services) {
            service = data.services.find((s: any) => s.id === serviceId)
          }
          
          // Fallback to static services if not found in database
          if (!service) {
            service = fallbackServices.find(s => s.id === serviceId)
          }
          
          setSelectedService(service)
        } catch (error) {
          console.error('Error fetching service, using fallback:', error)
          // Use fallback services
          const service = fallbackServices.find(s => s.id === serviceId)
          setSelectedService(service)
        }
      }
      fetchService()
    }
  }, [serviceId])
  
  const [rushDelivery, setRushDelivery] = useState<'standard' | 'priority' | 'express'>('standard')
  const [finalCost, setFinalCost] = useState(0)
  const [finalTimeline, setFinalTimeline] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [quoteResult, setQuoteResult] = useState<{
    quote: any
    customer: any
    tempPassword: string
  } | null>(null)

  const rushDeliveryOptions = {
    standard: { 
      label: 'Standard Delivery', 
      cost: 0, 
      description: 'Normal delivery timeline',
      icon: '📅',
      timeReduction: 0
    },
    priority: { 
      label: 'Priority Delivery', 
      cost: 49, 
      description: '25% faster delivery',
      icon: '⚡',
      timeReduction: 0.25
    },
    express: { 
      label: 'Express Delivery', 
      cost: 99, 
      description: '50% faster delivery',
      icon: '🚀',
      timeReduction: 0.5
    },
  }

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      rushDelivery: 'standard',
    }
  })

  // Package/Service pre-selection effect
  useEffect(() => {
    if (selectedPackage) {
      // Calculate final cost with rush delivery
      const rushCost = rushDeliveryOptions[rushDelivery].cost
      setFinalCost(selectedPackage.price + rushCost)
      
      // Calculate timeline with rush delivery reduction
      const timelineParts = selectedPackage.deliveryTime.split('-')
      const minDays = parseInt(timelineParts[0]) || 1
      const maxDays = parseInt(timelineParts[1]) || minDays + 2
      
      const timeReduction = rushDeliveryOptions[rushDelivery].timeReduction
      const reducedMin = Math.max(1, Math.ceil(minDays * (1 - timeReduction)))
      const reducedMax = Math.max(reducedMin + 1, Math.ceil(maxDays * (1 - timeReduction)))
      
      setFinalTimeline(`${reducedMin}-${reducedMax} days`)
      
      // Pre-fill description with package info
      setValue('description', `I'm interested in the ${selectedPackage.name} package. ${selectedPackage.description}\n\nAdditional requirements:`)
    } else if (selectedService) {
      // Calculate final cost with rush delivery for service
      const rushCost = rushDeliveryOptions[rushDelivery].cost
      setFinalCost(selectedService.startingPrice + rushCost)
      
      // Calculate timeline with rush delivery reduction for service
      const timelineParts = selectedService.timeline.split('-')
      const minDays = parseInt(timelineParts[0]) || 1
      const maxDays = parseInt(timelineParts[1]) || minDays + 2
      
      const timeReduction = rushDeliveryOptions[rushDelivery].timeReduction
      const reducedMin = Math.max(1, Math.ceil(minDays * (1 - timeReduction)))
      const reducedMax = Math.max(reducedMin + 1, Math.ceil(maxDays * (1 - timeReduction)))
      
      setFinalTimeline(`${reducedMin}-${reducedMax} days`)
      
      // Pre-fill description with service info
      setValue('description', `I'm interested in the ${selectedService.title} service. ${selectedService.description}\n\nAdditional requirements:`)
    } else {
      // Reset for custom quotes
      setFinalCost(0)
      setFinalTimeline('5-15 days') // Default timeline for custom quotes
    }
  }, [selectedPackage, selectedService, rushDelivery, setValue])

  const handleRushDeliveryChange = (option: 'standard' | 'priority' | 'express') => {
    setRushDelivery(option)
    setValue('rushDelivery', option)
  }

  // Function to calculate custom quote cost in real-time
  const calculateCustomQuote = (description: string) => {
    if (selectedPackage || selectedService) return finalCost // Use package/service calculation if selected
    
    if (!description) return 0
    
    const wordCount = description.split(' ').length
    
    // Base cost calculation
    let baseCost = 299
    
    // Add cost based on complexity indicators
    if (description.toLowerCase().includes('complex') || description.toLowerCase().includes('advanced')) {
      baseCost += 200
    }
    if (description.toLowerCase().includes('api') || description.toLowerCase().includes('database')) {
      baseCost += 150
    }
    if (description.toLowerCase().includes('design') || description.toLowerCase().includes('ui')) {
      baseCost += 100
    }
    if (description.toLowerCase().includes('mobile') || description.toLowerCase().includes('responsive')) {
      baseCost += 100
    }
    
    // Add cost based on description length
    if (wordCount > 100) baseCost += 100
    if (wordCount > 200) baseCost += 200
    
    // Add rush delivery cost
    const rushCost = rushDeliveryOptions[rushDelivery].cost
    return baseCost + rushCost
  }

  const onSubmit = async (data: QuoteFormData) => {
    try {
      const { createQuoteAndAccount, sendWelcomeEmail, sendAdminNotification } = await import('@/lib/quote-client')
      
      // Calculate custom quote cost if no package selected
      let calculatedCost = finalCost
      let calculatedTimeline = finalTimeline
      
      // For package or service quotes, use the displayed finalCost and finalTimeline
      if (selectedPackage || selectedService) {
        calculatedCost = finalCost
        calculatedTimeline = finalTimeline
        console.log('📦 Package/Service Quote:', {
          packageName: selectedPackage?.name || selectedService?.title,
          displayedCost: finalCost,
          submittedCost: calculatedCost,
          rushDelivery: data.rushDelivery
        })
      } else if (data.description) {
        // Only run custom calculation for non-package quotes
        const descriptionLength = data.description.length
        const wordCount = data.description.split(' ').length
        
        // Base cost calculation (you can adjust these values)
        let baseCost = 299 // Starting price for custom quotes
        
        // Add cost based on complexity indicators
        if (data.description.toLowerCase().includes('complex') || data.description.toLowerCase().includes('advanced')) {
          baseCost += 200
        }
        if (data.description.toLowerCase().includes('api') || data.description.toLowerCase().includes('database')) {
          baseCost += 150
        }
        if (data.description.toLowerCase().includes('design') || data.description.toLowerCase().includes('ui')) {
          baseCost += 100
        }
        if (data.description.toLowerCase().includes('mobile') || data.description.toLowerCase().includes('responsive')) {
          baseCost += 100
        }
        
        // Add cost based on description length (complexity indicator)
        if (wordCount > 100) baseCost += 100
        if (wordCount > 200) baseCost += 200
        
        // Add rush delivery cost
        const rushCost = rushDeliveryOptions[rushDelivery].cost
        calculatedCost = baseCost + rushCost
        
        // Calculate timeline based on complexity
        let baseTimeline = 10 // Base days for custom quotes
        if (data.description.toLowerCase().includes('complex') || data.description.toLowerCase().includes('advanced')) {
          baseTimeline += 5
        }
        if (data.description.toLowerCase().includes('api') || data.description.toLowerCase().includes('database')) {
          baseTimeline += 3
        }
        
        // Apply rush delivery reduction
        const timeReduction = rushDeliveryOptions[rushDelivery].timeReduction
        const finalDays = Math.max(3, Math.ceil(baseTimeline * (1 - timeReduction)))
        calculatedTimeline = `${finalDays}-${finalDays + 5} days`
        
        // Update the displayed cost for custom quotes
        setFinalCost(calculatedCost)
        setFinalTimeline(calculatedTimeline)
        console.log('🔧 Custom Quote Calculation:', {
          baseCost: baseCost,
          rushCost: rushDeliveryOptions[rushDelivery].cost,
          finalCalculatedCost: calculatedCost,
          wordCount: wordCount
        })
      }
      
      // Prepare quote data
      console.log('📦 Quote form package debug:', {
        hasSelectedPackage: !!selectedPackage,
        selectedPackage: selectedPackage,
        hasSelectedService: !!selectedService,
        selectedService: selectedService,
        finalCost: finalCost,
        calculatedCost: calculatedCost,
        willSubmitPackage: !!(selectedPackage || selectedService)
      })
      
      // Check if this is just a registration (no project details provided)
      const isRegistrationOnly = !data.projectName && !data.description && !selectedPackage && !selectedService
      
      const quoteData = {
        name: customer?.name || data.name || '',
        email: customer?.email || data.email || '',
        company: customer?.company || data.company || '',
        projectName: data.projectName || (isRegistrationOnly ? 'Account Registration' : ''),
        description: data.description || (isRegistrationOnly ? 'User registered for account access' : ''),
        estimatedCost: isRegistrationOnly ? 0 : calculatedCost,
        estimatedTimeline: isRegistrationOnly ? 'TBD' : calculatedTimeline,
        rushDelivery: data.rushDelivery,
        password: customer ? undefined : data.password, // Only include password for new users
        customerId: customer?.id, // Include customer ID if logged in
        // Include package information if selected (convert service to package format)
        selectedPackage: selectedPackage ? {
          id: selectedPackage.id,
          name: selectedPackage.name,
          price: selectedPackage.price,
          features: selectedPackage.features,
          deliveryTime: selectedPackage.deliveryTime,
          category: selectedPackage.category,
          complexity: selectedPackage.complexity
        } : selectedService ? {
          id: selectedService.id,
          name: selectedService.title,
          price: selectedService.startingPrice,
          features: selectedService.features || [],
          deliveryTime: selectedService.timeline,
          category: selectedService.category,
          complexity: 'standard'
        } : null
      }
      
      console.log('🚀 Submitting quote data:', quoteData)
      
      // Create quote and customer account (if needed)
      const result = await createQuoteAndAccount(quoteData)
      
      // Send notifications
      if (!customer) {
        sendWelcomeEmail(result.customer, result.tempPassword, result.quote)
      }
      sendAdminNotification(result.quote, result.customer)
      
      // Show confirmation modal
      setQuoteResult({
        quote: result.quote,
        customer: result.customer,
        tempPassword: result.tempPassword
      })
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Error submitting quote:', error)
      // Handle error - show error message to user
    }
  }

  if (isSubmitted && quoteResult) {
    return (
      <>
        <main className="pt-16">
          <section className="py-20 relative overflow-hidden opacity-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Processing Your </span>
                <span className="gradient-text">Quote Request</span>
              </h1>
            </div>
          </section>
        </main>
        
        <QuoteConfirmationModal
          isOpen={isSubmitted}
          onClose={() => {
            setIsSubmitted(false)
            setQuoteResult(null)
            // If user is logged in, redirect to dashboard
            if (customer) {
              window.location.href = '/client/dashboard'
            }
          }}
          quoteData={{
            id: quoteResult?.quote?.id || '',
            name: quoteResult?.quote?.name || '',
            email: quoteResult?.quote?.email || '',
            company: quoteResult?.quote?.company,
            estimatedCost: quoteResult?.quote?.estimatedCost || 0,
            estimatedTimeline: quoteResult?.quote?.estimatedTimeline || '',
            description: quoteResult?.quote?.description || ''
          }}
          tempPassword={quoteResult?.tempPassword || ''}
          isLoggedIn={!!customer}
        />
      </>
    )
  }

  return (
    <main className="pt-16">
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/90 to-background"></div>
        
        {/* Floating background elements */}
        <div className="absolute top-20 right-20 w-64 h-64 gradient-accent rounded-full blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 gradient-secondary rounded-full blur-2xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Get Your </span>
              <span className="gradient-text">Project Quote</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {selectedPackage 
                ? `Complete your ${selectedPackage.name} package request with detailed requirements.`
                : selectedService
                ? `Complete your ${selectedService.title} service request with detailed requirements.`
                : 'Tell us about your project requirements and get a custom quote.'
              }
            </p>
          </motion.div>

          {/* Package Selection Banner */}
          {selectedPackage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${selectedPackage.color} rounded-xl flex items-center justify-center text-xl text-white shadow-lg`}>
                        {selectedPackage.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {selectedPackage.name} Package Selected
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedPackage.description} • {selectedPackage.deliveryTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        £{finalCost.toLocaleString()}
                      </div>
                      {selectedPackage.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          £{selectedPackage.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Service Selection Banner */}
          {selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-cyber-mint rounded-xl flex items-center justify-center text-xl text-white shadow-lg">
                        {selectedService.icon === 'Target' && <Target className="w-6 h-6" />}
                        {selectedService.icon === 'Globe' && <Globe className="w-6 h-6" />}
                        {selectedService.icon === 'Paintbrush' && <Paintbrush className="w-6 h-6" />}
                        {selectedService.icon === 'Code' && <Code className="w-6 h-6" />}
                        {selectedService.icon === 'Server' && <Server className="w-6 h-6" />}
                        {selectedService.icon === 'Bot' && <Bot className="w-6 h-6" />}
                        {selectedService.icon === 'Smartphone' && <Smartphone className="w-6 h-6" />}
                        {selectedService.icon === 'Palette' && <Palette className="w-6 h-6" />}
                        {selectedService.icon === 'Zap' && <Zap className="w-6 h-6" />}
                        {selectedService.icon === 'Brain' && <Brain className="w-6 h-6" />}
                        {selectedService.icon === 'ShoppingCart' && <Zap className="w-6 h-6" />}
                        {!['Target', 'Globe', 'Paintbrush', 'Code', 'Server', 'Bot', 'Smartphone', 'Palette', 'Zap', 'Brain', 'ShoppingCart'].includes(selectedService.icon) && <Star className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {selectedService.title} Service Selected
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedService.description} • {selectedService.timeline}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        £{finalCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Starting from £{selectedService.startingPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Service Details Section - Show ALL Features */}
          {selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <Card className="glass-card border border-neon-purple/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-silver-glow">
                    <Shield className="w-5 h-5 text-cyber-mint" />
                    AI-Enhanced Service Features
                  </CardTitle>
                  <CardDescription className="text-silver-glow/70">
                    Complete feature set included with your {selectedService.title} service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedService.features.map((feature: string, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 glass-card border border-cyber-mint/10 rounded-lg hover:border-cyber-mint/30 transition-all duration-300"
                      >
                        <CheckCircle className="w-5 h-5 text-cyber-mint mt-0.5 flex-shrink-0 animate-pulse-glow" />
                        <span className="text-sm text-silver-glow">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 glass-card border border-neon-purple/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-neon-purple" />
                      <span className="font-medium text-silver-glow">Total Features Included</span>
                    </div>
                    <span className="text-2xl font-bold text-neon-purple animate-hologram">
                      {selectedService.features.length} Premium Features
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Package Details Section - Show ALL Features */}
          {selectedPackage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <Card className="glass-card border border-cosmic-blue/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-silver-glow">
                    <Shield className="w-5 h-5 mr-2 text-plasma-pink" />
                    Complete Package Features
                  </CardTitle>
                  <CardDescription className="text-silver-glow/70">
                    Everything included with your {selectedPackage.name} package
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedPackage.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          className="flex items-start space-x-3 p-3 glass-card border border-plasma-pink/10 rounded-lg hover:border-plasma-pink/30 transition-all duration-300"
                        >
                          <CheckCircle className="w-5 h-5 text-plasma-pink mt-0.5 flex-shrink-0 animate-pulse-glow" />
                          <span className="text-sm text-silver-glow">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="p-4 glass-card border border-cosmic-blue/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-cosmic-blue" />
                        <span className="font-medium text-silver-glow">Package Summary</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-silver-glow/70">Total Features:</span>
                          <div className="text-xl font-bold text-cosmic-blue animate-hologram">
                            {selectedPackage.features.length} Features
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-silver-glow/70">Complexity Level:</span>
                          <div className="text-xl font-bold text-plasma-pink capitalize">
                            {selectedPackage.complexity}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Package Price:</span>
                          <span className="text-lg font-bold text-primary">
                            £{(selectedPackage?.price || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">Delivery Time:</span>
                          <span className="text-sm font-medium text-primary">
                            {finalTimeline}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Package Benefits
                          </span>
                        </div>
                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                          <li>• Fixed price - no surprises</li>
                          <li>• Guaranteed delivery time</li>
                          <li>• Professional quality assured</li>
                          <li>• Free revisions included</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quote Form */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Contact Information */}
                {!isLoading && !customer && (
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-primary" />
                        Contact Information
                      </CardTitle>
                      <CardDescription>Tell us about yourself and your business</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Full Name *</label>
                          <Input
                            {...register('name')}
                            placeholder="Your full name"
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <Input
                            {...register('email')}
                            type="email"
                            placeholder="your@email.com"
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Company (Optional)</label>
                        <Input
                          {...register('company')}
                          placeholder="Your company name"
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Choose Password *</label>
                        <Input
                          {...register('password')}
                          type="password"
                          placeholder="Create a password for your account"
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                        <p className="text-sm text-muted-foreground mt-1">This will be used to access your client portal</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rush Delivery Options */}
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-primary" />
                      Delivery Speed
                    </CardTitle>
                    <CardDescription>Choose your preferred delivery timeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(rushDeliveryOptions).map(([key, option]) => (
                        <div
                          key={key}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            rushDelivery === key
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                          onClick={() => handleRushDeliveryChange(key as 'standard' | 'priority' | 'express')}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <h4 className="font-semibold text-foreground mb-2">{option.label}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                            <div className="text-lg font-bold text-primary">
                              {option.cost === 0 ? 'Included' : `+£${option.cost}`}
                            </div>
                            {rushDelivery === key && (
                              <CheckCircle className="w-5 h-5 text-primary mx-auto mt-3" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Project Description */}
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                      Detailed Project Requirements
                    </CardTitle>
                    <CardDescription>
                      Provide project details to get an accurate quote, or leave blank to just register for now
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Name (Optional)</label>
                      <Input
                        {...register('projectName')}
                        placeholder="e.g., Company Website Redesign, E-commerce Platform, Mobile App"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                      {errors.projectName && <p className="text-sm text-red-500 mt-1">{errors.projectName.message}</p>}
                      <p className="text-sm text-muted-foreground mt-1">Give your project a name for easy reference (you can add this later)</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Description (Optional)</label>
                      <Textarea
                        {...register('description')}
                        rows={8}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        placeholder={selectedPackage 
                          ? `Tell us about your specific requirements for the ${selectedPackage.name} package:\n\n• What is the main purpose of your project?\n• Who is your target audience?\n• Do you have any specific design preferences?\n• Are there any special features you need?\n• Do you have existing branding/content?\n• Any technical requirements or integrations?\n• Timeline considerations or constraints?`
                          : `Please provide detailed information about your project:\n\n• What type of website/application do you need?\n• What is the main purpose and goals?\n• Who is your target audience?\n• What features and functionality do you require?\n• Do you have any design preferences?\n• Any technical requirements or integrations?\n• What is your preferred timeline?`
                        }
                      />
                    </div>
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
                    
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        💡 Tips for a better quote:
                      </h5>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Be specific about functionality you need</li>
                        <li>• Mention any existing systems to integrate with</li>
                        <li>• Include your target launch date if you have one</li>
                        <li>• Describe your target audience and their needs</li>
                        <li>• Mention if you have existing branding or content</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full btn-gradient animate-pulse-glow">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Quote Request
                </Button>
              </form>
            </div>

            {/* Live Quote Summary */}
            <div className="space-y-6">
              <div className="sticky top-24 space-y-6">
                <Card className="card-hover border-primary/20 shadow-lg">
                  <CardHeader className="gradient-primary text-white">
                    <CardTitle className="flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Quote Summary
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      {selectedPackage ? 'Package pricing with options' : 'Custom quote estimate'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Main Price Display */}
                    <div className="text-center p-6 gradient-accent rounded-xl text-white">
                      <div className="text-sm opacity-90 mb-2">Total Project Cost</div>
                      <div className="text-4xl font-bold mb-2">
                        {selectedPackage 
                          ? formatCurrency(finalCost) 
                          : calculateCustomQuote(watch('description') || '') > 0 
                            ? formatCurrency(calculateCustomQuote(watch('description') || ''))
                            : 'Custom Quote'
                        }
                      </div>
                      <div className="text-sm opacity-90">
                        {selectedPackage 
                          ? 'Fixed package price' 
                          : calculateCustomQuote(watch('description') || '') > 0
                            ? 'Estimated custom quote price'
                            : 'Pricing after consultation'
                        }
                      </div>
                    </div>

                    {/* Timeline & Details */}
                    {(selectedPackage || watch('description')) && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-secondary/50 rounded-lg">
                            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                            <div className="text-sm text-muted-foreground">Timeline</div>
                            <div className="font-semibold">
                              {selectedPackage ? finalTimeline : '5-15 days'}
                            </div>
                          </div>
                          <div className="text-center p-4 bg-secondary/50 rounded-lg">
                            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                            <div className="text-sm text-muted-foreground">Delivery</div>
                            <div className="font-semibold capitalize">{rushDelivery}</div>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 pt-4 border-t border-border">
                          <div className="flex justify-between text-sm">
                            <span>{selectedPackage ? 'Package Price' : 'Base Price'}</span>
                            <span>{formatCurrency(selectedPackage?.price || 299)}</span>
                          </div>
                          {rushDeliveryOptions[rushDelivery].cost > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Rush Delivery ({rushDeliveryOptions[rushDelivery].label})</span>
                              <span>{formatCurrency(rushDeliveryOptions[rushDelivery].cost)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold pt-2 border-t border-border">
                            <span>Total</span>
                            <span>{formatCurrency(selectedPackage ? finalCost : calculateCustomQuote(watch('description') || ''))}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 mr-2 text-primary" />
                        <span>No hidden fees • Transparent pricing</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-4 h-4 mr-2 text-primary" />
                        <span>Free consultation included</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                        <span>24/7 project support</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground pt-4 border-t border-border text-center">
                      * Final pricing confirmed after consultation
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
