// ============================================================================
// HYDROCARU - SISTEMA HIDROPÓNICO COMPLETO PARA CASTELLÓN
// ============================================================================

"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// ICONOS NECESARIOS
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, 
  Thermometer, Zap, ShieldAlert, ChevronRight, Anchor, 
  ArrowLeft, ArrowRight, Bell, CloudRain, ThermometerSun, 
  RefreshCw, Skull, Info, Calculator, Filter, 
  Power, Timer, Gauge, Cloud, Sun, Moon, CloudSun, 
  Clipboard, ThermometerSnowflake, TreePine, Settings,
  Home, BarChart3, X, RotateCcw, AlertCircle,
  Droplet, Leaf, TimerReset,
  ChevronDown, ChevronUp, Eye, EyeOff, 
  Brain, AlertOctagon, GitCompare, BarChart,
  Ruler, Edit3, Save, CalendarDays, CloudRain as RainIcon,
  Wind as WindIcon, Thermometer as ThermometerIcon,
  Droplets as WaterIcon, Sprout as SeedlingIcon,
  Shield, BookOpen, CloudSun as CloudSunIcon,
  ThermometerSun as ThermometerSunIcon,
  Waves, Target
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

// CONFIGURACIONES BASE
const WATER_TYPES = {
  bajo_mineral: { name: "Baja Mineralización", ec: 150, ph: 7.5, calcio: 20, magnesio: 5 },
  osmosis: { name: "Ósmosis", ec: 0, ph: 7.0, calcio: 0, magnesio: 0 },
  mixta: { name: "Mezcla (50/50)", ec: 75, ph: 7.25, calcio: 10, magnesio: 2.5 },
  grifo: { name: "Grifo Castellón", ec: 850, ph: 7.8, calcio: 80, magnesio: 20 }
};

const VARIETIES = {
  lechuga: { name: "Lechuga", stages: { seedling: { ec: 800, days: 14 }, growth: { ec: 1200, days: 21 }, mature: { ec: 1400, days: 14 } } },
  kale: { name: "Kale", stages: { seedling: { ec: 900, days: 14 }, growth: { ec: 1400, days: 28 }, mature: { ec: 1800, days: 28 } } },
  espinaca: { name: "Espinaca", stages: { seedling: { ec: 700, days: 10 }, growth: { ec: 1100, days: 18 }, mature: { ec: 1300, days: 14 } } },
  acelga: { name: "Acelga", stages: { seedling: { ec: 850, days: 12 }, growth: { ec: 1300, days: 25 }, mature: { ec: 1600, days: 21 } } },
  aromaticas: { name: "Aromáticas", stages: { seedling: { ec: 600, days: 14 }, growth: { ec: 1000, days: 35 }, mature: { ec: 1200, days: 35 } } }
};

// CARACTERÍSTICAS DE LANAROCA DE 2.5x2.5cm CON pH REBAJADO
const ROCKWOOL_CHARACTERISTICS = {
  size: "2.5x2.5cm",
  initialPH: 5.8, // pH ya rebajado
  waterRetention: 85, // Mayor retención por tamaño pequeño
  dryingTimeSummer: { 
    seedling: { day: 25, night: 50 }, // Más frecuente para plántulas
    growth: { day: 35, night: 65 },
    mature: { day: 45, night: 85 }
  },
  dryingTimeWinter: { 
    seedling: { day: 45, night: 90 },
    growth: { day: 60, night: 120 },
    mature: { day: 75, night: 150 }
  },
  dryingTimeSpring: { 
    seedling: { day: 35, night: 70 },
    growth: { day: 45, night: 90 },
    mature: { day: 55, night: 110 }
  }
};

