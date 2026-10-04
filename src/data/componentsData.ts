/**
 * Component-Specific Digital Twin Telemetry & Maintenance Intelligence
 * Strict Component Identity: HVAC, Generator, Workshop, Hydraulics, Comms, Sensors
 */

export interface ComponentSpecificTelemetry {
  id: string;
  name: string;
  category: 'HVAC' | 'POWER' | 'WORKSHOP' | 'HYDRAULICS' | 'COMMS' | 'ENVIRONMENT' | 'WATER' | 'FOUNDATION';
  stationId: 'maitri' | 'bharati';
  status: 'OPERATIONAL' | 'DEGRADED' | 'STANDBY' | 'MAINTENANCE';
  healthScore: number;
  lastInspectionDate: string;
  nextScheduledMaintenanceDays: number;
  lastAnomalyEvent: string | null;
  operatingHours: number;
  sourceType: 'DIGITAL_TWIN_SIMULATION' | 'REAL_OBSERVATION' | 'ML_PREDICTION';

  // Specific physical metrics (custom typed per machine category)
  primaryMetrics: {
    label: string;
    value: string;
    unit: string;
    nominalRange: string;
    status: 'normal' | 'warning' | 'alert';
  }[];

  diagnosticNarrative: string;
  recommendedAction: string;
  maintenanceHistory: {
    date: string;
    action: string;
    technician: string;
    result: string;
  }[];
}

