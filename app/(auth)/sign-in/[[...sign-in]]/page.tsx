'use client'

import { SignIn } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
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

      {/* Centered Sign In Form */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-100">IntegratePDF</span>
          </div>

          {/* Welcome Text */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Sign in to your account</h2>
            <p className="text-slate-300">Welcome back! Please enter your details.</p>
          </div>

          {/* Clerk Sign In Component */}
          <div>
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm normal-case",
                  card: "shadow-none bg-slate-800 border-slate-700",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "border-slate-600 hover:bg-slate-700 text-slate-100 bg-slate-800",
                  formFieldInput:
                    "border-slate-600 focus:border-blue-500 focus:ring-blue-500 bg-slate-800 text-slate-100",
                  formFieldLabel: "text-slate-300",
                  footerActionLink:
                    "text-blue-400 hover:text-blue-300",
                  footerActionText: "text-slate-300",
                  dividerLine: "bg-slate-600",
                  dividerText: "text-slate-400",
                  socialButtonsProviderIcon: "brightness-0 invert",
                  formFieldInputShowPasswordButton: "text-slate-400 hover:text-slate-200",
                  identityPreviewText: "text-slate-300",
                  identityPreviewEditButton: "text-blue-400 hover:text-blue-300"
                }
              }}
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-300">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}