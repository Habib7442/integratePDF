import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Quote, Users, TrendingUp, Clock } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder",
    company: "TechStart Inc.",
    avatar: "SC",
    content: "IntegratePDF has been a game-changer for our startup. We were spending 10+ hours a week manually entering invoice data into our accounting system. Now it takes minutes, and the accuracy is incredible.",
    rating: 5,
    metric: "Saved 10+ hours/week"
  },
  {
    name: "Marcus Rodriguez",
    role: "Operations Manager", 
    company: "GrowthCo",
    avatar: "MR",
    content: "The Notion integration is seamless. Our entire contract management workflow is now automated. The AI learns from our corrections and gets better every time we use it.",
    rating: 5,
    metric: "95% accuracy rate"
  },
  {
    name: "Emily Watson",
    role: "Small Business Owner",
    company: "Watson Consulting",
    avatar: "EW", 
    content: "As a solo entrepreneur, every minute counts. IntegratePDF eliminated the most tedious part of my admin work. The ROI was immediate - paid for itself in the first week.",
    rating: 5,
    metric: "ROI in 1 week"
  },
  {
    name: "David Kim",
    role: "Finance Director",
    company: "ScaleUp Ventures",
    avatar: "DK",
    content: "We process hundreds of invoices monthly. The QuickBooks integration is flawless, and the batch processing feature saves us days of work. Customer support is also excellent.",
    rating: 5,
    metric: "Processes 500+ docs/month"
  },
  {
    name: "Lisa Thompson",
    role: "CEO",
    company: "InnovateLab",
    avatar: "LT",
    content: "The workflow intelligence feature is brilliant. It learned our document patterns within a week and now pre-fills everything correctly. It's like having an AI assistant that knows our business.",
    rating: 5,
    metric: "99% automation rate"
  },
  {
    name: "James Park",
    role: "Startup Founder",
    company: "NextGen Solutions",
    avatar: "JP",
    content: "Security was our biggest concern, but IntegratePDF's SOC 2 compliance and encryption gave us confidence. Now we can focus on building our product instead of data entry.",
    rating: 5,
    metric: "SOC 2 compliant"
  }
]

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Happy Customers",
    description: "Founders and businesses trust us"
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Accuracy Rate",
    description: "AI-powered data extraction"
  },
  {
    icon: Clock,
    value: "10hrs",
    label: "Saved Weekly",
    description: "Average time savings per user"
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Customer Rating",
    description: "Based on 200+ reviews"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Users className="w-4 h-4 mr-2" />
            Customer Stories
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Loved by founders and
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
              {" "}small businesses
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how IntegratePDF is helping businesses eliminate manual data entry and focus on what matters most - growing their business.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Quote icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-blue-600 opacity-20" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Metric badge */}
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {testimonial.metric}
                  </Badge>
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-gray-600 text-xs">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured testimonial */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-2xl p-8 lg:p-12 text-white text-center">
          <Quote className="w-12 h-12 mx-auto mb-6 opacity-20" />
          <blockquote className="text-2xl lg:text-3xl font-medium mb-6 leading-relaxed">
            "IntegratePDF transformed our entire document workflow. What used to take our team hours now happens automatically. 
            It's not just a tool - it's like having an AI employee that never makes mistakes."
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold mr-4">
              AJ
            </div>
            <div className="text-left">
              <div className="font-semibold">Alex Johnson</div>
              <div className="text-blue-100">CEO, TechFlow Dynamics</div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">Trusted by companies of all sizes</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {/* Placeholder company logos */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-500">TechStart Inc.</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-500">GrowthCo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-500">InnovateLab</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-500">ScaleUp Ventures</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-500">NextGen Solutions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
