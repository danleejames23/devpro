'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, X, MessageCircle, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: "What's your typical project timeline?",
    answer: "Most projects are completed within 7-30 days depending on complexity. I provide exact timelines with each quote."
  },
  {
    question: "Do you offer ongoing support?",
    answer: "Yes! All projects include 30 days of free support, with optional maintenance packages available."
  },
  {
    question: "What technologies do you use?",
    answer: "I specialize in React, Next.js, Node.js, Python, and AI integration. Full tech stack available on request."
  },
  {
    question: "How does pricing work?",
    answer: "Fixed pricing based on project scope. No hidden fees, no surprises. Get a free quote to see exact costs."
  },
  {
    question: "Can you integrate AI into my project?",
    answer: "Absolutely! I specialize in AI integration including chatbots, automation, and intelligent features."
  }
]

export default function AIAssistantBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null)

  return (
    <>
      {/* AI Assistant Bubble */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5, type: 'spring' }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-transparent border border-border shadow-lg hover:bg-muted/20 hover:shadow-xl transition-all duration-300"
        >
          <Bot className="w-6 h-6 text-foreground" />
        </Button>
      </motion.div>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="glass-card border border-neon-purple/30 shadow-2xl">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-cyber-mint flex items-center justify-center animate-pulse-glow">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-silver-glow font-accent">Assistant</h3>
                        <p className="text-sm text-silver-glow/60">Quick answers to common questions</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-silver-glow/60 hover:text-silver-glow"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* FAQ List */}
                  <div className="space-y-3 mb-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="space-y-2">
                        <button
                          onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                          className="w-full text-left p-3 rounded-lg glass-card border border-neon-purple/20 hover:border-cyber-mint/40 transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-silver-glow group-hover:text-cyber-mint">
                              {faq.question}
                            </span>
                            <ArrowRight className={`w-4 h-4 text-silver-glow/60 transition-transform duration-300 ${
                              selectedFaq === index ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {selectedFaq === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 bg-cyber-mint/5 rounded-lg border border-cyber-mint/20">
                                <p className="text-sm text-silver-glow/80 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full btn-gradient group" asChild>
                      <Link href="/quote">
                        <Zap className="w-4 h-4 mr-2" />
                        Get Free Quote
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full border-neon-purple/30 text-silver-glow hover:border-cyber-mint/50 hover:text-cyber-mint" asChild>
                      <Link href="/contact">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Directly
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
