// filter.ts 모듈의 기간·플레이어·챔피언 필터링 단위 테스트
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  extractUniqueChampions,
  filterGames,
  matchAllPlayers,
  matchChampion,
} from './filter.ts'
import type { Game, Session } from './types.ts'

const sampleGames: Game[] = [
  {
    round: 1,
    season: 1,
    time: '2025-03-28T12:00:00Z',
    winner: 'team1',
    team1: [
      { id: 'p1', champ: '갈리오' },
      { id: 'p2', champ: '가렌' },
      { id: 'p3', champ: '럭스' },
    ],
    team2: [
      { id: 'p4', champ: '야스오' },
      { id: 'p5', champ: '리신' },
      { id: 'p6', champ: '징크스' },
    ],
  },
  {
    round: 2,
    season: 2,
    time: '2026-06-27T12:00:00Z',
    winner: 'team2',
    team1: [
      { id: 'p1', champ: '베인' },
      { id: 'p3', champ: '스웨인' },
      { id: 'p5', champ: '아리' },
    ],
    team2: [
      { id: 'p2', champ: '갈리오' },
      { id: 'p4', champ: '제라스' },
      { id: 'p6', champ: '문도 박사' },
    ],
  },
]

describe('extractUniqueChampions', () => {
  it('게임에 등장한 모든 챔피언을 중복 없이 한글 가나다순으로 반환한다', () => {
    const champs = extractUniqueChampions(sampleGames)
    assert.deepEqual(champs, [
      '가렌',
      '갈리오',
      '럭스',
      '리신',
      '문도 박사',
      '베인',
      '스웨인',
      '아리',
      '야스오',
      '제라스',
      '징크스',
    ])
  })
})

describe('matchAllPlayers', () => {
  it('선택된 플레이어가 없으면 항상 true를 반환한다', () => {
    assert.equal(matchAllPlayers(sampleGames[0], []), true)
  })

  it('선택된 단일 플레이어가 출전했는지 판별한다', () => {
    assert.equal(matchAllPlayers(sampleGames[0], ['p1']), true)
    assert.equal(matchAllPlayers(sampleGames[0], ['p999']), false)
  })

  it('선택된 여러 명의 플레이어가 모두 출전한 판만 true를 반환한다', () => {
    // p1과 p2는 1라운드(같은 팀)와 2라운드(다른 팀) 모두 출전
    assert.equal(matchAllPlayers(sampleGames[0], ['p1', 'p2']), true)
    assert.equal(matchAllPlayers(sampleGames[1], ['p1', 'p2']), true)

    // p1과 p4는 둘 다 출전
    assert.equal(matchAllPlayers(sampleGames[0], ['p1', 'p4']), true)

    // p1과 없는 플레이어 p999는 false
    assert.equal(matchAllPlayers(sampleGames[0], ['p1', 'p999']), false)
  })
})

describe('matchChampion', () => {
  it('챔피언 미선택 시 항상 true를 반환한다', () => {
    assert.equal(matchChampion(sampleGames[0], ''), true)
  })

  it('해당 판의 어느 팀이든 챔피언이 포함되어 있으면 true를 반환한다', () => {
    assert.equal(matchChampion(sampleGames[0], '갈리오'), true)
    assert.equal(matchChampion(sampleGames[0], '징크스'), true)
    assert.equal(matchChampion(sampleGames[0], '아리'), false)
  })
})

describe('filterGames', () => {
  const sessions: Session[] = [
    {
      id: 's0',
      index: 1,
      label: 'S01',
      date: '2025-03-28',
      roundMin: 1,
      roundMax: 1,
      games: [sampleGames[0]],
    },
  ]

  it('기간 필터(시즌별, 세션별, 전체)가 정상 작동한다', () => {
    const season1Games = filterGames(
      sampleGames,
      { period: 'season1', selectedPlayerIds: [], selectedChampion: '' },
      sessions,
    )
    assert.equal(season1Games.length, 1)
    assert.equal(season1Games[0].round, 1)

    const session0Games = filterGames(
      sampleGames,
      { period: 's0', selectedPlayerIds: [], selectedChampion: '' },
      sessions,
    )
    assert.equal(session0Games.length, 1)

    const allGames = filterGames(
      sampleGames,
      { period: 'all', selectedPlayerIds: [], selectedChampion: '' },
      sessions,
    )
    assert.equal(allGames.length, 2)
  })

  it('플레이어 여러 명과 챔피언 복합 필터가 정상 적용된다', () => {
    // p1, p2가 모두 출전하고 갈리오가 등장한 판: 1라운드(갈리오), 2라운드(갈리오) 둘 다 만족
    const filtered1 = filterGames(
      sampleGames,
      { period: 'all', selectedPlayerIds: ['p1', 'p2'], selectedChampion: '갈리오' },
      sessions,
    )
    assert.equal(filtered1.length, 2)

    // p1, p2가 모두 출전하고 '베인'이 등장한 판: 2라운드만 만족
    const filtered2 = filterGames(
      sampleGames,
      { period: 'all', selectedPlayerIds: ['p1', 'p2'], selectedChampion: '베인' },
      sessions,
    )
    assert.equal(filtered2.length, 1)
    assert.equal(filtered2[0].round, 2)
  })
})
