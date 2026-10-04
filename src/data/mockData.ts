import {
  StationId,
  StationLocation,
  BuildingNode,
  StationLiveConditions,
  SystemCardData,
  AlertItem,
  BlackBoxEvent,
  PredictionData,
  MissionResource
} from '../types';

export const STATIONS_DATA: Record<StationId, StationLocation> = {
  maitri: {
    name: 'Maitri',
    code: 'IN-ATR-02',
    region: 'Schirmacher Oasis, Queen Maud Land',
    coordinates: '70°45\'58" S, 11°44\'09" E',
    altitude: '117 m ASL',
    establishedYear: 1989,
    winterCrew: 18,
    summerCapacity: 45,
    image: '/src/assets/images/maitri_station_card_1790933984169.jpg',
    description: 'India’s permanent polar base in Schirmacher Oasis, characterized by its long modular sage-green container block elevated on steel truss stilts, prominent central Indian Tricolor entrance portal with access stairs, and rooftop communications radome.'
  },
  bharati: {
    name: 'Bharati',
    code: 'IN-ATR-03',
    region: 'Larsemann Hills, Princess Elizabeth Land',
    coordinates: '69°24\'29" S, 76°11\'14" E',
    altitude: '35 m ASL',
    establishedYear: 2012,
    winterCrew: 24,
    summerCapacity: 47,
    image: '/src/assets/images/bharati_station_card_1790933996409.jpg',
    description: 'India’s cutting-edge aerodynamic station in Larsemann Hills, featuring an insulated silver-metallic cantilever hull elevated on heavy V-shaped steel pylons, panoramic front observation salon, and continuous glowing ribbon windows.'
  }
};

