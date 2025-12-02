import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// 위젯 카탈로그 조회
app.get('/api/widgets/catalog', async (c) => {
  try {
    const { category, search } = c.req.query();
    
    let query = 'SELECT * FROM widgets WHERE is_active = 1';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY popularity DESC, name ASC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({ widgets: results || [] });
  } catch (error) {
    console.error('Error fetching widget catalog:', error);
    return c.json({ error: 'Failed to fetch widgets' }, 500);
  }
});

// 사용자 위젯 목록 조회
app.get('/api/widgets', async (c) => {
  try {
    const userId = 1; // TODO: JWT에서 추출
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        uw.id as user_widget_id,
        w.*,
        wc.config,
        wc.layout_x as x,
        wc.layout_y as y,
        wc.layout_w as w,
        wc.layout_h as h,
        wc.state
      FROM user_widgets uw
      JOIN widgets w ON uw.widget_id = w.id
      LEFT JOIN widget_configs wc ON wc.user_widget_id = uw.id
      WHERE uw.user_id = ? AND uw.deleted_at IS NULL
      ORDER BY wc.layout_y, wc.layout_x
    `).bind(userId).all();
    
    return c.json({ widgets: results || [] });
  } catch (error) {
    console.error('Error fetching user widgets:', error);
    return c.json({ error: 'Failed to fetch user widgets' }, 500);
  }
});

// 위젯 추가
app.post('/api/widgets', async (c) => {
  try {
    const userId = 1; // TODO: JWT에서 추출
    const { widgetType, config, layout } = await c.req.json();
    
    // 위젯 정보 조회
    const widget = await c.env.DB.prepare(`
      SELECT * FROM widgets WHERE type = ?
    `).bind(widgetType).first();
    
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    
    // 사용자 위젯 추가
    const result = await c.env.DB.prepare(`
      INSERT INTO user_widgets (user_id, widget_id, added_at)
      VALUES (?, ?, datetime('now'))
    `).bind(userId, widget.id).run();
    
    const userWidgetId = result.meta.last_row_id;
    
    // 위젯 설정 저장
    await c.env.DB.prepare(`
      INSERT INTO widget_configs (
        user_widget_id, config, 
        layout_x, layout_y, layout_w, layout_h,
        state
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userWidgetId,
      JSON.stringify(config || {}),
      layout?.x || 0, 
      layout?.y || 0, 
      layout?.w || widget.default_width, 
      layout?.h || widget.default_height,
      JSON.stringify({ visible: true, minimized: false, locked: false })
    ).run();
    
    return c.json({ 
      success: true, 
      userWidgetId,
      widget: { ...widget, config, layout }
    });
  } catch (error) {
    console.error('Error adding widget:', error);
    return c.json({ error: 'Failed to add widget' }, 500);
  }
});

// 위젯 삭제
app.delete('/api/widgets/:id', async (c) => {
  try {
    const userId = 1; // TODO: JWT에서 추출
    const userWidgetId = c.req.param('id');
    
    await c.env.DB.prepare(`
      UPDATE user_widgets 
      SET deleted_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).bind(userWidgetId, userId).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return c.json({ error: 'Failed to delete widget' }, 500);
  }
});

// 위젯 설정 업데이트
app.patch('/api/widgets/:id/config', async (c) => {
  try {
    const userId = 1; // TODO: JWT에서 추출
    const userWidgetId = c.req.param('id');
    const { config, layout, state } = await c.req.json();
    
    await c.env.DB.prepare(`
      UPDATE widget_configs 
      SET 
        config = COALESCE(?, config),
        layout_x = COALESCE(?, layout_x),
        layout_y = COALESCE(?, layout_y),
        layout_w = COALESCE(?, layout_w),
        layout_h = COALESCE(?, layout_h),
        state = COALESCE(?, state),
        updated_at = datetime('now')
      WHERE user_widget_id = ?
      AND EXISTS (
        SELECT 1 FROM user_widgets 
        WHERE id = ? AND user_id = ?
      )
    `).bind(
      config ? JSON.stringify(config) : null,
      layout?.x, layout?.y, layout?.w, layout?.h,
      state ? JSON.stringify(state) : null,
      userWidgetId,
      userWidgetId, userId
    ).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating widget config:', error);
    return c.json({ error: 'Failed to update widget' }, 500);
  }
});

// 레이아웃 전체 저장
app.post('/api/widgets/layout', async (c) => {
  try {
    const userId = 1; // TODO: JWT에서 추출
    const { widgets } = await c.req.json();
    
    // 트랜잭션으로 일괄 업데이트
    const batch = widgets.map((w: any) => 
      c.env.DB.prepare(`
        UPDATE widget_configs 
        SET layout_x = ?, layout_y = ?, layout_w = ?, layout_h = ?
        WHERE user_widget_id = ?
        AND EXISTS (
          SELECT 1 FROM user_widgets 
          WHERE id = ? AND user_id = ?
        )
      `).bind(w.x, w.y, w.w, w.h, w.id, w.id, userId)
    );
    
    await c.env.DB.batch(batch);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving layout:', error);
    return c.json({ error: 'Failed to save layout' }, 500);
  }
});

// 레이아웃 프리셋 조회
app.get('/api/widgets/presets', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM layout_presets WHERE is_public = 1
      ORDER BY category, name
    `).all();
    
    return c.json({ presets: results || [] });
  } catch (error) {
    console.error('Error fetching presets:', error);
    return c.json({ error: 'Failed to fetch presets' }, 500);
  }
});

