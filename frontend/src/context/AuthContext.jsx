import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Safety timer: Never leave user stuck on verifying screen
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 1200);

    // Listen to real Firebase Auth session changes
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      clearTimeout(timer);
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (defaultRole = 'PATIENT') => {
    setAuthError(null);
    try {
      const loggedInUser = await authService.loginWithGoogle(defaultRole);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginWithEmail = async (email, password, requiredRole = null) => {
    setAuthError(null);
    try {
      const loggedInUser = await authService.loginWithEmail(email, password, requiredRole);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const registerDoctor = async (doctorData) => {
    setAuthError(null);
    try {
      const newDoctor = await authService.registerDoctor(doctorData);
      setUser(newDoctor);
      return newDoctor;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const registerPatient = async (patientData) => {
    setAuthError(null);
    try {
      const newPatient = await authService.registerPatient(patientData);
      setUser(newPatient);
      return newPatient;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      return await authService.resetPassword(email);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const setupRecaptcha = (containerId) => {
    return authService.setupRecaptcha(containerId);
  };

  const sendPhoneOTP = async (phoneNumber, recaptchaVerifier) => {
    setAuthError(null);
    try {
      return await authService.sendPhoneOTP(phoneNumber, recaptchaVerifier);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const verifyPhoneOTP = async (confirmationResult, otp, role = 'PATIENT') => {
    setAuthError(null);
    try {
      const loggedInUser = await authService.verifyPhoneOTP(confirmationResult, otp, role);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginAsDemo = (role = 'PATIENT') => {
    const upperRole = role.toUpperCase();
    let demoUser;
    if (upperRole === 'DOCTOR') {
      demoUser = {
        uid: 'doc-arpan-01',
        doctorId: 'DOC-8821',
        email: 'dr.arpan@carekey.health',
        displayName: 'Dr. Arpan',
        name: 'Dr. Arpan',
        specialization: 'General Medicine & Cardiology',
        medicalRegistrationNumber: 'MH-MED-2024-88912',
        hospital: 'ABC Hospital',
        city: 'Pune',
        role: 'DOCTOR',
        phone: '+91 98765 43210',
        isDemo: true
      };
    } else if (upperRole === 'ADMIN') {
      demoUser = {
        uid: 'admin-health-01',
        email: 'surveillance@healthgov.in',
        displayName: 'Public Health Surveillance Officer',
        name: 'Public Health Surveillance Officer',
        role: 'ADMIN',
        department: 'Directorate of Health Services (Surveillance Unit)',
        isDemo: true
      };
    } else {
      demoUser = {
        uid: 'pat-rahul-01',
        patientId: 'CK-10482',
        email: 'rahul.sharma@carekey.health',
        displayName: 'Rahul Sharma',
        name: 'Rahul Sharma',
        age: 42,
        gender: 'Male',
        bloodGroup: 'B+',
        city: 'Pune',
        dateOfBirth: '1984-04-12',
        phone: '+91 98201 44521',
        role: 'PATIENT',
        isDemo: true
      };
    }
    localStorage.setItem(`carekey_role_${demoUser.uid}`, demoUser.role);
    setUser(demoUser);
    return demoUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.warn('Error during logout:', err);
      setUser(null);
    }
  };

  const value = {
    user,
    role: user?.role || 'PATIENT',
    isAuthenticated: !!user,
    checkingAuth,
    authError,
    setAuthError,
    loginWithGoogle,
    loginWithEmail,
    registerDoctor,
    registerPatient,
    resetPassword,
    setupRecaptcha,
    sendPhoneOTP,
    verifyPhoneOTP,
    loginAsDemo,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
