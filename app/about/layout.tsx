import type { Metadata } from "next"
import { getDefaultOgImages } from "@/lib/seo/og"

const ogImages = getDefaultOgImages()

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Journli — where travelers create, share, and sell travel itineraries inspired by real trips.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Journli",
    description:
      "Learn about Journli — where travelers create, share, and sell travel itineraries inspired by real trips.",
    url: "/about",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title: "About Journli",
    description:
      "Learn about Journli — where travelers create, share, and sell travel itineraries inspired by real trips.",
    images: ogImages.map((img) => img.url),
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
