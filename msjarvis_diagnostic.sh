#!/bin/bash

echo "===== Ms. Jarvis Diagnostic ====="
echo "Project root: $(pwd)"
echo

echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"
echo

echo "Checking backend running status..."
if pgrep -f "backendlib/app.js" > /dev/null; then
  echo "Ms. Jarvis backend is running."
else
  echo "Ms. Jarvis backend is NOT running."
fi
echo

echo "Listing agents directory:"
ls -1 backendlib/brain/agents
echo

echo "Checking MsJarvisPDFs folder:"
ls -1 backendlib/brain/MsJarvisPDFs 2>/dev/null || echo "MsJarvisPDFs folder not found!"
echo

echo "Checking .env variables:"
grep -v '^#' .env 2>/dev/null || echo ".env file not found!"
echo
echo "===== End Diagnostic ====="
