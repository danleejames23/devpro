'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code, Palette, Server, Smartphone, Bot, Zap } from 'lucide-react'
import { useState } from 'react'
import QuoteTypeModal from '@/components/quote-type-modal'

const Hero = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const skills = [
    { icon: Code, label: 'Frontend' },
    { icon: Server, label: 'Backend' },
    { icon: Smartphone, label: 'Mobile' },
    { icon: Bot, label: 'AI Integration' },
    { icon: Palette, label: 'Design' },
    { icon: Zap, label: 'Performance' },
  ]

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Background with Gradients */}
      <div className="absolute inset-0 gradient-primary opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/80 to-background"></div>
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 gradient-secondary rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 gradient-accent rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 gradient-primary rounded-full blur-2xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                <Zap className="w-4 h-4 mr-2" />
                Available for new projects
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="text-foreground">Building Digital</span>
                  <br />
                  <span className="gradient-text animate-gradient">Experiences</span>
                </h1>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-muted-foreground leading-relaxed"
              >
                Building modern, scalable solutions that drive business growth. 
                From concept to deployment, I create digital experiences that matter.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="btn-gradient animate-pulse-glow" onClick={() => setIsQuoteModalOpen(true)}>
                  Get Project Quote
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300" asChild>
                  <Link href="/portfolio">View My Work</Link>
                </Button>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-4"
            >
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Expertise
              </p>
              <div className="flex flex-wrap gap-4">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-2 bg-secondary/50 px-4 py-2 rounded-full"
                  >
                    <skill.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{skill.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center"
              >
                <Code className="w-8 h-8 text-primary" />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute top-20 right-16 w-16 h-16 bg-secondary rounded-xl flex items-center justify-center"
              >
                <Palette className="w-6 h-6 text-primary" />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute bottom-20 left-16 w-18 h-18 bg-accent rounded-2xl flex items-center justify-center"
              >
                <Server className="w-7 h-7 text-primary" />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, -3, 0]
                }}
                transition={{ 
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute bottom-10 right-10 w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"
              >
                <Bot className="w-6 h-6 text-primary" />
              </motion.div>

              {/* Central Element */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, 0]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-border/50">
                  <div className="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center">
                    <Zap className="w-16 h-16 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Quote Type Modal */}
      <QuoteTypeModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
    </section>
  )
}

export default Hero
