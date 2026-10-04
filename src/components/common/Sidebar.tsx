import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import {
  LayoutDashboard,
  Box,
  Cpu,
  AlertTriangle,
  Sparkles,
  Sliders,
  History,
  Compass,
  Radio,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Zap,
  Building,
  CloudSnow,
  Fuel,
  Droplet,
  Users,
  FlaskConical,
  Wrench,
  Globe2
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { currentRoute, navigateTo, unreadAlertCount, logout } = useStation();
  const [systemsExpanded, setSystemsExpanded] = useState<boolean>(true);
  const [intelligenceExpanded, setIntelligenceExpanded] = useState<boolean>(true);

  const handleNav = (route: string) => {
    navigateTo(route);
    if (onCloseMobile) onCloseMobile();
  };

  const isActive = (route: string) => currentRoute === route || currentRoute.startsWith(route + '/');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-[#0B1220] text-slate-300 flex flex-col border-r border-[#1E293B] transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#617FF2] to-sky-400 flex items-center justify-center text-white font-black text-sm shadow-md">
              N
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight leading-none">
                NIVARA
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 uppercase">
                Polar Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Main Group */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Station Core
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentRoute === 'overview'
                    ? 'bg-[#617FF2] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => handleNav('digital-twin')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentRoute === 'digital-twin'
                    ? 'bg-[#617FF2] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Box className="w-4 h-4 shrink-0 text-sky-400" />
                <span>3D Digital Twin</span>
              </button>

              <button
                onClick={() => handleNav('alerts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentRoute === 'alerts'
                    ? 'bg-[#617FF2] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Alerts & Telemetry</span>
                </div>
                {unreadAlertCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {unreadAlertCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Intelligence Group */}
          <div>
            <button
              onClick={() => setIntelligenceExpanded((prev) => !prev)}
              className="w-full px-3 mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>Intelligence Suite</span>
              {intelligenceExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {intelligenceExpanded && (
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('intelligence/predictive')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentRoute === 'intelligence/predictive'
                      ? 'bg-[#617FF2] text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Predictive AI</span>
                </button>

                <button
                  onClick={() => handleNav('intelligence/what-if')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentRoute === 'intelligence/what-if'
                      ? 'bg-[#617FF2] text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4 shrink-0 text-sky-400" />
                  <span>What-If Simulator</span>
                </button>

                <button
                  onClick={() => handleNav('intelligence/black-box')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentRoute === 'intelligence/black-box'
                      ? 'bg-[#617FF2] text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Station Black Box</span>
                </button>

                <button
                  onClick={() => handleNav('intelligence/mission')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentRoute === 'intelligence/mission'
                      ? 'bg-[#617FF2] text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Mission Sustainability</span>
                </button>
              </div>
            )}
          </div>

          {/* Station Systems Sub-menu */}
          <div>
            <button
              onClick={() => setSystemsExpanded((prev) => !prev)}
              className="w-full px-3 mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>Station Systems (9)</span>
              {systemsExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {systemsExpanded && (
              <div className="space-y-0.5">
                {[
                  { id: 'generator', label: 'Generator & Power', icon: Zap },
                  { id: 'infrastructure', label: 'Infrastructure', icon: Building },
                  { id: 'environment', label: 'Environment', icon: CloudSnow },
                  { id: 'resources', label: 'Fuel & Resources', icon: Fuel },
                  { id: 'water', label: 'Water & Food', icon: Droplet },
                  { id: 'communication', label: 'Communication Link', icon: Radio },
                  { id: 'crew', label: 'Crew & Habitation', icon: Users },
                  { id: 'research', label: 'Research Lab', icon: FlaskConical },
                  { id: 'maintenance', label: 'Maintenance', icon: Wrench }
                ].map((item) => {
                  const Icon = item.icon;
                  const itemRoute = `systems/${item.id}`;
                  const selected = currentRoute === itemRoute;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(itemRoute)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        selected
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operations & Reports */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Operations & Admin
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('reports')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentRoute === 'reports'
                    ? 'bg-[#617FF2] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Station Reports</span>
              </button>

              <button
                onClick={() => handleNav('stations')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentRoute === 'stations'
                    ? 'bg-[#617FF2] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Globe2 className="w-4 h-4 shrink-0 text-sky-400" />
                <span>Switch Station</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-white/10 bg-[#070c16] space-y-1">
          <button
            onClick={() => handleNav('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors ${
              currentRoute === 'settings'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
