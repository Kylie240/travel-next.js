import type { Metadata } from "next"
import { getDefaultOgImages } from "@/lib/seo/og"

const ogImages = getDefaultOgImages()

export const metadata: Metadata = {
  title: "Become a Founding Creator",
  description:
    "Join Journli as a founding creator. Get Pro free for a year, featured placement on the site, and a chance at promotion across our social channels.",
  alternates: {
    canonical: "/become-a-creator",
  },
  openGraph: {
    title: "Become a Founding Creator | Journli",
    description:
      "Join Journli as a founding creator. Get Pro free for a year, featured placement on the site, and a chance at promotion across our social channels.",
    url: "/become-a-creator",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title: "Become a Founding Creator | Journli",
    description:
      "Join Journli as a founding creator. Get Pro free for a year, featured placement on the site, and a chance at promotion across our social channels.",
    images: ogImages.map((img) => img.url),
  },
}

export default function BecomeACreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
