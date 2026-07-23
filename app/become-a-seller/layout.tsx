import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Become a Seller",
  description:
    "Sell your travel itineraries on Journli. Connect Stripe, set a price, and earn when travelers buy your plans.",
  alternates: {
    canonical: "/become-a-seller",
  },
  openGraph: {
    title: "Become a Seller on Journli",
    description:
      "Sell your travel itineraries on Journli. Connect Stripe, set a price, and earn when travelers buy your plans.",
    url: "/become-a-seller",
  },
}

export default function BecomeASellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
