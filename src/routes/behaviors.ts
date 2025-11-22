/**
 * Behaviors API Routes
 * Handles user behavior tracking and insights
 */

import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/behaviors/track
 * Track user behaviors (batch)
 */
app.post('/track', async (c) => {
    try {
        const user = c.get('user');
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const { events } = await c.req.json();
        
        if (!events || !Array.isArray(events) || events.length === 0) {
            return c.json({ error: 'No events provided' }, 400);
        }

        // Insert events in batch
        const stmt = c.env.DB.prepare(`
            INSERT INTO user_behaviors 
            (user_id, event_type, resource_type, resource_id, page_path, duration, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        // Execute all inserts
        const results = await c.env.DB.batch(
            events.map(event => 
                stmt.bind(
                    user.id,
                    event.event_type || 'unknown',
                    event.resource_type || null,
                    event.resource_id || null,
                    event.page_path || null,
                    event.duration || 0,
                    event.metadata || '{}'
                )
            )
        );

        console.log(`✅ Tracked ${events.length} behaviors for user ${user.id}`);

        return c.json({ 
            success: true, 
            tracked: events.length 
        });

    } catch (error) {
        console.error('Error tracking behaviors:', error);
        return c.json({ 
            error: 'Failed to track behaviors',
            details: error.message 
        }, 500);
    }
});

/**
 * GET /api/behaviors/recent
 * Get recent user behaviors
 */
app.get('/recent', async (c) => {
    try {
        const user = c.get('user');
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const limit = parseInt(c.req.query('limit') || '10');

        const result = await c.env.DB.prepare(`
            SELECT 
                id,
                event_type,
                resource_type,
                resource_id,
                page_path,
                duration,
                metadata,
                created_at
            FROM user_behaviors
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `).bind(user.id, limit).all();

        // Parse metadata JSON
        const behaviors = result.results.map(b => ({
            ...b,
            metadata: JSON.parse(b.metadata || '{}')
        }));

        return c.json(behaviors);

    } catch (error) {
        console.error('Error fetching recent behaviors:', error);
        return c.json({ 
            error: 'Failed to fetch behaviors',
            details: error.message 
        }, 500);
    }
});

/**
 * GET /api/behaviors/insights
 * Get user insights and analytics
 */
app.get('/insights', async (c) => {
    try {
        const user = c.get('user');
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Check cache first
        const cached = await c.env.DB.prepare(`
            SELECT insight_data, valid_until
            FROM user_insights
            WHERE user_id = ? AND insight_type = 'dashboard' AND valid_until > datetime('now')
        `).bind(user.id).first();

        if (cached) {
            return c.json(JSON.parse(cached.insight_data));
        }

        // Calculate insights
        
        // 1. Recent activity (last 7 days)
        const recentActivity = await c.env.DB.prepare(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count,
                AVG(duration) as avg_duration
            FROM user_behaviors
            WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        `).bind(user.id).all();

        // 2. Top features (last 30 days)
        const topFeatures = await c.env.DB.prepare(`
            SELECT 
                resource_type,
                COUNT(*) as usage_count
            FROM user_behaviors
            WHERE user_id = ? 
                AND created_at >= datetime('now', '-30 days')
                AND resource_type IS NOT NULL
            GROUP BY resource_type
            ORDER BY usage_count DESC
            LIMIT 5
        `).bind(user.id).all();

        // 3. Total activity count
        const totalActivity = await c.env.DB.prepare(`
            SELECT COUNT(*) as total
            FROM user_behaviors
            WHERE user_id = ?
        `).bind(user.id).first();

        // 4. Weekly comparison
        const thisWeekCount = await c.env.DB.prepare(`
            SELECT COUNT(*) as count
            FROM user_behaviors
            WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
        `).bind(user.id).first();

        const lastWeekCount = await c.env.DB.prepare(`
            SELECT COUNT(*) as count
            FROM user_behaviors
            WHERE user_id = ? 
                AND created_at >= datetime('now', '-14 days')
                AND created_at < datetime('now', '-7 days')
        `).bind(user.id).first();

        // Calculate productivity score (0-100)
        const activityScore = Math.min(100, (thisWeekCount.count || 0) * 2);
        const consistencyScore = recentActivity.results.length * 14; // 7 days max
        const productivityScore = Math.round((activityScore + consistencyScore) / 2);

        const insights = {
            recent_activity: recentActivity.results,
            top_features: topFeatures.results,
            total_activity: totalActivity.total || 0,
            this_week_count: thisWeekCount.count || 0,
            last_week_count: lastWeekCount.count || 0,
            week_change: lastWeekCount.count > 0 
                ? Math.round(((thisWeekCount.count - lastWeekCount.count) / lastWeekCount.count) * 100)
                : 0,
            productivity_score: productivityScore
        };

        // Cache insights for 1 hour
        await c.env.DB.prepare(`
            INSERT OR REPLACE INTO user_insights (user_id, insight_type, insight_data, valid_until)
            VALUES (?, 'dashboard', ?, datetime('now', '+1 hour'))
        `).bind(
            user.id,
            JSON.stringify(insights)
        ).run();

        return c.json(insights);

    } catch (error) {
        console.error('Error generating insights:', error);
        return c.json({ 
            error: 'Failed to generate insights',
            details: error.message 
        }, 500);
    }
});

/**
 * GET /api/behaviors/stats
 * Get behavior statistics summary
 */
app.get('/stats', async (c) => {
    try {
        const user = c.get('user');
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const stats = await c.env.DB.prepare(`
            SELECT 
                COUNT(*) as total_events,
                COUNT(DISTINCT DATE(created_at)) as active_days,
                COUNT(DISTINCT page_path) as pages_visited,
                SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as total_clicks,
                SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as total_views,
                SUM(CASE WHEN event_type = 'edit' THEN 1 ELSE 0 END) as total_edits
            FROM user_behaviors
            WHERE user_id = ?
        `).bind(user.id).first();

        return c.json(stats || {
            total_events: 0,
            active_days: 0,
            pages_visited: 0,
            total_clicks: 0,
            total_views: 0,
            total_edits: 0
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return c.json({ 
            error: 'Failed to fetch stats',
            details: error.message 
        }, 500);
    }
});

export default app;
