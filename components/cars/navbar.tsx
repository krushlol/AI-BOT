"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Heart, Menu, X, Mail, Sparkles, Calculator, Settings, LogOut, TrendingDown, GitCompare, ChevronDown } from "lucide-react"
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

const mainLinks = [
  { href: "/search", label: "Browse Cars", icon: Search },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/contact", label: "Contact", icon: Mail },
]

const toolLinks = [
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/depreciation", label: "Resale Value", icon: TrendingDown },
]

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [displayUser, setDisplayUser] = useState(user ?? null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { setDisplayUser(user ?? null) }, [user])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setDisplayUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setDisplayUser(null)
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!displayUser) { setProfile(null); return }
    supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", displayUser.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayUser?.id])

  // Close both dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close mobile menu on route change (e.g. browser back)
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  const isToolActive = toolLinks.some(l => pathname.startsWith(l.href))

  const AvatarCircle = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
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

  const displayName = profile?.username ?? displayUser?.email?.split("@")[0] ?? ""
  const initials = displayName.slice(0, 2).toUpperCase() || "??"

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl flex-shrink-0">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="13" stroke="#f97316" strokeWidth="2.5"/>
              <circle cx="15" cy="15" r="3.5" fill="#f97316"/>
              <line x1="15" y1="2" x2="15" y2="11.5" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="15" y1="18.5" x2="15" y2="28" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="2" y1="15" x2="11.5" y2="15" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="18.5" y1="15" x2="28" y2="15" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="text-slate-900">Car<span className="text-orange-500">Advisor</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {mainLinks.map(({ href, label, icon: Icon }) => (
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
            ))}

            {/* Tools dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen(o => !o)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isToolActive ? "text-orange-600" : "text-gray-600 hover:text-orange-600"
                }`}
              >
                Tools
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
              </button>
              {toolsOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                  {toolLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setToolsOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                        pathname.startsWith(href) ? "text-orange-600" : "text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Saved — logged-in only */}
            {displayUser && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith("/dashboard") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"
                }`}
              >
                <Heart className="w-4 h-4" />
                Saved
              </Link>
            )}

            {/* Find My Car CTA */}
            <Link
              href="/quiz"
              className="flex items-center gap-1.5 text-sm font-semibold bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Find My Car
            </Link>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {displayUser ? (
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
                      <p className="text-xs text-gray-500 truncate">{displayUser.email}</p>
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
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-1">
          {/* Main links */}
          {mainLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 text-sm font-medium px-2 py-2.5 rounded-lg transition-colors ${
                pathname.startsWith(href) ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {/* Tool links flat in mobile */}
          {toolLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 text-sm font-medium px-2 py-2.5 rounded-lg transition-colors ${
                pathname.startsWith(href) ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {/* Saved — logged-in only */}
          {displayUser && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 text-sm font-medium px-2 py-2.5 rounded-lg transition-colors ${
                pathname.startsWith("/dashboard") ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Heart className="w-4 h-4" />
              Saved
            </Link>
          )}

          {/* Find My Car — orange pill on mobile too */}
          <Link
            href="/quiz"
            className="flex items-center gap-2 text-sm font-semibold bg-orange-500 text-white px-3 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Find My Car
          </Link>

          <div className="pt-2 border-t mt-2">
            {displayUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 py-1 px-2">
                  <AvatarCircle size="sm" />
                  <span className="text-sm font-medium text-gray-800">{displayName}</span>
                </div>
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-sm text-gray-700 px-2 py-2.5 rounded-lg hover:bg-gray-50"
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
                  <Button variant="outline" size="sm" className="w-full">Log In</Button>
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
