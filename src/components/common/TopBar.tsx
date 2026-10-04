import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { IndiaEmblem } from './IndiaEmblem';
import {
  Radio,
  Wifi,
  WifiOff,
  Clock,
  Compass,
  ChevronDown,
  Bell,
  ShieldCheck,
  LogOut,
  User,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { STATIONS_DATA } from '../../data/mockData';
import { StationId } from '../../types';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const {
    stationId,
    setStationId,
    liveConditions,
    timeUtc,
    user,
    logout,
    unreadAlertCount,
    navigateTo,
    toggleCommunication
  } = useStation();

  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isConnected = liveConditions.communicationStatus === 'CONNECTED';
  const currentStation = STATIONS_DATA[stationId];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#D5E1F2] px-4 sm:px-6 py-2.5 transition-all select-none">
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Government Emblem, Brand & Active Station */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <IndiaEmblem size={24} showText={false} />
            <button
              onClick={() => navigateTo('overview')}
              className="text-lg sm:text-xl font-black tracking-tight text-[#0B1220] hover:text-[#0284C7] transition-colors"
            >
              NIVARA
            </button>
            <span className="text-slate-300">/</span>

            {/* Station Selector Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowStationDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF2FC] hover:bg-[#DCE8F7] text-xs font-semibold text-[#17213A] transition-colors"
              >
                <span>{currentStation.name.toUpperCase()}</span>
                <span className="text-[10px] text-slate-500 font-mono">({currentStation.code})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showStationDropdown && (
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-[#D5E1F2] p-1.5 z-50">
                  <div className="px-2.5 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Select Research Base
                  </div>
                  {(['maitri', 'bharati'] as StationId[]).map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        setStationId(id);
                        setShowStationDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        stationId === id
                          ? 'bg-[#EAF2FC] text-[#0284C7] font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-[#17213A]">{STATIONS_DATA[id].name} Station</div>
                        <div className="text-[10px] text-slate-500">{STATIONS_DATA[id].region}</div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Official NCPOR Data Source Button (Requirement 9) */}
          <a
            href="https://data.ncpor.res.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-mono font-bold transition-colors cursor-pointer"
          >
            <span>DATA SOURCE · NCPOR</span>
            <ExternalLink className="w-3 h-3 text-sky-600" />
          </a>
        </div>

        {/* Zone 2: Telemetry Sync, Coordinates & Communication Link */}
        <div className="hidden md:flex items-center gap-5 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>UTC: {timeUtc}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentStation.coordinates}</span>
          </div>

          {/* Interactive mainland connection simulator button */}
          <button
            onClick={toggleCommunication}
            title={
              isConnected
                ? 'Click to simulate temporary Satellite Blackout'
                : 'Click to restore Mainland Satellite Link'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans font-medium transition-colors ${
              isConnected
                ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-sky-600" />
                <span>Mainland Link: 84% (GSAT-14)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Autonomous Offline (127 buffered)</span>
              </>
            )}
          </button>
        </div>

        {/* Zone 3: Alerts & User Profile */}
        <div className="flex items-center gap-3">
          {/* Alerts quick button */}
          <button
            onClick={() => navigateTo('alerts')}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#EAF2FC] transition-colors"
            title="Station Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown((prev) => !prev)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-[#F4F8FE] hover:bg-[#EAF2FC] border border-[#D5E1F2] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#617FF2] text-white flex items-center justify-center text-xs font-bold">
                {user?.name ? user.name[0] : 'O'}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <div className="font-semibold text-[#17213A] truncate max-w-[130px]">
                  {user?.name || 'Dr. Arjun Roy'}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {user?.role || 'Operations Officer'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-[#D5E1F2] p-2 z-50">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-semibold text-[#17213A]">{user?.name || 'Dr. Arjun Roy'}</div>
                  <div className="text-[11px] text-slate-500">{user?.institution || 'NCPOR / Ministry of Earth Sciences'}</div>
                  <div className="text-[10px] font-mono text-[#617FF2] mt-0.5">ID: {user?.id || 'NIVARA-IND-8842'}</div>
                </div>

                <button
                  onClick={() => {
                    navigateTo('settings');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Station Settings & Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out (Lock Console)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
