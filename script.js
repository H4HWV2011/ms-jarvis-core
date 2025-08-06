// Ms. Jarvis - Appalachian Mountain Interface

class MountainJarvis {
    constructor() {
        // === CHANGE ONLY THIS LINE if backend URL changes ===
        this.apiBaseUrl = 'https://ms-jarvis-core-ep06k1qea-h4hwv2011s-projects.vercel.app';
        this.userId = this.generateUserId();
        this.isConnected = false;
        this.messageCount = 0;

        // Initialize
        this.initializeElements();
        this.bindEvents();
        this.setupImageHandling();
        this.startMonitoring();

        console.log('🏔️ Mountain Jarvis initialized');
    }

    generateUserId() {
        return `mountain_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    initializeElements() {
        // Header elements
        this.mainAvatar = document.getElementById('mainAvatar');
        this.statusLight = document.getElementById('statusLight');
        this.statusMessage = document.getElementById('statusMessage');

        // Dashboard elements
        this.totalContracts = document.getElementById('totalContracts');
        this.healthyContracts = document.getElementById('healthyContracts');
        this.corruptedContracts = document.getElementById('corruptedContracts');
        this.treasuryHealth = document.getElementById('treasuryHealth');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.aiStatus = document.getElementById('aiStatus');

        // Chat elements
        this.chatAvatar = document.getElementById('chatAvatar');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.thinkingIndicator = document.getElementById('thinkingIndicator');
        this.clearChat = document.getElementById('clearChat');
    }

    bindEvents() {
        // Send message events
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.autoResizeInput();
        });

        // Dashboard controls
        this.refreshBtn.addEventListener('click', () => {
            this.refreshBtn.style.transform = 'rotate(360deg) scale(1.1)';
            this.updateDashboard();
            setTimeout(() => {
                this.refreshBtn.style.transform = '';
            }, 600);
        });

        // Clear chat
        this.clearChat.addEventListener('click', () => {
            this.clearChatMessages();
        });

        // Avatar interactions
        this.setupAvatarInteractions();
    }

    setupImageHandling() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });

            img.addEventListener('error', (e) => {
                this.handleImageError(e.target);
            });
        });
    }

    setupAvatarInteractions() {
        if (this.mainAvatar) {
            this.mainAvatar.addEventListener('click', () => {
                this.showWelcomeMessage();
            });
        }

        if (this.chatAvatar) {
            this.chatAvatar.addEventListener('click', () => {
                this.showHostInfo();
            });
        }
    }

    handleImageError(imgElement) {
        const fallback = document.createElement('div');
        fallback.style.cssText = `
            width: ${imgElement.offsetWidth}px;
            height: ${imgElement.offsetHeight}px;
            background: linear-gradient(135deg, #2c5282, #4299e1);
            border-radius: ${imgElement.style.borderRadius || '50%'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
        `;
        fallback.textContent = '🏔️';
        imgElement.parentNode.replaceChild(fallback, imgElement);
    }

    autoResizeInput() {
        this.messageInput.style.height = 'auto';
        const maxHeight = 120;
        const newHeight = Math.min(this.messageInput.scrollHeight, maxHeight);
        this.messageInput.style.height = newHeight + 'px';
    }

    startMonitoring() {
        this.checkSystemHealth();
        this.updateDashboard();

        // Periodic updates
        setInterval(() => this.checkSystemHealth(), 30000);
        setInterval(() => this.updateDashboard(), 60000);
    }

    // === ALL HEALTH and DASHBOARD CALLS NOW GO TO ms-jarvis-core BACKEND ===
    async checkSystemHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/health`);

            if (response.ok) {
                const healthData = await response.json();
                this.updateConnectionStatus('connected', 'System Ready');

                if (healthData.ai_models && Array.isArray(healthData.ai_models)) {
                    const count = healthData.ai_models.length;
                    this.aiStatus.textContent = `${count} Wisdom Sources Active`;
                }
            } else {
                this.updateConnectionStatus('error', 'System Issues');
            }
        } catch (error) {
            this.updateConnectionStatus('error', 'Connection Lost');
        }
    }

