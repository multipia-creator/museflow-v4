-- Insert test behavior data for demo user (user_id = 1)
-- Recent activity in the last 7 days

INSERT INTO user_behaviors (user_id, event_type, resource_type, resource_id, page_path, duration, metadata, created_at) VALUES
-- Monday activity
(1, 'view', 'page', NULL, '/dashboard.html', 120, '{"title": "Dashboard"}', datetime('now', '-6 days', 'start of day', '+9 hours')),
(1, 'click', 'project', 1, '/dashboard.html', 0, '{"action": "open_project"}', datetime('now', '-6 days', 'start of day', '+9 hours', '+5 minutes')),
(1, 'edit', 'project', 1, '/admin.html', 300, '{"field": "name"}', datetime('now', '-6 days', 'start of day', '+9 hours', '+15 minutes')),

-- Tuesday activity
(1, 'view', 'page', NULL, '/projects.html', 45, '{"title": "Projects"}', datetime('now', '-5 days', 'start of day', '+10 hours')),
(1, 'create', 'project', 4, '/projects.html', 180, '{"name": "New Workflow"}', datetime('now', '-5 days', 'start of day', '+10 hours', '+10 minutes')),
(1, 'click', 'project', 2, '/projects.html', 0, '{"action": "view_details"}', datetime('now', '-5 days', 'start of day', '+11 hours')),

-- Wednesday activity
(1, 'view', 'page', NULL, '/dashboard.html', 90, '{"title": "Dashboard"}', datetime('now', '-4 days', 'start of day', '+14 hours')),
(1, 'search', 'project', NULL, '/projects.html', 30, '{"query": "automation"}', datetime('now', '-4 days', 'start of day', '+14 hours', '+5 minutes')),
(1, 'edit', 'project', 2, '/admin.html', 420, '{"field": "description"}', datetime('now', '-4 days', 'start of day', '+15 hours')),

-- Thursday activity
(1, 'view', 'page', NULL, '/account.html', 60, '{"title": "Account Settings"}', datetime('now', '-3 days', 'start of day', '+16 hours')),
(1, 'edit', 'project', 1, '/admin.html', 240, '{"field": "workflow"}', datetime('now', '-3 days', 'start of day', '+17 hours')),
(1, 'delete', 'project', 4, '/projects.html', 5, '{"confirm": true}', datetime('now', '-3 days', 'start of day', '+18 hours')),

-- Friday activity
(1, 'view', 'page', NULL, '/dashboard.html', 150, '{"title": "Dashboard"}', datetime('now', '-2 days', 'start of day', '+9 hours')),
(1, 'click', 'project', 3, '/dashboard.html', 0, '{"action": "quick_view"}', datetime('now', '-2 days', 'start of day', '+9 hours', '+20 minutes')),
(1, 'edit', 'project', 3, '/admin.html', 360, '{"field": "workflow_nodes"}', datetime('now', '-2 days', 'start of day', '+10 hours')),

-- Saturday activity (less activity)
(1, 'view', 'page', NULL, '/projects.html', 30, '{"title": "Projects"}', datetime('now', '-1 day', 'start of day', '+11 hours')),

-- Today activity
(1, 'view', 'page', NULL, '/dashboard.html', 45, '{"title": "Dashboard"}', datetime('now', '-2 hours')),
(1, 'view', 'page', NULL, '/projects.html', 60, '{"title": "Projects"}', datetime('now', '-1 hour')),
(1, 'click', 'project', 1, '/projects.html', 0, '{"action": "open_project"}', datetime('now', '-30 minutes'));

-- Initialize user preferences with empty values (dashboard will populate on first load)
INSERT OR REPLACE INTO user_preferences (user_id, dashboard_layout, favorite_projects, hidden_widgets, created_at, updated_at) VALUES
(1, NULL, '[]', '[]', datetime('now'), datetime('now'));
