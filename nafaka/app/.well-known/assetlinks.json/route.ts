import { NextResponse } from 'next/server'

const fingerprint = process.env.ANDROID_RELEASE_CERT_SHA256?.trim()

export function GET() {
  if (!fingerprint) return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })

  return NextResponse.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'app.nafaka',
        sha256_cert_fingerprints: [fingerprint],
      },
    },
  ], { headers: { 'Cache-Control': 'public, max-age=300' } })
}