export const MAITRI_BUILDINGS: BuildingNode[] = [
  {
    id: 'maitri-tricolor-hub',
    name: 'Central Command & Tricolor Entrance',
    systemId: 'crew',
    status: 'operational',
    position: [0, 1.8, 0],
    size: [6.0, 3.8, 6.5],
    color: '#3B82F6',
    category: 'Station Entry & Command',
    description: 'The iconic central portal of Maitri Station featuring the Indian Tricolor facade, primary access steel gangway staircase, and operations control deck.',
    temperature: 21.4,
    powerDrawKw: 38,
    healthScore: 97,
    keySensors: [
      { label: 'Portal Airlock', value: 'Sealed (+18 Pa)', status: 'normal' },
      { label: 'Indoor Temp', value: '21.4°C', status: 'normal' },
      { label: 'CO2 Level', value: '475 ppm', status: 'normal' },
      { label: 'Access Gangway', value: 'De-iced (+3°C)', status: 'normal' }
    ],
    predictionNote: 'Entrance thermal curtain operating at 96% efficiency; airlock heat loss within nominal Antarctic envelope.',
    whatIfScenario: 'Extreme katabatic wind gusting above 90 km/h triggers automated exterior storm door interlock.',
    historyEvent: '14:00 UTC: Shift handover logged at Central Command Console by Expedition Leader.'
  },
  {
    id: 'maitri-living-quarters',
    name: 'Main Habitation Wings (East & West)',
    systemId: 'crew',
    status: 'operational',
    position: [9, 1.6, 0],
    size: [14.0, 3.4, 6.0],
    color: '#60A5FA',
    category: 'Habitation & Life Support',
    description: 'Elevated sage-green modular container wings housing 18 wintering expedition personnel, galley, library, and medical dispensary on structural steel truss stilts.',
    temperature: 21.0,
    powerDrawKw: 46,
    healthScore: 95,
    keySensors: [
      { label: 'East Wing Temp', value: '21.2°C', status: 'normal' },
      { label: 'West Wing Temp', value: '20.8°C', status: 'normal' },
      { label: 'Relative Humidity', value: '38%', status: 'normal' },
      { label: 'Life Support O2', value: '20.9%', status: 'normal' }
    ],
    predictionNote: 'Container insulation envelope holding steady with zero permafrost condensation detected.',
    whatIfScenario: 'Secondary heater loop isolation maintains living quarters above 18°C during brownout.',
    historyEvent: '12:30 UTC: Routine medical officer inspection confirmed all personnel vitals nominal.'
  },
  {
    id: 'maitri-science-lab',
    name: 'Atmospheric & Geomagnetic Laboratory',
    systemId: 'research',
    status: 'operational',
    position: [-9, 1.6, 0],
    size: [14.0, 3.4, 6.0],
    color: '#818CF8',
    category: 'Polar Science Wing',
    description: 'Western container wing dedicated to ozone monitoring, spectrophotometers, fluxgate magnetometers, and glaciological ice-core analysis.',
    temperature: 20.0,
    powerDrawKw: 42,
    healthScore: 96,
    keySensors: [
      { label: 'Magnetometer 3-Axis', value: 'Calibrated', status: 'normal' },
      { label: 'Lidar Sampling', value: 'Active', status: 'normal' },
      { label: 'Cryo-Freezer', value: '-80.2°C', status: 'normal' },
      { label: 'Cleanroom ISO', value: 'Class 6', status: 'normal' }
    ],
    predictionNote: 'Geomagnetic sensors recording quiet magnetosphere window; solar wind flux stable.',
    whatIfScenario: 'Scientific equipment load shedding protocol can free up 24 kW in emergency microgrid mode.',
    historyEvent: '11:15 UTC: Aurora substorm event captured by 3-axis fluxgate magnetometer.'
  },
  {
    id: 'maitri-generator',
    name: 'Primary Generator Annex (G1 & G2)',
    systemId: 'generator',
    status: 'operational',
    position: [-10, 1.4, -9],
    size: [6.5, 3.0, 5.0],
    color: '#3B82F6',
    category: 'Power Microgrid',
    description: 'External insulated generator house containing Kirloskar diesel generator G1 and backup G2 with dual rooftop exhaust stacks and glycol heat exchangers.',
    temperature: 58.4,
    powerDrawKw: 112,
    healthScore: 88,
    keySensors: [
      { label: 'G1 Load', value: '112.5 kW (1,500 RPM)', status: 'normal' },
      { label: 'Exhaust Temp', value: '385°C', status: 'normal' },
      { label: 'G2 Standby Coolant', value: '64.2°C', status: 'warning' },
      { label: 'Bus Voltage', value: '415.2 V (50.04 Hz)', status: 'normal' }
    ],
    predictionNote: 'G2 bypass coolant valve shows minor thermal drift; servicing recommended in 6–9 days.',
    whatIfScenario: 'Drop to -40°C increases fuel trace heating draw by +11 kW.',
    historyEvent: '14:09 UTC: Generator 02 high-temperature anomaly detected; automatic load leveling triggered.'
  },
  {
    id: 'maitri-fuel',
    name: 'Bulk Fuel Farm & Line Heaters',
    systemId: 'resources',
    status: 'operational',
    position: [10, 1.0, -9],
    size: [7.0, 2.2, 5.0],
    color: '#38BDF8',
    category: 'Hydrocarbon Storage',
    description: 'Double-walled cylindrical Arctic Jet A-1 storage tanks with heated transfer manifold supplying the generator annex and snow melter.',
    temperature: -14.2,
    powerDrawKw: 14,
    healthScore: 92,
    keySensors: [
      { label: 'Bulk ATF Reserve', value: '8,420 L (68%)', status: 'normal' },
      { label: 'Trace Heat Cable', value: '+4.2°C (Active)', status: 'normal' },
      { label: 'Daily Burn Rate', value: '350 L/day', status: 'normal' },
      { label: 'Leak Sump Sensor', value: 'Zero Differential', status: 'normal' }
    ],
    predictionNote: 'Current reserves provide 24 days nominal autonomy; vessel arrival due in 21 days.',
    whatIfScenario: 'High blizzard wind accelerates fuel line thermal loss, requiring trace boost.',
    historyEvent: '09:00 UTC: Automated ultrasonic fuel tank calibration complete.'
  },
  {
    id: 'maitri-radome',
    name: 'Rooftop Radome & Antenna Array',
    systemId: 'communication',
    status: 'operational',
    position: [0, 4.2, 0],
    size: [3.5, 3.5, 3.5],
    color: '#0EA5E9',
    category: 'Satellite Telemetry',
    description: 'White spherical C-band radome and tall vertical antenna towers mounted directly above Maitri central block maintaining link with NCAOR Goa.',
    temperature: 18.5,
    powerDrawKw: 18,
    healthScore: 98,
    keySensors: [
      { label: 'GSAT-14 Lock', value: 'Carrier Locked', status: 'normal' },
      { label: 'Signal SNR', value: '14.8 dB (84%)', status: 'normal' },
      { label: 'Uplink Throughput', value: '10 Mbps', status: 'normal' },
      { label: 'Radome De-icer', value: 'Standby Ready', status: 'normal' }
    ],
    predictionNote: 'Upcoming polar orbit pass will downlink 4.2 GB of geophysical data at 16:45 UTC.',
    whatIfScenario: 'Mainland link drop triggers autonomous local logging without packet loss.',
    historyEvent: '14:32 UTC: Routine telemetry batch synchronized with NCAOR operations center, Goa.'
  },
  {
    id: 'maitri-water',
    name: 'Priyadarshini Lake Intake & Melter',
    systemId: 'water',
    status: 'operational',
    position: [12, 1.2, 8],
    size: [5.5, 2.5, 4.5],
    color: '#0284C7',
    category: 'Water Plant',
    description: 'Sub-ice potable water pumping station from Priyadarshini Lake and auxiliary snow-melting chamber powered by generator jacket heat.',
    temperature: 14.5,
    powerDrawKw: 16,
    healthScore: 94,
    keySensors: [
      { label: 'Potable Store', value: '8,880 L (74%)', status: 'normal' },
      { label: 'Melt Chamber', value: '4.2°C', status: 'normal' },
      { label: 'Filtration Purity', value: '99.8% RO+UV', status: 'normal' },
      { label: 'Daily Output', value: '280 L / day', status: 'normal' }
    ],
    predictionNote: 'Water reserve sufficient for 31 days at current expedition consumption rate.',
    whatIfScenario: 'Lake intake freezing would switch system to 100% snow harvesting mode.',
    historyEvent: '08:00 UTC: Daily water bacteriological test passed with 0 CFU.'
  }
];

