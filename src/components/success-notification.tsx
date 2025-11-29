'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SuccessNotificationProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
}

export default function SuccessNotification({ 
  isOpen, 
  onClose, 
  title, 
  message 
}: SuccessNotificationProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed top-4 right-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="glass-card rounded-xl shadow-2xl w-[360px] p-6 border border-neon-purple/30"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-full p-2 mr-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-silver-glow">
                  {title}
                </h3>
                {message && (
                  <p className="text-sm text-silver-glow/80 mt-1">
                    {message}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-silver-glow/80 hover:text-cyber-mint -mt-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-neon-purple to-cyber-mint hover:from-neon-purple/80 hover:to-cyber-mint/80 text-white"
            >
              OK
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
