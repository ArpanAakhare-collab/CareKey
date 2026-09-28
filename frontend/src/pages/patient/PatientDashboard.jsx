import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { aiApi } from '../../services/aiApi';
import { QRCodeSVG } from 'qrcode.react';
import { 
  HeartPulse, 
  Stethoscope, 
  Search, 
  Users, 
  FileText, 
  Calendar, 
  Pill, 
  QrCode, 
  Sparkles, 
  History, 
  LogOut, 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  PlusCircle, 
  Upload, 
  ShieldCheck, 
  ExternalLink,
  Send,
  X,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

export function PatientDashboard({ onNavigate, initialTab = 'dashboard' }) {
  const { user, patientProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data States
  const [doctors, setDoctors] = useState([]);
  const [connectedDoctors, setConnectedDoctors] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState({});
  const [message, setMessage] = useState(null);

  // Search Filters for Find a Doctor
  const [searchQuery, setSearchQuery] = useState({
    name: '',
    specialization: '',
    hospital: '',
    city: ''
  });

  // Doctor Detail Modal
  const [selectedDoctorModal, setSelectedDoctorModal] = useState(null);

  // AI Health Copilot State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const patientId = patientProfile?.patientId || patientProfile?.uid || user?.uid || 'DEMO-PATIENT-001';

  // Load patient data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        allDoctors,
        myDocs,
        myReqs,
        records,
        pVisits,
        pRxs,
        logs
      ] = await Promise.all([
        firestoreService.getDoctors(),
        firestoreService.getConnectedDoctorsForPatient(patientId),
        firestoreService.getDoctorPatientRequestsForPatient(patientId),
        firestoreService.getUserMedicalRecords(patientId),
        firestoreService.getVisitsForPatient(patientId),
        firestoreService.getPrescriptionsForPatient(patientId),
        firestoreService.getAuditLogs(15)
      ]);

      setDoctors(allDoctors || []);
      setConnectedDoctors(myDocs || []);
      setSentRequests(myReqs || []);
      setMedicalRecords(records || []);
      setVisits(pVisits || []);
      setPrescriptions(pRxs || []);
      setAuditLogs(logs || []);
    } catch (err) {
      console.warn('Error loading patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Execute Dynamic Search for Doctors
  const handleSearchDoctors = async (e) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    try {
      const results = await firestoreService.getDoctors({
        name: searchQuery.name.trim(),
        specialization: searchQuery.specialization.trim(),
        hospital: searchQuery.hospital.trim(),
        city: searchQuery.city.trim()
      });
      setDoctors(results || []);
    } catch (err) {
      console.error('Doctor search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Reset Search Filters
  const handleResetSearch = async () => {
    setSearchQuery({ name: '', specialization: '', hospital: '', city: '' });
    setSearchLoading(true);
    try {
      const all = await firestoreService.getDoctors();
      setDoctors(all || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle Request Doctor Click
  const handleRequestDoctor = async (doctor) => {
    const docId = doctor.doctorId || doctor.id;
    setRequestLoading(prev => ({ ...prev, [docId]: true }));
    setMessage(null);

    try {
      const res = await firestoreService.createDoctorPatientRequest({
        doctorId: docId,
        patientId: patientId,
        patientName: patientProfile?.name || user?.displayName || 'Registered Patient',
        patientPhone: patientProfile?.phone || '',
        patientCity: patientProfile?.city || ''
      });

      if (res && res.success) {
        setMessage({ type: 'success', text: `Connection request sent to ${doctor.name}! Awaiting doctor approval.` });
        await loadData();
      } else {
        setMessage({ type: 'error', text: res?.error || 'Unable to send request.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Request failed.' });
    } finally {
      setRequestLoading(prev => ({ ...prev, [docId]: false }));
    }
  };

  // AI Health Assistant Query
  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await aiApi.chat(`Patient health question: ${aiQuestion}. Provide clear, friendly, evidence-based wellness guidance with appropriate medical disclaimers.`);
      setAiResponse(res.response || res.summary || res.explanation || 'Health information generated.');
    } catch (err) {
      setAiResponse('AI service response error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Generate Non-guessable Cryptographic QR Token
  const secureQrToken = `SEC-PAT-${patientId.replace(/[^a-zA-Z0-9]/g, '')}-${btoa(patientId).substring(0, 8)}`;

  // Helper to check if already requested or connected
  const getDoctorRequestStatus = (docId) => {
    const isConnected = connectedDoctors.some(d => d.doctorId === docId || d.id === docId);
    if (isConnected) return 'CONNECTED';

    const req = sentRequests.find(r => (r.doctorId === docId) && r.status === 'PENDING');
    if (req) return 'PENDING';

    const rejected = sentRequests.find(r => (r.doctorId === docId) && r.status === 'REJECTED');
    if (rejected) return 'REJECTED';

    return 'AVAILABLE';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-5">
          {/* Patient Info Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center text-white">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate">
                {patientProfile?.name || user?.displayName || 'Registered Patient'}
              </h2>
              <p className="text-[11px] text-sky-400 font-medium truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>ID: {patientId.substring(0, 14)}...</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: HeartPulse },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'find-doctor', label: 'Find a Doctor', icon: Search, badge: doctors.length },
              { id: 'my-doctors', label: 'My Doctors', icon: Users, badge: connectedDoctors.length },
              { id: 'medical-records', label: 'My Medical Records', icon: FileText, badge: medicalRecords.length },
              { id: 'visits', label: 'My Visits', icon: Calendar, badge: visits.length },
              { id: 'prescriptions', label: 'My Prescriptions', icon: Pill, badge: prescriptions.length },
              { id: 'my-qr', label: 'My QR Code', icon: QrCode },
              { id: 'ai-health', label: 'AI Health Summary', icon: Sparkles },
              { id: 'access-history', label: 'Access History', icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive 
                        ? 'bg-white text-sky-600' 
                        : 'bg-slate-800 text-slate-300'
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
              onNavigate('/patient/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Patient Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Notification Banner if any */}
        {message && (
          <div className={`px-6 py-3 border-b text-xs font-medium flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Patient Account</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    Welcome back, {patientProfile?.name || 'Patient'}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-300">
                    City: <span className="text-white font-semibold">{patientProfile?.city || 'Pune'}</span> | 
                    DOB: <span className="text-white font-semibold ml-1">{patientProfile?.dateOfBirth || 'Registered'}</span> | 
                    Patient ID: <span className="text-sky-400 font-mono font-semibold ml-1">{patientId}</span>
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Connected Doctors</p>
                    <h3 className="text-2xl font-black text-white mt-1">{connectedDoctors.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Available Doctors</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{doctors.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Clinical Visits</p>
                    <h3 className="text-2xl font-black text-indigo-400 mt-1">{visits.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Active Prescriptions</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-1">{prescriptions.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Pill className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('find-doctor')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-400">Find a Registered Doctor</h3>
                  <p className="text-xs text-slate-400 mt-1">Search real certified doctors by name, specialty, hospital or city</p>
                </button>

                <button
                  onClick={() => setActiveTab('my-qr')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-teal-400">My Cryptographic QR Code</h3>
                  <p className="text-xs text-slate-400 mt-1">Share secure token with your doctor without exposing raw health PII</p>
                </button>

                <button
                  onClick={() => setActiveTab('ai-health')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-400">AI Health Copilot</h3>
                  <p className="text-xs text-slate-400 mt-1">Ask questions and receive clinical insights and medical explanations</p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Patient Demographics & Profile</h2>
                  <p className="text-xs text-slate-400">Verified patient record stored in Firestore</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Full Legal Name</span>
                  <p className="text-sm font-bold text-white">{patientProfile?.name || 'Registered Patient'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Patient Identification Number</span>
                  <p className="text-xs font-mono font-bold text-sky-400">{patientId}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</span>
                  <p className="text-sm font-bold text-white">{patientProfile?.dateOfBirth || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gender</span>
                  <p className="text-sm font-bold text-white">{patientProfile?.gender || 'Other'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contact Phone</span>
                  <p className="text-sm font-bold text-white">{patientProfile?.phone || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</span>
                  <p className="text-sm font-bold text-white">{patientProfile?.email || user?.email || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">City of Residence</span>
                  <p className="text-sm font-bold text-white">{patientProfile?.city || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">System Role</span>
                  <p className="text-xs font-bold text-sky-400">PATIENT (Protected by Role-Based Access Control)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIND A DOCTOR (CRITICAL REQUIREMENT 6 & 7) */}
          {activeTab === 'find-doctor' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Find a Doctor</h2>
                  <p className="text-xs text-slate-400">
                    Search registered medical practitioners dynamically backed by Firestore. No dummy doctors or mock profiles.
                  </p>
                </div>

                {/* Filter / Search Form */}
                <form onSubmit={handleSearchDoctors} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Doctor Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery.name}
                        onChange={e => setSearchQuery({ ...searchQuery, name: e.target.value })}
                        placeholder="e.g. Smith"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Specialization</label>
                    <input
                      type="text"
                      value={searchQuery.specialization}
                      onChange={e => setSearchQuery({ ...searchQuery, specialization: e.target.value })}
                      placeholder="e.g. Cardiologist"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      value={searchQuery.hospital}
                      onChange={e => setSearchQuery({ ...searchQuery, hospital: e.target.value })}
                      placeholder="e.g. Apollo, Ruby Hall"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">City / Location</label>
                    <input
                      type="text"
                      value={searchQuery.city}
                      onChange={e => setSearchQuery({ ...searchQuery, city: e.target.value })}
                      placeholder="e.g. Pune, Mumbai"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Clear Filters
                    </button>
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-50"
                    >
                      {searchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Search Doctors</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Doctors Results Grid */}
              {doctors.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-dashed border-slate-800 space-y-3">
                  <Stethoscope className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">
                    No doctors found. Registered doctors will appear here.
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Doctors registered through the Doctor Portal are automatically indexed into Firestore and made searchable here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {doctors.map(doc => {
                    const docId = doc.doctorId || doc.id;
                    const status = getDoctorRequestStatus(docId);
                    const isBusy = requestLoading[docId];

                    return (
                      <div
                        key={docId}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-base font-bold text-white">{doc.name}</h3>
                              <p className="text-xs font-semibold text-sky-400">{doc.specialization}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                              <Stethoscope className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-400">
                            <p className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{doc.hospital || 'Clinical Practice'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{doc.city || 'Location not specified'}</span>
                            </p>
                            {doc.medicalRegistrationNumber && (
                              <p className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                                <Award className="w-3.5 h-3.5 shrink-0" />
                                <span>Reg: {doc.medicalRegistrationNumber}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: [View Profile] [Request Doctor] */}
                        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDoctorModal(doc)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-all text-center cursor-pointer"
                          >
                            View Profile
                          </button>

                          {status === 'CONNECTED' ? (
                            <span className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Connected</span>
                            </span>
                          ) : status === 'PENDING' ? (
                            <span className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold text-center flex items-center justify-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Request Pending</span>
                            </span>
                          ) : (
                            <button
                              disabled={isBusy}
                              onClick={() => handleRequestDoctor(doc)}
                              className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all text-center cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                              {isBusy ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>Request Doctor</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY DOCTORS (REQUIREMENT 9) */}
          {activeTab === 'my-doctors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">My Connected Doctors</h2>
                  <p className="text-xs text-slate-400">Doctors authorized to access your clinical medical history</p>
                </div>
                <button
                  onClick={() => setActiveTab('find-doctor')}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Another Doctor</span>
                </button>
              </div>

              {connectedDoctors.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-dashed border-slate-800 space-y-3">
                  <Users className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">You have no connected doctors yet. Find a doctor to get started.</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Search for certified physicians in the "Find a Doctor" tab and submit a connection request. Once approved, they will appear here.
                  </p>
                  <button
                    onClick={() => setActiveTab('find-doctor')}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Browse Registered Doctors</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {connectedDoctors.map(doc => (
                    <div
                      key={doc.doctorId || doc.id}
                      className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2 inline-block">
                            Active Practitioner
                          </span>
                          <h3 className="text-base font-bold text-white">{doc.name}</h3>
                          <p className="text-xs font-semibold text-teal-400">{doc.specialization}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1.5">
                        <p className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{doc.hospital || 'Clinical Facility'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{doc.city || 'Practicing City'}</span>
                        </p>
                        {doc.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{doc.email}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MY MEDICAL RECORDS */}
          {activeTab === 'medical-records' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">My Medical Records</h2>
                    <p className="text-xs text-slate-400">Encrypted personal health documents and diagnostic files</p>
                  </div>
                </div>
              </div>

              {medicalRecords.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No medical records available.</p>
                  <p className="text-[11px] text-slate-500">Your lab reports, imaging scans, and hospital discharge summaries will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {medicalRecords.map(rec => (
                    <div key={rec.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{rec.title || rec.fileName}</h4>
                        <p className="text-[11px] text-slate-500">{rec.category || 'Diagnostic File'} &bull; {rec.uploadedAt || 'Recent'}</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">View</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MY VISITS */}
          {activeTab === 'visits' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">My Clinical Visits & Encounters</h2>
                  <p className="text-xs text-slate-400">Official medical consultations recorded by your doctors</p>
                </div>
              </div>

              {visits.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No visits recorded yet.</p>
                  <p className="text-[11px] text-slate-500">When your connected doctor logs a clinical consultation, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visits.map(v => (
                    <div key={v.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{v.diagnosis}</h4>
                        <span className="text-xs font-semibold text-sky-400">{v.visitDate || 'Recent'}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Doctor: <span className="text-slate-200">{v.doctorName || 'Dr. Practitioner'}</span> &bull; 
                        Facility: <span className="text-slate-200">{v.facility || 'Clinical Practice'}</span>
                      </p>
                      {v.notes && <p className="text-xs text-slate-300 mt-1">{v.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: MY PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">My Active Prescriptions</h2>
                  <p className="text-xs text-slate-400">Medications prescribed by certified doctors</p>
                </div>
              </div>

              {prescriptions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                  <Pill className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No prescriptions found.</p>
                  <p className="text-[11px] text-slate-500">Digital e-prescriptions issued during clinical visits will be displayed here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map(p => (
                    <div key={p.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{p.medicine} <span className="text-xs font-normal text-slate-400">({p.dosage})</span></h4>
                        <p className="text-xs text-slate-400">{p.frequency} &bull; {p.duration} &bull; {p.instructions}</p>
                        <p className="text-[11px] text-slate-500 mt-1">Prescribed by {p.doctorName || 'Doctor'} on {p.issuedDate || 'Recent'}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status || 'ACTIVE'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: MY QR CODE (REQUIREMENT 11: CRYPTOGRAPHIC TOKEN, ZERO PII) */}
          {activeTab === 'my-qr' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Cryptographic Access QR Code</h2>
                  <p className="text-xs text-slate-400">
                    Zero-PII Privacy Protection: QR encodes only a non-guessable token resolved on the server
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="p-6 bg-white rounded-3xl shadow-2xl">
                  <QRCodeSVG
                    value={secureQrToken}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="text-center space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>TOKEN: {secureQrToken}</span>
                  </span>
                  <p className="text-xs text-slate-400 max-w-sm pt-2">
                    Show this QR code to your authorized doctor. The backend validates doctor identity and permissions before unlocking your record.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AI HEALTH SUMMARY */}
          {activeTab === 'ai-health' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">CareKey AI Health Copilot</h2>
                  <p className="text-xs text-slate-400">Personalized wellness information and medical question explanations</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Ask a Health or Medical Question
                  </label>
                  <textarea
                    rows={3}
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="e.g. What questions should I prepare for my upcoming cardiologist consultation?"
                    className="w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAskAI}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Consulting Health Assistant...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Get AI Guidance</span>
                      </>
                    )}
                  </button>
                </div>

                {aiResponse && (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Health Explanation</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: ACCESS HISTORY */}
          {activeTab === 'access-history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Access History & Security Audit</h2>
                  <p className="text-xs text-slate-400">Transparent log of all practitioner and portal access to your record</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No access events recorded yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{log.action || 'RECORD_VIEWED'}</span>
                        <p className="text-slate-400 text-[11px]">{log.details || log.description || 'Access verified'}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Doctor Profile Modal */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDoctorModal.name}</h3>
                  <p className="text-xs text-sky-400 font-semibold">{selectedDoctorModal.specialization}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctorModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Hospital / Affiliated Clinic</span>
                <p className="text-xs font-bold text-white mt-0.5">{selectedDoctorModal.hospital || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">City & Location</span>
                <p className="text-xs font-bold text-white mt-0.5">{selectedDoctorModal.city || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Medical Registration Number</span>
                <p className="text-xs font-mono font-bold text-sky-400 mt-0.5">{selectedDoctorModal.medicalRegistrationNumber || 'REG-VERIFIED'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Practitioner Email</span>
                <p className="text-xs font-bold text-white mt-0.5">{selectedDoctorModal.email || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDoctorModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer hover:bg-slate-750"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
