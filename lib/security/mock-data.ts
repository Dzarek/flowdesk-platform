import type {
  SecurityAlarm,
  SecurityCamera,
  SecurityEvent,
  SecuritySensor,
} from "./types";

export const mockCameras: SecurityCamera[] = [
  {
    id: "camera-front",
    name: "Wejście główne",
    location: "Przed domem",
    status: "ONLINE",
    streamUrl: null,
    lastSeen: "2026-10-25T16:45:00",
  },
  {
    id: "camera-garden",
    name: "Ogród",
    location: "Za domem",
    status: "ONLINE",
    streamUrl: null,
    lastSeen: "2026-10-25T16:45:00",
  },
  {
    id: "camera-garage",
    name: "Garaż",
    location: "Garaż",
    status: "OFFLINE",
    streamUrl: null,
    lastSeen: "2026-10-25T15:20:00",
  },
];

export const mockSensors: SecuritySensor[] = [
  {
    id: "sensor-gas",
    name: "Czujnik gazu",
    type: "GAS",
    location: "Kotłownia",
    status: "ONLINE",
    triggered: false,
    batteryLevel: 92,
    lastSeen: "2026-10-25T16:45:00",
  },
  {
    id: "sensor-water",
    name: "Czujnik zalania",
    type: "WATER",
    location: "Łazienka",
    status: "OFFLINE",
    triggered: false,
    batteryLevel: 18,
    lastSeen: "2026-10-25T14:10:00",
  },
  {
    id: "sensor-smoke",
    name: "Czujnik dymu",
    type: "SMOKE",
    location: "Korytarz",
    status: "ONLINE",
    triggered: false,
    batteryLevel: 76,
    lastSeen: "2026-10-25T16:45:00",
  },
  {
    id: "sensor-co",
    name: "Czujnik tlenku węgla",
    type: "CO",
    location: "Sypialnia",
    status: "ONLINE",
    triggered: false,
    batteryLevel: 84,
    lastSeen: "2026-10-25T16:45:00",
  },
  {
    id: "sensor-motion",
    name: "Czujnik ruchu",
    type: "MOTION",
    location: "Korytarz",
    status: "ONLINE",
    triggered: false,
    batteryLevel: 67,
    lastSeen: "2026-10-25T16:45:00",
  },
  {
    id: "sensor-door",
    name: "Czujnik otwarcia",
    type: "DOOR",
    location: "Drzwi wejściowe",
    status: "ONLINE",
    triggered: false,
    batteryLevel: 95,
    lastSeen: "2026-10-25T16:45:00",
  },
];

export const mockAlarm: SecurityAlarm = {
  name: "Centrala alarmowa",
  status: "ARMED",
  lastUpdated: "2026-10-25T16:40:00",
};

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "event-1",
    title: "Czujnik zalania utracił połączenie",
    description: "Łazienka · Ostatni sygnał nie został odebrany",
    timestamp: "2026-10-25T14:10:00",
    severity: "WARNING",
    deviceName: "Czujnik zalania",
    acknowledged: false,
  },
  {
    id: "event-2",
    title: "Kamera przestała odpowiadać",
    description: "Garaż · Brak połączenia z urządzeniem",
    timestamp: "2026-10-25T15:20:00",
    severity: "WARNING",
    deviceName: "Kamera garażowa",
    acknowledged: false,
  },
  {
    id: "event-3",
    title: "System alarmowy uzbrojony",
    description: "Centrala alarmowa · Zdarzenie demonstracyjne",
    timestamp: "2026-10-25T16:40:00",
    severity: "INFO",
    deviceName: "Centrala alarmowa",
    acknowledged: true,
  },
];
