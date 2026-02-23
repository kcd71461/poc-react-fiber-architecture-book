# React Fiber Architecture Book (Korean)

`REQUIREMENTS.md`를 기반으로 만든 학습용 전자책 초안 + 인터랙티브 데모입니다.

## 목표

React Fiber의 추상 개념을 브라우저 API 레벨 동작까지 연결해서 이해하도록 구성했습니다.
구조는 요구사항의 핵심 전략인 **비유 → 개념 → 구현**을 따릅니다.

## 포함 산출물

1. 전자책 콘텐츠 (Markdown)
2. 인터랙티브 데모 (Fiber 스케줄링/우선순위/Phase 시뮬레이터)
3. 참고 자료 (용어 사전 + 브라우저 API 레퍼런스)

## 폴더 구조

```text
.
├── REQUIREMENTS.md
├── README.md
├── docs
│   ├── glossary.md
│   ├── chapters
│   │   ├── 01-why-fiber.md
│   │   ├── 02-browser-scheduler.md
│   │   ├── 03-fiber-data-structure.md
│   │   ├── 04-render-commit-double-buffering.md
│   │   └── 05-practical-react-patterns.md
│   └── reference
│       └── browser-apis.md
└── demo
    ├── index.html
    ├── app.js
    └── styles.css
```

## 읽는 순서

1. `docs/chapters/01-why-fiber.md`
2. `docs/chapters/02-browser-scheduler.md`
3. `docs/chapters/03-fiber-data-structure.md`
4. `docs/chapters/04-render-commit-double-buffering.md`
5. `docs/chapters/05-practical-react-patterns.md`
6. `docs/glossary.md`
7. `docs/reference/browser-apis.md`

## 인터랙티브 데모 실행

브라우저에서 정적 파일로 열면 됩니다. 로컬 서버 권장:

```bash
cd demo
python3 -m http.server 4173
```

이후 `http://localhost:4173` 접속.

## 데모에서 확인할 수 있는 것

- 5ms 예산 기반 cooperative scheduling
- `Fiber mode`(양보) vs `Stack mode`(블로킹) 성능 비교
- 우선순위(긴급/일반/낮음) 처리 순서
- Render Phase(중단 가능)와 Commit Phase(동기) 분리
- `MessageChannel`, `performance.now()`, `requestAnimationFrame`, `requestIdleCallback` 사용
- `current` / `workInProgress` 트리 스왑 시각화

## 요구사항 매핑

- 역사적 맥락: `docs/chapters/01-why-fiber.md`
- 브라우저 API + MDN 링크: `docs/reference/browser-apis.md`, `docs/chapters/02-browser-scheduler.md`
- Fiber 포인터 구조: `docs/chapters/03-fiber-data-structure.md`
- Scheduler/Double Buffering/Render-Commit: `docs/chapters/04-render-commit-double-buffering.md`
- 실무 활용 가이드: `docs/chapters/05-practical-react-patterns.md`
- 용어 사전: `docs/glossary.md`
- 인터랙티브 데모: `demo/*`