export const BHARATI_BUILDINGS: BuildingNode[] = [
  {
    id: 'bharati-observation',
    name: 'Panoramic Observation & Command Deck',
    systemId: 'crew',
    status: 'operational',
    position: [0, 4.2, 10],
    size: [11.5, 3.8, 6.0],
    color: '#3B82F6',
    category: 'Command & Panoramic Salon',
    description: 'The dramatic cantilevered front glass salon of Bharati Station overlooking the icy bay, featuring floor-to-ceiling panoramic polar glazing, central mission consoles, and expedition briefing tables.',
    temperature: 21.8,
    powerDrawKw: 44,
    healthScore: 98,
    keySensors: [
      { label: 'Glazing Surface Temp', value: '18.4°C (+Delta)', status: 'normal' },
      { label: 'Thermal Envelope', value: 'Quadruple Glazed', status: 'normal' },
      { label: 'Interior Lux', value: '380 Lux (Warm Glow)', status: 'normal' },
      { label: 'Command Consoles', value: '100% Online', status: 'normal' }
    ],
    predictionNote: 'Aerodynamic wind deflection across front prow is minimizing thermal boundary layer stripping.',
    whatIfScenario: 'Exterior whiteout wind speeds over 120 km/h automatically engage thermal shutters.',
    historyEvent: '14:20 UTC: Meteorological observation recorded: clear visibility across Larsemann fjord.'
  },
  {
    id: 'bharati-upper-deck',
    name: 'Upper Aerodynamic Habitation Hub',
    systemId: 'crew',
    status: 'operational',
    position: [0, 4.4, -2],
    size: [13.0, 3.8, 18.0],
    color: '#60A5FA',
    category: 'Habitation & Crew Quarters',
    description: 'The long upper cantilevered aerodynamic hull clad in insulated silver aluminum composite panels, featuring continuous horizontal ribbon windows, 24 crew cabins, kitchen, sauna, and fitness facility.',
    temperature: 21.4,
    powerDrawKw: 52,
    healthScore: 96,
    keySensors: [
      { label: 'Habitat Climate', value: '21.4°C / 40% RH', status: 'normal' },
      { label: 'CO2 Sensor Loop', value: '460 ppm', status: 'normal' },
      { label: 'Acoustic Barrier', value: '28 dBA (Quiet)', status: 'normal' },
      { label: 'Fire Suppress Inergen', value: 'Armed (100%)', status: 'normal' }
    ],
    predictionNote: 'Thermal energy retention is 8.4% above baseline thanks to composite sandwich panels.',
    whatIfScenario: 'HVAC recirculator valve test would maintain comfortable heat for 12 hours with zero fuel burn.',
    historyEvent: '13:00 UTC: Crew biometric baseline telemetry synchronized nominal.'
  },
  {
    id: 'bharati-lower-deck',
    name: 'Lower Deck Science & Oceanographic Labs',
    systemId: 'research',
    status: 'operational',
    position: [0, 1.8, -1],
    size: [9.5, 3.2, 14.0],
    color: '#818CF8',
    category: 'Research Laboratories',
    description: 'Recessed ground-level floor nestled beneath the upper cantilever, containing state-of-the-art oceanography wet/dry labs, satellite receiving station, and cleanrooms.',
    temperature: 20.2,
    powerDrawKw: 56,
    healthScore: 97,
    keySensors: [
      { label: 'Oceanographic Spectro', value: 'Active Sampling', status: 'normal' },
      { label: 'Cleanroom Pressure', value: '+22 Pa (Class 5)', status: 'normal' },
      { label: 'Sample Deep Freeze', value: '-82.0°C', status: 'normal' },
      { label: 'Seismometer Array', value: 'Sub-nanometer Lock', status: 'normal' }
    ],
    predictionNote: 'Ocean acoustic receiver tracking pack-ice calving events 45 km to the north-east.',
    whatIfScenario: 'Auxiliary battery bank can sustain all cryogenic sample freezers for 72 hours isolated.',
    historyEvent: '11:45 UTC: Southern Ocean chlorophyll sensor data packet beamed to INCOIS Hyderabad.'
  },
  {
    id: 'bharati-v-stilts',
    name: 'Hydraulic V-Pylon Structural Foundation',
    systemId: 'infrastructure',
    status: 'operational',
    position: [0, 1.0, 0],
    size: [11.0, 2.4, 20.0],
    color: '#64748B',
    category: 'Structural V-Columns & Stilts',
    description: 'The iconic heavy V-shaped steel structural columns elevating Bharati 3.5m above the ground, allowing hurricane-force Antarctic winds to scour snowdrifts beneath without base accumulation.',
    temperature: -18.2,
    powerDrawKw: 18,
    healthScore: 95,
    keySensors: [
      { label: 'Pylon Strain Gauges', value: '14.2 MPa (Nominal)', status: 'normal' },
      { label: 'Hydraulic Level Jacks', value: '0.04° Horizontal', status: 'normal' },
      { label: 'Snow Scour Aeroway', value: 'Clear Vent Path', status: 'normal' },
      { label: 'Foundation Rock Anchors', value: 'Zero Displacement', status: 'normal' }
    ],
    predictionNote: 'Zero sastrugi snowdrift buildup under fuselage; aerodynamic wind scouring working as designed.',
    whatIfScenario: 'Permafrost heave exceeding 2cm triggers automated hydraulic realignment compensation.',
    historyEvent: '10:00 UTC: Weekly structural laser level survey verified 100% horizontal alignment.'
  },
  {
    id: 'bharati-power',
    name: 'Combined Microgrid & Heat Recovery Plant',
    systemId: 'generator',
    status: 'operational',
    position: [0, 1.8, -10],
    size: [8.5, 3.2, 5.5],
    color: '#3B82F6',
    category: 'Microgrid Generation',
    description: 'Rear technical plant housing tri-fuel CHP generators, exhaust heat recovery exchangers, and high-density battery energy storage system (BESS).',
    temperature: 54.0,
    powerDrawKw: 118,
    healthScore: 92,
    keySensors: [
      { label: 'CHP Unit 1 Output', value: '124 kW (Active)', status: 'normal' },
      { label: 'CHP Unit 2 Standby', value: 'Ready Warm', status: 'normal' },
      { label: 'Thermal Recovery Eff', value: '94.6% Recovered', status: 'normal' },
      { label: 'BESS Battery Buffer', value: '96% (120 kWh)', status: 'normal' }
    ],
    predictionNote: 'Thermal energy recovered from generator exhaust heating 100% of station hydronics without auxiliary burner.',
    whatIfScenario: 'Complete CHP generator swap takes under 45 seconds through automated bus synchronization.',
    historyEvent: '14:07 UTC: Microgrid bus synchronization routine executed with zero harmonic jitter.'
  },
  {
    id: 'bharati-fuel',
    name: 'Insulated Sub-Surface Fuel Gantry',
    systemId: 'resources',
    status: 'operational',
    position: [-10, 0.8, -6],
    size: [6.0, 2.0, 5.0],
    color: '#38BDF8',
    category: 'Fuel Reserve Farm',
    description: 'Vacuum-insulated Arctic fuel storage tanks connected via the elevated service pipe gantry running along the station facade.',
    temperature: -12.0,
    powerDrawKw: 12,
    healthScore: 94,
    keySensors: [
      { label: 'Bulk ATF Reserve', value: '11,200 L (72%)', status: 'normal' },
      { label: 'Pipe Gantry Trace', value: '+4.0°C (Active)', status: 'normal' },
      { label: 'Daily Consumption', value: '380 L / day', status: 'normal' },
      { label: 'Autonomy Window', value: '29 Days Safe', status: 'normal' }
    ],
    predictionNote: 'Fuel stock ample for 29 days; replenishment vessel voyage tracking on schedule.',
    whatIfScenario: 'Sub-zero pipe valve freeze prevented by triple-redundant trace heating circuits.',
    historyEvent: '09:15 UTC: Pipeline pressure drop test verified 100% seal integrity.'
  },
  {
    id: 'bharati-comms',
    name: 'C-Band Satellite Radome & Earth Station',
    systemId: 'communication',
    status: 'operational',
    position: [12, 3.5, 4],
    size: [4.0, 5.0, 4.0],
    color: '#0EA5E9',
    category: 'ISRO Ground Station',
    description: 'Dedicated high-speed remote sensing satellite downlink antenna radome tracking Indian earth observation satellites (Cartosat, Oceansat, RISAT).',
    temperature: 19.0,
    powerDrawKw: 28,
    healthScore: 99,
    keySensors: [
      { label: 'ISRO NRSC Link', value: 'Connected (155 Mbps)', status: 'normal' },
      { label: 'Radome Dome Temp', value: '+12°C De-iced', status: 'normal' },
      { label: 'Azimuth Tracking', value: 'High-Precision Lock', status: 'normal' },
      { label: 'Pass Completeness', value: '99.98%', status: 'normal' }
    ],
    predictionNote: 'Next Oceansat-3 polar pass scheduled at 15:42 UTC; 8.8 GB ocean color payload queued.',
    whatIfScenario: 'Ground station failover switches to geostationary C-band backup in 1.2 seconds.',
    historyEvent: '14:32 UTC: Telemetry packet batch synchronized with NRSC Earth Station Shadnagar.'
  }
];

