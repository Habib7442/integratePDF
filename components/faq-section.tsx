'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  Shield, 
  HelpCircle, 
  Lock, 
  Database, 
  Zap, 
  Users,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

const faqCategories = [
  {
    id: 'security',
    name: 'Security & Privacy',
    icon: Shield,
    color: 'from-red-500 to-rose-500',
    faqs: [
      {
        question: 'How secure is my data with IntegratePDF?',
        answer: 'Your documents are processed securely using industry-standard encryption. For the demo, documents are processed in memory and not stored. When you create an account, we follow strict data protection protocols and only retain data as needed for the service.'
      },
      {
        question: 'Do you store my PDF documents?',
        answer: 'For the demo, documents are processed in memory and not stored at all. When you create an account, documents are temporarily processed and then deleted. We only retain extracted data if you choose to save it to your integrations.'
      },
      {
        question: 'Is my data private?',
        answer: 'Yes, your data privacy is important to us. We process data only as necessary to provide our services. You have control over your data and can delete your account and associated data at any time.'
      },
      {
        question: 'Can I use IntegratePDF for business documents?',
        answer: 'Yes, IntegratePDF is designed for business use. We handle invoices, receipts, contracts, and other business documents. Our secure processing makes it suitable for professional document workflows.'
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations & Features',
    icon: Database,
    color: 'from-blue-500 to-indigo-500',
    faqs: [
      {
        question: 'Which integrations are currently available?',
        answer: 'We currently support Notion databases and CSV exports. These are the core integrations available now. Additional integrations may be added based on user feedback and demand.'
      },
      {
        question: 'How accurate is the data extraction?',
        answer: 'Our AI powered by Google Gemini provides good accuracy on most document types. Accuracy varies depending on document quality and format. You can review and verify extracted data before exporting.'
      },
      {
        question: 'Can I customize which fields are extracted?',
        answer: 'Currently, the AI automatically identifies and extracts relevant fields from your documents. Custom field mapping and extraction preferences are planned for future updates.'
      },
      {
        question: 'What file formats do you support?',
        answer: 'We support PDF formats, including both text-based and scanned documents. Our system uses OCR technology to extract data from scanned documents when needed.'
      }
    ]
  },
  {
    id: 'billing',
    name: 'Billing & Plans',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    faqs: [
      {
        question: 'Can I try IntegratePDF for free?',
        answer: 'Yes! You can try the demo without any signup required. For regular use, we offer a free plan with up to 5 PDFs per month. This includes access to our Notion integration and CSV export features.'
      },
      {
        question: 'What are the current pricing plans?',
        answer: 'We currently offer a free plan with 5 PDFs per month. Paid plans with higher limits and additional features are coming soon. You can join the waitlist to be notified when they become available.'
      },
      {
        question: 'Do I need to provide a credit card for the free plan?',
        answer: 'No credit card is required for the free plan. You can sign up and start using IntegratePDF immediately with just an email address.'
      },
      {
        question: 'How do I upgrade when paid plans are available?',
        answer: 'When paid plans launch, existing users will be notified and can easily upgrade from their dashboard. We\'ll provide clear information about pricing and features before any paid plans go live.'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical Support',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    faqs: [
      {
        question: 'How fast is the processing?',
        answer: 'Most documents are processed in under 30 seconds. Processing time depends on document complexity and size. The demo processes documents immediately so you can see results right away.'
      },
      {
        question: 'Do you have an API?',
        answer: 'API access is not currently available but is planned for future releases. We\'re focusing on perfecting the core web application experience first.'
      },
      {
        question: 'What kind of support do you offer?',
        answer: 'We provide email support for all users. Response times are typically within 24-48 hours. As we grow, we plan to expand our support options.'
      },
      {
        question: 'Can I process multiple documents at once?',
        answer: 'Currently, documents are processed one at a time. Batch processing capabilities are planned for future updates as we expand the platform\'s features.'
      }
    ]
  }
]

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('security')
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  const activeCategoryData = faqCategories.find(cat => cat.id === activeCategory)

  return (
    <section className="py-24 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.1),transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <HelpCircle className="w-4 h-4 mr-2" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            Got questions?
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              We have answers
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about IntegratePDF, from security and privacy to integrations and billing.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {faqCategories.map((category) => {
            const Icon = category.icon
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5 mr-2" />
                {category.name}
              </motion.button>
            )
          })}
        </motion.div>

        {/* FAQ Content */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <AnimatePresence mode="wait">
            {activeCategoryData && (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {activeCategoryData.faqs.map((faq, index) => {
                  const isOpen = openFAQ === `${activeCategory}-${index}`
                  return (
                    <motion.div
                      key={index}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setOpenFAQ(isOpen ? null : `${activeCategory}-${index}`)}
                        className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-slate-900 pr-4">
                          {faq.question}
                        </h3>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 border-t border-slate-100">
                              <p className="text-slate-600 leading-relaxed pt-4">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Contact support CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-slate-600 mb-6">
              Our support team is here to help. Get in touch and we'll get back to you as soon as possible.
            </p>
            <motion.a
              href="mailto:support@integratepdf.com"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Support
              <CheckCircle className="w-5 h-5 ml-2" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
