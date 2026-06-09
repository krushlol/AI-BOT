import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia" as any,
})

export const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID!
export const STRIPE_ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID!

export { FREE_COMPARE_LIMIT, PRO_COMPARE_LIMIT, FREE_SAVE_LIMIT, PRO_SAVE_LIMIT } from "./plans"
