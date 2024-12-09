import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [vue(),
    legacy({
      target:['chrome 52'],
      additionalLegacyPolyfills:['regenerator-runtime/runtime'],
    })
  ],
  resolve: {
    alias: {
      "@": resolve("./src"),
      "@router": resolve("./src/router"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 10020,
    open: true,
    cors: true,
    proxy: {
      "/u": {
        target: "http://10.10.68.204:10010",
        changeOrigin: true,
        configure: (proxy, options) => {
          // proxy 是 'http-proxy' 的实例
        },
      },
    },
  },

})
