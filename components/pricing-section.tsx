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
    <section id="pricing" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.1),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Simple Pricing
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Choose the perfect plan for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              your business
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Start free with no signup required. Paid plans coming soon with advanced features.
          </p>
        </motion.div>

        {/* Value propositions */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {valueProps.map((prop, index) => {
            const Icon = prop.icon
            return (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{prop.title}</h3>
                <p className="text-sm text-slate-600">{prop.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          className="grid lg:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: plan.popular ? 0 : -8 }}
              >
                <Card className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full ${
                  plan.popular ? 'scale-105 ring-2 ring-blue-200' : ''
                }`}>
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-50`} />

                  {/* Popular badge */}
                  {plan.badge && (
                    <div className={`absolute top-0 right-0 bg-gradient-to-r ${plan.gradient} text-white px-4 py-2 text-sm font-bold rounded-bl-2xl shadow-lg`}>
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      {plan.badge}
                    </div>
                  )}

                  <CardHeader className="text-center pb-6 relative">
                    <div className="flex justify-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </CardTitle>

                    <div className="mb-4">
                      <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-600 ml-2">/{plan.period}</span>
                    </div>

                    {plan.savings && (
                      <Badge className={`bg-gradient-to-r ${plan.gradient} text-white border-0 mb-4`}>
                        {plan.savings}
                      </Badge>
                    )}

                    <CardDescription className="text-slate-600 font-medium">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 relative">
                    {/* Features */}
                    <div className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mr-3 mt-0.5 flex-shrink-0`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-slate-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Limitations for free plan */}
                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500 mb-3 font-medium">Limitations:</p>
                        <div className="space-y-2">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <div key={limitIndex} className="flex items-start">
                              <X className="w-4 h-4 text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-slate-500">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="pt-6">
                      {plan.name === "Free" ? (
                        <SignUpButton>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                              {plan.cta}
                              <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                          </motion.div>
                        </SignUpButton>
                      ) : plan.name === "Business" ? (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="w-full h-12 text-lg font-semibold border-2 border-slate-300 hover:border-slate-400"
                            asChild
                          >
                            <a href="mailto:sales@integratepdf.com">
                              {plan.cta}
                              <ArrowRight className="ml-2 w-5 h-5" />
                            </a>
                          </Button>
                        </motion.div>
                      ) : (
                        <SignUpButton>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              variant="outline"
                              className="w-full h-12 text-lg font-semibold border-2 border-slate-300 hover:border-slate-400"
                            >
                              {plan.cta}
                              <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                          </motion.div>
                        </SignUpButton>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Enterprise section */}
        <motion.div
          className="relative mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.1),transparent_50%)]" />

            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6">
                Need something custom?
              </h3>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                For enterprises with specific requirements, we offer custom solutions including dedicated infrastructure,
                custom integrations, and white-label options.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 px-8" asChild>
                  <a href="mailto:enterprise@integratepdf.com">
                    Contact Enterprise Sales
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          className="max-w-4xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-slate-600">Everything you need to know about our pricing and plans</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <h4 className="font-bold text-slate-900 mb-3">{faq.question}</h4>
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_50%)]" />

            <div className="relative">
              <h3 className="text-3xl font-bold mb-6">
                Ready to transform your PDF workflow?
              </h3>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                Join early adopters who are transforming their PDF workflows. Try the demo now, no signup required.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="secondary" className="text-lg px-10 py-4 h-auto bg-white text-slate-900 hover:bg-slate-100 shadow-xl" asChild>
                  <a href="#demo">
                    Try Free Demo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