export const INITIAL_LIVE_CONDITIONS: StationLiveConditions = {
  temperatureC: -28.4,
  apparentTempC: -41.2,
  windSpeedKmh: 42.0,
  windDirection: 'ENE (065°)',
  windGustKmh: 58.5,
  barometricPressureHpa: 982.4,
  visibilityKm: 8.4,
  snowCondition: 'Hard-packed firn / Drifting sastrugi',
  uvIndex: 1,
  powerLoadPercent: 82.0,
  powerGenerationKw: 194.5,
  fuelReservePercent: 68.0,
  fuelLiters: 8420,
  fuelBurnDailyLiters: 350,
  fuelDaysRemaining: 24,
  waterReservePercent: 74.0,
  waterLiters: 8880,
  waterDailyLiters: 280,
  waterDaysRemaining: 31,
  crewPresent: 18,
  crewMaxCapacity: 25,
  indoorAvgTempC: 21.2,
  indoorCo2Ppm: 480,
  communicationStatus: 'CONNECTED',
  satelliteLinkQualityPercent: 84,
  mainlandDataTransmittedGb: 1.84,
  bufferedOfflineEvents: 0,
  lastSyncUtc: '14:32 UTC'
};

export const STATION_SYSTEMS_LIST: SystemCardData[] = [
  {
    id: 'generator',
    name: 'GENERATOR & POWER',
    subtitle: 'Primary Diesel Microgrid',
    status: 'operational',
    metricLabel: 'Load',
    metricValue: '82%',
    subMetric: '194.5 kW / 240 kW Capacity',
    iconName: 'Zap',
    route: '/systems/generator',
    details: {
      primaryStat: 'Generator 01 active (112 kW), G2 warm standby (82 kW load split test)',
      secondaryStat: 'Battery Energy Storage System (BESS) at 94% buffer',
      efficiency: '93.8% thermal efficiency with exhaust heat recovery',
      alertCount: 1,
      summary: 'Continuous 3-phase microgrid powering all life support, laboratories, and outdoor heating tape.'
    }
  },
  {
    id: 'infrastructure',
    name: 'INFRASTRUCTURE',
    subtitle: 'Structural & HVAC Health',
    status: 'stable',
    metricLabel: 'Health',
    metricValue: '94%',
    subMetric: '1 Advisory Pending',
    iconName: 'Building',
    route: '/systems/infrastructure',
    details: {
      primaryStat: 'Elevated foundation jacks clear of snowdrift accumulation',
      secondaryStat: 'Heating circuits A & B fully nominal; glycol balance optimal',
      efficiency: 'Permafrost anchor tilt < 0.08° within seismic safety envelope',
      alertCount: 1,
      summary: 'Monitors foundation pillar strain gauges, aerodynamic snow scouring, and trace heating.'
    }
  },
  {
    id: 'environment',
    name: 'ENVIRONMENT',
    subtitle: 'Schirmacher Meteorological',
    status: 'operational',
    metricLabel: 'Outdoor',
    metricValue: '-28°C',
    subMetric: 'Wind 42 km/h · Wind chill -41°C',
    iconName: 'CloudSnow',
    route: '/systems/environment',
    details: {
      primaryStat: 'Barometric pressure 982 hPa steady; low-pressure cell 180 km North',
      secondaryStat: 'Visibility 8.4 km; no blizzard warning currently active',
      efficiency: 'Solar radiation 14 W/m² (approaching polar twilight)',
      alertCount: 0,
      summary: 'Automatic weather station telemetry recording temperature, blizzards, and wind dynamics.'
    }
  },
  {
    id: 'resources',
    name: 'FUEL & RESOURCES',
    subtitle: 'Polar Hydrocarbon Reserves',
    status: 'operational',
    metricLabel: 'Fuel',
    metricValue: '68%',
    subMetric: '8,420 L · 24 Days Remaining',
    iconName: 'Fuel',
    route: '/systems/resources',
    details: {
      primaryStat: 'Daily consumption 350 L/day across power and heating',
      secondaryStat: 'Resupply vessel MV Vasiliy Golovnin scheduled in 21 days',
      efficiency: 'Dual heated storage tanks with ultrasonic level integrity',
      alertCount: 0,
      summary: 'Tracks Arctic Jet A-1 diesel stocks, transfer manifolds, and replenishment schedules.'
    }
  },
  {
    id: 'water',
    name: 'WATER & FOOD',
    subtitle: 'Life Sustainment Stores',
    status: 'operational',
    metricLabel: 'Water',
    metricValue: '74%',
    subMetric: '8,880 L · 31 Days Remaining',
    iconName: 'Droplet',
    route: '/systems/water',
    details: {
      primaryStat: 'Daily potable production 280 L from thermal snow melting pit',
      secondaryStat: 'Food rations for 18 crew verified for 16 days (bottleneck factor)',
      efficiency: '99.8% filtration purity with reverse osmosis and UV sanitation',
      alertCount: 0,
      summary: 'Snow melter boiler operations, greywater recycling, and freeze-dried pantry stock.'
    }
  },
  {
    id: 'communication',
    name: 'COMMUNICATION',
    subtitle: 'Mainland India Uplink',
    status: 'operational',
    metricLabel: 'Link',
    metricValue: 'Connected',
    subMetric: 'GSAT-14 · 84% Signal Quality',
    iconName: 'Radio',
    route: '/systems/communication',
    details: {
      primaryStat: 'Telemetry synced with NCAOR Goa at 14:32 UTC',
      secondaryStat: 'Data transmitted today: 1.84 GB; buffered: 0 MB',
      efficiency: 'Round-trip satellite latency: 540 ms (geostationary link)',
      alertCount: 0,
      summary: 'Mainland communication bridge to Indian Antarctic Program headquarters and ISRO.'
    }
  },
  {
    id: 'crew',
    name: 'CREW & HABITATION',
    subtitle: 'Expedition Life Support',
    status: 'operational',
    metricLabel: 'Crew',
    metricValue: '18',
    subMetric: 'Indoor 21.2°C · CO₂ 480 ppm',
    iconName: 'Users',
    route: '/systems/crew',
    details: {
      primaryStat: '18 wintering scientists and logistics personnel on duty',
      secondaryStat: 'Medical dispensary fully operational; oxygen supply at 100%',
      efficiency: 'Air quality index: Optimal; positive pressure maintained',
      alertCount: 0,
      summary: 'Habitat environmental controls, crew duty roster, and expedition biometric status.'
    }
  },
  {
    id: 'research',
    name: 'RESEARCH LAB',
    subtitle: 'Polar Scientific Experiments',
    status: 'operational',
    metricLabel: 'Active',
    metricValue: '4',
    subMetric: 'Lab 20°C · 42 kW Power Draw',
    iconName: 'FlaskConical',
    route: '/systems/research',
    details: {
      primaryStat: '4 active experiments: Lidar, Magnetometer, Ice-core mass spec, VLF',
      secondaryStat: 'Cleanroom integrity Class 6; sample freezers at -80°C',
      efficiency: 'Scientific data yield: 99.4% packet completion',
      alertCount: 0,
      summary: 'Coordinates real-time geophysical sensors, ionospheric probes, and glaciological logs.'
    }
  },
  {
    id: 'maintenance',
    name: 'MAINTENANCE',
    subtitle: 'Reliability & Servicing',
    status: 'attention',
    metricLabel: 'Required',
    metricValue: '2 Pending',
    subMetric: 'Generator 02 (Med) · Pump 02 (Low)',
    iconName: 'Wrench',
    route: '/systems/maintenance',
    details: {
      primaryStat: 'Generator 02 coolant regulator valve check (window: 6-9 days)',
      secondaryStat: 'Water pump 02 harmonic vibration inspection (window: 14 days)',
      efficiency: 'Station Mean Time Between Failures (MTBF): 1,480 hours',
      alertCount: 2,
      summary: 'Predictive maintenance tracker preventing cold-weather mechanical breakdowns.'
    }
  }
];

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'ALT-1042',
    title: 'Generator 02 Coolant Temperature Elevated',
    severity: 'medium',
    systemId: 'generator',
    timestamp: '14:09 UTC',
    location: 'Generator Room / Module G2',
    description: 'Coolant temperature on standby diesel unit reached 64°C during periodic load shedding test. Normal threshold is 55°C.',
    acknowledged: false,
    valueRecorded: '64.2°C',
    threshold: '55.0°C',
    recommendedAction: 'Inspect secondary bypass thermostat valve and verify coolant fluid viscosity.'
  },
  {
    id: 'ALT-1039',
    title: 'Water Circulation Pump 02 Harmonic Vibration',
    severity: 'low',
    systemId: 'infrastructure',
    timestamp: '09:42 UTC',
    location: 'Infrastructure Bay / Hydronics Gantry',
    description: 'Accelerometer on pump motor registered 3.2 mm/s RMS vibration, exceeding baseline of 2.1 mm/s.',
    acknowledged: true,
    valueRecorded: '3.2 mm/s',
    threshold: '2.5 mm/s',
    recommendedAction: 'Check motor mount torque and bearing lubrication during scheduled 100-hour inspection.'
  },
  {
    id: 'ALT-1031',
    title: 'Mainland Telemetry Latency Spike',
    severity: 'low',
    systemId: 'communication',
    timestamp: '06:18 UTC',
    location: 'Satellite Radome C-Band Transceiver',
    description: 'Temporary ionospheric scintillation caused uplink packet retransmission rate to rise to 4.2%.',
    acknowledged: true,
    valueRecorded: '4.2% Packet Loss',
    threshold: '2.0%',
    recommendedAction: 'No mechanical action required. Atmospheric clearance restored automatically.'
  }
];

