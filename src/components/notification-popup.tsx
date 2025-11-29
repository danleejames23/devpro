'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationPopupProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'info' | 'warning' | 'loading'
  title: string
  message: string
  duration?: number // Auto-close duration in milliseconds (0 = no auto-close)
  showCloseButton?: boolean
  actionButton?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
}

export default function NotificationPopup({
  isOpen,
  onClose,
  type,
  title,
  message,
  duration = 4000,
  showCloseButton = true,
  actionButton
}: NotificationPopupProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!isOpen || duration === 0) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      const progressPercent = (remaining / duration) * 100
      
      setProgress(progressPercent)
      
      if (remaining <= 0) {
        clearInterval(interval)
        onClose()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isOpen, duration, onClose])

  // Safety: auto-close loading overlay after 20s if duration is 0
  useEffect(() => {
    if (!isOpen) return
    if (type !== 'loading') return
    if (duration && duration > 0) return
    const t = setTimeout(() => {
      onClose()
    }, 20000)
    return () => clearTimeout(t)
  }, [isOpen, type, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-orange-600" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />
      case 'loading':
        return <Clock className="w-6 h-6 text-gray-600 animate-spin" />
      default:
        return <Info className="w-6 h-6 text-gray-600" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          progressBg: 'bg-green-500',
          titleColor: 'text-green-900',
          messageColor: 'text-green-700'
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          progressBg: 'bg-red-500',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700'
        }
      case 'warning':
        return {
          bg: 'bg-orange-50 border-orange-200',
          progressBg: 'bg-orange-500',
          titleColor: 'text-orange-900',
          messageColor: 'text-orange-700'
        }
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          progressBg: 'bg-blue-500',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700'
        }
      case 'loading':
        return {
          bg: 'bg-gray-50 border-gray-200',
          progressBg: 'bg-gray-500',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-700'
        }
      default:
        return {
          bg: 'bg-white border-gray-200',
          progressBg: 'bg-gray-500',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-700'
        }
    }
  }

  const colors = getColors()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {type === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={onClose}
            />
          )}
          
          {/* Notification Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3 
            }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className={`
              relative max-w-md w-full mx-4 rounded-xl border shadow-2xl overflow-hidden
              ${colors.bg}
            `}>
              {/* Progress Bar */}
              {duration > 0 && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                  <motion.div
                    className={`h-full ${colors.progressBg}`}
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold ${colors.titleColor} mb-1`}>
                      {title}
                    </h3>
                    <p className={`text-sm ${colors.messageColor} leading-relaxed`}>
                      {message}
                    </p>
                    
                    {/* Action Button */}
                    {actionButton && (
                      <div className="mt-4">
                        <Button
                          onClick={actionButton.onClick}
                          variant={actionButton.variant || 'default'}
                          size="sm"
                          className="font-medium"
                        >
                          {actionButton.label}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Close Button */}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for easy notification management
export function useNotificationPopup() {
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'info' | 'warning' | 'loading'
    title: string
    message: string
    duration?: number
    actionButton?: {
      label: string
      onClick: () => void
      variant?: 'default' | 'outline' | 'secondary'
    }
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showNotification = (params: {
    type: 'success' | 'error' | 'info' | 'warning' | 'loading'
    title: string
    message: string
    duration?: number
    actionButton?: {
      label: string
      onClick: () => void
      variant?: 'default' | 'outline' | 'secondary'
    }
  }) => {
    setNotification({
      ...params,
      isOpen: true
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }

  const showSuccess = (title: string, message: string, duration?: number, actionButton?: any) => {
    showNotification({ type: 'success', title, message, duration, actionButton })
  }

  const showError = (title: string, message: string, duration?: number, actionButton?: any) => {
    showNotification({ type: 'error', title, message, duration, actionButton })
  }

  const showInfo = (title: string, message: string, duration?: number, actionButton?: any) => {
    showNotification({ type: 'info', title, message, duration, actionButton })
  }

  const showWarning = (title: string, message: string, duration?: number, actionButton?: any) => {
    showNotification({ type: 'warning', title, message, duration, actionButton })
  }

  const showLoading = (title: string, message: string) => {
    showNotification({ type: 'loading', title, message, duration: 0 })
  }

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    NotificationPopup: () => (
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
        actionButton={notification.actionButton}
      />
    )
  }
}
