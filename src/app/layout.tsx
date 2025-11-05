import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BloodBuddy - Connect Blood Donors in Emergency',
  description: 'A platform to connect blood donors with those in need during emergencies',
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