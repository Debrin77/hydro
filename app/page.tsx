// ============================================================================
// REESTRUCTURACIÓN COMPLETA DEL CÓDIGO CON LAS NUEVAS PESTAÑAS
// ============================================================================

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
  Droplet, Leaf, TimerReset, ThermometerCold,
  ChevronDown, ChevronUp, Eye, EyeOff, CloudRain as Rain,
  Thermometer as Temp, Wind as Breeze, Target,
  Brain, AlertOctagon, Waves, GitCompare, BarChart,
  Ruler, Droplets as Water, Edit3, Save
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

// CONFIGURACIONES BASE (SE MANTIENEN IGUAL)
const WATER_TYPES = {
  bajo_mineral: { name: "Baja Mineralización", ec: 150, ph: 7.5, calcio: 20, magnesio: 5 },
  osmosis: { name: "Ósmosis", ec: 0, ph: 7.0, calcio: 0, magnesio: 0 },
  mixta: { name: "Mixta (50/50)", ec: 75, ph: 7.25, calcio: 10, magnesio: 2.5 },
  grifo: { name: "Grifo Castellón", ec: 850, ph: 7.8, calcio: 80, magnesio: 20 }
};

const VARIETIES = {
  lechuga: { name: "Lechuga", stages: { seedling: { ec: 800, days: 14 }, growth: { ec: 1200, days: 21 }, mature: { ec: 1400, days: 14 } } },
  kale: { name: "Kale", stages: { seedling: { ec: 900, days: 14 }, growth: { ec: 1400, days: 28 }, mature: { ec: 1800, days: 28 } } },
  espinaca: { name: "Espinaca", stages: { seedling: { ec: 700, days: 10 }, growth: { ec: 1100, days: 18 }, mature: { ec: 1300, days: 14 } } },
  acelga: { name: "Acelga", stages: { seedling: { ec: 850, days: 12 }, growth: { ec: 1300, days: 25 }, mature: { ec: 1600, days: 21 } } },
  aromaticas: { name: "Aromáticas", stages: { seedling: { ec: 600, days: 14 }, growth: { ec: 1000, days: 35 }, mature: { ec: 1200, days: 35 } } }
};

const ROCKWOOL_CHARACTERISTICS = {
  size: "2.5x2.5cm",
  waterRetention: 80,
  dryingTimeSummer: { day: 20, night: 40 },
  dryingTimeWinter: { day: 60, night: 120 },
  dryingTimeSpring: { day: 40, night: 80 }
};

