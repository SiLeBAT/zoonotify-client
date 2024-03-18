import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    env: {
      BASE_URL: "http://localhost:8081"
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
