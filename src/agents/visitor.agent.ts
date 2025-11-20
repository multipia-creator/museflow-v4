/**
 * Visitor Prediction Agent
 * AI Agent specialized in visitor traffic prediction and analytics
 */

import { BaseAgent } from './base.agent';
import type {
  AgentConfig,
  AgentContext,
  AgentPlan,
  AgentPlanStep,
} from '../types/agent.types';
import { v4 as uuidv4 } from 'uuid';

export interface VisitorPredictionRequest {
  exhibitionTheme: string;
  targetAudience?: string;
  duration?: string; // e.g., "3 months"
  venue?: string;
  marketingBudget?: number;
  seasonalFactor?: 'spring' | 'summer' | 'fall' | 'winter';
  specialEvents?: string[];
  historicalData?: HistoricalVisitorData[];
}

export interface HistoricalVisitorData {
  date: string;
  visitorCount: number;
  exhibitionType: string;
  weather?: string;
  dayOfWeek: string;
  specialEvent?: string;
}

export interface VisitorPrediction {
  dailyPrediction: DailyPrediction[];
  summary: PredictionSummary;
  peakDays: string[];
  recommendations: string[];
  confidence: number;
}

export interface DailyPrediction {
  date: string;
  predictedVisitors: number;
  confidence: number;
  factors: string[];
  recommendation?: string;
}

export interface PredictionSummary {
  totalVisitors: number;
  averageDailyVisitors: number;
  peakDayVisitors: number;
  lowestDayVisitors: number;
  weekdayAverage: number;
  weekendAverage: number;
}

