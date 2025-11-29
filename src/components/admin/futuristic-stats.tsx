'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, DollarSign, Users, Clock, Zap, Target, Award, Activity,
  ArrowUp, ArrowDown, Minus, Bot, Shield, Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StatsProps {
  stats: {
    totalQuotes: number
    pendingQuotes: number
    activeProjects: number
    completedProjects: number
    totalRevenue: number
    monthlyRevenue: number
    totalCustomers: number
    activeCustomers: number
    unreadMessages: number
    urgentQuotes: number
    totalFiles: number
    sharedFiles: number
    avgProjectProgress: number
    totalPaidRevenue: number
    owedRevenue: number
  }
}

export default function FuturisticStats({ stats }: StatsProps) {
  const statCards = [
    {
      title: 'Total Paid Revenue',
      value: `£${stats.totalPaidRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      gradient: 'from-neon-purple to-cosmic-blue',
      description: 'Received payments'
    },
    {
      title: 'Owed Revenue',
      value: `£${stats.owedRevenue.toLocaleString()}`,
      change: stats.owedRevenue > 0 ? 'Pending' : 'Clear',
      trend: stats.owedRevenue > 0 ? 'down' : 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-cosmic-blue to-cyber-mint',
      description: 'From unpaid invoices'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects.toString(),
      change: '+3',
      trend: 'up',
      icon: <Activity className="w-6 h-6" />,
      gradient: 'from-cyber-mint to-plasma-pink',
      description: 'In progress'
    },
    {
      title: 'Client Network',
      value: stats.totalCustomers.toString(),
      change: '+15%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      gradient: 'from-plasma-pink to-neon-purple',
      description: 'Total clients'
    },
    {
      title: 'Pending Quotes',
      value: stats.pendingQuotes.toString(),
      change: stats.urgentQuotes > 0 ? `${stats.urgentQuotes} urgent` : 'Normal',
      trend: stats.urgentQuotes > 0 ? 'urgent' : 'neutral',
      icon: <Clock className="w-6 h-6" />,
      gradient: 'from-neon-purple to-cosmic-blue',
      description: 'Awaiting review'
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      change: '+0.5%',
      trend: 'up',
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-cosmic-blue to-cyber-mint',
      description: 'Project completion'
    },
    {
      title: 'AI Efficiency',
      value: '94%',
      change: '+2.1%',
      trend: 'up',
      icon: <Bot className="w-6 h-6" />,
      gradient: 'from-cyber-mint to-plasma-pink',
      description: 'Automation rate'
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: 'Stable',
      trend: 'neutral',
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-plasma-pink to-neon-purple',
      description: 'Infrastructure'
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-cyber-mint" />
      case 'down':
        return <ArrowDown className="w-4 h-4 text-plasma-pink" />
      case 'urgent':
        return <Zap className="w-4 h-4 text-plasma-pink animate-pulse" />
      default:
        return <Minus className="w-4 h-4 text-silver-glow/60" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-cyber-mint'
      case 'down':
        return 'text-plasma-pink'
      case 'urgent':
        return 'text-plasma-pink animate-pulse'
      default:
        return 'text-silver-glow/60'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-silver-glow font-accent">Dashboard</h1>
          <p className="text-silver-glow/70 mt-2">Comprehensive overview of current business performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-gradient-to-r from-cyber-mint to-cosmic-blue text-white border-0 animate-pulse-glow">
            <Globe className="w-3 h-3 mr-1" />
            All Systems Online
          </Badge>
          <div className="text-right">
            <div className="text-sm text-silver-glow/60">Last Updated</div>
            <div className="text-cyber-mint font-semibold">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="glass-card border border-neon-purple/20 hover:border-cyber-mint/40 transition-all duration-300 group relative overflow-hidden">
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white animate-pulse-glow`}>
                    {stat.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stat.trend)}
                    <span className={`text-sm font-semibold ${getTrendColor(stat.trend)}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-silver-glow font-accent group-hover:text-cyber-mint transition-colors">
                    {stat.value}
                  </h3>
                  <div>
                    <p className="text-sm font-medium text-silver-glow/80">{stat.title}</p>
                    <p className="text-xs text-silver-glow/60">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="glass-card border border-cyber-mint/20 hover:border-cyber-mint/40 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyber-mint to-cosmic-blue flex items-center justify-center text-white animate-pulse-glow">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-silver-glow font-accent">Assistant</h3>
                <p className="text-sm text-silver-glow/60">Ready to help</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-plasma-pink/20 hover:border-plasma-pink/40 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-plasma-pink to-neon-purple flex items-center justify-center text-white animate-pulse-glow">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-silver-glow font-accent">Performance</h3>
                <p className="text-sm text-silver-glow/60">Exceeding targets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-cosmic-blue/20 hover:border-cosmic-blue/40 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cosmic-blue to-neon-purple flex items-center justify-center text-white animate-pulse-glow">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-silver-glow font-accent">Global Reach</h3>
                <p className="text-sm text-silver-glow/60">Worldwide clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
