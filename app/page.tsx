"use client"

import React, { useState, useMemo } from "react"
import { 
  Sprout, Beaker, Plus, Trash2, Lightbulb, 
  Zap, ChevronRight, Home, Settings, Layers, 
  Wind, Timer, ClipboardList, FlaskConical, 
  RefreshCw, Check, Brain, ArrowRight, Waves
} from "lucide-react"

// --- CONFIGURACIÓN TÉCNICA RECUPERADA ---
const WATER_TYPES = {
  "osmosis": { name: "Ósmosis Inversa", ecBase: 0, desc: "Pura. Requiere CalMag y estabilización." },
  "blanda": { name: "Mezcla Blanda", ecBase: 350, desc: "Óptima para Castellón (Mezcla 50/50)." },
  "dura": { name: "Grifo Castellón", ecBase: 900, desc: "Muy dura. Alto riesgo de bloqueos." }
}

const VARIETIES = {
  "Romana": { name: "Lechuga Romana", ec: [0.8, 1.4, 1.8], color: "bg-emerald-500" },
  "Hoja Roble": { name: "Hoja de Roble", ec: [0.9, 1.5, 2.0], color: "bg-red-500" },
  "Lollo Rosso": { name: "Lollo Rosso", ec: [0.8, 1.3, 1.7], color: "bg-purple-500" },
  "Escarola": { name: "Escarola", ec: [1.0, 1.6, 2.1], color: "bg-green-400" }
}

