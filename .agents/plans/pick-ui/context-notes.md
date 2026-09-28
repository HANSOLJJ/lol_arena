# 맥락 및 결정 기록 (Context Notes)

- **2026-09-28: 프로토콜 v2 확정 내용 반영**
  - PROTOCOL_VERSION은 2로 상향하며, 2가 아닌 경우 입력을 차단하고 업데이트 필요 화면을 표시한다.
  - v1의 `demo_countdown`은 완전히 제거하고 `start`, `pick`, `result`, `reverse` 요청으로 대체한다.
  - `state`의 필수 객체 구조: `players`(6명), `pick_order`(6명 ID), `champions`(8개), `selections`(맵), `auto_assigned`(배열), `result`(completed에서만 채움), `ddragon_version`(Data Dragon 버전), `me`(권한 및 역할 정보).
  - 디자인 원본(Main.dc.html, Pc.dc.html, Pip.dc.html 등)의 HTML/CSS 명세를 분석하여 폰트('Barlow Condensed', 'IBM Plex Sans KR'), 컬러코드(TEAM 1: #5b8cff, TEAM 2: #ff6b5e, 노란색: #facc15, 경고 빨강: #ff3b3b), 그리드 및 갭을 일치시킨다.
  - 카운트다운 숫자의 매 초 변경이 전체 화면 리렌더를 유발하지 않도록 남은 시간/프로그레스 바 렌더링을 별도 서브 컴포넌트로 분리한다.
  - 개발 환경(`import.meta.env.DEV`)에서만 `?preview=<phase>` 쿼리 파라미터로 고정 state 렌더링을 지원하며, 운영 빌드에서는 포함되지 않도록 가드한다.
  - 반응형 분기: 화면 크기에 따라 3가지 모드(pip: <= 480x320, pc: >= 720px 너비, mobile: 기본 1열)를 `useLayoutMode` 훅으로 전환한다.
  - 카운트다운 렌더링 격리: 초 단위 카운트다운(`useRemainingSeconds`)을 `TurnCountdown` 내부에서만 구독하여, 초 변경 시 팀 구성/픽 순서/챔피언 그리드가 불필요하게 리렌더링되지 않도록 최적화했다.
  - 구버전 데모 전용 컴포넌트(`Countdown.tsx`, `Countdown.module.css`)는 v2 규격 반영에 따라 완전히 제거했다.
  - 액션 펜딩 및 토스트: `start`, `pick`, `result`, `reverse` 요청 처리 중 중복 클릭을 방지(`isPending`)하고, 실패 응답 message 및 성공 피드백을 토스트로 안내한다.
