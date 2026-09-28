// Discord 안에서 보이는 1단계 화면: 연결 상태, 사용자, 카운트다운, 데모 시작, RTT 통계
import { useState } from 'react'
import { useActivity, type AuthState } from '../hooks/useActivity.ts'
import type { RttStats } from '../lib/clock.ts'
import type { ConnectionSnapshot } from '../lib/connection.ts'
import styles from './ActivityScreen.module.css'
import { Countdown } from './Countdown.tsx'

const DEMO_SECONDS = 20

type Tone = 'ok' | 'wait' | 'bad'

function statusOf(auth: AuthState, snapshot: ConnectionSnapshot | null): { label: string; tone: Tone } {
  if (auth.kind === 'login_required') return { label: '다시 로그인 필요', tone: 'bad' }
  switch (snapshot?.status) {
    case 'connected':
      return { label: '연결됨', tone: 'ok' }
    case 'disconnected':
      return { label: '연결 끊김', tone: 'bad' }
    case 'reauth_required':
      return { label: '다시 로그인 필요', tone: 'bad' }
    case 'update_required':
      return { label: '업데이트 필요', tone: 'bad' }
    default:
      return { label: '연결 중', tone: 'wait' }
  }
}

const ms = (v: number | null) => (v === null ? '–' : `${Math.round(v)}ms`)

function RttPanel({ rtt }: { rtt: RttStats }) {
  return (
    <dl className={styles.rtt} aria-label="서버 왕복 시간">
      <div>
        <dt>샘플</dt>
        <dd>{rtt.count}</dd>
      </div>
      <div>
        <dt>p50</dt>
        <dd>{ms(rtt.p50)}</dd>
      </div>
      <div>
        <dt>p95</dt>
        <dd>{ms(rtt.p95)}</dd>
      </div>
      <div>
        <dt>최대</dt>
        <dd>{ms(rtt.max)}</dd>
      </div>
    </dl>
  )
}

export function ActivityScreen() {
  const { auth, snapshot, login, startDemoCountdown } = useActivity()
  const [notice, setNotice] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const status = statusOf(auth, snapshot)
  const user = snapshot?.user ?? (auth.kind === 'ok' ? auth.user : null)
  const state = snapshot?.state ?? null
  const counting = state?.phase === 'picking'
  const canStart = snapshot?.status === 'connected' && !counting && !sending

  const onStart = () => {
    setSending(true)
    setNotice(null)
    startDemoCountdown(DEMO_SECONDS)
      .then((reply) => {
        if (!reply.ok) setNotice(reply.message ?? `데모를 시작하지 못했습니다. (${reply.code})`)
      })
      .catch(() => setNotice('데모를 시작하지 못했습니다. 연결이 끊겼습니다. 다시 연결되면 눌러 주세요.'))
      .finally(() => setSending(false))
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.status} data-tone={status.tone}>
          <span className={styles.dot} aria-hidden="true" />
          {status.label}
        </span>
        <span className={styles.user}>{user ? (user.global_name ?? user.username) : ''}</span>
      </header>

      {auth.kind === 'login_required' ? (
        <section className={styles.message}>
          <p>{auth.message}</p>
          <p className={styles.sub}>Discord 계정으로 로그인해야 카운트다운을 볼 수 있습니다.</p>
          <button type="button" className={styles.primary} onClick={login}>
            Discord로 로그인
          </button>
        </section>
      ) : snapshot?.status === 'update_required' ? (
        <section className={styles.message}>
          <p>새 버전이 나왔습니다.</p>
          <p className={styles.sub}>액티비티를 닫았다가 다시 열어 주세요.</p>
        </section>
      ) : (
        <Countdown state={state} anchor={snapshot?.anchor ?? null} />
      )}

      <footer className={styles.footer}>
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
        <button type="button" className={styles.primary} onClick={onStart} disabled={!canStart}>
          {DEMO_SECONDS}초 데모 카운트다운 시작
        </button>
        <RttPanel rtt={snapshot?.rtt ?? { count: 0, p50: null, p95: null, max: null }} />
      </footer>
    </main>
  )
}
