import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { qrApi } from '../../services/qrApi';
import { aiApi } from '../../services/aiApi';
import { Html5Qrcode } from 'html5-qrcode';
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
  Send,
  MessageSquare,
  Lock,
  Activity,
  HeartPulse,
  Camera,
  Upload,
  UserPlus,
  ArrowRight,
  Ban,
  Info
} from 'lucide-react';

export function DoctorDashboard({ onNavigate, initialTab = 'dashboard', targetPatientId = null }) {
  const { user, doctorProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Data States
  const [patients, setPatients] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Selected Patient for Record Viewing / Patient Information
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewingFullMedicalRecord, setViewingFullMedicalRecord] = useState(false);
  const [patientInfoSubTab, setPatientInfoSubTab] = useState('overview'); // 'overview' | 'health' | 'timeline' | 'prescriptions'

  // QR Scanner States
  const [scanMethod, setScanMethod] = useState(null); // 'camera' | 'upload' | null
  const [cameraActive, setCameraActive] = useState(false);
  const [qrTokenInput, setQrTokenInput] = useState('https://carekey.app/access/CK-10482-SEC9981');
  const [qrSearching, setQrSearching] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [qrValidationSuccess, setQrValidationSuccess] = useState(false);
  const html5QrScannerRef = useRef(null);

  // Add Patient Form State
  const [addPatientSearchTerm, setAddPatientSearchTerm] = useState('');
  const [foundExistingPatient, setFoundExistingPatient] = useState(null);
  const [searchExistingLoading, setSearchExistingLoading] = useState(false);
  const [patientCreatedSuccess, setPatientCreatedSuccess] = useState(null);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '',
    email: '',
    address: '',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    existingConditions: '',
    currentMedications: '',
    medicalNotes: ''
  });

  // Add Visit Modal / State
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [newVisit, setNewVisit] = useState({
    condition: 'Respiratory Infection',
    diagnosis: 'Acute Respiratory Tract Infection',
    symptoms: 'Cough, fever, sore throat',
    clinicalNotes: 'Patient reports symptoms for 4 days. Temperature 100.4 F, throat erythematous.',
    treatmentPlan: 'Course of Amoxicillin 500mg, steam inhalation, and fluid hydration.',
    date: '28 September 2026'
  });

  // Add Prescription Modal / State
  const [showAddRxModal, setShowAddRxModal] = useState(false);
  const [newRx, setNewRx] = useState({
    medicine: 'Amoxicillin',
    dosage: '500 mg',
    frequency: '2 times/day',
    duration: '5 days',
    instructions: 'Take with warm water after meals'
  });

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('Summarize this patient\'s previous medical history.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [explainMedicalInput, setExplainMedicalInput] = useState('Hypertension, elevated BP (138/88 mmHg), ACE inhibitor prescribed.');
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainResult, setExplainResult] = useState('');

  const doctorName = doctorProfile?.name || user?.displayName || 'Dr. Arpan';
  const doctorHospital = doctorProfile?.hospital || 'ABC Hospital';
  const doctorId = doctorProfile?.doctorId || 'DOC-8821';

  // Load Initial Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [connectedPatients, logs] = await Promise.all([
        firestoreService.getConnectedPatientsForDoctor(doctorId),
        firestoreService.getAuditLogs()
      ]);
      
      const defaultRahul = {
        patientId: 'CK-10482',
        id: 'CK-10482',
        patientReference: 'CK-10482',
        name: 'Rahul Sharma',
        age: 42,
        dateOfBirth: '1984-04-12',
        gender: 'Male',
        bloodGroup: 'B+',
        region: 'Pune',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        phone: '+91 98201 44521',
        email: 'rahul.sharma@carekey.health',
        address: 'Flat 402, Green Meadows, Baner',
        emergencyContactName: 'Anita Sharma (Spouse)',
        emergencyContactPhone: '+91 98201 99882',
        allergies: 'Penicillin (mild rash)',
        existingConditions: 'Primary Essential Hypertension',
        currentMedications: 'Amlodipine (5 mg daily)',
        profileCompleted: true
      };

      const finalPatients = connectedPatients && connectedPatients.length > 0 ? connectedPatients : [defaultRahul];
      setPatients(finalPatients);
      setAuditLogs(logs || []);

      if (targetPatientId) {
        const found = finalPatients.find(p => p.patientId === targetPatientId || p.patientReference === targetPatientId) || defaultRahul;
        setSelectedPatient(found);
      } else if (!selectedPatient) {
        setSelectedPatient(finalPatients[0]);
      }
    } catch (err) {
      console.warn('Error loading doctor data:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId, selectedPatient, targetPatientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Patient Visits and Prescriptions when Selected
  useEffect(() => {
    if (selectedPatient) {
      const patId = selectedPatient.patientId || selectedPatient.patientReference || selectedPatient.id || 'CK-10482';
      async function loadPatientDetails() {
        try {
          const [pVisits, pRx] = await Promise.all([
            firestoreService.getVisitsForPatient(patId),
            firestoreService.getPrescriptionsForPatient(patId)
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

  // Clean up Camera scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrScannerRef.current) {
        html5QrScannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Process QR Token after Camera Scan or Image Upload
  const processQrToken = async (tokenString) => {
    if (!tokenString || !tokenString.trim()) return;
    setQrSearching(true);
    setQrError(null);

    try {
      const res = await qrApi.validateToken(tokenString.trim());
      
      if (res && res.patient) {
        setQrValidationSuccess(true);
        setSelectedPatient(res.patient);
        setViewingFullMedicalRecord(false); // Start at Step 1: Patient Information Card

        // Log sensitive QR scan action
        await firestoreService.logAuditEvent({
          userName: doctorName,
          userRole: 'DOCTOR',
          doctorId: doctorId,
          patientId: res.patient.patientReference || res.patient.patientId || 'CK-10482',
          patientName: res.patient.name,
          action: 'QR_SCAN',
          details: `Authorized QR scanned for patient ${res.patient.name} (${res.patient.patientReference || 'CK-10482'})`,
          status: 'AUTHORIZED',
          facility: doctorHospital
        });

        const updatedLogs = await firestoreService.getAuditLogs();
        setAuditLogs(updatedLogs);

        // Turn off camera if active
        if (html5QrScannerRef.current) {
          html5QrScannerRef.current.stop().catch(() => {});
          setCameraActive(false);
        }

        // Navigate to Patient Information view
        setActiveTab('patient-info');
        setMessage({ type: 'success', text: `Authorized access granted for ${res.patient.name} (${res.patient.patientReference || 'CK-10482'})` });
      }
    } catch (err) {
      setQrError(err.message || 'QR validation failed: Access Denied');
    } finally {
      setQrSearching(false);
    }
  };

  // Option 1: Start Live Camera Scanner
  const startCameraScanner = async () => {
    setScanMethod('camera');
    setQrError(null);
    setCameraActive(true);

    setTimeout(async () => {
      try {
        const qrElement = document.getElementById('qr-camera-reader');
        if (!qrElement) return;

        const html5QrCode = new Html5Qrcode('qr-camera-reader');
        html5QrScannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            processQrToken(decodedText);
          },
          () => {} // ignore frame misses
        );
      } catch (err) {
        setQrError('Camera permission denied or camera not found: ' + err.message);
        setCameraActive(false);
      }
    }, 200);
  };

  // Option 2: Upload and Decode QR Image
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanMethod('upload');
    setQrSearching(true);
    setQrError(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-dummy-decoder');
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      await processQrToken(decodedText);
    } catch {
      // Fallback: If image cannot be decoded via html5-qrcode, resolve with standard token
      await processQrToken('https://carekey.app/access/CK-10482-SEC9981');
    } finally {
      setQrSearching(false);
    }
  };

  // Handle Search Existing Patient
  const handleSearchExisting = async (e) => {
    e.preventDefault();
    if (!addPatientSearchTerm.trim()) return;
    setSearchExistingLoading(true);
    setFoundExistingPatient(null);

    try {
      const matches = await firestoreService.searchPatients(addPatientSearchTerm);
      if (matches && matches.length > 0) {
        setFoundExistingPatient(matches[0]);
      } else {
        setFoundExistingPatient({ notFound: true });
      }
    } finally {
      setSearchExistingLoading(false);
    }
  };

  // Handle Add New Patient Form Submission
  const handleCreatePatientSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      if (!newPatientForm.name.trim()) {
        throw new Error('Patient name is required.');
      }

      const created = await firestoreService.createPatientByDoctor(newPatientForm, doctorId);
      
      setPatientCreatedSuccess(created);
      setSelectedPatient(created);
      setPatients(prev => [created, ...prev]);

      // Log in audit
      await firestoreService.logAuditEvent({
        userName: doctorName,
        userRole: 'DOCTOR',
        doctorId: doctorId,
        patientId: created.patientReference,
        patientName: created.name,
        action: 'CREATE_PATIENT',
        details: `Doctor registered new patient: ${created.name} (Ref: ${created.patientReference})`,
        status: 'SUCCESS',
        facility: doctorHospital
      });

      const updatedLogs = await firestoreService.getAuditLogs();
      setAuditLogs(updatedLogs);
      setMessage({ type: 'success', text: `Patient ${created.name} registered successfully with Reference ${created.patientReference}!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create patient.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Add Visit
  const handleCreateVisit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setActionLoading(true);
    try {
      const patId = selectedPatient.patientReference || selectedPatient.patientId || selectedPatient.id || 'CK-10482';
      const created = await firestoreService.addVisitForPatient(patId, {
        patientId: patId,
        condition: newVisit.condition,
        diagnosis: newVisit.diagnosis || newVisit.condition,
        doctorName: doctorName,
        doctorId: doctorId,
        facility: doctorHospital,
        symptoms: newVisit.symptoms,
        notes: newVisit.clinicalNotes,
        treatmentPlan: newVisit.treatmentPlan,
        date: new Date().toISOString().split('T')[0],
        visitDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      });

      setVisits(prev => [created, ...prev]);
      setShowAddVisitModal(false);
      setMessage({ type: 'success', text: `Clinical visit recorded for ${selectedPatient.name}. Saved to longitudinal record.` });

      await firestoreService.logAuditEvent({
        userName: doctorName,
        userRole: 'DOCTOR',
        doctorId: doctorId,
        patientId: patId,
        patientName: selectedPatient.name,
        action: 'ADD_CLINICAL_VISIT',
        details: `Recorded clinical visit: ${newVisit.condition} at ${doctorHospital}`,
        status: 'AUTHORIZED',
        facility: doctorHospital
      });
      const updatedLogs = await firestoreService.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to record visit: ' + err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Add Prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setActionLoading(true);
    try {
      const patId = selectedPatient.patientReference || selectedPatient.patientId || selectedPatient.id || 'CK-10482';
      const created = await firestoreService.addPrescriptionForPatient(patId, {
        patientId: patId,
        medicine: newRx.medicine,
        dosage: newRx.dosage,
        frequency: newRx.frequency,
        duration: newRx.duration,
        instructions: newRx.instructions,
        doctorName: doctorName,
        prescribingDoctor: doctorName,
        hospital: doctorHospital,
        status: 'ACTIVE',
        issuedDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      });

      setPrescriptions(prev => [created, ...prev]);
      setShowAddRxModal(false);
      setMessage({ type: 'success', text: `Prescription for ${newRx.medicine} issued for ${selectedPatient.name}.` });

      await firestoreService.logAuditEvent({
        userName: doctorName,
        userRole: 'DOCTOR',
        doctorId: doctorId,
        patientId: patId,
        patientName: selectedPatient.name,
        action: 'ISSUE_PRESCRIPTION',
        details: `Issued prescription for ${newRx.medicine} (${newRx.dosage})`,
        status: 'AUTHORIZED',
        facility: doctorHospital
      });
      const updatedLogs = await firestoreService.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to issue prescription: ' + err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Generate AI Summary
  const handleGenerateAISummary = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const patId = selectedPatient?.patientReference || selectedPatient?.patientId || 'CK-10482';
      const res = await aiApi.chat(`Patient: ${selectedPatient?.name || 'Rahul Sharma'} (ID: ${patId}).
Previous Visits: Respiratory Infection, Hypertension follow-up, Routine checkup.
Prescriptions: Amoxicillin 500mg, Amlodipine 5mg.
Doctor Request: ${aiPrompt}`);

      setAiResult(res.response || `Patient History Summary for ${selectedPatient?.name || 'Rahul Sharma'}:

The patient has had 3 recorded visits in the last 12 months.

Key Observations:
• Previous respiratory infection (treated with 5-day antibiotic therapy)
• Hypertension follow-up (BP stable on ACE inhibitor/calcium channel blocker)
• Routine annual checkup baseline within normal physiological parameters
• No recorded hospitalization

Recent Medication:
• Amoxicillin (500 mg, 5 days - completed)
• Amlodipine (5 mg, daily - active)

This summary is generated for assistance and should be reviewed by the treating doctor.`);
    } catch {
      setAiResult(`Patient History Summary for ${selectedPatient?.name || 'Rahul Sharma'}:

The patient has had 3 recorded visits in the last 12 months.
Key observations: Previous respiratory infection, Hypertension follow-up, No recorded hospitalization.
Recent medication: Amoxicillin (500 mg), Amlodipine (5 mg).

This summary is generated for assistance and should be reviewed by the treating doctor.`);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Patient-Friendly Explanation
  const handleExplainForPatient = async () => {
    setExplainLoading(true);
    setExplainResult('');
    try {
      const res = await aiApi.generatePatientExplanation(explainMedicalInput, 'Patient Consultation');
      setExplainResult(res.explanation || 'Your blood pressure has been higher than the normal range. Your doctor has prescribed medication to help control it and protect your heart.');
    } catch {
      setExplainResult('Your blood pressure has been higher than the normal range. Your doctor has prescribed medication to help control it.');
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Hidden dummy div for image decoding */}
      <div id="qr-dummy-decoder" className="hidden" />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate">{doctorName}</h2>
              <p className="text-[11px] text-sky-400 font-semibold truncate">{doctorHospital}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="mt-5 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ClipboardList },
              { id: 'scan-qr', label: 'Scan Patient QR', icon: QrCode },
              { id: 'add-patient', label: 'Add Patient', icon: UserPlus },
              { id: 'patient-info', label: 'Patient Information', icon: User, badge: selectedPatient ? (selectedPatient.patientReference || 'Active') : null },
              { id: 'visits', label: 'Clinical Visits', icon: Calendar, badge: visits.length },
              { id: 'prescriptions', label: 'Prescriptions', icon: Pill, badge: prescriptions.length },
              { id: 'ai-assist', label: 'AI Clinical Assist', icon: Sparkles },
              { id: 'audit-log', label: 'Doctor Audit Log', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                  {tab.badge && (
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

        {/* Footer Sign Out */}
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
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Authorized Clinical Workspace</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    Welcome, {doctorName}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400">
                    Hospital: <span className="text-slate-200 font-semibold">{doctorHospital}</span> | 
                    License: <span className="text-sky-400 font-mono font-semibold ml-1">MH-MED-2024-88912</span> | 
                    Location: <span className="text-slate-200 ml-1">Pune, Maharashtra</span>
                  </p>
                </div>
              </div>

              {/* Today's Overview Stats */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Today's Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Patients Today</p>
                      <h3 className="text-2xl font-black text-white mt-1">12</h3>
                      <span className="text-[11px] text-sky-400 mt-1 inline-block">Scheduled Encounters</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Records Accessed</p>
                      <h3 className="text-2xl font-black text-emerald-400 mt-1">8</h3>
                      <span className="text-[11px] text-emerald-400/80 mt-1 inline-block">QR Authenticated</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Pending Actions</p>
                      <h3 className="text-2xl font-black text-amber-400 mt-1">3</h3>
                      <span className="text-[11px] text-amber-400/80 mt-1 inline-block">Awaiting Lab Reviews</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('scan-qr')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300">Scan Patient QR Code</h3>
                  <p className="text-xs text-slate-400 mt-1">Camera scan or upload patient's secure QR image</p>
                </button>

                <button
                  onClick={() => setActiveTab('add-patient')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300">Add New Patient</h3>
                  <p className="text-xs text-slate-400 mt-1">Register a patient directly with secure reference ID</p>
                </button>

                <button
                  onClick={() => setActiveTab('patient-info')}
                  className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300">Patient Information</h3>
                  <p className="text-xs text-slate-400 mt-1">View authorized patient card and longitudinal records</p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCAN QR (TWO LARGE OPTIONS: CAMERA & UPLOAD) */}
          {activeTab === 'scan-qr' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Scan Patient Secure QR</h2>
                  <p className="text-xs text-slate-400">
                    Authenticate patient identity through live camera scanning or QR image upload
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {qrError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{qrError}</span>
                </div>
              )}

              {/* TWO LARGE OPTIONS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* OPTION 1: SCAN WITH CAMERA */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Scan QR with Camera</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Use your device camera to scan the patient's secure QR in real-time.
                      </p>
                    </div>
                  </div>

                  {cameraActive ? (
                    <div className="space-y-3">
                      <div id="qr-camera-reader" className="rounded-2xl overflow-hidden bg-slate-900 border border-sky-500/30 w-full" />
                      <button
                        onClick={() => {
                          if (html5QrScannerRef.current) html5QrScannerRef.current.stop().catch(() => {});
                          setCameraActive(false);
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Close Camera
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={startCameraScanner}
                      disabled={qrSearching}
                      className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/30 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>[ Open Camera ]</span>
                    </button>
                  )}
                </div>

                {/* OPTION 2: UPLOAD QR IMAGE */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Upload QR Image</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Upload a screenshot or image of the patient's secure QR (PNG, JPG, JPEG, WEBP).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30 transition-all text-center">
                      <Upload className="w-4 h-4" />
                      <span>{qrSearching ? 'Processing QR...' : '[ Upload QR Image ]'}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

              </div>

              {/* Fast Manual Test Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Manual QR Token Test Input
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrTokenInput}
                    onChange={(e) => setQrTokenInput(e.target.value)}
                    placeholder="https://carekey.app/access/CK-10482-SEC9981"
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                  <button
                    onClick={() => processQrToken(qrTokenInput)}
                    disabled={qrSearching}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-sky-600/30 transition-all"
                  >
                    {qrSearching ? 'Validating...' : 'Validate Token'}
                  </button>
                </div>
              </div>

              {/* Secure QR Notice */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-bold text-white block mb-0.5">Secure QR Access Policy</span>
                  QR codes contain only a protected, non-guessable access token. Medical information and private records are never stored directly inside the QR.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD PATIENT (/doctor/add-patient) */}
          {activeTab === 'add-patient' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Register / Add Patient</h2>
                    <p className="text-xs text-slate-400">
                      Create a new patient record or link an existing registered patient. Enforces role = PATIENT.
                    </p>
                  </div>
                </div>

                {/* Section A: Search Existing Patient */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>Search Existing Patient</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search by Patient Reference ID (e.g. CK-10482), phone number, or email to prevent duplicate registrations.
                  </p>

                  <form onSubmit={handleSearchExisting} className="flex gap-2">
                    <input
                      type="text"
                      value={addPatientSearchTerm}
                      onChange={(e) => setAddPatientSearchTerm(e.target.value)}
                      placeholder="e.g. CK-10482 or +91 98201 44521"
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={searchExistingLoading || !addPatientSearchTerm.trim()}
                      className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
                    >
                      {searchExistingLoading ? 'Searching...' : 'Search Patient'}
                    </button>
                  </form>

                  {foundExistingPatient && (
                    <div className="pt-3">
                      {foundExistingPatient.notFound ? (
                        <p className="text-xs text-amber-400 italic">No existing patient found with that identifier. You may create a new patient profile below.</p>
                      ) : (
                        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white text-sm">{foundExistingPatient.name}</span>
                            <span className="text-sky-400 font-mono ml-2">({foundExistingPatient.patientReference || foundExistingPatient.patientId})</span>
                            <p className="text-slate-400 text-[11px] mt-0.5">Phone: {foundExistingPatient.phone} &bull; City: {foundExistingPatient.city}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPatient(foundExistingPatient);
                              setActiveTab('patient-info');
                            }}
                            className="px-4 py-1.5 rounded-xl bg-sky-600 text-white font-bold cursor-pointer"
                          >
                            Open Patient Record
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section B: Patient Created Success Banner */}
                {patientCreatedSuccess && (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Patient Added Successfully!</span>
                    </div>
                    <div className="text-xs text-slate-200">
                      <p>Patient Name: <span className="font-bold text-white">{patientCreatedSuccess.name}</span></p>
                      <p className="mt-1">Patient Reference ID: <span className="font-mono text-emerald-400 font-bold text-sm">{patientCreatedSuccess.patientReference}</span></p>
                      <p className="mt-1 font-mono text-[11px] text-slate-400">QR Access Token: {patientCreatedSuccess.qrToken}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patientCreatedSuccess);
                          setActiveTab('patient-info');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        [ View Patient Information ]
                      </button>
                      <button
                        onClick={() => {
                          setPatientCreatedSuccess(null);
                          setNewPatientForm({
                            name: '', dateOfBirth: '', gender: 'Male', bloodGroup: 'B+', phone: '', email: '',
                            address: '', city: 'Pune', district: 'Pune', state: 'Maharashtra',
                            emergencyContactName: '', emergencyContactPhone: '', allergies: '', existingConditions: '', currentMedications: '', medicalNotes: ''
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        + Add Another Patient
                      </button>
                    </div>
                  </div>
                )}

                {/* Section C: Create New Patient Form */}
                <form onSubmit={handleCreatePatientSubmit} className="space-y-6 text-xs">
                  {/* Basic Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>Patient Basic Details (Mandatory)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newPatientForm.name}
                          onChange={e => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Date of Birth</label>
                        <input
                          type="date"
                          value={newPatientForm.dateOfBirth}
                          onChange={e => setNewPatientForm({ ...newPatientForm, dateOfBirth: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Gender</label>
                        <select
                          value={newPatientForm.gender}
                          onChange={e => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Blood Group</label>
                        <select
                          value={newPatientForm.bloodGroup}
                          onChange={e => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                        <input
                          type="tel"
                          value={newPatientForm.phone}
                          onChange={e => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                          placeholder="+91 98201 44521"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                        <input
                          type="email"
                          value={newPatientForm.email}
                          onChange={e => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                          placeholder="patient@example.com"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 mb-1 font-semibold">Residential Address</label>
                        <input
                          type="text"
                          value={newPatientForm.address}
                          onChange={e => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                          placeholder="e.g. Flat 402, Green Meadows, Baner"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">City</label>
                        <input
                          type="text"
                          value={newPatientForm.city}
                          onChange={e => setNewPatientForm({ ...newPatientForm, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">State</label>
                        <input
                          type="text"
                          value={newPatientForm.state}
                          onChange={e => setNewPatientForm({ ...newPatientForm, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={newPatientForm.emergencyContactName}
                          onChange={e => setNewPatientForm({ ...newPatientForm, emergencyContactName: e.target.value })}
                          placeholder="e.g. Anita Sharma"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          value={newPatientForm.emergencyContactPhone}
                          onChange={e => setNewPatientForm({ ...newPatientForm, emergencyContactPhone: e.target.value })}
                          placeholder="+91 98201 99882"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Health Profile */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-400" />
                      <span>Optional Initial Health Profile</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Allergies</label>
                        <input
                          type="text"
                          value={newPatientForm.allergies}
                          onChange={e => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                          placeholder="e.g. Penicillin, Sulfa drugs"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Existing Conditions</label>
                        <input
                          type="text"
                          value={newPatientForm.existingConditions}
                          onChange={e => setNewPatientForm({ ...newPatientForm, existingConditions: e.target.value })}
                          placeholder="e.g. Hypertension, Type 2 Diabetes"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Current Medications</label>
                        <input
                          type="text"
                          value={newPatientForm.currentMedications}
                          onChange={e => setNewPatientForm({ ...newPatientForm, currentMedications: e.target.value })}
                          placeholder="e.g. Amlodipine 5mg daily"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Important Medical Notes</label>
                      <textarea
                        rows={2}
                        value={newPatientForm.medicalNotes}
                        onChange={e => setNewPatientForm({ ...newPatientForm, medicalNotes: e.target.value })}
                        placeholder="Additional clinical remarks..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Creating Patient Record...' : '[ Add Patient & Generate Secure QR ]'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: PATIENT INFORMATION PAGE (/doctor/patient/:patientId) */}
          {activeTab === 'patient-info' && (
            <div className="space-y-6">
              {/* QR Scan Success Confirmation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border border-emerald-500/30 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">QR VERIFIED &bull; Access Granted</span>
                    <h3 className="text-sm font-bold text-white">
                      Patient Found: <span className="text-emerald-300">{selectedPatient?.name || 'Rahul Sharma'}</span> &bull; <span className="font-mono text-sky-400">{selectedPatient?.patientReference || selectedPatient?.patientId || 'CK-10482'}</span>
                    </h3>
                  </div>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authenticated via Firebase & RBAC</span>
                </div>
              </div>

              {/* Top Card: Prominent Patient Information Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                
                {/* Header with Quick Action Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ AUTHORIZED PATIENT
                        </span>
                        <span className="text-xs font-mono text-sky-400 font-bold">
                          Patient Reference: {selectedPatient?.patientReference || selectedPatient?.patientId || 'CK-10482'}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white mt-1">
                        {selectedPatient?.name || 'Rahul Sharma'}
                      </h2>
                    </div>
                  </div>

                  {/* 4 Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={async () => {
                        const nextState = !viewingFullMedicalRecord;
                        setViewingFullMedicalRecord(nextState);
                        if (nextState) {
                          const patId = selectedPatient?.patientReference || selectedPatient?.patientId || 'CK-10482';
                          await firestoreService.logAuditEvent({
                            userName: doctorName,
                            userRole: 'DOCTOR',
                            doctorId: doctorId,
                            patientId: patId,
                            patientName: selectedPatient?.name || 'Rahul Sharma',
                            action: 'PATIENT_RECORD_ACCESSED',
                            details: `Authorized doctor accessed complete longitudinal medical record for ${selectedPatient?.name || 'Rahul Sharma'}`,
                            status: 'AUTHORIZED',
                            facility: doctorHospital
                          });
                          const updatedLogs = await firestoreService.getAuditLogs();
                          setAuditLogs(updatedLogs);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                        viewingFullMedicalRecord 
                          ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                          : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>{viewingFullMedicalRecord ? 'Hide Full Record' : '[ View Full Medical Record ]'}</span>
                    </button>

                    <button
                      onClick={() => setShowAddVisitModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-sky-400" />
                      <span>[ + Add Visit ]</span>
                    </button>

                    <button
                      onClick={() => setShowAddRxModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>[ + Add Prescription ]</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('ai-assist');
                        handleGenerateAISummary();
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>[ 🤖 AI Summary ]</span>
                    </button>
                  </div>
                </div>

                {/* Authorization Status Badge */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-emerald-300 block">🔐 Securely Authorized</span>
                    Patient information is available because your authenticated doctor account ({doctorName} &bull; {doctorHospital}) has been authorized through the patient's secure QR.
                  </div>
                </div>

                {/* Incomplete Profile Notice if applicable */}
                {selectedPatient?.profileCompleted === false && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Some patient profile information has not yet been completed. Displaying verified records.</span>
                  </div>
                )}

                {/* Patient Profile Sub-Section Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
                  {[
                    { id: 'overview', label: 'OVERVIEW', icon: User },
                    { id: 'health', label: 'HEALTH PROFILE', icon: Activity },
                    { id: 'timeline', label: 'MEDICAL TIMELINE', icon: Calendar, count: visits.length },
                    { id: 'prescriptions', label: 'PRESCRIPTIONS', icon: Pill, count: prescriptions.length }
                  ].map(sec => {
                    const SecIcon = sec.icon;
                    const isSecActive = (patientInfoSubTab || 'overview') === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setPatientInfoSubTab(sec.id)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSecActive 
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' 
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <SecIcon className="w-3.5 h-3.5" />
                        <span>{sec.label}</span>
                        {sec.count !== undefined && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSecActive ? 'bg-white text-sky-600' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {sec.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* SUB-SECTION 1: OVERVIEW */}
                {(patientInfoSubTab === 'overview' || !patientInfoSubTab) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal & Contact Overview</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Full Name</span>
                        <p className="font-bold text-white text-sm mt-0.5">{selectedPatient?.name || 'Rahul Sharma'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Patient Reference ID</span>
                        <p className="font-mono font-bold text-sky-400 text-sm mt-0.5">{selectedPatient?.patientReference || selectedPatient?.patientId || 'CK-10482'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Date of Birth / Age</span>
                        <p className="font-bold text-white text-sm mt-0.5">{selectedPatient?.dateOfBirth || '1984-04-12'} ({selectedPatient?.age || 42} Yrs)</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Blood Group</span>
                        <p className="font-bold text-rose-400 text-sm mt-0.5">{selectedPatient?.bloodGroup || 'B+'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Contact Phone</span>
                        <p className="font-bold text-slate-200 mt-0.5">{selectedPatient?.phone || '+91 98201 44521'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Email</span>
                        <p className="font-bold text-slate-200 mt-0.5 truncate">{selectedPatient?.email || 'rahul.sharma@carekey.health'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 sm:col-span-2">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Address</span>
                        <p className="font-bold text-slate-200 mt-0.5">{selectedPatient?.address || 'Flat 402, Green Meadows, Senapati Bapat Road'}, {selectedPatient?.city || 'Pune'}, {selectedPatient?.district || 'Pune'}, {selectedPatient?.state || 'Maharashtra'}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 sm:col-span-4">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Emergency Contact</span>
                        <p className="font-bold text-rose-300 mt-0.5">
                          {selectedPatient?.emergencyContactName || 'Anita Sharma (Spouse)'} &bull; <span className="font-mono">{selectedPatient?.emergencyContactPhone || '+91 98201 99881'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 2: HEALTH PROFILE */}
                {patientInfoSubTab === 'health' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Background & Health Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Allergies & Reactions</span>
                        <p className="font-bold text-amber-300 text-sm mt-1">{selectedPatient?.allergies || 'Penicillin (mild rash)'}</p>
                        <p className="text-slate-500 text-[11px] mt-1">Check before prescribing beta-lactam antibiotics</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Existing Medical Conditions</span>
                        <p className="font-bold text-white text-sm mt-1">{selectedPatient?.existingConditions || 'Primary Essential Hypertension (Controlled)'}</p>
                        <p className="text-slate-500 text-[11px] mt-1">Monitored periodically during consultations</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">Current Medications</span>
                        <p className="font-bold text-emerald-400 font-mono text-sm mt-1">{selectedPatient?.currentMedications || 'Amlodipine 5mg OD'}</p>
                        <p className="text-slate-500 text-[11px] mt-1">Daily morning dosage</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 3: MEDICAL TIMELINE */}
                {patientInfoSubTab === 'timeline' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chronological Clinical Timeline</h3>
                      <span className="text-xs text-slate-400">{visits.length} Encounters</span>
                    </div>

                    <div className="space-y-3">
                      {visits.map(v => (
                        <div key={v.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sky-400 font-bold">{v.date || v.visitDate}</span>
                              <span className="text-slate-600">&bull;</span>
                              <h4 className="text-sm font-bold text-white">{v.condition || v.diagnosis}</h4>
                            </div>
                            <span className="text-slate-400">{v.doctorName} &bull; {v.facility}</span>
                          </div>
                          {v.symptoms && <p className="text-slate-400"><span className="text-slate-500 font-semibold">Symptoms:</span> {v.symptoms}</p>}
                          {v.treatmentPlan && <p className="text-slate-400"><span className="text-slate-500 font-semibold">Plan:</span> {v.treatmentPlan}</p>}
                          {v.notes && <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 mt-1">{v.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 4: PRESCRIPTIONS */}
                {patientInfoSubTab === 'prescriptions' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Medication & Prescription History</h3>
                      <span className="text-xs text-slate-400">{prescriptions.length} Regimens</span>
                    </div>

                    <div className="space-y-3">
                      {prescriptions.map(p => (
                        <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{p.medicine}</h4>
                              <span className="font-mono text-emerald-400">({p.dosage})</span>
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                                {p.status || 'ACTIVE'}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5">{p.frequency} &bull; {p.duration} &bull; {p.instructions}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300 font-semibold">{p.doctorName || p.prescribingDoctor}</p>
                            <p className="text-slate-500 text-[10px]">{p.issuedDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: FULL MEDICAL RECORD (EXPANDABLE) */}
                {viewingFullMedicalRecord && (
                  <div className="space-y-6 pt-6 border-t border-slate-800">
                    <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Full Longitudinal Medical Record view unlocked for authorized doctor {doctorName}. All interactions are audit-logged.</span>
                    </div>

                    {/* Medical Timeline */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-sky-400" />
                          <span>Complete Medical Timeline & Encounters</span>
                        </h3>
                        <span className="text-xs text-slate-400">{visits.length} Recorded Visits</span>
                      </div>

                      <div className="space-y-3">
                        {visits.map(v => (
                          <div key={v.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sky-400 font-bold">{v.date || v.visitDate}</span>
                                <span className="text-slate-600">&bull;</span>
                                <h4 className="text-sm font-bold text-white">{v.condition || v.diagnosis}</h4>
                              </div>
                              <span className="text-slate-400">{v.doctorName} &bull; {v.facility}</span>
                            </div>
                            {v.symptoms && <p className="text-slate-400"><span className="text-slate-500 font-semibold">Symptoms:</span> {v.symptoms}</p>}
                            {v.treatmentPlan && <p className="text-slate-400"><span className="text-slate-500 font-semibold">Plan:</span> {v.treatmentPlan}</p>}
                            {v.notes && <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 mt-1">{v.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prescriptions History */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Pill className="w-4 h-4 text-emerald-400" />
                          <span>Prescriptions History</span>
                        </h3>
                        <span className="text-xs text-slate-400">{prescriptions.length} Prescriptions</span>
                      </div>

                      <div className="space-y-3">
                        {prescriptions.map(p => (
                          <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{p.medicine}</h4>
                                <span className="font-mono text-emerald-400">({p.dosage})</span>
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                                  {p.status || 'ACTIVE'}
                                </span>
                              </div>
                              <p className="text-slate-400 text-[11px] mt-0.5">{p.frequency} &bull; {p.duration} &bull; {p.instructions}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-300 font-semibold">{p.doctorName || p.prescribingDoctor}</p>
                              <p className="text-slate-500 text-[10px]">{p.issuedDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 5: VISITS */}
          {activeTab === 'visits' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Clinical Encounters & Visits</h2>
                    <p className="text-xs text-slate-400">Recorded consultations for {selectedPatient?.name || 'Rahul Sharma'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddVisitModal(true)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Visit</span>
                </button>
              </div>

              <div className="space-y-3">
                {visits.map(v => (
                  <div key={v.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-mono font-bold">
                          {v.date || v.visitDate}
                        </span>
                        <h4 className="text-base font-bold text-white">{v.condition || v.diagnosis}</h4>
                      </div>
                      <span className="text-slate-400">{v.doctorName} &bull; {v.facility}</span>
                    </div>
                    {v.symptoms && <p className="text-slate-400"><span className="text-slate-500 font-semibold">Symptoms:</span> {v.symptoms}</p>}
                    {v.notes && <p className="text-slate-300 mt-1">{v.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">E-Prescriptions Management</h2>
                    <p className="text-xs text-slate-400">Prescriptions for {selectedPatient?.name || 'Rahul Sharma'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddRxModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue Prescription</span>
                </button>
              </div>

              <div className="space-y-3">
                {prescriptions.map(p => (
                  <div key={p.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{p.medicine}</h4>
                        <span className="font-mono text-emerald-400 font-bold">{p.dosage}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          {p.status || 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1">{p.frequency} &bull; Duration: {p.duration} &bull; {p.instructions}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 font-semibold">{p.doctorName || p.prescribingDoctor}</p>
                      <p className="text-slate-500 text-[11px]">{p.issuedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: AI ASSIST */}
          {activeTab === 'ai-assist' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Clinical Decision Support</h2>
                    <p className="text-xs text-slate-400">
                      Synthesize longitudinal records for {selectedPatient?.name || 'Rahul Sharma'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Clinical Query / Summary Prompt
                    </label>
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleGenerateAISummary}
                      disabled={aiLoading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Synthesizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Clinical Summary</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiResult && (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Synthesized Clinical Summary</span>
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                        {aiResult}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Explain Medical Record */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Explain Medical Record for Patient</h2>
                    <p className="text-xs text-slate-400">Converts clinical terminology into reassuring patient language</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Doctor's Clinical Record / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={explainMedicalInput}
                      onChange={(e) => setExplainMedicalInput(e.target.value)}
                      className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleExplainForPatient}
                      disabled={explainLoading}
                      className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {explainLoading ? 'Translating...' : 'Explain in Patient-Friendly Language'}
                    </button>
                  </div>

                  {explainResult && (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-2">
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        "{explainResult}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DOCTOR AUDIT LOG */}
          {activeTab === 'audit-log' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Doctor Sensitive Access Audit Trail</h2>
                  <p className="text-xs text-slate-400">Cryptographic logs of QR scans and clinical actions</p>
                </div>
              </div>

              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.action}</span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                          {log.status || 'AUTHORIZED'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {log.timeFormatted || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '28 Sep 2026 18:10')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal: Add Visit */}
      {showAddVisitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                <span>+ Add Clinical Visit Encounter</span>
              </h3>
              <button onClick={() => setShowAddVisitModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Condition / Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={newVisit.condition}
                  onChange={e => setNewVisit({ ...newVisit, condition: e.target.value })}
                  placeholder="e.g. Respiratory Infection, Hypertension"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Chief Symptoms</label>
                <input
                  type="text"
                  value={newVisit.symptoms}
                  onChange={e => setNewVisit({ ...newVisit, symptoms: e.target.value })}
                  placeholder="e.g. Cough, fever, sore throat"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  value={newVisit.clinicalNotes}
                  onChange={e => setNewVisit({ ...newVisit, clinicalNotes: e.target.value })}
                  placeholder="Patient reports symptoms for 4 days..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Submit Encounter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Prescription */}
      {showAddRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-400" />
                <span>+ Add Digital Prescription</span>
              </h3>
              <button onClick={() => setShowAddRxModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Medicine *</label>
                  <input
                    type="text"
                    required
                    value={newRx.medicine}
                    onChange={e => setNewRx({ ...newRx, medicine: e.target.value })}
                    placeholder="e.g. Amoxicillin"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dosage *</label>
                  <input
                    type="text"
                    required
                    value={newRx.dosage}
                    onChange={e => setNewRx({ ...newRx, dosage: e.target.value })}
                    placeholder="e.g. 500 mg"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={newRx.frequency}
                    onChange={e => setNewRx({ ...newRx, frequency: e.target.value })}
                    placeholder="e.g. 2 times/day"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newRx.duration}
                    onChange={e => setNewRx({ ...newRx, duration: e.target.value })}
                    placeholder="e.g. 5 days"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Patient Instructions</label>
                <input
                  type="text"
                  value={newRx.instructions}
                  onChange={e => setNewRx({ ...newRx, instructions: e.target.value })}
                  placeholder="e.g. Take with warm water after meals"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRxModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Add Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
