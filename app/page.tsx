"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, Thermometer, Zap, ShieldAlert, ChevronRight, Anchor, ArrowLeft, ArrowRight, Bell, CloudRain, ThermometerSun, RefreshCw, Skull, Info, Calculator, Filter, Power, Timer, Gauge, Water, Droplet, Cloud, Sun
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

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
    name: "Baja Mineralización (Agua Blanda)",
    icon: <Droplets className="text-cyan-500" />,
    ecBase: 0.2,
    hardness: 50,
    phBase: 7.2,
    description: "Agua blanda, ideal para CANNA Aqua Vega.",
    recommendation: "Ajuste mínimo de pH necesario."
  },
  "medio_mineral": {
    name: "Media Mineralización",
    icon: <Droplets className="text-teal-500" />,
    ecBase: 0.4,
    hardness: 150,
    phBase: 7.5,
    description: "Agua de grifo típica.",
    recommendation: "Considerar dureza al mezclar."
  },
  "alta_mineral": {
    name: "Alta Mineralización (Agua Dura)",
    icon: <Droplets className="text-amber-500" />,
    ecBase: 0.8,
    hardness: 300,
    phBase: 8.0,
    description: "Agua dura, alta en calcio/magnesio.",
    recommendation: "No recomendada para Aqua Vega de agua blanda."
  }
};

const VARIETIES = {
  "Iceberg": { 
    color: "bg-cyan-500",
    ecMax: 1.6,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 0.9 },
      growth:   { a: 22, b: 22, ec: 1.3 },
      mature:   { a: 28, b: 28, ec: 1.6 }
    },
    info: "Sensible al exceso de sales. Usar EC conservador."
  },
  "Lollo Rosso": { 
    color: "bg-purple-600",
    ecMax: 1.8,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 0.9 },
      growth:   { a: 22, b: 22, ec: 1.4 },
      mature:   { a: 28, b: 28, ec: 1.7 }
    },
    info: "Color intenso con EC algo más alta."
  },
  "Maravilla": { 
    color: "bg-amber-600",
    ecMax: 1.7,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 0.9 },
      growth:   { a: 22, b: 22, ec: 1.3 },
      mature:   { a: 28, b: 28, ec: 1.6 }
    },
    info: "Clásica de alto rendimiento."
  },
  "Trocadero": { 
    color: "bg-lime-600",
    ecMax: 1.6,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 0.9 },
      growth:   { a: 22, b: 22, ec: 1.3 },
      mature:   { a: 28, b: 28, ec: 1.6 }
    },
    info: "Sabor suave. Cuidado en plántula."
  },
  "Hoja de Roble Rojo": { 
    color: "bg-red-600",
    ecMax: 1.9,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 1.0 },
      growth:   { a: 22, b: 22, ec: 1.5 },
      mature:   { a: 28, b: 28, ec: 1.8 }
    },
    info: "Crecimiento rápido, tolera EC alta."
  }
};

// ============================================================================
// CONFIGURACIÓN DE LA BOMBA Y SUSTRATO (LANA DE ROCA)
// ============================================================================

const ROCKWOOL_CHARACTERISTICS = {
  waterRetention: 0.85, // 85% de retención de agua
  drainageRate: 0.15,   // 15% de drenaje inmediato
  saturationTime: 5,    // segundos para saturar completamente
  dryingTime: {         // Tiempo de secado aproximado (horas)
    seedling: 4,        // Plántulas secan más lento (menor transpiración)
    growth: 3,          // Plantas en crecimiento
    mature: 2           // Plantas maduras (mayor transpiración)
  },
  cubeSizes: {
    seedling: 0.25,     // Litros de capacidad del cubo pequeño (plántulas)
    standard: 0.4       // Litros de capacidad del cubo estándar
  }
};

