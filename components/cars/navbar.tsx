"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Search, GitCompare, Heart, User, Menu, X, Mail, Sparkles, Zap, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useProStatus } from "@/hooks/useProStatus"
import ProBadge from "@/components/pricing/pro-badge"

interface NavbarProps {
  user?: { email?: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { isPro } = useProStatus()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const links = [
    { href: "/quiz", label: "Find My Car", icon: Sparkles, highlight: true },
    { href: "/search", label: "Browse Cars", icon: Search },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/calculator", label: "Calculator", icon: Calculator },
    { href: "/pricing", label: "Pricing", icon: Zap },
    { href: "/contact", label: "Contact", icon: Mail },
    ...(user ? [{ href: "/dashboard", label: "Saved", icon: Heart }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
            <Car className="w-7 h-7" />
            <span>AutoDrive</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map(({ href, label, icon: Icon, highlight }) => (
              highlight ? (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith(href) ? "text-blue-700" : "text-gray-600 hover:text-blue-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {user.email?.split("@")[0]}
                  {isPro && <ProBadge />}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {links.map(({ href, label, icon: Icon, highlight }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t flex gap-2">
            {user ? (
              <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/sign-in" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up" className="flex-1">
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
