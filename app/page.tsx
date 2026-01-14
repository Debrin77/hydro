"use client"

import React, { useState, useMemo, useEffect } from "react"
import { 
  Sprout, Beaker, Plus, Trash2, Lightbulb, Droplets, Thermometer, 
  Zap, ChevronRight, Home, Settings, Gauge, Sun, Waves, 
  Wind, Timer, ClipboardList, Activity, FlaskConical, 
  RefreshCw, Layers, AlertCircle, Info, Check, Filter, Brain,
  GitCompare, AlertOctagon, ArrowDownCircle, CloudRain
} from "lucide-react"

// ============================================================================
// LÓGICA TÉCNICA AVANZADA (RECUPERADA Y COMPLETA)
// ============================================================================

const WATER_TYPES = {
  "osmosis": { name: "Ósmosis Inversa", ecBase: 0, hardness: 0, phBase: 7.0, calmag: true, desc: "Requiere estabilización y CalMag." },
  "blanda": { name: "Mezcla Blanda", ecBase: 350, hardness: 80, phBase: 7.2, calmag: false, desc: "Mezcla óptima zona Levante." },
  "dura_cs": { name: "Grifo Castellón", ecBase: 950, hardness: 350, phBase: 8.2, calmag: false, desc: "Alto contenido en carbonatos." }
}

const VARIETIES = {
  "Romana": { name: "L. Romana", ecRange: [0.8, 1.4, 1.7], phIdeal: 6.0, color: "#10b981" },
  "Hoja Roble": { name: "H. Roble", ecRange: [0.9, 1.4, 1.9], phIdeal: 6.0, color: "#ef4444" },
  "Lollo Rosso": { name: "L. Rosso", ecRange: [0.8, 1.3, 1.8], phIdeal: 6.0, color: "#a855f7" }
}

