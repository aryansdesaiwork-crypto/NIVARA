import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import { Habitation3D, HabitationSimState } from './Habitation3D';
import {
  Users,
  Thermometer,
  Activity,
  Heart,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Moon,
  Sun,
  Wind,
  Layers,
  Clock
} from 'lucide-react';

export const HabitationInterior: React.FC = () => {
  const {
    stationLocation,
    simCrewCount,
    setSimCrewCount,
    simCo2Ppm,
    simDailyWater
  } = useStation();

  const [activeTab, setActiveTab] = useState<'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('LIVE');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('quarters');
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [ventilationPurge, setVentilationPurge] = useState<boolean>(false);
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');

  const simState: HabitationSimState = {
    crewCount: simCrewCount,
    co2Ppm: simCo2Ppm + (simCrewCount > 20 ? (simCrewCount - 18) * 35 : 0) - (ventilationPurge ? 180 : 0),
    indoorTempC: nightMode ? 19.4 : 21.2,
    nightMode,
    ventilationPurgeActive: ventilationPurge
  };

  const triggerCo2Purge = () => {
    setVentilationPurge(true);
    setTimeout(() => {
      setVentilationPurge(false);
    }, 4500);
  };

  return (
    <div className="space-y-4">
      {/* 1. HERO 3D DIGITAL-TWIN SIMULATION ROOM */}
      <div className="relative">
        <Habitation3D
          simulationState={simState}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={(id) => setSelectedEquipment(id)}
        />

        {/* History Scrubber */}
        {activeTab === 'HISTORY' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-[#0B1220]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1 px-2 font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              TIMELINE:
            </span>
            {(['12:00', '14:00', '16:00', '18:00'] as const).map((ts) => (
              <button
                key={ts}
                onClick={() => setHistoryTimestamp(ts)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  historyTimestamp === ts
                    ? 'bg-indigo-500 text-white shadow-sm'
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
            onClick={() => setNightMode(!nightMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
              nightMode
                ? 'bg-indigo-900/80 border-indigo-500 text-indigo-200'
                : 'bg-white border-[#D5E1F2] text-slate-700 hover:bg-slate-100'
            }`}
          >
            {nightMode ? <Moon className="w-3.5 h-3.5 text-indigo-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>{nightMode ? 'NIGHT CIRCADIAN' : 'DAY MODE'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATION')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>LIFE SUPPORT SIMULATOR</span>
          </button>
        </div>
      </div>

      {/* 3. SIMULATION CONTROLS DOCK */}
      {activeTab === 'SIMULATION' && (
        <div className="bg-[#0B1220] text-white rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-300 font-bold">
                  CREW HEADCOUNT & METABOLIC LOAD SIMULATOR
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Polar Station Occupancy & CO2 Scrubber Dynamics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate arrival of visiting scientists or winter-over team size. Notice how CO2 ppm and atmospheric scrubbing requirements surge.
              </p>
            </div>

            <button
              onClick={triggerCo2Purge}
              disabled={ventilationPurge}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                ventilationPurge
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>{ventilationPurge ? 'PURGING AIR...' : 'TRIGGER CO2 EMERGENCY PURGE'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crew Slider */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  STATION EXPEDITION HEADCOUNT
                </span>
                <span className="text-base font-bold text-indigo-300 tabular-nums">
                  {simCrewCount} Personnel
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="36"
                value={simCrewCount}
                onChange={(e) => setSimCrewCount(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>10 (Skeleton Crew)</span>
                <span>18 (Winter Base)</span>
                <span>36 (Summer Peak)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono border-t border-white/5">
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Indoor CO2</span>
                  <div className={`font-bold mt-0.5 ${simState.co2Ppm > 700 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {simState.co2Ppm} ppm
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Indoor Temp</span>
                  <div className="font-bold text-sky-400 mt-0.5">{simState.indoorTempC.toFixed(1)}°C</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Water Draw</span>
                  <div className="font-bold text-white mt-0.5">{simCrewCount * 120} L/d</div>
                </div>
              </div>
            </div>

            {/* Cross-system dependencies */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                LIFE SUPPORT PROPAGATION CHAIN
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-indigo-200 border border-indigo-500/20">
                  <span>HEADCOUNT ({simCrewCount} CREW)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>RESPIRATION ({simState.co2Ppm} PPM CO2)</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-sky-200 border border-sky-500/20">
                  <span>METABOLIC WATER DEMAND</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{simCrewCount * 120} LITERS / DAY HARVEST</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-emerald-200 border border-emerald-500/20">
                  <span>AIR RECIRCULATION STATUS</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{ventilationPurge ? 'EMERGENCY PURGE ENGAGED' : 'NOMINAL POSITIVE PRESSURE'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. OVERVIEW TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Station Personnel</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{simCrewCount} On Duty</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">100% Health Status</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Cabin Temperature</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{simState.indoorTempC.toFixed(1)}°C</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Hydronic Radiators Active</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">CO2 Molecular Sieve</div>
          <div className={`text-xl font-bold mt-1 ${simState.co2Ppm > 700 ? 'text-amber-500' : 'text-[#17213A]'}`}>
            {simState.co2Ppm} ppm
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Threshold: &lt; 1,000 ppm</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Medical Bay Readiness</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">Tier-1 Ready</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Telemedicine Link Up</div>
        </div>
      </div>
    </div>
  );
};
