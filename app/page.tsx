"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Beaker, Plus, Trash2, FlaskConical, 
  AlertTriangle, Droplets, Thermometer, Zap, 
  Settings, Layers, ClipboardList, RefreshCw, 
  Leaf, Sun, Wind, BarChart3, Calendar, 
  Waves, Brain, Home, RotateCw, Info, ArrowRight
} from "lucide-react"

// --- CONFIGURACIÓN TÉCNICA ---
const VARIETIES = {
  "romana": { name: "Romana", ec: [1.0, 1.4, 1.8], color: "text-emerald-500", icon: <Leaf size={20}/>, bg: "bg-emerald-50" },
  "roble": { name: "H. Roble", ec: [0.9, 1.3, 1.7], color: "text-red-500", icon: <Sprout size={20}/>, bg: "bg-red-50" },
  "lollo": { name: "Lollo Rosso", ec: [1.1, 1.5, 1.9], color: "text-purple-500", icon: <Waves size={20}/>, bg: "bg-purple-50" },
  "maravilla": { name: "Maravilla", ec: [1.0, 1.5, 2.0], color: "text-green-600", icon: <Sun size={20}/>, bg: "bg-green-50" },
  "iceberg": { name: "Iceberg", ec: [0.8, 1.2, 1.6], color: "text-cyan-400", icon: <Thermometer size={20}/>, bg: "bg-cyan-50" },
  "trocadero": { name: "Trocadero", ec: [0.8, 1.3, 1.7], color: "text-lime-500", icon: <Droplets size={20}/>, bg: "bg-lime-50" }
}

