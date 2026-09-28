import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';
import { Forbidden403 } from './components/Forbidden403';

// Portals & Auth Pages
import { PortalSelect } from './pages/PortalSelect';
import { DoctorLogin } from './pages/doctor/DoctorLogin';
import { DoctorRegister } from './pages/doctor/DoctorRegister';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';

import { PatientLogin } from './pages/patient/PatientLogin';
import { PatientRegister } from './pages/patient/PatientRegister';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientCompleteProfile } from './pages/patient/PatientCompleteProfile';
import { FindDoctor } from './pages/patient/FindDoctor';
import { MyDoctors } from './pages/patient/MyDoctors';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Existing Patient Views
import { Home } from './pages/Home';
import { FindCare } from './pages/FindCare';
import { Doctors } from './pages/Doctors';
import { Hospitals } from './pages/Hospitals';
import { Appointments } from './pages/Appointments';
import { MedicalRecords } from './pages/MedicalRecords';
import { Prescriptions } from './pages/Prescriptions';
import { AIAssistant } from './pages/AIAssistant';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

import { ShieldCheck, RefreshCw } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, checkingAuth, role } = useAuth();
  
  // Track active browser path
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname;
    return path || '/';
  });

  // Listen to popstate (browser back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Central navigation dispatcher
  const navigate = (path) => {
    setCurrentPath(path);
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // While checking auth session, show loading screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 p-0.5 shadow-2xl shadow-sky-500/30 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-white tracking-tight">CareKey Healthcare</h2>
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Verifying secure Firebase session...</span>
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ROUTING & ROLE-BASED ACCESS CONTROL
  // ==========================================

  // 1. Landing & Portal Selection
  if (currentPath === '/' || currentPath === '/login' || currentPath === '/portal-select') {
    return <PortalSelect onNavigate={navigate} />;
  }

  // 2. Doctor Portal Routes
  if (currentPath === '/doctor/register') {
    return <DoctorRegister onNavigate={navigate} />;
  }

  if (currentPath === '/doctor/login') {
    if (isAuthenticated && role === 'DOCTOR') {
      return <DoctorDashboard onNavigate={navigate} />;
    }
    return <DoctorLogin onNavigate={navigate} />;
  }

  if (currentPath === '/doctor/dashboard') {
    if (!isAuthenticated) {
      return <DoctorLogin onNavigate={navigate} />;
    }
    if (role !== 'DOCTOR') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="DOCTOR" 
          portalName="Doctor Clinical Portal" 
          onNavigate={navigate} 
        />
      );
    }
    return <DoctorDashboard onNavigate={navigate} initialTab="dashboard" />;
  }

  if (currentPath === '/doctor/add-patient') {
    if (!isAuthenticated) {
      return <DoctorLogin onNavigate={navigate} />;
    }
    if (role !== 'DOCTOR') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="DOCTOR" 
          portalName="Doctor Add Patient Portal" 
          onNavigate={navigate} 
        />
      );
    }
    return <DoctorDashboard onNavigate={navigate} initialTab="add-patient" />;
  }

  if (currentPath === '/doctor/scan-qr') {
    if (!isAuthenticated) {
      return <DoctorLogin onNavigate={navigate} />;
    }
    if (role !== 'DOCTOR') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="DOCTOR" 
          portalName="Doctor QR Scan Portal" 
          onNavigate={navigate} 
        />
      );
    }
    return <DoctorDashboard onNavigate={navigate} initialTab="scan-qr" />;
  }

  if (currentPath.startsWith('/doctor/patient/')) {
    if (!isAuthenticated) {
      return <DoctorLogin onNavigate={navigate} />;
    }
    if (role !== 'DOCTOR') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="DOCTOR" 
          portalName="Authorized Patient Medical Record" 
          onNavigate={navigate} 
        />
      );
    }
    const targetPatientId = currentPath.replace('/doctor/patient/', '');
    return <DoctorDashboard onNavigate={navigate} initialTab="patient-detail" targetPatientId={targetPatientId} />;
  }

  // 3. Patient Portal Routes
  if (currentPath === '/patient/register') {
    return <PatientRegister onNavigate={navigate} />;
  }

  if (currentPath === '/patient/complete-profile') {
    if (!isAuthenticated) {
      return <PatientLogin onNavigate={navigate} />;
    }
    if (role !== 'PATIENT') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="PATIENT" 
          portalName="Patient Health Profile Setup" 
          onNavigate={navigate} 
        />
      );
    }
    return <PatientCompleteProfile onNavigate={navigate} />;
  }

  if (currentPath === '/patient/login') {
    if (isAuthenticated && role === 'PATIENT') {
      if (user?.profileCompleted === false) {
        return <PatientCompleteProfile onNavigate={navigate} />;
      }
      return <PatientDashboard onNavigate={navigate} />;
    }
    return <PatientLogin onNavigate={navigate} />;
  }

  if (currentPath === '/patient/dashboard') {
    if (!isAuthenticated) {
      return <PatientLogin onNavigate={navigate} />;
    }
    if (role !== 'PATIENT') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="PATIENT" 
          portalName="Patient Health Portal" 
          onNavigate={navigate} 
        />
      );
    }
    if (user?.profileCompleted === false) {
      return <PatientCompleteProfile onNavigate={navigate} />;
    }
    return <PatientDashboard onNavigate={navigate} initialTab="dashboard" />;
  }

  if (currentPath === '/patient/profile') {
    if (!isAuthenticated) {
      return <PatientLogin onNavigate={navigate} />;
    }
    if (role !== 'PATIENT') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="PATIENT" 
          portalName="Patient Profile" 
          onNavigate={navigate} 
        />
      );
    }
    return <PatientDashboard onNavigate={navigate} initialTab="profile" />;
  }

  if (currentPath === '/patient/my-qr') {
    if (!isAuthenticated) {
      return <PatientLogin onNavigate={navigate} />;
    }
    if (role !== 'PATIENT') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="PATIENT" 
          portalName="Patient Secure QR Portal" 
          onNavigate={navigate} 
        />
      );
    }
    return <PatientDashboard onNavigate={navigate} initialTab="my-qr" />;
  }

  if (currentPath === '/patient/find-doctor') {
    if (!isAuthenticated) {
      return <PatientLogin onNavigate={navigate} />;
    }
    if (role !== 'PATIENT') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="PATIENT" 
          portalName="Find a Doctor Portal" 
          onNavigate={navigate} 
        />
      );
    }
    return <FindDoctor onNavigate={navigate} />;
  }

  if (currentPath === '/patient/my-doctors') {
    if (!isAuthenticated) {
      return <PatientLogin onNavigate={navigate} />;
    }
    if (role !== 'PATIENT') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="PATIENT" 
          portalName="My Doctors Portal" 
          onNavigate={navigate} 
        />
      );
    }
    return <MyDoctors onNavigate={navigate} />;
  }

  // 4. Administrator Portal Routes
  if (currentPath === '/admin/login') {
    if (isAuthenticated && role === 'ADMIN') {
      return <AdminDashboard onNavigate={navigate} />;
    }
    return <AdminLogin onNavigate={navigate} />;
  }

  if (currentPath === '/admin/dashboard') {
    if (!isAuthenticated) {
      return <AdminLogin onNavigate={navigate} />;
    }
    if (role !== 'ADMIN') {
      return (
        <Forbidden403 
          currentRole={role} 
          requiredRole="ADMIN" 
          portalName="Public Health Surveillance Administrator Portal" 
          onNavigate={navigate} 
        />
      );
    }
    return <AdminDashboard onNavigate={navigate} />;
  }

  // 5. Existing Legacy & Patient Views (e.g. /home, /appointments, /medical-records)
  if (!isAuthenticated) {
    return <PortalSelect onNavigate={navigate} />;
  }

  // If a Doctor tries to access general patient app layout, direct them to doctor dashboard
  if (role === 'DOCTOR') {
    return <DoctorDashboard onNavigate={navigate} />;
  }

  // If an Admin tries to access individual patient records, DENY WITH 403
  if (role === 'ADMIN') {
    return (
      <Forbidden403 
        currentRole="ADMIN" 
        requiredRole="PATIENT/DOCTOR" 
        portalName="Individual Patient Clinical Records" 
        onNavigate={navigate} 
      />
    );
  }

  // Otherwise, patient viewing standard patient pages
  const getPageTitle = (path) => {
    switch (path) {
      case '/home': return 'Home Overview';
      case '/find-care': return 'Find Care & Facilities';
      case '/doctors': return 'Healthcare Professionals';
      case '/hospitals': return 'Hospitals & Medical Centers';
      case '/appointments': return 'My Appointments';
      case '/medical-records': return 'Medical Records & Diagnostic Files';
      case '/prescriptions': return 'Prescriptions & Medications';
      case '/ai-assistant': return 'CareKey AI Health Copilot';
      case '/notifications': return 'Notifications & Alerts';
      case '/profile': return 'My Account Profile';
      case '/settings': return 'Account Settings';
      default: return 'CareKey Platform';
    }
  };

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/home':
        return <Home onNavigate={navigate} />;
      case '/find-care':
        return <FindCare onNavigate={navigate} />;
      case '/doctors':
        return <Doctors onNavigate={navigate} />;
      case '/hospitals':
        return <Hospitals onNavigate={navigate} />;
      case '/appointments':
        return <Appointments onNavigate={navigate} />;
      case '/medical-records':
        return <MedicalRecords onNavigate={navigate} />;
      case '/prescriptions':
        return <Prescriptions onNavigate={navigate} />;
      case '/ai-assistant':
        return <AIAssistant onNavigate={navigate} />;
      case '/notifications':
        return <Notifications onNavigate={navigate} />;
      case '/profile':
        return <Profile onNavigate={navigate} />;
      case '/settings':
        return <Settings onNavigate={navigate} />;
      default:
        return <PatientDashboard onNavigate={navigate} />;
    }
  };

  return (
    <AppLayout
      currentPath={currentPath}
      onNavigate={navigate}
      pageTitle={getPageTitle(currentPath)}
    >
      {renderCurrentPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
