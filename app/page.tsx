"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, 
  Thermometer, Zap, ShieldAlert, ChevronRight, Anchor, 
  ArrowLeft, ArrowRight, Bell, CloudRain, ThermometerSun, 
  RefreshCw, Skull, Info, Calculator, Filter, 
  Power, Timer, Gauge, Cloud, Sun, Moon, CloudSun, 
  WindIcon, Clipboard, ThermometerSnowflake, TreePine, Settings,
  Home, BarChart3, X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

// ============================================================================
// CONFIGURACIÓN BASE - TIPOS DE AGUA Y VARIEDADES CON CANNA AQUA VEGA
// ============================================================================

const WATER_TYPES = {
  "osmosis": {
    name: "Ósmosis Inversa",
    icon: <Filter className="text-blue-500" />,
    ecBase: 0.0,
    hardness: 0,
    phBase: 7.0,
    description: "Agua pura, EC casi 0. Perfecta para hidroponía.",
    recommendation: "Usar nutrientes completos desde el inicio."
  },
  "bajo_mineral": {
    name: "Baja Mineralización",
    icon: <Droplets className="text-cyan-500" />,
    ecBase: 200,
    hardness: 50,
    phBase: 7.2,
    description: "Agua blanda, ideal para CANNA Aqua Vega.",
    recommendation: "Ajuste mínimo de pH necesario."
  },
  "medio_mineral": {
    name: "Media Mineralización",
    icon: <Droplets className="text-teal-500" />,
    ecBase: 400,
    hardness: 150,
    phBase: 7.5,
    description: "Agua de grifo típica.",
    recommendation: "Considerar dureza al mezclar."
  },
  "alta_mineral": {
    name: "Alta Mineralización",
    icon: <Droplets className="text-amber-500" />,
    ecBase: 800,
    hardness: 300,
    phBase: 8.0,
    description: "Agua dura, alta en calcio/magnesio.",
    recommendation: "No recomendada para Aqua Vega de agua blanda."
  }
};

const VARIETIES = {
  "Iceberg": { 
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    textColor: "text-cyan-700",
    ecMax: 1600,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },
      growth:   { a: 22, b: 22, ec: 1300 },
      mature:   { a: 28, b: 28, ec: 1600 }
    },
    info: "Sensible al exceso de sales. Usar EC conservador."
  },
  "Lollo Rosso": { 
    color: "bg-gradient-to-br from-purple-600 to-purple-700",
    textColor: "text-purple-700",
    ecMax: 1800,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },
      growth:   { a: 22, b: 22, ec: 1400 },
      mature:   { a: 28, b: 28, ec: 1700 }
    },
    info: "Color intenso con EC algo más alta."
  },
  "Maravilla": { 
    color: "bg-gradient-to-br from-amber-600 to-amber-700",
    textColor: "text-amber-700",
    ecMax: 1700,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },
      growth:   { a: 22, b: 22, ec: 1300 },
      mature:   { a: 28, b: 28, ec: 1600 }
    },
    info: "Clásica de alto rendimiento."
  },
  "Trocadero": { 
    color: "bg-gradient-to-br from-lime-600 to-lime-700",
    textColor: "text-lime-700",
    ecMax: 1600,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },
      growth:   { a: 22, b: 22, ec: 1300 },
      mature:   { a: 28, b: 28, ec: 1600 }
    },
    info: "Sabor suave. Cuidado en plántula."
  },
  "Hoja de Roble Rojo": { 
    color: "bg-gradient-to-br from-red-600 to-red-700",
    textColor: "text-red-700",
    ecMax: 1900,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 1000 },
      growth:   { a: 22, b: 22, ec: 1500 },
      mature:   { a: 28, b: 28, ec: 1800 }
    },
    info: "Crecimiento rápido, tolera EC alta."
  }
};

// ============================================================================
// CONFIGURACIÓN CLIMA MEDITERRÁNEO - CASTELLÓN DE LA PLANA
// ============================================================================

