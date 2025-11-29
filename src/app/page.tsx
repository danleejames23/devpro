'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { services } from '@/data/services'
import { Check, ArrowRight, Star, Zap, Clock, Shield, Users, Award, TrendingUp, Target, Globe, Paintbrush, Code, Server, Bot, Smartphone, Palette, Brain } from 'lucide-react'
import QuoteTypeModal from '@/components/quote-type-modal'
import ScrollReveal from '@/components/scroll-reveal'
import RealTimeStats from '@/components/real-time-stats'
export default function Home() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0)
  const [revenue, setRevenue] = useState(47530)
  
  // Featured services to rotate through (select the most popular/important ones)
  const featuredServices = services.filter(s => 
    ['ai-chatbots', 'e-commerce-website', 'custom-web-app', 'landing-page', 'backend-development', 'ui-ux-design'].includes(s.id)
  )
  
  const featuredService = featuredServices[currentServiceIndex] || services[0]

  // Rotate featured service every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex(prev => (prev + 1) % featuredServices.length)
    }, 8000) // Change every 8 seconds

    return () => clearInterval(interval)
  }, [featuredServices.length])
  
  // Fetch global revenue (baseline 47530 + all payments) and auto-refresh
  useEffect(() => {
    let active = true
    let interval: ReturnType<typeof setInterval> | null = null
    const load = async () => {
      try {
        const res = await fetch('/api/metrics/revenue', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (active && data?.success && typeof data.revenue === 'number') {
          setRevenue(data.revenue)
        }
      } catch {
        // keep baseline on failure
      }
    }
    load()
    interval = setInterval(load, 30000) // refresh every 30s
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      active = false
      if (interval) clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])
  
  return (
    <main style={{ backgroundColor: '#0f0f1a' }}>
      {/* Futuristic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Cosmic Background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, #0f0f1a, #1f1f2e, #0f0f1a)' }}></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-neon-purple/30 to-cyber-mint/20 rounded-full blur-3xl animate-cosmic-drift"></div>
          <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-br from-cosmic-blue/25 to-plasma-pink/15 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '10s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cyber-mint/20 to-neon-purple/15 rounded-full blur-xl animate-cosmic-drift" style={{animationDelay: '5s'}}></div>
        </div>

        {/* Particle Field */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => {
            // Use deterministic values based on index to avoid hydration mismatch
            const left = ((i * 37) % 100);
            const top = ((i * 23 + 17) % 100);
            const delay = (i * 0.3) % 6;
            const duration = 4 + ((i * 0.2) % 4);
            
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyber-mint rounded-full animate-particle-float opacity-40"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }}
              />
            );
          })}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
          <div className="absolute -right-16 top-16 pointer-events-none hidden lg:block">
            <RealTimeStats />
          </div>
          <div className="text-center space-y-12">
            {/* Main Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="inline-block"
                >
                  <div className="glass-card px-6 py-3 rounded-full border border-neon-purple/30 animate-neon-pulse">
                    <span className="text-cyber-mint font-accent font-semibold text-sm tracking-wider uppercase">
                      ⚡ AI-Powered Developer
                    </span>
                  </div>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="text-6xl md:text-8xl lg:text-9xl font-accent font-bold leading-tight"
                >
                  <span className="block text-silver-glow animate-hologram">Building the</span>
                  <span className="block text-white">
                    Future of
                  </span>
                  <span className="block text-silver-glow animate-hologram">Freelance Tech</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-xl md:text-2xl text-silver-glow/80 leading-relaxed max-w-4xl mx-auto font-light"
                >
                  From AI-powered web applications to autonomous agents and cutting-edge integrations.
                  <br />
                  <span className="text-cyber-mint font-medium">Transparent pricing. Guaranteed delivery. Futuristic solutions.</span>
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <Button size="lg" className="btn-gradient px-8 py-4 text-lg font-semibold group" asChild>
                  <Link href="/quote">
                    <Zap className="mr-2 h-5 w-5" />
                    Get a Quote
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" className="btn-neon px-8 py-4 text-lg font-semibold" asChild>
                  <Link href="#work">
                    View My Work
                  </Link>
                </Button>
              </motion.div>

              {/* Enhanced Analytics Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12"
              >
                <div className="glass-card p-6 text-center border border-neon-purple/20 animate-pulse-glow">
                  <div className="text-3xl font-bold text-cyber-mint mb-2">13+</div>
                  <div className="text-sm text-silver-glow/70 uppercase tracking-wider">Projects Delivered</div>
                </div>
                <div className="glass-card p-6 text-center border border-cosmic-blue/20 animate-pulse-glow" style={{animationDelay: '0.5s'}}>
                  <div className="text-3xl font-bold text-cosmic-blue mb-2">£{revenue.toLocaleString()}</div>
                  <div className="text-sm text-silver-glow/70 uppercase tracking-wider">Revenue Generated</div>
                </div>
                <div className="glass-card p-6 text-center border border-plasma-pink/20 animate-pulse-glow" style={{animationDelay: '1s'}}>
                  <div className="text-3xl font-bold text-plasma-pink mb-2">100%</div>
                  <div className="text-sm text-silver-glow/70 uppercase tracking-wider">Success Rate</div>
                </div>
                <div className="glass-card p-6 text-center border border-cyber-mint/20 animate-pulse-glow" style={{animationDelay: '1.5s'}}>
                  <div className="text-3xl font-bold text-cyber-mint mb-2">24/7</div>
                  <div className="text-sm text-silver-glow/70 uppercase tracking-wider">AI Support</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Featured Package */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featuredService.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          {featuredService.icon === 'Target' && <Target className="w-7 h-7" />}
                          {featuredService.icon === 'Globe' && <Globe className="w-7 h-7" />}
                          {featuredService.icon === 'Paintbrush' && <Paintbrush className="w-7 h-7" />}
                          {featuredService.icon === 'Code' && <Code className="w-7 h-7" />}
                          {featuredService.icon === 'Server' && <Server className="w-7 h-7" />}
                          {featuredService.icon === 'Bot' && <Bot className="w-7 h-7" />}
                          {featuredService.icon === 'Smartphone' && <Smartphone className="w-7 h-7" />}
                          {featuredService.icon === 'Palette' && <Palette className="w-7 h-7" />}
                          {featuredService.icon === 'Zap' && <Zap className="w-7 h-7" />}
                          {featuredService.icon === 'Brain' && <Brain className="w-7 h-7" />}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="bg-primary text-primary-foreground px-2.5 py-1 text-xs font-medium rounded-full flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </div>
                          <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {featuredService.timeline}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-1">{featuredService.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{featuredService.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-primary">
                          £{featuredService.startingPrice.toLocaleString()}
                        </span>
                      </div>
                      
                      <ul className="space-y-1.5">
                        {featuredService.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button className="w-full group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                        <Link href={`/quote?service=${featuredService.id}`}>
                          <Zap className="mr-2 h-4 w-4" />
                          Get Started Now
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From basic websites to AI-powered applications. Fixed pricing, clear deliverables, and fast turnaround times.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 group border-2 hover:border-primary/30 relative overflow-hidden">
                  {/* Services don't have popular property */}
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white shadow-lg">
                        {service.icon === 'Target' && <Target className="w-5 h-5" />}
                        {service.icon === 'Globe' && <Globe className="w-5 h-5" />}
                        {service.icon === 'Paintbrush' && <Paintbrush className="w-5 h-5" />}
                        {service.icon === 'Code' && <Code className="w-5 h-5" />}
                        {service.icon === 'Server' && <Server className="w-5 h-5" />}
                        {service.icon === 'Bot' && <Bot className="w-5 h-5" />}
                        {service.icon === 'Smartphone' && <Smartphone className="w-5 h-5" />}
                        {service.icon === 'Palette' && <Palette className="w-5 h-5" />}
                        {service.icon === 'ShoppingCart' && <Zap className="w-5 h-5" />}
                        {service.icon === 'Zap' && <Zap className="w-5 h-5" />}
                        {service.icon === 'Brain' && <Brain className="w-5 h-5" />}
                      </div>
                      <div className="text-right">
                        <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {service.timeline}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg mb-1">{service.title}</CardTitle>
                    <CardDescription className="text-xs leading-snug">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 relative z-10">
                    <div className="flex items-baseline">
                      <span className="text-lg font-bold text-primary">
                        £{service.startingPrice.toLocaleString()}
                      </span>
                    </div>

                    <ul className="space-y-1">
                      {service.features.slice(0, 3).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground leading-tight">{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-xs text-primary font-medium">
                          +{service.features.length - 3} more features
                        </li>
                      )}
                    </ul>

                    <Button 
                      className="w-full group transition-all duration-300" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/quote?service=${service.id}`}>
                        Get Quote
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button size="lg" variant="outline" asChild>
              <Link href="/services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Why Choose <span className="gradient-text">Our Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional web development AND cutting-edge AI solutions with transparent pricing and guaranteed results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Fixed Pricing',
                description: 'No hidden costs or surprise fees. What you see is what you pay.'
              },
              {
                icon: Clock,
                title: 'Fast Delivery',
                description: 'Guaranteed delivery times from 3-30 days depending on package.'
              },
              {
                icon: Award,
                title: 'Quality Guaranteed',
                description: 'Professional code, modern design, and thorough testing included.'
              },
              {
                icon: Users,
                title: '24/7 Support',
                description: 'Ongoing support and maintenance to keep your site running smoothly.'
              }
            ].map((feature, index) => (
              <ScrollReveal
                key={feature.title}
                direction="up"
                delay={index * 0.1}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Ready to <span className="gradient-text">Get Started</span>?
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose a package or get a custom quote for your project. No obligations, fast response.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setIsQuoteModalOpen(true)} className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8">
                <Zap className="mr-2 h-5 w-5" />
                Get Free Quote
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 px-8">
                <Link href="/contact">
                  <Users className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Quote Type Modal */}
      <QuoteTypeModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
    </main>
  )
}