// ============================================================================
// COMPONENTE PRINCIPAL REESTRUCTURADO
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
  const [expandedTips, setExpandedTips] = useState({});
  
  // Configuración del sistema - AHORA CON MÁS CONTROL
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
    lightHours: "12"
  });
  
  // Configuración de riego - MÁS DETALLADA
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    // Parámetros manuales
    pumpTime: 10,
    interval: 30,
    // Parámetros calculados automáticamente
    calculatedPumpTime: 10,
    calculatedInterval: 30,
    // Configuración avanzada
    showAdvanced: false,
    customSchedule: false,
    // Notas
    notes: ""
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
  
  // =================== CÁLCULOS ===================
  
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
  
  const cannaDosage = useMemo(() => {
    const volume = parseFloat(config.currentVol);
    const basePer10L = { a: 15, b: 15 };
    const totalA = (volume / 10) * basePer10L.a;
    const totalB = (volume / 10) * basePer10L.b;
    
    return {
      a: Math.round(totalA),
      b: Math.round(totalB),
      per10L: basePer10L
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
  
  const irrigationData = useMemo(() => {
    const plantCount = plants.length || 1;
    const volume = parseFloat(config.currentVol);
    const temp = parseFloat(config.temp);
    
    // Determinar estación según mes actual
    const month = new Date().getMonth();
    let season = "spring"; // primavera/otoño por defecto
    if (month >= 5 && month <= 8) season = "summer"; // jun-sep
    else if (month >= 11 || month <= 2) season = "winter"; // dic-feb
    
    // Tiempos de secado según estación
    const dryingTimes = ROCKWOOL_CHARACTERISTICS.dryingTimeSpring;
    if (season === "summer") {
      dryingTimes.day = ROCKWOOL_CHARACTERISTICS.dryingTimeSummer.day;
      dryingTimes.night = ROCKWOOL_CHARACTERISTICS.dryingTimeSummer.night;
    } else if (season === "winter") {
      dryingTimes.day = ROCKWOOL_CHARACTERISTICS.dryingTimeWinter.day;
      dryingTimes.night = ROCKWOOL_CHARACTERISTICS.dryingTimeWinter.night;
    }
    
    // Calcular riego basado en estadísticas de plantas
    const stats = {
      seedlingCount: plants.filter(p => p.stage === 'seedling').length,
      growthCount: plants.filter(p => p.stage === 'growth').length,
      matureCount: plants.filter(p => p.stage === 'mature').length
    };
    
    // Tiempo de bomba basado en número de plantas y etapa
    let pumpTime = 10; // base
    if (plantCount > 10) pumpTime = 15;
    if (plantCount > 20) pumpTime = 20;
    
    // Intervalo basado en temperatura y humedad
    let interval = 30; // minutos base
    if (temp > 25) interval = 20;
    if (temp < 18) interval = 45;
    
    // Ciclos por día
    const dayCycles = Math.round((14 * 60) / interval); // 14 horas de luz
    const nightCycles = Math.round((10 * 60) / (interval * 1.5)); // 10 horas oscuridad, intervalos más largos
    
    // Agua por ciclo y por día
    const waterPerCycle = plantCount * 50; // 50ml por planta por ciclo
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
      rockwoolMoisture: Math.round(ROCKWOOL_CHARACTERISTICS.waterRetention * 0.8),
      stats,
      recommendations: [
        {
          icon: "💧",
          text: `Riego cada <strong>${interval} minutos</strong> durante el día`
        },
        {
          icon: "🌙",
          text: `Riego cada <strong>${Math.round(interval * 1.5)} minutos</strong> durante la noche`
        },
        {
          icon: "⏱️",
          text: `Tiempo de bomba: <strong>${pumpTime} segundos</strong> por ciclo`
        }
      ],
      rockwoolSchedule: {
        seedling: { day: dryingTimes.day, night: dryingTimes.night },
        growth: { day: Math.round(dryingTimes.day * 0.8), night: Math.round(dryingTimes.night * 0.8) },
        mature: { day: Math.round(dryingTimes.day * 0.6), night: Math.round(dryingTimes.night * 0.6) }
      }
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
        icon: <ThermometerCold />,
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
  
  // =================== COMPONENTES DE PESTAÑAS REORGANIZADAS ===================

  // 1. 📊 PANEL PRINCIPAL
  const DashboardTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-600">Resumen general del sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={
            irrigationData.season === "summer" ? "bg-amber-100 text-amber-800" :
            irrigationData.season === "winter" ? "bg-blue-100 text-blue-800" :
            "bg-green-100 text-green-800"
          }>
            {irrigationData.season === "summer" ? "Verano Castellón" :
             irrigationData.season === "winter" ? "Invierno Castellón" :
             "Primavera/Otoño Castellón"}
          </Badge>
        </div>
      </div>
      
      {/* ALERTAS */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">⚠️ Alertas del Sistema</h2>
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`${alert.color} text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg`}
            >
              <div className="flex-shrink-0">
                {alert.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{alert.title}</h3>
                  <span className="text-2xl font-bold">{alert.value}</span>
                </div>
                <p className="text-white/90 mt-1">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sprout className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Estado del Cultivo</h3>
              <p className="text-sm text-slate-600">Sistema 5-5-5</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Plántulas (N1)</span>
              <span className="font-bold text-cyan-600">{irrigationData.stats.seedlingCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Crecimiento (N2)</span>
              <span className="font-bold text-green-600">{irrigationData.stats.growthCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Maduras (N3)</span>
              <span className="font-bold text-emerald-600">{irrigationData.stats.matureCount}/5</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex justify-between">
              <span className="font-bold text-slate-800">Total plantas</span>
              <span className="font-bold text-blue-600">{plants.length}/15</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Nutrición</h3>
              <p className="text-sm text-slate-600">CANNA Aqua Vega</p>
            </div>
          </div>
          
          {plants.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">EC objetivo</span>
                <span className="font-bold text-blue-600">{config.targetEC} µS/cm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">pH objetivo</span>
                <span className="font-bold text-purple-600">{config.targetPH}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-700">CANNA A</span>
                <span className="font-bold text-emerald-600">{cannaDosage.a} ml</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">CANNA B</span>
                <span className="font-bold text-emerald-600">{cannaDosage.b} ml</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">Añade plantas para ver dosificación</p>
          )}
        </Card>
        
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CloudRain className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Condiciones Actuales</h3>
              <p className="text-sm text-slate-600">Mediciones</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">pH actual</span>
              <span className={`font-bold ${
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-red-600' :
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.2 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ph}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">EC actual</span>
              <span className={`font-bold ${
                parseFloat(config.ec) > parseFloat(config.targetEC) + 300 ? 'text-red-600' :
                parseFloat(config.ec) < parseFloat(config.targetEC) - 300 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ec} µS/cm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Volumen agua</span>
              <span className="font-bold text-blue-600">{config.currentVol}L / {config.totalVol}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Temperatura</span>
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
      
      {/* BOTONES DE ACCIÓN RÁPIDA */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setTab("measurements")}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
        >
          <Edit3 className="mr-2" />
          Introducir Mediciones
        </Button>
        
        <Button
          onClick={() => setTab("calculations")}
          variant="outline"
        >
          <Calculator className="mr-2" />
          Ver Cálculos
        </Button>
        
        <Button
          onClick={() => setTab("irrigation")}
          variant="outline"
        >
          <Droplets className="mr-2" />
          Configurar Riego
        </Button>
        
        <Button
          onClick={handleRotation}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
        >
          <RotateCcw className="mr-2" />
          Rotar Niveles
        </Button>
      </div>
    </div>
  );

  // 2. 📝 NUEVA PESTAÑA: MEDICIONES MANUALES
  const MeasurementsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">📝 Mediciones Manuales</h2>
        <p className="text-slate-600">Introduce los valores medidos de tu sistema</p>
      </div>
      
      {/* TARJETA PRINCIPAL DE MEDICIONES */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Ruler className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Valores Medidos Actualmente</h3>
            <p className="text-sm text-slate-600">Actualiza estos valores según tus mediciones</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLUMNA IZQUIERDA - PARÁMETROS PRINCIPALES */}
          <div className="space-y-6">
            {/* pH */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="text-purple-600" size={20} />
                  <span className="font-bold text-slate-800">pH del Agua</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPH(!editingPH)}
                >
                  {editingPH ? <Save size={16} /> : <Edit3 size={16} />}
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
                    className="text-center text-2xl font-bold"
                  />
                  <Slider
                    value={[parseFloat(config.ph)]}
                    min={4.0}
                    max={9.0}
                    step={0.1}
                    onValueChange={([value]) => handleManualPHChange(value.toString())}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>4.0</span>
                    <span className="font-bold text-green-600">5.5-6.5</span>
                    <span>9.0</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{config.ph}</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                    parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5 ? '✅ ÓPTIMO' : '⚠️ FUERA DE RANGO'}
                  </div>
                </div>
              )}
            </div>
            
            {/* EC */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="text-blue-600" size={20} />
                  <span className="font-bold text-slate-800">EC (Conductividad)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingEC(!editingEC)}
                >
                  {editingEC ? <Save size={16} /> : <Edit3 size={16} />}
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
                    className="text-center text-2xl font-bold"
                  />
                  <Slider
                    value={[parseFloat(config.ec)]}
                    min={0}
                    max={3000}
                    step={50}
                    onValueChange={([value]) => handleManualECChange(value.toString())}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>0</span>
                    <span className="font-bold text-green-600">800-1800</span>
                    <span>3000</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{config.ec} µS/cm</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                    parseFloat(config.ec) >= 800 && parseFloat(config.ec) <= 1800 
                      ? 'bg-green-100 text-green-800' 
                      : parseFloat(config.ec) > 1800 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {parseFloat(config.ec) > 1800 ? '⚠️ DEMASIADO ALTA' : 
                     parseFloat(config.ec) < 800 ? '⚠️ DEMASIADO BAJA' : '✅ ADECUADA'}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* COLUMNA DERECHA - PARÁMETROS SECUNDARIOS */}
          <div className="space-y-6">
            {/* VOLUMEN DE AGUA */}
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Water className="text-cyan-600" size={20} />
                  <span className="font-bold text-slate-800">Volumen de Agua</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingVolume(!editingVolume)}
                >
                  {editingVolume ? <Save size={16} /> : <Edit3 size={16} />}
                </Button>
              </div>
              
              {editingVolume ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    min="0"
                    max={config.totalVol}
                    step="1"
                    value={config.currentVol}
                    onChange={(e) => handleManualVolumeChange(e.target.value)}
                    className="text-center text-2xl font-bold"
                  />
                  <Slider
                    value={[parseFloat(config.currentVol)]}
                    min={0}
                    max={parseFloat(config.totalVol)}
                    step={1}
                    onValueChange={([value]) => handleManualVolumeChange(value.toString())}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>0L</span>
                    <span className="font-bold text-cyan-600">{config.currentVol}L</span>
                    <span>{config.totalVol}L</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-600 mb-2">{config.currentVol}L</div>
                  <div className="mt-4">
                    <Progress 
                      value={(config.currentVol / config.totalVol) * 100} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>0L</span>
                      <span className="font-medium">
                        {((config.currentVol / config.totalVol) * 100).toFixed(0)}% lleno
                      </span>
                      <span>{config.totalVol}L</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* TEMPERATURA */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="text-amber-600" size={20} />
                <span className="font-bold text-slate-800">Temperatura del Agua</span>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">{config.temp}°C</div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                  parseFloat(config.temp) >= 18 && parseFloat(config.temp) <= 25 
                    ? 'bg-green-100 text-green-800' 
                    : parseFloat(config.temp) > 28 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {parseFloat(config.temp) > 28 ? '⚠️ DEMASIADO CALIENTE' : 
                   parseFloat(config.temp) < 18 ? '⚠️ DEMASIADO FRÍO' : '✅ ÓPTIMA'}
                </div>
              </div>
              
              <div className="mt-4">
                <Slider
                  value={[parseFloat(config.temp)]}
                  min={10}
                  max={35}
                  step={0.5}
                  onValueChange={([value]) => setConfig({...config, temp: value.toString()})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>10°C</span>
                  <span className="font-bold text-green-600">18-25°C</span>
                  <span>35°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* BOTÓN PARA GUARDAR MEDICIÓN COMPLETA */}
        <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-emerald-800">📋 Guardar Mediciones</h4>
              <p className="text-sm text-emerald-600">Registra estos valores en el historial</p>
            </div>
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
                  notes: "Medición manual completa"
                }, ...history]);
                alert("✅ Mediciones guardadas en el historial");
              }}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              <Save className="mr-2" />
              Guardar Mediciones
            </Button>
          </div>
        </div>
      </Card>
      
      {/* CONFIGURACIÓN DE OBJETIVOS */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <Target className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Objetivos del Sistema</h3>
            <p className="text-sm text-slate-600">Define los valores que quieres alcanzar</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                EC Objetivo (µS/cm)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="800"
                  max="1900"
                  step="100"
                  value={config.targetEC}
                  onChange={(e) => setConfig({...config, targetEC: e.target.value})}
                  className="w-full h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-blue-600 w-16 text-center">{config.targetEC}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>800</span>
                <span className="font-bold text-green-600">1300-1600</span>
                <span>1900</span>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Recomendado por variedad:</strong><br/>
                {plants.length > 0 ? 
                  `EC objetivo para ${plants[0]?.v || 'tus plantas'}: ${calculateSystemEC(plants, parseFloat(config.currentVol), config.waterType).targetEC} µS/cm` 
                  : 'Añade plantas para ver recomendaciones específicas'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                pH Objetivo
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5.5"
                  max="6.5"
                  step="0.1"
                  value={config.targetPH}
                  onChange={(e) => setConfig({...config, targetPH: e.target.value})}
                  className="w-full h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-purple-600 w-16 text-center">{config.targetPH}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>5.5</span>
                <span className="font-bold text-green-600">6.0</span>
                <span>6.5</span>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Para lechugas en hidroponía:</strong><br/>
                pH ideal es 6.0 para máxima absorción de nutrientes
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // 3. 🧪 PESTAÑA: CÁLCULOS Y CORRECCIONES
  const CalculationsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">🧪 Cálculos y Correcciones</h2>
        <p className="text-slate-600">Ajustes necesarios según tus mediciones</p>
      </div>
      
      {/* RESUMEN DE CORRECCIONES NECESARIAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AJUSTE DE pH */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <RefreshCw className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Ajuste de pH</h3>
              <p className="text-sm text-slate-600">De {config.ph} a {config.targetPH}</p>
            </div>
          </div>
          
          {parseFloat(config.ph) > parseFloat(config.targetPH) ? (
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {phAdjustmentWithPretreatment.phMinus} ml
              </div>
              <p className="text-lg font-bold text-purple-700">pH- (Ácido)</p>
              <p className="text-sm text-slate-600">Para bajar el pH</p>
              <div className="mt-3 text-xs text-slate-500">
                En {config.currentVol}L de agua
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {phAdjustmentWithPretreatment.phPlus} ml
              </div>
              <p className="text-lg font-bold text-pink-700">pH+ (Alcalino)</p>
              <p className="text-sm text-slate-600">Para subir el pH</p>
              <div className="mt-3 text-xs text-slate-500">
                En {config.currentVol}L de agua
              </div>
            </div>
          )}
        </Card>
        
        {/* DOSIS CANNA */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Dosis CANNA</h3>
              <p className="text-sm text-slate-600">Para {config.currentVol}L</p>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
            <div className="flex justify-center gap-6 mb-3">
              <div>
                <div className="text-3xl font-bold text-emerald-600">{cannaDosage.a}</div>
                <p className="text-sm text-emerald-700">ml CANNA A</p>
              </div>
              <div className="text-2xl text-emerald-500">+</div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">{cannaDosage.b}</div>
                <p className="text-sm text-emerald-700">ml CANNA B</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {cannaDosage.per10L.a}ml A y {cannaDosage.per10L.b}ml B por cada 10L
            </p>
          </div>
        </Card>
        
        {/* CALMAG */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Waves className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Suplemento CalMag</h3>
              <p className="text-sm text-slate-600">Para agua de ósmosis</p>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-cyan-600 mb-2">
              {calmagNeeded.required ? `${calmagNeeded.dosage} ml` : '0 ml'}
            </div>
            <p className="text-lg font-bold text-cyan-700">CalMag</p>
            <p className="text-sm text-slate-600">
              {calmagNeeded.required ? '✅ Necesario' : '❌ No necesario'}
            </p>
            {calmagNeeded.required && (
              <p className="text-xs text-slate-500 mt-2">{calmagNeeded.reason}</p>
            )}
          </div>
        </Card>
      </div>
      
      {/* INSTRUCCIONES DETALLADAS */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Clipboard className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Instrucciones Paso a Paso</h3>
            <p className="text-sm text-slate-600">Cómo aplicar las correcciones</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-700 mb-2">1. Preparar el agua base</h4>
            <p className="text-sm text-slate-700">
              Llenar el depósito con <strong>{config.currentVol}L</strong> de agua ({waterCharacteristics.name}).
              {calmagNeeded.required && ` Añadir ${calmagNeeded.dosage}ml de CalMag y mezclar 2-3 minutos.`}
            </p>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-xl">
            <h4 className="font-bold text-emerald-700 mb-2">2. Añadir CANNA Aqua Vega</h4>
            <p className="text-sm text-slate-700">
              Agregar <strong>{cannaDosage.a}ml de CANNA A</strong>, mezclar 1 minuto.<br/>
              Agregar <strong>{cannaDosage.b}ml de CANNA B</strong>, mezclar 2 minutos.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-bold text-purple-700 mb-2">3. Ajustar pH</h4>
            <p className="text-sm text-slate-700">
              {parseFloat(config.ph) > parseFloat(config.targetPH) 
                ? `Añadir ${phAdjustmentWithPretreatment.phMinus}ml de pH- para bajar de ${config.ph} a ${config.targetPH}.`
                : `Añadir ${phAdjustmentWithPretreatment.phPlus}ml de pH+ para subir de ${config.ph} a ${config.targetPH}.`
              }
            </p>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-700 mb-2">4. Verificar y ajustar EC</h4>
            <p className="text-sm text-slate-700">
              EC objetivo: <strong>{config.targetEC} µS/cm</strong><br/>
              Si la EC es demasiado alta, añadir agua. Si es demasiado baja, añadir más nutrientes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  // 4. 💧 NUEVA PESTAÑA: RIEGO RECOMENDADO
  const IrrigationTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">💧 Sistema de Riego</h2>
        <p className="text-slate-600">Configuración basada en {plants.length} plantas y {config.currentVol}L de agua</p>
      </div>
      
      {/* RESUMEN DE RIEGO */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Resumen de Riego Automático</h3>
              <p className="text-sm text-slate-600">Dados de lana 2.5x2.5cm - Castellón</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${irrigationConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="font-medium">{irrigationConfig.enabled ? 'ACTIVO' : 'INACTIVO'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">{irrigationData.pumpTime}s</div>
            <p className="text-sm text-blue-700">Tiempo bomba</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{Math.round(irrigationData.interval)}min</div>
            <p className="text-sm text-green-700">Intervalo</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-white rounded-xl border-2 border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">{irrigationData.cyclesPerDay}</div>
            <p className="text-sm text-purple-700">Ciclos/día</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-b from-cyan-50 to-white rounded-xl border-2 border-cyan-200">
            <div className="text-2xl font-bold text-cyan-600 mb-1">{irrigationData.totalWaterPerDay}L</div>
            <p className="text-sm text-cyan-700">Agua/día</p>
          </div>
        </div>
        
        {/* CONFIGURACIÓN MANUAL */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-800">Configuración de Riego</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tiempo de Bomba: <span className="font-bold text-blue-600">{irrigationConfig.pumpTime} segundos</span>
                </label>
                <Slider
                  value={[irrigationConfig.pumpTime]}
                  min={5}
                  max={30}
                  step={1}
                  onValueChange={([value]) => setIrrigationConfig({
                    ...irrigationConfig, 
                    pumpTime: value, 
                    mode: "manual"
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>5s</span>
                  <span>15s</span>
                  <span>30s</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Intervalo: <span className="font-bold text-green-600">{irrigationConfig.interval} minutos</span>
                </label>
                <Slider
                  value={[irrigationConfig.interval]}
                  min={10}
                  max={180}
                  step={5}
                  onValueChange={([value]) => setIrrigationConfig({
                    ...irrigationConfig, 
                    interval: value, 
                    mode: "manual"
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>10min</span>
                  <span>60min</span>
                  <span>180min</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Modo de Operación</label>
                <div className="flex gap-2">
                  <Button
                    variant={irrigationConfig.mode === "auto" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setIrrigationConfig({...irrigationConfig, mode: "auto"})}
                  >
                    <Gauge className="mr-2" size={16} />
                    Automático
                  </Button>
                  <Button
                    variant={irrigationConfig.mode === "manual" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setIrrigationConfig({...irrigationConfig, mode: "manual"})}
                  >
                    <Settings className="mr-2" size={16} />
                    Manual
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estado del Sistema</label>
                <div className="flex gap-2">
                  <Button
                    variant={irrigationConfig.enabled ? "default" : "outline"}
                    className={`flex-1 ${irrigationConfig.enabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => setIrrigationConfig({...irrigationConfig, enabled: true})}
                  >
                    <Power className="mr-2" size={16} />
                    Encendido
                  </Button>
                  <Button
                    variant={!irrigationConfig.enabled ? "default" : "outline"}
                    className={`flex-1 ${!irrigationConfig.enabled ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    onClick={() => setIrrigationConfig({...irrigationConfig, enabled: false})}
                  >
                    <Power className="mr-2" size={16} />
                    Apagado
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* TABLA DE RECOMENDACIONES POR ESTACIÓN */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <CloudSun className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Recomendaciones por Estación - Castellón</h3>
            <p className="text-sm text-slate-600">Ajustes específicos para el clima local</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 text-left">Estación</th>
                <th className="p-3 text-left">Día</th>
                <th className="p-3 text-left">Noche</th>
                <th className="p-3 text-left">Recomendaciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-medium text-amber-600">Verano</td>
                <td className="p-3">{irrigationData.rockwoolSchedule.seedling.day} min</td>
                <td className="p-3">{irrigationData.rockwoolSchedule.seedling.night} min</td>
                <td className="p-3 text-sm text-slate-600">Evitar riego 12:00-16:00. Viento poniente aumenta frecuencia.</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-medium text-blue-600">Invierno</td>
                <td className="p-3">{irrigationData.rockwoolSchedule.growth.day} min</td>
                <td className="p-3">{irrigationData.rockwoolSchedule.growth.night} min</td>
                <td className="p-3 text-sm text-slate-600">Riego al mediodía. Reducir frecuencia por humedad alta.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-green-600">Primavera/Otoño</td>
                <td className="p-3">{irrigationData.rockwoolSchedule.mature.day} min</td>
                <td className="p-3">{irrigationData.rockwoolSchedule.mature.night} min</td>
                <td className="p-3 text-sm text-slate-600">Ajustar según temperatura diaria. Monitorear humedad.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* RECOMENDACIONES DETALLADAS */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Lightbulb className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Recomendaciones Específicas</h3>
            <p className="text-sm text-slate-600">Basado en {plants.length} plantas y {config.currentVol}L</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {irrigationData.recommendations?.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <span className="text-xl">{rec.icon}</span>
              <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{__html: rec.text}} />
            </div>
          ))}
          
          {/* RECOMENDACIÓN ESPECÍFICA POR NÚMERO DE PLANTAS */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <h4 className="font-bold text-emerald-700 mb-2">📊 Para {plants.length} plantas y {config.currentVol}L de agua:</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Volumen por riego: <strong>{irrigationData.waterPerCycle}ml</strong></li>
              <li>• Consumo diario: <strong>{irrigationData.totalWaterPerDay}L</strong></li>
              <li>• Ciclos por día: <strong>{irrigationData.cyclesPerDay}</strong> ({irrigationData.dayCycles} día + {irrigationData.nightCycles} noche)</li>
              <li>• Humedad ideal en dados: <strong>{irrigationData.rockwoolMoisture}%</strong></li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  // 5. 🌿 TORRE (SIMPLIFICADA PARA EJEMPLO)
  const TowerTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">🌿 Torre Hidropónica</h2>
        <p className="text-slate-600">Niveles 1-2-3 • Sistema 5-5-5</p>
      </div>
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <TreePine className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Disposición de Plantas</h3>
              <p className="text-sm text-slate-600">Total: {plants.length} plantas</p>
            </div>
          </div>
          <Button onClick={() => setSelPos(null)}>
            <Plus className="mr-2" /> Añadir Planta
          </Button>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(level => (
            <div key={level} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${
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
                <p className="text-slate-500 text-center py-3">Vacío</p>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {plants.filter(p => p.level === level).map(plant => (
                    <div key={plant.id} className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-800">{plant.name}</div>
                      <div className="text-xs text-slate-600">{VARIETIES[plant.v]?.name || plant.v}</div>
                      <div className="text-xs text-slate-500">{plant.stage}</div>
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

  // 6. 📅 CALENDARIO (SIMPLIFICADO PARA EJEMPLO)
  const CalendarTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">📅 Calendario de Mantenimiento</h2>
        <p className="text-slate-600">Tareas programadas y recordatorios</p>
      </div>
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Próximas Tareas</h3>
            <p className="text-sm text-slate-600">Basado en tu configuración actual</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-700 mb-2">📊 Medir pH y EC</h4>
            <p className="text-sm text-slate-700">Diariamente, preferiblemente a la misma hora</p>
            <div className="mt-2 text-xs text-slate-600">
              Última medición: {history[0] ? new Date(history[0].date).toLocaleString() : 'No hay registros'}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <h4 className="font-bold text-emerald-700 mb-2">🔄 Rotar Niveles</h4>
            <p className="text-sm text-slate-700">Cada 7-10 días para exposición uniforme a la luz</p>
            <div className="mt-2 text-xs text-slate-600">
              Última rotación: {new Date(lastRot).toLocaleDateString()}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <h4 className="font-bold text-purple-700 mb-2">🧼 Limpieza del Sistema</h4>
            <p className="text-sm text-slate-700">Cada 4-6 semanas para prevenir algas y biofilms</p>
            <div className="mt-2 text-xs text-slate-600">
              Última limpieza: {new Date(lastClean).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // 7. 📈 HISTORIAL (SIMPLIFICADO PARA EJEMPLO)
  const HistoryTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">📈 Historial de Mediciones</h2>
        <p className="text-slate-600">Registro de pH, EC y temperatura</p>
      </div>
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <BarChart className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Registros Recientes</h3>
              <p className="text-sm text-slate-600">{history.length} mediciones</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => setHistory([])}
            disabled={history.length === 0}
          >
            <Trash2 className="mr-2" size={16} /> Limpiar Historial
          </Button>
        </div>
        
        {history.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No hay mediciones registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">pH</th>
                  <th className="p-3 text-left">EC (µS/cm)</th>
                  <th className="p-3 text-left">Temp (°C)</th>
                  <th className="p-3 text-left">Notas</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((record, index) => (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="p-3">{new Date(record.date).toLocaleString()}</td>
                    <td className="p-3 font-medium text-purple-600">{record.ph}</td>
                    <td className="p-3 font-medium text-blue-600">{record.ec}</td>
                    <td className="p-3 font-medium text-amber-600">{record.temp}</td>
                    <td className="p-3 text-sm text-slate-600">{record.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );

  // =================== FLUJO DE CONFIGURACIÓN (PASOS 0-3) ===================

  const renderStepContent = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Bienvenido a HydroMaster</h1>
            <p className="text-slate-600 mb-8">Configura tu sistema hidropónico paso a paso</p>
            <Button onClick={() => setStep(1)} className="bg-gradient-to-r from-emerald-500 to-green-600">
              Comenzar Configuración <ArrowRight className="ml-2" />
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Paso 1: Tipo de Agua</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(WATER_TYPES).map(([key, water]) => (
                <Card 
                  key={key}
                  className={`p-4 cursor-pointer transition-all ${
                    config.waterType === key ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                  }`}
                  onClick={() => setConfig({...config, waterType: key})}
                >
                  <div className="font-medium text-slate-800">{water.name}</div>
                  <div className="text-sm text-slate-600 mt-1">EC: {water.ec} µS/cm</div>
                  <div className="text-sm text-slate-600">pH: {water.ph}</div>
                </Card>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="mr-2" /> Atrás
              </Button>
              <Button onClick={() => setStep(2)}>
                Continuar <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Paso 2: Configuración Inicial</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Volumen Total del Sistema (L)
                </label>
                <Input
                  type="number"
                  value={config.totalVol}
                  onChange={(e) => setConfig({...config, totalVol: e.target.value})}
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2" /> Atrás
              </Button>
              <Button onClick={() => setStep(3)}>
                Continuar <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Paso 3: Configuración de Riego</h2>
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
                  Tiempo de Bomba (segundos)
                </label>
                <Slider
                  value={[irrigationConfig.pumpTime]}
                  min={5}
                  max={30}
                  step={1}
                  onValueChange={([value]) => setIrrigationConfig({...irrigationConfig, pumpTime: value})}
                  className="w-full"
                />
                <div className="text-center mt-2">{irrigationConfig.pumpTime}s</div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2" /> Atrás
              </Button>
              <Button onClick={() => setStep(4)} className="bg-gradient-to-r from-emerald-500 to-green-600">
                Completar Configuración <Check className="ml-2" />
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // =================== RENDER PRINCIPAL CON NUEVAS PESTAÑAS ===================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">HydroMaster CANNA</h1>
                <p className="text-xs text-slate-600">Mediciones manuales • Cálculos • Riego • Torre</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {step >= 4 ? (
                <>
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>pH: {config.ph}</span>
                      <span>•</span>
                      <span>EC: {config.ec} µS/cm</span>
                      <span>•</span>
                      <span>Agua: {config.currentVol}L</span>
                    </div>
                  </div>
                  
                  <Badge className={
                    alerts.some(a => a.priority === 1) 
                      ? "bg-red-100 text-red-800" 
                      : alerts.some(a => a.priority === 2)
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }>
                    {alerts.filter(a => a.priority === 1).length > 0 
                      ? `${alerts.filter(a => a.priority === 1).length} alertas` 
                      : alerts.filter(a => a.priority === 2).length > 0
                      ? `${alerts.filter(a => a.priority === 2).length} avisos`
                      : "Todo OK"}
                  </Badge>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-600">Paso {step + 1} de 4</div>
                  <Progress value={(step + 1) * 25} className="w-24 h-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navegación con 7 pestañas */}
      {step >= 4 && (
        <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="flex overflow-x-auto py-2">
                <TabsTrigger value="dashboard" className="flex-1 min-w-[100px]">
                  <Home size={16} className="mr-2" />
                  Panel
                </TabsTrigger>
                <TabsTrigger value="measurements" className="flex-1 min-w-[100px]">
                  <Ruler size={16} className="mr-2" />
                  Mediciones
                </TabsTrigger>
                <TabsTrigger value="calculations" className="flex-1 min-w-[100px]">
                  <Calculator size={16} className="mr-2" />
                  Cálculos
                </TabsTrigger>
                <TabsTrigger value="irrigation" className="flex-1 min-w-[100px]">
                  <Droplets size={16} className="mr-2" />
                  Riego
                </TabsTrigger>
                <TabsTrigger value="tower" className="flex-1 min-w-[100px]">
                  <TreePine size={16} className="mr-2" />
                  Torre
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex-1 min-w-[100px]">
                  <Calendar size={16} className="mr-2" />
                  Calendario
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 min-w-[100px]">
                  <BarChart size={16} className="mr-2" />
                  Historial
                </TabsTrigger>
              </TabsList>
              
              {/* Contenido de las pestañas */}
              <div className="mt-6">
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
                
                <TabsContent value="tower">
                  <TowerTab />
                </TabsContent>
                
                <TabsContent value="calendar">
                  <CalendarTab />
                </TabsContent>
                
                <TabsContent value="history">
                  <HistoryTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 max-w-6xl">
        {step < 4 ? (
          // Flujo de configuración (pasos 0-3)
          <div className="max-w-2xl mx-auto">
            {renderStepContent()}
          </div>
        ) : (
          // Panel principal ya manejado por Tabs
          <div></div>
        )}
      </main>

      {/* Footer actualizado */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              HydroMaster CANNA • Mediciones manuales • Cálculos • Riego automático
            </div>
            
            <div className="flex items-center gap-4">
              {step >= 4 && (
                <>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      irrigationConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                    }`} />
                    <span className="text-sm text-slate-600">
                      Riego: {irrigationConfig.enabled 
                        ? `${irrigationData.pumpTime}s/${Math.round(irrigationData.interval)}min` 
                        : 'INACTIVO'}
                    </span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      pH: <span className={`font-bold ${
                        Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-red-600' :
                        Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.2 ? 'text-amber-600' :
                        'text-green-600'
                      }`}>{config.ph}</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
