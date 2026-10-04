import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import { ResearchLab3D, ResearchLabSimState } from './ResearchLab3D';
import {
  FlaskConical,
  Activity,
  Zap,
  Radio,
  Sparkles,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Layers,
  Eye,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

export const ResearchLabInterior: React.FC = () => {
  const { stationLocation } = useStation();

  const [activeTab, setActiveTab] = useState<'LIVE' | 'FLOW' | 'SIMULATION' | 'HISTORY'>('LIVE');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('lidar');
  const [isLidarActive, setIsLidarActive] = useState<boolean>(true);
  const [geomagneticPerturbation, setGeomagneticPerturbation] = useState<number>(14.2);
  const [cryoTemp, setCryoTemp] = useState<number>(-80.2);
  const [solarStormActive, setSolarStormActive] = useState<boolean>(false);
  const [historyTimestamp, setHistoryTimestamp] = useState<'12:00' | '14:00' | '16:00' | '18:00'>('14:00');

  const simState: ResearchLabSimState = {
    isLidarActive,
    geomagneticStormActive: solarStormActive,
    cryoLeak: cryoTemp > -60,
    cryoTempC: cryoTemp,
    geomagneticPerturbationNt: geomagneticPerturbation
  };

  const triggerSolarEvent = () => {
    setSolarStormActive(true);
    setGeomagneticPerturbation(168.4);
    setTimeout(() => {
      setGeomagneticPerturbation(42.1);
      setSolarStormActive(false);
    }, 5500);
  };

  return (
    <div className="space-y-4">
      {/* 1. HERO 3D DIGITAL-TWIN SIMULATION ROOM */}
      <div className="relative">
        <ResearchLab3D
          simulationState={simState}
          selectedEquipment={selectedEquipment}
          onSelectEquipment={(id) => setSelectedEquipment(id)}
        />

        {/* Dynamic Storm Banner Notification */}
        {solarStormActive && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 max-w-xl w-[90%] px-4 py-2.5 rounded-2xl bg-purple-600/90 backdrop-blur-md text-white border border-purple-400 text-xs font-mono font-bold text-center shadow-2xl z-30 animate-pulse">
            GEOMAGNETIC SUB-STORM EVENT: AURORAL ELECTROJET EXCEEDING 160 nT · IONOSPHERIC SOUNDING ACTIVE
          </div>
        )}

        {/* History Scrubber */}
        {activeTab === 'HISTORY' && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-[#0B1220]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1 px-2 font-bold">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              TIMELINE:
            </span>
            {(['12:00', '14:00', '16:00', '18:00'] as const).map((ts) => (
              <button
                key={ts}
                onClick={() => setHistoryTimestamp(ts)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  historyTimestamp === ts
                    ? 'bg-purple-600 text-white shadow-sm'
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
            onClick={() => setIsLidarActive(!isLidarActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
              isLidarActive
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-white border-[#D5E1F2] text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isLidarActive ? 'LIDAR: 532nm PULSING' : 'LIDAR: SHUTTERED'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATION')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>LAB SIMULATION EXPERIMENTS</span>
          </button>
        </div>
      </div>

      {/* 3. SIMULATION CONTROLS DOCK */}
      {activeTab === 'SIMULATION' && (
        <div className="bg-[#0B1220] text-white rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-purple-300 font-bold">
                  GEOPHYSICAL EXPERIMENTAL SIMULATOR
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Ionospheric Disturbance & Cryo-Containment Stress Test
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate space weather interactions with Antarctic magnetic field lines or test the integrity of -80°C ice core storage chambers.
              </p>
            </div>

            <button
              onClick={triggerSolarEvent}
              disabled={solarStormActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                solarStormActive
                  ? 'bg-purple-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{solarStormActive ? 'STORM DISCHARGING...' : 'TRIGGER GEOMAGNETIC SUB-STORM'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cryo Slider */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  ICE CORE CRYOGENIC VAULT TEMPERATURE
                </span>
                <span className="text-base font-bold text-cyan-300 tabular-nums">
                  {cryoTemp.toFixed(1)}°C
                </span>
              </div>

              <input
                type="range"
                min="-85"
                max="-40"
                step="0.5"
                value={cryoTemp}
                onChange={(e) => setCryoTemp(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-85°C (Supercooled)</span>
                <span>-80°C (Nominal)</span>
                <span>-40°C (Critical Thaw)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono border-t border-white/5">
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Core Health</span>
                  <div className={`font-bold mt-0.5 ${cryoTemp > -60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {cryoTemp > -60 ? 'DEGRADATION' : '100% PRISTINE'}
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">LN2 Reserve</span>
                  <div className="font-bold text-white mt-0.5">820 Liters</div>
                </div>
                <div className="bg-black/30 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400">Vacuum Seal</span>
                  <div className="font-bold text-cyan-400 mt-0.5">10⁻⁶ mbar</div>
                </div>
              </div>
            </div>

            {/* Scientific Dependencies */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                INSTRUMENT TELEMETRY FEEDBACK
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-purple-200 border border-purple-500/20">
                  <span>3-AXIS MAGNETOMETER</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{geomagneticPerturbation.toFixed(1)} nT PERTURBATION</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-emerald-200 border border-emerald-500/20">
                  <span>532nm STRATOSPHERIC LIDAR</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isLidarActive ? 'POLAR MESOSPHERIC CLOUDS DETECTED' : 'STANDBY'}</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-sky-200 border border-sky-500/20">
                  <span>CLEAN AIR SAMPLING LINE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>BASELINE CO2: 418.6 PPM (GLOBAL BACKGROUND)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. OVERVIEW TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">532nm Green Lidar</div>
          <div className="text-xl font-bold text-[#17213A] mt-1">{isLidarActive ? '20 Hz Active' : 'Shuttered'}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Atmospheric Aerosols</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Fluxgate Magnetometer</div>
          <div className={`text-xl font-bold mt-1 ${solarStormActive ? 'text-purple-600 animate-pulse' : 'text-[#17213A]'}`}>
            {geomagneticPerturbation.toFixed(1)} nT
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">3-Axis Permafrost Pier</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Ice Core Freezer</div>
          <div className={`text-xl font-bold mt-1 ${cryoTemp > -60 ? 'text-rose-500' : 'text-cyan-600'}`}>
            {cryoTemp.toFixed(1)}°C
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">38 Polar Cores Secure</div>
        </div>
        <div className="bg-[#F4F8FE] rounded-2xl p-4 border border-[#D5E1F2]">
          <div className="text-slate-400 text-[10px] uppercase">Cleanroom Status</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">ISO Class 6</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Positive HEPA Pressure</div>
        </div>
      </div>
    </div>
  );
};
