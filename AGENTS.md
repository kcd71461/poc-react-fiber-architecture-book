## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file.

### Available skills
- chapter-review: React Fiber Architecture 전자책 챕터 URL을 한국어 독자 관점으로 리뷰하고 구조화된 피드백 문서를 생성한다. (file: /Users/kimchangdeog/workspace/github/poc-react-fiber-architecture-book/.agent/skills/chapter-review/SKILL.md)
- review-feedback-apply: `reviews/*.md` 피드백을 챕터 콘텐츠에 반영하고, 검증 완료된 리뷰 파일만 삭제한다. (file: /Users/kimchangdeog/workspace/github/poc-react-fiber-architecture-book/.agent/skills/review-feedback-apply/SKILL.md)
- gemini-cli-project-review: Codex가 `gemini-cli`를 호출해 현재 프로젝트 콘텐츠 검수 보고서를 `reviews/`에 생성한다. (file: /Users/kimchangdeog/workspace/github/poc-react-fiber-architecture-book/.agent/skills/gemini-cli-project-review/SKILL.md)

### How to use skills
- Trigger: 사용자가 `$skill-name`으로 명시하거나 요청이 스킬 설명과 명확히 일치하면 해당 스킬을 사용한다.
- Loading: 스킬을 결정하면 해당 `SKILL.md`를 먼저 읽고, 필요할 때만 `scripts/`, `references/`, `assets/`를 추가로 읽는다.
- Scope: 이 저장소에서는 우선 `.agent/skills/*`를 프로젝트 로컬 스킬로 사용한다.
- Fallback: 스킬 파일이 없거나 읽을 수 없으면 문제를 짧게 알리고 일반 워크플로로 진행한다.
