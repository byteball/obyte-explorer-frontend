// https://nuxt.com/docs/api/configuration/nuxt-config
import { pathToExplorer } from "./configs/pathToExplorer";

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/i18n',
    '@nuxt-alt/proxy',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  build: {
    transpile: ['echarts', 'resize-detector'],
  },
  i18n: {
    vueI18n: './i18n.config.ts'
  },
  proxy: {
    debug: false,
    experimental: {
      listener: true
    },
    proxies: {
      "/api": {
        target: pathToExplorer,
      },
      "/socket.io": {
        target: pathToExplorer,
        ws: true
      },
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: ['~/assets/css/index.css'],
  alias: {
    pinia: "/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs"
  }
})
