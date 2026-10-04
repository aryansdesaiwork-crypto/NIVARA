import React, { useState } from 'react';
import { useStation } from '../../../context/StationContext';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Gauge,
  Thermometer,
  Activity,
  Layers,
  Send,
  Zap,
  Flame,
  Wind,
  Check,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface SolutionOption {
  id: string;
  title: string;
  type: string;
  badgeColor: string;
  description: string;
  actionLabel: string;
  actionSuccessText: string;
  normalizedMetrics: {
    label: string;
    before: string;
    after: string;
  }[];
}

export const ComponentAnomalyRemediationPanel: React.FC = () => {
  const { stationId, navigateTo } = useStation();
  const [activeSolution, setActiveSolution] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  // Play satisfying success audio chime via Web Audio API
  const playSuccessChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const now = ctx.currentTime;

      // Two-tone rising major third chord
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // Graceful fallback
    }
  };

  const isBharati = stationId === 'bharati';

  // 1. Bharati Component & Issue Spec
  const bharatiDetails = {
    componentName: 'Lower Deck HVAC Blower Fan 03 & Glycol Hydronics',
    location: 'Lower Deck Utility Substation (Module B-02, 69°S)',
    pinpointTag: 'PINPOINT: 3D Yellow Beacon [X: +4.8m, Y: -1.2m, Z: +6.2m]',
    issueTitle: 'Bearing Mechanical Resonance & Lubricant Viscosity Breakdown',
    issueDescription:
      'Continuous polar intake air exposure (-28°C) caused thermal boundary contraction on the fan bearing jacket. This led to channeling of synthetic lubricant and premature bearing race micro-pitting. High-frequency 120 Hz harmonics are now coupling into the air-handler casing, threatening impeller seizure.',
    metrics: [
      { label: 'Bearing Vibration', value: '4.8 mm/s RMS', nominal: '< 1.8 mm/s', status: 'CRITICAL', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { label: 'Intake Thermal Delta', value: '+18.4°C drift', nominal: '±2.0°C baseline', status: 'HIGH', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      { label: 'Dynamic Impeller Balance', value: '64% Quality', nominal: '98% Nominal', status: 'DEGRADED', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      { label: 'Airflow Delivery', value: '1,420 CFM', nominal: '1,840 CFM nominal', status: 'REDUCED', color: 'text-slate-700 bg-slate-50 border-slate-200' }
    ],
    consequenceRisk:
      'Without remedial action, catastrophic bearing seizure is projected within 18–36 hours. Seizure will trigger a loss of positive cabin pressure (+22 Pa → 0 Pa), allowing fine Antarctic drift-snow to penetrate living modules.',
    solutions: [
      {
        id: 'bharati-sol-1',
        title: 'Engage Secondary Redundant Glycol Loop B (Auto-Bypass)',
        type: 'Automated Isolation',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description:
          'Diverts 100% of air heating through standby Glycol Loop B and spins up Auxiliary Blower Fan 04. Safely shuts down faulty Fan 03 to 0 RPM with zero interruption to station indoor climate.',
        actionLabel: 'Execute Loop B Switchover',
        actionSuccessText:
          'Standby Glycol Loop B engaged. Fan 03 isolated at 0 RPM. Station positive pressure restored to +22 Pa. Vibration eliminated.',
        normalizedMetrics: [
          { label: 'Fan 03 Vibration', before: '4.8 mm/s', after: '0.0 mm/s (Isolated)' },
          { label: 'Aux Fan 04 Status', before: 'Standby', after: 'Nominal (1,850 CFM)' },
          { label: 'Cabin Pressure', before: '+14 Pa (Falling)', after: '+22 Pa (Optimal)' }
        ]
      },
      {
        id: 'bharati-sol-2',
        title: 'Automated Ceramic De-Ice Heating & Polar Lube Injection',
        type: 'Thermal & Mechanical Recovery',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        description:
          'Activates the auxiliary 1.5 kW ceramic heating jacket to warm the cold bearing collar to +18°C, followed by a 120-second high-pressure injection of synthetic polar grease.',
        actionLabel: 'Initiate De-Ice & Lube Flush',
        actionSuccessText:
          'Ceramic de-ice collar reached +18°C. Polar synthetic grease flushed through races. Vibration dampened into nominal tolerance.',
        normalizedMetrics: [
          { label: 'Bearing Vibration', before: '4.8 mm/s', after: '1.4 mm/s (Nominal)' },
          { label: 'Collar Temperature', before: '-22°C (Frozen)', after: '+18°C (Operating)' },
          { label: 'Impeller Balance', before: '64%', after: '92% (Smooth)' }
        ]
      },
      {
        id: 'bharati-sol-3',
        title: 'VFD Variable Frequency Drive Harmonic Damping',
        type: 'Electronic Harmonic Tuning',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description:
          'Recalibrates the motor drive from 58 Hz down to 42 Hz away from the 120 Hz mechanical resonance band, damping oscillation while auxiliary dampers compensate airflow.',
        actionLabel: 'Apply Harmonic Frequency Damping',
        actionSuccessText:
          'VFD frequency notched away from 120 Hz resonant peak. Motor oscillation dampened by 68%. Component wear arrested.',
        normalizedMetrics: [
          { label: 'Drive Frequency', before: '58 Hz (Resonant)', after: '42 Hz (Damped)' },
          { label: 'Harmonic Amplitude', before: '120 Hz (Peak)', after: 'Attenuated -18 dB' },
          { label: 'Vibration', before: '4.8 mm/s', after: '1.6 mm/s (Acceptable)' }
        ]
      },
      {
        id: 'bharati-sol-4',
        title: 'Dispatch NCPOR Maintenance Officer (SOP-ANT-INFRA-12)',
        type: 'Physical Expedition Protocol',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        description:
          'Generates a high-priority physical work order for the Bharati wintering mechanical engineer. Auto-stages replacement bearing kit #BHA-MECH-44 in Lower Deck Substation.',
        actionLabel: 'Dispatch Station Work Order',
        actionSuccessText:
          'Work Order #WO-89532-04 dispatched to Station Mechanical Engineer. Scheduled physical bearing swap during next 08:00 UTC maintenance window.',
        normalizedMetrics: [
          { label: 'Work Order ID', before: 'None', after: '#WO-89532-04 Logged' },
          { label: 'Assigned Tech', before: 'Unassigned', after: 'Lead Mechanical Engr' },
          { label: 'Spares Staged', before: 'Warehouse', after: 'Bearing Kit #BHA-MECH-44' }
        ]
      }
    ] as SolutionOption[]
  };

  // 2. Maitri Component & Issue Spec
  const maitriDetails = {
    componentName: 'Generator 02 Hydronic Bypass Coolant Valve & Thermal Intertie',
    location: 'Maitri Generator Annex (Block B, 70°S Schirmacher Oasis)',
    pinpointTag: 'PINPOINT: 3D Yellow Beacon [X: -14.2m, Y: +4.0m, Z: -4.0m]',
    issueTitle: 'Actuator Valve Seat Stiction & Thermal Drift in Cogeneration Loop',
    issueDescription:
      'The motorized bypass coolant actuator valve on Diesel Generator 02 has suffered thermal calibration drift. The valve disc is experiencing mechanical stiction at 46% stroke, creating backpressure in the cogenerative heat recovery line that warms water from Lake Priyadarshini.',
    metrics: [
      { label: 'Valve Body Temp', value: '94.2°C', nominal: '72.0°C nominal threshold', status: 'CRITICAL', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { label: 'Actuator Duty Cycle', value: '88% Continuous', nominal: '45–60% standard', status: 'OVERLOAD', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      { label: 'Position Feedback Drift', value: '18.6% Error', nominal: '< 1.0% optical error', status: 'FAULTY', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      { label: 'Cogeneration Heat Delivery', value: '52 kW', nominal: '68 kW optimal', status: 'DEGRADED', color: 'text-slate-700 bg-slate-50 border-slate-200' }
    ],
    consequenceRisk:
      'Unchecked thermal runaway will trigger Generator 02 emergency over-temp trip within 48 hours. This would drop Maitri to a single generator without redundant backup, risking freeze-up of freshwater transfer lines.',
    solutions: [
      {
        id: 'maitri-sol-1',
        title: 'Engage Pneumatic Bypass Cross-Tie Loop P-14',
        type: 'Hydraulic Auto-Bypass',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description:
          'Remotely opens parallel pneumatic emergency bypass line P-14. Relieves high hydraulic backpressure around the stuck valve and restores unrestricted coolant flow.',
        actionLabel: 'Engage Bypass Loop P-14',
        actionSuccessText:
          'Pneumatic Loop P-14 opened. Coolant backpressure dropped from 4.2 bar to 2.7 bar. Valve temperature normalized to 71.4°C.',
        normalizedMetrics: [
          { label: 'Coolant Backpressure', before: '4.2 bar (High)', after: '2.7 bar (Nominal)' },
          { label: 'Valve Temperature', before: '94.2°C (Warning)', after: '71.4°C (Normal)' },
          { label: 'Lake Heat Supply', before: '52 kW (Restricted)', after: '68 kW (Full)' }
        ]
      },
      {
        id: 'maitri-sol-2',
        title: 'Full-Stroke Actuator Calibration & Stiction Cleansing Cycle',
        type: 'Electromechanical Recalibration',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        description:
          'Sends 5 consecutive 24V pulse commands forcing the valve actuator from 0% to 100% full stroke to dislodge mineral crust and re-index the optical encoder.',
        actionLabel: 'Run Actuator Stroke Test',
        actionSuccessText:
          'Actuator stroke cycle complete. Valve seat sediment cleared. Optical position encoder re-indexed with 0.3% margin.',
        normalizedMetrics: [
          { label: 'Feedback Error', before: '18.6% Drift', after: '0.3% (Calibrated)' },
          { label: 'Valve Stroke Range', before: '46% (Stuck)', after: '100% (Free)' },
          { label: 'Actuator Duty', before: '88% Overload', after: '51% (Nominal)' }
        ]
      },
      {
        id: 'maitri-sol-3',
        title: 'Rebalance Cogeneration Load to Primary Generator 01',
        type: 'Microgrid Load Redistribution',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        description:
          'Commands Maitri microgrid controller to transfer 35 kW electrical load and thermal cogenerative burden to Main Generator 01, cooling Generator 02.',
        actionLabel: 'Rebalance to Generator 01',
        actionSuccessText:
          '35 kW transferred to Main Generator 01. Generator 02 operating temperature dropped by 18°C. Duty cycle normalized.',
        normalizedMetrics: [
          { label: 'Gen 02 Coolant Temp', before: '94.2°C', after: '73.1°C (Safe)' },
          { label: 'Gen 02 Electrical Load', before: '72 kW', after: '37 kW (Relieved)' },
          { label: 'Gen 01 Reserve Margin', before: 'Nominal', after: 'Optimal (64% Load)' }
        ]
      },
      {
        id: 'maitri-sol-4',
        title: 'Dispatch Maitri Mechanical Officer (SOP-POL-VALVE-04)',
        type: 'Physical Expedition Protocol',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        description:
          'Issues physical work order to Maitri wintering mechanical engineer to inspect valve packing gland, repack seal rings, and verify pneumatic pressure.',
        actionLabel: 'Issue Station Work Order',
        actionSuccessText:
          'Work Order #WO-89514-02 transmitted to Maitri Annex maintenance board. Tool set and replacement seal kit #MAI-SEAL-02 staged.',
        normalizedMetrics: [
          { label: 'Work Order ID', before: 'None', after: '#WO-89514-02 Logged' },
          { label: 'Assigned Tech', before: 'Unassigned', after: 'Maitri Mechanical Officer' },
          { label: 'Spares Staged', before: 'Depot', after: 'Gland Kit #MAI-SEAL-02' }
        ]
      }
    ] as SolutionOption[]
  };

  const currentDetails = isBharati ? bharatiDetails : maitriDetails;
  const appliedSolutionData = currentDetails.solutions.find((s) => s.id === activeSolution);

  const handleExecuteSolution = (sol: SolutionOption) => {
    setIsExecuting(true);
    setExecutionMessage(`Executing protocol: ${sol.title}...`);

    setTimeout(() => {
      setActiveSolution(sol.id);
      setIsExecuting(false);
      setExecutionMessage(null);
      playSuccessChime();
    }, 700);
  };

  const handleReset = () => {
    setActiveSolution(null);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-300/80 shadow-xl space-y-6 relative overflow-hidden">
      {/* Background subtle warning accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-100/50 via-rose-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* 1. TOP HEADER & PINPOINT CORRELATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-slate-950 shadow-sm animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 fill-slate-950" />
              <span>ACTIVE ANOMALY DETECTED AT PINPOINT</span>
            </span>

            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {currentDetails.pinpointTag}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#17213A] tracking-tight">
            {currentDetails.componentName}
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentDetails.location}</span>
          </p>
        </div>

        {/* View in 3D Button */}
        <button
          onClick={() => navigateTo('digital-twin')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-colors cursor-pointer self-start sm:self-auto border border-slate-200/80 shadow-xs"
          title="Jump to 3D Digital Twin Anomaly Beacon"
        >
          <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
          <span>VIEW PINPOINT IN 3D</span>
        </button>
      </div>

      {/* 2. "WHAT ISSUE IS THERE IN THE COMPONENT" (DETAILED DIAGNOSTIC) */}
      <div className="bg-[#FFFDF7] rounded-2xl p-4 sm:p-5 border border-amber-200/80 space-y-4 relative z-10">
        <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold">
                1. COMPONENT ISSUE ANALYSIS
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {currentDetails.issueTitle}
              </h3>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
            MTBF RISK: CRITICAL
          </span>
        </div>

        {/* Explanatory Narrative */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          {currentDetails.issueDescription}
        </p>

        {/* Sensor Telemetry Pill Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {currentDetails.metrics.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${m.color} transition-all`}
            >
              <div className="text-[10px] font-mono uppercase text-slate-500 font-medium">
                {m.label}
              </div>
              <div className="text-base font-extrabold tracking-tight mt-0.5 tabular-nums">
                {m.value}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                Nominal: {m.nominal}
              </div>
            </div>
          ))}
        </div>

        {/* Consequence Projection */}
        <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200/70 text-xs text-rose-900 flex items-start gap-2.5">
          <span className="text-rose-600 font-bold text-base leading-none">⚠️</span>
          <div>
            <span className="font-bold font-mono uppercase text-[10px] tracking-wider text-rose-800 block">
              FAILURE TIMELINE & CONSEQUENTIAL IMPACT:
            </span>
            <p className="mt-0.5 leading-relaxed">{currentDetails.consequenceRisk}</p>
          </div>
        </div>
      </div>

      {/* 3. "SOLUTIONS THAT CAN BE TAKEN" (ACTIONABLE REMEDIATIONS) */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-800 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                2. ACTIONABLE REMEDIATION PROCEDURES
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Solutions That Can Be Taken Immediately
              </h3>
            </div>
          </div>

          {activeSolution && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-colors cursor-pointer border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Anomaly</span>
            </button>
          )}
        </div>

        {/* If a solution has already been applied, show celebration / resolved state banner */}
        {appliedSolutionData && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 sm:p-5 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
                    REMEDIATION EXECUTED SUCCESSFULLY
                  </span>
                  <div className="text-sm font-bold text-emerald-950">
                    {appliedSolutionData.title}
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-mono font-bold shadow-xs">
                ● STATUS: RESOLVED
              </span>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed font-sans bg-white/70 p-3 rounded-xl border border-emerald-200">
              {appliedSolutionData.actionSuccessText}
            </p>

            {/* Normalized Telemetry Comparison */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold block mb-1.5">
                TELEMETRY NORMALIZATION RESULTS:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {appliedSolutionData.normalizedMetrics.map((nm, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs font-mono flex flex-col justify-between"
                  >
                    <span className="text-slate-500 text-[10px]">{nm.label}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="line-through text-slate-400 text-[11px]">{nm.before}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <span className="font-bold text-emerald-700 text-xs">{nm.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-emerald-800">
                Log record #LOG-{Date.now().toString().slice(-6)} committed to NCPOR telemetry stream.
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-mono font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
              >
                Test alternative solution →
              </button>
            </div>
          </div>
        )}

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {currentDetails.solutions.map((sol, index) => {
            const isSelected = activeSolution === sol.id;

            return (
              <div
                key={sol.id}
                className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      SOLUTION #{index + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${sol.badgeColor}`}
                    >
                      {sol.type}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#17213A] mb-1.5 leading-snug">
                    {sol.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
                    {sol.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    Est. recovery: ~2–5 mins
                  </span>

                  <button
                    disabled={isExecuting}
                    onClick={() => handleExecuteSolution(sol)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-[#17213A] hover:bg-[#25365e] text-white hover:shadow-md'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>RE-APPLY FIX</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{sol.actionLabel}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
