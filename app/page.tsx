"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Plus, Trash2, FlaskConical, AlertTriangle, Droplets, 
  Thermometer, Zap, Layers, RefreshCw, Leaf, Sun, Wind, 
  BarChart3, Waves, Home, RotateCw, ArrowRight, Timer, Activity, 
  CheckCircle2, X, ChevronRight, Brain, FlaskRound, Gauge, Info
} from "lucide-react"

// --- CONSTANTES ---
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
  
  // Estados de entrada (Strings para permitir decimales sin errores)
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

  const processInputs = () => {
    setConfig(prev => ({
      ...prev,
      ph: parseFloat(inputPh) || 0,
      ec_actual: parseFloat(inputEc) || 0,
      temp: parseFloat(inputTemp) || 0,
      vol: parseFloat(inputVol) || 0
    }))
  }

  // --- MOTOR DE CÁLCULOS PROFESIONAL ---
  const analysis = useMemo(() => {
    const active = tower.filter(p => p !== null)
    const numPlants = active.length
    
    // 1. EC Objetivo
    let targetEC = 1.3
    if (numPlants > 0) {
      targetEC = active.reduce((acc, p) => acc + p.ec[p.currentLevel - 1], 0) / numPlants
    }
    if (config.isPoniente) targetEC *= 0.85 // Reducción por transpiración

    // 2. Correcciones EC/Nutrientes
    let correctionAction = "EC ESTABLE"
    const diffEC = targetEC - config.ec_actual
    
    if (diffEC > 0.05) {
      const dose = ((diffEC * 1000 / 500) * config.vol / 2).toFixed(1)
      correctionAction = `Añadir ${dose}ml de A y ${dose}ml de B`
    } else if (diffEC < -0.1) {
      const waterToAdd = ((Math.abs(diffEC) / config.ec_actual) * config.vol).toFixed(1)
      correctionAction = `DILUIR: Añadir ${waterToAdd}L de agua`
    }

    // 3. Algoritmo de Riego Profesional (Dados 2.5cm)
    const isSummer = config.month >= 5 && config.month <= 8
    let onSecs = 120 // Pulso de 2 min para saturación capilar
    let offMins = 45 // Descanso base invierno

    if (isSummer) offMins -= 15
    if (config.isPoniente) offMins -= 10
    if (numPlants > 8) offMins -= 5
    if (config.temp > 27) offMins -= 10

    return {
      targetEC: targetEC.toFixed(2),
      correctionAction,
      calmag: (config.vol * 0.8 * WATER_TYPES[config.waterType].calmagFactor).toFixed(1),
      onSecs,
      offMins: Math.max(offMins, 10),
      phCorrection: config.ph > 6.2 ? ((config.ph - 5.8) * config.vol * 0.15).toFixed(1) : "0",
      isAlert: config.ph < 5.5 || config.ph > 6.5 || config.temp > 28
    }
  }, [config, tower])

  // --- FLUJO DE INICIO ---

  if (step === 0) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-in zoom-in duration-300">
        <div className="text-center">
          <h1 className="text-5xl font-black italic text-white tracking-tighter italic">HYDRO<span className="text-emerald-500">CARU</span></h1>
          <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.5em] mt-4 italic">Selecciona el Agua Base</p>
        </div>
        <div className="grid gap-4">
          {Object.entries(WATER_TYPES).map(([key, val]) => (
            <button key={key} onClick={() => { setConfig({...config, waterType: key as any}); setStep(1); }}
              className="p-8 bg-slate-800 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 transition-all text-left">
              <p className="text-white font-black text-xl uppercase italic">{val.name}</p>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">EC: {val.ec} mS</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (step === 1) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-in slide-in-from-right">
        <div className="text-center"><h2 className="text-2xl font-black uppercase italic tracking-tighter">Mediciones Iniciales</h2></div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "pH", val: inputPh, set: setInputPh, icon: Droplets },
            { label: "EC (mS)", val: inputEc, set: setInputEc, icon: Activity },
            { label: "Temp °C", val: inputTemp, set: setInputTemp, icon: Thermometer },
            { label: "Volumen L", val: inputVol, set: setInputVol, icon: FlaskRound },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 focus-within:border-emerald-500">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-2"><item.icon size={12}/> {item.label}</label>
              <input type="text" value={item.val} onChange={(e) => item.set(e.target.value.replace(',','.'))} className="w-full bg-transparent text-3xl font-black outline-none" />
            </div>
          ))}
        </div>
        <button onClick={() => { processInputs(); setStep(2); }} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] uppercase italic tracking-widest shadow-2xl">Siguiente: Torre <ArrowRight size={20} className="inline ml-2"/></button>
      </div>
    </div>
  )

  if (step === 2) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-[3.5rem] shadow-2xl space-y-8 animate-in slide-in-from-right">
        <div className="flex justify-between items-end px-2">
          <div><p className="text-[10px] font-black text-emerald-500 uppercase">Paso 3</p><h2 className="text-3xl font-black italic uppercase tracking-tighter">Configurar Torre</h2></div>
          <button onClick={() => { processInputs(); setStep(3); }} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase italic">Finalizar Setup</button>
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
              <v.icon size={18} className={`text-${v.color}-500 group-hover:scale-110 transition-transform`}/><span className="text-[10px] font-black uppercase text-slate-600 italic">{v.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // --- PANEL PRINCIPAL (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <header className="bg-white border-b sticky top-0 z-50 p-6 shadow-sm">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-emerald-400 p-2 rounded-xl font-black italic">HC</div>
            <h1 className="font-black text-slate-800 text-xl tracking-tighter italic">HYDROCARU <span className="text-emerald-500">PRO</span></h1>
          </div>
          <button onClick={() => setStep(1)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><RefreshCw size={18}/></button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 bg-white border-2 border-slate-200 rounded-[2.2rem] h-20 p-1.5 shadow-xl">
            <TabsTrigger value="dashboard" className="rounded-2xl py-3"><Home size={20}/></TabsTrigger>
            <TabsTrigger value="lab" className="rounded-2xl py-3"><FlaskRound size={20}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-2xl py-3"><Layers size={20}/></TabsTrigger>
            <TabsTrigger value="irrigation" className="rounded-2xl py-3"><Timer size={20}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-2xl py-3"><BarChart3 size={20}/></TabsTrigger>
          </TabsList>

          {/* 1. PANEL PRINCIPAL */}
          <TabsContent value="dashboard" className="space-y-4 pt-4 animate-in fade-in">
            <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 italic">Ajuste de Nutrientes</p>
                  <h2 className="text-4xl font-black italic leading-tight tracking-tighter">{analysis.correctionAction}</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 font-black italic">
                  <div><p className="text-[9px] text-slate-500 uppercase">EC Actual / Target</p><p className="text-2xl">{config.ec_actual} <span className="text-emerald-500">/ {analysis.targetEC}</span></p></div>
                  <div className="text-right"><p className="text-[9px] text-blue-400 uppercase">Añadir CalMag</p><p className="text-2xl">{analysis.calmag} <small className="text-xs">ml</small></p></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-50 p-4 rounded-3xl text-orange-500"><Wind size={24}/></div>
                <div><p className="text-xs font-black italic uppercase">Modo Poniente</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ajuste por evaporación</p></div>
              </div>
              <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-14 h-8 rounded-full transition-all relative ${config.isPoniente ? 'bg-orange-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.isPoniente ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {analysis.isAlert && (
              <div className="bg-red-500 text-white p-6 rounded-[2.5rem] flex items-center gap-4 shadow-lg animate-pulse">
                <AlertTriangle size={32}/>
                <p className="font-black italic uppercase text-xs">Peligro: Revisa pH o Temperatura en Laboratorio.</p>
              </div>
            )}
          </TabsContent>

          {/* 2. MEDICIONES (LABORATORIO) */}
          <TabsContent value="lab" className="space-y-4 pt-4">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl space-y-8 border-2 border-slate-100">
              <h3 className="text-xs font-black uppercase text-center text-slate-400 tracking-[0.3em]">Entrada de Datos Reales</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "pH", val: inputPh, set: setInputPh },
                  { label: "EC (mS)", val: inputEc, set: setInputEc },
                  { label: "Temperatura", val: inputTemp, set: setInputTemp },
                  { label: "Volumen L", val: inputVol, set: setInputVol },
                ].map((input, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4">{input.label}</label>
                    <input type="text" value={input.val} onChange={e => input.set(e.target.value.replace(',','.'))} 
                      className="w-full bg-slate-50 p-6 rounded-[2.5rem] text-3xl font-black text-center focus:ring-4 ring-emerald-50 outline-none" />
                  </div>
                ))}
              </div>
              <button onClick={() => {
                processInputs();
                const entry = { id: Date.now(), date: new Date().toLocaleString(), ph: inputPh, ec: inputEc, temp: inputTemp, vol: inputVol };
                setHistory([entry, ...history]);
                setActiveTab("dashboard");
              }} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all">
                <CheckCircle2 size={20}/> Procesar y Guardar
              </button>
            </div>
          </TabsContent>

          {/* 3. TORRE */}
          <TabsContent value="tower" className="space-y-4 pt-4">
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[3.5rem] shadow-sm space-y-8">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black uppercase text-slate-400 italic">V15 Matrix</h3>
                <button onClick={() => setTower(tower.map(p => p && p.currentLevel < 3 ? {...p, currentLevel: p.currentLevel + 1} : null))} 
                  className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black italic uppercase flex items-center gap-2">
                  <RotateCw size={14}/> Ciclo Evolutivo
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {tower.map((plant, i) => (
                  <div key={i} className={`aspect-square rounded-[1.5rem] border-2 flex flex-col items-center justify-center relative transition-all ${plant ? `border-${plant.color}-500 bg-${plant.color}-50/30` : 'border-dashed border-slate-100'}`}>
                    {plant ? (
                      <>
                        <plant.icon size={22} className={`text-${plant.color}-500 mb-1`}/>
                        <div className="flex gap-0.5 mt-1">{[1,2,3].map(l => <div key={l} className={`w-1 h-1 rounded-full ${plant.currentLevel >= l ? `bg-${plant.color}-500` : 'bg-slate-200'}`} />)}</div>
                        <button onClick={() => { const n = [...tower]; n[i] = null; setTower(n); }} className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full shadow-md p-0.5"><X size={10}/></button>
                      </>
                    ) : <Plus size={14} className="text-slate-200"/>}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 4. RIEGO (PROFESIONAL) */}
          <TabsContent value="irrigation" className="space-y-4 pt-4 animate-in fade-in">
            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-xl space-y-8">
              <div className="flex items-center gap-6">
                <div className="p-6 bg-blue-50 text-blue-500 rounded-[2rem] shadow-inner"><Timer size={40}/></div>
                <div>
                  <h3 className="text-3xl font-black italic text-slate-800 tracking-tighter">Plan de Riego</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Ajustado para Lana de Roca</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Bomba ON</p>
                  <p className="text-3xl font-black italic text-slate-800">{analysis.onSecs}s</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Pausa OFF</p>
                  <p className="text-3xl font-black italic text-slate-800">{analysis.offMins}m</p>
                </div>
              </div>

              <div className="bg-blue-900 text-white p-6 rounded-[2rem] flex gap-4 items-start shadow-xl">
                <Brain className="text-blue-300 shrink-0" size={24}/>
                <p className="text-[11px] font-medium leading-relaxed italic italic">
                  "Los dados de 2.5cm tienen un drenaje muy rápido. El riego de {analysis.onSecs}s garantiza que el agua nueva desplace a la vieja sin 'lavar' excesivamente el oxígeno. No permitas que el dado pierda más del 30% de humedad entre pulsos para evitar el estrés osmótico."
                </p>
              </div>
            </div>
          </TabsContent>

          {/* 5. REGISTRO (HISTORY) */}
          <TabsContent value="history" className="space-y-4 pt-4">
            <div className="bg-white rounded-[3rem] shadow-xl border-2 border-slate-100 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b flex justify-between items-center italic font-black text-slate-400 text-[10px] uppercase">
                <span>Historial de Laboratorio</span>
                <span>{history.length} Entradas</span>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {history.map(e => (
                  <div key={e.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-all">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 italic uppercase">{e.date}</p>
                      <div className="flex gap-3">
                        {[{l:'pH', v:e.ph, c:'emerald'}, {l:'EC', v:e.ec, c:'blue'}, {l:'T', v:e.temp, c:'orange'}].map((m, i) => (
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
        </Tabs>
      </main>

      <footer className="fixed bottom-6 left-0 right-0 px-6">
        <div className="max-w-xl mx-auto bg-slate-900/90 backdrop-blur-xl text-white p-4 rounded-3xl flex justify-between items-center shadow-2xl border border-white/10">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest italic">EC Target</span>
              <span className="text-sm font-black italic">{analysis.targetEC} mS</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">A+B</span>
              <span className="text-sm font-black italic">{analysis.phCorrection}ml pH-</span>
            </div>
          </div>
          <div className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
            <span className="text-[10px] font-black text-emerald-400 uppercase italic">HC Master V7</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
