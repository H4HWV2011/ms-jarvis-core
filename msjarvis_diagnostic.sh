#!/bin/bash
# MSJarvis/Vercel Diagnostic Script

set -e

echo "==== MSJarvis Diagnostic Script ===="
echo "== Date: $(date) =="

echo ""
echo "-- PROJECT ROOT CHECK --"
pwd
ls -lah

echo ""
echo "-- GIT STATUS & REMOTE --"
git status
git remote -v

echo ""
echo "-- NODE & NPM/YARN INFO --"
node -v
npm -v
if [ -f yarn.lock ]; then
  yarn -v
fi

echo ""
echo "-- DEPENDENCY AUDIT --"
npm install --legacy-peer-deps
npm audit || echo "npm audit failed, continuing..."

echo ""
echo "-- ENVIRONMENT FILES --"
ls -lah .env* || echo ".env files not found"

echo ""
echo "-- PROJECT FILES --"
find . -type f \( -iname "*jarvis*" -o -iname "*ms*" \)

echo ""
echo "-- PACKAGE.JSON JARVIS ENTRIES --"
grep -i jarvis package.json || echo "No jarvis entry in package.json"
grep -i msjarvis package.json || echo "No msjarvis entry in package.json"

echo ""
echo "-- VERCEL CONFIG --"
if [ -f vercel.json ]; then
  cat vercel.json
else
  echo "No vercel.json found"
fi

echo ""
echo "-- NEXT.JS/VERCEL BUILD TEST --"
npm run build || { echo "Build failed! Check above for errors."; exit 1; }

echo ""
echo "-- LIST ALL OUTPUT FILES --"
ls -lah .next/ 2>/dev/null || echo ".next/ not present"
ls -lah .vercel/ 2>/dev/null || echo ".vercel/ not present"

echo ""
echo "-- GIT CASE SENSITIVITY CHECK --"
git config core.ignorecase

echo ""
echo "-- TEST MSJARVIS MODULES --"
grep -iR "jarvis" . || echo "No jarvis entries found in source"
grep -iR "msjarvis" . || echo "No msjarvis entries found in source"

echo ""
echo "==== END OF DIAGNOSTIC ===="

exit 0
