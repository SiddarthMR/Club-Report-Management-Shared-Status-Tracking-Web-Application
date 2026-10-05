import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherView } from './components/TeacherView';
import { PSSEMRLogo } from './components/PSSEMRLogo';
import { MapPin, Phone, Mail } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#292929] flex flex-col selection:bg-[#F5E8EA] selection:text-[#781C2B]">
      
      {/* Top Header with official logo and user switcher */}
      <Header />

      {/* Main Experience: Either Teacher or Admin */}
      <main className="flex-1 pb-16">
        {currentUser.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <TeacherView />
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-white border-t border-[#E5DED5] py-6 text-xs text-[#66615D] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <PSSEMRLogo className="h-10 w-auto object-contain shrink-0" />
            <div>
              <p className="font-serif font-bold text-sm text-[#781C2B]">
                PSSEMR School & PU College
              </p>
              <p className="text-[11px] text-[#66615D]">
                Shivagangotri, Tolahunse, Davangere, Karnataka – 577007
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#66615D] space-y-0.5">
            <p className="font-semibold text-[#292929]">
              Club Report WhatsApp Shared Status Tracker
            </p>
            <p>Academic Year 2026-2027</p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
