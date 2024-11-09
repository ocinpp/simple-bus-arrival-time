import { createApp } from "vue";
import { inject } from "@vercel/analytics";
import "tailwindcss/tailwind.css";
import "./style.css";
import App from "./App.vue";

inject();
createApp(App).mount("#app");
