import type { CapacitorConfig } from '@capacitor/cli'

const appUrl = process.env.NAFAKA_APP_URL ?? 'https://nafaka.app'

const config: CapacitorConfig = {
  appId: 'app.nafaka',
  appName: 'Nafaka',
  // The app loads a remote URL (server.url), so no bundled web build is
  // needed — webDir only holds a stub to satisfy the Capacitor tooling.
  webDir: 'web',
  server: {
    url: appUrl,
    cleartext: false,
  },
  android: {
    backgroundColor: '#13161f',
  },
}

export default config