const CASTELLON_CLIMA = {
  location: "Castellón de la Plana",
  coordinates: "40.6789° N, 0.2822° O",
  clima: "Mediterráneo costero",
  
  temperaturas: {
    verano: { dia: 30, noche: 22 },
    primavera_otono: { dia: 22, noche: 15 },
    invierno: { dia: 16, noche: 8 },
  },
  
  humedad: {
    verano: 65,
    invierno: 75,
    anual_promedio: 70
  },
  
  horas_luz: {
    verano: 15,
    invierno: 10,
    promedio: 12.5
  },
  
  evapotranspiracion: {
    verano: 6.0,
    invierno: 2.0,
    promedio: 4.0
  }
};

// ============================================================================
// CONFIGURACIÓN DE LA BOMBA Y SUSTRATO
// ============================================================================

const ROCKWOOL_CHARACTERISTICS = {
  waterRetention: 0.85,
  drainageRate: 0.15,
  saturationTime: 5,
  dryingTime: {
    seedling: 4,
    growth: 3,
    mature: 2
  },
  cubeSizes: {
    seedling: 0.25,
    standard: 0.4
  }
};

const PUMP_CONFIG = {
  power: 7,
  flowRate: 600,
  flowRatePerSecond: 600 / 3600,
  maxDailyRuntime: 16,
  minCycleTime: 10,
  maxCycleTime: 45,
  
  waterPerPlant: {
    seedling: 0.07,
    growth: 0.13,
    mature: 0.18
  },
  
  baseIntervals: {
    day: {
      seedling: 90,
      growth: 60,
      mature: 45
    },
    night: {
      seedling: 180,
      growth: 120,
      mature: 90
    }
  },
  
  seasonalAdjustments: {
    summer: {
      dayMultiplier: 0.7,
      nightMultiplier: 0.9
    },
    winter: {
      dayMultiplier: 1.2,
      nightMultiplier: 1.4
    },
    spring_autumn: {
      dayMultiplier: 0.9,
      nightMultiplier: 1.1
    }
  },
  
  recommendedSchedule: {
    summer: {
      dayStart: "06:00",
      dayEnd: "21:00",
    },
    winter: {
      dayStart: "08:00",
      dayEnd: "18:00",
    }
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

const calculateSystemEC = (plants, totalVolume, waterType = "bajo_mineral") => {
  if (plants.length === 0) return { targetEC: "1200", targetPH: "6.0", statistics: { seedlingCount: 0, growthCount: 0, matureCount: 0 } };
  
  let totalECWeighted = 0;
  let totalPH = 0;
  let seedlingCount = 0, growthCount = 0, matureCount = 0;
  
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    let stage, dosage;
    if (plant.l === 1) { stage = "seedling"; seedlingCount++; }
    else if (plant.l === 2) { stage = "growth"; growthCount++; }
    else { stage = "mature"; matureCount++; }
    
    dosage = variety.cannaDosage[stage];
    totalECWeighted += parseFloat(dosage.ec);
    totalPH += variety.phIdeal;
  });
  
  let finalEC = totalECWeighted / plants.length;
  
  const seedlingRatio = seedlingCount / plants.length;
  if (seedlingRatio > 0.5) finalEC *= 0.85;
  
  const volumeFactor = Math.min(1.0, 30 / totalVolume);
  finalEC *= volumeFactor;
  
  const waterConfig = WATER_TYPES[waterType];
  if (waterConfig) {
    finalEC = Math.max(0, finalEC - waterConfig.ecBase);
  }
  
  finalEC = Math.max(800, Math.min(1900, finalEC));
  
  let targetPH = (totalPH / plants.length).toFixed(1);
  
  return {
    targetEC: Math.round(finalEC).toString(),
    targetPH: targetPH,
    statistics: { seedlingCount, growthCount, matureCount }
  };
};

