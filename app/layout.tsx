import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'All Things Gwinnett — The county. No filter.',
  description: 'Local news, food, events, and community for Gwinnett County, GA. Built by locals.',
  openGraph: {
    title: 'All Things Gwinnett',
    description: 'Local news, food, events, and community for Gwinnett County, GA.',
    url: 'https://allthingsgwinnett.com',
    siteName: 'All Things Gwinnett',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Things Gwinnett',
    description: 'The county. No filter.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
