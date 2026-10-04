import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { StationId } from '../../types';
import { LandingStation3D } from './LandingStation3D';
import { IndiaEmblem } from '../common/IndiaEmblem';
import { ArrowRight, ExternalLink } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, setStationId, liveConditions } = useStation();
  const [activeStation, setActiveStation] = useState<StationId>('maitri');

  const handleSelectStation = (id: StationId) => {
    setActiveStation(id);
    setStationId(id);
  };

  return (
    <div className="min-h-screen w-full bg-[#060B16] text-white selection:bg-sky-500/30 selection:text-white flex flex-col justify-between overflow-x-hidden antialiased relative">
      {/* Restrained Apple-style polar atmospheric backdrops */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-sky-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[550px] h-[550px] bg-blue-900/15 rounded-full blur-[150px]" />
        <div className="absolute -bottom-24 left-10 w-[450px] h-[450px] bg-sky-950/20 rounded-full blur-[130px]" />
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP BAR (OFFICIAL EMBLEM: MINISTRY OF EARTH SCIENCES) */}
      {/* ========================================================================= */}
      <header className="relative z-30 w-full backdrop-blur-xl bg-[#060B16]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Official Emblem with text: Government of India / MINISTRY OF EARTH SCIENCES */}
          <div className="flex items-center gap-3">
            <IndiaEmblem light={true} size={34} showText={true} />
          </div>

          <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
            POLAR RESEARCH DIVISION
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO: WORD "NIVARA", SHORT BRIEF, SINGLE ACTION BUTTON, 3D MODEL */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading "NIVARA" & Short Brief */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5 sm:space-y-6">
            {/* Mission Sub-kicker */}
            <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>INDIAN ANTARCTIC EXPEDITION · ISEA 44</span>
            </div>

            {/* Nice Heading of Word "NIVARA" */}
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
                NIVARA
              </h1>
              <p className="text-base sm:text-lg font-semibold text-slate-300 tracking-tight">
                Indian Antarctic Station Intelligence
              </p>
            </div>

            {/* Short Brief */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              A living digital twin for monitoring, predicting, and safeguarding India&apos;s extreme polar research stations—Maitri and Bharati—through real-time NCPOR telemetry and physics-grounded simulation.
            </p>

            {/* SINGLE PROMINENT ACTION BUTTON */}
            <div className="pt-2">
              <button
                onClick={() => navigateTo('login')}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-[#060B16] text-sm sm:text-base font-extrabold tracking-tight transition-all shadow-xl shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>ENTER NIVARA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Compact Real-Time Telemetry Provenance Badge */}
            <div className="p-3.5 bg-white/[0.04] rounded-2xl border border-white/10 space-y-2 max-w-lg">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Maitri AWS: {liveConditions.temperatureC}°C · Bharati DCWIS: -18.8°C
                </span>
                <span className="text-slate-500">21:00 UTC</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5 text-slate-400">
                <span>Official Repository: NCPOR Goa</span>
                <a
                  href="https://data.ncpor.res.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>data.ncpor.res.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Station Model */}
          <div className="lg:col-span-7 w-full">
            <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden border border-white/15 shadow-2xl bg-[#070e1c] p-2 sm:p-3">
              {/* 3D Canvas Container */}
              <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden bg-[#060D1A]">
                <LandingStation3D className="w-full h-full" />

                {/* Station Model Preset Switcher */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-[#060B16]/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-xs font-mono">
                  <span className="text-slate-400">Station Model:</span>
                  <button
                    onClick={() => handleSelectStation('maitri')}
                    className={`font-semibold cursor-pointer transition-colors ${
                      activeStation === 'maitri'
                        ? 'text-sky-400 underline underline-offset-4'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Maitri (70°S)
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    onClick={() => handleSelectStation('bharati')}
                    className={`font-semibold cursor-pointer transition-colors ${
                      activeStation === 'bharati'
                        ? 'text-sky-400 underline underline-offset-4'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bharati (69°S)
                  </button>
                </div>

                {/* Subtle Interactive Instruction Pill */}
                <div className="absolute top-4 right-4 z-20 pointer-events-none bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-slate-400">
                  Drag to Orbit · Tilt Perspective
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. RESTRAINED GOVERNMENT CREDITS FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-2">
        <div>
          Ministry of Earth Sciences · National Centre for Polar and Ocean Research (NCPOR), Goa
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://data.ncpor.res.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>DATA SOURCE · NCPOR</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>·</span>
          <span>Indian Antarctic Operations Console</span>
        </div>
      </footer>
    </div>
  );
};
