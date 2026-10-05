import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PSSEMRLogo } from './PSSEMRLogo';
import {
  Phone,
  Mail,
  ChevronDown,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, users, loginAs, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminUser = users.find((u) => u.role === 'admin');
  const teachers = users.filter((u) => u.role === 'teacher');
  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5DED5] shadow-xs">
      
      {/* 1. TOP INFORMATION BAR (Deep Maroon #781C2B) */}
      <div className="bg-[#781C2B] text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          
          <div className="flex items-center gap-4 text-[#FFFDF9]/90 font-medium">
            <a href="tel:+919986379764" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>+91 9986379764</span>
            </a>
            <span className="text-[#FFFDF9]/40">|</span>
            <a href="mailto:pssemrschool@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>pssemrschool@gmail.com</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-[#FFFDF9]/80">
            <span className="hidden md:inline text-amber-200 font-medium">
              Shivagangotri, Tolahunse, Davangere, Karnataka – 577007
            </span>
            <span className="hidden md:inline text-[#FFFDF9]/40">·</span>
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> WhatsApp Report Tracker
            </span>
          </div>

        </div>
      </div>

      {/* 2. MAIN HEADER WITH OFFICIAL LOGO & USER SWITCHER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & School Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <PSSEMRLogo className="h-10 sm:h-[50px] w-auto object-contain" />
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-serif font-extrabold tracking-tight text-[#781C2B]">
                  PSSEMR
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-[0.16em] text-[#292929] uppercase">
                  School & PU College
                </span>
              </div>
              <p className="text-[11px] text-[#66615D] font-medium leading-none mt-0.5">
                Club Report Tracker
              </p>
            </div>
          </div>

          {/* User Account / Role Switcher */}
          {currentUser && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-[#E5DED5] bg-[#FFFDF9] hover:bg-[#F5E8EA]/40 transition-colors text-left"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    currentUser.role === 'admin'
                      ? 'bg-[#781C2B] text-white'
                      : 'bg-[#2E7D5B] text-white'
                  }`}
                >
                  {currentUser.role === 'admin' ? 'AD' : currentUser.name.charAt(0)}
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-[#292929] leading-tight truncate max-w-[150px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#66615D]">
                    {currentUser.role === 'admin' ? 'Activity Coordinator' : 'Club Teacher'}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-[#66615D] ml-0.5" />
              </button>

              {/* Dropdown for Role Switching and Logout */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E5DED5] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 bg-[#781C2B] text-white text-center">
                    <p className="text-xs font-serif font-bold truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-amber-200 mt-0.5 uppercase tracking-wider font-semibold">
                      {currentUser.role === 'admin' ? 'Admin / Activity Coordinator' : 'Club Teacher'}
                    </p>
                  </div>

                  <div className="p-2 border-b border-[#E5DED5] bg-[#F8F5EF]">
                    <span className="text-[10px] font-bold text-[#66615D] uppercase tracking-wider px-2 block mb-1">
                      Switch Role:
                    </span>
                    
                    {adminUser && (
                      <button
                        type="button"
                        onClick={() => {
                          loginAs(adminUser);
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                          currentUser.role === 'admin'
                            ? 'bg-[#F5E8EA] text-[#781C2B]'
                            : 'hover:bg-white text-[#292929]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#781C2B]" />
                          Activity Coordinator (Admin)
                        </span>
                        {currentUser.role === 'admin' && (
                          <span className="text-[10px] bg-[#781C2B] text-white px-1.5 py-0.2 rounded font-bold">
                            Active
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Teacher quick selection list */}
                  <div className="p-2">
                    <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-[#66615D]">
                      <span>Switch to Teacher:</span>
                      <span className="text-[10px] font-mono">{teachers.length}</span>
                    </div>

                    <div className="relative my-1 px-1">
                      <Search className="w-3 h-3 text-[#66615D] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search teacher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-xs border border-[#E5DED5] rounded-md focus:outline-none focus:ring-1 focus:ring-[#781C2B] bg-[#FFFDF9]"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto mt-1 divide-y divide-[#E5DED5]/40 text-xs">
                      {filteredTeachers.map((t) => {
                        const isCurrent = currentUser.id === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              loginAs(t);
                              setMenuOpen(false);
                              setSearch('');
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between ${
                              isCurrent
                                ? 'bg-[#E7F3EC] text-[#2E7D5B] font-bold'
                                : 'hover:bg-[#F8F5EF] text-[#292929]'
                            }`}
                          >
                            <span className="truncate">{t.name}</span>
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              {t.curriculums?.map((c) => (
                                <span
                                  key={c}
                                  className="text-[9px] px-1 py-0.2 bg-[#F8F5EF] text-[#781C2B] rounded font-bold border border-[#E5DED5]"
                                >
                                  {c === 'CBSE' ? 'CBSE' : 'CIE'}
                                </span>
                              ))}
                              {isCurrent && (
                                <span className="text-[9px] bg-[#2E7D5B] text-white px-1 rounded font-bold">
                                  Active
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-2 border-t border-[#E5DED5] bg-[#F8F5EF]">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#781C2B] hover:bg-[#F5E8EA] rounded-lg font-bold flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Login Screen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </header>
  );
};
