import React, { useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { 
  Search, 
  MapPin, 
  Building2 
} from 'lucide-react';

export function FindCare({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await firestoreService.getHospitals(searchTerm);
      setResults(data || []);
    } catch (err) {
      console.warn('Find Care search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Find Healthcare Facilities</h1>
        <p className="text-xs text-slate-500">Locate accredited clinics, diagnostic centers, and emergency hospitals.</p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by facility name, city, or specialty..."
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

      {/* Results or Empty State */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((fac) => (
            <div key={fac.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{fac.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fac.city || 'Verified Facility'}</span>
                </p>
              </div>
              <button 
                onClick={() => onNavigate('/appointments')}
                className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition-colors"
              >
                Book
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-800">
              {hasSearched ? 'No healthcare facilities matched your query.' : 'Find healthcare facilities near you.'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Search by hospital name or city to discover accredited medical providers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
