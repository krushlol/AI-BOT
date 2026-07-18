import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AccountClient from "@/components/account/account-client"

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user) redirect("/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single()

  return (
    <AccountClient
      user={user}
      initialUsername={profile?.username ?? user.email?.split("@")[0] ?? ""}
      initialAvatarUrl={profile?.avatar_url ?? null}
    />
  )
}
