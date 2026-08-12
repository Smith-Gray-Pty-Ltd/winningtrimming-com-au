import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your Winning Trimming account.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <div className="container py-16 pb-24 min-h-[60vh] flex items-center justify-center">{children}</div>
}