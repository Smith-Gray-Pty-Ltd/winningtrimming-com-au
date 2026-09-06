import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CMSLink } from '@/components/Link'

export default function QuoteSuccessPage() {
  return (
    <div className="container py-16 pb-32 min-h-[60vh] flex items-center">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-medium mb-3">Quote request received!</h1>
        <p className="text-muted-foreground mb-8">
          Thanks for your enquiry. We&apos;ll review the details and get back to you
          within 1–2 business days with a quote. If you need to speak to us
          sooner, call <a href="tel:1300799882" className="text-accent font-medium hover:underline">1300 799 882</a>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <CMSLink
            {...{
              type: 'custom',
              label: 'Back to Home',
              url: '/',
              appearance: 'default',
            }}
          />
          <Link href="/our-work">
            <Button variant="outline" size="lg">
              Browse Our Work
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}