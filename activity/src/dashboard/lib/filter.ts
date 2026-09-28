// 기간, 플레이어 칩, 챔피언 선택에 따라 경기 목록을 필터링하는 모듈
import type { FilterState, Game, Session } from './types.ts'

/**
 * 게임 데이터에 등장하는 모든 고유 챔피언 이름을 가나다순으로 정렬하여 추출합니다.
 */
export function extractUniqueChampions(games: Game[]): string[] {
  const champSet = new Set<string>()
  for (const g of games) {
    for (const p of g.team1) {
      if (p.champ) champSet.add(p.champ)
    }
    for (const p of g.team2) {
      if (p.champ) champSet.add(p.champ)
    }
  }
  return [...champSet].sort((a, b) => a.localeCompare(b, 'ko'))
}

/**
 * 특정 게임에 지정한 모든 플레이어가 참가(team1 또는 team2)했는지 검사합니다.
 */
export function matchAllPlayers(game: Game, playerIds: string[]): boolean {
  if (playerIds.length === 0) {
    return true
  }
  const participantIds = new Set<string>()
  for (const p of game.team1) {
    participantIds.add(p.id)
  }
  for (const p of game.team2) {
    participantIds.add(p.id)
  }

  for (const id of playerIds) {
    if (!participantIds.has(id)) {
      return false
    }
  }
  return true
}

/**
 * 특정 게임에 해당 챔피언이 등장했는지 검사합니다.
 */
export function matchChampion(game: Game, champion: string): boolean {
  if (!champion) {
    return true
  }
  return (
    game.team1.some((p) => p.champ === champion) ||
    game.team2.some((p) => p.champ === champion)
  )
}

/**
 * 기간 조건에 따라 게임 목록을 필터링합니다.
 */
export function filterByPeriod(
  games: Game[],
  period: string,
  sessions: Session[],
): Game[] {
  if (!period || period === 'all') {
    return games
  }
  if (period.startsWith('season')) {
    const seasonNum = Number(period.slice(6))
    return games.filter((g) => g.season === seasonNum)
  }
  if (period.startsWith('s')) {
    const session = sessions.find((s) => s.id === period)
    return session ? session.games : games
  }
  return games
}

/**
 * 기간, 플레이어 칩(모두 출전), 챔피언 조건을 모두 적용하여 필터링합니다.
 */
export function filterGames(
  games: Game[],
  filter: FilterState,
  sessions: Session[],
): Game[] {
  const periodFiltered = filterByPeriod(games, filter.period, sessions)

  return periodFiltered.filter((game) => {
    if (!matchAllPlayers(game, filter.selectedPlayerIds)) {
      return false
    }
    if (!matchChampion(game, filter.selectedChampion)) {
      return false
    }
    return true
  })
}
