/**
 * Help API Routes
 * Handles help-related endpoints including AI assistant
 */

import { Hono } from 'hono';
import { handleAIAssistant } from './help-ai-assistant';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const help = new Hono<{ Bindings: Bindings }>();

// AI Assistant endpoint
help.post('/ai-assistant', handleAIAssistant);

// Future endpoints:
// help.get('/articles', getArticles);
// help.get('/articles/:id', getArticleById);
// help.post('/articles/:id/helpful', markArticleHelpful);
// help.get('/search', searchArticles);

export default help;
