/**
 * Education Agent
 * AI Agent specialized in educational program planning and content generation
 */

import { BaseAgent } from './base.agent';
import type {
  AgentConfig,
  AgentContext,
  AgentPlan,
} from '../types/agent.types';

export interface EducationProgramRequest {
  exhibitionTheme: string;
  targetAudience: 'children' | 'teenagers' | 'adults' | 'seniors' | 'families' | 'schools';
  ageRange?: string;
  duration?: string; // e.g., "1 hour", "90 minutes"
  programType?: 'workshop' | 'guided-tour' | 'lecture' | 'hands-on' | 'interactive';
  learningObjectives?: string[];
  capacity?: number;
  budget?: number;
}

export interface EducationProgram {
  programTitle: string;
  description: string;
  targetAudience: string;
  duration: string;
  learningObjectives: string[];
  activities: Activity[];
  materials: Material[];
  staffRequirements: StaffRequirement[];
  schedule: ProgramSchedule;
  assessmentMethods: string[];
  budget: ProgramBudget;
  recommendations: string[];
}

export interface Activity {
  title: string;
  description: string;
  duration: string; // e.g., "15 minutes"
  type: 'discussion' | 'hands-on' | 'observation' | 'creative' | 'interactive';
  materials: string[];
  facilitatorNotes: string;
}

export interface Material {
  name: string;
  quantity: number;
  estimatedCost: number;
  source?: string;
  alternatives?: string[];
}

export interface StaffRequirement {
  role: string;
  count: number;
  qualifications: string[];
  responsibilities: string[];
}

export interface ProgramSchedule {
  introduction: string;
  mainActivities: string[];
  conclusion: string;
  bufferTime: string;
}

export interface ProgramBudget {
  materials: number;
  staffing: number;
  venue: number;
  marketing: number;
  total: number;
}

