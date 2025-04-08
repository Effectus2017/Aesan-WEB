import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://nutre-dev.local:4202',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
  },
});
