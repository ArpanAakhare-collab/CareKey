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
  // 2. PATIENT REGISTRATION & PROFILE
  // ==========================================
  async registerPatient(patientData) {
    const patientId = 'PAT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const patData = {
      patientId,
      uid: patientData.uid,
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender,
      city: patientData.city,
      role: 'PATIENT',
      createdAt: new Date().toISOString()
    };

    // Save locally
    const localPatients = getLocal('carekey_registered_patients', []);
    setLocal('carekey_registered_patients', [patData, ...localPatients]);
    setLocal(`carekey_pat_${patData.uid}`, patData);
    setLocal(`carekey_pat_${patientId}`, patData);

    // Save in Firestore `patients/{patientId}` & `users/{uid}`
    try {
      const patRef = doc(db, 'patients', patientId);
      await withTimeout(setDoc(patRef, { ...patData, createdAt: serverTimestamp() }), 3000);
      const userRef = doc(db, 'users', patientData.uid);
      await withTimeout(setDoc(userRef, {
        uid: patientData.uid,
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        role: 'PATIENT',
        patientId,
        createdAt: serverTimestamp()
      }, { merge: true }), 3000);
    } catch (err) {
      console.warn('Firestore patient registration notice:', err.message);
    }

    return patData;
  },

  async getPatientProfile(patientIdOrUid) {
    if (!patientIdOrUid) return null;
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
    return all.find(p => p.patientId === patientIdOrUid || p.uid === patientIdOrUid) || null;
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
