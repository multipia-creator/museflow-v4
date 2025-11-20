/**
 * IoT Sensor Service
 * Real-time museum sensor data processing and monitoring
 */

export interface SensorData {
  sensorId: string;
  sensorType: SensorType;
  location: {
    zone: string;
    position: { x: number; y: number; z: number };
  };
  value: number | boolean | string;
  unit?: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

export type SensorType =
  | 'visitor-count'
  | 'temperature'
  | 'humidity'
  | 'light-level'
  | 'air-quality'
  | 'motion'
  | 'door-status'
  | 'emergency-button'
  | 'artwork-proximity';

export interface SensorAlert {
  id: string;
  sensorId: string;
  alertType: 'threshold' | 'anomaly' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface SensorThreshold {
  sensorId: string;
  sensorType: SensorType;
  min?: number;
  max?: number;
  alertOnExceed: boolean;
}

export interface ZoneMetrics {
  zone: string;
  currentVisitors: number;
  temperature: number;
  humidity: number;
  lightLevel: number;
  airQuality: number;
  lastUpdated: string;
}

export class IoTSensorService {
  private sensors: Map<string, SensorData> = new Map();
  private thresholds: Map<string, SensorThreshold> = new Map();
  private alerts: SensorAlert[] = [];
  private listeners: Map<string, ((data: SensorData) => void)[]> = new Map();

  constructor() {
    this.initializeDefaultThresholds();
  }

  /**
   * Initialize default sensor thresholds
   */
  private initializeDefaultThresholds(): void {
    const defaults: SensorThreshold[] = [
      {
        sensorId: 'default-temperature',
        sensorType: 'temperature',
        min: 18,
        max: 24,
        alertOnExceed: true,
      },
      {
        sensorId: 'default-humidity',
        sensorType: 'humidity',
        min: 40,
        max: 60,
        alertOnExceed: true,
      },
      {
        sensorId: 'default-light',
        sensorType: 'light-level',
        min: 50,
        max: 150,
        alertOnExceed: true,
      },
      {
        sensorId: 'default-air-quality',
        sensorType: 'air-quality',
        min: 0,
        max: 100,
        alertOnExceed: true,
      },
    ];

    defaults.forEach(threshold => {
      this.thresholds.set(threshold.sensorType, threshold);
    });
  }

  /**
   * Register sensor
   */
  registerSensor(sensor: SensorData): void {
    this.sensors.set(sensor.sensorId, sensor);
    console.log(`✅ Sensor registered: ${sensor.sensorId} (${sensor.sensorType})`);
  }

  /**
   * Update sensor data
   */
  updateSensorData(sensorId: string, value: number | boolean | string): SensorData {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    // Update sensor
    sensor.value = value;
    sensor.timestamp = new Date().toISOString();
    sensor.status = this.checkSensorStatus(sensor);

    this.sensors.set(sensorId, sensor);

    // Check for threshold violations
    if (sensor.status !== 'normal') {
      this.createAlert(sensor);
    }

    // Notify listeners
    this.notifyListeners(sensorId, sensor);

    return sensor;
  }

  /**
   * Check sensor status against thresholds
   */
  private checkSensorStatus(sensor: SensorData): 'normal' | 'warning' | 'critical' {
    const threshold = this.thresholds.get(sensor.sensorType);
    if (!threshold || typeof sensor.value !== 'number') {
      return 'normal';
    }

    const value = sensor.value;

    // Critical thresholds (20% beyond limits)
    if (threshold.min !== undefined && value < threshold.min * 0.8) {
      return 'critical';
    }
    if (threshold.max !== undefined && value > threshold.max * 1.2) {
      return 'critical';
    }

    // Warning thresholds (within limits but approaching)
    if (threshold.min !== undefined && value < threshold.min) {
      return 'warning';
    }
    if (threshold.max !== undefined && value > threshold.max) {
      return 'warning';
    }

    return 'normal';
  }

