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
  Home, BarChart3, X, RotateCcw, AlertCircle,
  Battery, BatteryFull, BatteryLow, BatteryMedium
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ============================================================================
// CONFIGURACIÓN BASE
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

const calculatePHAdjustment = (currentPH, targetPH, waterType, volume) => {
  const waterConfig = WATER_TYPES[waterType];
  if (!waterConfig) return { phMinus: 0, phPlus: 0 };
  
  const phDiff = currentPH - targetPH;
  let adjustmentFactor = 1.0;
  
  if (waterConfig.hardness > 200) {
    adjustmentFactor = 1.5;
  } else if (waterConfig.hardness > 100) {
    adjustmentFactor = 1.2;
  }
  
  const adjustment = Math.abs(phDiff) * volume * 0.15 * adjustmentFactor;
  
  if (phDiff > 0) {
    return { phMinus: adjustment.toFixed(1), phPlus: 0 };
  } else {
    return { phMinus: 0, phPlus: adjustment.toFixed(1) };
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HydroAppFinal() {
  // Estados principales
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [tab, setTab] = useState("dashboard");
  const [selPos, setSelPos] = useState(null);
  const [showWaterSelector, setShowWaterSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Configuración del sistema
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
  
  // Configuración de riego
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    pumpTime: 20,
    interval: 90,
    temperature: "22"
  });

  // =================== EFECTOS Y PERSISTENCIA ===================

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hydro_master_canna");
      if (saved) {
        const data = JSON.parse(saved);
        setPlants(data.plants || []);
        setConfig(data.config || config);
        setHistory(data.history || []);
        setLastRot(data.lastRot || lastRot);
        setLastClean(data.lastClean || lastClean);
        setIrrigationConfig(data.irrigationConfig || irrigationConfig);
        
        // Si ya hay plantas configuradas, ir al dashboard
        if (data.plants && data.plants.length > 0) {
          setStep(4); // Dashboard
          setTab("dashboard");
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
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

  useEffect(() => {
    if (plants.length > 0 && step >= 2) {
      const optimal = calculateSystemEC(plants, parseFloat(config.totalVol), config.waterType);
      const currentTargetEC = parseFloat(config.targetEC);
      const newTargetEC = parseFloat(optimal.targetEC);
      
      if (Math.abs(currentTargetEC - newTargetEC) > 100) {
        setConfig(prev => ({
          ...prev,
          targetEC: optimal.targetEC,
          targetPH: optimal.targetPH
        }));
      }
    }
  }, [plants, config.totalVol, config.waterType, step]);

  // =================== FUNCIONES UTILITARIAS ===================

  const generatePlantId = () => {
    return `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const deleteHistoryRecord = (id) => {
    setHistory(history.filter(record => record.id !== id));
  };

  const handleRotation = () => {
    if (confirm("¿ROTAR NIVELES?\n• Nivel 3 → Cosecha\n• Nivel 2 → Nivel 3 (maduración)\n• Nivel 1 → Nivel 2 (crecimiento)\n• Nivel 1 vacío para nuevas plántulas")) {
      const withoutMature = plants.filter(p => p.l !== 3);
      const moved = withoutMature.map(p => ({ ...p, l: p.l + 1 }));
      setPlants(moved);
      setLastRot(new Date().toISOString());
      alert("✅ Rotación completada\n\nAhora añade NUEVAS PLÁNTULAS en el nivel 1.");
      setTab("tower");
    }
  };

  // =================== CÁLCULO DE ALERTAS ===================

  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1400;
    const tPh = parseFloat(config.targetPH) || 6.0;
    const temp = parseFloat(config.temp) || 20;
    const waterType = config.waterType || "bajo_mineral";
    const res = [];

    if (waterType === "alta_mineral") {
      res.push({ 
        title: "AGUA DURA DETECTADA", 
        value: "No recomendado", 
        description: "CANNA Aqua Vega es para agua blanda. Cambia de agua o producto.", 
        color: "bg-gradient-to-r from-amber-600 to-orange-600",
        icon: <Filter className="text-white" size={28} />,
        priority: 3
      });
    }

    if (vAct < vTot * 0.3) {
      res.push({ 
        title: "¡AGUA MUY BAJA!", 
        value: `${(vTot - vAct).toFixed(1)}L`, 
        description: `Crítico: Solo queda un ${(vAct/vTot*100).toFixed(0)}%`, 
        color: "bg-gradient-to-r from-red-600 to-rose-700 animate-pulse",
        icon: <Droplets className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (vAct < vTot * 0.5) {
      res.push({ 
        title: "RELLENAR AGUA", 
        value: `${(vTot - vAct).toFixed(1)}L`, 
        description: `Depósito al ${(vAct/vTot*100).toFixed(0)}%`, 
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: <CloudRain className="text-white" size={28} />,
        priority: 2
      });
    }

    if (temp > 28) {
      res.push({ 
        title: "¡PELIGRO TEMPERATURA!", 
        value: `${temp}°C`, 
        description: "Alto riesgo. Añadir hielo en botella YA.", 
        color: "bg-gradient-to-r from-red-700 to-pink-800 animate-pulse",
        icon: <ThermometerSun className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (temp > 25) {
      res.push({ 
        title: "TEMPERATURA ALTA", 
        value: `${temp}°C`, 
        description: "Oxígeno bajo. Considera añadir hielo.", 
        color: "bg-gradient-to-r from-orange-500 to-red-500",
        icon: <Thermometer className="text-white" size={28} />,
        priority: 2
      });
    }
    else if (temp < 16) {
      res.push({ 
        title: "TEMPERATURA BAJA", 
        value: `${temp}°C`, 
        description: "Crecimiento muy lento. Subir temperatura.", 
        color: "bg-gradient-to-r from-cyan-600 to-blue-600",
        icon: <Thermometer className="text-white" size={28} />,
        priority: 3
      });
    }

    if (ph > tPh + 0.5 || ph < tPh - 0.5) {
      const phAdjustment = calculatePHAdjustment(ph, tPh, waterType, vAct);
      const action = ph > tPh ? "pH-" : "pH+";
      const ml = ph > tPh ? phAdjustment.phMinus : phAdjustment.phPlus;
      res.push({ 
        title: `AJUSTE ${action} URGENTE`, 
        value: `${ml}ml`, 
        description: `pH ${ph} → ${tPh} (fuera de rango seguro)`, 
        color: "bg-gradient-to-r from-purple-700 to-pink-700",
        icon: <RefreshCw className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ph > tPh + 0.2 || ph < tPh - 0.2) {
      const phAdjustment = calculatePHAdjustment(ph, tPh, waterType, vAct);
      const action = ph > tPh ? "pH-" : "pH+";
      const ml = ph > tPh ? phAdjustment.phMinus : phAdjustment.phPlus;
      res.push({ 
        title: `AJUSTAR ${action}`, 
        value: `${ml}ml`, 
        description: `pH ${ph} → objetivo ${tPh}`, 
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        icon: <ArrowDownCircle className={ph > tPh ? "" : "rotate-180"} size={28} />,
        priority: 2
      });
    }

    if (ec < tEc - 400 && ec > 0) {
      const dosageNeeded = calculateCannaDosage(plants, vAct, tEc, waterType);
      const mlPerLiter = dosageNeeded.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.5;
      res.push({ 
        title: "¡FALTAN NUTRIENTES!", 
        value: `${Math.round(mlToAdd)}ml A+B`, 
        description: `EC ${ec} µS/cm (muy baja). Añadir CANNA Aqua Vega.`, 
        color: "bg-gradient-to-r from-blue-800 to-cyan-800",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec < tEc - 200 && ec > 0) {
      const dosageNeeded = calculateCannaDosage(plants, vAct, tEc, waterType);
      const mlPerLiter = dosageNeeded.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.5;
      res.push({ 
        title: "AÑADIR NUTRIENTES", 
        value: `${Math.round(mlToAdd)}ml A+B`, 
        description: `Subir de ${ec} a ${tEc} µS/cm`, 
        color: "bg-gradient-to-r from-blue-600 to-cyan-600",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 2
      });
    } 
    else if (ec > tEc + 500) {
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        title: "¡EC PELIGROSAMENTE ALTA!", 
        value: `${water}L AGUA`, 
        description: `EC ${ec} µS/cm. Diluir URGENTE para salvar raíces.`, 
        color: "bg-gradient-to-r from-red-800 to-amber-900",
        icon: <Skull className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec > tEc + 300) {
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        title: "DILUIR CON AGUA", 
        value: `${water}L`, 
        description: `EC ${ec} µS/cm > objetivo ${tEc} µS/cm. Añadir agua sola.`, 
        color: "bg-gradient-to-r from-amber-600 to-orange-600",
        icon: <AlertTriangle className="text-white" size={28} />,
        priority: 2
      });
    }

    const lastCleanDate = new Date(lastClean);
    const now = new Date();
    const daysSinceClean = Math.floor((now - lastCleanDate) / (1000 * 3600 * 24));
    
    if (daysSinceClean >= 12) {
      res.push({ 
        title: daysSinceClean >= 14 ? "¡LIMPIEZA URGENTE!" : "LIMPIEZA PRÓXIMA", 
        value: `${daysSinceClean} días`, 
        description: daysSinceClean >= 14 ? "Depósito puede tener biofilm peligroso" : "Programa limpieza en los próximos días", 
        color: daysSinceClean >= 14 ? "bg-gradient-to-r from-red-700 to-rose-800" : "bg-gradient-to-r from-violet-600 to-purple-700",
        icon: <ShieldAlert className="text-white" size={28} />,
        priority: daysSinceClean >= 14 ? 1 : 3
      });
    }

    return res.sort((a, b) => a.priority - b.priority);
  }, [config, lastClean, plants]);

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

        {/* Modal de selección de variedad */}
        {selPos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white w-full max-w-md mx-auto rounded-[2.5rem] p-8 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl text-slate-800">Seleccionar Variedad</h3>
                <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200">
                  <X size={24} />
                </button>
              </div>
              <div className="grid gap-3">
                {Object.keys(VARIETIES).map(v => (
                  <button 
                    key={v}
                    onClick={() => {
                      const newPlant = {
                        id: generatePlantId(),
                        v: v,
                        l: selPos.l,
                        p: selPos.p
                      };
                      setPlants([...plants, newPlant]);
                      setSelPos(null);
                    }} 
                    className={`w-full p-5 rounded-[1.5rem] font-black text-white shadow-md flex justify-between items-center hover:scale-[1.02] active:scale-95 transition-all ${VARIETIES[v].color}`}
                  >
                    <div className="text-left">
                      <span className="text-xl uppercase italic tracking-tighter leading-none block">{v}</span>
                      <span className="text-[10px] opacity-80 lowercase font-medium">
                        EC máx: {VARIETIES[v].ecMax} µS/cm | pH: {VARIETIES[v].phIdeal}
                      </span>
                    </div>
                    <Zap size={20}/>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setSelPos(null)}
                className="w-full mt-4 p-4 bg-slate-100 rounded-[1.5rem] font-black text-slate-600 hover:bg-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
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
              
              {/* Input de EC mejorado */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">EC Medida (µS/cm)</label>
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
              setTab("dashboard");
            }}
            className="w-full h-16 mt-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-semibold text-lg shadow-lg"
          >
            Iniciar Sistema Completo
          </Button>
        </Card>
      </div>
    );
  }

  // =================== DASHBOARD PRINCIPAL ===================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      {/* Header */}
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

        {/* Tabs */}
        <div className="mt-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full bg-slate-100/80 backdrop-blur-sm rounded-2xl p-1 grid grid-cols-7">
              <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
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
          <TabsContent value="dashboard" className="mt-6 space-y-6">
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

              {/* Display de EC grande */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-2">Conductividad Eléctrica (µS/cm)</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold text-blue-800">{config.ec}</p>
                    <p className="text-sm text-blue-600 font-medium">microsiemens/cm</p>
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

            {/* Alertas */}
            {alerts.length > 0 && (
              <Card className="p-6 rounded-3xl bg-gradient-to-br from-white to-red-50 border-2 border-red-100 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="text-red-600" size={20} />
                  <h3 className="font-bold text-slate-800 text-lg">Alertas ({alerts.length})</h3>
                </div>
                <div className="space-y-3">
                  {alerts.slice(0, 3).map((alert, i) => (
                    <div key={i} className={`p-4 rounded-2xl ${alert.color} text-white`}>
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                          {alert.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold text-sm">{alert.title}</p>
                            {alert.priority === 1 && (
                              <Badge className="bg-white/30 text-white text-xs">URGENTE</Badge>
                            )}
                          </div>
                          <p className="text-2xl font-bold mt-1">{alert.value}</p>
                          <p className="text-xs opacity-90 mt-1">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

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
                onClick={() => setTab("tower")}
                className="h-16 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl font-semibold shadow-lg"
              >
                <Layers className="mr-2" size={20} />
                Ver Torre
              </Button>
            </div>
          </TabsContent>

          {/* Medición */}
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
                {/* EC Mejorado */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Conductividad Eléctrica (EC)</p>
                      <p className="text-xs text-slate-500">µS/cm - Microsiemens por centímetro</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">Objetivo: {config.targetEC} µS/cm</p>
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
                    <label className="block text-sm font-semibold text-slate-700">Temperatura (°C)</label>
                    <input 
                      type="number" 
                      value={config.temp} 
                      onChange={e => setConfig({...config, temp: e.target.value})} 
                      className="w-full p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl text-center text-2xl font-bold text-orange-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="block text-sm font-semibold text-slate-700">Volumen Actual (Litros)</label>
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
                    setTab("dashboard");
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

          {/* Torre */}
          <TabsContent value="tower" className="mt-6 space-y-6">
            <Button 
              onClick={handleRotation}
              className="w-full h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <RotateCcw size={24} />
              <div className="text-left">
                <p className="text-sm">Rotar Niveles de Torre</p>
                <p className="text-xs opacity-90">Cosecha y descenso automático</p>
              </div>
            </Button>

            {[1, 2, 3].map(l => (
              <div key={l}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Nivel {l} {l===1?'(Siembra)':l===3?'(Cosecha)':'(Crecimiento)'}
                  </p>
                  <Badge variant="outline" className="border-2">
                    {plants.filter(p => p.l === l).length}/5
                  </Badge>
                </div>
                <div className="bg-slate-200/50 p-5 rounded-3xl border-2 border-white grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map(p => {
                    const pl = plants.find(x => x.l === l && x.p === p);
                    return (
                      <button 
                        key={p} 
                        onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} 
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-3 transition-all ${
                          pl 
                            ? `${VARIETIES[pl.v].color} border-white shadow-lg` 
                            : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {pl ? (
                          <>
                            <Sprout size={28} className="text-white" />
                            <span className="text-xs font-semibold text-white mt-1">{pl.v.substring(0, 3)}</span>
                          </>
                        ) : (
                          <Plus size={24} className="text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Historial */}
          <TabsContent value="history" className="mt-6">
            <Card className="p-6 rounded-3xl bg-white shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Historial de Mediciones</h2>
                  <p className="text-sm text-slate-600">{history.length} mediciones registradas</p>
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
                        <div className="flex-1">
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

          {/* Otros Tabs... */}
          <TabsContent value="irrigation" className="mt-6">
            <Card className="p-6 rounded-3xl bg-white shadow-lg border border-slate-200">
              <div className="text-center py-12">
                <Droplets className="mx-auto mb-4 text-blue-400" size={48} />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Control de Riego</h3>
                <p className="text-slate-500">Próximamente disponible</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card className="p-6 rounded-3xl bg-white shadow-lg border border-slate-200">
              <div className="text-center py-12">
                <Calendar className="mx-auto mb-4 text-purple-400" size={48} />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Calendario</h3>
                <p className="text-slate-500">Próximamente disponible</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <Button 
              onClick={() => { 
                setLastClean(new Date().toISOString()); 
                alert('✅ Limpieza registrada correctamente'); 
              }} 
              className="w-full h-16 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl font-semibold text-lg shadow-lg"
            >
              <ShieldAlert className="mr-2" size={20} />
              Registrar Limpieza Completa
            </Button>
            
            <Button 
              onClick={() => { 
                if(confirm('¿RESETEAR SISTEMA COMPLETAMENTE?\n\nSe borrarán todos los datos.\n¿Continuar?')) { 
                  localStorage.clear(); 
                  window.location.reload(); 
                }
              }} 
              className="w-full h-16 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl font-semibold text-lg shadow-lg"
            >
              <AlertCircle className="mr-2" size={20} />
              Resetear Sistema
            </Button>
            
            <Card className="p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 mb-2">HydroCaru v2.0</p>
                <p className="text-xs text-slate-500">Sistema Hidropónico Inteligente</p>
                <p className="text-xs text-slate-400 mt-2">Desarrollado para cultivo eficiente</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Selección de Variedad (para dashboard) */}
      {selPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-8 space-y-4 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">Seleccionar Variedad</h3>
              <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full">
                <X className="text-slate-600" size={24} />
              </button>
            </div>
            <div className="grid gap-3">
              {Object.keys(VARIETIES).map(v => (
                <button 
                  key={v}
                  onClick={() => {
                    const newPlant = {
                      id: generatePlantId(),
                      v: v,
                      l: selPos.l,
                      p: selPos.p
                    };
                    setPlants([...plants, newPlant]);
                    setSelPos(null);
                  }} 
                  className={`w-full p-5 rounded-2xl font-bold text-white shadow-md flex justify-between items-center hover:scale-[1.02] transition-all ${VARIETIES[v].color}`}
                >
                  <div className="text-left">
                    <span className="text-xl font-bold leading-none block">{v}</span>
                    <span className="text-xs opacity-80">
                      EC máx: {VARIETIES[v].ecMax} µS/cm
                    </span>
                  </div>
                  <Zap size={20}/>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setSelPos(null)}
              className="w-full mt-4 p-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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

      {/* Modal de Selección de Agua */}
      {showWaterSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Tipo de Agua</h3>
                <p className="text-sm text-slate-600">Selecciona el tipo de agua que usas</p>
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
                          <Badge className="bg-blue-500 text-white text-xs">Actual</Badge>
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
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
