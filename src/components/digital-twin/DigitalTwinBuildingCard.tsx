import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import {
  ArrowRight,
  Activity,
  Sparkles,
  Sliders,
  History,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye
} from 'lucide-react';

export const DigitalTwinBuildingCard: React.FC = () => {
  const { selectedBuilding, selectBuilding, navigateTo } = useStation();
  const [activeTab, setActiveTab] = useState<'LIVE' | 'PREDICT' | 'WHAT-IF' | 'HISTORY'>('LIVE');

  if (!selectedBuilding) return null;

  const isWarning = selectedBuilding.status === 'attention';

  return (
    <div className="bg-[#F4F8FE] rounded-2xl sm:rounded-3xl border border-[#D5E1F2] p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden">
      {/* Background soft ambient highlight */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#617FF2]/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isWarning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#617FF2]">
              {selectedBuilding.category}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Module Node</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#17213A] tracking-tight">
            {selectedBuilding.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            {selectedBuilding.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigateTo(`/systems/${selectedBuilding.systemId}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#617FF2] text-white text-xs font-semibold hover:bg-[#506ee0] transition-colors shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-200" />
            <span>Enter Digital Interior</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectBuilding(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            title="Dismiss selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connected Architecture Tabs: LIVE | PREDICT | WHAT-IF | HISTORY */}
      <div className="flex items-center gap-1 p-1 bg-[#EAF2FC] rounded-xl mb-4 border border-[#D5E1F2]/60 w-fit">
        <button
          onClick={() => setActiveTab('LIVE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'LIVE'
              ? 'bg-white text-[#17213A] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#617FF2]" />
          <span>LIVE</span>
        </button>
        <button
          onClick={() => setActiveTab('PREDICT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'PREDICT'
              ? 'bg-white text-[#17213A] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>PREDICT</span>
        </button>
        <button
          onClick={() => setActiveTab('WHAT-IF')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'WHAT-IF'
              ? 'bg-white text-[#17213A] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-sky-500" />
          <span>WHAT-IF</span>
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-white text-[#17213A] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5 text-amber-500" />
          <span>HISTORY</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'LIVE' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 border border-[#D5E1F2]/80">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Operating Temp</span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#17213A] mt-0.5">
              {selectedBuilding.temperature}°C
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Thermal envelope OK</span>
          </div>

          <div className="bg-white rounded-xl p-3 border border-[#D5E1F2]/80">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Power Draw</span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#17213A] mt-0.5">
              {selectedBuilding.powerDrawKw} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <span className="text-[10px] text-slate-500">Connected to Microgrid G1</span>
          </div>

          <div className="bg-white rounded-xl p-3 border border-[#D5E1F2]/80">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Equipment Health</span>
            <div className="text-xl font-bold font-mono tabular-nums text-[#17213A] mt-0.5">
              {selectedBuilding.healthScore}%
            </div>
            <span className="text-[10px] text-blue-600 font-medium">Diagnostic nominal</span>
          </div>

          <div className="bg-white rounded-xl p-3 border border-[#D5E1F2]/80">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Primary Sensor</span>
            <div className="text-sm font-semibold font-mono text-[#17213A] mt-1 truncate">
              {selectedBuilding.keySensors[0]?.label}: {selectedBuilding.keySensors[0]?.value}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Live polling: 5s</span>
          </div>
        </div>
      )}

      {activeTab === 'PREDICT' && (
        <div className="bg-white rounded-xl p-4 border border-[#D5E1F2]/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[#17213A]">7-Day Predictive Horizon</h4>
              <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                AI Inference
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
              {selectedBuilding.predictionNote}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => navigateTo('/intelligence/predictive')}
                className="text-xs font-semibold text-[#617FF2] hover:underline flex items-center gap-1"
              >
                <span>Open Full Predictive Intelligence Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'WHAT-IF' && (
        <div className="bg-white rounded-xl p-4 border border-[#D5E1F2]/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0 mt-0.5">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[#17213A]">Scenario Sensitivity</h4>
              <span className="text-[10px] font-mono uppercase bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                Dynamic Physics Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
              {selectedBuilding.whatIfScenario}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => navigateTo('/intelligence/what-if')}
                className="text-xs font-semibold text-[#617FF2] hover:underline flex items-center gap-1"
              >
                <span>Launch Interactive What-If Simulator</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-xl p-4 border border-[#D5E1F2]/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0 mt-0.5">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[#17213A]">Recent Black Box Record</h4>
              <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Station Black Box
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed font-mono">
              {selectedBuilding.historyEvent}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => navigateTo('/intelligence/black-box')}
                className="text-xs font-semibold text-[#617FF2] hover:underline flex items-center gap-1"
              >
                <span>Inspect Black Box Incident Reconstruction</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
