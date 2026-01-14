"use client"

import React, { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Beaker, Plus, Trash2, FlaskConical, 
  AlertTriangle, Droplets, Thermometer, Zap, 
  ChevronRight, Home, Settings, Layers, 
  Timer, ClipboardList, RefreshCw, Check, 
  Brain, ArrowRight, Waves, RotateCw, Info, 
  Leaf, Sun, Wind, BarChart3, Calendar
} from "lucide-react"

// --- CONFIGURACIÓN TÉCNICA (Basada en lógica CANNA/Castellón) ---
const VARIETIES = {
  "romana": { name: "Romana", ec: [1.0, 1.4, 1.8], color: "text-emerald-500", icon: <Leaf size={20}/>, bg: "bg-emerald-50" },
  "roble": { name: "H. Roble", ec: [0.9, 1.3, 1.7], color: "text-red-500", icon: <Sprout size={20}/>, bg: "bg-red-50" },
  "lollo": { name: "Lollo Rosso", ec: [1.1, 1.5, 1.9], color: "text-purple-500", icon: <Waves size={20}/>, bg: "bg-purple-50" },
  "maravilla": { name: "Maravilla", ec: [1.0, 1.5, 2.0], color: "text-green-600", icon: <Sun size={20}/>, bg: "bg-green-50" },
  "iceberg": { name: "Iceberg", ec: [0.8, 1.2, 1.6], color: "text-cyan-400", icon: <Thermometer size={20}/>, bg: "bg-cyan-50" },
  "trocadero": { name: "Trocadero", ec: [0.8, 1.3, 1.7], color: "text-lime-500", icon: <Droplets size={20}/>, bg: "bg-lime-50" }
}

export default function HydroMasterUltimate() {
  const [tab, setTab] = useState("dashboard")
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
    let phCorrection = { ml: 0, type: "" }
    
    if (config.temp > 28) alerts.push({ msg: "TEMP ALTA: Riesgo de Pythium. Añadir agua fría o hielo.", type: "error" })
    
    if (config.ph > 6.2) {
      const diff = config.ph - 5.8
      phCorrection = { ml: parseFloat((diff * config.vol * 0.15).toFixed(1)), type: "pH- (Ácido Fosfórico)" }
      alerts.push({ msg: `pH ALTO: Bloqueo de Hierro. Añadir ${phCorrection.ml}ml de pH-`, type: "warning" })
    }

    const active = tower.filter(p => p !== null)
    let targetEC = active.length > 0 
      ? (active.reduce((acc, p) => acc + p.ec[1], 0) / active.length) * 1000 
      : 1200
    
    if (config.isPoniente) targetEC *= 0.8 // Compensación por transpiración excesiva en Castellón

    return { alerts, phCorrection, targetEC: Math.round(targetEC), cannaDose: ((targetEC / 500 * config.vol) / 2).toFixed(1) }
  }, [config, tower])

  // --- FUNCIONES ---
  const rotateTower = () => {
    const newTower = [...tower]
    const last = newTower.pop()
    newTower.unshift(last)
    setTower(newTower)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-slate-950 text-white p-6 sticky top-0 z-50 shadow-xl">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter">HYDRO<span className="text-emerald-500">PRO</span> V15</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Castellón Edition</p>
          </div>
          {config.isPoniente && <div className="bg-orange-600 px-3 py-1 rounded-full text-[10px] font-black animate-pulse uppercase">Poniente Activo</div>}
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        
        <Tabs defaultValue="dashboard" onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-5 bg-white border border-slate-200 rounded-2xl h-14 mb-6 p-1">
            <TabsTrigger value="dashboard" className="rounded-xl"><Home size={18}/></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-xl"><Layers size={18}/></TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl"><BarChart3 size={18}/></TabsTrigger>
            <TabsTrigger value="manual" className="rounded-xl"><ClipboardList size={18}/></TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl"><Settings size={18}/></TabsTrigger>
          </TabsList>

          {/* PANEL: SENSORES Y ALERTAS */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-5 rounded-[2rem] border-2 transition-all ${config.temp > 28 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg"><Thermometer size={20} className="text-slate-600"/></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Temperatura</span>
                </div>
                <input type="number" value={config.temp} onChange={(e) => setConfig({...config, temp: parseFloat(e.target.value)})} className="bg-transparent text-3xl font-black w-full outline-none"/>
                <p className="text-[10px] font-bold text-slate-400 mt-1">ÓPTIMO: 20-24°C</p>
              </div>

              <div className={`p-5 rounded-[2rem] border-2 transition-all ${config.ph > 6.2 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg"><Droplets size={20} className="text-slate-600"/></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Nivel pH</span>
                </div>
                <input type="number" step="0.1" value={config.ph} onChange={(e) => setConfig({...config, ph: parseFloat(e.target.value)})} className="bg-transparent text-3xl font-black w-full outline-none"/>
                <p className="text-[10px] font-bold text-slate-400 mt-1">ÓPTIMO: 5.8-6.0</p>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><Beaker size={140}/></div>
               <div className="relative z-10 space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Dosis CANNA Aqua Vega ({config.vol}L)</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black italic tracking-tighter">{diagnosis.cannaDose}</span>
                     <span className="text-xl font-bold text-emerald-500">ml (A+B)</span>
                   </div>
                 </div>
                 <div className="flex gap-4 pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">EC Objetivo</p>
                      <p className="text-xl font-black tracking-tighter">{diagnosis.targetEC} µS</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Agua Base</p>
                      <p className="text-xl font-black tracking-tighter capitalize text-emerald-400">{config.waterType}</p>
                    </div>
                 </div>
               </div>
            </div>

            {diagnosis.alerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 animate-in slide-in-from-left-4 ${a.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                <AlertTriangle className="shrink-0" size={24}/>
                <div>
                  <p className="text-xs font-black uppercase tracking-tighter leading-none mb-1">Alerta del Sistema</p>
                  <p className="text-sm font-bold">{a.msg}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* PESTAÑA: TORRE MEJORADA */}
          <TabsContent value="tower" className="space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase italic tracking-widest">Matriz de Cultivo V15</h3>
                <button onClick={rotateTower} className="bg-slate-950 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                  <RotateCw size={14}/> ROTAR PLANTAS
                </button>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {tower.map((plant, i) => (
                  <div key={i} className={`aspect-square rounded-[1.5rem] border-2 flex flex-col items-center justify-center relative transition-all duration-500 ${plant ? `border-emerald-500 ${plant.bg}` : 'border-dashed border-slate-200 bg-slate-50'}`}>
                    <span className="absolute top-1 left-2.5 text-[8px] font-black text-slate-300">{i+1}</span>
                    {plant ? (
                      <>
                        <div className={`${plant.color} animate-in zoom-in`}>{plant.icon}</div>
                        <button onClick={() => { const n = [...tower]; n[i] = null; setTower(n); }} className="absolute -top-1 -right-1 bg-white border border-slate-200 rounded-full p-1 text-red-500 shadow-sm"><Trash2 size={10}/></button>
                      </>
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
                }} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all">
                  <div className={v.color}>{v.icon}</div>
                  <span className="text-[9px] font-black uppercase mt-2">{v.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* PESTAÑA: MANUAL TÉCNICO PROFUNDO */}
          <TabsContent value="manual" className="space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-8">
              <section>
                <div className="
