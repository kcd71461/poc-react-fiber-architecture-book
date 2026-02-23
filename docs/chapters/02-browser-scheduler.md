# 02. 브라우저와 Scheduler의 연결

## 비유 소개: 지휘자와 박자

오케스트라 지휘자는 연주를 멈추지 않게 하면서도 파트를 나눠 지시합니다.
Fiber Scheduler도 비슷하게 "지금 처리할 일"과 "잠깐 브라우저에 양보할 시점"을 조율합니다.

## 문제 정의

메인 스레드는 React만 쓰는 공간이 아닙니다.

- 입력 이벤트 처리
- 레이아웃/페인트
- 애니메이션 프레임
- 타 라이브러리 작업

React가 독점하면 UI가 끊기고, 너무 자주 양보하면 완료가 늦어집니다.

## 해결 방법

Fiber Scheduler는 보통 다음 전략을 취합니다.

- 작업을 작은 단위로 실행
- `performance.now()`로 시간 예산 측정
- 예산을 넘기면 `MessageChannel` 등으로 다음 턴 예약
- 프레임 단위 상태는 `requestAnimationFrame`에서 관찰
- 유휴 시간 작업은 `requestIdleCallback`로 밀어넣기

## 핵심 브라우저 API

- `MessageChannel`: 빠른 태스크 스케줄링
- `performance.now()`: 고해상도 시간 측정
- `requestAnimationFrame`: 페인트 주기 맞춘 UI 갱신
- `requestIdleCallback`: 유휴 시점의 저우선 작업

자세한 정의와 링크는 `docs/reference/browser-apis.md` 참고.

## 간소화 의사 코드 (TypeScript)

```typescript
type Priority = 1 | 2 | 3; // 1 = urgent

interface Task {
  id: number;
  priority: Priority;
  units: number;
  label: string;
}

const taskQueue: Task[] = [];
let scheduled = false;
const channel = new MessageChannel();

channel.port1.onmessage = () => {
  scheduled = false;
  const deadline = performance.now() + 5; // 5ms budget

  while (taskQueue.length > 0 && performance.now() < deadline) {
    const task = pickHighestPriorityTask(taskQueue);
    performUnit(task);
  }

  if (taskQueue.length > 0) {
    scheduleHostCallback();
  }
};

function scheduleHostCallback() {
  if (scheduled) return;
  scheduled = true;
  channel.port2.postMessage(null);
}
```

## 브라우저 연동 체크포인트

1. 렌더링 루프가 5ms 근처에서 양보하는지 로그로 확인
2. 긴급 작업(입력)은 낮은 우선순위 작업보다 먼저 처리되는지 확인
3. `requestAnimationFrame` 기반 UI 패널이 끊기지 않는지 확인

## 실습

- 데모에서 `Auto Inject Tasks`를 켠 뒤 `Start Scheduler` 실행
- `Frame Budget` 표시와 `Phase` 로그를 같이 보면서 양보 타이밍 확인
- `Comparison Mode`를 `Fiber`와 `Stack`으로 바꿔 `Last Slice`/`FPS` 차이 비교
