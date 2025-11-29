'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Headphones, Mail, MessageCircle, Clock, Phone, FileText, HelpCircle, Zap } from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  const supportOptions = [
    {
      title: 'Email Support',
      description: 'Get detailed help via email. We respond within 24 hours.',
      icon: Mail,
      action: 'Send Email',
      href: 'mailto:support@lumora.dev',
      responseTime: '24 hours',
      availability: '24/7'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time during business hours.',
      icon: MessageCircle,
      action: 'Start Chat',
      href: '/contact',
      responseTime: 'Instant',
      availability: 'Mon-Fri 9AM-6PM GMT'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our technical team for urgent issues.',
      icon: Phone,
      action: 'Call Now',
      href: 'tel:+44-20-1234-5678',
      responseTime: 'Immediate',
      availability: 'Mon-Fri 9AM-5PM GMT'
    },
    {
      title: 'Project Portal',
      description: 'Access your client dashboard for project updates and files.',
      icon: Zap,
      action: 'Client Login',
      href: '/client',
      responseTime: 'Self-service',
      availability: '24/7'
    }
  ]

  const supportCategories = [
    {
      title: 'Technical Issues',
      icon: Headphones,
      items: [
        'Website bugs or errors',
        'Performance issues',
        'Browser compatibility',
        'Mobile responsiveness',
        'API integration problems'
      ]
    },
    {
      title: 'Project Support',
      icon: FileText,
      items: [
        'Project timeline questions',
        'Scope clarifications',
        'Revision requests',
        'Content updates',
        'Feature modifications'
      ]
    },
    {
      title: 'Account & Billing',
      icon: Mail,
      items: [
        'Invoice questions',
        'Payment issues',
        'Account access',
        'Billing address changes',
        'Refund requests'
      ]
    },
    {
      title: 'General Inquiries',
      icon: HelpCircle,
      items: [
        'Service information',
        'Pricing questions',
        'Timeline estimates',
        'Technology recommendations',
        'Partnership opportunities'
      ]
    }
  ]

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get <span className="gradient-text">Support</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're here to help! Choose the support option that works best for you.
          </p>
        </motion.div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {supportOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-primary/20 hover:border-primary/40 transition-all duration-300 group">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Response:</span>
                        <span className="font-medium">{option.responseTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-medium">{option.availability}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={option.href}>
                        {option.action}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Support Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            What Can We Help You With?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Emergency Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Emergency Support
              </h3>
              <p className="text-orange-700 dark:text-orange-200 mb-6 max-w-2xl mx-auto">
                For critical issues affecting live websites or urgent project deadlines, 
                contact us immediately. We provide emergency support outside business hours for critical issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Link href="tel:+44-20-1234-5678">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Hotline
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-200 dark:border-orange-600 dark:hover:bg-orange-950/30">
                  <Link href="mailto:emergency@Lumora.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Emergency Email
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-semibold text-foreground mb-6">
            Additional Resources
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/faq">
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQ
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/terms">
                <FileText className="w-4 h-4 mr-2" />
                Terms of Service
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/privacy">
                <FileText className="w-4 h-4 mr-2" />
                Privacy Policy
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/quote">
                <Zap className="w-4 h-4 mr-2" />
                Get a Quote
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
