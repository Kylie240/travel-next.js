import type { Metadata } from "next"

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
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
