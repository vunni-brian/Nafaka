import type { CapacitorConfig } from '@capacitor/cli'

const appUrl = process.env.NAFAKA_APP_URL ?? 'https://nafaka-ruby.vercel.app'

const config: CapacitorConfig = {
  appId: 'app.nafaka',
  appName: 'Nafaka',
  webDir: '.next',
  server: {
    url: appUrl,
    cleartext: false,
  },
  android: {
    backgroundColor: '#13161f',
  },
}

export default config
