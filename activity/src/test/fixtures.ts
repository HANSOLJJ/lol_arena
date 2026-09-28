// 테스트에서 쓰는 규격 예시 메시지 생성기

export const USER = { id: '365414320332472332', username: 'hansol', global_name: '정한솔', avatar: 'a1b2c3' }

export function hello(overrides: Record<string, unknown> = {}) {
  return {
    t: 'hello',
    protocol_version: 1,
    server_epoch: 'epoch-a',
    server_ms: 1790000000000,
    user: USER,
    ...overrides,
  }
}

export function state(overrides: Record<string, unknown> = {}) {
  return {
    t: 'state',
    protocol_version: 1,
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
    players: [],
    pick_order: [],
    champions: [],
    selections: {},
    auto_assigned: [],
    me: { id: USER.id, role: 'spectator' },
    ...overrides,
  }
}