export class VisitorAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      id: 'visitor-agent',
      name: 'Visitor Agent',
      domain: 'analytics',
      version: '1.0.0',
      
      model: 'gemini-2.0-flash-exp',
      temperature: 0.3, // Lower temperature for more consistent predictions
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
      
      systemPrompt: `You are an expert museum visitor analytics and prediction specialist.

Your expertise includes:
- Visitor traffic pattern analysis
- Statistical forecasting models
- Seasonal trend identification
- Marketing impact assessment
- Event planning optimization
- Capacity planning
- Visitor behavior analytics

You consider multiple factors:
- Exhibition type and theme appeal
- Historical attendance data
- Seasonal variations
- Day of week patterns
- Weather impacts
- Marketing campaigns
- Special events
- Local holidays and events
- Target audience demographics
- Venue capacity constraints

When making predictions:
1. Analyze historical patterns if available
2. Consider exhibition appeal to target audience
3. Factor in seasonal trends
4. Account for marketing budget impact
5. Identify peak and low traffic periods
6. Provide confidence levels
7. Give actionable recommendations

Always provide data-driven, realistic predictions with clear reasoning.`,
      
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
    console.log('📊 Visitor Agent initialized');
  }

  // ============================================================================
  // VISITOR PREDICTION
  // ============================================================================

  /**
   * Predict visitor traffic for an exhibition
   */
  async predictVisitors(request: VisitorPredictionRequest, context: AgentContext): Promise<VisitorPrediction> {
    console.log('📊 Predicting visitor traffic for:', request.exhibitionTheme);
    
    const prompt = `
Predict visitor traffic for this museum exhibition:

Theme: ${request.exhibitionTheme}
${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}
${request.duration ? `Duration: ${request.duration}` : ''}
${request.venue ? `Venue: ${request.venue}` : ''}
${request.marketingBudget ? `Marketing Budget: $${request.marketingBudget.toLocaleString()}` : ''}
${request.seasonalFactor ? `Season: ${request.seasonalFactor}` : ''}
${request.specialEvents ? `Special Events: ${request.specialEvents.join(', ')}` : ''}

${request.historicalData ? `Historical Data Available: ${request.historicalData.length} data points` : 'No historical data available'}

Create a comprehensive visitor prediction with:
1. Daily visitor predictions (at least 30 days or entire duration)
2. Summary statistics
3. Peak traffic days identification
4. Actionable recommendations

Consider:
- Exhibition appeal and theme popularity
- Target audience size and interest
- Seasonal patterns (${request.seasonalFactor || 'general'})
- Day of week patterns (weekends typically 2-3x higher)
- Marketing budget impact (${request.marketingBudget ? 'significant' : 'minimal'} marketing)
- Special events boost (${request.specialEvents?.length || 0} planned events)
- Typical museum attendance patterns

Format as JSON:
{
  "dailyPrediction": [
    {
      "date": "2024-01-15",
      "predictedVisitors": 450,
      "confidence": 0.85,
      "factors": ["Weekend", "Opening week"],
      "recommendation": "Additional staff recommended"
    }
  ],
  "summary": {
    "totalVisitors": 15000,
    "averageDailyVisitors": 500,
    "peakDayVisitors": 1200,
    "lowestDayVisitors": 180,
    "weekdayAverage": 350,
    "weekendAverage": 850
  },
  "peakDays": ["2024-01-15", "2024-01-20"],
  "recommendations": [
    "Increase staffing on weekends",
    "Schedule guided tours during peak hours"
  ],
  "confidence": 0.78
}
`;

    try {
      const prediction = await this.generateJSON<VisitorPrediction>(prompt, undefined, context);
      
      console.log('✅ Visitor prediction completed');
      console.log(`   Total predicted visitors: ${prediction.summary.totalVisitors.toLocaleString()}`);
      console.log(`   Average daily: ${Math.round(prediction.summary.averageDailyVisitors)}`);
      console.log(`   Confidence: ${(prediction.confidence * 100).toFixed(0)}%`);
      
      return prediction;
      
    } catch (error: any) {
      console.error('❌ Failed to predict visitors:', error);
      throw new Error(`Visitor prediction failed: ${error.message}`);
    }
  }

  /**
   * Analyze historical visitor data
   */
  async analyzeHistoricalData(data: HistoricalVisitorData[], context?: AgentContext): Promise<any> {
    console.log(`📊 Analyzing ${data.length} historical records...`);
    
    const prompt = `
Analyze this historical visitor data and identify patterns:

Data points: ${data.length}
Date range: ${data[0]?.date} to ${data[data.length - 1]?.date}

Sample data:
${JSON.stringify(data.slice(0, 10), null, 2)}

Provide insights on:
1. Average visitor counts by day of week
2. Seasonal trends
3. Impact of special events
4. Weather correlations
5. Exhibition type preferences
6. Growth trends

Format as JSON with clear metrics and insights.
`;

    try {
      const analysis = await this.generateJSON<any>(prompt, undefined, context);
      console.log('✅ Historical analysis completed');
      return analysis;
    } catch (error: any) {
      console.error('❌ Failed to analyze historical data:', error);
      throw new Error(`Historical analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate capacity planning recommendations
   */
  async planCapacity(prediction: VisitorPrediction, venueCapacity: number, context?: AgentContext): Promise<any> {
    console.log('📊 Planning capacity management...');
    
    const prompt = `
Based on this visitor prediction, create a capacity management plan:

Venue Capacity: ${venueCapacity} visitors
Peak Day Visitors: ${prediction.summary.peakDayVisitors}
Average Daily: ${prediction.summary.averageDailyVisitors}

Peak Days: ${prediction.peakDays.join(', ')}

Provide:
1. Time slot recommendations for peak days
2. Staff allocation plan
3. Crowd control measures
4. Ticket reservation strategy
5. Emergency overflow plans

Format as structured JSON with actionable items.
`;

    try {
      const plan = await this.generateJSON<any>(prompt, undefined, context);
      console.log('✅ Capacity plan created');
      return plan;
    } catch (error: any) {
      console.error('❌ Failed to plan capacity:', error);
      throw new Error(`Capacity planning failed: ${error.message}`);
    }
  }

  /**
   * Calculate revenue projections
   */
  async projectRevenue(
    prediction: VisitorPrediction,
    ticketPrice: number,
    context?: AgentContext
  ): Promise<any> {
    console.log('💰 Calculating revenue projections...');
    
    const totalRevenue = prediction.summary.totalVisitors * ticketPrice;
    const averageDailyRevenue = prediction.summary.averageDailyVisitors * ticketPrice;
    const peakDayRevenue = prediction.summary.peakDayVisitors * ticketPrice;
    
    const projection = {
      ticketPrice,
      totalPredictedRevenue: totalRevenue,
      averageDailyRevenue,
      peakDayRevenue,
      confidence: prediction.confidence,
      breakdown: {
        weekdayRevenue: prediction.summary.weekdayAverage * ticketPrice * 5, // Per week
        weekendRevenue: prediction.summary.weekendAverage * ticketPrice * 2, // Per week
      },
    };
    
    console.log('✅ Revenue projection completed');
    console.log(`   Total projected: $${totalRevenue.toLocaleString()}`);
    
    return projection;
  }

  // ============================================================================
  // AGENT INTERFACE IMPLEMENTATION
  // ============================================================================

  async plan(task: VisitorPredictionRequest, context: AgentContext): Promise<AgentPlan> {
    const steps: AgentPlanStep[] = [
      {
        id: 'step-1',
        order: 1,
        description: 'Analyze exhibition parameters',
        action: 'analyze',
        parameters: { task },
        dependsOn: [],
        status: 'pending',
      },
      {
        id: 'step-2',
        order: 2,
        description: 'Review historical data if available',
        action: 'analyzeHistorical',
        parameters: { data: task.historicalData || [] },
        dependsOn: ['step-1'],
        status: 'pending',
      },
      {
        id: 'step-3',
        order: 3,
        description: 'Generate visitor predictions',
        action: 'predict',
        parameters: { request: task },
        dependsOn: ['step-2'],
        status: 'pending',
      },
      {
        id: 'step-4',
        order: 4,
        description: 'Create capacity management plan',
        action: 'planCapacity',
        parameters: {},
        dependsOn: ['step-3'],
        status: 'pending',
      },
    ];

    return {
      id: uuidv4(),
      agentName: this.config.name,
      goal: `Predict visitor traffic for: ${task.exhibitionTheme}`,
      steps,
      dependencies: [],
      estimatedDuration: 20000, // 20 seconds
      estimatedCost: 0.03,
      confidence: 0.80,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<VisitorPrediction> {
    console.log('📊 Executing visitor prediction plan...');
    
    // Extract request from plan steps
    const analyzeStep = plan.steps.find(s => s.action === 'analyze');
    const request: VisitorPredictionRequest = analyzeStep?.parameters.task || {};
    
    // Execute the actual prediction
    return await this.predictVisitors(request, context);
  }
}
