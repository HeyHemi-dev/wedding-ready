import { Geist } from 'next/font/google'

import Footer from '@/components/navigation/footer'
import Header from '@/components/navigation/header'
import { Toaster } from '@/components/ui/sonner'

import { Providers } from './providers'

import '@/public/styles/globals.css'

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
}

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
            <Header />

            <main>{children}</main>

            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
