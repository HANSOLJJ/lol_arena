// 대시보드 탭 목록 및 레거시 링크 렌더링 컴포넌트
import styles from './DashboardTabs.module.css'

export interface TabItem {
  key: string
  label: string
  href?: string
}

const TABS: TabItem[] = [
  { key: 'history', label: '대전 기록' },
  { key: 'player', label: '개인', href: 'legacy.html#player' },
  { key: 'pair', label: '2인 시너지', href: 'legacy.html#pair' },
  { key: 'trio', label: '3인 시너지', href: 'legacy.html#trio' },
  { key: 'champ', label: '챔피언', href: 'legacy.html#champ' },
  { key: 'matchup', label: '3:3 매치업', href: 'legacy.html#matchup' },
]

export function DashboardTabs() {
  return (
    <nav className={styles.tabNav} aria-label="대시보드 탭 목록">
      {TABS.map((tab) => {
        if (!tab.href) {
          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tabItem} ${styles.active}`}
              aria-current="page"
            >
              {tab.label}
            </button>
          )
        }
        return (
          <a
            key={tab.key}
            href={tab.href}
            className={styles.tabItem}
            title={`${tab.label} (옛 대시보드)`}
          >
            {tab.label}
          </a>
        )
      })}
    </nav>
  )
}