  /**
   * Create alert for sensor violation
   */
  private createAlert(sensor: SensorData): void {
    const alert: SensorAlert = {
      id: `alert-${Date.now()}-${sensor.sensorId}`,
      sensorId: sensor.sensorId,
      alertType: sensor.status === 'critical' ? 'emergency' : 'threshold',
      severity: sensor.status === 'critical' ? 'critical' : sensor.status === 'warning' ? 'medium' : 'low',
      message: `${sensor.sensorType} ${sensor.status}: ${sensor.value}${sensor.unit || ''}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    this.alerts.push(alert);
    console.warn(`⚠️ Alert created:`, alert);
  }

  /**
   * Get sensor data
   */
  getSensorData(sensorId: string): SensorData | undefined {
    return this.sensors.get(sensorId);
  }

  /**
   * Get all sensors
   */
  getAllSensors(): SensorData[] {
    return Array.from(this.sensors.values());
  }

  /**
   * Get sensors by type
   */
  getSensorsByType(type: SensorType): SensorData[] {
    return Array.from(this.sensors.values()).filter(
      sensor => sensor.sensorType === type
    );
  }

  /**
   * Get sensors by zone
   */
  getSensorsByZone(zone: string): SensorData[] {
    return Array.from(this.sensors.values()).filter(
      sensor => sensor.location.zone === zone
    );
  }

  /**
   * Get zone metrics
   */
  getZoneMetrics(zone: string): ZoneMetrics {
    const sensors = this.getSensorsByZone(zone);

    const visitorSensors = sensors.filter(s => s.sensorType === 'visitor-count');
    const tempSensors = sensors.filter(s => s.sensorType === 'temperature');
    const humiditySensors = sensors.filter(s => s.sensorType === 'humidity');
    const lightSensors = sensors.filter(s => s.sensorType === 'light-level');
    const airSensors = sensors.filter(s => s.sensorType === 'air-quality');

    const avg = (sensors: SensorData[]) => {
      const values = sensors.map(s => Number(s.value)).filter(v => !isNaN(v));
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    };

    return {
      zone,
      currentVisitors: Math.round(avg(visitorSensors)),
      temperature: Number(avg(tempSensors).toFixed(1)),
      humidity: Number(avg(humiditySensors).toFixed(1)),
      lightLevel: Number(avg(lightSensors).toFixed(0)),
      airQuality: Number(avg(airSensors).toFixed(0)),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get all alerts
   */
  getAlerts(unacknowledgedOnly: boolean = false): SensorAlert[] {
    if (unacknowledgedOnly) {
      return this.alerts.filter(alert => !alert.acknowledged);
    }
    return this.alerts;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Set sensor threshold
   */
  setThreshold(threshold: SensorThreshold): void {
    this.thresholds.set(threshold.sensorType, threshold);
    console.log(`✅ Threshold set for ${threshold.sensorType}`);
  }

  /**
   * Add sensor data listener
   */
  addListener(sensorId: string, callback: (data: SensorData) => void): void {
    if (!this.listeners.has(sensorId)) {
      this.listeners.set(sensorId, []);
    }
    this.listeners.get(sensorId)!.push(callback);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(sensorId: string, data: SensorData): void {
    const callbacks = this.listeners.get(sensorId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Listener error:', error);
        }
      });
    }
  }

  /**
   * Simulate sensor data (for testing)
   */
  simulateSensorData(zone: string): void {
    const sensorTypes: SensorType[] = [
      'visitor-count',
      'temperature',
      'humidity',
      'light-level',
      'air-quality',
    ];

    sensorTypes.forEach((type, index) => {
      const sensorId = `${zone}-${type}`;
      
      // Generate realistic sensor data
      let value: number;
      let unit: string;

      switch (type) {
        case 'visitor-count':
          value = Math.floor(Math.random() * 50);
          unit = 'people';
          break;
        case 'temperature':
          value = 20 + Math.random() * 4; // 20-24°C
          unit = '°C';
          break;
        case 'humidity':
          value = 45 + Math.random() * 10; // 45-55%
          unit = '%';
          break;
        case 'light-level':
          value = 80 + Math.random() * 40; // 80-120 lux
          unit = 'lux';
          break;
        case 'air-quality':
          value = 30 + Math.random() * 40; // 30-70 AQI
          unit = 'AQI';
          break;
        default:
          value = 0;
          unit = '';
      }

      const sensor: SensorData = {
        sensorId,
        sensorType: type,
        location: {
          zone,
          position: { x: index * 2, y: 2, z: 0 },
        },
        value: Number(value.toFixed(1)),
        unit,
        timestamp: new Date().toISOString(),
        status: 'normal',
      };

      this.registerSensor(sensor);
    });

    console.log(`✅ Simulated sensors for zone: ${zone}`);
  }

  /**
   * Get sensor statistics
   */
  getStats(): any {
    return {
      totalSensors: this.sensors.size,
      byType: {
        'visitor-count': this.getSensorsByType('visitor-count').length,
        'temperature': this.getSensorsByType('temperature').length,
        'humidity': this.getSensorsByType('humidity').length,
        'light-level': this.getSensorsByType('light-level').length,
        'air-quality': this.getSensorsByType('air-quality').length,
      },
      activeAlerts: this.getAlerts(true).length,
      totalAlerts: this.alerts.length,
    };
  }
}

// Singleton instance
let iotSensorService: IoTSensorService | null = null;

/**
 * Initialize IoT Sensor Service
 */
export function initIoTSensor(): IoTSensorService {
  if (!iotSensorService) {
    iotSensorService = new IoTSensorService();
  }
  return iotSensorService;
}

/**
 * Get IoT Sensor Service instance
 */
export function getIoTSensor(): IoTSensorService {
  if (!iotSensorService) {
    throw new Error('IoT Sensor Service not initialized. Call initIoTSensor() first.');
  }
  return iotSensorService;
}
