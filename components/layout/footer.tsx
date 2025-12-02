import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { FaTiktok, FaPinterest } from "react-icons/fa6"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import NewsletterForm from "./newsletter-forn"
import { FaXTwitter } from "react-icons/fa6";

const navigation = {
  main: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "legal/privacy" },
    { name: "Terms of Service", href: "legal/terms" },
  ],
  social: [
    {
      name: "Facebook",
      href: "https://www.facebook.com/journlitravels",
      icon: Facebook,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/journlitravels",
      icon: FaXTwitter,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/journlitravels",
      icon: Instagram,
    },
    {
      name: "Tiktok",
      href: "https://www.tiktok.com/@journlitravels",
      icon: FaTiktok,
    },
    {
      name: "Pinterest",
      href: "https://www.pinterest.com/journlitravels",
      icon: FaPinterest,
    },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-black text-white">

      {/* Newsletter */}
      <section className="py-16 bg-gray-100 border-t" id="newsletter">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl text-black font-medium mb-3">Stay updated with travel inspiration</h2>
            <p className="text-gray-600">
              Subscribe to our newsletter and get the latest travel tips, destinations, and exclusive offers.
            </p>
            <NewsletterForm />
            <p className="text-sm text-gray-500 sm:mt-2 md:mt-4">
              By subscribing, you agree to our <Link href="legal/privacy" className="text-black hover:text-gray-900">Privacy Policy</Link> and consent to receive updates from us.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          {/* Logo and tagline */}
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-bold text-white">
              Journli
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              Where travelers inspire travelers
            </p>
          </div>

          {/* Navigation */}
          <nav className="mb-8">
            <div className="flex flex-wrap justify-center gap-6">
              {navigation.main.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Social links */}
          <div className="flex justify-center space-x-6">
            {navigation.social.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="mt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Journli. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 
