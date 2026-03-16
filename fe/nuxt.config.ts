export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/icon',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    "@nuxt/image"
  ],
  css: ['~/assets/css/tailwind.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  googleFonts: {
    families: {
      'Open Sans': true
    }
  },
  runtimeConfig: {
    public: {
      baseUrlApi: process.env.NUXT_PUBLIC_BASE_URL_API || process.env.BASE_URL_API,
      baseUrlWs: process.env.NUXT_PUBLIC_BASE_URL_WS || process.env.BASE_URL_WS
    }
  }
})
