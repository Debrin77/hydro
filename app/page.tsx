"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Beaker, Plus, Trash2, FlaskConical, 
  AlertTriangle, Droplets, Thermometer, Zap, 
  Settings, Layers, ClipboardList, RefreshCw, 
  Leaf, Sun, Wind, BarChart3, Calendar, 
  Waves, Home, RotateCw, Info, ArrowRight,
  Timer, Gauge, Activity, CheckCircle2, X, ChevronRight, Brain
} from "lucide-react"

// --- CONFIGURACIÓN TÉCNICA ---
const WATER_TYPES = {
  osmosis: { name: "Ósmosis", ec: 0, calmagFactor: 1 },
  blanda: { name: "Blanda (Castellón)", ec: 350, calmagFactor: 0.4 },
  dura: { name: "Grifo (Dura)", ec: 850, calmagFactor: 0 }
}

const VARIETIES = {
  romana: { name: "Romana", ec: [1.0, 1.4, 1.8], color: "emerald", icon: Leaf },
  roble: { name: "Hoja Roble", ec: [0.9, 1.5, 2.0], color: "red", icon: Sprout },
  lollo: { name: "Lollo Rosso", ec: [0.8, 1.3, 1.7], color: "purple", icon: Waves },
  maravilla: { name: "Maravilla", ec: [1.1, 1.6, 2.1], color: "green", icon: Sun },
  trocadero: { name: "Trocadero", ec: [0.8, 1.2, 1.7], color: "lime", icon: Droplets }
}

