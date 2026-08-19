import React from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { SUPPORT_EMAIL } from '@/lib/site'
import { ChevronLeft } from 'lucide-react'

const sections = [
  {
    title: '1. The service',
    body: 'Nafaka is a personal financial tracking and coaching application. It helps you record income and expenses, track commitments, and receive insights about your money. By creating an account or using the app, you agree to these terms.',
  },
  {
    title: '2. Not a bank — no financial services',
    body: 'Nafaka does not hold, move, lend, or invest your money. It does not connect to your bank or mobile money accounts and does not process payments. Nothing in the app is a deposit, loan, investment, or financial product. Nafaka is not regulated as a financial institution.',
  },
  {
    title: '3. Not financial advice',
    body: 'Insights, coaching, safe-to-spend calculations, and other content are general educational guidance based on the information you enter. They are not financial, legal, tax, or investment advice, and are not tailored to your specific circumstances as advice would be. You remain responsible for your own financial decisions. Seek a qualified professional for advice specific to your situation.',
  },
  {
    title: '3a. Nafaka AI',
    body: 'Nafaka AI is an automated, AI-generated coaching feature. It is experimental and can be inaccurate or incomplete. Treat every AI response as educational guidance, never as financial advice. Nafaka AI is clearly identified as an AI feature — it is not a human advisor. If you believe an AI response is harmful, misleading, or inappropriate, report it in the app (tap Report under the message) or contact us.',
  },
  {
    title: '4. Your data and your responsibility',
    body: 'You are responsible for the accuracy of the information you enter. Calculations such as balance and safe-to-spend depend entirely on what you record. You must keep your sign-in credentials secure; we are not liable for activity that occurs through an unauthorised use of your account. See the Privacy Policy for how we handle your data.',
  },
  {
    title: '5. Acceptable use',
    body: 'You agree not to misuse the app — for example, by attempting to access another person\'s data, interfering with the service, or using it for unlawful purposes. We may suspend accounts that breach these terms.',
  },
  {
    title: '6. Availability',
    body: 'We work to keep Nafaka available, but do not guarantee uninterrupted or error-free operation. The service is provided "as is" and "as available", without warranties of any kind, and we are not liable for losses arising from interruptions, errors, or the use or inability to use the service.',
  },
  {
    title: '7. Limitation of liability',
    body: 'To the maximum extent permitted by law, Nafaka is not liable for indirect, incidental, or consequential losses, or for any loss of data or financial loss you incur through use of the app — including decisions you make based on insights or calculations shown in the app.',
  },
  {
    title: '8. Changes and termination',
    body: 'We may update these terms; changes take effect when posted. You can stop using Nafaka at any time, and we may terminate or restrict access where required to protect the service or comply with law.',
  },
  {
    title: '9. Governing law',
    body: 'These terms are governed by the laws of the Republic of Uganda. Any dispute is subject to the jurisdiction of the courts of Uganda.',
  },
  {
    title: '10. Contact',
    body: `Questions about these terms can be sent to ${SUPPORT_EMAIL}.`,
  },
]

export default function TermsPage() {
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
            Terms of Service
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