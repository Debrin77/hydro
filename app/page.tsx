"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Beaker, Plus, Trash2, FlaskConical, 
  AlertTriangle, Droplets, Thermometer, Zap, 
  Settings, Layers, ClipboardList, RefreshCw, 
  Leaf, Sun, Wind, BarChart3, Calendar, 
  Waves, Brain, Home, RotateCw, Info, ArrowRight,
  Timer, Gauge, Activity, CheckCircle2
} from "lucide-react"

// --- LÓGICA TÉCNICA RECUPERADA ---
const WATER_TYPES = {
  osmosis: { name: "Ósmosis Inversa", ec: 0, desc: "Requiere CalMag", color: "text-blue-500" },
  blanda: { name: "Blanda (Mezcla)", ec: 350, desc: "Ideal Castellón", color: "text-emerald-500" },
  dura: { name: "Grifo Directo", ec: 850, desc: "Riesgo Cal", color: "text-orange-500" }
}

const VARIETIES = {
  romana: { name: "Romana", ec: [1.0, 1.4, 1.8], color: "emerald", icon: Leaf },
  roble: { name: "Hoja Roble", ec: [0.9, 1.5, 2.0], color: "red", icon: Sprout },
  lollo: { name: "Lollo Rosso", ec: [0.8, 1.3, 1.7], color: "purple", icon: Waves },
  maravilla: { name: "Maravilla", ec: [1.1, 1.6, 2.1], color: "green", icon: Sun },
  trocadero: { name: "Trocadero", ec: [0.8, 1.2, 1.7], color: "lime", icon: Droplets }
}

const LEVELS = [
  { id: 1, name: "Plántula", desc: "EC Baja / Riego Frecuente" },
  { id: 2, name: "Crecimiento", desc: "EC Media / Desarrollo" },
  { id: 3, name: "Maduración", desc: "EC Alta / Cosecha" }
]

