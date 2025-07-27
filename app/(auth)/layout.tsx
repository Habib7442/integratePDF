import { ClerkProvider } from '@clerk/nextjs'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </ClerkProvider>
  )
}
