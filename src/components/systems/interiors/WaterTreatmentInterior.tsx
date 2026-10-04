import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import {
  WaterTreatment3D,
  WaterSimState
} from './WaterTreatment3D';
import {
  Droplet,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Users
} from 'lucide-react';

export const WaterTreatmentInterior: React.FC = () => {
  const {
    stationLocation,
    simCrewCount,
    setSimCrewCount,
    simDailyWater,
    simWaterDaysRemaining
  } = useStation();

  const [activeTab, setActiveTab] = useState<'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('LIVE');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('storage-tank');
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');

  const simState: WaterSimState = {
    crewCount: simCrewCount,
    dailyWaterHarvestLiters: 280,
    dailyConsumptionLiters: simDailyWater,
    daysRemaining: simWaterDaysRemaining,
    storageLiters: 8880,
    storagePercent: 74,
    pumpRunning: true
  };

  return (
    <div className="space-y-4">
      {/* 1. HERO 3D WATER TREATMENT SIMULATION */}
      <div className="relative">
        <WaterTreatment3D
          simulationState={simState}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={(id) => setSelectedEquipment(id)}
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
                  if (ts === '12:00') setSimCrewCount(18);
                  if (ts === '14:00') setSimCrewCount(18);
                  if (ts === '16:00') setSimCrewCount(25);
                  if (ts === '18:00') setSimCrewCount(30);
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
            <span>WATER DEMAND CONTROLS</span>
          </button>
          <button
            onClick={() => setSimCrewCount(18)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#D5E1F2] text-slate-700 text-xs font-mono transition-colors cursor-pointer"
            title="Reset Crew"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. SIMULATION CONTROLS DOCK */}
      {activeTab === 'SIMULATION' && (
        <div className="bg-white text-[#17213A] rounded-3xl p-6 border border-[#D5E1F2] shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5E1F2] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-600 font-bold">
                  POTABLE LIFE SUSTAINMENT SIMULATOR
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#17213A]">
                Crew Consumption & Reserve Depletion Model
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust expedition personnel headcount. Water flow accelerates, daily draw increases, and tank autonomy days adjust in real-time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-[#F4F8FE] rounded-2xl border border-[#D5E1F2] space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-600" />
                  EXPEDITION CREW COUNT
                </span>
                <span className="text-base font-bold text-cyan-700 tabular-nums">
                  {simCrewCount} Personnel
                </span>
              </div>

              <input
                type="range"
                min="14"
                max="35"
                value={simCrewCount}
                onChange={(e) => setSimCrewCount(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-300 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>14 (Skeleton Staff)</span>
                <span>18 (Wintering Base)</span>
                <span>35 (Summer Surge)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono border-t border-[#D5E1F2]">
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]">
                  <span className="text-[10px] text-slate-500">Daily Demand</span>
                  <div className="font-bold text-cyan-600 mt-0.5">{simDailyWater} L/d</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]">
                  <span className="text-[10px] text-slate-500">Melt Harvest</span>
                  <div className="font-bold text-[#17213A] mt-0.5">280 L/d</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]">
                  <span className="text-[10px] text-slate-500">Autonomy</span>
                  <div className="font-bold text-emerald-600 mt-0.5">{simWaterDaysRemaining} Days</div>
                </div>
              </div>
            </div>

            {/* Causal Chain */}
            <div className="p-4 bg-[#F4F8FE] rounded-2xl border border-[#D5E1F2] space-y-3 font-mono text-xs">
              <div className="text-slate-700 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-600" />
                WATER & HABITATION COUPLING
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl flex items-center justify-between text-cyan-800 border border-[#D5E1F2]">
                  <span>CREW COUNT ({simCrewCount})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>WATER DRAW ({simDailyWater} L/DAY)</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl flex items-center justify-between text-sky-800 border border-[#D5E1F2]">
                  <span>DRAW RATE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>PUMP CYCLE (RUNNING 4.2 BAR)</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl flex items-center justify-between border border-[#D5E1F2]">
                  <span className="text-slate-600">RESERVE STATUS</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-emerald-600">
                    {simWaterDaysRemaining} DAYS WATER REMAINING
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
          <div className="text-slate-400 text-[10px] uppercase">Reserve Volume</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">8,880 L (74%)</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Potable buffer nominal</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Daily Harvest</div>
          <div className="text-xl font-bold text-cyan-600 mt-1">280 L / day</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Melt pit heated coil</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">RO Purity</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">99.8% TDS</div>
          <div className="text-[10px] text-purple-600 mt-0.5">UV 254nm active</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Days Reserve</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{simWaterDaysRemaining} Days</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{simCrewCount} Crew on duty</div>
        </div>
      </div>
    </div>
  );
};
