import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/auth/sign-up-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function SignUpPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">CarAdvisor</h1>
          <p className="text-gray-600">Create your free account</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
