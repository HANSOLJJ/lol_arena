// 전적 대시보드의 React 렌더링 진입점
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <div>전적 대시보드 로딩 중...</div>
    </StrictMode>,
  )
}
