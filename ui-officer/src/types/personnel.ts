export type SensorState = "normal" | "warning" | "danger" | "offline";

export type SensorReading = {
  label: string;
  value: number;
  unit: string;
  state: SensorState;
  lastUpdated: string;
};

export type GasReading = SensorReading & { value: number };

export type LocationPoint = {
  lat: number;
  lng: number;
  city?: string;
};

export type PersonnelRecord = {
  id: string;
  name: string;
  rank: string;
  unit: string;
  status: SensorState;
  lastReadingAt: string;
  phone?: string;
  location: LocationPoint;
  sensors: {
    temperature: SensorReading;
    heartRate: SensorReading;
    gasLeak: SensorReading;
  };
};

export type AlertEvent = {
  id: string;
  personId: string;
  personName: string;
  type: "temperature" | "heart-rate" | "gas" | "signal";
  severity: "warning" | "danger";
  timestamp: string;
  description: string;
};

