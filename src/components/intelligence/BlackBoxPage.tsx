import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { MOCK_BLACK_BOX_EVENTS } from '../../data/mockData';
import { BlackBoxEvent } from '../../types';
import {
  History,
  AlertTriangle,
  Zap,
  Activity,
  User,
  Radio,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Filter,
  FileText
} from 'lucide-react';

export const BlackBoxPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [inspectedEvent, setInspectedEvent] = useState<BlackBoxEvent | null>(
    MOCK_BLACK_BOX_EVENTS[1]
  );

  const filterOptions = [
    'All',
    'Warning',
    'Equipment',
    'Operator Action',
    'Environmental',
    'Communication'
  ];

  const filteredEvents = MOCK_BLACK_BOX_EVENTS.filter((e) => {
    if (selectedFilter === 'All') return true;
    return e.category === selectedFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0B1220] text-white rounded-2xl p-6 border border-white/10 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <History className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
            AUTONOMOUS FLIGHT-RECORDER GRADE ARCHIVE
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          STATION BLACK BOX
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Operational history & incident reconstruction. High-frequency immutable circular buffer logging physical telemetry, operator interventions, and microgrid transitions.
        </p>

        {/* Filter Pills / Segmented Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap mt-6 pt-4 border-t border-white/10">
          <span className="text-xs font-mono text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedFilter(opt)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedFilter === opt
                  ? 'bg-[#617FF2] text-white font-bold shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chronological Event Timeline */}
        <div className="lg:col-span-6 bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] space-y-4">
          <div className="flex items-center justify-between border-b border-[#D5E1F2] pb-2">
            <h3 className="font-bold text-[#17213A] text-sm font-mono uppercase">
              Incident Chronology ({filteredEvents.length} Events)
            </h3>
            <span className="text-xs font-mono text-slate-400">Click to Reconstruct</span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((evt) => {
              const isInspected = inspectedEvent?.id === evt.id;
              const isWarning = evt.severity === 'medium' || evt.category === 'Warning';

              return (
                <div
                  key={evt.id}
                  onClick={() => setInspectedEvent(evt)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all ${
                    isInspected
                      ? 'bg-white border-[#617FF2] shadow-md ring-2 ring-[#617FF2]/20'
                      : 'bg-white/70 border-[#D5E1F2] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isWarning ? 'bg-amber-500 animate-pulse' : 'bg-[#617FF2]'
                        }`}
                      />
                      <span className="font-mono font-bold text-xs text-[#17213A]">
                        {evt.timeFormatted}
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {evt.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{evt.sourceSystem}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#17213A] leading-snug">
                    {evt.title}
                  </h4>

                  {evt.operator && (
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Operator: {evt.operator}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-500">
                    {evt.telemetrySnapshot.temp && <span>Temp: {evt.telemetrySnapshot.temp}</span>}
                    {evt.telemetrySnapshot.load && <span>Load: {evt.telemetrySnapshot.load}</span>}
                    {evt.telemetrySnapshot.voltage && <span>Volt: {evt.telemetrySnapshot.voltage}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Incident Reconstruction Panel */}
        <div className="lg:col-span-6 bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#D5E1F2] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-[#17213A] text-sm uppercase font-mono">
                  Incident Reconstruction & Causality
                </h3>
              </div>
              <span className="text-xs font-mono text-[#617FF2] font-semibold">
                ID: {inspectedEvent?.id}
              </span>
            </div>

            {inspectedEvent?.reconstruction ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-[#D5E1F2]">
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                    1. Trigger Event
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#17213A] mt-1">
                    {inspectedEvent.reconstruction.triggerEvent}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#D5E1F2]">
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                    2. Physical Root Cause
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    {inspectedEvent.reconstruction.rootCause}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#D5E1F2]">
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                    3. Telemetry Impact
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 mt-1 font-mono">
                    {inspectedEvent.reconstruction.telemetryImpact}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/40">
                  <div className="text-[11px] font-mono uppercase text-emerald-800 font-semibold">
                    4. Automated System Mitigation
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-900 mt-1">
                    {inspectedEvent.reconstruction.systemAction}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#D5E1F2] flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-500">
                    Safety Margin Status
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    {inspectedEvent.reconstruction.currentSafetyMargin}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                Select an event from the timeline to inspect full forensic reconstruction.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#D5E1F2] flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Checksum: SHA-256 Verified</span>
            <span>Immutable Polar Record</span>
          </div>
        </div>
      </div>
    </div>
  );
};
