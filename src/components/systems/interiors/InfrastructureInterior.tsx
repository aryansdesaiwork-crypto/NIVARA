import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import {
  Infrastructure3D,
  InfrastructureSimState,
  InfrastructureFlowFocus
} from './Infrastructure3D';
import { ComponentAnomalyRemediationPanel } from './ComponentAnomalyRemediationPanel';
import {
  Building,
  Thermometer,
  Wind,
  Zap,
  Flame,
  Droplet,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export const InfrastructureInterior: React.FC = () => {
  const {
    stationLocation,
    simAmbientTemp,
    setSimAmbientTemp,
    simHeatingDemand,
    simGeneratorLoad,
    simHourlyFuelBurn,
    simFuelDaysRemaining
  } = useStation();

  const [activeTab, setActiveTab] = useState<'ANOMALY & SOLUTIONS' | 'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('ANOMALY & SOLUTIONS');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('hvac');
  const [flowFocus, setFlowFocus] = useState<InfrastructureFlowFocus>('all');
  const [activeScenario, setActiveScenario] = useState<string>('normal');
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');

  const simState: InfrastructureSimState = {
    ambientTempC: simAmbientTemp,
    heatingLoadPercent: simHeatingDemand,
    hvacRunning: true,
    ventilationFlowCfm: 1840,
    foundationTiltDeg: 0.08,
    selectedObject: selectedEquipment,
    flowFocus
  };

  const handleSelectScenario = (scenario: string) => {
    setActiveScenario(scenario);
    if (scenario === 'normal') {
      setSimAmbientTemp(-28);
    } else if (scenario === 'polar-freeze') {
      setSimAmbientTemp(-44);
    } else if (scenario === 'summer-thaw') {
      setSimAmbientTemp(-18);
    } else if (scenario === 'extreme-blizzard') {
      setSimAmbientTemp(-48);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. HERO 3D PHYSICAL CUTAWAY SIMULATION */}
      <div className="relative">
        <Infrastructure3D
          simulationState={simState}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={(id) => setSelectedEquipment(id)}
          flowFocus={flowFocus}
        />

        {/* In-Canvas Flow Highlighting Controls (When FLOW tab active) */}
        {activeTab === 'FLOW' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#0B1220]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 px-2 font-bold">
              HIGHLIGHT FLOW:
            </span>
            <button
              onClick={() => setFlowFocus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                flowFocus === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ALL FLOWS
            </button>
            <button
              onClick={() => {
                setFlowFocus('heating');
                setSelectedEquipment('heating');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                flowFocus === 'heating'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-300 hover:bg-rose-500/20'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>GLYCOL HEATING LOOP</span>
            </button>
            <button
              onClick={() => {
                setFlowFocus('ventilation');
                setSelectedEquipment('ventilation');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                flowFocus === 'ventilation'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-cyan-300 hover:bg-cyan-500/20'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>VENTILATION AIR</span>
            </button>
            <button
              onClick={() => {
                setFlowFocus('electrical');
                setSelectedEquipment('electrical');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                flowFocus === 'electrical'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>ELECTRICAL TRAY</span>
            </button>
          </div>
        )}

        {/* History Scrubber */}
        {activeTab === 'HISTORY' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-[#0B1220]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1 px-2 font-bold">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              TIMELINE:
            </span>
            {(['12:00', '14:00', '16:00', '18:00'] as const).map((ts) => (
              <button
                key={ts}
                onClick={() => setHistoryTimestamp(ts)}
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

      {/* 2. MODE BAR: ANOMALY & SOLUTIONS | LIVE | FLOW | SIMULATION | HISTORY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F8FE] p-3 rounded-2xl border border-[#D5E1F2]">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#D5E1F2] w-fit shadow-xs">
          {(['ANOMALY & SOLUTIONS', 'LIVE', 'FLOW', 'SIMULATION', 'HISTORY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? tab === 'ANOMALY & SOLUTIONS'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'bg-[#0B1220] text-white shadow-xs'
                  : tab === 'ANOMALY & SOLUTIONS'
                  ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                  : 'text-slate-600 hover:text-[#17213A]'
              }`}
            >
              {tab === 'ANOMALY & SOLUTIONS' && (
                <AlertTriangle className="w-3.5 h-3.5 fill-current animate-pulse text-amber-950" />
              )}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SIMULATION')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#617FF2] hover:bg-[#506ee0] text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>THERMAL SIMULATION CONTROLS</span>
          </button>
          <button
            onClick={() => setSimAmbientTemp(-28)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#D5E1F2] text-slate-700 text-xs font-mono transition-colors cursor-pointer"
            title="Reset Temperature"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. PINPOINT ANOMALY & ACTIONABLE SOLUTIONS CONSOLE */}
      {(activeTab === 'ANOMALY & SOLUTIONS' || activeTab === 'LIVE') && (
        <ComponentAnomalyRemediationPanel />
      )}

      {/* 3. SIMULATION CONTROLS DOCK */}
      {activeTab === 'SIMULATION' && (
        <div className="bg-white text-[#17213A] rounded-3xl p-6 border border-[#D5E1F2] shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5E1F2] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#617FF2] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#617FF2] font-bold">
                  INFRASTRUCTURE THERMAL SIMULATOR
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#17213A]">
                Building Thermal Envelope & Hydronic Heating Load
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust polar outdoor temperature. Observe how building heat loss directly causes heating loop demand, power load, and fuel consumption to surge across the station.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Outdoor Temperature Slider */}
            <div className="p-4 bg-[#F0F5FC] rounded-2xl border border-[#D5E1F2] space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-[#617FF2]" />
                  OUTSIDE ANTARCTIC TEMPERATURE
                </span>
                <span className="text-base font-bold text-[#617FF2] tabular-nums">
                  {simAmbientTemp}°C
                </span>
              </div>

              <input
                type="range"
                min="-50"
                max="-10"
                value={simAmbientTemp}
                onChange={(e) => setSimAmbientTemp(Number(e.target.value))}
                className="w-full accent-[#617FF2] cursor-pointer h-2 bg-slate-200 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-50°C (Polar Deep Freeze)</span>
                <span>-28°C (Baseline)</span>
                <span>-10°C (Polar Summer)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono border-t border-[#D5E1F2]">
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]/60 shadow-xs">
                  <span className="text-[10px] text-slate-500">Heating Load</span>
                  <div className="font-bold text-rose-600 mt-0.5">{simHeatingDemand}%</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]/60 shadow-xs">
                  <span className="text-[10px] text-slate-500">Generator Load</span>
                  <div className="font-bold text-amber-600 mt-0.5">{simGeneratorLoad}%</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]/60 shadow-xs">
                  <span className="text-[10px] text-slate-500">Fuel Burn</span>
                  <div className="font-bold text-[#17213A] mt-0.5">{simHourlyFuelBurn} L/h</div>
                </div>
              </div>
            </div>

            {/* Causal Chain Visualization */}
            <div className="p-4 bg-[#F0F5FC] rounded-2xl border border-[#D5E1F2] space-y-3 font-mono text-xs">
              <div className="text-slate-700 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#617FF2]" />
                STATION CAUSAL PROPAGATION CHAIN
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl flex items-center justify-between text-[#17213A] border border-[#D5E1F2] shadow-xs">
                  <span className="font-semibold text-sky-700">OUTSIDE TEMP ({simAmbientTemp}°C)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-rose-600">HEATING DEMAND ({simHeatingDemand}%)</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl flex items-center justify-between text-[#17213A] border border-[#D5E1F2] shadow-xs">
                  <span className="font-semibold text-rose-600">HEATING DEMAND ({simHeatingDemand}%)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-amber-600">GENERATOR LOAD ({simGeneratorLoad}%)</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl flex items-center justify-between text-[#17213A] border border-[#D5E1F2] shadow-xs">
                  <span className="font-semibold text-amber-600">GENERATOR LOAD</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-emerald-600">FUEL RESERVE ({simFuelDaysRemaining} DAYS AUTONOMY)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Scenarios */}
          <div>
            <div className="text-xs font-mono uppercase text-slate-500 mb-2 font-bold">
              PRESET THERMAL SCENARIOS:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'normal', label: 'Normal Baseline', desc: '-28°C · 64% Heating Load' },
                { id: 'polar-freeze', label: 'Deep Polar Freeze', desc: '-44°C · 88% Heating Load' },
                { id: 'summer-thaw', label: 'Summer Thaw', desc: '-18°C · 50% Heating Load' },
                { id: 'extreme-blizzard', label: 'Extreme Blizzard', desc: '-48°C · Maximum Draw' }
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    activeScenario === sc.id
                      ? 'bg-[#17213A] text-white border-[#17213A] shadow-md'
                      : 'bg-[#F0F5FC] hover:bg-slate-100 text-slate-700 border-[#D5E1F2]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{sc.label}</div>
                  <div className={`text-[10px] mt-1 opacity-90 ${activeScenario === sc.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {sc.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. OVERVIEW TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Foundation Status</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">12 Stilts Level</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Tilt: 0.08° (Nominal)</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">HVAC Air Flow</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">1,840 CFM</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">+22 Pa Positive Press</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Glycol Hydronics</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">68.0°C / 94% Eff</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Trace heating anti-freeze</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Structural Health</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">94% Score</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Zero permafrost heave</div>
        </div>
      </div>
    </div>
  );
};
