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
    { name: 'API Documentation', href: '/docs' },
    { name: 'Integrations', href: '/integrations' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Press Kit', href: '/press' }
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Community', href: '/community' },
    { name: 'Status', href: '/status' },
    { name: 'Security', href: '/security' },
    { name: 'System Status', href: '/status' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
    { name: 'SOC 2', href: '/soc2' }
  ]
}

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/integratepdf', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/integratepdf', icon: Linkedin },
  { name: 'GitHub', href: 'https://github.com/integratepdf', icon: Github }
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative">
                <FileText className="h-8 w-8 text-blue-400" />
                <Zap className="h-4 w-4 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold">IntegratePDF</span>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Transform any PDF into structured data and push it directly to your favorite business tools. 
              Built for founders and small businesses who value their time.
            </p>

            {/* Newsletter signup */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Stay updated</h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4" />
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
              Join 500+ founders who have automated their PDF workflows. Start your free trial today.
            </p>
            <SignUpButton>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignUpButton>
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
                <span>SOC 2 Compliant</span>
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
