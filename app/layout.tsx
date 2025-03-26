import Header from '@/components/navigation/header'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
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

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}

function Footer() {
  return (
    <footer className="grid grid-cols-siteLayout border-t border-t-border/50 pt-16 pb-sitePadding">
      <div className="col-start-2 col-end-3 flex items-center justify-between  text-xs">
        <p className="text-muted-foreground">© 2025 WeddingReady</p>
        <ThemeSwitcher />
      </div>
    </footer>
  )
}
