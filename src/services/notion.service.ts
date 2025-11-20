/**
 * Notion Integration Service
 * Two-way sync between Canvas workflows and Notion databases
 */

import { Client } from '@notionhq/client';
import type { 
  Workflow, 
  WorkflowParsed, 
  Node, 
  NodeParsed 
} from '../types/database.types';

export interface NotionConfig {
  apiKey: string;
  databases: {
    projects: string;
    tasks: string;
    artworks: string;
  };
}

export interface NotionProject {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  owner: string | null;
  workflowId: string | null;
}

export interface NotionTask {
  id: string;
  name: string;
  projectId: string;
  assignee: string | null;
  dueDate: string | null;
  status: string;
  priority: string;
  nodeId: string | null;
  agentAssigned: string | null;
}

/**
 * Notion Service
 * Handles all Notion API interactions
 */
export class NotionService {
  private client: Client;
  private databases: {
    projects: string;
    tasks: string;
    artworks: string;
  };

  constructor(config: NotionConfig) {
    this.client = new Client({ auth: config.apiKey });
    this.databases = config.databases;
  }

  // ============================================================================
  // PROJECT OPERATIONS
  // ============================================================================

  /**
   * Create Notion project page from workflow
   */
  async createProject(workflow: WorkflowParsed): Promise<string> {
    try {
      const response = await this.client.pages.create({
        parent: { database_id: this.databases.projects },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: workflow.name,
                },
              },
            ],
          },
          Status: {
            select: {
              name: this.mapWorkflowStatus(workflow.status),
            },
          },
          Type: {
            select: {
              name: 'Exhibition', // Default type
            },
          },
          StartDate: workflow.started_at ? {
            date: {
              start: workflow.started_at,
            },
          } : undefined,
          EndDate: workflow.completed_at ? {
            date: {
              start: workflow.completed_at,
            },
          } : undefined,
          Budget: workflow.metadata?.budget ? {
            number: workflow.metadata.budget,
          } : undefined,
          Owner: {
            people: [], // Would need user ID mapping
          },
          WorkflowId: {
            rich_text: [
              {
                text: {
                  content: workflow.id,
                },
              },
            ],
          },
          AIGenerated: {
            checkbox: workflow.ai_generated,
          },
        },
      });

      return response.id;
    } catch (error: any) {
      console.error('❌ Failed to create Notion project:', error);
      throw new Error(`Notion project creation failed: ${error.message}`);
    }
  }

  /**
   * Update Notion project
   */
  async updateProject(pageId: string, updates: Partial<WorkflowParsed>): Promise<void> {
    try {
      const properties: any = {};

      if (updates.name) {
        properties.Name = {
          title: [{ text: { content: updates.name } }],
        };
      }

      if (updates.status) {
        properties.Status = {
          select: { name: this.mapWorkflowStatus(updates.status) },
        };
      }

      if (updates.started_at) {
        properties.StartDate = {
          date: { start: updates.started_at },
        };
      }

      if (updates.completed_at) {
        properties.EndDate = {
          date: { start: updates.completed_at },
        };
      }

      await this.client.pages.update({
        page_id: pageId,
        properties,
      });
    } catch (error: any) {
      console.error('❌ Failed to update Notion project:', error);
      throw new Error(`Notion project update failed: ${error.message}`);
    }
  }

  /**
   * Get Notion project by workflow ID
   */
  async getProjectByWorkflowId(workflowId: string): Promise<NotionProject | null> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databases.projects,
        filter: {
          property: 'WorkflowId',
          rich_text: {
            equals: workflowId,
          },
        },
      });

      if (response.results.length === 0) {
        return null;
      }

      const page: any = response.results[0];
      return this.parseProjectPage(page);
    } catch (error: any) {
      console.error('❌ Failed to get Notion project:', error);
      return null;
    }
  }

  // ============================================================================
  // TASK OPERATIONS
  // ============================================================================

  /**
   * Create Notion task from node
   */
  async createTask(node: NodeParsed, projectId: string): Promise<string> {
    try {
      const response = await this.client.pages.create({
        parent: { database_id: this.databases.tasks },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: node.title || node.type,
                },
              },
            ],
          },
          Project: {
            relation: [{ id: projectId }],
          },
          Status: {
            select: {
              name: this.mapNodeStatus(node.status),
            },
          },
          Priority: {
            select: {
              name: 'Medium', // Default priority
            },
          },
          NodeId: {
            rich_text: [
              {
                text: {
                  content: node.id,
                },
              },
            ],
          },
          AgentAssigned: node.assigned_agent ? {
            select: {
              name: node.assigned_agent,
            },
          } : undefined,
          AutoGenerated: {
            checkbox: true,
          },
        },
      });

      return response.id;
    } catch (error: any) {
      console.error('❌ Failed to create Notion task:', error);
      throw new Error(`Notion task creation failed: ${error.message}`);
    }
  }

  /**
   * Update Notion task
   */
  async updateTask(pageId: string, updates: Partial<NodeParsed>): Promise<void> {
    try {
      const properties: any = {};

      if (updates.title) {
        properties.Name = {
          title: [{ text: { content: updates.title } }],
        };
      }

      if (updates.status) {
        properties.Status = {
          select: { name: this.mapNodeStatus(updates.status) },
        };
      }

      if (updates.assigned_agent) {
        properties.AgentAssigned = {
          select: { name: updates.assigned_agent },
        };
      }

      await this.client.pages.update({
        page_id: pageId,
        properties,
      });
    } catch (error: any) {
      console.error('❌ Failed to update Notion task:', error);
      throw new Error(`Notion task update failed: ${error.message}`);
    }
  }

  /**
   * Get Notion task by node ID
   */
  async getTaskByNodeId(nodeId: string): Promise<NotionTask | null> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databases.tasks,
        filter: {
          property: 'NodeId',
          rich_text: {
            equals: nodeId,
          },
        },
      });

      if (response.results.length === 0) {
        return null;
      }

      const page: any = response.results[0];
      return this.parseTaskPage(page);
    } catch (error: any) {
      console.error('❌ Failed to get Notion task:', error);
      return null;
    }
  }

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  /**
   * Sync workflow to Notion (Canvas → Notion)
   */
  async syncWorkflowToNotion(workflow: WorkflowParsed, nodes: NodeParsed[]): Promise<void> {
    try {
      console.log('🔄 Syncing workflow to Notion:', workflow.name);

      // 1. Create or update project
      let projectId = workflow.notion_page_id;
      
      if (!projectId) {
        projectId = await this.createProject(workflow);
        console.log('✅ Created Notion project:', projectId);
      } else {
        await this.updateProject(projectId, workflow);
        console.log('✅ Updated Notion project:', projectId);
      }

      // 2. Create or update tasks for each node
      for (const node of nodes) {
        let taskId = node.notion_task_id;
        
        if (!taskId) {
          taskId = await this.createTask(node, projectId);
          console.log('✅ Created Notion task:', taskId, 'for node:', node.id);
        } else {
          await this.updateTask(taskId, node);
          console.log('✅ Updated Notion task:', taskId, 'for node:', node.id);
        }
      }

      console.log('✅ Sync to Notion completed');
    } catch (error: any) {
      console.error('❌ Failed to sync workflow to Notion:', error);
      throw new Error(`Workflow sync failed: ${error.message}`);
    }
  }

  /**
   * Sync from Notion to Canvas (Notion → Canvas)
   */
  async syncNotionToCanvas(workflowId: string): Promise<{ workflow: Partial<WorkflowParsed>; nodes: Partial<NodeParsed>[] }> {
    try {
      console.log('🔄 Syncing from Notion to Canvas:', workflowId);

      // 1. Get Notion project
      const project = await this.getProjectByWorkflowId(workflowId);
      
      if (!project) {
        throw new Error(`No Notion project found for workflow: ${workflowId}`);
      }

      // 2. Get all tasks for this project
      const tasks = await this.getTasksByProjectId(project.id);

      // 3. Map to workflow updates
      const workflowUpdates: Partial<WorkflowParsed> = {
        name: project.name,
        status: this.unmapWorkflowStatus(project.status),
        started_at: project.startDate || undefined,
        completed_at: project.endDate || undefined,
      };

      // 4. Map to node updates
      const nodeUpdates: Partial<NodeParsed>[] = tasks.map(task => ({
        id: task.nodeId || undefined,
        title: task.name,
        status: this.unmapNodeStatus(task.status),
        assigned_agent: task.agentAssigned || undefined,
      }));

      console.log('✅ Sync from Notion completed');
      return { workflow: workflowUpdates, nodes: nodeUpdates };
    } catch (error: any) {
      console.error('❌ Failed to sync from Notion:', error);
      throw new Error(`Notion sync failed: ${error.message}`);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapWorkflowStatus(status: string): string {
    const map: Record<string, string> = {
      'draft': 'Planning',
      'active': 'In Progress',
      'paused': 'On Hold',
      'completed': 'Completed',
      'archived': 'Archived',
    };
    return map[status] || 'Planning';
  }

  private unmapWorkflowStatus(status: string): any {
    const map: Record<string, string> = {
      'Planning': 'draft',
      'In Progress': 'active',
      'On Hold': 'paused',
      'Completed': 'completed',
      'Archived': 'archived',
    };
    return map[status] || 'draft';
  }

  private mapNodeStatus(status: string): string {
    const map: Record<string, string> = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Done',
      'blocked': 'Blocked',
    };
    return map[status] || 'To Do';
  }

  private unmapNodeStatus(status: string): any {
    const map: Record<string, string> = {
      'To Do': 'todo',
      'In Progress': 'in-progress',
      'Done': 'done',
      'Blocked': 'blocked',
    };
    return map[status] || 'todo';
  }

  private parseProjectPage(page: any): NotionProject {
    const props = page.properties;
    return {
      id: page.id,
      name: props.Name?.title[0]?.text?.content || 'Untitled',
      status: props.Status?.select?.name || 'Planning',
      startDate: props.StartDate?.date?.start || null,
      endDate: props.EndDate?.date?.start || null,
      budget: props.Budget?.number || null,
      owner: props.Owner?.people[0]?.id || null,
      workflowId: props.WorkflowId?.rich_text[0]?.text?.content || null,
    };
  }

  private parseTaskPage(page: any): NotionTask {
    const props = page.properties;
    return {
      id: page.id,
      name: props.Name?.title[0]?.text?.content || 'Untitled',
      projectId: props.Project?.relation[0]?.id || '',
      assignee: props.Assignee?.people[0]?.id || null,
      dueDate: props.DueDate?.date?.start || null,
      status: props.Status?.select?.name || 'To Do',
      priority: props.Priority?.select?.name || 'Medium',
      nodeId: props.NodeId?.rich_text[0]?.text?.content || null,
      agentAssigned: props.AgentAssigned?.select?.name || null,
    };
  }

  private async getTasksByProjectId(projectId: string): Promise<NotionTask[]> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databases.tasks,
        filter: {
          property: 'Project',
          relation: {
            contains: projectId,
          },
        },
      });

      return response.results.map((page: any) => this.parseTaskPage(page));
    } catch (error: any) {
      console.error('❌ Failed to get tasks:', error);
      return [];
    }
  }

  /**
   * Test Notion connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.databases.retrieve({ database_id: this.databases.projects });
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Create singleton instance
 */
let notionInstance: NotionService | null = null;

export function initNotion(config: NotionConfig): NotionService {
  if (!notionInstance) {
    notionInstance = new NotionService(config);
  }
  return notionInstance;
}

export function getNotion(): NotionService {
  if (!notionInstance) {
    throw new Error('Notion service not initialized. Call initNotion() first.');
  }
  return notionInstance;
}
