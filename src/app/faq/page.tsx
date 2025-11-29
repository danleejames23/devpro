'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, HelpCircle, CreditCard, Clock, Code, Zap, Users, Shield } from 'lucide-react'
import Link from 'next/link'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const faqCategories = [
    {
      title: 'General Questions',
      icon: HelpCircle,
      items: [
        {
          id: 'what-services',
          question: 'What services do you offer?',
          answer: 'We offer comprehensive web development services including custom websites, e-commerce platforms, mobile apps, AI chatbots, backend development, UI/UX design, and ongoing maintenance. Each service comes with transparent pricing and guaranteed delivery times.'
        },
        {
          id: 'how-long-projects',
          question: 'How long do projects typically take?',
          answer: 'Project timelines vary based on complexity: Landing pages (1-2 weeks), Basic websites (2-4 weeks), Custom web applications (4-8 weeks), E-commerce sites (3-6 weeks). We provide detailed timelines in every quote and keep you updated throughout the process.'
        },
        {
          id: 'work-process',
          question: 'What is your work process?',
          answer: 'Our process includes: 1) Initial consultation and requirements gathering, 2) Detailed quote and project agreement, 3) 20% deposit payment, 4) Design and development phases, 5) Regular updates and feedback cycles, 6) Testing and quality assurance, 7) Final delivery and remaining payment.'
        },
        {
          id: 'communication',
          question: 'How do you communicate during projects?',
          answer: 'We provide a dedicated client portal where you can track progress, view files, and communicate with our team. We also use email, video calls, and instant messaging as needed. You\'ll receive regular updates and can reach us during business hours.'
        }
      ]
    },
    {
      title: 'Pricing & Payments',
      icon: CreditCard,
      items: [
        {
          id: 'pricing-structure',
          question: 'How is your pricing structured?',
          answer: 'We offer transparent, fixed-price packages for most services. Pricing depends on project complexity, features required, and timeline. All quotes include detailed breakdowns with no hidden fees. Custom projects are quoted individually based on specific requirements.'
        },
        {
          id: 'deposit-required',
          question: 'Do you require a deposit?',
          answer: 'Yes, we require a 20% deposit before starting any project. This secures your project slot and covers initial development costs. The remaining 80% is due upon project completion and delivery. Deposits are non-refundable once work has commenced.'
        },
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system. We can also arrange payment plans for larger projects.'
        },
        {
          id: 'refund-policy',
          question: 'What is your refund policy?',
          answer: 'Deposits are non-refundable once work has started. For completed work, refunds are evaluated case-by-case. We guarantee our work meets agreed specifications and provide 30 days of complimentary bug fixes. If you\'re not satisfied, we\'ll work to resolve any issues.'
        }
      ]
    },
    {
      title: 'Technical Questions',
      icon: Code,
      items: [
        {
          id: 'technologies-used',
          question: 'What technologies do you use?',
          answer: 'We use modern, industry-standard technologies including React, Next.js, Node.js, TypeScript, Python, PostgreSQL, MongoDB, AWS, and more. We choose the best technology stack for each project based on requirements, scalability needs, and long-term maintenance.'
        },
        {
          id: 'mobile-responsive',
          question: 'Are your websites mobile-responsive?',
          answer: 'Absolutely! All our websites are fully responsive and optimized for mobile devices, tablets, and desktops. We follow mobile-first design principles and test across multiple devices and browsers to ensure perfect functionality everywhere.'
        },
        {
          id: 'seo-included',
          question: 'Is SEO included in your websites?',
          answer: 'Yes, we include basic SEO optimization in all websites: proper meta tags, structured data, fast loading times, mobile optimization, and clean URLs. For advanced SEO services like content strategy and ongoing optimization, we offer separate SEO packages.'
        },
        {
          id: 'hosting-maintenance',
          question: 'Do you provide hosting and maintenance?',
          answer: 'We can recommend reliable hosting providers and help with setup. For maintenance, we offer ongoing support packages that include updates, backups, security monitoring, and technical support. We also provide 30 days of complimentary bug fixes after project completion.'
        }
      ]
    },
    {
      title: 'Project Management',
      icon: Clock,
      items: [
        {
          id: 'project-updates',
          question: 'How often will I receive project updates?',
          answer: 'You\'ll receive weekly progress updates via email and can check real-time progress in your client portal. For larger projects, we schedule bi-weekly video calls. You can also contact us anytime for specific questions or concerns.'
        },
        {
          id: 'revisions-included',
          question: 'How many revisions are included?',
          answer: 'Each project includes a specified number of revision rounds (typically 2-3 major revisions). Minor tweaks and bug fixes are unlimited during the development phase. Additional major revisions beyond the agreed scope may incur extra charges.'
        },
        {
          id: 'project-delays',
          question: 'What happens if my project is delayed?',
          answer: 'We commit to agreed timelines and communicate proactively about any potential delays. Common causes include client feedback delays, scope changes, or third-party dependencies. We\'ll always notify you immediately and provide updated timelines.'
        },
        {
          id: 'content-provision',
          question: 'Do I need to provide content and images?',
          answer: 'Yes, clients typically provide their own content, images, and branding materials. We can help with content structure and provide guidance on image requirements. We also offer content creation and professional photography services as add-ons.'
        }
      ]
    },
    {
      title: 'Support & Maintenance',
      icon: Shield,
      items: [
        {
          id: 'post-launch-support',
          question: 'What support do you provide after launch?',
          answer: 'We provide 30 days of complimentary bug fixes and minor adjustments after launch. For ongoing support, we offer maintenance packages that include updates, backups, security monitoring, and technical support with various service levels.'
        },
        {
          id: 'website-updates',
          question: 'Can I update my website myself?',
          answer: 'Yes! We build user-friendly content management systems that allow you to update text, images, and basic content. We provide training and documentation. For complex updates or new features, we offer ongoing development services.'
        },
        {
          id: 'emergency-support',
          question: 'Do you offer emergency support?',
          answer: 'Yes, we provide emergency support for critical issues affecting live websites. Emergency support is available outside business hours for urgent problems. Contact our emergency hotline for immediate assistance with critical issues.'
        },
        {
          id: 'backup-security',
          question: 'How do you handle backups and security?',
          answer: 'We implement security best practices including SSL certificates, secure coding practices, and regular updates. For hosted sites, we can set up automated backups and security monitoring. We also offer security audits and ongoing security maintenance.'
        }
      ]
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
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our services, pricing, and process.
          </p>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <div className="mb-6">
                  <h2 className="flex items-center gap-3 text-2xl font-semibold text-foreground">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    {category.title}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: categoryIndex * 0.1 + itemIndex * 0.05 }}
                    >
                      <Card className="border-primary/20 hover:border-primary/30 transition-colors">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full p-6 text-left flex items-center justify-between hover:bg-primary/5 transition-colors"
                          >
                            <h3 className="text-lg font-medium text-foreground pr-4">
                              {item.question}
                            </h3>
                            <ChevronDown 
                              className={`w-5 h-5 text-primary transition-transform ${
                                openItems.includes(item.id) ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          
                          <AnimatePresence>
                            {openItems.includes(item.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Still Have Questions?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help. 
                Get in touch and we'll answer any questions you have about our services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/support">
                    <Zap className="w-4 h-4 mr-2" />
                    Get Support
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">
                    <Users className="w-4 h-4 mr-2" />
                    Contact Us
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/quote">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Get a Quote
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
