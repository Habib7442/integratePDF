'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { ArrowRight, FileText, Database, Zap, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PDFFlowVisualization } from '@/components/3d/pdf-flow-visualization'
import { designSystem } from '@/lib/design-system'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Animated badge */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered PDF Processing
              <TrendingUp className="w-4 h-4 ml-2" />
            </Badge>
          </motion.div>

          {/* Premium headline with staggered animation */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform PDFs into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Structured Data
            </span>
          </motion.h1>

          {/* Enhanced subheadline */}
          <motion.p
            className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Extract structured data from any PDF and seamlessly integrate with your business tools.
            <br className="hidden sm:block" />
            <span className="text-slate-900 font-semibold">Notion, CSV exports, and more integrations coming soon.</span>
          </motion.p>

          {/* Premium value proposition points */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { icon: FileText, text: "Upload any PDF", color: "text-blue-600" },
              { icon: Database, text: "AI extracts data", color: "text-indigo-600" },
              { icon: Zap, text: "Push to your tools", color: "text-purple-600" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-white/20"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className={`w-5 h-5 ${item.color} mr-3`} />
                <span className="text-slate-700 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Premium CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <SignedOut>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-10 py-5 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                  asChild
                >
                  <Link href="#demo">
                    Try Free - No Signup Required
                    <ArrowRight className="ml-3 w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
              <SignUpButton>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-10 py-5 h-auto border-2 border-slate-300 hover:border-slate-400 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300"
                  >
                    Sign Up for More Features
                    <ArrowRight className="ml-3 w-5 h-5" />
                  </Button>
                </motion.div>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-10 py-5 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-3 w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-10 py-5 h-auto border-2 border-slate-300 hover:border-slate-400 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300"
                  asChild
                >
                  <Link href="#demo">
                    Try Free Demo
                    <ArrowRight className="ml-3 w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
            </SignedIn>
          </motion.div>

          {/* Authentic value proposition */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <p className="text-slate-500 mb-6 font-medium">Start processing your PDFs today - no credit card required</p>
            <div className="flex justify-center items-center space-x-8 opacity-70">
              {/* Real value indicators */}
              {[
                { name: "Free to Start", icon: "✨" },
                { name: "No Setup Required", icon: "⚡" },
                { name: "Instant Results", icon: "🚀" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-sm text-slate-600 font-medium">{item.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 3 Simple Steps Section */}
        <motion.div
          className="mt-20 relative max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.2 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              From PDF to data in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                {" "}3 simple steps
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our streamlined workflow gets you from document upload to extracted data in seconds.
              Try the demo without signup, export requires account creation.
            </p>
          </div>

          {/* Light Grid Background */}
          <div className="relative bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-3xl p-8 lg:p-16 overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            {/* Steps Content */}
            <div className="relative space-y-16">
              {/* Step 1 */}
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                      01
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Upload Your PDF</h3>
                  <p className="text-lg text-slate-600 mb-6">
                    Simply drag and drop any PDF document - invoices, receipts, contracts, or reports.
                    Our system supports all PDF formats including scanned documents.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Supports all PDF formats',
                      'OCR for scanned documents',
                      'Secure processing',
                      'No signup required for demo'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-slate-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 max-w-lg">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <div className="ml-4 text-sm text-slate-500">Step 01</div>
                      </div>
                    </div>
                    <div className="p-8 text-center">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 mb-4">
                        <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-slate-600">Drop PDF here or click to upload</p>
                      </div>
                      <div className="text-sm text-slate-500">Supported: PDF, scanned documents</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                      02
                    </div>
                    <div className="p-3 rounded-xl bg-green-50">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Extracts Data</h3>
                  <p className="text-lg text-slate-600 mb-6">
                    Our AI powered by Google Gemini analyzes your document and intelligently extracts structured data.
                    Review the results before proceeding.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Google Gemini AI',
                      'Identifies key data fields',
                      'Structured output',
                      'Real-time processing'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-slate-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 max-w-lg">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <div className="ml-4 text-sm text-slate-500">Step 02</div>
                      </div>
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">Field Name</span>
                        <span className="text-sm text-slate-600">Extracted Value</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">Amount</span>
                        <span className="text-sm text-slate-600">$XXX.XX</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">Date</span>
                        <span className="text-sm text-slate-600">YYYY-MM-DD</span>
                      </div>
                      <div className="flex items-center justify-center pt-2">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          AI Processed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                      03
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Export Your Data</h3>
                  <p className="text-lg text-slate-600 mb-6">
                    Export the structured data to Notion databases or download as CSV.
                    Sign up required for export functionality.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Notion integration',
                      'CSV export',
                      'Custom field mapping',
                      'Signup required for export'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-slate-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 max-w-lg">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <div className="ml-4 text-sm text-slate-500">Step 03</div>
                      </div>
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-white rounded mr-3 flex items-center justify-center">
                            🗂️
                          </div>
                          <span className="text-sm font-medium">Notion Database</span>
                        </div>
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-center pt-4">
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Ready to Export
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
