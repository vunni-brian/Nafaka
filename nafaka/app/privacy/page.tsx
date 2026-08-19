import React from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { ChevronLeft } from 'lucide-react'

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'Support email not yet configured'

const sections = [
  {
    title: '1. Who we are',
    body: 'Nafaka ("we", "us") provides a personal financial tracking and coaching application. We do not hold your money, do not connect to your bank or mobile money accounts, and do not move funds on your behalf. This policy explains what personal data we collect, why, and your rights under the Uganda Data Protection and Privacy Act, 2019.',
  },
  {
    title: '2. What we collect',
    body: 'Account data: the name, email address, and/or phone number you provide when signing in. Financial data: amounts, categories, notes, commitments, and other information you enter yourself, plus onboarding answers such as income type, priorities, and notification preferences. Messages: questions you submit to the Nafaka AI Coach and the AI responses needed to provide the coaching service. Usage data: pages visited, features used, and app activity collected through analytics. Device or browser identifiers may be processed by PostHog when analytics is enabled. We do not collect bank logins, passwords, or access to any financial account.',
  },
  {
    title: '3. Why we collect it',
    body: 'Account data is used to identify you and sync your data across devices. Financial data is used to calculate your balance, safe-to-spend amounts, insights, and coaching — the core of the service. AI chat data is used to generate responses from the Nafaka AI Coach. Usage data is used to understand how the app is used and improve it. We collect and use this data on the basis of your consent and the legitimate operation of the service, as applicable.',
  },
  {
    title: '4. AI processing and consent',
    body: 'When you use the Nafaka AI Coach, the question and relevant financial context are sent to Google Gemini, a third-party generative AI service, so it can produce a response. Do not enter information into chat that you do not want processed by the AI provider. Nafaka does not use the AI service to make decisions about your eligibility for credit, insurance, employment, or other regulated services. AI responses are educational guidance, not financial, investment, tax, legal, or other professional advice. Where applicable, we request consent before sending personal data to third-party AI services and you can stop using the AI feature at any time.',
  },
  {
    title: '5. Service providers',
    body: 'We use third-party processors to operate Nafaka. Supabase provides authentication, database storage, and backend services. Vercel provides application hosting and delivery. Google Gemini provides the generative AI service used by the AI Coach. PostHog provides product analytics when analytics is enabled. Africa\'s Talking may provide SMS delivery for Nafaka features that use SMS. These providers process data only as needed to provide their services and may process information outside Uganda subject to their applicable safeguards and terms.',
  },
  {
    title: '6. Storage, retention and security',
    body: 'Your data is stored with our service providers and protected by reasonable technical measures, including encryption in transit, row-level access controls, and authentication safeguards. We retain account and financial data for as long as your account is active or as otherwise necessary to provide the service. AI chat data is sent to the AI provider only when you use the AI Coach. Analytics data is retained according to our analytics configuration and provider policies. When you delete your account, we delete associated account and financial data from our active systems, subject to legally required or legitimate backup retention.',
  },
  {
    title: '7. Sharing',
    body: 'We do not sell your personal data. We share data only with the service providers described above when needed to operate Nafaka, and where required by law or to protect our legal rights. We do not give advertisers access to your financial records or AI conversations for their own advertising purposes.',
  },
  {
    title: '8. Your rights and deletion',
    body: 'Under the Data Protection and Privacy Act, 2019 you may have rights to access, correct, delete, object to, or restrict processing of your personal data and to lodge a complaint with the Personal Data Protection Office (PDPO). You can delete your account directly in the app (Profile → Delete my account), or submit an external deletion request at /delete-account. Account deletion removes the associated account and financial data from our active systems, subject to any lawful retention disclosed above.',
  },
  {
    title: '9. Children',
    body: 'Nafaka is not directed at children under 13, and we do not knowingly collect their data. If you believe a child has provided us personal data, contact us and we will delete it.',
  },
  {
    title: '10. Contact',
    body: `Questions about this policy, your data, or a deletion request can be sent to ${supportEmail}.`,
  },
]

export default function PrivacyPage() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-8 pb-14">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors" aria-label="Back"><ChevronLeft size={18} /></Link>
          <h1 style={{ fontFamily: display }} className="text-lg text-foreground flex-1">Privacy Policy</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-8">Effective date: August 2026 · Uganda</p>
        <div className="space-y-7">
          {sections.map((s) => <section key={s.title}><h2 style={{ fontFamily: display }} className="text-base text-foreground font-medium mb-2">{s.title}</h2><p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p></section>)}
        </div>
        <div className="mt-8 flex gap-4 text-xs text-muted-foreground"><Link href="/delete-account" className="underline underline-offset-2">Delete account</Link><Link href="/terms" className="underline underline-offset-2">Terms</Link></div>
      </div>
    </div>
  )
}
