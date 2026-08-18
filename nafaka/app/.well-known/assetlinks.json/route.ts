import { NextResponse } from 'next/server'

const ASSETLINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'app.nafaka',
      sha256_cert_fingerprints: [
        '4C:2C:4A:A0:20:FD:40:5D:8D:66:85:F2:F6:C3:57:8E:1D:26:0F:EA:1B:87:55:07:41:7F:BD:0D:D5:9A:F2:62',
      ],
    },
  },
]

export function GET() {
  return new NextResponse(JSON.stringify(ASSETLINKS, null, 2), {
    headers: { 'content-type': 'application/json' },
  })
}