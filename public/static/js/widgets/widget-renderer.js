/**
 * Widget Renderer
 * Renders widget data with Chart.js integration
 */

const WidgetRenderer = {
  // Chart instances cache
  charts: new Map(),

  /**
   * Render Weather Widget
   */
  async renderWeatherWidget(container) {
    const data = await window.WidgetDataLoader.loadWeatherData();
    
    const weatherHTML = `
      <div class="widget-weather">
        <div class="weather-main">
          <div class="weather-icon">
            <i class="fas fa-${this.getWeatherIcon(data.condition)}"></i>
          </div>
          <div class="weather-temp">
            <span class="temp-value">${data.temperature}</span>
            <span class="temp-unit">°C</span>
          </div>
        </div>
        <div class="weather-details">
          <div class="weather-condition">${data.condition}</div>
          <div class="weather-location"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>
          <div class="weather-info-grid">
            <div class="info-item">
              <i class="fas fa-tint"></i>
              <span>${data.humidity}%</span>
            </div>
            <div class="info-item">
              <i class="fas fa-wind"></i>
              <span>${data.wind_speed} km/h</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = weatherHTML;
  },

  /**
   * Render Visitor Stats Widget with Chart
   */
  async renderVisitorStatsWidget(container) {
    const data = await window.WidgetDataLoader.loadVisitorStats('today');
    
    const statsHTML = `
      <div class="widget-visitor-stats">
        <div class="stats-summary">
          <div class="stat-card">
            <div class="stat-label">오늘 방문자</div>
            <div class="stat-value">${data.total_visitors.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">현재 관람객</div>
            <div class="stat-value">${data.current_visitors}</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="visitor-hourly-chart"></canvas>
        </div>
        <div class="popular-exhibits">
          <h4>인기 전시</h4>
          ${data.popular_exhibits.map(exhibit => `
            <div class="exhibit-item">
              <span class="exhibit-name">${exhibit.name}</span>
              <span class="exhibit-visitors">${exhibit.visitors}명</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = statsHTML;
    
    // Render chart
    if (data.hourly_data && data.hourly_data.length > 0) {
      await this.renderVisitorChart('visitor-hourly-chart', data.hourly_data);
    }
  },

  /**
   * Render Collection Stats Widget with Chart
   */
  async renderCollectionStatsWidget(container) {
    const data = await window.WidgetDataLoader.loadCollectionStats();
    
    const statsHTML = `
      <div class="widget-collection-stats">
        <div class="stats-overview">
          <div class="overview-card">
            <div class="overview-label">전체 소장품</div>
            <div class="overview-value">${data.total_items.toLocaleString()}</div>
          </div>
          <div class="overview-card">
            <div class="overview-label">디지털화</div>
            <div class="overview-value">${data.digitized.toLocaleString()}</div>
          </div>
          <div class="overview-card">
            <div class="overview-label">전시 중</div>
            <div class="overview-value">${data.on_display.toLocaleString()}</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="collection-category-chart"></canvas>
        </div>
        <div class="recent-acquisitions">
          <h4>최근 수집품</h4>
          ${data.recent_acquisitions.slice(0, 3).map(item => `
            <div class="acquisition-item">
              <span class="acquisition-title">${item.title}</span>
              <span class="acquisition-date">${new Date(item.date).toLocaleDateString('ko-KR')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = statsHTML;
    
    // Render chart
    if (data.categories && data.categories.length > 0) {
      await this.renderCategoryChart('collection-category-chart', data.categories);
    }
  },

  /**
   * Render Event Calendar Widget
   */
  async renderEventCalendarWidget(container) {
    const events = await window.WidgetDataLoader.loadEventCalendar(5);
    
    const eventsHTML = `
      <div class="widget-event-calendar">
        <h3>다가오는 행사</h3>
        <div class="events-list">
          ${events.map(event => `
            <div class="event-card">
              <div class="event-type-badge ${event.type}">
                <i class="fas fa-${this.getEventIcon(event.type)}"></i>
              </div>
              <div class="event-info">
                <div class="event-title">${event.title}</div>
                <div class="event-meta">
                  <span><i class="fas fa-clock"></i> ${this.formatEventTime(event.start_time)}</span>
                  <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                </div>
                <div class="event-capacity">
                  <div class="capacity-bar">
                    <div class="capacity-fill" style="width: ${(event.registered / event.capacity) * 100}%"></div>
                  </div>
                  <span class="capacity-text">${event.registered}/${event.capacity}명</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = eventsHTML;
  },

  /**
   * Render Task Summary Widget
   */
  async renderTaskSummaryWidget(container) {
    const data = await window.WidgetDataLoader.loadTaskSummary();
    
    const tasksHTML = `
      <div class="widget-task-summary">
        <div class="task-stats">
          <div class="completion-rate">
            <div class="rate-circle">
              <svg width="100" height="100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" stroke-width="8"
                  stroke-dasharray="${2 * Math.PI * 40}"
                  stroke-dashoffset="${2 * Math.PI * 40 * (1 - data.completion_rate / 100)}"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="rate-text">${data.completion_rate}%</div>
            </div>
          </div>
          <div class="task-counts">
            <div class="count-item completed">
              <span class="count-value">${data.completed}</span>
              <span class="count-label">완료</span>
            </div>
            <div class="count-item in-progress">
              <span class="count-value">${data.in_progress}</span>
              <span class="count-label">진행중</span>
            </div>
            <div class="count-item pending">
              <span class="count-value">${data.pending}</span>
              <span class="count-label">대기</span>
            </div>
            ${data.overdue > 0 ? `
            <div class="count-item overdue">
              <span class="count-value">${data.overdue}</span>
              <span class="count-label">지연</span>
            </div>
            ` : ''}
          </div>
        </div>
        ${data.due_today.length > 0 ? `
        <div class="due-today">
          <h4>오늘 마감</h4>
          ${data.due_today.map(task => `
            <div class="due-task">
              <span class="task-title">${task.title}</span>
              <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    `;
    
    container.innerHTML = tasksHTML;
  },

  /**
   * Render Quick Stats Widget
   */
  async renderQuickStatsWidget(container) {
    const data = await window.WidgetDataLoader.loadQuickStats();
    
    const statsHTML = `
      <div class="widget-quick-stats">
        <div class="quick-stat-grid">
          <div class="quick-stat-item">
            <i class="fas fa-project-diagram"></i>
            <div class="stat-info">
              <div class="stat-value">${data.active_projects}</div>
              <div class="stat-label">활성 프로젝트</div>
            </div>
          </div>
          <div class="quick-stat-item">
            <i class="fas fa-tasks"></i>
            <div class="stat-info">
              <div class="stat-value">${data.pending_tasks}</div>
              <div class="stat-label">대기 중 작업</div>
            </div>
          </div>
          <div class="quick-stat-item">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <div class="stat-value">${data.team_members}</div>
              <div class="stat-label">팀원</div>
            </div>
          </div>
          <div class="quick-stat-item">
            <i class="fas fa-calendar-alt"></i>
            <div class="stat-info">
              <div class="stat-value">${data.upcoming_events}</div>
              <div class="stat-label">예정 행사</div>
            </div>
          </div>
        </div>
        <div class="daily-summary">
          <div class="summary-item">
            <span class="summary-label">오늘 방문자</span>
            <span class="summary-value">${data.total_visitors_today.toLocaleString()}명</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">오늘 매출</span>
            <span class="summary-value">₩${(data.revenue_today / 10000).toFixed(1)}만원</span>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = statsHTML;
  },

  /**
   * Render Visitor Chart (Line Chart)
   */
  async renderVisitorChart(canvasId, hourlyData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Destroy existing chart
    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hourlyData.map(d => d.hour),
        datasets: [{
          label: '시간대별 방문자',
          data: hourlyData.map(d => d.visitors),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    this.charts.set(canvasId, chart);
  },

  /**
   * Render Category Chart (Doughnut Chart)
   */
  async renderCategoryChart(canvasId, categories) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Destroy existing chart
    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.map(c => c.name),
        datasets: [{
          data: categories.map(c => c.count),
          backgroundColor: [
            '#8b5cf6',
            '#ec4899',
            '#f59e0b',
            '#10b981',
            '#3b82f6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 15 }
          }
        }
      }
    });

    this.charts.set(canvasId, chart);
  },

  /**
   * Helper: Get weather icon
   */
  getWeatherIcon(condition) {
    const icons = {
      'Sunny': 'sun',
      'Clear': 'sun',
      'Cloudy': 'cloud',
      'Rainy': 'cloud-rain',
      'Snowy': 'snowflake'
    };
    return icons[condition] || 'cloud';
  },

  /**
   * Helper: Get event icon
   */
  getEventIcon(type) {
    const icons = {
      'tour': 'walking',
      'workshop': 'paint-brush',
      'lecture': 'chalkboard-teacher',
      'exhibition': 'image'
    };
    return icons[type] || 'calendar';
  },

  /**
   * Helper: Format event time
   */
  formatEventTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}분 후`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 후`;
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};

// Export globally
window.WidgetRenderer = WidgetRenderer;
