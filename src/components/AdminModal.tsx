import React, { useState, useEffect } from 'react';
import {
  X, ExternalLink, Database, Users, Calendar, MessageSquare,
  Shield, CheckCircle2, RefreshCw, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'iframe'>('overview');

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (e) {
      console.error('Error loading admin stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Admin Dashboard & SQLite Repository</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  SQLite · SQLAlchemy · Jinja2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect registered athletes, generated workout plans, feedback modifications, and responsive Jinja2 views.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/admin"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Open Responsive Jinja2 Dashboard in New Window"
            >
              <span>Open Full Jinja2 Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-t border-x ${
                activeTab === 'overview'
                  ? 'bg-slate-900 border-slate-800 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              SQLite Database Records ({users.length} Athletes)
            </button>
            <button
              onClick={() => setActiveTab('iframe')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-t border-x flex items-center gap-1.5 ${
                activeTab === 'iframe'
                  ? 'bg-slate-900 border-slate-800 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>Live Jinja2 Responsive Preview</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 pb-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'overview' ? (
            <>
              {/* Quick Metrics */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400">TOTAL ATHLETES</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{stats.totalUsers}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">SQLite table: users</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400">WORKOUT PLANS</div>
                    <div className="text-2xl font-extrabold text-sky-400 mt-1">{stats.totalPlans}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">SQLite table: workout_plans</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400">INTENSITY TIERS</div>
                    <div className="text-xs font-mono font-bold text-white mt-2 flex items-center gap-1.5">
                      <span className="text-sky-400">{stats.intensityDistribution.low} Low</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-emerald-400">{stats.intensityDistribution.medium} Med</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-amber-400">{stats.intensityDistribution.high} High</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400">FEEDBACK ADAPTATIONS</div>
                    <div className="text-2xl font-extrabold text-purple-400 mt-1">{stats.totalFeedbacks}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">table: feedback_logs</div>
                  </div>
                </div>
              )}

              {/* Athletes and Plans Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="text-sm font-bold text-white">Registered Users & Assigned Workout Programs</div>
                  <span className="text-[11px] font-mono text-slate-400">Loaded from fitbuddy.db</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                        <th className="p-3">Athlete</th>
                        <th className="p-3">Goal</th>
                        <th className="p-3">Intensity</th>
                        <th className="p-3">Equipment</th>
                        <th className="p-3">Active Plan</th>
                        <th className="p-3">Completed</th>
                        <th className="p-3 text-right">Jinja2 View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </td>
                          <td className="p-3">
                            <span className="capitalize text-slate-300 font-medium">
                              {u.primary_goal.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              u.workout_intensity === 'low'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                                : u.workout_intensity === 'high'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {u.workout_intensity || 'medium'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[11px]">
                            {u.availableEquipment?.length || 0} items
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-white max-w-[180px] truncate">
                              {u.latest_plan_title || 'No plan yet'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {u.plans_count} plan(s) recorded
                            </div>
                          </td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">
                            {u.sessions_count} sessions
                          </td>
                          <td className="p-3 text-right">
                            <a
                              href={`/admin/user/${u.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                            >
                              <span>Inspect</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-[650px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <iframe
                src="/admin"
                title="FitBuddy Jinja2 Admin Portal"
                className="w-full h-full border-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>SQLite WAL persistent storage: <code className="font-mono text-white">fitbuddy.db</code></span>
          </div>

          <a
            href="/admin/database"
            target="_blank"
            rel="noreferrer"
            className="text-slate-300 hover:text-white transition-colors underline flex items-center gap-1"
          >
            <span>View SQLAlchemy Schema & Table DDL</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
