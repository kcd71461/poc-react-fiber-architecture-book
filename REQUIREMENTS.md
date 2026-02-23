# React Fiber Architecture Ebook - 요구사항 명세서

## 1. 핵심 컨셉 및 방향성

이 전자책의 목표는 **React Fiber의 추상적인 개념을 구체적인 브라우저 레벨 동작에 매핑**하여 설명하는 것입니다.

### 교육 전략
**"비유 → 개념 → 구현"** (샌드위치 방식)을 따라 인지 부하를 최소화하면서도 기술적 깊이를 유지합니다.

## 2. 핵심 요구사항 및 범위

### 2.1 역사적 맥락 ("왜?")

- **Stack Reconciler에서 Fiber로의 전환** (React 15 → React 16)
  - "Stop-the-world" 문제: 재귀적 렌더링이 메인 스레드를 차단하는 이슈 해결
  
- **영감의 원천**
  - **OS 스케줄링** (Cooperative Multitasking)
  - **대수적 효과** (Algebraic Effects)

- **핵심 인물**
  - **Sebastian Markbåge**: 아키텍트
  - **Andrew Clark**: 문서화 및 구현

### 2.2 기술적 심층 분석

#### 브라우저 API 통합
다음 브라우저 API와의 필수 통합을 다루며, **MDN 링크를 필수로 제공**해야 합니다:

- `MessageChannel`
- `Performance.now()`
- `requestIdleCallback`
- `requestAnimationFrame`

#### 데이터 구조
- **재귀적 트리**에서 **연결 리스트**(Fiber Node)로의 전환
- Fiber Node의 포인터 구조:
  - `child`: 자식 노드
  - `sibling`: 형제 노드
  - `return`: 부모 노드
- 작업의 일시 중지 및 재개를 가능하게 하는 구조

#### 핵심 메커니즘

##### Scheduler
- React가 5ms마다 브라우저에게 제어권을 반환하는 방식
- 작업 우선순위 관리

##### Double Buffering
- 그래픽 렌더링과의 비교
- `current` 트리와 `workInProgress` 트리의 스왑 메커니즘

##### 단계 구분
- **Render Phase**
  - 비동기적
  - 중단 가능 (Interruptible)
  - Virtual DOM 업데이트
  
- **Commit Phase**
  - 동기적
  - 중단 불가능
  - 실제 DOM 업데이트

## 3. 교육적 특징

### 3.1 비유 우선 접근법
각 장은 **친근한 비유**로 시작해야 합니다:
- 예시: 레스토랑 웨이터, 극장 무대 등

### 3.2 멘탈 모델 코드
- 실제 React 소스 코드로 독자를 압도하지 않음
- 핵심 로직을 담은 **간소화된 의사 코드(Pseudo-code)** 제공
- 개념적 이해에 집중

### 3.3 용어 사전
다음 용어들에 대한 명확한 정의 제공:

- **Reconciler** (조정자)
- **Renderer** (렌더러)
- **Scheduler** (스케줄러)
- **Fiber** (파이버)
- **VDOM** (Virtual DOM)

## 4. 콘텐츠 구성 권장사항

각 주요 개념은 다음 구조를 따릅니다:

1. **비유 소개**: 일상적인 예시로 개념 도입
2. **문제 정의**: 왜 이 개념이 필요한가?
3. **해결 방법**: Fiber가 어떻게 문제를 해결하는가?
4. **기술적 구현**: 간소화된 코드 예제
5. **브라우저 연동**: 실제 브라우저 API와의 통합
6. **실습 예제**: 독자가 직접 시도할 수 있는 코드

## 5. 기술 스택 및 도구

### 필수 참조 문서
- React 공식 문서
- MDN Web Docs (브라우저 API)
- React 소스 코드 (참조용)

### 코드 예제
- TypeScript 기반 의사 코드
- 주석이 풍부한 설명
- 단계별 실행 시각화

## 6. 실무 활용 가이드

> [!IMPORTANT]
> Fiber 아키텍처 이해는 단순한 이론이 아닌 **실무에서 즉시 적용 가능한 지식**입니다.

### 6.1 성능 최적화

#### 불필요한 리렌더링 방지
Fiber의 작동 원리를 이해하면 다음 도구들을 **더 효과적으로** 활용할 수 있습니다:

- **`React.memo`**: Fiber가 컴포넌트를 어떻게 비교하는지 이해
- **`useMemo`/`useCallback`**: 메모이제이션이 Fiber 트리에 미치는 영향
- **Key Props**: Fiber가 key를 사용해 재사용 여부를 결정하는 방식

**실무 예시:**
```typescript
// Fiber 이해 전: 무분별한 최적화
const Component = React.memo(({ data }) => { ... });

// Fiber 이해 후: 렌더링 우선순위 고려한 최적화
const Component = ({ data, isPriority }) => {
  const processedData = useMemo(() => 
    heavyComputation(data), 
    [data]
  );
  
  // isPriority가 낮으면 startTransition으로 감싸기
  return isPriority ? <Result data={processedData} /> 
                    : <DeferredResult data={processedData} />;
};
```

#### Concurrent Features 활용
Fiber의 우선순위 시스템을 이해하면 React 18+의 기능을 제대로 활용 가능:

- **`useTransition`**: 긴급하지 않은 업데이트를 낮은 우선순위로 처리
- **`useDeferredValue`**: 값 업데이트를 지연시켜 UI 응답성 향상
- **`Suspense`**: 비동기 렌더링의 작동 원리 이해

