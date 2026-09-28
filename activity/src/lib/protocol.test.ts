// protocol.ts의 수신 메시지 검증 테스트
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hello, state, USER } from '../test/fixtures.ts'
import { decodeServerMessage, parseServerMessage, parseTokenResponse } from './protocol.ts'

describe('parseServerMessage', () => {
  it('규격 예시 메시지를 받아들인다', () => {
    assert.ok(parseServerMessage(hello()))
    assert.ok(parseServerMessage(state()))
    assert.ok(parseServerMessage({ t: 'pong', id: 'p-3', c: 12345.67, s: 1790000000123 }))
    assert.ok(
      parseServerMessage({
        t: 'reply',
        id: 'd-1',
        ok: false,
        code: 'not_allowed',
        message: '운영 모드에서는 데모 카운트다운을 쓸 수 없습니다.',
        state_version: 3,
      }),
    )
  })

  it('데모 카운트다운 state를 받아들인다', () => {
    const demo = state({
      game_id: 'demo',
      phase: 'picking',
      turn_id: 'demo-1',
      deadline_ms: 1790000020000,
      grace_ms: 2000,
      state_version: 4,
    })
    assert.deepEqual(parseServerMessage(demo), demo)
  })

  it('모르는 추가 필드는 허용한다', () => {
    const msg = { ...state(), future_field: { x: 1 } }
    assert.equal(parseServerMessage(msg), msg)
    assert.ok(parseServerMessage(hello({ extra: true, user: { ...USER, banner: 'b' } })))
  })

  it('필수 필드가 없으면 거부한다', () => {
    const { server_epoch: _drop, ...noEpoch } = state()
    assert.equal(parseServerMessage(noEpoch), null)
    assert.equal(parseServerMessage({ t: 'pong', id: 'p-1', c: 1 }), null)
    const { me: _me, ...noMe } = state()
    assert.equal(parseServerMessage(noMe), null)
    // null로 보내야 하는 필드를 생략해도 거부한다.
    const { deadline_ms: _deadline, ...noDeadline } = state()
    assert.equal(parseServerMessage(noDeadline), null)
  })

  it('필드 타입이 다르면 거부한다', () => {
    assert.equal(parseServerMessage(state({ state_version: '3' })), null)
    assert.equal(parseServerMessage(state({ state_version: 1.5 })), null)
    assert.equal(parseServerMessage(state({ phase: 'unknown' })), null)
    assert.equal(parseServerMessage(state({ deadline_ms: '1790000020000' })), null)
    assert.equal(parseServerMessage(state({ selections: [] })), null)
    assert.equal(parseServerMessage(state({ me: { id: USER.id, role: 'admin' } })), null)
    assert.equal(parseServerMessage(hello({ user: { ...USER, id: Number(USER.id) } })), null)
    assert.equal(parseServerMessage({ t: 'pong', id: 3, c: 1, s: 2 }), null)
    assert.equal(parseServerMessage({ t: 'reply', id: 'd-1', ok: 'false', code: 'x', message: null, state_version: 1 }), null)
  })

  it('모르는 t와 객체가 아닌 값을 거부한다', () => {
    assert.equal(parseServerMessage({ ...state(), t: 'pick' }), null)
    assert.equal(parseServerMessage({ ...state(), t: 'toString' }), null)
    assert.equal(parseServerMessage({ id: 'p-1', c: 1, s: 2 }), null)
    assert.equal(parseServerMessage(null), null)
    assert.equal(parseServerMessage([hello()]), null)
    assert.equal(parseServerMessage('hello'), null)
  })
})

describe('decodeServerMessage', () => {
  it('JSON 텍스트를 해석하고 JSON 오류는 거부한다', () => {
    assert.equal(decodeServerMessage(JSON.stringify(hello()))?.t, 'hello')
    assert.equal(decodeServerMessage('{not json'), null)
    assert.equal(decodeServerMessage(new ArrayBuffer(4)), null)
  })
})

describe('parseTokenResponse', () => {
  it('성공 응답을 검증한다', () => {
    const ok = { access_token: 'a', session: 's', session_expires_ms: 1790000000000, user: USER }
    assert.equal(parseTokenResponse(ok), ok)
    assert.equal(parseTokenResponse({ ...ok, session: null }), null)
    assert.equal(parseTokenResponse({ error: 'oauth_failed' }), null)
  })
})