// ============================================================================
// COMPONENTES DE INTERFAZ PROFESIONAL
// ============================================================================

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
    {subtext && <p className="text-[10px] text-slate-400 mt-1 font-medium italic leading-tight">{subtext}</p>}
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
    isPoniente: false,
    osmosisMix: 100
  })

  // --- MOTOR DE CÁLCULO DE ALTA PRECISIÓN (Recuperado del código original) ---
  const analysis = useMemo(() => {
    if (plants.length === 0) return null

    // 1. Cálculo de EC Objetivo ponderada
    let totalTargetEC = 0
    plants.forEach(p => {
      const v = VARIETIES[p.variety as keyof typeof VARIETIES]
      totalTargetEC += v.ecRange[p.level - 1]
    })
    let targetEC = (totalTargetEC / plants.length) * 1000
    
    // 2. Ajuste por Clima de Castellón (Efecto Poniente)
    const climateFactor = (config.temp > 26 || config.isPoniente) ? 0.82 : 1.0
    targetEC *= climateFactor

    // 3. Cálculo de Nutrientes (Lógica CANNA A+B)
    const waterBase = WATER_TYPES[config.waterType as keyof typeof WATER_TYPES].ecBase
    const netECNeeded = Math.max(0, targetEC - waterBase)
    const dosageTotal = (netECNeeded / 500) * config.vol 

    // 4. Diagnóstico de CalMag (Específico para Ósmosis)
    const calmagNeeded = config.waterType === "osmosis" ? (config.vol * 0.8).toFixed(1) : "0"

    // 5. Diagnóstico de pH y estabilidad (Poder Tampón)
    const phStability = config.waterType === "osmosis" ? "CRÍTICA (Bajo Tampón)" : 
                       config.waterType === "dura_cs" ? "ALTA (Agua Dura)" : "ESTABLE"

    return {
      targetEC: Math.round(targetEC),
      doseA: (dosageTotal / 2).toFixed(1),
      doseB: (dosageTotal / 2).toFixed(1),
      calmag: calmagNeeded,
      irrigation: config.temp > 25 ? "15m ON / 20m OFF" : "15m ON / 45m OFF",
      phStability,
      ecAlert: config.ecActual > targetEC + 300 ? "ALTA" : config.ecActual < targetEC - 300 ? "BAJA" : "OK"
    }
  }, [plants, config])

  const addPlant = (variety: string) => {
    if (plants.length < 15) setPlants([...plants, { id: Date.now(), variety, level: 1 }])
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header Estilo Industrial */}
      <header className="bg-slate-900 text-white p-5 sticky top-0 z-50 shadow-lg border-b border-emerald-500/30">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="text-emerald-400" size={18} />
              <h1 className="text-lg font-black tracking-tighter uppercase italic">
                System<span className="text-emerald-400 text-sm ml-1">V15-PRO</span>
              </h1>
            </div>
            <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">
              Castellón Tower • Grodan 2.5 Logic
            </p>
          </div>
          <div className="text-right">
            {config.isPoniente && (
              <div className="bg-orange-500/20 text-orange-400 text-[8px] px-2 py-0.5 rounded-full font-bold animate-pulse mb-1">
                PONIENTE ACTIVO: EC -18%
              </div>
            )}
            <p className="text-xs font-mono font-bold text-slate-300 uppercase">Status: <span className="text-emerald-400">Nominal</span></p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* NAVEGACIÓN POR PESTAÑAS TÉCNICAS */}
        <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "dashboard", icon: Home, label: "Resumen" },
            { id: "tower", icon: Layers, label: "Matriz V15" },
            { id: "control", icon: FlaskConical, label: "Química" },
            { id: "sensors", icon: Gauge, label: "Telemetría" },
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

        {/* CONTENIDO: DASHBOARD / RESUMEN */}
        {tab === "dashboard" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="EC Objetivo" value={analysis?.targetEC || "0"} unit="µS/cm" icon={Zap} subtext="Compensado por evaporación" />
              <StatCard label="pH de Consigna" value="6.0" unit="pH" icon={Activity} subtext="Ideal para Lana de Roca" color="blue" />
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xl border border-slate-700">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Mezcla Requerida (Canna Aqua)</h3>
              <div className="grid grid-cols-3 gap-4 border-b border-slate-800 pb-4 mb-4">
                <div className="text-center border-r border-slate-800">
                  <p className="text-2xl font-black">{analysis?.doseA}<span className="text-[10px] ml-1 text-slate-500">ml</span></p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Parte A</p>
                </div>
                <div className="text-center border-r border-slate-800">
                  <p className="text-2xl font-black">{analysis?.doseB}<span className="text-[10px] ml-1 text-slate-500">ml</span></p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Parte B</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-blue-400">{analysis?.calmag}<span className="text-[10px] ml-1 text-slate-500">ml</span></p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">CalMag</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-500 italic">Pre-tratamiento: Mezclar CalMag 3min antes de A+B</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Agua: {WATER_TYPES[config.waterType as keyof typeof WATER_TYPES].name}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg"><Timer size={18}/></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Riego Grodan 2.5</p>
                  <p className="text-sm font-black text-slate-900">{analysis?.irrigation}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Poder Tampón</p>
                <p className={`text-[10px] font-black ${config.waterType === 'osmosis' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {analysis?.phStability}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO: MATRIZ V15 (Gestión de Plantas) */}
        {tab === "tower" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} className="text-emerald-500"/> Matriz de Ocupación V15
                </h3>
                <span className="text-[10px] font-black bg-slate-900 px-2 py-1 rounded text-white uppercase tracking-tighter">
                  Nodes: {plants.length} / 15
                </span>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-8">
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
                    className={`aspect-square rounded border-2 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      plants[i] 
                      ? 'border-emerald-500 bg-white shadow-sm' 
                      : 'border-dashed border-slate-200 bg-slate-50'
                    }`}
                  >
                    {plants[i] ? (
                      <>
                        <span className="text-[11px] font-black text-slate-900">{plants[i].variety.substring(0,3).toUpperCase()}</span>
                        <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-0.5">
                          {[...Array(3)].map((_, l) => (
                            <div key={l} className={`h-1 flex-1 rounded-full ${plants[i].level > l ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                          ))}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPlants(plants.filter((_, idx) => idx !== i)) }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 border border-white"
                        >
                          <Trash2 size={8} />
                        </button>
                      </>
                    ) : <Plus size={12} className="text-slate-300" />}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.keys(VARIETIES).map(v => (
                  <button 
                    key={v}
                    onClick={() => addPlant(v)}
                    className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[9px] font-black uppercase tracking-tighter transition-all"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO: TELEMETRÍA (Sensores y Historial) */}
        {tab === "sensors" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sonda pH (Lectura Real)</label>
                  <span className="text-3xl font-black text-emerald-600 font-mono tracking-tighter leading-none">{config.phActual.toFixed(1)}</span>
                </div>
                <input type="range" min="4" max="8.5" step="0.1" value={config.phActual} onChange={(e) => setConfig({...config, phActual: parseFloat(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sonda EC (µS/cm)</label>
                  <span className="text-3xl font-black text-blue-600 font-mono tracking-tighter leading-none">{config.ecActual}</span>
                </div>
                <input type="range" min="0" max="2500" step="10" value={config.ecActual} onChange={(e) => setConfig({...config, ecActual: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>

              <button 
                onClick={() => {
                  const log = { id: Date.now(), t: new Date().toLocaleTimeString(), ph: config.phActual, ec: config.ecActual };
                  setHistory([log, ...history]);
                }}
                className="w-full bg-slate-900 text-white py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                <ClipboardList size={18} className="text-emerald-400" /> Registrar en Base de Datos
              </button>
            </div>

            {/* LOGS HISTÓRICOS */}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Historial de Calibración</p>
              {history.length === 0 && <div className="text-center py-8 text-slate-300 text-[10px] uppercase font-bold border-2 border-dashed border-slate-100 rounded-xl">Sin datos registrados</div>}
              {history.map(h => (
                <div key={h.id} className="bg-white border border-slate-100 p-3 rounded-lg flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 font-mono">{h.t}</span>
                  <div className="flex gap-6 uppercase">
                    <span className="text-emerald-600">pH {h.ph}</span>
                    <span className="text-blue-600">EC {h.ec} µS</span>
                  </div>
                  <button onClick={() => setHistory(history.filter(x => x.id !== h.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROTOCOLOS TÉCNICOS (Recuperado el contenido de Castellón y Lana de Roca) */}
        {tab === "tips" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border-l-4 border-emerald-500 p-5 rounded-r-xl shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-emerald-600 mb-2 flex items-center gap-2">
                <RefreshCw size={14}/> Protocolo Grodan 2.5x2.5
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed font-bold italic">
                - Hidratar dados a pH 5.5 durante 24h antes del uso.<br/>
                - Mantener saturación al 75% para evitar hipoxia.<br/>
                - En niveles 2 y 3, aumentar frecuencia de riego ante el aumento de transpiración foliar.
              </p>
            </div>

            <div className="bg-slate-900 text-white border-l-4 border-orange-500 p-5 rounded-r-xl shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-orange-400 mb-2 flex items-center gap-2">
                <Wind size={14}/> Alerta Climatológica: Castellón
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
                Vientos de Poniente: La humedad cae drásticamente. El sistema activa reducción de EC automática para evitar quemaduras por exceso de sales al transpirar más agua.
              </p>
            </div>

            <div className="bg-white border-l-4 border-blue-500 p-5 rounded-r-xl shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-blue-600 mb-2 flex items-center gap-2">
                <Filter size={14}/> Manejo de Ósmosis Inversa
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed font-bold italic">
                Sin minerales base, el pH es extremadamente volátil. No aplicar ácidos hasta haber estabilizado la mezcla con CalMag y nutrientes CANNA.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* NAVBAR INFERIOR DASHBOARD */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-2 z-50">
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
