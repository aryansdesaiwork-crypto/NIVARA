import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import {
  Settings,
  User,
  ShieldCheck,
  Radio,
  Sliders,
  CheckCircle2,
  Bell,
  Cpu,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, stationLocation, timeUtc } = useStation();

  const [telemetryFrequency, setTelemetryFrequency] = useState('5s');
  const [uplinkPriority, setUplinkPriority] = useState('scada_first');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoAcknowledgeLow, setAutoAcknowledgeLow] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2]">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-[#617FF2]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#617FF2] font-semibold">
            CONSOLE CONFIGURATION
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#17213A] tracking-tight">
          SETTINGS & OPERATOR PROFILE
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Telemetry polling frequencies, satellite link bandwidth allocation, and operator access credentials.
        </p>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-2 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Operational settings successfully updated and broadcast to station telemetry nodes.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5E1F2] pb-3">
            <User className="w-4 h-4 text-[#617FF2]" />
            <h3 className="font-bold text-[#17213A] text-base">Active Operator Credential</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-white p-3.5 rounded-xl border border-[#D5E1F2]">
              <span className="text-slate-400">Officer Name:</span>
              <div className="font-bold text-[#17213A] text-sm mt-0.5">{user?.name || 'Dr. Arjun Roy'}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#D5E1F2]">
              <span className="text-slate-400">Institutional ID:</span>
              <div className="font-bold text-[#617FF2] text-sm mt-0.5">{user?.id || 'NIVARA-IND-8842'}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#D5E1F2]">
              <span className="text-slate-400">Assigned Role:</span>
              <div className="font-bold text-[#17213A] text-sm mt-0.5">{user?.role || 'Senior Polar Operations Lead'}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#D5E1F2]">
              <span className="text-slate-400">Base Station:</span>
              <div className="font-bold text-[#17213A] text-sm mt-0.5">{stationLocation.name} ({stationLocation.code})</div>
            </div>
          </div>
        </div>

        {/* Telemetry & Uplink Config */}
        <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5E1F2] pb-3">
            <Radio className="w-4 h-4 text-[#617FF2]" />
            <h3 className="font-bold text-[#17213A] text-base">Telemetry & Link Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-mono">
                Sensor Polling Frequency
              </label>
              <select
                value={telemetryFrequency}
                onChange={(e) => setTelemetryFrequency(e.target.value)}
                className="w-full bg-white rounded-xl border border-[#D5E1F2] px-3 py-2 text-xs text-[#17213A]"
              >
                <option value="1s">1 second (High Burst Diagnostic)</option>
                <option value="5s">5 seconds (Nominal Operation)</option>
                <option value="30s">30 seconds (Power Conservation Mode)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-mono">
                Satellite Bandwidth Queue
              </label>
              <select
                value={uplinkPriority}
                onChange={(e) => setUplinkPriority(e.target.value)}
                className="w-full bg-white rounded-xl border border-[#D5E1F2] px-3 py-2 text-xs text-[#17213A]"
              >
                <option value="scada_first">Critical SCADA & Life Support First</option>
                <option value="science_first">Scientific Payloads & Lidar Frames First</option>
                <option value="balanced">Equal Round-Robin Bandwidth</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="rounded accent-[#617FF2] w-4 h-4"
              />
              <span>Audible acoustic warning tone on Critical microgrid threshold breaches</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAcknowledgeLow}
                onChange={(e) => setAutoAcknowledgeLow(e.target.checked)}
                className="rounded accent-[#617FF2] w-4 h-4"
              />
              <span>Auto-archive advisory level warnings after 24 hours of sensor clearance</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#617FF2] hover:bg-[#506ee0] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>SAVE STATION CONFIGURATION</span>
        </button>
      </form>
    </div>
  );
};
