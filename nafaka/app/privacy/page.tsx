import React from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { ChevronLeft } from 'lucide-react'

const sections = [
  {
    title: '1. Who we are',
    body: 'Nafaka ("we", "us") provides a personal financial tracking and coaching application. We do not hold your money, do not connect to your bank or mobile money accounts, and do not move funds on your behalf. This policy explains what personal data we collect, why, and your rights under the Uganda Data Protection and Privacy Act, 2019.',
  },
  {
    title: '2. What we collect',
    body: 'Account data: the name, email address, and/or phone number you provide when signing in. Financial data: amounts, categories, notes, commitments, and other information you enter yourself, plus your onboarding answers (income type, priorities, and notification preferences). Usage data: pages visited and features used, collected through analytics. We do not collect bank logins, passwords, or access to any financial account.',
  },
  {
    title: '3. Why we collect it',
    body: 'Account data is used to identify you and sync your data across devices. Financial data is used to calculate your balance, safe-to-spend amounts, insights, and coaching — the core of the service. Usage data is used to understand how the app is used and improve it. We collect and use this data on the basis of your consent, which you give when you create an account and may withdraw at any time.',
  },
  {
    title: '4. Consent',
    body: 'When you sign up and complete onboarding, you consent to the collection and use of your data as described here. Consent choices you make during onboarding — such as notification preferences — are respected and can be changed at any time. You can withdraw consent or ask us to delete your data by contacting us (see section 9).',
  },
  {
    title: '5. Storage and security',
    body: 'Your data is stored securely with our hosting providers and protected by reasonable technical measures, including encryption in transit, row-level access controls, and passwords or one-time codes for authentication. We retain your data for as long as your account is active. You can delete your account at any time in the app (Profile → Delete my account), which permanently removes your account, your financial data, and your coaching history from our systems. Data remaining in backups is deleted or anonymised on the schedule our hosting providers apply.',
  },
  {
    title: '6. Sharing',
    body: 'We do not sell your personal data. We share data only with the service providers needed to run the app — hosting (Supabase, Vercel) and analytics (PostHog) — all bound to keep your data confidential. Where a service provider processes data outside Uganda, we rely on providers that apply appropriate safeguards. We may share data if required by law or to protect our legal rights.',
  },
  {
    title: '7. Your rights',
    body: 'Under the Data Protection and Privacy Act, 2019 you have the right to access, correct, and delete your personal data, to object to or restrict its processing, and to lodge a complaint with the Personal Data Protection Office (PDPO). You can delete your account directly in the app (Profile → Delete my account), or exercise any other right by contacting us — we will respond within the timeframes required by law.',
  },
  {
    title: '8. Children',
    body: 'Nafaka is not directed at children under 13, and we do not knowingly collect their data. If you believe a child has provided us personal data, contact us and we will delete it.',
  },
  {
    title: '9. Contact',
    body: 'Questions about this policy or your data can be sent to the Nafaka support address shown in your profile. We may update this policy from time to time; changes will be posted here with a new effective date.',
  },
]

export default function PrivacyPage() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-8 pb-14">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontFamily: display }} className="text-lg text-foreground flex-1">
            Privacy Policy
          </h1>
        </div>

        <p className="text-xs text-muted-foreground mb-8">Effective date: August 2026 · Uganda</p>

        <div className="space-y-7">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 style={{ fontFamily: display }} className="text-base text-foreground font-medium mb-2">
                {s.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}