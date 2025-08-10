#!/bin/bash

SERVICE_NAME="Ms-Jarvis-AI"
COMPOSE_DIR="$HOME/ms-jarvis-core"
TUNNEL_SUBDOMAIN="ms-jarvis-backend"
LOG_DIR="$HOME/ms-jarvis-logs"
PID_FILE="$HOME/.ms-jarvis.pid"

# Create log directory
mkdir -p "$LOG_DIR"

# Function to start all services
start_services() {
    echo "🚀 Starting $SERVICE_NAME Complete System..."
    
    # Start Docker services
    cd "$COMPOSE_DIR"
    docker compose up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Start persistent tunnel with better reliability
    start_tunnel
    
    # Save main process PID
    echo $$ > "$PID_FILE"
    
    echo "✅ $SERVICE_NAME system started successfully!"
    log_status
}

# Function to start tunnel with retry logic
start_tunnel() {
    local max_retries=5
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        echo "🔗 Starting tunnel (attempt $((retry_count + 1))/$max_retries)..."
        
        # Kill any existing tunnels
        pkill -f "localtunnel.*4000" 2>/dev/null
        
        # Start tunnel with logging
        nohup npx localtunnel --port 4000 --subdomain "$TUNNEL_SUBDOMAIN" \
            > "$LOG_DIR/tunnel.log" 2>&1 &
        TUNNEL_PID=$!
        
        # Wait and test
        sleep 15
        
        if curl -s --max-time 10 "https://$TUNNEL_SUBDOMAIN.loca.lt/health" > /dev/null 2>&1; then
            echo "✅ Tunnel established successfully (PID: $TUNNEL_PID)"
            echo "$TUNNEL_PID" > "$HOME/.ms-jarvis-tunnel.pid"
            return 0
        else
            echo "❌ Tunnel failed, retrying..."
            retry_count=$((retry_count + 1))
            sleep 10
        fi
    done
    
    echo "❌ Failed to establish tunnel after $max_retries attempts"
    return 1
}

# Function to check system health
check_health() {
    local all_healthy=true
    
    echo "🔍 Checking $SERVICE_NAME System Health..."
    echo "========================================"
    
    # Check Docker services
    cd "$COMPOSE_DIR"
    if ! docker compose ps | grep -q "Up"; then
        echo "❌ Docker services not running"
        all_healthy=false
    else
        echo "✅ Docker services running"
    fi
    
    # Check local AI
    if curl -s --max-time 5 http://localhost:4000/health > /dev/null 2>&1; then
        echo "✅ Local AI responding"
    else
        echo "❌ Local AI not responding"
        all_healthy=false
    fi
    
    # Check tunnel
    if curl -s --max-time 10 "https://$TUNNEL_SUBDOMAIN.loca.lt/health" > /dev/null 2>&1; then
        echo "✅ Tunnel connection active"
    else
        echo "❌ Tunnel connection failed"
        all_healthy=false
    fi
    
    # Check AI models
    local ai_status=$(curl -s http://localhost:4000/health 2>/dev/null | jq -r '.brain_status // "unknown"')
    if [ "$ai_status" = "real_ai_multi_agent_active" ]; then
        echo "✅ 4-Agent AI system active"
    else
        echo "⚠️ AI status: $ai_status"
    fi
    
    if [ "$all_healthy" = true ]; then
        echo "🎉 All systems healthy!"
        return 0
    else
        echo "⚠️ Some issues detected"
        return 1
    fi
}

# Function to restart failed components
auto_heal() {
    echo "🔧 Auto-healing $SERVICE_NAME system..."
    
    # Restart Docker if needed
    cd "$COMPOSE_DIR"
    if ! docker compose ps | grep -q "Up"; then
        echo "🔄 Restarting Docker services..."
        docker compose restart
        sleep 30
    fi
    
    # Restart tunnel if needed
    if ! curl -s --max-time 5 "https://$TUNNEL_SUBDOMAIN.loca.lt/health" > /dev/null 2>&1; then
        echo "🔄 Restarting tunnel..."
        start_tunnel
    fi
}

# Function to log system status
log_status() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local status_file="$LOG_DIR/status.log"
    
    echo "[$timestamp] $SERVICE_NAME Status Check" >> "$status_file"
    check_health >> "$status_file" 2>&1
    echo "----------------------------------------" >> "$status_file"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping $SERVICE_NAME system..."
    
    # Stop tunnel
    if [ -f "$HOME/.ms-jarvis-tunnel.pid" ]; then
        local tunnel_pid=$(cat "$HOME/.ms-jarvis-tunnel.pid")
        kill "$tunnel_pid" 2>/dev/null
        rm -f "$HOME/.ms-jarvis-tunnel.pid"
    fi
    pkill -f "localtunnel.*4000" 2>/dev/null
    
    # Stop Docker services
    cd "$COMPOSE_DIR"
    docker compose down
    
    # Remove PID file
    rm -f "$PID_FILE"
    
    echo "✅ $SERVICE_NAME system stopped"
}

# Main command handling
case "${1:-status}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 5
        start_services
        ;;
    health)
        check_health
        ;;
    heal)
        auto_heal
        ;;
    status)
        log_status
        tail -20 "$LOG_DIR/status.log"
        ;;
    monitor)
        echo "🔍 Starting $SERVICE_NAME monitor (Ctrl+C to stop)..."
        while true; do
            if ! check_health > /dev/null 2>&1; then
                echo "⚠️ Issues detected, attempting auto-heal..."
                auto_heal
            fi
            sleep 300  # Check every 5 minutes
        done
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|health|heal|status|monitor}"
        echo ""
        echo "Commands:"
        echo "  start   - Start complete Ms. Jarvis system"
        echo "  stop    - Stop all services"
        echo "  restart - Restart everything"
        echo "  health  - Check system health"
        echo "  heal    - Attempt to fix issues"
        echo "  status  - Show recent status logs"
        echo "  monitor - Continuous monitoring with auto-healing"
        exit 1
        ;;
esac
