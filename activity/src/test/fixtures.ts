// 테스트에서 쓰는 규격 예시 메시지 생성기 (ACTIVITY_PROTOCOL.md protocol_version 2)
import type { HelloMessage, StateMessage } from '../lib/protocol.ts'

export const USER = { id: '365414320332472332', username: 'hansol', global_name: '정한솔', avatar: 'a1b2c3' }

export const SAMPLE_PLAYERS = [
  { id: '365414320332472332', name: '정한솔', team: 'team1' as const, wins: 12 },
  { id: '111111111111111111', name: '사무엘', team: 'team1' as const, wins: 9 },
  { id: '222222222222222222', name: '유성호', team: 'team1' as const, wins: 15 },
  { id: '333333333333333333', name: '청명사냥꾼', team: 'team2' as const, wins: 7 },
  { id: '444444444444444444', name: '보링', team: 'team2' as const, wins: 11 },
  { id: '555555555555555555', name: '윤재철', team: 'team2' as const, wins: 10 },
]

export const SAMPLE_PICK_ORDER = [
  '333333333333333333',
  '111111111111111111',
  '555555555555555555',
  '444444444444444444',
  '365414320332472332',
  '222222222222222222',
]

export const SAMPLE_CHAMPIONS = [
  { id: 'Ahri', name: '아리' },
  { id: 'MonkeyKing', name: '오공' },
  { id: 'TwistedFate', name: '트위스티드 페이트' },
  { id: 'Leona', name: '레오나' },
  { id: 'Zed', name: '제드' },
  { id: 'Annie', name: '애니' },
  { id: 'Garen', name: '가렌' },
  { id: 'Sona', name: '소나' },
]

export function hello(overrides: Record<string, unknown> = {}): HelloMessage {
  return {
    t: 'hello',
    protocol_version: 2,
    server_epoch: 'epoch-a',
    server_ms: 1790000000000,
    user: USER,
    ...overrides,
  } as HelloMessage
}

export function state(overrides: Record<string, unknown> = {}): StateMessage {
  return {
    t: 'state',
    protocol_version: 2,
    server_epoch: 'epoch-a',
    game_id: null,
    state_version: 0,
    phase: 'none',
    round: null,
    season: null,
    server_ms: 1790000000000,
    start_at_ms: null,
    deadline_ms: null,
    grace_ms: null,
    turn_id: null,
    current_index: null,
    ddragon_version: null,
    players: [],
    pick_order: [],
    champions: [],
    selections: {},
    auto_assigned: [],
    result: null,
    me: {
      id: USER.id,
      role: 'spectator',
      team: null,
      can_start: true,
      can_pick: false,
      can_report: false,
      can_reverse: false,
    },
    ...overrides,
  } as StateMessage
}

export function samplePickingState(overrides: Record<string, unknown> = {}): StateMessage {
  return state({
    game_id: 'g-1790000000000',
    state_version: 41,
    phase: 'picking',
    round: 87,
    season: 2,
    server_ms: 1790000031000,
    start_at_ms: null,
    deadline_ms: 1790000045000,
    grace_ms: 2000,
    turn_id: 'g-1790000000000:2',
    current_index: 2,
    ddragon_version: '15.19.1',
    players: SAMPLE_PLAYERS,
    pick_order: SAMPLE_PICK_ORDER,
    champions: SAMPLE_CHAMPIONS,
    selections: {
      '333333333333333333': 'Zed',
      '111111111111111111': 'Sona',
    },
    auto_assigned: ['111111111111111111'],
    result: null,
    me: {
      id: '555555555555555555',
      role: 'player',
      team: 'team2',
      can_start: false,
      can_pick: true,
      can_report: false,
      can_reverse: false,
    },
    ...overrides,
  })
}
