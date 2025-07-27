import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Brain, 
  Zap, 
  Shield, 
  Clock, 
  Target,
  Database,
  Workflow,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: "Smart PDF Processing",
    description: "Upload any PDF document - invoices, receipts, contracts, reports. Our AI handles all formats including scanned documents with advanced OCR.",
    badge: "AI-Powered",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: Brain,
    title: "Intelligent Data Extraction",
    description: "Advanced AI extracts structured data with 95% accuracy. Automatically identifies key fields like amounts, dates, names, and addresses.",
    badge: "95% Accuracy",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    icon: Zap,
    title: "One-Click Integrations",
    description: "Push extracted data directly to Notion databases, Airtable bases, and QuickBooks with a single click. No manual data entry required.",
    badge: "Instant",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    icon: Workflow,
    title: "Workflow Intelligence",
    description: "Our system learns from your corrections and preferences, automatically improving accuracy and suggesting field mappings for similar documents.",
    badge: "Learning AI",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, SOC 2 compliance, and GDPR compliance ensure your sensitive business documents are always protected.",
    badge: "SOC 2",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    icon: Clock,
    title: "Save Hours Daily",
    description: "Eliminate manual data entry that takes hours. Process documents in seconds and focus on growing your business instead of paperwork.",
    badge: "10x Faster",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  }
]

const integrations = [
  { name: "Notion", logo: "🗂️", description: "Create database entries automatically" },
  { name: "Airtable", logo: "📊", description: "Populate bases with structured data" },
  { name: "QuickBooks", logo: "💰", description: "Import financial data seamlessly" },
  { name: "More Coming", logo: "🚀", description: "Slack, Zapier, and 50+ more" }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Target className="w-4 h-4 mr-2" />
            Core Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
              {" "}automate PDF workflows
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built specifically for busy founders and small business owners who want to eliminate manual data entry and streamline their operations.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Integrations showcase */}
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with the tools you already use. More integrations added every month based on user requests.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{integration.logo}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{integration.name}</h4>
                <p className="text-sm text-gray-600">{integration.description}</p>
                {index < 3 && (
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                  </div>
                )}
                {index === 3 && (
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
