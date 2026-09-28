import { 
  db 
} from '../firebase/firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

// Helper to prevent Firestore from hanging when database is not yet provisioned
function withTimeout(promise, ms = 2500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore connection timeout')), ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeoutPromise
  ]);
}

// Local storage cache helpers to ensure instantaneous UX
function getLocal(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/private browsing errors
  }
}

// Seed default clean records for Rahul Sharma (CK-10482) & Dr. Arpan (DOC-8821)
function seedCleanDataIfEmpty() {
  // 1. Doctors
  if (!localStorage.getItem('carekey_registered_doctors_v2')) {
    const defaultDoctors = [
      {
        doctorId: 'DOC-8821',
        uid: 'doc-arpan-01',
        name: 'Dr. Arpan',
        specialization: 'General Medicine & Cardiology',
        medicalRegistrationNumber: 'MH-MED-2024-88912',
        hospital: 'ABC Hospital',
        city: 'Pune',
        email: 'dr.arpan@carekey.health',
        phone: '+91 98765 43210',
        role: 'DOCTOR'
      },
      {
        doctorId: 'DOC-7712',
        uid: 'doc-priya-01',
        name: 'Dr. Priya Sharma',
        specialization: 'Cardiology',
        medicalRegistrationNumber: 'MH-CARD-2022-77189',
        hospital: 'Metro Heart Institute',
        city: 'Pune',
        email: 'priya.sharma@metroheart.in',
        phone: '+91 98234 11223',
        role: 'DOCTOR'
      },
      {
        doctorId: 'DOC-5541',
        uid: 'doc-mehta-01',
        name: 'Dr. Rajesh Mehta',
        specialization: 'Pulmonology & Critical Care',
        medicalRegistrationNumber: 'MH-PULM-2021-44512',
        hospital: 'City Care Hospital',
        city: 'Pune',
        email: 'rajesh.mehta@citycare.in',
        phone: '+91 98111 22334',
        role: 'DOCTOR'
      },
      {
        doctorId: 'DOC-3329',
        uid: 'doc-rao-01',
        name: 'Dr. Ananya Rao',
        specialization: 'Internal Medicine',
        medicalRegistrationNumber: 'MH-INT-2023-99014',
        hospital: 'Apex Health Clinic',
        city: 'Pune',
        email: 'ananya.rao@apexhealth.in',
        phone: '+91 98555 66778',
        role: 'DOCTOR'
      }
    ];
    setLocal('carekey_registered_doctors', defaultDoctors);
    defaultDoctors.forEach(d => {
      setLocal(`carekey_doc_${d.doctorId}`, d);
      setLocal(`carekey_doc_${d.uid}`, d);
    });
    localStorage.setItem('carekey_registered_doctors_v2', 'true');
  }

  // 2. Patient: Rahul Sharma (CK-10482)
  if (!localStorage.getItem('carekey_patient_rahul_v3')) {
    const rahul = {
      patientId: 'CK-10482',
      id: 'CK-10482',
      patientReference: 'CK-10482',
      uid: 'pat-rahul-01',
      ownerUid: 'pat-rahul-01',
      name: 'Rahul Sharma',
      age: 42,
      gender: 'Male',
      bloodGroup: 'B+',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      region: 'Pune',
      dateOfBirth: '1984-04-12',
      phone: '+91 98201 44521',
      email: 'rahul.sharma@carekey.health',
      address: 'Flat 402, Green Meadows, Senapati Bapat Road',
      emergencyContactName: 'Anita Sharma (Spouse)',
      emergencyContactPhone: '+91 98201 99881',
      emergencyContact: {
        name: 'Anita Sharma (Spouse)',
        phone: '+91 98201 99881'
      },
      allergies: 'Penicillin (mild rash)',
      existingConditions: 'Hypertension (Controlled)',
      currentMedications: 'Amlodipine 5mg OD',
      profileCompleted: true,
      role: 'PATIENT',
      createdAt: '2026-03-01T09:00:00Z',
      updatedAt: '2026-09-28T18:00:00Z'
    };
    setLocal('carekey_pat_CK-10482', rahul);
    setLocal('carekey_pat_pat-rahul-01', rahul);
    setLocal('carekey_registered_patients', [rahul]);
    localStorage.setItem('carekey_patient_rahul_v3', 'true');

    // Default Visits
    const defaultVisits = [
      {
        id: 'visit_1',
        patientId: 'CK-10482',
        diagnosis: 'Respiratory Infection',
        condition: 'Respiratory Infection',
        doctorName: 'Dr. Mehta',
        doctorId: 'DOC-5541',
        facility: 'ABC Hospital',
        symptoms: 'Cough, fever, sore throat',
        notes: 'Patient reports symptoms for 4 days. Prescribed 5-day antibiotic therapy.',
        treatmentPlan: 'Course of Amoxicillin 500mg, steam inhalation, and fluid hydration.',
        date: '2026-08-12',
        visitDate: '12 Aug 2026'
      },
      {
        id: 'visit_2',
        patientId: 'CK-10482',
        diagnosis: 'Hypertension Follow-up',
        condition: 'Hypertension Follow-up',
        doctorName: 'Dr. Rao',
        doctorId: 'DOC-3329',
        facility: 'City Health Clinic',
        symptoms: 'Mild morning headaches, BP 138/88 mmHg',
        notes: 'Blood pressure reasonably controlled. Continue morning antihypertensive regimen.',
        treatmentPlan: 'Maintain low-sodium diet, regular 30-min walking, and daily Amlodipine 5mg.',
        date: '2026-06-21',
        visitDate: '21 Jun 2026'
      },
      {
        id: 'visit_3',
        patientId: 'CK-10482',
        diagnosis: 'Routine Checkup',
        condition: 'Routine Checkup',
        doctorName: 'Dr. Singh',
        doctorId: 'DOC-9910',
        facility: 'Apex Hospital',
        symptoms: 'None reported (Annual baseline examination)',
        notes: 'Cardiovascular, respiratory, and abdominal baseline within normal physiological parameters.',
        treatmentPlan: 'Annual routine metabolic follow-up in 12 months.',
        date: '2026-03-10',
        visitDate: '10 Mar 2026'
      }
    ];
    setLocal('carekey_visits_CK-10482', defaultVisits);

    // Default Prescriptions
    const defaultPrescriptions = [
      {
        id: 'rx_1',
        patientId: 'CK-10482',
        medicine: 'Amoxicillin',
        dosage: '500 mg',
        frequency: '2 times/day',
        duration: '5 days',
        instructions: 'Take with warm water after meals',
        doctorName: 'Dr. Mehta',
        prescribingDoctor: 'Dr. Mehta',
        hospital: 'ABC Hospital',
        status: 'COMPLETED',
        issuedDate: '12 Aug 2026'
      },
      {
        id: 'rx_2',
        patientId: 'CK-10482',
        medicine: 'Amlodipine',
        dosage: '5 mg',
        frequency: 'Once Daily (Morning)',
        duration: '30 days',
        instructions: 'Take in the morning before breakfast',
        doctorName: 'Dr. Rao',
        prescribingDoctor: 'Dr. Rao',
        hospital: 'City Health Clinic',
        status: 'ACTIVE',
        issuedDate: '21 Jun 2026'
      }
    ];
    setLocal('carekey_rxs_CK-10482', defaultPrescriptions);

    // Default Doctor Connection (Dr. Arpan & Rahul Sharma)
    setLocal('carekey_dp_connections', [
      {
        connectionId: 'CONN-001',
        doctorId: 'DOC-8821',
        patientId: 'CK-10482',
        status: 'ACTIVE',
        hospital: 'ABC Hospital',
        accessScope: 'Medical History, Clinical Visits, Prescriptions',
        expiresAt: '2026-09-30',
        createdAt: '2026-09-01T08:00:00Z'
      }
    ]);

    // Default Audit Logs
    const defaultAudit = [
      {
        id: 'log_01',
        timestamp: '2026-09-28T18:15:00Z',
        timeFormatted: '28 Sep 2026 18:15',
        userName: 'Dr. Arpan',
        userRole: 'DOCTOR',
        doctorId: 'DOC-8821',
        patientId: 'CK-10482',
        patientName: 'Rahul Sharma',
        action: 'VIEW_PRESCRIPTIONS',
        details: 'Viewed active prescription history for Rahul Sharma (CK-10482)',
        status: 'AUTHORIZED',
        facility: 'ABC Hospital'
      },
      {
        id: 'log_02',
        timestamp: '2026-09-28T18:10:00Z',
        timeFormatted: '28 Sep 2026 18:10',
        userName: 'Dr. Arpan',
        userRole: 'DOCTOR',
        doctorId: 'DOC-8821',
        patientId: 'CK-10482',
        patientName: 'Rahul Sharma',
        action: 'QR_SCAN_AUTHENTICATED',
        details: 'Scanned cryptographic patient QR token (Result: Authorized)',
        status: 'AUTHORIZED',
        facility: 'ABC Hospital'
      },
      {
        id: 'log_03',
        timestamp: '2026-09-28T17:42:00Z',
        timeFormatted: '28 Sep 2026 17:42',
        userName: 'Public Health Surveillance Officer',
        userRole: 'ADMIN',
        action: 'PRIVACY_K10_SUPPRESSION',
        details: 'Analytics query for Solapur (Rural Tier-3) Rare Genetic: Count < 10 (Suppressed under K=10 Rule)',
        status: 'SUPPRESSED',
        facility: 'Public Health Department'
      },
      {
        id: 'log_04',
        timestamp: '2026-09-28T17:40:00Z',
        timeFormatted: '28 Sep 2026 17:40',
        userName: 'Public Health Surveillance Officer',
        userRole: 'ADMIN',
        action: 'ANALYTICS_QUERY',
        details: 'Surveillance Query: Region: Pune, Condition: Respiratory (Result: 432 Cases Aggregated)',
        status: 'SUCCESS',
        facility: 'Public Health Department'
      },
      {
        id: 'log_05',
        timestamp: '2026-09-21T11:30:00Z',
        timeFormatted: '21 Sep 2026 11:30',
        userName: 'Dr. Mehta',
        userRole: 'DOCTOR',
        doctorId: 'DOC-5541',
        patientId: 'CK-10482',
        patientName: 'Rahul Sharma',
        action: 'RECORD_ACCESSED',
        details: 'Viewed medical history at XYZ Clinic',
        status: 'AUTHORIZED',
        facility: 'XYZ Clinic'
      }
    ];
    setLocal('carekey_audit_logs', defaultAudit);
    localStorage.setItem('carekey_patient_rahul_v2', 'true');
  }
}

