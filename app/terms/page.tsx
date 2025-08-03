import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - IntegratePDF',
  description: 'Terms of Service for IntegratePDF - Legal terms and conditions for using our service.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-slate prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-slate-100 mb-8">Terms of Service</h1>
          
          <p className="text-slate-300 text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using IntegratePDF ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">2. Description of Service</h2>
              <p>
                IntegratePDF is a SaaS platform that extracts data from PDF documents and integrates with third-party services like Google Sheets and Notion. The service includes:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>PDF document processing and data extraction</li>
                <li>Integration with Google Sheets, Notion, and other platforms</li>
                <li>Data management and export capabilities</li>
                <li>User account management and authentication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-200">Account Creation</h3>
                <p>
                  You must create an account to use our service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
                
                <h3 className="text-xl font-medium text-slate-200">Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Use the service in compliance with all applicable laws</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">4. Acceptable Use</h2>
              <p>You agree not to use the service to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Upload malicious files or content that violates laws</li>
                <li>Process documents containing illegal or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use the service for any unlawful purpose</li>
                <li>Violate any third-party rights or terms of service</li>
                <li>Upload documents you don't have the right to process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">5. Data and Privacy</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-200">Your Data</h3>
                <p>
                  You retain ownership of all data you upload and process through our service. We process your data solely to provide the service as described in our Privacy Policy.
                </p>
                
                <h3 className="text-xl font-medium text-slate-200">Data Security</h3>
                <p>
                  We implement reasonable security measures to protect your data, but cannot guarantee absolute security. You are responsible for ensuring you have the right to process any documents you upload.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">6. Service Availability</h2>
              <p>
                We strive to maintain high service availability but do not guarantee uninterrupted access. The service may be temporarily unavailable due to:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Scheduled maintenance</li>
                <li>Technical issues or system failures</li>
                <li>Third-party service dependencies</li>
                <li>Force majeure events</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">7. Subscription and Billing</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-200">Free Tier</h3>
                <p>
                  We offer a free tier with limited usage. Free tier users must create an account to access the service.
                </p>
                
                <h3 className="text-xl font-medium text-slate-200">Paid Plans</h3>
                <p>
                  Paid subscriptions are billed in advance and are non-refundable except as required by law. You may cancel your subscription at any time.
                </p>
                
                <h3 className="text-xl font-medium text-slate-200">Usage Limits</h3>
                <p>
                  Each plan has specific usage limits. Exceeding these limits may result in service restrictions or additional charges.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">8. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are owned by IntegratePDF and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">9. Third-Party Integrations</h2>
              <p>
                Our service integrates with third-party platforms. Your use of these integrations is subject to their respective terms of service and privacy policies. We are not responsible for the availability or functionality of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, IntegratePDF shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">11. Disclaimer of Warranties</h2>
              <p>
                The service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the service's reliability, accuracy, or fitness for a particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">12. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">14. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">15. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                <p><strong>Email:</strong> integratepdf@gmail.com</p>
                {/* <p><strong>Address:</strong> [Your Business Address]</p> */}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
