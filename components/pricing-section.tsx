import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SignUpButton } from '@clerk/nextjs'
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Building2,
  ArrowRight,
  DollarSign
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
      "Basic data extraction",
      "Notion integration",
      "Email support",
      "95% accuracy guarantee"
    ],
    limitations: [
      "Limited to 5 documents",
      "Basic templates only",
      "Standard processing speed"
    ],
    cta: "Get Started Free",
    popular: false,
    icon: Zap,
    color: "border-gray-200"
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Ideal for founders and small businesses",
    badge: "Most Popular",
    features: [
      "500 PDFs per month",
      "Advanced AI extraction",
      "All integrations (Notion, Airtable, QuickBooks)",
      "Priority support",
      "Custom field mapping",
      "Workflow intelligence",
      "Batch processing",
      "API access",
      "Advanced templates"
    ],
    limitations: [],
    cta: "Start Pro Trial",
    popular: true,
    icon: Star,
    color: "border-blue-500 ring-2 ring-blue-200"
  },
  {
    name: "Business",
    price: "$99",
    period: "per month",
    description: "For growing teams and high-volume processing",
    badge: "Best Value",
    features: [
      "2,500 PDFs per month",
      "Everything in Pro",
      "Team collaboration",
      "Advanced security features",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label options",
      "Advanced analytics"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    icon: Building2,
    color: "border-purple-500"
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
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <DollarSign className="w-4 h-4 mr-2" />
            Simple Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose the perfect plan for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
              {" "}your business
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our core features with no hidden fees.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card key={index} className={`relative overflow-hidden ${plan.color} ${plan.popular ? 'scale-105 shadow-2xl' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    {plan.badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-8 h-8 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  
                  <CardDescription className="mt-2 text-gray-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations for free plan */}
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                      <div className="space-y-1">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="text-xs text-gray-500">
                            • {limitation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-6">
                    {plan.name === "Business" ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                      >
                        <a href="mailto:sales@integratepdf.com">
                          {plan.cta}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </a>
                      </Button>
                    ) : (
                      <SignUpButton>
                        <Button 
                          className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          variant={plan.popular ? "default" : "outline"}
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </SignUpButton>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enterprise section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 lg:p-12 mb-16">
          <div className="text-center">
            <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need something custom?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              For enterprises with specific requirements, we offer custom solutions including dedicated infrastructure, 
              custom integrations, and white-label options.
            </p>
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:enterprise@integratepdf.com">
                Contact Enterprise Sales
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to transform your PDF workflow?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of founders who have eliminated manual data entry. Start your free trial today.
            </p>
            <SignUpButton>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </section>
  )
}
