#!/bin/bash

SERVICE_NAME="Ms-Jarvis-AI"
COMPOSE_DIR="$HOME/ms-jarvis-core"
LOG_DIR="$HOME/ms-jarvis-logs"
PID_FILE="$HOME/.ms-jarvis.pid"
TUNNEL_URL_FILE="$HOME/.ms-jarvis-tunnel-url"

# Create log directory
mkdir -p "$LOG_DIR"

# Function to start services
start_services() {
    echo "🚀 Starting $SERVICE_NAME Complete System..."
    
    # Start Docker services
    cd "$COMPOSE_DIR"
    docker compose up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Start ngrok tunnel
    start_ngrok_tunnel
    
    echo "✅ $SERVICE_NAME system started successfully!"
}

# Function to start ngrok tunnel (more reliable than localtunnel)
start_ngrok_tunnel() {
    local max_retries=3
    local retry_count=0
    
    echo "🔗 Starting ngrok tunnel..."
    
    while [ $retry_count -lt $max_retries ]; do
        # Kill any existing ngrok processes
        pkill -f "ngrok.*http.*4000" 2>/dev/null
        
        # Start ngrok in background
        nohup ngrok http 4000 --log=stdout > "$LOG_DIR/tunnel.log" 2>&1 &
        TUNNEL_PID=$!
        
        # Wait for ngrok to start
        sleep 15
        
        # Get tunnel URL from ngrok API
        local tunnel_url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url // empty')
        
        if [ -n "$tunnel_url" ] && [ "$tunnel_url" != "null" ] && [ "$tunnel_url" != "empty" ]; then
            echo "✅ Ngrok tunnel established: $tunnel_url"
            echo "$tunnel_url" > "$TUNNEL_URL_FILE"
            echo "$TUNNEL_PID" > "$HOME/.ms-jarvis-tunnel.pid"
            return 0
        else
            echo "❌ Ngrok tunnel failed (attempt $((retry_count + 1))/$max_retries)"
            retry_count=$((retry_count + 1))
            sleep 10
        fi
    done
    
    echo "❌ Failed to establish ngrok tunnel after $max_retries attempts"
    return 1
}

# Function to check system health
check_health() {
    local all_healthy=true
    
    echo "🔍 Checking $SERVICE_NAME System Health..."
    echo "========================================"
    
    # Check Docker services
    cd "$COMPOSE_DIR"
    if docker compose ps | grep -q "Up"; then
        echo "✅ Docker services running"
    else
        echo "❌ Docker services not running"
        all_healthy=false
    fi
    
    # Check local AI
    if curl -s --max-time 5 http://localhost:4000/health > /dev/null 2>&1; then
        echo "✅ Local AI responding"
        local ai_status=$(curl -s http://localhost:4000/health 2>/dev/null | jq -r '.brain_status // "unknown"')
        echo "🤖 AI Status: $ai_status"
    else
        echo "❌ Local AI not responding"
        all_healthy=false
    fi
    
    # Check ngrok tunnel
    if [ -f "$TUNNEL_URL_FILE" ]; then
        local tunnel_url=$(cat "$TUNNEL_URL_FILE")
        if curl -s --max-time 10 "$tunnel_url/health" > /dev/null 2>&1; then
            echo "✅ Ngrok tunnel active: $tunnel_url"
        else
            echo "❌ Ngrok tunnel failed"
            all_healthy=false
        fi
    else
        echo "❌ No tunnel URL found"
        all_healthy=false
    fi
    
    if [ "$all_healthy" = true ]; then
        echo "🎉 All systems healthy!"
        return 0
    else
        echo "⚠️ Issues detected"
        return 1
    fi
}

# Function to heal system issues
heal_system() {
    echo "🔧 Healing $SERVICE_NAME system..."
    
    # Restart Docker if needed
    cd "$COMPOSE_DIR"
    if ! docker compose ps | grep -q "Up"; then
        echo "🔄 Restarting Docker services..."
        docker compose restart
        sleep 30
    fi
    
    # Restart tunnel if needed
    if [ -f "$TUNNEL_URL_FILE" ]; then
        local tunnel_url=$(cat "$TUNNEL_URL_FILE")
        if ! curl -s --max-time 5 "$tunnel_url/health" > /dev/null 2>&1; then
            echo "🔄 Restarting tunnel..."
            start_ngrok_tunnel
        fi
    else
        echo "🔄 Starting new tunnel..."
        start_ngrok_tunnel
    fi
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping $SERVICE_NAME system..."
    
    # Stop ngrok
    pkill -f "ngrok.*http.*4000" 2>/dev/null
    rm -f "$TUNNEL_URL_FILE" "$HOME/.ms-jarvis-tunnel.pid"
    
    # Stop Docker services
    cd "$COMPOSE_DIR"
    docker compose down
    
    echo "✅ $SERVICE_NAME system stopped"
}

# Monitor function for systemd
monitor_system() {
    echo "🔍 Starting $SERVICE_NAME monitor..."
    
    # Initial start
    start_services
    
    # Monitoring loop
    while true; do
        sleep 300  # Check every 5 minutes
        
        if ! check_health > /dev/null 2>&1; then
            echo "⚠️ Health check failed, attempting heal..."
            heal_system
        fi
    done
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
        heal_system
        ;;
    monitor)
        monitor_system
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|health|heal|monitor}"
        exit 1
        ;;
esac
