// https://nuxt.com/docs/api/configuration/nuxt-config
import { getPathToServer } from "./configs/pathToExplorer";
import { isDevNet } from "./configs/isDevNet";

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: !isDevNet,
  srcDir: ".",

  app: {
    head: {
      htmlAttrs: {
        "data-theme": "light",
      },
      script: [{ type: 'module', src: '/js/cytoscape.min.js' }],
    }
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-bugsnag',
  ],

  build: {
    transpile: ['echarts', 'resize-detector'],
  },

  i18n: {
    restructureDir: '.',
    strategy: 'no_prefix',
    vueI18n: './i18n.config.ts'
  },
  runtimeConfig: {
    explorerUpstream: isDevNet ? getPathToServer() : import.meta.env.VITE_PATH_TO_LOCAL_SERVER || getPathToServer(),
  },

  tailwindcss: { viewer: false },

  postcss: {
    plugins: {
      'tailwindcss/nesting': false,
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  bugsnag: {
    disabled: !import.meta.env.VITE_BUGSNAG_API_KEY,
    publishRelease: true,
    projectRoot: __dirname,
    config: {
      apiKey: import.meta.env.VITE_BUGSNAG_API_KEY,
    }
  },

  css: ['~/assets/css/index.css'],
  compatibilityDate: '2025-03-14',
})
