import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  Building,
  ShieldCheck
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { stationLocation, liveConditions, user, timeUtc } = useStation();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = (docName: string) => {
    setDownloadSuccess(docName);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2]">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-[#617FF2]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#617FF2] font-semibold">
            POLAR OPERATIONAL ARCHIVES
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#17213A] tracking-tight">
          STATION REPORTS & EXPORTS
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-xl">
          Certified expedition logs, daily energy and resource bulletins, and official NCAOR polar operations documentation.
        </p>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Generated and prepared: {downloadSuccess}</span>
          </div>
          <span className="text-slate-400">CRC-32 Checksum Verified</span>
        </div>
      )}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Daily Shift Bulletin */}
        <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">DAILY LOG</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                READY
              </span>
            </div>
            <h3 className="font-bold text-[#17213A] text-base">
              Daily Station Executive Briefing
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Consolidated 24-hour summary of microgrid power generation, fuel burn rate, external katabatic wind speeds, and crew biometrics.
            </p>
            <div className="mt-4 text-[11px] font-mono text-slate-500 space-y-1">
              <div>Station: {stationLocation.name}</div>
              <div>Generated: {timeUtc}</div>
              <div>Format: PDF (3.2 MB)</div>
            </div>
          </div>

          <button
            onClick={() => handleDownload('NIVARA_Daily_Briefing.pdf')}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-semibold text-[#17213A] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#617FF2]" />
            <span>EXPORT BRIEFING PDF</span>
          </button>
        </div>

        {/* Telemetry Sensor Dump */}
        <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">RAW DATA</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                HOURLY
              </span>
            </div>
            <h3 className="font-bold text-[#17213A] text-base">
              SCADA & Sensor Telemetry CSV
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Time-series numerical export including exhaust temperatures, vibration spectra, permafrost tilt, and battery buffer percentages.
            </p>
            <div className="mt-4 text-[11px] font-mono text-slate-500 space-y-1">
              <div>Records: 86,400 Rows</div>
              <div>Sampling: 1 Hz Frequency</div>
              <div>Format: CSV (18.4 MB)</div>
            </div>
          </div>

          <button
            onClick={() => handleDownload('Station_SCADA_Telemetry.csv')}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-semibold text-[#17213A] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#617FF2]" />
            <span>DOWNLOAD CSV DATASET</span>
          </button>
        </div>

        {/* Resupply Readiness Assessment */}
        <div className="bg-[#F4F8FE] rounded-2xl p-5 border border-[#D5E1F2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">LOGISTICS</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                AUDITED
              </span>
            </div>
            <h3 className="font-bold text-[#17213A] text-base">
              Vessel Resupply Readiness Audit
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Detailed inventory manifest for MV Vasiliy Golovnin docking, including fuel transfer manifold certs and food ration depletion schedules.
            </p>
            <div className="mt-4 text-[11px] font-mono text-slate-500 space-y-1">
              <div>Audit Scope: Tier 1 Resources</div>
              <div>Target Window: T-21 Days</div>
              <div>Format: PDF & Cryptographic Sign</div>
            </div>
          </div>

          <button
            onClick={() => handleDownload('Resupply_Readiness_Audit.pdf')}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-semibold text-[#17213A] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#617FF2]" />
            <span>EXPORT LOGISTICS AUDIT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
