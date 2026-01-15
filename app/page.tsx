"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Plus, Trash2, FlaskConical, AlertTriangle, Droplets, 
  Thermometer, Zap, Settings, Layers, RefreshCw, Leaf, Sun, Wind, 
  BarChart3, Waves, Home, RotateCw, ArrowRight, Timer, Activity, 
  CheckCircle2, X, ChevronRight, Brain, FlaskRound, Info, Gauge
} from "lucide-react"

// --- CONFIGURACIÓN TÉCNICA ---
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

export default function HydrocaruV7() {
  const [step, setStep] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Inputs estables
  const [inputPh, setInputPh] = useState("6.0")
  const [inputEc, setInputEc] = useState("0.80")
  const [inputTemp, setInputTemp] = useState("22.0")
  const [inputVol, setInputVol] = useState("18.0")
  
  const [config, setConfig] = useState({
    vol: 18.0, temp: 22.0, ph: 6.0, ec_actual: 0.8,
    isPoniente: false, waterType: "blanda" as keyof typeof WATER_TYPES,
    month: new Date().getMonth()
  })
  
  const [tower, setTower] = useState<any[]>(Array(15).fill(null))
  const [history, setHistory] = useState<any[]>([])

  const syncData = () => {
    setConfig(prev => ({
      ...prev,
      ph: parseFloat(inputPh) || 0,
      ec_actual: parseFloat(inputEc) || 0,
      temp: parseFloat(inputTemp) || 0,
      vol: parseFloat(inputVol) || 0
    }))
  }

  // --- MOTOR DE CÁLCULO PROFESIONAL ---
  const analysis = useMemo(() => {
    const active = tower.filter(p => p !== null)
    const numPlants = active.length
    
    // 1. EC Objetivo según plantas
    let targetEC = 1.3
    if (numPlants > 0) {
      targetEC = active.reduce((acc, p) => acc + p.ec[p.currentLevel - 1], 0) / numPlants
    }
    if (config.isPoniente) targetEC *= 0.85

    // 2. CÁLCULO DE CORRECCIONES
    let correctionAction = ""
    const diffEC = targetEC - config.ec_actual
    
    if (diffEC > 0.05) {
      const dose = ((diffEC * 1000 / 500) * config.vol / 2).toFixed(1)
      correctionAction = `Añadir ${dose}ml de A y ${dose}ml de B`
    } else if (diffEC < -0.1) {
      const waterToAdd = ((Math.abs(diffEC) / config.ec_actual) * config.vol).toFixed(1)
      correctionAction = `EC ALTA: Añadir ${waterToAdd}L de agua pura`
    }

    // 3. RIEGO (Lana de roca 2.5cm)
    // El dado de 2.5cm retiene solo ~15-20ml de agua útil.
    const isSummer = config.month >= 5 && config.month <= 8
    let onSecs = 120 // 2 min es el estándar para empapar sin lavar
    let offMins = 40 // Base

    if (isSummer) offMins -= 15
    if (config.isPoniente) offMins -= 12
    if (numPlants > 10) offMins -= 5
    if (config.temp > 26) offMins -= 8

    return {
      targetEC: targetEC.toFixed(2),
      correctionAction,
      calmag: (config.vol * 0.8 * WATER_TYPES[config.waterType].calmagFactor).toFixed(1),
      onSecs,
      offMins: Math.max(offMins, 10),
      phDown: config.ph > 6.2 ? ((config.ph - 5.8) * config.vol * 0.15).toFixed(1) : "0",
      alerts: {
        temp: config.temp > 26,
        ph: config.ph < 5.5 || config.ph > 6.5,
        ec: Math.abs(diffEC) > 0.3
      }
    }
  }, [config, tower])

  if (step === 0) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <h1 className="text-5xl font-black italic text-white tracking-tighter">HYDRO<span className="text-emerald-500">CARU</span></h1>
          <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.5em] mt-4">Intelligence Agriculture</p>
        </div>
        <div className="grid gap-4">
          {Object.entries(WATER_TYPES).map(([key, val]) => (
            <button key={key} onClick={() => { setConfig({...config, waterType: key as any}); setStep(1); }}
              className="p-8 bg-slate-800 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 transition-all text-left group">
              <p className="text-white font-black text-xl uppercase italic">{val.name}</p>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">EC Base: {val.ec} mS</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-32">
      <header className="bg-white border-b p-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-emerald-400 p-2 rounded-xl font-black italic">HC</div>
            <h1 className="font-black text-slate-800 text-xl tracking-tighter italic uppercase">Hydrocaru <span className="text-emerald-500">Pro</span></h1>
          </div>
          <div className="flex gap-2 font-black text-[9px] uppercase">
            <span className={`px-3 py-1 rounded-full ${config.isPoniente ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>Poniente</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600">V. {config.vol}L</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 bg-white border-2 border-slate-200 rounded-[2rem] h-20 p-1.5 shadow-xl">
            <TabsTrigger value="dashboard" className="rounded-2xl py-3"><Home size={20}/></TabsTrigger>
            <TabsTrigger value="lab" className="rounded-2xl py-3"><Beaker size={20}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-2xl py-3"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-2xl py-3"><BarChart3 size={20}/></TabsTrigger>
            <TabsTrigger value="tips" className="rounded-2xl py-3"><Brain size={20}/></TabsTrigger>
          </TabsList>

          {/* 1. PANEL PRINCIPAL */}
          <TabsContent value="dashboard" className="space-y-4 animate-in fade-in">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 italic">Acción Correctiva EC</p>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-tight">
                      {analysis.correctionAction || "EC ESTABLE"}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Refuerzo</p>
                    <p className="text-xl font-black">{analysis.calmag}ml CalMag</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">EC Actual vs Objetivo</p>
                    <p className="text-2xl font-black italic">{config.ec_actual} <span className="text-emerald-500">/ {analysis.targetEC}</span></p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">pH Down (5.8)</p>
                    <p className="text-2xl font-black italic text-orange-400">{analysis.phDown}ml</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-transparent shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-blue-500">
                  <Timer size={20}/> <span className="text-[10px] font-black uppercase italic">Riego Grodan</span>
                </div>
                <p className="text-3xl font-black italic text-slate-800">{analysis.onSecs}s <small className="text-xs text-slate-400 uppercase">Cada {analysis.offMins}m</small></p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-transparent shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-emerald-500">
                  <Sprout size={20}/> <span className="text-[10px] font-black uppercase italic">Estado Torre</span>
                </div>
                <p className="text-3xl font-black italic text-slate-800">{tower.filter(p=>p).length} <small className="text-xs text-slate-400 uppercase">Plantas</small></p>
              </div>
            </div>

            {Object.values(analysis.alerts).some(v => v) && (
              <div className="bg-red-500 text-white p-6 rounded-[2.5rem] flex items-center gap-4 shadow-lg animate-pulse">
                <AlertTriangle size={32}/>
                <div>
                  <p className="font-black uppercase italic text-sm">Alerta de Sistema</p>
                  <p className="text-[10px] font-bold opacity-80 uppercase leading-none">Valores críticos detectados en el laboratorio</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* 2. MEDICIONES (LAB) */}
          <TabsContent value="lab" className="space-y-4 animate-in fade-in">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-slate-100 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "pH Actual", val: inputPh, set: setInputPh, icon: Droplets },
                  { label: "EC (mS/cm)", val: inputEc, set: setInputEc, icon: Activity },
                  { label: "Temperatura °C", val: inputTemp, set: setInputTemp, icon: Thermometer },
                  { label: "Volumen Real L", val: inputVol, set: setInputVol, icon: FlaskRound },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 flex items-center gap-2">
                      <item.icon size={12}/> {item.label}
                    </label>
                    <input type="text" value={item.val} onChange={e => item.set(e.target.value.replace(',','.'))} 
                      className="w-full bg-slate-50 p-6 rounded-[2rem] text-4xl font-black text-center focus:ring-4 ring-emerald-50 outline-none border-2 border-transparent focus:border-emerald-200 transition-all" />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <button onClick={() => { syncData(); setConfig(c => ({...c, isPoniente: !c.isPoniente}))}} className={`flex-1 p-6 rounded-[2rem] border-2 font-black italic uppercase text-xs transition-all ${config.isPoniente ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                  {config.isPoniente ? '🔥 Poniente Activo' : '🌬️ Modo Poniente'}
                </button>
                <button onClick={() => {
                  syncData();
                  const entry = { id: Date.now(), date: new Date().toLocaleString(), ph: inputPh, ec: inputEc, temp: inputTemp, vol: inputVol };
                  setHistory([entry, ...history]);
                  setActiveTab("dashboard");
                }} className="flex-[2] bg-slate-900 text-white p-6 rounded-[2rem] font-black italic uppercase text-xs hover:bg-emerald-600 transition-all shadow-xl">
                  Actualizar y Procesar Datos
                </button>
              </div>
            </div>
          </TabsContent>

          {/* 3. TORRE */}
          <TabsContent value="tower" className="space-y-4 animate-in fade-in">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border-2 border-slate-100 space-y-8">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black uppercase text-slate-400 italic tracking-[0.2em]">Matrix V15 Tower</h3>
                <button onClick={() => setTower(tower.map(p => p && p.currentLevel < 3 ? {...p, currentLevel: p.currentLevel + 1} : null))} 
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black italic uppercase flex items-center gap-2">
                  <RotateCw size={14}/> Evolucionar Ciclo
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {tower.map((plant, i) => (
                  <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all duration-500 ${plant ? `border-${plant.color}-500 bg-${plant.color}-50/30 shadow-inner` : 'border-dashed border-slate-200 bg-slate-50'}`}>
                    {plant ? (
                      <>
                        <plant.icon size={22} className={`text-${plant.color}-500 mb-1`}/>
                        <div className="flex gap-0.5 mt-1">{[1,2,3].map(l => <div key={l} className={`w-1 h-1 rounded-full ${plant.currentLevel >= l ? `bg-${plant.color}-500` : 'bg-slate-200'}`} />)}</div>
                        <button onClick={(e) => {e.stopPropagation(); const n = [...tower]; n[i] = null; setTower(n);}} className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full shadow-md p-0.5"><X size={10}/></button>
                      </>
                    ) : <Plus size={14} className="text-slate-200"/>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(VARIETIES).map(([key, v]) => (
                  <button key={key} onClick={() => {
                    const idx = tower.findIndex(p => p === null);
                    if (idx !== -1) { const n = [...tower]; n[idx] = { ...v, currentLevel: 1 }; setTower(n); }
                  }} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-2 hover:border-emerald-500 transition-all group">
                    <v.icon size={18} className={`text-${v.color}-500`}/><span className="text-[10px] font-black uppercase text-slate-600">{v.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 4. REGISTRO (HISTORY) */}
          <TabsContent value="history" className="space-y-4 animate-in fade-in">
            <div className="bg-white rounded-[3rem] shadow-xl border-2 border-slate-100 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b italic font-black text-slate-400 text-[10px] uppercase">Registro de Laboratorio</div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {history.map(e => (
                  <div key={e.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-all">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 italic">{e.date}</p>
                      <div className="flex gap-3">
                        {[{l:'pH', v:e.ph, c:'emerald'}, {l:'EC', v:e.ec, c:'blue'}, {l:'T', v:e.temp, c:'orange'}, {l:'V', v:e.vol, c:'purple'}].map((m, i) => (
                          <div key={i} className={`bg-${m.c}-50 px-3 py-1 rounded-xl border border-${m.c}-100`}>
                            <span className={`text-[8px] font-black text-${m.c}-600 uppercase`}>{m.l}: </span>
                            <span className="text-xs font-black text-slate-800 tracking-tighter">{m.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setHistory(history.filter(h => h.id !== e.id))} className="p-3 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                  </div>
                ))}
                {history.length === 0 && <div className="p-20 text-center text-slate-300 italic font-black uppercase text-xs">Sin registros</div>}
              </div>
            </div>
          </TabsContent>

          {/* 5. CONSEJOS MAESTROS */}
          <TabsContent value="tips" className="space-y-4 animate-in fade-in">
            <div className="grid gap-4">
              {[
                { 
                  title: "Gestión de Lana de Roca (Grodan)", 
                  text: "Con dados de 2.5cm, el riego debe ser por impulsos. Si el riego dura más de 3 minutos, lavas los nutrientes. Si la pausa es mayor a 1h, el dado se seca y las sales cristalizan quemando la raíz.",
                  icon: Layers, color: "blue"
                },
                { 
                  title: "El efecto Poniente", 
                  text: "En Castellón, el Poniente baja la humedad al 20%. La planta transpira tanto que si la EC es alta (ej. 1.8), se 'autointoxica'. Baja la EC a 1.0-1.2 cuando sople viento seco.",
                  icon: Wind, color: "orange"
                },
                { 
                  title: "Oscilación de pH", 
                  text: "No busques el 5.8 estático. Deja que el pH oscile naturalmente entre 5.8 y 6.2. Algunos micros se absorben mejor a 6.1 y otros a 5.7. La 'deriva controlada' es salud.",
                  icon: Gauge, color: "emerald"
                }
              ].map((tip, i) => (
                <div key={i} className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 flex gap-6 items-start shadow-sm">
                  <div className={`p-4 bg-${tip.color}-50 text-${tip.color}-500 rounded-3xl shadow-inner`}><tip.icon size={28}/></div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase italic text-sm mb-2">{tip.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium italic">{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-center">
          <div className="bg-slate-900/90 backdrop-blur-xl text-white px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.5em] shadow-2xl pointer-events-auto border border-white/10 italic">
            Hydrocaru Protocol v7.0 • Precision Farming
          </div>
        </div>
      </footer>
    </div>
  )
}
