import React, { useState } from 'react';
import Storefront from './components/Storefront';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('storefront'); // 'storefront' | 'admin'

  return (
    <div className="w-full h-full min-h-screen bg-[#F6F5F3]">
      {currentView === 'storefront' && (
        <Storefront
          onOpenAdmin={() => setCurrentView('admin')}
        />
      )}

      {currentView === 'admin' && (
        <AdminDashboard
          onSwitchToStorefront={() => setCurrentView('storefront')}
        />
      )}
    </div>
  );
}