export default function HydroMasterSystem() {
  const [step, setStep] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [config, setConfig] = useState({
    vol: 18,
    temp: 24,
    ph: 6.0,
    isPoniente: false,
    waterType: "osmosis"
  })
  const [tower, setTower] = useState<any[]>(Array(15).fill(null))

  // --- MOTOR DE DIAGNÓSTICO Y CÁLCULO ---
  const diagnosis = useMemo(() => {
    const alerts = []
    let phCorr = { ml: 0, msg: "" }
    
    if (config.temp > 27) {
      alerts.push({ msg: "TEMP CRÍTICA: Añadir agua fría (Baja O2)", type: "error" })
    }

    if (config.ph > 6.2) {
      const diff = config.ph - 5.8
      const ml = parseFloat((diff * config.vol * 0.15).toFixed(1))
      phCorr = { ml, msg: `Añadir ${ml}ml de pH-` }
      alerts.push({ msg: `pH ALTO: ${phCorr.msg}`, type: "warning" })
    }

    const active = tower.filter(p => p !== null)
    let targetEC = active.length > 0 
      ? (active.reduce((acc, p) => acc + p.ec[1], 0) / active.length) * 1000 
      : 1200
    
    if (config.isPoniente) targetEC *= 0.8 

    const cannaDose = ((targetEC / 500 * config.vol) / 2).toFixed(1)
    const calmagDose = config.waterType === "osmosis" ? (config.vol * 0.8).toFixed(1) : "0"

    return { alerts, phCorr, targetEC: Math.round(targetEC), cannaDose, calmagDose }
  }, [config, tower])

  const rotateTower = () => {
    const newTower = [...tower]
    const last = newTower.pop()
    newTower.unshift(last)
    setTower(newTower)
  }

  // --- PANTALLA DE INICIO ---
  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
          <div className="text-center">
            <h1 className="text-4xl font-black italic text-emerald-500">HYDROPRO<span className="text-white">V15</span></h1>
            <p className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase mt-2">Configuración Inicial</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-400">Tipo de Agua</label>
              <div className="grid grid-cols-2 gap-2">
                {['osmosis', 'grifo'].map(t => (
                  <button key={t} onClick={() => setConfig({...config, waterType: t})} className={`p-4 rounded-2xl border-2 transition-all font-bold capitalize ${config.waterType === t ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full bg-emerald-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2">CONFIGURAR DEPÓSITO <ArrowRight size={18}/></button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black italic tracking-tighter">
            <div className="p-2 bg-slate-950 text-white rounded-xl"><Layers size={18}/></div>
            <span>V15<span className="text-emerald-600">CASTELLÓN</span></span>
          </div>
          <div className="flex gap-2">
            {config.isPoniente && <div className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse uppercase">Poniente</div>}
            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black">{config.vol}L</div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4">
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 bg-white border border-slate-200 rounded-2xl h-14 p-1 shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-xl"><Home size={18}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-xl"><Layers size={18}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl"><BarChart3 size={18}/></TabsTrigger>
            <TabsTrigger value="manual" className="rounded-xl"><ClipboardList size={18}/></TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl"><Settings size={18}/></TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-[2rem] border border-slate-200">
                <div className="flex justify-between items-center mb-2 font-black text-[10px] text-slate-400 uppercase">
                  <Thermometer size={16} className="text-orange-500"/> Temperatura
                </div>
                <input type="number" value={config.temp} onChange={(e) => setConfig({...config, temp: parseFloat(e.target.value)})} className="text-3xl font-black w-full outline-none bg-transparent"/>
              </div>
              <div className="bg-white p-5 rounded-[2rem] border border-slate-200">
                <div className="flex justify-between items-center mb-2 font-black text-[10px] text-slate-400 uppercase">
                  <Droplets size={16} className="text-blue-500"/> pH Agua
                </div>
                <input type="number" step="0.1" value={config.ph} onChange={(e) => setConfig({...config, ph: parseFloat(e.target.value)})} className="text-3xl font-black w-full outline-none bg-transparent"/>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl space-y-6">
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Dosis Nutrientes A+B</p>
                <p className="text-5xl font-black italic">{diagnosis.cannaDose}<small className="text-xl font-bold ml-2">ml</small></p>
              </div>
              <div className="flex gap-6 border-t border-slate-800 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">EC Objetivo</p>
                  <p className="text-lg font-black">{diagnosis.targetEC} µS</p>
                </div>
                {config.waterType === 'osmosis' && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">CalMag</p>
                    <p className="text-lg font-black text-blue-400">{diagnosis.calmagDose} ml</p>
                  </div>
                )}
              </div>
            </div>

            {diagnosis.alerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${a.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                <AlertTriangle size={18}/>
                <p className="text-xs font-black uppercase">{a.msg}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tower" className="space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase">Matriz de Ocupación V15</h3>
                <button onClick={rotateTower} className="bg-slate-950 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 active:scale-95 transition-all">
                  <RotateCw size={14}/> ROTAR
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {tower.map((plant, i) => (
                  <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative ${plant ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-slate-200'}`}>
                    {plant ? (
                      <div className={plant.color}>{plant.icon}</div>
                    ) : <Plus size={14} className="text-slate-200"/>}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(VARIETIES).map(([id, v]) => (
                <button key={id} onClick={() => {
                  const idx = tower.findIndex(p => p === null)
                  if (idx !== -1) { const n = [...tower]; n[idx] = v; setTower(n); }
                }} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
                  <div className={v.color}>{v.icon}</div>
                  <span className="text-[9px] font-black uppercase mt-1">{v.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 space-y-6">
              <section>
                <h4 className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 mb-2"><Info size={14}/> Lana de Roca (Grodan)</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">Estabilizar a pH 5.5 durante 24h. No apretar el dado para mantener oxigenación radicular.</p>
              </section>
              <section className="pt-4 border-t border-slate-100">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase text-blue-600 mb-2"><Wind size={14}/> Clima Castellón</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">Con Poniente, bajar la EC un 20% para evitar quemaduras por transpiración excesiva.</p>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Wind size={20}/></div>
                  <span className="text-xs font-black uppercase">Modo Poniente</span>
                </div>
                <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-12 h-6 rounded-full relative transition-colors ${config.isPoniente ? 'bg-orange-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isPoniente ? 'right-7' : 'right-1'}`} />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Volumen Depósito (L)</label>
                <input type="range" min="5" max="30" value={config.vol} onChange={(e) => setConfig({...config, vol: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none accent-slate-900" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="text-center p-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Calendar className="mx-auto text-slate-200 mb-2" size={40}/>
            <p className="text-[10px] font-black text-slate-400 uppercase">Sin registros hoy</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
