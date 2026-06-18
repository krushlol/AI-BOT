"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Heart, Menu, X, Mail, Sparkles, Calculator, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface NavbarProps {
  user?: SupabaseUser | null
}

interface Profile {
  username: string | null
  avatar_url: string | null
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const links = [
    { href: "/quiz", label: "Find My Car", icon: Sparkles, highlight: true },
    { href: "/search", label: "Browse Cars", icon: Search },
    { href: "/calculator", label: "Calculator", icon: Calculator },
    { href: "/contact", label: "Contact", icon: Mail },
    ...(user ? [{ href: "/dashboard", label: "Saved", icon: Heart }] : []),
  ]

  const displayName = profile?.username ?? user?.email?.split("@")[0] ?? ""
  const initials = displayName.slice(0, 2).toUpperCase() || "??"

  const AvatarCircle = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
    if (profile?.avatar_url) {
      return (
        <img
          src={`${profile.avatar_url}?t=${Date.now()}`}
          alt={displayName}
          className={`${dim} rounded-full object-cover border border-gray-200`}
        />
      )
    }
    return (
      <div className={`${dim} rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold border border-orange-500`}>
        {initials}
      </div>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 26 L12 10 L16 10 L24 26Z" fill="#f97316" />
              <rect x="13.2" y="22" width="1.6" height="3" rx="0.8" fill="white" opacity="0.9"/>
              <rect x="13.5" y="17" width="1" height="2.5" rx="0.5" fill="white" opacity="0.7"/>
              <rect x="13.7" y="13" width="0.6" height="1.8" rx="0.3" fill="white" opacity="0.5"/>
              <circle cx="14" cy="9" r="1.2" fill="#fed7aa" />
            </svg>
            <span className="text-slate-900">Car<span className="text-orange-500">Advisor</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map(({ href, label, icon: Icon, highlight }) => (
              highlight ? (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith(href) ? "text-orange-600" : "text-gray-600 hover:text-orange-600"
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-orange-200 transition focus:outline-none"
                >
                  <AvatarCircle />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Account Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
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
          {links.map(({ href, label, icon: Icon }) => (
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
          <div className="pt-2 border-t">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 py-1">
                  <AvatarCircle size="sm" />
                  <span className="text-sm font-medium text-gray-800">{displayName}</span>
                </div>
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-sm text-gray-700 py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Account Settings
                </Link>
                <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/sign-in" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up" className="flex-1">
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
