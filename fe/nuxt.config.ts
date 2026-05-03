export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/icon',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],
  icon: {
    collections: ['ic', 'mdi'],
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'vue3-toastify',
        'pinia-plugin-persistedstate',
        'yup',
      ],
    },
  },
  css: ['~/assets/css/tailwind.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  googleFonts: {
    families: {
      'Open Sans': true,
    },
  },
  runtimeConfig: {
    baseUrlApiInternal:
      process.env.NUXT_BASE_URL_API_INTERNAL || process.env.NUXT_PUBLIC_BASE_URL_API,
    public: {
      baseUrlApi: process.env.NUXT_PUBLIC_BASE_URL_API,
      baseUrlWs: process.env.NUXT_PUBLIC_BASE_URL_WS,
    },
  },
})
