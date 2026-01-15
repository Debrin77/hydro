"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Plus, Trash2, FlaskConical, 
  AlertTriangle, Droplets, Thermometer, Zap, 
  Settings, Layers, RefreshCw, 
  Leaf, Sun, Wind, BarChart3, 
  Waves, Home, RotateCw, ArrowRight,
  Timer, Activity, CheckCircle2, X, ChevronRight, Brain, FlaskRound
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

export default function HydrocaruProV6() {
  const [step, setStep] = useState(0) 
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Inputs estables (Strings para evitar que el punto decimal borre el número)
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

  // Sincronización manual de datos al Dashboard
  const refreshSystemData = () => {
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
    let targetEC = 1.2 
    if (active.length > 0) {
      const sumEC = active.reduce((acc, p) => acc + p.ec[p.currentLevel - 1], 0)
      targetEC = sumEC / active.length
    }
    if (config.isPoniente) targetEC *= 0.85

    const netECNeed = Math.max(0, targetEC - config.ec_actual)
    const doseAB = ((netECNeed * 1000 / 500) * config.vol / 2).toFixed(1)
    const calmag = (config.vol * 0.8 * WATER_TYPES[config.waterType].calmagFactor).toFixed(1)

    // Riego Precisión Castellón - Dados 2.5cm
    const isSummer = config.month >= 5 && config.month <= 8
    let onTimeSeconds = 120 // 2 min siempre para Grodan 2.5
    let offTimeMinutes = 45 // Descanso base invierno
    
    if (isSummer) offTimeMinutes -= 15
    if (config.isPoniente) offTimeMinutes -= 10
    if (active.length > 10) offTimeMinutes -= 5
    if (config.temp > 26) offTimeMinutes -= 5
    
    return { 
      targetEC: targetEC.toFixed(2), 
      doseAB, 
      calmag, 
      onTime: onTimeSeconds, 
      offTime: Math.max(offTimeMinutes, 10),
      phCorrection: config.ph > 6.2 ? ((config.ph - 5.8) * config.vol * 0.15).toFixed(1) : "0",
      activeCount: active.length
    }
  }, [config, tower])

  const saveToHistory = () => {
    refreshSystemData()
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }),
      ph: inputPh, ec: inputEc, temp: inputTemp, vol: inputVol
    }
    setHistory([entry, ...history])
    setActiveTab("history")
  }

  const handleRotation = () => {
    setTower(tower.map(p => (p && p.currentLevel < 3 ? { ...p, currentLevel: p.currentLevel + 1 } : null)))
  }

  // --- RENDERIZADO DE FLUJO ---

  if (step === 0) { // PASO 1: AGUA
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter text-slate-900">HYDRO<span className="text-emerald-500">CARU</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Water Selection</p>
          </div>
          <div className="grid gap-4">
            {Object.entries(WATER_TYPES).map(([key, val]) => (
              <button key={key} onClick={() => { setConfig({...config, waterType: key as any}); setStep(1); }}
                className="group p-6 bg-white rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 shadow-xl shadow-slate-200/40 transition-all text-left flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-800 text-lg uppercase italic">{val.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Base: {val.ec} mS</p>
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

  if (step === 1) { // PASO 2: VALORES
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 animate-in slide-in-from-bottom duration-500">
          <div className="text-center italic"><h2 className="text-2xl font-black uppercase tracking-tighter">Parámetros Iniciales</h2></div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "pH", val: inputPh, set: setInputPh, icon: Droplets },
              { label: "EC (mS)", val: inputEc, set: setInputEc, icon: Activity },
              { label: "Temp °C", val: inputTemp, set: setInputTemp, icon: Thermometer },
              { label: "Volumen L", val: inputVol, set: setInputVol, icon: FlaskConical },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 focus-within:border-emerald-500 transition-all">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-2"><item.icon size={12}/> {item.label}</label>
                <input type="text" value={item.val} onChange={(e) => item.set(e.target.value.replace(',', '.'))} className="w-full bg-transparent text-3xl font-black outline-none" />
              </div>
            ))}
          </div>
          <button onClick={() => { refreshSystemData(); setStep(2); }} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest italic flex items-center justify-center gap-3">Configurar Torre <ArrowRight size={20}/></button>
        </div>
      </div>
    )
  }

  if (step === 2) { // PASO 3: TORRE
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-[3rem] shadow-2xl space-y-8 animate-in fade-in">
          <div className="flex justify-between items-end px-2">
            <div><p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Matriz V15</p><h2 className="text-3xl font-black italic uppercase tracking-tighter">Cultivo Actual</h2></div>
            <button onClick={() => { refreshSystemData(); setStep(3); }} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-lg italic">Ir al Panel Principal</button>
          </div>
          <div className="grid grid-cols-5 gap-3 p-6 bg-slate-50 rounded-[2.5rem]">
            {tower.map((plant, i) => (
              <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all ${plant ? `border-${plant.color}-500 bg-white` : 'border-dashed border-slate-200'}`}>
                {plant ? <plant.icon size={22} className={`text-${plant.color}-500`}/> : <Plus size={14} className="text-slate-200"/>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(VARIETIES).map(([key, v]) => (
              <button key={key} onClick={() => {
                const idx = tower.findIndex(p => p === null);
                if (idx !== -1) { const n = [...tower]; n[idx] = { ...v, currentLevel: 1 }; setTower(n); }
              }} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-2 hover:border-emerald-500 transition-all group">
                <v.icon size={18} className={`text-${v.color}-500`}/><span className="text-[10px] font-black uppercase text-slate-600">{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // PASO 4: DASHBOARD
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 p-6">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-emerald-400 p-2 rounded-xl font-black italic shadow-lg">HC</div>
            <h1 className="font-black text-slate-800 text-xl italic tracking-tighter">HYDROCARU <span className="text-emerald-500">V6</span></h1>
          </div>
          <div className="flex gap-2">
            {config.isPoniente && <span className="bg-orange-500 text-white text-[9px] px-3 py-1 rounded-full font-black animate-pulse uppercase">Poniente</span>}
            <span className="bg-slate-100 text-slate-500 text-[9px] px-3 py-1 rounded-full font-black uppercase border border-slate-200">{WATER_TYPES[config.waterType].name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 bg-white border-2 border-slate-100 rounded-[2rem] h-18 p-1 shadow-xl">
            <TabsTrigger value="dashboard" className="rounded-2xl py-3"><Home size={22}/></TabsTrigger>
            <TabsTrigger value="lab" className="rounded-2xl py-3"><FlaskRound size={22}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-2xl py-3"><Layers size={22}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-2xl py-3"><BarChart3 size={22}/></TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 pt-4 animate-in fade-in">
            {/* CARD PRINCIPAL NUTRICIÓN */}
            <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start font-black italic">
                  <div><p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-2">A+B Requerido</p><h2 className="text-7xl tracking-tighter">{analysis.doseAB}<small className="text-xl opacity-30 ml-2 italic">ml</small></h2></div>
                  <div className="text-right"><p className="text-[10px] text-blue-400 uppercase tracking-widest mb-2">CalMag</p><h2 className="text-4xl tracking-tighter">{analysis.calmag}<small className="text-sm opacity-30 ml-1">ml</small></h2></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 italic font-black">
                  <div><p className="text-[9px] text-slate-500 uppercase">EC Target</p><p className="text-2xl">{analysis.targetEC} <small className="text-[10px] opacity-40">mS/cm</small></p></div>
                  <div className="text-right"><p className="text-[9px] text-emerald-400 uppercase">Ajuste pH-</p><p className="text-2xl text-emerald-500">{analysis.phCorrection} <small className="text-[10px] opacity-40">ml</small></p></div>
                </div>
              </div>
            </div>

            {/* CARD RIEGO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col items-center">
                <Timer className="text-blue-500 mb-2" size={24}/><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pulsos ON</p>
                <p className="text-2xl font-black italic">{analysis.onTime} s</p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col items-center">
                <RefreshCw className="text-emerald-500 mb-2" size={24}/><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pausa OFF</p>
                <p className="text-2xl font-black italic">{analysis.offTime} min</p>
              </div>
            </div>

            {/* ALERTAS */}
            {(config.ph > 6.5 || config.temp > 27) && (
              <div className="bg-red-50 p-6 rounded-[2.5rem] border-2 border-red-100 flex items-center gap-4 text-red-600">
                <AlertTriangle className="animate-bounce" size={28}/>
                <p className="text-[10px] font-black uppercase italic leading-tight">Alerta Crítica: Parámetros fuera de rango. Revisar depósito inmediatamente.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lab" className="space-y-4 pt-4 animate-in fade-in">
            <div className="bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 shadow-xl space-y-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "pH", val: inputPh, set: setInputPh },
                  { label: "EC (mS)", val: inputEc, set: setInputEc },
                  { label: "Temperatura", val: inputTemp, set: setInputTemp },
                  { label: "Volumen (L)", val: inputVol, set: setInputVol },
                ].map((input, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4">{input.label}</label>
                    <input type="text" value={input.val} onChange={e => input.set(e.target.value.replace(',', '.'))} 
                      className="w-full bg-slate-50 p-6 rounded-[2.5rem] text-4xl font-black text-center focus:ring-4 ring-emerald-50 outline-none" />
                  </div>
                ))}
              </div>
              <button onClick={saveToHistory} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase italic tracking-widest flex items-center justify-center gap-3">
                <CheckCircle2 size={20}/> Registrar Mediciones
              </button>
            </div>
            {/* SWITCH PONIENTE */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex justify-between items-center px-8">
              <div><p className="text-xs font-black uppercase italic">Vientos de Poniente</p><p className="text-[10px] text-slate-400 uppercase tracking-widest">Ajuste de EC y Riego Automático</p></div>
              <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-14 h-8 rounded-full transition-all relative ${config.isPoniente ? 'bg-orange-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.isPoniente ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="tower" className="space-y-4 pt-4 animate-in fade-in">
            <div className="bg-white border p-8 rounded-[3.5rem] shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase text-slate-400 italic">Torre Hydrocaru V15</h3>
                <button onClick={handleRotation} className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black flex items-center gap-2 hover:bg-emerald-500 transition-all uppercase italic">
                  <RotateCw size={14}/> Rotar Plantas
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {tower.map((plant, i) => (
                  <div key={i} className={`aspect-square rounded-[1.5rem] border-2 flex flex-col items-center justify-center relative transition-all ${plant ? `border-${plant.color}-500 bg-${plant.color}-50/30` : 'border-dashed border-slate-100'}`}>
                    {plant ? (
                      <>
                        <plant.icon size={22} className={`text-${plant.color}-500 mb-1`}/>
                        <div className="flex gap-0.5 mt-1">{[1,2,3].map(l => <div key={l} className={`w-1 h-1 rounded-full ${plant.currentLevel >= l ? `bg-${plant.color}-500` : 'bg-slate-200'}`} />)}</div>
                      </>
                    ) : <Plus size={14} className="text-slate-200"/>}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pt-4 animate-in fade-in">
            <div className="bg-white rounded-[3rem] border shadow-xl overflow-hidden">
                <div className="p-6 bg-slate-50 border-b italic font-black text-slate-400 text-[10px] uppercase">Laboratorio Histórico</div>
                <div className="divide-y">
                    {history.map(e => (
                        <div key={e.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-all">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 italic">{e.date}</p>
                                <div className="flex gap-4">
                                    {[{l:'pH', v:e.ph, c:'emerald'}, {l:'EC', v:e.ec, c:'blue'}, {l:'T°', v:e.temp, c:'orange'}].map((m, i) => (
                                      <div key={i} className={`bg-${m.c}-50 px-3 py-1 rounded-xl border border-${m.c}-100`}>
                                        <span className={`text-[8px] font-black text-${m.c}-600 uppercase`}>{m.l}: </span>
                                        <span className="text-xs font-black text-slate-800 tracking-tighter">{m.v}</span>
                                      </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setHistory(history.filter(h => h.id !== e.id))} className="p-3 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                        </div>
                    ))}
                    {history.length === 0 && <div className="p-16 text-center text-slate-300 italic uppercase font-black text-xs tracking-widest">Sin registros</div>}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
