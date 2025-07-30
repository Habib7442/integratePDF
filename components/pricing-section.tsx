'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SignUpButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import {
  Check,
  Star,
  Zap,
  Crown,
  Building2,
  ArrowRight,
  DollarSign,
  Sparkles,
  Shield,
  Clock,
  Users,
  Rocket,
  X
} from 'lucide-react'

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out IntegratePDF",
    badge: null,
    features: [
      "5 PDFs per month",
      "AI data extraction",
      "Notion integration",
      "CSV export",
      "Email support"
    ],
    limitations: [
      "Limited to 5 documents",
      "Standard processing speed"
    ],
    cta: "Get Started Free",
    popular: false,
    icon: Zap,
    gradient: "from-slate-500 to-slate-600",
    bgGradient: "from-slate-50 to-slate-100",
    savings: null
  },
  {
    name: "Pro",
    price: "Coming Soon",
    period: "",
    description: "For regular users and small businesses",
    badge: "Coming Soon",
    features: [
      "Unlimited PDFs",
      "Advanced AI extraction",
      "All integrations (Notion, CSV)",
      "Priority support",
      "Custom field mapping",
      "Batch processing"
    ],
    limitations: [],
    cta: "Join Waitlist",
    popular: true,
    icon: Star,
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
    savings: null
  },
  {
    name: "Business",
    price: "Coming Soon",
    period: "",
    description: "For teams and high-volume processing",
    badge: "Coming Soon",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Advanced security",
      "Priority integrations",
      "Dedicated support",
      "Custom workflows"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    icon: Building2,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    savings: null
  }
]

const valueProps = [
  {
    icon: Shield,
    title: "Free to Start",
    description: "No credit card required"
  },
  {
    icon: Clock,
    title: "Setup in Minutes",
    description: "Start processing immediately"
  },
  {
    icon: Users,
    title: "Growing Community",
    description: "Join early adopters"
  },
  {
    icon: Rocket,
    title: "No Commitments",
    description: "Use as much or as little as you need"
  }
]

const faqs = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
  },
  {
    question: "What happens if I exceed my monthly limit?",
    answer: "We'll notify you when you're approaching your limit. You can upgrade or purchase additional documents."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee for all paid plans."
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-slate-950 relative overflow-hidden">
      {/* Minimal dark background with subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header - Simplified */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 mb-4 sm:mb-6">
            Simple Pricing
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            Start free with no signup required. Paid plans coming soon.
          </p>
        </div>

        {/* Pricing cards - Simplified for dark mode */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <div key={index} className="group relative">
                <Card className={`relative overflow-hidden border border-slate-700 transition-all duration-300 h-full ${
                  plan.popular ? 'bg-slate-800 ring-2 ring-blue-500' : 'bg-slate-800'
                }`}>
                  {/* Popular badge */}
                  {plan.badge && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-2 text-sm font-bold rounded-bl-2xl">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      {plan.badge}
                    </div>
                  )}

                  <CardHeader className="text-center pb-6 relative p-6">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 rounded-2xl bg-blue-600">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <CardTitle className="text-2xl font-bold text-slate-100 mb-2">
                      {plan.name}
                    </CardTitle>

                    <div className="mb-4">
                      <span className="text-5xl font-bold text-slate-100">{plan.price}</span>
                      <span className="text-slate-300 ml-2">/{plan.period}</span>
                    </div>

                    {plan.savings && (
                      <Badge className="bg-blue-600 text-white border-0 mb-4">
                        {plan.savings}
                      </Badge>
                    )}

                    <CardDescription className="text-slate-300 font-medium">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 relative p-6">
                    {/* Features */}
                    <div className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-slate-200 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Limitations for free plan */}
                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t border-slate-600">
                        <p className="text-sm text-slate-400 mb-3 font-medium">Limitations:</p>
                        <div className="space-y-2">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <div key={limitIndex} className="flex items-start">
                              <X className="w-4 h-4 text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-slate-400">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="pt-6">
                      {plan.name === "Free" ? (
                        <SignUpButton>
                          <Button className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white">
                            {plan.cta}
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </SignUpButton>
                      ) : plan.name === "Business" ? (
                        <Button
                          variant="outline"
                          className="w-full h-12 text-lg font-semibold border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-200"
                          asChild
                        >
                          <a href="mailto:sales@integratepdf.com">
                            {plan.cta}
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </a>
                        </Button>
                      ) : (
                        <SignUpButton>
                          <Button
                            variant="outline"
                            className="w-full h-12 text-lg font-semibold border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-200"
                          >
                            {plan.cta}
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </SignUpButton>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