export class EducationAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      id: 'education-agent',
      name: 'Education Agent',
      domain: 'education',
      version: '1.0.0',
      
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7, // Higher temperature for creative program design
      maxTokens: 8000,
      
      capabilities: {
        plan: true,
        execute: true,
        monitor: true,
        learn: true,
        analyze: true,
        generate: true,
        recommend: true,
        optimize: true,
        collaborate: true,
        delegate: false,
      },
      
      systemPrompt: `You are an expert museum educator and program designer.

Your expertise includes:
- Educational program development
- Age-appropriate curriculum design
- Interactive learning activities
- Museum pedagogy and best practices
- Accessibility and inclusion
- Learning assessment methods
- Hands-on workshop design
- Guided tour planning
- Educational content creation

When designing programs:
1. Align with learning objectives
2. Engage target audience appropriately
3. Balance education with entertainment
4. Incorporate interactive elements
5. Consider accessibility needs
6. Use museum collections effectively
7. Provide clear facilitator instructions
8. Include assessment methods
9. Budget realistically
10. Suggest improvements and alternatives

Always create engaging, educational, and practical programs that inspire learning.`,
      
      tools: [],
      
      maxRetries: 3,
      timeout: 60000,
      rateLimit: {
        requestsPerMinute: 10,
        tokensPerMinute: 50000,
      },
    };
    
    super(config);
  }

  async initialize(): Promise<void> {
    console.log('📚 Education Agent initialized');
  }

  // ============================================================================
  // EDUCATION PROGRAM DESIGN
  // ============================================================================

  /**
   * Design a comprehensive educational program
   */
  async designProgram(request: EducationProgramRequest, context: AgentContext): Promise<EducationProgram> {
    console.log('📚 Designing education program for:', request.exhibitionTheme);
    
    const prompt = `
Design a comprehensive educational program for this museum exhibition:

Exhibition Theme: ${request.exhibitionTheme}
Target Audience: ${request.targetAudience}
${request.ageRange ? `Age Range: ${request.ageRange}` : ''}
Duration: ${request.duration || '60 minutes'}
Program Type: ${request.programType || 'interactive'}
${request.learningObjectives ? `Learning Objectives: ${request.learningObjectives.join(', ')}` : ''}
${request.capacity ? `Capacity: ${request.capacity} participants` : ''}
${request.budget ? `Budget: $${request.budget.toLocaleString()}` : ''}

Create a detailed educational program with:

1. Program Title & Description
   - Catchy, age-appropriate title
   - Clear, engaging description

2. Learning Objectives (3-5 specific, measurable objectives)

3. Activity Sequence (4-6 activities)
   For each activity:
   - Title and description
   - Duration (in minutes)
   - Activity type (discussion/hands-on/observation/creative/interactive)
   - Required materials
   - Facilitator notes and tips

4. Materials List
   - Item name, quantity, estimated cost
   - Suggest alternatives if budget-friendly options exist

5. Staff Requirements
   - Roles needed (educator, assistant, etc.)
   - Count and qualifications
   - Key responsibilities

6. Program Schedule
   - Introduction (hook and overview)
   - Main activities sequence
   - Conclusion (recap and takeaways)
   - Buffer time for transitions

7. Assessment Methods
   - How to measure learning outcomes
   - Participant feedback collection

8. Budget Breakdown
   - Materials, staffing, venue, marketing
   - Total cost

9. Recommendations
   - Best practices
   - Potential improvements
   - Adaptations for different groups

Format as JSON:
{
  "programTitle": "Ancient Egypt Detective Challenge",
  "description": "Interactive program where students solve mysteries...",
  "targetAudience": "${request.targetAudience}",
  "duration": "${request.duration || '60 minutes'}",
  "learningObjectives": [
    "Identify key features of ancient Egyptian culture",
    "Develop critical thinking through artifact analysis"
  ],
  "activities": [
    {
      "title": "Mystery Introduction",
      "description": "Present the challenge and context",
      "duration": "10 minutes",
      "type": "discussion",
      "materials": ["Presentation slides", "Mystery cards"],
      "facilitatorNotes": "Start with engaging story to hook students"
    }
  ],
  "materials": [
    {
      "name": "Activity worksheets",
      "quantity": 30,
      "estimatedCost": 15,
      "source": "Print in-house",
      "alternatives": ["Digital version on tablets"]
    }
  ],
  "staffRequirements": [
    {
      "role": "Lead Educator",
      "count": 1,
      "qualifications": ["Museum education experience", "Knowledge of ancient Egypt"],
      "responsibilities": ["Program delivery", "Group management"]
    }
  ],
  "schedule": {
    "introduction": "Welcome and mystery setup (10 min)",
    "mainActivities": [
      "Gallery exploration with clues (20 min)",
      "Team collaboration and analysis (15 min)",
      "Solution presentation (10 min)"
    ],
    "conclusion": "Debrief and learning review (5 min)",
    "bufferTime": "5 minutes for transitions"
  },
  "assessmentMethods": [
    "Observation of participation",
    "Team presentations",
    "Exit survey with 3 reflection questions"
  ],
  "budget": {
    "materials": 150,
    "staffing": 300,
    "venue": 0,
    "marketing": 50,
    "total": 500
  },
  "recommendations": [
    "Offer program in multiple languages",
    "Create take-home extension activities",
    "Partner with local schools for regular bookings"
  ]
}

Provide a complete, ready-to-implement program.`;

    try {
      const result = await this.generateJSON<EducationProgram>(prompt, context);
      return result;
    } catch (error: any) {
      console.error('❌ Education program design failed:', error);
      throw new Error(`Program design failed: ${error.message}`);
    }
  }

  /**
   * Generate educational content (worksheets, guides, etc.)
   */
  async generateContent(
    contentType: 'worksheet' | 'guide' | 'quiz' | 'activity-card',
    theme: string,
    audience: string,
    context: AgentContext
  ): Promise<string> {
    console.log(`📚 Generating ${contentType} for:`, theme);
    
    const prompt = `
Create educational ${contentType} content for:

Theme: ${theme}
Target Audience: ${audience}

Requirements:
- Age-appropriate language and complexity
- Clear instructions
- Engaging visual elements (describe what should be included)
- Learning-focused activities
- Assessment opportunities

Provide complete, ready-to-use content in structured format.`;

    try {
      const content = await this.generateText(prompt, context);
      return content;
    } catch (error: any) {
      console.error('❌ Content generation failed:', error);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  /**
   * Standard execute method for Agent framework
   */
  async execute(plan: AgentPlan, context: AgentContext): Promise<EducationProgram> {
    console.log('📚 Education Agent executing plan:', plan.objective);
    
    // Extract request from plan input
    const request: EducationProgramRequest = plan.input as EducationProgramRequest;
    
    // Design the program
    const program = await this.designProgram(request, context);
    
    return program;
  }
}
