"use server"

import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

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

    // Send email notification if API key is configured
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "CarAdvisor <onboarding@resend.dev>",
        to: "arushchirp@gmail.com",
        subject: `New contact: ${subject || "(no subject)"}`,
        html: `
          <h2>New message from CarAdvisor contact form</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "—"}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      })
    }

    return { success: true }
  } catch (err) {
    console.error("Contact form error:", err)
    return { success: false, error: "Failed to send message. Please try emailing us directly." }
  }
}
