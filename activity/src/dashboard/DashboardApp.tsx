// 전적 대시보드 대전 기록 화면의 최상위 애플리케이션 컴포넌트
import { useMemo, useState } from 'react'
import { DashboardFilters } from './components/DashboardFilters.tsx'
import { DashboardHeader } from './components/DashboardHeader.tsx'
import { DashboardTabs } from './components/DashboardTabs.tsx'
import { GameList } from './components/GameList.tsx'
import './dashboard.css'
import styles from './DashboardApp.module.css'
import { useChampionPortraits } from './hooks/useChampionPortraits.ts'
import { useHistoryData } from './hooks/useHistoryData.ts'
import { extractUniqueChampions, filterGames } from './lib/filter.ts'
import { buildPeriodOptions, getDefaultPeriod, splitSessions } from './lib/session.ts'

export function DashboardApp() {
  const { data, loading, error, lastUpdated, refresh } = useHistoryData()
  const championPortraits = useChampionPortraits()

  const [period, setPeriod] = useState<string | null>(null)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [selectedChampion, setSelectedChampion] = useState<string>('')

  const allGames = useMemo(() => data?.games ?? [], [data])
  const players = useMemo(() => data?.players ?? {}, [data])

  const sessions = useMemo(() => splitSessions(allGames), [allGames])
  const periodOptions = useMemo(
    () => buildPeriodOptions(allGames, sessions),
    [allGames, sessions],
  )

  const activePeriod = period ?? getDefaultPeriod(allGames)
  const champions = useMemo(() => extractUniqueChampions(allGames), [allGames])

  const filteredGames = useMemo(() => {
    return filterGames(
      allGames,
      {
        period: activePeriod,
        selectedPlayerIds,
        selectedChampion,
      },
      sessions,
    )
  }, [allGames, activePeriod, selectedPlayerIds, selectedChampion, sessions])

  const sortedGames = useMemo(() => {
    return [...filteredGames].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    )
  }, [filteredGames])

  const handleTogglePlayer = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const handleResetFilters = () => {
    setSelectedPlayerIds([])
    setSelectedChampion('')
  }

  const filterKey = `${activePeriod}-${selectedPlayerIds.join(',')}-${selectedChampion}`

  return (
    <div className={styles.wrap}>
      <DashboardHeader
        lastUpdated={lastUpdated}
        loading={loading}
        onRefresh={refresh}
      />

      <DashboardTabs />

      {error ? (
        <div className={styles.errorContainer} role="alert">
          <div className={styles.errorTitle}>데이터를 불러오지 못했습니다.</div>
          <div>{error}</div>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => refresh()}
          >
            다시 시도
          </button>
        </div>
      ) : !data && loading ? (
        <div className={styles.loadingContainer} role="status">
          <div>전적 데이터를 불러오는 중입니다...</div>
        </div>
      ) : (
        <>
          <DashboardFilters
            period={activePeriod}
            onPeriodChange={setPeriod}
            periodOptions={periodOptions}
            sessions={sessions}
            players={players}
            selectedPlayerIds={selectedPlayerIds}
            onTogglePlayer={handleTogglePlayer}
            champions={champions}
            selectedChampion={selectedChampion}
            onChampionChange={setSelectedChampion}
            totalCount={allGames.length}
            filteredCount={filteredGames.length}
            onResetFilters={handleResetFilters}
          />

          <GameList
            key={filterKey}
            games={sortedGames}
            players={players}
            championPortraits={championPortraits}
          />
        </>
      )}
    </div>
  )
}
