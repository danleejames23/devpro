export interface Service {
  id: string
  title: string
  description: string
  features: string[]
  startingPrice: number
  timeline: string
  icon: string
}

export interface Project {
  id: string
  title: string
  description: string
  image: string
  liveUrl?: string
  githubUrl?: string
  techStack: string[]
  category: 'frontend' | 'fullstack' | 'ecommerce' | 'mobile' | 'ai'
  featured: boolean
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar?: string
}

export interface QuoteRequest {
  name: string
  email: string
  company?: string
  projectType: string
  features: string[]
  complexity: 'basic' | 'standard' | 'premium'
  budget: string
  timeline: string
  description: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  tags: string[]
  slug: string
  featured: boolean
}

export interface Client {
  id: string
  name: string
  email: string
  company?: string
  projects: ClientProject[]
  createdAt: string
}

export interface ClientProject {
  id: string
  title: string
  status: 'planning' | 'in-progress' | 'review' | 'completed'
  progress: number
  startDate: string
  deadline: string
  budget: number
  description: string
  deliverables: Deliverable[]
  messages: Message[]
}

export interface Deliverable {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
  fileUrl?: string
}

export interface Message {
  id: string
  sender: 'client' | 'admin'
  content: string
  timestamp: string
  attachments?: string[]
}

export interface Lead {
  id: string
  name: string
  email: string
  company?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal-sent' | 'won' | 'lost'
  estimatedValue: number
  notes: string
  createdAt: string
  lastContact?: string
}
