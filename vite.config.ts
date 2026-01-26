import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: "./",
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    viteSingleFile()
  ],
  build: {
    rollupOptions: {
      input: {
        app: path.resolve(process.cwd(), 'scheduler.html')
      },
      output: {
        entryFileNames: 'scheduler.js',
        assetFileNames: 'scheduler.[ext]'
      }
    }
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(process.cwd(), './src'),
    },
  },
})
