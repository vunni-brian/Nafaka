import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  metadataBase: new URL("https://nafaka-ruby.vercel.app"),
  title: {
    default: "Nafaka — AI Financial Coach",
    template: "%s — Nafaka",
  },
  description:
    "An AI financial coach that helps you understand your money, spot patterns, and make better decisions week by week.",
  applicationName: "Nafaka",
  keywords: ["Nafaka", "financial coach", "money management", "Uganda", "UGX"],
  openGraph: {
    type: "website",
    url: "https://nafaka-ruby.vercel.app",
    siteName: "Nafaka",
    title: "Nafaka — AI Financial Coach",
    description:
      "Understand your money, spot patterns, and make better decisions week by week.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nafaka — AI Financial Coach",
    description:
      "Understand your money, spot patterns, and make better decisions week by week.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
