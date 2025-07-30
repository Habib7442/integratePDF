'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="IntegratePDF Logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                priority
              />
              <span className="text-lg sm:text-xl font-bold text-slate-100">IntegratePDF</span>
            </Link>
          </div>

          {/* Desktop Navigation - Minimal */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="#demo"
                className="text-slate-300 hover:text-slate-100 px-3 py-2 text-sm font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Demo
              </Link>
              <Link
                href="#pricing"
                className="text-slate-300 hover:text-slate-100 px-3 py-2 text-sm font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Auth Buttons - Dark Theme */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-slate-100 hover:bg-slate-800">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started Free
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button variant="outline" size="sm" asChild className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-md text-slate-300 hover:text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 touch-manipulation min-h-[44px] min-w-[44px]"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Dark Theme */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-900 border-t border-slate-800 shadow-lg">
            <Link
              href="#demo"
              className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 block px-4 py-3 text-base font-medium rounded-lg transition-colors touch-manipulation min-h-[48px] flex items-center"
              onClick={(e) => {
                e.preventDefault()
                setIsMenuOpen(false)
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Demo
            </Link>
            <Link
              href="#pricing"
              className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 block px-4 py-3 text-base font-medium rounded-lg transition-colors touch-manipulation min-h-[48px] flex items-center"
              onClick={(e) => {
                e.preventDefault()
                setIsMenuOpen(false)
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Pricing
            </Link>
            <div className="pt-4 pb-3 border-t border-slate-800 mt-2">
              <div className="flex flex-col space-y-3 px-2">
                <SignedOut>
                  <SignInButton>
                    <Button variant="ghost" size="sm" className="w-full min-h-[48px] justify-center text-slate-300 hover:text-slate-100 hover:bg-slate-800">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button size="sm" className="w-full min-h-[48px] justify-center bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started Free
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button variant="outline" size="sm" asChild className="w-full min-h-[48px] justify-center border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <div className="flex justify-center pt-2">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
