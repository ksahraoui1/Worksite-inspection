import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', '')
  const supabaseUrl = env.SUPABASE_URL || 'http://localhost:54321'
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || ''

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: `${supabaseUrl}/functions/v1`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
