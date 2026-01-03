import Link from 'next/link'
import { 
  Code, 
  Palette, 
  Database, 
  Smartphone, 
  Globe, 
  Zap, 
  Award, 
  Users, 
  Clock, 
  ArrowRight,
  CheckCircle,
  Star,
  Calendar,
  MapPin,
  Mail,
  Sparkles,
  Bot,
  Shield,
  Rocket,
  Target,
  Heart,
  Lightbulb,
  TrendingUp
} from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="pt-16 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/20 mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>About Lumora Pro</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Hi, I&apos;m <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Daniel</span>
                <span className="block text-2xl md:text-3xl mt-2 text-slate-300">Solo-Led Digital Studio</span>
              </h1>

              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                I&apos;m a full-stack developer building websites, mobile apps, Shopify stores, and custom web applications. 
                With over 13 years of experience, I help small businesses and founders build digital products that actually convert. 
                No agency overhead, just direct communication and quality work.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: MapPin, text: 'London, UK' },
                  { icon: Calendar, text: '13+ Years' },
                  { icon: Star, text: '50+ Projects' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300 text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/quote"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                >
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50"
                >
                  Get In Touch
                </Link>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-800/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Track Record
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '50+', label: 'Projects Delivered', color: 'from-cyan-500 to-blue-600' },
                    { value: '100%', label: 'Client Satisfaction', color: 'from-green-500 to-emerald-600' },
                    { value: '13+', label: 'Years Experience', color: 'from-purple-500 to-pink-600' },
                    { value: '24/7', label: 'Support Available', color: 'from-orange-500 to-red-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                      <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-1`}>{stat.value}</div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What I Do Section */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              What I Do
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Expertise That Delivers Results</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              I specialize in creating digital solutions that help businesses grow and succeed online.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'Web Development', desc: 'Beautiful, responsive websites and web applications built with modern technologies.', color: 'from-cyan-500 to-blue-600' },
              { icon: Smartphone, title: 'Mobile Apps', desc: 'Native and cross-platform mobile applications for iOS and Android.', color: 'from-purple-500 to-pink-600' },
              { icon: Bot, title: 'AI Solutions', desc: 'Intelligent chatbots, automation, and AI-powered features for your business.', color: 'from-green-500 to-emerald-600' },
              { icon: Database, title: 'Backend & APIs', desc: 'Robust server-side solutions, databases, and API integrations.', color: 'from-orange-500 to-red-600' },
              { icon: Palette, title: 'UI/UX Design', desc: 'User-centered design that looks great and converts visitors into customers.', color: 'from-pink-500 to-rose-600' },
              { icon: Zap, title: 'E-Commerce', desc: 'Full-featured online stores with payment processing and inventory management.', color: 'from-yellow-500 to-orange-600' },
            ].map((item) => (
              <div key={item.title} className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* My Story Section */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              My Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The Story Behind Lumora Pro
            </h2>
          </div>

          <div className="space-y-6 text-slate-400 leading-relaxed">
            <p className="text-lg">
              My journey into web development started over <span className="text-cyan-400 font-semibold">13 years ago</span> when I built my first website 
              using HTML and CSS. What began as curiosity quickly turned into passion as I 
              discovered the power of creating digital experiences that solve real problems.
            </p>
            
            <p>
              Over the years, I&apos;ve evolved from building simple static websites to creating 
              complex web applications, intelligent AI solutions, and mobile apps using modern technologies like React, Next.js, 
              TypeScript, and cutting-edge AI frameworks.
            </p>
            
            <p>
              What drives me is the satisfaction of turning ideas into reality. Whether it&apos;s a 
              simple landing page that converts visitors into customers, a complex e-commerce 
              platform, or an AI chatbot that provides 24/7 support, I approach every project with the same level of dedication.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
              {[
                { value: '2012', label: 'Started Coding' },
                { value: '50+', label: 'Projects Completed' },
                { value: '100%', label: 'Client Satisfaction' },
                { value: '24/7', label: 'Support' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 border-t border-slate-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 mb-4">
              My Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What I Stand For</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              The principles that guide every project I take on
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: 'Fast Delivery', desc: 'Time is money. I deliver on schedule, every time.', color: 'from-cyan-500 to-blue-600' },
              { icon: Award, title: 'Quality First', desc: 'Clean, maintainable code built to last.', color: 'from-purple-500 to-pink-600' },
              { icon: Heart, title: 'Client Focus', desc: 'Your success is my success. Period.', color: 'from-red-500 to-pink-600' },
              { icon: Lightbulb, title: 'Innovation', desc: 'Always learning, always improving.', color: 'from-yellow-500 to-orange-600' },
            ].map((value) => (
              <div key={value.title} className="group text-center p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500">
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{value.title}</h3>
                <p className="text-slate-400 text-sm">{value.desc}</p>
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
            <span>Let&apos;s Work Together</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Let&apos;s bring your ideas to life. Get a free quote today and see how we can transform your digital presence.
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
              href="/contact"
              className="group inline-flex items-center justify-center px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50"
            >
              <Mail className="mr-2 h-4 w-4" />
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
