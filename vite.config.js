import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
// change output file name
export default defineConfig({    
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                app: './popup.html',
                background: 'src/background.js'
            },
            output: {
                entryFileNames: (chunk) => {
                  // Fix the name for the background script
                  if (chunk.name === 'background') {
                    return `assets/background.js`;
                  }
                  // Use default naming for other entries
                  return `assets/[name].js`;
                },
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name][extname]'
              }
        }
    },
    plugins: [react()],
    server: {
        open: '/popup.html',
        port: 3000,
        fsServe: {
            roots: ['.','src', 'src/.'],
        }
        // mimeTypes: {
        //     'application/javascript': ['js']
        // }
    }
})