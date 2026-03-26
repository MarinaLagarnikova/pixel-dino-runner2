#!/usr/bin/env bash
# Runs jscpd on each uncommitted JS file individually.
# Per-file threshold catches duplication that gets diluted in batch checks.

files=$(git diff --name-only HEAD -- '*.js' 2>/dev/null | grep -v '\.test\.js$')

if [ -z "$files" ]; then
  echo "cpd:diff-each — no uncommitted JS files to check."
  exit 0
fi

failed=0
failed_files=""

while IFS= read -r file; do
  output=$(jscpd "$file" 2>&1)
  status=$?
  if [ $status -ne 0 ]; then
    echo "$output"
    echo ""
    failed=1
    failed_files="$failed_files  - $file\n"
  fi
done <<< "$files"

if [ $failed -ne 0 ]; then
  echo "cpd:diff-each — duplication threshold exceeded in:"
  echo -e "$failed_files"
  exit 1
else
  echo "cpd:diff-each — all $( echo "$files" | wc -l | tr -d ' ') files passed."
fi
