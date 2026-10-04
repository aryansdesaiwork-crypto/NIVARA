import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { STATION_SYSTEMS_LIST } from '../../data/mockData';
import {
  ArrowLeft,
  Zap,
  Building,
  CloudSnow,
  Fuel,
  Droplet,
  Radio,
  Users,
  FlaskConical,
  Wrench,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Gauge,
  Thermometer,
  Eye,
  Compass,
  ArrowRight
} from 'lucide-react';

// Interior Simulations for all 9 Station Systems
import { GeneratorRoomInterior } from './interiors/GeneratorRoomInterior';
import { InfrastructureInterior } from './interiors/InfrastructureInterior';
import { EnvironmentInterior } from './interiors/EnvironmentInterior';
import { FuelFarmInterior } from './interiors/FuelFarmInterior';
import { WaterTreatmentInterior } from './interiors/WaterTreatmentInterior';
import { CommunicationInterior } from './interiors/CommunicationInterior';
import { HabitationInterior } from './interiors/HabitationInterior';
import { ResearchLabInterior } from './interiors/ResearchLabInterior';
import { MaintenanceWorkshopInterior } from './interiors/MaintenanceWorkshopInterior';

interface SystemDetailPageProps {
  systemId: string;
}

export const SystemDetailPage: React.FC<SystemDetailPageProps> = ({ systemId }) => {
  const {
    navigateTo,
    stationLocation,
    liveConditions,
    toggleCommunication
  } = useStation();

  const [viewMode, setViewMode] = useState<'interior' | 'telemetry'>('interior');

  const system = STATION_SYSTEMS_LIST.find((s) => s.id === systemId) || STATION_SYSTEMS_LIST[0];

  // Helper to render the interactive interior for this system
  const renderInteriorSimulation = () => {
    switch (system.id) {
      case 'generator':
        return <GeneratorRoomInterior />;
      case 'infrastructure':
        return <InfrastructureInterior />;
      case 'environment':
        return <EnvironmentInterior />;
      case 'resources':
        return <FuelFarmInterior />;
      case 'water':
        return <WaterTreatmentInterior />;
      case 'communication':
        return <CommunicationInterior />;
      case 'crew':
        return <HabitationInterior />;
      case 'research':
        return <ResearchLabInterior />;
      case 'maintenance':
        return <MaintenanceWorkshopInterior />;
      default:
        return <GeneratorRoomInterior />;
    }
  };

  return (
    <div className="space-y-6 pb-14">
      {/* 1. TOP NAVIGATION & SYSTEM HEADER BAR */}
      <div className="bg-[#F4F8FE] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#D5E1F2] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigateTo('overview')}
              className="group flex items-center gap-1.5 text-xs font-mono font-semibold text-[#617FF2] hover:text-[#506ee0] mb-2.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>← {stationLocation.name.toUpperCase()} / STATION SYSTEMS</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17213A] tracking-tight">
                {system.name}
              </h1>

              <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-white border border-[#D5E1F2]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    system.status === 'attention'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-semibold uppercase tracking-wider text-slate-700">
                  {system.status === 'attention' ? 'ATTENTION REQUIRED' : '● OPERATIONAL'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {system.subtitle} · {stationLocation.name} Station Base ({stationLocation.region})
            </p>
          </div>

          {/* Action and View Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Pill Switcher */}
            <div className="flex items-center p-1 bg-white rounded-xl border border-[#D5E1F2] shadow-xs">
              <button
                onClick={() => setViewMode('interior')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  viewMode === 'interior'
                    ? 'bg-[#0B1220] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#17213A]'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>DIGITAL INTERIOR</span>
              </button>

              <button
                onClick={() => setViewMode('telemetry')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  viewMode === 'telemetry'
                    ? 'bg-[#617FF2] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#17213A]'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-sky-200" />
                <span>TELEMETRY & HARDWARE</span>
              </button>
            </div>

            {/* Quick Link to Predictive & What-If */}
            <button
              onClick={() => navigateTo('intelligence/predictive')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-semibold text-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">VIEW PREDICTION</span>
            </button>

            <button
              onClick={() => navigateTo('intelligence/what-if')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#617FF2] hover:bg-[#506ee0] text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">RUN WHAT-IF</span>
            </button>
          </div>
        </div>

        {/* Quick System Navigation Ribbon (Jump between station rooms in 1 click) */}
        <div className="mt-4 pt-4 border-t border-[#D5E1F2]/70 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-mono text-slate-400 shrink-0 text-[11px] uppercase mr-1">
            Station Systems:
          </span>
          {STATION_SYSTEMS_LIST.map((s) => {
            const isActive = s.id === system.id;
            return (
              <button
                key={s.id}
                onClick={() => navigateTo(s.route)}
                className={`shrink-0 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#617FF2] text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-[#D5E1F2]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    s.status === 'attention' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THE INTERACTIVE INTERIOR / OPERATIONAL SIMULATION LAYER (HERO VIEW) */}
      {viewMode === 'interior' && (
        <section className="space-y-4">
          {/* Render the full interactive 3D digital-twin interior for this station system */}
          <div className="transition-all duration-300">
            {renderInteriorSimulation()}
          </div>
        </section>
      )}

      {/* 3. TELEMETRY & HARDWARE SPECIFICATIONS VIEW (When user switches from Digital Interior to Telemetry Specs) */}
      {viewMode === 'telemetry' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Primary Telemetry Strip */}
          <section className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-500 px-1">
              {system.name} Telemetry & Calibrations
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2]">
                <div className="text-[11px] font-mono uppercase text-slate-400">Primary Telemetry</div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-[#17213A] mt-1">
                  {system.metricValue}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono">{system.subMetric}</div>
              </div>

              <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2]">
                <div className="text-[11px] font-mono uppercase text-slate-400">Operational Health</div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-600 mt-1">
                  {system.details.efficiency}
                </div>
                <div className="text-xs text-slate-600 mt-1">Continuous calibration active</div>
              </div>

              <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2]">
                <div className="text-[11px] font-mono uppercase text-slate-400">Alert Status</div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-[#17213A] mt-1">
                  {system.details.alertCount === 0 ? (
                    <span className="text-emerald-600">0 Active</span>
                  ) : (
                    <span className="text-amber-600">{system.details.alertCount} Advisory</span>
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono">
                  {system.details.alertCount === 0 ? 'All sensors nominal' : 'Review scheduled servicing'}
                </div>
              </div>
            </div>
          </section>

          {/* SYSTEM-SPECIFIC DETAILED HARDWARE & TELEMETRY PANELS */}
          {systemId === 'generator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Generator 01 */}
                <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h3 className="font-bold text-[#17213A]">Generator 01 (Primary Lead)</h3>
                    </div>
                    <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      ONLINE · 1,500 RPM
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                      <div className="text-slate-400">Power Output</div>
                      <div className="text-lg font-bold text-[#17213A]">112.5 kW</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                      <div className="text-slate-400">Exhaust Temp</div>
                      <div className="text-lg font-bold text-[#17213A]">385°C</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                      <div className="text-slate-400">Oil Pressure</div>
                      <div className="text-lg font-bold text-[#17213A]">4.8 bar</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                      <div className="text-slate-400">Fuel Consumption</div>
                      <div className="text-lg font-bold text-[#17213A]">14.2 L/h</div>
                    </div>
                  </div>
                </div>

                {/* Generator 02 */}
                <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <h3 className="font-bold text-[#17213A]">Generator 02 (Secondary Standby)</h3>
                    </div>
                    <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      WARM STANDBY · ADVISORY
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                      <div className="text-slate-400">Power Output</div>
                      <div className="text-lg font-bold text-[#17213A]">82.0 kW (Test)</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                      <div className="text-slate-400">Coolant Temp</div>
                      <div className="text-lg font-bold text-amber-600">64.2°C (Warning)</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                      <div className="text-slate-400">Oil Pressure</div>
                      <div className="text-lg font-bold text-[#17213A]">4.6 bar</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                      <div className="text-slate-400">Fuel Consumption</div>
                      <div className="text-lg font-bold text-[#17213A]">11.5 L/h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 24h Demand Chart & Power Distribution */}
              <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2]">
                <h3 className="font-bold text-[#17213A] mb-2">24-Hour Station Microgrid Demand Profile</h3>
                <div className="h-44 flex items-end gap-2 pt-4 px-2">
                  {[65, 68, 70, 72, 74, 71, 75, 82, 85, 84, 86, 88, 87, 85, 84, 82, 83, 85, 82, 80, 78, 76, 75, 82].map(
                    (val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-[#617FF2] rounded-t-md transition-all hover:bg-sky-400"
                          style={{ height: `${val * 1.5}px` }}
                          title={`Hour ${idx}:00 - Load ${val}%`}
                        />
                        <span className="text-[9px] font-mono text-slate-400">
                          {idx % 4 === 0 ? `${idx}h` : ''}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono mt-3 pt-3 border-t border-[#D5E1F2]">
                  <span>Average Daily Load: 194 kW</span>
                  <span>Peak Recorded: 211 kW</span>
                  <span>Reserve Margin: 45.5 kW</span>
                </div>
              </div>
            </div>
          )}

      {systemId === 'infrastructure' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] space-y-4">
            <h3 className="font-bold text-[#17213A]">Permafrost Foundations & Aerodynamics</h3>
            <div className="space-y-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between">
                <span>Pillar Hydraulic Jacks (134 Stilts)</span>
                <span className="font-mono font-semibold text-emerald-600">Level (Tilt: 0.08°)</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between">
                <span>Aerodynamic Snow Scour Clearance</span>
                <span className="font-mono font-semibold text-emerald-600">1.8 m Vent Gap Clear</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between">
                <span>Structural Strain Gauges</span>
                <span className="font-mono font-semibold text-slate-700">12.4 MPa (Max: 45 MPa)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] space-y-4">
            <h3 className="font-bold text-[#17213A]">Heating & Hydronics Manifold</h3>
            <div className="space-y-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between">
                <span>Glycol Heat Recovery Loop</span>
                <span className="font-mono font-semibold text-emerald-600">68°C Supply / 94% Eff</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                <span>Circulation Pump 02</span>
                <span className="font-mono font-semibold text-amber-600">Vibration: 3.2 mm/s</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between">
                <span>Exterior Trace Heating Conduits</span>
                <span className="font-mono font-semibold text-emerald-600">+4.2°C Anti-Freeze</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {systemId === 'environment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
              <div className="text-[11px] font-mono uppercase text-slate-400">Ambient Temp</div>
              <div className="text-2xl font-bold font-mono text-[#17213A] mt-1">
                {liveConditions.temperatureC}°C
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Wind chill: {liveConditions.apparentTempC}°C</div>
            </div>

            <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
              <div className="text-[11px] font-mono uppercase text-slate-400">Wind Velocity</div>
              <div className="text-2xl font-bold font-mono text-[#17213A] mt-1">
                {liveConditions.windSpeedKmh} km/h
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Gusts to {liveConditions.windGustKmh} km/h</div>
            </div>

            <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
              <div className="text-[11px] font-mono uppercase text-slate-400">Barometer</div>
              <div className="text-2xl font-bold font-mono text-[#17213A] mt-1">
                {liveConditions.barometricPressureHpa} hPa
              </div>
              <div className="text-[11px] text-emerald-600 font-mono">Pressure stable</div>
            </div>

            <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
              <div className="text-[11px] font-mono uppercase text-slate-400">Visibility</div>
              <div className="text-2xl font-bold font-mono text-[#17213A] mt-1">
                {liveConditions.visibilityKm} km
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Clear horizon</div>
            </div>
          </div>

          <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2]">
            <h3 className="font-bold text-[#17213A] mb-2">24-Hour Temperature & Wind Chill Trend</h3>
            <div className="h-40 flex items-center justify-between border-b border-[#D5E1F2] px-2 text-xs font-mono text-slate-500">
              {['-24°C', '-25°C', '-26°C', '-27°C', '-28°C', '-28.4°C'].map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>{t}</span>
                  <span className="text-[10px] text-slate-400">{i * 4}h ago</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Katabatic gravity winds descending from the Antarctic polar ice sheet.
            </p>
          </div>
        </div>
      )}

      {systemId === 'resources' && (
        <div className="space-y-6">
          <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#17213A]">Hydrocarbon Fuel Reserve Status</h3>
                <p className="text-xs text-slate-500">Arctic Aviation Turbine Fuel (ATF) with anti-freeze additive</p>
              </div>
              <div className="text-right font-mono">
                <div className="text-2xl font-extrabold text-[#617FF2]">{liveConditions.fuelLiters} Liters</div>
                <div className="text-xs text-slate-500">68% Capacity</div>
              </div>
            </div>

            {/* Visual Fuel Bar */}
            <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-[#617FF2] to-sky-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${liveConditions.fuelReservePercent}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-2">
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-400">Daily Consumption:</span>
                <div className="text-sm font-bold text-[#17213A]">{liveConditions.fuelBurnDailyLiters} L / day</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-400">Estimated Autonomy:</span>
                <div className="text-sm font-bold text-emerald-600">{liveConditions.fuelDaysRemaining} Days</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-400">Next Resupply Vessel:</span>
                <div className="text-sm font-bold text-[#17213A]">MV Vasiliy Golovnin (ETA 21d)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {systemId === 'communication' && (
        <div className="space-y-6">
          <div className="bg-[#0B1220] text-white rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-sky-400">
                    Mainland Ground Telemetry Link
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  NCAOR Goa & ISRO NRSC Shadnagar Gateway
                </h3>
              </div>

              {/* Interactive Disconnect Simulation Button */}
              <button
                onClick={toggleCommunication}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                  liveConditions.communicationStatus === 'CONNECTED'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {liveConditions.communicationStatus === 'CONNECTED'
                  ? 'Simulate Satellite Outage'
                  : 'Restore Mainland Link'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400">Status</span>
                <div className={`text-base font-bold mt-1 ${liveConditions.communicationStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {liveConditions.communicationStatus}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400">Carrier Signal</span>
                <div className="text-base font-bold mt-1 text-white">
                  {liveConditions.satelliteLinkQualityPercent}% SNR 14.8dB
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400">Data Transmitted</span>
                <div className="text-base font-bold mt-1 text-white">
                  {liveConditions.mainlandDataTransmittedGb} GB
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400">Buffered Events</span>
                <div className="text-base font-bold mt-1 text-sky-300">
                  {liveConditions.bufferedOfflineEvents} Records
                </div>
              </div>
            </div>

            {liveConditions.communicationStatus === 'DISCONNECTED' && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                <strong>Autonomous Station Operation Active:</strong> Edge telemetry is buffered locally in NVMe storage. Automatic retry uplink running every 30 seconds.
              </div>
            )}
          </div>
        </div>
      )}

      {systemId === 'water' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] space-y-3">
            <h3 className="font-bold text-[#17213A]">Snow Melter Plant Telemetry</h3>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between text-xs">
              <span>Melting Pit Heat Source</span>
              <span className="font-mono font-semibold text-emerald-600">Generator Jacket Water Loop</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between text-xs">
              <span>Daily Harvest Output</span>
              <span className="font-mono font-semibold text-[#17213A]">280 Liters / day</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between text-xs">
              <span>Potable Reserve Tanks</span>
              <span className="font-mono font-semibold text-emerald-600">8,880 L (74% capacity)</span>
            </div>
          </div>

          <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] space-y-3">
            <h3 className="font-bold text-[#17213A]">Food Rations & Pantry (Bottleneck)</h3>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong>Primary Resupply Bottleneck:</strong> Expedition rations for 18 crew members have 16 days remaining. Vessel arrival in 21 days requires dry staple consumption mitigation starting Day 14.
            </div>
          </div>
        </div>
      )}

      {systemId === 'crew' && (
        <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2]">
          <h3 className="font-bold text-[#17213A] mb-3">Habitation & Human Biometrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
              <span className="text-slate-400">Wintering Crew</span>
              <div className="text-lg font-bold text-[#17213A]">{liveConditions.crewPresent} Personnel</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
              <span className="text-slate-400">Indoor Temp</span>
              <div className="text-lg font-bold text-emerald-600">{liveConditions.indoorAvgTempC}°C</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
              <span className="text-slate-400">CO2 Concentration</span>
              <div className="text-lg font-bold text-[#17213A]">{liveConditions.indoorCo2Ppm} ppm</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
              <span className="text-slate-400">Medical Dispensary</span>
              <div className="text-lg font-bold text-emerald-600">Clear · Nominal</div>
            </div>
          </div>
        </div>
      )}

      {systemId === 'research' && (
        <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] space-y-4">
          <h3 className="font-bold text-[#17213A]">4 Active Polar Scientific Experiments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
              <div className="font-bold text-[#17213A]">Atmospheric Lidar Observatory</div>
              <div className="text-slate-500 mt-0.5">Continuous aerosol & polar stratospheric cloud mapping.</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
              <div className="font-bold text-[#17213A]">3-Axis Fluxgate Magnetometer</div>
              <div className="text-slate-500 mt-0.5">Space weather & geomagnetic storm recording.</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
              <div className="font-bold text-[#17213A]">Glaciological Ice-Core Mass Spectrometer</div>
              <div className="text-slate-500 mt-0.5">Deep paleoclimate isotope analysis from Queen Maud ice dome.</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#D5E1F2]">
              <div className="font-bold text-[#17213A]">VLF Radio Wave Ionospheric Receiver</div>
              <div className="text-slate-500 mt-0.5">Monitoring global lightning resonance and magnetosphere waves.</div>
            </div>
          </div>
        </div>
      )}

      {systemId === 'maintenance' && (
        <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] space-y-4">
          <h3 className="font-bold text-[#17213A]">Maintenance Queue & Reliability Engineering</h3>
          <div className="space-y-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#17213A]">Generator 02 Standby Coolant Bypass Valve</div>
                <div className="text-slate-500">Service window: 6–9 days · Medium Priority · Spare Part in Bay 4</div>
              </div>
              <span className="font-mono px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-semibold">
                MEDIUM RISK
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#17213A]">Water Circulation Pump 02 Impeller Check</div>
                <div className="text-slate-500">Service window: 14 days · Low Priority · Mechanical torque test</div>
              </div>
              <span className="font-mono px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-semibold">
                LOW RISK
              </span>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
