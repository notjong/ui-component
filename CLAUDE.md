# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 이 문서는 한글로 작성합니다. 코드 식별자·파일명은 영문 그대로 둡니다.

## 프로젝트 목적

"UI 컴포넌트 카탈로그 + 복사해서 쓰는 소스 페이지"를 만드는 프론트엔드 포트폴리오/데모 사이트입니다. 빌드 도구 없는 정적 사이트(GitHub Pages 배포 가정)입니다.

- 좌측: UI 요소 목록 (CareerFoundry [UI element glossary](https://careerfoundry.com/en/blog/ui-design/ui-element-glossary/)의 32개 요소 + 사이트에 꼭 필요한 공통 레이어/알림 컴포넌트: 경고(Alert), 확인(Confirm), 알림, 토스트, 스낵바, 바텀 시트 등)
- 우측: 선택한 컴포넌트의 **이름 · 정의와 설명** → 하단 **미리보기 / HTML / CSS / JS 탭**
- 각 소스 탭은 코드 하이라이트를 적용하고, **복사 버튼**으로 그대로 자기 사이트에 붙여넣을 수 있어야 합니다. JS가 필요 없는 요소는 JS 탭에 "필요하지 않습니다" 안내를 보여줍니다.

## 현재 상태

`docs/resources/component-portfolio.html`의 룩앤필(흰 배경, zinc 회색 + 파랑 포인트, Noto Sans KR / JetBrains Mono, 카테고리 그룹 사이드바, 미리보기·HTML·CSS·JS 탭)을 기준으로 구현되어 있습니다. 요소는 38개입니다.

- 1~32: CareerFoundry 원문 32개 (참고 파일에서 이식, `cat`: input / nav / info / container)
- 33~38: 공통 레이어 6종 (`cat: "layer"`) — Alert Dialog, Confirm Dialog, Toast, Snackbar, Bottom Sheet, Banner
- 코드 하이라이트(`highlight.js`), 복사 버튼, URL 해시(`#번호`) 라우팅, 모바일 메뉴 토글 구현됨

남은 개선 여지: 요소별 "정의"를 `desc`와 분리, 검색, 레이어 컴포넌트 접근성(포커스 트랩) 보강.

## 명령어

빌드·린트·테스트 도구가 없습니다. `index.html`을 브라우저에서 직접 열면 됩니다(구글 폰트 때문에 네트워크 필요). 데이터·하이라이터 점검:

```
node -e "global.window={};require('./elements.js');const E=window.ELEMENTS;console.log(E.length,new Set(E.map(e=>e.n)).size)"   # 38 38
node -e "global.window={};require('./elements.js');window.ELEMENTS.forEach(e=>new Function(e.js))"                           # 각 JS 문법
node --check app.js
```

하이라이터는 "토큰을 벗겨내면 원문과 동일"해야 합니다(요소별 html/css/js로 왕복 검사 가능).

## 아키텍처

- `elements.js` — 유일한 콘텐츠 원천. IIFE 안에서 `ELEMENTS`(1~32 두 배열)와 `LAYERS`(33~38)를 만들어 `window.ELEMENTS`, `window.CATS`(카테고리 라벨), `window.CAT_ORDER`로 노출. 요소: `{n, name, ko, cat, desc, html, css, js}`. `n`은 고유 번호이자 URL 해시.
- `highlight.js` — 의존성 없는 정규식 하이라이터 `window.highlight(src, 'html'|'css'|'js')`. 토큰 클래스 `tk-*`는 `styles.css` 하단에 정의.
- `app.js` — 사이드바(카테고리 그룹) 렌더, `select(n)`으로 상세(설명 + 탭) 렌더, 복사, 해시 라우팅.
- **핵심 메커니즘**: 미리보기 iframe(`sandbox="allow-scripts"`)은 소스 탭에 보이는 **동일한** `html`/`css`/`js` 문자열로 `srcdoc`을 만듭니다(`buildSrcdoc`). 래퍼는 리셋과 중앙 정렬만 추가하며 소스 탭에는 나오지 않습니다. `js`가 빈 문자열이면 JS 탭은 "필요하지 않습니다"를 표시합니다.

## 참고 자료 `docs/resources/`

구현 참고용 샘플이며 사이트에 포함되지 않습니다. (폴더명은 `resources`)

- `component-portfolio.html` — 가장 가까운 참조 구조. `ELEMENTS`가 `{n, name, ko, cat, desc, html, css, js}` 형태이고 `CATS`로 카테고리를 나눔. `buildSrcdoc`로 iframe 미리보기, `codeBlock`으로 탭/복사 처리. **`ui-elements-demo.html`과 바이트 단위로 동일**한 파일입니다.
- `ui-components-32-catalog.html`, `ui-component.html`(Tailwind CDN + lucide 사용) — 32개 컴포넌트 카탈로그/인터랙티브 예시.
- `alert-ui-showcase.html` — 삭제 확인·세션 만료 등 경고/확인 다이얼로그, 토스트·스낵바·배너 레이어 패턴. 공통 레이어 컴포넌트 작성 시 참조.
- `label-chip-system.html` — 라벨/칩 컴포넌트 시스템. `color-personal-card.html` — 프로필 색 팔레트 카드.
- `GITHUB_PAGES_GUIDE.md`(루트 또는 `/docs`에서 Pages 배포, push 시 자동 반영), `TROUBLE_SHOOTING.md`, `HANDOFF_TEMPLATE.md`(세션 인계 양식: 검증된 완료/실패한 시도/다음 할 일) — 운영 문서.

## 작성 규칙

- 데모 소스는 JS 템플릿 리터럴로 저장하므로 그 안에서 백틱과 `${`를 쓰지 않습니다(따옴표+문자열 연결 사용). 정규식 역슬래시는 두 번(`\\S`).
- 데모 JS는 ES5 스타일로 자체 완결되게 작성하고, 자신의 `html`에 있는 id/class만 사용합니다(격리된 iframe에서 실행).
- 데모의 JS가 필요 없으면 `js`를 빈 문자열로 둡니다.
- 디자인: 참고 파일의 토큰을 따릅니다 — 배경 `#fff`/`#fafafa`, 글자 `#18181b`, 포인트 `#2563EB`, 선 `#e4e4e7`, 모서리 6~8px. 포인트 색을 바꾸려면 `styles.css`의 `--accent`와 각 요소 css의 `#2563EB`를 함께 바꿔야 합니다.
- `display`를 지정한 요소에 `hidden` 속성을 쓰면 `display` 규칙이 이겨서 안 숨겨집니다. 이런 요소는 css에 `.x[hidden]{display:none}`을 함께 둡니다(Bento, Modal, 레이어 컴포넌트에서 이미 적용).
- 오버레이/레이어 컴포넌트(모달·토스트·바텀 시트)는 iframe 안에서 `position:fixed`로 동작하므로 미리보기 높이(360px) 안에서 보이는지 확인합니다.
