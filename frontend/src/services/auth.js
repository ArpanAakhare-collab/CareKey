import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from '../firebase/firebaseConfig';
import { firestoreService } from './firestoreService';

export const authService = {
  /**
   * Listen to real Firebase Auth state changes with Role detection
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check stored role or profile
        const storedRole = localStorage.getItem(`carekey_role_${firebaseUser.uid}`) || 'PATIENT';
        
        let profile = await firestoreService.getUserProfile(firebaseUser.uid);
        if (!profile) {
          if (storedRole === 'DOCTOR') {
            profile = await firestoreService.getDoctorProfile(firebaseUser.uid);
          } else {
            profile = await firestoreService.getPatientProfile(firebaseUser.uid);
          }
        }

        const role = profile?.role || storedRole || 'PATIENT';
        localStorage.setItem(`carekey_role_${firebaseUser.uid}`, role);

        const mergedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: profile?.name || profile?.displayName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
          phoneNumber: profile?.phone || firebaseUser.phoneNumber || null,
          photoURL: firebaseUser.photoURL || null,
          role: role.toUpperCase(),
          doctorId: profile?.doctorId || null,
          patientId: profile?.patientId || null,
          specialization: profile?.specialization || null,
          hospital: profile?.hospital || null,
          city: profile?.city || null
        };

        callback(mergedUser);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Doctor Registration via Firebase Auth + Firestore `doctors` collection
   */
  async registerDoctor({ name, email, phone, password, specialization, medicalRegistrationNumber, hospital, city }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;

    try {
      await updateProfile(firebaseUser, { displayName: name });
    } catch (e) {
      console.warn('Update displayName notice:', e.message);
    }

    // Register in Firestore doctors collection
    const doctorProfile = await firestoreService.registerDoctor({
      uid: firebaseUser.uid,
      name,
      email,
      phone,
      specialization,
      medicalRegistrationNumber,
      hospital,
      city
    });

    localStorage.setItem(`carekey_role_${firebaseUser.uid}`, 'DOCTOR');

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: name,
      phoneNumber: phone,
      role: 'DOCTOR',
      ...doctorProfile
    };
  },

  /**
   * Patient Registration via Firebase Auth + Firestore `patients` collection
   */
  async registerPatient({ name, dateOfBirth, gender, phone, email, password, city }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;

    try {
      await updateProfile(firebaseUser, { displayName: name });
    } catch (e) {
      console.warn('Update displayName notice:', e.message);
    }

    // Register in Firestore patients collection
    const patientProfile = await firestoreService.registerPatient({
      uid: firebaseUser.uid,
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      city
    });

    localStorage.setItem(`carekey_role_${firebaseUser.uid}`, 'PATIENT');

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: name,
      phoneNumber: phone,
      role: 'PATIENT',
      ...patientProfile
    };
  },

  /**
   * Role-verified Login
   */
  async loginWithEmail(email, password, requiredRole = null) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    // Retrieve profile to check role
    let role = localStorage.getItem(`carekey_role_${firebaseUser.uid}`);
    let docProfile = null;
    let patProfile = null;

    if (!role || requiredRole) {
      // Check in doctors collection
      docProfile = await firestoreService.getDoctorProfile(firebaseUser.uid);
      if (docProfile) {
        role = 'DOCTOR';
      } else {
        // Check in patients collection
        patProfile = await firestoreService.getPatientProfile(firebaseUser.uid);
        if (patProfile) {
          role = 'PATIENT';
        } else {
          role = requiredRole || 'PATIENT';
        }
      }
    }

    if (requiredRole && role.toUpperCase() !== requiredRole.toUpperCase()) {
      // Role mismatch
      throw new Error(`Access Denied: This account is registered as a ${role}, not a ${requiredRole}. Please use the correct portal.`);
    }

    localStorage.setItem(`carekey_role_${firebaseUser.uid}`, role);

    const activeProfile = docProfile || patProfile || {};

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: activeProfile.name || firebaseUser.displayName || email.split('@')[0],
      phoneNumber: activeProfile.phone || firebaseUser.phoneNumber || null,
      role: role.toUpperCase(),
      doctorId: activeProfile.doctorId || null,
      patientId: activeProfile.patientId || null,
      specialization: activeProfile.specialization || null,
      hospital: activeProfile.hospital || null,
      city: activeProfile.city || null
    };
  },

  /**
   * Google Authentication
   */
  async loginWithGoogle(defaultRole = 'PATIENT') {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    let role = localStorage.getItem(`carekey_role_${firebaseUser.uid}`) || defaultRole;
    localStorage.setItem(`carekey_role_${firebaseUser.uid}`, role);

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
      phoneNumber: firebaseUser.phoneNumber || null,
      photoURL: firebaseUser.photoURL || null,
      role: role.toUpperCase()
    };
  },

  async resetPassword(email) {
    return await sendPasswordResetEmail(auth, email);
  },

  setupRecaptcha(containerId = 'recaptcha-container') {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        // ignore
      }
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => console.warn('Recaptcha expired')
    });
    return window.recaptchaVerifier;
  },

  async sendPhoneOTP(phoneNumber, recaptchaVerifier) {
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  },

  async verifyPhoneOTP(confirmationResult, otp, role = 'PATIENT') {
    const result = await confirmationResult.confirm(otp);
    const firebaseUser = result.user;

    localStorage.setItem(`carekey_role_${firebaseUser.uid}`, role);

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.phoneNumber || 'Verified User',
      phoneNumber: firebaseUser.phoneNumber || null,
      role: role.toUpperCase()
    };
  },

  async logout() {
    return await firebaseSignOut(auth);
  }
};