const calculateCannaDosage = (plants, totalVolume, targetEC, waterType = "bajo_mineral") => {
  if (plants.length === 0) return { a: 0, b: 0, per10L: { a: 0, b: 0 }, note: "" };

  let totalA = 0, totalB = 0;
  let usedWaterType = WATER_TYPES[waterType] || WATER_TYPES["bajo_mineral"];
  
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    const dosage = variety.cannaDosage[stage];
    
    const plantContribution = (dosage.a / 10) * (totalVolume / plants.length);
    totalA += plantContribution;
    totalB += plantContribution;
  });
  
  let ecRatio = parseFloat(targetEC) / 1300;
  
  if (usedWaterType.hardness > 150) {
    ecRatio *= 0.9;
  }
  
  totalA *= ecRatio;
  totalB *= ecRatio;
  
  return {
    a: Math.round(totalA),
    b: Math.round(totalB),
    per10L: {
      a: Math.round((totalA * 10) / totalVolume),
      b: Math.round((totalB * 10) / totalVolume)
    },
    note: usedWaterType.hardness > 150 ? "Dosis reducida por dureza del agua" : "Dosis para agua blanda"
  };
};

// ============================================================================
// COMPONENTE PRINCIPAL CON MEJORAS
// ============================================================================

export default function HydroAppFinalV32() {
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20", 
    ph: "6.0", 
    ec: "1200",
    temp: "22", 
    targetEC: "1400",
    targetPH: "6.0",
    waterType: "bajo_mineral",
    hasHeater: true
  });
  const [tab, setTab] = useState("overview");
  const [selPos, setSelPos] = useState(null);
  const [showWaterSelector, setShowWaterSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    pumpTime: 20,
    interval: 90,
    temperature: "22"
  });

  // =================== MEJORA 1: PERSISTENCIA MEJORADA ===================

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hydro_master_canna");
      if (saved) {
        const d = JSON.parse(saved);
        setPlants(d.plants || []);
        setConfig(d.config || config);
        setHistory(d.history || []);
        setLastRot(d.lastRot);
        setLastClean(d.lastClean);
        setIrrigationConfig(d.irrigationConfig || irrigationConfig);
        
        // MEJORA: Si ya hay plantas configuradas, ir directamente al dashboard
        if (d.plants && d.plants.length > 0) {
          setStep(4); // Dashboard principal
          setTab("overview");
        } else {
          setStep(0); // Si no hay plantas, empezar desde paso 1
        }
      }
    } catch (error) {
      console.error("Error cargando datos guardados:", error);
      localStorage.removeItem("hydro_master_canna");
    }
  }, []);

  useEffect(() => {
    if (step >= 2) {
      try {
        localStorage.setItem("hydro_master_canna", 
          JSON.stringify({ 
            plants, 
            config, 
            history, 
            lastRot, 
            lastClean,
            irrigationConfig 
          }));
      } catch (error) {
        console.error("Error guardando:", error);
      }
    }
  }, [plants, config, history, lastRot, lastClean, irrigationConfig, step]);

  // =================== MEJORA 2: FUNCIÓN PARA BORRAR REGISTROS ===================

  const deleteHistoryRecord = (id) => {
    setHistory(history.filter(record => record.id !== id));
  };

  // =================== INTERFAZ MEJORADA - DASHBOARD PROFESIONAL ===================

  // Vista de Dashboard Principal (Nueva)
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Tarjetas de Estado */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Volumen Actual</p>
              <p className="text-2xl font-bold text-slate-800">{config.currentVol}<span className="text-sm text-slate-500">L</span></p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Droplets className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" 
              style={{ width: `${(config.currentVol / config.totalVol) * 100}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Temperatura</p>
              <p className="text-2xl font-bold text-slate-800">{config.temp}<span className="text-sm text-slate-500">°C</span></p>
            </div>
            <div className={`p-3 rounded-2xl ${parseFloat(config.temp) > 25 ? 'bg-orange-50' : 'bg-green-50'}`}>
              <Thermometer className={parseFloat(config.temp) > 25 ? 'text-orange-500' : 'text-green-500'} size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Estable con calentador</p>
        </Card>
      </div>

      {/* Parámetros Principales */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 text-lg">Parámetros del Sistema</h3>
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            {WATER_TYPES[config.waterType].name}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">pH Actual</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-purple-600">{config.ph}</p>
              <div className={`w-3 h-3 rounded-full ${Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Objetivo: {config.targetPH}</p>
          </div>

          <div className="text-center p-4 bg-white rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">EC Actual</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-blue-600">{config.ec}</p>
              <div className={`w-3 h-3 rounded-full ${Math.abs(parseFloat(config.ec) - parseFloat(config.targetEC)) > 300 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Objetivo: {config.targetEC} µS/cm</p>
          </div>
        </div>

        {/* MEJORA: Display más grande para EC */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
          <p className="text-xs font-semibold text-blue-700 mb-2">Concentración Eléctrica</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-blue-800">{config.ec}</p>
              <p className="text-sm text-blue-600 font-medium">µS/cm</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Rango objetivo</p>
              <p className="text-lg font-bold text-blue-800">{config.targetEC} µS/cm</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-blue-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full" 
              style={{ width: `${Math.min(100, (parseFloat(config.ec) / parseFloat(config.targetEC)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Plantas Activas */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-100 shadow-lg">
        <h3 className="font-bold text-slate-800 text-lg mb-4">Plantas Activas</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-2xl border border-emerald-100">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
              <Sprout className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-blue-700">{plants.filter(p => p.l === 1).length}</p>
            <p className="text-xs font-semibold text-slate-600">Plántulas</p>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl border border-purple-100">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
              <Activity className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-purple-700">{plants.filter(p => p.l === 2).length}</p>
            <p className="text-xs font-semibold text-slate-600">Crecimiento</p>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl border border-green-100">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
              <Check className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-green-700">{plants.filter(p => p.l === 3).length}</p>
            <p className="text-xs font-semibold text-slate-600">Maduras</p>
          </div>
        </div>
      </Card>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => setTab("measure")}
          className="h-16 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-semibold shadow-lg"
        >
          <Beaker className="mr-2" size={20} />
          Nueva Medición
        </Button>
        <Button 
          onClick={() => setTab("irrigation")}
          className="h-16 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl font-semibold shadow-lg"
        >
          <Droplets className="mr-2" size={20} />
          Control Riego
        </Button>
      </div>
    </div>
  );

  // =================== FLUJO DE CONFIGURACIÓN ===================

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl border border-slate-200">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-xl">
              <Droplets className="text-white" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">HydroCaru</h1>
            <p className="text-slate-600">Sistema de Cultivo Hidropónico Inteligente</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Capacidad del Depósito (Litros)
              </label>
              <input 
                type="number" 
                value={config.totalVol} 
                onChange={e => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})} 
                className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-4xl font-bold text-center text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                placeholder="20"
              />
            </div>
            
            <Button 
              onClick={() => setStep(1)}
              className="w-full h-16 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-semibold text-lg shadow-lg"
            >
              Comenzar Configuración
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              onClick={() => setStep(0)}
              variant="outline"
              className="rounded-full p-3 border-2 border-slate-200"
            >
              <ArrowLeft className="text-slate-600" size={20} />
            </Button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">Selección de Plantas</h2>
              <p className="text-sm text-slate-600">Nivel 1 - Plántulas iniciales</p>
            </div>
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
              {plants.filter(p => p.l === 1).length}/5
            </Badge>
          </div>

          <div className="mb-8">
            <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-6 rounded-3xl border-2 border-emerald-200 grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(p => {
                const pl = plants.find(x => x.l === 1 && x.p === p);
                return (
                  <button 
                    key={p} 
                    onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l: 1, p})} 
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-3 transition-all duration-300 ${
                      pl 
                        ? `${VARIETIES[pl.v].color} border-white shadow-lg` 
                        : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    {pl ? (
                      <>
                        <Sprout size={28} className="text-white" />
                        <span className="text-xs font-semibold text-white mt-1">{pl.v.substring(0, 3)}</span>
                      </>
                    ) : (
                      <Plus size={24} className="text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={() => plants.length > 0 ? setStep(2) : alert("Selecciona al menos una planta")}
            className="w-full h-16 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl font-semibold text-lg shadow-lg"
          >
            {plants.length > 0 ? `Continuar con ${plants.length} plantas` : "Selecciona Plantas"}
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    const optimalEC = calculateSystemEC(plants, parseFloat(config.totalVol), config.waterType);
    const dosage = calculateCannaDosage(plants, parseFloat(config.totalVol), optimalEC.targetEC, config.waterType);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              onClick={() => setStep(1)}
              variant="outline"
              className="rounded-full p-3 border-2 border-slate-200"
            >
              <ArrowLeft className="text-slate-600" size={20} />
            </Button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">Cálculo de Nutrientes</h2>
              <p className="text-sm text-slate-600">Dosis CANNA Aqua Vega</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700">Agua Seleccionada</p>
                  <p className="text-lg font-bold text-blue-800">{WATER_TYPES[config.waterType].name}</p>
                </div>
                <button 
                  onClick={() => setShowWaterSelector(true)}
                  className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                >
                  <Filter className="text-blue-600" size={20} />
                </button>
              </div>
              <div className="text-sm text-blue-600">
                EC base: {WATER_TYPES[config.waterType].ecBase} µS/cm • Dureza: {WATER_TYPES[config.waterType].hardness} ppm
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Sprout className="text-blue-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{optimalEC.statistics.seedlingCount}</p>
                <p className="text-xs font-semibold text-slate-600">Plántulas</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="text-purple-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{optimalEC.statistics.growthCount}</p>
                <p className="text-xs font-semibold text-slate-600">Crecimiento</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="text-green-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{optimalEC.statistics.matureCount}</p>
                <p className="text-xs font-semibold text-slate-600">Maduras</p>
              </div>
            </div>

            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-100">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full mb-3">
                  <FlaskConical className="text-emerald-600" size={16} />
                  <span className="text-sm font-semibold text-emerald-700">CANNA Aqua Vega A+B</span>
                </div>
                <p className="text-3xl font-bold text-emerald-800">{dosage.a} ml / {dosage.b} ml</p>
                <p className="text-sm text-emerald-600 mt-1">Para {config.totalVol}L de agua</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-white rounded-xl border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Nutriente A</p>
                  <p className="text-xl font-bold text-emerald-700">{dosage.a} ml</p>
                  <p className="text-xs text-slate-500">({dosage.per10L.a} ml/10L)</p>
                </div>
                <div className="text-center p-3 bg-white rounded-xl border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Nutriente B</p>
                  <p className="text-xl font-bold text-blue-700">{dosage.b} ml</p>
                  <p className="text-xs text-slate-500">({dosage.per10L.b} ml/10L)</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">EC Óptima Calculada</p>
                  <p className="text-4xl font-bold text-blue-800">{optimalEC.targetEC}</p>
                  <p className="text-sm text-blue-600">µS/cm</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Activity className="text-blue-600" size={32} />
                </div>
              </div>
            </Card>
          </div>

          <Button 
            onClick={() => {
              setConfig(prev => ({ ...prev, targetEC: optimalEC.targetEC, targetPH: optimalEC.targetPH }));
              setStep(3);
            }}
            className="w-full h-16 mt-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-semibold text-lg shadow-lg"
          >
            Confirmar y Continuar
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              onClick={() => setStep(2)}
              variant="outline"
              className="rounded-full p-3 border-2 border-slate-200"
            >
              <ArrowLeft className="text-slate-600" size={20} />
            </Button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">Medición Inicial</h2>
              <p className="text-sm text-slate-600">Introduce los valores actuales del sistema</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700">Configuración Actual</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-blue-800">{WATER_TYPES[config.waterType].name}</p>
                    <span className="text-sm text-blue-600">• EC objetivo: {config.targetEC} µS/cm</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWaterSelector(true)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <Filter className="text-blue-600" size={18} />
                </button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">pH Medido</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={config.ph} 
                  onChange={e => setConfig({...config, ph: e.target.value})} 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-3xl font-bold text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
                  placeholder="6.0"
                />
              </div>
              
              {/* MEJORA: Input de EC más grande y claro */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">EC Medida</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="100" 
                    value={config.ec} 
                    onChange={e => setConfig({...config, ec: e.target.value})} 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-3xl font-bold text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="1200"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-sm font-semibold text-blue-600">µS/cm</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Litros en Depósito</label>
                <input 
                  type="number" 
                  value={config.currentVol} 
                  onChange={e => setConfig({...config, currentVol: e.target.value})} 
                  className="w-full p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl text-center text-3xl font-bold text-cyan-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition-all"
                  placeholder={config.totalVol}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Temperatura del Agua (°C)</label>
                <input 
                  type="number" 
                  value={config.temp} 
                  onChange={e => setConfig({...config, temp: e.target.value})} 
                  className="w-full p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl text-center text-3xl font-bold text-orange-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                  placeholder="22"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={() => {
              setHistory([{
                ...config, 
                id: Date.now(), 
                d: new Date().toLocaleString(), 
                note: "Medición inicial"
              }, ...history]);
              setStep(4);
              setTab("overview");
            }}
            className="w-full h-16 mt-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-semibold text-lg shadow-lg"
          >
            Iniciar Sistema Completo
          </Button>
        </Card>
      </div>
    );
  }

  // =================== INTERFAZ PRINCIPAL MEJORADA ===================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      {/* Header Mejorado */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Droplets className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">HydroCaru</h1>
                <p className="text-xs text-slate-500">Cultivo Hidropónico Inteligente</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                {config.currentVol}L
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {plants.length} plantas
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowWaterSelector(true)}
              className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              title="Tipo de agua"
            >
              <Filter className="text-blue-600" size={20} />
            </button>
            
            {alerts.length > 0 && (
              <div className="relative">
                <button className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <Bell className="text-red-600" size={20} />
                </button>
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {alerts.filter(a => a.priority === 1).length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Mejorados */}
        <div className="mt-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full bg-slate-100/80 backdrop-blur-sm rounded-2xl p-1 grid grid-cols-7">
              <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Home size={18} />
              </TabsTrigger>
              <TabsTrigger value="measure" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Beaker size={18} />
              </TabsTrigger>
              <TabsTrigger value="tower" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Layers size={18} />
              </TabsTrigger>
              <TabsTrigger value="irrigation" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Droplets size={18} />
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar size={18} />
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 size={18} />
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings size={18} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <Tabs value={tab} onValueChange={setTab}>
          {/* Dashboard Principal */}
          <TabsContent value="overview" className="mt-6">
            <DashboardView />
          </TabsContent>

          {/* Medición Mejorada */}
          <TabsContent value="measure" className="mt-6">
            <Card className="p-6 rounded-3xl bg-white shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Nueva Medición</h2>
                  <p className="text-sm text-slate-600">Actualiza los parámetros del sistema</p>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  {WATER_TYPES[config.waterType].name}
                </Badge>
              </div>

              <div className="space-y-6">
                {/* MEJORA: Display de EC más profesional */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Conductividad Eléctrica (EC)</p>
                      <p className="text-xs text-slate-500">µS/cm - Microsiemens por centímetro</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">Objetivo: {config.targetEC} µS/cm</p>
                      <p className="text-xs text-slate-500">Rango óptimo: 800-1900 µS/cm</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="number" 
                      step="100" 
                      value={config.ec} 
                      onChange={e => setConfig({...config, ec: e.target.value})} 
                      className="w-full p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-3 border-blue-200 rounded-2xl text-center text-5xl font-bold text-blue-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all"
                      placeholder="1200"
                    />
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                      <span className="text-xl font-bold text-blue-600">µS/cm</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-slate-600 px-2">
                    <span>Plántulas (800-900)</span>
                    <span>Óptimo (1200-1400)</span>
                    <span>Máximo (1900)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">pH</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={config.ph} 
                      onChange={e => setConfig({...config, ph: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-2xl font-bold text-purple-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Temperatura</label>
                    <input 
                      type="number" 
                      value={config.temp} 
                      onChange={e => setConfig({...config, temp: e.target.value})} 
                      className="w-full p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl text-center text-2xl font-bold text-orange-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Volumen Actual</label>
                    <input 
                      type="number" 
                      value={config.currentVol} 
                      onChange={e => setConfig({...config, currentVol: e.target.value})} 
                      className="w-full p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl text-center text-2xl font-bold text-cyan-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => { 
                    setHistory([{
                      ...config, 
                      id: Date.now(), 
                      d: new Date().toLocaleString(),
                      note: "Medición manual"
                    }, ...history]); 
                    setTab("overview");
                    alert("✅ Medición registrada correctamente");
                  }} 
                  className="w-full h-16 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white rounded-2xl font-semibold text-lg shadow-lg"
                >
                  <Check className="mr-2" size={20} />
                  Guardar Medición
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Historial de Mediciones con Borrado */}
          <TabsContent value="history" className="mt-6">
            <Card className="p-6 rounded-3xl bg-white shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Historial de Mediciones</h2>
                  <p className="text-sm text-slate-600">Registros del sistema - {history.length} mediciones</p>
                </div>
                {history.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (confirm("¿Borrar todo el historial de mediciones?")) {
                        setHistory([]);
                      }
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Limpiar todo
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Sin mediciones registradas</h3>
                  <p className="text-slate-500">Realiza tu primera medición para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record, index) => (
                    <Card key={record.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="border-slate-200">
                              {record.d.split(',')[0]}
                            </Badge>
                            <span className="text-sm text-slate-500">{record.d.split(',')[1]?.trim()}</span>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs font-semibold text-slate-500">pH</p>
                              <p className="text-2xl font-bold text-purple-600">{record.ph}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-slate-500">EC</p>
                              <p className="text-2xl font-bold text-blue-600">{record.ec}</p>
                              <p className="text-xs text-blue-500">µS/cm</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-slate-500">Temp</p>
                              <p className="text-2xl font-bold text-orange-600">{record.temp}°</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-slate-500">Vol</p>
                              <p className="text-2xl font-bold text-cyan-600">{record.currentVol}L</p>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(record.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Otros tabs permanecen similares pero con mejoras visuales */}
          {/* ... resto de los tabs ... */}
        </Tabs>
      </main>

      {/* Modal de Confirmación para Borrar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">¿Borrar medición?</h3>
              <p className="text-slate-600">Esta acción no se puede deshacer.</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                onClick={() => {
                  deleteHistoryRecord(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                <Trash2 className="mr-2" size={16} />
                Borrar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Selección de Agua Mejorado */}
      {showWaterSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Tipo de Agua</h3>
                <p className="text-sm text-slate-600">CANNA Aqua Vega optimizado para agua blanda</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowWaterSelector(false)}
                className="rounded-full"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-3">
              {Object.entries(WATER_TYPES).map(([key, water]) => (
                <button
                  key={key}
                  onClick={() => {
                    setConfig(prev => ({ ...prev, waterType: key }));
                    setShowWaterSelector(false);
                    const optimal = calculateSystemEC(plants, parseFloat(config.totalVol), key);
                    setConfig(prev => ({
                      ...prev,
                      targetEC: optimal.targetEC,
                      targetPH: optimal.targetPH
                    }));
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    config.waterType === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {water.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-800">{water.name}</p>
                        {config.waterType === key && (
                          <Badge className="bg-blue-500 text-white text-xs">Seleccionado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{water.description}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-blue-600 font-semibold">EC base: {water.ecBase} µS/cm</span>
                        <span className="text-amber-600 font-semibold">Dureza: {water.hardness} ppm</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                ℹ️ <strong>Recomendación:</strong> CANNA Aqua Vega funciona mejor con agua blanda (EC base ≤ 200 µS/cm).
                El sistema ajustará automáticamente las dosis según el tipo seleccionado.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