    async updateDashboard() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/mountainshares/ecosystem-status`);

            if (response.ok) {
                const data = await response.json();
                const ecosystem = data.ecosystem || {};

                this.animateNumber(this.totalContracts, ecosystem.totalContracts || 0);
                this.animateNumber(this.healthyContracts, ecosystem.healthyContracts || 0);
                this.animateNumber(this.corruptedContracts, ecosystem.corruptedContracts || 0);

                const treasuryStatus = data.intelligence?.treasuryHealth?.status || 'unknown';
                this.treasuryHealth.textContent = this.capitalizeFirst(treasuryStatus);

                // Update treasury color class
                this.treasuryHealth.parentElement.className = `stat-peak treasury ${this.getTreasuryClass(treasuryStatus)}`;
            }
        } catch (error) {
            console.error('Dashboard update failed:', error);
            this.setPlaceholders();
        }
    }

    animateNumber(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue === targetValue) return;

        const duration = 800;
        const startTime = performance.now();
        const startValue = currentValue;
        const difference = targetValue - startValue;

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 2);
            const currentCount = Math.round(startValue + (difference * easeOut));

            element.textContent = currentCount;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }

    setPlaceholders() {
        this.totalContracts.textContent = '--';
        this.healthyContracts.textContent = '--';
        this.corruptedContracts.textContent = '--';
        this.treasuryHealth.textContent = 'Unknown';
    }

    getTreasuryClass(status) {
        switch (status.toLowerCase()) {
            case 'healthy': return 'healthy';
            case 'moderate': return 'warning';
            case 'low': return 'warning';
            default: return '';
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.isConnected) return;

        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
        this.thinkingIndicator.style.display = 'flex';

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat-with-mountainshares-brain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    message: message,
                    userId: this.userId,
                    messageId: ++this.messageCount
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.addMessage(data.reply || "I'm having trouble with that request, sweetie.", 'host');
            } else {
                this.addMessage("I'm having some technical difficulties right now. Please try again in a moment.", 'host');
            }
        } catch (error) {
            this.addMessage("I seem to be having connection issues. Let me try to get back to you soon!", 'host');
        }

        this.messageInput.disabled = false;
        this.sendBtn.disabled = !this.isConnected;
        this.thinkingIndicator.style.display = 'none';
        this.messageInput.focus();
    }

    addMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;

        if (type === 'host') {
            const hostDiv = document.createElement('div');
            hostDiv.className = 'message-host';

            const hostImg = document.createElement('img');
            hostImg.src = 'ms_jarvis_image2.jpg';
            hostImg.alt = 'Ms. Jarvis';
            hostImg.onerror = () => {
                const fallback = document.createElement('div');
                fallback.style.cssText = `
                    width: 40px; height: 40px; background: linear-gradient(135deg, #2c5282, #4299e1);
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    color: white; font-size: 1rem; border: 2px solid #d69e2e;
                `;
                fallback.textContent = '🏔️';
                hostImg.parentNode.replaceChild(fallback, hostImg);
            };

            hostDiv.appendChild(hostImg);
            messageDiv.appendChild(hostDiv);
        }

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'bubble-content';
        contentDiv.textContent = message;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.getCurrentTime();

        bubbleDiv.appendChild(contentDiv);
        bubbleDiv.appendChild(timeDiv);
        messageDiv.appendChild(bubbleDiv);

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    clearChatMessages() {
        // Keep only the welcome message
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        this.chatMessages.innerHTML = '';
        if (welcomeMessage) {
            this.chatMessages.appendChild(welcomeMessage);
        }
    }

    showWelcomeMessage() {
        this.statusMessage.textContent = 'Hello from the mountains! 🏔️';
        setTimeout(() => {
            this.checkSystemHealth();
        }, 2000);
    }

    showHostInfo() {
        this.addMessage("I'm Ms. Jarvis, your friendly AI assistant from the beautiful Appalachian mountains of West Virginia. How can I help you today?", 'host');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏔️ Initializing Mountain Jarvis...');
    window.mountainJarvis = new MountainJarvis();
});
