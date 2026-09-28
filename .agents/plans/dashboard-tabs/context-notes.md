# 대시보드 탭 이관 설계 및 결정 기록 (Context Notes)

작성일: 2026-09-28.

## 1. 정렬 및 동률 처리 (Tie-breaking)
- 옛 `index.html`의 `table()` 함수는 정렬 기준 값이 일치할 경우 `_n`(판수) 기준 보조 정렬을 수행한다:
  ```js
  let c = typeof va === "string" ? va.localeCompare(vb) : va - vb;
  if (c === 0) {
    const na = a._n || 0, nb = b._n || 0;
    c = na - nb;
  }
  return st.dir === "asc" ? c : -c;
  ```
  - `st.dir === "desc"`일 때 `-(c) = nb - na`가 되어 판수가 많은 행이 앞에 온다.
  - `st.dir === "asc"`일 때 `c = na - nb`가 되어 판수가 적은 행이 앞에 온다.
  - 새 순수 계산 함수에서도 이와 100% 동일한 동률 판정을 유지한다.

## 2. 반올림 및 수치 포맷
- 승률: `(w / n) * 100`. 표기 시 `toFixed(0)` 사용(정수 퍼센트).
- 번 돈(earnings): `(2 * w - n) * 0.5만`.
  - 정수면 `Number.isInteger(man) ? man : man.toFixed(1)`.
  - 양수면 `+`, 음수면 `-`, 0이면 부호 없음.
  - 0 초과: class `positive` (승리 녹색)
  - 0 미만: class `negative` (패배 빨간색)
  - 0: class `neutral` (회색)

## 3. URL 해시 지원
- 기본 탭: 대전 기록 (`#history` 또는 해시 없음).
- 개인 탭: `#player`를 기본으로 하고 요구사항의 예시인 `#personal`도 함께 매핑하여 두 해시 모두 동작하도록 처리한다.
- 2인 시너지: `#pair`
- 3인 시너지: `#trio`
- 챔피언: `#champ`
- 3:3 매치업: `#matchup`

## 4. 특이 동작 및 발견된 사항
- 개인 탭 미선택 모드: `n: games.length`. 모든 경기 참가자가 6명 고정이므로 전체 게임 수와 일치한다.
- 개인 탭 드릴다운 헤더: 상단 `drillhead`의 총 판수, 플레이 챔프 종수, 승/패는 `minGames` 슬라이더의 영향을 받지 않고 전체 경기를 기준으로 집계된다. 하단 테이블만 `minGames` 필터가 적용된다.
- 3:3 매치업 탭: 최소 판수 필터가 `Math.max(2, minGames)`로 동작하여 1판만 진행된 대진은 항상 제외된다.
- 3:3 매치업 인원 선택: 1명을 선택하면 그 사람의 팀이 왼쪽 A팀으로 고정(`flip`)되고, 1열 헤더가 `{선택자} 팀`, 2열 헤더가 `상대팀`으로 변경된다.
- 3:3 매치업 컬럼 속성: index.html에서 A팀/B팀 열은 `num: false`로 선언되어 있어 헤더 클릭 시 기본 정렬 방향이 `asc`이다. (비록 값은 승률 숫자이지만 원본 동작을 그대로 유지한다).
