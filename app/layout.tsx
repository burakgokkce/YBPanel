import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'YB Digital Panel',
  description: 'Internal management panel for YB Digital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-bg text-white min-h-screen`}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#2a4052',
              color: '#fff',
              border: '1px solid #5635D7',
            },
          }}
        />
      </body>
    </html>
  )
}