export default function HydroMasterSystem() {
  // ESTADOS DE INICIO Y NAVEGACIÓN
  const [step, setStep] = useState(0) // 0: Inicio, 1: Agua, 2: Plantas, 3: Dashboard
  const [tab, setTab] = useState("dashboard")
  
  // CONFIGURACIÓN DE USUARIO
  const [config, setConfig] = useState({
    waterType: "osmosis",
    vol: 18,
    temp: 24,
    isPoniente: false,
    phActual: 6.0
  })

  // GESTIÓN DE LAS 15 PLANTAS
  const [tower, setTower] = useState<any[]>(Array(15).fill(null))
  const [history, setHistory] = useState<any[]>([])

  // --- MOTOR DE CÁLCULO ---
  const analysis = useMemo(() => {
    const activePlants = tower.filter(p => p !== null)
    if (activePlants.length === 0) return null

    let totalEC = 0
    activePlants.forEach(p => {
      totalEC += p.ec[p.level - 1]
    })
    
    let targetEC = (totalEC / activePlants.length) * 1000
    if (config.isPoniente || config.temp > 26) targetEC *= 0.85 // Factor Castellón

    const waterBase = WATER_TYPES[config.waterType as keyof typeof WATER_TYPES].ecBase
    const netEC = Math.max(0, targetEC - waterBase)
    const dose = (netEC / 500) * config.vol // Ratio Canna Aqua

    return {
      targetEC: Math.round(targetEC),
      doseA: (dose / 2).toFixed(1),
      doseB: (dose / 2).toFixed(1),
      calmag: config.waterType === "osmosis" ? (config.vol * 0.8).toFixed(1) : "0",
      irrigation: config.temp > 25 ? "15m ON / 20m OFF" : "15m ON / 45m OFF",
      phRisk: config.waterType === "osmosis" ? "Inestable" : "Estable"
    }
  }, [tower, config])

  // --- ACCIONES ---
  const placePlant = (index: number, varietyKey: string) => {
    const newTower = [...tower]
    newTower[index] = { ...VARIETIES[varietyKey as keyof typeof VARIETIES], level: 1 }
    setTower(newTower)
  }

  const cycleLevel = (index: number) => {
    if (!tower[index]) return
    const newTower = [...tower]
    newTower[index].level = (newTower[index].level % 3) + 1
    setTower(newTower)
  }

  // --- INTERFAZ DE INICIO (SETUP) ---
  if (step < 3) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
              <Sprout size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">System<span className="text-emerald-500">V15</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Configuración Inicial</p>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-sm font-black uppercase mb-4 text-emerald-400">Tipo de Agua Base</h3>
                <div className="space-y-2">
                  {Object.entries(WATER_TYPES).map(([key, val]) => (
                    <button key={key} onClick={() => setConfig({...config, waterType: key})} 
                      className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${config.waterType === key ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900'}`}>
                      <p className="font-bold text-sm">{val.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{val.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(1)} className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2">
                CONTINUAR <ArrowRight size={18}/>
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-sm font-black uppercase mb-4 text-emerald-400">Volumen del Depósito</h3>
                <input type="range" min="5" max="25" value={config.vol} onChange={(e) => setConfig({...config, vol: parseInt(e.target.value)})} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                <div className="flex justify-between mt-4 text-2xl font-black">
                  <span>{config.vol} <small className="text-xs text-slate-500">LITROS</small></span>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2">
                CONFIGURAR TORRE <ArrowRight size={18}/>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-400">Has configurado {config.vol}L con agua {config.waterType}.</p>
              <button onClick={() => setStep(3)} className="w-full bg-emerald-500 text-white font-black py-6 rounded-2xl text-xl shadow-xl shadow-emerald-500/20">
                INICIAR PANEL DE CONTROL
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- PANEL PRINCIPAL (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Layers size={18}/></div>
            <span className="font-black text-lg tracking-tighter uppercase italic">Control<span className="text-emerald-600">V15</span></span>
          </div>
          <div className="flex gap-2">
            {config.isPoniente && <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-full animate-pulse">PONIENTE</span>}
            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">{config.vol}L</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        
        {/* PESTAÑA: RESUMEN (DASHBOARD) */}
        {tab === "dashboard" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">EC Objetivo</p>
                <p className="text-4xl font-black text-emerald-400">{analysis?.targetEC || 0}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">µS/cm Compensada</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dosis CANNA</p>
                <p className="text-3xl font-black text-blue-600">{analysis?.doseA || 0} <small className="text-xs">ml</small></p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">De cada parte (A+B)</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Waves size={24}/></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Ciclo de Riego</p>
                  <p className="text-md font-black italic">{analysis?.irrigation || 'Pendiente de plantas'}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">pH</p>
                 <p className="text-sm font-black text-emerald-600 uppercase">{analysis?.phRisk}</p>
              </div>
            </div>

            {analysis?.calmag !== "0" && (
              <div className="bg-blue-600 text-white p-4 rounded-2xl flex items-center gap-3">
                <FlaskConical size={20}/>
                <p className="text-xs font-bold uppercase tracking-tight text-blue-50">Añadir {analysis?.calmag}ml de CalMag antes de los nutrientes</p>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: TORRE (GESTIÓN DE 15 PLANTAS) */}
        {tab === "tower" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
                <Layers size={16} className="text-emerald-600"/> Matriz de Ocupación
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {tower.map((plant, i) => (
                  <div key={i} onClick={() => cycleLevel(i)} className={`aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative cursor-pointer ${plant ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-slate-200 bg-slate-50'}`}>
                    {plant ? (
                      <>
                        <span className="text-[10px] font-black">{plant.name[0]}</span>
                        <div className="absolute bottom-1 w-2/3 h-1 bg-emerald-200 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-600" style={{width: `${(plant.level/3)*100}%`}}></div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); const n = [...tower]; n[i]=null; setTower(n); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                          <XIcon size={10}/>
                        </button>
                      </>
                    ) : <Plus size={14} className="text-slate-300"/>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-3xl">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Seleccionar Variedad para Huecos Vacíos</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(VARIETIES).map(key => (
                  <button key={key} onClick={() => {
                    const firstEmpty = tower.findIndex(p => p === null);
                    if (firstEmpty !== -1) placePlant(firstEmpty, key);
                  }} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase hover:bg-slate-100 transition-all">
                    + {VARIETIES[key as keyof typeof VARIETIES].name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: PROTOCOLOS */}
        {tab === "tips" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white border-l-4 border-emerald-500 p-5 rounded-r-3xl shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-emerald-600 mb-2">Protocolo Lana de Roca</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                Lavar raíces con agua a 22°C. Insertar en dado Grodan 2.5cm pre-estabilizado a pH 5.5. No sumergir la corona de la raíz.
              </p>
            </div>
            <div className="bg-slate-900 border-l-4 border-orange-500 p-5 rounded-r-3xl shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-orange-400 mb-2 flex items-center gap-1"><Wind size={12}/> Castellón: Poniente</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">
                En días de Poniente, la planta transpira más. El sistema baja la EC automáticamente para evitar quemar las puntas por exceso de sales.
              </p>
            </div>
          </div>
        )}

        {/* PESTAÑA: AJUSTES */}
        {tab === "settings" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-black uppercase">Modo Poniente</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Compensación por viento seco</p>
                </div>
                <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-12 h-6 rounded-full transition-all relative ${config.isPoniente ? 'bg-orange-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isPoniente ? 'right-1' : 'left-1'}`} />
                </button>
             </div>
             
             <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>Temperatura Agua</span>
                  <span className="text-slate-900">{config.temp}°C</span>
                </div>
                <input type="range" min="15" max="32" value={config.temp} onChange={(e) => setConfig({...config, temp: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
             </div>

             <button onClick={() => setStep(0)} className="w-full py-4 text-red-500 text-[10px] font-black uppercase border border-red-100 rounded-2xl hover:bg-red-50 transition-all mt-4">
                Reiniciar Configuración Inicial
             </button>
          </div>
        )}

      </main>

      {/* NAVBAR INFERIOR */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-2 z-50">
        <div className="max-w-xl mx-auto grid grid-cols-4 gap-1">
          <NavBtn id="dashboard" icon={<Home size={20}/>} label="Panel" active={tab} set={setTab} />
          <NavBtn id="tower" icon={<Layers size={20}/>} label="Torre" active={tab} set={setTab} />
          <NavBtn id="tips" icon={<Brain size={20}/>} label="Manual" active={tab} set={setTab} />
          <NavBtn id="settings" icon={<Settings size={20}/>} label="Ajustes" active={tab} set={setTab} />
        </div>
      </footer>
    </div>
  )
}

function NavBtn({id, icon, label, active, set}: any) {
  const isActive = active === id
  return (
    <button onClick={() => set(id)} className={`flex flex-col items-center py-2 rounded-xl transition-all ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-600'}`}>
      {icon}
      <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{label}</span>
    </button>
  )
}

function XIcon({size}: {size: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
}
