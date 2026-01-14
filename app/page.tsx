"use client"

import React, { useState, useMemo, useEffect } from "react"
import { 
  Sprout, Beaker, Plus, Trash2, Lightbulb, Droplets, Thermometer, 
  Zap, ChevronRight, Home, Settings, Gauge, Sun, Waves, 
  Wind, Timer, ClipboardList, Activity, FlaskConical, 
  RefreshCw, Layers, AlertCircle, Info, Check, Filter, Brain
} from "lucide-react"

// --- CONSTANTES TÉCNICAS (Lógica Original) ---
const WATER_TYPES = {
  "osmosis": { name: "Ósmosis Inversa", ecBase: 0, phBase: 7.0, calmag: true, desc: "Requiere estabilización de pH y CalMag." },
  "blanda": { name: "Mezcla Blanda", ecBase: 350, phBase: 7.2, calmag: false, desc: "Mezcla óptima para zona levante." },
  "dura_cs": { name: "Grifo Castellón", ecBase: 950, phBase: 8.2, calmag: false, desc: "Alto contenido en carbonatos y cal." }
}

const VARIETIES = {
  "Romana": { name: "L. Romana", ecRange: [0.8, 1.4, 1.7], color: "#10b981" },
  "Hoja Roble": { name: "H. Roble", ecRange: [0.9, 1.4, 1.9], color: "#ef4444" },
  "Lollo Rosso": { name: "L. Rosso", ecRange: [0.8, 1.3, 1.8], color: "#a855f7" }
}

// --- COMPONENTES DE INTERFAZ PROFESIONAL ---
const StatCard = ({ label, value, unit, icon: Icon, subtext, color = "emerald" }: any) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <Icon size={16} className={`text-${color}-500`} />
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
      <span className="text-xs font-bold text-slate-400">{unit}</span>
    </div>
    {subtext && <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{subtext}</p>}
  </div>
)