export const MOCK_BLACK_BOX_EVENTS: BlackBoxEvent[] = [
  {
    id: 'BBX-8821',
    timestamp: '2026-10-02T14:12:00Z',
    timeFormatted: '14:12 UTC',
    category: 'Equipment',
    title: 'Backup Power G1/G2 Synchronization Complete',
    severity: 'info',
    sourceSystem: 'Power Microgrid',
    telemetrySnapshot: {
      load: '82%',
      voltage: '415.2 V',
      fuelRate: '14.6 L/h'
    },
    reconstruction: {
      triggerEvent: 'Load shift command initiated following G2 thermal warning test.',
      rootCause: 'Operator-commanded microgrid equalization routine.',
      telemetryImpact: 'Load transferred smoothly from G2 to primary G1 without voltage drop.',
      systemAction: 'Bus tie contactor closed within 12 ms; zero blackout interruption.',
      currentSafetyMargin: 'Microgrid reserve capacity at 128 kW headroom.'
    }
  },
  {
    id: 'BBX-8820',
    timestamp: '2026-10-02T14:11:00Z',
    timeFormatted: '14:11 UTC',
    category: 'Warning',
    title: 'Generator 02 Thermal Warning Triggered',
    severity: 'medium',
    sourceSystem: 'Generator Room',
    telemetrySnapshot: {
      temp: '64.2°C',
      load: '48 kW',
      fuelRate: '12.8 L/h'
    },
    reconstruction: {
      triggerEvent: 'Coolant sensor T-102 crossed warning threshold of 55°C.',
      rootCause: 'Slight thermal lag in secondary radiator glycol circulation loop.',
      telemetryImpact: 'Temperature plateaued at 64.2°C without runaway condition.',
      systemAction: 'Supervisory PLC issued advisory alert ALT-1042 to mission control console.',
      currentSafetyMargin: 'Thermal safety cutoff is 85°C; 21°C buffer retained.'
    }
  },
  {
    id: 'BBX-8819',
    timestamp: '2026-10-02T14:09:00Z',
    timeFormatted: '14:09 UTC',
    category: 'Environmental',
    title: 'Abnormal Surface Temperature Gradient Detected',
    severity: 'info',
    sourceSystem: 'Meteorological Mast',
    telemetrySnapshot: {
      temp: '-28.4°C',
      fuelRate: '14.2 L/h'
    },
    reconstruction: {
      triggerEvent: 'External air temperature plummeted 3.8°C in 7 minutes.',
      rootCause: 'Katabatic wind descent from the polar polar plateau.',
      telemetryImpact: 'Surface wind accelerated from 28 km/h to 42 km/h.',
      systemAction: 'Automated trace heating engaged across external fuel delivery conduits.',
      currentSafetyMargin: 'Freeze prevention active; pipe temperature held at +4°C.'
    }
  },
  {
    id: 'BBX-8818',
    timestamp: '2026-10-02T14:07:00Z',
    timeFormatted: '14:07 UTC',
    category: 'Operator Action',
    title: 'Generator Load Balance Test Commenced',
    severity: 'info',
    sourceSystem: 'Power Microgrid',
    operator: 'Chief Engineer K. Sharma',
    telemetrySnapshot: {
      load: '78%',
      voltage: '414.8 V'
    },
    reconstruction: {
      triggerEvent: 'Manual initiation of weekly dual-generator parity routine.',
      rootCause: 'Standard polar operating protocol SOP-PWR-04.',
      telemetryImpact: 'Bus load divided 50/50 across G1 and G2.',
      systemAction: 'Frequency locked at 50.04 Hz.',
      currentSafetyMargin: 'Both units operating within rated thermal curves.'
    }
  },
  {
    id: 'BBX-8817',
    timestamp: '2026-10-02T14:04:00Z',
    timeFormatted: '14:04 UTC',
    category: 'Equipment',
    title: 'Heating Demand Increased Automatically',
    severity: 'info',
    sourceSystem: 'Infrastructure HVAC',
    telemetrySnapshot: {
      temp: '21.2°C Indoor',
      load: '74%'
    },
    reconstruction: {
      triggerEvent: 'Perimeter thermostat signaled increased thermal delta.',
      rootCause: 'External wind chill factor dropped below -40°C.',
      telemetryImpact: 'Glycol circulation flow increased by 18% in perimeter ducting.',
      systemAction: 'Waste heat exchanger valve opened to 75% aperture.',
      currentSafetyMargin: 'Indoor temperature held precisely at 21.2°C.'
    }
  },
  {
    id: 'BBX-8816',
    timestamp: '2026-10-02T14:02:00Z',
    timeFormatted: '14:02 UTC',
    category: 'Environmental',
    title: 'Rapid Temperature Drop Inbound',
    severity: 'info',
    sourceSystem: 'Schirmacher AWS Station',
    telemetrySnapshot: {
      temp: '-24.6°C → -28.4°C'
    },
    reconstruction: {
      triggerEvent: 'Cold front boundary arrived over Queen Maud Land.',
      rootCause: 'Circumpolar vortex oscillation shift.',
      telemetryImpact: 'Barometric pressure dipped 1.4 hPa.',
      systemAction: 'Station logged environmental transition in autonomous black box log.',
      currentSafetyMargin: 'Full storm protection envelopes intact.'
    }
  }
];

