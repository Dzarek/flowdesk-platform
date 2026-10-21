export type EnergyDeviceStatus = "ONLINE" | "OFFLINE" | "WARNING";

export type HeatingMode = "AUTO" | "MANUAL" | "OFF";

export type HeatingData = {
  deviceId: string;
  name: string;
  manufacturer: string;
  model: string;
  status: EnergyDeviceStatus;
  roomTemperature: number;
  targetTemperature: number;
  boilerTemperature: number;
  mode: HeatingMode;
  heatingActive: boolean;
  lastUpdated: string;
};

export type SolarData = {
  deviceId: string;
  name: string;
  manufacturer: string;
  status: EnergyDeviceStatus;
  currentProductionKw: number;
  dailyProductionKwh: number;
  monthlyProductionKwh: number;
  homeConsumptionKw: number;
  gridImportKw: number;
  gridExportKw: number;
  dailyHistory: {
    time: string;
    production: number;
    consumption: number;
  }[];
};

export type UtilityType = "ELECTRICITY" | "GAS" | "WATER";

export type UtilityMeter = {
  id: string;
  name: string;
  type: UtilityType;
  unit: "kWh" | "m³";
  currentReading: number;
  previousReading: number;
  monthlyUsage: number;
  unitPrice: number;
  fixedMonthlyCost: number;
  lastReadingDate: string;
};

export type UtilityCost = {
  type: UtilityType;
  usage: number;
  unit: string;
  variableCost: number;
  fixedCost: number;
  totalCost: number;
};
