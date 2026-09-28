import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { 
  Stethoscope, 
  Building2, 
  Calendar, 
  Sparkles, 
  FileText, 
  Pill, 
  Bell, 
  ArrowRight,
  PlusCircle,
  Upload
} from 'lucide-react';

export function Home({ onNavigate }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.uid) return;
      try {
        const [appts, recs, rxs, notifs] = await Promise.all([
          firestoreService.getUserAppointments(user.uid),
          firestoreService.getUserMedicalRecords(user.uid),
          firestoreService.getUserPrescriptions(user.uid),
          firestoreService.getUserNotifications(user.uid)
        ]);
        setAppointments(appts || []);
        setRecords(recs || []);
        setPrescriptions(rxs || []);
        setNotifications(notifs || []);
      } catch (err) {
        console.warn('Could not load overview data:', err);
      }
    }
    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-8 py-2">
      
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide">
            <span>Verified Patient Account</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-slate-300 font-normal">
            How can we help you today?
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('/doctors')}
            className="p-4 rounded-2xl bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-sky-700">Find a Doctor</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Consult specialists</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/hospitals')}
            className="p-4 rounded-2xl bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-indigo-700">Find a Hospital</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Explore medical centers</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/appointments')}
            className="p-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-emerald-700">Book Appointment</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Schedule clinic visits</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/ai-assistant')}
            className="p-4 rounded-2xl bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-purple-700">Ask AI Assistant</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time health insights</p>
            </div>
          </button>
        </div>
      </section>

      {/* Main Two-Column Grid: Appointments & Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Appointments Section */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Upcoming Appointments</h3>
            </div>
            <button
              onClick={() => onNavigate('/appointments')}
              className="text-xs text-sky-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-700">No upcoming appointments yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Your booked appointments will appear here.</p>
              </div>
              <button
                onClick={() => onNavigate('/appointments')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {appointments.slice(0, 3).map((appt) => (
                <div key={appt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{appt.doctorName || appt.facilityName || 'Clinic Appointment'}</h4>
                    <p className="text-[11px] text-slate-500">{appt.dateTime || 'Scheduled Date'}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    {appt.status || 'Confirmed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Medical Records Section */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Medical Records</h3>
            </div>
            <button
              onClick={() => onNavigate('/medical-records')}
              className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {records.length === 0 ? (
            <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-700">No medical records yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Your uploaded medical documents will appear here.</p>
              </div>
              <button
                onClick={() => onNavigate('/medical-records')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {records.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rec.title || rec.fileName || 'Health File'}</h4>
                    <p className="text-[11px] text-slate-500">{rec.category || 'Clinical Record'}</p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600">View</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Secondary Row: Prescriptions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Prescriptions Section */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Prescriptions</h3>
            </div>
            <button
              onClick={() => onNavigate('/prescriptions')}
              className="text-xs text-emerald-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
              <Pill className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No prescriptions yet.</p>
              <p className="text-[11px] text-slate-400">Prescriptions issued by your doctor will show here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {prescriptions.slice(0, 3).map((rx) => (
                <div key={rx.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rx.medicationName}</h4>
                    <p className="text-[11px] text-slate-500">{rx.dosage} • {rx.frequency}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notifications Section */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            </div>
            <button
              onClick={() => onNavigate('/notifications')}
              className="text-xs text-amber-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No new notifications.</p>
              <p className="text-[11px] text-slate-400">You're all caught up.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-800">{notif.message}</p>
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
