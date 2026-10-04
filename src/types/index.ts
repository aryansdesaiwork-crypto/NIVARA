export type StationId = 'maitri' | 'bharati';

export type SystemStatus = 'operational' | 'stable' | 'attention' | 'critical';

export interface StationLocation {
  name: string;
  code: string;
  region: string;
  coordinates: string;
  altitude: string;
  establishedYear: number;
  winterCrew: number;
  summerCapacity: number;
  image: string;
  description: string;
}

export interface BuildingNode {
  id: string;
  name: string;
  systemId: string;
  status: SystemStatus;
  position: [number, number, number]; // [x, y, z] for 3D
  size: [number, number, number];
  color: string;
  category: string;
  description: string;
  temperature: number;
  powerDrawKw: number;
  healthScore: number;
  keySensors: { label: string; value: string; status: 'normal' | 'warning' | 'alert' }[];
  predictionNote: string;
  whatIfScenario: string;
  historyEvent: string;
}

export interface SystemCardData {
  id: string;
  name: string;
  subtitle: string;
  status: SystemStatus;
  metricLabel: string;
  metricValue: string;
  subMetric: string;
  iconName: string;
  route: string;
  details: {
    primaryStat: string;
    secondaryStat: string;
    efficiency: string;
    alertCount: number;
    summary: string;
  };
}

export interface StationLiveConditions {
  temperatureC: number;
  apparentTempC: number;
  windSpeedKmh: number;
  windDirection: string;
  windGustKmh: number;
  barometricPressureHpa: number;
  visibilityKm: number;
  snowCondition: string;
  uvIndex: number;
  powerLoadPercent: number;
  powerGenerationKw: number;
  fuelReservePercent: number;
  fuelLiters: number;
  fuelBurnDailyLiters: number;
  fuelDaysRemaining: number;
  waterReservePercent: number;
  waterLiters: number;
  waterDailyLiters: number;
  waterDaysRemaining: number;
  crewPresent: number;
  crewMaxCapacity: number;
  indoorAvgTempC: number;
  indoorCo2Ppm: number;
  communicationStatus: 'CONNECTED' | 'DISCONNECTED';
  satelliteLinkQualityPercent: number;
  mainlandDataTransmittedGb: number;
  bufferedOfflineEvents: number;
  lastSyncUtc: string;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  systemId: string;
  timestamp: string;
  location: string;
  description: string;
  acknowledged: boolean;
  valueRecorded: string;
  threshold: string;
  recommendedAction: string;
}

export interface BlackBoxEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  category: 'Warning' | 'Failure' | 'Operator Action' | 'Communication' | 'Equipment' | 'Environmental';
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  sourceSystem: string;
  operator?: string;
  telemetrySnapshot: {
    temp?: string;
    load?: string;
    voltage?: string;
    fuelRate?: string;
    signal?: string;
  };
  reconstruction?: {
    triggerEvent: string;
    rootCause: string;
    telemetryImpact: string;
    systemAction: string;
    currentSafetyMargin: string;
  };
}

export interface PredictionData {
  systemId: string;
  systemName: string;
  healthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: string;
  forecastSummary: string;
  depletionDays?: number;
  forecastPoints: { timestamp: string; predictedValue: number; baselineValue: number }[];
  keyFactors: string[];
}

export interface WhatIfParams {
  ambientTempC: number; // e.g. -28 down to -50
  windSeverityKmh: number; // e.g. 42 to 120
  powerDemandMultiplier: number; // e.g. 0.8 to 1.5
  generator2Offline: boolean;
  blizzardActive: boolean;
  resupplyDelayDays: number; // e.g. 0 to 30
}

export interface WhatIfResult {
  heatingDemandDeltaPct: number;
  powerDemandDeltaPct: number;
  generatorLoadPct: number;
  dailyFuelBurnLiters: number;
  fuelDaysRemaining: number;
  criticalBottleNeck: string;
  missionSafetyMargin: 'SURPLUS' | 'STABLE' | 'DEGRADED' | 'CRITICAL';
}

export interface MissionResource {
  id: string;
  name: string;
  currentStock: string;
  ratePerDay: string;
  daysRemaining: number;
  targetResupplyDays: number;
  status: 'OPTIMAL' | 'ADEQUATE' | 'BOTTLENECK' | 'CRITICAL';
  notes: string;
}
