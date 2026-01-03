'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, Settings, BarChart3, Users, FileText } from 'lucide-react'
import { useNotificationPopup } from '@/components/notification-popup'

const adminLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  twoFactorCode: z.string().optional(),
})

type AdminLoginFormData = z.infer<typeof adminLoginSchema>

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  
  const { showSuccess, showError, showLoading, hideNotification, NotificationPopup } = useNotificationPopup()

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true)
    showLoading('Authenticating...', 'Verifying your credentials')
    
    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      })

      const result = await response.json()
      hideNotification()
      
      if (result.success) {
        // Store admin info in session/localStorage
        localStorage.setItem('admin', JSON.stringify(result.admin))
        
        // Show success notification with redirect action
        showSuccess(
          'Login Successful! 🎉',
          'Welcome to your admin dashboard. You\'ll be redirected shortly.',
          3000,
          {
            label: 'Go to Dashboard',
            onClick: () => {
              window.location.href = '/admin/dashboard'
            },
            variant: 'default'
          }
        )
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 3000)
      } else {
        showError(
          'Login Failed',
          result.error || 'Invalid credentials. Please check your username and password.',
          5000
        )
      }
    } catch (error) {
      console.error('Login error:', error)
      hideNotification()
      showError(
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        5000
      )
    }
    setIsLoading(false)
  }

  return (
    <main className="pt-16 min-h-screen">
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/95 to-background"></div>
        
        {/* Floating background elements */}
        <div className="absolute top-20 right-20 w-64 h-64 gradient-primary rounded-full blur-3xl opacity-8 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 gradient-secondary rounded-full blur-2xl opacity-12 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Admin </span>
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Secure access to manage quotes, projects, clients, and business operations.
            </p>
            
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Admin Login Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="card-hover border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Admin Access</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the admin dashboard
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...form.register('username')}
                          placeholder="admin"
                          className="pl-10"
                          autoComplete="username"
                        />
                      </div>
                      {form.formState.errors.username && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.username.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...form.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter admin password"
                          className="pl-10 pr-10"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
                      )}
                    </div>

                    {requiresTwoFactor && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-sm font-medium mb-2">Two-Factor Authentication</label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...form.register('twoFactorCode')}
                            placeholder="Enter 6-digit code"
                            className="pl-10 text-center tracking-widest"
                            maxLength={6}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="ml-2 text-sm text-muted-foreground">Keep me signed in</span>
                      </label>
                      <Link href="/admin/recovery" className="text-sm text-primary hover:underline">
                        Account recovery
                      </Link>
                    </div>

                    <Button type="submit" className="w-full btn-gradient animate-pulse-glow" disabled={isLoading}>
                      {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="pt-4 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground mb-2">Client Access</p>
                    <Link href="/client" className="text-primary hover:underline text-sm font-medium">
                      <Users className="w-4 h-4 inline mr-1" />
                      Project Hub
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6"
              >
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                          This is a secure admin area. All activities are logged and monitored. 
                          Unauthorized access attempts will be reported.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Admin Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Dashboard Features</h2>
                <p className="text-muted-foreground mb-6">
                  Comprehensive business management tools for quotes, projects, and client relationships.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    icon: FileText,
                    title: 'Quote Management',
                    description: 'Review, approve, and manage all client quotes and proposals.',
                    color: 'gradient-primary'
                  },
                  {
                    icon: BarChart3,
                    title: 'Analytics & Reports',
                    description: 'Track business performance, revenue, and project metrics.',
                    color: 'gradient-secondary'
                  },
                  {
                    icon: Users,
                    title: 'Client Management',
                    description: 'Manage client accounts, projects, and communication.',
                    color: 'gradient-accent'
                  },
                  {
                    icon: Settings,
                    title: 'System Settings',
                    description: 'Configure pricing, services, and business settings.',
                    color: 'gradient-primary'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="p-4 bg-card border border-border rounded-lg card-hover"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Stats Preview */}
              <Card className="gradient-primary text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-sm opacity-90">Active Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">£47K</div>
                      <div className="text-sm opacity-90">Monthly Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">89%</div>
                      <div className="text-sm opacity-90">Client Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm opacity-90">Pending Quotes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Notification Popup */}
      <NotificationPopup />
    </main>
  )
}
