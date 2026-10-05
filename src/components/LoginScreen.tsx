import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PSSEMRLogo } from './PSSEMRLogo';
import { ShieldCheck, UserCheck, ArrowRight, Lock, Phone, Mail } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { users, loginAs, loginWithCredentials } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const adminUser = users.find((u) => u.role === 'admin');
  const sampleTeacher = users.find((u) => u.name === 'Mr. Manjunath Khot') || users[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your mobile number or email');
      return;
    }
    const success = loginWithCredentials(identifier);
    if (!success) {
      setError('User not found. Try one of the quick sign-in buttons below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex flex-col justify-center items-center px-4 py-8">
      
      {/* Top logo & branding container */}
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DED5] shadow-xs text-center">
        
        {/* Official PSSEMR Logo Centered */}
        <div className="flex justify-center mb-4">
          <PSSEMRLogo className="h-20 sm:h-24 w-auto object-contain" />
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#781C2B] tracking-tight">
          PSSEMR School & PU College
        </h1>
        <p className="text-xs text-[#66615D] mt-1 font-medium">
          Shivagangotri, Tolahunse, Davangere – 577007
        </p>

        <div className="mt-3 py-1.5 px-3 bg-[#F5E8EA] text-[#781C2B] rounded-lg text-xs font-semibold inline-block">
          Club Report WhatsApp Shared Status Tracker
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 text-left space-y-4">
          {error && (
            <div className="p-3 bg-[#F5E8EA] border border-[#781C2B]/30 rounded-lg text-xs text-[#781C2B] font-semibold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#292929] mb-1">
              Mobile Number or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              placeholder="e.g. 9845012345 or teacher name"
              className="w-full px-3.5 py-2.5 text-xs text-[#292929] bg-white border border-[#E5DED5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#781C2B] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292929] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              defaultValue="password"
              className="w-full px-3.5 py-2.5 text-xs text-[#292929] bg-white border border-[#E5DED5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#781C2B] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-xs font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] active:bg-[#461019] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Sign In Options */}
        <div className="mt-6 pt-5 border-t border-[#E5DED5]">
          <p className="text-[11px] font-semibold text-[#66615D] uppercase tracking-wider mb-2.5">
            Quick One-Tap Sign In:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                const jithendra = users.find((u) => u.name === 'Mr. Jithendra') || users[1];
                loginAs(jithendra);
              }}
              className="p-2 rounded-xl border border-[#781C2B]/30 bg-[#F5E8EA] hover:bg-[#781C2B]/20 text-[#781C2B] font-bold text-left transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] font-normal text-[#66615D]">CBSE Teacher:</span>
                <span className="truncate text-xs">Mr. Jithendra</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                const vijay = users.find((u) => u.name === 'Mr. Vijay H') || users.find((u) => u.curriculums?.includes('IGCSE / CIE')) || users[2];
                loginAs(vijay);
              }}
              className="p-2 rounded-xl border border-[#781C2B]/30 bg-[#FFFDF9] hover:bg-[#F5E8EA] text-[#781C2B] font-bold text-left transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 shrink-0 text-[#2E7D5B]" />
              <div className="truncate">
                <span className="block text-[10px] font-normal text-[#66615D]">IGCSE/CIE Teacher:</span>
                <span className="truncate text-xs">Mr. Vijay H</span>
              </div>
            </button>

            {adminUser && (
              <button
                type="button"
                onClick={() => loginAs(adminUser)}
                className="p-2 rounded-xl border border-[#781C2B] bg-[#781C2B] text-white hover:bg-[#5F1623] font-bold text-left transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-200" />
                <div className="truncate">
                  <span className="block text-[10px] font-normal text-white/80">Admin View:</span>
                  <span className="truncate text-xs">Activity Coordinator</span>
                </div>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Institutional footer line */}
      <p className="text-[11px] text-[#66615D] text-center mt-6">
        PSSEMR Internal School Administrative System · Academic Year 2026-2027
      </p>

    </div>
  );
};
