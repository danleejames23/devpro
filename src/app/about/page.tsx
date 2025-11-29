'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Phone
} from 'lucide-react'

export default function AboutPage() {
  const skills = [
    { name: 'React & Next.js', level: 95, icon: Code },
    { name: 'AI & Machine Learning', level: 90, icon: Zap },
    { name: 'TypeScript', level: 90, icon: Code },
    { name: 'Chatbots & AI Agents', level: 88, icon: Users },
    { name: 'Node.js & APIs', level: 88, icon: Database },
    { name: 'UI/UX Design', level: 85, icon: Palette },
    { name: 'Mobile Development', level: 80, icon: Smartphone },
    { name: 'E-commerce', level: 92, icon: Globe },
  ]

  const experience = [
    {
      year: '2024',
      title: 'Senior Full-Stack Developer & AI Specialist',
      company: 'Freelance',
      description: 'Specializing in modern web applications and AI solutions. Building chatbots, AI agents, and intelligent automation systems alongside traditional web development.',
      achievements: ['5+ successful projects', 'AI chatbots & agents', '100% client satisfaction', 'Average 4.9/5 rating']
    },
    {
      year: '2022-2024',
      title: 'Lead Frontend Developer',
      company: 'Tech Solutions Ltd',
      description: 'Led a team of 5 developers building enterprise web applications. Implemented modern development practices and CI/CD pipelines.',
      achievements: ['Team leadership', 'Enterprise applications', 'Modern dev practices']
    },
    {
      year: '2020-2022',
      title: 'Full-Stack Developer',
      company: 'Digital Agency',
      description: 'Developed custom websites and web applications for various clients. Specialized in e-commerce and content management systems.',
      achievements: ['Custom web solutions', 'E-commerce expertise', 'CMS development']
    },
    {
      year: '2018-2020',
      title: 'Junior Developer',
      company: 'StartUp Inc',
      description: 'Started my professional journey building responsive websites and learning modern web technologies.',
      achievements: ['Responsive design', 'Modern web tech', 'Rapid learning']
    }
  ]

  const values = [
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'I understand time is money. That\'s why I guarantee delivery within agreed timelines.'
    },
    {
      icon: Award,
      title: 'Quality First',
      description: 'Every project is built with clean, maintainable code and modern best practices.'
    },
    {
      icon: Users,
      title: 'Client Focus',
      description: 'Your success is my success. I work closely with clients to exceed expectations.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'I stay up-to-date with the latest technologies to deliver cutting-edge solutions.'
    }
  ]

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="text-foreground">Hi, I'm </span>
                  <span className="gradient-text">Daniel</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  A passionate full-stack developer and AI specialist with 6+ years of experience creating 
                  beautiful websites, intelligent AI solutions, and automated systems that help businesses grow.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  London, UK
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  6+ Years Experience
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  13+ Projects Delivered
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="group">
                  <Link href="/quote">
                    Start Your Project
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Get In Touch</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Quick Stats</CardTitle>
                  <CardDescription>What I've accomplished so far</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-secondary/20 rounded-lg">
                      <div className="text-3xl font-bold text-primary">13+</div>
                      <div className="text-sm text-muted-foreground">Projects Completed</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/20 rounded-lg">
                      <div className="text-3xl font-bold text-primary">100%</div>
                      <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/20 rounded-lg">
                      <div className="text-3xl font-bold text-primary">6+</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/20 rounded-lg">
                      <div className="text-3xl font-bold text-primary">4.9★</div>
                      <div className="text-sm text-muted-foreground">Average Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* My Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              My <span className="gradient-text">Story</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              From curious beginner to experienced professional
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none text-muted-foreground space-y-6"
          >
            <p>
              My journey into web development started 6 years ago when I built my first website 
              using HTML and CSS. What began as curiosity quickly turned into passion as I 
              discovered the power of creating digital experiences that solve real problems.
            </p>
            
            <p>
              Over the years, I've evolved from building simple static websites to creating 
              complex web applications and intelligent AI solutions using modern technologies like React, Next.js, 
              TypeScript, and cutting-edge AI frameworks. I've had the privilege of working with startups, 
              established businesses, and everything in between.
            </p>
            
            <p>
              What drives me is the satisfaction of turning ideas into reality. Whether it's a 
              simple landing page that converts visitors into customers, a complex e-commerce 
              platform that handles thousands of transactions, or an AI chatbot that provides 24/7 
              customer support, I approach every project with the same level of dedication and attention to detail.
            </p>
            
            <p>
              Today, I focus on delivering high-quality web solutions AND intelligent AI systems 
              with transparent pricing and guaranteed delivery times. My goal is to make both 
              professional web development and cutting-edge AI technology accessible to businesses of all sizes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              My <span className="gradient-text">Skills</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Technologies I use to bring your ideas to life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <skill.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">{skill.name}</h3>
                      </div>
                      <span className="text-sm font-medium text-primary">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              My <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              A journey of continuous learning and growth
            </p>
          </motion.div>

          <div className="space-y-8">
            {experience.map((exp, index) => (
              <motion.div
                key={exp.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl">{exp.title}</CardTitle>
                        <CardDescription className="text-base font-medium text-primary">
                          {exp.company}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {exp.year}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{exp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              My <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              What drives me in every project
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Ready to Work <span className="gradient-text">Together</span>?
            </h2>
            <p className="text-xl text-muted-foreground">
              Let's bring your ideas to life with professional web development that delivers results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="group">
                <Link href="/quote">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Get In Touch
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
