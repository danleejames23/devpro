'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, FileText, CreditCard, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: CheckCircle,
      content: `By accessing and using Lumora's services, you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service govern your use of our website and services.`
    },
    {
      id: 'services',
      title: '2. Services Provided',
      icon: FileText,
      content: `Lumora provides web development, AI integration, mobile development, and related technology services. All services are provided on a project basis with clearly defined deliverables, timelines, and pricing as outlined in individual project agreements.`
    },
    {
      id: 'payment',
      title: '3. Payment Terms',
      icon: CreditCard,
      content: `
        <strong>Deposit Requirement:</strong> A 20% deposit is required before work commences on any project. This deposit secures your project slot and covers initial development costs.
        
        <strong>Payment Schedule:</strong>
        • 20% deposit due upon project acceptance
        • Remaining 80% due upon project completion and delivery
        • All payments are processed securely through our payment system
        
        <strong>Late Payments:</strong> Invoices not paid within 30 days of the due date may incur a 1.5% monthly service charge. Projects may be suspended for overdue accounts.
        
        <strong>Refund Policy:</strong> Deposits are non-refundable once work has commenced. Refunds for completed work are evaluated on a case-by-case basis.`
    },
    {
      id: 'project-timeline',
      title: '4. Project Timeline & Delivery',
      icon: Clock,
      content: `
        Project timelines are estimates based on project scope and complexity. Actual delivery may vary due to:
        • Client feedback and revision cycles
        • Scope changes or additional requirements
        • Third-party dependencies or integrations
        • Force majeure events
        
        We commit to transparent communication throughout the project lifecycle and will notify clients of any potential delays promptly.`
    },
    {
      id: 'intellectual-property',
      title: '5. Intellectual Property',
      icon: Shield,
      content: `
        <strong>Client Ownership:</strong> Upon full payment, clients own all custom code, designs, and content created specifically for their project.
        
        <strong>Third-Party Components:</strong> Some projects may include third-party libraries, frameworks, or tools subject to their respective licenses.
        
        <strong>Lumora Portfolio Rights:</strong> We reserve the right to showcase completed projects in our portfolio and marketing materials unless otherwise agreed in writing.`
    },
    {
      id: 'revisions',
      title: '6. Revisions & Changes',
      icon: FileText,
      content: `
        Each project includes a specified number of revision rounds as outlined in the project agreement. Additional revisions beyond the agreed scope may incur additional charges.
        
        <strong>Scope Changes:</strong> Significant changes to project scope will require a new agreement and may affect timeline and pricing.
        
        <strong>Client Responsibilities:</strong> Timely feedback and content provision are essential for project success. Delays in client responses may affect project timelines.`
    },
    {
      id: 'warranties',
      title: '7. Warranties & Support',
      icon: Shield,
      content: `
        <strong>Quality Assurance:</strong> All deliverables are thoroughly tested before delivery. We guarantee our work meets the agreed specifications.
        
        <strong>Bug Fixes:</strong> We provide 30 days of complimentary bug fixes for issues directly related to our development work.
        
        <strong>Ongoing Support:</strong> Extended support and maintenance services are available under separate agreements.`
    },
    {
      id: 'limitation',
      title: '8. Limitation of Liability',
      icon: AlertTriangle,
      content: `
        Lumora's liability is limited to the total amount paid for the specific project. We are not liable for:
        • Indirect, incidental, or consequential damages
        • Loss of profits, data, or business opportunities
        • Third-party service outages or failures
        • Client's failure to backup data or maintain systems`
    },
    {
      id: 'termination',
      title: '9. Termination',
      icon: AlertTriangle,
      content: `
        Either party may terminate a project agreement with written notice. In case of termination:
        • Client pays for work completed to date
        • Lumora delivers all completed work
        • Deposits are non-refundable
        • Both parties return confidential information`
    },
    {
      id: 'governing-law',
      title: '10. Governing Law',
      icon: Shield,
      content: `These terms are governed by the laws of the United Kingdom. Any disputes will be resolved through binding arbitration or in the courts of England and Wales.`
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
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using our services. 
            Last updated: {new Date().toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* Terms Sections */}
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
                Questions About These Terms?
              </h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms of Service, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                </a>
                <a 
                  href="/quote" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Get a Quote
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
