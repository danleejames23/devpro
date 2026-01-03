import Link from 'next/link'
import { services } from '@/data/services'
import { Check, ArrowRight, Clock, Shield, Users, Award, Target, Globe, Paintbrush, Code, Server, Bot, Smartphone, Palette, Brain, Zap, Sparkles, Star, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 lg:pt-20 lg:pb-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/20 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Web Development & AI Solutions</span>
              <span className="px-2 py-0.5 bg-cyan-500/20 rounded-full text-xs">New</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Professional Web Development
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient bg-[length:200%_auto]">
                Built for Results
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              From landing pages to custom AI applications. Fixed pricing, fast delivery, 
              and quality guaranteed on every project.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/quote"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
              >
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/services"
                className="group inline-flex items-center justify-center px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50 backdrop-blur-sm"
              >
                View Services
                <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Trust Indicators with Icons */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {[
                { icon: Shield, text: 'Fixed Pricing' },
                { icon: Zap, text: 'Fast Delivery' },
                { icon: Star, text: 'Free Revisions' },
                { icon: Users, text: 'Ongoing Support' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <item.icon className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What I Build Section - Enhanced Cards */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">What I Build</h2>
            <p className="text-slate-400">Transforming ideas into digital reality</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Websites', icon: Globe, desc: 'From £149', color: 'from-cyan-500 to-blue-600' },
              { label: 'Web Apps', icon: Code, desc: 'From £999', color: 'from-purple-500 to-pink-600' },
              { label: 'E-Commerce', icon: Zap, desc: 'From £549', color: 'from-orange-500 to-red-600' },
              { label: 'AI Solutions', icon: Bot, desc: 'From £299', color: 'from-green-500 to-emerald-600' },
            ].map((item, index) => (
              <div
                key={item.label}
                className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="relative text-white font-semibold text-lg mb-1">{item.label}</div>
                <div className="relative text-cyan-400 font-medium">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Popular Services
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Quality web development with transparent pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, index) => (
              <div
                key={service.id}
                className="group h-full bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                    {service.icon === 'Target' && <Target className="w-6 h-6" />}
                    {service.icon === 'Globe' && <Globe className="w-6 h-6" />}
                    {service.icon === 'Paintbrush' && <Paintbrush className="w-6 h-6" />}
                    {service.icon === 'Code' && <Code className="w-6 h-6" />}
                    {service.icon === 'Server' && <Server className="w-6 h-6" />}
                    {service.icon === 'Bot' && <Bot className="w-6 h-6" />}
                    {service.icon === 'Smartphone' && <Smartphone className="w-6 h-6" />}
                    {service.icon === 'Palette' && <Palette className="w-6 h-6" />}
                    {service.icon === 'ShoppingCart' && <Zap className="w-6 h-6" />}
                    {service.icon === 'Zap' && <Zap className="w-6 h-6" />}
                    {service.icon === 'Brain' && <Brain className="w-6 h-6" />}
                  </div>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                    <Clock className="w-3 h-3 mr-1.5 text-cyan-400" />
                    {service.timeline}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
                <p className="text-sm text-slate-400 mb-5 line-clamp-2">{service.description}</p>

                <div className="flex items-baseline mb-5 pb-5 border-b border-slate-700/50">
                  <span className="text-3xl font-bold text-white">£{service.startingPrice.toLocaleString()}</span>
                  <span className="text-slate-500 text-sm ml-2">starting</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {service.features.slice(0, 3).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-cyan-400" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href={`/quote?service=${service.id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-slate-700/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 border border-slate-600/50 hover:border-transparent group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                >
                  Get Quote
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/services"
              className="group inline-flex items-center justify-center px-8 py-3 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50"
            >
              View All Services
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              Why Choose Me
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Work With Me
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Professional development with a focus on results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Fixed Pricing',
                description: 'No hidden costs. Clear quotes upfront.',
                color: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Zap,
                title: 'Fast Delivery',
                description: 'Most projects delivered in days, not weeks.',
                color: 'from-yellow-500 to-orange-600'
              },
              {
                icon: Award,
                title: 'Quality Code',
                description: 'Clean, modern, and well-documented.',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: Users,
                title: 'Ongoing Support',
                description: 'Help when you need it, included free.',
                color: 'from-green-500 to-emerald-600'
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group text-center p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Let&apos;s Build Something Amazing</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Get a free quote today. No commitment required. Let&apos;s turn your vision into reality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="group inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
            >
              Get Free Quote
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/contact"
              className="group inline-flex items-center justify-center px-10 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50 backdrop-blur-sm"
            >
              Contact Me
              <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-slate-800/50">
            {[
              { value: '50+', label: 'Projects Delivered' },
              { value: '100%', label: 'Client Satisfaction' },
              { value: '24/7', label: 'Support Available' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