// 프리셋 적용
app.post('/api/widgets/preset/:presetId', async (c) => {
  try {
    const userId = 1; // TODO: JWT에서 추출
    const presetId = c.req.param('presetId');
    
    // 프리셋 조회
    const preset = await c.env.DB.prepare(`
      SELECT * FROM layout_presets WHERE id = ?
    `).bind(presetId).first();
    
    if (!preset) {
      return c.json({ error: 'Preset not found' }, 404);
    }
    
    // 기존 위젯 소프트 삭제
    await c.env.DB.prepare(`
      UPDATE user_widgets 
      SET deleted_at = datetime('now')
      WHERE user_id = ? AND deleted_at IS NULL
    `).bind(userId).run();
    
    // 프리셋 위젯 추가 로직 (생략 - 기본 위젯 추가)
    
    return c.json({ success: true, preset: preset.name });
  } catch (error) {
    console.error('Error applying preset:', error);
    return c.json({ error: 'Failed to apply preset' }, 500);
  }
});

// ==========================================
// WIDGET DATA APIs - Real-time data for widgets
// ==========================================

/**
 * GET /api/widgets/data/weather
 * Get current weather data for museum location
 */
app.get('/api/widgets/data/weather', async (c) => {
  try {
    // Default: Seoul, South Korea
    const lat = c.req.query('lat') || '37.5665';
    const lon = c.req.query('lon') || '126.9780';

    // Mock weather data (실제로는 OpenWeatherMap API 사용)
    const weatherData = {
      temperature: Math.round(15 + Math.random() * 10), // 15-25°C
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)],
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
      wind_speed: Math.round(5 + Math.random() * 10), // 5-15 km/h
      feels_like: Math.round(14 + Math.random() * 10),
      location: 'Seoul, KR',
      icon: 'sun', // sun, cloud, rain, etc.
      updated_at: new Date().toISOString()
    };

    return c.json({ success: true, data: weatherData });

  } catch (error) {
    console.error('Error fetching weather:', error);
    return c.json({ error: 'Failed to fetch weather data' }, 500);
  }
});

/**
 * GET /api/widgets/data/visitor-stats
 * Get visitor statistics for dashboard
 */
app.get('/api/widgets/data/visitor-stats', async (c) => {
  try {
    const period = c.req.query('period') || 'today'; // today, week, month

    // Mock visitor statistics
    const stats = {
      total_visitors: Math.round(1500 + Math.random() * 500),
      current_visitors: Math.round(50 + Math.random() * 100),
      peak_hour: '14:00',
      average_duration: '45 min',
      popular_exhibits: [
        { name: '특별전: 조선시대 도자기', visitors: 340 },
        { name: '상설전: 한국 미술', visitors: 280 },
        { name: '체험관', visitors: 210 }
      ],
      hourly_data: Array.from({ length: 12 }, (_, i) => ({
        hour: `${9 + i}:00`,
        visitors: Math.round(50 + Math.random() * 150)
      })),
      period: period,
      updated_at: new Date().toISOString()
    };

    return c.json({ success: true, data: stats });

  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return c.json({ error: 'Failed to fetch visitor statistics' }, 500);
  }
});

/**
 * GET /api/widgets/data/collection-stats
 * Get collection statistics
 */
