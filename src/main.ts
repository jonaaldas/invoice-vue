import { createApp } from "vue";
import App from "./App.vue";
import "./assets/index.css";
import router from "./router/index";
import toasterPlugin from "./plugins/toaster";
import { createPinia } from 'pinia'
const pinia = createPinia()

const app = createApp(App);
app.use(pinia);
app.use(toasterPlugin);
app.use(router);
app.mount("#app");
