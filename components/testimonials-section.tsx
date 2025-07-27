'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Star,
  Quote,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Award,
  Sparkles,
  CheckCircle,
  Building,
  Zap,
  FileText,
  Brain,
  Database,
  ArrowRight
} from 'lucide-react'

const valueProps = [
  {
    icon: FileText,
    title: "Real PDF Processing",
    description: "Upload any PDF and see actual AI extraction in action",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Brain,
    title: "Advanced AI",
    description: "Powered by Google's Gemini AI for accurate data extraction",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Database,
    title: "Notion Integration",
    description: "Push extracted data directly to your Notion databases",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Shield,
    title: "Secure Processing",
    description: "Your documents are processed securely and not stored",
    gradient: "from-purple-500 to-pink-500"
  }
]

const benefits = [
  {
    icon: Clock,
    title: "Save Time",
    description: "Eliminate manual data entry from your workflow",
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    icon: CheckCircle,
    title: "Try Free",
    description: "No signup required to test the demo",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "See extracted data in seconds, not hours",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Documents processed securely, not stored",
    gradient: "from-purple-500 to-pink-500"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(99,102,241,0.1),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Why Choose IntegratePDF
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Built for modern
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              businesses
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            IntegratePDF helps businesses eliminate manual data entry and focus on what matters most - growing their business.
          </p>
        </motion.div>

        {/* Value Propositions */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {valueProps.map((prop, index) => {
            const Icon = prop.icon
            return (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 text-center h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${prop.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{prop.title}</h3>
                  <p className="text-slate-600 text-sm">{prop.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                  <div className={`bg-gradient-to-br ${benefit.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="font-semibold text-slate-900 mb-2">{benefit.title}</div>
                  <div className="text-sm text-slate-600">{benefit.description}</div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Ready to eliminate manual data entry?
            </h3>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Try our live demo now - no signup required. Upload a real PDF and see the AI extraction in action.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="text-lg px-10 py-4 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl" asChild>
                <a href="#demo">
                  Try Live Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Technology showcase */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.1),transparent_50%)]" />

            <div className="relative">
              <Brain className="w-16 h-16 mx-auto mb-8 opacity-80" />
              <h3 className="text-2xl lg:text-3xl font-bold mb-6 leading-relaxed max-w-4xl mx-auto">
                Powered by Google's Gemini AI
              </h3>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                Our AI extraction is powered by Google's latest Gemini model, ensuring high accuracy and reliability for your document processing needs.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { name: "Google Gemini", icon: "🧠" },
                  { name: "Notion API", icon: "🗂️" },
                  { name: "Secure Processing", icon: "🔒" },
                  { name: "Real-time Results", icon: "⚡" }
                ].map((tech, index) => (
                  <div key={index} className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-lg mr-2">{tech.icon}</span>
                    <span className="text-sm font-medium">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
