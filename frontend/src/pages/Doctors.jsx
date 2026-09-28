import React, { useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { 
  Stethoscope, 
  Search, 
  MapPin, 
  Calendar
} from 'lucide-react';

export function Doctors({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await firestoreService.getDoctors(searchTerm);
      setDoctors(data || []);
    } catch (err) {
      console.warn('Doctors search error:', err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Doctors & Specialists</h1>
        <p className="text-xs text-slate-500">Search certified practitioners across primary care, cardiology, pulmonology, and surgery.</p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by doctor name or clinical specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Doctors List or Empty State */}
      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                <p className="text-xs text-sky-600 font-medium">{doc.specialty}</p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{doc.location || 'Hospital Outpatient'}</span>
                </p>
              </div>
              <button
                onClick={() => onNavigate('/appointments')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-800">
              {hasSearched ? 'No healthcare professionals found matching your query.' : 'Search for healthcare professionals to get started.'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Find licensed doctors and schedule clinical consultations directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
