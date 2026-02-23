# 01. 왜 Fiber가 필요했나

## 비유 소개: 단일 계산대 vs 번호표 창구

작은 카페에서 계산대가 하나면, 긴 주문이 들어올 때 뒤의 짧은 주문까지 모두 멈춥니다.
React 15의 Stack Reconciler는 비슷하게 동작했습니다. 한 번 렌더링이 시작되면 끝날 때까지 메인 스레드를 오래 붙잡을 수 있었습니다.

## 문제 정의: Stop-the-world

React 15 이전 재귀 기반 렌더링은 다음 문제가 있었습니다.

- 깊은 트리에서 한 번 시작한 작업을 중간에 멈추기 어려움
- 사용자 입력(스크롤, 클릭)보다 렌더링이 먼저 CPU를 점유할 수 있음
- 16ms 프레임 예산(60fps)을 넘기기 쉬움

즉, 브라우저 관점에서는 "인터랙션 지연"이 생겼습니다.

## 해결 방법: Fiber 도입 (React 16)

React 16의 Fiber는 트리 순회를 "작은 작업 단위"로 쪼개고, 필요할 때 브라우저에 제어권을 돌려줍니다.
핵심 아이디어는 두 가지입니다.

- OS의 Cooperative Multitasking처럼 작업을 분할하고 양보(yield)
- 대수적 효과(Algebraic Effects)처럼 "중단 후 재개" 가능한 실행 모델에서 영감
- 우선순위를 두어 긴급 업데이트를 먼저 처리

## 역사적 맥락

- 아키텍처 방향: **Sebastian Markbåge**
- 문서화/구현 확장: **Andrew Clark**
- 전환 시점: React 15(Stack Reconciler) → React 16(Fiber Reconciler)

## 간소화 의사 코드 (TypeScript)

```typescript
// Stack Reconciler 스타일: 한 번 시작하면 끝까지 재귀 호출
function renderStack(node: VNode): void {
  for (const child of node.children) {
    renderStack(child);
  }
  commit(node);
}

// Fiber 스타일: 작업을 쪼개고 중간에 양보 가능
function workLoop(deadline: number): void {
  while (nextFiber !== null && performance.now() < deadline) {
    nextFiber = performUnitOfWork(nextFiber);
  }

  if (nextFiber !== null) {
    // 아직 남아 있으면 다음 틱에서 재개
    scheduleNextTick();
  } else {
    commitRoot();
  }
}
```

## 브라우저 연동 관점

Fiber는 "React 내부 알고리즘"이지만, 실제 체감 성능은 브라우저 이벤트 루프와 맞물립니다.
그래서 다음 장에서 `MessageChannel`, `performance.now()`, `requestAnimationFrame`, `requestIdleCallback`를 함께 다룹니다.

## 실습

1. `demo/index.html`을 실행합니다.
2. `Add Long Task`를 여러 번 누릅니다.
3. `Add Urgent Task`를 누른 뒤 로그를 보면 긴급 작업이 먼저 처리되는 흐름을 확인할 수 있습니다.
