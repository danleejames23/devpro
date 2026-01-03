'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCircle, MessageSquare, FileText, CreditCard, Briefcase, Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'quote_status' | 'message' | 'project_update' | 'billing' | 'system' | 'invoice'
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface NotificationDropdownProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onRefresh: () => void
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quote_status':
        return <FileText className="w-4 h-4" />
      case 'message':
        return <MessageSquare className="w-4 h-4" />
      case 'project_update':
        return <Briefcase className="w-4 h-4" />
      case 'billing':
        return <CreditCard className="w-4 h-4" />
      case 'invoice':
        return <FileText className="w-4 h-4" />
      case 'system':
        return <Settings className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-50 border-red-200'
    if (priority === 'high') return 'text-orange-600 bg-orange-50 border-orange-200'
    
    switch (type) {
      case 'quote_status':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'message':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'project_update':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'billing':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'invoice':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      case 'system':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-500 text-white text-xs">High</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>
      default:
        return null
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[350px] overflow-y-auto bg-white">
              {notifications.length === 0 ? (
                <div className="p-8 text-center bg-white">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No notifications</p>
                  <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 bg-white">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          onMarkAsRead(notification.id)
                        }
                        if (notification.action_url) {
                          window.location.href = notification.action_url
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-full border ${getNotificationColor(notification.type, notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {notification.title}
                                </h4>
                                {getPriorityBadge(notification.priority)}
                              </div>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(notification.id)
                                }}
                                className="p-1 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-gray-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Link */}
                      {notification.action_url && (
                        <div className="mt-2 flex items-center gap-1 text-blue-600 text-xs">
                          <ExternalLink className="w-3 h-3" />
                          <span>View details</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-t border-gray-200 bg-white space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-white text-xs"
                  onClick={() => window.location.href = '/client'}
                >
                  Project Hub
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white text-xs"
                  onClick={() => window.location.href = '/quote'}
                >
                  Get Quote
                </Button>
              </div>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="w-full text-xs text-gray-600 hover:text-gray-900"
                >
                  Refresh notifications
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
