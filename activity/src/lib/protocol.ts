// 액티비티 서버와 주고받는 메시지 타입과 수신 JSON 런타임 검증 (ACTIVITY_PROTOCOL.md protocol_version 1)

export const PROTOCOL_VERSION = 1

export const PHASES = ['none', 'starting', 'picking', 'awaiting_result', 'completed', 'aborted'] as const
export type Phase = (typeof PHASES)[number]

export type Role = 'player' | 'spectator'

export interface DiscordUser {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
}

export interface HelloMessage {
  t: 'hello'
  protocol_version: number
  server_epoch: string
  server_ms: number
  user: DiscordUser
}

export interface PongMessage {
  t: 'pong'
  id: string
  c: number
  s: number
}

export interface StateMessage {
  t: 'state'
  protocol_version: number
  server_epoch: string
  game_id: string | null
  state_version: number
  phase: Phase
  round: number | null
  season: number | null
  server_ms: number
  start_at_ms: number | null
  deadline_ms: number | null
  grace_ms: number | null
  turn_id: string | null
  current_index: number | null
  // 목록 항목의 형식은 4단계에서 정한다.
  players: unknown[]
  pick_order: unknown[]
  champions: unknown[]
  selections: Record<string, unknown>
  auto_assigned: unknown[]
  me: { id: string; role: Role }
}

export interface ReplyMessage {
  t: 'reply'
  // JSON 오류처럼 서버가 요청 ID를 읽지 못한 경우에는 null일 수 있다.
  id: string | null
  ok: boolean
  code: string
  message: string | null
  state_version: number | null
}

export type ServerMessage = HelloMessage | PongMessage | StateMessage | ReplyMessage

export type ClientMessage =
  | { t: 'ping'; id: string; c: number }
  | { t: 'sync'; id: string }
  | { t: 'demo_countdown'; id: string; seconds: number }

export interface TokenResponse {
  access_token: string
  session: string
  session_expires_ms: number
  user: DiscordUser
}

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isInt = (v: unknown): v is number => Number.isInteger(v)
const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
const isArr = (v: unknown): v is unknown[] => Array.isArray(v)
const orNull =
  <T>(check: (v: unknown) => v is T) =>
  (v: unknown): v is T | null =>
    v === null || check(v)

function isUser(v: unknown): v is DiscordUser {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.username) &&
    orNull(isStr)(v.global_name) &&
    orNull(isStr)(v.avatar)
  )
}

function isHello(m: Obj): boolean {
  return isInt(m.protocol_version) && isStr(m.server_epoch) && isInt(m.server_ms) && isUser(m.user)
}

function isPong(m: Obj): boolean {
  return isStr(m.id) && isNum(m.c) && isInt(m.s)
}

function isState(m: Obj): boolean {
  const me = m.me
  return (
    isInt(m.protocol_version) &&
    isStr(m.server_epoch) &&
    orNull(isStr)(m.game_id) &&
    isInt(m.state_version) &&
    (PHASES as readonly unknown[]).includes(m.phase) &&
    orNull(isInt)(m.round) &&
    orNull(isInt)(m.season) &&
    isInt(m.server_ms) &&
    orNull(isInt)(m.start_at_ms) &&
    orNull(isInt)(m.deadline_ms) &&
    orNull(isInt)(m.grace_ms) &&
    orNull(isStr)(m.turn_id) &&
    orNull(isInt)(m.current_index) &&
    isArr(m.players) &&
    isArr(m.pick_order) &&
    isArr(m.champions) &&
    isObj(m.selections) &&
    isArr(m.auto_assigned) &&
    isObj(me) &&
    isStr(me.id) &&
    (me.role === 'player' || me.role === 'spectator')
  )
}

function isReply(m: Obj): boolean {
  return (
    orNull(isStr)(m.id) &&
    isBool(m.ok) &&
    isStr(m.code) &&
    orNull(isStr)(m.message) &&
    orNull(isInt)(m.state_version)
  )
}

const validators: Record<ServerMessage['t'], (m: Obj) => boolean> = {
  hello: isHello,
  pong: isPong,
  state: isState,
  reply: isReply,
}

/** 서버 메시지 형식이 맞으면 그대로 돌려주고, 필수 필드 누락·타입 오류·모르는 t면 null을 돌려준다. 모르는 추가 필드는 허용한다. */
export function parseServerMessage(raw: unknown): ServerMessage | null {
  if (!isObj(raw) || !isStr(raw.t) || !Object.hasOwn(validators, raw.t)) return null
  return validators[raw.t as ServerMessage['t']](raw) ? (raw as unknown as ServerMessage) : null
}

/** WebSocket 텍스트 프레임을 해석한다. JSON 오류도 null이다. */
export function decodeServerMessage(text: unknown): ServerMessage | null {
  if (!isStr(text)) return null
  try {
    return parseServerMessage(JSON.parse(text))
  } catch {
    return null
  }
}

/** POST /pick-api/token 성공 응답을 검증한다. */
export function parseTokenResponse(raw: unknown): TokenResponse | null {
  if (
    isObj(raw) &&
    isStr(raw.access_token) &&
    isStr(raw.session) &&
    isInt(raw.session_expires_ms) &&
    isUser(raw.user)
  ) {
    return raw as unknown as TokenResponse
  }
  return null
}
