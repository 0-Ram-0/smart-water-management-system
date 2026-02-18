// User Roles
export const ROLES = {
  ADMIN: 'admin',
  ENGINEER: 'engineer',
  CITIZEN: 'citizen'
};

// Alert Types
export const ALERT_TYPES = {
  LEAK: 'leak',
  LOW_PRESSURE: 'low_pressure',
  HIGH_PRESSURE: 'high_pressure',
  SENSOR_FAILURE: 'sensor_failure',
  QUALITY_ISSUE: 'quality_issue',
  OTHER: 'other'
};

// Alert Severity
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Complaint Status
export const COMPLAINT_STATUS = {
  SUBMITTED: 'submitted',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Sensor Types
export const SENSOR_TYPES = {
  PRESSURE: 'pressure',
  FLOW: 'flow',
  LEVEL: 'level',
  QUALITY: 'quality'
};

// Solapur Coordinates (approximate center)
export const SOLAPUR_COORDINATES = {
  latitude: 17.6599,
  longitude: 75.9064
};
