export const runtime = "edge"

import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"
  const redirectBase = isLocalEnv ? origin : forwardedHost ? `https://${forwardedHost}` : origin
  const response = NextResponse.redirect(`${redirectBase}/`)

  const googleVerifier = request.cookies.get("google_pkce")?.value

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (googleVerifier) {
    // Direct Google OAuth — exchange code for tokens ourselves
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${redirectBase}/auth/callback`,
        grant_type: "authorization_code",
        code_verifier: googleVerifier,
      }),
    })

    const tokens = await tokenRes.json()
    response.cookies.set("google_pkce", "", { maxAge: 0, path: "/" })

    if (!tokens.id_token) {
      console.error("[auth/callback] Google token exchange failed:", tokens.error)
      return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: tokens.id_token,
      access_token: tokens.access_token,
    })

    if (!error) return response
    console.error("[auth/callback] signInWithIdToken error:", error.message)
    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
  }

  // Fallback: Supabase PKCE exchange (email magic links, etc.)
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (!error) return response
  console.error("[auth/callback] exchangeCodeForSession error:", error.message)
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
