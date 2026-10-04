import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import {
  Communication3D,
  CommSimState
} from './Communication3D';
import {
  Radio,
  Wifi,
  WifiOff,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const CommunicationInterior: React.FC = () => {
  const {
    stationLocation,
    liveConditions,
    toggleCommunication
  } = useStation();

  const [activeTab, setActiveTab] = useState<'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('LIVE');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('antenna-dish');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');

  const isConnected = liveConditions.communicationStatus === 'CONNECTED';

  const simState: CommSimState = {
    isConnected,
    signalQualityPercent: isConnected ? 84 : 0,
    bufferedEvents: isConnected ? 0 : 127,
    isSyncing,
    dataRateMbps: isConnected ? 12.4 : 0.0
  };

  const handleToggleLink = () => {
    if (!isConnected) {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        toggleCommunication();
      }, 1600);
    } else {
      toggleCommunication();
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. HERO 3D SATELLITE & SERVER ROOM SIMULATION */}
      <div className="relative">
        <Communication3D
          simulationState={simState}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={(id) => setSelectedEquipment(id)}
        />

        {/* History Scrubber */}
        {activeTab === 'HISTORY' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-[#0B1220]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1 px-2 font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
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
            onClick={handleToggleLink}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer ${
              isConnected
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isSyncing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>SYNCING BUFFERED EVENTS...</span>
              </>
            ) : isConnected ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span>SIMULATE SATELLITE OUTAGE</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>RESTORE MAINLAND LINK</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. SIMULATION CONTROLS DOCK */}
      {activeTab === 'SIMULATION' && (
        <div className="bg-[#0B1220] text-white rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
                  AUTONOMOUS EDGE & SATELLITE SIMULATOR
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Mainland Telemetry Severance & Edge Failover
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate geostationary satellite link severance. Watch how the 3D data beam ceases, the server racks enter autonomous NVMe buffering mode, and resynchronize upon restoration.
              </p>
            </div>

            <button
              onClick={handleToggleLink}
              disabled={isSyncing}
              className={`px-4 py-2.5 rounded-xl text-white text-xs font-mono font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2 shrink-0 ${
                isConnected ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isConnected ? 'TRIGGER DISCONNECTION' : 'RESTORE & SYNC (127 EVENTS)'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-slate-300 font-bold">LINK STATE & BEAM STATUS:</div>
              <div className="p-3 bg-black/40 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">GSAT-14 Carrier</span>
                  <span className={`font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isConnected ? '● LOCKED (84% SNR)' : 'X UNLOCKED / NO CARRIER'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Throughput</span>
                  <span className="font-bold text-white">{isConnected ? '12.4 Mbps Ku-Band' : '0.0 Mbps'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Edge Storage Mode</span>
                  <span className="font-bold text-amber-300">
                    {isConnected ? 'STREAMING REAL-TIME' : 'LOCAL NVMe CACHE (127 RECORDS)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                TELEMETRY RE-SYNC PROTOCOL
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-emerald-200 border border-emerald-500/20">
                  <span>OUTAGE DETECTION</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>AUTONOMOUS EDGE LOCK (&lt;500ms)</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-sky-200 border border-sky-500/20">
                  <span>OFFLINE DURATION</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>IMMUTABLE SCADA LOGGING</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between border border-white/10">
                  <span>CARRIER ACQUIRED</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-emerald-400">BURST DRAIN &amp; ZERO DATA LOSS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. OVERVIEW TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Link State</div>
          <div
            className={`text-xl font-bold mt-1 ${
              isConnected ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ISRO GSAT-14 74°E</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Carrier Signal</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{isConnected ? '84%' : '0%'} SNR</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ku-Band 14.2 GHz</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Buffered Records</div>
          <div className="text-xl font-bold text-sky-600 mt-1">
            {isConnected ? '0 (Synced)' : '127 Events'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">NVMe edge storage</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Mainland Gateway</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">NCAOR Goa</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ISRO NRSC Backup</div>
        </div>
      </div>
    </div>
  );
};
