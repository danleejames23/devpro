import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'GBP': '£',
    'EUR': '€'
  }
  
  const locales: Record<string, string> = {
    'USD': 'en-US',
    'GBP': 'en-GB',
    'EUR': 'en-IE'
  }
  
  const symbol = symbols[currency] || '£'
  const locale = locales[currency] || 'en-GB'
  
  return `${symbol}${new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function calculateProjectTimeline(features: string[]): number {
  const timelineMap: Record<string, number> = {
    'basic-website': 7,
    'ecommerce': 14,
    'custom-backend': 21,
    'ai-integration': 10,
    'mobile-app': 30,
    'cms': 7,
    'payment-system': 5,
    'user-auth': 3,
    'admin-dashboard': 10,
    'api-development': 14,
  }

  return features.reduce((total, feature) => {
    return total + (timelineMap[feature] || 7)
  }, 0)
}

export function calculateProjectCost(features: string[], complexity: 'basic' | 'standard' | 'premium'): number {
  const baseCosts: Record<string, number> = {
    'basic-website': 499,
    'ecommerce': 999,
    'custom-backend': 1299,
    'ai-integration': 799,
    'mobile-app': 2499,
    'cms': 399,
    'payment-system': 299,
    'user-auth': 199,
    'admin-dashboard': 699,
    'api-development': 999,
    'seo-optimization': 199,
    'analytics': 99,
    'social-media': 149,
    'email-marketing': 199,
    'maintenance': 99,
  }

  const multipliers = {
    basic: 1,
    standard: 1.3,
    premium: 1.6,
  }

  const baseCost = features.reduce((total, feature) => {
    return total + (baseCosts[feature] || 299)
  }, 0)

  return Math.round(baseCost * multipliers[complexity])
}