// DATOS CLIMATOLÓGICOS DE CASTELLÓN
const CASTELLON_CLIMATE = {
  summer: {
    temp: { day: 28, night: 22 },
    humidity: 65,
    wind: "Poniente frecuente",
    recommendations: [
      "Aumentar frecuencia de riego por evaporación",
      "Vigilar temperatura del agua (<28°C)",
      "Reducir EC si temperatura supera 30°C"
    ]
  },
  winter: {
    temp: { day: 15, night: 8 },
    humidity: 75,
    wind: "Tramontana ocasional",
    recommendations: [
      "Reducir frecuencia de riego",
      "Usar calentador de agua",
      "Aumentar EC para compensar menor absorción"
    ]
  },
  spring: {
    temp: { day: 20, night: 12 },
    humidity: 70,
    wind: "Brisas marinas",
    recommendations: [
      "Ajustar riego según temperatura diaria",
      "Ideal para iniciar cultivos",
      "Monitorear humedad por lluvias ocasionales"
    ]
  },
  autumn: {
    temp: { day: 22, night: 14 },
    humidity: 72,
    wind: "Levante húmedo",
    recommendations: [
      "Prevenir humedad excesiva",
      "Reducir EC si llueve frecuentemente",
      "Controlar hongos por humedad alta"
    ]
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL - HYDROCARU
// ============================================================================

export default function HydroCaruApp() {
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
  const [expandedTips, setExpandedTips] = useState({});
  
  // Configuración del sistema
  const [config, setConfig] = useState({ 
    // Valores medidos manualmente
    ph: "6.0",
    ec: "1200",
    temp: "22",
    currentVol: "20",
    totalVol: "20",
    
    // Objetivos
    targetEC: "1400",
    targetPH: "6.0",
    
    // Configuración agua
    waterType: "bajo_mineral",
    useOsmosisMix: false,
    osmosisMixPercentage: 0,
    waterNotes: "",
    hasHeater: true,
    
    // Parámetros adicionales
    humidity: "65",
    lightHours: "12",
    location: "Castellón"
  });
  
  // Configuración de riego - ESPECÍFICA PARA LANAROCA 2.5x2.5cm
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    // Parámetros específicos para lanaroca pequeña
    pumpTime: 8, // Menor tiempo por tamaño pequeño
    interval: 25, // Más frecuente para lanaroca pequeña
    // Configuración avanzada
    showAdvanced: false,
    customSchedule: false,
    // Notas
    notes: "",
    rockwoolSize: "2.5x2.5cm",
    rockwoolPH: ROCKWOOL_CHARACTERISTICS.initialPH
  });

  // Estado para controlar si estamos editando valores manualmente
  const [editingPH, setEditingPH] = useState(false);
  const [editingEC, setEditingEC] = useState(false);
  const [editingVolume, setEditingVolume] = useState(false);
  
  // =================== FUNCIONES DE UTILIDAD ===================
  
  const generatePlantId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  // =================== FUNCIONES PARA EDICIÓN MANUAL ===================
  
  const handleManualPHChange = (value) => {
    setConfig({...config, ph: value});
    // Guardar en historial
    const now = new Date().toISOString();
    setHistory([{
      id: generatePlantId(),
      date: now,
      ph: value,
      ec: config.ec,
      temp: config.temp,
      notes: "Medición manual de pH"
    }, ...history.slice(0, 49)]); // Mantener solo últimas 50
  };
  
  const handleManualECChange = (value) => {
    setConfig({...config, ec: value});
    const now = new Date().toISOString();
    setHistory([{
      id: generatePlantId(),
      date: now,
      ph: config.ph,
      ec: value,
      temp: config.temp,
      notes: "Medición manual de EC"
    }, ...history.slice(0, 49)]);
  };
  
  const handleManualVolumeChange = (value) => {
    setConfig({...config, currentVol: value});
  };
  
  // =================== CÁLCULOS ESPECÍFICOS ===================
  
  const waterCharacteristics = useMemo(() => {
    return WATER_TYPES[config.waterType] || WATER_TYPES.bajo_mineral;
  }, [config.waterType]);
  
  const calculateSystemEC = (plants, volume, waterType = "bajo_mineral") => {
    const waterEC = WATER_TYPES[waterType].ec;
    const totalEC = plants.reduce((sum, plant) => {
      const variety = VARIETIES[plant.v];
      if (!variety) return sum;
      const stage = plant.stage;
      const stageEC = variety.stages[stage]?.ec || 1200;
      return sum + stageEC;
    }, 0);
    
    const avgEC = plants.length > 0 ? totalEC / plants.length : 1200;
    const targetEC = Math.max(waterEC + 50, Math.min(avgEC, 1800));
    
    return {
      waterEC,
      avgPlantEC: avgEC,
      targetEC: Math.round(targetEC / 50) * 50,
      recommendation: targetEC > 1500 ? "EC alta, considerar diluir" : "EC dentro de rango"
    };
  };
  
  // DOSIS DE AQUA VEGA (NO CANNA)
  const aquaVegaDosage = useMemo(() => {
    const volume = parseFloat(config.currentVol);
    const basePer10L = { a: 15, b: 15 }; // Aqua Vega A y B
    const totalA = (volume / 10) * basePer10L.a;
    const totalB = (volume / 10) * basePer10L.b;
    
    return {
      a: Math.round(totalA * 100) / 100, // Una decimal
      b: Math.round(totalB * 100) / 100,
      per10L: basePer10L,
      productName: "Aqua Vega"
    };
  }, [config.currentVol]);
  
  const phAdjustmentWithPretreatment = useMemo(() => {
    const currentPH = parseFloat(config.ph);
    const targetPH = parseFloat(config.targetPH);
    const volume = parseFloat(config.currentVol);
    
    let phMinus = 0;
    let phPlus = 0;
    
    if (currentPH > targetPH) {
      phMinus = ((currentPH - targetPH) * volume * 0.5).toFixed(1);
    } else if (currentPH < targetPH) {
      phPlus = ((targetPH - currentPH) * volume * 0.3).toFixed(1);
    }
    
    return {
      phMinus: phMinus,
      phPlus: phPlus,
      adjustmentNeeded: Math.abs(currentPH - targetPH) > 0.1
    };
  }, [config.ph, config.targetPH, config.currentVol]);
  
  const calmagNeeded = useMemo(() => {
    const waterType = config.waterType;
    const volume = parseFloat(config.currentVol);
    
    if (waterType === "osmosis") {
      return {
        required: true,
        dosage: Math.round(volume * 1.5),
        reason: "Agua de ósmosis requiere CalMag"
      };
    } else if (waterType === "bajo_mineral") {
      return {
        required: false,
        dosage: 0,
        reason: "Agua baja en minerales contiene suficiente calcio/magnesio"
      };
    } else if (waterType === "mixta") {
      return {
        required: true,
        dosage: Math.round(volume * 0.75),
        reason: "Mezcla 50/50 requiere CalMag reducido"
      };
    } else {
      return {
        required: false,
        dosage: 0,
        reason: "Agua de grifo contiene suficientes minerales"
      };
    }
  }, [config.waterType, config.currentVol]);
  
  // CÁLCULO DE RIEGO ESPECÍFICO PARA LANAROCA 2.5x2.5cm
  const irrigationData = useMemo(() => {
    const plantCount = plants.length || 1;
    const volume = parseFloat(config.currentVol);
    const temp = parseFloat(config.temp);
    
    // Determinar estación según mes actual
    const month = new Date().getMonth();
    let season = "spring"; // primavera por defecto
    if (month >= 5 && month <= 8) season = "summer"; // jun-sep
    else if (month >= 11 || month <= 2) season = "winter"; // dic-feb
    else if (month >= 9 && month <= 10) season = "autumn"; // sep-oct
    
    // Tiempos de secado según estación Y TAMAÑO DE LANAROCA
    let dryingTimes = {...ROCKWOOL_CHARACTERISTICS.dryingTimeSpring};
    if (season === "summer") {
      dryingTimes = ROCKWOOL_CHARACTERISTICS.dryingTimeSummer;
    } else if (season === "winter") {
      dryingTimes = ROCKWOOL_CHARACTERISTICS.dryingTimeWinter;
    } else if (season === "autumn") {
      dryingTimes = ROCKWOOL_CHARACTERISTICS.dryingTimeSpring; // Similar a primavera
    }
    
    // Calcular riego basado en estadísticas de plantas
    const stats = {
      seedlingCount: plants.filter(p => p.stage === 'seedling').length,
      growthCount: plants.filter(p => p.stage === 'growth').length,
      matureCount: plants.filter(p => p.stage === 'mature').length
    };
    
    // Tiempo de bomba AJUSTADO PARA LANAROCA PEQUEÑA
    let pumpTime = 8; // base para lanaroca 2.5cm (menos tiempo)
    if (plantCount > 10) pumpTime = 12;
    if (plantCount > 20) pumpTime = 15;
    
    // Intervalo AJUSTADO PARA LANAROCA PEQUEÑA (se seca más rápido)
    let interval = 25; // minutos base (más frecuente)
    if (temp > 25) interval = 18;
    if (temp < 18) interval = 35;
    
    // Ciclos por día
    const dayCycles = Math.round((14 * 60) / interval); // 14 horas de luz
    const nightCycles = Math.round((10 * 60) / (interval * 1.8)); // 10 horas oscuridad, intervalos mucho más largos
    
    // Agua por ciclo - AJUSTADO PARA LANAROCA PEQUEÑA (menos agua)
    const waterPerCycle = plantCount * 35; // 35ml por planta por ciclo (menos por tamaño pequeño)
    const totalWaterPerDay = ((waterPerCycle * (dayCycles + nightCycles)) / 1000).toFixed(1);
    
    return {
      season,
      pumpTime,
      interval,
      dayCycles,
      nightCycles,
      cyclesPerDay: dayCycles + nightCycles,
      waterPerCycle,
      totalWaterPerDay,
      rockwoolMoisture: Math.round(ROCKWOOL_CHARACTERISTICS.waterRetention * 0.85), // Ajustado
      stats,
      rockwoolSize: ROCKWOOL_CHARACTERISTICS.size,
      rockwoolPH: ROCKWOOL_CHARACTERISTICS.initialPH,
      climateData: CASTELLON_CLIMATE[season],
      recommendations: [
        {
          icon: "💧",
          text: `Riego cada <strong>${interval} minutos</strong> durante el día (lanaroca 2.5cm)`
        },
        {
          icon: "🌱",
          text: `Tiempo bomba: <strong>${pumpTime}s</strong> (ajustado para tamaño pequeño)`
        },
        {
          icon: "📊",
          text: `pH lanaroca: <strong>${ROCKWOOL_CHARACTERISTICS.initialPH}</strong> (ya rebajado)`
        }
      ],
      rockwoolSchedule: dryingTimes
    };
  }, [plants, config.currentVol, config.temp]);
  
  const alerts = useMemo(() => {
    const alertList = [];
    
    // Alerta de pH
    const phDiff = Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH));
    if (phDiff > 0.5) {
      alertList.push({
        title: "pH fuera de rango",
        description: `pH actual: ${config.ph} (objetivo: ${config.targetPH})`,
        value: config.ph,
        color: "bg-gradient-to-r from-red-500 to-rose-600",
        icon: <AlertTriangle />,
        priority: 1
      });
    } else if (phDiff > 0.2) {
      alertList.push({
        title: "pH necesita ajuste",
        description: `pH actual: ${config.ph} (objetivo: ${config.targetPH})`,
        value: config.ph,
        color: "bg-gradient-to-r from-amber-500 to-orange-600",
        icon: <AlertCircle />,
        priority: 2
      });
    }
    
    // Alerta de EC
    const ecCurrent = parseFloat(config.ec);
    const ecTarget = parseFloat(config.targetEC);
    if (ecCurrent > ecTarget + 300) {
      alertList.push({
        title: "EC demasiado alta",
        description: `EC actual: ${config.ec}µS/cm (objetivo: ${config.targetEC}µS/cm)`,
        value: `${config.ec}µS`,
        color: "bg-gradient-to-r from-red-500 to-pink-600",
        icon: <Zap />,
        priority: 1
      });
    } else if (ecCurrent < ecTarget - 300) {
      alertList.push({
        title: "EC demasiado baja",
        description: `EC actual: ${config.ec}µS/cm (objetivo: ${config.targetEC}µS/cm)`,
        value: `${config.ec}µS`,
        color: "bg-gradient-to-r from-amber-500 to-yellow-600",
        icon: <Zap />,
        priority: 2
      });
    }
    
    // Alerta de temperatura
    const temp = parseFloat(config.temp);
    if (temp > 28) {
      alertList.push({
        title: "Temperatura alta",
        description: `Temperatura del agua: ${config.temp}°C (ideal: 18-25°C)`,
        value: `${config.temp}°C`,
        color: "bg-gradient-to-r from-red-500 to-orange-600",
        icon: <Thermometer />,
        priority: 1
      });
    } else if (temp < 18) {
      alertList.push({
        title: "Temperatura baja",
        description: `Temperatura del agua: ${config.temp}°C (ideal: 18-25°C)`,
        value: `${config.temp}°C`,
        color: "bg-gradient-to-r from-blue-500 to-cyan-600",
        icon: <ThermometerSnowflake />,
        priority: 1
      });
    }
    
    // Alerta de volumen bajo
    const volPercentage = (parseFloat(config.currentVol) / parseFloat(config.totalVol)) * 100;
    if (volPercentage < 25) {
      alertList.push({
        title: "Volumen de agua bajo",
        description: `Queda ${config.currentVol}L de ${config.totalVol}L (${volPercentage.toFixed(0)}%)`,
        value: `${config.currentVol}L`,
        color: "bg-gradient-to-r from-amber-500 to-amber-600",
        icon: <Droplet />,
        priority: 2
      });
    }
    
    return alertList;
  }, [config.ph, config.targetPH, config.ec, config.targetEC, config.temp, config.currentVol, config.totalVol]);
  
  // =================== FUNCIONES DE ACCIÓN ===================
  
  const handleRotation = () => {
    // Rotar plantas entre niveles
    const updatedPlants = plants.map(plant => {
      let newLevel = plant.level;
      if (plant.level === 1) newLevel = 2;
      else if (plant.level === 2) newLevel = 3;
      else if (plant.level === 3) newLevel = 1;
      
      return { ...plant, level: newLevel };
    });
    
    setPlants(updatedPlants);
    setLastRot(new Date().toISOString());
    
    // Mostrar notificación
    alert("✅ Plantas rotadas entre niveles");
  };
  
  // =================== COMPONENTES DE PESTAÑAS OPTIMIZADAS PARA MÓVIL ===================

  // 1. 📊 PANEL PRINCIPAL
  const DashboardTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-600 text-sm">Resumen general del sistema</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={
            irrigationData.season === "summer" ? "bg-amber-100 text-amber-800" :
            irrigationData.season === "winter" ? "bg-blue-100 text-blue-800" :
            irrigationData.season === "autumn" ? "bg-orange-100 text-orange-800" :
            "bg-green-100 text-green-800"
          }>
            {irrigationData.season === "summer" ? "Verano Castellón" :
             irrigationData.season === "winter" ? "Invierno Castellón" :
             irrigationData.season === "autumn" ? "Otoño Castellón" :
             "Primavera Castellón"}
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            {irrigationData.rockwoolSize}
          </Badge>
        </div>
      </div>
      
      {/* ALERTAS */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">⚠️ Alertas</h2>
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`${alert.color} text-white rounded-xl p-4 flex items-center gap-3`}
            >
              <div className="flex-shrink-0">
                {alert.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">{alert.title}</h3>
                  <span className="text-xl font-bold">{alert.value}</span>
                </div>
                <p className="text-white/90 text-sm mt-1">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* RESUMEN RÁPIDO - OPTIMIZADO MÓVIL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ESTADO DEL CULTIVO */}
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sprout className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Estado Cultivo</h3>
              <p className="text-xs text-slate-600">Sistema 5-5-5</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Plántulas (N1)</span>
              <span className="font-bold text-cyan-600">{irrigationData.stats.seedlingCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Crecimiento (N2)</span>
              <span className="font-bold text-green-600">{irrigationData.stats.growthCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Maduras (N3)</span>
              <span className="font-bold text-emerald-600">{irrigationData.stats.matureCount}/5</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex justify-between">
              <span className="font-bold text-slate-800 text-sm">Total plantas</span>
              <span className="font-bold text-blue-600">{plants.length}/15</span>
            </div>
          </div>
        </Card>
        
        {/* NUTRICIÓN AQUA VEGA */}
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Nutrición</h3>
              <p className="text-xs text-slate-600">Aqua Vega</p>
            </div>
          </div>
          
          {plants.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">EC objetivo</span>
                <span className="font-bold text-blue-600">{config.targetEC} µS/cm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">pH objetivo</span>
                <span className="font-bold text-purple-600">{config.targetPH}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">Aqua Vega A</span>
                <span className="font-bold text-emerald-600">{aquaVegaDosage.a} ml</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">Aqua Vega B</span>
                <span className="font-bold text-emerald-600">{aquaVegaDosage.b} ml</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-3 text-sm">Añade plantas para ver dosificación</p>
          )}
        </Card>
        
        {/* CONDICIONES ACTUALES */}
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <CloudRain className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Condiciones</h3>
              <p className="text-xs text-slate-600">Mediciones actuales</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">pH actual</span>
              <span className={`font-bold ${
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-red-600' :
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.2 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ph}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">EC actual</span>
              <span className={`font-bold ${
                parseFloat(config.ec) > parseFloat(config.targetEC) + 300 ? 'text-red-600' :
                parseFloat(config.ec) < parseFloat(config.targetEC) - 300 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ec} µS/cm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Volumen agua</span>
              <span className="font-bold text-blue-600">{config.currentVol}L / {config.totalVol}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Temperatura</span>
              <span className={`font-bold ${
                parseFloat(config.temp) > 28 ? 'text-red-600' : 
                parseFloat(config.temp) < 18 ? 'text-blue-600' : 
                'text-green-600'
              }`}>
                {config.temp}°C
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* BOTONES DE ACCIÓN RÁPIDA - OPTIMIZADOS MÓVIL */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setTab("measurements")}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white h-11"
          size="sm"
        >
          <Edit3 className="mr-2" size={16} />
          Mediciones
        </Button>
        
        <Button
          onClick={() => setTab("calculations")}
          variant="outline"
          className="h-11"
          size="sm"
        >
          <Calculator className="mr-2" size={16} />
          Cálculos
        </Button>
        
        <Button
          onClick={() => setTab("irrigation")}
          variant="outline"
          className="h-11"
          size="sm"
        >
          <Droplets className="mr-2" size={16} />
          Riego
        </Button>
        
        <Button
          onClick={handleRotation}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-11"
          size="sm"
        >
          <RotateCcw className="mr-2" size={16} />
          Rotar
        </Button>
      </div>
    </div>
  );

  // 2. 📝 MEDICIONES MANUALES
  const MeasurementsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📝 Mediciones</h2>
        <p className="text-slate-600 text-sm">Introduce valores medidos</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Ruler className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Valores Actuales</h3>
            <p className="text-sm text-slate-600">Actualiza según tus mediciones</p>
          </div>
        </div>
        
        <div className="space-y-5">
          {/* pH */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="text-purple-600" size={18} />
                <span className="font-bold text-slate-800">pH del Agua</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPH(!editingPH)}
                className="h-8 px-2"
              >
                {editingPH ? <Save size={14} /> : <Edit3 size={14} />}
              </Button>
            </div>
            
            {editingPH ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="9.0"
                  value={config.ph}
                  onChange={(e) => handleManualPHChange(e.target.value)}
                  className="text-center text-xl font-bold h-10"
                />
                <Slider
                  value={[parseFloat(config.ph)]}
                  min={4.0}
                  max={9.0}
                  step={0.1}
                  onValueChange={([value]) => handleManualPHChange(value.toString())}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>4.0</span>
                  <span className="font-bold text-green-600">5.5-6.5</span>
                  <span>9.0</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{config.ph}</div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                  parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5 ? '✅ ÓPTIMO' : '⚠️ AJUSTAR'}
                </div>
              </div>
            )}
          </div>
          
          {/* EC */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="text-blue-600" size={18} />
                <span className="font-bold text-slate-800">EC (Conductividad)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingEC(!editingEC)}
                className="h-8 px-2"
              >
                {editingEC ? <Save size={14} /> : <Edit3 size={14} />}
              </Button>
            </div>
            
            {editingEC ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  min="0"
                  max="3000"
                  step="50"
                  value={config.ec}
                  onChange={(e) => handleManualECChange(e.target.value)}
                  className="text-center text-xl font-bold h-10"
                />
                <Slider
                  value={[parseFloat(config.ec)]}
                  min={0}
                  max={3000}
                  step={50}
                  onValueChange={([value]) => handleManualECChange(value.toString())}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>0</span>
                  <span className="font-bold text-green-600">800-1800</span>
                  <span>3000</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{config.ec} µS/cm</div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                  parseFloat(config.ec) >= 800 && parseFloat(config.ec) <= 1800 
                    ? 'bg-green-100 text-green-800' 
                    : parseFloat(config.ec) > 1800 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {parseFloat(config.ec) > 1800 ? '⚠️ ALTA' : 
                   parseFloat(config.ec) < 800 ? '⚠️ BAJA' : '✅ ADECUADA'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* GUARDAR MEDICIÓN */}
        <div className="mt-5 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
          <Button
            onClick={() => {
              const now = new Date().toISOString();
              setHistory([{
                id: generatePlantId(),
                date: now,
                ph: config.ph,
                ec: config.ec,
                temp: config.temp,
                volume: config.currentVol,
                notes: "Medición manual"
              }, ...history]);
              alert("✅ Mediciones guardadas");
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-10"
          >
            <Save className="mr-2" size={16} />
            Guardar Mediciones
          </Button>
        </div>
      </Card>
    </div>
  );

  // 3. 🧪 CÁLCULOS Y CORRECCIONES
  const CalculationsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🧪 Cálculos</h2>
        <p className="text-slate-600 text-sm">Ajustes necesarios</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AJUSTE pH */}
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <RefreshCw className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Ajuste pH</h3>
              <p className="text-xs text-slate-600">{config.ph} → {config.targetPH}</p>
            </div>
          </div>
          
          {parseFloat(config.ph) > parseFloat(config.targetPH) ? (
            <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {phAdjustmentWithPretreatment.phMinus} ml
              </div>
              <p className="text-sm font-bold text-purple-700">pH- (Ácido)</p>
              <p className="text-xs text-slate-600">Para bajar pH</p>
            </div>
          ) : (
            <div className="text-center p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600 mb-1">
                {phAdjustmentWithPretreatment.phPlus} ml
              </div>
              <p className="text-sm font-bold text-pink-700">pH+ (Alcalino)</p>
              <p className="text-xs text-slate-600">Para subir pH</p>
            </div>
          )}
        </Card>
        
        {/* DOSIS AQUA VEGA */}
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Aqua Vega</h3>
              <p className="text-xs text-slate-600">Para {config.currentVol}L</p>
            </div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
            <div className="flex justify-center gap-4 mb-2">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{aquaVegaDosage.a}</div>
                <p className="text-xs text-emerald-700">ml A</p>
              </div>
              <div className="text-xl text-emerald-500">+</div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{aquaVegaDosage.b}</div>
                <p className="text-xs text-emerald-700">ml B</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              {aquaVegaDosage.per10L.a}ml A y {aquaVegaDosage.per10L.b}ml B por 10L
            </p>
          </div>
        </Card>
        
        {/* CALMAG */}
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Waves className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Suplemento</h3>
              <p className="text-xs text-slate-600">CalMag</p>
            </div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600 mb-1">
              {calmagNeeded.required ? `${calmagNeeded.dosage} ml` : '0 ml'}
            </div>
            <p className="text-sm font-bold text-cyan-700">CalMag</p>
            <p className="text-xs text-slate-600">
              {calmagNeeded.required ? '✅ Necesario' : '❌ No necesario'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );

  // 4. 💧 RIEGO ESPECÍFICO PARA LANAROCA 2.5x2.5cm
  const IrrigationTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">💧 Riego</h2>
        <p className="text-slate-600 text-sm">Lanaroca 2.5x2.5cm • pH {irrigationData.rockwoolPH}</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Droplets className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Riego Automático</h3>
              <p className="text-sm text-slate-600">Ajustado para lanaroca pequeña</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${irrigationConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-sm font-medium">{irrigationConfig.enabled ? 'ON' : 'OFF'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="text-center p-3 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-600">{irrigationData.pumpTime}s</div>
            <p className="text-xs text-blue-700">Tiempo bomba</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-b from-green-50 to-white rounded-lg border border-green-200">
            <div className="text-xl font-bold text-green-600">{Math.round(irrigationData.interval)}min</div>
            <p className="text-xs text-green-700">Intervalo</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-200">
            <div className="text-xl font-bold text-purple-600">{irrigationData.cyclesPerDay}</div>
            <p className="text-xs text-purple-700">Ciclos/día</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-b from-cyan-50 to-white rounded-lg border border-cyan-200">
            <div className="text-xl font-bold text-cyan-600">{irrigationData.totalWaterPerDay}L</div>
            <p className="text-xs text-cyan-700">Agua/día</p>
          </div>
        </div>
        
        {/* CONFIGURACIÓN */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tiempo Bomba: {irrigationConfig.pumpTime}s
            </label>
            <Slider
              value={[irrigationConfig.pumpTime]}
              min={5}
              max={15}
              step={1}
              onValueChange={([value]) => setIrrigationConfig({
                ...irrigationConfig, 
                pumpTime: value, 
                mode: "manual"
              })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Intervalo: {irrigationConfig.interval}min
            </label>
            <Slider
              value={[irrigationConfig.interval]}
              min={10}
              max={60}
              step={5}
              onValueChange={([value]) => setIrrigationConfig({
                ...irrigationConfig, 
                interval: value, 
                mode: "manual"
              })}
              className="w-full"
            />
          </div>
        </div>
      </Card>
      
      {/* TABLA DE RIEGO POR ESTACIÓN */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <CloudSunIcon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Riego por Estación</h3>
            <p className="text-sm text-slate-600">Castellón • Lanaroca 2.5cm</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Estación</th>
                <th className="p-2 text-left">Plántulas</th>
                <th className="p-2 text-left">Crecimiento</th>
                <th className="p-2 text-left">Maduras</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-medium text-amber-600">Verano</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.seedling.day}/{irrigationData.rockwoolSchedule.seedling.night}min</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.growth.day}/{irrigationData.rockwoolSchedule.growth.night}min</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.mature.day}/{irrigationData.rockwoolSchedule.mature.night}min</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-medium text-blue-600">Invierno</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.seedling.day}/{irrigationData.rockwoolSchedule.seedling.night}min</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.growth.day}/{irrigationData.rockwoolSchedule.growth.night}min</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.mature.day}/{irrigationData.rockwoolSchedule.mature.night}min</td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-green-600">Primavera</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.seedling.day}/{irrigationData.rockwoolSchedule.seedling.night}min</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.growth.day}/{irrigationData.rockwoolSchedule.growth.night}min</td>
                <td className="p-2">{irrigationData.rockwoolSchedule.mature.day}/{irrigationData.rockwoolSchedule.mature.night}min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // 5. 📅 CALENDARIO REAL DE MEDICIONES
  const CalendarTab = () => {
    // Generar calendario mensual
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const cultivationDays = history.length > 0 ? 
      Math.floor((new Date() - new Date(history[history.length-1].date)) / (1000 * 60 * 60 * 24)) : 0;
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">📅 Calendario</h2>
          <p className="text-slate-600 text-sm">Día {cultivationDays} de cultivo</p>
        </div>
        
        <Card className="p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <CalendarDays className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Calendario Mensual</h3>
              <p className="text-sm text-slate-600">{today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={index} className="text-center text-sm font-bold text-slate-600 p-2">
                {day}
              </div>
            ))}
            
            {days.map((day) => {
              const dayDate = new Date(currentYear, currentMonth, day);
              const hasMeasurement = history.some(h => 
                new Date(h.date).toDateString() === dayDate.toDateString()
              );
              const isToday = day === today.getDate() && currentMonth === today.getMonth();
              
              // Recomendaciones por día del cultivo
              let recommendation = "";
              if (cultivationDays + day <= 7) recommendation = "🌱 Inicio";
              else if (cultivationDays + day <= 21) recommendation = "📈 Crecimiento";
              else if (cultivationDays + day <= 42) recommendation = "🌿 Maduración";
              
              return (
                <div 
                  key={day}
                  className={`text-center p-2 rounded-lg border ${
                    isToday ? 'bg-blue-50 border-blue-300' :
                    hasMeasurement ? 'bg-green-50 border-green-300' :
                    'border-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-800">{day}</div>
                  {hasMeasurement && (
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                  )}
                  {recommendation && day <= 7 && (
                    <div className="text-xs text-slate-600 mt-1">{recommendation}</div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-700">Día con medición</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-700">Hoy</span>
            </div>
          </div>
        </Card>
        
        {/* PRÓXIMAS TAREAS */}
        <Card className="p-5 rounded-xl">
          <h3 className="font-bold text-slate-800 mb-4">Próximas Tareas</h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-700 text-sm mb-1">Medir pH y EC</h4>
              <p className="text-xs text-slate-700">Diariamente, misma hora</p>
              <div className="text-xs text-slate-600 mt-1">
                Última: {history[0] ? new Date(history[0].date).toLocaleDateString() : 'Sin registros'}
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <h4 className="font-bold text-emerald-700 text-sm mb-1">Rotar Niveles</h4>
              <p className="text-xs text-slate-700">Cada 7-10 días</p>
              <div className="text-xs text-slate-600 mt-1">
                Última: {new Date(lastRot).toLocaleDateString()}
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h4 className="font-bold text-purple-700 text-sm mb-1">Limpieza Depósito</h4>
              <p className="text-xs text-slate-700">Cada 4-6 semanas</p>
              <div className="text-xs text-slate-600 mt-1">
                Última: {new Date(lastClean).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // 6. 🌿 TORRE
  const TowerTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🌿 Torre</h2>
        <p className="text-slate-600 text-sm">Niveles 1-2-3 • Sistema 5-5-5</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <TreePine className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Disposición</h3>
              <p className="text-sm text-slate-600">Total: {plants.length} plantas</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(level => (
            <div key={level} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    level === 1 ? 'bg-cyan-500' : 
                    level === 2 ? 'bg-green-500' : 
                    'bg-emerald-500'
                  }`} />
                  <span className="font-bold text-slate-800">Nivel {level}</span>
                </div>
                <Badge className={
                  level === 1 ? 'bg-cyan-100 text-cyan-800' :
                  level === 2 ? 'bg-green-100 text-green-800' :
                  'bg-emerald-100 text-emerald-800'
                }>
                  {plants.filter(p => p.level === level).length} plantas
                </Badge>
              </div>
              
              {plants.filter(p => p.level === level).length === 0 ? (
                <p className="text-slate-500 text-center py-2 text-sm">Vacío</p>
              ) : (
                <div className="grid grid-cols-5 gap-1">
                  {plants.filter(p => p.level === level).map(plant => (
                    <div key={plant.id} className="p-1 bg-white rounded border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-800 truncate">{plant.name}</div>
                      <div className="text-xs text-slate-600 truncate">{plant.stage}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // 7. 📈 HISTORIAL
  const HistoryTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📈 Historial</h2>
        <p className="text-slate-600 text-sm">{history.length} mediciones</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <BarChart className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Registros</h3>
              <p className="text-sm text-slate-600">Últimas mediciones</p>
            </div>
          </div>
        </div>
        
        {history.length === 0 ? (
          <p className="text-slate-500 text-center py-6 text-sm">No hay mediciones</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.slice(0, 10).map((record, index) => (
              <div key={index} className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-slate-800">
                    {new Date(record.date).toLocaleDateString('es-ES', { 
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-purple-100 text-purple-800 text-xs">pH: {record.ph}</Badge>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">EC: {record.ec}</Badge>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  Temp: {record.temp}°C • {record.notes || 'Medición'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  // 8. 🎓 CONSEJOS MAESTROS
  const TipsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🎓 Consejos</h2>
        <p className="text-slate-600 text-sm">Maestros • Castellón • Lanaroca</p>
      </div>
      
      {/* PREPARACIÓN PLÁNTULA */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <SeedlingIcon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Preparación Plántula</h3>
            <p className="text-sm text-slate-600">De sustrato a torre</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
            <h4 className="font-bold text-emerald-700 text-sm mb-1">1. Hidratar lanaroca</h4>
            <p className="text-xs text-slate-700">Sumergir dados en agua pH 5.8 por 24h. Escurrir sin apretar.</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h4 className="font-bold text-blue-700 text-sm mb-1">2. Trasplante</h4>
            <p className="text-xs text-slate-700">Con plántula de 2-3 hojas verdaderas. Hacer agujero en centro del dado con lápiz.</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <h4 className="font-bold text-purple-700 text-sm mb-1">3. Colocación en cesta</h4>
            <p className="text-xs text-slate-700">Insertar dado en cesta hidropónica. Raíces deben tocar solución nutritiva.</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
            <h4 className="font-bold text-amber-700 text-sm mb-1">4. Aclimatación</h4>
            <p className="text-xs text-slate-700">Primeros 3 días: EC 800µS, riego cada 45min. Luego ajustar según crecimiento.</p>
          </div>
        </div>
      </Card>
      
      {/* LIMPIEZA DEPÓSITO */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Limpieza Depósito</h3>
            <p className="text-sm text-slate-600">Prevención de algas y biofilms</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
            <h4 className="font-bold text-cyan-700 text-sm mb-1">Frecuencia</h4>
            <p className="text-xs text-slate-700">Cada 4-6 semanas • Tras cosecha completa</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h4 className="font-bold text-blue-700 text-sm mb-1">Procedimiento</h4>
            <ul className="text-xs text-slate-700 space-y-1 ml-4 list-disc">
              <li>Vaciar depósito completamente</li>
              <li>Frotar con esponja suave y agua caliente</li>
              <li>Para algas: solución 10% agua oxigenada (30min)</li>
              <li>Enjuagar 3 veces con agua limpia</li>
              <li>Secar al aire 2 horas antes de rellenar</li>
            </ul>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
            <h4 className="font-bold text-purple-700 text-sm mb-1">Productos NO recomendados</h4>
            <p className="text-xs text-slate-700">Lejía, jabones, detergentes. Alteran pH y dejan residuos.</p>
          </div>
        </div>
      </Card>
      
      {/* CLIMATOLOGÍA CASTELLÓN */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <ThermometerSunIcon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Climatología Castellón</h3>
            <p className="text-sm text-slate-600">Ajustes por estación</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
            <h4 className="font-bold text-amber-700 text-sm mb-1">Verano (Jun-Sep)</h4>
            <p className="text-xs text-slate-700">Temp: 22-32°C • Humedad: 60-70% • Viento: Poniente</p>
            <p className="text-xs text-slate-600 mt-1">📌 Aumentar riego 20% • Controlar temperatura agua • Reducir EC si >30°C</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h4 className="font-bold text-blue-700 text-sm mb-1">Invierno (Dic-Feb)</h4>
            <p className="text-xs text-slate-700">Temp: 8-16°C • Humedad: 70-80% • Viento: Tramontana</p>
            <p className="text-xs text-slate-600 mt-1">📌 Reducir riego 30% • Usar calentador • Aumentar EC 10%</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <h4 className="font-bold text-green-700 text-sm mb-1">Primavera (Mar-May)</h4>
            <p className="text-xs text-slate-700">Temp: 12-22°C • Humedad: 65-75% • Brisas marinas</p>
            <p className="text-xs text-slate-600 mt-1">📌 Época ideal • Riego normal • Monitorear lluvias</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <h4 className="font-bold text-orange-700 text-sm mb-1">Otoño (Oct-Nov)</h4>
            <p className="text-xs text-slate-700">Temp: 14-24°C • Humedad: 70-80% • Levante húmedo</p>
            <p className="text-xs text-slate-600 mt-1">📌 Prevenir hongos • Reducir EC si llueve • Controlar humedad</p>
          </div>
        </div>
      </Card>
    </div>
  );

  // =================== FLUJO DE CONFIGURACIÓN SIMPLIFICADO ===================

  const renderStepContent = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">HydroCaru</h1>
            <p className="text-slate-600 mb-6">Sistema hidropónico para Castellón</p>
            <Button onClick={() => setStep(1)} className="bg-gradient-to-r from-emerald-500 to-green-600 w-full h-12">
              Iniciar Configuración <ArrowRight className="ml-2" />
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Tipo de Agua</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(WATER_TYPES).map(([key, water]) => (
                <Card 
                  key={key}
                  className={`p-3 cursor-pointer transition-all h-24 flex flex-col justify-center ${
                    config.waterType === key ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                  }`}
                  onClick={() => setConfig({...config, waterType: key})}
                >
                  <div className="font-medium text-slate-800 text-sm">{water.name}</div>
                  <div className="text-xs text-slate-600 mt-1">EC: {water.ec} µS/cm</div>
                  <div className="text-xs text-slate-600">pH: {water.ph}</div>
                </Card>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-11">
                <ArrowLeft className="mr-2" size={16} /> Atrás
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1 h-11">
                Continuar <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Volúmenes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Volumen Total (L)
                </label>
                <Input
                  type="number"
                  value={config.totalVol}
                  onChange={(e) => setConfig({...config, totalVol: e.target.value})}
                  className="w-full h-11"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Volumen Actual (L)
                </label>
                <Input
                  type="number"
                  value={config.currentVol}
                  onChange={(e) => setConfig({...config, currentVol: e.target.value})}
                  className="w-full h-11"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                <ArrowLeft className="mr-2" size={16} /> Atrás
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 h-11">
                Continuar <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Configuración Inicial</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Riego Automático</span>
                <Switch
                  checked={irrigationConfig.enabled}
                  onCheckedChange={(checked) => setIrrigationConfig({...irrigationConfig, enabled: checked})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  pH Objetivo
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={config.targetPH}
                  onChange={(e) => setConfig({...config, targetPH: e.target.value})}
                  className="w-full h-11"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  EC Objetivo (µS/cm)
                </label>
                <Input
                  type="number"
                  value={config.targetEC}
                  onChange={(e) => setConfig({...config, targetEC: e.target.value})}
                  className="w-full h-11"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11">
                <ArrowLeft className="mr-2" size={16} /> Atrás
              </Button>
              <Button onClick={() => setStep(4)} className="bg-gradient-to-r from-emerald-500 to-green-600 flex-1 h-11">
                Completar <Check className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // =================== RENDER PRINCIPAL OPTIMIZADO MÓVIL ===================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      {/* Header optimizado móvil */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={18} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm">HydroCaru</h1>
                <p className="text-xs text-slate-600">Castellón • Lanaroca 2.5cm</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {step >= 4 ? (
                <>
                  <div className="hidden xs:block">
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <span>pH:{config.ph}</span>
                      <span>•</span>
                      <span>EC:{config.ec}</span>
                    </div>
                  </div>
                  
                  <Badge className={`text-xs ${
                    alerts.some(a => a.priority === 1) 
                      ? "bg-red-100 text-red-800" 
                      : alerts.some(a => a.priority === 2)
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {alerts.filter(a => a.priority === 1).length > 0 
                      ? `${alerts.filter(a => a.priority === 1).length}⚠️` 
                      : alerts.filter(a => a.priority === 2).length > 0
                      ? `${alerts.filter(a => a.priority === 2).length}📋`
                      : "OK"}
                  </Badge>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-600">Paso {step + 1}/4</div>
                  <Progress value={(step + 1) * 25} className="w-16 h-1.5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navegación optimizada para iPhone */}
      {step >= 4 && (
        <div className="sticky top-14 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="container mx-auto px-2 max-w-6xl">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="flex w-full overflow-x-auto py-1 px-1">
                <TabsTrigger value="dashboard" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <Home size={14} className="mr-1" />
                  Panel
                </TabsTrigger>
                <TabsTrigger value="measurements" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <Ruler size={14} className="mr-1" />
                  Mediciones
                </TabsTrigger>
                <TabsTrigger value="calculations" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <Calculator size={14} className="mr-1" />
                  Cálculos
                </TabsTrigger>
                <TabsTrigger value="irrigation" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <Droplets size={14} className="mr-1" />
                  Riego
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <CalendarDays size={14} className="mr-1" />
                  Calendario
                </TabsTrigger>
                <TabsTrigger value="tower" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <TreePine size={14} className="mr-1" />
                  Torre
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <BarChart size={14} className="mr-1" />
                  Historial
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <BookOpen size={14} className="mr-1" />
                  Consejos
                </TabsTrigger>
              </TabsList>
              
              {/* Contenido de las pestañas */}
              <div className="mt-4">
                <TabsContent value="dashboard">
                  <DashboardTab />
                </TabsContent>
                
                <TabsContent value="measurements">
                  <MeasurementsTab />
                </TabsContent>
                
                <TabsContent value="calculations">
                  <CalculationsTab />
                </TabsContent>
                
                <TabsContent value="irrigation">
                  <IrrigationTab />
                </TabsContent>
                
                <TabsContent value="calendar">
                  <CalendarTab />
                </TabsContent>
                
                <TabsContent value="tower">
                  <TowerTab />
                </TabsContent>
                
                <TabsContent value="history">
                  <HistoryTab />
                </TabsContent>
                
                <TabsContent value="tips">
                  <TipsTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 max-w-6xl">
        {step < 4 ? (
          <div className="max-w-md mx-auto">
            {renderStepContent()}
          </div>
        ) : (
          <div></div>
        )}
      </main>

      {/* Footer optimizado móvil */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-600 text-center">
              HydroCaru • Lanaroca 2.5cm • Castellón
            </div>
            
            {step >= 4 && (
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    irrigationConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                  }`} />
                  <span className="text-xs text-slate-600">
                    Riego: {irrigationConfig.enabled 
                      ? `${irrigationData.pumpTime}s/${Math.round(irrigationData.interval)}min` 
                      : 'OFF'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-600">
                    pH: <span className={`font-bold ${
                      Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-red-600' :
                      Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.2 ? 'text-amber-600' :
                      'text-green-600'
                    }`}>{config.ph}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
