'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  Mail, 
  Building,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface QuoteDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  quote: any
  onCancelQuote?: (quoteId: string) => void
}

export default function QuoteDetailsModal({ isOpen, onClose, quote, onCancelQuote }: QuoteDetailsModalProps) {
  if (!isOpen || !quote) return null

  const handleCancelQuote = () => {
    console.log('QuoteDetailsModal cancel clicked for quote:', quote)
    console.log('Quote ID options:', { id: quote.id, quote_id: quote.quote_id })
    if (onCancelQuote && quote.id) {
      const quoteId = quote.id // Use id since API transforms quote_id to id
      console.log('QuoteDetailsModal using quote ID:', quoteId)
      onCancelQuote(quoteId)
      // Don't close the modal here - let the confirmation dialog handle it
    } else {
      console.error('QuoteDetailsModal: Cannot cancel - missing quote ID or callback')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-300 border border-yellow-400/30'
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/30'
      case 'under_review':
        return 'bg-blue-500/10 text-blue-300 border border-blue-400/30'
      case 'quoted':
        return 'bg-purple-500/10 text-purple-300 border border-purple-400/30'
      case 'accepted':
        return 'bg-green-500/10 text-green-300 border border-green-400/30'
      case 'in_progress':
        return 'bg-indigo-500/10 text-indigo-300 border border-indigo-400/30'
      case 'completed':
        return 'bg-teal-500/10 text-teal-300 border border-teal-400/30'
      case 'cancelled':
        return 'bg-red-500/10 text-red-300 border border-red-400/30'
      default:
        return 'bg-gray-500/10 text-gray-300 border border-gray-400/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'under_review':
        return <FileText className="w-4 h-4" />
      case 'quoted':
        return <DollarSign className="w-4 h-4" />
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'in_progress':
        return <Package className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

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
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10"
        >
          <Card className="glass-card border border-neon-purple/30 shadow-2xl">
            <CardHeader className="bg-gradient-to-br from-neon-purple/20 via-cyber-mint/10 to-cosmic-blue/20 text-silver-glow relative border-b border-neon-purple/20">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-silver-glow/80 hover:text-cyber-mint transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <FileText className="w-6 h-6 mr-3" />
                    Quote Overview
                  </CardTitle>
                  <CardDescription className="text-silver-glow/80 mt-2">
                    Comprehensive summary of your quote
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge 
                    className={`${getStatusColor(quote.status)} flex items-center space-x-2 px-3 py-2`}
                  >
                    {getStatusIcon(quote.status)}
                    <span className="capitalize">{quote.status?.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Quote Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      Quote Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-neon-purple/20">
                        <span className="text-sm font-medium text-silver-glow/80">Quote ID</span>
                        <span className="font-mono text-cyber-mint font-bold">{quote.id}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-neon-purple/20">
                        <span className="text-sm font-medium text-silver-glow/80">Status</span>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-neon-purple/20">
                        <span className="text-sm font-medium text-silver-glow/80">Quoted Price</span>
                        <span className="text-xl font-bold text-cyber-mint">
                          £{quote.estimatedCost?.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-neon-purple/20">
                        <span className="text-sm font-medium text-silver-glow/80">Timeline</span>
                        <span className="font-medium text-silver-glow">{quote.estimatedTimeline}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-neon-purple/20">
                        <span className="text-sm font-medium text-silver-glow/80">Rush Delivery</span>
                        <Badge variant={quote.rushDelivery === 'standard' ? 'secondary' : 'default'}>
                          {quote.rushDelivery?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-primary" />
                      Important Dates
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-neon-purple/20">
                        <span className="text-sm font-medium text-silver-glow/80">Submitted</span>
                        <span className="text-sm text-silver-glow">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-neon-purple/20">
                        <span className="text-sm font-medium text-silver-glow/80">Last Updated</span>
                        <span className="text-sm text-silver-glow">
                          {new Date(quote.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer & Project Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Customer Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 glass-card rounded-lg border border-neon-purple/20">
                        <User className="w-4 h-4 text-silver-glow/80" />
                        <div>
                          <p className="text-sm font-medium text-silver-glow/80">Name</p>
                          <p className="font-medium text-silver-glow">{quote.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 glass-card rounded-lg border border-neon-purple/20">
                        <Mail className="w-4 h-4 text-silver-glow/80" />
                        <div>
                          <p className="text-sm font-medium text-silver-glow/80">Email</p>
                          <p className="font-medium text-silver-glow">{quote.email}</p>
                        </div>
                      </div>
                      
                      {quote.company && (
                        <div className="flex items-center space-x-3 p-3 glass-card rounded-lg border border-neon-purple/20">
                          <Building className="w-4 h-4 text-silver-glow/80" />
                          <div>
                            <p className="text-sm font-medium text-silver-glow/80">Company</p>
                            <p className="font-medium text-silver-glow">{quote.company}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-primary" />
                      Project Description
                    </h3>
                    
                    <div className="p-4 glass-card rounded-lg border border-neon-purple/20">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-silver-glow">
                        {quote.description}
                      </p>
                    </div>
                  </div>

                  {/* Selected Package (if any) */}
                  {quote.selectedPackage && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-primary" />
                        Selected Package
                      </h3>
                      
                      <div className="p-4 glass-card rounded-lg border border-neon-purple/20">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-silver-glow">{quote.selectedPackage.name}</p>
                            {quote.selectedPackage.description && (
                              <p className="text-sm text-silver-glow/70 mt-1">
                                {quote.selectedPackage.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            {quote.selectedPackage.deliveryTime && (
                              <Badge className="bg-blue-500/10 text-blue-300 border border-blue-400/30">
                                {quote.selectedPackage.deliveryTime}
                              </Badge>
                            )}
                            {quote.selectedPackage.complexity && (
                              <Badge className="bg-purple-500/10 text-purple-300 border border-purple-400/30 capitalize">
                                {quote.selectedPackage.complexity}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {(quote.selectedPackage.features?.length || quote.selectedFeatures?.length) ? (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-silver-glow/80 mb-2">Included Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {(quote.selectedPackage.features?.length ? quote.selectedPackage.features : quote.selectedFeatures).map((feature: any, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                  {typeof feature === 'string' ? feature : (feature?.name || feature?.title || 'Feature')}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Selected Features (fallback when no package) */}
                  {!quote.selectedPackage && (quote.selectedFeatures?.length > 0 || quote.complexity) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-primary" />
                        Selected Features
                      </h3>
                      <div className="p-4 glass-card rounded-lg border border-neon-purple/20">
                        {quote.selectedFeatures?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {quote.selectedFeatures.map((feature: any, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                {typeof feature === 'string' ? feature : (feature?.name || feature?.title || 'Feature')}
                              </span>
                            ))}
                          </div>
                        )}
                        {quote.complexity && (
                          <div className="mt-3 pt-3 border-t border-neon-purple/20">
                            <span className="text-sm text-silver-glow/80">Complexity: </span>
                            <Badge className="bg-purple-500/10 text-purple-300 border border-purple-400/30 capitalize ml-1">
                              {quote.complexity}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Close
                </Button>
                
                {quote.status === 'pending' && (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelQuote}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Quote
                  </Button>
                )}
                
                {quote.status === 'quoted' && (
                  <Button 
                    className="flex-1 btn-gradient"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Quote
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
