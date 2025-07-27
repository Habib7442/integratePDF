import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { StoreProvider } from '@/components/providers/store-provider'
import { NotificationContainer } from '@/components/ui/notifications'
import { Toaster } from 'sonner'
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
  title: 'IntegratePDF - Transform PDFs into Structured Data',
  description: 'Transform any PDF into structured data and push it directly to your favorite business tools like Notion, Airtable, and QuickBooks with one click.',
  keywords: ['PDF', 'data extraction', 'automation', 'Notion', 'Airtable', 'QuickBooks', 'SaaS', 'workflow'],
  authors: [{ name: 'IntegratePDF' }],
  openGraph: {
    title: 'IntegratePDF - Transform PDFs into Structured Data',
    description: 'Transform any PDF into structured data and push it directly to your favorite business tools with one click.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IntegratePDF - Transform PDFs into Structured Data',
    description: 'Transform any PDF into structured data and push it directly to your favorite business tools with one click.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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