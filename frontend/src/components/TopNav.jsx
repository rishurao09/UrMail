import React from 'react';

const TopNav = () => {
  return (
    <header className="fixed top-0 right-0 left-64 flex justify-between items-center px-8 z-40 bg-[#111415]/50 backdrop-blur-lg h-16">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input 
            className="w-full bg-surface-container-highest/30 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 placeholder:text-outline/50 outline-none text-on-surface" 
            placeholder="Search intelligent archives..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant hover:text-[#53e16f] cursor-pointer transition-colors">sensors</span>
          <div className="relative">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-[#53e16f] cursor-pointer transition-colors">notifications</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-tertiary rounded-full border border-surface"></span>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/20">
          <div className="text-right">
            <p className="text-[11px] font-label uppercase tracking-widest text-outline">Executive User</p>
            <p className="text-sm font-headline font-bold text-on-surface">Aditya Singh</p>
          </div>
          <img 
            alt="Executive User Profile" 
            className="w-10 h-10 rounded-lg object-cover ring-1 ring-outline-variant/30" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSFYwOIlHiHa1k140OmsBgPm7wU59qVVM7WUDT-YFD_JDHwRwEJb5vT6CviH23PTgofE5-PxjfBuypM4B-1v6EL24UqbeC3w8VR_croEBMFMAHNURk81rITpl6dKYo70aqzNSphyHKdHsZVvR0k8b7uzm8kCDeW4HGAWBRzHjlIgWah7O9XeqEWJDQtHJ2sEg5gSDzo1kWgGGZn7vrCKrZkHNu8hWJlHZEfiEEAdghQwyuVgG3Pv_zs-qNbIJe-eqTcNO1XVGxtP3T"
          />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
