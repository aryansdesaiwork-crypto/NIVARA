import React, { useState, useEffect } from 'react';
import { useStation } from '../../../context/StationContext';
import {
  GeneratorRoom3D,
  GeneratorSimulationState,
  FlowFocus
} from './GeneratorRoom3D';
import { ComponentAnomalyRemediationPanel } from './ComponentAnomalyRemediationPanel';
import {
  Zap,
  Activity,
  Flame,
  Gauge,
  Thermometer,
  ShieldAlert,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  BatteryCharging,
  Power,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Droplet
} from 'lucide-react';

export const GeneratorRoomInterior: React.FC = () => {
  const {
    stationLocation,
    simGeneratorLoad,
    setSimManualGeneratorLoad,
    simAmbientTemp,
    setSimAmbientTemp
  } = useStation();

  // Mode: LIVE | FLOW | SIMULATION | HISTORY
  const [activeTab, setActiveTab] = useState<'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('LIVE');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('generator-01');
  const [flowFocus, setFlowFocus] = useState<FlowFocus>('all');
  const [activeScenario, setActiveScenario] = useState<string>('normal');
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');
  const [failureSequenceActive, setFailureSequenceActive] = useState<boolean>(false);
  const [failoverMessage, setFailoverMessage] = useState<string | null>(null);

  // Simulation State controlling the 3D Scene
  const [simState, setSimState] = useState<GeneratorSimulationState>({
    generator1Running: true,
    generator2Running: false,
    generator1Health: 92,
    generator2Health: 76,
    generatorLoad: simGeneratorLoad || 48,
    ambientTempC: simAmbientTemp || -28,
    bessDischarging: false,
    bessSoc: 74,
    flowFocus: 'all'
  });

  // Keep StationContext in sync when user manipulates the 3D room simulation
  useEffect(() => {
    setSimManualGeneratorLoad(simState.generatorLoad);
  }, [simState.generatorLoad, setSimManualGeneratorLoad]);

  // Derived real-time calculations for the HUD
  const loadFrac = simState.generatorLoad / 100;
  const g1Kw = simState.generator1Running
    ? Math.round(240 * loadFrac * (simState.generator2Running ? 0.58 : 1.0))
    : 0;
  const g2Kw = simState.generator2Running
    ? Math.round(240 * loadFrac * (simState.generator1Running ? 0.42 : 1.0))
    : 0;
  const totalKw = g1Kw + g2Kw + (simState.bessDischarging ? 42 : 0);
  const fuelBurnLhr = Math.round(18 + (totalKw / 240) * 36);
  const g1Temp = simState.generator1Running ? Math.round(52 + loadFrac * 26) : 24;
  const g2Temp = simState.generator2Running ? Math.round(50 + (g2Kw / 240) * 30) : 48;

  // 1. TRIGGER GENERATOR FAILURE SIMULATION
  const triggerGeneratorFailure = () => {
    setFailureSequenceActive(true);
    setFailoverMessage('CRITICAL: GENERATOR 01 TRIPPED (OVER-TEMP EXHAUST FAULT)');

    // Step 1: Generator 01 stops immediately
    setSimState((prev) => ({
      ...prev,
      generator1Running: false,
      generator1Health: 44,
      bessDischarging: true // Step 2: BESS immediately arrests frequency drop
    }));

    // Step 3: Within 1.5s, Generator 02 starts up and takes over load
    setTimeout(() => {
      setFailoverMessage('BESS ARRESTS VOLTAGE DROP · SYNCHRONIZING GENERATOR 02 (WARM STANDBY)...');
      setSimState((prev) => ({
        ...prev,
        generator2Running: true,
        generatorLoad: 72
      }));
    }, 1500);

    // Step 4: Full failover nominal
    setTimeout(() => {
      setFailoverMessage('FAILOVER COMPLETE: GENERATOR 02 ONLINE (100% LOAD) · BESS BACK TO BUFFER');
      setSimState((prev) => ({
        ...prev,
        bessDischarging: false
      }));
      setTimeout(() => {
        setFailoverMessage(null);
        setFailureSequenceActive(false);
      }, 3500);
    }, 3800);
  };

  // Reset to nominal normal operation
  const resetNormalOperation = () => {
    setFailureSequenceActive(false);
    setFailoverMessage(null);
    setActiveScenario('normal');
    setSimState({
      generator1Running: true,
      generator2Running: false,
      generator1Health: 92,
      generator2Health: 76,
      generatorLoad: 48,
      ambientTempC: -28,
      bessDischarging: false,
      bessSoc: 74,
      flowFocus: 'all'
    });
    setSimAmbientTemp(-28);
  };

  // Scenarios handler
  const handleSelectScenario = (scenario: string) => {
    setActiveScenario(scenario);
    if (scenario === 'normal') {
      resetNormalOperation();
    } else if (scenario === 'failure') {
      triggerGeneratorFailure();
    } else if (scenario === 'high-load') {
      setSimState((prev) => ({
        ...prev,
        generator1Running: true,
        generator2Running: true,
        generatorLoad: 88,
        bessDischarging: false
      }));
    } else if (scenario === 'extreme-cold') {
      setSimState((prev) => ({
        ...prev,
        generator1Running: true,
        generator2Running: true,
        generatorLoad: 94,
        ambientTempC: -46,
        bessDischarging: false
      }));
      setSimAmbientTemp(-46);
    } else if (scenario === 'fuel-restriction') {
      setSimState((prev) => ({
        ...prev,
        generator1Running: true,
        generator2Running: false,
        generatorLoad: 38,
        bessDischarging: true
      }));
    }
  };

  // History handler
  const handleSelectHistory = (ts: '12:00' | '14:00' | '16:00' | '18:00') => {
    setHistoryTimestamp(ts);
    if (ts === '12:00') {
      setSimState((prev) => ({ ...prev, generator1Running: true, generator2Running: false, generatorLoad: 42 }));
    } else if (ts === '14:00') {
      setSimState((prev) => ({ ...prev, generator1Running: true, generator2Running: false, generatorLoad: 48 }));
    } else if (ts === '16:00') {
      setSimState((prev) => ({ ...prev, generator1Running: true, generator2Running: true, generatorLoad: 82 }));
    } else if (ts === '18:00') {
      setSimState((prev) => ({ ...prev, generator1Running: true, generator2Running: false, generatorLoad: 56 }));
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. HERO 3D DIGITAL-TWIN SIMULATION ROOM (OCCUPIES 75% OF THE SCREEN) */}
      {/* ========================================================================= */}
      <div className="relative">
        <GeneratorRoom3D
          simulationState={simState}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={(id) => setSelectedEquipment(id)}
          flowFocus={flowFocus}
        />

        {/* Dynamic Failover Banner Notification */}
        {failoverMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 max-w-xl w-[90%] px-4 py-2.5 rounded-2xl bg-rose-600/90 backdrop-blur-md text-white border border-rose-400 text-xs font-mono font-bold text-center shadow-2xl z-30 animate-pulse">
            {failoverMessage}
          </div>
        )}

        {/* In-Canvas Flow Highlighting Controls (When FLOW tab active) */}
        {activeTab === 'FLOW' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[#D5E1F2] shadow-xl">
            <span className="text-[10px] font-mono uppercase text-slate-500 px-2 font-bold">
              HIGHLIGHT FLOW:
            </span>
            <button
              onClick={() => setFlowFocus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                flowFocus === 'all'
                  ? 'bg-[#17213A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#17213A] hover:bg-slate-100'
              }`}
            >
              ALL FLOWS
            </button>
            <button
              onClick={() => {
                setFlowFocus('fuel');
                setSelectedEquipment('fuel-system');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                flowFocus === 'fuel'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>FUEL FLOW (JET A-1)</span>
            </button>
            <button
              onClick={() => {
                setFlowFocus('cooling');
                setSelectedEquipment('cooling-system');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                flowFocus === 'cooling'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-cyan-700 hover:bg-cyan-50'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>COOLANT LOOP</span>
            </button>
            <button
              onClick={() => {
                setFlowFocus('power');
                setSelectedEquipment('power-bus');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                flowFocus === 'power'
                  ? 'bg-[#617FF2] text-white shadow-sm'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>ELECTRICITY BUS</span>
            </button>
          </div>
        )}

        {/* In-Canvas History Timeline Scrubber (When HISTORY tab active) */}
        {activeTab === 'HISTORY' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-white/95 backdrop-blur-md rounded-2xl border border-[#D5E1F2] shadow-xl">
            <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1 px-2 font-bold">
              <Clock className="w-3.5 h-3.5 text-[#617FF2]" />
              TIMELINE:
            </span>
            {(['12:00', '14:00', '16:00', '18:00'] as const).map((ts) => (
              <button
                key={ts}
                onClick={() => handleSelectHistory(ts)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  historyTimestamp === ts
                    ? 'bg-[#617FF2] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#17213A] hover:bg-slate-100'
                }`}
              >
                {ts} UTC
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MODE BAR: LIVE | FLOW | SIMULATION | HISTORY */}
      {/* ========================================================================= */}
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

        {/* Obvious Button to Trigger Simulation Controls */}
        <div className="flex items-center gap-2">
          {activeTab !== 'SIMULATION' ? (
            <button
              onClick={() => setActiveTab('SIMULATION')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#617FF2] hover:bg-[#506ee0] text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>ACTIVATE SIMULATION CONTROLS</span>
            </button>
          ) : (
            <button
              onClick={triggerGeneratorFailure}
              disabled={failureSequenceActive}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>SIMULATE GENERATOR FAILURE</span>
            </button>
          )}

          <button
            onClick={resetNormalOperation}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#D5E1F2] text-slate-700 text-xs font-mono transition-colors cursor-pointer"
            title="Reset to Normal Conditions"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pinpoint Anomaly & Actionable Solutions Console */}
      {activeTab === 'LIVE' && <ComponentAnomalyRemediationPanel />}

      {/* ========================================================================= */}
      {/* 3. SIMULATION CONTROLS DOCK (When SIMULATION mode is active) */}
      {/* ========================================================================= */}
      {activeTab === 'SIMULATION' && (
        <div className="bg-white text-[#17213A] rounded-3xl p-6 border border-[#D5E1F2] shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5E1F2] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#617FF2] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#617FF2] font-bold">
                  INTERACTIVE CAUSAL SIMULATION
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#17213A]">
                Generator Room Stress & Failure Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust physical load and thermal inputs. The 3D scene, fan rotations, particle flow rates, and station metrics immediately respond.
              </p>
            </div>

            <button
              onClick={triggerGeneratorFailure}
              disabled={failureSequenceActive}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>SIMULATE GENERATOR FAILURE</span>
            </button>
          </div>

          {/* Operational Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slider 1: Generator Load (0% to 100%) */}
            <div className="p-4 bg-[#F4F8FE] rounded-2xl border border-[#D5E1F2] space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#617FF2]" />
                  GENERATOR LOAD
                </span>
                <span className="text-base font-bold text-[#17213A] tabular-nums">
                  {simState.generatorLoad}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={simState.generatorLoad}
                onChange={(e) =>
                  setSimState((prev) => ({ ...prev, generatorLoad: Number(e.target.value) }))
                }
                className="w-full accent-[#617FF2] cursor-pointer h-2 bg-slate-300 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0% (Idle / BESS)</span>
                <span>50% (Nominal)</span>
                <span>100% (Maximum Surge)</span>
              </div>

              {/* Dynamic feedback readouts */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono border-t border-[#D5E1F2]">
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]">
                  <span className="text-[10px] text-slate-500">Power</span>
                  <div className="font-bold text-[#17213A] mt-0.5">{totalKw} kW</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]">
                  <span className="text-[10px] text-slate-500">Exhaust Temp</span>
                  <div className="font-bold text-amber-600 mt-0.5">{g1Temp}°C</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#D5E1F2]">
                  <span className="text-[10px] text-slate-500">Fuel Flow</span>
                  <div className="font-bold text-sky-600 mt-0.5">{fuelBurnLhr} L/h</div>
                </div>
              </div>
            </div>

            {/* Slider 2: Antarctic Ambient Temperature (-50°C to 0°C) */}
            <div className="p-4 bg-[#F4F8FE] rounded-2xl border border-[#D5E1F2] space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-sky-600" />
                  ANTARCTIC AMBIENT TEMPERATURE
                </span>
                <span className="text-base font-bold text-sky-700 tabular-nums">
                  {simState.ambientTempC}°C
                </span>
              </div>

              <input
                type="range"
                min="-50"
                max="0"
                value={simState.ambientTempC}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSimState((prev) => ({
                    ...prev,
                    ambientTempC: val,
                    // Causal chain: Extreme cold increases heating demand and generator load
                    generatorLoad: Math.min(100, Math.round(48 + Math.max(0, -20 - val) * 1.5))
                  }));
                  setSimAmbientTemp(val);
                }}
                className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-300 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-50°C (Polar Blizzard)</span>
                <span>-28°C (Baseline)</span>
                <span>0°C (Summer Thaw)</span>
              </div>

              <div className="p-2.5 bg-[#EAF2FC] rounded-xl text-[11px] font-mono text-slate-700 border border-[#D5E1F2]">
                <strong>Thermal Causal Coupling:</strong> Lower ambient temps increase building envelope loss → hydronic heat exchangers demand higher jacket water heat → generator governor increases RPM & load.
              </div>
            </div>
          </div>

          {/* Preset Emergency Scenarios */}
          <div>
            <div className="text-xs font-mono uppercase text-slate-500 mb-2 font-bold">
              PRESET OPERATIONAL SCENARIOS:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'normal', label: 'Normal Operation', desc: 'G1 lead (48%), G2 standby' },
                { id: 'failure', label: 'Generator Failure', desc: 'G1 trip → BESS → G2 sync' },
                { id: 'high-load', label: 'High Station Load', desc: '88% load split across both' },
                { id: 'extreme-cold', label: 'Extreme Cold (-46°C)', desc: 'Heavy heating thermal draw' },
                { id: 'fuel-restriction', label: 'Fuel Restriction', desc: 'Pressure drop load shed' }
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    activeScenario === sc.id
                      ? 'bg-[#17213A] text-white border-transparent shadow-md'
                      : 'bg-[#F4F8FE] hover:bg-[#EAF2FC] text-slate-700 border-[#D5E1F2]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{sc.label}</div>
                  <div className={`text-[10px] mt-1 ${activeScenario === sc.id ? 'text-slate-300' : 'text-slate-500'}`}>{sc.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COMPACT OVERVIEW METRICS STRIP (SECONDARY TO 3D HERO) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2] shadow-xs">
          <div className="text-slate-400 text-[10px] uppercase">Active Microgrid</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{totalKw} kW</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">415V · 50.04 Hz</div>
        </div>

        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2] shadow-xs">
          <div className="text-slate-400 text-[10px] uppercase">Fuel Burn Rate</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{fuelBurnLhr} L/h</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{fuelBurnLhr * 24} L/day</div>
        </div>

        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2] shadow-xs">
          <div className="text-slate-400 text-[10px] uppercase">BESS Battery Buffer</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{simState.bessSoc}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {simState.bessDischarging ? 'Discharging 42 kW' : 'Standby Armed'}
          </div>
        </div>

        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2] shadow-xs">
          <div className="text-slate-400 text-[10px] uppercase">Heat Recovery</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">94.2%</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">68.5°C Hydronics</div>
        </div>
      </div>
    </div>
  );
};
