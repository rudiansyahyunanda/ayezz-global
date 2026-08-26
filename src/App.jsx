import React, { useState } from 'react';
import Storefront from './components/Storefront';
import SublimationStudio from './components/SublimationStudio';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('storefront'); // 'storefront' | 'admin' | 'studio'
  const [selectedModelId, setSelectedModelId] = useState('jersey_futsal');

  const handleLaunchStudio = (modelId = 'jersey_futsal') => {
    setSelectedModelId(modelId);
    setCurrentView('studio');
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#F6F5F3]">
      {currentView === 'storefront' && (
        <Storefront
          onLaunchStudio={handleLaunchStudio}
          onOpenAdmin={() => setCurrentView('admin')}
        />
      )}

      {currentView === 'admin' && (
        <AdminDashboard
          onSwitchToStorefront={() => setCurrentView('storefront')}
        />
      )}

      {currentView === 'studio' && (
        <SublimationStudio
          onBackToStorefront={() => setCurrentView('storefront')}
          initialModelId={selectedModelId}
        />
      )}
    </div>
  );
}
