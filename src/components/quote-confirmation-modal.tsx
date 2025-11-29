'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  ArrowRight, 
  Sparkles,
  Clock,
  DollarSign,
  User,
  Building,
  FileText
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface QuoteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  quoteData: {
    id: string
    name: string
    email: string
    company?: string
    selectedFeatures?: string[]
    complexity?: string
    estimatedCost: number
    estimatedTimeline: string
    description: string
  }
  tempPassword: string
  isLoggedIn?: boolean
}

export default function QuoteConfirmationModal({
  isOpen,
  onClose,
  quoteData,
  tempPassword,
  isLoggedIn = false
}: QuoteConfirmationModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [step, setStep] = useState(1) // 1: Quote Summary, 2: Account Created

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword)
      setPasswordCopied(true)
      setTimeout(() => setPasswordCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy password:', err)
    }
  }

  const handleContinue = () => {
    if (isLoggedIn) {
      // For logged-in users, go directly to dashboard
      window.location.href = '/client/dashboard'
    } else {
      if (step === 1) {
        setStep(2)
      } else {
        // Redirect to client portal for new users
        window.location.href = '/client'
      }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-deep-space/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        {/* Cosmic Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-neon-purple/20 to-cyber-mint/10 rounded-full blur-3xl animate-cosmic-drift"></div>
          <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-br from-cosmic-blue/15 to-plasma-pink/10 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '5s'}}></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
        >
          <Card className="glass-card border border-neon-purple/30 shadow-2xl">
            {step === 1 ? (
              // Step 1: Quote Summary
              <>
                <CardHeader className="bg-gradient-to-br from-neon-purple/20 via-cyber-mint/10 to-cosmic-blue/20 text-silver-glow text-center relative border-b border-neon-purple/20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-br from-neon-purple to-cyber-mint rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-3xl font-accent text-white">
                    Quote Request Transmitted!
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    Your project data has been received and is being processed by our team
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-6 relative">
                  {/* Quote Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 glass-card border border-neon-purple/20 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-cyber-mint mr-3" />
                        <span className="font-medium text-silver-glow">Quote ID</span>
                      </div>
                      <span className="font-mono text-cyber-mint animate-hologram">{quoteData.id}</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 glass-card border border-neon-purple/20 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-cyber-mint/5"></div>
                        <div className="relative z-10">
                          <div className="flex items-center mb-2">
                            <DollarSign className="w-4 h-4 text-cyber-mint mr-2" />
                            <span className="text-sm text-silver-glow/70">Calculated Price</span>
                          </div>
                          <div className="text-2xl font-bold text-cyber-mint animate-hologram">
                            {formatCurrency(quoteData.estimatedCost)}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 glass-card border border-cosmic-blue/20 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-blue/5 to-plasma-pink/5"></div>
                        <div className="relative z-10">
                          <div className="flex items-center mb-2">
                            <Clock className="w-4 h-4 text-plasma-pink mr-2" />
                            <span className="text-sm text-silver-glow/70">Delivery Timeline</span>
                          </div>
                          <div className="text-2xl font-bold text-silver-glow">
                            {quoteData.estimatedTimeline}
                          </div>
                        </div>
                      </div>
                    </div>

                    {(quoteData.selectedFeatures && quoteData.selectedFeatures.length > 0) || quoteData.complexity ? (
                      <div className="p-4 border border-border rounded-lg">
                        {quoteData.selectedFeatures && quoteData.selectedFeatures.length > 0 && (
                          <>
                            <h4 className="font-medium mb-2">Selected Features:</h4>
                            <div className="flex flex-wrap gap-2">
                              {quoteData.selectedFeatures.map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                >
                                  {feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                        {quoteData.complexity && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <span className="text-sm text-muted-foreground">Complexity: </span>
                            <span className="font-medium capitalize">{quoteData.complexity}</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Next Steps */}
                  <div className="p-4 gradient-accent rounded-lg text-white">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      What happens next?
                    </h4>
                    <div className="space-y-3">
                      {isLoggedIn ? (
                        <>
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">1</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Review & Approval</p>
                              <p className="text-xs opacity-80">Our team reviews your requirements and prepares a detailed proposal</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">2</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Quote Sent</p>
                              <p className="text-xs opacity-80">You'll receive a detailed quote with pricing and timeline</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">3</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Project Activation</p>
                              <p className="text-xs opacity-80">Once approved, your quote becomes an active project in your dashboard</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">4</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Track Progress</p>
                              <p className="text-xs opacity-80">Monitor your project status and communicate with our team</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">1</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Account Created</p>
                              <p className="text-xs opacity-80">Your customer portal account is ready</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">2</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Review & Approval</p>
                              <p className="text-xs opacity-80">Our team reviews your requirements and prepares a detailed proposal</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">3</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Quote Sent</p>
                              <p className="text-xs opacity-80">You'll receive a detailed quote with pricing and timeline</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">4</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Project Activation</p>
                              <p className="text-xs opacity-80">Once approved, your quote becomes an active project in your dashboard</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleContinue} className="w-full bg-gradient-to-r from-neon-purple to-cyber-mint hover:from-neon-purple/80 hover:to-cyber-mint/80 text-white font-semibold transition-all duration-300" size="lg">
                    {isLoggedIn ? 'Access Dashboard' : 'Initialize Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </>
            ) : (
              // Step 2: Account Created
              <>
                <CardHeader className="gradient-secondary text-white text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <User className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl">
                    {isLoggedIn ? 'Quote Submitted Successfully!' : 'Quote Request Submitted!'}
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    {isLoggedIn 
                      ? 'Your quote has been received and added to your dashboard'
                      : 'We\'ve received your project details and will review them shortly'
                    }
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Account Details - Only show for new users */}
                  {!isLoggedIn && (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-primary" />
                          Your Login Details
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Email Address</label>
                            <Input value={quoteData.email} readOnly className="bg-secondary/50" />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Temporary Password</label>
                            <div className="flex space-x-2">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                value={tempPassword}
                                readOnly
                                className="bg-secondary/50 font-mono"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyPassword}
                                className={passwordCopied ? 'bg-green-100 text-green-700' : ''}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            {passwordCopied && (
                              <p className="text-sm text-green-600 mt-1">Password copied to clipboard!</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Customer Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">{quoteData.name}</div>
                    </div>
                    {quoteData.company && (
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-sm text-muted-foreground">Company</div>
                        <div className="font-medium">{quoteData.company}</div>
                      </div>
                    )}
                  </div>

                  {/* Important Notice */}
                  <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg">
                    <div className="flex items-start">
                      <Lock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Important Security Notice</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Please save your login details securely. You can change your password after logging in.
                          We've also sent these details to your email address.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button onClick={handleContinue} className="flex-1 bg-gradient-to-r from-cosmic-blue to-plasma-pink hover:from-cosmic-blue/80 hover:to-plasma-pink/80 text-white font-semibold transition-all duration-300" size="lg">
                      Access Portal
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button onClick={onClose} className="glass-card border border-neon-purple/30 text-silver-glow hover:border-cyber-mint/50 transition-all duration-300" size="lg">
                      Close
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
