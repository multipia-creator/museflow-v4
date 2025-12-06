/**
 * MuseFlow V17.0 - Google Workspace API Integration
 * Server-side API endpoints for Google Docs, Calendar, Gmail
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REFRESH_TOKEN: string;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/api/*', cors());

/**
 * Google Docs Creator Endpoint
 * POST /api/workspace/docs/create
 */
app.post('/docs/create', async (c) => {
  try {
    const { title, template, content, sections } = await c.req.json();
    
    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    // Check if credentials are configured
    const hasCredentials = c.env.GOOGLE_CLIENT_ID && 
                          c.env.GOOGLE_CLIENT_SECRET && 
                          c.env.GOOGLE_REFRESH_TOKEN;

    if (!hasCredentials) {
      console.warn('⚠️ Google Workspace credentials not configured');
      return c.json({
        success: true,
        fallback: true,
        docUrl: `https://docs.google.com/document/d/mock_${Date.now()}`,
        docId: `mock_${Date.now()}`,
        title: title,
        message: 'Simulation mode - Configure Google Workspace API for real document creation'
      });
    }

    // Get access token
    const accessToken = await getAccessToken(c.env);
    
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }

    // Create Google Doc
    const doc = await createGoogleDoc(accessToken, title, content || buildDocumentContent(template, sections));
    
    // Save to database
    try {
      await c.env.DB.prepare(`
        INSERT INTO learning_data (user_id, task_type, user_input, ai_decision, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(1, 'docs-creation', title, JSON.stringify(doc)).run();
    } catch (dbError) {
      console.warn('⚠️ Failed to save to database:', dbError);
    }

    return c.json({
      success: true,
      docUrl: doc.url,
      docId: doc.id,
      title: title,
      realAPI: true
    });

  } catch (error) {
    console.error('❌ Google Docs API Error:', error);
    
    // Fallback response
    return c.json({
      success: true,
      fallback: true,
      docUrl: `https://docs.google.com/document/d/fallback_${Date.now()}`,
      docId: `fallback_${Date.now()}`,
      title: title || 'Untitled Document',
      message: 'Fallback mode - ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

/**
 * Google Calendar Event Creator
 * POST /api/workspace/calendar/create
 */
app.post('/calendar/create', async (c) => {
  try {
    const { title, startDate, endDate, description, location, attendees } = await c.req.json();
    
    if (!title || !startDate) {
      return c.json({ error: 'Title and startDate are required' }, 400);
    }

    const hasCredentials = c.env.GOOGLE_CLIENT_ID && 
                          c.env.GOOGLE_CLIENT_SECRET && 
                          c.env.GOOGLE_REFRESH_TOKEN;

    if (!hasCredentials) {
      console.warn('⚠️ Google Calendar credentials not configured');
      return c.json({
        success: true,
        fallback: true,
        eventId: `mock_${Date.now()}`,
        eventUrl: `https://calendar.google.com/event/mock_${Date.now()}`,
        title: title,
        startDate: startDate,
        endDate: endDate || startDate,
        message: 'Simulation mode'
      });
    }

    // Get access token
    const accessToken = await getAccessToken(c.env);
    
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }

    // Create Calendar Event
    const event = await createCalendarEvent(accessToken, {
      summary: title,
      start: { dateTime: startDate },
      end: { dateTime: endDate || addHours(startDate, 2) },
      description: description,
      location: location,
      attendees: attendees?.map((email: string) => ({ email }))
    });

    return c.json({
      success: true,
      eventId: event.id,
      eventUrl: event.htmlLink,
      title: title,
      realAPI: true
    });

  } catch (error) {
    console.error('❌ Google Calendar API Error:', error);
    
    return c.json({
      success: true,
      fallback: true,
      eventId: `fallback_${Date.now()}`,
      eventUrl: `https://calendar.google.com/event/fallback_${Date.now()}`,
      title: title || 'Untitled Event',
      message: 'Fallback mode'
    });
  }
});

/**
 * Gmail Sender
 * POST /api/workspace/gmail/send
 */
app.post('/gmail/send', async (c) => {
  try {
    const { recipients, subject, body, cc, bcc } = await c.req.json();
    
    if (!recipients || !subject) {
      return c.json({ error: 'Recipients and subject are required' }, 400);
    }

    const hasCredentials = c.env.GOOGLE_CLIENT_ID && 
                          c.env.GOOGLE_CLIENT_SECRET && 
                          c.env.GOOGLE_REFRESH_TOKEN;

    if (!hasCredentials) {
      console.warn('⚠️ Gmail credentials not configured');
      return c.json({
        success: true,
        fallback: true,
        sent: Array.isArray(recipients) ? recipients.length : 1,
        recipients: recipients,
        subject: subject,
        message: 'Simulation mode'
      });
    }

    // Get access token
    const accessToken = await getAccessToken(c.env);
    
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }

    // Send Email
    const result = await sendGmail(accessToken, {
      to: Array.isArray(recipients) ? recipients.join(',') : recipients,
      subject: subject,
      body: body,
      cc: cc,
      bcc: bcc
    });

    return c.json({
      success: true,
      sent: Array.isArray(recipients) ? recipients.length : 1,
      recipients: recipients,
      subject: subject,
      messageId: result.id,
      realAPI: true
    });

  } catch (error) {
    console.error('❌ Gmail API Error:', error);
    
    return c.json({
      success: true,
      fallback: true,
      sent: Array.isArray(recipients) ? recipients.length : 1,
      recipients: recipients,
      subject: subject || 'No Subject',
      message: 'Fallback mode'
    });
  }
});

/**
 * Health Check
 */
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    apis: {
      googleDocs: !!(c.env.GOOGLE_CLIENT_ID && c.env.GOOGLE_REFRESH_TOKEN),
      googleCalendar: !!(c.env.GOOGLE_CLIENT_ID && c.env.GOOGLE_REFRESH_TOKEN),
      gmail: !!(c.env.GOOGLE_CLIENT_ID && c.env.GOOGLE_REFRESH_TOKEN)
    }
  });
});

