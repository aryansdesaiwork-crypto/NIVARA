import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  StationId,
  StationLocation,
  BuildingNode,
  StationLiveConditions,
  AlertItem,
  WhatIfParams,
  WhatIfResult
} from '../types';
import {
  STATIONS_DATA,
  MAITRI_BUILDINGS,
  BHARATI_BUILDINGS,
  INITIAL_LIVE_CONDITIONS,
  MOCK_ALERTS
} from '../data/mockData';
import { getLatestObservation, NCPORObservation } from '../services/ncporService';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  institution: string;
}

interface StationContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  stationId: StationId;
  stationLocation: StationLocation;
  currentRoute: string;
  selectedBuildingId: string | null;
  selectedBuilding: BuildingNode | null;
  selectedComponentId: string | null;
  selectComponent: (id: string | null) => void;
  ncporObservation: NCPORObservation;
  liveConditions: StationLiveConditions;
  buildings: BuildingNode[];
  alerts: AlertItem[];
  unreadAlertCount: number;
  whatIfParams: WhatIfParams;
  whatIfResult: WhatIfResult;
  timeUtc: string;
  // Connected Cross-System Simulation State
  simAmbientTemp: number;
  simWeatherMode: 'normal' | 'storm' | 'blizzard';
  simCrewCount: number;
  simActiveExperiments: number;
  simManualGeneratorLoad: number | null;
  simWaterMode: 'normal' | 'high' | 'extreme';
  simDiagnostic: { running: boolean; progress: number; currentStep: string; result: string | null };
  // Dynamically propagated calculations
  simHeatingDemand: number;
  simGeneratorLoad: number;
  simGenerator1Temp: number;
  simGenerator2Temp: number;
  simHourlyFuelBurn: number;
  simDailyFuelBurn: number;
  simFuelDaysRemaining: number;
  simFuelReservePercent: number;
  simDailyWater: number;
  simWaterDaysRemaining: number;
  simCo2Ppm: number;
  simLabPowerKw: number;
  simPowerRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  // Actions
  login: (id: string, role?: string) => void;
  logout: () => void;
  setStationId: (id: StationId) => void;
  navigateTo: (route: string) => void;
  selectBuilding: (id: string | null) => void;
  toggleCommunication: () => void;
  acknowledgeAlert: (alertId: string) => void;
  updateWhatIfParams: (newParams: Partial<WhatIfParams>) => void;
  resetWhatIfParams: () => void;
  setSimAmbientTemp: (temp: number) => void;
  setSimWeatherMode: (mode: 'normal' | 'storm' | 'blizzard') => void;
  setSimCrewCount: (count: number) => void;
  setSimActiveExperiments: (count: number) => void;
  setSimManualGeneratorLoad: (load: number | null) => void;
  setSimWaterMode: (mode: 'normal' | 'high' | 'extreme') => void;
  runMaintenanceDiagnostic: () => void;
  resetAllSimulations: () => void;
}

const DEFAULT_WHAT_IF_PARAMS: WhatIfParams = {
  ambientTempC: -28,
  windSeverityKmh: 42,
  powerDemandMultiplier: 1.0,
  generator2Offline: false,
  blizzardActive: false,
  resupplyDelayDays: 0
};

const StationContext = createContext<StationContextType | undefined>(undefined);

