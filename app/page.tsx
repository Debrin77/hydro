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
  Waves, Target, RefreshCw as RotateIcon,
  Thermometer as ThermometerIcon2,
  Droplet as DropletIcon
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
      "Vigilar temperatura del agua (&lt;28°C)",
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
  const [plants, setPlants] = useState([
    { id: "1", name: "Lechuga Romana", variety: "lechuga", stage: "seedling", level: 1, plantDate: new Date().toISOString() },
    { id: "2", name: "Kale Verde", variety: "kale", stage: "growth", level: 2, plantDate: new Date(Date.now() - 7*24*60*60*1000).toISOString() },
    { id: "3", name: "Espinaca", variety: "espinaca", stage: "mature", level: 3, plantDate: new Date(Date.now() - 14*24*60*60*1000).toISOString() }
  ]);
  const [history, setHistory] = useState([]);
  const [lastRotation, setLastRotation] = useState(new Date().toISOString());
  const [lastCleaning, setLastCleaning] = useState(new Date().toISOString());
  const [tab, setTab] = useState("dashboard");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
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
    waterNotes: "",
    hasHeater: true,
    
    // Parámetros adicionales
    humidity: "65",
    lightHours: "12",
    location: "Castellón"
  });
  
  // Configuración de riego optimizada para torre vertical
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    pumpTime: 15, // 15 segundos para torre vertical
    interval: 120, // 2 horas para torre vertical (flujo continuo)
    showAdvanced: false,
    notes: "",
    rockwoolSize: "2.5x2.5cm"
  });

  // Estados para edición
  const [editingPH, setEditingPH] = useState(false);
  const [editingEC, setEditingEC] = useState(false);
  const [editingTemp, setEditingTemp] = useState(false);
  const [editingVolume, setEditingVolume] = useState(false);
  
  // =================== FUNCIONES DE UTILIDAD ===================
  
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  // =================== FUNCIONES PARA EDICIÓN MANUAL ===================
  
  const handleManualPHChange = (value) => {
    setConfig({...config, ph: value});
    const now = new Date().toISOString();
    setHistory([{
      id: generateId(),
      date: now,
      ph: value,
      ec: config.ec,
      temp: config.temp,
      volume: config.currentVol,
      notes: "Medición manual de pH"
    }, ...history.slice(0, 49)]);
  };
  
  const handleManualECChange = (value) => {
    setConfig({...config, ec: value});
    const now = new Date().toISOString();
    setHistory([{
      id: generateId(),
      date: now,
      ph: config.ph,
      ec: value,
      temp: config.temp,
      volume: config.currentVol,
      notes: "Medición manual de EC"
    }, ...history.slice(0, 49)]);
  };
  
  const handleManualTempChange = (value) => {
    setConfig({...config, temp: value});
    const now = new Date().toISOString();
    setHistory([{
      id: generateId(),
      date: now,
      ph: config.ph,
      ec: config.ec,
      temp: value,
      volume: config.currentVol,
      notes: "Medición manual de temperatura"
    }, ...history.slice(0, 49)]);
  };
  
  const handleManualVolumeChange = (value) => {
    setConfig({...config, currentVol: value});
  };
  
  // =================== FUNCIONES DE ACCIÓN ===================
  
  const handleRotatePlants = () => {
    const updatedPlants = plants.map(plant => {
      let newLevel = plant.level;
      if (plant.level === 1) newLevel = 2;
      else if (plant.level === 2) newLevel = 3;
      else if (plant.level === 3) newLevel = 1;
      
      return { ...plant, level: newLevel };
    });
    
    setPlants(updatedPlants);
    setLastRotation(new Date().toISOString());
    
    // Mostrar notificación
    alert("✅ Plantas rotadas entre niveles exitosamente");
  };
  
  const handleCleanDeposit = () => {
    setLastCleaning(new Date().toISOString());
    alert("✅ Registro de limpieza actualizado. Próxima limpieza en 14 días.");
  };
  
  const handleResetSystem = () => {
    if (confirm("¿Estás seguro de reiniciar el sistema? Esto borrará todas las plantas y el historial.")) {
      setPlants([]);
      setHistory([]);
      setConfig({
        ...config,
        ph: "6.0",
        ec: "1200",
        temp: "22",
        currentVol: "20"
      });
      alert("✅ Sistema reiniciado");
    }
  };
  
  const handleDeleteHistory = (id) => {
    if (confirm("¿Eliminar este registro del historial?")) {
      setHistory(history.filter(item => item.id !== id));
    }
  };
  
  // =================== CÁLCULOS ===================
  
  const waterCharacteristics = useMemo(() => {
    return WATER_TYPES[config.waterType] || WATER_TYPES.bajo_mineral;
  }, [config.waterType]);
  
  // DOSIS DE AQUA VEGA
  const aquaVegaDosage = useMemo(() => {
    const volume = parseFloat(config.currentVol);
    const basePer10L = { a: 15, b: 15 }; // Aqua Vega A y B
    const totalA = (volume / 10) * basePer10L.a;
    const totalB = (volume / 10) * basePer10L.b;
    
    return {
      a: Math.round(totalA * 100) / 100,
      b: Math.round(totalB * 100) / 100,
      per10L: basePer10L,
      productName: "Aqua Vega"
    };
  }, [config.currentVol]);
  
  const phAdjustment = useMemo(() => {
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
        reason: "No necesario"
      };
    }
  }, [config.waterType, config.currentVol]);
  
  // CÁLCULO DE RIEGO PARA TORRE VERTICAL
  const irrigationData = useMemo(() => {
    const plantCount = plants.length || 1;
    const volume = parseFloat(config.currentVol);
    const temp = parseFloat(config.temp);
    
    // Determinar estación
    const month = new Date().getMonth();
    let season = "spring";
    if (month >= 5 && month <= 8) season = "summer";
    else if (month >= 11 || month <= 2) season = "winter";
    else if (month >= 9 && month <= 10) season = "autumn";
    
    // Para torre vertical: riego más largo pero menos frecuente
    let pumpTime = 15; // 15 segundos para torre
    let interval = 120; // 2 horas base
    
    // Ajustes por temperatura
    if (temp > 25) interval = 90; // 1.5 horas si hace calor
    if (temp < 18) interval = 180; // 3 horas si hace frío
    
    // Ciclos por día (torre funciona principalmente durante el día)
    const dayCycles = Math.round((14 * 60) / interval);
    const nightCycles = 0; // Torre normalmente se apaga de noche
    
    return {
      season,
      pumpTime,
      interval,
      dayCycles,
      nightCycles,
      cyclesPerDay: dayCycles,
      waterPerCycle: plantCount * 50, // 50ml por planta por ciclo
      totalWaterPerDay: ((plantCount * 50 * dayCycles) / 1000).toFixed(1),
      climateData: CASTELLON_CLIMATE[season],
      recommendations: [
        {
          icon: "💧",
          text: `Riego cada <strong>${interval} minutos</strong> (torre vertical)`
        },
        {
          icon: "🌱",
          text: `Tiempo bomba: <strong>${pumpTime}s</strong> por ciclo`
        },
        {
          icon: "⏰",
          text: `Solo durante horas de luz (14h/día)`
        }
      ]
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
    }
    
    // Alerta de volumen bajo
    const volPercentage = (parseFloat(config.currentVol) / parseFloat(config.totalVol)) * 100;
    if (volPercentage < 30) {
      alertList.push({
        title: "Volumen de agua bajo",
        description: `Queda ${config.currentVol}L de ${config.totalVol}L (${volPercentage.toFixed(0)}%)`,
        value: `${config.currentVol}L`,
        color: "bg-gradient-to-r from-amber-500 to-amber-600",
        icon: <Droplet />,
        priority: 2
      });
    }
    
    // Alerta de limpieza
    const daysSinceCleaning = Math.floor((new Date() - new Date(lastCleaning)) / (1000 * 60 * 60 * 24));
    if (daysSinceCleaning >= 14) {
      alertList.push({
        title: "Limpieza requerida",
        description: `Han pasado ${daysSinceCleaning} días desde la última limpieza`,
        value: `${daysSinceCleaning}d`,
        color: "bg-gradient-to-r from-purple-500 to-pink-600",
        icon: <Shield />,
        priority: 2
      });
    }
    
    return alertList;
  }, [config.ph, config.targetPH, config.ec, config.targetEC, config.temp, config.currentVol, config.totalVol, lastCleaning]);
  
  // =================== COMPONENTES DE PESTAÑAS ===================

  // 1. 📊 PANEL PRINCIPAL
  const DashboardTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Panel de Control HydroCaru</h1>
          <p className="text-slate-600 text-sm">Sistema hidropónico para Castellón</p>
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
            Torre Vertical
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
      
      {/* RESUMEN RÁPIDO */}
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
              <span className="font-bold text-cyan-600">{plants.filter(p => p.stage === "seedling").length}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Crecimiento (N2)</span>
              <span className="font-bold text-green-600">{plants.filter(p => p.stage === "growth").length}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Maduras (N3)</span>
              <span className="font-bold text-emerald-600">{plants.filter(p => p.stage === "mature").length}/5</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex justify-between">
              <span className="font-bold text-slate-800 text-sm">Total plantas</span>
              <span className="font-bold text-blue-600">{plants.length}/15</span>
            </div>
          </div>
        </Card>
        
        {/* NUTRICIÓN */}
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
              <span className="text-sm text-slate-700">Temperatura agua</span>
              <span className={`font-bold ${
                parseFloat(config.temp) > 28 ? 'text-red-600' : 
                parseFloat(config.temp) < 18 ? 'text-blue-600' : 
                'text-green-600'
              }`}>
                {config.temp}°C
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Volumen agua</span>
              <span className="font-bold text-blue-600">{config.currentVol}L / {config.totalVol}L</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* BOTONES DE ACCIÓN RÁPIDA */}
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
          onClick={handleRotatePlants}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-11"
          size="sm"
        >
          <RotateIcon className="mr-2" size={16} />
          Rotar Plantas
        </Button>
      </div>
    </div>
  );

  // 2. 📝 MEDICIONES MANUALES
  const MeasurementsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📝 Mediciones Manuales</h2>
        <p className="text-slate-600 text-sm">Introduce valores medidos del sistema</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Ruler className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Valores Actuales del Sistema</h3>
            <p className="text-sm text-slate-600">Actualiza según tus mediciones diarias</p>
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
          
          {/* TEMPERATURA */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ThermometerIcon2 className="text-amber-600" size={18} />
                <span className="font-bold text-slate-800">Temperatura del Agua</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingTemp(!editingTemp)}
                className="h-8 px-2"
              >
                {editingTemp ? <Save size={14} /> : <Edit3 size={14} />}
              </Button>
            </div>
            
            {editingTemp ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={config.temp}
                  onChange={(e) => handleManualTempChange(e.target.value)}
                  className="text-center text-xl font-bold h-10"
                />
                <Slider
                  value={[parseFloat(config.temp)]}
                  min={0}
                  max={40}
                  step={0.5}
                  onValueChange={([value]) => handleManualTempChange(value.toString())}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>0°C</span>
                  <span className="font-bold text-green-600">18-25°C</span>
                  <span>40°C</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">{config.temp}°C</div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                  parseFloat(config.temp) >= 18 && parseFloat(config.temp) <= 25 
                    ? 'bg-green-100 text-green-800' 
                    : parseFloat(config.temp) > 25 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {parseFloat(config.temp) > 25 ? '⚠️ CALIENTE' : 
                   parseFloat(config.temp) < 18 ? '⚠️ FRÍA' : '✅ ÓPTIMA'}
                </div>
              </div>
            )}
          </div>
          
          {/* VOLUMEN */}
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DropletIcon className="text-cyan-600" size={18} />
                <span className="font-bold text-slate-800">Volumen del Depósito</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingVolume(!editingVolume)}
                className="h-8 px-2"
              >
                {editingVolume ? <Save size={14} /> : <Edit3 size={14} />}
              </Button>
            </div>
            
            {editingVolume ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  min="0"
                  max={parseFloat(config.totalVol)}
                  step="0.5"
                  value={config.currentVol}
                  onChange={(e) => handleManualVolumeChange(e.target.value)}
                  className="text-center text-xl font-bold h-10"
                />
                <Slider
                  value={[parseFloat(config.currentVol)]}
                  min={0}
                  max={parseFloat(config.totalVol)}
                  step={0.5}
                  onValueChange={([value]) => handleManualVolumeChange(value.toString())}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>0L</span>
                  <span className="font-bold text-green-600">Objetivo: {config.totalVol}L</span>
                  <span>{config.totalVol}L</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-1">{config.currentVol}L</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex-1">
                    <Progress 
                      value={(parseFloat(config.currentVol) / parseFloat(config.totalVol)) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    de {config.totalVol}L
                  </div>
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
                id: generateId(),
                date: now,
                ph: config.ph,
                ec: config.ec,
                temp: config.temp,
                volume: config.currentVol,
                notes: "Medición manual completa"
              }, ...history]);
              alert("✅ Mediciones guardadas en el historial");
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-10"
          >
            <Save className="mr-2" size={16} />
            Guardar Todas las Mediciones
          </Button>
        </div>
      </Card>
    </div>
  );

  // 3. 🧪 CÁLCULOS Y CORRECCIONES
  const CalculationsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🧪 Cálculos y Ajustes</h2>
        <p className="text-slate-600 text-sm">Para {config.currentVol}L de agua a {config.temp}°C</p>
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
                {phAdjustment.phMinus} ml
              </div>
              <p className="text-sm font-bold text-purple-700">pH- (Ácido)</p>
              <p className="text-xs text-slate-600">Para bajar pH en {config.currentVol}L</p>
            </div>
          ) : (
            <div className="text-center p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600 mb-1">
                {phAdjustment.phPlus} ml
              </div>
              <p className="text-sm font-bold text-pink-700">pH+ (Alcalino)</p>
              <p className="text-xs text-slate-600">Para subir pH en {config.currentVol}L</p>
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
            {calmagNeeded.required && (
              <p className="text-xs text-slate-600 mt-1">{calmagNeeded.reason}</p>
            )}
          </div>
        </Card>
      </div>
      
      {/* RECOMENDACIONES POR TEMPERATURA */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <ThermometerIcon2 className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Recomendaciones por Temperatura</h3>
            <p className="text-sm text-slate-600">Agua a {config.temp}°C</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {parseFloat(config.temp) > 28 ? (
            <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
              <h4 className="font-bold text-red-700 text-sm mb-1">Temperatura ALTA (&gt;28°C)</h4>
              <ul className="text-xs text-slate-700 space-y-1 ml-4 list-disc">
                <li>Reducir EC en 200-300 µS/cm</li>
                <li>Aumentar oxigenación del agua</li>
                <li>Considerar enfriador de agua</li>
                <li>Monitorear raíces por pudrición</li>
              </ul>
            </div>
          ) : parseFloat(config.temp) < 18 ? (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-700 text-sm mb-1">Temperatura BAJA (&lt;18°C)</h4>
              <ul className="text-xs text-slate-700 space-y-1 ml-4 list-disc">
                <li>Aumentar EC en 100-200 µS/cm</li>
                <li>Usar calentador de agua</li>
                <li>Reducir frecuencia de riego</li>
                <li>Proteger de corrientes de aire frío</li>
              </ul>
            </div>
          ) : (
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-700 text-sm mb-1">Temperatura ÓPTIMA (18-25°C)</h4>
              <ul className="text-xs text-slate-700 space-y-1 ml-4 list-disc">
                <li>Mantener EC entre 800-1800 µS/cm</li>
                <li>Riego normal según programación</li>
                <li>pH estable entre 5.5-6.5</li>
                <li>Crecimiento óptimo garantizado</li>
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // 4. 💧 RIEGO PARA TORRE VERTICAL
  const IrrigationTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">💧 Riego Torre Vertical</h2>
        <p className="text-slate-600 text-sm">Configuración optimizada para cultivo vertical</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Droplets className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Programación de Riego</h3>
              <p className="text-sm text-slate-600">Torre hidropónica vertical</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${irrigationConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-sm font-medium">{irrigationConfig.enabled ? 'ACTIVO' : 'INACTIVO'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="text-center p-3 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-600">{irrigationConfig.pumpTime}s</div>
            <p className="text-xs text-blue-700">Tiempo bomba</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-b from-green-50 to-white rounded-lg border border-green-200">
            <div className="text-xl font-bold text-green-600">{Math.round(irrigationConfig.interval)}min</div>
            <p className="text-xs text-green-700">Intervalo</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-b from-purple-50 to-white rounded-lg border border-purple-200">
            <div className="text-xl font-bold text-purple-600">{irrigationData.dayCycles}</div>
            <p className="text-xs text-purple-700">Ciclos/día</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-b from-cyan-50 to-white rounded-lg border border-cyan-200">
            <div className="text-xl font-bold text-cyan-600">{irrigationData.totalWaterPerDay}L</div>
            <p className="text-xs text-cyan-700">Agua/día</p>
          </div>
        </div>
        
        {/* EXPLICACIÓN TORRE VERTICAL */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 mb-5">
          <h4 className="font-bold text-slate-800 text-sm mb-2">📌 Características de riego en torre vertical:</h4>
          <ul className="text-xs text-slate-700 space-y-1 ml-4 list-disc">
            <li><strong>Ciclos más largos pero menos frecuentes</strong> (2-3 horas)</li>
            <li><strong>Tiempo de bomba de 15-30 segundos</strong> para humedecer todas las plantas</li>
            <li><strong>Solo durante horas de luz</strong> (normalmente 14h/día)</li>
            <li><strong>Sistema se apaga de noche</strong> para ahorrar energía y prevenir hongos</li>
            <li><strong>Flujo descendente por gravedad</strong> optimiza distribución de nutrientes</li>
          </ul>
        </div>
        
        {/* CONFIGURACIÓN */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tiempo de Bomba: {irrigationConfig.pumpTime} segundos
            </label>
            <Slider
              value={[irrigationConfig.pumpTime]}
              min={10}
              max={30}
              step={1}
              onValueChange={([value]) => setIrrigationConfig({
                ...irrigationConfig, 
                pumpTime: value
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>10s (mínimo)</span>
              <span className="font-bold">15s (recomendado)</span>
              <span>30s (máximo)</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Intervalo entre Riegos: {irrigationConfig.interval} minutos
            </label>
            <Slider
              value={[irrigationConfig.interval]}
              min={60}
              max={240}
              step={15}
              onValueChange={([value]) => setIrrigationConfig({
                ...irrigationConfig, 
                interval: value
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>1 hora</span>
              <span className="font-bold">2 horas (recomendado)</span>
              <span>4 horas</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-sm font-medium text-slate-700">Riego Automático</span>
            <Switch
              checked={irrigationConfig.enabled}
              onCheckedChange={(checked) => setIrrigationConfig({...irrigationConfig, enabled: checked})}
            />
          </div>
        </div>
      </Card>
      
      {/* RECOMENDACIONES POR ESTACIÓN */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <CloudSunIcon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Recomendaciones por Estación</h3>
            <p className="text-sm text-slate-600">Castellón • Torre Vertical</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <h4 className="font-bold text-amber-700 text-sm mb-1">Verano (Jun-Sep)</h4>
            <p className="text-xs text-slate-700">Intervalo: 90 min • Tiempo bomba: 15s</p>
            <p className="text-xs text-slate-600 mt-1">📌 Aumentar frecuencia por evaporación • Monitorear temperatura agua</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-700 text-sm mb-1">Invierno (Dic-Feb)</h4>
            <p className="text-xs text-slate-700">Intervalo: 180 min • Tiempo bomba: 20s</p>
            <p className="text-xs text-slate-600 mt-1">📌 Reducir frecuencia • Usar calentador • Aumentar EC 10%</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-700 text-sm mb-1">Primavera/Otoño (Mar-May, Oct-Nov)</h4>
            <p className="text-xs text-slate-700">Intervalo: 120 min • Tiempo bomba: 15s</p>
            <p className="text-xs text-slate-600 mt-1">📌 Configuración estándar • Ideal para crecimiento</p>
          </div>
        </div>
      </Card>
    </div>
  );

  // 5. 📅 CALENDARIO DE MANTENIMIENTO
  const CalendarTab = () => {
    // Calcular días desde última limpieza
    const daysSinceCleaning = Math.floor((new Date() - new Date(lastCleaning)) / (1000 * 60 * 60 * 24));
    const nextCleaning = 14 - daysSinceCleaning;
    
    // Generar calendario mensual
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Días de medición recomendados (cada 2-3 días)
    const measurementDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      if (i % 2 === 1) { // Días impares para mediciones
        measurementDays.push(i);
      }
    }
    
    // Días de limpieza recomendados (cada 14 días desde última)
    const cleaningDays = [];
    let cleaningDay = new Date(lastCleaning).getDate();
    while (cleaningDay <= daysInMonth) {
      cleaningDays.push(cleaningDay);
      cleaningDay += 14;
    }
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">📅 Calendario de Mantenimiento</h2>
          <p className="text-slate-600 text-sm">Planificación de tareas del sistema</p>
        </div>
        
        {/* RESUMEN DE TAREAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Ruler className="text-white" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Mediciones</h3>
                <p className="text-sm text-slate-600">Cada 2-3 días</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {measurementDays.length} días
              </div>
              <p className="text-xs text-slate-600">Recomendados este mes</p>
            </div>
          </Card>
          
          <Card className="p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Limpieza Depósito</h3>
                <p className="text-sm text-slate-600">Cada 14 días</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600 mb-1">
                {nextCleaning > 0 ? `En ${nextCleaning} días` : "¡HOY!"}
              </div>
              <p className="text-xs text-slate-600">Última: {new Date(lastCleaning).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>
        
        <Card className="p-5 rounded-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <CalendarDays className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Calendario Mensual</h3>
                <p className="text-sm text-slate-600">{today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            
            <Button
              onClick={handleCleanDeposit}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-8 text-xs"
            >
              <Shield className="mr-1" size={12} />
              Registrar Limpieza
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={index} className="text-center text-sm font-bold text-slate-600 p-2">
                {day}
              </div>
            ))}
            
            {days.map((day) => {
              const isToday = day === today.getDate() && currentMonth === today.getMonth();
              const isMeasurementDay = measurementDays.includes(day);
              const isCleaningDay = cleaningDays.includes(day);
              
              return (
                <div 
                  key={day}
                  className={`text-center p-2 rounded-lg border ${
                    isToday ? 'bg-blue-50 border-blue-300' :
                    isCleaningDay ? 'bg-cyan-50 border-cyan-300' :
                    isMeasurementDay ? 'bg-emerald-50 border-emerald-300' :
                    'border-slate-200'
                  }`}
                >
                  <div className={`font-bold ${
                    isToday ? 'text-blue-600' :
                    isCleaningDay ? 'text-cyan-700' :
                    isMeasurementDay ? 'text-emerald-700' :
                    'text-slate-800'
                  }`}>
                    {day}
                  </div>
                  {isCleaningDay && (
                    <div className="text-xs text-cyan-600 mt-1">🧹</div>
                  )}
                  {isMeasurementDay && !isCleaningDay && (
                    <div className="text-xs text-emerald-600 mt-1">📊</div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-slate-700">Día de medición recomendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span className="text-sm text-slate-700">Día de limpieza recomendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-700">Hoy</span>
            </div>
          </div>
        </Card>
        
        {/* PRÓXIMAS TAREAS */}
        <Card className="p-5 rounded-xl">
          <h3 className="font-bold text-slate-800 mb-4">Próximas Tareas Programadas</h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-700 text-sm mb-1">Medir pH y EC</h4>
                  <p className="text-xs text-slate-700">Próxima: Cada 2-3 días</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                  📊 Medición
                </Badge>
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Última: {history[0] ? new Date(history[0].date).toLocaleDateString() : 'Sin registros'}
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-cyan-700 text-sm mb-1">Limpieza Depósito</h4>
                  <p className="text-xs text-slate-700">Próxima: {nextCleaning > 0 ? `En ${nextCleaning} días` : "HOY"}</p>
                </div>
                <Badge className="bg-cyan-100 text-cyan-800 text-xs">
                  🧹 Limpieza
                </Badge>
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Última: {new Date(lastCleaning).toLocaleDateString()}
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-700 text-sm mb-1">Rotar Plantas</h4>
                  <p className="text-xs text-slate-700">Próxima: Cada 7-10 días</p>
                </div>
                <Badge className="bg-amber-100 text-amber-800 text-xs">
                  🔄 Rotación
                </Badge>
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Última: {new Date(lastRotation).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // 6. 🌿 TORRE - CON BOTÓN DE ROTAR
  const TowerTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🌿 Torre de Cultivo</h2>
        <p className="text-slate-600 text-sm">Niveles 1-2-3 • Sistema 5-5-5</p>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleRotatePlants}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          size="sm"
        >
          <RotateIcon className="mr-2" size={16} />
          Rotar Plantas entre Niveles
        </Button>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <TreePine className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Disposición de la Torre</h3>
              <p className="text-sm text-slate-600">Total: {plants.length} plantas</p>
            </div>
          </div>
          <Badge className="bg-slate-100 text-slate-800">
            Última rotación: {new Date(lastRotation).toLocaleDateString()}
          </Badge>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(level => {
            const levelPlants = plants.filter(p => p.level === level);
            const stageCounts = {
              seedling: levelPlants.filter(p => p.stage === "seedling").length,
              growth: levelPlants.filter(p => p.stage === "growth").length,
              mature: levelPlants.filter(p => p.stage === "mature").length
            };
            
            return (
              <div key={level} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      level === 1 ? 'bg-cyan-500' : 
                      level === 2 ? 'bg-green-500' : 
                      'bg-emerald-500'
                    }`} />
                    <span className="font-bold text-slate-800">Nivel {level}</span>
                    <Badge className={
                      level === 1 ? 'bg-cyan-100 text-cyan-800' :
                      level === 2 ? 'bg-green-100 text-green-800' :
                      'bg-emerald-100 text-emerald-800'
                    }>
                      {levelPlants.length} plantas
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {stageCounts.seedling > 0 && (
                      <Badge className="bg-cyan-100 text-cyan-800 text-xs">🌱 {stageCounts.seedling}</Badge>
                    )}
                    {stageCounts.growth > 0 && (
                      <Badge className="bg-green-100 text-green-800 text-xs">📈 {stageCounts.growth}</Badge>
                    )}
                    {stageCounts.mature > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">🌿 {stageCounts.mature}</Badge>
                    )}
                  </div>
                </div>
                
                {levelPlants.length === 0 ? (
                  <p className="text-slate-500 text-center py-2 text-sm">Vacío - Añade plantas</p>
                ) : (
                  <div className="grid grid-cols-5 gap-1">
                    {levelPlants.map(plant => (
                      <div 
                        key={plant.id} 
                        className="p-1 bg-white rounded border border-slate-200 text-center cursor-pointer hover:bg-slate-50"
                        onClick={() => setSelectedPlant(plant)}
                      >
                        <div className="text-xs font-bold text-slate-800 truncate">{plant.name}</div>
                        <div className="text-xs text-slate-600 truncate">
                          {plant.stage === 'seedling' ? '🌱' : 
                           plant.stage === 'growth' ? '📈' : '🌿'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* LEYENDA */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span className="text-xs text-slate-700">Nivel 1 (Abajo)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-slate-700">Nivel 2 (Medio)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-slate-700">Nivel 3 (Arriba)</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* INSTRUCCIONES ROTACIÓN */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <RotateIcon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Instrucciones de Rotación</h3>
            <p className="text-sm text-slate-600">Para optimizar crecimiento</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-lg">⬇️</div>
              <div>
                <h4 className="font-bold text-amber-700 text-sm">Nivel 1 → Nivel 2</h4>
                <p className="text-xs text-slate-700">Plántulas pasan a crecimiento medio</p>
              </div>
            </div>
          </div>
          
          <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-lg">⬆️</div>
              <div>
                <h4 className="font-bold text-green-700 text-sm">Nivel 2 → Nivel 3</h4>
                <p className="text-xs text-slate-700">Plantas en crecimiento pasan a maduración</p>
              </div>
            </div>
          </div>
          
          <div className="p-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-lg">🔄</div>
              <div>
                <h4 className="font-bold text-cyan-700 text-sm">Nivel 3 → Nivel 1</h4>
                <p className="text-xs text-slate-700">Plantas maduras se cosechan y se inician nuevas</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // 7. 📈 HISTORIAL COMPLETO
  const HistoryTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📈 Historial de Mediciones</h2>
        <p className="text-slate-600 text-sm">{history.length} registros almacenados</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <BarChart className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Registros del Sistema</h3>
              <p className="text-sm text-slate-600">Historial completo de mediciones</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleResetSystem}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <RefreshCw className="mr-1" size={14} />
              Reiniciar
            </Button>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-500 text-sm">No hay mediciones registradas</p>
            <p className="text-slate-400 text-xs mt-1">Realiza mediciones para ver el historial</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((record, index) => (
              <div key={record.id} className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-slate-800">
                      {new Date(record.date).toLocaleDateString('es-ES', { 
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {index === 0 && (
                      <Badge className="bg-green-100 text-green-800 text-xs">ÚLTIMA</Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHistory(record.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="text-center">
                    <div className="text-xs text-slate-600">pH</div>
                    <div className={`text-sm font-bold ${
                      parseFloat(record.ph) >= 5.5 && parseFloat(record.ph) <= 6.5 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {record.ph}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-slate-600">EC</div>
                    <div className={`text-sm font-bold ${
                      parseFloat(record.ec) >= 800 && parseFloat(record.ec) <= 1800 
                        ? 'text-green-600' 
                        : parseFloat(record.ec) > 1800 
                        ? 'text-red-600' 
                        : 'text-amber-600'
                    }`}>
                      {record.ec}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-slate-600">Temp</div>
                    <div className={`text-sm font-bold ${
                      parseFloat(record.temp) >= 18 && parseFloat(record.temp) <= 25 
                        ? 'text-green-600' 
                        : parseFloat(record.temp) > 25 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`}>
                      {record.temp}°C
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-slate-600">Vol</div>
                    <div className="text-sm font-bold text-blue-600">
                      {record.volume}L
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-slate-600">
                  {record.notes || 'Medición del sistema'}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">
                Mostrando {Math.min(history.length, 10)} de {history.length} registros
              </span>
              <Button
                onClick={() => {
                  if (confirm("¿Eliminar todo el historial?")) {
                    setHistory([]);
                  }
                }}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="mr-1" size={12} />
                Limpiar Historial
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* ESTADÍSTICAS */}
      {history.length > 0 && (
        <Card className="p-5 rounded-xl">
          <h3 className="font-bold text-slate-800 mb-4">Estadísticas del Historial</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
              <div className="text-xl font-bold text-purple-600">
                {history.length}
              </div>
              <p className="text-xs text-slate-700">Total registros</p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
              <div className="text-xl font-bold text-green-600">
                {new Date(history[0].date).toLocaleDateString()}
              </div>
              <p className="text-xs text-slate-700">Última medición</p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
              <div className="text-xl font-bold text-blue-600">
                {Math.floor((new Date() - new Date(history[history.length-1].date)) / (1000 * 60 * 60 * 24))} días
              </div>
              <p className="text-xs text-slate-700">Días registrados</p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
              <div className="text-xl font-bold text-amber-600">
                {(history.length / Math.max(1, Math.floor((new Date() - new Date(history[history.length-1].date)) / (1000 * 60 * 60 * 24)))).toFixed(1)}
              </div>
              <p className="text-xs text-slate-700">Mediciones/día</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  // 8. 🎓 CONSEJOS MAESTROS
  const TipsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🎓 Consejos Maestros</h2>
        <p className="text-slate-600 text-sm">Para cultivo hidropónico en Castellón</p>
      </div>
      
      {/* AGUA Y NUTRICIÓN */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <Droplets className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Agua y Nutrición</h3>
            <p className="text-sm text-slate-600">Fundamentos del cultivo hidropónico</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
            <h4 className="font-bold text-emerald-700 text-sm mb-1">pH Óptimo</h4>
            <p className="text-xs text-slate-700">Mantener entre 5.5-6.5. Fuera de este rango, las plantas no absorben nutrientes eficientemente.</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h4 className="font-bold text-blue-700 text-sm mb-1">EC por Etapa</h4>
            <ul className="text-xs text-slate-700 space-y-1 ml-4 list-disc">
              <li><strong>Plántulas:</strong> 800-1000 µS/cm</li>
              <li><strong>Crecimiento:</strong> 1200-1400 µS/cm</li>
              <li><strong>Maduración:</strong> 1400-1800 µS/cm</li>
            </ul>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <h4 className="font-bold text-purple-700 text-sm mb-1">Cambio de Solución</h4>
            <p className="text-xs text-slate-700">Renovar completamente cada 2-3 semanas. Nunca rellenar más de 2 veces sin cambiar.</p>
          </div>
        </div>
      </Card>
      
      {/* TORRE VERTICAL */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <TreePine className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Torre Vertical</h3>
            <p className="text-sm text-slate-600">Optimización del sistema</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
            <h4 className="font-bold text-cyan-700 text-sm mb-1">Rotación de Niveles</h4>
            <p className="text-xs text-slate-700">Rotar plantas cada 7-10 días. Las de abajo reciben menos luz, las de arriba más.</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h4 className="font-bold text-blue-700 text-sm mb-1">Riego en Torre</h4>
            <ul className="text-xs text-slate-700 space-y-1 ml-4 list-disc">
              <li>Ciclos largos (2-3 horas) pero menos frecuentes</li>
              <li>Tiempo bomba suficiente para llegar a todas las plantas</li>
              <li>Solo regar durante horas de luz</li>
              <li>Ajustar por temperatura ambiente</li>
            </ul>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
            <h4 className="font-bold text-purple-700 text-sm mb-1">Densidad de Plantación</h4>
            <p className="text-xs text-slate-700">Máximo 5 plantas por nivel. Evitar hacinamiento para buena circulación de aire.</p>
          </div>
        </div>
      </Card>
      
      {/* CASTELLÓN */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <ThermometerSunIcon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Clima de Castellón</h3>
            <p className="text-sm text-slate-600">Ajustes específicos para la zona</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
            <h4 className="font-bold text-amber-700 text-sm mb-1">Verano (Jun-Sep)</h4>
            <p className="text-xs text-slate-700">Temp: 22-32°C • Humedad: 60-70% • Viento: Poniente</p>
            <p className="text-xs text-slate-600 mt-1">📌 Aumentar riego 20% • Controlar temperatura agua • Reducir EC si &gt;30°C</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h4 className="font-bold text-blue-700 text-sm mb-1">Invierno (Dic-Feb)</h4>
            <p className="text-xs text-slate-700">Temp: 8-16°C • Humedad: 70-80% • Viento: Tramontana</p>
            <p className="text-xs text-slate-600 mt-1">📌 Reducir riego 30% • Usar calentador • Aumentar EC 10%</p>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <h4 className="font-bold text-green-700 text-sm mb-1">Temporadas Ideales</h4>
            <p className="text-xs text-slate-700">Primavera (Mar-May) y Otoño (Oct-Nov) son las mejores para iniciar cultivos.</p>
            <p className="text-xs text-slate-600 mt-1">📌 Crecimiento más rápido • Menos problemas • Mayor producción</p>
          </div>
        </div>
      </Card>
    </div>
  );

  // =================== FLUJO DE CONFIGURACIÓN ===================

  const renderStepContent = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">HydroCaru</h1>
            <p className="text-slate-600 mb-6">Sistema hidropónico optimizado para Castellón</p>
            <Button onClick={() => setStep(1)} className="bg-gradient-to-r from-emerald-500 to-green-600 w-full h-12">
              Iniciar Configuración <ArrowRight className="ml-2" />
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Tipo de Agua</h2>
            <p className="text-slate-600 text-sm">Selecciona el tipo de agua que usas</p>
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
            <h2 className="text-xl font-bold text-slate-800">Configuración del Depósito</h2>
            <p className="text-slate-600 text-sm">Define los volúmenes de tu sistema</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Volumen Total del Depósito (L)
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
                  Volumen Actual de Agua (L)
                </label>
                <Input
                  type="number"
                  value={config.currentVol}
                  onChange={(e) => setConfig({...config, currentVol: e.target.value})}
                  className="w-full h-11"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temperatura Actual del Agua (°C)
                </label>
                <Input
                  type="number"
                  value={config.temp}
                  onChange={(e) => setConfig({...config, temp: e.target.value})}
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
            <p className="text-slate-600 text-sm">Establece los objetivos del sistema</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  pH Objetivo (5.5-6.5 recomendado)
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
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-700">Riego Automático</span>
                <Switch
                  checked={irrigationConfig.enabled}
                  onCheckedChange={(checked) => setIrrigationConfig({...irrigationConfig, enabled: checked})}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11">
                <ArrowLeft className="mr-2" size={16} /> Atrás
              </Button>
              <Button onClick={() => setStep(4)} className="bg-gradient-to-r from-emerald-500 to-green-600 flex-1 h-11">
                Completar Configuración <Check className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // =================== RENDER PRINCIPAL ===================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={18} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm">HydroCaru</h1>
                <p className="text-xs text-slate-600">Castellón • Torre Vertical</p>
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

      {/* Navegación principal */}
      {step >= 4 && (
        <div className="sticky top-14 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="container mx-auto px-2 max-w-6xl">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="flex w-full overflow-x-auto py-1 px-1">
                <TabsTrigger value="dashboard" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <Home size={14} />
                  <span className="ml-1 hidden xs:inline">Panel</span>
                </TabsTrigger>
                <TabsTrigger value="measurements" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <Ruler size={14} />
                  <span className="ml-1 hidden xs:inline">Mediciones</span>
                </TabsTrigger>
                <TabsTrigger value="calculations" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <Calculator size={14} />
                  <span className="ml-1 hidden xs:inline">Cálculos</span>
                </TabsTrigger>
                <TabsTrigger value="irrigation" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <Droplets size={14} />
                  <span className="ml-1 hidden xs:inline">Riego</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <CalendarDays size={14} />
                  <span className="ml-1 hidden xs:inline">Calendario</span>
                </TabsTrigger>
                <TabsTrigger value="tower" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <TreePine size={14} />
                  <span className="ml-1 hidden xs:inline">Torre</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <BarChart size={14} />
                  <span className="ml-1 hidden xs:inline">Historial</span>
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                  <BookOpen size={14} />
                  <span className="ml-1 hidden xs:inline">Consejos</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Contenido de las pestañas */}
              <div className="mt-4 px-2">
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

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-600 text-center">
              HydroCaru • Torre Vertical • Castellón
            </div>
            
            {step >= 4 && (
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    irrigationConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                  }`} />
                  <span className="text-xs text-slate-600">
                    Riego: {irrigationConfig.enabled 
                      ? `${irrigationConfig.pumpTime}s/${Math.round(irrigationConfig.interval)}min` 
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
