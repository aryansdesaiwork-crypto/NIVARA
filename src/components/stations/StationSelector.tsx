import React from 'react';
import { useStation } from '../../context/StationContext';
import { STATIONS_DATA } from '../../data/mockData';
import { StationId } from '../../types';
import { IndiaEmblem } from '../common/IndiaEmblem';
import { getLatestObservation } from '../../services/ncporService';
import {
  ArrowRight,
  Compass,
  Radio,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Thermometer,
  Wind,
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const StationSelector: React.FC = () => {
  const { setStationId, navigateTo } = useStation();

  const handleSelectStation = (id: StationId) => {
    setStationId(id);
    navigateTo('overview');
  };

  return (
    <div className="min-h-screen w-full bg-[#EAF2FC] p-4 sm:p-8 lg:p-12 flex flex-col justify-center max-w-7xl mx-auto space-y-8 select-none">
      {/* Government & Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D5E1F2]">
        <IndiaEmblem size={32} showText={true} />

        <div className="flex items-center gap-3">
          <a
            href="https://data.ncpor.res.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-mono font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <span>DATA SOURCE · NCPOR</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
          </a>

          <button
            onClick={() => navigateTo('landing')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-xs font-mono font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Exit to Home
          </button>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#0284C7] font-bold">
            SELECT ANTARCTIC STATION
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17213A] tracking-tight">
          Select Operational Research Base
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Choose an operational Indian Antarctic station to enter the physics-grounded 3D Digital Twin, live meteorological telemetry, and machine-learning intelligence platform.
        </p>
      </div>

      {/* Two Large Apple-style Bento Cards for Bharati (1st) and Maitri (2nd) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {(['bharati', 'maitri'] as StationId[]).map((id) => {
          const station = STATIONS_DATA[id];
          const isMaitri = id === 'maitri';
          const latestObs = getLatestObservation(id);

          return (
            <div
              key={id}
              onClick={() => handleSelectStation(id)}
              className="group cursor-pointer bg-white rounded-3xl border border-[#D5E1F2] hover:border-[#0284C7] p-5 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
            >
              {/* Image banner inside Bento card */}
              <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden mb-6 bg-slate-900">
                <img
                  src={station.image}
                  alt={`${station.name} Antarctic Research Station`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-[#0A1128]/35 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-800 text-xs font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>REAL OBSERVATION · LIVE</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-[#0A1128]/85 backdrop-blur-md text-white text-xs font-mono">
                    {station.code}
                  </div>
                </div>

                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-sky-600/90 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5">
                  <Radio className="w-3 h-3" />
                  <span>{isMaitri ? 'AWS ID 89514' : 'DCWIS ID 89532'}</span>
                </div>

                {/* Bottom title on image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {station.name.toUpperCase()}
                  </div>
                  <div className="text-xs font-medium text-slate-200 mt-0.5">
                    {isMaitri ? 'Schirmacher Oasis · Established 1989' : 'Larsemann Hills · Established 2012'}
                  </div>
                </div>
              </div>

              {/* Station Details & Real NCPOR Telemetry */}
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {station.description}
                </p>

                {/* Real Observation Banner */}
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#D5E1F2] grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div className="p-1.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block uppercase">NCPOR Temp</span>
                    <span className="font-extrabold text-[#17213A] text-sm">
                      {latestObs.temperatureC}°C
                    </span>
                  </div>
                  <div className="p-1.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Wind Speed</span>
                    <span className="font-extrabold text-sky-700 text-sm">
                      {latestObs.windSpeedKmh} km/h
                    </span>
                  </div>
                  <div className="p-1.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Pressure</span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {latestObs.barometricPressureHpa} hPa
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-[#D5E1F2]">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Compass className="w-3 h-3 text-sky-600" />
                      <span>COORDINATES</span>
                    </div>
                    <div className="text-xs font-semibold font-mono text-[#17213A] mt-0.5 truncate">
                      {station.coordinates}
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-[#D5E1F2]">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Users className="w-3 h-3 text-sky-600" />
                      <span>CREW CAPACITY</span>
                    </div>
                    <div className="text-xs font-semibold font-mono text-[#17213A] mt-0.5">
                      {station.winterCrew} Winter / {station.summerCapacity} Summer
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-[#D5E1F2] col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>ML ENGINE</span>
                    </div>
                    <div className="text-xs font-semibold font-mono text-emerald-700 mt-0.5">
                      Isolation Forest Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button Strip */}
              <div className="mt-6 pt-4 border-t border-[#D5E1F2] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Interactive 3D Digital Twin Ready</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] group-hover:translate-x-1 transition-transform">
                  <span>ENTER {station.name.toUpperCase()} INTELLIGENCE</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