export const MOCK_PREDICTIONS: PredictionData[] = [
  {
    systemId: 'generator',
    systemName: 'Generator 02 Standby Unit',
    healthScore: 76,
    riskLevel: 'MEDIUM',
    timeframe: '6–9 Days',
    forecastSummary: 'Thermal sensor drift on bypass thermostat indicates wear. Component replacement recommended before anticipated winter blizzard cycle.',
    forecastPoints: [
      { timestamp: 'Day 1', predictedValue: 76, baselineValue: 90 },
      { timestamp: 'Day 3', predictedValue: 74, baselineValue: 90 },
      { timestamp: 'Day 5', predictedValue: 71, baselineValue: 90 },
      { timestamp: 'Day 7', predictedValue: 66, baselineValue: 90 },
      { timestamp: 'Day 9', predictedValue: 58, baselineValue: 90 }
    ],
    keyFactors: [
      'Bypass valve thermal hysterics increasing by 0.4°C per duty cycle',
      'Oil particulate sensor normal (no metal wear detected)',
      'Recommended action: Swap valve during scheduled daylight calm on Day 6'
    ]
  },
  {
    systemId: 'fuel',
    systemName: 'Hydrocarbon Fuel Depletion Model',
    healthScore: 84,
    riskLevel: 'LOW',
    timeframe: '24 Days Remaining',
    depletionDays: 24,
    forecastSummary: 'Current 350 L/day burn rate gives 24 days buffer. Resupply vessel arrival in 21 days allows 3 days safety margin.',
    forecastPoints: [
      { timestamp: 'Now', predictedValue: 68, baselineValue: 68 },
      { timestamp: '+5d', predictedValue: 56, baselineValue: 56 },
      { timestamp: '+10d', predictedValue: 44, baselineValue: 44 },
      { timestamp: '+15d', predictedValue: 31, baselineValue: 31 },
      { timestamp: '+20d', predictedValue: 19, baselineValue: 19 },
      { timestamp: '+24d', predictedValue: 0, baselineValue: 0 }
    ],
    keyFactors: [
      'Baseline daily burn: 350 L (93 kW average load)',
      'Estimated consumption increases to 395 L/day if ambient drops below -35°C',
      'Safe operational cutoff: 1,500 L emergency strategic reserve'
    ]
  },
  {
    systemId: 'water',
    systemName: 'Snow Melter Potable Output',
    healthScore: 92,
    riskLevel: 'LOW',
    timeframe: '31 Days Capacity',
    forecastSummary: 'Snow harvest efficiency remains above 94%. Potable water stores comfortable for 31 days with 18 crew at 15.5 L/person/day.',
    forecastPoints: [
      { timestamp: 'Now', predictedValue: 74, baselineValue: 74 },
      { timestamp: '+7d', predictedValue: 76, baselineValue: 74 },
      { timestamp: '+14d', predictedValue: 75, baselineValue: 74 },
      { timestamp: '+21d', predictedValue: 73, baselineValue: 74 },
      { timestamp: '+28d', predictedValue: 71, baselineValue: 74 }
    ],
    keyFactors: [
      'Waste heat recovery supplies 88% of snow melting calories without extra fuel',
      'Greywater recycling handles laundry and sanitation loops',
      'Water reserve buffer: 8,880 L stored in dual insulated interior tanks'
    ]
  }
];