// Execute seed
seedCleanDataIfEmpty();

export const firestoreService = {
  // ==========================================
  // 1. DOCTOR REGISTRATION & PROFILE
  // ==========================================
  async registerDoctor(doctorData) {
    const doctorId = 'DOC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const docData = {
      doctorId,
      uid: doctorData.uid,
      name: doctorData.name,
      email: doctorData.email,
      phone: doctorData.phone,
      specialization: doctorData.specialization,
      medicalRegistrationNumber: doctorData.medicalRegistrationNumber,
      hospital: doctorData.hospital,
      city: doctorData.city,
      role: 'DOCTOR',
      createdAt: new Date().toISOString()
    };

    // Save in local cache immediately
    const localDoctors = getLocal('carekey_registered_doctors', []);
    setLocal('carekey_registered_doctors', [docData, ...localDoctors]);
    setLocal(`carekey_doc_${docData.uid}`, docData);
    setLocal(`carekey_doc_${doctorId}`, docData);

    // Save in Firestore `doctors/{doctorId}` & `users/{uid}`
    try {
      const docRef = doc(db, 'doctors', doctorId);
      await withTimeout(setDoc(docRef, { ...docData, createdAt: serverTimestamp() }), 3000);
      const userRef = doc(db, 'users', doctorData.uid);
      await withTimeout(setDoc(userRef, {
        uid: doctorData.uid,
        name: doctorData.name,
        email: doctorData.email,
        phone: doctorData.phone,
        role: 'DOCTOR',
        doctorId,
        createdAt: serverTimestamp()
      }, { merge: true }), 3000);
    } catch (err) {
      console.warn('Firestore doctor registration notice:', err.message);
    }

    return docData;
  },

  async getDoctorProfile(doctorIdOrUid) {
    if (!doctorIdOrUid) return null;
    const cache = getLocal(`carekey_doc_${doctorIdOrUid}`, null);
    try {
      // Try by doctorId
      const docRef = doc(db, 'doctors', doctorIdOrUid);
      const snap = await withTimeout(getDoc(docRef), 2000);
      if (snap && snap.exists()) {
        const data = snap.data();
        setLocal(`carekey_doc_${doctorIdOrUid}`, data);
        return data;
      }
      // Try by uid
      const q = query(collection(db, 'doctors'), where('uid', '==', doctorIdOrUid));
      const qSnap = await withTimeout(getDocs(q), 2000);
      if (qSnap && !qSnap.empty) {
        const data = qSnap.docs[0].data();
        setLocal(`carekey_doc_${doctorIdOrUid}`, data);
        return data;
      }
    } catch (err) {
      console.warn('Doctor profile fetch notice:', err.message);
    }
    // Fallback to local
    if (cache) return cache;
    const all = getLocal('carekey_registered_doctors', []);
    return all.find(d => d.doctorId === doctorIdOrUid || d.uid === doctorIdOrUid) || null;
  },

  // ==========================================
  // 2. PATIENT REGISTRATION, SEARCH & PROFILE
  // ==========================================
  async registerPatient(patientData) {
    const patientReference = patientData.patientReference || 'CK-' + Math.floor(10000 + Math.random() * 90000);
    const patientId = patientData.patientId || patientReference;
    const patData = {
      patientId,
      patientReference,
      uid: patientData.uid || ('pat_' + Date.now()),
      name: patientData.name,
      email: patientData.email || '',
      phone: patientData.phone || '',
      dateOfBirth: patientData.dateOfBirth || '',
      gender: patientData.gender || 'Male',
      bloodGroup: patientData.bloodGroup || 'B+',
      address: patientData.address || '',
      city: patientData.city || 'Pune',
      district: patientData.district || 'Pune',
      state: patientData.state || 'Maharashtra',
      emergencyContactName: patientData.emergencyContactName || patientData.emergencyContact?.name || '',
      emergencyContactPhone: patientData.emergencyContactPhone || patientData.emergencyContact?.phone || '',
      emergencyContact: patientData.emergencyContact || {
        name: patientData.emergencyContactName || '',
        phone: patientData.emergencyContactPhone || ''
      },
      allergies: patientData.allergies || '',
      existingConditions: patientData.existingConditions || '',
      currentMedications: patientData.currentMedications || '',
      medicalNotes: patientData.medicalNotes || '',
      role: 'PATIENT',
      profileCompleted: patientData.profileCompleted !== undefined ? patientData.profileCompleted : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally
    const localPatients = getLocal('carekey_registered_patients', []);
    setLocal('carekey_registered_patients', [patData, ...localPatients.filter(p => p.patientId !== patientId && p.patientReference !== patientReference)]);
    setLocal(`carekey_pat_${patData.uid}`, patData);
    setLocal(`carekey_pat_${patientId}`, patData);
    setLocal(`carekey_pat_${patientReference}`, patData);

    // Save in Firestore `patients/{patientId}` & `users/{uid}`
    try {
      const patRef = doc(db, 'patients', patientId);
      await withTimeout(setDoc(patRef, { ...patData, createdAt: serverTimestamp() }), 3000);
      if (patientData.uid) {
        const userRef = doc(db, 'users', patientData.uid);
        await withTimeout(setDoc(userRef, {
          uid: patientData.uid,
          name: patientData.name,
          email: patientData.email,
          phone: patientData.phone,
          role: 'PATIENT',
          patientId,
          patientReference,
          profileCompleted: patData.profileCompleted,
          createdAt: serverTimestamp()
        }, { merge: true }), 3000);
      }
    } catch (err) {
      console.warn('Firestore patient registration notice:', err.message);
    }

    return patData;
  },

  async createPatientByDoctor(patientData, doctorId) {
    const patientReference = 'CK-' + Math.floor(10000 + Math.random() * 90000);
    const patientId = patientReference;
    const qrToken = `https://carekey.app/access/${patientReference}-SEC${Math.floor(1000 + Math.random() * 9000)}`;

    const newPatient = {
      patientId,
      patientReference,
      uid: 'pat_onboard_' + Date.now(),
      name: patientData.name,
      dateOfBirth: patientData.dateOfBirth || '',
      gender: patientData.gender || 'Male',
      bloodGroup: patientData.bloodGroup || 'B+',
      phone: patientData.phone || '',
      email: patientData.email || '',
      address: patientData.address || '',
      city: patientData.city || 'Pune',
      district: patientData.district || 'Pune',
      state: patientData.state || 'Maharashtra',
      emergencyContactName: patientData.emergencyContactName || '',
      emergencyContactPhone: patientData.emergencyContactPhone || '',
      emergencyContact: {
        name: patientData.emergencyContactName || 'Emergency Contact',
        phone: patientData.emergencyContactPhone || patientData.phone || ''
      },
      allergies: patientData.allergies || 'No known drug allergies',
      existingConditions: patientData.existingConditions || 'None reported',
      currentMedications: patientData.currentMedications || 'None',
      medicalNotes: patientData.medicalNotes || '',
      role: 'PATIENT',
      createdByDoctorId: doctorId,
      profileCompleted: true,
      qrToken,
      qrStatus: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save in cache
    const localPatients = getLocal('carekey_registered_patients', []);
    setLocal('carekey_registered_patients', [newPatient, ...localPatients]);
    setLocal(`carekey_pat_${patientId}`, newPatient);
    setLocal(`carekey_pat_${patientReference}`, newPatient);
    setLocal(`carekey_qr_${qrToken}`, newPatient);

    // Establish active doctor-patient connection
    const localConns = getLocal('carekey_dp_connections', []);
    setLocal('carekey_dp_connections', [
      {
        connectionId: 'CONN-' + Date.now(),
        doctorId: doctorId || 'DOC-8821',
        patientId: patientId,
        patientReference,
        status: 'ACTIVE',
        accessScope: 'Medical History, Clinical Visits, Prescriptions',
        createdAt: new Date().toISOString()
      },
      ...localConns
    ]);

    // Save to Firestore
    try {
      const patRef = doc(db, 'patients', patientId);
      await withTimeout(setDoc(patRef, { ...newPatient, createdAt: serverTimestamp() }), 3000);
    } catch (err) {
      console.warn('Firestore create patient by doctor notice:', err.message);
    }

    return newPatient;
  },

  async searchPatients(queryStr) {
    if (!queryStr || !queryStr.trim()) return [];
    const term = queryStr.trim().toLowerCase();
    const local = getLocal('carekey_registered_patients', []);
    
    // Always include default Rahul Sharma
    const rahul = getLocal('carekey_pat_CK-10482', {
      patientId: 'CK-10482',
      patientReference: 'CK-10482',
      name: 'Rahul Sharma',
      age: 42,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+91 98201 44521',
      email: 'rahul.sharma@carekey.health',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      emergencyContactName: 'Anita Sharma',
      emergencyContactPhone: '+91 98201 99882',
      allergies: 'Penicillin (mild rash)',
      existingConditions: 'Primary Essential Hypertension',
      currentMedications: 'Amlodipine (5 mg daily)',
      profileCompleted: true
    });

    const all = [rahul, ...local.filter(p => p.patientId !== 'CK-10482')];
    return all.filter(p => 
      (p.patientReference && p.patientReference.toLowerCase().includes(term)) ||
      (p.patientId && p.patientId.toLowerCase().includes(term)) ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.phone && p.phone.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  },

  async updatePatientProfile(uidOrPatientId, profileData) {
    if (!uidOrPatientId) return null;
    const existing = await this.getPatientProfile(uidOrPatientId) || {};
    
    // Clean, patient-owned fields only (protect system-controlled patientReference and role)
    const updated = {
      ...existing,
      ...profileData,
      role: 'PATIENT', // Role is IMMUTABLE by patient
      patientId: existing.patientId || uidOrPatientId,
      patientReference: existing.patientReference || existing.patientId || uidOrPatientId,
      profileCompleted: true,
      updatedAt: new Date().toISOString()
    };

    setLocal(`carekey_pat_${uidOrPatientId}`, updated);
    if (updated.patientId) setLocal(`carekey_pat_${updated.patientId}`, updated);
    if (updated.patientReference) setLocal(`carekey_pat_${updated.patientReference}`, updated);
    if (updated.uid) setLocal(`carekey_pat_${updated.uid}`, updated);

    // Save in registered patients list
    const local = getLocal('carekey_registered_patients', []);
    setLocal('carekey_registered_patients', [
      updated,
      ...local.filter(p => p.patientId !== updated.patientId && p.uid !== updated.uid)
    ]);

    try {
      const docRef = doc(db, 'patients', updated.patientId || uidOrPatientId);
      await withTimeout(setDoc(docRef, { ...updated, updatedAt: serverTimestamp() }, { merge: true }), 2500);
    } catch (err) {
      console.warn('Firestore update patient profile notice:', err.message);
    }

    return updated;
  },

  async getPatientProfile(patientIdOrUid) {
    if (!patientIdOrUid) return null;
    if (patientIdOrUid === 'CK-10482' || patientIdOrUid === 'pat-rahul-01') {
      const cached = getLocal('carekey_pat_CK-10482', null);
      if (cached) return cached;
    }

    const cache = getLocal(`carekey_pat_${patientIdOrUid}`, null);
    try {
      const patRef = doc(db, 'patients', patientIdOrUid);
      const snap = await withTimeout(getDoc(patRef), 2000);
      if (snap && snap.exists()) {
        const data = snap.data();
        setLocal(`carekey_pat_${patientIdOrUid}`, data);
        return data;
      }
      const q = query(collection(db, 'patients'), where('uid', '==', patientIdOrUid));
      const qSnap = await withTimeout(getDocs(q), 2000);
      if (qSnap && !qSnap.empty) {
        const data = qSnap.docs[0].data();
        setLocal(`carekey_pat_${patientIdOrUid}`, data);
        return data;
      }
    } catch (err) {
      console.warn('Patient profile fetch notice:', err.message);
    }
    if (cache) return cache;
    const all = getLocal('carekey_registered_patients', []);
    return all.find(p => p.patientId === patientIdOrUid || p.patientReference === patientIdOrUid || p.uid === patientIdOrUid) || null;
  },

  // ==========================================
  // 3. REAL "FIND A DOCTOR" (DYNAMIC FROM FIRESTORE)
  // ==========================================
  async getDoctors(filters = {}) {
    let list = [];
    const local = getLocal('carekey_registered_doctors', []);

    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, 'doctors')), 2500);
      if (querySnapshot) {
        const remote = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const remoteIds = new Set(remote.map(d => d.doctorId || d.id));
        list = [
          ...remote,
          ...local.filter(d => !remoteIds.has(d.doctorId))
        ];
        setLocal('carekey_registered_doctors', list);
      } else {
        list = local;
      }
    } catch (error) {
      console.warn('Firestore doctors search notice:', error.message);
      list = local;
    }

    // Apply real search filters dynamically
    const nameQuery = (filters.name || filters.searchTerm || '').trim().toLowerCase();
    const specialtyQuery = (filters.specialization || '').trim().toLowerCase();
    const hospitalQuery = (filters.hospital || '').trim().toLowerCase();
    const cityQuery = (filters.city || filters.location || '').trim().toLowerCase();

    return list.filter(d => {
      const matchName = !nameQuery || (d.name && d.name.toLowerCase().includes(nameQuery)) || (d.specialization && d.specialization.toLowerCase().includes(nameQuery));
      const matchSpecialty = !specialtyQuery || (d.specialization && d.specialization.toLowerCase().includes(specialtyQuery));
      const matchHospital = !hospitalQuery || (d.hospital && d.hospital.toLowerCase().includes(hospitalQuery));
      const matchCity = !cityQuery || (d.city && d.city.toLowerCase().includes(cityQuery));
      return matchName && matchSpecialty && matchHospital && matchCity;
    });
  },

  // ==========================================
  // 4. PATIENT → DOCTOR REQUESTS
  // ==========================================
  async createDoctorPatientRequest(reqData) {
    const { doctorId, patientId } = reqData;
    if (!doctorId || !patientId) {
      throw new Error('Doctor ID and Patient ID are required.');
    }

    // Check duplicate pending request
    const existing = await this.getDoctorPatientRequestsForPatient(patientId);
    const hasPending = existing.some(r => r.doctorId === doctorId && r.status === 'PENDING');
    if (hasPending) {
      throw new Error('A connection request has already been sent to this doctor and is pending review.');
    }

    const requestId = 'REQ-' + Date.now();
    const newRequest = {
      requestId,
      doctorId,
      patientId,
      patientName: reqData.patientName || 'Patient',
      patientEmail: reqData.patientEmail || '',
      patientPhone: reqData.patientPhone || '',
      doctorName: reqData.doctorName || 'Doctor',
      doctorSpecialty: reqData.doctorSpecialty || '',
      reason: reqData.reason || 'Patient consultation & record access request',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // Save locally
    const localReqs = getLocal('carekey_dp_requests', []);
    setLocal('carekey_dp_requests', [newRequest, ...localReqs]);

    // Save in Firestore `doctorPatientRequests/{requestId}`
    withTimeout(addDoc(collection(db, 'doctorPatientRequests'), {
      ...newRequest,
      createdAt: serverTimestamp()
    }), 3000).catch(err => {
      console.warn('Firestore create request notice:', err.message);
    });

    return newRequest;
  },

  async getDoctorPatientRequestsForDoctor(doctorId) {
    if (!doctorId) return [];
    const local = getLocal('carekey_dp_requests', []).filter(r => r.doctorId === doctorId);

    try {
      const q = query(
        collection(db, 'doctorPatientRequests'),
        where('doctorId', '==', doctorId)
      );
      const snap = await withTimeout(getDocs(q), 2500);
      if (snap) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const remoteIds = new Set(remote.map(r => r.requestId || r.id));
        const merged = [
          ...remote,
          ...local.filter(r => !remoteIds.has(r.requestId))
        ];
        return merged;
      }
    } catch (err) {
      console.warn('Firestore fetch doctor requests notice:', err.message);
    }
    return local;
  },

  async getDoctorPatientRequestsForPatient(patientId) {
    if (!patientId) return [];
    const local = getLocal('carekey_dp_requests', []).filter(r => r.patientId === patientId);

    try {
      const q = query(
        collection(db, 'doctorPatientRequests'),
        where('patientId', '==', patientId)
      );
      const snap = await withTimeout(getDocs(q), 2500);
      if (snap) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const remoteIds = new Set(remote.map(r => r.requestId || r.id));
        const merged = [
          ...remote,
          ...local.filter(r => !remoteIds.has(r.requestId))
        ];
        return merged;
      }
    } catch (err) {
      console.warn('Firestore fetch patient requests notice:', err.message);
    }
    return local;
  },

  async updateDoctorPatientRequest(requestId, status, doctorId, patientId) {
    // Update local requests
    const localReqs = getLocal('carekey_dp_requests', []);
    const updatedLocal = localReqs.map(r => r.requestId === requestId || r.id === requestId ? { ...r, status } : r);
    setLocal('carekey_dp_requests', updatedLocal);

    // If ACCEPTED, create ACTIVE connection in `doctorPatientConnections/`
    if (status === 'ACCEPTED') {
      const connectionId = 'CONN-' + Date.now();
      const newConnection = {
        connectionId,
        doctorId,
        patientId,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      const localConns = getLocal('carekey_dp_connections', []);
      setLocal('carekey_dp_connections', [newConnection, ...localConns]);

      // Save connection in Firestore
      withTimeout(addDoc(collection(db, 'doctorPatientConnections'), {
        ...newConnection,
        createdAt: serverTimestamp()
      }), 3000).catch(err => {
        console.warn('Firestore create connection notice:', err.message);
      });
    }

    // Update in Firestore
    try {
      const q = query(collection(db, 'doctorPatientRequests'), where('requestId', '==', requestId));
      const snap = await withTimeout(getDocs(q), 2500);
      if (snap && !snap.empty) {
        const docRef = snap.docs[0].ref;
        await withTimeout(updateDoc(docRef, { status, updatedAt: serverTimestamp() }), 2000);
      }
    } catch (err) {
      console.warn('Firestore update request notice:', err.message);
    }
  },

  // ==========================================
  // 5. DOCTOR–PATIENT ACTIVE CONNECTIONS
  // ==========================================
  async getConnectedDoctorsForPatient(patientId) {
    if (!patientId) return [];
    let connections = getLocal('carekey_dp_connections', []).filter(c => c.patientId === patientId && c.status === 'ACTIVE');

    try {
      const q = query(
        collection(db, 'doctorPatientConnections'),
        where('patientId', '==', patientId),
        where('status', '==', 'ACTIVE')
      );
      const snap = await withTimeout(getDocs(q), 2500);
      if (snap) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const remoteIds = new Set(remote.map(c => c.connectionId || c.id));
        connections = [
          ...remote,
          ...connections.filter(c => !remoteIds.has(c.connectionId))
        ];
      }
    } catch (err) {
      console.warn('Firestore fetch connected doctors notice:', err.message);
    }

    // Hydrate with doctor profiles
    const doctorProfiles = await Promise.all(
      connections.map(c => this.getDoctorProfile(c.doctorId))
    );
    return doctorProfiles.filter(Boolean);
  },

  async getConnectedPatientsForDoctor(doctorId) {
    if (!doctorId) return [];
    let connections = getLocal('carekey_dp_connections', []).filter(c => c.doctorId === doctorId && c.status === 'ACTIVE');

    try {
      const q = query(
        collection(db, 'doctorPatientConnections'),
        where('doctorId', '==', doctorId),
        where('status', '==', 'ACTIVE')
      );
      const snap = await withTimeout(getDocs(q), 2500);
      if (snap) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const remoteIds = new Set(remote.map(c => c.connectionId || c.id));
        connections = [
          ...remote,
          ...connections.filter(c => !remoteIds.has(c.connectionId))
        ];
      }
    } catch (err) {
      console.warn('Firestore fetch connected patients notice:', err.message);
    }

    // Hydrate with patient profiles
    const patientProfiles = await Promise.all(
      connections.map(c => this.getPatientProfile(c.patientId))
    );
    return patientProfiles.filter(Boolean);
  },

  // ==========================================
  // 6. VISITS (Encounters)
  // ==========================================
  async getVisitsForPatient(patientId) {
    if (!patientId) return [];
    const local = getLocal(`carekey_visits_${patientId}`, []);
    try {
      const q = query(
        collection(db, 'visits'),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      const snap = await withTimeout(getDocs(q), 2500);
      if (snap) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const remoteIds = new Set(remote.map(v => v.id));
        return [
          ...remote,
          ...local.filter(v => !remoteIds.has(v.id))
        ];
      }
    } catch (err) {
      console.warn('Firestore visits fetch notice:', err.message);
    }
    return local;
  },

  async addVisitForPatient(patientId, visitData) {
    const newId = 'visit_' + Date.now();
    const newVisit = {
      id: newId,
      patientId,
      ...visitData,
      createdAt: new Date().toISOString()
    };
    const local = getLocal(`carekey_visits_${patientId}`, []);
    setLocal(`carekey_visits_${patientId}`, [newVisit, ...local]);

    withTimeout(addDoc(collection(db, 'visits'), {
      ...newVisit,
      createdAt: serverTimestamp()
    }), 3000).catch(err => {
      console.warn('Firestore add visit notice:', err.message);
    });

    return newVisit;
  },

  // ==========================================
  // 7. PRESCRIPTIONS
  // ==========================================
  async getPrescriptionsForPatient(patientId) {
    if (!patientId) return [];
    const local = getLocal(`carekey_rxs_${patientId}`, []);
    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        orderBy('issuedDate', 'desc')
      );
      const snap = await withTimeout(getDocs(q), 2500);
      if (snap) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const remoteIds = new Set(remote.map(p => p.id));
        return [
          ...remote,
          ...local.filter(p => !remoteIds.has(p.id))
        ];
      }
    } catch (err) {
      console.warn('Firestore prescriptions fetch notice:', err.message);
    }
    return local;
  },

  async addPrescriptionForPatient(patientId, rxData) {
    const newId = 'rx_' + Date.now();
    const newRx = {
      id: newId,
      patientId,
      ...rxData,
      status: rxData.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    const local = getLocal(`carekey_rxs_${patientId}`, []);
    setLocal(`carekey_rxs_${patientId}`, [newRx, ...local]);

    withTimeout(addDoc(collection(db, 'prescriptions'), {
      ...newRx,
      createdAt: serverTimestamp()
    }), 3000).catch(err => {
      console.warn('Firestore add prescription notice:', err.message);
    });

    return newRx;
  },

  // ==========================================
  // 8. AUDIT LOGS
  // ==========================================
  async getAuditLogs(userId = null) {
    const local = getLocal('carekey_audit_logs', []);
    try {
      let q;
      if (userId) {
        q = query(collection(db, 'auditLogs'), where('userId', '==', userId), orderBy('timestamp', 'desc'));
      } else {
        q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));
      }
      const snap = await withTimeout(getDocs(q), 2500);
      if (snap) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const remoteIds = new Set(remote.map(l => l.id));
        return [
          ...remote,
          ...local.filter(l => !remoteIds.has(l.id))
        ];
      }
    } catch (err) {
      console.warn('Firestore audit logs fetch notice:', err.message);
    }
    return local;
  },

  async logAuditEvent(logData) {
    const newLog = {
      id: 'log_' + Date.now(),
      ...logData,
      timestamp: new Date().toISOString()
    };
    const local = getLocal('carekey_audit_logs', []);
    setLocal('carekey_audit_logs', [newLog, ...local.slice(0, 99)]);

    withTimeout(addDoc(collection(db, 'auditLogs'), {
      ...newLog,
      serverTime: serverTimestamp()
    }), 2500).catch(() => {});
  },

  // ==========================================
  // 9. GENERAL USER & APPOINTMENT METHODS
  // ==========================================
  async getUserProfile(uid) {
    if (!uid) return null;
    const cacheKey = `carekey_profile_${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await withTimeout(getDoc(docRef), 2000);
      if (docSnap && docSnap.exists()) {
        const data = { uid, ...docSnap.data() };
        setLocal(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.warn('Firestore user profile fetch notice:', error.message);
    }
    return getLocal(cacheKey, null);
  },

  async updateUserProfile(uid, updates) {
    if (!uid) return;
    const cacheKey = `carekey_profile_${uid}`;
    const existing = getLocal(cacheKey, { uid });
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    setLocal(cacheKey, merged);

    try {
      const docRef = doc(db, 'users', uid);
      await withTimeout(updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }), 2500);
    } catch (error) {
      console.warn('Firestore user profile update notice:', error.message);
    }
  },

  async getUserAppointments(userId) {
    if (!userId) return [];
    const cacheKey = `carekey_appts_${userId}`;
    const localAppts = getLocal(cacheKey, []);

    try {
      const q = query(
        collection(db, 'appointments'),
        where('userId', '==', userId),
        orderBy('dateTime', 'asc')
      );
      const querySnapshot = await withTimeout(getDocs(q), 2500);
      if (querySnapshot) {
        const remoteAppts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const remoteIds = new Set(remoteAppts.map(a => a.id));
        const merged = [
          ...remoteAppts,
          ...localAppts.filter(a => !remoteIds.has(a.id))
        ];
        setLocal(cacheKey, merged);
        return merged;
      }
    } catch (error) {
      console.warn('Firestore appointments fetch notice:', error.message);
    }
    return localAppts;
  },

  async createAppointment(appointmentData) {
    const userId = appointmentData.userId || 'guest';
    const cacheKey = `carekey_appts_${userId}`;
    const newId = 'appt_' + Date.now();
    const newRecord = {
      id: newId,
      ...appointmentData,
      status: appointmentData.status || 'scheduled',
      createdAt: new Date().toISOString()
    };

    const localList = getLocal(cacheKey, []);
    setLocal(cacheKey, [newRecord, ...localList]);

    withTimeout(addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      status: appointmentData.status || 'scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), 3000).catch(err => {
      console.warn('Firestore background appointment sync notice:', err.message);
    });

    return newRecord;
  },

  async cancelAppointment(appointmentId, userId) {
    if (!appointmentId) return;
    if (userId) {
      const cacheKey = `carekey_appts_${userId}`;
      const localList = getLocal(cacheKey, []);
      setLocal(cacheKey, localList.map(item => item.id === appointmentId ? { ...item, status: 'cancelled' } : item));
    }

    try {
      const docRef = doc(db, 'appointments', appointmentId);
      await withTimeout(updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      }), 2000);
    } catch (error) {
      console.warn('Firestore cancel appointment notice:', error.message);
    }
  },

  async getUserMedicalRecords(userId) {
    if (!userId) return [];
    const cacheKey = `carekey_records_${userId}`;
    const localRecords = getLocal(cacheKey, []);

    try {
      const q = query(
        collection(db, 'medical_records'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await withTimeout(getDocs(q), 2500);
      if (querySnapshot) {
        const remoteRecords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const remoteIds = new Set(remoteRecords.map(r => r.id));
        const merged = [
          ...remoteRecords,
          ...localRecords.filter(r => !remoteIds.has(r.id))
        ];
        setLocal(cacheKey, merged);
        return merged;
      }
    } catch (error) {
      console.warn('Firestore medical records fetch notice:', error.message);
    }
    return localRecords;
  },

  async createMedicalRecord(recordData) {
    const userId = recordData.userId || 'guest';
    const cacheKey = `carekey_records_${userId}`;
    const newId = 'rec_' + Date.now();
    const newRecord = {
      id: newId,
      ...recordData,
      createdAt: new Date().toISOString()
    };

    const localList = getLocal(cacheKey, []);
    setLocal(cacheKey, [newRecord, ...localList]);

    withTimeout(addDoc(collection(db, 'medical_records'), {
      ...recordData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), 3000).catch(err => {
      console.warn('Firestore background medical record sync notice:', err.message);
    });

    return newRecord;
  },

  async deleteMedicalRecord(recordId, userId) {
    if (!recordId) return;
    if (userId) {
      const cacheKey = `carekey_records_${userId}`;
      const localList = getLocal(cacheKey, []);
      setLocal(cacheKey, localList.filter(item => item.id !== recordId));
    }

    try {
      await withTimeout(deleteDoc(doc(db, 'medical_records', recordId)), 2000);
    } catch (error) {
      console.warn('Firestore delete record notice:', error.message);
    }
  },

  async getUserNotifications(userId) {
    if (!userId) return [];
    const cacheKey = `carekey_notifs_${userId}`;
    const localNotifs = getLocal(cacheKey, []);

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await withTimeout(getDocs(q), 2500);
      if (querySnapshot) {
        const remoteNotifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const remoteIds = new Set(remoteNotifs.map(n => n.id));
        const merged = [
          ...remoteNotifs,
          ...localNotifs.filter(n => !remoteIds.has(n.id))
        ];
        setLocal(cacheKey, merged);
        return merged;
      }
    } catch (error) {
      console.warn('Firestore notifications fetch notice:', error.message);
    }
    return localNotifs;
  },

  async getHospitals(searchQuery = '') {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, 'hospitals')), 2500);
      if (querySnapshot) {
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (!searchQuery) return list;
        const lower = searchQuery.toLowerCase();
        return list.filter(h => 
          (h.name && h.name.toLowerCase().includes(lower)) ||
          (h.city && h.city.toLowerCase().includes(lower)) ||
          (h.type && h.type.toLowerCase().includes(lower))
        );
      }
    } catch (error) {
      console.warn('Firestore hospitals search notice:', error.message);
    }
    return [];
  }
};
