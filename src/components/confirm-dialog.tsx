'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const handleConfirm = async () => {
    console.log('ConfirmDialog handleConfirm called')
    // Close first to avoid overlay overlap, then execute the action
    onClose()
    try {
      await onConfirm()
    } catch (e) {
      // Swallow to avoid re-opening modal; upstream can show error notification
      console.error('ConfirmDialog onConfirm error:', e)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card border border-neon-purple/30 shadow-2xl">
            <CardHeader className="relative pb-4 bg-gradient-to-br from-neon-purple/20 via-cyber-mint/10 to-cosmic-blue/20 text-silver-glow border-b border-neon-purple/20">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-silver-glow/80 hover:text-cyber-mint transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  variant === 'destructive' 
                    ? 'bg-red-500/10 text-red-300 border border-red-400/30' 
                    : 'bg-blue-500/10 text-blue-300 border border-blue-400/30'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-silver-glow text-lg">
                    {title}
                  </CardTitle>
                </div>
              </div>
              
              <CardDescription className="text-silver-glow/80 mt-3 ml-13">
                {description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1 border-neon-purple/30 text-silver-glow hover:bg-white/5"
                >
                  {cancelText}
                </Button>
                
                <Button 
                  variant={variant === 'destructive' ? 'destructive' : 'default'}
                  onClick={handleConfirm}
                  className={`flex-1 ${variant === 'destructive' ? '' : 'bg-gradient-to-r from-neon-purple to-cyber-mint hover:from-neon-purple/80 hover:to-cyber-mint/80 text-white'}`}
                >
                  {confirmText}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
