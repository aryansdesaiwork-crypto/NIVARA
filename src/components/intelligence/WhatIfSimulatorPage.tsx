import React from 'react';
import { useStation } from '../../context/StationContext';
import {
  Sliders,
  RotateCcw,
  Thermometer,
  Wind,
  Zap,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  ArrowDown,
  Sparkles,
  Ship,
  Power
} from 'lucide-react';

export const WhatIfSimulatorPage: React.FC = () => {
  const {
    whatIfParams,
    whatIfResult,
    updateWhatIfParams,
    resetWhatIfParams,
    navigateTo
  } = useStation();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-[#617FF2]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#617FF2] font-semibold">
              PHYSICS & STRESS TEST ENGINE
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#17213A] tracking-tight">
            WHAT-IF SIMULATOR
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Explore possible station scenarios. Model how polar cold fronts, generator loss, and resupply vessel delays ripple through the microgrid and fuel reserves.
          </p>
        </div>

        <button
          onClick={resetWhatIfParams}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-semibold text-slate-700 transition-colors w-fit shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset to Nominal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Sliders & Controls */}
        <div className="lg:col-span-6 bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] space-y-6">
          <div className="flex items-center justify-between border-b border-[#D5E1F2] pb-3">
            <h3 className="font-bold text-[#17213A] text-base">Environmental & Operational Inputs</h3>
            <span className="text-xs font-mono text-slate-400">Live Solvers Active</span>
          </div>

          {/* 1. Ambient Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-sky-500" />
                <span>Ambient Air Temperature</span>
              </span>
              <span className="font-mono font-bold text-base text-[#17213A]">
                {whatIfParams.ambientTempC}°C
              </span>
            </div>
            <input
              type="range"
              min="-55"
              max="-15"
              step="1"
              value={whatIfParams.ambientTempC}
              onChange={(e) => updateWhatIfParams({ ambientTempC: Number(e.target.value) })}
              className="w-full accent-[#617FF2] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>-15°C (Summer High)</span>
              <span className="font-semibold text-[#617FF2]">-28°C (Baseline)</span>
              <span>-55°C (Polar Deep Freeze)</span>
            </div>
          </div>

          {/* 2. Wind Severity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-500" />
                <span>Katabatic Wind Velocity</span>
              </span>
              <span className="font-mono font-bold text-base text-[#17213A]">
                {whatIfParams.windSeverityKmh} km/h
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="130"
              step="5"
              value={whatIfParams.windSeverityKmh}
              onChange={(e) => updateWhatIfParams({ windSeverityKmh: Number(e.target.value) })}
              className="w-full accent-[#617FF2] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>20 km/h (Calm)</span>
              <span className="font-semibold text-[#617FF2]">42 km/h (Current)</span>
              <span>130 km/h (Hurricane Blizzard)</span>
            </div>
          </div>

          {/* 3. Resupply Delay Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-indigo-500" />
                <span>Resupply Vessel Transit Delay</span>
              </span>
              <span className="font-mono font-bold text-base text-[#17213A]">
                +{whatIfParams.resupplyDelayDays} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={whatIfParams.resupplyDelayDays}
              onChange={(e) => updateWhatIfParams({ resupplyDelayDays: Number(e.target.value) })}
              className="w-full accent-[#617FF2] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0 Days (On Schedule Day 21)</span>
              <span>+10 Days (Sea Ice Pack)</span>
              <span>+25 Days (Major Delay)</span>
            </div>
          </div>

          {/* 4. Toggles: Generator Loss & Blizzard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() =>
                updateWhatIfParams({ generator2Offline: !whatIfParams.generator2Offline })
              }
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                whatIfParams.generator2Offline
                  ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/20'
                  : 'bg-white border-[#D5E1F2] text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Generator 02 Outage</span>
                <Power className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-[11px] text-slate-500">
                {whatIfParams.generator2Offline ? 'G2 Offline (Single G1 load)' : 'G2 Available (Dual standby)'}
              </div>
            </button>

            <button
              onClick={() =>
                updateWhatIfParams({ blizzardActive: !whatIfParams.blizzardActive })
              }
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                whatIfParams.blizzardActive
                  ? 'bg-sky-50 border-sky-300 text-sky-900 ring-2 ring-sky-400/20'
                  : 'bg-white border-[#D5E1F2] text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Zero-Visibility Blizzard</span>
                <Wind className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-[11px] text-slate-500">
                {whatIfParams.blizzardActive ? 'Active Polar Whiteout' : 'Clear Infiltration'}
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Calculated Results & Causal Chain Graph */}
        <div className="lg:col-span-6 space-y-6">
          {/* Simulation Outcome Card */}
          <div className="bg-[#0B1220] text-white rounded-2xl p-6 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  DYNAMIC SIMULATION RESULT
                </span>
                <h3 className="text-xl font-bold tracking-tight mt-0.5">
                  Microgrid & Survival Impact
                </h3>
              </div>
              <span
                className={`text-xs font-mono px-3 py-1 rounded-full font-bold ${
                  whatIfResult.missionSafetyMargin === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : whatIfResult.missionSafetyMargin === 'DEGRADED'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                ● {whatIfResult.missionSafetyMargin} MARGIN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-6">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-slate-400">Heating Surge</div>
                <div className="text-lg font-bold text-sky-300 mt-1">
                  +{whatIfResult.heatingDemandDeltaPct}%
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-slate-400">Power Demand</div>
                <div className="text-lg font-bold text-white mt-1">
                  +{whatIfResult.powerDemandDeltaPct}%
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-slate-400">Generator Load</div>
                <div className={`text-lg font-bold mt-1 ${whatIfResult.generatorLoadPct > 90 ? 'text-rose-400' : 'text-white'}`}>
                  {whatIfResult.generatorLoadPct}%
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-slate-400">Fuel Burn</div>
                <div className="text-lg font-bold text-white mt-1">
                  {whatIfResult.dailyFuelBurnLiters} <span className="text-[10px] text-slate-400">L/d</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Predicted Fuel Buffer</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {whatIfResult.fuelDaysRemaining} Days Autonomy
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Identified Bottleneck</div>
                <div className="text-xs font-bold text-amber-300 font-mono mt-0.5">
                  {whatIfResult.criticalBottleNeck}
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL CAUSAL CHAIN (as specifically required in Section 23!) */}
          <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2]">
            <h4 className="text-xs font-mono uppercase text-slate-500 font-semibold mb-3">
              Thermodynamic Causal Chain Analysis
            </h4>

            <div className="space-y-2">
              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">1. TEMPERATURE EXTREME</span>
                <span className="font-mono font-bold text-sky-600">{whatIfParams.ambientTempC}°C</span>
              </div>

              <div className="flex justify-center text-[#617FF2]">
                <ArrowDown className="w-4 h-4" />
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">2. HEATING DEMAND DELTA</span>
                <span className="font-mono font-bold text-[#617FF2]">+{whatIfResult.heatingDemandDeltaPct}%</span>
              </div>

              <div className="flex justify-center text-[#617FF2]">
                <ArrowDown className="w-4 h-4" />
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">3. POWER CONSUMPTION SURGE</span>
                <span className="font-mono font-bold text-[#617FF2]">+{whatIfResult.powerDemandDeltaPct}%</span>
              </div>

              <div className="flex justify-center text-[#617FF2]">
                <ArrowDown className="w-4 h-4" />
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">4. GENERATOR LOAD CAPACITY</span>
                <span className={`font-mono font-bold ${whatIfResult.generatorLoadPct > 90 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {whatIfResult.generatorLoadPct}%
                </span>
              </div>

              <div className="flex justify-center text-[#617FF2]">
                <ArrowDown className="w-4 h-4" />
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D5E1F2] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">5. FUEL DEPLETION ACCELERATION</span>
                <span className="font-mono font-bold text-amber-600">
                  {whatIfResult.dailyFuelBurnLiters} L/day ({whatIfResult.fuelDaysRemaining}d remaining)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
