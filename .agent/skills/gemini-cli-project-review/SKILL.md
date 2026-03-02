---
name: gemini-cli-project-review
description: >
  Codex가 현재 프로젝트 콘텐츠 파일을 수집한 뒤 gemini-cli 비대화형 모드로 검수 보고서를 생성하는 스킬.
  "gemini-cli로 검수", "프로젝트 콘텐츠를 Gemini로 리뷰", "외부 LLM으로 docs/mdx 품질 점검"처럼
  콘텐츠 품질 진단과 개선 제안이 필요한 요청에서 사용한다.
---

# Gemini Cli Project Review

## Overview

Codex가 프로젝트 파일을 직접 읽어 검수 컨텍스트를 만들고, `gemini-cli`를 비대화형(`-p`)으로 실행해
`reviews/` 아래 마크다운 보고서를 생성한다.

## Workflow

### Step 1. 전제 조건 확인

1. 프로젝트 루트에서 실행한다.
2. `gemini` 명령이 존재하는지 확인한다.
3. 인증 실패 시 사용자에게 `gemini` 1회 대화형 실행(로그인) 필요를 안내한다.

### Step 2. 검수 범위 결정

기본 범위:

- `src/content`
- `docs`
- `README.md`
- `REQUIREMENTS.md`

사용자가 경로나 파일을 지정하면 `--scope`로 추가한다.
기본 범위를 완전히 바꾸려면 `--clear-default-scope`를 함께 사용한다.

### Step 3. 검수 기준 로드

검수 기준이 필요하면 `references/review-criteria.md`를 읽어 프롬프트 관점을 고정한다.

### Step 4. 스크립트 실행

기본 실행:

```bash
bash .agent/skills/gemini-cli-project-review/scripts/run_review.sh
```

범위 지정:

```bash
bash .agent/skills/gemini-cli-project-review/scripts/run_review.sh \
  --scope src/components \
  --scope app \
  --output reviews/gemini-ui-review.md
```

사전 점검(dry-run):

```bash
bash .agent/skills/gemini-cli-project-review/scripts/run_review.sh --dry-run
```

### Step 5. 결과 후처리

1. 생성된 보고서에서 `critical`/`major` 이슈를 우선 정리한다.
2. 근거 경로와 수정 제안이 누락된 항목은 보완 요청 후 재실행한다.
3. 사용자에게 요약 시 파일 경로와 우선순위를 명시한다.

## Guardrails

1. 비밀키, 토큰, 개인정보 파일은 검수 입력 범위에 포함하지 않는다.
2. 기본적으로 텍스트 계열 파일만 전달한다.
3. 컨텍스트가 너무 크면 스크립트의 `--max-context-bytes`로 제한하고 분할 실행한다.
