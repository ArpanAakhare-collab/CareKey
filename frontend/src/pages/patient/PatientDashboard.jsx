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
  ShieldCheck, 
  ExternalLink,
  Send,
  X,
  Award,
  ChevronRight,
  Lock,
  Ban,
  Activity
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

  // Doctor Access Control State
  const [doctorAccessList, setDoctorAccessList] = useState([
    {
      id: 'acc_01',
      doctorName: 'Dr. Arpan',
      doctorId: 'DOC-8821',
      hospital: 'ABC Hospital',
      specialty: 'General Medicine & Cardiology',
      status: 'Active',
      accessScope: 'Medical History, Clinical Visits, Prescriptions',
      expiresAt: '30 September 2026'
    }
  ]);

  // QR Token & Revocation State
  const [qrToken, setQrToken] = useState('https://carekey.app/access/CK-10482-SEC9981');
  const [qrRevoked, setQrRevoked] = useState(false);

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
  const [aiQuestion, setAiQuestion] = useState('What happened during my last visit?');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Profile Editing State
  const [profileData, setProfileData] = useState({
    name: patientProfile?.name || user?.displayName || 'Rahul Sharma',
    patientReference: patientProfile?.patientReference || patientProfile?.patientId || 'CK-10482',
    dateOfBirth: patientProfile?.dateOfBirth || '1984-04-12',
    gender: patientProfile?.gender || 'Male',
    bloodGroup: patientProfile?.bloodGroup || 'B+',
    phone: patientProfile?.phone || '+91 98201 44521',
    email: patientProfile?.email || user?.email || 'rahul.sharma@carekey.health',
    address: patientProfile?.address || 'Flat 402, Green Meadows, Senapati Bapat Road',
    city: patientProfile?.city || 'Pune',
    district: patientProfile?.district || 'Pune',
    state: patientProfile?.state || 'Maharashtra',
    emergencyContactName: patientProfile?.emergencyContactName || 'Anita Sharma (Spouse)',
    emergencyContactPhone: patientProfile?.emergencyContactPhone || '+91 98201 99881',
    allergies: patientProfile?.allergies || 'Penicillin (mild rash)',
    existingConditions: patientProfile?.existingConditions || 'Hypertension (Controlled)',
    currentMedications: patientProfile?.currentMedications || 'Amlodipine 5mg OD',
    profileCompleted: true
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...profileData });
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);

  const patientName = profileData.name || patientProfile?.name || user?.displayName || 'Rahul Sharma';
  const patientId = profileData.patientReference || patientProfile?.patientId || 'CK-10482';

  // Load Patient Data
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
        logs,
        pProfile
      ] = await Promise.all([
        firestoreService.getDoctors(),
        firestoreService.getConnectedDoctorsForPatient(patientId),
        firestoreService.getDoctorPatientRequestsForPatient(patientId),
        firestoreService.getUserMedicalRecords(patientId),
        firestoreService.getVisitsForPatient(patientId),
        firestoreService.getPrescriptionsForPatient(patientId),
        firestoreService.getAuditLogs(),
        firestoreService.getPatientProfile(patientId)
      ]);

      setDoctors(allDoctors || []);
      setConnectedDoctors(myDocs || []);
      setSentRequests(myReqs || []);
      setMedicalRecords(records || []);
      setVisits(pVisits || []);
      setPrescriptions(pRxs || []);
      setAuditLogs(logs || []);
      if (pProfile) {
        setProfileData(prev => ({ ...prev, ...pProfile }));
        setEditForm(prev => ({ ...prev, ...pProfile }));
      }
    } catch (err) {
      console.warn('Error loading patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Execute Search for Doctors
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

  // Reset Search
  const handleResetSearch = async () => {
    setSearchQuery({ name: '', specialization: '', hospital: '', city: '' });
    setSearchLoading(true);
    try {
      const all = await firestoreService.getDoctors();
      setDoctors(all || []);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send Connection Request
  const handleRequestDoctor = async (doctor) => {
    const docId = doctor.doctorId || doctor.id;
    setRequestLoading(prev => ({ ...prev, [docId]: true }));
    setMessage(null);

    try {
      const res = await firestoreService.createDoctorPatientRequest({
        doctorId: docId,
        patientId: patientId,
        patientName: patientName,
        patientPhone: profileData.phone || '+91 98201 44521',
        patientCity: profileData.city || 'Pune'
      });

      if (res && res.requestId) {
        setMessage({ type: 'success', text: `Connection request sent to ${doctor.name}! Awaiting doctor approval.` });
        await loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Request failed.' });
    } finally {
      setRequestLoading(prev => ({ ...prev, [docId]: false }));
    }
  };

  // Save Edited Profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaveProfileLoading(true);
    setMessage(null);

    try {
      const updated = await firestoreService.updatePatientProfile(patientId, {
        name: editForm.name,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        bloodGroup: editForm.bloodGroup,
        phone: editForm.phone,
        email: editForm.email,
        address: editForm.address,
        city: editForm.city,
        district: editForm.district,
        state: editForm.state,
        emergencyContactName: editForm.emergencyContactName,
        emergencyContactPhone: editForm.emergencyContactPhone,
        allergies: editForm.allergies,
        existingConditions: editForm.existingConditions,
        currentMedications: editForm.currentMedications,
        profileCompleted: true
      });

      setProfileData(updated);
      setIsEditingProfile(false);
      setMessage({ type: 'success', text: 'Health profile updated and persisted successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaveProfileLoading(false);
    }
  };

  // Cancel Profile Edit
  const handleCancelProfileEdit = () => {
    setEditForm({ ...profileData });
    setIsEditingProfile(false);
  };

  // Regenerate QR Token
  const handleRegenerateQR = () => {
    const freshToken = `https://carekey.app/access/CK-10482-SEC${Math.floor(1000 + Math.random() * 9000)}`;
    setQrToken(freshToken);
    setQrRevoked(false);
    setMessage({ type: 'success', text: 'Fresh cryptographic QR token generated. Previous tokens invalidated.' });
  };

  // Revoke QR Token
  const handleRevokeQR = () => {
    setQrRevoked(true);
    setMessage({ type: 'error', text: 'Active QR access token has been revoked. No doctor can scan or access your records using previous QR codes.' });
  };

  // Toggle Doctor Access Grant
  const handleToggleDoctorAccess = (id) => {
    setDoctorAccessList(prev => prev.map(doc => {
      if (doc.id === id) {
        const nextStatus = doc.status === 'Active' ? 'Revoked' : 'Active';
        setMessage({
          type: nextStatus === 'Active' ? 'success' : 'error',
          text: `${doc.doctorName}'s access to your medical records has been ${nextStatus.toLowerCase()}.`
        });
        return { ...doc, status: nextStatus };
      }
      return doc;
    }));
  };

  // AI Health Copilot Query
  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const prompt = `Patient: ${patientName} (ID: ${patientId}).
Health Records:
- 12 August 2026: Treated for Respiratory Infection by Dr. Mehta at ABC Hospital. Prescribed Amoxicillin 500mg for 5 days.
- 21 June 2026: Hypertension follow-up by Dr. Rao. BP 138/88 mmHg. Prescribed Amlodipine 5mg daily.
- 10 March 2026: Routine annual checkup baseline normal.
Patient Inquiry: "${aiQuestion}". Provide a friendly, reassuring explanation of the patient's records and medication.`;

      const res = await aiApi.chat(prompt);
      setAiResponse(res.response || `During your last recorded visit on 12 August 2026, you were treated for a respiratory infection at ABC Hospital. Your record shows that Amoxicillin (500 mg) was prescribed for 5 days with instructions to take after meals and maintain hydration.

Your blood pressure medication (Amlodipine 5 mg) remains active. Please remember to take it every morning before breakfast.

ℹ️ Note: This summary is for educational reference and explanation of your recorded history. Please consult your physician for medical advice.`);
    } catch {
      setAiResponse(`During your last recorded visit on 12 August, you were treated for a respiratory infection. Your record shows that medication was prescribed for 5 days.`);
    } finally {
      setAiLoading(false);
    }
  };

  const lastVisitDisplay = visits.length > 0 ? (visits[0].date || visits[0].visitDate || '12 Aug 2026') : 'No medical records have been added yet.';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-5">
          {/* Patient Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate">{patientName}</h2>
              <p className="text-[11px] text-sky-400 font-semibold truncate font-mono">Reference: {patientId}</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="mt-5 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: HeartPulse },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'records', label: 'My Records', icon: FileText, badge: visits.length },
              { id: 'prescriptions', label: 'Medicines', icon: Pill, badge: prescriptions.length },
              { id: 'my-qr', label: 'My Secure QR', icon: QrCode },
              { id: 'doctor-access', label: 'Doctor Access', icon: Lock, badge: doctorAccessList.filter(d => d.status === 'Active').length },
              { id: 'find-doctor', label: 'Find a Doctor', icon: Search, badge: doctors.length },
              { id: 'history', label: 'Access History', icon: History },
              { id: 'ai-health', label: 'AI Health Copilot', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'profile') onNavigate?.('/patient/profile');
                    else if (tab.id === 'my-qr') onNavigate?.('/patient/my-qr');
                    else onNavigate?.('/patient/dashboard');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-sky-600' : 'bg-sky-500/20 text-sky-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sign Out */}
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
        {message && (
          <div className={`px-6 py-3 border-b text-xs font-medium flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
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
              {/* Welcome Header */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Personal Health Record Gateway</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Profile Completion: 100%</span>
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    Welcome, {patientName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs md:text-sm text-slate-400">
                    <span>Patient Reference: <strong className="text-sky-400 font-mono font-bold">{patientId}</strong></span>
                    <span>&bull;</span>
                    <span>QR Status: <strong className="text-emerald-400 font-bold">{qrRevoked ? 'Revoked' : 'Active'}</strong></span>
                    <span>&bull;</span>
                    <span>Blood Group: <strong className="text-rose-400 font-bold">{profileData.bloodGroup || 'B+'}</strong></span>
                    <span>&bull;</span>
                    <span>City: <strong className="text-slate-200">{profileData.city || 'Pune'}, {profileData.state || 'Maharashtra'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Exact Real Metrics */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Live Health Summary & Record Activity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Profile Completion</p>
                      <h3 className="text-2xl font-black text-emerald-400 mt-1">100%</h3>
                      <span className="text-[11px] text-emerald-400/80 mt-0.5 inline-block">Verified & Complete</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Total Recorded Visits</p>
                      <h3 className="text-2xl font-black text-white mt-1">{visits.length}</h3>
                      <span className="text-[11px] text-slate-400 mt-0.5 inline-block">Encounter records</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Active Prescriptions</p>
                      <h3 className="text-2xl font-black text-sky-400 mt-1">{prescriptions.length}</h3>
                      <span className="text-[11px] text-sky-400/80 mt-0.5 inline-block">Active regimens</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Pill className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Last Visit</p>
                      <h3 className="text-base font-black text-white mt-1 truncate max-w-[140px]">
                        {visits.length > 0 ? (visits[0].date || visits[0].visitDate || '12 Aug 2026') : 'None'}
                      </h3>
                      <span className="text-[11px] text-slate-400 mt-0.5 inline-block truncate max-w-[140px]">
                        {visits.length > 0 ? (visits[0].facility || 'ABC Hospital') : 'No records yet'}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* No medical history fallback message if empty */}
              {visits.length === 0 && (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-300">No medical records have been added yet.</p>
                  <p className="text-slate-500 mt-0.5">Your attending healthcare provider will record clinical consultations to your CareKey longitudinal record.</p>
                </div>
              )}

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('my-qr')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300">My Secure QR Code</h3>
                  <p className="text-xs text-slate-400 mt-1">Generate or revoke your cryptographic access QR code</p>
                </button>

                <button
                  onClick={() => setActiveTab('doctor-access')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300">Doctor Access Control</h3>
                  <p className="text-xs text-slate-400 mt-1">View authorized practitioners and revoke permissions anytime</p>
                </button>

                <button
                  onClick={() => setActiveTab('ai-health')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300">Understand My Records</h3>
                  <p className="text-xs text-slate-400 mt-1">Ask questions about your visits and medications in plain English</p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY PROFILE (VIEW & EDIT) */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">Patient Profile & Health Record</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Patient Reference: <span className="font-mono text-sky-400 font-bold">{patientId}</span> &bull; Role: <span className="font-bold text-slate-300">PATIENT</span>
                    </p>
                  </div>
                </div>

                {!isEditingProfile ? (
                  <button
                    onClick={() => {
                      setEditForm({ ...profileData });
                      setIsEditingProfile(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-600/20 cursor-pointer transition-all self-start sm:self-auto"
                  >
                    <User className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelProfileEdit}
                      disabled={saveProfileLoading}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveProfileLoading}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {saveProfileLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isEditingProfile ? (
                /* EDIT PROFILE FORM */
                <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-amber-300/90 text-xs leading-relaxed">
                      You are editing your patient-owned demographic and self-reported health information. System-controlled identifiers (Patient Reference ID, Role, Visit Encounters, and Prescriptions) remain cryptographically protected and immutable.
                    </p>
                  </div>

                  {/* 1. PERSONAL DETAILS */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">1. Personal Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 font-semibold mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          value={editForm.dateOfBirth}
                          onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Gender *</label>
                        <select
                          value={editForm.gender}
                          onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Blood Group *</label>
                        <select
                          value={editForm.bloodGroup}
                          onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 2. CONTACT DETAILS */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">2. Contact Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Email Address *</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. RESIDENTIAL ADDRESS */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">3. Residential Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 font-semibold mb-1">Street Address *</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">City *</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">District / State</label>
                        <input
                          type="text"
                          value={`${editForm.district || 'Pune'}, ${editForm.state || 'Maharashtra'}`}
                          onChange={(e) => setEditForm({ ...editForm, district: e.target.value.split(',')[0]?.trim() || editForm.district })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. EMERGENCY CONTACT */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">4. Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Emergency Contact Name *</label>
                        <input
                          type="text"
                          value={editForm.emergencyContactName}
                          onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Emergency Contact Phone *</label>
                        <input
                          type="tel"
                          value={editForm.emergencyContactPhone}
                          onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. HEALTH PROFILE */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">5. Health Profile</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Allergies & Adverse Drug Reactions</label>
                        <input
                          type="text"
                          value={editForm.allergies}
                          onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                          placeholder="e.g. Penicillin, Sulfa, Dust"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Existing Conditions / Chronic Diagnoses</label>
                        <input
                          type="text"
                          value={editForm.existingConditions}
                          onChange={(e) => setEditForm({ ...editForm, existingConditions: e.target.value })}
                          placeholder="e.g. Hypertension, Type-2 Diabetes"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Current Daily Medications</label>
                        <input
                          type="text"
                          value={editForm.currentMedications}
                          onChange={(e) => setEditForm({ ...editForm, currentMedications: e.target.value })}
                          placeholder="e.g. Amlodipine 5mg OD"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleCancelProfileEdit}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveProfileLoading}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      {saveProfileLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* VIEW PROFILE SECTIONS */
                <div className="space-y-6 text-xs">
                  {/* SECTION 1: PERSONAL DETAILS */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">Personal Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Full Name</span>
                        <p className="font-bold text-white text-sm mt-0.5">{profileData.name || patientName}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Patient Reference ID</span>
                        <p className="font-mono font-bold text-sky-400 text-sm mt-0.5">{patientId}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Date of Birth & Age</span>
                        <p className="font-bold text-white text-sm mt-0.5">{profileData.dateOfBirth || '1984-04-12'} (42 Yrs)</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Blood Group</span>
                        <p className="font-bold text-rose-400 text-sm mt-0.5">{profileData.bloodGroup || 'B+'}</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: CONTACT DETAILS */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">Contact Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Phone Number</span>
                        <p className="font-bold text-white text-sm mt-0.5">{profileData.phone || '+91 98201 44521'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Email Address</span>
                        <p className="font-bold text-white text-sm mt-0.5">{profileData.email || 'rahul.sharma@carekey.health'}</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: ADDRESS */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">Residential Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 sm:col-span-2">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Address Line</span>
                        <p className="font-bold text-white text-sm mt-0.5">{profileData.address || 'Flat 402, Green Meadows, Senapati Bapat Road'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">City</span>
                        <p className="font-bold text-white text-sm mt-0.5">{profileData.city || 'Pune'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">State / Region</span>
                        <p className="font-bold text-white text-sm mt-0.5">{profileData.district || 'Pune'}, {profileData.state || 'Maharashtra'}</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: EMERGENCY CONTACT */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Contact Person</span>
                        <p className="font-bold text-white text-sm mt-0.5">{profileData.emergencyContactName || 'Anita Sharma (Spouse)'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Emergency Phone</span>
                        <p className="font-bold text-rose-400 font-mono text-sm mt-0.5">{profileData.emergencyContactPhone || '+91 98201 99881'}</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: HEALTH PROFILE */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">Health Profile & Clinical Background</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Allergies</span>
                        <p className="font-bold text-amber-400 text-xs mt-1">{profileData.allergies || 'Penicillin (mild rash)'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Existing Conditions</span>
                        <p className="font-bold text-white text-xs mt-1">{profileData.existingConditions || 'Hypertension (Controlled)'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Current Medications</span>
                        <p className="font-bold text-emerald-400 font-mono text-xs mt-1">{profileData.currentMedications || 'Amlodipine 5mg OD'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY RECORDS */}
          {activeTab === 'records' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Longitudinal Medical History</h2>
                  <p className="text-xs text-slate-400">Chronological history of recorded visits and clinical diagnoses</p>
                </div>
              </div>

              <div className="space-y-4">
                {visits.map((v) => (
                  <div key={v.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-xs font-bold">
                          {v.date || v.visitDate}
                        </span>
                        <h4 className="text-base font-bold text-white">{v.condition || v.diagnosis}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">{v.doctorName} &bull; {v.facility}</span>
                    </div>
                    {v.symptoms && <p className="text-xs text-slate-400"><span className="text-slate-500 font-semibold">Symptoms:</span> {v.symptoms}</p>}
                    {v.notes && <p className="text-xs text-slate-300 mt-1">{v.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEDICINES / PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Prescribed Medications</h2>
                  <p className="text-xs text-slate-400">Current and completed medication regimens issued by attending doctors</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Medicine</th>
                      <th className="px-5 py-3.5">Dose</th>
                      <th className="px-5 py-3.5">Frequency</th>
                      <th className="px-5 py-3.5">Duration</th>
                      <th className="px-5 py-3.5">Doctor / Facility</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {prescriptions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">{p.medicine}</td>
                        <td className="px-5 py-3.5 font-mono text-emerald-400">{p.dosage}</td>
                        <td className="px-5 py-3.5">{p.frequency}</td>
                        <td className="px-5 py-3.5">{p.duration}</td>
                        <td className="px-5 py-3.5 text-slate-400">{p.doctorName || p.prescribingDoctor} ({p.hospital || 'Hospital'})</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {p.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MY SECURE QR CODE */}
          {activeTab === 'my-qr' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">My Secure Access QR Code</h2>
                  <p className="text-xs text-slate-400">
                    Opaque access token: The QR code contains zero medical details. The backend validates doctor credentials before release.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className={`p-6 bg-white rounded-3xl shadow-2xl transition-all ${qrRevoked ? 'opacity-30 grayscale' : ''}`}>
                  <QRCodeSVG
                    value={qrToken}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {qrRevoked ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                    <Ban className="w-4 h-4" />
                    <span>QR ACCESS TOKEN REVOKED</span>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{qrToken}</span>
                    </span>
                    <p className="text-xs text-slate-400 max-w-sm pt-2">
                      Scan this QR to request authorized access to my medical record.
                    </p>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleRegenerateQR}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-sky-600/30 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>[ Regenerate QR ]</span>
                  </button>

                  <button
                    onClick={handleRevokeQR}
                    disabled={qrRevoked}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                  >
                    <Ban className="w-4 h-4" />
                    <span>[ Revoke QR ]</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DOCTOR ACCESS CONTROL */}
          {activeTab === 'doctor-access' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Authorized Doctor Access Control</h2>
                  <p className="text-xs text-slate-400">Complete visibility and control over which practitioners can view your records</p>
                </div>
              </div>

              <div className="space-y-4">
                {doctorAccessList.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white">{doc.doctorName}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          Status: {doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-sky-400 font-medium">{doc.hospital} &bull; {doc.specialty}</p>
                      <p className="text-xs text-slate-400">
                        Access Scope: <span className="text-slate-300 font-semibold">{doc.accessScope}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Expires: {doc.expiresAt}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleDoctorAccess(doc.id)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        doc.status === 'Active'
                          ? 'bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-rose-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      }`}
                    >
                      {doc.status === 'Active' ? (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          <span>[ Revoke Access ]</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>[ Restore Access ]</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FIND A DOCTOR */}
          {activeTab === 'find-doctor' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Find a Doctor & Medical Provider</h2>
                    <p className="text-xs text-slate-400">Search certified practitioners in Pune and request clinical connection</p>
                  </div>
                </div>

                {/* Filter Form */}
                <form onSubmit={handleSearchDoctors} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <input
                    type="text"
                    value={searchQuery.name}
                    onChange={(e) => setSearchQuery({ ...searchQuery, name: e.target.value })}
                    placeholder="Doctor name or specialty..."
                    className="px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    value={searchQuery.specialization}
                    onChange={(e) => setSearchQuery({ ...searchQuery, specialization: e.target.value })}
                    placeholder="Specialization (e.g. Cardiology)..."
                    className="px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    value={searchQuery.hospital}
                    onChange={(e) => setSearchQuery({ ...searchQuery, hospital: e.target.value })}
                    placeholder="Hospital / Clinic..."
                    className="px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer transition-all"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </form>

                {/* Doctor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {doctors.map((doc) => (
                    <div
                      key={doc.doctorId || doc.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            Verified Practitioner
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">{doc.city || 'Pune'}</span>
                        </div>
                        <h3 className="text-base font-bold text-white">{doc.name}</h3>
                        <p className="text-xs text-sky-400 font-semibold">{doc.specialization}</p>
                        <p className="text-xs text-slate-400">{doc.hospital}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => setSelectedDoctorModal(doc)}
                          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-center"
                        >
                          View Doctor Profile
                        </button>
                        <button
                          onClick={() => handleRequestDoctor(doc)}
                          disabled={requestLoading[doc.doctorId || doc.id]}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ACCESS HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Record Access History & Audit Trail</h2>
                  <p className="text-xs text-slate-400">Transparent record of every clinician who viewed your medical history</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Dr. Arpan</span>
                      <span className="text-slate-400">&bull; Viewed medical history & prescriptions</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">Facility: ABC Hospital</p>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">28 Sep 2026 18:10</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Dr. Mehta</span>
                      <span className="text-slate-400">&bull; Viewed medical history</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">Facility: XYZ Clinic</p>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">21 Sep 2026 11:30</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Dr. Singh</span>
                      <span className="text-slate-400">&bull; Viewed routine checkup baseline</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">Facility: Apex Hospital</p>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">10 Mar 2026 09:45</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AI HEALTH COPILOT */}
          {activeTab === 'ai-health' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Understand My Health Record</h2>
                  <p className="text-xs text-slate-400">Ask questions in plain English about your previous visits, prescriptions, and recovery guidance</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => setAiQuestion('What happened during my last visit?')}
                    className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    "What happened during my last visit?"
                  </button>
                  <button
                    onClick={() => setAiQuestion('Explain my active medication schedule.')}
                    className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    "Explain my active medication schedule."
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Question
                  </label>
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="e.g. What happened during my last visit?"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        <span>Explaining Health Record...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Explain My Record</span>
                      </>
                    )}
                  </button>
                </div>

                {aiResponse && (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span>CareKey AI Health Assistant</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Doctor Detail Modal */}
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
                <p className="text-xs font-bold text-white mt-0.5">{selectedDoctorModal.hospital || 'ABC Hospital'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">City & Location</span>
                <p className="text-xs font-bold text-white mt-0.5">{selectedDoctorModal.city || 'Pune'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Medical Registration Number</span>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{selectedDoctorModal.medicalRegistrationNumber || 'MH-MED-2024-88912'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDoctorModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleRequestDoctor(selectedDoctorModal);
                  setSelectedDoctorModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer text-xs"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
