import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignUpButton } from '@clerk/nextjs'
import { 
  FileText, 
  Zap, 
  Mail, 
  Twitter, 
  Linkedin, 
  Github,
  ArrowRight,
  Shield,
  Heart
} from 'lucide-react'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Demo', href: '#demo' }
  ],
  company: [
    { name: 'Contact', href: 'mailto:support@integratepdf.com' }
  ],
  support: [
    { name: 'Email Support', href: 'mailto:support@integratepdf.com' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' }
  ]
}

const socialLinks = [
  { name: 'Email', href: 'mailto:support@integratepdf.com', icon: Mail }
]

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800">
      {/* Main footer content - Simplified */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="relative">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-lg sm:text-xl font-bold">IntegratePDF</span>
            </div>

            <p className="text-slate-400 mb-6 leading-relaxed text-sm sm:text-base">
              AI-powered PDF data extraction for modern businesses.
            </p>

            {/* Contact */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="#demo" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">Demo</Link></li>
              <li><Link href="#features" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">Features</Link></li>
              <li><Link href="#pricing" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Support</h4>
            <ul className="space-y-3">
              <li><Link href="mailto:support@integratepdf.com" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">Contact</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">Privacy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar - Simplified */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400">
              © 2025 IntegratePDF. All rights reserved.
            </div>

            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Shield className="w-4 h-4" />
              <span>Secure Processing</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
