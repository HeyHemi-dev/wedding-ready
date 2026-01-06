import { Geist } from 'next/font/google'
import { Suspense } from 'react'

import { AppEffects } from '@/components/app-effects'
import Footer from '@/components/navigation/footer'
import Header from '@/components/navigation/header'
import { Toaster } from '@/components/ui/sonner'
import { BASE_URL } from '@/utils/constants'

import { Providers } from './providers'

import type { Metadata } from 'next'

import '@/styles/globals.css'

const defaultUrl = BASE_URL

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'WeddingReady - Find your dream team, not just a moodboard.',
  description:
    'Discover wedding inspiration you can actually bring to life. Wedding Ready connects you with the suppliers behind every image, making it easy to plan your dream day',
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
          <Suspense fallback={null}>
            <AppEffects />
          </Suspense>
          <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
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
