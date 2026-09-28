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
        uid: 'demo-doc-01',
        doctorId: 'DOC-DEMO-01',
        email: 'doctor@carekey.health',
        displayName: 'Dr. Sarah Mitchell, MD',
        specialization: 'Cardiology',
        hospital: 'Metro Health Hospital',
        city: 'Pune',
        role: 'DOCTOR',
        phone: '+91 98765 43210',
        isDemo: true
      };
    } else if (upperRole === 'ADMIN') {
      demoUser = {
        uid: 'demo-admin-01',
        email: 'admin@healthgov.in',
        displayName: 'Dr. Rajesh Patel',
        role: 'ADMIN',
        isDemo: true
      };
    } else {
      demoUser = {
        uid: 'demo-pat-01',
        patientId: 'PAT-DEMO-01',
        email: 'patient@carekey.health',
        displayName: 'Rohan Sharma',
        city: 'Pune',
        dateOfBirth: '1992-05-14',
        gender: 'Male',
        phone: '+91 91234 56789',
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
