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
import { Lock, User, Mail, Eye, EyeOff, ArrowRight, Shield, Users } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function ClientPortalPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const apiBase = typeof window !== 'undefined' && window.location.origin.startsWith('http')
        ? window.location.origin
        : 'http://localhost:3000'
      const response = await fetch(`${apiBase}/api/auth/simple-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: data.email, password: data.password })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Store auth token
        localStorage.setItem('auth_token', result.token)
        // Redirect directly to dashboard
        window.location.href = '/client/dashboard'
      } else {
        alert(result.error || 'Invalid email or password. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    }
    setIsLoading(false)
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const apiBase = typeof window !== 'undefined' && window.location.origin.startsWith('http')
        ? window.location.origin
        : 'http://localhost:3000'
      const response = await fetch(`${apiBase}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          company: ''
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Now login with the new credentials
        const loginResponse = await fetch(`${apiBase}/api/auth/simple-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: data.email, password: data.password })
        })
        
        const loginResult = await loginResponse.json()
        
        if (loginResult.success) {
          // Store auth token
          localStorage.setItem('auth_token', loginResult.token)
          // Redirect to dashboard
          window.location.href = '/client/dashboard'
        } else {
          alert('Account created but login failed. Please try logging in manually.')
        }
      } else {
        alert(result.error || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please check your details and try again.')
    }
    setIsLoading(false)
  }

  return (
    <main className="pt-16 min-h-screen">
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/90 to-background"></div>
        
        {/* Floating background elements */}
        <div className="absolute top-20 right-20 w-64 h-64 gradient-accent rounded-full blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 gradient-secondary rounded-full blur-2xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Client </span>
              <span className="gradient-text">Portal</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access your project dashboard, track progress, communicate with our team, and manage your account.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Login/Register Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="card-hover">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </CardTitle>
                  <CardDescription>
                    {isLogin 
                      ? 'Sign in to access your project dashboard' 
                      : 'Join your project hub to manage your projects'
                    }
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Toggle Buttons */}
                  <div className="flex bg-secondary rounded-lg p-1">
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        isLogin 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        !isLogin 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Register
                    </button>
                  </div>

                  {/* Login Form */}
                  {isLogin ? (
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...loginForm.register('email')}
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...loginForm.register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
                        </label>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>

                      <Button type="submit" className="w-full btn-gradient" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  ) : (
                    /* Register Form */
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...registerForm.register('name')}
                            placeholder="Your full name"
                            className="pl-10"
                          />
                        </div>
                        {registerForm.formState.errors.name && (
                          <p className="text-sm text-red-500 mt-1">{registerForm.formState.errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...registerForm.register('email')}
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-1">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...registerForm.register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500 mt-1">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...registerForm.register('confirmPassword')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            className="pl-10"
                          />
                        </div>
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>

                      <div className="flex items-start">
                        <input type="checkbox" className="rounded border-gray-300 mt-1" required />
                        <span className="ml-2 text-sm text-muted-foreground">
                          I agree to the{' '}
                          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                          {' '}and{' '}
                          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </span>
                      </div>

                      <Button type="submit" className="w-full btn-gradient" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  )}

                  {/* Admin Login Link */}
                  <div className="pt-4 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground mb-2">Admin Access</p>
                    <Link href="/admin" className="text-primary hover:underline text-sm font-medium">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Admin Login
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features & Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Project Hub Features</h2>
                <p className="text-muted-foreground mb-6">
                  Get full visibility and control over your projects with your dedicated project hub.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: '📊',
                    title: 'Project Dashboard',
                    description: 'Track project progress, milestones, and deliverables in real-time.'
                  },
                  {
                    icon: '💬',
                    title: 'Direct Communication',
                    description: 'Chat directly with your developer and get instant updates.'
                  },
                  {
                    icon: '📁',
                    title: 'File Management',
                    description: 'Access all project files, documents, and deliverables in one place.'
                  },
                  {
                    icon: '💳',
                    title: 'Invoice & Payments',
                    description: 'View invoices, payment history, and manage billing information.'
                  },
                  {
                    icon: '📈',
                    title: 'Analytics & Reports',
                    description: 'Get detailed reports on project performance and metrics.'
                  },
                  {
                    icon: '🔔',
                    title: 'Smart Notifications',
                    description: 'Receive updates on project milestones and important changes.'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-card border border-border rounded-lg card-hover"
                  >
                    <div className="text-2xl">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Card className="gradient-primary text-white">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm opacity-90 mb-4">
                    I'm here to help you get the most out of your project hub.
                  </p>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
