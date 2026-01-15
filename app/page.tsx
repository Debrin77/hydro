"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Beaker, Plus, Trash2, FlaskConical, 
  AlertTriangle, Droplets, Thermometer, Zap, 
  Settings, Layers, ClipboardList, RefreshCw, 
  Leaf, Sun, Wind, BarChart3, Calendar, 
  Waves, Home, RotateCw, Info, ArrowRight,
  Timer, Gauge, Activity, CheckCircle2, X, ChevronRight, Brain
} from "lucide-react"

// --- DATOS MAESTROS ---
const WATER_TYPES = {
  osmosis: { name: "Ósmosis", ec: 0.0, calmagFactor: 1.0 },
  blanda: { name: "Blanda (Castellón)", ec: 0.35, calmagFactor: 0.4 },
  dura: { name: "Grifo (Dura)", ec: 0.85, calmagFactor: 0.0 }
}

const VARIETIES = {
  romana: { name: "Romana", ec: [1.0, 1.4, 1.8], color: "emerald", icon: Leaf },
  roble: { name: "Hoja Roble", ec: [0.9, 1.5, 2.0], color: "red", icon: Sprout },
  lollo: { name: "Lollo Rosso", ec: [0.8, 1.3, 1.7], color: "purple", icon: Waves },
  maravilla: { name: "Maravilla", ec: [1.1, 1.6, 2.1], color: "green", icon: Sun },
  trocadero: { name: "Trocadero", ec: [0.8, 1.2, 1.7], color: "lime", icon: Droplets }
}

