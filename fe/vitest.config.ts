import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.spec.ts'],
          environment: 'node',
          globals: true,
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.spec.ts'],
          environment: 'nuxt',
          globals: true,
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom',
            },
          },
        },
      }),
    ],
  },
})
