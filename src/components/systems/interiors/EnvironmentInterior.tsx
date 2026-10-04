import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import {
  Environment3D,
  EnvironmentSimState
} from './Environment3D';
import {
  CloudSnow,
  Wind,
  Thermometer,
  Radio,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export const EnvironmentInterior: React.FC = () => {
  const {
    stationLocation,
    simAmbientTemp,
    setSimAmbientTemp,
    simWeatherMode,
    setSimWeatherMode,
    simHeatingDemand,
    simGeneratorLoad,
    simHourlyFuelBurn
  } = useStation();

  const [activeTab, setActiveTab] = useState<'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('LIVE');
  const [selectedSensor, setSelectedSensor] = useState<string | null>('wind-sensor');
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');

  const windSpeedKmh = simWeatherMode === 'blizzard' ? 96 : simWeatherMode === 'storm' ? 68 : 42;
  const visibilityKm = simWeatherMode === 'blizzard' ? 0.8 : simWeatherMode === 'storm' ? 3.4 : 8.4;
  const apparentTempC = Math.round(simAmbientTemp - windSpeedKmh * 0.32);
  const snowAccumMmDay = simWeatherMode === 'blizzard' ? 8.4 : simWeatherMode === 'storm' ? 3.2 : 0.4;

  const simState: EnvironmentSimState = {
    weatherMode: simWeatherMode,
    windSpeedKmh,
    apparentTempC,
    airTempC: simAmbientTemp,
    visibilityKm,
    snowAccumMmDay,
    selectedSensor
  };

  const handleSelectWeatherScenario = (mode: 'normal' | 'storm' | 'blizzard') => {
    setSimWeatherMode(mode);
    if (mode === 'normal') {
      setSimAmbientTemp(-28);
    } else if (mode === 'storm') {
      setSimAmbientTemp(-34);
    } else if (mode === 'blizzard') {
      setSimAmbientTemp(-42);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. HERO 3D OUTDOOR SENSOR NETWORK SIMULATION */}
      <div className="relative">
        <Environment3D
          simulationState={simState}
          selectedEquipment={selectedSensor}
          onSelectEquipment={(id) => setSelectedSensor(id)}
        />

        {/* History Scrubber */}
        {activeTab === 'HISTORY' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-[#0B1220]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1 px-2 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              TIMELINE:
            </span>
            {(['12:00', '14:00', '16:00', '18:00'] as const).map((ts) => (
              <button
                key={ts}
                onClick={() => {
                  setHistoryTimestamp(ts);
                  if (ts === '12:00') handleSelectWeatherScenario('normal');
                  if (ts === '14:00') handleSelectWeatherScenario('normal');
                  if (ts === '16:00') handleSelectWeatherScenario('storm');
                  if (ts === '18:00') handleSelectWeatherScenario('blizzard');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  historyTimestamp === ts
                    ? 'bg-[#617FF2] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {ts} UTC
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. MODE BAR: LIVE | FLOW | SIMULATION | HISTORY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F8FE] p-3 rounded-2xl border border-[#D5E1F2]">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#D5E1F2] w-fit shadow-xs">
          {(['LIVE', 'FLOW', 'SIMULATION', 'HISTORY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#0B1220] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#17213A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SIMULATION')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#617FF2] hover:bg-[#506ee0] text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>WEATHER SIMULATOR</span>
          </button>
          <button
            onClick={() => handleSelectWeatherScenario('normal')}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#D5E1F2] text-slate-700 text-xs font-mono transition-colors cursor-pointer"
            title="Reset to Normal Conditions"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. SIMULATION CONTROLS DOCK */}
      {activeTab === 'SIMULATION' && (
        <div className="bg-[#0B1220] text-white rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">
                  METEOROLOGICAL STRESS SIMULATOR
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Polar Storm & Blizzard Simulation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch weather intensity. Observe how 3D snowfall, katabatic wind velocity, visibility, and thermal strain directly propagate to station heating and power demand.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weather Mode Selector Buttons */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="text-xs font-mono text-slate-300 font-bold">
                SELECT POLAR WEATHER INTENSITY:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'NORMAL', wind: '42 km/h', temp: '-28°C' },
                  { id: 'storm', label: 'STRONG WIND', wind: '68 km/h', temp: '-34°C' },
                  { id: 'blizzard', label: 'BLIZZARD', wind: '96 km/h', temp: '-42°C' }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleSelectWeatherScenario(w.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      simWeatherMode === w.id
                        ? 'bg-[#617FF2] text-white border-white/30 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{w.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{w.wind}</div>
                    <div className="text-[10px] text-cyan-300 font-mono">{w.temp}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono border-t border-white/5">
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Wind Velocity</span>
                  <div className="font-bold text-cyan-400 mt-0.5">{windSpeedKmh} km/h</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Wind Chill</span>
                  <div className="font-bold text-rose-400 mt-0.5">{apparentTempC}°C</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Visibility</span>
                  <div className="font-bold text-white mt-0.5">{visibilityKm} km</div>
                </div>
              </div>
            </div>

            {/* Causal Chain Visualization */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                CONSEQUENCE PROPAGATION TO STATION
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-sky-200 border border-sky-500/20">
                  <span>WIND ({windSpeedKmh} KM/H) + CHILL ({apparentTempC}°C)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>HEATING DEMAND ({simHeatingDemand}%)</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-amber-200 border border-amber-500/20">
                  <span>HEATING DEMAND</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>GENERATOR LOAD ({simGeneratorLoad}%)</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-rose-200 border border-rose-500/20">
                  <span>EXTERIOR OPERATION RISK</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold">
                    {simWeatherMode === 'blizzard'
                      ? 'CRITICAL (EVA FORBIDDEN)'
                      : simWeatherMode === 'storm'
                      ? 'CAUTION (TETHER REQUIRED)'
                      : 'NORMAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. OVERVIEW TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Ambient Temp</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{simAmbientTemp}°C</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Chill: {apparentTempC}°C</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Wind Velocity</div>
          <div className="text-xl font-bold text-cyan-600 mt-1">{windSpeedKmh} km/h</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ENE 065° Katabatic</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Snow Accumulation</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{snowAccumMmDay} mm/day</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Scour clearance 1.8m</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Sensor Network</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">100% Lock</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Edge gateway synced</div>
        </div>
      </div>
    </div>
  );
};
