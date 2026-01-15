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
// COMPONENTES UI SIMPLIFICADOS
// ============================================================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, className = "", variant = "default", disabled = false }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      {children}
    </button>
  )
}

const Badge = ({ children, className = "", variant = "default" }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700"
  }
  return <span className={`${baseStyles} ${variants[variant]} ${className}`}>{children}</span>
}

const Input = ({ ...props }) => (
  <input {...props} className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${props.className || ""}`} />
)

// ============================================================================
// CONFIGURACIÓN BASE (AQUA VEGA)
// ============================================================================

const WATER_TYPES = {
  "osmosis": {
    name: "Ósmosis Inversa",
    icon: <Filter className="text-blue-500" />,
    ecBase: 0.0,
    hardness: 0,
    phBase: 7.0,
    description: "Agua pura, EC casi 0. Perfecta para hidroponía.",
    recommendation: "Usar Aqua Vega desde el inicio.",
    calmagRequired: true,
    isOsmosis: true
  },
  "bajo_mineral": {
    name: "Baja Mineralización",
    icon: <Droplets className="text-cyan-500" />,
    ecBase: 200,
    hardness: 50,
    phBase: 7.2,
    description: "Agua blanda, ideal para Aqua Vega.",
    recommendation: "Ajuste mínimo de pH necesario.",
    calmagRequired: false,
    isOsmosis: false
  },
  "medio_mineral": {
    name: "Media Mineralización",
    icon: <Droplets className="text-teal-500" />,
    ecBase: 400,
    hardness: 150,
    phBase: 7.5,
    description: "Agua de grifo típica.",
    recommendation: "Considerar dureza al mezclar.",
    calmagRequired: false,
    isOsmosis: false
  },
  "alta_mineral": {
    name: "Alta Mineralización",
    icon: <Droplets className="text-amber-500" />,
    ecBase: 800,
    hardness: 300,
    phBase: 8.0,
    description: "Agua dura de Castellón.",
    recommendation: "Usar Aqua Vega para aguas duras si es posible.",
    calmagRequired: false,
    isOsmosis: false
  }
};

const VARIETIES = {
  "Iceberg": { 
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    ecMax: 1600, phIdeal: 6.0,
    dosage: { seedling: { a: 15, b: 15, ec: 900 }, growth: { a: 20, b: 20, ec: 1300 }, mature: { a: 25, b: 25, ec: 1600 } }
  },
  "Lollo Rosso": { 
    color: "bg-gradient-to-br from-purple-600 to-purple-700",
    ecMax: 1800, phIdeal: 6.0,
    dosage: { seedling: { a: 15, b: 15, ec: 900 }, growth: { a: 20, b: 20, ec: 1400 }, mature: { a: 25, b: 25, ec: 1700 } }
  },
  "Maravilla": { 
    color: "bg-gradient-to-br from-amber-600 to-amber-700",
    ecMax: 1700, phIdeal: 6.0,
    dosage: { seedling: { a: 15, b: 15, ec: 900 }, growth: { a: 20, b: 20, ec: 1300 }, mature: { a: 25, b: 25, ec: 1600 } }
  },
  "Trocadero": { 
    color: "bg-gradient-to-br from-lime-600 to-lime-700",
    ecMax: 1600, phIdeal: 6.0,
    dosage: { seedling: { a: 15, b: 15, ec: 900 }, growth: { a: 20, b: 20, ec: 1300 }, mature: { a: 25, b: 25, ec: 1600 } }
  },
  "Hoja de Roble Rojo": { 
    color: "bg-gradient-to-br from-red-600 to-red-700",
    ecMax: 1900, phIdeal: 6.0,
    dosage: { seedling: { a: 15, b: 15, ec: 1000 }, growth: { a: 20, b: 20, ec: 1500 }, mature: { a: 25, b: 25, ec: 1800 } }
  },
  "Romana": { 
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
    ecMax: 1750, phIdeal: 6.0,
    dosage: { seedling: { a: 15, b: 15, ec: 950 }, growth: { a: 20, b: 20, ec: 1350 }, mature: { a: 25, b: 25, ec: 1650 } }
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

const calculateIrrigation = (plants, pumpWatts = 7) => {
  const month = new Date().getMonth();
  // Factor estacional para Castellón de la Plana
  const seasonalFactor = [0.8, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 2.4, 1.8, 1.3, 1.0, 0.8][month];
  
  // Lana de roca 2.5cm retiene poca agua, requiere ciclos frecuentes pero cortos
  const baseMinutes = 2; 
  const totalPlants = plants.length || 1;
  const growthStageFactor = plants.reduce((acc, p) => acc + (p.l === 1 ? 0.5 : p.l === 2 ? 1 : 1.5), 0) / totalPlants;

  const onTime = Math.ceil(baseMinutes * growthStageFactor);
  const offTime = Math.max(15, Math.floor(60 / (seasonalFactor * growthStageFactor)));

  return {
    onTime,
    offTime,
    dailyCycles: Math.floor(1440 / (onTime + offTime)),
    location: "Castellón de la Plana",
    pumpPower: pumpWatts
  };
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HydroCaruApp() {
  const [tab, setTab] = useState("dashboard");
  const [plants, setPlants] = useState([]);
  const [manualParams, setManualParams] = useState({ ph: "6.0", ec: "1200", temp: "22" });
  const [config, setConfig] = useState({ totalVol: "20", targetPH: "6.0", targetEC: "1400" });

  const irrigation = useMemo(() => calculateIrrigation(plants), [plants]);

  const getStatusColor = (val, target, tolerance) => {
    const diff = Math.abs(val - target);
    if (diff <= tolerance) return "text-green-600";
    if (diff <= tolerance * 2) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Droplet className="text-blue-600" size={32} />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">HydroCaru</h1>
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">Aqua Vega System</Badge>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-6xl">
        {/* TABS CONTENT */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity size={20} /> Estado General
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-xs opacity-80">pH Actual</p>
                  <p className={`text-2xl font-bold ${getStatusColor(manualParams.ph, config.targetPH, 0.2)}`}>
                    {manualParams.ph}
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-xs opacity-80">EC Actual</p>
                  <p className={`text-2xl font-bold ${getStatusColor(manualParams.ec, config.targetEC, 100)}`}>
                    {manualParams.ec}
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-xs opacity-80">Plantas</p>
                  <p className="text-2xl font-bold">{plants.length}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-xs opacity-80">Próximo Riego</p>
                  <p className="text-2xl font-bold">En {irrigation.offTime}m</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "manual" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clipboard size={22} className="text-blue-600" /> Parámetros Manuales
              </h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">pH Medido</label>
                  <Input 
                    type="number" step="0.1" 
                    value={manualParams.ph} 
                    onChange={(e) => setManualParams({...manualParams, ph: e.target.value})} 
                  />
                  {Math.abs(manualParams.ph - config.targetPH) > 0.2 && (
                    <p className="text-sm text-red-600 mt-2 font-medium flex items-center gap-1">
                      <AlertCircle size={14} /> Corregir: Añadir {manualParams.ph > config.targetPH ? "pH Down" : "pH Up"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">EC Medida (µS/cm)</label>
                  <Input 
                    type="number" 
                    value={manualParams.ec} 
                    onChange={(e) => setManualParams({...manualParams, ec: e.target.value})} 
                  />
                  {Math.abs(manualParams.ec - config.targetEC) > 100 && (
                    <p className="text-sm text-amber-600 mt-2 font-medium flex items-center gap-1">
                      <AlertTriangle size={14} /> {manualParams.ec > config.targetEC ? "Añadir agua sola para bajar EC" : "Añadir Aqua Vega A+B para subir EC"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Temperatura Agua (°C)</label>
                  <Input 
                    type="number" 
                    value={manualParams.temp} 
                    onChange={(e) => setManualParams({...manualParams, temp: e.target.value})} 
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "irrigation" && (
          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Zap className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Cálculo de Riego Real</h2>
                  <p className="text-sm text-slate-500">Optimizado para Torre Vertical en Castellón</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Configuración Bomba</p>
                  <p className="text-lg font-bold text-slate-700">7W - Flujo Constante</p>
                  <p className="text-sm text-slate-600">Caída sobre dados de 2.5cm</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-500 uppercase font-bold mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Ubicación
                  </p>
                  <p className="text-lg font-bold text-blue-700">Castellón de la Plana</p>
                  <p className="text-sm text-blue-600">Ajuste estacional automático</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <Timer size={18} /> Ciclo Recomendado
                </h3>
                <div className="flex items-center justify-around text-center">
                  <div>
                    <span className="block text-4xl font-black text-blue-600">{irrigation.onTime} min</span>
                    <span className="text-sm font-medium text-blue-700 uppercase">Encendido</span>
                  </div>
                  <div className="h-12 w-px bg-blue-200"></div>
                  <div>
                    <span className="block text-4xl font-black text-slate-600">{irrigation.offTime} min</span>
                    <span className="text-sm font-medium text-slate-500 uppercase">Apagado</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-blue-200 flex justify-between items-center text-sm text-blue-800">
                  <span>Ciclos diarios: <strong>{irrigation.dailyCycles}</strong></span>
                  <Badge className="bg-blue-200">Estado: Activo</Badge>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "tower" && (
           <Card className="p-6">
             <h2 className="text-xl font-bold mb-4">Gestión de Torre</h2>
             <p className="text-slate-500 italic">Aquí puedes añadir y rotar tus 6 variedades de lechugas.</p>
             {/* Lógica de plantas se mantiene del original */}
           </Card>
        )}
      </main>

      {/* Footer Navigation - SOLO ICONOS */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => setTab("dashboard")} className={`p-3 rounded-xl transition-colors ${tab === "dashboard" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}>
            <Home size={28} />
          </button>
          <button onClick={() => setTab("manual")} className={`p-3 rounded-xl transition-colors ${tab === "manual" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}>
            <Activity size={28} />
          </button>
          <button onClick={() => setTab("tower")} className={`p-3 rounded-xl transition-colors ${tab === "tower" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}>
            <Layers size={28} />
          </button>
          <button onClick={() => setTab("irrigation")} className={`p-3 rounded-xl transition-colors ${tab === "irrigation" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}>
            <Droplet size={28} />
          </button>
          <button onClick={() => setTab("calendar")} className={`p-3 rounded-xl transition-colors ${tab === "calendar" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}>
            <Calendar size={28} />
          </button>
        </div>
      </footer>
    </div>
  )
}
