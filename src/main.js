import { createApp } from "vue";
import { createPinia } from "pinia";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { createHead } from "@vueuse/head";
import { createI18n } from "vue-i18n";

import App from "./App.vue";
import router from "./router";
import { socketIoPlugin } from "./plugins/socket.io";
import "./index.css";

import en from "./locales/en.json";
import dk from "./locales/dk.json";
import cn from "./locales/cn.json";

const app = createApp(App);
const head = createHead();

const messages = {
  en,
  dk,
  cn,
};

const i18n = createI18n({
  legacy: false,
  locale: import.meta.env.VITE_LANG,
  fallbackLocale: "en",
  messages,
});

app.use(createPinia());
app.use(router);
app.use(socketIoPlugin, {
  url: import.meta.env.VITE_API_URL,
});
app.use(autoAnimatePlugin);
app.use(head);
app.use(i18n);
app.mount("#app");
