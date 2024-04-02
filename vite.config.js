import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                app: './popup.html'
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