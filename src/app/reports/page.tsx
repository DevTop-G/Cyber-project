"use client";

import React, { useState, useEffect } from 'react';
// Triggering TS re-check
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, FileText,
  Trash2, ChevronDown, ChevronRight, Search, X, Clock, Activity,
} from 'lucide-react';
import { getScans, deleteScan, clearScans, ScanRecord } from '../../services/scan-history';

const RISK_CONFIG = {
  Safe:     { color: 'text-[var(--color-safe)]',    bg: 'bg-[var(--color-safe)]/10',    border: 'border-[var(--color-safe)]/30' },
  Low:      { color: 'text-blue-400',               bg: 'bg-blue-400/10',               border: 'border-blue-400/30' },
  Medium:   { color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning)]/10', border: 'border-[var(--color-warning)]/30' },
  High:     { color: 'text-orange-500',             bg: 'bg-orange-500/10',             border: 'border-orange-500/30' },
  Critical: { color: 'text-[var(--color-danger)]',  bg: 'bg-[var(--color-danger)]/10',  border: 'border-[var(--color-danger)]/30' },
} as const;

type RiskFilter = 'All' | keyof typeof RISK_CONFIG;
type TimeRange = 'All Time' | 'This Week' | 'This Month' | 'Last 3 Months';

export default function ReportsPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [filter, setFilter] = useState<RiskFilter>('All');
  const [timeFilter, setTimeFilter] = useState<TimeRange>('All Time');
  const [pendingTimeFilter, setPendingTimeFilter] = useState<TimeRange>('All Time');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setScans(getScans());
  }, []);

  const filtered = scans.filter(s => {
    // Risk Level Filter
    const matchesRisk = filter === 'All' || s.result.riskLevel === filter;
    
    // Search Filter
    const matchesSearch = !search || 
      s.input.toLowerCase().includes(search.toLowerCase()) ||
      s.result.threatType.toLowerCase().includes(search.toLowerCase());
    
    // Time Filter
    const scanDate = new Date(s.timestamp);
    const now = new Date();
    let matchesTime = true;
    
    if (timeFilter === 'This Week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      matchesTime = scanDate >= oneWeekAgo;
    } else if (timeFilter === 'This Month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      matchesTime = scanDate >= oneMonthAgo;
    } else if (timeFilter === 'Last 3 Months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      matchesTime = scanDate >= threeMonthsAgo;
    }

    return matchesRisk && matchesSearch && matchesTime;
  });

  const handleDelete = (id: string) => {
    deleteScan(id);
    setScans(prev => prev.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleClearAll = () => {
    clearScans();
    setScans([]);
    setExpandedId(null);
    setConfirmClear(false);
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Forensic Reports</h2>
              <p className="text-slate-600 font-medium">Full history of all threat analyses and identified attack vectors.</p>
            </div>
            {scans.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Delete all records?</span>
                  <button onClick={handleClearAll} className="px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                    Confirm
                  </button>
                  <button onClick={() => setConfirmClear(false)} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )
            )}
          </header>

          {/* Stats Bar */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Scans</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-slate-900 leading-none">{scans.length}</p>
                <Activity className="w-5 h-5 text-slate-300" />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Identified Attacks</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-red-500 leading-none">
                  {scans.filter(s => s.result.riskLevel !== 'Safe').length}
                </p>
                <ShieldAlert className="w-5 h-5 text-red-200" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm sm:col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sources of Identification</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(
                  scans.reduce((acc, s) => {
                    acc[s.source || 'Direct Message'] = (acc[s.source || 'Direct Message'] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([source, count], idx) => (
                  <div key={source} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-700">{source}:</span>
                    <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-1.5 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm sm:col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Likely Threat Actors</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(
                  scans.reduce((acc, s) => {
                    const actor = s.result.detailedScores?.attackerActor || 'Unknown';
                    acc[actor] = (acc[actor] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([actor, count]) => (
                  <div key={actor} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-[100px]">{actor}:</span>
                    <span className="text-[10px] font-black text-[var(--color-primary)] bg-[var(--color-primary)]/5 px-1.5 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Attack Categories Summary */}
          {scans.length > 0 && (
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" />
                  Attack Categorization (Occurrences)
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(
                  scans.reduce((acc, s) => {
                    if (s.result.riskLevel !== 'Safe') {
                      acc[s.result.threatType] = (acc[s.result.threatType] || 0) + 1;
                      s.result.detailedScores?.attackCategories?.forEach(c => {
                        acc[c] = (acc[c] || 0) + 1;
                      });
                    }
                    return acc;
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([cat, count]) => (
                  <div key={cat} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate w-full mb-1">{cat}</span>
                    <span className="text-xl font-black text-slate-900">{count}</span>
                  </div>
                ))}
                {scans.filter(s => s.result.riskLevel !== 'Safe').length === 0 && (
                  <div className="col-span-full py-4 text-center">
                    <p className="text-sm text-slate-400 font-medium italic">No active threats identified in analyzed samples.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search + Filter bar */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by input content or threat type..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)]/50 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  isFilterOpen || timeFilter !== 'All Time' 
                  ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                {timeFilter === 'All Time' ? 'Time Filter' : timeFilter}
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-4 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {(['All Time', 'This Week', 'This Month', 'Last 3 Months'] as TimeRange[]).map(range => (
                        <label key={range} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group">
                          <input 
                            type="checkbox" 
                            checked={pendingTimeFilter === range}
                            onChange={() => setPendingTimeFilter(range)}
                            className="w-5 h-5 rounded-md border-slate-300 bg-white text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                            {range}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => {
                          setTimeFilter(pendingTimeFilter);
                          setIsFilterOpen(false);
                        }}
                        className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[var(--color-primary)]/20 active:scale-95"
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest self-center mr-2">Risk Level:</span>
              {(['All', 'Safe', 'Low', 'Medium', 'High', 'Critical'] as RiskFilter[]).map(lvl => {
                const isActive = filter === lvl;
                const cfg = lvl !== 'All' ? RISK_CONFIG[lvl] : null;
                return (
                  <button
                    key={lvl}
                    onClick={() => setFilter(lvl)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isActive
                        ? lvl === 'All'
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30'
                          : `${cfg!.bg} ${cfg!.color} ${cfg!.border}`
                        : 'bg-transparent text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count */}
          {scans.length > 0 && (
            <p className="text-sm text-slate-500">
              Showing <span className="text-slate-900 font-semibold">{filtered.length}</span> of <span className="text-slate-900 font-semibold">{scans.length}</span> scans
            </p>
          )}

          {/* List */}
          {filtered.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-slate-300 mb-4 opacity-50" />
              <p className="text-slate-900 font-bold text-lg">
                {scans.length === 0 ? 'No reports yet' : 'No results match your filters'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {scans.length === 0
                  ? 'Run your first scan from the Scanner page.'
                  : 'Try adjusting your search or filter settings.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {filtered.map((scan, i) => {
                  const cfg = RISK_CONFIG[scan.result.riskLevel as keyof typeof RISK_CONFIG];
                  const isExpanded = expandedId === scan.id;
                  return (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className={`glass-panel rounded-2xl border overflow-hidden ${cfg.border}`}
                    >
                      {/* Row */}
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                      >
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                          {scan.result.riskLevel === 'Safe'
                            ? <ShieldCheck className={`w-5 h-5 ${cfg.color}`} />
                            : ['High', 'Critical'].includes(scan.result.riskLevel)
                              ? <ShieldAlert className={`w-5 h-5 ${cfg.color}`} />
                              : <AlertTriangle className={`w-5 h-5 ${cfg.color}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 truncate font-semibold">{scan.input}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                             <span className="text-xs text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                               <Clock className="w-3 h-3" />
                               {new Date(scan.timestamp).toLocaleString('en-US', {
                                 month: 'short', day: 'numeric', year: 'numeric',
                                 hour: '2-digit', minute: '2-digit',
                               })}
                             </span>
                             <div className="flex items-center gap-1.5 ml-1">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Forensic Origin:</span>
                               <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                                 {scan.source || 'Direct Message'}
                               </span>
                             </div>
                             <div className="flex items-center gap-1.5 ml-1">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Threat Actor:</span>
                               <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200 flex items-center gap-1">
                                 <ShieldAlert className="w-2.5 h-2.5" />
                                 {scan.result.detailedScores?.attackerActor || 'Organized Criminal Groups'}
                               </span>
                             </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            {scan.result.riskLevel}
                          </span>
                          <span className="text-xs text-slate-500 tabular-nums w-10 text-right">
                            {scan.result.confidenceScore}%
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(scan.id); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-slate-400" />
                            : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-[var(--color-border)]"
                          >
                            <div className="p-6 space-y-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Explanation</h4>
                                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{scan.result.explanation}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" /> Identification Source
                                  </h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                                      <span className="text-xs font-bold text-slate-500">Forensic Origin:</span>
                                      <span className="text-xs font-black text-slate-900">{scan.source || 'Direct Message'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                                      <span className="text-xs font-bold text-slate-500">Attacker Profile:</span>
                                      <span className="text-xs font-black text-red-600">{scan.result.detailedScores?.attackerActor || 'Organized Criminal Groups'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                                      <span className="text-xs font-bold text-slate-500">Sample Date:</span>
                                      <span className="text-xs font-black text-slate-900">
                                        {new Date(scan.timestamp).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                                      <span className="text-xs font-bold text-slate-500">Threat Signature:</span>
                                      <span className="text-xs font-black text-red-600">{scan.result.threatType}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Search className="w-3.5 h-3.5" /> Key Indicators
                                  </h4>
                                  <ul className="space-y-2">
                                    {scan.result.indicators.map((ind, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                        <ChevronRight className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                                        <span>{ind}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Recommendations
                                  </h4>
                                  <ul className="space-y-2">
                                    {scan.result.recommendations.map((rec, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                        <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center shrink-0 border border-[var(--color-accent)]/20 text-xs font-bold mt-0.5">
                                          {idx + 1}
                                        </span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary)]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-accent)]/5 blur-[120px] pointer-events-none" />
    </main>
  );
}
