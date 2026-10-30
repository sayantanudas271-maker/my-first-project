import React, { useState } from 'react';
import { api } from '../services/api.ts';
import {
  Globe,
  Search,
  ExternalLink,
  X,
  Loader2,
  Sparkles,
  MapPin,
  Building2,
  Navigation,
} from 'lucide-react';

interface MarketSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GroundingMode = 'SEARCH' | 'MAPS';

export const MarketSearchModal: React.FC<MarketSearchModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<GroundingMode>('SEARCH');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Search Results
  const [searchResult, setSearchResult] = useState<{
    summary: string;
    groundingSources: Array<{ title: string; url: string }>;
    searchQueries: string[];
  } | null>(null);

  // Maps Results
  const [mapsResult, setMapsResult] = useState<{
    summary: string;
    places: Array<{ title: string; uri: string; address?: string }>;
  } | null>(null);

  if (!isOpen) return null;

  const searchPresets = [
    'Global servomotor actuator lead times and shortages 2026',
    'Titanium grade-5 aerospace fasteners commodity price trend',
    'Industrial electronics semiconductor supply chain bottlenecks',
    'ISO-9001 and ITAR export compliance updates for manufacturing',
  ];

  const mapsPresets = [
    'Precision CNC machine shops and casting foundries near Austin TX',
    'Intermodal freight terminals and container depots in Chicago IL',
    'Aerospace precision fasteners distributors and certified suppliers in California',
    'Industrial robotics assembly and servomotor calibration centers in Detroit MI',
  ];

  const handleExecute = async (queryText: string, currentMode: GroundingMode = mode) => {
    if (!queryText.trim() || isLoading) return;
    setIsLoading(true);

    try {
      if (currentMode === 'SEARCH') {
        const data = await api.copilot.searchMarket(queryText.trim());
        setSearchResult(data);
      } else {
        const data = await api.copilot.searchMaps(queryText.trim());
        setMapsResult(data);
      }
    } catch (err) {
      console.error('Grounding execution failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-indigo-500/40 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              mode === 'SEARCH'
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {mode === 'SEARCH' ? <Globe className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Supply Chain Grounding Intelligence
                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                  mode === 'SEARCH'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {mode === 'SEARCH' ? 'Google Search Tool' : 'Google Maps Tool'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Live external data grounded with gemini-3.8-flash for autonomous logistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => {
              setMode('SEARCH');
              setQuery('');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              mode === 'SEARCH'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Market Intelligence (Google Search)</span>
          </button>
          <button
            onClick={() => {
              setMode('MAPS');
              setQuery('');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              mode === 'MAPS'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Supplier Facilities & Logistics (Google Maps)</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecute(query);
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === 'SEARCH'
                    ? 'Search real-time supply chain trends, tariff changes, vendor news...'
                    : 'Locate certified machine shops, freight depots, distribution hubs...'
                }
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`px-4 py-2 rounded-xl text-white font-semibold text-xs transition flex items-center space-x-1.5 disabled:opacity-50 ${
                mode === 'SEARCH'
                  ? 'bg-cyan-600 hover:bg-cyan-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>{mode === 'SEARCH' ? 'Analyze' : 'Locate'}</span>
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-[10px] pb-1">
            <span className="text-slate-500 uppercase font-mono mr-1">Suggested:</span>
            {(mode === 'SEARCH' ? searchPresets : mapsPresets).map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleExecute(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {isLoading && (
            <div className="p-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className={`h-8 w-8 animate-spin ${mode === 'SEARCH' ? 'text-cyan-400' : 'text-emerald-400'}`} />
              <p className="text-slate-400 font-mono text-xs">
                Querying {mode === 'SEARCH' ? 'Google Search Grounding' : 'Google Maps Grounding'} via gemini-3.8-flash...
              </p>
            </div>
          )}

          {/* SEARCH RESULTS */}
          {!isLoading && mode === 'SEARCH' && searchResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-300 font-semibold text-xs">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Grounded Market Analysis</span>
                </div>
                <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line font-sans">
                  {searchResult.summary}
                </div>
              </div>

              {searchResult.groundingSources.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
                    Grounded Web Sources & Citations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResult.groundingSources.map((source, i) => (
                      <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition flex items-center justify-between group"
                      >
                        <span className="truncate text-[11px] font-medium pr-2">
                          {source.title}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MAPS RESULTS */}
          {!isLoading && mode === 'MAPS' && mapsResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-xs">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span>Logistics & Facilities Synthesis</span>
                </div>
                <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line font-sans">
                  {mapsResult.summary}
                </div>
              </div>

              {mapsResult.places.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-semibold block flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5" />
                    Verified Facilities with Google Maps URIs (Clickable):
                  </span>
                  <div className="space-y-2">
                    {mapsResult.places.map((place, idx) => (
                      <a
                        key={idx}
                        href={place.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-200 transition flex items-center justify-between group block"
                      >
                        <div className="space-y-1 pr-3">
                          <div className="font-semibold text-xs text-emerald-300 group-hover:text-emerald-200 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{place.title}</span>
                          </div>
                          {place.address && (
                            <p className="text-[11px] text-slate-400">{place.address}</p>
                          )}
                          <p className="text-[10px] text-emerald-500/80 font-mono truncate max-w-md">
                            {place.uri}
                          </p>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1 shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                          <span>View on Maps</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !searchResult && !mapsResult && (
            <div className="p-8 text-center text-slate-500 italic">
              Select an inquiry preset or enter a custom prompt above to inspect live grounded supply chain data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
