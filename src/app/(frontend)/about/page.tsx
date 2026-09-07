import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'

import { ReviewsSection } from '@/components/Reviews/ReviewsSection'
import { generateMeta } from '@/utilities/generateMeta'
import type { Page as PageType } from '@/payload-types'

export const revalidate = 3600

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const queryAboutPage = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: 'about' } },
  })
  return result.docs?.[0] || null
})

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryAboutPage()
  return generateMeta({ doc: page })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PHONE = '1300 799 882'
const PHONE_TEL = 'tel:1300799882'

const TEAM_PHOTO = '/images/about/team.jpeg'

export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch reviews for the trust section
  const reviewsRes = await payload.find({
    collection: 'reviews',
    where: {
      and: [
        { hidden: { not_equals: true } },
        { rating: { equals: 5 } },
      ],
    },
    depth: 1,
    limit: 4,
    overrideAccess: false,
    sort: '-featured,-reviewDate',
  })

  const reviews = reviewsRes.docs

  return (
    <div className="pb-24">
      {/* ====================================================================
          1. HERO — team photo with H1 overlay
      ==================================================================== */}
      <section
        className="relative flex min-h-[60vh] items-end overflow-hidden text-white"
        data-theme="dark"
      >
        <NextImage
          src={TEAM_PHOTO}
          alt="The Winning Trimming team in the workshop"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/30"
          aria-hidden="true"
        />
        <div className="container relative z-10 pb-16 pt-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wide text-[#a3c44d] mb-3">
              Toronto · Lake Macquarie
            </p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
              About Winning Trimming
            </h1>
            <p className="mt-4 text-lg text-white/85 leading-relaxed max-w-xl">
              Marine, automotive and general trimming specialists. Built on
              craftsmanship, run by people who care about the finished job.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. WHO WE ARE — two-column with image
      ==================================================================== */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left — text */}
            <div>
              <h2 className="text-3xl font-medium tracking-tight">
                Where quality meets craftsmanship
              </h2>
              <div className="mt-6 space-y-4 text-foreground/80 leading-relaxed text-lg">
                <p>
                  Winning Trimming is a marine, recreational and trade trimming, upholstery
                  and covers specialist based in Toronto, on Lake Macquarie. We combine
                  traditional craftsmanship with modern materials to build and repair covers,
                  canvas and trim that last.
                </p>
                <p>
                  From runabouts to super yachts, tonneaus to machinery covers, every job is
                  treated with the same attention to detail — whether it&apos;s a custom build
                  or a repair that brings tired trim back to life.
                </p>
                <p>
                  Winning Trimming is a trading name of Smith &amp; Gray Pty Ltd (ABN 92 655
                  426 707).
                </p>
              </div>
            </div>
            {/* Right — map and location card */}
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted mb-5">
                <iframe
                  title="Winning Trimming workshop location — 25 Sara Street, Toronto NSW 2283"
                  src="https://www.google.com/maps?q=25+Sara+Street+Toronto+NSW+2283+Australia&output=embed"
                  className="absolute inset-0 h-full w-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">Workshop</p>
                  <p className="text-muted-foreground">
                    Shop 2, 25 Sara Street<br />
                    Toronto, NSW 2283
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="font-medium text-foreground">Hours</p>
                  <p className="text-muted-foreground">
                    Monday – Friday: 7am – 3pm<br />
                    Saturday: By appointment<br />
                    Sunday: Closed
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="font-medium text-foreground">Phone</p>
                  <a
                    href={PHONE_TEL}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {PHONE}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. WHAT WE DO — 5 pillar cards
      ==================================================================== */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-medium tracking-tight">What We Do</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Five service areas covering everything from boats to trucks.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { slug: 'marine', label: 'Marine', description: 'Biminis, dodgers, enclosures, sail covers, cushions and full interior refits.' },
              { slug: 'automotive', label: 'Automotive', description: 'Tonneau covers, custom seats, door trims, headlinings and motorcycle seats.' },
              { slug: 'caravan-and-rv', label: 'Caravan & RV', description: 'Annexes, pop-top seals, upgraded cushions, mattresses and interior panels.' },
              { slug: 'trade-and-industrial', label: 'Trade & Industrial', description: 'Machinery covers, soft canopies, tool covers and operator-seat trimming.' },
              { slug: 'commercial', label: 'Commercial', description: 'Custom seating, booth upholstery, office chairs and contract runs to spec.' },
            ].map((pillar) => (
              <Link
                key={pillar.slug}
                href={`/${pillar.slug}`}
                className="group rounded-xl border border-border bg-white p-6 transition-all hover:border-primary hover:shadow-md"
              >
                <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                  {pillar.label}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
                  Explore {pillar.label} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. THE AREA WE SERVE — teal band with CTA
      ==================================================================== */}
      <section className="bg-accent text-white py-16" data-theme="dark">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight">The area we serve</h2>
            <p className="mt-4 text-lg text-white/85 leading-relaxed">
              Serving Lake Macquarie, the Central Coast, Newcastle and the Hunter Valley.
              Drop in to the workshop in Toronto or arrange an on-site inspection — for larger
              jobs like clears we come to your vessel to measure and fit.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Request a Quote
              </Link>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. REVIEWS — what customers say
      ==================================================================== */}
      {reviews.length > 0 && (
        <section className="py-16">
          <div className="container">
            <ReviewsSection onTeal={false} />
          </div>
        </section>
      )}

      {/* ====================================================================
          6. CTA BAND — final conversion push
      ==================================================================== */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-2xl bg-[#607A00] text-white p-10 md:p-16 text-center">
            <h2 className="text-3xl font-medium tracking-tight">Ready to Get Started?</h2>
            <p className="mt-3 text-white/85 max-w-2xl mx-auto">
              Request a quote online or call us — we&apos;ll help you find the right
              solution for your vessel, vehicle or business.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Request a Quote
              </Link>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}