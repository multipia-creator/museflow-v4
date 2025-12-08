/**
 * MuseFlow V4 - AI Agents Hub API Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3000';
let authToken: string;

describe('Agents Hub API', () => {
  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@museflow.test',
        password: 'Test1234!'
      })
    });
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      authToken = data.token;
    }
  });

  describe('GET /api/agents-hub/status', () => {
    it('should return all agents status', async () => {
      const response = await fetch(`${API_BASE}/api/agents-hub/status`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.totalAgents).toBeGreaterThan(0);
      expect(data.agents).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      const response = await fetch(`${API_BASE}/api/agents-hub/status`);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/agents-hub/health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_BASE}/api/agents-hub/health`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe('healthy');
      expect(data.agents).toBe(15);
    });
  });

  describe('POST /api/agents-hub/visitor/predict', () => {
    it('should predict visitor traffic', async () => {
      const response = await fetch(`${API_BASE}/api/agents-hub/visitor/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exhibitionTheme: 'Modern Art',
          duration: 30,
          targetAudience: 'General Public'
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.agent).toBe('VisitorAgent');
    });
  });

  describe('POST /api/agents-hub/budget/plan', () => {
    it('should create budget plan', async () => {
      const response = await fetch(`${API_BASE}/api/agents-hub/budget/plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: 'Test Exhibition',
          totalBudget: 100000,
          duration: 90
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.agent).toBe('BudgetAgent');
    });
  });

  describe('POST /api/agents-hub/education/design', () => {
    it('should design education program', async () => {
      const response = await fetch(`${API_BASE}/api/agents-hub/education/design`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          theme: 'Contemporary Art',
          targetAge: '10-15',
          duration: 60
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.agent).toBe('EducationAgent');
    });
  });
});

describe('Approval System API', () => {
  describe('GET /api/approvals/pending', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_BASE}/api/approvals/pending`);
      expect(response.status).toBe(401);
    });

    it('should return pending approvals for approvers', async () => {
      if (!authToken) return;
      
      const response = await fetch(`${API_BASE}/api/approvals/pending`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      // May return 403 if user is not an approver
      expect([200, 403]).toContain(response.status);
    });
  });
});

describe('Project API', () => {
  describe('GET /api/projects', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_BASE}/api/projects`);
      expect(response.status).toBe(401);
    });

    it('should return projects list', async () => {
      if (!authToken) return;
      
      const response = await fetch(`${API_BASE}/api/projects`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.projects).toBeInstanceOf(Array);
    });
  });
});
