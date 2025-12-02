/**
 * Widget Renderer
 * Renders dashboard widgets with real-time data
 */

const WidgetRenderer = {
  charts: new Map(), // Store Chart.js instances
  updateIntervals: new Map(), // Store update intervals

  /**
   * Initialize all widgets
   */
  async initAllWidgets() {
    console.log('🎨 Initializing dashboard widgets...');
    
    // Initialize individual widgets
    await this.initWeatherWidget();
    await this.initVisitorStatsWidget();
    await this.initCollectionStatsWidget();
    await this.initQuickStatsWidget();

    console.log('✅ All widgets initialized');
  },

  /**
   * Weather Widget
   */
  async initWeatherWidget() {
    const container = document.querySelector('[data-widget="weather"]');
    if (!container) return;

    try {
      const data = await WidgetDataLoader.loadWeatherData();
      this.renderWeatherWidget(container, data);

      // Auto-refresh every 5 minutes
      this.setAutoRefresh('weather', () => this.initWeatherWidget(), 300000);
    } catch (error) {
      console.error('Failed to init weather widget:', error);
    }
  },

  renderWeatherWidget(container, data) {
    const iconMap = {
      'Sunny': '☀️',
      'Cloudy': '☁️',
      'Rainy': '🌧️',
      'Clear': '🌤️',
      'sun': '☀️',
      'cloud': '☁️',
      'rain': '🌧️'
    };

    const icon = iconMap[data.icon] || iconMap[data.condition] || '🌤️';

    container.innerHTML = `
      <div class="widget-weather">
        <div class="weather-icon">${icon}</div>
        <div class="weather-info">
          <div class="weather-temp">${data.temperature}°C</div>
          <div class="weather-condition">${data.condition}</div>
          <div class="weather-location">${data.location}</div>
        </div>
        <div class="weather-details">
          <div class="detail-item">
            <i class="fas fa-tint"></i>
            <span>${data.humidity}%</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-wind"></i>
            <span>${data.wind_speed} km/h</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Visitor Statistics Widget with Chart
   */
  async initVisitorStatsWidget() {
    const container = document.querySelector('[data-widget="visitor-stats"]');
    if (!container) return;

    try {
      const data = await WidgetDataLoader.loadVisitorStats('today');
      this.renderVisitorStatsWidget(container, data);

      // Auto-refresh every 1 minute
      this.setAutoRefresh('visitor-stats', () => this.initVisitorStatsWidget(), 60000);
    } catch (error) {
      console.error('Failed to init visitor stats widget:', error);
    }
  },

  renderVisitorStatsWidget(container, data) {
    container.innerHTML = `
      <div class="widget-visitor-stats">
        <div class="stats-summary">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${data.total_visitors.toLocaleString()}</div>
              <div class="stat-label">Total Visitors</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #10b981;">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${data.current_visitors}</div>
              <div class="stat-label">현재 관람객</div>
            </div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="visitor-chart"></canvas>
        </div>
        <div class="popular-exhibits">
          <h4>인기 전시</h4>
          ${data.popular_exhibits.map(exhibit => `
            <div class="exhibit-item">
              <span class="exhibit-name">${exhibit.name}</span>
              <span class="exhibit-count">${exhibit.visitors}명</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Render chart
    if (data.hourly_data && data.hourly_data.length > 0) {
      this.renderVisitorChart(data.hourly_data);
    }
  },

  renderVisitorChart(hourlyData) {
    const canvas = document.getElementById('visitor-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (this.charts.has('visitor-chart')) {
      this.charts.get('visitor-chart').destroy();
    }

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hourlyData.map(d => d.hour),
        datasets: [{
          label: '시간별 방문객',
          data: hourlyData.map(d => d.visitors),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    });

    this.charts.set('visitor-chart', chart);
  },

  /**
   * Collection Statistics Widget
   */
  async initCollectionStatsWidget() {
    const container = document.querySelector('[data-widget="collection-stats"]');
    if (!container) return;

    try {
      const data = await WidgetDataLoader.loadCollectionStats();
      this.renderCollectionStatsWidget(container, data);

      // Auto-refresh every 10 minutes
      this.setAutoRefresh('collection-stats', () => this.initCollectionStatsWidget(), 600000);
    } catch (error) {
      console.error('Failed to init collection stats widget:', error);
    }
  },

  renderCollectionStatsWidget(container, data) {
    container.innerHTML = `
      <div class="widget-collection-stats">
        <div class="collection-summary">
          <div class="summary-item">
            <div class="summary-value">${data.total_items.toLocaleString()}</div>
            <div class="summary-label">전체 소장품</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${data.digitized.toLocaleString()}</div>
            <div class="summary-label">디지털화</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${data.on_display.toLocaleString()}</div>
            <div class="summary-label">전시 중</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="collection-chart"></canvas>
        </div>
        <div class="category-list">
          ${data.categories.map(cat => `
            <div class="category-item">
              <div class="category-bar" style="width: ${cat.percentage}%"></div>
              <div class="category-info">
                <span class="category-name">${cat.name}</span>
                <span class="category-count">${cat.count.toLocaleString()}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Render pie chart
    this.renderCollectionChart(data.categories);
  },

  renderCollectionChart(categories) {
    const canvas = document.getElementById('collection-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (this.charts.has('collection-chart')) {
      this.charts.get('collection-chart').destroy();
    }

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.map(c => c.name),
        datasets: [{
          data: categories.map(c => c.count),
          backgroundColor: [
            '#8b5cf6',
            '#06b6d4',
            '#10b981',
            '#f59e0b',
            '#ef4444'
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
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });

    this.charts.set('collection-chart', chart);
  },

  /**
   * Quick Stats Widget
   */
  async initQuickStatsWidget() {
    const container = document.querySelector('[data-widget="quick-stats"]');
    if (!container) return;

    try {
      const data = await WidgetDataLoader.loadQuickStats();
      this.renderQuickStatsWidget(container, data);

      // Auto-refresh every 30 seconds
      this.setAutoRefresh('quick-stats', () => this.initQuickStatsWidget(), 30000);
    } catch (error) {
      console.error('Failed to init quick stats widget:', error);
    }
  },

  renderQuickStatsWidget(container, data) {
    container.innerHTML = `
      <div class="widget-quick-stats">
        <div class="quick-stat-item">
          <i class="fas fa-project-diagram"></i>
          <div class="quick-stat-value">${data.active_projects}</div>
          <div class="quick-stat-label">활성 프로젝트</div>
        </div>
        <div class="quick-stat-item">
          <i class="fas fa-tasks"></i>
          <div class="quick-stat-value">${data.pending_tasks}</div>
          <div class="quick-stat-label">대기 중 작업</div>
        </div>
        <div class="quick-stat-item">
          <i class="fas fa-users"></i>
          <div class="quick-stat-value">${data.team_members}</div>
          <div class="quick-stat-label">팀 멤버</div>
        </div>
        <div class="quick-stat-item">
          <i class="fas fa-calendar-alt"></i>
          <div class="quick-stat-value">${data.upcoming_events}</div>
          <div class="quick-stat-label">예정 이벤트</div>
        </div>
      </div>
    `;
  },

  /**
   * Auto-refresh management
   */
  setAutoRefresh(key, callback, interval) {
    // Clear existing interval
    if (this.updateIntervals.has(key)) {
      clearInterval(this.updateIntervals.get(key));
    }

    // Set new interval
    const intervalId = setInterval(callback, interval);
    this.updateIntervals.set(key, intervalId);
  },

  /**
   * Cleanup
   */
  destroy() {
    // Destroy all charts
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();

    // Clear all intervals
    this.updateIntervals.forEach(intervalId => clearInterval(intervalId));
    this.updateIntervals.clear();
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for WidgetDataLoader to be available
    if (window.WidgetDataLoader) {
      WidgetRenderer.initAllWidgets();
    }
  });
} else {
  if (window.WidgetDataLoader) {
    WidgetRenderer.initAllWidgets();
  }
}

// Export globally
window.WidgetRenderer = WidgetRenderer;
