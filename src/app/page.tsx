import Link from 'next/link'
import Image from 'next/image'
import { Check, ArrowRight, Clock, Shield, Users, Award, Target, Globe, Paintbrush, Code, Server, Bot, Smartphone, Palette, Brain, Zap, Sparkles, Star, TrendingUp, MessageSquare, FileText, CreditCard, BarChart3, Layers, Monitor, ShoppingCart, Database, Cpu, Layout, PenTool, Rocket, CheckCircle, Play } from 'lucide-react'

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/20 mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Solo-Led Digital Studio</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Fast, Conversion-Focused
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                Websites & Shopify Stores
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              I build websites and Shopify stores that actually convert. Fixed pricing, 
              fast delivery, and direct communication with me throughout your project. 
              No agency fluff—just real results for your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link 
                href="/quote"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
              >
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/portfolio"
                className="group inline-flex items-center justify-center px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50 backdrop-blur-sm"
              >
                View Work
                <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10">
              {[
                { value: '50+', label: 'Projects Delivered' },
                { value: '100%', label: 'Client Satisfaction' },
                { value: '13+', label: 'Years Experience' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Shield, text: 'Fixed Pricing' },
                { icon: Zap, text: 'Fast Delivery' },
                { icon: Star, text: 'Free Revisions' },
                { icon: Users, text: 'Direct Communication' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <item.icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300 text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shopify Services Section */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 mb-4">
              Shopify Specialist
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Shopify Services</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Fixed pricing, fast turnaround, and builds focused on what matters—getting you more sales. 
              No Shopify Plus complexity, just practical solutions for growing stores.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Shopify Store Setup */}
            <div className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Shopify Store Setup</h3>
              <p className="text-sm text-slate-400 mb-4">Complete store setup for new Shopify merchants. Get selling fast with a professional, mobile-optimised store.</p>
              <div className="space-y-2 mb-4">
                {['Theme setup & configuration', 'Homepage + essential pages', 'Payments & shipping setup', 'Mobile optimisation'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <span className="text-green-400 font-semibold">£299–£799</span>
                <Link href="/custom-quote" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                  Get Quote <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Shopify Theme Customisation */}
            <div className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Theme Customisation</h3>
              <p className="text-sm text-slate-400 mb-4">Make your existing Shopify theme match your brand perfectly. Layout tweaks, styling, and UX improvements.</p>
              <div className="space-y-2 mb-4">
                {['Edit existing themes', 'Layout & section changes', 'Branding & styling tweaks', 'Speed & UX improvements'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <span className="text-green-400 font-semibold">From £149</span>
                <Link href="/custom-quote" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                  Get Quote <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Shopify Conversion Optimisation */}
            <div className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Conversion Optimisation</h3>
              <p className="text-sm text-slate-400 mb-4">Turn more visitors into buyers. Product page improvements, cart UX, and trust-building elements.</p>
              <div className="space-y-2 mb-4">
                {['Product page improvements', 'Cart & checkout UX tweaks', 'Trust & conversion elements', 'Mobile-first optimisation'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <span className="text-green-400 font-semibold">From £249</span>
                <Link href="/custom-quote" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                  Get Quote <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              Full-Stack Development
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Beyond Shopify</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Need something custom? I also build websites, web apps, and integrate AI solutions for businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Globe, 
                title: 'Websites & Landing Pages', 
                desc: 'Beautiful, responsive websites that convert visitors into customers. From simple landing pages to complex multi-page sites.',
                features: ['Responsive Design', 'SEO Optimized', 'Fast Loading'],
                price: 'From £149',
                color: 'from-cyan-500 to-blue-600'
              },
              { 
                icon: Bot, 
                title: 'AI & Automation', 
                desc: 'Intelligent chatbots, AI assistants, and workflow automation to streamline your business.',
                features: ['Custom Chatbots', 'Process Automation', 'Data Analysis'],
                price: 'From £299',
                color: 'from-blue-500 to-indigo-600'
              },
              { 
                icon: Code, 
                title: 'Custom Web Apps', 
                desc: 'Bespoke web applications built to solve your unique business challenges.',
                features: ['Custom Features', 'Database Design', 'API Development'],
                price: 'From £999',
                color: 'from-pink-500 to-rose-600'
              },
            ].map((service) => (
              <div
                key={service.title}
                className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{service.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.map((f) => (
                    <span key={f} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg">{f}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <span className="text-cyan-400 font-semibold">{service.price}</span>
                  <Link href="/custom-quote" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                    Get Quote <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Hub Section - Manage Your Project */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
                Your Project Hub
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Manage Your Entire Project
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  From One Dashboard
                </span>
              </h2>
              <p className="text-slate-400 mb-6">
                No more endless email chains or confusing spreadsheets. Your dedicated project hub 
                gives you complete visibility and control over your project from start to finish.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  { icon: FileText, title: 'Track Quotes & Invoices', desc: 'View all your quotes, accept proposals, and manage payments in one place.' },
                  { icon: BarChart3, title: 'Real-Time Progress', desc: 'See exactly where your project stands with live progress updates.' },
                  { icon: MessageSquare, title: 'Live Developer Chat', desc: 'Chat directly with me in real-time. Get instant answers and updates.', highlight: true },
                  { icon: CreditCard, title: 'Secure Payments', desc: 'Pay invoices securely online with multiple payment options.' },
                ].map((feature) => (
                  <div key={feature.title} className={`flex gap-4 ${feature.highlight ? 'p-3 bg-green-500/5 border border-green-500/20 rounded-xl' : ''}`}>
                    <div className={`w-10 h-10 ${feature.highlight ? 'bg-green-500/20' : 'bg-purple-500/10'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`w-5 h-5 ${feature.highlight ? 'text-green-400' : 'text-purple-400'}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${feature.highlight ? 'text-green-400' : 'text-white'}`}>
                        {feature.title}
                        {feature.highlight && <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Live</span>}
                      </h4>
                      <p className="text-sm text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link 
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold rounded-xl border border-purple-500/30 transition-all"
              >
                Access Project Hub
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Portal Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-slate-500">client.lumorapro.com</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">E-Commerce Website</div>
                        <div className="text-xs text-slate-400">Quote #QT-2024-042</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Approved</span>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Project Progress</span>
                      <span className="text-cyan-400 font-medium">75%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">£2,499</div>
                      <div className="text-xs text-slate-400">Project Value</div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="text-xs text-slate-400">Days Left</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From idea to launch in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: MessageSquare, title: 'Discuss', desc: 'Tell me about your project and goals', color: 'from-cyan-500 to-blue-600' },
              { step: '02', icon: FileText, title: 'Quote', desc: 'Get a detailed quote with fixed pricing', color: 'from-purple-500 to-pink-600' },
              { step: '03', icon: Code, title: 'Build', desc: 'I build while you track progress live', color: 'from-orange-500 to-red-600' },
              { step: '04', icon: Rocket, title: 'Launch', desc: 'Go live with ongoing support included', color: 'from-green-500 to-emerald-600' },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-slate-700 to-transparent" />
                )}
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs text-cyan-400 font-bold mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Me */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 mb-4">
              Why Work With Me
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Lumora Difference</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Direct access to a senior developer. No account managers, no middlemen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Fixed Pricing', desc: 'Know exactly what you\'ll pay. No surprises, no hidden fees.', color: 'from-cyan-500 to-blue-600' },
              { icon: Zap, title: 'Fast Delivery', desc: 'Most projects delivered in 1-2 weeks, not months.', color: 'from-yellow-500 to-orange-600' },
              { icon: Award, title: 'Quality Code', desc: 'Clean, modern, scalable code built to last.', color: 'from-purple-500 to-pink-600' },
              { icon: Users, title: 'Ongoing Support', desc: 'Free support included. I\'m here when you need me.', color: 'from-green-500 to-emerald-600' },
            ].map((feature) => (
              <div key={feature.title} className="group text-center p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            <Rocket className="w-4 h-4" />
            <span>Ready to Launch?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Let&apos;s Build Something Amazing Together
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Whether you need a Shopify store, a landing page, or a custom web app, I&apos;ve got you covered. 
            Get a free quote today and let&apos;s bring your vision to life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
            >
              Get Free Quote
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/custom-quote"
              className="group inline-flex items-center justify-center px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50 backdrop-blur-sm"
            >
              Custom Project
              <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
