import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { qrApi } from '../../services/qrApi';
import { aiApi } from '../../services/aiApi';
import { 
  Stethoscope, 
  Users, 
  UserCheck, 
  Clock, 
  QrCode, 
  FileText, 
  Calendar, 
  Pill, 
  Sparkles, 
  ShieldCheck, 
  LogOut, 
  Check, 
  X, 
  Search, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  User, 
  CheckCircle2, 
  XCircle,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Eye,
  Send
} from 'lucide-react';

export function DoctorDashboard({ onNavigate }) {
  const { user, doctorProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [patients, setPatients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Selected Patient for Record Viewing / Actions
  const [selectedPatient, setSelectedPatient] = useState(null);

  // QR Search State
  const [qrToken, setQrToken] = useState('');
  const [qrSearching, setQrSearching] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [qrError, setQrError] = useState(null);

  // New Visit Form State
  const [newVisit, setNewVisit] = useState({
    diagnosis: '',
    symptoms: '',
    clinicalNotes: '',
    treatmentPlan: ''
  });

  // New Prescription Form State
  const [newRx, setNewRx] = useState({
    medicine: '',
    dosage: '',
    frequency: 'Once Daily',
    duration: '7 Days',
    instructions: 'Take after meals'
  });

  // AI Summary State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const doctorId = doctorProfile?.doctorId || doctorProfile?.uid || user?.uid || 'DEMO-DOC-001';

  // Load Initial Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [connectedPatients, pendingRequests, logs] = await Promise.all([
        firestoreService.getConnectedPatientsForDoctor(doctorId),
        firestoreService.getDoctorPatientRequestsForDoctor(doctorId),
        firestoreService.getAuditLogs(30)
      ]);
      setPatients(connectedPatients || []);
      setRequests(pendingRequests || []);
      setAuditLogs(logs || []);
    } catch (err) {
      console.warn('Error fetching doctor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Patient Details when selected
  useEffect(() => {
    if (selectedPatient) {
      async function loadPatientDetails() {
        try {
          const [pVisits, pRx] = await Promise.all([
            firestoreService.getVisitsForPatient(selectedPatient.patientId || selectedPatient.id),
            firestoreService.getPrescriptionsForPatient(selectedPatient.patientId || selectedPatient.id)
          ]);
          setVisits(pVisits || []);
          setPrescriptions(pRx || []);
        } catch (e) {
          console.warn('Could not load patient visits/rx', e);
        }
      }
      loadPatientDetails();
    }
  }, [selectedPatient]);

  // Handle Accept Patient Request
  const handleAcceptRequest = async (request) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await firestoreService.updateDoctorPatientRequest(
        request.requestId || request.id,
        'ACCEPTED',
        doctorId,
        request.patientId
      );
      if (res && res.success) {
        setMessage({ type: 'success', text: `Accepted connection request from ${request.patientName || 'patient'}!` });
        await loadData();
      } else {
        setMessage({ type: 'error', text: res?.error || 'Failed to accept request.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Patient Request
  const handleRejectRequest = async (request) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await firestoreService.updateDoctorPatientRequest(
        request.requestId || request.id,
        'REJECTED',
        doctorId,
        request.patientId
      );
      if (res && res.success) {
        setMessage({ type: 'info', text: `Declined connection request.` });
        await loadData();
      } else {
        setMessage({ type: 'error', text: res?.error || 'Failed to update request.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle QR Token Search / Resolution
  const handleResolveQR = async (e) => {
    e.preventDefault();
    if (!qrToken.trim()) return;
    setQrSearching(true);
    setQrError(null);
    setQrResult(null);

    try {
      // 1. Try Backend API resolution first
      const res = await qrApi.validateToken(qrToken.trim());
      if (res && res.patient) {
        setQrResult(res.patient);
        setSelectedPatient(res.patient);
        await firestoreService.logAuditEvent({
          userId: doctorId,
          userName: doctorProfile?.name || 'Practitioner',
          role: 'DOCTOR',
          action: 'QR_PATIENT_ACCESSED',
          resourceType: 'PATIENT_RECORD',
          resourceId: res.patient.id || res.patient.patientId,
          details: `Authorized QR token validated for patient ${res.patient.name}`,
          status: 'SUCCESS'
        });
      } else {
        // Fallback: check connected patients list
        const match = patients.find(p => p.patientId === qrToken.trim() || p.id === qrToken.trim());
        if (match) {
          setQrResult(match);
          setSelectedPatient(match);
        } else {
          setQrError('Invalid or expired patient QR token. Please verify the code with the patient.');
        }
      }
    } catch (err) {
      setQrError('QR Token verification failed: ' + (err.message || 'Access Denied'));
    } finally {
      setQrSearching(false);
    }
  };

  // Create Visit Encounter
  const handleCreateVisit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setMessage({ type: 'error', text: 'Please select a connected patient first.' });
      return;
    }
    if (!newVisit.diagnosis.trim()) {
      setMessage({ type: 'error', text: 'Please provide a clinical diagnosis.' });
      return;
    }

    try {
      const res = await firestoreService.addVisitForPatient({
        patientId: selectedPatient.patientId || selectedPatient.id,
        doctorId: doctorId,
        doctorName: doctorProfile?.name || 'Dr. Practitioner',
        facility: doctorProfile?.hospital || 'Clinical Facility',
        diagnosis: newVisit.diagnosis,
        symptoms: newVisit.symptoms,
        notes: newVisit.clinicalNotes,
        treatmentPlan: newVisit.treatmentPlan,
        visitDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      setVisits(prev => [res, ...prev]);
      setNewVisit({ diagnosis: '', symptoms: '', clinicalNotes: '', treatmentPlan: '' });
      setMessage({ type: 'success', text: 'Clinical encounter successfully recorded.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to record encounter: ' + err.message });
    }
  };

  // Issue Prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setMessage({ type: 'error', text: 'Please select a connected patient first.' });
      return;
    }
    if (!newRx.medicine.trim()) {
      setMessage({ type: 'error', text: 'Please enter medication name.' });
      return;
    }

    try {
      const res = await firestoreService.addPrescriptionForPatient({
        patientId: selectedPatient.patientId || selectedPatient.id,
        doctorId: doctorId,
        doctorName: doctorProfile?.name || 'Dr. Practitioner',
        medicine: newRx.medicine,
        dosage: newRx.dosage || 'Standard dose',
        frequency: newRx.frequency,
        duration: newRx.duration,
        instructions: newRx.instructions,
        status: 'ACTIVE',
        issuedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      setPrescriptions(prev => [res, ...prev]);
      setNewRx({ medicine: '', dosage: '', frequency: 'Once Daily', duration: '7 Days', instructions: 'Take after meals' });
      setMessage({ type: 'success', text: `Prescription issued for ${res.medicine}.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to issue prescription: ' + err.message });
    }
  };

  // Generate AI Clinical Summary
  const handleGenerateAISummary = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const promptText = `As a clinical decision support assistant for verified physicians, synthesize the following clinical scenario or patient symptoms into an objective medical summary with differential diagnostic considerations:\n\n${aiPrompt}`;
      const res = await aiApi.chat(promptText);
      setAiResult(res.response || res.summary || res.explanation || 'Summary generated.');
    } catch (err) {
      setAiResult('Clinical synthesis error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-5">
          {/* Doctor Info Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 p-0.5 flex items-center justify-center text-slate-950">
              <Stethoscope className="w-6 h-6 text-slate-950" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate">
                {doctorProfile?.name || 'Dr. Medical Officer'}
              </h2>
              <p className="text-[11px] text-teal-400 font-semibold truncate flex items-center gap-1">
                <Award className="w-3 h-3 shrink-0" />
                <span>{doctorProfile?.specialization || 'Clinical Specialist'}</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ClipboardList },
              { id: 'profile', label: 'Doctor Profile', icon: Award },
              { id: 'my-patients', label: 'My Patients', icon: Users, badge: patients.length },
              { id: 'patient-requests', label: 'Patient Requests', icon: UserCheck, badge: pendingRequestsCount, badgeColor: 'bg-amber-500' },
              { id: 'search-qr', label: 'Search / QR Patient', icon: QrCode },
              { id: 'medical-records', label: 'Medical Records', icon: FileText },
              { id: 'visits', label: 'Visits & Encounters', icon: Calendar },
              { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
              { id: 'ai-summary', label: 'AI Medical Summary', icon: Sparkles },
              { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive 
                        ? 'bg-slate-950 text-teal-400' 
                        : (tab.badgeColor ? `${tab.badgeColor} text-slate-950` : 'bg-slate-800 text-slate-300')
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
              onNavigate('/doctor/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Practitioner Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Notification Bar if any */}
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
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Doctor Portal</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    Clinical Workspace &mdash; {doctorProfile?.name || 'Dr. Practitioner'}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
                    Hospital: <span className="text-slate-200 font-semibold">{doctorProfile?.hospital || 'Central Healthcare'}</span> | 
                    License: <span className="text-teal-400 font-mono font-semibold ml-1">{doctorProfile?.medicalRegistrationNumber || 'REG-PENDING'}</span> | 
                    Location: <span className="text-slate-200 ml-1">{doctorProfile?.city || 'Registered City'}</span>
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Connected Patients</p>
                    <h3 className="text-2xl font-black text-white mt-1">{patients.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Pending Requests</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-1">{pendingRequestsCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Clinical Encounters</p>
                    <h3 className="text-2xl font-black text-sky-400 mt-1">{visits.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Audit Trail Events</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{auditLogs.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('patient-requests')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-teal-400">Review Patient Requests</h3>
                  <p className="text-xs text-slate-400 mt-1">Accept or decline pending patient connections ({pendingRequestsCount} pending)</p>
                </button>

                <button
                  onClick={() => setActiveTab('search-qr')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-400">Scan Patient QR Code</h3>
                  <p className="text-xs text-slate-400 mt-1">Authenticate zero-PII cryptographic QR tokens instantly</p>
                </button>

                <button
                  onClick={() => setActiveTab('ai-summary')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-400">AI Medical Assistant</h3>
                  <p className="text-xs text-slate-400 mt-1">Gemini AI clinical decision support and summary</p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DOCTOR PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Practitioner Credentials & Profile</h2>
                  <p className="text-xs text-slate-400">Verified doctor details stored in Firestore</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Full Practitioner Name</span>
                  <p className="text-sm font-bold text-white">{doctorProfile?.name || 'Dr. Practitioner'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Specialization</span>
                  <p className="text-sm font-bold text-teal-400">{doctorProfile?.specialization || 'Clinical Medicine'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Medical License / Reg Number</span>
                  <p className="text-sm font-mono font-bold text-white">{doctorProfile?.medicalRegistrationNumber || 'REG-PENDING'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hospital / Affiliated Clinic</span>
                  <p className="text-sm font-bold text-white">{doctorProfile?.hospital || 'Hospital Clinic'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Practice City / Region</span>
                  <p className="text-sm font-bold text-white">{doctorProfile?.city || 'Location'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Official Email Address</span>
                  <p className="text-sm font-bold text-white">{doctorProfile?.email || user?.email || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Doctor Identification Key</span>
                  <p className="text-xs font-mono text-slate-400">{doctorId}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">System Role</span>
                  <p className="text-xs font-bold text-teal-400">DOCTOR (Role-Based Access Control Enabled)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MY PATIENTS */}
          {activeTab === 'my-patients' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">My Connected Patients</h2>
                  <p className="text-xs text-slate-400">Verified doctor–patient relationships established through approved requests</p>
                </div>
                <button
                  onClick={loadData}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer w-fit"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Patient List</span>
                </button>
              </div>

              {patients.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-dashed border-slate-800 space-y-3">
                  <Users className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">No patients connected yet.</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When registered patients search for you and you accept their connection requests, they will appear here with authorized access.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patients.map((pat) => (
                    <div
                      key={pat.patientId || pat.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            Active Patient
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {pat.patientId || pat.id}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{pat.name || 'Patient'}</h3>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{pat.phone || 'Phone not provided'}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{pat.city || 'City not specified'}</span>
                          </p>
                          {pat.gender && (
                            <p className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              <span>{pat.gender}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPatient(pat);
                            setActiveTab('visits');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-slate-950 text-xs font-bold transition-all text-center cursor-pointer"
                        >
                          Clinical Visits
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient(pat);
                            setActiveTab('prescriptions');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center cursor-pointer"
                        >
                          Prescriptions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PATIENT REQUESTS (ACCEPT / REJECT) */}
          {activeTab === 'patient-requests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Incoming Patient Requests</h2>
                  <p className="text-xs text-slate-400">Review connection requests submitted by registered patients</p>
                </div>
                <button
                  onClick={loadData}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer w-fit"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Requests</span>
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-dashed border-slate-800 space-y-3">
                  <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">No pending patient requests.</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When patients discover your profile in the Find a Doctor directory and click "Request Doctor", their authorization requests will appear here for your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => {
                    const isPending = req.status === 'PENDING';
                    return (
                      <div
                        key={req.requestId || req.id}
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-bold text-white">
                              {req.patientName || 'Registered Patient'}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPending 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : req.status === 'ACCEPTED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {req.status || 'PENDING'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span>Patient ID: <span className="font-mono text-slate-300">{req.patientId}</span></span>
                            {req.patientPhone && <span>Phone: <span className="text-slate-300">{req.patientPhone}</span></span>}
                            {req.patientCity && <span>City: <span className="text-slate-300">{req.patientCity}</span></span>}
                            <span>Requested: <span className="text-slate-300">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Today'}</span></span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleAcceptRequest(req)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>Accept Connection</span>
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRejectRequest(req)}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-semibold italic">
                            Decision logged ({req.status})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SEARCH / QR PATIENT */}
          {activeTab === 'search-qr' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Cryptographic QR Verification</h2>
                  <p className="text-xs text-slate-400">Zero-PII Secure Token Resolution backed by Spring Security</p>
                </div>
              </div>

              {qrError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{qrError}</span>
                </div>
              )}

              <form onSubmit={handleResolveQR} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Enter Patient Secure QR Token / Patient ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={qrToken}
                      onChange={(e) => setQrToken(e.target.value)}
                      placeholder="e.g. SEC-QR-TOKEN-xyz or PATIENT-ID"
                      className="w-full pl-4 pr-32 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="submit"
                      disabled={qrSearching}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {qrSearching ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>Verify & Resolve</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* QR Resolution Result Card */}
              {qrResult && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorized Patient Record Located</span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">{qrResult.id || qrResult.patientId}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold">Patient Name:</span>
                      <p className="text-sm font-bold text-white mt-0.5">{qrResult.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Phone:</span>
                      <p className="text-sm font-bold text-white mt-0.5">{qrResult.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Location:</span>
                      <p className="text-sm font-bold text-white mt-0.5">{qrResult.city || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(qrResult);
                        setActiveTab('visits');
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-teal-400"
                    >
                      Record Visit for Patient
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPatient(qrResult);
                        setActiveTab('prescriptions');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs cursor-pointer hover:bg-slate-700"
                    >
                      Write Prescription
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MEDICAL RECORDS */}
          {activeTab === 'medical-records' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Patient Medical Records</h2>
                    <p className="text-xs text-slate-400">Authorized clinical diagnostic files, imaging and lab reports</p>
                  </div>
                </div>

                {selectedPatient ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Currently Viewing Records for:</span>
                        <h4 className="text-base font-bold text-white">{selectedPatient.name} ({selectedPatient.patientId || selectedPatient.id})</h4>
                      </div>
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        Change Patient
                      </button>
                    </div>

                    <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                      <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-400">No external documents uploaded yet for this patient.</p>
                      <p className="text-[11px] text-slate-500">Patient-uploaded lab reports and imaging files will be decrypted and displayed here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                    <Users className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">Select a connected patient to view their medical records.</p>
                    <p className="text-[11px] text-slate-500">Go to "My Patients" or verify a patient QR code to establish an active clinical session.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: VISITS & ENCOUNTERS */}
          {activeTab === 'visits' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Clinical Encounters & Visits</h2>
                    <p className="text-xs text-slate-400">Document authorized consultations and longitudinal patient care</p>
                  </div>
                </div>

                {selectedPatient ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Active Patient Encounter:</span>
                        <h4 className="text-base font-bold text-white">{selectedPatient.name}</h4>
                      </div>
                      <span className="text-xs font-mono text-teal-400">{selectedPatient.patientId || selectedPatient.id}</span>
                    </div>

                    {/* New Visit Form */}
                    <form onSubmit={handleCreateVisit} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Record New Clinical Encounter</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Clinical Diagnosis *</label>
                          <input
                            type="text"
                            required
                            value={newVisit.diagnosis}
                            onChange={e => setNewVisit({ ...newVisit, diagnosis: e.target.value })}
                            placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Chief Symptoms</label>
                          <input
                            type="text"
                            value={newVisit.symptoms}
                            onChange={e => setNewVisit({ ...newVisit, symptoms: e.target.value })}
                            placeholder="e.g. Persistent dry cough, fatigue for 3 days"
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Clinical Notes & Observations</label>
                        <textarea
                          rows={2}
                          value={newVisit.clinicalNotes}
                          onChange={e => setNewVisit({ ...newVisit, clinicalNotes: e.target.value })}
                          placeholder="Chest clear on auscultation, BP 120/80 mmHg..."
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save Encounter</span>
                        </button>
                      </div>
                    </form>

                    {/* Past Encounters */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Past Recorded Encounters</h4>
                      {visits.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No past encounters recorded for this patient yet.</p>
                      ) : (
                        visits.map(v => (
                          <div key={v.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-bold text-white">{v.diagnosis}</h5>
                              <span className="text-[11px] text-slate-400">{v.visitDate || 'Recent'}</span>
                            </div>
                            {v.symptoms && <p className="text-xs text-slate-400"><span className="text-slate-500">Symptoms:</span> {v.symptoms}</p>}
                            {v.notes && <p className="text-xs text-slate-300 mt-1">{v.notes}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                    <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">Select a connected patient to view or log clinical visits.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">E-Prescriptions Management</h2>
                    <p className="text-xs text-slate-400">Issue and manage digital medication prescriptions</p>
                  </div>
                </div>

                {selectedPatient ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Patient:</span>
                        <h4 className="text-base font-bold text-white">{selectedPatient.name}</h4>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">{selectedPatient.patientId || selectedPatient.id}</span>
                    </div>

                    {/* Prescription Form */}
                    <form onSubmit={handleCreatePrescription} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Issue New Medication</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Medication Name *</label>
                          <input
                            type="text"
                            required
                            value={newRx.medicine}
                            onChange={e => setNewRx({ ...newRx, medicine: e.target.value })}
                            placeholder="e.g. Amoxicillin, Metformin"
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Dosage</label>
                          <input
                            type="text"
                            value={newRx.dosage}
                            onChange={e => setNewRx({ ...newRx, dosage: e.target.value })}
                            placeholder="e.g. 500 mg, 10 ml"
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Frequency</label>
                          <select
                            value={newRx.frequency}
                            onChange={e => setNewRx({ ...newRx, frequency: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Once Daily">Once Daily</option>
                            <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                            <option value="Thrice Daily (TID)">Thrice Daily (TID)</option>
                            <option value="As Needed (PRN)">As Needed (PRN)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Duration</label>
                          <input
                            type="text"
                            value={newRx.duration}
                            onChange={e => setNewRx({ ...newRx, duration: e.target.value })}
                            placeholder="e.g. 5 days, 1 month"
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Patient Instructions</label>
                          <input
                            type="text"
                            value={newRx.instructions}
                            onChange={e => setNewRx({ ...newRx, instructions: e.target.value })}
                            placeholder="e.g. Take after breakfast with water"
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>Issue Prescription</span>
                        </button>
                      </div>
                    </form>

                    {/* Prescriptions List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Medications</h4>
                      {prescriptions.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No prescriptions logged for this patient yet.</p>
                      ) : (
                        prescriptions.map(p => (
                          <div key={p.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-white">{p.medicine} <span className="text-xs font-normal text-slate-400">({p.dosage})</span></h5>
                              <p className="text-xs text-slate-400">{p.frequency} &bull; {p.duration} &bull; {p.instructions}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {p.status || 'ACTIVE'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                    <Pill className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">Select a connected patient to write or review prescriptions.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: AI MEDICAL SUMMARY */}
          {activeTab === 'ai-summary' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Clinical Decision Support</h2>
                  <p className="text-xs text-slate-400">Gemini-powered clinical summarization and symptom correlation</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Clinical Query or Patient Presentation
                  </label>
                  <textarea
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter patient symptoms, laboratory findings, or clinical case summary for AI synthesis..."
                    className="w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateAISummary}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Clinical Insights...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Medical Summary</span>
                      </>
                    )}
                  </button>
                </div>

                {aiResult && (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Clinical Synthesis Output</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {aiResult}
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 italic">
                      * Clinical disclaimer: For physician informational reference only. All diagnostic decisions remain the sole responsibility of the licensed medical practitioner.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Immutable Clinical Audit Trail</h2>
                  <p className="text-xs text-slate-400">Cryptographically tracked practitioner access events</p>
                </div>
              </div>

              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No access events recorded yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.action || 'ACCESS_LOGGED'}</span>
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 font-mono">
                            {log.role || 'DOCTOR'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{log.details || log.description || 'Action verified.'}</p>
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
    </div>
  );
}
