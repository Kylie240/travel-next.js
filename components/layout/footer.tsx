import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

const navigation = {
  main: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  social: [
    {
      name: "Facebook",
      href: "#",
      icon: Facebook,
    },
    {
      name: "Twitter",
      href: "#",
      icon: Twitter,
    },
    {
      name: "Instagram",
      href: "#",
      icon: Instagram,
    },
    {
      name: "YouTube",
      href: "#",
      icon: Youtube,
    },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-black text-white">

      {/* Newsletter */}
      <section className="py-16 bg-gray-100 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl text-black font-medium mb-3">Stay updated with travel inspiration</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter and get the latest travel tips, destinations, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from us.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          {/* Logo and tagline */}
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-bold text-white">
              Travel 3.0
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              Discover the world, one itinerary at a time
            </p>
          </div>

          {/* Navigation */}
          <nav className="mb-8">
            <div className="flex flex-wrap justify-center gap-6">
              {navigation.main.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
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
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="mt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Travel 3.0. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 