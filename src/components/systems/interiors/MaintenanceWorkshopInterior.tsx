import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import { Maintenance3D, MaintenanceSimState } from './Maintenance3D';
import {
  Wrench,
  Activity,
  Layers,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Zap,
  Gauge,
  Flame,
  Truck,
  Clock,
  ArrowRight
} from 'lucide-react';

export const MaintenanceWorkshopInterior: React.FC = () => {
  const { stationLocation } = useStation();

  const [activeTab, setActiveTab] = useState<'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('LIVE');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('groomer');
  const [warmupActive, setWarmupActive] = useState<boolean>(false);
  const [hydraulicPressure, setHydraulicPressure] = useState<number>(210);
  const [blockTemp, setBlockTemp] = useState<number>(18.5);
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');

  const simState: MaintenanceSimState = {
    engineWarmupActive: warmupActive,
    hydraulicPressureBar: hydraulicPressure,
    blockHeaterTempC: blockTemp,
    groomerStatus: warmupActive ? 'warming' : 'ready'
  };

  const triggerEngineWarmup = () => {
    setWarmupActive(true);
    setBlockTemp(48.0);
    setTimeout(() => {
      setWarmupActive(false);
      setBlockTemp(35.0);
    }, 5000);
  };

  return (
    <div className="space-y-4">
      {/* 1. HERO 3D DIGITAL-TWIN SIMULATION ROOM */}
      <div className="relative">
        <Maintenance3D
          simulationState={simState}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={(id) => setSelectedEquipment(id)}
        />

        {/* Dynamic Warmup Banner Notification */}
        {warmupActive && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 max-w-xl w-[90%] px-4 py-2.5 rounded-2xl bg-amber-600/90 backdrop-blur-md text-white border border-amber-400 text-xs font-mono font-bold text-center shadow-2xl z-30 animate-pulse">
            TRACK VEHICLE BLOCK PRE-HEAT: CIRCULATING GLYCOL HEATING FLUID · CABIN BLOWER ACTIVE
          </div>
        )}

        {/* History Scrubber */}
        {activeTab === 'HISTORY' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-[#0B1220]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1 px-2 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              TIMELINE:
            </span>
            {(['12:00', '14:00', '16:00', '18:00'] as const).map((ts) => (
              <button
                key={ts}
                onClick={() => setHistoryTimestamp(ts)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  historyTimestamp === ts
                    ? 'bg-amber-600 text-white shadow-sm'
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>WORKSHOP STRESS SIMULATOR</span>
          </button>
          <button
            onClick={() => {
              setHydraulicPressure(210);
              setBlockTemp(18.5);
              setWarmupActive(false);
            }}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#D5E1F2] text-slate-700 text-xs font-mono transition-colors cursor-pointer"
            title="Reset workshop simulation"
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
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                  HEAVY MACHINERY & HYDRAULIC TEST SIMULATOR
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Extreme-Cold Vehicle Pre-Heat & Hydraulic Manifold Test
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate sub-zero engine warm-up cycle or stress-test hydraulic fluid viscosity under polar operating pressures.
              </p>
            </div>

            <button
              onClick={triggerEngineWarmup}
              disabled={warmupActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                warmupActive
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>{warmupActive ? 'BLOCK PRE-HEATING...' : 'ENGAGE VEHICLE PRE-HEAT'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hydraulic Pressure Slider */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  HYDRAULIC MANIFOLD PRESSURE
                </span>
                <span className="text-base font-bold text-amber-300 tabular-nums">
                  {hydraulicPressure} Bar
                </span>
              </div>

              <input
                type="range"
                min="120"
                max="320"
                step="5"
                value={hydraulicPressure}
                onChange={(e) => setHydraulicPressure(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>120 Bar (Idle)</span>
                <span>210 Bar (Nominal)</span>
                <span>320 Bar (Peak Relief)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono border-t border-white/5">
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Oil Viscosity</span>
                  <div className="font-bold text-emerald-400 mt-0.5">MIL-H-5606</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Relief Valve</span>
                  <div className={`font-bold mt-0.5 ${hydraulicPressure > 280 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {hydraulicPressure > 280 ? 'BYPASS OPEN' : 'SEALED'}
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Motor Current</span>
                  <div className="font-bold text-white mt-0.5">24.2 A</div>
                </div>
              </div>
            </div>

            {/* Maintenance Cross-Dependencies */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                WORKSHOP READINESS PROPAGATION
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-amber-200 border border-amber-500/20">
                  <span>SNOW GROOMER STATUS</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>BLOCK HEATER: {blockTemp.toFixed(1)}°C ({warmupActive ? 'HEATING' : 'READY'})</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-emerald-200 border border-emerald-500/20">
                  <span>OVERHEAD 5-TON CRANE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>LOAD SENSOR: 0.0 KG (CERTIFIED NOMINAL)</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-sky-200 border border-sky-500/20">
                  <span>CRITICAL SPARES INVENTORY</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>146 UNITS LOGGED · ZERO STOCKOUTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. OVERVIEW TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">PistenBully 300</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{warmupActive ? 'Warming Up' : 'Ready'}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Hydraulic Blade Nominal</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Hydraulic Pressure</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{hydraulicPressure} Bar</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Anti-freeze Oil Loop</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Spares Inventory</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">98.4% Stock</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Filter Kits & Seals In-Bay</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Workshop Power Draw</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">18.4 kW</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Three-Phase 400V Feed</div>
        </div>
      </div>
    </div>
  );
};
