'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Database, Cookie, Mail, Lock, Users, Globe } from 'lucide-react'

export default function PrivacyPage() {
  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: Shield,
      content: `Lumora is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website and services. We comply with applicable data protection laws including GDPR.`
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      icon: Database,
      content: `
        <strong>Personal Information:</strong>
        • Name, email address, phone number
        • Company name and job title
        • Billing and payment information
        • Project requirements and communications
        
        <strong>Technical Information:</strong>
        • IP address and browser information
        • Website usage analytics
        • Cookies and similar technologies
        • Device and connection information`
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      icon: Eye,
      content: `
        We use your information to:
        • Provide and deliver our services
        • Process payments and manage billing
        • Communicate about projects and updates
        • Improve our website and services
        • Send marketing communications (with consent)
        • Comply with legal obligations
        • Protect against fraud and security threats`
    },
    {
      id: 'cookies',
      title: '4. Cookies and Tracking',
      icon: Cookie,
      content: `
        We use cookies and similar technologies to:
        • Remember your preferences and settings
        • Analyze website traffic and usage
        • Provide personalized content
        • Enable essential website functionality
        
        You can control cookies through your browser settings. Some features may not work properly if cookies are disabled.`
    },
    {
      id: 'data-sharing',
      title: '5. Data Sharing and Disclosure',
      icon: Users,
      content: `
        We do not sell your personal data. We may share information with:
        • Service providers (payment processors, hosting providers)
        • Legal authorities when required by law
        • Business partners with your consent
        • Professional advisors (lawyers, accountants)
        
        All third parties are contractually bound to protect your data.`
    },
    {
      id: 'data-security',
      title: '6. Data Security',
      icon: Lock,
      content: `
        We implement appropriate security measures including:
        • Encryption of sensitive data in transit and at rest
        • Regular security assessments and updates
        • Access controls and authentication
        • Secure payment processing
        • Regular backups and disaster recovery
        
        While we strive to protect your data, no system is 100% secure.`
    },
    {
      id: 'data-retention',
      title: '7. Data Retention',
      icon: Database,
      content: `
        We retain your data for as long as necessary to:
        • Provide ongoing services
        • Comply with legal obligations
        • Resolve disputes and enforce agreements
        
        <strong>Retention Periods:</strong>
        • Active client data: Duration of relationship + 7 years
        • Marketing data: Until you unsubscribe
        • Website analytics: 26 months
        • Financial records: 7 years`
    },
    {
      id: 'your-rights',
      title: '8. Your Rights',
      icon: Shield,
      content: `
        Under GDPR and other data protection laws, you have the right to:
        • Access your personal data
        • Correct inaccurate information
        • Delete your data (right to be forgotten)
        • Restrict or object to processing
        • Data portability
        • Withdraw consent at any time
        
        Contact us to exercise these rights.`
    },
    {
      id: 'international-transfers',
      title: '9. International Data Transfers',
      icon: Globe,
      content: `
        Your data may be transferred to and processed in countries outside your jurisdiction. We ensure adequate protection through:
        • Adequacy decisions by relevant authorities
        • Standard contractual clauses
        • Certification schemes
        • Other appropriate safeguards`
    },
    {
      id: 'contact-dpo',
      title: '10. Contact & Data Protection Officer',
      icon: Mail,
      content: `
        For privacy-related questions or to exercise your rights, contact us at:
        
        <strong>Email:</strong> privacy@lumora.dev
        <strong>Address:</strong> Lumora, London, United Kingdom
        
        We will respond to your request within 30 days. You also have the right to lodge a complaint with your local data protection authority.`
    }
  ]

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            Last updated: {new Date().toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-primary/20 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: section.content.replace(/\n/g, '<br />') 
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Privacy Questions or Concerns?
              </h3>
              <p className="text-muted-foreground mb-6">
                We're committed to transparency. Contact us if you have any questions about how we handle your data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:privacy@lumora.dev" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Privacy Team
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  General Contact
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
