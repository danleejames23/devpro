'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Zap, Clock, Shield, Target, Globe, Paintbrush, Code, Server, Bot, Smartphone, Palette, Brain } from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  title: string
  description: string
  startingPrice: number
  category: string
  features: string[]
  timeline: string
  icon: string
}

interface OptimizedServiceCardProps {
  service: Service
  index: number
  hoveredService: string | null
  onHover: (id: string | null) => void
}

const IconComponent = memo(({ icon }: { icon: string }) => {
  const iconProps = { className: "w-8 h-8" }
  
  switch (icon) {
    case 'Target': return <Target {...iconProps} />
    case 'Globe': return <Globe {...iconProps} />
    case 'Paintbrush': return <Paintbrush {...iconProps} />
    case 'Code': return <Code {...iconProps} />
    case 'Server': return <Server {...iconProps} />
    case 'Bot': return <Bot {...iconProps} />
    case 'Smartphone': return <Smartphone {...iconProps} />
    case 'Palette': return <Palette {...iconProps} />
    case 'Zap': return <Zap {...iconProps} />
    case 'Brain': return <Brain {...iconProps} />
    default: return <Code {...iconProps} />
  }
})

IconComponent.displayName = 'IconComponent'

const OptimizedServiceCard = memo(({ 
  service, 
  index, 
  hoveredService, 
  onHover 
}: OptimizedServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      onHoverStart={() => onHover(service.id)}
      onHoverEnd={() => onHover(null)}
      className="group"
    >
      <Card className="glass-card h-full border border-neon-purple/20 hover:border-cyber-mint/50 transition-all duration-500 relative overflow-hidden card-hover">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-cyber-mint/5 to-cosmic-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-cyber-mint rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg animate-pulse-glow">
              <IconComponent icon={service.icon} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyber-mint animate-hologram">
                £{service.startingPrice.toLocaleString()}
              </div>
              <span className="text-silver-glow/60 ml-2">starting from</span>
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
              <Clock className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>
    </motion.div>
  )
})

OptimizedServiceCard.displayName = 'OptimizedServiceCard'

export default OptimizedServiceCard
