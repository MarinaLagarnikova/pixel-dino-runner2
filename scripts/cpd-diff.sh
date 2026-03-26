#!/usr/bin/env bash
# Runs jscpd only on JS files with uncommitted changes (staged + unstaged vs HEAD).
# Skips silently if there are no changed files.

files=$(git diff --name-only HEAD -- '*.js' 2>/dev/null)

if [ -z "$files" ]; then
  echo "cpd:diff — no uncommitted JS files to check."
  exit 0
fi

echo "$files" | xargs jscpd
