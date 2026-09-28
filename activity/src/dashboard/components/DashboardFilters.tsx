// 기간, 플레이어 칩 6개, 챔피언 드롭다운 및 결과 요약 필터 바 컴포넌트
import type { PeriodOption, Session } from '../lib/types.ts'
import styles from './DashboardFilters.module.css'

export interface DashboardFiltersProps {
  period: string
  onPeriodChange: (p: string) => void
  periodOptions: PeriodOption[]
  sessions: Session[]
  players: Record<string, string>
  selectedPlayerIds: string[]
  onTogglePlayer: (id: string) => void
  champions: string[]
  selectedChampion: string
  onChampionChange: (c: string) => void
  totalCount: number
  filteredCount: number
  onResetFilters: () => void
}

export function DashboardFilters({
  period,
  onPeriodChange,
  periodOptions,
  sessions,
  players,
  selectedPlayerIds,
  onTogglePlayer,
  champions,
  selectedChampion,
  onChampionChange,
  totalCount,
  filteredCount,
  onResetFilters,
}: DashboardFiltersProps) {
  const nonSessionOptions = periodOptions.filter((opt) => opt.group !== 'session')

  const hasActiveFilters =
    selectedPlayerIds.length > 0 || selectedChampion !== ''

  return (
    <section className={styles.filterContainer} aria-label="대전 기록 필터">
      <div className={styles.row}>
        {/* 기간 선택 드롭다운 */}
        <div className={styles.selectGroup}>
          <label htmlFor="period-select" className={styles.selectLabel}>
            기간
          </label>
          <select
            id="period-select"
            className={styles.select}
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
          >
            {nonSessionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {sessions.length > 0 && (
              <optgroup label="세션별">
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* 챔피언 선택 드롭다운 */}
        <div className={styles.selectGroup}>
          <label htmlFor="champion-select" className={styles.selectLabel}>
            챔피언
          </label>
          <select
            id="champion-select"
            className={styles.select}
            value={selectedChampion}
            onChange={(e) => onChampionChange(e.target.value)}
          >
            <option value="">전체 챔피언</option>
            {champions.map((champ) => (
              <option key={champ} value={champ}>
                {champ}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 플레이어 칩 목록 */}
      <div className={styles.chipsWrapper} role="group" aria-label="플레이어 필터 (모두 출전한 판)">
        <span className={styles.chipLabel}>플레이어:</span>
        {Object.entries(players).map(([id, name]) => {
          const isSelected = selectedPlayerIds.includes(id)
          return (
            <button
              key={id}
              type="button"
              className={`${styles.chipButton} ${isSelected ? styles.active : ''}`}
              aria-pressed={isSelected}
              onClick={() => onTogglePlayer(id)}
            >
              {name}
            </button>
          )
        })}
      </div>

      {/* 결과 수 요약 및 초기화 */}
      <div className={styles.resultSummary}>
        <div className={styles.resultCount}>
          필터 결과: <b>{filteredCount}판</b> / {totalCount}판
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={onResetFilters}
          >
            선택 초기화
          </button>
        )}
      </div>
    </section>
  )
}
