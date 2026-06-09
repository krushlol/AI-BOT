import { NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_MONTHLY_PRICE_ID, STRIPE_ANNUAL_PRICE_ID } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  // Guard: detect placeholder / unconfigured Stripe keys
  const secretKey = process.env.STRIPE_SECRET_KEY ?? ""
  if (!secretKey || secretKey.includes("placeholder") || secretKey === "sk_test_") {
    return NextResponse.json(
      { error: "stripe_not_configured", message: "Stripe is not yet set up. The site owner needs to add real Stripe API keys in Vercel environment variables." },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { plan } = await req.json() // "monthly" | "annual"
    const priceId = plan === "annual" ? STRIPE_ANNUAL_PRICE_ID : STRIPE_MONTHLY_PRICE_ID

    if (!priceId || priceId.includes("placeholder")) {
      return NextResponse.json(
        { error: "stripe_not_configured", message: "Stripe price IDs are not configured. Please add STRIPE_MONTHLY_PRICE_ID and STRIPE_ANNUAL_PRICE_ID to your Vercel environment variables." },
        { status: 503 }
      )
    }

    const origin = req.headers.get("origin") || "https://autodrive-electronics.vercel.app"

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: { supabase_user_id: user.id },
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/pricing?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
