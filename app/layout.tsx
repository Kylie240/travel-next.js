import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Footer from "@/components/layout/footer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth";
import { CartProvider } from "@/context/cart";
import { Roboto } from "next/font/google";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import NavbarServer from "@/components/layout/navbar-server";
import { getSiteUrl } from "@/lib/site-url";
import {
  JsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo/json-ld";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Journli | Create and Share Travel Itineraries",
    template: "%s | Journli",
  },
  description:
    "Discover, create, and share travel itineraries with fellow travelers around the world.",
  applicationName: "Journli",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Journli",
    title: "Journli | Create and Share Travel Itineraries",
    description:
      "Discover, create, and share travel itineraries with fellow travelers around the world.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journli | Create and Share Travel Itineraries",
    description:
      "Discover, create, and share travel itineraries with fellow travelers around the world.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildWebsiteJsonLd()} />
        <AuthProvider>
        <CartProvider>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <NavbarServer />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </div>
        <Toaster richColors position="top-center" />
        </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
