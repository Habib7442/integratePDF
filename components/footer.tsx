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
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="relative">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-lg sm:text-xl font-bold">IntegratePDF</span>
            </div>

            <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Transform any PDF into structured data and push it directly to your favorite business tools.
              Built for founders and small businesses who value their time.
            </p>

            {/* Newsletter signup */}
            <div className="mb-4 sm:mb-6">
              <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Stay updated</h4>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 min-h-[44px] px-4">
                  <Mail className="w-4 h-4" />
                  <span className="ml-2 sm:hidden">Subscribe</span>
                </Button>
              </div>
            </div>

            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links sections */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to eliminate manual data entry?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Try our live demo now - see real AI extraction in action. Create account to export data.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" asChild>
              <a href="#demo">
                Try Live Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2024 IntegratePDF. All rights reserved.</span>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Secure Processing</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span>for founders and small businesses</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
