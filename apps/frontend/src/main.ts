import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import router from "./router";
import "./index.css";

createApp(App).use(createPinia()).use(router).use(VueQueryPlugin).use(i18n).mount("#app");
