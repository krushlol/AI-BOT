"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useProStatus() {
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data?.plan === "pro") setIsPro(true)
          setLoading(false)
        }, () => {
          // profiles table may not have plan column yet — default to free
          setIsPro(false)
          setLoading(false)
        })
    })
  }, [])

  return { isPro, loading }
}
