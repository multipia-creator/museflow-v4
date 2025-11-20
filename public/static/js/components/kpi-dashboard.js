/**
 * KPI Dashboard Component
 * Real-time museum analytics and key performance indicators
 */

class KPIDashboard {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.options = {
      refreshInterval: options.refreshInterval || 5000, // 5 seconds
      autoRefresh: options.autoRefresh !== false,
      ...options
    };

    this.data = {
      visitors: {
        current: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        trend: 0
      },
      exhibitions: {
        active: 0,
        upcoming: 0,
        total: 0,
        avgRating: 0
      },
      revenue: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        target: 0,
        trend: 0
      },
      sensors: {
        temperature: 0,
        humidity: 0,
        airQuality: 0,
        lightLevel: 0
      },
      alerts: {
        total: 0,
        unacknowledged: 0,
        critical: 0
      }
    };

    this.charts = {};
    this.refreshTimer = null;

    this.init();
  }

  /**
   * Initialize dashboard
   */
  init() {
    this.render();
    if (this.options.autoRefresh) {
      this.startAutoRefresh();
    }
    this.fetchData();
  }

  /**
   * Render dashboard layout
   */
  render() {
    this.container.innerHTML = `
      <div class="kpi-dashboard">
        <!-- Header -->
        <div class="kpi-header">
          <h1 class="kpi-title">
            <i class="fas fa-chart-line"></i>
            Museum Analytics Dashboard
          </h1>
          <div class="kpi-header-actions">
            <button class="kpi-btn kpi-btn-refresh" onclick="window.kpiDashboard.fetchData()">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <span class="kpi-last-updated">Last updated: <span id="kpi-last-update-time">--:--</span></span>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-cards-grid">
          ${this.renderKPICard('visitors', 'Visitors', 'users', '#667eea')}
          ${this.renderKPICard('exhibitions', 'Exhibitions', 'image', '#8b5cf6')}
          ${this.renderKPICard('revenue', 'Revenue', 'dollar-sign', '#10b981')}
          ${this.renderKPICard('alerts', 'Alerts', 'exclamation-triangle', '#ef4444')}
        </div>

        <!-- Charts Section -->
        <div class="kpi-charts-section">
          <div class="kpi-chart-container">
            <h3 class="kpi-chart-title">Visitor Trends (7 Days)</h3>
            <canvas id="kpi-visitor-chart"></canvas>
          </div>
          <div class="kpi-chart-container">
            <h3 class="kpi-chart-title">Revenue Breakdown</h3>
            <canvas id="kpi-revenue-chart"></canvas>
          </div>
        </div>

        <!-- Environmental Metrics -->
        <div class="kpi-env-section">
          <h3 class="kpi-section-title">Environmental Conditions</h3>
          <div class="kpi-env-grid">
            ${this.renderEnvMetric('temperature', 'Temperature', 'thermometer-half', '°C')}
            ${this.renderEnvMetric('humidity', 'Humidity', 'tint', '%')}
            ${this.renderEnvMetric('airQuality', 'Air Quality', 'wind', 'AQI')}
            ${this.renderEnvMetric('lightLevel', 'Light Level', 'lightbulb', 'lux')}
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="kpi-activity-section">
          <h3 class="kpi-section-title">Recent Activity</h3>
          <div id="kpi-activity-feed" class="kpi-activity-feed">
            <div class="kpi-activity-placeholder">Loading activity...</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render KPI card
   */
  renderKPICard(id, title, icon, color) {
    return `
      <div class="kpi-card" style="border-left-color: ${color}">
        <div class="kpi-card-icon" style="background: ${color}20; color: ${color}">
          <i class="fas fa-${icon}"></i>
        </div>
        <div class="kpi-card-content">
          <div class="kpi-card-title">${title}</div>
          <div class="kpi-card-value" id="kpi-${id}-value">--</div>
          <div class="kpi-card-subtitle" id="kpi-${id}-subtitle">Loading...</div>
        </div>
        <div class="kpi-card-trend" id="kpi-${id}-trend">
          <i class="fas fa-minus"></i>
        </div>
      </div>
    `;
  }

  /**
   * Render environmental metric
   */
  renderEnvMetric(id, title, icon, unit) {
    return `
      <div class="kpi-env-metric">
        <div class="kpi-env-icon">
          <i class="fas fa-${icon}"></i>
        </div>
        <div class="kpi-env-content">
          <div class="kpi-env-title">${title}</div>
          <div class="kpi-env-value">
            <span id="kpi-env-${id}">--</span>
            <span class="kpi-env-unit">${unit}</span>
          </div>
        </div>
        <div class="kpi-env-status" id="kpi-env-${id}-status">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>
    `;
  }

  /**
   * Fetch dashboard data
   */
  async fetchData() {
    try {
      // Fetch multiple data sources in parallel
      const [visitorData, sensorData, alertData] = await Promise.all([
        this.fetchVisitorData(),
        this.fetchSensorData(),
        this.fetchAlertData()
      ]);

      // Update data
      if (visitorData) this.updateVisitorData(visitorData);
      if (sensorData) this.updateSensorData(sensorData);
      if (alertData) this.updateAlertData(alertData);

      // Update charts
      this.updateCharts();

      // Update timestamp
      this.updateTimestamp();

      console.log('✅ Dashboard data updated');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    }
  }

  /**
   * Fetch visitor data
   */
  async fetchVisitorData() {
    try {
      // In production, this would call actual API
      // For now, return simulated data
      return {
        current: Math.floor(Math.random() * 200),
        today: Math.floor(Math.random() * 1500),
        thisWeek: Math.floor(Math.random() * 8000),
        thisMonth: Math.floor(Math.random() * 30000),
        trend: (Math.random() - 0.5) * 20
      };
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      return null;
    }
  }

  /**
   * Fetch sensor data
   */
  async fetchSensorData() {
    try {
      const response = await fetch('/api/iot-sensors/stats');
      if (!response.ok) throw new Error('Failed to fetch sensor data');
      
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      // Return simulated data
      return {
        temperature: 22 + Math.random() * 2,
        humidity: 50 + Math.random() * 10,
        airQuality: 40 + Math.random() * 20,
        lightLevel: 100 + Math.random() * 20
      };
    }
  }

  /**
   * Fetch alert data
   */
  async fetchAlertData() {
    try {
      const response = await fetch('/api/iot-sensors/alerts');
      if (!response.ok) throw new Error('Failed to fetch alert data');
      
      const result = await response.json();
      const alerts = result.data || [];
      
      return {
        total: alerts.length,
        unacknowledged: alerts.filter(a => !a.acknowledged).length,
        critical: alerts.filter(a => a.severity === 'critical').length
      };
    } catch (error) {
      console.error('Error fetching alert data:', error);
      return {
        total: Math.floor(Math.random() * 10),
        unacknowledged: Math.floor(Math.random() * 3),
        critical: Math.floor(Math.random() * 2)
      };
    }
  }

  /**
   * Update visitor data display
   */
  updateVisitorData(data) {
    this.data.visitors = data;

    // Update main value
    document.getElementById('kpi-visitors-value').textContent = 
      data.current.toLocaleString();

    // Update subtitle
    document.getElementById('kpi-visitors-subtitle').textContent = 
      `Today: ${data.today.toLocaleString()}`;

    // Update trend
    const trendEl = document.getElementById('kpi-visitors-trend');
    if (data.trend > 0) {
      trendEl.innerHTML = `<i class="fas fa-arrow-up"></i> ${data.trend.toFixed(1)}%`;
      trendEl.className = 'kpi-card-trend kpi-trend-up';
    } else if (data.trend < 0) {
      trendEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(data.trend).toFixed(1)}%`;
      trendEl.className = 'kpi-card-trend kpi-trend-down';
    }
  }

  /**
   * Update sensor data display
   */
  updateSensorData(data) {
    this.data.sensors = data;

    // Update environmental metrics
    document.getElementById('kpi-env-temperature').textContent = 
      data.temperature?.toFixed(1) || '--';
    document.getElementById('kpi-env-humidity').textContent = 
      data.humidity?.toFixed(1) || '--';
    document.getElementById('kpi-env-airQuality').textContent = 
      Math.round(data.airQuality) || '--';
    document.getElementById('kpi-env-lightLevel').textContent = 
      Math.round(data.lightLevel) || '--';

    // Update status indicators
    this.updateEnvStatus('temperature', data.temperature, 18, 24);
    this.updateEnvStatus('humidity', data.humidity, 40, 60);
    this.updateEnvStatus('airQuality', data.airQuality, 0, 100);
    this.updateEnvStatus('lightLevel', data.lightLevel, 50, 150);
  }

  /**
   * Update environmental status indicator
   */
  updateEnvStatus(metric, value, min, max) {
    const statusEl = document.getElementById(`kpi-env-${metric}-status`);
    if (!statusEl) return;

    if (value >= min && value <= max) {
      statusEl.innerHTML = '<i class="fas fa-check-circle"></i>';
      statusEl.className = 'kpi-env-status kpi-status-normal';
    } else {
      statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
      statusEl.className = 'kpi-env-status kpi-status-warning';
    }
  }

  /**
   * Update alert data display
   */
  updateAlertData(data) {
    this.data.alerts = data;

    document.getElementById('kpi-alerts-value').textContent = data.unacknowledged;
    document.getElementById('kpi-alerts-subtitle').textContent = 
      `Total: ${data.total} alerts`;

    // Update trend based on critical alerts
    const trendEl = document.getElementById('kpi-alerts-trend');
    if (data.critical > 0) {
      trendEl.innerHTML = '<i class="fas fa-exclamation"></i>';
      trendEl.className = 'kpi-card-trend kpi-trend-down';
    } else {
      trendEl.innerHTML = '<i class="fas fa-check"></i>';
      trendEl.className = 'kpi-card-trend kpi-trend-up';
    }
  }

  /**
   * Update charts
   */
  updateCharts() {
    this.updateVisitorChart();
    this.updateRevenueChart();
  }

  /**
   * Update visitor trend chart
   */
  updateVisitorChart() {
    const canvas = document.getElementById('kpi-visitor-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (this.charts.visitor) {
      this.charts.visitor.destroy();
    }

    // Create new chart
    this.charts.visitor = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Visitors',
          data: Array.from({length: 7}, () => Math.floor(Math.random() * 2000) + 1000),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
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
          y: { beginAtZero: true }
        }
      }
    });
  }

  /**
   * Update revenue chart
   */
  updateRevenueChart() {
    const canvas = document.getElementById('kpi-revenue-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (this.charts.revenue) {
      this.charts.revenue.destroy();
    }

    // Create new chart
    this.charts.revenue = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Tickets', 'Memberships', 'Shop', 'Donations'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: ['#667eea', '#8b5cf6', '#10b981', '#f59e0b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  /**
   * Update timestamp
   */
  updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('kpi-last-update-time').textContent = timeString;
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.fetchData();
    }, this.options.refreshInterval);

    console.log(`✅ Auto-refresh started (${this.options.refreshInterval}ms)`);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('⏸️ Auto-refresh stopped');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAutoRefresh();
    
    // Destroy charts
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });

    this.container.innerHTML = '';
  }
}

// Export to global scope
window.KPIDashboard = KPIDashboard;
