import { Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'ecommerce-platform',
    title: 'Modern E-Commerce Platform',
    description: 'A full-featured e-commerce platform with advanced filtering, payment processing, and admin dashboard. Built for scalability and performance.',
    image: '/projects/ecommerce-platform.jpg',
    liveUrl: 'https://demo-ecommerce.vercel.app',
    githubUrl: 'https://github.com/username/ecommerce-platform',
    techStack: ['Next.js', 'TypeScript', 'Stripe', 'Prisma', 'PostgreSQL', 'TailwindCSS'],
    category: 'ecommerce',
    featured: true
  },
  {
    id: 'saas-dashboard',
    title: 'SaaS Analytics Dashboard',
    description: 'A comprehensive analytics dashboard for SaaS companies with real-time data visualization, user management, and subscription handling.',
    image: '/projects/saas-dashboard.jpg',
    liveUrl: 'https://demo-saas.vercel.app',
    githubUrl: 'https://github.com/username/saas-dashboard',
    techStack: ['React', 'Node.js', 'MongoDB', 'Chart.js', 'Express', 'JWT'],
    category: 'fullstack',
    featured: true
  },
  {
    id: 'ai-content-generator',
    title: 'AI Content Generator',
    description: 'An AI-powered content generation tool that helps businesses create marketing copy, blog posts, and social media content.',
    image: '/projects/ai-content-generator.jpg',
    liveUrl: 'https://demo-ai-content.vercel.app',
    techStack: ['Next.js', 'OpenAI API', 'Supabase', 'TailwindCSS', 'Framer Motion'],
    category: 'ai',
    featured: true
  },
  {
    id: 'portfolio-website',
    title: 'Creative Portfolio Website',
    description: 'A stunning portfolio website for a creative agency with smooth animations, case studies, and contact forms.',
    image: '/projects/portfolio-website.jpg',
    liveUrl: 'https://demo-portfolio.vercel.app',
    techStack: ['Next.js', 'Framer Motion', 'Sanity CMS', 'TailwindCSS'],
    category: 'frontend',
    featured: false
  },
  {
    id: 'fitness-app',
    title: 'Fitness Tracking Mobile App',
    description: 'A cross-platform mobile app for fitness tracking with workout plans, progress monitoring, and social features.',
    image: '/projects/fitness-app.jpg',
    techStack: ['React Native', 'Firebase', 'Redux', 'Expo'],
    category: 'mobile',
    featured: false
  },
  {
    id: 'restaurant-pos',
    title: 'Restaurant POS System',
    description: 'A complete point-of-sale system for restaurants with order management, inventory tracking, and analytics.',
    image: '/projects/restaurant-pos.jpg',
    liveUrl: 'https://demo-restaurant-pos.vercel.app',
    techStack: ['Vue.js', 'Laravel', 'MySQL', 'Stripe', 'Pusher'],
    category: 'fullstack',
    featured: false
  },
  {
    id: 'ai-customer-support',
    title: 'AI Customer Support Chatbot',
    description: 'Intelligent chatbot that handles 80% of customer inquiries automatically, with seamless handoff to human agents when needed.',
    image: '/projects/ai-chatbot.jpg',
    liveUrl: 'https://demo-ai-chatbot.vercel.app',
    techStack: ['Next.js', 'OpenAI API', 'Langchain', 'PostgreSQL', 'WebSocket'],
    category: 'ai',
    featured: true
  },
  {
    id: 'web-scraping-agent',
    title: 'AI Web Scraping Agent',
    description: 'Autonomous AI agent that monitors competitor pricing, extracts product data, and generates automated reports for e-commerce businesses.',
    image: '/projects/web-agent.jpg',
    liveUrl: 'https://demo-web-agent.vercel.app',
    techStack: ['Python', 'Selenium', 'OpenAI API', 'FastAPI', 'MongoDB', 'Celery'],
    category: 'ai',
    featured: true
  },
  {
    id: 'ai-document-processor',
    title: 'AI Document Processing System',
    description: 'Intelligent document processing system that extracts data from invoices, contracts, and forms using OCR and natural language processing.',
    image: '/projects/ai-documents.jpg',
    techStack: ['Python', 'OpenAI API', 'Tesseract OCR', 'FastAPI', 'React'],
    category: 'ai',
    featured: false
  }
]
