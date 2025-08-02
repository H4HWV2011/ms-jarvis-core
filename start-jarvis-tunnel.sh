#!/bin/bash

TUNNEL_PORT=4000
TUNNEL_SUBDOMAIN="ms-jarvis-backend"
TUNNEL_URL="https://${TUNNEL_SUBDOMAIN}.loca.lt"
PID_FILE="$HOME/jarvis-tunnel.pid"
LOG_FILE="$HOME/jarvis-tunnel.log"

echo "🚀 Starting Ms. Jarvis Tunnel Manager..."

# Function to check if tunnel is running
check_tunnel() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "✅ Tunnel is running (PID: $PID)"
            return 0
        else
            echo "❌ Tunnel PID file exists but process is dead"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        echo "❌ No tunnel PID file found"
        return 1
    fi
}

# Function to start tunnel
start_tunnel() {
    echo "🔧 Starting localtunnel..."
    
    # Kill any existing tunnel processes
    pkill -f "localtunnel.*$TUNNEL_PORT" 2>/dev/null
    
    # Start tunnel in background with nohup
    nohup npx localtunnel --port $TUNNEL_PORT --subdomain $TUNNEL_SUBDOMAIN > "$LOG_FILE" 2>&1 &
    TUNNEL_PID=$!
    
    # Save PID
    echo $TUNNEL_PID > "$PID_FILE"
    
    echo "⏳ Waiting for tunnel to establish..."
    sleep 15
    
    # Test tunnel
    if curl -s --max-time 10 "$TUNNEL_URL/health" > /dev/null 2>&1; then
        echo "✅ Tunnel established successfully!"
        echo "🌐 URL: $TUNNEL_URL"
        echo "📋 PID: $TUNNEL_PID"
        echo "📄 Logs: $LOG_FILE"
        return 0
    else
        echo "❌ Tunnel failed to establish"
        return 1
    fi
}

# Function to stop tunnel
stop_tunnel() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "🛑 Stopping tunnel (PID: $PID)..."
        kill $PID 2>/dev/null
        rm -f "$PID_FILE"
        echo "✅ Tunnel stopped"
    else
        echo "❌ No tunnel PID file found"
        pkill -f "localtunnel.*$TUNNEL_PORT" 2>/dev/null
    fi
}

# Function to show status
show_status() {
    echo "📊 Ms. Jarvis Tunnel Status:"
    echo "=========================="
    
    if check_tunnel; then
        echo "🌐 Tunnel URL: $TUNNEL_URL"
        echo "📄 Logs: $LOG_FILE"
        echo ""
        echo "🧠 Testing Ms. Jarvis AI connection..."
        RESPONSE=$(curl -s --max-time 10 "$TUNNEL_URL/health" | jq -r '.brain_status // "No response"')
        echo "🤖 AI Status: $RESPONSE"
    fi
}

# Main script logic
case "${1:-start}" in
    start)
        if check_tunnel; then
            echo "✅ Tunnel already running"
            show_status
        else
            start_tunnel
        fi
        ;;
    stop)
        stop_tunnel
        ;;
    restart)
        stop_tunnel
        sleep 3
        start_tunnel
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the tunnel (default)"
        echo "  stop    - Stop the tunnel"
        echo "  restart - Restart the tunnel"
        echo "  status  - Show tunnel status"
        exit 1
        ;;
esac
