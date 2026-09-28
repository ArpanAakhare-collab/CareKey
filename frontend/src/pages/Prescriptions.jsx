import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { 
  Pill, 
  RefreshCw
} from 'lucide-react';

export function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRx() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const data = await firestoreService.getUserPrescriptions(user.uid);
        setPrescriptions(data || []);
      } catch (err) {
        console.warn('Failed to load prescriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRx();
  }, [user]);

  return (
    <div className="space-y-6 py-2">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Prescriptions</h1>
        <p className="text-xs text-slate-500">Track verified medical prescriptions, dosage instructions, and active refills.</p>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading prescriptions...</p>
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {rx.status || 'ACTIVE'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {rx.issuedDate || 'Verified'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{rx.medicationName}</h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{rx.dosage} • {rx.frequency}</p>
                {rx.instructions && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Instructions: {rx.instructions}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Prescribed by: <strong className="text-slate-700">{rx.prescriber || 'Attending Physician'}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <Pill className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-800">No prescriptions yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Active medications and digital prescriptions authorized by your healthcare provider will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
