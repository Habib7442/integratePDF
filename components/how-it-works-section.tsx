import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SignUpButton } from '@clerk/nextjs'
import { 
  Upload, 
  Brain, 
  Send, 
  ArrowRight, 
  FileText, 
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your PDF",
    description: "Simply drag and drop any PDF document - invoices, receipts, contracts, or reports. Our system supports all PDF formats including scanned documents.",
    details: [
      "Supports all PDF formats",
      "Advanced OCR for scanned docs",
      "Secure encrypted upload",
      "Batch processing available"
    ],
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    number: "02", 
    icon: Brain,
    title: "AI Extracts Data",
    description: "Our advanced AI analyzes your document and intelligently extracts structured data with 95% accuracy. Review and edit if needed before proceeding.",
    details: [
      "95% extraction accuracy",
      "Identifies key data fields",
      "Manual review & correction",
      "Learns from your preferences"
    ],
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    number: "03",
    icon: Send,
    title: "Push to Your Tools",
    description: "With one click, send the structured data directly to Notion, Airtable, QuickBooks, or any of your connected business tools. No manual entry required.",
    details: [
      "One-click integration",
      "Real-time data sync",
      "Custom field mapping",
      "Automatic error handling"
    ],
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Simple Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            From PDF to data in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
              {" "}3 simple steps
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined workflow gets you from document upload to integrated data in under 60 seconds. 
            No technical knowledge required.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isEven = index % 2 === 1
            
            return (
              <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-xl mr-4`}>
                      {step.number}
                    </div>
                    <div className={`p-3 rounded-xl ${step.bgColor}`}>
                      <Icon className={`w-8 h-8 ${step.iconColor}`} />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  {index === steps.length - 1 && (
                    <SignUpButton>
                      <Button size="lg" className="text-lg px-8 py-4 h-auto">
                        Start Processing PDFs
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </SignUpButton>
                  )}
                </div>

                {/* Visual */}
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    {/* Main card */}
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div className="ml-4 text-sm text-gray-500">Step {step.number}</div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-8">
                        {index === 0 && (
                          <div className="text-center">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">Drop PDF here or click to upload</p>
                            </div>
                            <div className="text-sm text-gray-500">Supported: PDF, scanned documents</div>
                          </div>
                        )}
                        
                        {index === 1 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium">Invoice Number</span>
                              <span className="text-sm text-gray-600">INV-2024-001</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium">Total Amount</span>
                              <span className="text-sm text-gray-600">$1,250.00</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium">Due Date</span>
                              <span className="text-sm text-gray-600">2024-02-15</span>
                            </div>
                            <div className="flex items-center justify-center pt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Brain className="w-3 h-3 mr-1" />
                                95% Confidence
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        {index === 2 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-white rounded mr-3 flex items-center justify-center">
                                  🗂️
                                </div>
                                <span className="text-sm font-medium">Notion Database</span>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-center pt-4">
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Synced in 2.3s
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Floating elements */}
                    <div className={`absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r ${step.color} rounded-full opacity-20 animate-pulse`}></div>
                    <div className={`absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r ${step.color} rounded-full opacity-20 animate-pulse delay-1000`}></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to automate your PDF workflow?
            </h3>
            <p className="text-gray-600 mb-6">
              Join 500+ founders who have eliminated manual data entry from their business operations.
            </p>
            <SignUpButton>
              <Button size="lg" className="text-lg px-8 py-4 h-auto">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </section>
  )
}
