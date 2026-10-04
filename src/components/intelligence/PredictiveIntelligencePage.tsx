import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { MOCK_PREDICTIONS } from '../../data/mockData';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Fuel,
  Zap,
  Droplet,
  CloudSnow
} from 'lucide-react';

export const PredictiveIntelligencePage: React.FC = () => {
  const { navigateTo } = useStation();
  const [selectedPrediction, setSelectedPrediction] = useState(MOCK_PREDICTIONS[0]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2]">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-semibold">
            NEURAL & THERMODYNAMIC FORECASTING
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#17213A] tracking-tight">
          PREDICTIVE INTELLIGENCE
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          "What is likely to happen?" Machine learning extrapolations of fuel depletion, thermal stress, and component fatigue across Antarctic polar cycles.
        </p>
      </div>

      {/* Main Grid: Prediction Models */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {MOCK_PREDICTIONS.map((pred) => {
          const isSelected = selectedPrediction.systemId === pred.systemId;
          const isMed = pred.riskLevel === 'MEDIUM';

          return (
            <div
              key={pred.systemId}
              onClick={() => setSelectedPrediction(pred)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#617FF2] shadow-md ring-2 ring-[#617FF2]/20'
                  : 'bg-[#F4F8FE] border-[#D5E1F2] hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    {pred.systemName}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isMed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {pred.riskLevel} RISK
                  </span>
                </div>

                <div className="text-2xl font-bold font-mono text-[#17213A]">
                  {pred.healthScore}% <span className="text-xs font-normal text-slate-500">Health Index</span>
                </div>

                <div className="text-xs font-mono text-slate-600 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Horizon: {pred.timeframe}</span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {pred.forecastSummary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#617FF2]">
                <span>Inspect Projection Curve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Prediction Detailed Forecast Curve */}
      <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#17213A]">
              Telemetry Decay Projection: {selectedPrediction.systemName}
            </h3>
            <p className="text-xs text-slate-500">
              Comparing baseline operational envelope against simulated wear curve.
            </p>
          </div>
          <button
            onClick={() => navigateTo('intelligence/what-if')}
            className="px-3.5 py-1.5 rounded-xl bg-[#617FF2] text-white text-xs font-semibold hover:bg-[#506ee0] transition-colors w-fit"
          >
            Simulate Alternate Weather Conditions
          </button>
        </div>

        {/* Forecast Visual Chart */}
        <div className="bg-white rounded-xl p-5 border border-[#D5E1F2]">
          <div className="h-52 flex items-end justify-between gap-4 px-4 pb-2 border-b border-slate-200">
            {selectedPrediction.forecastPoints.map((pt, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#617FF2]">
                  {pt.predictedValue}%
                </span>
                <div className="w-full flex items-end justify-center gap-1.5 h-32">
                  {/* Baseline Column */}
                  <div
                    className="w-3 bg-slate-200 rounded-t-sm"
                    style={{ height: `${pt.baselineValue * 1.2}px` }}
                    title={`Baseline: ${pt.baselineValue}%`}
                  />
                  {/* Predicted Column */}
                  <div
                    className={`w-3 rounded-t-sm ${
                      pt.predictedValue < 65 ? 'bg-amber-500' : 'bg-[#617FF2]'
                    }`}
                    style={{ height: `${pt.predictedValue * 1.2}px` }}
                    title={`Predicted: ${pt.predictedValue}%`}
                  />
                </div>
                <span className="text-xs font-mono text-slate-500">{pt.timestamp}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-200 rounded-sm" />
              <span>Standard Baseline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#617FF2] rounded-sm" />
              <span>AI Predicted Trajectory</span>
            </div>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="bg-white rounded-xl p-4 border border-[#D5E1F2]">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
            Governing Physical Factors
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {selectedPrediction.keyFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#617FF2] mt-1.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
