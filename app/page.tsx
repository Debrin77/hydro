"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, 
  Thermometer, Zap, ShieldAlert, ChevronRight, Anchor, 
  ArrowLeft, ArrowRight, Bell, CloudRain, ThermometerSun, 
  RefreshCw, Skull, Info, Calculator, Filter, 
  Power, Timer, Gauge, Cloud, Sun, Moon, CloudSun, 
  WindIcon, Clipboard, ThermometerSnowflake, TreePine, Settings,
  Home, BarChart3, X, RotateCcw, AlertCircle,
  Droplet, Leaf, TimerReset, ThermometerCold,
  ChevronDown, ChevronUp, Eye, EyeOff, CloudRain as Rain,
  Thermometer as Temp, Wind as Breeze, Target,
  Brain, AlertOctagon, Waves, GitCompare, BarChart, MapPin
} from "lucide-react"

// ============================================================================
// COMPONENTES UI (DISEÑO LIMPIO)
// ============================================================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
)

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-slate-100 text-slate-600",
    danger: "bg-red-100 text-red-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600"
  }
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[variant]}`}>{children}</span>
}

// ============================================================================
// LÓGICA DE NEGOCIO (AQUA VEGA & CASTELLÓN)
// ============================================================================

const VARIETIES = {
  "Iceberg": { color: "bg-cyan-500", ecMax: 1600, phIdeal: 6.0 },
  "Lollo Rosso": { color: "bg-red-500", ecMax: 1800, phIdeal: 6.0 },
  "Maravilla": { color: "bg-emerald-500", ecMax: 1700, phIdeal: 6.0 },
  "Trocadero": { color: "bg-lime-500", ecMax: 1600, phIdeal: 6.0 },
  "Hoja Roble": { color: "bg-orange-600", ecMax: 1900, phIdeal: 6.0 },
  "Romana": { color: "bg-green-600", ecMax: 1750, phIdeal: 6.0 }
};

export default function HydroCaru() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [plants, setPlants] = useState([])
  
  // PARÁMETROS DE CONFIGURACIÓN
  const [config, setConfig] = useState({
    vol: 20,
    targetPH: 6.0,
    targetEC: 1400,
    tempIdeal: 21
  })

  // MEDICIONES MANUALES (EL MOTOR DE ALERTAS)
  const [manual, setManual] = useState({
    ph: "",
    ec: "",
    tempAgua: "",
    humedadAmb: ""
  })

  // --- 1. LÓGICA DE DIAGNÓSTICO Y CORRECCIÓN ---
  const diagnosis = useMemo(() => {
    const alerts = [];
    if (!manual.ph || !manual.ec) return alerts;

    // Diagnóstico pH
    const phNum = parseFloat(manual.ph);
    if (phNum > 6.5) {
      alerts.push({
        title: "pH DEMASIADO ALTO",
        desc: `Nivel actual: ${phNum}. Bloqueo de micronutrientes inminente.`,
        fix: `Añadir 0.1ml por litro de pH Down (Total: ${(config.vol * 0.1).toFixed(1)}ml) y volver a medir en 10 min.`,
        type: "danger",
        icon: <AlertOctagon className="text-red-500" />
      });
    } else if (phNum < 5.5) {
      alerts.push({
        title: "pH DEMASIADO BAJO",
        desc: `Nivel actual: ${phNum}. Riesgo de toxicidad por metales.`,
        fix: "Añadir agua del grifo (Castellón es alcalina) o pH Up para subir a 6.0.",
        type: "danger",
        icon: <AlertOctagon className="text-red-500" />
      });
    }

    // Diagnóstico EC (Aqua Vega)
    const ecNum = parseInt(manual.ec);
    if (ecNum > config.targetEC + 200) {
      const surplus = ecNum - config.targetEC;
      const waterToAdd = ((surplus / config.targetEC) * config.vol).toFixed(1);
      alerts.push({
        title: "EC ALTA (SOLUCIÓN CONCENTRADA)",
        desc: `La EC de ${ecNum}µS supera el límite de seguridad.`,
        fix: `Añadir ${waterToAdd}L de agua sola para diluir sales y bajar la EC.`,
        type: "warning",
        icon: <FlaskConical className="text-amber-500" />
      });
    } else if (ecNum < config.targetEC - 200) {
      alerts.push({
        title: "EC BAJA (CARENCIA NUTRICIONAL)",
        desc: "Las plantas están consumiendo más nutrientes de los disponibles.",
        fix: `Añadir dosis de refuerzo Aqua Vega A+B (1ml/L cada uno) para subir EC.`,
        type: "blue",
        icon: <Beaker className="text-blue-500" />
      });
    }

    return alerts;
  }, [manual, config]);

  // --- 2. CÁLCULO DE RIEGO ESPECÍFICO (CASTELLÓN/7W) ---
  const irrigation = useMemo(() => {
    const month = new Date().getMonth();
    const seasonalFactor = [0.8, 0.9, 1.1, 1.4, 1.8, 2.4, 2.8, 2.6, 1.9, 1.3, 1.0, 0.8][month];
    
    // Lana de roca 2.5cm: Poca retención. 
    // Bomba 7W: Caudal moderado para torre vertical.
    const onTime = Math.ceil(3 * (plants.length > 12 ? 1.3 : 1));
    const offTime = Math.max(15, Math.floor(45 / seasonalFactor));

    return { onTime, offTime, totalCycles: Math.floor(1440 / (onTime + offTime)) };
  }, [plants]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* HEADER RE-BRANDED */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Droplets size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter text-slate-800">HydroCaru</h1>
              <Badge variant="blue">Aqua Vega Expert</Badge>
            </div>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-2xl flex items-center gap-2">
            <MapPin size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase">Castellón</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">

        {/* --- PESTAÑA DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5 border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <p className="text-[10px] font-black opacity-70 uppercase mb-4 tracking-widest">Nutrición Base</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">Aqua Vega A</span>
                    <span className="text-xl font-black">{(config.vol * 2)}ml</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">Aqua Vega B</span>
                    <span className="text-xl font-black">{(config.vol * 2)}ml</span>
                  </div>
                </div>
              </Card>
              <Card className="p-5 bg-white flex flex-col justify-center items-center border-2 border-blue-50">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Plantas Activas</p>
                <span className="text-4xl font-black text-slate-800">{plants.length}</span>
                <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase">Torre Vertical</p>
              </Card>
            </div>

            {/* Alertas Críticas Visibles en Dashboard */}
            {diagnosis.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-red-500 uppercase ml-1">Atención Requerida</p>
                {diagnosis.map((alert, i) => (
                  <div key={i} className={`p-4 rounded-2xl border-l-4 flex gap-4 shadow-sm ${
                    alert.type === "danger" ? "bg-red-50 border-red-500" : 
                    alert.type === "warning" ? "bg-amber-50 border-amber-500" : "bg-blue-50 border-blue-500"
                  }`}>
                    <div className="mt-1">{alert.icon}</div>
                    <div>
                      <p className={`text-xs font-black uppercase ${alert.type === "danger" ? "text-red-700" : alert.type === "warning" ? "text-amber-700" : "text-blue-700"}`}>
                        {alert.title}
                      </p>
                      <p className="text-xs font-bold text-slate-600 mt-1">{alert.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- PESTAÑA MEDICIONES MANUALES --- */}
        {activeTab === "manual" && (
          <div className="space-y-6 animate-in zoom-in-95">
            <Card className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="text-blue-500" /> ENTRADA DE DATOS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">pH Medido (Digital)</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all"
                    value={manual.ph}
                    onChange={(e) => setManual({...manual, ph: e.target.value})}
                    placeholder="Ej: 6.2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">EC Medida (µS/cm)</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all"
                    value={manual.ec}
                    onChange={(e) => setManual({...manual, ec: e.target.value})}
                    placeholder="Ej: 1400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Temperatura Agua (°C)</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black focus:border-blue-500 outline-none transition-all"
                    value={manual.tempAgua}
                    onChange={(e) => setManual({...manual, tempAgua: e.target.value})}
                    placeholder="22"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Humedad Ambiente (%)</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black focus:border-blue-500 outline-none transition-all"
                    value={manual.humedadAmb}
                    onChange={(e) => setManual({...manual, humedadAmb: e.target.value})}
                    placeholder="65"
                  />
                </div>
              </div>

              {manual.ph && (
                <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white">
                  <h3 className="text-xs font-black text-blue-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <Brain size={16}/> Análisis HydroCaru
                  </h3>
                  {diagnosis.length > 0 ? (
                    <div className="space-y-4">
                      {diagnosis.map((d, i) => (
                        <div key={i} className="border-l-2 border-blue-500 pl-4">
                          <p className="text-xs font-black text-white uppercase">{d.title}</p>
                          <p className="text-sm text-slate-400 mt-1 italic">{d.fix}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Check size={20} />
                      <p className="text-sm font-bold uppercase">Parámetros en rango óptimo para Aqua Vega</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* --- PESTAÑA RIEGO --- */}
        {activeTab === "irrigation" && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <Card className="p-8 border-none bg-blue-600 text-white shadow-2xl shadow-blue-200">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter">RIEGO EN TIEMPO REAL</h2>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Torre Vertical Hidropónica</p>
                </div>
                <Zap className="text-white/40" size={40} />
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <p className="text-[10px] font-black text-blue-200 uppercase mb-2">Bomba Encendida</p>
                  <span className="text-5xl font-black tracking-tighter">{irrigation.onTime}</span>
                  <span className="ml-2 text-xl font-bold opacity-60">min</span>
                </div>
                <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <p className="text-[10px] font-black text-blue-200 uppercase mb-2">Bomba Apagada</p>
                  <span className="text-5xl font-black tracking-tighter">{irrigation.offTime}</span>
                  <span className="ml-2 text-xl font-bold opacity-60">min</span>
                </div>
              </div>

              <div className="mt-10 p-6 bg-black/10 rounded-3xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-200" />
                  <span className="text-sm font-bold uppercase">Ciclos al día</span>
                </div>
                <span className="text-3xl font-black">{irrigation.totalCycles}</span>
              </div>
              
              <p className="mt-6 text-[10px] text-blue-100 font-medium italic opacity-80 leading-relaxed">
                * Configuración calculada para bomba de 7W y sustrato de lana de roca (2.5cm) en Castellón de la Plana. 
                Ajuste estacional aplicado.
              </p>
            </Card>
          </div>
        )}

        {/* --- PESTAÑA CALENDARIO --- */}
        {activeTab === "calendar" && (
          <Card className="p-6 animate-in fade-in">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 uppercase italic">
              <Calendar className="text-indigo-500" /> Histórico de Cultivo
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(28)].map((_, i) => (
                <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-black ${
                  i < 15 ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-slate-100 text-slate-400"
                }`}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="p-2 bg-indigo-600 rounded-xl text-white"><Sprout size={16}/></div>
                <div>
                  <p className="text-xs font-black text-indigo-900 uppercase">Fase de Crecimiento</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase">Aqua Vega activado • Día 15/45</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* --- PESTAÑA TORRE (PLANTAS) --- */}
        {activeTab === "tower" && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 uppercase italic">Selector de Variedades</h2>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(VARIETIES).map(([name, data]) => (
                  <button 
                    key={name}
                    onClick={() => setPlants([...plants, { id: Date.now(), name }])}
                    className="flex flex-col items-center p-4 border-2 border-slate-50 rounded-3xl hover:border-blue-500 hover:bg-blue-50 transition-all group active:scale-90"
                  >
                    <div className={`w-12 h-12 rounded-full ${data.color} flex items-center justify-center text-white mb-2 shadow-lg group-hover:rotate-12 transition-transform`}>
                      <Leaf size={24} />
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase text-center">{name}</span>
                  </button>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-3">
              {plants.map((p, i) => (
                <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase italic">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Torre Vertical • Nivel {Math.ceil((i+1)/4)}</p>
                    </div>
                  </div>
                  <button onClick={() => setPlants(plants.filter(x => x.id !== p.id))} className="text-slate-300 hover:text-red-500 p-2">
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* --- NAVEGACIÓN INFERIOR (SOLO ICONOS) --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-4 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {[
            { id: "dashboard", icon: <Home size={28} /> },
            { id: "manual", icon: <Activity size={28} /> },
            { id: "tower", icon: <Layers size={28} /> },
            { id: "irrigation", icon: <Droplet size={28} /> },
            { id: "calendar", icon: <Calendar size={28} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-200 -translate-y-2 scale-110" 
                : "text-slate-400 hover:text-blue-500 hover:bg-blue-50"
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
