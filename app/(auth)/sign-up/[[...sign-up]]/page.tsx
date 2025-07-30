'use client'

import { SignUp } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgb(59 130 246) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Back to Home Link - Top Left */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Centered Sign Up Form */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-100">IntegratePDF</span>
          </div>

          {/* Welcome Text */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Create your account</h2>
            <p className="text-slate-300">Start your free trial today. No credit card required.</p>
          </div>

          {/* Clerk Sign Up Component */}
          <div>
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm normal-case",
                  card: "shadow-none bg-slate-800 border-slate-700",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "border-slate-600 hover:bg-slate-700 text-slate-100 bg-slate-800",
                  formFieldInput:
                    "border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-800 text-slate-100",
                  formFieldLabel: "text-slate-300",
                  footerActionLink:
                    "text-indigo-400 hover:text-indigo-300",
                  footerActionText: "text-slate-300",
                  dividerLine: "bg-slate-600",
                  dividerText: "text-slate-400",
                  socialButtonsProviderIcon: "brightness-0 invert",
                  formFieldInputShowPasswordButton: "text-slate-400 hover:text-slate-200",
                  identityPreviewText: "text-slate-300",
                  identityPreviewEditButton: "text-indigo-400 hover:text-indigo-300"
                }
              }}
            />
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-slate-300">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="pt-6 border-t border-slate-700">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Free forever plan
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                No credit card
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Cancel anytime
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}