export default function HydroControlPro() {
  const [tab, setTab] = useState("dashboard")
  const [plants, setPlants] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [config, setConfig] = useState({
    waterType: "osmosis",
    vol: 18,
    temp: 24,
    phActual: 7.0,
    ecActual: 0,
    isPoniente: false
  })

  // --- MOTOR DE CÁLCULO DE PRECISIÓN ---
  const analysis = useMemo(() => {
    if (plants.length === 0) return null

    let totalTargetEC = 0
    plants.forEach(p => {
      const v = VARIETIES[p.variety as keyof typeof VARIETIES]
      totalTargetEC += v.ecRange[p.level - 1]
    })

    let targetEC = (totalTargetEC / plants.length) * 1000
    
    // Ajuste por Clima de Castellón (Poniente/Calor)
    const climateFactor = (config.temp > 26 || config.isPoniente) ? 0.82 : 1.0
    targetEC *= climateFactor

    const waterBase = WATER_TYPES[config.waterType as keyof typeof WATER_TYPES].ecBase
    const netECNeeded = Math.max(0, targetEC - waterBase)
    
    // Dosificación CANNA Aqua Vega (Basado en 2ml/L para 1000µS)
    const dosageMl = (netECNeeded / 500) * config.vol 

    return {
      targetEC: Math.round(targetEC),
      doseA: (dosageMl / 2).toFixed(1),
      doseB: (dosageMl / 2).toFixed(1),
      calmag: config.waterType === "osmosis" ? (config.vol * 0.8).toFixed(1) : "0",
      irrigation: config.temp > 25 ? "15m ON / 15m OFF" : "15m ON / 45m OFF",
      phStability: config.waterType === "osmosis" ? "CRÍTICA" : config.temp > 27 ? "BAJA" : "ALTA"
    }
  }, [plants, config])

  const addPlant = (variety: string) => {
    if (plants.length < 15) setPlants([...plants, { id: Date.now(), variety, level: 1 }])
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header Técnico */}
      <header className="bg-slate-900 text-white p-5 sticky top-0 z-50 shadow-lg border-b border-emerald-500/30">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="text-emerald-400" size={18} />
              <h1 className="text-lg font-black tracking-tighter uppercase italic">
                System<span className="text-emerald-400 text-sm ml-1">V15-CS</span>
              </h1>
            </div>
            <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">
              Castellón Tower • Hydroponic Control
            </p>
          </div>
          <div className="text-right">
            <div className="flex gap-2 justify-end mb-1">
              {config.isPoniente && <span className="bg-orange-500/20 text-orange-400 text-[8px] px-2 py-0.5 rounded-full font-bold animate-pulse">ALERTA PONIENTE</span>}
              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-2 py-0.5 rounded-full font-bold">ACTIVO</span>
            </div>
            <p className="text-xs font-mono font-bold text-slate-300">T: {config.temp}°C | V: {config.vol}L</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* NAVEGACIÓN TÉCNICA */}
        <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "dashboard", icon: Home, label: "Resumen" },
            { id: "tower", icon: Layers, label: "Torre" },
            { id: "control", icon: FlaskConical, label: "Nutrientes" },
            { id: "sensors", icon: Gauge, label: "Sensores" },
            { id: "tips", icon: Brain, label: "Protocolos" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${
                tab === t.id ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-400 border border-slate-200"
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO: DASHBOARD */}
        {tab === "dashboard" && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
            <StatCard 
              label="EC Objetivo" 
              value={analysis?.targetEC || "0"} 
              unit="µS/cm" 
              icon={Zap} 
              subtext="Compensado por clima"
            />
            <StatCard 
              label="Dosificación A+B" 
              value={analysis?.doseA || "0"} 
              unit="ml" 
              icon={FlaskConical} 
              subtext="Canna Aqua Vega (c/u)"
              color="blue"
            />
            <div className="col-span-2 bg-slate-900 text-white rounded-xl p-5 flex justify-between items-center shadow-inner">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <Timer size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Frecuencia Riego</p>
                  <p className="text-xl font-black">{analysis?.irrigation || "No definido"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estabilidad pH</p>
                <p className={`text-sm font-black ${analysis?.phStability === "ALTA" ? "text-emerald-400" : "text-orange-400"}`}>
                  {analysis?.phStability || "---"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO: TORRE (15 PLANTAS) */}
        {tab === "tower" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} className="text-emerald-500"/> Matriz de Cultivo (V15)
                </h3>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">
                  Ocupación: {plants.length} / 15
                </span>
              </div>
              
              <div className="grid grid-cols-5 gap-3 mb-6">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      if (plants[i]) {
                        const newPlants = [...plants];
                        newPlants[i].level = (newPlants[i].level % 3) + 1;
                        setPlants(newPlants);
                      }
                    }}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      plants[i] 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {plants[i] ? (
                      <>
                        <span className="text-[10px] font-black text-emerald-700">{plants[i].variety[0]}</span>
                        <div className="w-full absolute bottom-0 h-1 bg-emerald-500 rounded-b-sm" 
                             style={{ opacity: plants[i].level / 3 }} />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPlants(plants.filter((_, idx) => idx !== i)) }}
                          className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-sm p-0.5 border border-slate-100"
                        >
                          <Trash2 size={10} />
                        </button>
                      </>
                    ) : <Plus size={14} className="text-slate-300" />}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {Object.keys(VARIETIES).map(v => (
                  <button 
                    key={v}
                    onClick={() => addPlant(v)}
                    className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-tighter"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO: SENSORES */}
        {tab === "sensors" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lectura pH Actual</label>
                  <span className="text-3xl font-black text-emerald-600 font-mono leading-none">{config.phActual.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="4" max="8.5" step="0.1" 
                  value={config.phActual} 
                  onChange={(e) => setConfig({...config, phActual: parseFloat(e.target.value)})}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lectura EC Real (µS/cm)</label>
                  <span className="text-3xl font-black text-blue-600 font-mono leading-none">{config.ecActual}</span>
                </div>
                <input 
                  type="range" min="0" max="2500" step="10" 
                  value={config.ecActual} 
                  onChange={(e) => setConfig({...config, ecActual: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <button 
                onClick={() => {
                  const log = { id: Date.now(), t: new Date().toLocaleTimeString(), ph: config.phActual, ec: config.ecActual };
                  setHistory([log, ...history]);
                }}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                <ClipboardList size={18} className="text-emerald-400" /> Registrar en Log de Sistema
              </button>
            </div>

            {/* LOGS HISTÓRICOS */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Historial de Calibración</p>
              {history.map(h => (
                <div key={h.id} className="bg-white border border-slate-100 p-3 rounded-lg flex justify-between items-center text-[11px] font-bold">
                  <span className="text-slate-400 font-mono">{h.t}</span>
                  <div className="flex gap-4 uppercase tracking-tighter">
                    <span className="text-emerald-600">pH {h.ph}</span>
                    <span className="text-blue-600">EC {h.ec}</span>
                  </div>
                  <button onClick={() => setHistory(history.filter(x => x.id !== h.id))} className="text-slate-200 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO: PROTOCOLOS (Tips avanzados) */}
        {tab === "tips" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border-l-4 border-emerald-500 p-5 rounded-r-xl shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-emerald-600 mb-2 flex items-center gap-2">
                <RefreshCw size={14}/> Protocolo Transplante Suelo-Lana
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic">
                1. Lavado exhaustivo de raíces en agua templada (22°C).<br/>
                2. Poda de raíz excedente si supera los 15cm.<br/>
                3. Inserción en dado de 2.5cm estabilizado (pH 5.2).<br/>
                4. Colocación en cesta técnica a media altura (No inmersión total).
              </p>
            </div>

            <div className="bg-white border-l-4 border-blue-500 p-5 rounded-r-xl shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-blue-600 mb-2 flex items-center gap-2">
                <Filter size={14}/> Estabilización de Ósmosis
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic">
                El agua de ósmosis no tiene tampón (KH 0). Añadir siempre CalMag hasta alcanzar EC 200µS antes de incorporar Aqua Vega A+B para evitar oscilaciones de pH letales.
              </p>
            </div>

            <div className="bg-slate-900 border-l-4 border-orange-500 p-5 rounded-r-xl shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-orange-400 mb-2 flex items-center gap-2">
                <Wind size={14}/> Incidencia Poniente Castellón
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                En eventos de viento seco del interior, la planta transpira un 40% más. El sistema reduce la EC automáticamente para prevenir la necrosis de puntas por acumulación de sales.
              </p>
            </div>
          </div>
        )}

        {/* PESTAÑA: AJUSTES */}
        {tab === "settings" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-4">Configuración de Agua Base</label>
              <div className="space-y-2">
                {Object.entries(WATER_TYPES).map(([key, val]) => (
                  <button 
                    key={key} 
                    onClick={() => setConfig({...config, waterType: key})}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                      config.waterType === key ? "border-emerald-500 bg-emerald-50" : "border-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{val.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{val.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-slate-500">{val.ecBase} µS</Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.isPoniente ? "bg-orange-100 text-orange-600" : "bg-slate-100"}`}>
                  <Wind size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase italic">Modo Poniente</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Compensación Climática</p>
                </div>
              </div>
              <button 
                onClick={() => setConfig({...config, isPoniente: !config.isPoniente})}
                className={`w-14 h-7 rounded-full transition-all relative ${config.isPoniente ? "bg-orange-500" : "bg-slate-200"}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${config.isPoniente ? "right-1" : "left-1"}`} />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase tracking-widest">
                <span>Temp. Depósito</span>
                <span className="text-slate-900">{config.temp}°C</span>
              </div>
              <input 
                type="range" min="15" max="32" 
                value={config.temp} 
                onChange={(e) => setConfig({...config, temp: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
          </div>
        )}

      </main>

      {/* NAVBAR INFERIOR ESTILO DASHBOARD PROFESIONAL */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-2 z-50">
        <div className="max-w-2xl mx-auto grid grid-cols-5 gap-1">
          {[
            { id: "dashboard", icon: Home },
            { id: "tower", icon: Layers },
            { id: "sensors", icon: Gauge },
            { id: "tips", icon: Brain },
            { id: "settings", icon: Settings }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setTab(btn.id)}
              className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                tab === btn.id ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <btn.icon size={20} />
              <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{btn.id}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  )
}

function Badge({ children, variant = "default", className = "" }: any) {
  const styles: any = {
    default: "bg-emerald-100 text-emerald-700",
    outline: "border border-slate-200 text-slate-600",
  }
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${styles[variant]} ${className}`}>{children}</span>
}
