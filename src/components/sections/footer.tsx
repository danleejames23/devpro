'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Code, Mail, Phone, MapPin, Github } from 'lucide-react'

const Footer = () => {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  // Hide footer on client portal and admin pages
  if (pathname?.startsWith('/client/dashboard') || pathname?.startsWith('/admin/dashboard')) {
    return null
  }

  const footerLinks = {
    services: [
      { label: 'Landing Page', href: '/services?service=landing-page' },
      { label: 'Basic Website', href: '/services?service=basic-website' },
      { label: 'Custom Website Development', href: '/services?service=custom-website-development' },
      { label: 'Frontend Development', href: '/services?service=frontend-development' },
      { label: 'Backend Development', href: '/services?service=backend-development' },
      { label: 'AI Chatbots & Agents', href: '/services?service=ai-chatbots' },
      { label: 'AI Web Agents', href: '/services?service=ai-web-agents' },
      { label: 'Mobile Development', href: '/services?service=mobile-development' },
      { label: 'Branding & Design', href: '/services?service=branding-design' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Get Quote', href: '/quote' },
      { label: 'Project Hub', href: '/client' },
    ],
    resources: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Support', href: '/support' },
      { label: 'FAQ', href: '/faq' },
    ],
  }

  const socialLinks = [
    { icon: Github, href: 'http://github.com/danleejames23', label: 'GitHub' },
  ]

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <Code className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">Lumora Pro</span>
            </Link>
            <p className="text-primary-foreground/80 leading-relaxed max-w-md">
              Full-stack developer and designer creating modern, scalable solutions 
              that drive business growth. From concept to deployment.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <Phone className="w-4 h-4" />
                <span>+447 359 792 577 (WhatsApp)</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <MapPin className="w-4 h-4" />
                <span>Remote Worldwide</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
          <p className="text-primary-foreground/80 text-sm">
            © {currentYear} Lumora Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
