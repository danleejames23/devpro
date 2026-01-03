'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Check, Sparkles, Building2, Code, Bot, ShoppingCart, Layers, Globe, Zap, Lock, Eye, EyeOff } from 'lucide-react'

const projectTypes = [
  { id: 'enterprise_web_app', label: 'Enterprise Web Application', icon: Building2, description: 'Large-scale business applications' },
  { id: 'saas', label: 'SaaS Platform', icon: Layers, description: 'Software as a Service product' },
  { id: 'ecommerce', label: 'Complex E-Commerce', icon: ShoppingCart, description: 'Advanced online store with custom features' },
  { id: 'ai_solution', label: 'AI/ML Solution', icon: Bot, description: 'Artificial intelligence integration' },
  { id: 'custom_web_app', label: 'Custom Web App', icon: Code, description: 'Bespoke web application' },
  { id: 'api_integration', label: 'API & Integration', icon: Globe, description: 'System integrations and APIs' },
]

const budgetRanges = [
  { id: '1500-3000', label: '£1,500 - £3,000' },
  { id: '3000-5000', label: '£3,000 - £5,000' },
  { id: '5000-10000', label: '£5,000 - £10,000' },
  { id: '10000-20000', label: '£10,000 - £20,000' },
  { id: '20000+', label: '£20,000+' },
]

const timelineOptions = [
  { id: '1-2-months', label: '1-2 Months' },
  { id: '3-4-months', label: '3-4 Months' },
  { id: '5-6-months', label: '5-6 Months' },
  { id: '6+-months', label: '6+ Months' },
  { id: 'flexible', label: 'Flexible' },
]

const featureOptions = [
  'User Authentication & Roles',
  'Payment Processing',
  'Real-time Features',
  'Admin Dashboard',
  'Analytics & Reporting',
  'Email Notifications',
  'File Upload/Storage',
  'Search Functionality',
  'API Integration',
  'Mobile Responsive',
  'Multi-language Support',
  'Third-party Integrations',
]

