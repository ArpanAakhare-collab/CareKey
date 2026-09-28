import React, { useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { 
  Building2, 
  Search, 
  MapPin 
} from 'lucide-react';

export function Hospitals({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await firestoreService.getHospitals(searchTerm);
      setHospitals(data || []);
    } catch (err) {
      console.warn('Hospitals query error:', err);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hospitals & Medical Centers</h1>
        <p className="text-xs text-slate-500">Discover accredited hospital networks, 24/7 trauma emergency units, and specialized care centers.</p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search hospitals by name, city, or district..."
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

      {/* Hospitals List or Empty State */}
      {hospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{hosp.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hosp.city || 'Regional Center'}</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  {hosp.type || 'Super Specialty Hospital'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('/appointments')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-800">
              {hasSearched ? 'No medical facilities found matching your search.' : 'Find healthcare facilities near you.'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Search by name or city to view verified healthcare centers and regional trauma clinics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
