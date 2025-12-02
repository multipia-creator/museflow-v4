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

export default app;
