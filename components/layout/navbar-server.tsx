import Link from "next/link"
import { AuthDialog } from "@/components/ui/auth-dialog"
import { UserMenu } from "@/components/ui/user-menu"
import { NavbarClient } from "./navbar-client"
import createClient from "@/utils/supabase/server"

const publicNavigation = [
  { name: "Explore", href: "/explore" },
  { name: "Search", href: "/search" },
  { name: "Plans", href: "/plans" },
  { name: "About", href: "/about" },
]

export default async function NavbarServer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-[50] transition-all duration-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-black">
                Journli
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {publicNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors text-gray-700 hover:text-black hover:border-gray-300"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center md:space-x-4">
            {/* User menu or auth buttons */}
            <UserMenu />

            {/* Mobile menu button and mobile auth */}
            <NavbarClient user={user} />
          </div>
        </div>
      </div>
    </nav>
  )
}
