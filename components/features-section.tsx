'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  FileText,
  Brain,
  Zap,
  Shield,
  Clock,
  Target,
  Database,
  Workflow,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: "Smart PDF Processing",
    description: "Upload any PDF document - invoices, receipts, contracts, reports. Our AI handles all formats including scanned documents with OCR.",
    badge: "AI-Powered",
    gradient: "from-blue-500 to-cyan-500",
    stats: "All PDF formats",
    benefit: "Process any document format"
  },
  {
    icon: Brain,
    title: "Intelligent Data Extraction",
    description: "Advanced AI extracts structured data automatically. Identifies key fields like amounts, dates, names, and addresses from your documents.",
    badge: "Smart AI",
    gradient: "from-emerald-500 to-teal-500",
    stats: "Multiple field types",
    benefit: "Automated extraction"
  },
  {
    icon: Zap,
    title: "Notion Integration",
    description: "Push extracted data directly to Notion databases with custom field mapping. CSV export also available for maximum flexibility.",
    badge: "Available Now",
    gradient: "from-orange-500 to-red-500",
    stats: "Instant export",
    benefit: "Zero manual work"
  },
  {
    icon: Clock,
    title: "Save Time Daily",
    description: "Eliminate manual data entry that takes hours. Process documents in seconds and focus on growing your business instead of paperwork.",
    badge: "Time Saver",
    gradient: "from-indigo-500 to-blue-500",
    stats: "Seconds not hours",
    benefit: "Focus on growth"
  }
]

const stats = [
  { number: "PDF", label: "Processing", icon: FileText },
  { number: "AI", label: "Extraction", icon: Brain },
  { number: "Notion", label: "Integration", icon: Database },
  { number: "CSV", label: "Export", icon: BarChart3 }
]

const integrations = [
  {
    name: "Notion",
    logo: "🗂️",
    description: "Create database entries automatically",
    status: "available",
    gradient: "from-gray-900 to-gray-700"
  },
  {
    name: "CSV Export",
    logo: "📊",
    description: "Download structured data instantly",
    status: "available",
    gradient: "from-green-600 to-emerald-600"
  },
  {
    name: "Airtable",
    logo: "🔷",
    description: "Populate bases with structured data",
    status: "coming-soon",
    gradient: "from-blue-600 to-indigo-600"
  },
  {
    name: "QuickBooks",
    logo: "💰",
    description: "Import financial data seamlessly",
    status: "coming-soon",
    gradient: "from-yellow-500 to-orange-500"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.1),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.number}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

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
            Core Features
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Everything you need to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              automate PDF workflows
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Built specifically for busy founders and small business owners who want to eliminate manual data entry and streamline their operations.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm h-full">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                  <CardHeader className="pb-4 relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge className={`bg-gradient-to-r ${feature.gradient} text-white border-0`}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                      {feature.title}
                    </CardTitle>
                    <div className="text-sm text-slate-500 font-medium mb-4">
                      {feature.benefit}
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-slate-600 leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-slate-700 font-medium">{feature.stats}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Integrations showcase */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 shadow-xl">
            <div className="text-center mb-12">
              <Badge className="mb-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <Database className="w-4 h-4 mr-2" />
                Integrations
              </Badge>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Seamless Integrations
              </h3>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Connect with the tools you already use. More integrations added every month based on user requests.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {integrations.map((integration, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                >
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 h-full">
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${integration.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

                    <div className="relative">
                      <div className="text-4xl mb-4">{integration.logo}</div>
                      <h4 className="font-bold text-slate-900 mb-2 text-lg">{integration.name}</h4>
                      <p className="text-sm text-slate-600 mb-4">{integration.description}</p>

                      {integration.status === 'available' && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available Now
                        </Badge>
                      )}
                      {integration.status === 'coming-soon' && (
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to action */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-slate-600 mb-4">
                Need a specific integration?
                <span className="font-semibold text-slate-900"> We build based on user requests.</span>
              </p>
              <Badge variant="outline" className="px-4 py-2 border-blue-200 text-blue-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Request Integration
              </Badge>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
