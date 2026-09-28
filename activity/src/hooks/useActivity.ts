// Discord 인증과 액티비티 서버 연결을 한 번만 만들고 React 상태로 구독하는 훅
import { useCallback, useEffect, useRef, useState } from 'react'
import { browserConnectionOptions, Connection, type ConnectionSnapshot } from '../lib/connection.ts'
import { authenticate, LoginRequiredError } from '../lib/discord.ts'
import type { DiscordUser, ReplyMessage } from '../lib/protocol.ts'

export type AuthState =
  | { kind: 'pending' }
  | { kind: 'login_required'; message: string }
  | { kind: 'ok'; user: DiscordUser }

export interface Activity {
  auth: AuthState
  snapshot: ConnectionSnapshot | null
  login: () => void
  startDemoCountdown: (seconds: number) => Promise<ReplyMessage>
}

export function useActivity(): Activity {
  const [auth, setAuth] = useState<AuthState>({ kind: 'pending' })
  const [snapshot, setSnapshot] = useState<ConnectionSnapshot | null>(null)
  const connRef = useRef<Connection | null>(null)

  const signIn = useCallback((interactive: boolean) => {
    const conn = connRef.current
    if (conn === null) return
    setAuth({ kind: 'pending' })
    authenticate(interactive).then(
      (result) => {
        // 인증을 기다리는 사이 화면이 정리됐으면 버린다.
        if (connRef.current !== conn) return
        setAuth({ kind: 'ok', user: result.user })
        conn.start(result.session)
      },
      (err: unknown) => {
        if (connRef.current !== conn) return
        const message = err instanceof LoginRequiredError ? err.message : '로그인에 실패했습니다.'
        setAuth({ kind: 'login_required', message })
      },
    )
  }, [])

  useEffect(() => {
    const conn = new Connection(browserConnectionOptions())
    connRef.current = conn
    const offChange = conn.subscribe(setSnapshot)
    const offReauth = conn.onReauth(() => signIn(false))
    signIn(false)
    return () => {
      offChange()
      offReauth()
      conn.dispose()
      if (connRef.current === conn) connRef.current = null
    }
  }, [signIn])

  const login = useCallback(() => signIn(true), [signIn])

  const startDemoCountdown = useCallback((seconds: number) => {
    const conn = connRef.current
    return conn ? conn.requestDemoCountdown(seconds) : Promise.reject(new Error('연결되어 있지 않습니다.'))
  }, [])

  return { auth, snapshot, login, startDemoCountdown }
}
