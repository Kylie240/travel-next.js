import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Compass,
  DollarSign,
  Megaphone,
  Sparkles,
  Star,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import createClient from "@/utils/supabase/server"
import { getMyFoundingCreatorState, countActiveFoundingCreators } from "@/lib/founding-creator"
import { FoundingClaimPanel } from "./claim-panel"
import {
  FOUNDING_BIO_MIN_LENGTH,
  FOUNDING_CREATOR_CAP,
} from "@/lib/founding-creator/constants"
import { MdOutlineSupportAgent } from "react-icons/md"
import { LuBadgeCheck } from "react-icons/lu"

const WHY_CREATE = [
  {
    icon: Compass,
    title: "Create What You Love",
    description:
      "Turn trips you’ve already planned into polished itineraries—no quotas, no clients, just your expertise.",
  },
  {
    icon: Users,
    title: "Reach Real Travelers",
    description:
      "Get discovered on Explore and through featured placement as a founding creator.",
  },
  {
    icon: DollarSign,
    title: "Earn on Your Terms",
    description:
      "Sell itineraries when you’re ready. Keep creating free, or connect Stripe and get paid on every sale.",
  },
]

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Sign Up",
    description:
      "Create a free Journli account and complete your public creator profile.",
  },
  {
    step: "2",
    title: "Publish Quality Work",
    description:
      "Share a clear day-by-day itinerary with a cover photo and helpful tips.",
  },
  {
    step: "3",
    title: "Claim for Review",
    description:
      "Pass the checklist and submit your claim. Spots are limited to 100 founding creators.",
  },
  {
    step: "4",
    title: "Get Approved & Earn",
    description:
      "We review applications. If approved, you get Pro free for a year—then sell when you’re ready.",
  },
]

const FOUNDING_PERKS = [
  {
    icon: Sparkles,
    title: "Pro free for a year",
    description:
      "Unlimited itineraries, lower selling fees, collaboration, and offline access—Explorer (Pro) covered for 12 months.",
  },
  {
    icon: Megaphone,
    title: "Social promotion",
    description:
      "Standout itineraries may be shared across Journli’s social channels to help more travelers find you.",
  },
  {
    icon: Star,
    title: "Featured placement",
    description:
      "Get highlighted on the site so early creators reach a wider audience from day one.",
  },
  {
    icon: LuBadgeCheck,
    title: "Founding Creator Badge",
    description:
      "Get a badge on your profile that shows you're a founding creator and are a reputable source of travel information.",
  },
  {
    icon: MdOutlineSupportAgent,
    title: "Priority Support",
    description:
      "Get priority support from our team when you need help with your itineraries or account.",
  },
]

const LOOKING_FOR = [
  `A complete profile: name, username, avatar, and bio (at least ${FOUNDING_BIO_MIN_LENGTH} characters)`,
  "At least one published public itinerary with cover image, clear title, and description",
  "Day-by-day structure (2+ days) with useful tips travelers can follow",
  "Original, non-spam content that reflects real travel know-how",
]

const FAQS = [
  {
    q: "How do I become a founding creator?",
    a: `Complete your profile, publish a quality itinerary, then use Claim for review on this page. We manually approve applications. There are ${FOUNDING_CREATOR_CAP} spots.`,
  },
  {
    q: "When do I get Pro free for a year?",
    a: "Only after admin approval. Once approved, Explorer (Pro) is enabled for 12 months—unlimited itineraries, reduced selling fees, collaboration, offline access, and visibility controls.",
  },
  {
    q: "Is social promotion guaranteed?",
    a: "Not guaranteed for every creator. High-quality itineraries may be shared on our social channels. Featured site placement is part of how we highlight founding creators.",
  },
  {
    q: "Do I have to sell my itineraries?",
    a: "No. You can publish free itineraries. When you’re ready to monetize, connect Stripe from Become a Seller and set a price on publish.",
  },
  {
    q: "What if my claim is rejected?",
    a: "Improve your profile or itinerary based on feedback, then claim again if spots remain.",
  },
]

