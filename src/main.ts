import { createApp } from "vue";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import "./index.css";
import "./style.css";
import App from "./App.vue";

inject();
injectSpeedInsights();
createApp(App).mount("#app");
