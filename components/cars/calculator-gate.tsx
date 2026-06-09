"use client"

import Navbar from "./navbar"
import { Calculator, Lock, Check, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CalculatorGateProps {
  user: { email?: string } | null
}

const PRO_PERKS = [
  "Monthly payment estimator with live sliders",
  "Principal vs. interest breakdown chart",
  "Compare payments across different loan terms",
  "Pre-fill price from any car in our catalog",
  "Compare up to 4 cars side-by-side",
  "Save unlimited cars to your dashboard",
  "Download PDF comparison sheets",
  "Ad-free experience",
]

export default function CalculatorGate({ user }: CalculatorGateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Icon */}
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Calculator className="w-10 h-10 text-blue-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Car Loan Calculator
        </h1>
        <p className="text-gray-500 mb-2 text-lg">
          This tool is available to <span className="font-semibold text-blue-700">AutoDrive Pro</span> members.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Instantly estimate monthly payments, total interest, and true cost of ownership — before you step into any dealership.
        </p>

        {/* Feature list */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" /> What you get with Pro
          </p>
          <ul className="space-y-2.5">
            {PRO_PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/pricing">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 gap-2 w-full sm:w-auto">
              <Zap className="w-4 h-4" /> Upgrade to Pro
            </Button>
          </Link>
          {!user && (
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {!user && (
          <p className="text-xs text-gray-400 mt-4">
            Already have Pro?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:underline">Sign in</Link> to access it.
          </p>
        )}
      </div>
    </div>
  )
}
