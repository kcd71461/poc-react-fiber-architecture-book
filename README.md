# React Fiber Architecture Ebook

React Fiber 내부 설계를 설명하는 전자책 웹앱입니다.

## 현재 상태

- Nextra + MDX 기반 전자책 앱 골격 구성 완료
- 01장(`왜 Fiber가 필요했나`) 우선 공개
- 리뷰 후 02장 이후 순차 확장 예정

## 실행

```bash
pnpm install
pnpm dev
```

- 로컬: <http://localhost:3000/book>

## 품질 검사

```bash
pnpm run validate:content
pnpm build
```

## 배포

- GitHub Pages (Actions)
- `main` push 시 정적 산출물(`out/`) 배포

## 주요 경로

- 플랜 문서: `/Users/kimchangdeog/workspace/github/poc-react-fiber-architecture-book/docs/plans/ebook-rebuild-plan.md`
- 01장: `/Users/kimchangdeog/workspace/github/poc-react-fiber-architecture-book/src/content/chapters/01-why-fiber.mdx`
- 앱 라우트: `/Users/kimchangdeog/workspace/github/poc-react-fiber-architecture-book/app/book/[[...mdxPath]]/page.tsx`
