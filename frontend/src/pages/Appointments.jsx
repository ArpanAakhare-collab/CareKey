import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { 
  Calendar, 
  Clock, 
  PlusCircle, 
  Stethoscope, 
  X, 
  RefreshCw,
  MapPin
} from 'lucide-react';

export function Appointments({ onNavigate }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [doctorName, setDoctorName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [reason, setReason] = useState('');

  const loadAppointments = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await firestoreService.getUserAppointments(user.uid);
      setAppointments(data || []);
    } catch (err) {
      console.warn('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError(null);
    if (!doctorName.trim() || !dateTime) {
      setError('Please provide the doctor or department name and date/time.');
      return;
    }
    setSubmitting(true);
    try {
      const newAppt = await firestoreService.createAppointment({
        userId: user?.uid || 'guest',
        doctorName: doctorName.trim(),
        facilityName: facilityName.trim() || 'CareKey Medical Center',
        dateTime,
        reason: reason.trim() || 'General Consultation',
        status: 'scheduled'
      });
      // Immediately reflect new appointment in state and close modal
      setAppointments(prev => [newAppt, ...(prev || [])]);
      setModalOpen(false);
      setDoctorName('');
      setFacilityName('');
      setDateTime('');
      setReason('');
    } catch (err) {
      setError(err.message || 'Failed to schedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await firestoreService.cancelAppointment(id, user?.uid);
      setAppointments(prev => (prev || []).map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      alert('Failed to cancel appointment: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-xs text-slate-500">Manage upcoming clinical consultations and scheduled follow-ups.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Appointments List or Empty State */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading your appointments...</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appt) => (
            <div 
              key={appt.id}
              className={`p-5 bg-white border rounded-2xl shadow-xs flex flex-col justify-between space-y-4 ${
                appt.status === 'cancelled' ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    appt.status === 'cancelled' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {appt.status ? appt.status.toUpperCase() : 'SCHEDULED'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{appt.dateTime}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{appt.doctorName}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{appt.facilityName}</span>
                </p>
                {appt.reason && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {appt.reason}
                  </p>
                )}
              </div>

              {appt.status !== 'cancelled' && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleCancelAppointment(appt.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-800">No appointments yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your upcoming appointments will appear here once scheduled.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/doctors')}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Find a Doctor</span>
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold">Schedule Clinic Appointment</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor / Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins (Cardiology)"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Facility</label>
                <input
                  type="text"
                  placeholder="e.g. Metropolitan General Hospital"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Routine blood pressure checkup and medication review"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm Booking</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
