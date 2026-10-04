import React from 'react';
import { useStation } from '../../context/StationContext';
import { DigitalTwin3D } from '../digital-twin/DigitalTwin3D';
import { DigitalTwinBuildingCard } from '../digital-twin/DigitalTwinBuildingCard';
import { STATION_SYSTEMS_LIST } from '../../data/mockData';
import {
  Thermometer,
  Wind,
  Zap,
  Fuel,
  Droplet,
  Radio,
  ArrowRight,
  AlertTriangle,
  Building,
  CloudSnow,
  Users,
  FlaskConical,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const {
    stationLocation,
    liveConditions,
    selectedBuildingId,
    selectBuilding,
    navigateTo,
    stationId
  } = useStation();

  // Helper icon resolver for system cards
  const getSystemIcon = (name: string) => {
    switch (name) {
      case 'Zap':
        return Zap;
      case 'Building':
        return Building;
      case 'CloudSnow':
        return CloudSnow;
      case 'Fuel':
        return Fuel;
      case 'Droplet':
        return Droplet;
      case 'Radio':
        return Radio;
      case 'Users':
        return Users;
      case 'FlaskConical':
        return FlaskConical;
      case 'Wrench':
        return Wrench;
      default:
        return Zap;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. 3D DIGITAL TWIN HERO (Dominates page, 55-65% visual weight) */}
      <section className="bg-[#F4F8FE] rounded-3xl border border-[#D5E1F2] p-4 sm:p-6 shadow-sm overflow-hidden">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#617FF2] font-semibold">
                LIVE DIGITAL TWIN
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">{stationLocation.coordinates}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17213A] tracking-tight">
              {stationLocation.name.toUpperCase()}
              <span className="text-slate-400 font-light ml-2 text-xl">ANTARCTIC RESEARCH STATION</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('digital-twin')}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#D5E1F2] text-xs font-semibold text-[#17213A] transition-colors flex items-center gap-1.5"
            >
              <span>Full Twin Canvas</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#617FF2]" />
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div className="rounded-2xl overflow-hidden border border-[#D5E1F2] shadow-inner">
          <DigitalTwin3D
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={(bId) => selectBuilding(bId)}
          />
        </div>

        {/* Selected Building Details Card (Tabs: LIVE | PREDICT | WHAT-IF | HISTORY) */}
        {selectedBuildingId && (
          <div className="mt-4">
            <DigitalTwinBuildingCard />
          </div>
        )}
      </section>

      {/* 2. LIVE STATION STATUS (Horizontal Bento Status Strip with Large Typography) */}
      <section>
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 px-1">
          Live Conditions Strip
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Temperature */}
          <div className="bg-[#F4F8FE] rounded-2xl p-4 sm:p-5 border border-[#D5E1F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Temperature</span>
              <Thermometer className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#17213A]">
                {liveConditions.temperatureC}°C
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Wind chill: {liveConditions.apparentTempC}°C
              </div>
            </div>
          </div>

          {/* Wind */}
          <div className="bg-[#F4F8FE] rounded-2xl p-4 sm:p-5 border border-[#D5E1F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Wind</span>
              <Wind className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#17213A]">
                {liveConditions.windSpeedKmh} <span className="text-sm font-semibold text-slate-500">km/h</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono truncate">
                {liveConditions.windDirection}
              </div>
            </div>
          </div>

          {/* Power */}
          <div className="bg-[#F4F8FE] rounded-2xl p-4 sm:p-5 border border-[#D5E1F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Power</span>
              <Zap className="w-4 h-4 text-[#617FF2]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#17213A]">
                {liveConditions.powerLoadPercent}%
              </div>
              <div className="text-[11px] text-emerald-600 font-mono mt-1">
                {liveConditions.powerGenerationKw} kW active
              </div>
            </div>
          </div>

          {/* Fuel */}
          <div className="bg-[#F4F8FE] rounded-2xl p-4 sm:p-5 border border-[#D5E1F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Fuel</span>
              <Fuel className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#17213A]">
                {liveConditions.fuelReservePercent}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                {liveConditions.fuelDaysRemaining} days remaining
              </div>
            </div>
          </div>

          {/* Water */}
          <div className="bg-[#F4F8FE] rounded-2xl p-4 sm:p-5 border border-[#D5E1F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Water</span>
              <Droplet className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#17213A]">
                {liveConditions.waterReservePercent}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                {liveConditions.waterDaysRemaining} days reserve
              </div>
            </div>
          </div>

          {/* Communication */}
          <div className="bg-[#F4F8FE] rounded-2xl p-4 sm:p-5 border border-[#D5E1F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Communication</span>
              <Radio className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold font-mono tracking-tight text-emerald-600 truncate">
                {liveConditions.communicationStatus}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono truncate">
                {liveConditions.communicationStatus === 'CONNECTED'
                  ? `Signal ${liveConditions.satelliteLinkQualityPercent}%`
                  : `${liveConditions.bufferedOfflineEvents} buffered`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATION SYSTEMS (Bento Layout with 9 Clickable Cards) */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#17213A] tracking-tight">
              STATION SYSTEMS
            </h3>
            <p className="text-xs text-slate-500">
              Click any system card to enter its interactive digital interior, live machinery flows, and operational simulations.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">9 Core Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {STATION_SYSTEMS_LIST.map((sys) => {
            const Icon = getSystemIcon(sys.iconName);
            const isAttention = sys.status === 'attention';

            return (
              <div
                key={sys.id}
                onClick={() => navigateTo(sys.route)}
                className="group cursor-pointer bg-[#F4F8FE] hover:bg-white rounded-2xl sm:rounded-3xl border border-[#D5E1F2] hover:border-[#617FF2] p-5 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Status Dot & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF2FC] group-hover:bg-[#617FF2] text-[#617FF2] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAttention
                            ? 'bg-amber-500 animate-pulse'
                            : sys.status === 'operational'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span className="capitalize font-medium text-slate-600">{sys.status}</span>
                    </div>
                  </div>

                  {/* Name & Subtitle */}
                  <h4 className="text-base sm:text-lg font-bold text-[#17213A] tracking-tight group-hover:text-[#617FF2] transition-colors">
                    {sys.name}
                  </h4>
                  <div className="text-xs text-slate-500 mb-3">{sys.subtitle}</div>

                  {/* Main Metric Banner */}
                  <div className="bg-white group-hover:bg-[#F4F8FE] rounded-xl p-3 border border-[#D5E1F2]/80 transition-colors">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        {sys.metricLabel}
                      </span>
                      <span className="text-xl font-bold font-mono tabular-nums text-[#17213A]">
                        {sys.metricValue}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
                      {sys.subMetric}
                    </div>
                  </div>
                </div>

                {/* Footer summary & Enter Interior link */}
                <div className="mt-4 pt-3 border-t border-[#D5E1F2]/60 flex items-center justify-between text-xs">
                  <span className="truncate pr-2 font-mono text-[11px] text-slate-500 group-hover:text-slate-700">
                    {sys.details.summary}
                  </span>
                  <div className="flex items-center gap-1 text-[#617FF2] shrink-0 font-mono text-[11px] font-bold">
                    <span>INTERIOR</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
