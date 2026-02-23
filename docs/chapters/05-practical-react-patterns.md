# 05. 실무 활용 패턴

## 비유 소개: 응급실 트리아지

응급실은 모든 환자를 도착 순서대로 보지 않습니다.
React Fiber도 업데이트를 같은 급으로 다루지 않습니다.

## 문제 정의

대규모 UI에서 모든 업데이트를 즉시 동기 처리하면 입력 지연이 발생합니다.

## 해결 방법

React 18+의 Concurrent 기능을 Fiber 우선순위 모델과 함께 사용합니다.

- `useTransition`: 비긴급 업데이트를 낮은 우선순위로
- `useDeferredValue`: 값 전파를 지연해 입력 반응성 보존
- `Suspense`: 비동기 경계로 부분 렌더링

## 실무 예시 1: 검색 입력 최적화

```typescript
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query);

function onChange(next: string) {
  setQuery(next); // 긴급: 즉시 UI 반영
  startTransition(() => {
    // 비긴급: 무거운 필터링
    setResults(expensiveFilter(next));
  });
}

const visibleList = useMemo(
  () => expensiveFilter(deferredQuery),
  [deferredQuery]
);
```

## 실무 예시 2: 불필요한 리렌더링 점검

```typescript
const Row = React.memo(function Row({ item }: { item: Item }) {
  return <li>{item.name}</li>;
});

function List({ items }: { items: Item[] }) {
  const stableItems = useMemo(() => items, [items]);
  return <ul>{stableItems.map((item) => <Row key={item.id} item={item} />)}</ul>;
}
```

Fiber 관점 포인트:

- `key` 안정성이 Fiber 재사용률을 좌우함
- 참조 안정성(`useMemo`, `useCallback`)이 비교 비용을 줄임

## 실무 예시 3: 외부 라이브러리 통합 타이밍

```typescript
useLayoutEffect(() => {
  // Commit 이후 DOM이 확정된 시점에서 안전하게 조작
  drawChart(containerRef.current, data);
}, [data]);

useEffect(() => {
  // 비동기 부수효과(로깅, 네트워크)는 여기서
  sendAnalytics(data);
}, [data]);
```

## DevTools Profiler 해석

- Flame Graph: 어떤 Fiber 서브트리가 시간을 많이 쓰는가
- Commits: Render 비용 vs Commit 비용 분리
- Ranked: 상위 병목 컴포넌트 우선 개선

## 학습 완료 체크리스트

- [ ] 성능 문제를 Render/Commit 중 어디서 발생하는지 분리 진단
- [ ] `useTransition`/`useDeferredValue` 적용 기준 설명
- [ ] `key` 변경이 Fiber 재사용에 미치는 영향 설명
- [ ] Suspense 경계 배치 전략 설계
- [ ] 외부 라이브러리 DOM 조작 타이밍 결정