const PUMP_CONFIG = {
  power: 7, // W
  flowRate: 600, // L/h
  flowRatePerSecond: 600 / 3600, // L/s (0.1667 L/s)
  maxDailyRuntime: 16, // horas máximas de funcionamiento diario
  minCycleTime: 10, // segundos mínimo por ciclo (reducido para lana de roca)
  maxCycleTime: 45, // segundos máximo por ciclo (reducido para evitar encharcamiento)
  
  // AJUSTADO PARA LANTA DE ROCA:
  waterPerPlant: {
    seedling: 0.08,    // L por planta por ciclo (80ml) - suficiente para humedecer cubo pequeño
    growth: 0.15,      // L por planta por ciclo (150ml) - humedece cubo estándar
    mature: 0.20       // L por planta por ciclo (200ml) - saturación completa con drenaje
  },
  
  // Frecuencias basadas en tiempo de secado de lana de roca
  baseIntervals: {
    seedling: 120, // minutos (2 horas) - lana de roca retiene humedad mucho tiempo
    growth: 90,    // minutos (1.5 horas)
    mature: 60     // minutos (1 hora)
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO PARA CANNA AQUA VEGA
// ============================================================================

const calculateSystemEC = (plants, totalVolume, waterType = "bajo_mineral") => {
  if (plants.length === 0) return { targetEC: "1.2", targetPH: "6.0", statistics: { seedlingCount: 0, growthCount: 0, matureCount: 0 } };
  
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
  
  finalEC = Math.max(0.8, Math.min(1.9, finalEC));
  
  let targetPH = (totalPH / plants.length).toFixed(1);
  
  return {
    targetEC: finalEC.toFixed(2),
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
  
  let ecRatio = parseFloat(targetEC) / 1.3;
  
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
// FUNCIONES DE CÁLCULO PARA RIEGO CON LANTA DE ROCA
// ============================================================================

const calculateIrrigation = (plants, irrigationConfig) => {
  const stats = calculateSystemEC(plants, 20, "bajo_mineral").statistics;
  
  // Cálculo de necesidades de agua por ciclo CONSIDERANDO LANTA DE ROCA
  const waterPerCycle = 
    (stats.seedlingCount * PUMP_CONFIG.waterPerPlant.seedling * ROCKWOOL_CHARACTERISTICS.waterRetention) +
    (stats.growthCount * PUMP_CONFIG.waterPerPlant.growth * ROCKWOOL_CHARACTERISTICS.waterRetention) +
    (stats.matureCount * PUMP_CONFIG.waterPerPlant.mature * ROCKWOOL_CHARACTERISTICS.waterRetention);
  
  // Calcular tiempo de bomba por ciclo (en segundos)
  let pumpTimePerCycle = Math.ceil(waterPerCycle / PUMP_CONFIG.flowRatePerSecond);
  
  // Ajustar según configuración manual
  if (irrigationConfig.mode === "manual") {
    pumpTimePerCycle = irrigationConfig.pumpTime;
  }
  
  // Limitar a rangos seguros para lana de roca (evitar encharcamiento)
  pumpTimePerCycle = Math.max(PUMP_CONFIG.minCycleTime, Math.min(PUMP_CONFIG.maxCycleTime, pumpTimePerCycle));
  
  // Calcular intervalo basado en tiempo de secado de lana de roca
  let baseInterval;
  
  if (stats.matureCount > 0) {
    // Priorizar plantas maduras (secado más rápido)
    baseInterval = PUMP_CONFIG.baseIntervals.mature;
  } else if (stats.growthCount > 0) {
    baseInterval = PUMP_CONFIG.baseIntervals.growth;
  } else {
    baseInterval = PUMP_CONFIG.baseIntervals.seedling;
  }
  
  // Ajustar según temperatura (mayor temperatura = secado más rápido)
  const temp = parseFloat(irrigationConfig.temperature || 22);
  let tempFactor = 1.0;
  
  if (temp > 25) {
    tempFactor = 0.7; // 30% más frecuente si hace calor
  } else if (temp > 22) {
    tempFactor = 0.85; // 15% más frecuente
  } else if (temp < 18) {
    tempFactor = 1.3; // 30% menos frecuente si hace frío
  }
  
  let intervalMinutes = irrigationConfig.mode === "manual" ? 
    irrigationConfig.interval : 
    Math.round(baseInterval * tempFactor);
  
  // Asegurar intervalos mínimos y máximos
  intervalMinutes = Math.max(30, Math.min(180, intervalMinutes));
  
  // Calcular métricas
  const cyclesPerDay = Math.floor((24 * 60) / intervalMinutes);
  const totalPumpTimePerDay = (pumpTimePerCycle * cyclesPerDay) / 60; // en minutos
  const totalWaterPerDay = totalPumpTimePerDay * (PUMP_CONFIG.flowRate / 60); // en litros
  const energyConsumption = (totalPumpTimePerDay / 60) * PUMP_CONFIG.power; // en Wh
  
  // Calcular humedad estimada en lana de roca
  const rockwoolMoisture = Math.min(100, Math.round(
    (waterPerCycle / 
      (stats.seedlingCount * ROCKWOOL_CHARACTERISTICS.cubeSizes.seedling +
       (stats.growthCount + stats.matureCount) * ROCKWOOL_CHARACTERISTICS.cubeSizes.standard)
    ) * 100 * ROCKWOOL_CHARACTERISTICS.waterRetention
  ));
  
  return {
    pumpTimePerCycle,
    intervalMinutes,
    cyclesPerDay,
    totalPumpTimePerDay: Math.round(totalPumpTimePerDay),
    totalWaterPerDay: Math.round(totalWaterPerDay * 10) / 10,
    energyConsumption: Math.round(energyConsumption * 10) / 10,
    waterPerCycle: Math.round(waterPerCycle * 1000), // en ml
    rockwoolMoisture, // % de humedad estimada
    stats,
    recommendations: getRockwoolRecommendations(stats, temp, intervalMinutes)
  };
};

const getRockwoolRecommendations = (stats, temperature, interval) => {
  const recs = [];
  
  // Recomendaciones específicas para lana de roca
  if (stats.seedlingCount > 0) {
    recs.push({
      icon: "🌱",
      text: `Plántulas en lana de roca: Ciclos cortos (10-20s) para evitar encharcamiento. La lana retiene humedad 3-4 horas.`
    });
  }
  
  if (temperature > 25) {
    recs.push({
      icon: "🔥",
      text: `Temperatura alta (${temperature}°C): La lana de roca se seca más rápido. Considera intervalos más cortos.`
    });
  } else if (temperature < 18) {
    recs.push({
      icon: "❄️",
      text: `Temperatura baja (${temperature}°C): La lana retiene humedad más tiempo. Puedes espaciar riegos.`
    });
  }
  
  if (interval < 45) {
    recs.push({
      icon: "💧",
      text: `Riego muy frecuente: Asegúrate de que la lana de roca drena bien entre ciclos para evitar asfixia radicular.`
    });
  }
  
  if (stats.matureCount >= 4) {
    recs.push({
      icon: "🌿",
      text: `Plantas maduras: Necesitan riegos más largos (30-45s) para saturar completamente la lana de roca.`
    });
  }
  
  // Recomendación general para lana de roca
  recs.push({
    icon: "📊",
    text: `La lana de roca idealmente debe mantenerse entre 60-80% de humedad. Evita la saturación completa prolongada.`
  });
  
  return recs;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HydroAppFinalV31() {
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20", 
    ph: "6.0", 
    ec: "1.2", 
    temp: "22", 
    targetEC: "1.4", 
    targetPH: "6.0",
    waterType: "bajo_mineral"
  });
  const [tab, setTab] = useState("overview");
  const [selPos, setSelPos] = useState(null);
  const [showWaterSelector, setShowWaterSelector] = useState(false);
  
  // Nuevo estado para control de riego
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto", // "auto" o "manual"
    pumpTime: 20, // segundos por ciclo (ajustado para lana de roca)
    interval: 90, // minutos entre ciclos (ajustado para lana de roca)
    temperature: "22"
  });

  // =================== EFECTOS Y FUNCIONES BÁSICAS ===================

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
        setStep(3);
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

  useEffect(() => {
    if (plants.length > 0 && step >= 2) {
      const optimal = calculateSystemEC(plants, parseFloat(config.totalVol), config.waterType);
      const currentTargetEC = parseFloat(config.targetEC);
      const newTargetEC = parseFloat(optimal.targetEC);
      
      if (Math.abs(currentTargetEC - newTargetEC) > 0.1) {
        setConfig(prev => ({
          ...prev,
          targetEC: optimal.targetEC,
          targetPH: optimal.targetPH
        }));
      }
    }
  }, [plants, config.totalVol, config.waterType, step]);

  // Actualizar temperatura en configuración de riego
  useEffect(() => {
    setIrrigationConfig(prev => ({
      ...prev,
      temperature: config.temp
    }));
  }, [config.temp]);

  const generatePlantId = () => {
    return `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  // =================== CÁLCULO DE RIEGO ===================

  const irrigationData = useMemo(() => {
    return calculateIrrigation(plants, irrigationConfig);
  }, [plants, irrigationConfig]);

  // =================== FUNCIÓN DEL NUEVO CALENDARIO ===================

  const generateCalendar = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDayOfMonth.getDate();
    const totalCells = 42;
    const calendarDays = [];

    // Días del mes anterior
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = 0; i < startOffset; i++) {
      const day = prevMonthLastDay - startOffset + i + 1;
      const date = new Date(currentYear, currentMonth - 1, day);
      calendarDays.push({
        date,
        dayOfMonth: day,
        isCurrentMonth: false,
        events: []
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      calendarDays.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: true,
        events: []
      });
    }

    // Días del mes siguiente
    const remainingCells = totalCells - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      calendarDays.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: false,
        events: []
      });
    }

    // Calcular eventos
    const totalPlants = plants.length;
    const measureFrequency = totalPlants > 12 ? 2 : totalPlants > 6 ? 3 : 4;
    
    const lastRotDate = new Date(lastRot);
    const lastCleanDate = new Date(lastClean);

    calendarDays.forEach(day => {
      if (!day.isCurrentMonth) return;
      
      const dayDate = day.date;
      const diffTime = dayDate - now;
      const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
      
      if (diffDays < 0) return;

      // Evento de medición
      if (diffDays % measureFrequency === 0) {
        day.events.push('measure');
      }

      // Evento de rotación
      const daysFromLastRot = Math.floor((dayDate - lastRotDate) / (1000 * 3600 * 24));
      if (daysFromLastRot > 0 && daysFromLastRot % 7 === 0) {
        day.events.push('rotation');
      }

      // Evento de limpieza
      const daysFromLastClean = Math.floor((dayDate - lastCleanDate) / (1000 * 3600 * 24));
      if (daysFromLastClean > 0 && daysFromLastClean % 14 === 0) {
        day.events.push('clean');
      }
    });

    return calendarDays;
  };

  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1.4;
    const tPh = parseFloat(config.targetPH) || 6.0;
    const temp = parseFloat(config.temp) || 20;
    const waterType = config.waterType || "bajo_mineral";
    const res = [];

    if (waterType === "alta_mineral") {
      res.push({ 
        t: "AGUA DURA DETECTADA", 
        v: "No recomendado", 
        d: "CANNA Aqua Vega es para agua blanda. Cambia de agua o producto.", 
        c: "bg-gradient-to-r from-amber-600 to-orange-600",
        icon: <Filter className="text-white" size={28} />,
        priority: 3
      });
    }

    if (vAct < vTot * 0.3) {
      res.push({ 
        t: "¡AGUA MUY BAJA!", 
        v: `${(vTot - vAct).toFixed(1)}L`, 
        d: `Crítico: Solo queda un ${(vAct/vTot*100).toFixed(0)}%`, 
        c: "bg-gradient-to-r from-red-600 to-rose-700 animate-pulse",
        icon: <Droplets className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (vAct < vTot * 0.5) {
      res.push({ 
        t: "RELLENAR AGUA", 
        v: `${(vTot - vAct).toFixed(1)}L`, 
        d: `Depósito al ${(vAct/vTot*100).toFixed(0)}%`, 
        c: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: <CloudRain className="text-white" size={28} />,
        priority: 2
      });
    }

    if (temp > 28) {
      res.push({ 
        t: "¡PELIGRO TEMPERATURA!", 
        v: `${temp}°C`, 
        d: "Alto riesgo. Añadir hielo en botella YA.", 
        c: "bg-gradient-to-r from-red-700 to-pink-800 animate-pulse shadow-lg shadow-red-900/50",
        icon: <ThermometerSun className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (temp > 25) {
      res.push({ 
        t: "TEMPERATURA ALTA", 
        v: `${temp}°C`, 
        d: "Oxígeno bajo. Considera añadir hielo.", 
        c: "bg-gradient-to-r from-orange-500 to-red-500",
        icon: <Thermometer className="text-white" size={28} />,
        priority: 2
      });
    }
    else if (temp < 16) {
      res.push({ 
        t: "TEMPERATURA BAJA", 
        v: `${temp}°C`, 
        d: "Crecimiento muy lento. Subir temperatura.", 
        c: "bg-gradient-to-r from-cyan-600 to-blue-600",
        icon: <Thermometer className="text-white" size={28} />,
        priority: 3
      });
    }

    if (ph > tPh + 0.5 || ph < tPh - 0.5) {
      const phAdjustment = calculatePHAdjustment(ph, tPh, waterType, vAct);
      const action = ph > tPh ? "pH-" : "pH+";
      const ml = ph > tPh ? phAdjustment.phMinus : phAdjustment.phPlus;
      res.push({ 
        t: `AJUSTE ${action} URGENTE`, 
        v: `${ml}ml`, 
        d: `pH ${ph} → ${tPh} (fuera de rango seguro)`, 
        c: "bg-gradient-to-r from-purple-700 to-pink-700 animate-pulse",
        icon: <RefreshCw className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ph > tPh + 0.2 || ph < tPh - 0.2) {
      const phAdjustment = calculatePHAdjustment(ph, tPh, waterType, vAct);
      const action = ph > tPh ? "pH-" : "pH+";
      const ml = ph > tPh ? phAdjustment.phMinus : phAdjustment.phPlus;
      res.push({ 
        t: `AJUSTAR ${action}`, 
        v: `${ml}ml`, 
        d: `pH ${ph} → objetivo ${tPh}`, 
        c: "bg-gradient-to-r from-purple-500 to-pink-500",
        icon: <ArrowDownCircle className={ph > tPh ? "" : "rotate-180"} size={28} />,
        priority: 2
      });
    }

    if (ec < tEc - 0.4 && ec > 0) {
      const dosageNeeded = calculateCannaDosage(plants, vAct, tEc, waterType);
      const mlPerLiter = dosageNeeded.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 0.1) * vAct * mlPerLiter * 0.5;
      res.push({ 
        t: "¡FALTAN NUTRIENTES!", 
        v: `${Math.round(mlToAdd)}ml A+B`, 
        d: `EC ${ec} (muy baja). Añadir CANNA Aqua Vega.`, 
        c: "bg-gradient-to-r from-blue-800 to-cyan-800 animate-pulse",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec < tEc - 0.2 && ec > 0) {
      const dosageNeeded = calculateCannaDosage(plants, vAct, tEc, waterType);
      const mlPerLiter = dosageNeeded.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 0.1) * vAct * mlPerLiter * 0.5;
      res.push({ 
        t: "AÑADIR NUTRIENTES", 
        v: `${Math.round(mlToAdd)}ml A+B`, 
        d: `Subir de ${ec} a ${tEc} mS/cm`, 
        c: "bg-gradient-to-r from-blue-600 to-cyan-600",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 2
      });
    } 
    else if (ec > tEc + 0.5) {
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        t: "¡EC PELIGROSAMENTE ALTA!", 
        v: `${water}L AGUA`, 
        d: `EC ${ec}. Diluir URGENTE para salvar raíces.`, 
        c: "bg-gradient-to-r from-red-800 to-amber-900 animate-pulse shadow-lg shadow-amber-900/50",
        icon: <Skull className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec > tEc + 0.3) {
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        t: "DILUIR CON AGUA", 
        v: `${water}L`, 
        d: `EC ${ec} > objetivo ${tEc}. Añadir agua sola.`, 
        c: "bg-gradient-to-r from-amber-600 to-orange-600",
        icon: <AlertTriangle className="text-white" size={28} />,
        priority: 2
      });
    }

    const lastCleanDate = new Date(lastClean);
    const now = new Date();
    const daysSinceClean = Math.floor((now - lastCleanDate) / (1000 * 3600 * 24));
    
    if (daysSinceClean >= 12) {
      res.push({ 
        t: daysSinceClean >= 14 ? "¡LIMPIEZA URGENTE!" : "LIMPIEZA PRÓXIMA", 
        v: `${daysSinceClean} días`, 
        d: daysSinceClean >= 14 ? "Depósito puede tener biofilm peligroso" : "Programa limpieza en los próximos días", 
        c: daysSinceClean >= 14 ? "bg-gradient-to-r from-red-700 to-rose-800 animate-pulse" : "bg-gradient-to-r from-violet-600 to-purple-700",
        icon: <ShieldAlert className="text-white" size={28} />,
        priority: daysSinceClean >= 14 ? 1 : 3
      });
    }

    // Alerta específica para lana de roca si el riego es muy frecuente
    if (irrigationData.intervalMinutes < 45 && plants.filter(p => p.l === 1).length > 0) {
      res.push({
        t: "¡CUIDADO CON PLÁNTULAS!",
        v: "Riego muy frecuente",
        d: "La lana de roca para plántulas puede encharcarse. Aumenta intervalo.",
        c: "bg-gradient-to-r from-cyan-600 to-blue-700",
        icon: <Droplet className="text-white" size={28} />,
        priority: 2
      });
    }

    // Alerta si la humedad estimada es muy alta
    if (irrigationData.rockwoolMoisture > 90) {
      res.push({
        t: "EXCESO DE HUMEDAD",
        v: `${irrigationData.rockwoolMoisture}%`,
        d: "La lana de roca está demasiado saturada. Reduce tiempo de bomba.",
        c: "bg-gradient-to-r from-blue-700 to-cyan-800",
        icon: <Cloud className="text-white" size={28} />,
        priority: 2
      });
    }

    return res.sort((a, b) => a.priority - b.priority);
  }, [config, lastClean, plants, irrigationData]);

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

  // ============================================================================
  // INTERFAZ DE USUARIO - LOS 5 PASOS
  // ============================================================================

  // ... (Los pasos 0-3 se mantienen igual) ...

  // ============================================================================
  // INTERFAZ PRINCIPAL (PASO 4)
  // ============================================================================

  const calendarDays = generateCalendar();
  
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black italic text-green-700 leading-none uppercase">HydroCaru v4.5</h1>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic">CANNA Aqua Vega | Lana de Roca | Sistema Escalonado</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-lg">
            {config.currentVol}L
          </Badge>
          <button 
            onClick={() => setShowWaterSelector(true)}
            className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            title="Cambiar tipo de agua"
          >
            <Filter className="text-blue-600" size={20} />
          </button>
          {alerts.length > 0 && (
            <div className="relative">
              <Bell className="text-amber-600" size={22} />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-ping">
                {alerts.filter(a => a.priority === 1).length}
              </span>
            </div>
          )}
        </div>
      </header>

      {showWaterSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Seleccionar Tipo de Agua</h2>
              <button onClick={() => setShowWaterSelector(false)} className="p-2 bg-slate-100 rounded-full">
                <Plus size={24} className="rotate-45 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
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
                  className={`w-full p-5 rounded-[2rem] border-4 ${config.waterType === key ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'} flex items-center gap-4 hover:bg-slate-50 transition-all`}
                >
                  <div className="flex-shrink-0">
                    {water.icon}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-slate-800">{water.name}</p>
                    <p className="text-xs text-slate-500">{water.description}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-blue-600 font-bold">EC base: {water.ecBase}</span>
                      <span className="text-amber-600 font-bold">Dureza: {water.hardness} ppm</span>
                    </div>
                  </div>
                  {config.waterType === key && (
                    <Check className="text-blue-500" size={24} />
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
              <p className="text-xs font-bold text-blue-700">
                ℹ️ CANNA Aqua Vega está optimizado para <strong>agua blanda</strong>. 
                Los cálculos se ajustarán automáticamente.
              </p>
            </div>
          </Card>
        </div>
      )}

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-7 bg-white border-4 border-slate-100 shadow-xl rounded-[2.5rem] mb-8 h-18 p-1">
            <TabsTrigger value="overview" className="relative">
              <Activity />
              {alerts.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>}
            </TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="irrigation"><Water /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar /></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-5 rounded-[2rem] bg-gradient-to-r from-slate-50 to-blue-50 border-2">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-black uppercase text-slate-400">COMPOSICIÓN DEL CULTIVO</p>
                <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
                  <Filter className="text-blue-500" size={16} />
                  <span>{WATER_TYPES[config.waterType].name}</span>
                </div>
              </div>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center mx-auto mb-1 shadow-inner">
                    <Sprout className="text-blue-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-blue-700">{plants.filter(p => p.l === 1).length}</p>
                  <p className="text-[9px] font-bold text-slate-600">Plántulas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-purple-200 to-purple-300 flex items-center justify-center mx-auto mb-1 shadow-inner">
                    <Activity className="text-purple-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-purple-700">{plants.filter(p => p.l === 2).length}</p>
                  <p className="text-[9px] font-bold text-slate-600">Crecimiento</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-200 to-green-300 flex items-center justify-center mx-auto mb-1 shadow-inner">
                    <Check className="text-green-700" size={24} />
                  </div>
                  <p className="text-xl font-black text-green-700">{plants.filter(p => p.l === 3).length}</p>
                  <p className="text-[9px] font-bold text-slate-600">Maduras</p>
                </div>
              </div>
            </Card>
            
            {alerts.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Bell className="text-amber-600" size={18} />
                  <p className="text-[11px] font-black uppercase text-slate-500">ALERTAS DEL SISTEMA ({alerts.length})</p>
                </div>
                {alerts.map((alert, i) => (
                  <Card key={i} className={`${alert.c} text-white p-6 rounded-[2.5rem] flex items-center gap-5 border-none shadow-xl animate-in slide-in-from-right`}>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      {alert.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-black uppercase opacity-90 mb-1">{alert.t}</p>
                        {alert.priority === 1 && (
                          <span className="bg-white/30 text-[8px] font-black px-2 py-1 rounded-full">URGENTE</span>
                        )}
                      </div>
                      <p className="text-2xl font-black italic leading-none mb-1">{alert.v}</p>
                      <p className="text-[10px] font-bold opacity-80 leading-tight">{alert.d}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center font-black text-green-700 border-4 border-green-100 bg-gradient-to-b from-green-50 to-emerald-50 rounded-[3rem] shadow-lg">
                <Check className="mx-auto mb-4 bg-white rounded-full p-4 text-green-600 shadow-lg" size={50}/>
                <p className="text-xl mb-2">SISTEMA EN EQUILIBRIO</p>
                <p className="text-[12px] font-normal text-slate-600">Todos los parámetros están dentro de los rangos óptimos</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6">
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-700">
                      Agua: <span className="font-black">{WATER_TYPES[config.waterType].name}</span>
                    </p>
                    <p className="text-xs text-blue-600">EC objetivo: {config.targetEC} | pH objetivo: {config.targetPH}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH Medido</label><input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC Medida</label><input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Litros actuales en depósito</label><input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black text-cyan-800" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temperatura Agua °C</label><input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} className="w-full p-5 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-3xl font-black text-orange-800" /></div>
              </div>
              <button onClick={() => { 
                setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history]); 
                setTab("overview");
                alert("✅ Medición registrada correctamente");
              }} className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl">
                Registrar Mediciones
              </button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <button onClick={handleRotation} className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-orange-500 to-red-500 text-white font-black flex items-center justify-center gap-4 shadow-2xl border-b-8 border-orange-800 active:border-b-0 active:translate-y-1 transition-all">
                <Scissors size={28}/> 
                <div className="text-left leading-none">
                  <p className="text-[10px] uppercase opacity-70 mb-1">Cosecha y Descenso</p>
                  <p className="text-xl uppercase italic">Rotar Niveles de Torre</p>
                </div>
            </button>
            {[1, 2, 3].map(l => (
              <div key={l}>
                <p className="text-[10px] font-black mb-3 px-4 flex justify-between uppercase italic text-slate-400">
                    <span>Nivel {l} {l===1?'(Siembra)':l===3?'(Cosecha)':'(Crecimiento)'}</span>
                    <Badge variant="outline" className="border-2">{plants.filter(p => p.l === l).length}/6</Badge>
                </p>
                <div className="bg-slate-200/50 p-5 rounded-[2.5rem] grid grid-cols-3 gap-4 border-4 border-white shadow-inner">
                  {[1, 2, 3, 4, 5, 6].map(p => {
                    const pl = plants.find(x => x.l === l && x.p === p);
                    return (
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center border-4 relative transition-all ${pl ? `${VARIETIES[pl.v].color} border-white shadow-xl scale-110` : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
                        {pl ? <Sprout size={28} className="text-white" /> : <Plus size={24} className="text-slate-300" />}
                        {pl && <span className="text-[7px] font-black text-white absolute bottom-1 uppercase px-1 truncate w-full text-center leading-none">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* PESTAÑA DE RIEGO ACTUALIZADA PARA LANTA DE ROCA */}
          <TabsContent value="irrigation" className="space-y-6">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
                    <Water className="text-white" size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-blue-800">Control de Riego</h2>
                    <p className="text-xs text-slate-500">Optimizado para <strong>Lana de Roca</strong> - Bomba 7W/600L/h</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIrrigationConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`p-4 rounded-2xl font-black flex items-center gap-2 ${irrigationConfig.enabled ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600'}`}
                >
                  <Power size={20} />
                  {irrigationConfig.enabled ? 'ACTIVA' : 'INACTIVA'}
                </button>
              </div>

              {/* INFO SOBRE LANTA DE ROCA */}
              <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-cyan-100 rounded-xl">
                    <Droplet className="text-cyan-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-cyan-800 text-sm">Características de la Lana de Roca</h3>
                    <p className="text-xs text-cyan-600">85% retención - Secado en 2-4 horas</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-xs font-black text-cyan-700">Retención</p>
                    <p className="text-lg font-black">{ROCKWOOL_CHARACTERISTICS.waterRetention * 100}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-xs font-black text-blue-700">Drenaje</p>
                    <p className="text-lg font-black">{ROCKWOOL_CHARACTERISTICS.drainageRate * 100}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-xs font-black text-purple-700">Humedad</p>
                    <p className="text-lg font-black">{irrigationData.rockwoolMoisture}%</p>
                  </div>
                </div>
              </Card>

              {/* MODO DE OPERACIÓN */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-black text-slate-700">Modo de Operación</p>
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      onClick={() => setIrrigationConfig(prev => ({ ...prev, mode: "auto" }))}
                      className={`px-4 py-2 rounded-xl text-sm font-black ${irrigationConfig.mode === "auto" ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'text-slate-500'}`}
                    >
                      Automático
                    </button>
                    <button
                      onClick={() => setIrrigationConfig(prev => ({ ...prev, mode: "manual" }))}
                      className={`px-4 py-2 rounded-xl text-sm font-black ${irrigationConfig.mode === "manual" ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-slate-500'}`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {/* CONFIGURACIÓN DETALLADA */}
                <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2">
                  <div className="space-y-6">
                    {/* TIEMPO DE BOMBA POR CICLO */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-black text-blue-700">Tiempo de bomba por ciclo</p>
                        <p className="text-2xl font-black text-blue-800">{irrigationConfig.pumpTime}s</p>
                      </div>
                      <Slider
                        value={[irrigationConfig.pumpTime]}
                        onValueChange={(value) => setIrrigationConfig(prev => ({ ...prev, pumpTime: value[0] }))}
                        min={PUMP_CONFIG.minCycleTime}
                        max={PUMP_CONFIG.maxCycleTime}
                        step={5}
                        disabled={irrigationConfig.mode === "auto"}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>10s (plántulas)</span>
                        <span>30s (maduras)</span>
                        <span>45s (máx seguro)</span>
                      </div>
                    </div>

                    {/* INTERVALO ENTRE CICLOS */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-black text-purple-700">Intervalo entre ciclos</p>
                        <p className="text-2xl font-black text-purple-800">{irrigationConfig.interval} min</p>
                      </div>
                      <Slider
                        value={[irrigationConfig.interval]}
                        onValueChange={(value) => setIrrigationConfig(prev => ({ ...prev, interval: value[0] }))}
                        min={30}
                        max={180}
                        step={15}
                        disabled={irrigationConfig.mode === "auto"}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>30min (calor)</span>
                        <span>90min (óptimo)</span>
                        <span>180min (frío)</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ESTADÍSTICAS DE RIEGO */}
                <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2">
                  <h3 className="text-sm font-black text-emerald-800 mb-4">Estadísticas de Riego</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Agua por ciclo</p>
                      <p className="text-xl font-black text-emerald-700">{irrigationData.waterPerCycle} ml</p>
                      <p className="text-[9px] text-slate-500">Para {plants.length} plantas</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Ciclos por día</p>
                      <p className="text-xl font-black text-blue-700">{irrigationData.cyclesPerDay}</p>
                      <p className="text-[9px] text-slate-500">Cada {irrigationData.intervalMinutes} min</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Agua total/día</p>
                      <p className="text-xl font-black text-amber-700">{irrigationData.totalWaterPerDay} L</p>
                      <p className="text-[9px] text-slate-500">≈ {Math.round(irrigationData.totalWaterPerDay * 1000 / plants.length)} ml/planta</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-purple-100">
                      <p className="text-[10px] font-black uppercase text-purple-600 mb-1">Energía/día</p>
                      <p className="text-xl font-black text-purple-700">{irrigationData.energyConsumption} Wh</p>
                      <p className="text-[9px] text-slate-500">≈ {Math.round(irrigationData.energyConsumption / 1000 * 0.15 * 30, 2)}€/mes</p>
                    </div>
                  </div>

                  {/* BARRA DE HUMEDAD */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <p className="text-xs font-black text-slate-700">Humedad estimada en lana de roca</p>
                      <p className="text-sm font-black text-cyan-700">{irrigationData.rockwoolMoisture}%</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          irrigationData.rockwoolMoisture < 60 ? 'bg-red-500' :
                          irrigationData.rockwoolMoisture < 80 ? 'bg-green-500' :
                          irrigationData.rockwoolMoisture < 90 ? 'bg-yellow-500' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(100, irrigationData.rockwoolMoisture)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Seco</span>
                      <span className="text-green-600 font-black">Óptimo (60-80%)</span>
                      <span>Saturado</span>
                    </div>
                  </div>
                </Card>

                {/* RECOMENDACIONES ESPECÍFICAS */}
                <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-amber-50 to-orange-50 border-2">
                  <h3 className="text-sm font-black text-amber-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="text-amber-600" size={16} />
                    Recomendaciones para Lana de Roca
                  </h3>
                  <div className="space-y-3">
                    {irrigationData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-xl">
                        <span className="text-xl">{rec.icon}</span>
                        <p className="text-sm text-slate-700 flex-1">{rec.text}</p>
                      </div>
                    ))}
                    
                    {/* RECOMENDACIÓN GENERAL */}
                    <div className="p-3 bg-amber-100 rounded-xl border border-amber-200">
                      <p className="text-xs font-black text-amber-800">💡 CONSEJO MAESTRO:</p>
                      <p className="text-xs text-amber-700 mt-1">
                        <strong>Toca la lana de roca</strong> entre riegos. Debe sentirse húmeda pero no goteando. 
                        Si está seca al tacto, reduce intervalos. Si está empapada, aumenta intervalos.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* BOTÓN DE SIMULACIÓN */}
                <button
                  onClick={() => {
                    const stats = irrigationData.stats;
                    alert(`🚰 SIMULACIÓN DE RIEGO PARA LANTA DE ROCA:\n\n• Bomba activada por ${irrigationData.pumpTimePerCycle} segundos\n• Próximo riego en ${irrigationData.intervalMinutes} minutos\n• Agua utilizada: ${irrigationData.waterPerCycle} ml\n• Humedad estimada: ${irrigationData.rockwoolMoisture}%\n\n📊 BASADO EN:\n• ${stats.seedlingCount} plántulas (cubo pequeño)\n• ${stats.growthCount} en crecimiento\n• ${stats.matureCount} maduras (cubo estándar)\n\n🌡️ Temperatura: ${config.temp}°C`);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-[2.5rem] font-black uppercase text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Simular Ciclo de Riego
                </button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            {/* ... (código del calendario existente se mantiene igual) ... */}
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            {/* AÑADIR NUEVA SECCIÓN SOBRE LANTA DE ROCA */}
            <Card className="rounded-[3rem] border-4 border-cyan-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white flex items-center gap-4">
                <Droplet size={30}/>
                <h3 className="font-black uppercase text-xs tracking-widest">🧱 GUÍA COMPLETA: LANTA DE ROCA EN TORRE VERTICAL</h3>
              </div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-6">
                
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-cyan-700">PREPARACIÓN INICIAL DE LA LANTA DE ROCA</h4>
                  <div className="bg-cyan-50 p-4 rounded-2xl border-l-4 border-cyan-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-cyan-500 font-black">•</span> <strong>pH Inicial:</strong> La lana de roca nueva tiene pH ~8.0. Debes <strong>remojar 24h en agua acidificada a pH 5.5</strong>. Usa pH- y mide hasta lograr 5.5 estable.</p>
                    <p className="flex items-start gap-2"><span className="text-cyan-500 font-black">•</span> <strong>Escurrido:</strong> Después del remojo, deja escurrir NATURALMENTE 1-2 horas. <strong>NUNCA APRIETES</strong> la lana. Al apretar destruyes la estructura de aire que las raíces necesitan.</p>
                    <p className="flex items-start gap-2"><span className="text-cyan-500 font-black">•</span> <strong>Hoyo de plantación:</strong> Con un lápiz limpio, haz un hoyo en el centro. Debe ser lo suficientemente profundo para enterrar el tallo hasta justo debajo de los cotiledones.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-blue-700">TRASPLANTE DE PLÁNTULAS A LA LANTA DE ROCA</h4>
                  <div className="bg-blue-50 p-4 rounded-2xl border-l-4 border-blue-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> <strong>Limpieza de raíces:</strong> Con las plántulas del vivero, limpia SUAVEMENTE el 80% de la tierra bajo agua tibia. No necesitas eliminar el 100%.</p>
                    <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> <strong>Colocación:</strong> Introduce las raíces en el hoyo. Rellena con pequeños trozos de lana para dar soporte, pero <strong>sin compactar</strong>.</p>
                    <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> <strong>Primer riego:</strong> Riega manualmente con solución nutritiva (EC 0.8-1.0) hasta que la lana esté uniformemente húmeda.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-emerald-700">MANEJO DE HUMEDAD EN LA TORRE VERTICAL</h4>
                  <div className="bg-emerald-50 p-4 rounded-2xl border-l-4 border-emerald-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-emerald-500 font-black">•</span> <strong>Prueba del tacto:</strong> La forma más precisa es tocar la lana entre riegos. Debe sentirse como una esponja <strong>húmeda pero no empapada</strong>.</p>
                    <p className="flex items-start gap-2"><span className="text-emerald-500 font-black">•</span> <strong>Drenaje:</strong> La lana debe drenar el 15% del agua aplicada. Si no ves drenaje, el riego es insuficiente. Si ves mucho drenaje, es excesivo.</p>
                    <p className="flex items-start gap-2"><span className="text-emerald-500 font-black">•</span> <strong>Señales de problemas:</strong> Raíces marrones = exceso de agua. Raíces secas = falta de agua. Raíces blancas = perfecto.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-purple-700">AJUSTES DE RIEGO POR ETAPA</h4>
                  <div className="bg-purple-50 p-4 rounded-2xl border-l-4 border-purple-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-purple-500 font-black">•</span> <strong>Plántulas (semana 1-2):</strong> Riegos cortos (10-15s) cada 2-3 horas. La lana debe permanecer húmeda pero con buen aireación.</p>
                    <p className="flex items-start gap-2"><span className="text-purple-500 font-black">•</span> <strong>Crecimiento (semana 3-4):</strong> Riegos de 20-30s cada 1.5-2 horas. Las raíces ya exploran toda la lana.</p>
                    <p className="flex items-start gap-2"><span className="text-purple-500 font-black">•</span> <strong>Maduración (semana 5+):</strong> Riegos de 30-45s cada 1-1.5 horas. Máxima absorción de agua y nutrientes.</p>
                    <p className="text-center text-[10px] font-black text-purple-700 mt-3">⚠️ Estos tiempos son para temperatura de 22°C. Ajusta según tu ambiente.</p>
                  </div>
                </div>

              </div>
            </Card>
            
            {/* ... (resto del código de tips existente se mantiene igual) ... */}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 py-10">
            {/* ... (código de settings existente se mantiene igual) ... */}
          </TabsContent>
        </Tabs>
      </main>

      {/* ... (resto del código se mantiene igual) ... */}
    </div>
  );
}