export const MOCK_MISSION_RESOURCES: MissionResource[] = [
  {
    id: 'fuel',
    name: 'Arctic Jet A-1 Fuel',
    currentStock: '8,420 Liters (68%)',
    ratePerDay: '350 L / day',
    daysRemaining: 24,
    targetResupplyDays: 21,
    status: 'ADEQUATE',
    notes: '3-day safety buffer before MV Vasiliy Golovnin arrives at ice shelf gantry.'
  },
  {
    id: 'food',
    name: 'Expedition Rations & Freeze-Dried Stock',
    currentStock: '288 Ration Packs',
    ratePerDay: '18 Packs / day',
    daysRemaining: 16,
    targetResupplyDays: 21,
    status: 'BOTTLENECK',
    notes: 'Primary operational constraint! Rations reach reserve limit 5 days before scheduled ship arrival. Non-perishable staple reserves (dal, rice, flour) available as emergency fallback.'
  },
  {
    id: 'water',
    name: 'Potable Drinking & Utility Water',
    currentStock: '8,880 Liters (74%)',
    ratePerDay: '280 L / day',
    daysRemaining: 31,
    targetResupplyDays: 21,
    status: 'OPTIMAL',
    notes: 'Snow melter maintains steady replenish rate using generator waste heat.'
  },
  {
    id: 'power',
    name: 'Microgrid Generation Capacity',
    currentStock: '240 kW Total Installed',
    ratePerDay: '82% Avg Load Factor',
    daysRemaining: 180,
    targetResupplyDays: 21,
    status: 'OPTIMAL',
    notes: 'Dual Kirloskar generators with N+1 redundancy and 100 kWh battery storage.'
  },
  {
    id: 'medical',
    name: 'Medical & Oxygen Life Support',
    currentStock: 'Full Trauma Kit + 12 O₂ Cylinders',
    ratePerDay: 'Nominal Standby',
    daysRemaining: 90,
    targetResupplyDays: 21,
    status: 'OPTIMAL',
    notes: 'Station physician confirms crew vitals nominal and zero medical evacuations required.'
  },
  {
    id: 'spares',
    name: 'Critical Mechanical Spares (Tier 1)',
    currentStock: '14 Critical Assemblies',
    ratePerDay: '2 Maintenance Items Active',
    daysRemaining: 45,
    targetResupplyDays: 21,
    status: 'ADEQUATE',
    notes: 'Coolant regulator valve and water pump impeller in stock in Module 04 store.'
  }
];
