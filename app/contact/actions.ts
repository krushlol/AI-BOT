"use server"

import { createClient } from "@/lib/supabase/server"

export interface ContactFormState {
  success: boolean
  error?: string
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name") as string
  const email = formData.get("from") as string
  const subject = formData.get("subject") as string
  const message = formData.get("body") as string

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      subject,
      message,
    })

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error("Contact form error:", err)
    return { success: false, error: "Failed to send message. Please try emailing us directly." }
  }
}
