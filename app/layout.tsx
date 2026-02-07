import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth";
import { CartProvider } from "@/context/cart";
import { Roboto } from "next/font/google";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import NavbarServer from "@/components/layout/navbar-server";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "Journli - Create and Share Travel Itineraries",
  description: "Discover, create, and share travel itineraries with fellow travelers around the world.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
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
      </body>
    </html>
  );
}