export const STATION_COMPONENTS_DATA: Record<string, ComponentSpecificTelemetry> = {
  // 1. HVAC COMPONENT (MAITRI)
  'hvac-maitri': {
    id: 'hvac-maitri',
    name: 'Air Handling Unit & Hydronic Glycol Heating Loop',
    category: 'HVAC',
    stationId: 'maitri',
    status: 'OPERATIONAL',
    healthScore: 94,
    lastInspectionDate: '2026-09-24',
    nextScheduledMaintenanceDays: 18,
    lastAnomalyEvent: '2 hours ago: Filter Differential Pressure spike due to sastrugi snow ingress',
    operatingHours: 14820,
    sourceType: 'DIGITAL_TWIN_SIMULATION',
    primaryMetrics: [
      { label: 'Supply Fan Load', value: '64', unit: '%', nominalRange: '45 - 75%', status: 'normal' },
      { label: 'Supply Air Temp', value: '21.8', unit: '°C', nominalRange: '20.0 - 23.5°C', status: 'normal' },
      { label: 'Return Air Temp', value: '19.4', unit: '°C', nominalRange: '18.0 - 21.0°C', status: 'normal' },
      { label: 'Glycol Exchanger ΔT', value: '4.2', unit: '°C', nominalRange: '3.5 - 5.5°C', status: 'normal' },
      { label: 'Filter Differential Pressure', value: '140', unit: 'Pa', nominalRange: '< 180 Pa', status: 'normal' },
      { label: 'Fresh Air Ratio', value: '18', unit: '%', nominalRange: '15 - 25%', status: 'normal' }
    ],
    diagnosticNarrative: 'AHU-01 ventilation dampers operating nominally. Heat recovery wheel efficiency measured at 78.4%. Permafrost exhaust damper heated to prevent ice jamming.',
    recommendedAction: 'Inspect pre-filter intake mesh for blizzard snow accumulation within 48 hours.',
    maintenanceHistory: [
      { date: '2026-09-24', action: 'Bi-monthly glycol flush & seal replacement', technician: 'Er. R. Sharma (NCPOR)', result: 'PASSED' },
      { date: '2026-08-10', action: 'Fan motor vibration harmonic analysis', technician: 'Station Engineer', result: 'NOMINAL' }
    ]
  },

  // 2. GENERATOR COMPONENT (MAITRI)
  'generator-maitri': {
    id: 'generator-maitri',
    name: 'Primary Diesel Genset 01 & Standby 02 (Kirloskar Arctic Series)',
    category: 'POWER',
    stationId: 'maitri',
    status: 'DEGRADED',
    healthScore: 88,
    lastInspectionDate: '2026-09-29',
    nextScheduledMaintenanceDays: 6,
    lastAnomalyEvent: '14:09 UTC: Generator 02 bypass coolant valve thermal drift (+6.2°C)',
    operatingHours: 21940,
    sourceType: 'DIGITAL_TWIN_SIMULATION',
    primaryMetrics: [
      { label: 'G1 Electrical Load', value: '112.5', unit: 'kW', nominalRange: '90 - 130 kW', status: 'normal' },
      { label: 'G1 Engine RPM', value: '1,500', unit: 'RPM', nominalRange: '1,500 ± 5 RPM', status: 'normal' },
      { label: 'G2 Standby Coolant', value: '64.2', unit: '°C', nominalRange: '50 - 58°C', status: 'warning' },
      { label: 'Main Bus Voltage', value: '415.2', unit: 'V', nominalRange: '410 - 420 V', status: 'normal' },
      { label: 'Bus Frequency', value: '50.04', unit: 'Hz', nominalRange: '49.8 - 50.2 Hz', status: 'normal' },
      { label: 'Daily Fuel Burn', value: '350', unit: 'L/day', nominalRange: '320 - 380 L/day', status: 'normal' }
    ],
    diagnosticNarrative: 'G1 carries primary station baseline load smoothly. G2 standby coolant bypass actuator shows thermal drift; automated load leveling relay currently active.',
    recommendedAction: 'Schedule technician servicing for G2 coolant three-way bypass valve within 6–9 days.',
    maintenanceHistory: [
      { date: '2026-09-29', action: 'Lube oil filter replacement (Mobil Delvac Arctic 5W-30)', technician: 'Lead Power Tech', result: 'PASSED' },
      { date: '2026-07-15', action: 'Injector nozzle calibration', technician: 'Station Engineer', result: 'PASSED' }
    ]
  },

  // 3. WORKSHOP / HEAVY MECHANICAL COMPONENT (MAITRI)
  'workshop-maitri': {
    id: 'workshop-maitri',
    name: 'Heavy Engineering Workshop & Snow Groomer Depot',
    category: 'WORKSHOP',
    stationId: 'maitri',
    status: 'OPERATIONAL',
    healthScore: 96,
    lastInspectionDate: '2026-09-18',
    nextScheduledMaintenanceDays: 24,
    lastAnomalyEvent: null,
    operatingHours: 8400,
    sourceType: 'DIGITAL_TWIN_SIMULATION',
    primaryMetrics: [
      { label: 'Overhead Gantry Hoist', value: '5.0', unit: 'Ton Capacity', nominalRange: 'Certified 5T', status: 'normal' },
      { label: 'PistenBully Engine Block Pre-heat', value: '+45.0', unit: '°C', nominalRange: '+40 to +55°C', status: 'normal' },
      { label: 'CNC Precision Lathe Spindle', value: '1,240', unit: 'Operating Hours', nominalRange: 'Calibrated', status: 'normal' },
      { label: 'Hydraulic Test Bench Pressure', value: '210', unit: 'Bar', nominalRange: '180 - 250 Bar', status: 'normal' },
      { label: 'Arctic Spares Inventory Index', value: '89', unit: '%', nominalRange: '> 80%', status: 'normal' },
      { label: 'Shop Ambient Heating', value: '16.5', unit: '°C', nominalRange: '14 - 18°C', status: 'normal' }
    ],
    diagnosticNarrative: 'Heavy machine bay ready for winter overhaul cycles. Snow groomer hydraulic lines pre-heated with glycol blankets to prevent elastomer hardening.',
    recommendedAction: 'Verify torque spec on PistenBully track cleats prior to tomorrow morning ice-sheet sortie.',
    maintenanceHistory: [
      { date: '2026-09-18', action: 'Hydraulic test bench accumulator nitrogen recharge', technician: 'Mechanical Specialist', result: 'VERIFIED' }
    ]
  },

  // 4. HYDRAULICS / STILTS FOUNDATION (MAITRI)
  'foundation-maitri': {
    id: 'foundation-maitri',
    name: 'Structural Truss Pylons & Hydraulic Jacking Foundation',
    category: 'FOUNDATION',
    stationId: 'maitri',
    status: 'OPERATIONAL',
    healthScore: 97,
    lastInspectionDate: '2026-10-01',
    nextScheduledMaintenanceDays: 30,
    lastAnomalyEvent: null,
    operatingHours: 32000,
    sourceType: 'DIGITAL_TWIN_SIMULATION',
    primaryMetrics: [
      { label: 'Hydraulic Tilt Inclinometer', value: '0.08', unit: 'deg', nominalRange: '< 0.25 deg', status: 'normal' },
      { label: 'Foundation Pylon Strain', value: '14.2', unit: 'MPa', nominalRange: '< 45 MPa', status: 'normal' },
      { label: 'Clearance Above Snowpack', value: '1.62', unit: 'm', nominalRange: '> 1.2 m', status: 'normal' },
      { label: 'Anchor Ground Temperature', value: '-14.8', unit: '°C', nominalRange: 'Sub-zero Solid Permafrost', status: 'normal' }
    ],
    diagnosticNarrative: 'All 12 steel pile clusters anchored in solid Schirmacher Oasis permafrost bedrock. Zero lateral creep detected by laser level network.',
    recommendedAction: 'Perform routine quarterly hydraulic leveling check next month.',
    maintenanceHistory: [
      { date: '2026-10-01', action: 'Digital laser horizontal survey across 12 foundation stilts', technician: 'Structural Surveyor', result: 'HORIZONTAL NOMINAL' }
    ]
  },

  // 5. COMMUNICATION RADOME (MAITRI)
  'comms-maitri': {
    id: 'comms-maitri',
    name: 'C-Band Satellite Earth Station & HF Dipole Array',
    category: 'COMMS',
    stationId: 'maitri',
    status: 'OPERATIONAL',
    healthScore: 98,
    lastInspectionDate: '2026-09-28',
    nextScheduledMaintenanceDays: 45,
    lastAnomalyEvent: null,
    operatingHours: 29500,
    sourceType: 'DIGITAL_TWIN_SIMULATION',
    primaryMetrics: [
      { label: 'GSAT-14 Carrier Lock', value: 'LOCKED', unit: 'State', nominalRange: 'Continuous Lock', status: 'normal' },
      { label: 'Carrier-to-Noise (C/N)', value: '14.8', unit: 'dB', nominalRange: '> 11.5 dB', status: 'normal' },
      { label: 'Mainland Uplink Bandwidth', value: '10.0', unit: 'Mbps', nominalRange: '8 - 12 Mbps', status: 'normal' },
      { label: 'Radome Internal Heater', value: '+12.4', unit: '°C', nominalRange: '+8 to +16°C', status: 'normal' }
    ],
    diagnosticNarrative: 'High-speed encrypted telemetry pipe linking Maitri to NCPOR Headquarters in Goa operating with 0% packet loss.',
    recommendedAction: 'Verify RF feed de-icer heater coils before predicted night-time blizzard.',
    maintenanceHistory: [
      { date: '2026-09-28', action: 'RF tracking gimbal servo recalibration', technician: 'Telecom Lead', result: 'ALIGNED' }
    ]
  },

  // 6. ATMOSPHERIC & ENVIRONMENTAL RESEARCH SENSORS (MAITRI)
  'sensors-maitri': {
    id: 'sensors-maitri',
    name: 'NCPOR Surface Meteorological AWS & Atmospheric Lab Array',
    category: 'ENVIRONMENT',
    stationId: 'maitri',
    status: 'OPERATIONAL',
    healthScore: 99,
    lastInspectionDate: '2026-10-02',
    nextScheduledMaintenanceDays: 14,
    lastAnomalyEvent: null,
    operatingHours: 42000,
    sourceType: 'REAL_OBSERVATION',
    primaryMetrics: [
      { label: 'NCPOR Ambient Temperature', value: '-31.8', unit: '°C', nominalRange: '-35 to -15°C', status: 'normal' },
      { label: 'Barometric Pressure', value: '985.2', unit: 'hPa', nominalRange: '970 - 1005 hPa', status: 'normal' },
      { label: 'Wind Speed', value: '56.8', unit: 'km/h', nominalRange: '15 - 70 km/h', status: 'normal' },
      { label: 'Relative Humidity', value: '52', unit: '%', nominalRange: '30 - 75%', status: 'normal' },
      { label: 'Dobson Spectrophotometer (Ozone)', value: '298', unit: 'DU', nominalRange: '260 - 340 DU', status: 'normal' },
      { label: 'Fluxgate Magnetometer', value: '48,210', unit: 'nT', nominalRange: 'Quiescent Baseline', status: 'normal' }
    ],
    diagnosticNarrative: 'REAL NCPOR surface observations streaming from AWS ID 89514. Optical Lidar and geomagnetic variometers transmitting 1-second cadence pulses.',
    recommendedAction: 'Download raw daily RINEX GPS ionospheric scintillation log at 00:00 UTC.',
    maintenanceHistory: [
      { date: '2026-10-02', action: 'Ultrasonic anemometer heater circuit check', technician: 'Atmospheric Scientist', result: 'CALIBRATED' }
    ]
  },

  // 7. BHARATI COMPONENT: COMBINED POWER & RECOVERY
  'power-bharati': {
    id: 'power-bharati',
    name: 'Bharati Combined Microgrid & Heat Exchanger Bank',
    category: 'POWER',
    stationId: 'bharati',
    status: 'OPERATIONAL',
    healthScore: 97,
    lastInspectionDate: '2026-09-27',
    nextScheduledMaintenanceDays: 32,
    lastAnomalyEvent: null,
    operatingHours: 19800,
    sourceType: 'DIGITAL_TWIN_SIMULATION',
    primaryMetrics: [
      { label: 'Triple Genset Bus Load', value: '148.0', unit: 'kW', nominalRange: '120 - 180 kW', status: 'normal' },
      { label: 'Exhaust Heat Recovery Yield', value: '88.2', unit: '%', nominalRange: '> 82%', status: 'normal' },
      { label: 'Hydronic District Heating Loop', value: '62.4', unit: '°C', nominalRange: '58 - 66°C', status: 'normal' },
      { label: 'Fuel Day-Tank Buffer', value: '1,840', unit: 'L', nominalRange: '> 1,200 L', status: 'normal' },
      { label: 'Bus Voltage Stability', value: '415.0', unit: 'V (50.00 Hz)', nominalRange: '415 V ± 1%', status: 'normal' }
    ],
    diagnosticNarrative: 'Bharati high-efficiency co-generation plant utilizes 88% of engine exhaust thermal energy to heat living and laboratory wings with zero auxiliary fuel burn.',
    recommendedAction: 'Conduct automated failover test of redundant alternator unit 3 on Sunday.',
    maintenanceHistory: [
      { date: '2026-09-27', action: 'Combined heat recovery shell-and-tube descaling', technician: 'Bharati Chief Engineer', result: 'OPTIMAL' }
    ]
  },

  // 8. BHARATI COMPONENT: COASTAL OCEANOGRAPHIC & MARINE LAB
  'sensors-bharati': {
    id: 'sensors-bharati',
    name: 'Bharati Coastal Marine & Oceanographic DCWIS Array',
    category: 'ENVIRONMENT',
    stationId: 'bharati',
    status: 'OPERATIONAL',
    healthScore: 98,
    lastInspectionDate: '2026-10-01',
    nextScheduledMaintenanceDays: 20,
    lastAnomalyEvent: null,
    operatingHours: 36000,
    sourceType: 'REAL_OBSERVATION',
    primaryMetrics: [
      { label: 'NCPOR Coastal Temperature', value: '-18.8', unit: '°C', nominalRange: '-25 to -10°C', status: 'normal' },
      { label: 'Barometric Pressure', value: '991.6', unit: 'hPa', nominalRange: '980 - 1010 hPa', status: 'normal' },
      { label: 'Wind Speed', value: '38.2', unit: 'km/h', nominalRange: '10 - 55 km/h', status: 'normal' },
      { label: 'Relative Humidity', value: '71', unit: '%', nominalRange: '50 - 85%', status: 'normal' },
      { label: 'Seawater Temperature (Under-ice)', value: '-1.8', unit: '°C', nominalRange: '-1.9 to -1.5°C', status: 'normal' },
      { label: 'Pack Ice Acoustic Calving Sensor', value: '0.02', unit: 'g Accel', nominalRange: 'Quiescent Baseline', status: 'normal' }
    ],
    diagnosticNarrative: 'REAL NCPOR DCWIS coastal marine telemetry streaming live from Larsemann Hills station ID 89532. Fast-ice sensor tether active.',
    recommendedAction: 'Verify underwater CTD probe conductivity calibration before next sea ice deployment.',
    maintenanceHistory: [
      { date: '2026-10-01', action: 'DCWIS telemetry transmitter firmware sync', technician: 'Oceanographer', result: 'LOCKED' }
    ]
  }
};

export const getComponentData = (componentKey: string): ComponentSpecificTelemetry => {
  return (
    STATION_COMPONENTS_DATA[componentKey] ||
    STATION_COMPONENTS_DATA['hvac-maitri']
  );
};
