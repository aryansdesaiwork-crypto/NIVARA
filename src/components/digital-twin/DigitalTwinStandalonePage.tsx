import React from 'react';
import { useStation } from '../../context/StationContext';
import { DigitalTwin3D } from './DigitalTwin3D';
import { DigitalTwinBuildingCard } from './DigitalTwinBuildingCard';
import { Box, Layers, Compass, ArrowRight } from 'lucide-react';

export const DigitalTwinStandalonePage: React.FC = () => {
  const {
    stationLocation,
    buildings,
    selectedBuildingId,
    selectBuilding,
    navigateTo
  } = useStation();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#F4F8FE] rounded-2xl p-6 border border-[#D5E1F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Box className="w-4 h-4 text-[#617FF2]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#617FF2] font-semibold">
              HIGH-FIDELITY SPATIAL TELEMETRY
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#17213A] tracking-tight">
            3D DIGITAL TWIN & SPATIAL MESH
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Virtual physical replica of {stationLocation.name} Station. Inspect building modules, foundation stilts, heat trace conduits, and meteorological assets in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('overview')}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-semibold text-[#17213A] transition-colors"
          >
            Back to Overview
          </button>
        </div>
      </div>

      {/* Building Quick Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
          <Layers className="w-3.5 h-3.5" />
          <span>Modules:</span>
        </span>
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => selectBuilding(b.id)}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              selectedBuildingId === b.id
                ? 'bg-[#617FF2] text-white font-bold shadow-xs'
                : 'bg-[#F4F8FE] text-slate-700 hover:bg-white border border-[#D5E1F2]'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Large 3D Viewport */}
      <div className="bg-[#F4F8FE] rounded-3xl border border-[#D5E1F2] p-4 shadow-sm">
        <div className="rounded-2xl overflow-hidden border border-[#D5E1F2]">
          <DigitalTwin3D
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={(bId) => selectBuilding(bId)}
            className="h-[620px] lg:h-[700px]"
          />
        </div>
      </div>

      {/* Selected Building Card Inspector */}
      {selectedBuildingId && (
        <div>
          <DigitalTwinBuildingCard />
        </div>
      )}
    </div>
  );
};
