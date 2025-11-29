'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageCircle, Calendar } from 'lucide-react'

const CallToAction = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/90 to-background/95"></div>
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-32 h-32 gradient-accent rounded-full blur-2xl opacity-20 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 gradient-secondary rounded-full blur-3xl opacity-15 animate-float" style={{animationDelay: '1s'}}></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center text-primary-foreground space-y-8"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Ready to Start Your Project?
              </h2>
              <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
                Let's discuss your ideas and turn them into reality. 
                Get a free consultation and project estimate.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="secondary" 
              >
                <Link href="/quote">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Get Project Quote
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300" 
                asChild
              >
                <Link href="/contact">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Schedule Call
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-primary-foreground/20">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">48h</div>
                <div className="opacity-90">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">100+</div>
                <div className="opacity-90">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">5.0★</div>
                <div className="opacity-90">Client Rating</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CallToAction
