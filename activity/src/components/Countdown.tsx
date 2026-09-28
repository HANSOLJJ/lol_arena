// 데모 카운트다운의 큰 숫자와 마감 확인 중 표시
import { useRemainingSeconds } from '../hooks/useRemainingSeconds.ts'
import type { ClockAnchor } from '../lib/clock.ts'
import type { StateMessage } from '../lib/protocol.ts'
import styles from './Countdown.module.css'

interface Props {
  state: StateMessage | null
  anchor: ClockAnchor | null
}

export function Countdown({ state, anchor }: Props) {
  const deadlineMs = state?.phase === 'picking' ? state.deadline_ms : null
  const seconds = useRemainingSeconds(deadlineMs, anchor)

  if (deadlineMs === null) {
    return (
      <section className={styles.box} aria-live="polite">
        <p className={styles.idle}>진행 중인 카운트다운이 없습니다.</p>
        <p className={styles.hint}>아래 버튼으로 20초 데모를 시작할 수 있습니다.</p>
      </section>
    )
  }

  return (
    <section className={styles.box} aria-live="polite">
      {seconds === null ? null : seconds > 0 ? (
        <>
          <span className={styles.number}>{seconds}</span>
          <span className={styles.unit}>초 남음</span>
        </>
      ) : (
        <p className={styles.closing}>마감 확인 중…</p>
      )}
    </section>
  )
}
