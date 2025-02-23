import HeaderAuth from '@/components/header-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Link from 'next/link'
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

function Header() {
  return (
    <header className="border-b border-b-foreground/10 h-headerHeight grid grid-cols-siteLayout">
      <div className="col-start-2 col-end-3 flex justify-between items-center py-3 text-sm">
        <nav className="flex gap-5 items-center font-semibold">
          <Link href={'/'}>WeddingReady</Link>
        </nav>
        <HeaderAuth />
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="grid grid-cols-siteLayout border-t border-t-foreground/10 pt-16 pb-sitePadding">
      <div className="col-start-2 col-end-3 flex items-center justify-between  text-xs">
        <p className="text-muted-foreground">© 2025 WeddingReady</p>
        <ThemeSwitcher />
      </div>
    </footer>
  )
}