export default async function BecomeACreatorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const primaryHref = user ? "/create" : "/login?mode=signup"
  const primaryLabel = user
    ? "Start creating"
    : "Become a Founding Creator"

  const foundingState = user
    ? await getMyFoundingCreatorState(user.id)
    : null

  const activeCount = foundingState
    ? foundingState.eligibility.activeCount
    : await countActiveFoundingCreators()
  const slotsRemaining = Math.max(0, FOUNDING_CREATOR_CAP - activeCount)

  const emptyEligibility = {
    eligible: false,
    reasons: [
      "Sign up, complete your profile, and publish a quality itinerary to claim.",
    ],
    missingProfile: [] as string[],
    qualityItineraryId: null as string | null,
    activeCount,
    slotsRemaining,
    status: null as null,
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero — Canva-style centered intro */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-24">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-cyan-700">
            Journli Founding Creators
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Share Your Trips with the World
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
            Join as a founding creator. Publish itineraries travelers can
            follow, earn when they purchase, and get Pro free for a year—plus
            featured placement and a chance at social promotion.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#claim">
              <Button
                size="lg"
                className="h-11 bg-cyan-700 px-8 text-base text-white hover:bg-cyan-800"
              >
                {user ? "Claim your spot" : primaryLabel}
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-8 text-base"
              >
                See Creator Itineraries
              </Button>
            </Link>
          </div>
          {!user && (
            <p className="mt-4 text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login?mode=login"
                className="font-medium text-cyan-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Claim */}
      <section id="claim" className="scroll-mt-24 py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <FoundingClaimPanel
            isLoggedIn={Boolean(user)}
            primaryHref={primaryHref}
            status={foundingState?.status ?? null}
            eligibility={foundingState?.eligibility ?? emptyEligibility}
            expiresAt={foundingState?.expiresAt ?? null}
            rejectReason={foundingState?.rejectReason ?? null}
          />
        </div>
      </section>

      {/* Why create */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Why Create on Journli
            </h2>
            <p className="mt-3 text-gray-600">
              A marketplace for real traveler plans—built so your expertise can
              inspire and earn.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {WHY_CREATE.map((item) => (
              <div key={item.title} className="text-center md:text-left max-w-sm mx-auto">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-700 text-white md:mx-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product story — alternating like Canva / landing features */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              From Your Notes to a Living Itinerary
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-600">
              Use the same builder travelers already love—then publish, share,
              or sell.
            </p>
          </div>

          <div className="space-y-16">
            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <div className="relative aspect-[4/3] w-full max-w-[340px] overflow-hidden rounded-xl shadow-lg sm:w-1/2">
                <Image
                  src="/images/Plan.png"
                  alt="Plan an itinerary"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 340px"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <h3 className="text-xl font-semibold md:text-2xl">Plan</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Capture days, places, and tips in a structured itinerary
                  anyone can follow—whether you’re documenting last year’s trip
                  or mapping the next one.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 sm:flex-row-reverse">
              <div className="relative aspect-[4/3] w-full max-w-[340px] overflow-hidden rounded-xl shadow-lg sm:w-1/2">
                <Image
                  src="/images/Create.png"
                  alt="Create and publish"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 340px"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <h3 className="text-xl font-semibold md:text-2xl">Publish</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Go live on Explore, share a link, or set a price. Founding
                  creators get Pro tools free for a year so you can publish
                  without limits.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <div className="relative aspect-[4/3] w-full max-w-[340px] overflow-hidden rounded-xl shadow-lg sm:w-1/2">
                <Image
                  src="/images/Share.png"
                  alt="Share and earn"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 340px"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <h3 className="text-xl font-semibold md:text-2xl">Earn</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Connect Stripe when you’re ready. Travelers pay securely; you
                  get paid for plans that save them hours of research.
                </p>
                <Link
                  href="/become-a-seller"
                  className="mt-4 inline-flex items-center gap-2 font-medium text-cyan-700 hover:underline"
                >
                  How Selling Works
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — Canva Sign up / Create / Earn */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              How to Become a Founding Creator
            </h2>
            <p className="mt-3 text-gray-600">
              Sign up, publish your best work, get discovered, and start
              earning—on your schedule.
            </p>
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step} className="bg-gray-200 p-6 rounded-lg">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold bg-cyan-700 text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Link href={primaryHref}>
              <Button className="px-8 text-white hover:bg-cyan-800">
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Founding perks */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-cyan-700">
              Limited Founding Cohort
            </p>
            <h2 className="text-2xl font-bold md:text-3xl">
              Founding Creator Benefits
            </h2>
            <p className="mt-3 text-gray-600">
              Early creators who help set the bar get more than a free plan.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FOUNDING_PERKS.map((perk) => (
              <div
                key={perk.title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <perk.icon className="h-6 w-6 text-cyan-700" />
                <h3 className="mt-4 text-lg font-semibold">{perk.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                  {perk.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            Want the full feature list?{" "}
            <Link href="/plans" className="font-medium text-cyan-700 hover:underline">
              Compare plans
            </Link>
          </p>
        </div>
      </section>

      {/* What we're looking for — Canva portfolio standards vibe */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            What We're Looking For
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
            Joining means showing craft through itineraries that reflect real
            travel know-how—similar to how creator programs review quality
            work.
          </p>
          <ul className="mt-10 space-y-4">
            {LOOKING_FOR.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="mt-10">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="border-gray-200">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA — Canva “Sign up and start earning” */}
      <section className="bg-gray-900 py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Sign Up and Start Creating
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-gray-300">
            Join the founding creator cohort. Publish your first itinerary and
            grow with Journli from the start.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={primaryHref}>
              <Button
                size="lg"
                className="h-11 bg-white px-8 text-base text-gray-900 hover:bg-gray-100"
              >
                {primaryLabel}
              </Button>
            </Link>
            <Link href="/become-a-seller">
              <Button
                size="lg"
                variant="outline"
                className="h-11 border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
              >
                Set Up Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
