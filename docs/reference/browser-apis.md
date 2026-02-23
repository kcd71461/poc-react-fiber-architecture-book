# 브라우저 API 레퍼런스 (Fiber 관점)

## MessageChannel

- MDN: <https://developer.mozilla.org/docs/Web/API/MessageChannel>
- 용도: 빠른 비동기 태스크를 예약할 때 사용
- Fiber 맥락: 다음 work loop를 스케줄링하는 host callback 채널

```typescript
const channel = new MessageChannel();
channel.port1.onmessage = () => flushWork();
channel.port2.postMessage(null);
```

## performance.now()

- MDN: <https://developer.mozilla.org/docs/Web/API/Performance/now>
- 용도: 밀리초 단위 고해상도 시간 측정
- Fiber 맥락: "지금 예산(예: 5ms)을 넘었는가" 판단

```typescript
const start = performance.now();
const deadline = start + 5;
if (performance.now() >= deadline) yieldToHost();
```

## requestIdleCallback

- MDN: <https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback>
- 용도: 브라우저 유휴 시간에 저우선 작업 수행
- Fiber 맥락: 비핵심 정리 작업, 통계 집계, 백그라운드 계산

```typescript
requestIdleCallback((idleDeadline) => {
  while (idleDeadline.timeRemaining() > 0 && hasBackgroundWork()) {
    runBackgroundUnit();
  }
});
```

## requestAnimationFrame

- MDN: <https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame>
- 용도: 다음 페인트 직전 콜백
- Fiber 맥락: 프레임 상태(FPS/시각화 패널) 갱신, 애니메이션 동기화

```typescript
function onFrame(ts: number) {
  updateFramePanel(ts);
  requestAnimationFrame(onFrame);
}
requestAnimationFrame(onFrame);
```

## 실무 체크 포인트

- `performance.now()` 기반 예산 계산이 있는가?
- 고우선 작업이 저우선 작업에 막히지 않는가?
- 유휴 작업을 `requestIdleCallback`로 분리했는가?
- 시각화/애니메이션 갱신을 `requestAnimationFrame`으로 묶었는가?
