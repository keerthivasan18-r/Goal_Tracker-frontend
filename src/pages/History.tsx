import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Loader2,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-react';
import api from '../services/api.js';
import { DailyGoal } from '../types/index.js';
import { GlassCard } from '../components/GlassCard.js';

export const History: React.FC = () => {
  const [history, setHistory] = useState<DailyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Reports
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      let query = `/history?sortBy=${sortBy}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (category) query += `&category=${category}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const res = await api.get(query);
      setHistory(res.data.history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [sortBy, category, startDate, endDate]); // refetch on filters, debounce search

  // Handle manual trigger search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    if (history.length === 0) return;

    // Headers
    const headers = ['Date', 'Goal Name', 'Category', 'Target Value', 'Completed Value', 'Unit', 'Status', 'Notes'];
    
    // Rows
    const rows = history.map((goal) => {
      const name = goal.template?.name || goal.customGoal?.name || 'Custom Goal';
      const cat = goal.template?.category || goal.customGoal?.category || 'Custom';
      const status = goal.isCompleted ? 'Completed' : 'In Progress';
      const date = new Date(goal.date).toLocaleDateString();
      const notes = goal.notes ? goal.notes.replace(/"/g, '""') : '';

      return [
        `"${date}"`,
        `"${name}"`,
        `"${cat}"`,
        goal.targetValue,
        goal.completedValue,
        `"${goal.unit}"`,
        `"${status}"`,
        `"${notes}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `goal_history_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Report Dispatcher (Calling Backend PDF generator)
  const handleGeneratePDFReport = async (type: 'weekly' | 'monthly') => {
    setGeneratingReport(type);
    setReportUrl(null);
    try {
      const res = await api.get(`/reports/${type}`);
      const pdfPath = res.data.pdfUrl;
      const fullUrl = `${window.location.origin}${pdfPath}`;
      setReportUrl(fullUrl);
      window.open(fullUrl, '_blank');
    } catch (error: any) {
      console.error('Failed to generate PDF report:', error);
      alert(error.response?.data?.error || 'Failed to generate PDF. Make sure you have tracked daily goals within the period.');
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Download triggers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200">History Logs</h2>
          <p className="text-xs text-slate-500 font-medium">Verify daily checks, filter logs, and export details.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export CSV
          </button>
          
          {/* Weekly PDF Report */}
          <button
            onClick={() => handleGeneratePDFReport('weekly')}
            disabled={generatingReport !== null}
            className="flex items-center gap-2 px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {generatingReport === 'weekly' ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <FileText className="h-4 w-4 text-blue-500" />
            )}
            Weekly PDF Report
          </button>

          {/* Monthly PDF Report */}
          <button
            onClick={() => handleGeneratePDFReport('monthly')}
            disabled={generatingReport !== null}
            className="flex items-center gap-2 px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {generatingReport === 'monthly' ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            ) : (
              <FileText className="h-4 w-4 text-indigo-500" />
            )}
            Monthly PDF Report
          </button>
        </div>
      </div>

      {reportUrl && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-blue-400 text-xs">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>PDF Report generated successfully! If it didn't open automatically, use the link on the right.</span>
          </div>
          <a href={reportUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold hover:underline">
            Open PDF <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Filter and Search Card */}
      <GlassCard>
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-550" />
              <input
                type="text"
                placeholder="Search goals or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 glass-input text-xs"
              />
            </div>

            {/* Category select */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 glass-input text-xs bg-slate-900"
            >
              <option value="">All Categories</option>
              <option value="Fitness">Fitness</option>
              <option value="Health">Health</option>
              <option value="Learning">Learning</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Work">Work</option>
            </select>

            {/* Start Date */}
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 h-3.5 w-3.5 text-slate-550 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 glass-input text-xs appearance-none"
              />
            </div>

            {/* End Date */}
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 h-3.5 w-3.5 text-slate-550 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 glass-input text-xs appearance-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-900/60">
            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-blue-400 font-semibold focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="date_desc">Newest Date</option>
                <option value="date_asc">Oldest Date</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setStartDate('');
                  setEndDate('');
                  setSortBy('date_desc');
                }}
                className="px-3.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </GlassCard>

      {/* Logs Table */}
      <GlassCard className="overflow-hidden !p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
            <span className="text-xs text-slate-500">Retrieving logs history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">
            No goal logs found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Goal / Metric</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Progress</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Daily Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {history.map((goal) => {
                  const name = goal.template?.name || goal.customGoal?.name || 'Custom Goal';
                  const cat = goal.template?.category || goal.customGoal?.category || 'Custom';
                  const percent = goal.targetValue > 0 ? (goal.completedValue / goal.targetValue) * 100 : 0;
                  
                  return (
                    <tr key={goal.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 whitespace-nowrap text-slate-350">
                        {new Date(goal.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4 font-bold text-slate-200">{name}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-slate-450">{cat}</span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap font-semibold text-slate-300">
                        {goal.completedValue} / {goal.targetValue} {goal.unit}
                        <span className="text-[10px] text-slate-500 ml-1">({percent.toFixed(0)}%)</span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {goal.isCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-900/30 text-[10px] font-bold text-emerald-400">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-900/30 text-[10px] font-bold text-blue-400">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 truncate max-w-xs" title={goal.notes || ''}>
                        {goal.notes || <span className="text-slate-650 italic">None</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