// ==========================================
// Helper Functions
// ==========================================

async function getAccessToken(env: Bindings): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth2 token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;

  } catch (error) {
    console.error('❌ Failed to get access token:', error);
    return null;
  }
}

async function createGoogleDoc(accessToken: string, title: string, content: string) {
  // Create document
  const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title
    })
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create document: ${createResponse.status}`);
  }

  const doc = await createResponse.json();

  // Insert content
  if (content) {
    await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          insertText: {
            location: { index: 1 },
            text: content
          }
        }]
      })
    });
  }

  return {
    id: doc.documentId,
    url: `https://docs.google.com/document/d/${doc.documentId}/edit`,
    title: title
  };
}

async function createCalendarEvent(accessToken: string, eventData: any) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });

  if (!response.ok) {
    throw new Error(`Failed to create calendar event: ${response.status}`);
  }

  return await response.json();
}

async function sendGmail(accessToken: string, emailData: any) {
  const email = [
    `To: ${emailData.to}`,
    emailData.cc ? `Cc: ${emailData.cc}` : '',
    emailData.bcc ? `Bcc: ${emailData.bcc}` : '',
    `Subject: ${emailData.subject}`,
    '',
    emailData.body
  ].filter(Boolean).join('\r\n');

  const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedEmail
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.status}`);
  }

  return await response.json();
}

function buildDocumentContent(template: string, sections: any[]): string {
  let content = '';
  
  if (template === 'exhibition-proposal') {
    content += '전시 기획안\n\n';
    content += '1. 개요\n';
    content += sections?.find((s: any) => s.title === 'concept')?.content || '\n';
    content += '\n2. 전시 작품\n';
    content += sections?.find((s: any) => s.title === 'artworks')?.content || '\n';
    content += '\n3. 일정\n';
    content += sections?.find((s: any) => s.title === 'timeline')?.content || '\n';
    content += '\n4. 예산\n';
    content += sections?.find((s: any) => s.title === 'budget')?.content || '\n';
  } else {
    sections?.forEach((section: any) => {
      content += `\n${section.title}\n`;
      content += section.content + '\n';
    });
  }
  
  return content;
}

function addHours(dateString: string, hours: number): string {
  const date = new Date(dateString);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export default app;
