"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Beaker, Plus, Trash2, FlaskConical, 
  AlertTriangle, Droplets, Thermometer, Zap, 
  Settings, Layers, ClipboardList, RefreshCw, 
  Leaf, Sun, Wind, BarChart3, Calendar, 
  Waves, Home, RotateCw, Info, ArrowRight,
  Timer, Gauge, Activity, CheckCircle2, X, ChevronRight, Brain, FlaskRound
} from "lucide-react"

// --- CONSTANTES AGRONÓMICAS ---
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

export default function HydrocaruV5() {
  const [step, setStep] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [config, setConfig] = useState({
    vol: 18.0,
    temp: 22.5,
    ph: 6.0,
    ec_actual: 0.8,
    isPoniente: false,
    waterType: "blanda" as keyof typeof WATER_TYPES,
    month: new Date().getMonth() // 0-11
  })
  
  const [tower, setTower] = useState<any[]>(Array(15).fill(null))
  const [history, setHistory] = useState<any[]>([])

  // --- MOTOR DE INTELIGENCIA AGRONÓMICA ---
  const analysis = useMemo(() => {
    const activePlants = tower.filter(p => p !== null)
    const numPlants = activePlants.length
    
    // 1. Cálculo de EC Objetivo
    let targetEC = 1200 // Default en µS
    if (numPlants > 0) {
      const sumEC = activePlants.reduce((acc, p) => acc + p.ec[p.currentLevel - 1], 0)
      targetEC = (sumEC / numPlants) * 1000
    }
    if (config.isPoniente) targetEC *= 0.80 // Reducción por transpiración extrema

    // 2. Correcciones de Nutrientes
    const baseEC = WATER_TYPES[config.waterType].ec
    const currentEC_uS = config.ec_actual * 1000
    const netNeed = Math.max(0, targetEC - currentEC_uS)
    const doseAB = ((netNeed / 500) * config.vol / 2).toFixed(1)
    const calmag = (config.vol * 0.8 * WATER_TYPES[config.waterType].calmagFactor).toFixed(1)

    // 3. ALGORITMO DE RIEGO PROFESIONAL (Lana de Roca 2.5cm)
    // Factores: Mes (Calor), Poniente, Número de plantas
    const isSummer = config.month >= 5 && config.month <= 8
    let onTime = 2.0 // Minutos (Pulso corto para evitar saturación)
    let offTime = 40 // Minutos de descanso base

    if (isSummer) offTime -= 15
    if (config.isPoniente) offTime -= 10
    if (numPlants > 10) offTime -= 5 // Más plantas = más succión de agua
    if (config.temp > 27) offTime -= 10

    offTime = Math.max(offTime, 10) // Límite de seguridad

    // 4. Alertas
    const alerts = {
      ph: config.ph < 5.5 || config.ph > 6.5,
      temp: config.temp > 26,
      ec: currentEC_uS > (targetEC + 300)
    }

    return { targetEC, doseAB, calmag, onTime, offTime, alerts, numPlants }
  }, [config, tower])

  // --- ACCIONES ---
  const saveMeasurement = () => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
      ph: config.ph.toFixed(1),
      ec: config.ec_actual.toFixed(2),
      temp: config.temp.toFixed(1),
      vol: config.vol.toFixed(1)
    }
    setHistory([entry, ...history])
    setActiveTab("history")
  }

  const handleRotation = () => {
    const newTower = tower.map(plant => {
      if (!plant) return null
      if (plant.currentLevel >= 3) return null 
      return { ...plant, currentLevel: plant.currentLevel + 1 }
    })
    setTower(newTower)
  }

  // --- INTERFAZ DE PASOS INICIALES ---
  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-100">
            <Waves size={40}/>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter">HYDRO<span className="text-emerald-500">CARU</span></h1>
          <div className="grid gap-3">
            {Object.entries(WATER_TYPES).map(([key, val]) => (
              <button key={key} onClick={() => { setConfig({...config, waterType: key as any}); setStep(1); }}
                className="p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-slate-700">
                {val.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      <header className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50 p-6">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-emerald-400 p-2 rounded-xl font-black italic">HC</div>
            <h1 className="font-black text-slate-800 italic uppercase tracking-tighter">Hydrocaru <span className="text-emerald-500">V5</span></h1>
          </div>
          <div className="flex items-center gap-2">
            {analysis.alerts.ph || analysis.alerts.temp ? <AlertTriangle className="text-red-500 animate-pulse" size={20}/> : <CheckCircle2 className="text-emerald-500" size={20}/>}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 bg-white border-2 border-slate-100 rounded-[2rem] h-18 p-1.5 shadow-lg">
            <TabsTrigger value="dashboard" className="rounded-2xl py-3"><Home size={22}/></TabsTrigger>
            <TabsTrigger value="lab" className="rounded-2xl py-3"><FlaskRound size={22}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-2xl py-3"><Layers size={22}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-2xl py-3"><BarChart3 size={22}/></TabsTrigger>
            <TabsTrigger value="settings" className="rounded-2xl py-3"><Settings size={22}/></TabsTrigger>
          </TabsList>

          {/* --- PESTAÑA DASHBOARD: CORRECCIONES EN TIEMPO REAL --- */}
          <TabsContent value="dashboard" className="space-y-4 pt-4 animate-in fade-in duration-500">
            <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Dosis Correctora A+B</p>
                    <h2 className="text-7xl font-black italic tracking-tighter">{analysis.doseAB}<small className="text-xl font-bold opacity-30 ml-2 text-white">ml</small></h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">CalMag</p>
                    <h2 className="text-3xl font-black italic">{analysis.calmag}<small className="text-sm opacity-30 ml-1">ml</small></h2>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">EC Objetivo</p>
                    <p className="text-xl font-black">{analysis.targetEC} <span className="text-xs opacity-40">µS</span></p>
                  </div>
                  {config.ph > 6.2 && (
                    <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-xl border border-orange-500/30">
                      <p className="text-[9px] font-black uppercase">Añadir {((config.ph - 5.8) * config.vol * 0.15).toFixed(1)}ml pH-</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col items-center">
                <Timer className="text-blue-500 mb-2" size={24}/>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riego (ON)</p>
                <p className="text-2xl font-black text-slate-800">{analysis.onTime} min</p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col items-center">
                <RefreshCw className="text-emerald-500 mb-2" size={24}/>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descanso (OFF)</p>
                <p className="text-2xl font-black text-slate-800">{analysis.offTime} min</p>
              </div>
            </div>
          </TabsContent>

          {/* --- PESTAÑA LABORATORIO: ENTRADA DE DATOS PRECISOS --- */}
          <TabsContent value="lab" className="space-y-4 pt-4">
            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-xl space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-center text-slate-400 underline underline-offset-8 decoration-emerald-500">Ingreso de Parámetros Reales</h3>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase ml-2"><Droplets size={14}/> pH (Decimal)</label>
                  <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-emerald-100 transition-all outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase ml-2"><Activity size={14}/> EC (mS/cm)</label>
                  <input type="number" step="0.01" value={config.ec_actual} onChange={e => setConfig({...config, ec_actual: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-blue-100 transition-all outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase ml-2"><Thermometer size={14}/> Temp (°C)</label>
                  <input type="number" step="0.1" value={config.temp} onChange={e => setConfig({...config, temp: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-orange-100 transition-all outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase ml-2"><FlaskRound size={14}/> Vol (L)</label>
                  <input type="number" step="0.5" value={config.vol} onChange={e => setConfig({...config, vol: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-purple-100 transition-all outline-none" />
                </div>
              </div>

              <button onClick={saveMeasurement} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest italic flex items-center justify-center gap-3">
                <ClipboardList size={20}/> Registrar en Historial
              </button>
            </div>
          </TabsContent>

          {/* --- PESTAÑA TORRE --- */}
          <TabsContent value="tower" className="space-y-4 pt-4">
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase text-slate-400">Torre V15</h3>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{analysis.numPlants} / 15</span>
                </div>
                <button onClick={handleRotation} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 hover:bg-emerald-500 transition-all uppercase italic">
                  <RotateCw size={14}/> Ciclo Evolutivo
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {tower.map((plant, i) => (
                  <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all duration-300 ${plant ? `border-${plant.color}-500 bg-${plant.color}-50/30` : 'border-dashed border-slate-100 bg-slate-50'}`}>
                    {plant ? (
                      <>
                        <plant.icon size={20} className={`text-${plant.color}-500`}/>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3].map(l => <div key={l} className={`w-1 h-1 rounded-full ${plant.currentLevel >= l ? `bg-${plant.color}-500` : 'bg-slate-200'}`} />)}
                        </div>
                      </>
                    ) : <Plus size={14} className="text-slate-200"/>}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(VARIETIES).map(([key, v]) => (
                <button key={key} onClick={() => {
                  const idx = tower.findIndex(p => p === null);
                  if (idx !== -1) {
                    const n = [...tower];
                    n[idx] = { ...v, currentLevel: 1 };
                    setTower(n);
                  }
                }} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 hover:border-emerald-500 transition-all group">
                  <v.icon size={20} className={`text-${v.color}-500 group-hover:scale-110 transition-transform`}/>
                  <span className="text-[10px] font-black uppercase text-slate-600">{v.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* --- PESTAÑA HISTORIAL --- */}
          <TabsContent value="history" className="space-y-4 pt-4">
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden">
              <div className="p-6 bg-slate-50/50 border-b flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Log de Cultivo</h3>
                <span className="text-[10px] font-bold text-slate-400">{history.length} Entradas</span>
              </div>
              <div className="divide-y">
                {history.length === 0 ? (
                  <div className="p-12 text-center text-slate-300 italic text-sm font-medium">No hay mediciones registradas</div>
                ) : (
                  history.map(e => (
                    <div key={e.id} className="p-6 flex justify-between items-center group hover:bg-slate-50 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <Calendar size={12} className="text-slate-400"/>
                           <p className="text-[10px] font-black text-slate-400 uppercase">{e.date}</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                             <span className="text-[9px] font-bold text-emerald-600 uppercase">pH: </span>
                             <span className="text-xs font-black text-slate-700">{e.ph}</span>
                          </div>
                          <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                             <span className="text-[9px] font-bold text-blue-600 uppercase">EC: </span>
                             <span className="text-xs font-black text-slate-700">{e.ec}</span>
                          </div>
                          <div className="bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                             <span className="text-[9px] font-bold text-orange-600 uppercase">T: </span>
                             <span className="text-xs font-black text-slate-700">{e.temp}°</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setHistory(history.filter(h => h.id !== e.id))} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* --- PESTAÑA AJUSTES --- */}
          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-800 uppercase text-xs italic">Modo Poniente</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Castellón Weather System</p>
                </div>
                <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-14 h-8 rounded-full transition-all relative ${config.isPoniente ? 'bg-orange-500 shadow-lg shadow-orange-100' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.isPoniente ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div className="pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Protocolo de Riego: Invierno/Primavera</p>
                <div className="bg-slate-50 p-6 rounded-[2rem] text-xs text-slate-500 leading-relaxed italic border border-slate-100">
                  "En torres de lechuga con dados de 2.5cm, el objetivo es mantener una humedad de campo constante. Ciclos de 2 min garantizan que el agua recorra la torre sin saturar los poros de aire de la lana de roca. Entre riegos, el dado debe oxigenarse pero nunca llegar a secarse para evitar cristalización de sales (Burn)."
                </div>
              </div>
              <button onClick={() => setStep(0)} className="w-full py-4 text-[10px] font-black text-red-400 border-2 border-red-50 rounded-2xl hover:bg-red-50 transition-all uppercase italic tracking-[0.2em]">Hard Reset System</button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
