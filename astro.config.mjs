import { defineConfig } from "astro/config";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  // build: { site: "https://www.jakubkrwawicz.pl/portfolio-apps/map-app" },
  base: "/portfolio-apps/map-app",
});
