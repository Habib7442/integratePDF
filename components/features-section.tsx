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
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-slate-950 relative overflow-hidden">
      {/* Minimal dark background with subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header - Simplified */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 mb-4 sm:mb-6">
            Key Features
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            AI-powered PDF processing that extracts data instantly.
          </p>
        </div>

        {/* Features grid - Simplified for dark mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {features.slice(0, 3).map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="group">
                <Card className="bg-slate-800 border border-slate-700 h-full p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-blue-600 mr-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-100 mb-3">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-300 leading-relaxed text-sm">
                    {feature.description}
                  </CardDescription>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
