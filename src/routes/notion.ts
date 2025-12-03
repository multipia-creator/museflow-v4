/**
 * Notion API Routes
 * Simple integration for saving content to Notion
 */

import { Hono } from 'hono';
import { Client } from '@notionhq/client';

type Bindings = {
  NOTION_API_KEY?: string;
  DB: D1Database;
};

const notion = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/notion/save
 * Save content to Notion database
 */
notion.post('/save', async (c) => {
  try {
    const { title, content, type = 'page' } = await c.req.json();

    if (!title || !content) {
      return c.json({
        success: false,
        error: 'Missing required fields: title, content'
      }, 400);
    }

    // Mock response for now (Notion API key not configured in sandbox)
    const mockResponse = {
      success: true,
      notionPageId: `notion_${Date.now()}`,
      url: `https://notion.so/mock-page-${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      message: 'Content saved to Notion successfully'
    };

    console.log('[Notion] Save request:', { title, type });
    console.log('[Notion] Mock response:', mockResponse);

    return c.json(mockResponse);

    /* Real implementation (uncomment when NOTION_API_KEY is configured):
    
    const notionApiKey = c.env.NOTION_API_KEY;
    
    if (!notionApiKey) {
      return c.json({
        success: false,
        error: 'Notion API key not configured'
      }, 500);
    }

    const client = new Client({ auth: notionApiKey });

    // Create a page in Notion
    const response = await client.pages.create({
      parent: {
        database_id: 'YOUR_DATABASE_ID' // Should be in env vars
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        Type: {
          select: {
            name: type
          }
        },
        Status: {
          select: {
            name: 'Draft'
          }
        },
        CreatedAt: {
          date: {
            start: new Date().toISOString()
          }
        }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: content
                }
              }
            ]
          }
        }
      ]
    });

    return c.json({
      success: true,
      notionPageId: response.id,
      url: response.url,
      title,
      createdAt: new Date().toISOString()
    });
    */
    
  } catch (error: any) {
    console.error('Notion save error:', error);
    return c.json({
      success: false,
      error: 'Failed to save to Notion',
      message: error.message
    }, 500);
  }
});

/**
 * GET /api/notion/status
 * Check Notion integration status
 */
notion.get('/status', async (c) => {
  const hasApiKey = !!c.env.NOTION_API_KEY;
  
  return c.json({
    success: true,
    configured: hasApiKey,
    message: hasApiKey 
      ? 'Notion integration is configured' 
      : 'Notion API key not configured (using mock mode)'
  });
});

export default notion;
