import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — CarAdvisor",
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: July 2025</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance</h2>
          <p>By using CarAdvisor, you agree to these terms. If you do not agree, please do not use the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Use of Service</h2>
          <p>CarAdvisor provides car research, comparison, and recommendation tools for informational purposes. You agree not to misuse the service, including attempting to access it through automated means or interfering with its operation.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Accuracy of Information</h2>
          <p>Car specifications, pricing, and depreciation estimates on CarAdvisor are provided for general guidance only. Always verify details directly with a dealer or manufacturer before making a purchase decision. We make no guarantees about the accuracy or completeness of any data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">4. User Accounts</h2>
          <p>You are responsible for maintaining the security of your account. Notify us immediately if you suspect unauthorized access. We may suspend accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Intellectual Property</h2>
          <p>All content on CarAdvisor, including text, logos, and tools, is owned by CarAdvisor. You may not reproduce or redistribute it without permission.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Limitation of Liability</h2>
          <p>CarAdvisor is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the site or reliance on its content.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Changes</h2>
          <p>We may update these terms at any time. Continued use of CarAdvisor after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Contact</h2>
          <p>Questions? Email <a href="mailto:supportcaradvisorusa@gmail.com" className="text-orange-500 hover:underline">supportcaradvisorusa@gmail.com</a>.</p>
        </section>
      </div>
    </main>
  )
}
