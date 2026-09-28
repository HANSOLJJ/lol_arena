// time.ts 모듈의 한국 시간 변환 및 포맷팅 테스트
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatKoreanDateTime, formatTimeHHMM, getKstDateString } from './time.ts'

describe('formatKoreanDateTime', () => {
  it('UTC 2026-09-26T18:31Z를 한국 시간 9월 27일 (일) 03:31로 정확히 변환한다', () => {
    const result = formatKoreanDateTime('2026-09-26T18:31:00Z')
    assert.equal(result, '9월 27일 (일) 03:31')
  })

  it('다양한 요일과 한 자릿수 월/일에 대해 정상 포맷팅한다', () => {
    // 2025-03-28T12:26:58Z -> KST 2025-03-28 21:26 (금)
    const result = formatKoreanDateTime('2025-03-28T12:26:58Z')
    assert.equal(result, '3월 28일 (금) 21:26')
  })

  it('유효하지 않은 날짜 입력 시 빈 문자열을 반환한다', () => {
    assert.equal(formatKoreanDateTime('invalid-date'), '')
  })
})

describe('formatTimeHHMM', () => {
  it('시:분 형식으로 한국 시간을 반환한다', () => {
    assert.equal(formatTimeHHMM('2026-09-26T18:31:00Z'), '03:31')
  })
})

describe('getKstDateString', () => {
  it('YYYY-MM-DD 형식으로 한국 기준 날짜를 반환한다', () => {
    assert.equal(getKstDateString('2026-09-26T18:31:00Z'), '2026-09-27')
  })
})
