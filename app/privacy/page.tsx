import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - IntegratePDF',
  description: 'Privacy Policy for IntegratePDF - Learn how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-slate-100 mb-8">Privacy Policy</h1>
          
          <p className="text-slate-300 text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-200">Account Information</h3>
                <p>
                  When you create an account, we collect your email address and any profile information you choose to provide through our authentication provider (Clerk).
                </p>
                
                <h3 className="text-xl font-medium text-slate-200">Document Data</h3>
                <p>
                  We process PDF documents you upload to extract data. The extracted data is stored securely and associated with your account. Original PDF files are processed and then deleted from our servers.
                </p>
                
                <h3 className="text-xl font-medium text-slate-200">Integration Data</h3>
                <p>
                  When you connect third-party services (Google Sheets, Notion), we store encrypted authentication tokens and configuration data necessary to push extracted data to your connected services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Process PDF documents and extract data as requested</li>
                <li>Store extracted data for your access and management</li>
                <li>Push data to your connected third-party integrations</li>
                <li>Provide customer support and respond to your inquiries</li>
                <li>Improve our services and develop new features</li>
                <li>Send important service updates and security notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">3. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>All data is encrypted in transit and at rest</li>
                <li>API keys and authentication tokens are encrypted before storage</li>
                <li>Access to your data is restricted to authorized personnel only</li>
                <li>Regular security audits and monitoring</li>
                <li>Secure cloud infrastructure with Supabase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">4. Data Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties except:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>To your connected integrations (Google Sheets, Notion) as directed by you</li>
                <li>To service providers who assist in operating our platform (Clerk, Supabase)</li>
                <li>When required by law or to protect our rights and safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">5. Data Retention</h2>
              <p>
                We retain your data as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Account data: Until you delete your account</li>
                <li>Extracted data: Until you delete it or your account</li>
                <li>PDF files: Deleted immediately after processing</li>
                <li>Integration tokens: Until you disconnect the integration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data and account</li>
                <li>Export your data</li>
                <li>Disconnect integrations at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">7. Cookies and Tracking</h2>
              <p>
                We use essential cookies for authentication and service functionality. We do not use tracking cookies for advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">8. Third-Party Services</h2>
              <p>
                Our service integrates with third-party platforms. Please review their privacy policies:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li><a href="https://clerk.com/privacy" className="text-blue-400 hover:text-blue-300">Clerk Privacy Policy</a></li>
                <li><a href="https://supabase.com/privacy" className="text-blue-400 hover:text-blue-300">Supabase Privacy Policy</a></li>
                <li><a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300">Google Privacy Policy</a></li>
                <li><a href="https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091" className="text-blue-400 hover:text-blue-300">Notion Privacy Policy</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
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
