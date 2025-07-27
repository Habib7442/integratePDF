import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SignUpButton } from '@clerk/nextjs'
import { ArrowRight, Play, FileText, Database, Zap } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered PDF Processing
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            Transform PDFs into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
              {" "}Structured Data
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Transform any PDF into structured data and push it directly to your favorite business tools like 
            <span className="font-semibold text-gray-900"> Notion, Airtable, and QuickBooks</span> with one click.
          </p>

          {/* Value proposition points */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-gray-600">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <span>Upload any PDF</span>
            </div>
            <div className="flex items-center">
              <Database className="w-5 h-5 text-green-600 mr-2" />
              <span>Extract structured data</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-orange-600 mr-2" />
              <span>Push to your tools instantly</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SignUpButton>
              <Button size="lg" className="text-lg px-8 py-4 h-auto">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignUpButton>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto" asChild>
              <Link href="#demo">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="text-sm text-gray-500">
            <p className="mb-4">Trusted by 500+ founders and small businesses</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {/* Placeholder for company logos */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <span className="text-xs">Startup A</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <span className="text-xs">Company B</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <span className="text-xs">Business C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero illustration/demo */}
        <div className="mt-16 relative">
          <div className="relative max-w-4xl mx-auto">
            {/* Main demo container */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-500">integratepdf.com</div>
                </div>
              </div>
              
              {/* Demo content */}
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  {/* Step 1: PDF Upload */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
                    <p className="text-sm text-gray-600">Drop your invoice, receipt, or contract</p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex justify-center">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>

                  {/* Step 2: AI Processing */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI Extracts Data</h3>
                    <p className="text-sm text-gray-600">Smart extraction with 95% accuracy</p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex justify-center">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>

                  {/* Step 3: Integration */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Database className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Push to Tools</h3>
                    <p className="text-sm text-gray-600">Notion, Airtable, QuickBooks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