export const StationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication & session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stationId, setStationIdState] = useState<StationId>('maitri');
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>('maitri-tricolor-hub');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('hvac-maitri');
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);

  // Real NCPOR Observation from official AWS/DCWIS service
  const ncporObservation = useMemo(() => {
    return getLatestObservation(stationId);
  }, [stationId]);

  // Live Conditions
  const [liveConditions, setLiveConditions] = useState<StationLiveConditions>(INITIAL_LIVE_CONDITIONS);

  // What-If Simulator state
  const [whatIfParams, setWhatIfParams] = useState<WhatIfParams>(DEFAULT_WHAT_IF_PARAMS);

  // UTC clock simulation
  const [timeUtc, setTimeUtc] = useState<string>('14:32:00 UTC');

  // Connected Cross-System Simulation State
  const [simAmbientTemp, setSimAmbientTemp] = useState<number>(-28.4);
  const [simWeatherMode, setSimWeatherMode] = useState<'normal' | 'storm' | 'blizzard'>('normal');
  const [simCrewCount, setSimCrewCount] = useState<number>(18);
  const [simActiveExperiments, setSimActiveExperiments] = useState<number>(4);
  const [simManualGeneratorLoad, setSimManualGeneratorLoad] = useState<number | null>(null);
  const [simWaterMode, setSimWaterMode] = useState<'normal' | 'high' | 'extreme'>('normal');
  const [simDiagnostic, setSimDiagnostic] = useState<{
    running: boolean;
    progress: number;
    currentStep: string;
    result: string | null;
  }>({
    running: false,
    progress: 0,
    currentStep: '',
    result: null
  });

  // Calculate dynamic interconnected telemetry:
  // 1. Heating Demand (Nominal 64% at -28.4°C, 81% at -40°C, 52% at -20°C; storm adds 5%, blizzard adds 12%)
  const simHeatingDemand = useMemo(() => {
    const tempDelta = Math.max(0, -20 - simAmbientTemp);
    let demand = Math.round(52 + tempDelta * 1.45);
    if (simWeatherMode === 'storm') demand += 5;
    if (simWeatherMode === 'blizzard') demand += 12;
    return Math.min(98, Math.max(40, demand));
  }, [simAmbientTemp, simWeatherMode]);

  // 2. Generator Load
  // If user adjusted slider manually, use it. Otherwise, derive from heating + crew + lab
  const simGeneratorLoad = useMemo(() => {
    if (simManualGeneratorLoad !== null) {
      return simManualGeneratorLoad;
    }
    const heatingExcess = (simHeatingDemand - 64) * 0.72;
    const crewExcess = (simCrewCount - 18) * 0.8;
    const labExcess = (simActiveExperiments - 4) * 1.5;
    const total = Math.round(82 + heatingExcess + crewExcess + labExcess);
    return Math.min(100, Math.max(50, total));
  }, [simManualGeneratorLoad, simHeatingDemand, simCrewCount, simActiveExperiments]);

  // 3. Generator 1 & 2 Temperatures and Power kW
  const simGenerator1Temp = useMemo(() => {
    return Math.round(50 + simGeneratorLoad * 0.22);
  }, [simGeneratorLoad]);

  const simGenerator2Temp = useMemo(() => {
    return Math.round(52 + simGeneratorLoad * 0.23);
  }, [simGeneratorLoad]);

  const simHourlyFuelBurn = useMemo(() => {
    return Math.round(22 + simGeneratorLoad * 0.244);
  }, [simGeneratorLoad]);

  const simDailyFuelBurn = useMemo(() => {
    return simHourlyFuelBurn * 24;
  }, [simHourlyFuelBurn]);

  const simFuelReserveLiters = 8420;
  const simFuelReservePercent = Math.round((simFuelReserveLiters / 12380) * 100);

  const simFuelDaysRemaining = useMemo(() => {
    return Math.max(0, Math.floor(simFuelReserveLiters / simDailyFuelBurn));
  }, [simDailyFuelBurn]);

  // Water calculations
  const simDailyWater = useMemo(() => {
    if (simWaterMode === 'extreme') return 510;
    if (simWaterMode === 'high') return 380;
    return Math.round(simCrewCount * 15.8);
  }, [simWaterMode, simCrewCount]);

  const simWaterDaysRemaining = useMemo(() => {
    return Math.max(0, Math.floor(8880 / simDailyWater));
  }, [simDailyWater]);

  const simCo2Ppm = useMemo(() => {
    return Math.round(480 + (simCrewCount - 18) * 20);
  }, [simCrewCount]);

  const simLabPowerKw = useMemo(() => {
    return Math.round(18 + simActiveExperiments * 6);
  }, [simActiveExperiments]);

  const simPowerRisk = useMemo<'LOW' | 'MEDIUM' | 'HIGH'>(() => {
    if (simGeneratorLoad >= 94) return 'HIGH';
    if (simGeneratorLoad >= 87) return 'MEDIUM';
    return 'LOW';
  }, [simGeneratorLoad]);

  const runMaintenanceDiagnostic = () => {
    if (simDiagnostic.running) return;
    setSimDiagnostic({
      running: true,
      progress: 10,
      currentStep: 'Initializing thermal sensors and baseline check...',
      result: null
    });

    setTimeout(() => {
      setSimDiagnostic((p) => ({
        ...p,
        progress: 35,
        currentStep: 'Performing harmonic vibration FFT on Generator 02 and Pump 02...'
      }));
    }, 700);

    setTimeout(() => {
      setSimDiagnostic((p) => ({
        ...p,
        progress: 70,
        currentStep: 'Evaluating MTBF wear limits and glycol fluid viscosity...'
      }));
    }, 1400);

    setTimeout(() => {
      setSimDiagnostic((p) => ({
        ...p,
        progress: 95,
        currentStep: 'Verifying SCADA telemetry integrity and failover relays...'
      }));
    }, 2100);

    setTimeout(() => {
      setSimDiagnostic({
        running: false,
        progress: 100,
        currentStep: 'DIAGNOSTIC COMPLETE',
        result: 'Risk: MEDIUM · Generator 02 bypass valve service window: 6–9 days. Pump 02 vibration within advisory tolerances.'
      });
    }, 2800);
  };

  const resetAllSimulations = () => {
    setSimAmbientTemp(-28.4);
    setSimWeatherMode('normal');
    setSimCrewCount(18);
    setSimActiveExperiments(4);
    setSimManualGeneratorLoad(null);
    setSimWaterMode('normal');
    setSimDiagnostic({
      running: false,
      progress: 0,
      currentStep: '',
      result: null
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeUtc(`${hours}:${minutes}:${seconds} UTC`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stationLocation = STATIONS_DATA[stationId];
  const buildings = stationId === 'bharati' ? BHARATI_BUILDINGS : MAITRI_BUILDINGS;

  const selectedBuilding = useMemo(() => {
    if (!selectedBuildingId) return null;
    return buildings.find((b) => b.id === selectedBuildingId) || null;
  }, [selectedBuildingId, buildings]);

  const unreadAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.acknowledged).length;
  }, [alerts]);

  // Dynamic calculation for What-If results
  const whatIfResult = useMemo<WhatIfResult>(() => {
    // Baseline temp is -28. Each degree drop increases heating demand by ~1.5%
    const tempDelta = Math.max(0, -28 - whatIfParams.ambientTempC);
    const windPenalty = Math.max(0, (whatIfParams.windSeverityKmh - 42) * 0.2);
    const blizzardPenalty = whatIfParams.blizzardActive ? 8 : 0;

    const heatingDemandDeltaPct = Math.round(tempDelta * 1.4 + windPenalty + blizzardPenalty);
    const powerDemandDeltaPct = Math.round(
      (heatingDemandDeltaPct * 0.6 + (whatIfParams.powerDemandMultiplier - 1.0) * 100)
    );

    // Generator load base 82%
    let generatorLoadPct = Math.round(82 + powerDemandDeltaPct * 0.75);
    if (whatIfParams.generator2Offline) {
      generatorLoadPct = Math.min(100, Math.round(generatorLoadPct * 1.35));
    } else {
      generatorLoadPct = Math.min(100, generatorLoadPct);
    }

    // Daily fuel burn base 350 L
    const dailyFuelBurnLiters = Math.round(350 * (1 + powerDemandDeltaPct * 0.009));

    // Days remaining based on remaining 8,420 L
    const fuelDaysRemaining = Math.max(0, Math.floor(8420 / dailyFuelBurnLiters));

    // BottleNeck evaluation
    let criticalBottleNeck = 'Food Rations (16 Days)';
    let missionSafetyMargin: WhatIfResult['missionSafetyMargin'] = 'STABLE';

    const netBufferDays = fuelDaysRemaining - (21 + whatIfParams.resupplyDelayDays);

    if (netBufferDays < 0 || generatorLoadPct >= 96) {
      missionSafetyMargin = 'CRITICAL';
      criticalBottleNeck = whatIfParams.generator2Offline
        ? 'Generator 01 Peak Saturation'
        : 'Fuel Stock Depletion Before Vessel Arrival';
    } else if (netBufferDays <= 2 || whatIfParams.resupplyDelayDays >= 5) {
      missionSafetyMargin = 'DEGRADED';
      criticalBottleNeck = 'Resupply Ship Transit Delay / Fuel Reserve Margin';
    } else if (whatIfParams.ambientTempC <= -40) {
      missionSafetyMargin = 'DEGRADED';
      criticalBottleNeck = 'Perimeter Heat Loss & Fuel Surge';
    } else {
      missionSafetyMargin = 'STABLE';
    }

    return {
      heatingDemandDeltaPct,
      powerDemandDeltaPct,
      generatorLoadPct,
      dailyFuelBurnLiters,
      fuelDaysRemaining,
      criticalBottleNeck,
      missionSafetyMargin
    };
  }, [whatIfParams]);

  const login = (id: string, role = 'Senior Polar Operations Officer') => {
    setIsAuthenticated(true);
    setUser({
      id: id || 'NIVARA-IND-8842',
      name: 'Dr. Arjun Roy',
      role,
      institution: 'NCPOR / Indian Antarctic Programme'
    });
    // Start at Station Selection page (Test 2 acceptance criteria)
    setCurrentRoute('stations');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentRoute('landing');
  };

  const setStationId = (id: StationId) => {
    setStationIdState(id);
    setSelectedBuildingId(id === 'bharati' ? 'bharati-observation' : 'maitri-tricolor-hub');
    setSelectedComponentId(id === 'bharati' ? 'power-bharati' : 'hvac-maitri');
    setCurrentRoute('overview');
  };

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectBuilding = (id: string | null) => {
    setSelectedBuildingId(id);
  };

  const selectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };

  const toggleCommunication = () => {
    setLiveConditions((prev) => {
      const isConnected = prev.communicationStatus === 'CONNECTED';
      return {
        ...prev,
        communicationStatus: isConnected ? 'DISCONNECTED' : 'CONNECTED',
        satelliteLinkQualityPercent: isConnected ? 0 : 84,
        bufferedOfflineEvents: isConnected ? 127 : 0
      };
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const updateWhatIfParams = (newParams: Partial<WhatIfParams>) => {
    setWhatIfParams((prev) => ({ ...prev, ...newParams }));
  };

  const resetWhatIfParams = () => {
    setWhatIfParams(DEFAULT_WHAT_IF_PARAMS);
  };

  return (
    <StationContext.Provider
      value={{
        isAuthenticated,
        user,
        stationId,
        stationLocation,
        currentRoute,
        selectedBuildingId,
        selectedBuilding,
        selectedComponentId,
        selectComponent,
        ncporObservation,
        liveConditions,
        buildings,
        alerts,
        unreadAlertCount,
        whatIfParams,
        whatIfResult,
        timeUtc,
        simAmbientTemp,
        simWeatherMode,
        simCrewCount,
        simActiveExperiments,
        simManualGeneratorLoad,
        simWaterMode,
        simDiagnostic,
        simHeatingDemand,
        simGeneratorLoad,
        simGenerator1Temp,
        simGenerator2Temp,
        simHourlyFuelBurn,
        simDailyFuelBurn,
        simFuelDaysRemaining,
        simFuelReservePercent,
        simDailyWater,
        simWaterDaysRemaining,
        simCo2Ppm,
        simLabPowerKw,
        simPowerRisk,
        login,
        logout,
        setStationId,
        navigateTo,
        selectBuilding,
        toggleCommunication,
        acknowledgeAlert,
        updateWhatIfParams,
        resetWhatIfParams,
        setSimAmbientTemp,
        setSimWeatherMode,
        setSimCrewCount,
        setSimActiveExperiments,
        setSimManualGeneratorLoad,
        setSimWaterMode,
        runMaintenanceDiagnostic,
        resetAllSimulations
      }}
    >
      {children}
    </StationContext.Provider>
  );
};

export const useStation = (): StationContextType => {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
};
