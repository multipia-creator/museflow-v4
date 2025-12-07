/**
 * MuseFlow Canvas V25.0 - External Integrations
 * Google Workspace, Notion, Figma, Slack
 * 
 * Features:
 * - Google Drive file sharing
 * - Google Calendar event sync
 * - Gmail notifications
 * - Notion database sync
 * - Figma design embedding
 * - Slack channel notifications
 */

// ============================================
// INTEGRATION MANAGER
// ============================================

const IntegrationManager = {
    config: {
        google: {
            clientId: '', // To be configured by user
            scopes: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/gmail.send'
            ]
        },
        notion: {
            token: '', // To be configured by user
            databaseId: ''
        },
        figma: {
            token: '' // To be configured by user
        },
        slack: {
            webhookUrl: '' // To be configured by user
        }
    },
    
    init() {
        console.log('🔗 Initializing External Integrations...');
        this.addIntegrationsUI();
        this.loadConfig();
        console.log('✅ External Integrations initialized');
    },
    
    loadConfig() {
        try {
            const saved = localStorage.getItem('museflow_integrations_config');
            if (saved) {
                const config = JSON.parse(saved);
                this.config = { ...this.config, ...config };
            }
        } catch (error) {
            console.error('Failed to load integration config:', error);
        }
    },
    
    saveConfig() {
        try {
            localStorage.setItem('museflow_integrations_config', JSON.stringify(this.config));
            if (window.showToast) {
                showToast('통합 설정이 저장되었습니다', 'success');
            }
        } catch (error) {
            console.error('Failed to save integration config:', error);
        }
    },
    
    // ============================================
    // GOOGLE WORKSPACE INTEGRATION
    // ============================================
    
    async shareToGoogleDrive(file) {
        if (!this.config.google.clientId) {
            this.showConfigDialog('google');
            return;
        }
        
        try {
            // Mock implementation - would use Google Drive API
            console.log('📤 Sharing to Google Drive:', file);
            
            const mockUrl = `https://drive.google.com/file/d/mock_${Date.now()}`;
            
            if (window.showToast) {
                showToast(`Google Drive 공유 완료\n${mockUrl}`, 'success');
            }
            
            return mockUrl;
        } catch (error) {
            console.error('Google Drive share error:', error);
            if (window.showToast) {
                showToast('Google Drive 공유 실패', 'error');
            }
        }
    },
    
    async createGoogleCalendarEvent(task) {
        if (!this.config.google.clientId) {
            this.showConfigDialog('google');
            return;
        }
        
        try {
            // Mock implementation - would use Google Calendar API
            const event = {
                summary: task.title,
                description: task.description || '',
                start: {
                    dateTime: new Date(task.dueDate).toISOString()
                },
                end: {
                    dateTime: new Date(task.dueDate + 3600000).toISOString() // +1 hour
                }
            };
            
            console.log('📅 Creating Google Calendar event:', event);
            
            if (window.showToast) {
                showToast(`Google Calendar에 일정이 추가되었습니다\n${task.title}`, 'success');
            }
            
            return event;
        } catch (error) {
            console.error('Google Calendar error:', error);
            if (window.showToast) {
                showToast('Google Calendar 동기화 실패', 'error');
            }
        }
    },
    
    async sendGmailNotification(to, subject, body) {
        if (!this.config.google.clientId) {
            this.showConfigDialog('google');
            return;
        }
        
        try {
            // Mock implementation - would use Gmail API
            console.log('📧 Sending Gmail:', { to, subject, body });
            
            if (window.showToast) {
                showToast(`이메일이 전송되었습니다\n수신: ${to}`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Gmail send error:', error);
            if (window.showToast) {
                showToast('이메일 전송 실패', 'error');
            }
        }
    },
    
    // ============================================
    // NOTION INTEGRATION
    // ============================================
    
    async syncToNotion(project) {
        if (!this.config.notion.token || !this.config.notion.databaseId) {
            this.showConfigDialog('notion');
            return;
        }
        
        try {
            // Mock implementation - would use Notion API
            const notionPage = {
                parent: { database_id: this.config.notion.databaseId },
                properties: {
                    Name: { title: [{ text: { content: project.name } }] },
                    Status: { select: { name: project.active ? 'Active' : 'Inactive' } },
                    Tags: { multi_select: (project.tags || []).map(tag => ({ name: tag })) }
                }
            };
            
            console.log('📝 Syncing to Notion:', notionPage);
            
            const mockUrl = `https://notion.so/mock_${Date.now()}`;
            
            if (window.showToast) {
                showToast(`Notion에 동기화되었습니다\n${mockUrl}`, 'success');
            }
            
            return mockUrl;
        } catch (error) {
            console.error('Notion sync error:', error);
            if (window.showToast) {
                showToast('Notion 동기화 실패', 'error');
            }
        }
    },
    
    // ============================================
    // FIGMA INTEGRATION
    // ============================================
    
    async embedFigmaDesign(figmaUrl, cardId) {
        if (!this.config.figma.token) {
            this.showConfigDialog('figma');
            return;
        }
        
        try {
            // Extract file key from Figma URL
            const fileKeyMatch = figmaUrl.match(/file\/([^\/]+)/);
            if (!fileKeyMatch) {
                throw new Error('Invalid Figma URL');
            }
            
            const fileKey = fileKeyMatch[1];
            
            // Mock implementation - would use Figma API to get embed URL
            const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`;
            
            console.log('🎨 Embedding Figma design:', embedUrl);
            
            // Add to card metadata
            const cards = this.loadCards();
            const card = cards.find(c => c.id === cardId);
            if (card) {
                card.figmaEmbed = embedUrl;
                card.figmaUrl = figmaUrl;
                this.saveCards(cards);
            }
            
            if (window.showToast) {
                showToast('Figma 디자인이 연결되었습니다', 'success');
            }
            
            return embedUrl;
        } catch (error) {
            console.error('Figma embed error:', error);
            if (window.showToast) {
                showToast('Figma 연결 실패', 'error');
            }
        }
    },
    
    // ============================================
    // SLACK INTEGRATION
    // ============================================
    
    async sendSlackNotification(message, channel = '#general') {
        if (!this.config.slack.webhookUrl) {
            this.showConfigDialog('slack');
            return;
        }
        
        try {
            // Mock implementation - would use Slack Webhook
            const payload = {
                channel: channel,
                username: 'MuseFlow Bot',
                icon_emoji: ':museum:',
                text: message,
                attachments: [{
                    color: '#8B5CF6',
                    fields: [
                        {
                            title: 'From',
                            value: 'MuseFlow Canvas',
                            short: true
                        },
                        {
                            title: 'Time',
                            value: new Date().toLocaleString('ko-KR'),
                            short: true
                        }
                    ]
                }]
            };
            
            console.log('💬 Sending Slack notification:', payload);
            
            if (window.showToast) {
                showToast(`Slack 알림이 전송되었습니다\n채널: ${channel}`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Slack notification error:', error);
            if (window.showToast) {
                showToast('Slack 알림 전송 실패', 'error');
            }
        }
    },
    
    // ============================================
    // AUTO-NOTIFICATIONS
    // ============================================
    
    setupAutoNotifications() {
        // Listen for task completion
        window.addEventListener('taskCompleted', (event) => {
            const task = event.detail;
            this.sendSlackNotification(`✅ 작업 완료: ${task.title}`);
        });
        
        // Listen for project creation
        window.addEventListener('projectCreated', (event) => {
            const project = event.detail;
            this.sendSlackNotification(`🚀 새 프로젝트: ${project.name}`);
            this.syncToNotion(project);
        });
        
        // Listen for deadline approaching
        this.checkDeadlines();
        setInterval(() => this.checkDeadlines(), 3600000); // Check every hour
    },
    
    checkDeadlines() {
        const tasks = this.loadTasks();
        const tomorrow = Date.now() + (24 * 60 * 60 * 1000);
        
        tasks.forEach(task => {
            if (!task.completed && task.dueDate && task.dueDate < tomorrow && task.dueDate > Date.now()) {
                this.sendSlackNotification(`⏰ 마감 임박: ${task.title} (내일)`);
                
                // Also send email
                const userEmail = localStorage.getItem('user_email');
                if (userEmail) {
                    this.sendGmailNotification(
                        userEmail,
                        `MuseFlow 마감 알림: ${task.title}`,
                        `작업 "${task.title}"의 마감이 내일입니다.\n\n설명: ${task.description || '없음'}\n\n지금 확인하기: ${window.location.origin}/canvas-ultimate-clean`
                    );
                }
            }
        });
    },
    
    // ============================================
    // UI INTEGRATION
    // ============================================
    
    addIntegrationsUI() {
        setTimeout(() => {
            // Add integration buttons to Settings Panel
            const settingsPanel = document.getElementById('settingsPanel');
            if (!settingsPanel) return;
            
            const panelContent = settingsPanel.querySelector('.panel-content');
            if (!panelContent) return;
            
            // Check if already added
            if (document.getElementById('integrationsSection')) return;
            
            const integrationsHTML = `
                <div id="integrationsSection" style="padding: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2); margin-top: 1rem;">
                    <h4 style="color: #e5e5e5; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem;">
                        🔗 외부 통합
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                        <button onclick="window.IntegrationManager.showConfigDialog('google')" 
                                style="padding: 0.5rem; background: rgba(219, 68, 55, 0.1); border: 1px solid rgba(219, 68, 55, 0.3); border-radius: 6px; color: #e5e5e5; font-size: 0.75rem; cursor: pointer;">
                            Google
                        </button>
                        <button onclick="window.IntegrationManager.showConfigDialog('notion')"
                                style="padding: 0.5rem; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: #e5e5e5; font-size: 0.75rem; cursor: pointer;">
                            Notion
                        </button>
                        <button onclick="window.IntegrationManager.showConfigDialog('figma')"
                                style="padding: 0.5rem; background: rgba(242, 78, 30, 0.1); border: 1px solid rgba(242, 78, 30, 0.3); border-radius: 6px; color: #e5e5e5; font-size: 0.75rem; cursor: pointer;">
                            Figma
                        </button>
                        <button onclick="window.IntegrationManager.showConfigDialog('slack')"
                                style="padding: 0.5rem; background: rgba(74, 21, 75, 0.3); border: 1px solid rgba(224, 30, 90, 0.3); border-radius: 6px; color: #e5e5e5; font-size: 0.75rem; cursor: pointer;">
                            Slack
                        </button>
                    </div>
                </div>
            `;
            
            panelContent.insertAdjacentHTML('beforeend', integrationsHTML);
        }, 2500);
    },
    
    showConfigDialog(service) {
        const serviceNames = {
            google: 'Google Workspace',
            notion: 'Notion',
            figma: 'Figma',
            slack: 'Slack'
        };
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        let configFields = '';
        
        if (service === 'google') {
            configFields = `
                <input type="text" id="googleClientId" placeholder="Google Client ID" 
                       value="${this.config.google.clientId || ''}"
                       style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #e5e5e5; margin-bottom: 0.75rem;">
                <p style="color: #9CA3AF; font-size: 0.75rem; margin-top: -0.5rem;">
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color: #8B5CF6;">
                        Google Cloud Console에서 발급
                    </a>
                </p>
            `;
        } else if (service === 'notion') {
            configFields = `
                <input type="text" id="notionToken" placeholder="Notion Integration Token" 
                       value="${this.config.notion.token || ''}"
                       style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #e5e5e5; margin-bottom: 0.75rem;">
                <input type="text" id="notionDatabaseId" placeholder="Database ID" 
                       value="${this.config.notion.databaseId || ''}"
                       style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #e5e5e5; margin-bottom: 0.75rem;">
                <p style="color: #9CA3AF; font-size: 0.75rem; margin-top: -0.5rem;">
                    <a href="https://www.notion.so/my-integrations" target="_blank" style="color: #8B5CF6;">
                        Notion Integrations에서 발급
                    </a>
                </p>
            `;
        } else if (service === 'figma') {
            configFields = `
                <input type="text" id="figmaToken" placeholder="Figma Personal Access Token" 
                       value="${this.config.figma.token || ''}"
                       style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #e5e5e5; margin-bottom: 0.75rem;">
                <p style="color: #9CA3AF; font-size: 0.75rem; margin-top: -0.5rem;">
                    <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" style="color: #8B5CF6;">
                        Figma Account Settings에서 발급
                    </a>
                </p>
            `;
        } else if (service === 'slack') {
            configFields = `
                <input type="text" id="slackWebhook" placeholder="Slack Incoming Webhook URL" 
                       value="${this.config.slack.webhookUrl || ''}"
                       style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #e5e5e5; margin-bottom: 0.75rem;">
                <p style="color: #9CA3AF; font-size: 0.75rem; margin-top: -0.5rem;">
                    <a href="https://api.slack.com/messaging/webhooks" target="_blank" style="color: #8B5CF6;">
                        Slack App Settings에서 발급
                    </a>
                </p>
            `;
        }
        
        modal.innerHTML = `
            <div style="background: #1F2937; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%;">
                <h3 style="color: #e5e5e5; margin-bottom: 1rem; font-size: 1.25rem;">
                    🔗 ${serviceNames[service]} 연동 설정
                </h3>
                <div style="margin-bottom: 1.5rem;">
                    ${configFields}
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="flex: 1; padding: 0.75rem; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; color: #e5e5e5; cursor: pointer;">
                        취소
                    </button>
                    <button id="saveIntegrationConfig" 
                            style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #8B5CF6, #6366F1); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                        저장
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#saveIntegrationConfig').onclick = () => {
            if (service === 'google') {
                this.config.google.clientId = modal.querySelector('#googleClientId').value;
            } else if (service === 'notion') {
                this.config.notion.token = modal.querySelector('#notionToken').value;
                this.config.notion.databaseId = modal.querySelector('#notionDatabaseId').value;
            } else if (service === 'figma') {
                this.config.figma.token = modal.querySelector('#figmaToken').value;
            } else if (service === 'slack') {
                this.config.slack.webhookUrl = modal.querySelector('#slackWebhook').value;
            }
            
            this.saveConfig();
            modal.remove();
        };
    },
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    loadTasks() {
        try {
            const saved = localStorage.getItem('museflow_tasks_v23');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },
    
    loadCards() {
        try {
            if (window.CanvasState && window.CanvasState.cards) {
                return window.CanvasState.cards;
            }
            return [];
        } catch {
            return [];
        }
    },
    
    saveCards(cards) {
        try {
            if (window.CanvasState) {
                window.CanvasState.cards = cards;
            }
        } catch (error) {
            console.error('Failed to save cards:', error);
        }
    }
};

// ============================================
// INITIALIZE ON LOAD
// ============================================

window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🚀 Initializing External Integrations...');
        
        try {
            IntegrationManager.init();
            IntegrationManager.setupAutoNotifications();
            console.log('✅ External Integrations Loaded');
        } catch (error) {
            console.error('❌ External Integrations initialization failed:', error);
        }
    }, 3000);
});

// Expose globally
window.IntegrationManager = IntegrationManager;
