import type { Metadata } from 'next'
import './globals.css'
import './cyberpunk.css'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A secure todo application with authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect to login page if at root
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    redirect('/login')
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 animate-gradient-x" 
        suppressHydrationWarning
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
