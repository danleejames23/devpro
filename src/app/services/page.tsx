'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { services as fallbackServices } from '@/data/services'
import { Service } from '@/types'
import { Check, ArrowRight, Star, Zap, Clock, Shield, Bot, Code, Smartphone, Palette, Server, Brain, MessageSquare, Target, Globe, Paintbrush } from 'lucide-react'
import Link from 'next/link'
import ScrollReveal from '@/components/scroll-reveal'

const serviceCategories = [
  { id: 'all', name: 'All Services', icon: <Star className="w-5 h-5" /> },
  { id: 'basic', name: 'Basic Web', icon: <Code className="w-5 h-5" /> },
  { id: 'web', name: 'Advanced Web', icon: <Server className="w-5 h-5" /> },
  { id: 'ai', name: 'AI Solutions', icon: <Bot className="w-5 h-5" /> },
  { id: 'mobile', name: 'Mobile Apps', icon: <Smartphone className="w-5 h-5" /> },
  { id: 'design', name: 'Design', icon: <Palette className="w-5 h-5" /> }
]

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>(fallbackServices)
  const [loading, setLoading] = useState(true)

  // Fetch services from database with fallback
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        const data = await response.json()
        if (data.success && data.services && data.services.length > 0) {
          setServices(data.services)
        } else {
          // Use fallback services if database is empty or fails
          setServices(fallbackServices)
        }
      } catch (error) {
        console.error('Error fetching services, using fallback:', error)
        setServices(fallbackServices)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => {
        if (activeCategory === 'basic') return ['landing-page', 'basic-website'].includes(service.id)
        if (activeCategory === 'web') return ['frontend-development', 'backend-development', 'custom-website-development', 'fullstack-development', 'ecommerce-solutions'].includes(service.id)
        if (activeCategory === 'ai') return ['ai-chatbots', 'ai-web-agents', 'ai-integration'].includes(service.id)
        if (activeCategory === 'mobile') return ['mobile-development'].includes(service.id)
        if (activeCategory === 'design') return ['branding-design'].includes(service.id)
        return false
      })

  return (
    <main className="pt-16 min-h-screen" style={{ background: 'linear-gradient(to bottom right, #0f0f1a, #1f1f2e, #0f0f1a)' }}>
      {/* Futuristic Hero Section */}
      <section className="relative py-12 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-neon-purple/20 to-cyber-mint/10 rounded-full blur-3xl animate-cosmic-drift"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-cosmic-blue/15 to-plasma-pink/10 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '10s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="inline-block glass-card px-6 py-3 rounded-full border border-neon-purple/30 animate-neon-pulse mb-8">
              <span className="text-cyber-mint font-accent font-semibold text-sm tracking-wider uppercase">
                🤖 AI-Powered Development Services
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-accent font-bold leading-tight">
              <span className="block text-silver-glow">AI Development</span>
              <span className="block text-white">
                & Web Solutions
              </span>
              <span className="block text-silver-glow">Fixed Pricing</span>
            </h1>

            <p className="text-xl md:text-2xl text-silver-glow/80 leading-relaxed max-w-4xl mx-auto font-light">
              From AI-powered applications to intelligent web solutions and automated systems.
              <br />
              <span className="text-cyber-mint font-medium">Transparent pricing. Guaranteed delivery. Intelligent results.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Service Categories */}
      <section className="py-20" style={{ backgroundColor: '#0f0f1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`glass-card px-6 py-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 font-accent font-semibold ${
                  activeCategory === category.id
                    ? 'border-cyber-mint bg-cyber-mint/10 text-cyber-mint animate-neon-pulse'
                    : 'border-neon-purple/20 text-silver-glow hover:border-neon-purple/40 hover:text-cyber-mint'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* Services Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onHoverStart={() => setHoveredService(service.id)}
                  onHoverEnd={() => setHoveredService(null)}
                  className="group"
                >
                  <Card className="glass-card h-full border border-neon-purple/20 hover:border-cyber-mint/50 transition-all duration-500 relative overflow-hidden card-hover">
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-cyber-mint/5 to-cosmic-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-cyber-mint rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg animate-pulse-glow">
                          {service.icon === 'Target' && <Target className="w-8 h-8" />}
                          {service.icon === 'Globe' && <Globe className="w-8 h-8" />}
                          {service.icon === 'Paintbrush' && <Paintbrush className="w-8 h-8" />}
                          {service.icon === 'Code' && <Code className="w-8 h-8" />}
                          {service.icon === 'Server' && <Server className="w-8 h-8" />}
                          {service.icon === 'ShoppingCart' && <Zap className="w-8 h-8" />}
                          {service.icon === 'Bot' && <Bot className="w-8 h-8" />}
                          {service.icon === 'Zap' && <Zap className="w-8 h-8" />}
                          {service.icon === 'Brain' && <Brain className="w-8 h-8" />}
                          {service.icon === 'Smartphone' && <Smartphone className="w-8 h-8" />}
                          {service.icon === 'Palette' && <Palette className="w-8 h-8" />}
                        </div>
                        <div className="text-right">
                          <div className="glass-card px-3 py-1.5 rounded-full border border-cyber-mint/30">
                            <span className="text-cyber-mint text-sm font-bold flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1.5" />
                              {service.timeline}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl mb-2 text-silver-glow font-accent">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-silver-glow/70 leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 relative z-10">
                      <div className="space-y-2">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-cyber-mint font-accent">
                            £{service.startingPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-silver-glow flex items-center font-accent">
                          <Shield className="w-4 h-4 mr-2 text-cyber-mint" />
                          Features included:
                        </h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                              <Check className="w-4 h-4 text-cyber-mint mt-1 flex-shrink-0" />
                              <span className="text-sm text-silver-glow/80">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        className="w-full btn-gradient group transition-all duration-300" 
                        asChild
                      >
                        <Link href={`/quote?service=${service.id}`}>
                          <Zap className="mr-2 h-4 w-4" />
                          Get Quote
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Futuristic Process Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-space-gray/50 to-deep-space/80"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-6 mb-16"
          >
            <div className="inline-block glass-card px-6 py-3 rounded-full border border-cosmic-blue/30 animate-neon-pulse">
              <span className="text-cosmic-blue font-accent font-semibold text-sm tracking-wider uppercase">
                ⚡ Streamlined Development Process
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-silver-glow font-accent">
              Professional Development Process
            </h2>
            <p className="text-xl text-silver-glow/80 max-w-3xl mx-auto">
              Modern methodologies and proven processes for reliable, high-quality delivery.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Requirements Analysis',
                description: 'Thorough analysis of your project requirements with detailed planning and technical recommendations.',
                color: 'from-neon-purple to-cosmic-blue'
              },
              {
                step: '02',
                title: 'Design & Prototyping',
                description: 'Custom design creation with interactive prototypes and user experience optimization.',
                color: 'from-cosmic-blue to-cyber-mint'
              },
              {
                step: '03',
                title: 'Development & Testing',
                description: 'Professional coding with comprehensive testing, quality assurance, and performance optimization.',
                color: 'from-cyber-mint to-plasma-pink'
              },
              {
                step: '04',
                title: 'Launch & Support',
                description: 'Seamless deployment with ongoing support, monitoring, and maintenance for optimal performance.',
                color: 'from-plasma-pink to-neon-purple'
              }
            ].map((process, index) => (
              <motion.div
                key={process.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center space-y-6 group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${process.color} rounded-3xl flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-lg animate-pulse-glow group-hover:scale-110 transition-transform duration-300`}>
                  {process.step}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-silver-glow font-accent">{process.title}</h3>
                  <p className="text-silver-glow/70 leading-relaxed">{process.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Futuristic CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-neon-purple/20 to-cyber-mint/10 rounded-full blur-3xl animate-cosmic-drift"></div>
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-br from-cosmic-blue/15 to-plasma-pink/10 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '10s'}}></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold text-silver-glow font-accent leading-tight">
                Ready to Build Your
                <span className="block bg-gradient-to-r from-neon-purple via-cyber-mint to-cosmic-blue bg-clip-text text-transparent animate-gradient">
                  Dream Project?
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-silver-glow/80 max-w-3xl mx-auto">
                Let's work together to create professional websites and applications that drive results.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="btn-gradient px-10 py-4 text-lg font-semibold group" asChild>
                <Link href="/quote">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" className="btn-neon px-10 py-4 text-lg font-semibold" asChild>
                <Link href="/contact">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Free Consultation
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t border-neon-purple/20"
            >
              <div className="glass-card p-6 text-center border border-cyber-mint/20">
                <div className="text-2xl font-bold text-cyber-mint mb-2 font-accent">24/7</div>
                <div className="text-sm text-silver-glow/70 uppercase tracking-wider">Support Available</div>
              </div>
              <div className="glass-card p-6 text-center border border-cosmic-blue/20">
                <div className="text-2xl font-bold text-cosmic-blue mb-2 font-accent">100%</div>
                <div className="text-sm text-silver-glow/70 uppercase tracking-wider">Satisfaction Guarantee</div>
              </div>
              <div className="glass-card p-6 text-center border border-plasma-pink/20">
                <div className="text-2xl font-bold text-plasma-pink mb-2 font-accent">within 24hrs</div>
                <div className="text-sm text-silver-glow/70 uppercase tracking-wider">Response Time</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
