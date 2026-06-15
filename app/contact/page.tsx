import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/cars/navbar"
import { Mail, MessageSquare, Clock, Car } from "lucide-react"
import ContactForm from "@/components/contact/contact-form"

export const metadata = {
  title: "Contact Us — AutoDrive",
  description: "Get in touch with the AutoDrive team.",
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-blue-300" />
          <h1 className="text-4xl font-extrabold mb-3">Get in Touch</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Have a question, suggestion, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 gap-8">

          {/* Contact info cards */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Reach Us</h2>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Email</p>
                <a
                  href="mailto:arushchirp@gmail.com"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  arushchirp@gmail.com
                </a>
                <p className="text-sm text-gray-500 mt-1">Best for general inquiries and feedback</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Response Time</p>
                <p className="text-gray-700 font-medium">Usually within 24–48 hours</p>
                <p className="text-sm text-gray-500 mt-1">We read every message personally</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Car Suggestions</p>
                <p className="text-gray-700 text-sm">Want a specific car added to our curated database? Send us the make and model — we&apos;ll research and add it.</p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="font-bold text-blue-900 mb-3">Common Questions</h3>
              <div className="space-y-3">
                {[
                  { q: "Is AutoDrive free to use?", a: "Yes, completely free. No subscription required." },
                  { q: "How often is car data updated?", a: "Curated data is reviewed regularly. Live NHTSA data is fetched in real time." },
                  { q: "Can I suggest a feature?", a: "Absolutely — email us your idea and we&apos;ll consider it for a future update." },
                ].map(({ q, a }) => (
                  <div key={q}>
                    <p className="text-sm font-semibold text-blue-800">{q}</p>
                    <p className="text-sm text-blue-700 mt-0.5">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
