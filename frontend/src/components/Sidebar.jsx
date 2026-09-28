import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Home,
  Compass,
  Stethoscope,
  Building2,
  Calendar,
  FileText,
  Pill,
  Sparkles,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';

export function Sidebar({ currentPath, onNavigate, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  const mainLinks = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/find-care', label: 'Find Care', icon: Compass },
    { path: '/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/hospitals', label: 'Hospitals', icon: Building2 },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/medical-records', label: 'Medical Records', icon: FileText },
    { path: '/prescriptions', label: 'Prescriptions', icon: Pill },
    { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { path: '/notifications', label: 'Notifications', icon: Bell }
  ];

  const accountLinks = [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  const handleLinkClick = (path) => {
    onNavigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/90 flex items-center justify-between">
          <div 
            onClick={() => handleLinkClick('/home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  CareKey
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  HEALTH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Intelligent Healthcare
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button 
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Info */}
        <div className="px-5 py-3.5 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold text-xs shrink-0 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.email || user?.phoneNumber || 'Verified Account'}
            </p>
          </div>
        </div>

        {/* Navigation Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          
          {/* MAIN SECTION */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Main
            </p>
            <div className="space-y-0.5">
              {mainLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleLinkClick(item.path)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACCOUNT SECTION */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Account
            </p>
            <div className="space-y-0.5">
              {accountLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleLinkClick(item.path)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Logout */}
        <div className="p-3.5 border-t border-slate-800/90 bg-slate-950/60">
          <button
            onClick={logout}
            className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 flex items-center gap-2.5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>
    </>
  );
}
