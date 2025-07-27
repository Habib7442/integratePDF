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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="text-center">
          {/* Animated badge */}
          <motion.div
            className="flex justify-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="hidden sm:inline">AI-Powered PDF Processing</span>
              <span className="sm:hidden">AI PDF Processing</span>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
            </Badge>
          </motion.div>

          {/* Premium headline with staggered animation */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 tracking-tight mb-6 sm:mb-8 leading-[1.1] px-2 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform PDFs into
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Structured Data
            </span>
          </motion.h1>

          {/* Enhanced subheadline */}
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12 leading-relaxed font-medium px-4 sm:px-0"
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
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 lg:gap-8 mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-0"
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
                className="flex items-center justify-center sm:justify-start bg-white/60 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-sm border border-white/20 w-full sm:w-auto"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color} mr-2 sm:mr-3 flex-shrink-0`} />
                <span className="text-slate-700 font-medium text-sm sm:text-base">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Premium CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <SignedOut>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-5 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[48px]"
                  asChild
                >
                  <Link href="#demo">
                    <span className="sm:hidden">Try Free</span>
                    <span className="hidden sm:inline">Try Free - No Signup Required</span>
                    <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
              </motion.div>
              <SignUpButton>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-5 h-auto border-2 border-slate-300 hover:border-slate-400 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 min-h-[48px]"
                  >
                    <span className="sm:hidden">Sign Up</span>
                    <span className="hidden sm:inline">Sign Up for More Features</span>
                    <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </motion.div>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-5 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[48px]"
                  asChild
                >
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-5 h-auto border-2 border-slate-300 hover:border-slate-400 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 min-h-[48px]"
                  asChild
                >
                  <Link href="#demo">
                    Try Free Demo
                    <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
              </motion.div>
            </SignedIn>
          </motion.div>

          {/* Authentic value proposition */}
          <motion.div
            className="text-center px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <p className="text-slate-500 mb-4 sm:mb-6 font-medium text-sm sm:text-base">Start processing your PDFs today - no credit card required</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 opacity-70">
              {/* Real value indicators */}
              {[
                { name: "Free to Start", icon: "✨" },
                { name: "No Setup Required", icon: "⚡" },
                { name: "Instant Results", icon: "🚀" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">{item.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 3 Simple Steps Section */}
        <motion.div
          className="mt-16 sm:mt-20 relative max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.2 }}
        >
          <div className="text-center mb-12 sm:mb-16 px-4 sm:px-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
              From PDF to data in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                {" "}3 simple steps
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto">
              Our streamlined workflow gets you from document upload to extracted data in seconds.
              Try the demo without signup, export requires account creation.
            </p>
          </div>

          {/* Light Grid Background */}
          <div className="relative bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-16 overflow-hidden mx-4 sm:mx-0">
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
            <div className="relative space-y-12 sm:space-y-16">
              {/* Step 1 */}
              <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg mr-3 sm:mr-4">
                      01
                    </div>
                    <div className="p-2 sm:p-3 rounded-xl bg-blue-50">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Upload Your PDF</h3>
                  <p className="text-base sm:text-lg text-slate-600 mb-4 sm:mb-6">
                    Simply drag and drop any PDF document - invoices, receipts, contracts, or reports.
                    Our system supports all PDF formats including scanned documents.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'Supports all PDF formats',
                      'OCR for scanned documents',
                      'Secure processing',
                      'No signup required for demo'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-xs sm:text-sm text-slate-600">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 max-w-lg w-full">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                        <div className="ml-3 sm:ml-4 text-xs sm:text-sm text-slate-500">Step 01</div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 lg:p-8 text-center">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 sm:p-6 lg:p-8 mb-3 sm:mb-4">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-400 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-slate-600 text-sm sm:text-base">Drop PDF here or click to upload</p>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500">Supported: PDF, scanned documents</div>
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