export default function HydrocaruPro() {
  const [step, setStep] = useState(0) 
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Estados para inputs (usamos strings para manejar decimales correctamente)
  const [inputPh, setInputPh] = useState("6.0")
  const [inputEc, setInputEc] = useState("0.8")
  const [inputTemp, setInputTemp] = useState("22.0")
  const [inputVol, setInputVol] = useState("18.0")
  
  const [config, setConfig] = useState({
    vol: 18.0,
    temp: 22.0,
    ph: 6.0,
    ec_actual: 0.8,
    isPoniente: false,
    waterType: "blanda" as keyof typeof WATER_TYPES,
    month: new Date().getMonth()
  })
  
  const [tower, setTower] = useState<any[]>(Array(15).fill(null))
  const [history, setHistory] = useState<any[]>([])

  // Sincronizar inputs con objeto de configuración al cambiar paso o registrar
  const syncConfig = () => {
    setConfig(prev => ({
      ...prev,
      ph: parseFloat(inputPh) || 0,
      ec_actual: parseFloat(inputEc) || 0,
      temp: parseFloat(inputTemp) || 0,
      vol: parseFloat(inputVol) || 0
    }))
  }

  // --- ALGORITMO DE RIEGO Y CÁLCULOS ---
  const analysis = useMemo(() => {
    const active = tower.filter(p => p !== null)
    let targetEC = 1.2 // mS/cm
    if (active.length > 0) {
      const sumEC = active.reduce((acc, p) => acc + p.ec[p.currentLevel - 1], 0)
      targetEC = sumEC / active.length
    }
    if (config.isPoniente) targetEC *= 0.85

    const baseEC = WATER_TYPES[config.waterType].ec
    const netECNeed = Math.max(0, targetEC - config.ec_actual)
    const doseAB = ((netECNeed * 1000 / 500) * config.vol / 2).toFixed(1)
    const calmag = (config.vol * 0.8 * WATER_TYPES[config.waterType].calmagFactor).toFixed(1)

    // LÓGICA DE RIEGO ESTACIONAL (Castellón) - Dados 2.5cm
    const isSummer = config.month >= 5 && config.month <= 8
    let onTime = 120 // Segundos (2 min)
    let offTime = 35 // Minutos descanso base
    
    if (isSummer) offTime -= 10
    if (config.isPoniente) offTime -= 10
    if (active.length > 10) offTime -= 5
    if (config.temp > 26) offTime -= 5
    
    offTime = Math.max(offTime, 12) // Seguridad de saturación

    return { 
      targetEC: targetEC.toFixed(2), 
      doseAB, 
      calmag, 
      onTime, 
      offTime,
      phCorrection: config.ph > 6.2 ? ((config.ph - 5.8) * config.vol * 0.15).toFixed(1) : "0"
    }
  }, [config, tower])

  const saveMeasurement = () => {
    syncConfig()
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      ph: inputPh,
      ec: inputEc,
      temp: inputTemp,
      vol: inputVol
    }
    setHistory([entry, ...history])
  }

  const handleRotation = () => {
    const newTower = tower.map(plant => {
      if (!plant) return null
      if (plant.currentLevel >= 3) return null 
      return { ...plant, currentLevel: plant.currentLevel + 1 }
    })
    setTower(newTower)
  }

  // --- PASOS DE INICIO LÓGICO ---

  if (step === 0) { // 1. AGUA
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">HYDRO<span className="text-emerald-500">CARU</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Paso 1: Origen del Agua</p>
          </div>
          <div className="grid gap-4">
            {Object.entries(WATER_TYPES).map(([key, val]) => (
              <button key={key} onClick={() => { setConfig({...config, waterType: key as any}); setStep(1); }}
                className="group p-6 bg-white rounded-[2rem] border-2 border-transparent hover:border-emerald-500 shadow-xl shadow-slate-200/50 transition-all text-left flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-800 text-lg uppercase italic">{val.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">EC Base: {val.ec} mS</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) { // 2. VALORES INICIALES
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-2">Paso 2: Laboratorio</p>
            <h2 className="text-2xl font-black text-slate-900 italic uppercase">Estado del Depósito</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "pH", val: inputPh, set: setInputPh, icon: Droplets, step: "0.1" },
              { label: "EC (mS)", val: inputEc, set: setInputEc, icon: Activity, step: "0.01" },
              { label: "Temp °C", val: inputTemp, set: setInputTemp, icon: Thermometer, step: "0.1" },
              { label: "Litros", val: inputVol, set: setInputVol, icon: FlaskConical, step: "0.5" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 focus-within:border-emerald-500 transition-all">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-3">
                  <item.icon size={12}/> {item.label}
                </label>
                <input 
                  type="text" 
                  value={item.val} 
                  onChange={(e) => item.set(e.target.value.replace(',', '.'))} 
                  className="w-full bg-transparent text-3xl font-black outline-none text-slate-800"
                />
              </div>
            ))}
          </div>
          <button onClick={() => { syncConfig(); setStep(2); }} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest italic flex items-center justify-center gap-3">
            Siguiente: Torre <ArrowRight size={20}/>
          </button>
        </div>
      </div>
    )
  }

  if (step === 2) { // 3. PLANTAS
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-[3rem] shadow-xl space-y-8 animate-in slide-in-from-right duration-500">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-2">Paso 3: Cultivo</p>
              <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Matriz de la Torre</h2>
            </div>
            <button onClick={() => setStep(3)} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-100 italic">Finalizar Setup</button>
          </div>
          <div className="grid grid-cols-5 gap-3 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            {tower.map((plant, i) => (
              <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all duration-300 ${plant ? `border-${plant.color}-500 bg-white shadow-sm` : 'border-dashed border-slate-200 bg-slate-100/50'}`}>
                {plant ? (
                  <>
                    <plant.icon size={20} className={`text-${plant.color}-500`}/>
                    <span className="text-[8px] font-black mt-1">L{plant.currentLevel}</span>
                  </>
                ) : <Plus size={14} className="text-slate-200"/>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(VARIETIES).map(([key, v]) => (
              <button key={key} onClick={() => {
                const idx = tower.findIndex(p => p === null);
                if (idx !== -1) {
                  const n = [...tower];
                  n[idx] = { ...v, currentLevel: 1 };
                  setTower(n);
                }
              }} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 hover:border-emerald-500 transition-all shadow-sm group">
                <v.icon size={18} className={`text-${v.color}-500`}/>
                <span className="text-[10px] font-black uppercase text-slate-600 italic tracking-tighter">{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- PASO 4: DASHBOARD PRINCIPAL ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans">
      <header className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50 p-6">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-emerald-400 p-2 rounded-xl font-black italic shadow-lg">HC</div>
            <h1 className="font-black text-slate-800 text-xl tracking-tighter italic">HYDROCARU <span className="text-emerald-500">PRO</span></h1>
          </div>
          <div className="flex gap-2">
            {config.isPoniente && <span className="bg-orange-500 text-white text-[9px] px-3 py-1 rounded-full font-black animate-pulse">PONIENTE ACTIVO</span>}
            <span className="bg-slate-100 text-slate-600 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-slate-200">{WATER_TYPES[config.waterType].name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 bg-white border-2 border-slate-100 rounded-[2rem] h-18 p-1.5 shadow-xl">
            <TabsTrigger value="dashboard" className="rounded-2xl py-3"><Home size={22}/></TabsTrigger>
            <TabsTrigger value="lab" className="rounded-2xl py-3"><Beaker size={22}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-2xl py-3"><Layers size={22}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-2xl py-3"><BarChart3 size={22}/></TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 pt-4 animate-in fade-in duration-500">
            {/* ALERTAS CRÍTICAS */}
            {(config.ph > 6.5 || config.ph < 5.5 || config.temp > 27) && (
              <div className="bg-red-500 text-white p-4 rounded-[1.5rem] flex items-center gap-4 shadow-lg shadow-red-100 animate-pulse">
                <AlertCircle className="shrink-0" size={24}/>
                <p className="text-[11px] font-black uppercase italic tracking-wider">Peligro: Parámetros fuera de rango. Revisa el Lab.</p>
              </div>
            )}

            <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 italic">Dosis Sugerida A+B</p>
                      <h2 className="text-7xl font-black italic tracking-tighter">{analysis.doseAB}<small className="text-xl font-bold opacity-30 ml-2">ml</small></h2>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 italic">CalMag</p>
                      <h2 className="text-3xl font-black italic tracking-tighter">{analysis.calmag}<small className="text-sm opacity-30 ml-1">ml</small></h2>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">EC Objetivo</p>
                    <p className="text-xl font-black italic">{analysis.targetEC} <span className="text-[10px] opacity-40">mS/cm</span></p>
                  </div>
                  {analysis.phCorrection !== "0" && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-right">
                      <p className="text-[9px] font-black text-emerald-400 uppercase">PH Down Requerido</p>
                      <p className="text-lg font-black italic">{analysis.phCorrection} ml</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Timer size={20}/></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Riego ON</p>
                </div>
                <p className="text-3xl font-black text-slate-800 italic">{analysis.onTime} <span className="text-sm text-slate-300">seg</span></p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><RefreshCw size={20}/></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Pausa OFF</p>
                </div>
                <p className="text-3xl font-black text-slate-800 italic">{analysis.offTime} <span className="text-sm text-slate-300">min</span></p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-4">
               <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Protocolo Agronómico Grodan</h4>
                  <Brain size={18} className="text-slate-200"/>
               </div>
               <p className="text-[11px] text-slate-500 leading-relaxed italic">
                En Castellón, la alta evaporación en lana de roca (2.5cm) exige riegos frecuentes pero de muy bajo volumen (2 min). Esto mantiene el ratio agua/oxígeno óptimo y evita la cristalización de sales en el núcleo del dado.
               </p>
            </div>
          </TabsContent>

          <TabsContent value="lab" className="space-y-4 pt-4">
            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-xl space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">pH Actual</label>
                  <input type="text" value={inputPh} onChange={e => setInputPh(e.target.value.replace(',', '.'))} className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-emerald-100 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">EC (mS)</label>
                  <input type="text" value={inputEc} onChange={e => setInputEc(e.target.value.replace(',', '.'))} className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-blue-100 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Temperatura</label>
                  <input type="text" value={inputTemp} onChange={e => setInputTemp(e.target.value.replace(',', '.'))} className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-orange-100 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Volumen (L)</label>
                  <input type="text" value={inputVol} onChange={e => setInputVol(e.target.value.replace(',', '.'))} className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-purple-100 transition-all outline-none" />
                </div>
              </div>
              <button onClick={saveMeasurement} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest italic flex items-center justify-center gap-3">
                <CheckCircle2 size={20}/> Actualizar y Guardar
              </button>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 space-y-4">
               <div className="flex justify-between items-center">
                  <p className="text-xs font-black text-slate-800 uppercase italic">Modo Poniente</p>
                  <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-14 h-8 rounded-full transition-all relative ${config.isPoniente ? 'bg-orange-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${config.isPoniente ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="tower" className="space-y-4 pt-4">
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black uppercase text-slate-400 italic tracking-[0.2em]">Torre Hydrocaru V15</h3>
                <button onClick={handleRotation} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 hover:bg-emerald-500 transition-all uppercase italic">
                  <RotateCw size={14}/> Rotación de Ciclo
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
                    ) : <Plus size={14} className="text-slate-300"/>}
                  </div>
                ))}
              </div>
            </div>
            {/* Selector de plantas para añadir */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(VARIETIES).map(([key, v]) => (
                <button key={key} onClick={() => {
                   const idx = tower.findIndex(p => p === null);
                   if (idx !== -1) {
                     const n = [...tower];
                     n[idx] = { ...v, currentLevel: 1 };
                     setTower(n);
                   }
                }} className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col items-center gap-2 hover:border-emerald-500 transition-all shadow-sm group">
                  <v.icon size={20} className={`text-${v.color}-500 group-hover:scale-110 transition-transform`}/>
                  <span className="text-[10px] font-black uppercase text-slate-600">{v.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pt-4">
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Historial de Laboratorio</h3>
                </div>
                <div className="divide-y">
                    {history.length === 0 ? (
                        <div className="p-16 text-center text-slate-300 italic text-sm font-medium uppercase tracking-widest opacity-50">Sin registros</div>
                    ) : (
                        history.map(e => (
                            <div key={e.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-all">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 italic uppercase">{e.date}</p>
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                          <p className="text-[8px] font-black text-emerald-500 uppercase">pH</p>
                                          <p className="text-sm font-black text-slate-700">{e.ph}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-[8px] font-black text-blue-500 uppercase">EC</p>
                                          <p className="text-sm font-black text-slate-700">{e.ec}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-[8px] font-black text-orange-500 uppercase">Temp</p>
                                          <p className="text-sm font-black text-slate-700">{e.temp}°</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-[8px] font-black text-purple-500 uppercase">Vol</p>
                                          <p className="text-sm font-black text-slate-700">{e.vol}L</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setHistory(history.filter(h => h.id !== e.id))} className="p-4 text-slate-300 hover:text-red-500 transition-all">
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
