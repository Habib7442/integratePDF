'use client'

import { SignUp } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Sparkles, Target, Rocket, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex">
      {/* Left Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Logo & Back Link */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">IntegratePDF</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Start your PDF automation journey today
              </h1>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Join thousands of professionals who trust IntegratePDF to transform their document workflows.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              {[
                {
                  icon: Sparkles,
                  title: "Free to Start",
                  description: "Process up to 5 documents monthly at no cost"
                },
                {
                  icon: Target,
                  title: "99.9% Accuracy",
                  description: "AI-powered extraction with human-level precision"
                },
                {
                  icon: Rocket,
                  title: "Instant Setup",
                  description: "Start extracting data in under 2 minutes"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                    <p className="text-indigo-100 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* What's Included */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                What&apos;s included in your free account:
              </h3>
              <ul className="space-y-2 text-indigo-100 text-sm">
                {[
                  "5 PDF documents per month",
                  "AI-powered data extraction",
                  "Export to CSV format",
                  "Basic integrations",
                  "Email support"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 bg-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div>
              <p className="text-white text-sm mb-2">
                &quot;IntegratePDF saved us 20+ hours per week. The accuracy is incredible and setup was a breeze!&quot;
              </p>
              <div className="text-indigo-200 text-xs">
                <div className="font-medium">John Doe</div>
                <div>Operations Manager, TechCorp</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">IntegratePDF</span>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-600">Start your free trial today. No credit card required.</p>
          </div>

          {/* Clerk Sign Up Component */}
          <div>
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm normal-case",
                  card: "shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "border-slate-200 hover:bg-slate-50 text-slate-700",
                  formFieldInput:
                    "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500",
                  footerActionLink:
                    "text-indigo-600 hover:text-indigo-700"
                }
              }}
            />
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Free forever plan
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}