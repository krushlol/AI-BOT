"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const AUTH_PATHS = ["/sign-up", "/sign-in", "/auth"]

export default function SignupGate() {
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  const onAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))

  useEffect(() => {
    if (onAuthPage) return
    const supabase = createClient()
    let timer: ReturnType<typeof setTimeout>

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) return


      const GATE_MS = 2 * 60 * 1000
      const key = "ca_first_visit"
      const stored = localStorage.getItem(key)
      const firstVisit = stored ? parseInt(stored, 10) : Date.now()
      if (!stored) localStorage.setItem(key, String(firstVisit))

      const elapsed = Date.now() - firstVisit
      const remaining = GATE_MS - elapsed

      if (remaining <= 0) {
        setShow(true)
      } else {
        timer = setTimeout(() => setShow(true), remaining)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) setShow(false)
    })
    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [onAuthPage])

  if (!show || onAuthPage) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg width="32" height="32" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="13" stroke="#f97316" strokeWidth="2.5"/>
            <circle cx="15" cy="15" r="3.5" fill="#f97316"/>
            <line x1="15" y1="2" x2="15" y2="11.5" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="15" y1="18.5" x2="15" y2="28" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="2" y1="15" x2="11.5" y2="15" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="18.5" y1="15" x2="28" y2="15" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="text-xl font-bold text-slate-900">Car<span className="text-orange-500">Advisor</span></span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enjoying CarAdvisor?</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Create a free account to keep browsing, save your favorite cars, and get personalized recommendations.
        </p>

        <Link href="/sign-up" className="w-full">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11 text-base">
            Create Free Account
          </Button>
        </Link>
      </div>
    </div>
  )
}
