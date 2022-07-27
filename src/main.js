import { createApp } from "vue";
import { createPinia } from "pinia";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";

import App from "./App.vue";
import router from "./router";
import { socketIoPlugin } from "./plugins/socket.io";
import { numberFormatPlugin } from "./plugins/numberFormat";
import "./index.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(socketIoPlugin, {
  url: "http://localhost:4000",
});
app.use(numberFormatPlugin);
app.use(autoAnimatePlugin);
app.mount("#app");
