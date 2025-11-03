import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Trigger redeploy with new Supabase project
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dumpster CRM - SEO Automation Platform',
  description: 'Enterprise-level SEO automation CRM for dumpster rental business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {children}
      </body>
    </html>
  )
}
