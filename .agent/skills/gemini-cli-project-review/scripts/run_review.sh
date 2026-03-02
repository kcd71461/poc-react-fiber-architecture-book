#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  run_review.sh [options]

Options:
  --scope <path>                Add review scope (repeatable)
  --clear-default-scope         Remove default scopes before applying --scope
  --output <path>               Output markdown path
  --model <name>                Gemini model name (optional)
  --max-context-bytes <number>  Max bytes passed to Gemini (default: 700000)
  --prompt-file <path>          Append extra prompt text from file
  --dry-run                     Build context and print execution plan only
  -h, --help                    Show help

Default scopes:
  src/content
  docs
  README.md
  REQUIREMENTS.md
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../../../" && pwd)"
cd "${ROOT_DIR}"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  IS_GIT_REPO=1
else
  IS_GIT_REPO=0
fi

declare -a SCOPES=("src/content" "docs" "README.md" "REQUIREMENTS.md")
OUTPUT_PATH=""
MODEL_NAME=""
MAX_CONTEXT_BYTES=700000
PROMPT_FILE=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      [[ $# -ge 2 ]] || {
        echo "Missing value for --scope" >&2
        exit 1
      }
      SCOPES+=("$2")
      shift 2
      ;;
    --clear-default-scope)
      SCOPES=()
      shift
      ;;
    --output)
      [[ $# -ge 2 ]] || {
        echo "Missing value for --output" >&2
        exit 1
      }
      OUTPUT_PATH="$2"
      shift 2
      ;;
    --model)
      [[ $# -ge 2 ]] || {
        echo "Missing value for --model" >&2
        exit 1
      }
      MODEL_NAME="$2"
      shift 2
      ;;
    --max-context-bytes)
      [[ $# -ge 2 ]] || {
        echo "Missing value for --max-context-bytes" >&2
        exit 1
      }
      MAX_CONTEXT_BYTES="$2"
      shift 2
      ;;
    --prompt-file)
      [[ $# -ge 2 ]] || {
        echo "Missing value for --prompt-file" >&2
        exit 1
      }
      PROMPT_FILE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ${#SCOPES[@]} -eq 0 ]]; then
  echo "At least one scope is required." >&2
  exit 1
fi

if ! [[ "${MAX_CONTEXT_BYTES}" =~ ^[0-9]+$ ]]; then
  echo "--max-context-bytes must be a positive integer." >&2
  exit 1
fi

if [[ -n "${PROMPT_FILE}" && ! -f "${PROMPT_FILE}" ]]; then
  echo "Prompt file not found: ${PROMPT_FILE}" >&2
  exit 1
fi

if [[ -z "${OUTPUT_PATH}" ]]; then
  timestamp="$(date +%Y%m%d-%H%M%S)"
  OUTPUT_PATH="reviews/gemini-project-review-${timestamp}.md"
fi
mkdir -p "$(dirname "${OUTPUT_PATH}")"

if (( DRY_RUN == 0 )) && ! command -v gemini >/dev/null 2>&1; then
  echo "gemini command not found. Install gemini-cli first." >&2
  exit 1
fi

tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/gemini-project-review.XXXXXX")"
trap 'rm -rf "${tmp_dir}"' EXIT

candidates_file="${tmp_dir}/candidates.txt"
scoped_file="${tmp_dir}/scoped.txt"
included_file="${tmp_dir}/included.txt"
skipped_file="${tmp_dir}/skipped.txt"
context_file="${tmp_dir}/context.txt"

: > "${candidates_file}"
: > "${skipped_file}"

collect_scope_files() {
  local scope="$1"
  if [[ -f "${scope}" ]]; then
    printf '%s\n' "${scope}"
    return
  fi

  if (( IS_GIT_REPO == 1 )); then
    git ls-files -- "${scope}" 2>/dev/null || true
    git ls-files --others --exclude-standard -- "${scope}" 2>/dev/null || true
    return
  fi

  if [[ -d "${scope}" ]]; then
    find "${scope}" -type f 2>/dev/null || true
    return
  fi

  # shellcheck disable=SC2086
  for expanded in ${scope}; do
    [[ -f "${expanded}" ]] && printf '%s\n' "${expanded}"
  done
}

is_allowed_text_file() {
  local path="$1"
  case "${path}" in
    *.md|*.mdx|*.txt|*.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs|*.json|*.yml|*.yaml|*.css|*.html|*.sh)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

for scope in "${SCOPES[@]}"; do
  collect_scope_files "${scope}" >> "${candidates_file}"
done

sort -u "${candidates_file}" > "${scoped_file}"

: > "${included_file}"
while IFS= read -r file_path; do
  [[ -n "${file_path}" ]] || continue
  [[ -f "${file_path}" ]] || continue
  case "${file_path}" in
    .git/*|node_modules/*|.next/*|out/*|dist/*|build/*|coverage/*|reviews/*)
      continue
      ;;
    pnpm-lock.yaml|package-lock.json|yarn.lock)
      continue
      ;;
    *.png|*.jpg|*.jpeg|*.gif|*.svg|*.webp|*.ico|*.pdf|*.zip|*.tar|*.gz|*.woff|*.woff2|*.ttf|*.lock)
      continue
      ;;
  esac
  if is_allowed_text_file "${file_path}"; then
    printf '%s\n' "${file_path}" >> "${included_file}"
  fi
done < "${scoped_file}"

if [[ ! -s "${included_file}" ]]; then
  echo "No reviewable text files found in the selected scopes." >&2
  exit 1
fi

cat > "${context_file}" <<'EOF'
# Project Content Review Input

The sections below contain project files. Use exact file paths in findings.
EOF

included_count=0
skipped_count=0
context_bytes=0

while IFS= read -r file_path; do
  file_bytes="$(wc -c < "${file_path}" | tr -d '[:space:]')"
  if (( context_bytes + file_bytes > MAX_CONTEXT_BYTES )); then
    printf '%s\n' "${file_path}" >> "${skipped_file}"
    ((skipped_count += 1))
    continue
  fi

  {
    printf '\n\n===== FILE: %s =====\n' "${file_path}"
    cat "${file_path}"
    printf '\n===== END FILE: %s =====\n' "${file_path}"
  } >> "${context_file}"

  context_bytes=$((context_bytes + file_bytes))
  ((included_count += 1))
done < "${included_file}"

if (( included_count == 0 )); then
  echo "All files were skipped by context limit. Increase --max-context-bytes." >&2
  exit 1
fi

BASE_PROMPT="$(cat <<'EOF'
다음 입력은 현재 프로젝트의 파일 내용이다. 기술 문서/학습 콘텐츠 검수 관점으로 분석하라.

요구사항:
1) 사실 오류, 용어 불일치, 설명 누락, 논리 흐름 문제, 오탈자/문장 문제를 식별한다.
2) 각 이슈마다 severity(critical|major|minor), file path, 근거 인용, 개선 제안을 제시한다.
3) 즉시 수정할 Top 5 우선순위를 제시한다.
4) 한국어 Markdown으로 출력한다.

출력 구조:
- Executive Summary
- Findings
- Priority Fix Plan
- Optional Improvements
EOF
)"

EXTRA_PROMPT=""
if [[ -n "${PROMPT_FILE}" ]]; then
  EXTRA_PROMPT="$(cat "${PROMPT_FILE}")"
fi

FINAL_PROMPT="${BASE_PROMPT}"
if [[ -n "${EXTRA_PROMPT}" ]]; then
  FINAL_PROMPT="${FINAL_PROMPT}"$'\n\n'"Additional instructions:"$'\n'"${EXTRA_PROMPT}"
fi

echo "Scope count: ${#SCOPES[@]}"
echo "Included files: ${included_count}"
echo "Skipped files by context limit: ${skipped_count}"
echo "Context bytes: ${context_bytes}"
if (( skipped_count > 0 )); then
  echo "Skipped file list: ${skipped_file}"
fi

if (( DRY_RUN == 1 )); then
  echo "Dry run complete. gemini command was not executed."
  echo "Planned output: ${OUTPUT_PATH}"
  exit 0
fi

gemini_cmd=(gemini --prompt "${FINAL_PROMPT}" --output-format text)
if [[ -n "${MODEL_NAME}" ]]; then
  gemini_cmd+=(-m "${MODEL_NAME}")
fi

stderr_file="${tmp_dir}/gemini.stderr"
if ! cat "${context_file}" | "${gemini_cmd[@]}" > "${OUTPUT_PATH}" 2> "${stderr_file}"; then
  cat "${stderr_file}" >&2 || true
  echo "gemini execution failed. If authentication is not initialized, run 'gemini' once interactively." >&2
  exit 1
fi

if [[ -s "${stderr_file}" ]]; then
  cat "${stderr_file}" >&2 || true
fi

echo "Review report saved: ${OUTPUT_PATH}"
