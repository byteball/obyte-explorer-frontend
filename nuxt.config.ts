// https://nuxt.com/docs/api/configuration/nuxt-config
import { getPathToServer } from "./configs/pathToExplorer";
import { isDevNet } from "./configs/isDevNet";

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: !isDevNet,

  app: {
    head: {
      htmlAttrs: {
        "data-theme": "light",
      },
      script: [
        {
          type: 'module',
          src: '/js/cytoscape.min.js'
        },
        {
          type: 'module',
          src: '/js/dagre.min.js'
        },
      ]
    }
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxt-alt/proxy',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-bugsnag',
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
        target: getPathToServer(),
      },
      "/socket.io": {
        target: getPathToServer(),
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
