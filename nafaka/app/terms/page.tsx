import React from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { ChevronLeft } from 'lucide-react'

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'Support email not yet configured'

const sections = [
  { title: '1. The service', body: 'Nafaka is a personal financial tracking and coaching application. It helps you record income and expenses, track commitments, and receive educational insights about your money. By creating an account or using the app, you agree to these terms.' },
  { title: '2. Not a bank — no financial services', body: 'Nafaka does not hold, move, lend, or invest your money. It does not connect to your bank or mobile money accounts and does not process payments. Nothing in the app is a deposit, loan, investment, or financial product. Nafaka is not a regulated financial institution.' },
  { title: '3. AI Coach and not financial advice', body: 'The Nafaka AI Coach is an AI system, not a human adviser or regulated professional. Insights, coaching, safe-to-spend calculations, and AI-generated content are general educational guidance based on the information you enter. They are not financial, investment, legal, tax, lending, or other professional advice. You remain responsible for your own financial decisions and should seek a qualified professional for advice specific to your situation.' },
  { title: '4. AI processing', body: 'When you use the AI Coach, your question and relevant financial context are processed by Google Gemini to generate a response. Do not submit information you do not want processed by a third-party AI service. AI outputs may be incomplete or incorrect and should be checked before you act on them.' },
  { title: '5. Your data and responsibility', body: 'You are responsible for the accuracy of the information you enter. Calculations such as balance and safe-to-spend depend on what you record. You must keep your sign-in credentials secure; we are not liable for activity caused by unauthorised use of your account. See the Privacy Policy for how we handle your data.' },
  { title: '6. Acceptable use', body: 'You agree not to misuse the app — for example, by attempting to access another person\'s data, interfering with the service, or using it for unlawful purposes. We may suspend accounts that breach these terms.' },
  { title: '7. Availability', body: 'We work to keep Nafaka available, but do not guarantee uninterrupted or error-free operation. The service is provided "as is" and "as available", without warranties of any kind, subject to rights that cannot legally be excluded.' },
  { title: '8. Limitation of liability', body: 'To the maximum extent permitted by law, Nafaka is not liable for indirect, incidental, or consequential losses, or for financial loss arising from use of the app — including decisions you make based on insights, calculations, or AI-generated content.' },
  { title: '9. Changes and termination', body: 'We may update these terms; changes take effect when posted. You can stop using Nafaka at any time, and we may terminate or restrict access where required to protect the service or comply with law.' },
  { title: '10. Governing law', body: 'These terms are governed by the laws of the Republic of Uganda. Any dispute is subject to the jurisdiction of the courts of Uganda.' },
  { title: '11. Contact', body: `Questions about these terms can be sent to ${supportEmail}.` },
]

export default function TermsPage() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-8 pb-14">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors" aria-label="Back"><ChevronLeft size={18} /></Link>
          <h1 style={{ fontFamily: display }} className="text-lg text-foreground flex-1">Terms of Service</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-8">Effective date: August 2026 · Uganda</p>
        <div className="space-y-7">{sections.map((s) => <section key={s.title}><h2 style={{ fontFamily: display }} className="text-base text-foreground font-medium mb-2">{s.title}</h2><p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p></section>)}</div>
        <div className="mt-8 flex gap-4 text-xs text-muted-foreground"><Link href="/privacy" className="underline underline-offset-2">Privacy</Link><Link href="/delete-account" className="underline underline-offset-2">Delete account</Link></div>
      </div>
    </div>
  )
}
