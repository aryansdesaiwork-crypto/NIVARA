/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StationProvider, useStation } from './context/StationContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { LandingPage } from './components/landing/LandingPage';
import { StationSelector } from './components/stations/StationSelector';
import { TopBar } from './components/common/TopBar';
import { Sidebar } from './components/common/Sidebar';
import { OverviewPage } from './components/overview/OverviewPage';
import { DigitalTwinStandalonePage } from './components/digital-twin/DigitalTwinStandalonePage';
import { SystemDetailPage } from './components/systems/SystemDetailPage';
import { PredictiveIntelligencePage } from './components/intelligence/PredictiveIntelligencePage';
import { WhatIfSimulatorPage } from './components/intelligence/WhatIfSimulatorPage';
import { BlackBoxPage } from './components/intelligence/BlackBoxPage';
import { MissionPlannerPage } from './components/intelligence/MissionPlannerPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { PolarPenguinWidget } from './components/common/PolarPenguinWidget';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentRoute } = useStation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 1. Unauthenticated Screens: Landing Page or Login Screen
  if (!isAuthenticated) {
    if (currentRoute === 'login') {
      return <LoginScreen />;
    }
    return <LandingPage />;
  }

  // 2. Station Selection Screen
  if (currentRoute === 'stations') {
    return <StationSelector />;
  }

  // 3. Router logic for Main Operational Shell
  const renderCurrentView = () => {
    const route = currentRoute.replace(/^\//, '');

    if (route === 'overview') {
      return <OverviewPage />;
    }
    if (route === 'digital-twin') {
      return <DigitalTwinStandalonePage />;
    }
    if (route.startsWith('systems/')) {
      const sysId = route.replace('systems/', '');
      return <SystemDetailPage systemId={sysId} />;
    }
    if (route === 'intelligence/predictive') {
      return <PredictiveIntelligencePage />;
    }
    if (route === 'intelligence/what-if') {
      return <WhatIfSimulatorPage />;
    }
    if (route === 'intelligence/black-box') {
      return <BlackBoxPage />;
    }
    if (route === 'intelligence/mission') {
      return <MissionPlannerPage />;
    }
    if (route === 'alerts') {
      return <AlertsPage />;
    }
    if (route === 'reports') {
      return <ReportsPage />;
    }
    if (route === 'settings') {
      return <SettingsPage />;
    }

    // Default fallback
    return <OverviewPage />;
  };

  return (
    <div className="min-h-screen bg-[#EAF2FC] flex">
      {/* Persistent Slim Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Floating Interactive Antarctic Penguin Companion */}
      <PolarPenguinWidget />
    </div>
  );
};

export default function App() {
  return (
    <StationProvider>
      <AppContent />
    </StationProvider>
  );
}
