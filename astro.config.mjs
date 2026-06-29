

import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  security: {
    checkOrigin: false // Desactiva la verificación estricta de CSRF para peticiones locales
  }
});