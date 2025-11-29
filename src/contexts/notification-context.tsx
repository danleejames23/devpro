'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import NotificationPopup from '@/components/notification-popup'

interface NotificationContextType {
  showSuccess: (title: string, message: string, duration?: number, actionButton?: any) => void
  showError: (title: string, message: string, duration?: number, actionButton?: any) => void
  showInfo: (title: string, message: string, duration?: number, actionButton?: any) => void
  showWarning: (title: string, message: string, duration?: number, actionButton?: any) => void
  showLoading: (title: string, message: string) => void
  hideNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
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

  const contextValue: NotificationContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    hideNotification
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
        actionButton={notification.actionButton}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

// Convenience hook for quick notifications
export function useQuickNotifications() {
  const { showSuccess, showError, showInfo, showWarning } = useNotification()

  const notifySuccess = (message: string, title = 'Success') => {
    showSuccess(title, message, 3000)
  }

  const notifyError = (message: string, title = 'Error') => {
    showError(title, message, 5000)
  }

  const notifyInfo = (message: string, title = 'Info') => {
    showInfo(title, message, 4000)
  }

  const notifyWarning = (message: string, title = 'Warning') => {
    showWarning(title, message, 4000)
  }

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning
  }
}
