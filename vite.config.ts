import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: [
      '@angular/material',
      '@angular/cdk'
    ]
  }
});