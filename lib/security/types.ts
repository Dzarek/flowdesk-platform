export type SecurityDeviceStatus = "ONLINE" | "OFFLINE" | "WARNING";

export type SecuritySensorType =
  | "GAS"
  | "WATER"
  | "SMOKE"
  | "CO"
  | "MOTION"
  | "DOOR";

export type SecurityCamera = {
  id: string;
  name: string;
  location: string;
  status: SecurityDeviceStatus;
  streamUrl: string | null;
  lastSeen: string;
};

export type SecuritySensor = {
  id: string;
  name: string;
  type: SecuritySensorType;
  location: string;
  status: SecurityDeviceStatus;
  triggered: boolean;
  batteryLevel: number | null;
  lastSeen: string;
};

export type SecurityEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  deviceName: string;
  acknowledged: boolean;
};

export type SecurityAlarm = {
  name: string;
  status: "ARMED" | "DISARMED" | "ALARM" | "OFFLINE";
  lastUpdated: string;
};
