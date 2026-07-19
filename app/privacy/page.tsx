import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — CarAdvisor",
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: July 2025</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
          <p>When you create an account or sign in with Google, we collect your name and email address. When you save cars or use our tools, we store that activity linked to your account.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and personalize CarAdvisor features (saved cars, quiz results)</li>
            <li>To send account-related emails (sign-up confirmation, password reset)</li>
            <li>To improve the site through anonymized usage analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Google OAuth</strong> — optional sign-in</li>
            <li><strong>Google Analytics</strong> — anonymized site usage</li>
          </ul>
          <p className="mt-2">Each service has its own privacy policy. We do not sell your data to any third party.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Data Storage</h2>
          <p>Your account data is stored securely with Supabase. We retain your data for as long as your account is active. You may request deletion at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cookies</h2>
          <p>We use cookies solely to maintain your login session. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Contact</h2>
          <p>Questions about this policy? Email us at <a href="mailto:arush@caradvisor.app" className="text-orange-500 hover:underline">arush@caradvisor.app</a>.</p>
        </section>
      </div>
    </main>
  )
}
