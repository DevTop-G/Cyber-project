#!/bin/bash

# Configuration
PROJECT_ROOT="$(pwd)"
PYTHON_EXECUTABLE="$PROJECT_ROOT/.venv/Scripts/python.exe"
BRIDGE_SCRIPT="$PROJECT_ROOT/ai_agent/bridge.py"
PORT=5001

echo "🛡️ Starting AegisAI Integrated System..."

# 1. Start Python Bridge in the background
echo "🚀 Launching AI Inference Engine..."
cd "$PROJECT_ROOT/ai_agent"
"$PYTHON_EXECUTABLE" bridge.py > bridge.log 2>&1 &
BRIDGE_PID=$!

# Function to kill bridge on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    # On Windows (Git Bash), `kill` might not terminate child processes natively.
    if command -v taskkill &> /dev/null; then
        WINPID=$(ps -p $BRIDGE_PID -o winpid 2>/dev/null | tail -n 1 | tr -d ' ')
        if [ -n "$WINPID" ] && [ "$WINPID" != "WINPID" ]; then
            taskkill -F -T -PID "$WINPID" > /dev/null 2>&1
        fi
    fi
    kill $BRIDGE_PID 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# 2. Wait for Bridge to be ready
echo "⏳ Waiting for models to load (this may take a few seconds)..."
MAX_RETRIES=60
RETRY_COUNT=0
while ! curl -s http://127.0.0.1:$PORT/health > /dev/null; do
    sleep 1
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ AI Engine failed to start. Check ai_agent/bridge.log for errors."
        if command -v taskkill &> /dev/null; then
            WINPID=$(ps -p $BRIDGE_PID -o winpid 2>/dev/null | tail -n 1 | tr -d ' ')
            if [ -n "$WINPID" ] && [ "$WINPID" != "WINPID" ]; then
                taskkill -F -T -PID "$WINPID" > /dev/null 2>&1
            fi
        fi
        kill $BRIDGE_PID 2>/dev/null
        exit 1
    fi
done

echo "✅ AI Inference Engine is READY!"

# 3. Start Next.js Frontend
echo "🌐 Starting Frontend dashboard..."
cd "$PROJECT_ROOT"
npm run dev
