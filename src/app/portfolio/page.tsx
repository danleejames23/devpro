'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { projects } from '@/data/projects'
import { ExternalLink, Github, Star, Zap, Filter, Eye, Code, Smartphone, Bot, Globe, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/scroll-reveal'

const portfolioCategories = [
  { id: 'all', name: 'All Projects', icon: <Star className="w-4 h-4" /> },
  { id: 'ecommerce', name: 'E-Commerce', icon: <Globe className="w-4 h-4" /> },
  { id: 'fullstack', name: 'Full-Stack', icon: <Code className="w-4 h-4" /> },
  { id: 'ai', name: 'AI Solutions', icon: <Bot className="w-4 h-4" /> },
  { id: 'mobile', name: 'Mobile Apps', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'frontend', name: 'Frontend', icon: <Eye className="w-4 h-4" /> }
]

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeCategory)

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-br from-deep-space via-space-gray to-deep-space">
      {/* Futuristic Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Cosmic Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-neon-purple/20 to-cyber-mint/10 rounded-full blur-3xl animate-cosmic-drift"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-cosmic-blue/15 to-plasma-pink/10 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '10s'}}></div>
        </div>

        {/* Particle Field */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyber-mint rounded-full animate-particle-float opacity-30"
              style={{
                left: `${((i * 41) % 100)}%`,
                top: `${((i * 29 + 13) % 100)}%`,
                animationDelay: `${(i * 0.4) % 6}s`,
                animationDuration: `${4 + ((i * 0.3) % 4)}s`
              }}
            />
          ))}
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
                🚀 Portfolio Showcase
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-accent font-bold leading-tight">
              <span className="block text-silver-glow">Cutting-Edge</span>
              <span className="block bg-gradient-to-r from-neon-purple via-cyber-mint to-cosmic-blue bg-clip-text text-transparent animate-gradient">
                Digital Solutions
              </span>
              <span className="block text-silver-glow">Built for Tomorrow</span>
            </h1>

            <p className="text-xl md:text-2xl text-silver-glow/80 leading-relaxed max-w-4xl mx-auto font-light">
              Explore a collection of revolutionary projects that push the boundaries of technology.
              <br />
              <span className="text-cyber-mint font-medium">From AI-powered applications to futuristic web experiences.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Portfolio Filter */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            {portfolioCategories.map((category) => (
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

          {/* Masonry Portfolio Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onHoverStart={() => setHoveredProject(project.id)}
                  onHoverEnd={() => setHoveredProject(null)}
                  className="break-inside-avoid mb-8 group"
                >
                  <Card className="glass-card border border-neon-purple/20 hover:border-cyber-mint/50 transition-all duration-500 relative overflow-hidden card-hover">
                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-gradient-to-r from-neon-purple to-cyber-mint text-white border-0 animate-pulse-glow">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}

                    {/* Project Image */}
                    <div className="relative overflow-hidden rounded-t-lg">
                      <div className="aspect-video bg-gradient-to-br from-neon-purple/20 via-cyber-mint/20 to-cosmic-blue/20 flex items-center justify-center">
                        <div className="text-6xl opacity-30">
                          {project.category === 'ai' && <Bot />}
                          {project.category === 'ecommerce' && <Globe />}
                          {project.category === 'fullstack' && <Code />}
                          {project.category === 'mobile' && <Smartphone />}
                          {project.category === 'frontend' && <Eye />}
                        </div>
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-space/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="flex gap-3">
                          {project.liveUrl && (
                            <Button size="sm" className="btn-gradient" asChild>
                              <Link href={project.liveUrl} target="_blank">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Live Demo
                              </Link>
                            </Button>
                          )}
                          {project.githubUrl && (
                            <Button size="sm" className="btn-neon" asChild>
                              <Link href={project.githubUrl} target="_blank">
                                <Github className="w-4 h-4 mr-2" />
                                Code
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl text-silver-glow font-accent group-hover:text-cyber-mint transition-colors">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="text-silver-glow/70 leading-relaxed">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Tech Stack */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-silver-glow flex items-center font-accent text-sm">
                          <Zap className="w-4 h-4 mr-2 text-cyber-mint" />
                          Tech Stack:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="border-neon-purple/30 text-silver-glow/80 hover:border-cyber-mint/50 hover:text-cyber-mint transition-colors text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Project Links */}
                      <div className="flex gap-3 pt-2">
                        {project.liveUrl && (
                          <Button size="sm" className="flex-1 btn-gradient group" asChild>
                            <Link href={project.liveUrl} target="_blank">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Live
                              <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button size="sm" variant="outline" className="border-neon-purple/30 text-silver-glow hover:border-cyber-mint/50 hover:text-cyber-mint" asChild>
                            <Link href={project.githubUrl} target="_blank">
                              <Github className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-neon-purple/20 to-cyber-mint/10 rounded-full blur-3xl animate-cosmic-drift"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-silver-glow font-accent leading-tight">
              Ready to Create Your
              <span className="block bg-gradient-to-r from-neon-purple via-cyber-mint to-cosmic-blue bg-clip-text text-transparent animate-gradient">
                Next Breakthrough?
              </span>
            </h2>
            <p className="text-xl text-silver-glow/80 max-w-2xl mx-auto">
              Let's build something extraordinary together. Your vision, powered by cutting-edge technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="btn-gradient px-8 py-4 text-lg font-semibold group" asChild>
                <Link href="/quote">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" className="btn-neon px-8 py-4 text-lg font-semibold" asChild>
                <Link href="/contact">
                  <Bot className="mr-2 h-5 w-5" />
                  Discuss Ideas
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
