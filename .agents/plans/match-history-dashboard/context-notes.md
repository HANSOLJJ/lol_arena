# 대전 기록 화면 구현 맥락 노트

## 주요 결정 사항 및 배경
1. **작업 범위 격리**:
   - `activity/` 디렉터리 내에만 변경 사항을 생성한다.
   - 액티비티 쪽 기존 파일(`src/App.tsx`, `src/lib/`, `src/components/`, `src/hooks/`, `src/test/`)과 루트 `index.html`, `history_data.json`은 절대 수정하지 않는다.
2. **다중 페이지 구성 (`vite.config.ts`)**:
   - `rollupOptions.input`에 기존 `index.html`과 `dashboard.html`을 모두 지정하여 두 화면이 공존할 수 있게 한다.
   - 개발 환경에서 `proxy`에 `'/history_data.json': { target: 'https://arena.hansoljj.com', changeOrigin: true }`를 추가하여 로컬에서도 실제 데이터를 테스트할 수 있게 한다.
3. **색상 및 테마 토큰**:
   - 기존 대시보드와 동일한 팔레트 적용: 배경 `#0f1115`, 패널 `#171a21`, 보조 패널 `#1d212b`, 테두리 `#262b36`, 글자 `#e6e9ef`, 흐린 글자 `#8b93a7`, 강조 `#5b8cff`.
   - 팀 색상: TEAM 1 `#5b8cff`, TEAM 2 `#ff6b5e`. 텍스트 라벨("TEAM 1", "TEAM 2") 병기.
4. **Data Dragon 로딩**:
   - 베이스 URL을 주입 가능하도록 설계하여 기본값 `https://ddragon.leagueoflegends.com`을 쓰고 향후 액티비티 환경의 `/ddragon` 프록시 경로에서도 재사용할 수 있게 한다.
   - 이미지 로드 실패 시 챔피언 이름 첫 글자를 포함한 원형 아바타로 폴백한다.
5. **순수 함수 분리 및 테스트**:
   - React 의존성 없는 `src/dashboard/lib/`에 검증, 세션 분할, 필터링, 시간 변환 로직을 집중하고 Node.js 내장 테스트 러너(`node --test`)로 완전하게 검증한다.
6. **UI 및 상태 최적화**:
   - 필터 변경 시 `GameList`에 `key` 프로퍼티를 부여하여 React의 선언적 remount를 통해 30개 단위 페이지네이션 상태(`page = 1`)가 부작용(effect) 없이 깨끗하게 초기화되도록 구성했다.
   - `visibilitychange` 이벤트와 20초 주기 `HEAD /history_data.json` 요청을 결합하여 화면 활성화 및 데이터 변경 시 자동으로 최신 전적을 불러오되, 사용자의 필터 선택 상태는 온전히 보존하도록 했다.
   - 모바일 480px 이하 뷰포트에서는 가로 스크롤 탭 바(`overflow-x: auto`), 1열 대진 배치, 28px 초상화, 최소 터치 영역 44px를 적용하여 모바일 접근성을 확보했다.

