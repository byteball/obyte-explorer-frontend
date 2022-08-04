import { createApp } from "vue";
import { createPinia } from "pinia";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { createHead } from "@vueuse/head";

import App from "./App.vue";
import router from "./router";
import { socketIoPlugin } from "./plugins/socket.io";
import "./index.css";

const app = createApp(App);
const head = createHead();

app.use(createPinia());
app.use(router);
app.use(socketIoPlugin, {
  url: import.meta.env.VITE_API_URL,
});
app.use(autoAnimatePlugin);
app.use(head);
app.mount("#app");
