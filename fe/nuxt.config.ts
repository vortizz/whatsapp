export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    'nuxt-icon',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
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
      baseUrlApi: process.env.BASE_URL_API,
      baseUrlWs: process.env.BASE_URL_WS
    }
  }
})