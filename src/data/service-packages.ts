export interface ServicePackage {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  features: string[]
  deliveryTime: string
  popular?: boolean
  category: 'website' | 'ecommerce' | 'webapp' | 'mobile' | 'ai' | 'custom'
  complexity: 'basic' | 'standard' | 'premium'
  icon: string
  color: string
}

export const servicePackages: ServicePackage[] = [
  // Website Packages
  {
    id: 'basic-landing',
    name: 'Landing Page',
    description: 'Perfect for startups and small businesses',
    price: 100,
    originalPrice: 199,
    features: [
      'Single page responsive design',
      'Contact form integration',
      'Mobile optimized',
      'Basic SEO setup',
      'Social media links',
      '1 revision round'
    ],
    deliveryTime: '2-3 days',
    category: 'website',
    complexity: 'basic',
    icon: '🌐',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'business-website',
    name: 'Business Website',
    description: 'Multi-page website for established businesses',
    price: 250,
    originalPrice: 399,
    features: [
      'Up to 5 pages',
      'Custom responsive design',
      'Contact forms & maps',
      'SEO optimization',
      'Analytics setup',
      'Content management',
      '2 revision rounds'
    ],
    deliveryTime: '5-7 days',
    popular: true,
    category: 'website',
    complexity: 'standard',
    icon: '🏢',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'premium-website',
    name: 'Premium Website',
    description: 'Advanced website with custom features',
    price: 499,
    originalPrice: 699,
    features: [
      'Unlimited pages',
      'Custom animations',
      'Advanced SEO',
      'Performance optimization',
      'Security features',
      'Blog system',
      'Admin dashboard',
      '3 revision rounds'
    ],
    deliveryTime: '7-10 days',
    category: 'website',
    complexity: 'premium',
    icon: '✨',
    color: 'from-amber-500 to-orange-500'
  },

  // E-commerce Packages
  {
    id: 'basic-shop',
    name: 'Basic Online Shop',
    description: 'Start selling online with essential features',
    price: 350,
    originalPrice: 549,
    features: [
      'Up to 50 products',
      'Payment processing (Stripe)',
      'Inventory management',
      'Order tracking',
      'Customer accounts',
      'Mobile responsive',
      'Basic analytics'
    ],
    deliveryTime: '7-10 days',
    category: 'ecommerce',
    complexity: 'standard',
    icon: '🛒',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'advanced-ecommerce',
    name: 'Advanced E-commerce',
    description: 'Full-featured online store',
    price: 550,
    originalPrice: 899,
    features: [
      'Unlimited products',
      'Multi-payment options',
      'Advanced inventory',
      'Discount & coupon system',
      'Email marketing integration',
      'Advanced analytics',
      'Multi-currency support',
      'Admin dashboard'
    ],
    deliveryTime: '10-14 days',
    popular: true,
    category: 'ecommerce',
    complexity: 'premium',
    icon: '🏪',
    color: 'from-indigo-500 to-purple-500'
  },

  // Web App Packages
  {
    id: 'custom-webapp',
    name: 'Custom Web App',
    description: 'Tailored web application for your business',
    price: 800,
    originalPrice: 1099,
    features: [
      'Custom functionality',
      'User authentication',
      'Database integration',
      'API development',
      'Admin panel',
      'Real-time features',
      'Cloud deployment',
      'Ongoing support'
    ],
    deliveryTime: '14-21 days',
    category: 'webapp',
    complexity: 'premium',
    icon: '⚙️',
    color: 'from-red-500 to-pink-500'
  },

  // Mobile App Packages
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'iOS and Android mobile application',
    price: 899,
    originalPrice: 1399,
    features: [
      'iOS & Android apps',
      'Cross-platform development',
      'Push notifications',
      'Offline functionality',
      'App store submission',
      'Backend integration',
      'Analytics tracking',
      '6 months support'
    ],
    deliveryTime: '21-30 days',
    category: 'mobile',
    complexity: 'premium',
    icon: '📱',
    color: 'from-teal-500 to-blue-500'
  },

  // AI Services Packages
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'Intelligent chatbot for customer support & engagement',
    price: 250,
    originalPrice: 499,
    features: [
      'Custom AI training on your data',
      'Natural language processing',
      'Multi-platform integration',
      'Analytics dashboard',
      'Lead generation features',
      'Knowledge base integration',
      'Handoff to human agents',
      '3 months support'
    ],
    deliveryTime: '3-7 days',
    popular: true,
    category: 'ai',
    complexity: 'standard',
    icon: '🤖',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'ai-web-agent',
    name: 'AI Website Agent',
    description: 'Autonomous AI agent for website automation',
    price: 699,
    originalPrice: 899,
    features: [
      'Custom AI agent development',
      'Website automation tasks',
      'Data extraction & analysis',
      'Scheduled operations',
      'Integration with existing systems',
      'Performance monitoring',
      'Custom reporting',
      '6 months support'
    ],
    deliveryTime: '7-14 days',
    category: 'ai',
    complexity: 'premium',
    icon: '🕷️',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'ai-app-integration',
    name: 'AI App Integration',
    description: 'Add AI capabilities to your existing applications',
    price: 499,
    originalPrice: 699,
    features: [
      'GPT/Claude API integration',
      'Custom AI workflows',
      'Image/document processing',
      'Voice recognition features',
      'Sentiment analysis',
      'Content generation',
      'API development',
      '3 months support'
    ],
    deliveryTime: '5-10 days',
    category: 'ai',
    complexity: 'standard',
    icon: '🧠',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'custom-ai-solution',
    name: 'Custom AI Solution',
    description: 'Bespoke AI application tailored to your needs',
    price: 1499,
    originalPrice: 1799,
    features: [
      'Full AI application development',
      'Machine learning models',
      'Custom training datasets',
      'Advanced analytics',
      'Scalable cloud deployment',
      'Admin dashboard',
      'API documentation',
      '12 months support'
    ],
    deliveryTime: '14-30 days',
    category: 'ai',
    complexity: 'premium',
    icon: '⚡',
    color: 'from-orange-500 to-red-500'
  },

  // Quick Services
  {
    id: 'website-redesign',
    name: 'Website Redesign',
    description: 'Refresh your existing website',
    price: 199,
    originalPrice: 349,
    features: [
      'Modern design update',
      'Mobile optimization',
      'Speed improvements',
      'SEO enhancements',
      'Content migration',
      '2 revision rounds'
    ],
    deliveryTime: '3-5 days',
    category: 'website',
    complexity: 'standard',
    icon: '🎨',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'maintenance-package',
    name: 'Website Maintenance',
    description: 'Monthly website maintenance and updates',
    price: 99,
    features: [
      'Security updates',
      'Content updates',
      'Performance monitoring',
      'Backup management',
      'Technical support',
      'Monthly reports'
    ],
    deliveryTime: 'Ongoing',
    category: 'custom',
    complexity: 'basic',
    icon: '🔧',
    color: 'from-gray-500 to-slate-500'
  }
]

export const getPackagesByCategory = (category: ServicePackage['category']) => {
  return servicePackages.filter(pkg => pkg.category === category)
}

export const getPackageById = (id: string) => {
  return servicePackages.find(pkg => pkg.id === id)
}

export const getPopularPackages = () => {
  return servicePackages.filter(pkg => pkg.popular)
}
