/**
 * MuseFlow Canvas V24.0 - Voice Commands
 * Speech Recognition & Voice Control
 * 
 * Features:
 * - Voice-to-text input
 * - Continuous listening mode
 * - Korean/English support
 * - Voice command shortcuts
 */

// ============================================
// VOICE COMMAND MANAGER
// ============================================

const VoiceCommandManager = {
    recognition: null,
    isListening: false,
    continuousMode: false,
    
    init() {
        console.log('🎤 Initializing Voice Commands...');
        
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ Speech Recognition not supported in this browser');
            return;
        }
        
        this.setupRecognition();
        this.addVoiceButton();
        console.log('✅ Voice Commands initialized');
    },
    
    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configuration
        this.recognition.lang = 'ko-KR'; // Korean primary, can switch to 'en-US'
        this.recognition.continuous = false; // One-shot recognition
        this.recognition.interimResults = true; // Show interim results
        this.recognition.maxAlternatives = 1;
        
        // Event handlers
        this.recognition.onstart = () => {
            console.log('🎤 Voice recognition started');
            this.isListening = true;
            this.updateVoiceButton(true);
        };
        
        this.recognition.onend = () => {
            console.log('🎤 Voice recognition ended');
            this.isListening = false;
            this.updateVoiceButton(false);
            
            // Restart if continuous mode
            if (this.continuousMode) {
                setTimeout(() => this.start(), 1000);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('🎤 Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButton(false);
            
            if (event.error === 'no-speech') {
                if (window.showToast) {
                    showToast('음성이 감지되지 않았습니다', 'warning');
                }
            } else if (event.error === 'not-allowed') {
                if (window.showToast) {
                    showToast('마이크 권한이 필요합니다', 'error');
                }
            }
        };
        
        this.recognition.onresult = (event) => {
            let transcript = '';
            let isFinal = false;
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    isFinal = true;
                }
            }
            
            console.log('🎤 Voice input:', transcript, isFinal ? '(final)' : '(interim)');
            
            // Update input field with interim results
            const input = document.getElementById('aiChatInput');
            if (input) {
                if (isFinal) {
                    // Final result - append to existing text or replace
                    input.value = transcript.trim();
                    
                    // Auto-send if it's a command
                    if (this.isCommand(transcript)) {
                        this.handleVoiceCommand(transcript);
                    }
                } else {
                    // Interim result - show preview
                    input.placeholder = `음성 인식 중... "${transcript}"`;
                }
            }
        };
    },
    
    addVoiceButton() {
        const inputContainer = document.getElementById('aiInputContainer');
        if (!inputContainer) return;
        
        const buttonContainer = inputContainer.querySelector('div');
        if (!buttonContainer) return;
        
        // Create voice button
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'aiVoiceBtn';
        voiceBtn.innerHTML = '<i data-lucide="mic" style="width:16px;height:16px"></i>';
        voiceBtn.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(139, 92, 246, 0.2);
            border: 1.5px solid rgba(139, 92, 246, 0.4);
            color: #8B5CF6;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
        `;
        
        voiceBtn.onmouseover = function() {
            this.style.background = 'rgba(139, 92, 246, 0.3)';
            this.style.transform = 'scale(1.05)';
        };
        
        voiceBtn.onmouseout = function() {
            this.style.background = 'rgba(139, 92, 246, 0.2)';
            this.style.transform = '';
        };
        
        voiceBtn.onclick = () => this.toggle();
        
        // Insert before send button
        const sendBtn = document.getElementById('aiSendBtn');
        buttonContainer.insertBefore(voiceBtn, sendBtn);
        
        // Recreate lucide icons
        if (window.lucide) lucide.createIcons();
    },
    
    updateVoiceButton(listening) {
        const btn = document.getElementById('aiVoiceBtn');
        if (!btn) return;
        
        if (listening) {
            btn.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
            btn.style.borderColor = '#EF4444';
            btn.style.color = 'white';
            btn.innerHTML = '<i data-lucide="mic-off" style="width:16px;height:16px"></i>';
            btn.style.animation = 'pulse 1.5s infinite';
        } else {
            btn.style.background = 'rgba(139, 92, 246, 0.2)';
            btn.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            btn.style.color = '#8B5CF6';
            btn.innerHTML = '<i data-lucide="mic" style="width:16px;height:16px"></i>';
            btn.style.animation = '';
        }
        
        if (window.lucide) lucide.createIcons();
    },
    
    start() {
        if (!this.recognition) {
            if (window.showToast) {
                showToast('음성 인식이 지원되지 않는 브라우저입니다', 'error');
            }
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
        }
    },
    
    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.continuousMode = false;
    },
    
    toggle() {
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
    },
    
    isCommand(text) {
        const commands = [
            '작업',
            '템플릿',
            '진행',
            '도움',
            '추천',
            '분석',
            '보여줘',
            '알려줘'
        ];
        
        const lowerText = text.toLowerCase();
        return commands.some(cmd => lowerText.includes(cmd));
    },
    
    handleVoiceCommand(text) {
        // Send to AI Assistant
        if (window.AIAssistantManager && window.AIAssistantManager.sendMessage) {
            setTimeout(() => {
                window.AIAssistantManager.sendMessage();
            }, 500);
        }
    },
    
    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang;
            console.log(`🎤 Voice recognition language set to: ${lang}`);
        }
    }
};

// ============================================
// INITIALIZE ON LOAD
// ============================================

window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🚀 Initializing Voice Commands...');
        
        try {
            VoiceCommandManager.init();
            console.log('✅ Voice Commands Loaded');
        } catch (error) {
            console.error('❌ Voice Commands initialization failed:', error);
        }
    }, 2000); // Wait for AI Assistant to load
});

// Expose globally
window.VoiceCommandManager = VoiceCommandManager;

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
@keyframes pulse {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    50% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
}
`;
document.head.appendChild(style);
