import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import {
  FuelFarm3D,
  FuelSimState
} from './FuelFarm3D';
import {
  Fuel,
  Flame,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export const FuelFarmInterior: React.FC = () => {
  const {
    stationLocation,
    simDailyFuelBurn,
    simFuelDaysRemaining,
    simHourlyFuelBurn,
    setSimManualGeneratorLoad
  } = useStation();

  const [activeTab, setActiveTab] = useState<'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('LIVE');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('tank-01');
  const [consumptionMode, setConsumptionMode] = useState<'normal' | 'high' | 'extreme'>('normal');
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');

  const daysRemaining = consumptionMode === 'extreme' ? 17 : consumptionMode === 'high' ? 24 : 31;
  const burnRateLhr = consumptionMode === 'extreme' ? 58 : consumptionMode === 'high' ? 46 : 35;

  const simState: FuelSimState = {
    consumptionMode,
    dailyBurnLiters: burnRateLhr * 24,
    daysRemaining,
    activeTank: 'tank1',
    tank1Liters: 8420,
    tank2Liters: 9840,
    tank3Liters: 11400
  };

  const handleSelectConsumption = (mode: 'normal' | 'high' | 'extreme') => {
    setConsumptionMode(mode);
    if (mode === 'normal') {
      setSimManualGeneratorLoad(48);
    } else if (mode === 'high') {
      setSimManualGeneratorLoad(76);
    } else if (mode === 'extreme') {
      setSimManualGeneratorLoad(96);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. HERO 3D FUEL STORAGE FARM SIMULATION */}
      <div className="relative">
        <FuelFarm3D
          simulationState={simState}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={(id) => setSelectedEquipment(id)}
        />

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
                onClick={() => {
                  setHistoryTimestamp(ts);
                  if (ts === '12:00') handleSelectConsumption('normal');
                  if (ts === '14:00') handleSelectConsumption('normal');
                  if (ts === '16:00') handleSelectConsumption('high');
                  if (ts === '18:00') handleSelectConsumption('extreme');
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
            <span>FUEL BURN SIMULATOR</span>
          </button>
          <button
            onClick={() => handleSelectConsumption('normal')}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#D5E1F2] text-slate-700 text-xs font-mono transition-colors cursor-pointer"
            title="Reset Fuel Burn"
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
                  HYDROCARBON CONSUMPTION SIMULATOR
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Fuel Depletion & Supply Autonomy Model
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust station fuel burn intensity. The 3D fuel flow speeds up, tank levels diminish, and autonomy countdown to vessel arrival updates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="text-xs font-mono text-slate-300 font-bold">
                SELECT FUEL BURN RATE:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'NORMAL', rate: '35 L/h', days: '31 Days' },
                  { id: 'high', label: 'HIGH', rate: '46 L/h', days: '24 Days' },
                  { id: 'extreme', label: 'EXTREME', rate: '58 L/h', days: '17 Days' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectConsumption(m.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      consumptionMode === m.id
                        ? 'bg-amber-500 text-slate-950 border-white/30 shadow-lg font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{m.label}</div>
                    <div className="text-[10px] mt-1">{m.rate}</div>
                    <div className="text-[10px] font-mono">{m.days}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono border-t border-white/5">
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Flow Rate</span>
                  <div className="font-bold text-amber-400 mt-0.5">{burnRateLhr} L/h</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Daily Total</span>
                  <div className="font-bold text-white mt-0.5">{burnRateLhr * 24} L/d</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Autonomy</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{daysRemaining} Days</div>
                </div>
              </div>
            </div>

            {/* Causal Chain */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                RESUPPLY VESSEL SAFETY MARGIN
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-amber-200 border border-amber-500/20">
                  <span>BURN ({burnRateLhr} L/H)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>AUTONOMY ({daysRemaining} DAYS REMAINING)</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-sky-200 border border-sky-500/20">
                  <span>VESSEL ETA</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>MV VASILIY GOLOVNIN (21 DAYS)</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between border border-white/10">
                  <span>BUFFER STATUS</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span
                    className={`font-bold ${
                      daysRemaining < 21 ? 'text-rose-400' : daysRemaining <= 24 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {daysRemaining < 21
                      ? 'CRITICAL DEFICIT (-4 DAYS BUFFER)'
                      : daysRemaining <= 24
                      ? 'NARROW BUFFER (+3 DAYS)'
                      : 'SAFE MARGIN (+10 DAYS)'}
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
          <div className="text-slate-400 text-[10px] uppercase">Bulk Jet A-1</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">29,660 L Total</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Across 3 insulated tanks</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Active Tank 01</div>
          <div className="text-xl font-bold text-amber-600 mt-1">8,420 L (68%)</div>
          <div className="text-[10px] text-slate-500 mt-0.5">3.4 bar line pressure</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Burn Rate</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{burnRateLhr} L/h</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{burnRateLhr * 24} L/day</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Resupply Autonomy</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{daysRemaining} Days</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Vessel in 21 days</div>
        </div>
      </div>
    </div>
  );
};
