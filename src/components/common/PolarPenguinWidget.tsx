import React, { useState, useRef, useEffect } from 'react';
import { InteractivePenguin } from '../auth/InteractivePenguin';
import { useStation } from '../../context/StationContext';
import {
  X,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Thermometer,
  Wind,
  Radio,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'penguin';
  text: string;
  timestamp: string;
  actionRoute?: string;
  actionLabel?: string;
}

interface PenguinResponse {
  text: string;
  actionRoute?: string;
  actionLabel?: string;
}

// Lightweight Web Audio API synthesizer for penguin chirps
const playChirp = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(840, now);
    osc.frequency.exponentialRampToValueAtTime(1420, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(990, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(1650, now + 0.22);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Graceful fallback
  }
};

export const PolarPenguinWidget: React.FC = () => {
  const {
    stationId,
    setStationId,
    selectComponent,
    liveConditions,
    navigateTo
  } = useStation();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeSpeech, setActiveSpeech] = useState<string>(
    'Chirp! Welcome to Companion! Ask me anything, tell me "change station", or "take me to" any component!'
  );
  const [isTyping, setIsTyping] = useState(false);
  const [penguinKey, setPenguinKey] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'penguin',
      text: 'Chirp chirp! Welcome to Companion! I am your AI polar assistant. Tell me "change station" to switch bases, or "take me to" any component or feature (like infra, generator, anomaly, 3D, water, what-if) to navigate immediately!',
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Intelligent Antarctic Knowledge & Deep Navigation Engine
  const generatePenguinResponse = (query: string): PenguinResponse => {
    const q = query.toLowerCase().trim();

    // =========================================================================
    // 0. STATION SWITCHING COMMANDS
    // =========================================================================
    if (
      q.includes('change station') ||
      q.includes('change the station') ||
      q.includes('switch station') ||
      q.includes('switch the station') ||
      q.includes('change to') ||
      q.includes('switch to') ||
      q.includes('go to bharati') ||
      q.includes('go to bharti') ||
      q.includes('go to maitri') ||
      q.includes('swap station') ||
      q.includes('toggle station') ||
      (q.includes('change') && q.includes('station')) ||
      (q.includes('switch') && q.includes('station'))
    ) {
      if (q.includes('bharati') || q.includes('bharti')) {
        setStationId('bharati');
        return {
          text: 'Chirp! 🐧 Station switched! I have changed the active station to BHARATI STATION (69°S Larsemann Hills)! All 3D digital-twin feeds, telemetry sensors, and infrastructure subsystems are now linked to Bharati.'
        };
      } else if (q.includes('maitri')) {
        setStationId('maitri');
        return {
          text: 'Chirp! 🐧 Station switched! I have changed the active station to MAITRI STATION (70°S Schirmacher Oasis)! Telemetry streams, thermal calculations, and 3D digital-twin views have switched to Maitri.'
        };
      } else {
        // Toggle to other station
        const nextStation = stationId === 'maitri' ? 'bharati' : 'maitri';
        setStationId(nextStation);
        const name =
          nextStation === 'bharati'
            ? 'Bharati Station (69°S Larsemann Hills)'
            : 'Maitri Station (70°S Schirmacher Oasis)';
        return {
          text: `Chirp! 🐧 Station switched! Switched active station from ${
            stationId === 'maitri' ? 'Maitri' : 'Bharati'
          } to ${name}. All live telemetry, 3D digital twin models, and environmental monitors are now updated!`
        };
      }
    }

    // =========================================================================
    // 1. DEEP COMPONENT & FEATURE DIRECT NAVIGATION ("take me to ...")
    // =========================================================================

    // 1A. Anomaly / Yellow Point / Pinpoint / Component Issue & Solutions
    if (
      q.includes('anomaly') ||
      q.includes('yellow point') ||
      q.includes('yellow marker') ||
      q.includes('pinpoint') ||
      q.includes('solution') ||
      q.includes('remediation') ||
      (q.includes('component') && (q.includes('issue') || q.includes('fault') || q.includes('problem')))
    ) {
      if (selectComponent) {
        selectComponent(stationId === 'bharati' ? 'hvac-fan-03' : 'valve-gen02');
      }
      return {
        text:
          stationId === 'bharati'
            ? 'Chirp! 🐧 Taking you directly to the Anomaly Pinpoint & Component Solutions in Infrastructure! Lower Deck HVAC Fan 03 has 4.8 mm/s vibration. Review the 4 actionable remediation options below!'
            : 'Chirp! 🐧 Taking you directly to the Anomaly Pinpoint & Component Solutions in Infrastructure! Generator 02 Hydronic Bypass Coolant Valve is running at 94.2°C. Check the actionable fixes below!',
        actionRoute: 'systems/infrastructure',
        actionLabel: 'View Component Anomaly Solutions'
      };
    }

    // 1B. Infrastructure & HVAC / Foundations / Stilts / Blower Fan
    if (
      q.includes('infra') ||
      q.includes('infrastructure') ||
      q.includes('hvac') ||
      q.includes('blower') ||
      q.includes('fan') ||
      q.includes('glycol') ||
      q.includes('stilt') ||
      q.includes('foundation') ||
      q.includes('heating loop') ||
      (q.includes('take me') && q.includes('structural'))
    ) {
      return {
        text: 'Chirp! 🐧 Taking you to Station Infrastructure & HVAC! Here you can monitor aerodynamic foundation stilts, positive pressure ventilation, the glycol heating loop, and component diagnostics.',
        actionRoute: 'systems/infrastructure',
        actionLabel: 'Open Infrastructure & HVAC'
      };
    }

    // 1C. Generator Room & Power Microgrid / Electricity / BESS / Coolant Valve
    if (
      q.includes('generator') ||
      q.includes('power') ||
      q.includes('microgrid') ||
      q.includes('electricity') ||
      q.includes('bess') ||
      q.includes('battery') ||
      q.includes('coolant valve') ||
      (q.includes('valve') && !q.includes('lake'))
    ) {
      return {
        text: 'Chirp! 🐧 Taking you to the Generator Room & Power Microgrid! Main Generator 01, Standby Generator 02, and BESS battery storage are online.',
        actionRoute: 'systems/generator',
        actionLabel: 'Open Generator Room'
      };
    }

    // 1D. 3D Digital Twin / Station 3D Model
    if (
      q.includes('digital twin') ||
      q.includes('digital-twin') ||
      q.includes('3d model') ||
      q.includes('station model') ||
      (q.includes('take me') && q.includes('3d')) ||
      (q.includes('go to') && q.includes('3d')) ||
      (q.includes('open') && q.includes('3d'))
    ) {
      return {
        text: 'Chirp! 🐧 Orbiting into the 3D Digital Twin! You can drag to rotate the station model, inspect katabatic wind vectors, and click the yellow beacons.',
        actionRoute: 'digital-twin',
        actionLabel: 'Open 3D Digital Twin'
      };
    }

    // 1E. Water Treatment & Hydrology / Lake Priyadarshini / Reverse Osmosis
    if (
      q.includes('water') ||
      q.includes('potable') ||
      q.includes('hydrology') ||
      q.includes('lake') ||
      q.includes('priyadarshini') ||
      q.includes('osmosis') ||
      q.includes('snow melt')
    ) {
      return {
        text: 'Chirp! 🐧 Navigating to Water Treatment & Hydrology! Freshwater lines from Lake Priyadarshini, thermal snow-melting pits, and reverse osmosis plants are operating.',
        actionRoute: 'systems/water',
        actionLabel: 'Open Water Treatment'
      };
    }

    // 1F. Fuel Farm & Bulk Polar Diesel Reserves
    if (
      q.includes('fuel') ||
      q.includes('diesel') ||
      q.includes('fuel farm') ||
      q.includes('resources') ||
      q.includes('tank') ||
      q.includes('oil')
    ) {
      return {
        text: 'Chirp! 🐧 Taking you to the Fuel Farm & Energy Storage! Monitoring bulk polar diesel reserves, transfer manifolds, and day tank levels.',
        actionRoute: 'systems/resources',
        actionLabel: 'Open Fuel Farm'
      };
    }

    // 1G. Environmental & Life Support
    if (
      q.includes('environment') ||
      q.includes('life support') ||
      q.includes('oxygen') ||
      q.includes('co2') ||
      q.includes('thermal envelope')
    ) {
      return {
        text: 'Chirp! 🐧 Opening Environmental & Life Support Subsystem! Cabin oxygen enrichment, positive pressure air filtration, and thermal barrier monitors are live.',
        actionRoute: 'systems/environment',
        actionLabel: 'Open Environmental Systems'
      };
    }

    // 1H. Satellite Communications & ISRO DCWIS
    if (
      q.includes('comm') ||
      q.includes('comms') ||
      q.includes('communication') ||
      q.includes('satellite') ||
      q.includes('isro') ||
      q.includes('radome') ||
      q.includes('antenna') ||
      q.includes('dcwis')
    ) {
      return {
        text: 'Chirp! 🐧 Taking you to the Satellite Ground Station! The ISRO DCWIS satellite transceiver, GSAT-14 link, and HF dipole arrays are connected.',
        actionRoute: 'systems/communication',
        actionLabel: 'Open Satellite Ground Station'
      };
    }

    // 1I. Crew Habitation & Medical Clinic
    if (
      q.includes('crew') ||
      q.includes('habitation') ||
      q.includes('living') ||
      q.includes('quarters') ||
      q.includes('galley') ||
      q.includes('medical') ||
      q.includes('clinic') ||
      q.includes('hospital')
    ) {
      return {
        text: 'Chirp! 🐧 Taking you to Crew Habitation & Medical Facilities! Living modules, surgical clinic, and expedition crew rosters are displayed.',
        actionRoute: 'systems/crew',
        actionLabel: 'Open Crew Habitation'
      };
    }

    // 1J. Scientific Research Laboratories & Experiments (LIDAR, Magnetometer)
    if (
      q.includes('research') ||
      q.includes('lab') ||
      q.includes('science') ||
      q.includes('lidar') ||
      q.includes('magnetometer') ||
      q.includes('ice core') ||
      q.includes('experiment')
    ) {
      return {
        text: 'Chirp! 🐧 Navigating to Scientific Research Laboratories! Real-time telemetry for atmospheric LIDAR, proton magnetometer, and ice-core mass spectrometry is live.',
        actionRoute: 'systems/research',
        actionLabel: 'Open Research Labs'
      };
    }

    // 1K. Maintenance Workshop
    if (
      q.includes('maintenance') ||
      q.includes('workshop') ||
      q.includes('tools') ||
      q.includes('lathe') ||
      q.includes('spare')
    ) {
      return {
        text: 'Chirp! 🐧 Opening the Maintenance Workshop! Spare parts inventory, machining lathes, and diagnostic repair workbenches are accessible.',
        actionRoute: 'systems/maintenance',
        actionLabel: 'Open Maintenance Workshop'
      };
    }

    // 1L. Predictive Intelligence
    if (
      q.includes('predictive') ||
      q.includes('prediction') ||
      q.includes('forecast') ||
      q.includes('neural') ||
      q.includes('mtbf')
    ) {
      return {
        text: 'Chirp! 🐧 Taking you to Predictive Intelligence! Physics-informed neural nets and MTBF failure risk curves are calculating live.',
        actionRoute: 'intelligence/predictive',
        actionLabel: 'Open Predictive AI'
      };
    }

    // 1M. What-If Simulator
    if (
      q.includes('what-if') ||
      q.includes('what if') ||
      q.includes('simulator') ||
      q.includes('physics simulation') ||
      q.includes('blizzard test')
    ) {
      return {
        text: 'Chirp! 🐧 Launching What-If Physics Simulator! Adjust outdoor temperature down to -50°C, trigger blizzards, and simulate cascading generator load shifts!',
        actionRoute: 'intelligence/what-if',
        actionLabel: 'Open What-If Simulator'
      };
    }

    // 1N. Black Box Incident Replay
    if (
      q.includes('black box') ||
      q.includes('black-box') ||
      q.includes('incident replay') ||
      q.includes('flight recorder')
    ) {
      return {
        text: 'Chirp! 🐧 Opening Black Box Telemetry Replay! Scrub through historical Antarctic sensor logs and system failure cascades.',
        actionRoute: 'intelligence/black-box',
        actionLabel: 'Open Black Box Replay'
      };
    }

    // 1O. Mission Planner & Resupply Cargo
    if (
      q.includes('mission') ||
      q.includes('planner') ||
      q.includes('resupply') ||
      q.includes('cargo') ||
      q.includes('ship') ||
      q.includes('flight')
    ) {
      return {
        text: 'Chirp! 🐧 Opening Mission & Resupply Planner! Ship arrivals, cargo logistics, and seasonal expedition schedules are synchronized.',
        actionRoute: 'intelligence/mission',
        actionLabel: 'Open Mission Planner'
      };
    }

    // 1P. Alerts & Incident Log
    if (q.includes('alert') || q.includes('alarms') || q.includes('incident')) {
      return {
        text: 'Chirp! 🐧 Taking you to Alerts & Incident Log! Active warnings, threshold exceedances, and acknowledge queues are open.',
        actionRoute: 'alerts',
        actionLabel: 'Open Alerts & Incidents'
      };
    }

    // 1Q. Reports & Telemetry Documentation
    if (q.includes('report') || q.includes('reports') || q.includes('audit') || q.includes('pdf')) {
      return {
        text: 'Chirp! 🐧 Opening Reports & Documentation! Export NCPOR expedition science summaries and sensor logs.',
        actionRoute: 'reports',
        actionLabel: 'Open Reports'
      };
    }

    // 1R. Overview / Home Dashboard
    if (
      q.includes('overview') ||
      q.includes('home') ||
      q.includes('dashboard') ||
      q.includes('main screen')
    ) {
      return {
        text: 'Chirp! 🐧 Navigating back to Station Overview! Complete multi-subsystem telemetry dashboard is active.',
        actionRoute: 'overview',
        actionLabel: 'Open Overview'
      };
    }

    // 1S. Settings & Sensor Sampling
    if (q.includes('setting') || q.includes('config') || q.includes('calibration')) {
      return {
        text: 'Chirp! 🐧 Opening Station Settings! Sensor sampling frequencies and threshold parameters are editable.',
        actionRoute: 'settings',
        actionLabel: 'Open Settings'
      };
    }

    // 1T. Generic "take me to component of any feature"
    if (
      q.includes('component') ||
      q.includes('feature') ||
      q.includes('take me to') ||
      q.includes('go to') ||
      q.includes('navigate to') ||
      q.includes('open')
    ) {
      return {
        text: 'Chirp! 🐧 I can take you to ANY component or feature across the station! For example: say "take me to anomaly" for the active issue & solutions, "take me to infra" for HVAC stilts, "take me to generator", "take me to water", "take me to research", or "take me to what-if"! Opening Infrastructure component view now...',
        actionRoute: 'systems/infrastructure',
        actionLabel: 'Open Infrastructure Component'
      };
    }

    // =========================================================================
    // 2. WEATHER & TEMPERATURE QUERIES
    // =========================================================================
    if (
      q.includes('weather') ||
      q.includes('temp') ||
      q.includes('climate') ||
      q.includes('cold') ||
      q.includes('wind')
    ) {
      if (stationId === 'maitri' || q.includes('maitri')) {
        return {
          text: `Maitri Station (70°S Schirmacher Oasis) is currently at ${liveConditions.temperatureC}°C with katabatic winds of ${liveConditions.windSpeedKmh} km/h! Skies are clear, but always pack your heavy down parka! ❄️`
        };
      }
      return {
        text: `Bharati Station (69°S Larsemann Hills) is at ${liveConditions.temperatureC}°C with coastal polar winds of ${liveConditions.windSpeedKmh} km/h. High-speed ISRO satellite telemetry is transmitting at 10 Mbps!`
      };
    }

    // =========================================================================
    // 3. STATION HISTORY & SPECS
    // =========================================================================
    if (q.includes('bharati') || q.includes('larsemann')) {
      return {
        text: 'Bharati Station (est. 2012) is located at 69°24′S in the Larsemann Hills! It was engineered from 134 prefabricated shipping containers elevated on aerodynamic stilts to prevent snowdrifts, and has a dedicated 10 Mbps ISRO satellite link!',
        actionRoute: 'overview',
        actionLabel: 'View Bharati Overview'
      };
    }

    if (q.includes('maitri') || q.includes('schirmacher')) {
      return {
        text: "Maitri Station (est. 1989) is India's second permanent polar station, situated in the ice-free Schirmacher Oasis (70°45′S)! Freshwater is pumped from Lake Priyadarshini, and it houses up to 25 wintering expedition members!",
        actionRoute: 'overview',
        actionLabel: 'View Maitri Overview'
      };
    }

    // =========================================================================
    // 4. JOKES & POLAR FUN
    // =========================================================================
    if (q.includes('joke') || q.includes('funny') || q.includes('laugh')) {
      const jokes = [
        'Why do penguins carry fish in their beaks? Because they don’t have pockets! Chirp chirp! 🐟',
        'How does a penguin build its house? Igloos it together! ❄️',
        'What is a penguin’s favorite relative? Aunt-Arctica! 🐧',
        'Why did the penguin cross the ice shelf? To visit the other slide!'
      ];
      return {
        text: jokes[Math.floor(Math.random() * jokes.length)]
      };
    }

    // =========================================================================
    // 5. PENGUIN IDENTITY & KRILL
    // =========================================================================
    if (q.includes('who are you') || q.includes('name') || q.includes('mascot')) {
      return {
        text: 'I am Nivara’s official 3D Emperor Baby Penguin companion! I live here in Antarctica, love Antarctic krill 🐟, and keep an eye on telemetry for India’s 44th Antarctic Expedition!'
      };
    }

    if (q.includes('fish') || q.includes('krill') || q.includes('food') || q.includes('eat') || q.includes('feed')) {
      return {
        text: 'Yum! Did someone say Antarctic krill? *flaps wings excitedly* Thank you! That gives me energy to monitor all the digital-twin sensors!'
      };
    }

    // =========================================================================
    // 6. GREETINGS
    // =========================================================================
    if (
      q.includes('hello') ||
      q.includes('hi') ||
      q.includes('hey') ||
      q.includes('sup') ||
      q.includes('good morning') ||
      q.includes('welcome')
    ) {
      return {
        text: `Chirp hello! Welcome to Companion! 🐧 I am your AI Polar Guide. Current active station is ${
          stationId === 'maitri' ? 'Maitri (70°S)' : 'Bharati (69°S)'
        } at ${
          liveConditions.temperatureC
        }°C. Tell me "change station" to switch bases, or "take me to" any component or feature!`
      };
    }

    // =========================================================================
    // 7. HELP & GUIDANCE
    // =========================================================================
    if (q.includes('help') || q.includes('what can you do')) {
      return {
        text: 'You can tell me: 1) "change station" to switch between Maitri and Bharati, 2) "take me to anomaly" to see issues & solutions, 3) "take me to infra / generator / water / 3d / what-if" to navigate anywhere, or ask about polar weather and trivia!'
      };
    }

    // Default Fallback
    return {
      text: `Chirp! I got your message: "${query}". Welcome to Companion! You can tell me "change station" to switch stations, or say "take me to [component/feature]" like infra, generator, anomaly, 3D twin, or water! 🐧`
    };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    if (soundEnabled) {
      playChirp();
    }

    // Simulate natural AI thinking time
    setTimeout(() => {
      const reply = generatePenguinResponse(text);

      // Automatically execute navigation if a component or feature was requested
      if (reply.actionRoute) {
        navigateTo(reply.actionRoute);
      }

      const penguinMsg: ChatMessage = {
        id: `penguin-${Date.now()}`,
        sender: 'penguin',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute: reply.actionRoute,
        actionLabel: reply.actionLabel
      };

      setMessages((prev) => [...prev, penguinMsg]);
      setActiveSpeech(reply.text);
      setIsTyping(false);
      setPenguinKey((k) => k + 1);

      if (soundEnabled) {
        playChirp();
      }
    }, 450);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputMessage(promptText);
    setTimeout(() => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        const reply = generatePenguinResponse(promptText);

        // Automatically execute navigation if a component or feature was requested
        if (reply.actionRoute) {
          navigateTo(reply.actionRoute);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `penguin-${Date.now()}`,
            sender: 'penguin',
            text: reply.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionRoute: reply.actionRoute,
            actionLabel: reply.actionLabel
          }
        ]);
        setActiveSpeech(reply.text);
        setIsTyping(false);
        setPenguinKey((k) => k + 1);

        if (soundEnabled) {
          playChirp();
        }
      }, 450);
    }, 50);
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full shadow-xl transition-all duration-300 border cursor-pointer ${
            isOpen
              ? 'bg-[#17213A] text-white border-slate-700'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-[#D5E1F2] hover:shadow-2xl hover:scale-105'
          }`}
          title="Chat with Polar Penguin Companion"
        >
          <div className="w-7 h-7 rounded-full bg-[#BAE6FD] flex items-center justify-center text-xs overflow-hidden border border-sky-300">
            <span>🐧</span>
          </div>
          <span className="text-xs font-bold tracking-tight pr-1">
            {isOpen ? 'Minimize Chat' : 'Polar Companion AI'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* Expanded Interactive Companion Chatbot Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[92vw] sm:w-[420px] max-h-[85vh] h-[640px] bg-white rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#F4F9FF] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#BAE6FD] flex items-center justify-center text-xs border border-sky-300">
                <span>🐧</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#17213A] tracking-tight">
                    POLAR COMPANION CHATBOT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Antarctic Research Guide · ISEA 44
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title={soundEnabled ? 'Mute Chirp Sound' : 'Enable Chirp Sound'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-sky-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Interactive Penguin Viewport */}
          <div className="h-44 sm:h-48 w-full relative bg-[#EBF4FC] flex-shrink-0 border-b border-sky-100 overflow-hidden">
            <InteractivePenguin
              key={penguinKey}
              className="w-full h-full"
              interactiveBubble={true}
              soundEnabled={soundEnabled}
              initialMessage={activeSpeech}
              onInteract={(msg) => setActiveSpeech(msg)}
            />
          </div>

          {/* Chat Messages Transcript Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAFD]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 items-start ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'penguin' && (
                  <div className="w-6 h-6 rounded-full bg-sky-200 border border-sky-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    🐧
                  </div>
                )}
                <div
                  className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-xs shadow-xs font-medium'
                      : 'bg-white text-slate-800 rounded-tl-xs border border-sky-100 shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Interactive Button to Jump or Re-Jump to the Component/Feature */}
                  {m.actionRoute && (
                    <button
                      onClick={() => {
                        if (m.actionRoute) navigateTo(m.actionRoute);
                      }}
                      className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17213A] hover:bg-[#25365e] text-white text-[11px] font-mono font-bold transition-all shadow-xs cursor-pointer border border-slate-700"
                    >
                      <span>🚀</span>
                      <span>{m.actionLabel || 'Go to Feature'}</span>
                      <ArrowRight className="w-3 h-3 text-sky-400" />
                    </button>
                  )}

                  <span
                    className={`block text-[9px] font-mono mt-1 ${
                      m.sender === 'user' ? 'text-sky-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-slate-500 font-mono pl-1">
                <span>🐧</span>
                <span className="animate-pulse">Penguin is thinking & chirping...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestion Chips for Station Switch & Deep Feature Navigation */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
            <button
              onClick={() => handleQuickPrompt('Change the station')}
              className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex-shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🔄</span>
              <span>Change Station</span>
            </button>
            <button
              onClick={() => handleQuickPrompt('Take me to anomaly')}
              className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 flex-shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>📍</span>
              <span>Go to Anomaly</span>
            </button>
            <button
              onClick={() => handleQuickPrompt('Take me to infrastructure')}
              className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-300 flex-shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🏗️</span>
              <span>Go to Infra</span>
            </button>
            <button
              onClick={() => handleQuickPrompt('Take me to generator')}
              className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 flex-shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>⚡</span>
              <span>Go to Generator</span>
            </button>
            <button
              onClick={() => handleQuickPrompt('Take me to 3d digital twin')}
              className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-300 flex-shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🌐</span>
              <span>3D Digital Twin</span>
            </button>
            <button
              onClick={() => handleQuickPrompt('Take me to what-if')}
              className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-300 flex-shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🔮</span>
              <span>What-If Simulator</span>
            </button>
            <button
              onClick={() => handleQuickPrompt('Take me to water treatment')}
              className="px-2.5 py-1 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[10px] font-bold border border-cyan-300 flex-shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>💧</span>
              <span>Water System</span>
            </button>
            <button
              onClick={() => handleQuickPrompt('Take me to research lab')}
              className="px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-300 flex-shrink-0 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>🧪</span>
              <span>Research Lab</span>
            </button>
            <button
              onClick={() => handleQuickPrompt("What's the weather today?")}
              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 flex-shrink-0 cursor-pointer transition-colors"
            >
              🌡️ Weather
            </button>
            <button
              onClick={() => handleQuickPrompt('Tell me a penguin joke')}
              className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-medium border border-rose-200 flex-shrink-0 cursor-pointer transition-colors"
            >
              🐟 Polar Joke
            </button>
          </div>

          {/* Chat Text Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. 'take me to infra', 'change station', 'go to generator'..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
