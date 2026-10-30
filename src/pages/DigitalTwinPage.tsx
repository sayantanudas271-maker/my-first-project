import React from 'react';
import { WarehouseDigitalTwin } from '../components/WarehouseDigitalTwin.tsx';
import {
  Boxes,
  Cpu,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  Bot,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext.tsx';

interface DigitalTwinPageProps {
  onOpenNewWorkflow: () => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ onOpenNewWorkflow }) => {
  const { inventory } = useWorkflow();

  const agvRoster = [
    { id: 'AGV-01', status: 'In Transit', target: 'Bay 4B (SKU-9020)', battery: '94%', load: 'Servomotor Actuators' },
    { id: 'AGV-02', status: 'Docked / Charging', target: 'Depot Station A', battery: '100%', load: 'Empty Flatbed' },
    { id: 'AGV-03', status: 'Picking Queue', target: 'Rack 12 (SKU-4011)', battery: '82%', load: 'Aerospace Fasteners' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-indigo-400" />
            3D Autonomous Warehouse Digital Twin
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Three.js spatial simulation of Autonomous Guided Vehicles (AGVs), high-bay racks, and robotic cells
          </p>
        </div>

        <button
          onClick={onOpenNewWorkflow}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Dispatch AGV Mission</span>
        </button>
      </div>

      {/* 3D Scene */}
      <WarehouseDigitalTwin />

      {/* AGV Fleet Telemetry & High-Bay Inventory Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AGV Telemetry Cards */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-400" />
              Autonomous Mobile Robots (AGV) Fleet Telemetry
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Fleet Mesh: 100% Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {agvRoster.map((agv) => (
              <div
                key={agv.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-300">{agv.id}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      agv.status.includes('Transit')
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {agv.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="text-slate-400">
                    Target: <span className="text-slate-200 font-medium">{agv.target}</span>
                  </div>
                  <div className="text-slate-400">
                    Cargo: <span className="text-slate-200">{agv.load}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Battery: {agv.battery}</span>
                  <span>LiDAR: Locked</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spatial Zone Specs */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Digital Twin Zone Specs
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Warehouse Footprint:</span>
              <span className="font-mono text-slate-200">80m x 80m High-Bay</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Rendering Engine:</span>
              <span className="font-mono text-indigo-300 font-semibold">Three.js PBR Studio</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Procedural Model Count:</span>
              <span className="font-mono text-slate-200">32 Composite Parts</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Active Navigation Racetrack:</span>
              <span className="font-mono text-emerald-400">Optical Waypoint Loop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
