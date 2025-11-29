'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Package, Zap, Briefcase, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface QuoteTypeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuoteTypeModal({ isOpen, onClose }: QuoteTypeModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-deep-space/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        {/* Cosmic Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-neon-purple/20 to-cyber-mint/10 rounded-full blur-3xl animate-cosmic-drift"></div>
          <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-br from-cosmic-blue/15 to-plasma-pink/10 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '5s'}}></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10"
        >
          <Card className="glass-card border border-neon-purple/30 shadow-2xl">
            <CardHeader className="bg-gradient-to-br from-neon-purple/20 via-cyber-mint/10 to-cosmic-blue/20 text-silver-glow text-center relative border-b border-neon-purple/20">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-silver-glow/80 hover:text-cyber-mint transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-br from-neon-purple to-cyber-mint rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-accent bg-gradient-to-r from-neon-purple via-cyber-mint to-cosmic-blue bg-clip-text text-transparent">
                Choose Your Quote Type
              </CardTitle>
              <CardDescription className="text-silver-glow/80 text-lg">
                Select the best option for your project needs
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Pre-selected Packages Option */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="h-full glass-card border border-neon-purple/20 hover:border-cyber-mint/50 transition-all duration-500 group relative overflow-hidden">
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-cyber-mint/5 to-cosmic-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="text-center pb-4 relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-cyber-mint rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-silver-glow">Pre-selected Services</CardTitle>
                      <CardDescription className="text-silver-glow/70">
                        Choose from our curated AI-powered solutions
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-silver-glow/80">
                          <Star className="w-4 h-4 text-cyber-mint mr-2" />
                          <span>Fixed pricing, no surprises</span>
                        </div>
                        <div className="flex items-center text-sm text-silver-glow/80">
                          <Star className="w-4 h-4 text-cyber-mint mr-2" />
                          <span>24hr response time</span>
                        </div>
                        <div className="flex items-center text-sm text-silver-glow/80">
                          <Star className="w-4 h-4 text-cyber-mint mr-2" />
                          <span>AI-enhanced development</span>
                        </div>
                        <div className="flex items-center text-sm text-silver-glow/80">
                          <Star className="w-4 h-4 text-cyber-mint mr-2" />
                          <span>Intelligent automation</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-neon-purple/20">
                        <p className="text-sm text-silver-glow/60 mb-4">
                          Perfect for businesses seeking cutting-edge web solutions with AI integration and predictable timelines.
                        </p>
                        <Button 
                          className="w-full bg-gradient-to-r from-neon-purple to-cyber-mint hover:from-neon-purple/80 hover:to-cyber-mint/80 text-white font-semibold transition-all duration-300" 
                          asChild
                        >
                          <Link href="/services" onClick={onClose}>
                            Browse Services
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Custom Quote Option */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="h-full glass-card border border-cosmic-blue/20 hover:border-plasma-pink/50 transition-all duration-500 group relative overflow-hidden">
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cosmic-blue/5 via-plasma-pink/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="text-center pb-4 relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-cosmic-blue to-plasma-pink rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-silver-glow">Custom AI Solution</CardTitle>
                      <CardDescription className="text-silver-glow/70">
                        Tailored intelligent solution for your unique needs
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-silver-glow/80">
                          <Briefcase className="w-4 h-4 text-plasma-pink mr-2" />
                          <span>AI-powered custom development</span>
                        </div>
                        <div className="flex items-center text-sm text-silver-glow/80">
                          <Briefcase className="w-4 h-4 text-plasma-pink mr-2" />
                          <span>Complex intelligent systems</span>
                        </div>
                        <div className="flex items-center text-sm text-silver-glow/80">
                          <Briefcase className="w-4 h-4 text-plasma-pink mr-2" />
                          <span>Advanced AI integrations</span>
                        </div>
                        <div className="flex items-center text-sm text-silver-glow/80">
                          <Briefcase className="w-4 h-4 text-plasma-pink mr-2" />
                          <span>Personalized AI consultation</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-cosmic-blue/20">
                        <p className="text-sm text-silver-glow/60 mb-4">
                          Ideal for enterprises requiring sophisticated AI solutions, machine learning integration, or cutting-edge automation.
                        </p>
                        <Button 
                          className="w-full bg-gradient-to-r from-cosmic-blue to-plasma-pink hover:from-cosmic-blue/80 hover:to-plasma-pink/80 text-white font-semibold transition-all duration-300" 
                          asChild
                        >
                          <Link href="/quote" onClick={onClose}>
                            Request AI Quote
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-silver-glow/60">
                  Not sure? <Link href="/contact" onClick={onClose} className="text-cyber-mint hover:text-neon-purple transition-colors">Contact our team</Link> for a free AI consultation.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