export default function CustomQuotePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Contact
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    
    // Project
    projectType: '',
    projectTitle: '',
    projectDescription: '',
    
    // Requirements
    features: [] as string[],
    integrations: '',
    targetAudience: '',
    competitors: '',
    
    // Technical
    preferredTechStack: '',
    hostingPreference: '',
    hasExistingSystem: false,
    existingSystemDetails: '',
    
    // Timeline & Budget
    preferredTimeline: '',
    budgetRange: '',
    
    // Additional
    additionalNotes: '',
  })

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const validateStep = (stepNum: number): boolean => {
    setError('')
    
    if (stepNum === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in all required fields')
        return false
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address')
        return false
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (formData.password && formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return false
      }
    }
    
    if (stepNum === 2) {
      if (!formData.projectType || !formData.projectTitle || !formData.projectDescription) {
        setError('Please fill in all required fields')
        return false
      }
    }
    
    if (stepNum === 3) {
      if (formData.features.length === 0) {
        setError('Please select at least one feature')
        return false
      }
    }
    
    if (stepNum === 4) {
      if (!formData.budgetRange || !formData.preferredTimeline) {
        setError('Please select budget range and timeline')
        return false
      }
    }
    
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return
    
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/custom-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        // If user was created, we could auto-login here
        // For now, just show success
      } else {
        setError(data.error || 'Failed to submit quote request')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <main className="pt-16 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Quote Request Submitted!</h1>
          <p className="text-slate-400 mb-8">
            Thank you for your custom quote request. Our team will review your requirements and get back to you within 24-48 hours with a detailed proposal.
          </p>
          {formData.password && (
            <p className="text-cyan-400 mb-8">
              Your account has been created. You can now log in to track your quote status.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl"
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 text-white font-medium rounded-xl"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <section className="py-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-400 border border-orange-500/20 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Custom Project Quote</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Your Custom Quote
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tell us about your project and we&apos;ll provide a tailored quote within 24-48 hours.
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          {['Contact', 'Project', 'Features', 'Budget', 'Review'].map((label, idx) => (
            <div key={label} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                step > idx + 1 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                  : step === idx + 1 
                    ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white' 
                    : 'bg-slate-700 text-slate-400'
              }`}>
                {step > idx + 1 ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${step === idx + 1 ? 'text-white' : 'text-slate-500'}`}>
                {label}
              </span>
              {idx < 4 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > idx + 1 ? 'bg-green-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Contact Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="john@company.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="+44 7XXX XXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">Create an account to track your quote (optional)</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none pr-10"
                        placeholder="Min 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6">Project Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Project Type *</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateField('projectType', type.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.projectType === type.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.projectType === type.id ? 'bg-orange-500' : 'bg-slate-700'
                        }`}>
                          <type.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{type.label}</div>
                          <div className="text-xs text-slate-400">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={(e) => updateField('projectTitle', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., Customer Portal for XYZ Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Description *</label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => updateField('projectDescription', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none resize-none"
                  placeholder="Describe your project in detail. What problem does it solve? Who are the users? What are the main goals?"
                />
              </div>
            </div>
          )}

          {/* Step 3: Features & Requirements */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6">Features & Requirements</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Required Features *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {featureOptions.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`p-3 rounded-xl border text-sm text-left transition-all ${
                        formData.features.includes(feature)
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          formData.features.includes(feature) ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500'
                        }`}>
                          {formData.features.includes(feature) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {feature}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Third-party Integrations</label>
                <input
                  type="text"
                  value={formData.integrations}
                  onChange={(e) => updateField('integrations', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., Stripe, Mailchimp, Salesforce, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Who will use this application?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reference Websites/Apps</label>
                <input
                  type="text"
                  value={formData.competitors}
                  onChange={(e) => updateField('competitors', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Any websites or apps you'd like to use as reference"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Tech Stack</label>
                  <input
                    type="text"
                    value={formData.preferredTechStack}
                    onChange={(e) => updateField('preferredTechStack', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g., React, Node.js, or 'No preference'"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hosting Preference</label>
                  <input
                    type="text"
                    value={formData.hostingPreference}
                    onChange={(e) => updateField('hostingPreference', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g., AWS, Vercel, or 'No preference'"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasExistingSystem}
                    onChange={(e) => updateField('hasExistingSystem', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-slate-300">I have an existing system that needs to be integrated or migrated</span>
                </label>
                
                {formData.hasExistingSystem && (
                  <textarea
                    value={formData.existingSystemDetails}
                    onChange={(e) => updateField('existingSystemDetails', e.target.value)}
                    rows={3}
                    className="w-full mt-3 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none resize-none"
                    placeholder="Describe your existing system..."
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 4: Budget & Timeline */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6">Budget & Timeline</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Budget Range *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {budgetRanges.map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => updateField('budgetRange', range.id)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        formData.budgetRange === range.id
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Preferred Timeline *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {timelineOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateField('preferredTimeline', option.id)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        formData.preferredTimeline === option.id
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none resize-none"
                  placeholder="Any other details you'd like to share..."
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6">Review Your Request</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Contact</h3>
                  <p className="text-white">{formData.firstName} {formData.lastName}</p>
                  <p className="text-slate-300">{formData.email}</p>
                  {formData.company && <p className="text-slate-300">{formData.company}</p>}
                </div>

                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Project</h3>
                  <p className="text-white font-medium">{formData.projectTitle}</p>
                  <p className="text-cyan-400 text-sm mb-2">{projectTypes.find(t => t.id === formData.projectType)?.label}</p>
                  <p className="text-slate-300 text-sm">{formData.projectDescription}</p>
                </div>

                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature) => (
                      <span key={feature} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Budget</h3>
                    <p className="text-white">{budgetRanges.find(b => b.id === formData.budgetRange)?.label}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Timeline</h3>
                    <p className="text-white">{timelineOptions.find(t => t.id === formData.preferredTimeline)?.label}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
            ) : (
              <Link
                href="/services"
                className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Link>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-semibold rounded-xl transition-all"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                {!isSubmitting && <Zap className="ml-2 h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