app.get('/api/widgets/data/collection-stats', async (c) => {
  try {
    const stats = {
      total_items: 12450,
      digitized: 8920,
      on_display: 1230,
      in_storage: 11220,
      categories: [
        { name: '도자기', count: 3450, percentage: 27.7 },
        { name: '회화', count: 2890, percentage: 23.2 },
        { name: '조각', count: 2120, percentage: 17.0 },
        { name: '공예', count: 1780, percentage: 14.3 },
        { name: '기타', count: 2210, percentage: 17.8 }
      ],
      recent_acquisitions: [
        { title: '백자 달항아리', date: '2024-11-15', category: '도자기' },
        { title: '조선시대 민화', date: '2024-11-08', category: '회화' },
        { title: '청동 불상', date: '2024-10-22', category: '조각' }
      ],
      updated_at: new Date().toISOString()
    };

    return c.json({ success: true, data: stats });

  } catch (error) {
    console.error('Error fetching collection stats:', error);
    return c.json({ error: 'Failed to fetch collection statistics' }, 500);
  }
});

/**
 * GET /api/widgets/data/event-calendar
 * Get upcoming events
 */
app.get('/api/widgets/data/event-calendar', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '5');

    const events = [
      {
        id: 1,
        title: '큐레이터 도슨트',
        type: 'tour',
        start_time: new Date(Date.now() + 3600000).toISOString(), // +1 hour
        duration: 60,
        location: '1층 특별전시실',
        capacity: 20,
        registered: 15
      },
      {
        id: 2,
        title: '어린이 도자기 체험',
        type: 'workshop',
        start_time: new Date(Date.now() + 7200000).toISOString(), // +2 hours
        duration: 90,
        location: '체험관',
        capacity: 15,
        registered: 12
      },
      {
        id: 3,
        title: '한국 미술사 강연',
        type: 'lecture',
        start_time: new Date(Date.now() + 86400000).toISOString(), // +1 day
        duration: 120,
        location: '강당',
        capacity: 100,
        registered: 67
      }
    ].slice(0, limit);

    return c.json({ success: true, data: events });

  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

/**
 * GET /api/widgets/data/notifications
 * Get recent notifications/alerts
 */
app.get('/api/widgets/data/notifications', async (c) => {
  try {
    const userId = 1; // TODO: JWT에서 추출

    const notifications = [
      {
        id: 1,
        type: 'success',
        title: '프로젝트 저장 완료',
        message: '2024 봄 특별전 워크플로우가 저장되었습니다.',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        read: false
      },
      {
        id: 2,
        type: 'info',
        title: '새로운 댓글',
        message: '김미래 님이 "전시 기획안"에 댓글을 남겼습니다.',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        read: false
      },
      {
        id: 3,
        type: 'warning',
        title: '마감일 임박',
        message: '전시 오프닝 준비가 3일 남았습니다.',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: true
      }
    ];

    return c.json({ success: true, data: notifications });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

/**
 * GET /api/widgets/data/task-summary
 * Get task summary for dashboard
 */
app.get('/api/widgets/data/task-summary', async (c) => {
  try {
    const userId = 1; // TODO: JWT에서 추출

    const summary = {
      total_tasks: 28,
      completed: 15,
      in_progress: 8,
      pending: 5,
      overdue: 2,
      due_today: [
        { id: 1, title: '도록 최종 검수', project: '2024 봄 특별전', priority: 'high' },
        { id: 2, title: '교육 프로그램 자료 준비', project: '상설전', priority: 'medium' }
      ],
      completion_rate: 54, // percentage
      updated_at: new Date().toISOString()
    };

    return c.json({ success: true, data: summary });

  } catch (error) {
    console.error('Error fetching task summary:', error);
    return c.json({ error: 'Failed to fetch task summary' }, 500);
  }
});

/**
 * GET /api/widgets/data/quick-stats
 * Get quick statistics for dashboard overview
 */
app.get('/api/widgets/data/quick-stats', async (c) => {
  try {
    const stats = {
      active_projects: 5,
      pending_tasks: 13,
      team_members: 8,
      upcoming_events: 4,
      total_visitors_today: Math.round(1200 + Math.random() * 300),
      revenue_today: Math.round(2500000 + Math.random() * 500000), // KRW
      updated_at: new Date().toISOString()
    };

    return c.json({ success: true, data: stats });

  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return c.json({ error: 'Failed to fetch quick statistics' }, 500);
  }
});

export default app;
