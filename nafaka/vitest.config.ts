import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { playwright } from '@vitest/browser-playwright'
import { argosVitestPlugin } from '@argos-ci/vitest/plugin'

const alias = { '@': path.resolve(__dirname, '.') }

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**', '**/visual/**', '**/*.visual.test.{ts,tsx}'],
        },
      },
      {
        plugins: [
          argosVitestPlugin({
            // Upload to Argos on CI only.
            uploadToArgos: !!process.env.CI,
          }),
        ],
        resolve: { alias },
        test: {
          name: 'visual',
          include: ['**/visual/**/*.test.{ts,tsx}', '**/*.visual.test.{ts,tsx}'],
          exclude: ['**/node_modules/**'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              // Stabilize text rendering so screenshots match across machines and CI.
              launchOptions: {
                args: ['--disable-lcd-text', '--font-render-hinting=none'],
              },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})