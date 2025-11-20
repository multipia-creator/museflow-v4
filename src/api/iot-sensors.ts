/**
 * IoT Sensors API Routes
 * Endpoints for real-time museum sensor monitoring
 */

import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// In-memory sensor data store (in production, use Durable Objects or external service)
const sensorDataStore = new Map<string, any>();
const alertStore: any[] = [];

/**
 * Register new sensor
 * POST /api/iot-sensors/register
 */
app.post('/register', async (c) => {
  try {
    const sensor = await c.req.json();

    if (!sensor.sensorId || !sensor.sensorType) {
      return c.json({
        success: false,
        error: 'sensorId and sensorType are required',
      }, 400);
    }

    // Store sensor registration
    sensorDataStore.set(sensor.sensorId, {
      ...sensor,
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: 'normal',
    });

    return c.json({
      success: true,
      message: 'Sensor registered successfully',
      data: sensor,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Update sensor data
 * POST /api/iot-sensors/update/:sensorId
 */
app.post('/update/:sensorId', async (c) => {
  try {
    const sensorId = c.req.param('sensorId');
    const { value } = await c.req.json();

    const sensor = sensorDataStore.get(sensorId);
    if (!sensor) {
      return c.json({
        success: false,
        error: 'Sensor not found',
      }, 404);
    }

    // Update sensor data
    sensor.value = value;
    sensor.lastSeen = new Date().toISOString();
    sensor.timestamp = new Date().toISOString();

    // Check thresholds and create alerts if needed
    const alert = checkThresholds(sensor);
    if (alert) {
      alertStore.push(alert);
    }

    sensorDataStore.set(sensorId, sensor);

    // Store in database
    await c.env.DB.prepare(`
      INSERT INTO workflow_events (
        id, workflow_id, event_type, event_data, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(
      `event-${Date.now()}`,
      'iot-system',
      'sensor_update',
      JSON.stringify(sensor)
    ).run();

    return c.json({
      success: true,
      data: sensor,
      alert: alert || null,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get sensor data
 * GET /api/iot-sensors/:sensorId
 */
app.get('/:sensorId', async (c) => {
  try {
    const sensorId = c.req.param('sensorId');
    const sensor = sensorDataStore.get(sensorId);

    if (!sensor) {
      return c.json({
        success: false,
        error: 'Sensor not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: sensor,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get all sensors
 * GET /api/iot-sensors/list
 */
app.get('/list', async (c) => {
  try {
    const sensors = Array.from(sensorDataStore.values());

    return c.json({
      success: true,
      data: sensors,
      count: sensors.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get sensors by zone
 * GET /api/iot-sensors/zone/:zone
 */
app.get('/zone/:zone', async (c) => {
  try {
    const zone = c.req.param('zone');
    const sensors = Array.from(sensorDataStore.values()).filter(
      (sensor: any) => sensor.location?.zone === zone
    );

    return c.json({
      success: true,
      data: sensors,
      count: sensors.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get zone metrics
 * GET /api/iot-sensors/metrics/:zone
 */
app.get('/metrics/:zone', async (c) => {
  try {
    const zone = c.req.param('zone');
    const sensors = Array.from(sensorDataStore.values()).filter(
      (sensor: any) => sensor.location?.zone === zone
    );

    // Calculate metrics
    const metrics = {
      zone,
      currentVisitors: calculateAverage(sensors, 'visitor-count'),
      temperature: calculateAverage(sensors, 'temperature'),
      humidity: calculateAverage(sensors, 'humidity'),
      lightLevel: calculateAverage(sensors, 'light-level'),
      airQuality: calculateAverage(sensors, 'air-quality'),
      lastUpdated: new Date().toISOString(),
      sensorCount: sensors.length,
    };

    return c.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get all alerts
 * GET /api/iot-sensors/alerts
 */
app.get('/alerts', async (c) => {
  try {
    const unacknowledgedOnly = c.req.query('unacknowledged') === 'true';
    
    let alerts = alertStore;
    if (unacknowledgedOnly) {
      alerts = alertStore.filter((alert: any) => !alert.acknowledged);
    }

    return c.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Acknowledge alert
 * POST /api/iot-sensors/alerts/:alertId/acknowledge
 */
app.post('/alerts/:alertId/acknowledge', async (c) => {
  try {
    const alertId = c.req.param('alertId');
    const alert = alertStore.find((a: any) => a.id === alertId);

    if (!alert) {
      return c.json({
        success: false,
        error: 'Alert not found',
      }, 404);
    }

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();

    return c.json({
      success: true,
      message: 'Alert acknowledged',
      data: alert,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Simulate sensor data (for testing)
 * POST /api/iot-sensors/simulate/:zone
 */
app.post('/simulate/:zone', async (c) => {
  try {
    const zone = c.req.param('zone');

    const sensorTypes = ['visitor-count', 'temperature', 'humidity', 'light-level', 'air-quality'];
    const createdSensors = [];

    for (const type of sensorTypes) {
      const sensorId = `${zone}-${type}`;
      let value: number;
      let unit: string;

      switch (type) {
        case 'visitor-count':
          value = Math.floor(Math.random() * 50);
          unit = 'people';
          break;
        case 'temperature':
          value = 20 + Math.random() * 4;
          unit = '°C';
          break;
        case 'humidity':
          value = 45 + Math.random() * 10;
          unit = '%';
          break;
        case 'light-level':
          value = 80 + Math.random() * 40;
          unit = 'lux';
          break;
        case 'air-quality':
          value = 30 + Math.random() * 40;
          unit = 'AQI';
          break;
        default:
          value = 0;
          unit = '';
      }

      const sensor = {
        sensorId,
        sensorType: type,
        location: { zone, position: { x: 0, y: 2, z: 0 } },
        value: Number(value.toFixed(1)),
        unit,
        timestamp: new Date().toISOString(),
        status: 'normal',
      };

      sensorDataStore.set(sensorId, sensor);
      createdSensors.push(sensor);
    }

    return c.json({
      success: true,
      message: `Simulated ${createdSensors.length} sensors for zone ${zone}`,
      data: createdSensors,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get sensor statistics
 * GET /api/iot-sensors/stats
 */
app.get('/stats', async (c) => {
  try {
    const sensors = Array.from(sensorDataStore.values());
    
    const stats = {
      totalSensors: sensors.length,
      byType: {
        'visitor-count': sensors.filter((s: any) => s.sensorType === 'visitor-count').length,
        'temperature': sensors.filter((s: any) => s.sensorType === 'temperature').length,
        'humidity': sensors.filter((s: any) => s.sensorType === 'humidity').length,
        'light-level': sensors.filter((s: any) => s.sensorType === 'light-level').length,
        'air-quality': sensors.filter((s: any) => s.sensorType === 'air-quality').length,
      },
      byStatus: {
        normal: sensors.filter((s: any) => s.status === 'normal').length,
        warning: sensors.filter((s: any) => s.status === 'warning').length,
        critical: sensors.filter((s: any) => s.status === 'critical').length,
      },
      alerts: {
        total: alertStore.length,
        unacknowledged: alertStore.filter((a: any) => !a.acknowledged).length,
      },
    };

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Test IoT sensors API
 * GET /api/iot-sensors/test
 */
app.get('/test', async (c) => {
  try {
    return c.json({
      success: true,
      message: 'IoT Sensors API is operational',
      supportedTypes: [
        'visitor-count',
        'temperature',
        'humidity',
        'light-level',
        'air-quality',
        'motion',
        'door-status',
        'emergency-button',
        'artwork-proximity',
      ],
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Helper functions

function calculateAverage(sensors: any[], type: string): number {
  const filtered = sensors.filter((s: any) => s.sensorType === type);
  if (filtered.length === 0) return 0;
  
  const sum = filtered.reduce((acc: number, s: any) => acc + Number(s.value || 0), 0);
  return Number((sum / filtered.length).toFixed(1));
}

function checkThresholds(sensor: any): any | null {
  const thresholds: any = {
    'temperature': { min: 18, max: 24 },
    'humidity': { min: 40, max: 60 },
    'light-level': { min: 50, max: 150 },
    'air-quality': { min: 0, max: 100 },
  };

  const threshold = thresholds[sensor.sensorType];
  if (!threshold || typeof sensor.value !== 'number') {
    return null;
  }

  const value = sensor.value;
  let severity: string | null = null;

  if (value < threshold.min * 0.8 || value > threshold.max * 1.2) {
    severity = 'critical';
  } else if (value < threshold.min || value > threshold.max) {
    severity = 'warning';
  }

  if (severity) {
    return {
      id: `alert-${Date.now()}-${sensor.sensorId}`,
      sensorId: sensor.sensorId,
      alertType: severity === 'critical' ? 'emergency' : 'threshold',
      severity,
      message: `${sensor.sensorType} ${severity}: ${value}${sensor.unit || ''}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
  }

  return null;
}

export default app;
