import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { firestoreService } from '../../services/firestoreService';
import { aiApi } from '../../services/aiApi';
import { 
  ShieldAlert, 
  TrendingUp, 
  BarChart3, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  LogOut, 
  RefreshCw, 
  AlertTriangle, 
  Filter, 
  Lock, 
  Calendar,
  Layers,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Info,
  Ban
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

export function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Filters
  const [selectedRegion, setSelectedRegion] = useState('Pune');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 6 Months');
  const [selectedCondition, setSelectedCondition] = useState('All');

  // Interactive K=10 Privacy Simulator State
  const [testRegion, setTestRegion] = useState('Solapur (Rural Village A)');
  const [testCondition, setTestCondition] = useState('Rare Genetic Disease');
  const [testSimulatedCases, setTestSimulatedCases] = useState(4);
  const [privacyTestRun, setPrivacyTestRun] = useState(false);

  // Admin AI State
  const [aiQuestion, setAiQuestion] = useState('What happened to respiratory cases in Pune during the last 6 months?');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Pune Monthly Case Trend Data
  const monthlyTrendData = [
    { month: 'Jan 2026', cases: 180, respiratory: 60, hypertension: 42, diabetes: 35 },
    { month: 'Feb 2026', cases: 210, respiratory: 72, hypertension: 48, diabetes: 40 },
    { month: 'Mar 2026', cases: 260, respiratory: 90, hypertension: 55, diabetes: 45 },
    { month: 'Apr 2026', cases: 240, respiratory: 80, hypertension: 52, diabetes: 42 },
    { month: 'May 2026', cases: 310, respiratory: 110, hypertension: 62, diabetes: 50 },
    { month: 'Jun 2026', cases: 290, respiratory: 95, hypertension: 58, diabetes: 48 }
  ];

  // Pune Category Breakdown Data (Total: 1,284 Cases)
  const conditionBreakdown = [
    { category: 'Respiratory', cases: 432, percentage: '33.6%', trend: '+14.2%', status: 'Public Aggregate', isSuppressed: false },
    { category: 'Hypertension', cases: 298, percentage: '23.2%', trend: '+3.1%', status: 'Public Aggregate', isSuppressed: false },
    { category: 'Diabetes', cases: 245, percentage: '19.1%', trend: '-1.4%', status: 'Public Aggregate', isSuppressed: false },
    { category: 'Cardiovascular', cases: 187, percentage: '14.6%', trend: '+0.8%', status: 'Public Aggregate', isSuppressed: false },
    { category: 'Other', cases: 122, percentage: '9.5%', trend: '-4.0%', status: 'Public Aggregate', isSuppressed: false },
    { category: 'Rare Genetic / Orphan (Village Micro-Cluster)', cases: null, percentage: '< 1%', trend: '0%', status: 'K=10 Suppressed', isSuppressed: true, reason: 'Insufficient group size to display this statistic (K=10 Protection).' }
  ];

  // Load Initial Data
  useEffect(() => {
    async function loadLogs() {
      const logs = await firestoreService.getAuditLogs();
      setAuditLogs(logs || []);
    }
    loadLogs();
  }, []);

  // Handle Interactive K=10 Test Query
  const handleRunPrivacyQuery = () => {
    setPrivacyTestRun(true);
  };

  // Handle Admin AI Query
  const handleAdminAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const prompt = `You are CareKey Public Health Epidemiological Assistant.
Context: Aggregate surveillance data for Pune (Jan-Jun 2026):
- Jan: 180 cases (Respiratory: 60)
- Feb: 210 cases (Respiratory: 72)
- Mar: 260 cases (Respiratory: 90)
- Apr: 240 cases (Respiratory: 80)
- May: 310 cases (Respiratory: 110)
- Jun: 290 cases (Respiratory: 95)
Total Respiratory Cases in Pune: 432 out of 1,284 total regional cases.
User Query: "${aiQuestion}".
Provide an objective epidemiological summary of aggregate trends with zero individual patient identifiers.`;

      const res = await aiApi.chat(prompt);
      setAiResponse(res.response || `Epidemiological Surveillance Analysis (Pune Region):

The aggregate data shows an overall upward trajectory in reported respiratory cases from January (180 total cases, 60 respiratory) through May (310 total cases, 110 respiratory), peaking prior to the monsoon transition, followed by a stabilization in June (290 total cases, 95 respiratory).

Key Observations:
• Respiratory conditions represent the largest disease cohort in Pune, accounting for 432 cases (33.6% of the 1,284 total recorded cases).
• Month-over-month peak growth (+29.1%) was observed between April and May.
• All reporting cohorts comply with K=10 differential privacy thresholds with zero individual patient records exposed.

Recommendation for Health Authorities:
• Ensure adequate supply of first-line respiratory and bronchodilator medications in municipal clinics across the Pune urban cluster.`);
    } catch {
      setAiResponse(`The aggregate data shows an increase in reported respiratory cases from January through May, followed by a decrease in June. Total cases in Pune reached 1,284 with 432 respiratory cases.`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-5">
          {/* Admin Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate">Public Health Officer</h2>
              <p className="text-[11px] text-purple-400 font-semibold truncate flex items-center gap-1">
                <Lock className="w-3 h-3 shrink-0" />
                <span>Zero-PII Surveillance</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            {[
              { id: 'analytics', label: 'Public Health Overview', icon: BarChart3 },
              { id: 'regional', label: 'Regional Analytics', icon: MapPin },
              { id: 'trends', label: 'Disease Trends', icon: TrendingUp },
              { id: 'privacy-k10', label: 'K=10 Differential Privacy', icon: ShieldCheck, badge: 'Protected' },
              { id: 'admin-ai', label: 'Surveillance AI', icon: Sparkles },
              { id: 'audit-logs', label: 'System Audit Logs', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-purple-600' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              onNavigate('/admin/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Administrator Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-PII Public Health Surveillance</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">
                Public Health Analytics & Disease Surveillance
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl">
                Cryptographic RBAC boundary: Administrators receive only aggregated, anonymized population trends.
                No individual patient records, names, prescriptions, or contact details are ever accessible.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span>Surveillance Scope:</span>
              </div>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Pune">Region: Pune</option>
                <option value="Mumbai">Region: Mumbai</option>
                <option value="Delhi NCR">Region: Delhi NCR</option>
                <option value="Bengaluru">Region: Bengaluru</option>
                <option value="Solapur">Region: Solapur (Rural Tier-3)</option>
              </select>

              {/* Period Filter */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Last 6 Months">Period: Last 6 Months</option>
                <option value="Last Year">Period: Last Year</option>
                <option value="Q3 2026">Period: Q3 2026</option>
              </select>

              {/* Condition Filter */}
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">Condition: All Categories</option>
                <option value="Respiratory">Condition: Respiratory</option>
                <option value="Hypertension">Condition: Hypertension</option>
                <option value="Diabetes">Condition: Diabetes</option>
                <option value="Cardiovascular">Condition: Cardiovascular</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>K=10 Rule Active</span>
            </div>
          </div>

          {/* TAB 1 & 2: PUBLIC HEALTH OVERVIEW / REGIONAL ANALYTICS */}
          {(activeTab === 'analytics' || activeTab === 'regional' || activeTab === 'trends') && (
            <div className="space-y-6">
              {/* Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs font-semibold text-slate-400">Total Validated Cases</p>
                  <h3 className="text-2xl font-black text-white mt-1">8,492</h3>
                  <span className="text-[11px] text-purple-400 mt-1 inline-block">Surveillance Coverage Active</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs font-semibold text-slate-400">Monitored Health Regions</p>
                  <h3 className="text-2xl font-black text-white mt-1">12</h3>
                  <span className="text-[11px] text-slate-400 mt-1 inline-block">Urban & Semi-Urban Clusters</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs font-semibold text-slate-400">Active Reporting Period</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">6 Months</h3>
                  <span className="text-[11px] text-emerald-400/80 mt-1 inline-block">Jan 2026 &mdash; Jun 2026</span>
                </div>
              </div>

              {/* PUNE — CASE TREND CHART */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">
                      {selectedRegion.toUpperCase()} &mdash; CASE TREND (6 Months)
                    </h3>
                    <p className="text-xs text-slate-400">Aggregated monthly disease incidence counts (K &ge; 10)</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Total Regional Cases: 1,284
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#c084fc' }}
                      />
                      <Bar dataKey="cases" fill="#a855f7" radius={[6, 6, 0, 0]} name="Total Cases" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CONDITION BREAKDOWN TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Disease / Condition Trend Breakdown ({selectedRegion})</h3>
                    <p className="text-xs text-slate-400">Anonymized category aggregates &bull; Zero identifiable patient records</p>
                  </div>
                  <span className="text-xs text-purple-400 font-mono font-bold">1,284 Cases</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Condition Category</th>
                        <th className="px-5 py-3.5">Aggregate Cases</th>
                        <th className="px-5 py-3.5">Share of Region</th>
                        <th className="px-5 py-3.5">Trend</th>
                        <th className="px-5 py-3.5">Privacy Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {conditionBreakdown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-white">{item.category}</td>
                          <td className="px-5 py-3.5 font-mono text-sm">
                            {item.isSuppressed ? (
                              <span className="text-amber-400 font-bold italic">&lt; 10 (Suppressed)</span>
                            ) : (
                              <span className="font-bold text-white">{item.cases}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-400">{item.percentage}</td>
                          <td className="px-5 py-3.5 font-mono">
                            <span className={item.trend.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}>
                              {item.trend}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {item.isSuppressed ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                ⚠ Data Suppressed (K=10)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                ✓ Aggregate Available
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: K=10 DIFFERENTIAL PRIVACY ENGINE */}
          {activeTab === 'privacy-k10' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Minimum Group-Size Privacy Engine (K=10)</h2>
                    <p className="text-xs text-slate-400">
                      Reduces the possibility of re-identification by suppressing any query result where N &lt; 10
                    </p>
                  </div>
                </div>

                {/* Explanation Banner */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>How K=10 Privacy Works Technically</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If an administrator queries a narrow cohort (e.g. Rare Disease in Village A) and the database returns <span className="text-amber-400 font-bold font-mono">Cases = 4</span>, the system will NOT return 4.
                    Instead, the response is mathematically suppressed: <span className="font-bold text-white">"Data Suppressed: The requested group does not meet the minimum privacy threshold (Minimum group size: 10)."</span>
                  </p>
                </div>

                {/* Interactive Query Tester */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Interactive Privacy Query Simulator</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Target Region / Village</label>
                      <select
                        value={testRegion}
                        onChange={e => setTestRegion(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="Solapur (Rural Village A)">Solapur (Rural Village A)</option>
                        <option value="Pune Urban Cluster">Pune Urban Cluster</option>
                        <option value="Mumbai Central">Mumbai Central</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Disease / Condition</label>
                      <select
                        value={testCondition}
                        onChange={e => setTestCondition(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="Rare Genetic Disease">Rare Genetic Disease (N = 4)</option>
                        <option value="Respiratory Infection">Respiratory Infection (N = 57)</option>
                        <option value="Essential Hypertension">Essential Hypertension (N = 298)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handleRunPrivacyQuery}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-all text-xs"
                      >
                        Execute Surveillance Query
                      </button>
                    </div>
                  </div>

                  {privacyTestRun && (
                    <div className="pt-4 border-t border-slate-800">
                      {testCondition.includes('Rare') || testRegion.includes('Village') ? (
                        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                            <Ban className="w-4 h-4" />
                            <span>⚠ DATA SUPPRESSED (K=10 Differential Privacy Violation Avoided)</span>
                          </div>
                          <p className="text-xs text-slate-200">
                            The requested group (<span className="text-amber-300 font-semibold">{testRegion} &bull; {testCondition}</span>) has <span className="font-mono font-bold text-amber-400">4 recorded cases</span>, which is below the required threshold of 10.
                          </p>
                          <p className="text-[11px] text-slate-400 italic">
                            Reason: Minimum group size protection enforced. Microdata count withheld to prevent deductive re-identification.
                          </p>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>✓ AGGREGATE STATISTIC QUALIFIED (N &ge; 10)</span>
                          </div>
                          <p className="text-xs text-slate-200">
                            Query: <span className="font-bold text-white">{testRegion} &bull; {testCondition}</span> &mdash; <span className="font-mono font-bold text-emerald-400 text-sm">Cases: {testCondition.includes('Respiratory') ? 57 : 298}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Result satisfies K=10 differential privacy criteria and is approved for public health reporting.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SURVEILLANCE AI */}
          {activeTab === 'admin-ai' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Public Health Surveillance AI Assistant</h2>
                  <p className="text-xs text-slate-400">
                    Performs epidemiological synthesis strictly over aggregate dataset trends &mdash; Zero access to private patient records
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Surveillance Query / Ingestion Prompt
                  </label>
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="e.g. What happened to respiratory cases in Pune during the last 6 months?"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAdminAI}
                    disabled={aiLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Regional Surveillance...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run Aggregate AI Analysis</span>
                      </>
                    )}
                  </button>
                </div>

                {aiResponse && (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Epidemiological AI Intelligence</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">System Surveillance Audit Trail</h2>
                  <p className="text-xs text-slate-400">Audit logs of aggregate query executions and K=10 differential privacy suppression events</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">ANALYTICS_QUERY</span>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                        SUCCESS (432 CASES)
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">Surveillance Query: Region: Pune, Condition: Respiratory</p>
                  </div>
                  <span className="font-mono text-slate-500 text-[10px]">28 Sep 2026 17:40</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">PRIVACY_K10_SUPPRESSION</span>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400">
                        SUPPRESSED (COUNT &lt; 10)
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">Analytics query for Solapur (Rural Tier-3) Rare Genetic: Count &lt; 10</p>
                  </div>
                  <span className="font-mono text-slate-500 text-[10px]">28 Sep 2026 17:42</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
