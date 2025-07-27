import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { StoreProvider } from '@/components/providers/store-provider'
import { NotificationContainer } from '@/components/ui/notifications'
import { Toaster } from 'sonner'
import { StructuredData, APP_STRUCTURED_DATA } from '@/components/seo/structured-data'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'IntegratePDF - AI-Powered PDF to Notion Integration | Transform PDFs into Structured Data',
    template: '%s | IntegratePDF'
  },
  description: 'Transform any PDF into structured data with 95% accuracy using AI. Seamlessly integrate with Notion databases, export to CSV, and automate your document workflow. Try free - no signup required.',
  keywords: [
    'PDF data extraction',
    'AI PDF processing',
    'Notion integration',
    'PDF to Notion',
    'document automation',
    'CSV export',
    'workflow automation',
    'SaaS',
    'business automation',
    'invoice processing',
    'contract management',
    'receipt scanning',
    'OCR',
    'data entry automation'
  ],
  authors: [{ name: 'IntegratePDF', url: 'https://integratepdf.com' }],
  creator: 'IntegratePDF',
  publisher: 'IntegratePDF',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://integratepdf.com',
    siteName: 'IntegratePDF',
    title: 'IntegratePDF - AI-Powered PDF to Notion Integration',
    description: 'Transform any PDF into structured data with 95% accuracy using AI. Seamlessly integrate with Notion databases and automate your document workflow.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IntegratePDF - Transform PDFs into Structured Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@IntegratePDF',
    creator: '@IntegratePDF',
    title: 'IntegratePDF - AI-Powered PDF to Notion Integration',
    description: 'Transform any PDF into structured data with 95% accuracy using AI. Try free - no signup required.',
    images: ['/twitter-image.png'],
  },
  alternates: {
    canonical: 'https://integratepdf.com',
  },
  category: 'technology',
  classification: 'Business Software',
}

// Structured data is now imported from the safe component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <head>
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* Structured Data */}
          <StructuredData data={APP_STRUCTURED_DATA} />

          {/* Performance and Security Headers */}
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content="#0ea5e9" />
          <meta name="color-scheme" content="light" />

          {/* Favicon and App Icons */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}>
          <StoreProvider>
            {children}
            <NotificationContainer />
            <Toaster position="top-right" />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}