export default function HydrocaruSystem() {
  const [step, setStep] = useState(0) // 0: Agua, 1: Plantas, 2: Medición, 3: Dashboard
  const [activeTab, setActiveTab] = useState("dashboard")
  const [config, setConfig] = useState({
    vol: 18,
    temp: 24,
    ph: 6.0,
    isPoniente: false,
    waterType: "blanda" as keyof typeof WATER_TYPES
  })
  
  const [tower, setTower] = useState<any[]>(Array(15).fill(null))
  const [history, setHistory] = useState<any[]>([])

  // --- MOTOR DE CÁLCULO ---
  const analysis = useMemo(() => {
    const active = tower.filter(p => p !== null)
    let targetEC = 1200
    if (active.length > 0) {
      const sumEC = active.reduce((acc, p) => acc + p.ec[p.currentLevel - 1], 0)
      targetEC = (sumEC / active.length) * 1000
    }
    
    // Compensación ambiental Castellón
    if (config.isPoniente) targetEC *= 0.85

    const baseEC = WATER_TYPES[config.waterType].ec
    const netEC = Math.max(0, targetEC - baseEC)
    const dose = ((netEC / 500) * config.vol / 2).toFixed(1)
    
    // CalMag adaptativo: Ósmosis requiere 100%, Blanda solo refuerzo, Dura 0%
    const calmag = (config.vol * 0.8 * WATER_TYPES[config.waterType].calmagFactor).toFixed(1)

    // RIEGO PROFESIONAL CASTELLÓN (Lana de Roca Grodan 2.5cm)
    // Evita la anoxia (falta de O2) y la acumulación de sales por evaporación
    let onTime = 3 // Minutos ON estándar
    let offTime = 30 // Descanso estándar
    
    if (config.temp > 26) offTime = 20
    if (config.isPoniente) {
        offTime = 12 // Aumento de frecuencia por sequedad extrema del aire
        onTime = 2   // Pulso más corto para evitar lavado excesivo
    }

    return { 
        targetEC: Math.round(targetEC), 
        dose, 
        calmag, 
        onTime, 
        offTime,
        phCorrection: config.ph > 6.2 ? ((config.ph - 5.8) * config.vol * 0.15).toFixed(1) : "0"
    }
  }, [config, tower])

  // --- GESTIÓN DE TORRE ---
  const handleRotation = () => {
    const newTower = tower.map(plant => {
      if (!plant) return null
      if (plant.currentLevel >= 3) return null // Cosecha
      return { ...plant, currentLevel: plant.currentLevel + 1 } // Evoluciona nivel
    })
    setTower(newTower)
  }

  const addPlant = (key: string) => {
    const idx = tower.findIndex(p => p === null)
    if (idx !== -1) {
      const newTower = [...tower]
      newTower[idx] = { ...VARIETIES[key as keyof typeof VARIETIES], currentLevel: 1 }
      setTower(newTower)
    }
  }

  const saveMeasurement = () => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      ph: config.ph,
      temp: config.temp,
      vol: config.vol,
      ec: analysis.targetEC
    }
    setHistory([entry, ...history])
  }

  // --- COMPONENTES DE CONFIGURACIÓN ---
  if (step === 0) { // Selección de Agua
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-100 text-white">
              <Waves size={32}/>
            </div>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase text-slate-800">HYDRO<span className="text-emerald-500 text-4xl">CARU</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 font-mono">Select Water Genesis</p>
          </div>
          <div className="grid gap-3">
            {Object.entries(WATER_TYPES).map(([key, val]) => (
              <button key={key} onClick={() => { setConfig({...config, waterType: key as any}); setStep(1); }}
                className="p-6 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex justify-between items-center group">
                <div>
                  <p className="font-bold text-slate-800">{val.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">EC BASE: {val.ec} µS</p>
                </div>
                <ChevronRight className="text-slate-200 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) { // Selección de Plantas
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-[3rem] shadow-xl space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800 italic uppercase">Setup Torre V15</h2>
            <button onClick={() => setStep(2)} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-100">Configurar Valores</button>
          </div>
          <div className="grid grid-cols-5 gap-3 p-4 bg-slate-50 rounded-[2.5rem]">
            {tower.map((plant, i) => (
              <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all ${plant ? `border-${plant.color}-500 bg-white shadow-sm` : 'border-dashed border-slate-200 bg-slate-100/50'}`}>
                {plant ? (
                  <>
                    <plant.icon size={20} className={`text-${plant.color}-500`}/>
                    <span className="text-[8px] font-black mt-1">L{plant.currentLevel}</span>
                    <button onClick={() => { const n = [...tower]; n[i] = null; setTower(n); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={8}/></button>
                  </>
                ) : <Plus size={14} className="text-slate-300"/>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(VARIETIES).map(([key, v]) => (
              <button key={key} onClick={() => addPlant(key)} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-2 hover:border-emerald-500 transition-all group shadow-sm">
                <v.icon size={16} className={`text-${v.color}-500`}/>
                <span className="text-[10px] font-bold uppercase text-slate-600 tracking-tighter">{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) { // Primera Medición
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-10">
          <h2 className="text-center font-black text-2xl italic uppercase text-slate-800 tracking-tighter underline decoration-emerald-500 decoration-4 underline-offset-8">Calibración de Sensores</h2>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">pH actual del depósito</label>
              <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: parseFloat(e.target.value)})} className="w-full p-8 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 text-4xl font-black text-center focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Temperatura del agua (°C)</label>
              <input type="number" value={config.temp} onChange={e => setConfig({...config, temp: parseFloat(e.target.value)})} className="w-full p-8 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 text-4xl font-black text-center focus:border-emerald-500 outline-none transition-all" />
            </div>
          </div>
          <button onClick={() => setStep(3)} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-emerald-600 transition-all uppercase tracking-[0.2em] italic">Iniciar Control Hydrocaru</button>
        </div>
      </div>
    )
  }

  // --- VISTA PRINCIPAL (HYDROCARU DASHBOARD) ---
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 p-6">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center font-black italic shadow-lg">HC</div>
            <h1 className="font-black text-slate-800 text-xl tracking-tighter italic">HYDROCARU <span className="text-emerald-500 not-italic">V4</span></h1>
          </div>
          <div className="flex gap-2 font-mono text-[10px] font-bold">
            <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg border border-emerald-200 uppercase">{WATER_TYPES[config.waterType].name}</span>
            {config.isPoniente && <span className="bg-orange-500 text-white px-3 py-1 rounded-lg animate-pulse">PONIENTE</span>}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 bg-white border rounded-[2rem] h-16 p-1.5 shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-[1.5rem]"><Home size={20}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-[1.5rem]"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-[1.5rem]"><BarChart3 size={20}/></TabsTrigger>
            <TabsTrigger value="manual" className="rounded-[1.5rem]"><ClipboardList size={20}/></TabsTrigger>
            <TabsTrigger value="settings" className="rounded-[1.5rem]"><Settings size={20}/></TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 pt-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-[2.5rem] bg-white border-2 transition-all ${config.ph > 6.2 ? 'border-orange-200' : 'border-transparent shadow-sm'}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">pH Balance</p>
                <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: parseFloat(e.target.value)})} className="text-4xl font-black w-full bg-transparent outline-none focus:text-emerald-500" />
                {config.ph > 6.2 && <p className="text-[9px] font-black text-orange-600 mt-2">AÑADIR {analysis.phCorrection}ml PH-</p>}
              </div>
              <div className={`p-6 rounded-[2.5rem] bg-white border-2 transition-all ${config.temp > 26 ? 'border-red-200' : 'border-transparent shadow-sm'}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Temperatura</p>
                <input type="number" value={config.temp} onChange={e => setConfig({...config, temp: parseFloat(e.target.value)})} className="text-4xl font-black w-full bg-transparent outline-none focus:text-emerald-500" />
                {config.temp > 26 && <p className="text-[9px] font-black text-red-500 mt-2">CALOR CRÍTICO</p>}
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
               <FlaskConical size={140} className="absolute -right-10 -bottom-10 opacity-5 group-hover:rotate-12 transition-all duration-700"/>
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Mezcla Nutrientes Hydrocaru</p>
               <div className="grid grid-cols-2 gap-8 relative z-10">
                  <div>
                    <h3 className="text-6xl font-black italic tracking-tighter text-white">{analysis.dose}<small className="text-sm ml-1 uppercase font-bold text-slate-500">ml</small></h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Canna Aqua A+B (x2)</p>
                  </div>
                  <div>
                    <h3 className="text-6xl font-black italic tracking-tighter text-blue-400">{analysis.calmag}<small className="text-sm ml-1 uppercase font-bold text-slate-500">ml</small></h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">CalMag Agent</p>
                  </div>
               </div>
               <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-500 uppercase">EC Objetivo: {analysis.targetEC} µS</span>
                  <button onClick={saveMeasurement} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all">Registrar Lectura</button>
               </div>
            </div>

            <div className="bg-white border p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-800 border-2 border-slate-100 shadow-inner">
                  <Timer size={28}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Frecuencia Riego Grodan</p>
                  <p className="text-xl font-black text-slate-800 uppercase italic">{analysis.onTime}m ON / {analysis.offTime}m OFF</p>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl">
                <p className="text-[8px] font-black text-emerald-600 uppercase">Optimized</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tower" className="space-y-4 pt-4 animate-in fade-in">
            <div className="bg-white border p-8 rounded-[3rem] shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">V15 Tower Matrix</h3>
                <button onClick={handleRotation} className="bg-slate-900 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black flex items-center gap-2 transition-all shadow-xl active:scale-95 uppercase italic">
                  <RotateCw size={14}/> Rotar y Subir Nivel
                </button>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {tower.map((plant, i) => (
                  <div key={i} className={`aspect-square rounded-[1.5rem] border-2 flex flex-col items-center justify-center relative transition-all duration-500 ${plant ? `border-${plant.color}-500 bg-${plant.color}-50/30` : 'border-dashed border-slate-100 bg-slate-50/50'}`}>
                    {plant ? (
                      <>
                        <plant.icon size={22} className={`text-${plant.color}-500 mb-1`}/>
                        <div className="flex gap-0.5">
                          {[1,2,3].map(l => (
                            <div key={l} className={`w-1 h-1 rounded-full ${plant.currentLevel >= l ? `bg-${plant.color}-500` : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <span className="text-[8px] font-black uppercase mt-1 opacity-40">L{plant.currentLevel}</span>
                      </>
                    ) : <Plus size={14} className="text-slate-200"/>}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {Object.entries(VARIETIES).map(([key, v]) => (
                  <button key={key} onClick={() => addPlant(key)} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3 hover:border-emerald-500 transition-all shadow-sm group">
                    <div className={`p-2 rounded-xl bg-${v.color}-50 text-${v.color}-500 group-hover:bg-${v.color}-500 group-hover:text-white transition-all`}>
                        <v.icon size={18}/>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">{v.name}</span>
                  </button>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pt-4">
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Log de Mediciones</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {history.length === 0 ? (
                        <div className="p-16 text-center text-slate-200"><Calendar size={48} className="mx-auto mb-2 opacity-20"/><p className="text-[10px] font-black uppercase tracking-widest">Sin registros</p></div>
                    ) : (
                        history.map(e => (
                            <div key={e.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-all group">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 font-mono italic">{e.date}</p>
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-1 font-mono"><Droplets size={12} className="text-blue-400"/><span className="text-xs font-black">{e.ph}</span></div>
                                        <div className="flex items-center gap-1 font-mono"><Thermometer size={12} className="text-orange-400"/><span className="text-xs font-black">{e.temp}°</span></div>
                                        <div className="flex items-center gap-1 font-mono"><Activity size={12} className="text-emerald-400"/><span className="text-xs font-black">{e.ec}µS</span></div>
                                    </div>
                                </div>
                                <button onClick={() => deleteEntry(e.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18}/></button>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 pt-4 animate-in fade-in">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex gap-5">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><Brain size={28}/></div>
                  <div>
                    <h4 className="font-black text-slate-800 mb-2 uppercase text-xs tracking-widest italic underline decoration-emerald-200 underline-offset-4">Estrategia de Oxigenación Radicular</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      En torres V15, el exceso de riego compacta la micro-estructura de la lana de roca, expulsando el **O2**. 
                      <span className="block mt-2 font-black text-slate-800 italic uppercase text-[10px]">✓ Regla de Oro:</span> 
                      El dado nunca debe chorrear continuamente. Busca el "punto de esponja": húmedo al tacto pero con poros de aire libres para evitar el *Pythium*.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 pt-6 border-t border-slate-100">
                  <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><Wind size={28}/></div>
                  <div>
                    <h4 className="font-black text-slate-800 mb-2 uppercase text-xs tracking-widest italic underline decoration-orange-200 underline-offset-4">Gestión de Poniente y VPD</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      El Poniente desploma la humedad por debajo del 30%. La lechuga cierra estomas y deja de absorber nutrientes, pero sigue evaporando agua (estrés hídrico).
                      <span className="block mt-2 font-black text-slate-800 italic uppercase text-[10px]">✓ Acción:</span> 
                      Bajar la EC es vital porque la planta beberá más volumen; si la EC es alta, las sales concentran en las puntas causando "Tip Burn".
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 pt-6 border-t border-slate-100">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><FlaskConical size={28}/></div>
                  <div>
                    <h4 className="font-black text-slate-800 mb-2 uppercase text-xs tracking-widest italic underline decoration-blue-200 underline-offset-4">Dinámica del pH en Circuito Cerrado</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      No corrijas a 5.5 si estás en 6.1. Deja que oscile entre **5.8 y 6.2**. Esta "deriva controlada" permite que la planta absorba diferentes micro-elementos móviles en rangos específicos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4 animate-in fade-in">
            <div className="bg-white border p-8 rounded-[3rem] shadow-sm space-y-10">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner"><Wind/></div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase italic">Modo Poniente Castellón</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Control de Transpiración</p>
                    </div>
                  </div>
                  <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-14 h-8 rounded-full transition-all relative ${config.isPoniente ? 'bg-orange-500 shadow-lg shadow-orange-100' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.isPoniente ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
               
               <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Volumen Tanque</label>
                    <span className="text-2xl font-black text-slate-800 italic">{config.vol}L</span>
                  </div>
                  <input type="range" min="5" max="30" value={config.vol} onChange={e => setConfig({...config, vol: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none accent-emerald-500" />
               </div>

               <button onClick={() => window.location.reload()} className="w-full py-4 text-[10px] font-black text-red-400 border border-red-50 rounded-2xl hover:bg-red-50 transition-all uppercase tracking-[0.3em] italic">Reset Factory Data</button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* FOOTER NAVBAR INDUSTRIAL */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-3 z-50">
        <div className="max-w-xl mx-auto flex justify-around items-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Hydrocaru V4 • Protocolo Castellón de la Plana • 2026</p>
        </div>
      </footer>
    </div>
  )
}
