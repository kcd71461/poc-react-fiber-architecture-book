import fs from "node:fs";

const target = "src/content/chapters/01-why-fiber.mdx";
const requiredHeadings = [
  "## 비유 소개",
  "## 문제 정의",
  "## 해결 방법",
  "## 기술적 구현 (TypeScript 의사 코드)",
  "## 다음 장 예고: 브라우저와 시간을 나누는 문제",
  "## 실습 예제 (코드리뷰형)",
  "## 오해 바로잡기",
  "## 요약 체크리스트",
];

const requiredKeywords = [
  "React 15",
  "React 16",
  "Stop-the-world",
  "Sebastian Markbage",
  "Andrew Clark",
  "MessageChannel",
  "performance.now",
  "cooperative multitasking",
  "algebraic effects",
];

const content = fs.readFileSync(target, "utf-8");

const missingHeadings = requiredHeadings.filter((heading) => !content.includes(heading));
const missingKeywords = requiredKeywords.filter((keyword) => !content.includes(keyword));

if (missingHeadings.length || missingKeywords.length) {
  if (missingHeadings.length) {
    console.error("Missing headings:", missingHeadings.join(", "));
  }
  if (missingKeywords.length) {
    console.error("Missing keywords:", missingKeywords.join(", "));
  }
  process.exit(1);
}

console.log("Content validation passed for", target);
