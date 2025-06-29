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