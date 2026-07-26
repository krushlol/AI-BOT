"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function SignupGate() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) return
      const timer = setTimeout(() => setShow(true), 2 * 60 * 1000)
      return () => clearTimeout(timer)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) setShow(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center">
        {/* Logo */}
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
