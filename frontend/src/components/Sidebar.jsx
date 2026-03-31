import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navLinkClass = ({ isActive }) =>
  isActive
    ? "flex items-center gap-3 px-4 py-2.5 rounded text-primary font-bold border-r-2 border-primary bg-primary/5 transition-all duration-300"
    : "flex items-center gap-3 px-4 py-2.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-all duration-300";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-6 px-4 bg-surface-container-low/80 backdrop-blur-xl w-64 border-r border-outline-variant/10 z-50">
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 rounded flex items-center justify-center">
          <img src="/logo.png" alt="UrMail Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary font-manrope">UrMail</h1>
          <p className="text-[0.625rem] font-label uppercase tracking-widest text-outline">Autonomous Ops</p>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/compose')}
        className="mb-8 w-full py-3 px-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(173,198,255,0.3)] transition-all active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
        Compose
      </button>

      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-1 custom-scrollbar">
        <div className="text-[0.6875rem] font-label uppercase tracking-widest text-outline px-4 mb-2 mt-4 first:mt-0">Intelligence</div>
        <NavLink to="/" end className={navLinkClass}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm font-medium">Dashboard</span>
        </NavLink>
        <NavLink to="/kb" className={navLinkClass}>
          <span className="material-symbols-outlined">database</span>
          <span className="text-sm font-medium">Knowledge Base</span>
        </NavLink>

        <div className="text-[0.6875rem] font-label uppercase tracking-widest text-outline px-4 mb-2 mt-6">Mailbox</div>
        <NavLink to="/inbox" className={navLinkClass}>
          <span className="material-symbols-outlined">inbox</span>
          <span className="text-sm font-medium">Inbox</span>
        </NavLink>
        <NavLink to="/spam" className={navLinkClass}>
          <span className="material-symbols-outlined">report</span>
          <span className="text-sm font-medium">Spam</span>
        </NavLink>
        <NavLink to="/email/1" className={({ isActive }) => 
          isActive || window.location.pathname.startsWith('/email/')
            ? "flex items-center gap-3 px-4 py-2.5 rounded text-primary font-bold border-r-2 border-primary bg-primary/5 transition-all duration-300"
            : "flex items-center gap-3 px-4 py-2.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-all duration-300"
        }>
          <span className="material-symbols-outlined">psychology</span>
          <span className="text-sm font-medium">Focus Blade</span>
        </NavLink>

        <div className="text-[0.6875rem] font-label uppercase tracking-widest text-outline px-4 mb-2 mt-6">Account</div>
        <NavLink to="/profile" className={navLinkClass}>
          <span className="material-symbols-outlined">person</span>
          <span className="text-sm font-medium">Profile</span>
        </NavLink>
        <NavLink to="/upgrade" className={navLinkClass}>
          <span className="material-symbols-outlined">diamond</span>
          <span className="text-sm font-medium">Upgrade Plan</span>
        </NavLink>
      </div>

      <div className="mt-auto pt-4 space-y-1 border-t border-outline-variant/10">
        <NavLink to="/settings" className={navLinkClass}>
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
