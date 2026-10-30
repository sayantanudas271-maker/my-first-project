import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext.tsx';
import {
  Boxes,
  Building,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Star,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.ts';

interface InventoryPageProps {
  onTriggerSkuWorkflow: (sku: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onTriggerSkuWorkflow }) => {
  const { inventory, vendors, refreshAll } = useWorkflow();
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'VENDORS'>('INVENTORY');
  const [updatingSku, setUpdatingSku] = useState<string | null>(null);

  const handleAdjustStock = async (sku: string, delta: number) => {
    setUpdatingSku(sku);
    try {
      await api.inventory.updateStock(sku, delta);
      await refreshAll();
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setUpdatingSku(null);
    }
  };

  const lowStockCount = inventory.filter((i) => i.stockLevel <= i.reorderPoint).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Inventory Telemetry & Vendor Operations Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock monitoring, safety threshold tracking, and certified supplier network
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'INVENTORY'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Warehouse Stock ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('VENDORS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'VENDORS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vendor Network ({vendors.length})
          </button>
        </div>
      </div>

      {activeTab === 'INVENTORY' ? (
        <div className="space-y-4">
          {lowStockCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <strong>{lowStockCount} SKU(s)</strong> are currently below their safety threshold or reorder point.
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-400">Autonomous Monitoring Enabled</span>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Warehouse & Depot</th>
                    <th className="py-3 px-4">Stock Level vs Thresholds</th>
                    <th className="py-3 px-4">Base Unit Price</th>
                    <th className="py-3 px-4">Primary Supplier</th>
                    <th className="py-3 px-4">Stock Adjust</th>
                    <th className="py-3 px-4 text-right">Autonomous Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inventory.map((item) => {
                    const isBelowReorder = item.stockLevel <= item.reorderPoint;
                    const isCritical = item.stockLevel <= item.safetyStock;
                    const stockPercent = Math.min(100, Math.round((item.stockLevel / (item.reorderPoint * 2)) * 100));

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{item.name}</div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono text-indigo-400 font-bold">{item.sku}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {item.warehouseLocation}
                        </td>

                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono font-bold text-slate-200">
                              {item.stockLevel} units
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Reorder: {item.reorderPoint}
                            </span>
                          </div>

                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isCritical
                                  ? 'bg-rose-500'
                                  : isBelowReorder
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.max(5, stockPercent)}%` }}
                            />
                          </div>

                          <span
                            className={`text-[9px] font-mono mt-1 inline-block ${
                              isCritical
                                ? 'text-rose-400 font-bold'
                                : isBelowReorder
                                ? 'text-amber-300 font-semibold'
                                : 'text-emerald-400'
                            }`}
                          >
                            {isCritical ? 'CRITICAL DEFICIT' : isBelowReorder ? 'BELOW REORDER POINT' : 'NORMAL BUFFER'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                          ${item.unitPrice.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-200 font-medium">{item.primaryVendorName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.primaryVendorEmail}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleAdjustStock(item.sku, -10)}
                              disabled={updatingSku === item.sku || item.stockLevel <= 0}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                              title="Simulate stock consumption (-10)"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item.sku, 25)}
                              disabled={updatingSku === item.sku}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                              title="Add stock (+25)"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onTriggerSkuWorkflow(item.sku)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium text-[11px] shadow-sm flex items-center space-x-1 ml-auto transition"
                          >
                            <Sparkles className="h-3 w-3 text-indigo-300" />
                            <span>Trigger Agent</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Vendors Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm space-y-3.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <Building className="h-4 w-4 text-indigo-400" />
                    {vendor.name}
                  </h3>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">{vendor.email}</p>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                    vendor.status === 'APPROVED'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {vendor.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Performance Rating</span>
                  <div className="flex items-center space-x-1 text-amber-400 font-bold mt-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{vendor.rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Standard Delivery SLA</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">
                    {vendor.standardLeadDays} Business Days
                  </span>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1.5">
                  Compliance Certifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.complianceCertifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 text-[10px] font-mono flex items-center gap-1"
                    >
                      <ShieldCheck className="h-3 w-3 text-indigo-400" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {vendor.volumeDiscountTier && (
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                  <span>Volume Tier Discount:</span>
                  <strong className="font-mono">
                    {vendor.volumeDiscountTier.discountPercent}% OFF (Min {vendor.volumeDiscountTier.minQuantity} units)
                  </strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
