import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 터널(lol-dev.hansoljj.com)이 IPv4 127.0.0.1:5173으로 연결하므로 주소와 포트를 고정한다.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    allowedHosts: ['lol-dev.hansoljj.com'],
    // Discord 프록시·터널을 거치면 HMR 웹소켓도 https 기본 포트로 들어온다.
    hmr: { clientPort: 443 },
    // 봇의 액티비티 서버(127.0.0.1:8790)로 HTTP와 WebSocket을 함께 넘긴다.
    proxy: {
      '/pick-api': { target: 'http://127.0.0.1:8790', ws: true },
    },
  },
})
