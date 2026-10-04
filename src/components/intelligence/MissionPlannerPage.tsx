import React from 'react';
import { useStation } from '../../context/StationContext';
import { MOCK_MISSION_RESOURCES } from '../../data/mockData';
import {
  Compass,
  Ship,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Fuel,
  Utensils,
  Droplet,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const MissionPlannerPage: React.FC = () => {
  const { navigateTo } = useStation();

  // Resource icon resolver
  const getResourceIcon = (id: string) => {
    switch (id) {
      case 'fuel':
        return Fuel;
      case 'food':
        return Utensils;
      case 'water':
        return Droplet;
      case 'power':
        return Zap;
      default:
        return Activity;
    }
  };

  const targetVesselDays = 21;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2]">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-[#617FF2]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#617FF2] font-semibold">
            STRATEGIC SURVIVABILITY & LOGISTICS
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#17213A] tracking-tight">
          MISSION SUSTAINABILITY
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Core Operational Assessment: "Can the station maintain safe operations until the next scheduled resupply?"
        </p>
      </div>

      {/* Primary Mission Status Verdict Banner */}
      <div className="bg-[#0B1220] text-white rounded-2xl p-6 border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                OVERALL MISSION STATUS: OPERATIONAL
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Life Support & Station Power Secure
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Microgrid and fuel autonomy exceed scheduled vessel arrival by 3 days. Food rations require portion management.
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/15 flex items-center gap-3 shrink-0">
            <Ship className="w-6 h-6 text-sky-400" />
            <div>
              <div className="text-[11px] font-mono text-slate-300 uppercase">Resupply Vessel Arrival</div>
              <div className="text-lg font-bold font-mono text-white">MV Vasiliy Golovnin</div>
              <div className="text-xs text-sky-300 font-mono">T-minus 21 Days (Cape Town Route)</div>
            </div>
          </div>
        </div>

        {/* Bottleneck Callout */}
        <div className="mt-5 p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase tracking-wider">
              Identified Primary Constraint:
            </span>{' '}
            Freeze-dried protein meal rations have <strong>16 days remaining</strong> (5-day shortfall before ship docking). Transition to dry emergency staples (grains, pulses, canned provisions) scheduled on Day 12 to maintain full nutrition.
          </div>
        </div>
      </div>

      {/* Detailed Mission Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_MISSION_RESOURCES.map((res) => {
          const Icon = getResourceIcon(res.id);
          const isBottleneck = res.status === 'BOTTLENECK';
          const buffer = res.daysRemaining - targetVesselDays;

          return (
            <div
              key={res.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isBottleneck
                  ? 'bg-amber-50/60 border-amber-300'
                  : 'bg-[#F4F8FE] border-[#D5E1F2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#D5E1F2] text-[#617FF2]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      isBottleneck
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#17213A]">{res.name}</h3>

                <div className="mt-3 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Stock:</span>
                    <span className="font-semibold text-[#17213A]">{res.currentStock}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Rate:</span>
                    <span className="text-[#17213A]">{res.ratePerDay}</span>
                  </div>
                </div>

                {/* Days remaining meter */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Autonomy</span>
                    <span className="text-xl font-bold font-mono text-[#17213A]">
                      {res.daysRemaining} Days
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isBottleneck ? 'bg-amber-500' : 'bg-[#617FF2]'
                      }`}
                      style={{
                        width: `${Math.min(100, (res.daysRemaining / targetVesselDays) * 100)}%`
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>Vessel Target: 21d</span>
                    <span
                      className={`font-semibold ${
                        buffer < 0 ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {buffer >= 0 ? `+${buffer}d Buffer` : `${buffer}d Shortfall`}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{res.notes}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
