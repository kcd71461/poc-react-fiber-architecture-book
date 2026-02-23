# 용어 사전

## Reconciler (조정자)

React 내부에서 "이전 UI 상태"와 "다음 UI 상태"를 비교해 어떤 변경이 필요한지 계산하는 계층.
Fiber는 Reconciler의 구현 전략입니다.

## Renderer (렌더러)

Reconciler가 계산한 결과를 실제 타깃 환경에 반영하는 계층.
예: `react-dom`, `react-native`.

## Scheduler (스케줄러)

작업의 우선순위와 실행 타이밍을 조절해 메인 스레드 점유를 관리하는 컴포넌트.
Fiber의 "작업 분할 + 양보" 전략을 지원합니다.

## Fiber (파이버)

React 16+의 Reconciler 아키텍처이자 노드 단위 데이터 구조.
각 노드는 `child`, `sibling`, `return` 포인터를 통해 트리를 연결합니다.

## VDOM (Virtual DOM)

실제 DOM의 추상 표현.
React는 상태 변경 시 VDOM 차이를 계산하고 필요한 변경만 실제 DOM에 반영합니다.
