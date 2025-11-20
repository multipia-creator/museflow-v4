/**
 * Chatbot Agent Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChatbotAgent } from '../../src/agents/chatbot.agent';

describe('ChatbotAgent', () => {
  let agent: ChatbotAgent;

  beforeEach(async () => {
    agent = new ChatbotAgent();
    await agent.initialize();
  });

  describe('Session Management', () => {
    it('should create new session', () => {
      const session = agent.createSession('user-123');
      
      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.userId).toBe('user-123');
      expect(session.messages).toEqual([]);
    });

    it('should get existing session', () => {
      const session = agent.createSession('user-123');
      const retrieved = agent.getSession(session.sessionId);
      
      expect(retrieved).toEqual(session);
    });

    it('should return undefined for non-existent session', () => {
      const session = agent.getSession('non-existent-id');
      expect(session).toBeUndefined();
    });

    it('should update session context', () => {
      const session = agent.createSession('user-123');
      
      agent.updateSessionContext(session.sessionId, {
        currentExhibition: 'Impressionism',
        userPreferences: { style: 'modern' }
      });
      
      const updated = agent.getSession(session.sessionId);
      expect(updated?.context.currentExhibition).toBe('Impressionism');
      expect(updated?.context.userPreferences).toEqual({ style: 'modern' });
    });
  });

  describe('User Sessions', () => {
    it('should get all sessions for user', () => {
      agent.createSession('user-123');
      agent.createSession('user-123');
      agent.createSession('user-456');
      
      const sessions = agent.getUserSessions('user-123');
      
      expect(sessions).toHaveLength(2);
      expect(sessions.every(s => s.userId === 'user-123')).toBe(true);
    });
  });

  describe('Preference Analysis', () => {
    it('should analyze art styles from messages', () => {
      const session = agent.createSession('user-123');
      
      session.messages.push({
        id: '1',
        role: 'user',
        content: 'I love impressionist paintings like Monet',
        timestamp: new Date().toISOString()
      });
      
      const prefs = agent.analyzePreferences(session);
      
      expect(prefs.artStyles).toContain('impressionism');
    });

    it('should analyze interests from messages', () => {
      const session = agent.createSession('user-123');
      
      session.messages.push({
        id: '1',
        role: 'user',
        content: 'I want to see sculpture and painting exhibitions',
        timestamp: new Date().toISOString()
      });
      
      const prefs = agent.analyzePreferences(session);
      
      expect(prefs.interests).toContain('sculpture');
      expect(prefs.interests).toContain('painting');
    });

    it('should track message count', () => {
      const session = agent.createSession('user-123');
      
      session.messages.push({
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString()
      });
      
      const prefs = agent.analyzePreferences(session);
      expect(prefs.messageCount).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should provide chat statistics', () => {
      agent.createSession('user-1');
      agent.createSession('user-2');
      
      const stats = agent.getStats();
      
      expect(stats.totalSessions).toBe(2);
      expect(stats.totalMessages).toBe(0);
      expect(stats.averageMessagesPerSession).toBe(0);
    });

    it('should count active sessions', () => {
      agent.createSession('user-1');
      agent.createSession('user-2');
      
      const stats = agent.getStats();
      
      expect(stats.activeSessions).toBe(2);
    });
  });
});
