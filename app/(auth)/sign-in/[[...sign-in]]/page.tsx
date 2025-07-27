'use client'

import { SignIn } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Zap, Shield, Users } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
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
                Welcome back to the future of PDF processing
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Sign in to continue extracting structured data from your documents with AI-powered precision.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {[
                {
                  icon: Zap,
                  title: "Lightning Fast Processing",
                  description: "Extract data from PDFs in seconds, not hours"
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  description: "Your documents are encrypted and secure"
                },
                {
                  icon: Users,
                  title: "Team Collaboration",
                  description: "Share and manage documents with your team"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-blue-100 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 grid grid-cols-3 gap-8 pt-8 border-t border-white/20"
        >
          {[
            { number: "10K+", label: "Documents Processed" },
            { number: "99.9%", label: "Accuracy Rate" },
            { number: "500+", label: "Happy Customers" }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.number}</div>
              <div className="text-blue-100 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">IntegratePDF</span>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
            <p className="text-slate-600">Welcome back! Please enter your details.</p>
          </div>

          {/* Clerk Sign In Component */}
          <div>
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm normal-case",
                  card: "shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "border-slate-200 hover:bg-slate-50 text-slate-700",
                  formFieldInput:
                    "border-slate-200 focus:border-blue-500 focus:ring-blue-500",
                  footerActionLink:
                    "text-blue-600 hover:text-blue-700"
                }
              }}
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}