export default function HydroMasterModern() {
  const [step, setStep] = useState(0)
  const [tab, setTab] = useState("dashboard")
  const [config, setConfig] = useState({
    vol: 18,
    temp: 24,
    ph: 6.0,
    isPoniente: false,
    waterType: "blanda" as keyof typeof WATER_TYPES
  })
  const [tower, setTower] = useState<any[]>(Array(15).fill(null))

  // --- MOTOR DE CÁLCULO DE PRECISIÓN ---
  const analysis = useMemo(() => {
    const active = tower.filter(p => p !== null)
    
    // 1. Cálculo de EC Objetivo basado en mezcla de variedades y sus niveles
    let targetEC = 1200
    if (active.length > 0) {
      const sumEC = active.reduce((acc, p) => acc + p.ec[p.currentLevel - 1], 0)
      targetEC = (sumEC / active.length) * 1000
    }
    
    // 2. Compensaciones Ambientales (Castellón)
    if (config.isPoniente) targetEC *= 0.85
    if (config.temp > 27) targetEC *= 0.9

    // 3. Dosificación CANNA Aqua (A+B)
    const baseEC = WATER_TYPES[config.waterType].ec
    const netEC = Math.max(0, targetEC - baseEC)
    const totalDose = (netEC / 500) * config.vol
    
    // 4. Cálculo de Riego (Tiempos basados en transpiración)
    let offTime = 45 
    if (config.temp > 26) offTime = 30
    if (config.isPoniente) offTime = 15 // En poniente riego casi constante
    
    return {
      targetEC: Math.round(targetEC),
      dose: (totalDose / 2).toFixed(1),
      calmag: config.waterType !== "dura" ? (config.vol * 0.8).toFixed(1) : "0",
      irrigation: { on: 15, off: offTime },
      phCorrection: config.ph > 6.2 ? ((config.ph - 5.8) * config.vol * 0.15).toFixed(1) : "0"
    }
  }, [config, tower])

  // --- ACCIONES DE LA TORRE ---
  const addPlant = (key: string) => {
    const idx = tower.findIndex(p => p === null)
    if (idx !== -1) {
      const newTower = [...tower]
      newTower[idx] = { ...VARIETIES[key as keyof typeof VARIETIES], currentLevel: 1 }
      setTower(newTower)
    }
  }

  const cycleLevel = (idx: number) => {
    if (!tower[idx]) return
    const newTower = [...tower]
    newTower[idx].currentLevel = (newTower[idx].currentLevel % 3) + 1
    setTower(newTower)
  }

  const rotateTower = () => {
    const newTower = [...tower]
    newTower.unshift(newTower.pop())
    setTower(newTower)
  }

  // --- VISTA DE CONFIGURACIÓN INICIAL ---
  if (step === 0) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200">
              <Sprout className="text-white" size={32}/>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Hydro<span className="text-emerald-500">V15</span></h1>
            <p className="text-slate-500 text-sm mt-2">Configura tu sistema de cultivo</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(WATER_TYPES).map(([key, val]) => (
              <button key={key} onClick={() => setConfig({...config, waterType: key as any})}
                className={`p-5 rounded-3xl border-2 text-left transition-all flex justify-between items-center ${config.waterType === key ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}>
                <div>
                  <p className="font-bold text-slate-800">{val.name}</p>
                  <p className="text-xs text-slate-500 uppercase font-semibold">{val.desc}</p>
                </div>
                {config.waterType === key && <CheckCircle2 className="text-emerald-500" size={20}/>}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="w-full bg-slate-900 text-white font-bold py-5 rounded-3xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
            Comenzar Cultivo <ArrowRight size={20}/>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* NAVBAR SUPERIOR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 p-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold">V15</div>
            <h2 className="font-bold text-slate-800 tracking-tight text-lg">Panel de Control</h2>
          </div>
          <div className="flex gap-2">
            {config.isPoniente && <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full border border-orange-200 animate-pulse">PONIENTE</span>}
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">{config.vol}L</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="dashboard" onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-5 bg-white border border-slate-200 rounded-3xl h-16 p-1.5 shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-2xl transition-all"><Home size={20}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-2xl transition-all"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="manual" className="rounded-2xl transition-all"><ClipboardList size={20}/></TabsTrigger>
            <TabsTrigger value="settings" className="rounded-2xl transition-all"><Settings size={20}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-2xl transition-all"><BarChart3 size={20}/></TabsTrigger>
          </TabsList>

          {/* TAB: DASHBOARD DINÁMICO */}
          <TabsContent value="dashboard" className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-[2.5rem] bg-white border transition-all ${config.temp > 27 ? 'border-red-200 shadow-red-50' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Thermometer size={20}/></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temperatura</span>
                </div>
                <input type="number" value={config.temp} onChange={(e) => setConfig({...config, temp: parseFloat(e.target.value)})} className="text-4xl font-black w-full outline-none bg-transparent text-slate-800" />
                {config.temp > 27 && <p className="text-[10px] text-red-500 font-bold mt-2 uppercase">Añadir agua fría</p>}
              </div>

              <div className={`p-6 rounded-[2.5rem] bg-white border transition-all ${config.ph > 6.2 ? 'border-amber-200 shadow-amber-50' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Droplets size={20}/></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">pH Actual</span>
                </div>
                <input type="number" step="0.1" value={config.ph} onChange={(e) => setConfig({...config, ph: parseFloat(e.target.value)})} className="text-4xl font-black w-full outline-none bg-transparent text-slate-800" />
                {analysis.phCorrection !== "0" && <p className="text-[10px] text-amber-600 font-bold mt-2 uppercase">Añadir {analysis.phCorrection}ml pH-</p>}
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 text-white"><FlaskConical size={120}/></div>
               <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-4">Plan de Nutrientes</p>
               <div className="grid grid-cols-2 gap-8 relative z-10">
                  <div>
                    <h3 className="text-5xl font-black italic tracking-tighter">{analysis.dose}<small className="text-sm ml-1 uppercase font-bold text-emerald-400">ml</small></h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">CANNA Aqua (A+B)</p>
                  </div>
                  {analysis.calmag !== "0" && (
                    <div>
                      <h3 className="text-5xl font-black italic tracking-tighter text-blue-400">{analysis.calmag}<small className="text-sm ml-1 uppercase font-bold">ml</small></h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Suplemento CalMag</p>
                    </div>
                  )}
               </div>
            </div>

            {/* CÁLCULO DE RIEGO */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-800 border border-slate-100">
                  <Timer size={28}/>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Frecuencia de Riego</p>
                  <p className="text-xl font-bold text-slate-800">{analysis.irrigation.on}m ON / {analysis.irrigation.off}m OFF</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">OPTIMIZADO</span>
              </div>
            </div>
          </TabsContent>

          {/* TAB: GESTIÓN DE TORRE V15 */}
          <TabsContent value="tower" className="space-y-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Matriz Vertical (15 Huecos)</h3>
                <button onClick={rotateTower} className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                  <RotateCw size={20}/>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {tower.map((plant, i) => (
                  <button key={i} onClick={() => cycleLevel(i)} 
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all ${plant ? `border-${plant.color}-500 bg-${plant.color}-50` : 'border-dashed border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                    {plant ? (
                      <>
                        <plant.icon size={22} className={`text-${plant.color}-500 mb-1`}/>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3].map(l => (
                            <div key={l} className={`w-1.5 h-1.5 rounded-full ${plant.currentLevel >= l ? `bg-${plant.color}-500` : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <div onClick={(e) => { e.stopPropagation(); const n = [...tower]; n[i] = null; setTower(n); }} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-red-50">
                          <Trash2 size={12}/>
                        </div>
                      </>
                    ) : <Plus size={16} className="text-slate-300"/>}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {Object.entries(VARIETIES).map(([key, v]) => (
                <button key={key} onClick={() => addPlant(key)} className="bg-white border border-slate-100 p-4 rounded-3xl flex items-center gap-3 hover:border-emerald-500 transition-all group shadow-sm">
                  <div className={`p-2 rounded-xl bg-${v.color}-50 text-${v.color}-500 group-hover:bg-${v.color}-500 group-hover:text-white transition-all`}>
                    <v.icon size={20}/>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{v.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* TAB: MANUAL TÉCNICO */}
          <TabsContent value="manual" className="space-y-4 animate-in fade-in">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 space-y-8">
              <section className="flex gap-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0"><Brain size={24}/></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase mb-2">Protocolo Lana de Roca (Grodan)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    Sumerge los dados de 2.5cm en agua a pH 5.2 durante 24h antes de insertar la semilla. Mantén la humedad constante pero nunca encharcada para evitar Pythium.
                  </p>
                </div>
              </section>
              <section className="flex gap-6 pt-6 border-t border-slate-50">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0"><Wind size={24}/></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase mb-2">Viento de Poniente (Castellón)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    Con Poniente, la humedad relativa cae. El sistema activa la compensación reduciendo la EC un 15%, permitiendo que la planta transpire sin acumular sales tóxicas.
                  </p>
                </div>
              </section>
            </div>
          </TabsContent>

          {/* TAB: AJUSTES */}
          <TabsContent value="settings" className="space-y-4 animate-in fade-in">
            <div className="bg-white border border-slate-100 p-8 rounded-[3rem] space-y-8">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Wind/></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Modo Poniente Castellón</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Ajuste de Transpiración</p>
                    </div>
                  </div>
                  <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-14 h-8 rounded-full transition-all relative ${config.isPoniente ? 'bg-orange-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${config.isPoniente ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Volumen del Depósito</label>
                    <span className="text-lg font-black text-slate-800">{config.vol}L</span>
                  </div>
                  <input type="range" min="5" max="30" value={config.vol} onChange={(e) => setConfig({...config, vol: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none accent-emerald-500" />
               </div>

               <button onClick={() => window.location.reload()} className="w-full py-4 text-xs font-bold text-red-500 border border-red-50 rounded-2xl hover:bg-red-50 transition-all uppercase tracking-widest">
                 Reiniciar Datos del Sistema
               </button>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="bg-white border border-slate-100 p-12 rounded-[3rem] text-center">
             <Calendar size={48} className="mx-auto text-slate-100 mb-4"/>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay registros hoy</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
