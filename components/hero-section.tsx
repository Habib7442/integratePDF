'use client'

import { Button } from '@/components/ui/button'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { ArrowRight, FileText, Upload } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-slate-950">
      {/* Minimal dark background with subtle grid */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        {/* Simple, direct headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-100 tracking-tight mb-6 leading-tight">
          Extract data from PDFs
          <br />
          <span className="text-blue-400">instantly</span>
        </h1>

        {/* Clear, concise description */}
        <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload any PDF and get structured data in seconds. No setup required.
        </p>

        {/* Simple, direct CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <SignedOut>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link
                href="#demo"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Try Free Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <SignUpButton>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100 px-8 py-4 text-lg font-semibold"
              >
                Get Started Free
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </SignedIn>
        </div>

        {/* Simple feature list */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-slate-200 font-semibold mb-2">Upload PDF</h3>
            <p className="text-slate-400 text-sm">Drag and drop any PDF file</p>
          </div>
          <div className="text-center">
            <FileText className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-slate-200 font-semibold mb-2">AI Extraction</h3>
            <p className="text-slate-400 text-sm">Get structured data instantly</p>
          </div>
          <div className="text-center">
            <ArrowRight className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-slate-200 font-semibold mb-2">Export Data</h3>
            <p className="text-slate-400 text-sm">CSV, Notion, and more</p>
          </div>
        </div>
      </div>
    </section>
  )
}
