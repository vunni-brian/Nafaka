# Google Play release checklist — Nafaka Finance

Prepared August 2026.

## Store listing

- **App name:** Nafaka Finance
- **Short description:** Understand your money, spot patterns, and make better decisions.
- **Full description:**

  Nafaka Finance is an AI-powered financial tracking and coaching app designed for people whose income does not always arrive on a fixed schedule.

  Record income and expenses, track commitments, understand your financial patterns, and review your financial health over time. The Nafaka AI Coach can explain patterns in the information you provide and offer educational guidance.

  Nafaka Finance does not hold your money, connect to your bank or mobile-money account, move funds, issue loans, provide insurance, or execute investments.

  **AI disclosure:** Nafaka AI Coach uses generative AI. AI responses are educational guidance and are not financial, investment, tax, legal, or other professional advice. Do not rely on an AI response as a substitute for a qualified professional.

  **Privacy:** Your financial information is used to provide the core tracking and coaching features. Review the Privacy Policy before using AI features. You can delete your account in the app or request deletion through the public account-deletion page.

## Financial features declaration

Google Play requires the Financial features declaration for apps on Play, including testing tracks. Nafaka should be reviewed conservatively as **Financial advice** because the AI Coach adapts guidance to user-provided financial information. The product's disclaimer should not be treated as a way to misclassify the actual functionality.

If the product is changed so that it only provides generic educational content and non-personalized calculations, reassess the declaration before submission.

## Data Safety — current implementation mapping

Declare the actual production configuration, not this document alone.

### Data collected

- **Personal info:** name, email address and/or phone number used for account access.
- **Financial info:** income/expense amounts, categories, notes, commitments, goals and related financial state entered by the user.
- **Messages:** user prompts and AI responses for the AI Coach.
- **App activity:** pages/features/events when analytics consent is granted.
- **Device/browser identifiers:** may be processed by PostHog when analytics is enabled.

### Purposes

- App functionality and account operation.
- Personalization/coaching and calculations.
- Analytics and app improvement when the user opts in.
- Security/abuse prevention where applicable.

### Sharing / processors

- Supabase — authentication, database and backend.
- Vercel — application hosting/delivery.
- Google Gemini — generative AI processing when the AI Coach is used.
- PostHog — analytics when the user opts in.
- Africa's Talking — SMS delivery for features that use SMS, if enabled in production.

### Security

- Data is transmitted over HTTPS/TLS.
- Supabase Row Level Security protects user-owned database records where configured.
- Do not claim encryption at rest unless confirmed in the production configuration and applicable provider documentation.

### Deletion

- In-app account deletion is available from Profile → Delete my account.
- External deletion requests are available at `/delete-account` on the production web domain.
- The public deletion endpoint records requests for processing; production operations must complete the associated account deletion workflow.

## App access

If Play Console marks the app as requiring access credentials, provide a permanent demo account and instructions that allow reviewers to reach the authenticated features, including AI Coach, without contacting the developer.

Do not place production secrets in this repository.

## Testing

For a newly created personal Play developer account, Google currently requires a closed test with at least 12 testers opted in continuously for at least 14 days before production access can be requested. Testers should actually exercise the app; keep a record of test feedback and fixes.

## Release signing

- Generate a secure upload keystore locally or in a secure CI secret store.
- Use RSA >= 2048 where required by the current Android/Play signing configuration.
- Never commit the keystore or passwords.
- Enrol the app in Google Play App Signing.
- Build and upload an Android App Bundle (`.aab`).
- After signing, update production App Links `assetlinks.json` with the release certificate SHA-256 fingerprint.

## Remaining owner actions

- Configure a real support email in Vercel and Play Console.
- Configure `SUPABASE_SERVICE_ROLE_KEY` in Vercel production for external deletion requests.
- Apply the Supabase Play compliance migration to production.
- Complete Google Play developer verification/account-type decision.
- Complete Financial features, Data Safety, app access and content declarations.
- Generate final store screenshots and feature graphic from the release build.
- Start closed testing when the release AAB is ready.
