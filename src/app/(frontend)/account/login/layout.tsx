import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Winning Trimming account.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="container py-16 pb-24 min-h-[60vh] flex items-center justify-center">{children}</div>
}