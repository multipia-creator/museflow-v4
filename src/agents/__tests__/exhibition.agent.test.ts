/**
 * Exhibition Agent Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExhibitionAgent } from '../exhibition.agent';
import type { AgentContext, ExhibitionPlanRequest } from '../../types/agent.types';

describe('ExhibitionAgent', () => {
  let agent: ExhibitionAgent;
  let context: AgentContext;

  beforeEach(() => {
    agent = new ExhibitionAgent();
    
    context = {
      workflowId: 'test-workflow',
      workflowName: 'Test Workflow',
      nodeId: 'test-node',
      nodeType: 'exhibition',
      userId: 'test-user',
      userName: 'Test User',
      history: [],
      relevantEntities: [],
      constraints: {},
    };
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(agent.initialize()).resolves.not.toThrow();
    });
  });

  describe('configuration', () => {
    it('should have correct agent configuration', () => {
      expect(agent['config'].name).toBe('Exhibition Agent');
      expect(agent['config'].domain).toBe('exhibition');
      expect(agent['config'].capabilities.plan).toBe(true);
      expect(agent['config'].capabilities.execute).toBe(true);
    });
  });

  describe('plan creation', () => {
    it('should create a valid execution plan', async () => {
      const request: ExhibitionPlanRequest = {
        theme: 'Korean Modern Art',
        targetAudience: 'General public',
        budget: 100000,
        duration: 'P3M',
      };

      const plan = await agent.plan(request, context);

      expect(plan.id).toBeDefined();
      expect(plan.agentName).toBe('Exhibition Agent');
      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.status).toBe('draft');
    });
  });

  describe('validateExhibitionPlan', () => {
    it('should validate complete exhibition plan', () => {
      const validPlan = {
        concept: {
          theme: 'Test Exhibition',
          description: 'Test description',
          targetAudience: 'General',
          objectives: ['Objective 1'],
        },
        budget: {
          total: 100000,
          breakdown: { venue: 50000 },
        },
        artworks: [{
          id: '1',
          title: 'Test Artwork',
          artist: 'Test Artist',
          reason: 'Test reason',
        }],
        timeline: {
          startDate: '2024-01-01',
          endDate: '2024-04-01',
          milestones: [],
        },
        nodes: [],
      };

      expect(() => agent['validateExhibitionPlan'](validPlan)).not.toThrow();
    });

    it('should throw error for invalid plan', () => {
      const invalidPlan = {
        concept: {
          theme: '',
          description: '',
          targetAudience: '',
          objectives: [],
        },
        budget: { total: 0, breakdown: {} },
        artworks: [],
        timeline: {
          startDate: '',
          endDate: '',
          milestones: [],
        },
        nodes: [],
      };

      expect(() => agent['validateExhibitionPlan'](invalidPlan)).toThrow();
    });
  });
});