**실무 예시:**
```typescript
// 검색 입력 최적화
const [isPending, startTransition] = useTransition();
const [searchTerm, setSearchTerm] = useState('');

const handleSearch = (value) => {
  setSearchTerm(value); // 즉시 업데이트 (긴급)
  startTransition(() => {
    // 무거운 필터링은 낮은 우선순위로
    setFilteredResults(expensiveFilter(value));
  });
};
```

### 6.2 디버깅 능력 향상

#### React DevTools Profiler 완벽 이해
Fiber 내부를 알면 Profiler의 데이터를 **정확히 해석** 가능:

- **Flame Graph**: Fiber 트리 순회 순서 시각화
- **Ranked Chart**: 어떤 컴포넌트가 렌더링 시간을 독점하는지
- **Commits**: Render Phase와 Commit Phase의 실제 소요 시간

**실무 활용:**
- "왜 이 컴포넌트가 리렌더링되나?" → Fiber의 비교 알고리즘 이해로 해결
- "왜 이 업데이트가 느리나?" → Scheduler의 우선순위 큐 분석

#### 성능 병목 지점 파악
```typescript
// Fiber 이해 전: "그냥 느리다"
<List items={hugeArray} />

// Fiber 이해 후: 병목 원인 정확히 진단
// 1. Render Phase가 오래 걸리는가? → 컴포넌트 분할
// 2. Commit Phase가 오래 걸리는가? → DOM 조작 최소화
// 3. 중간에 다른 작업이 끼어드나? → 우선순위 조정
```

### 6.3 최신 React 기능 이해

#### Server Components의 작동 원리
Fiber 아키텍처를 알면 **Server Components가 왜 필요한지** 이해:

- 서버에서 Fiber 트리를 미리 구성
- 클라이언트는 이미 준비된 트리를 받아 Hydration만 수행
- 번들 크기 감소 + 초기 로딩 속도 향상

#### Streaming SSR
```typescript
// Fiber의 Suspense가 가능하게 함
<Suspense fallback={<Spinner />}>
  <SlowComponent /> {/* 나중에 스트리밍 */}
</Suspense>
```

### 6.4 실무 코드 작성 패턴

#### 상태 업데이트 배칭 (Batching)
```typescript
// React 18 이전: 이벤트 핸들러 밖에서는 배칭 안됨
setTimeout(() => {
  setCount(c => c + 1); // 리렌더링 1
  setFlag(f => !f);     // 리렌더링 2
}, 1000);

// React 18+: Fiber의 자동 배칭으로 해결
// → 한 번만 리렌더링
```

#### useEffect 실행 타이밍 이해
```typescript
// Fiber Phase 이해로 정확한 타이밍 제어
useLayoutEffect(() => {
  // Commit Phase 직후, DOM 업데이트 완료
  // 브라우저 Paint 전 (동기)
});

useEffect(() => {
  // Commit Phase 후, 브라우저 Paint 후 (비동기)
  // 부수 효과는 여기서
});
```

### 6.5 외부 라이브러리 통합

#### 애니메이션 라이브러리와의 조화
```typescript
// Fiber의 스케줄링을 방해하지 않는 패턴
import { useSpring } from 'react-spring';
import { startTransition } from 'react';

const MyComponent = () => {
  const [props, api] = useSpring(() => ({ x: 0 }));
  
  const handleClick = () => {
    // 애니메이션: 긴급 (60fps 유지)
    api.start({ x: 100 });
    
    // 데이터 업데이트: 비긴급
    startTransition(() => {
      updateBackendData();
    });
  };
};
```

#### Non-React 코드와의 통합
```typescript
// Fiber의 Commit Phase에 맞춰 D3.js 통합
useLayoutEffect(() => {
  const svg = d3.select(svgRef.current);
  // DOM이 완전히 업데이트된 후 D3 조작
  svg.selectAll('circle')
     .data(data)
     .transition()
     .attr('r', d => d.value);
}, [data]);
```

### 6.6 실무 체크리스트

전자책을 학습한 후 독자가 할 수 있어야 하는 것:

- [ ] React DevTools Profiler를 보고 성능 문제의 원인 파악
- [ ] `useTransition`과 `useDeferredValue`를 적절한 상황에 적용
- [ ] 불필요한 리렌더링을 Fiber 관점에서 분석하고 해결
- [ ] Server Components와 Client Components의 역할 구분
- [ ] Suspense Boundary를 전략적으로 배치
- [ ] 외부 라이브러리와 React의 스케줄링 충돌 해결
- [ ] 복잡한 애플리케이션의 렌더링 우선순위 설계

## 7. 품질 기준

### 기술적 정확성
- React 팀의 공식 설명과 일치
- 브라우저 API 사용법 정확성
- 성능 측정 가능한 예제

### 교육적 효과성
- 초보자도 이해 가능한 비유
- 단계적 난이도 상승
- 실습을 통한 학습 강화

### 시각화
- Fiber 트리 구조 다이어그램
- 렌더링 프로세스 플로우차트
- Before/After 비교 이미지

## 7. 프로젝트 산출물

1. **전자책 콘텐츠**
   - Markdown 형식
   - 장별 분리
   - 코드 예제 포함

2. **인터랙티브 데모**
   - Fiber 동작 시각화
   - 성능 비교 도구
   - 스케줄링 시뮬레이터

3. **참고 자료**
   - 용어 사전
   - API 레퍼런스
   - 추가 학습 자료 링크

## 8. 성공 지표

- 독자가 React Fiber의 작동 원리를 설명할 수 있음
- 브라우저 API와 React의 통합을 이해함
- 성능 최적화를 위한 Fiber 활용법을 숙지함
- 실제 프로젝트에 개념을 적용할 수 있음
