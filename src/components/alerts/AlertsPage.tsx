import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { AlertItem } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, navigateTo } = useStation();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity === 'all') return true;
    return a.severity === selectedSeverity;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-wider text-amber-600 font-semibold">
              TELEMETRY ANOMALY SYSTEM
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#17213A] tracking-tight">
            STATION ALERTS
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Real-time threshold breaches, preventive servicing warnings, and telemetry variances.
          </p>
        </div>

        {/* Severity Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#D5E1F2]">
          {['all', 'critical', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-[#617FF2] text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#F4F8FE] rounded-2xl p-10 text-center border border-[#D5E1F2]">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-base font-bold text-[#17213A]">Zero Anomalies in Category</div>
            <div className="text-xs text-slate-500 mt-1">All station sensors within nominal operating envelope.</div>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isMedium = alert.severity === 'medium';
            const isCritical = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`rounded-2xl p-5 border transition-all ${
                  alert.acknowledged
                    ? 'bg-[#F4F8FE]/70 border-[#D5E1F2] opacity-80'
                    : isMedium
                    ? 'bg-white border-amber-300 shadow-sm'
                    : 'bg-white border-[#D5E1F2] shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-500 animate-pulse'
                          : isMedium
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-800">
                      {alert.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        isMedium
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {alert.severity} PRIORITY
                    </span>
                    {alert.acknowledged && (
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        Acknowledged
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.timestamp}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {alert.location}
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#17213A] mb-1">
                  {alert.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4">{alert.description}</p>

                {/* Telemetry Snapshot values */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2] text-xs font-mono mb-4">
                  <div>
                    <span className="text-slate-400">Recorded Value:</span>
                    <div className="font-bold text-[#17213A] text-sm mt-0.5">{alert.valueRecorded}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Threshold:</span>
                    <div className="font-bold text-slate-700 text-sm mt-0.5">{alert.threshold}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Action:</span>
                    <div className="text-slate-800 truncate text-xs mt-0.5">{alert.recommendedAction}</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => navigateTo(`systems/${alert.systemId}`)}
                    className="text-xs font-semibold text-[#617FF2] hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Affected System Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-xs"
                    >
                      Acknowledge Alert
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Logged by Operations</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
