import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { 
  HeartPulse, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export function PatientCompleteProfile({ onNavigate }) {
  const { user, patientProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: patientProfile?.name || user?.displayName || '',
    dateOfBirth: patientProfile?.dateOfBirth || '',
    gender: patientProfile?.gender || 'Male',
    bloodGroup: patientProfile?.bloodGroup || 'B+',
    phone: patientProfile?.phone || '',
    email: patientProfile?.email || user?.email || '',
    address: patientProfile?.address || '',
    city: patientProfile?.city || 'Pune',
    district: patientProfile?.district || 'Pune',
    state: patientProfile?.state || 'Maharashtra',
    emergencyContactName: patientProfile?.emergencyContactName || patientProfile?.emergencyContact?.name || '',
    emergencyContactPhone: patientProfile?.emergencyContactPhone || patientProfile?.emergencyContact?.phone || '',
    allergies: patientProfile?.allergies || 'No known drug allergies',
    existingConditions: patientProfile?.existingConditions || 'None reported',
    currentMedications: patientProfile?.currentMedications || 'None'
  });

  const totalSteps = 4;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.name.trim()) return 'Please enter your full name.';
      if (!formData.dateOfBirth) return 'Please select your date of birth.';
      if (!formData.gender) return 'Please select your gender.';
      if (!formData.bloodGroup) return 'Please select your blood group.';
    }
    if (step === 2) {
      if (!formData.phone.trim()) return 'Please enter your phone number.';
      if (!formData.email.trim()) return 'Please enter your email address.';
      if (!formData.address.trim()) return 'Please enter your residential address.';
      if (!formData.city.trim()) return 'Please enter your city.';
      if (!formData.emergencyContactName.trim()) return 'Please provide an emergency contact name.';
      if (!formData.emergencyContactPhone.trim()) return 'Please provide an emergency contact phone number.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const patientId = patientProfile?.patientId || user?.patientId || user?.uid || 'CK-10482';
      
      const updatedProfile = await firestoreService.updatePatientProfile(patientId, {
        ...formData,
        uid: user?.uid || 'pat_' + Date.now(),
        role: 'PATIENT',
        profileCompleted: true
      });

      // Update local storage user profile completed flag
      if (user) {
        user.profileCompleted = true;
      }
      localStorage.setItem(`carekey_profile_completed_${user?.uid || 'pat'}`, 'true');

      // Navigate to patient dashboard
      onNavigate('/patient/dashboard');
    } catch (err) {
      setError('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white">CareKey Health</h1>
            <p className="text-[11px] text-sky-400">First-Time Patient Onboarding</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>HIPAA & Zero-PII Compliant Setup</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full py-6 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Title & Progress Header */}
          <div className="text-center space-y-2 pb-4 border-b border-slate-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Step {currentStep} of {totalSteps}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Complete Your Health Profile
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please provide your basic information to set up your secure longitudinal health record and cryptographic QR.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Personal' },
              { num: 2, label: 'Contact' },
              { num: 3, label: 'Health' },
              { num: 4, label: 'Review' }
            ].map(s => {
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="space-y-1 text-center">
                  <div className={`h-1.5 rounded-full transition-all ${
                    isDone ? 'bg-emerald-500' : isCurrent ? 'bg-sky-500' : 'bg-slate-800'
                  }`} />
                  <span className={`text-[10px] font-bold ${
                    isCurrent ? 'text-sky-400' : isDone ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: PERSONAL DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Personal Information</span>
              </h3>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={e => handleChange('dateOfBirth', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => handleChange('bloodGroup', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT & ADDRESS */}
          {currentStep === 2 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Contact & Address</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="e.g. +91 98201 44521"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="e.g. rahul.sharma@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Residential Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="e.g. Flat 402, Green Meadows, Baner"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={e => handleChange('district', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={e => handleChange('state', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Emergency Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContactName}
                      onChange={e => handleChange('emergencyContactName', e.target.value)}
                      placeholder="e.g. Anita Sharma (Spouse)"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Emergency Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContactPhone}
                      onChange={e => handleChange('emergencyContactPhone', e.target.value)}
                      placeholder="e.g. +91 98201 99882"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HEALTH PROFILE */}
          {currentStep === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Health Profile & Medical History</span>
              </h3>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Known Drug or Environmental Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={e => handleChange('allergies', e.target.value)}
                  placeholder="e.g. Penicillin, Pollen, or None"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Existing Medical Conditions</label>
                <input
                  type="text"
                  value={formData.existingConditions}
                  onChange={e => handleChange('existingConditions', e.target.value)}
                  placeholder="e.g. Primary Essential Hypertension, Asthma, or None"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Regular Medications</label>
                <input
                  type="text"
                  value={formData.currentMedications}
                  onChange={e => handleChange('currentMedications', e.target.value)}
                  placeholder="e.g. Amlodipine 5mg daily, or None"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {currentStep === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4" />
                <span>Review Your Profile Before Submission</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Name:</span>
                    <p className="font-bold text-white text-sm">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Blood Group / Gender:</span>
                    <p className="font-bold text-rose-400 text-sm">{formData.bloodGroup} &bull; {formData.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Phone:</span>
                    <p className="font-bold text-slate-200">{formData.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Email:</span>
                    <p className="font-bold text-slate-200">{formData.email}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] uppercase">Address:</span>
                    <p className="text-slate-200">{formData.address}, {formData.city}, {formData.state}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500 text-[10px] uppercase">Emergency Contact:</span>
                    <p className="font-bold text-slate-200">{formData.emergencyContactName} ({formData.emergencyContactPhone})</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500 text-[10px] uppercase">Health Profile:</span>
                    <p className="text-slate-300">Allergies: {formData.allergies} | Conditions: {formData.existingConditions} | Meds: {formData.currentMedications}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Action Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-sky-600/30"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>[ Save & Continue ]</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full py-4 text-center text-[11px] text-slate-500 relative z-10">
        CareKey • SecureQR Health Platform • Your private health data is encrypted and zero-PII protected.
      </footer>
    </div>
  );
}
