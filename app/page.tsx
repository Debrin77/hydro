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
  WindIcon, Clipboard, ThermometerSnowflake, TreePine, Settings
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
    ecBase: 0.0, // 0 µS/cm
    hardness: 0,
    phBase: 7.0,
    description: "Agua pura, EC casi 0. Perfecta para hidroponía.",
    recommendation: "Usar nutrientes completos desde el inicio."
  },
  "bajo_mineral": {
    name: "Baja Mineralización (Agua Blanda)",
    icon: <Droplets className="text-cyan-500" />,
    ecBase: 200, // 200 µS/cm
    hardness: 50,
    phBase: 7.2,
    description: "Agua blanda, ideal para CANNA Aqua Vega.",
    recommendation: "Ajuste mínimo de pH necesario."
  },
  "medio_mineral": {
    name: "Media Mineralización",
    icon: <Droplets className="text-teal-500" />,
    ecBase: 400, // 400 µS/cm
    hardness: 150,
    phBase: 7.5,
    description: "Agua de grifo típica.",
    recommendation: "Considerar dureza al mezclar."
  },
  "alta_mineral": {
    name: "Alta Mineralización (Agua Dura)",
    icon: <Droplets className="text-amber-500" />,
    ecBase: 800, // 800 µS/cm
    hardness: 300,
    phBase: 8.0,
    description: "Agua dura, alta en calcio/magnesio.",
    recommendation: "No recomendada para Aqua Vega de agua blanda."
  }
};

const VARIETIES = {
  "Iceberg": { 
    color: "bg-cyan-500",
    ecMax: 1600, // µS/cm
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 }, // µS/cm
      growth:   { a: 22, b: 22, ec: 1300 }, // µS/cm
      mature:   { a: 28, b: 28, ec: 1600 }  // µS/cm
    },
    info: "Sensible al exceso de sales. Usar EC conservador."
  },
  "Lollo Rosso": { 
    color: "bg-purple-600",
    ecMax: 1800, // µS/cm
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },  // µS/cm
      growth:   { a: 22, b: 22, ec: 1400 }, // µS/cm
      mature:   { a: 28, b: 28, ec: 1700 }  // µS/cm
    },
    info: "Color intenso con EC algo más alta."
  },
  "Maravilla": { 
    color: "bg-amber-600",
    ecMax: 1700, // µS/cm
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },  // µS/cm
      growth:   { a: 22, b: 22, ec: 1300 }, // µS/cm
      mature:   { a: 28, b: 28, ec: 1600 }  // µS/cm
    },
    info: "Clásica de alto rendimiento."
  },
  "Trocadero": { 
    color: "bg-lime-600",
    ecMax: 1600, // µS/cm
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },  // µS/cm
      growth:   { a: 22, b: 22, ec: 1300 }, // µS/cm
      mature:   { a: 28, b: 28, ec: 1600 }  // µS/cm
    },
    info: "Sabor suave. Cuidado en plántula."
  },
  "Hoja de Roble Rojo": { 
    color: "bg-red-600",
    ecMax: 1900, // µS/cm
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 1000 }, // µS/cm
      growth:   { a: 22, b: 22, ec: 1500 }, // µS/cm
      mature:   { a: 28, b: 28, ec: 1800 }  // µS/cm
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
// CONFIGURACIÓN DE LA BOMBA Y SUSTRATO (LANA DE ROCA) AJUSTADA PARA CASTELLÓN
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
// FUNCIONES DE CÁLCULO PARA CANNA AQUA VEGA
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
// FUNCIONES DE CÁLCULO PARA RIEGO CON CLIMA MEDITERRÁNEO
// ============================================================================

const calculateIrrigation = (plants, irrigationConfig, currentTime = new Date()) => {
  const stats = calculateSystemEC(plants, 20, "bajo_mineral").statistics;
  
  const hour = currentTime.getHours();
  const isDaytime = hour >= 6 && hour < 21;
  
  const month = currentTime.getMonth() + 1;
  let season = "spring_autumn";
  if (month >= 6 && month <= 9) season = "summer";
  else if (month >= 12 || month <= 2) season = "winter";
  
  const waterPerCycle = 
    (stats.seedlingCount * PUMP_CONFIG.waterPerPlant.seedling * ROCKWOOL_CHARACTERISTICS.waterRetention) +
    (stats.growthCount * PUMP_CONFIG.waterPerPlant.growth * ROCKWOOL_CHARACTERISTICS.waterRetention) +
    (stats.matureCount * PUMP_CONFIG.waterPerPlant.mature * ROCKWOOL_CHARACTERISTICS.waterRetention);
  
  let pumpTimePerCycle = Math.ceil(waterPerCycle / PUMP_CONFIG.flowRatePerSecond);
  
  if (irrigationConfig.mode === "manual") {
    pumpTimePerCycle = irrigationConfig.pumpTime;
  }
  
  pumpTimePerCycle = Math.max(PUMP_CONFIG.minCycleTime, Math.min(PUMP_CONFIG.maxCycleTime, pumpTimePerCycle));
  
  let baseIntervalDay, baseIntervalNight;
  if (stats.matureCount > 0) {
    baseIntervalDay = PUMP_CONFIG.baseIntervals.day.mature;
    baseIntervalNight = PUMP_CONFIG.baseIntervals.night.mature;
  } else if (stats.growthCount > 0) {
    baseIntervalDay = PUMP_CONFIG.baseIntervals.day.growth;
    baseIntervalNight = PUMP_CONFIG.baseIntervals.night.growth;
  } else {
    baseIntervalDay = PUMP_CONFIG.baseIntervals.day.seedling;
    baseIntervalNight = PUMP_CONFIG.baseIntervals.night.seedling;
  }
  
  const dayMultiplier = PUMP_CONFIG.seasonalAdjustments[season].dayMultiplier;
  const nightMultiplier = PUMP_CONFIG.seasonalAdjustments[season].nightMultiplier;
  
  const temp = parseFloat(irrigationConfig.temperature || 22);
  let tempFactor = 1.0;
  
  if (temp > 30) {
    tempFactor = 0.6;
  } else if (temp > 25) {
    tempFactor = 0.7;
  } else if (temp > 20) {
    tempFactor = 0.85;
  } else if (temp < 10) {
    tempFactor = 1.4;
  } else if (temp < 15) {
    tempFactor = 1.2;
  }
  
  let dayIntervalMinutes, nightIntervalMinutes;
  
  if (irrigationConfig.mode === "manual") {
    dayIntervalMinutes = irrigationConfig.interval;
    nightIntervalMinutes = Math.round(irrigationConfig.interval * 1.5);
  } else {
    dayIntervalMinutes = Math.round(baseIntervalDay * dayMultiplier * tempFactor);
    nightIntervalMinutes = Math.round(baseIntervalNight * nightMultiplier * tempFactor);
  }
  
  dayIntervalMinutes = Math.max(20, Math.min(120, dayIntervalMinutes));
  nightIntervalMinutes = Math.max(30, Math.min(240, nightIntervalMinutes));
  
  let dayStart, dayEnd, dayHours, nightHours;
  
  if (season === "summer") {
    dayStart = "06:00";
    dayEnd = "21:00";
    dayHours = 15;
  } else if (season === "winter") {
    dayStart = "08:00";
    dayEnd = "18:00";
    dayHours = 10;
  } else {
    dayStart = "07:00";
    dayEnd = "20:00";
    dayHours = 13;
  }
  
  nightHours = 24 - dayHours;
  
  const dayCycles = Math.floor((dayHours * 60) / dayIntervalMinutes);
  const nightCycles = Math.floor((nightHours * 60) / nightIntervalMinutes);
  const cyclesPerDay = dayCycles + nightCycles;
  
  const totalPumpTimePerDay = (pumpTimePerCycle * cyclesPerDay) / 60;
  const totalWaterPerDay = totalPumpTimePerDay * (PUMP_CONFIG.flowRate / 60);
  const energyConsumption = (totalPumpTimePerDay / 60) * PUMP_CONFIG.power;
  
  const rockwoolMoisture = Math.min(100, Math.round(
    (waterPerCycle / 
      (stats.seedlingCount * ROCKWOOL_CHARACTERISTICS.cubeSizes.seedling +
       (stats.growthCount + stats.matureCount) * ROCKWOOL_CHARACTERISTICS.cubeSizes.standard)
    ) * 100 * ROCKWOOL_CHARACTERISTICS.waterRetention
  ));
  
  return {
    pumpTimePerCycle,
    dayIntervalMinutes,
    nightIntervalMinutes,
    cyclesPerDay,
    dayCycles,
    nightCycles,
    isDaytime,
    season,
    dayStart,
    dayEnd,
    dayHours,
    nightHours,
    totalPumpTimePerDay: Math.round(totalPumpTimePerDay),
    totalWaterPerDay: Math.round(totalWaterPerDay * 10) / 10,
    energyConsumption: Math.round(energyConsumption * 10) / 10,
    waterPerCycle: Math.round(waterPerCycle * 1000),
    rockwoolMoisture,
    stats,
    recommendations: getCastellonRecommendations(stats, temp, dayIntervalMinutes, nightIntervalMinutes, isDaytime, season)
  };
};

const getCastellonRecommendations = (stats, temperature, dayInterval, nightInterval, isDaytime, season) => {
  const recs = [];
  
  recs.push({
    icon: "📍",
    text: `Ubicación: <strong>Castellón de la Plana</strong> - Clima Mediterráneo`
  });
  
  if (isDaytime) {
    recs.push({
      icon: "☀️",
      text: `Modo <strong>DÍA</strong> activo: Riegos cada ${dayInterval} minutos`
    });
  } else {
    recs.push({
      icon: "🌙",
      text: `Modo <strong>NOCHE</strong> activo: Riegos cada ${nightInterval} minutos`
    });
  }
  
  if (season === "summer") {
    recs.push({
      icon: "🔥",
      text: `Estación: <strong>VERANO</strong> - Máxima frecuencia de riego (+30% vs invierno)`
    });
    
    if (temperature > 28) {
      recs.push({
        icon: "⚠️",
        text: `¡Alerta calor! ${temperature}°C - Considera riego extra al atardecer`
      });
    }
  } else if (season === "winter") {
    recs.push({
      icon: "⛄",
      text: `Estación: <strong>INVIERNO</strong> - Reduce frecuencia (-20% vs verano)`
    });
  }
  
  if (stats.seedlingCount > 0) {
    recs.push({
      icon: "🌱",
      text: `Plántulas: En verano castellonense, protege del sol directo 12:00-16:00`
    });
  }
  
  recs.push({
    icon: "💧",
    text: `La lana de roca en Castellón se seca rápido en verano. Verifica humedad al tacto.`
  });
  
  return recs;
};

// ============================================================================
// FUNCIÓN PARA CALCULAR PROGRAMACIÓN DE TEMPORIZADOR
// ============================================================================

const calculateTimerProgram = (irrigationData, season) => {
  let dayStart, dayEnd;
  
  if (season === "summer") {
    dayStart = "06:00";
    dayEnd = "21:00";
  } else if (season === "winter") {
    dayStart = "08:00";
    dayEnd = "18:00";
  } else {
    dayStart = "07:00";
    dayEnd = "20:00";
  }
  
  const dayHours = parseInt(dayEnd.split(":")[0]) - parseInt(dayStart.split(":")[0]);
  const nightHours = 24 - dayHours;
  
  const dayProgram = {
    startTime: dayStart,
    endTime: dayEnd,
    interval: irrigationData.dayIntervalMinutes,
    pumpTime: irrigationData.pumpTimePerCycle,
    cycles: irrigationData.dayCycles,
    hours: dayHours
  };
  
  const nightProgram = {
    startTime: dayEnd,
    endTime: dayStart,
    interval: irrigationData.nightIntervalMinutes,
    pumpTime: irrigationData.pumpTimePerCycle,
    cycles: irrigationData.nightCycles,
    hours: nightHours
  };
  
  return { dayProgram, nightProgram, dayHours, nightHours };
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
  
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    pumpTime: 20,
    interval: 90,
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
      
      if (Math.abs(currentTargetEC - newTargetEC) > 100) {
        setConfig(prev => ({
          ...prev,
          targetEC: optimal.targetEC,
          targetPH: optimal.targetPH
        }));
      }
    }
  }, [plants, config.totalVol, config.waterType, step]);

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
    return calculateIrrigation(plants, irrigationConfig, new Date());
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

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      calendarDays.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: true,
        events: []
      });
    }

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

    const totalPlants = plants.length;
    const measureFrequency = totalPlants > 10 ? 2 : totalPlants > 5 ? 3 : 4;
    
    const lastRotDate = new Date(lastRot);
    const lastCleanDate = new Date(lastClean);

    calendarDays.forEach(day => {
      if (!day.isCurrentMonth) return;
      
      const dayDate = day.date;
      const diffTime = dayDate - now;
      const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
      
      if (diffDays < 0) return;

      if (diffDays % measureFrequency === 0) {
        day.events.push('measure');
      }

      const daysFromLastRot = Math.floor((dayDate - lastRotDate) / (1000 * 3600 * 24));
      if (daysFromLastRot > 0 && daysFromLastRot % 7 === 0) {
        day.events.push('rotation');
      }

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
    const tEc = parseFloat(config.targetEC) || 1400;
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

    if (ec < tEc - 400 && ec > 0) {
      const dosageNeeded = calculateCannaDosage(plants, vAct, tEc, waterType);
      const mlPerLiter = dosageNeeded.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.5;
      res.push({ 
        t: "¡FALTAN NUTRIENTES!", 
        v: `${Math.round(mlToAdd)}ml A+B`, 
        d: `EC ${ec} µS/cm (muy baja). Añadir CANNA Aqua Vega.`, 
        c: "bg-gradient-to-r from-blue-800 to-cyan-800 animate-pulse",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec < tEc - 200 && ec > 0) {
      const dosageNeeded = calculateCannaDosage(plants, vAct, tEc, waterType);
      const mlPerLiter = dosageNeeded.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.5;
      res.push({ 
        t: "AÑADIR NUTRIENTES", 
        v: `${Math.round(mlToAdd)}ml A+B`, 
        d: `Subir de ${ec} a ${tEc} µS/cm`, 
        c: "bg-gradient-to-r from-blue-600 to-cyan-600",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 2
      });
    } 
    else if (ec > tEc + 500) {
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        t: "¡EC PELIGROSAMENTE ALTA!", 
        v: `${water}L AGUA`, 
        d: `EC ${ec} µS/cm. Diluir URGENTE para salvar raíces.`, 
        c: "bg-gradient-to-r from-red-800 to-amber-900 animate-pulse shadow-lg shadow-amber-900/50",
        icon: <Skull className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec > tEc + 300) {
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        t: "DILUIR CON AGUA", 
        v: `${water}L`, 
        d: `EC ${ec} µS/cm > objetivo ${tEc} µS/cm. Añadir agua sola.`, 
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

    if (irrigationData.dayIntervalMinutes < 45 && plants.filter(p => p.l === 1).length > 0) {
      res.push({
        t: "¡CUIDADO CON PLÁNTULAS!",
        v: "Riego muy frecuente",
        d: "La lana de roca para plántulas puede encharcarse. Aumenta intervalo.",
        c: "bg-gradient-to-r from-cyan-600 to-blue-700",
        icon: <Droplets className="text-white" size={28} />,
        priority: 2
      });
    }

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

    if (config.temp > 30 && irrigationData.isDaytime) {
      res.push({
        t: "¡OLA DE CALOR!",
        v: `${config.temp}°C`,
        d: "Temperatura extrema en Castellón. Activar riego de emergencia.",
        c: "bg-gradient-to-r from-red-700 to-orange-700 animate-pulse",
        icon: <Sun className="text-white" size={28} />,
        priority: 1
      });
    }

    const horaActual = new Date().getHours();
    if (horaActual >= 12 && horaActual <= 18 && irrigationData.isDaytime) {
      res.push({
        t: "VIENTO PONIENTE",
        v: "¡Ojo!",
        d: "Horario de vientos secos en Castellón. Vigila humedad.",
        c: "bg-gradient-to-r from-yellow-600 to-amber-600",
        icon: <WindIcon className="text-white" size={28} />,
        priority: 2
      });
    }

    if (config.hasHeater) {
      res.push({
        t: "🔥 CALENTADOR ACTIVO",
        v: `${config.temp}°C estable`,
        d: "Temperatura controlada por calentador - ¡Perfecto para raíces!",
        c: "bg-gradient-to-r from-rose-600 to-pink-700",
        icon: <ThermometerSnowflake className="text-white" size={28} />,
        priority: 3
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

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-10 bg-white rounded-[3rem] text-center border-b-8 border-green-600 shadow-2xl">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
            <Droplets className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 uppercase text-slate-800">PASO 1: DEPÓSITO</h2>
          <p className="text-sm font-bold mb-6 text-slate-400">Capacidad TOTAL del sistema (Litros)</p>
          <input type="number" value={config.totalVol} 
            onChange={e => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})} 
            className="w-full p-6 bg-slate-50 border-4 rounded-3xl text-5xl font-black text-center text-slate-900 mb-6"
            placeholder="20"
          />
          <button onClick={() => setStep(1)} 
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-[2rem] font-black uppercase text-xl flex items-center justify-center gap-2 shadow-xl">
            Continuar <ArrowRight/>
          </button>
        </Card>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-lime-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl relative">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStep(0)} className="p-3 bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-500" />
            </button>
            <h2 className="text-2xl font-black text-center uppercase italic text-green-700">PASO 2: PLANTACIÓN</h2>
            <div className="w-10"></div>
          </div>
          <p className="text-center text-xs font-bold text-slate-400 mb-4">
            Selecciona las variedades en el NIVEL DE SIEMBRA (Nivel 1)
          </p>
          <div className="mb-8">
            <div className="bg-emerald-100 p-5 rounded-[2.5rem] grid grid-cols-5 gap-4 border-4 border-emerald-200 shadow-inner">
              {[1, 2, 3, 4, 5].map(p => {
                const pl = plants.find(x => x.l === 1 && x.p === p);
                return (
                  <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l: 1, p})} 
                    className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center border-4 relative transition-all ${pl ? `${VARIETIES[pl.v].color} border-white shadow-xl scale-110` : 'bg-white border-emerald-100 hover:bg-emerald-50'}`}>
                    {pl ? <Sprout size={28} className="text-white" /> : <Plus size={24} className="text-emerald-300" />}
                    {pl && <span className="text-[7px] font-black text-white absolute bottom-1 uppercase px-1 truncate w-full text-center leading-none">{pl.v}</span>}
                  </button>
                )
              })}
            </div>
            <p className="text-center text-[10px] font-bold text-slate-400 mt-4">
              {plants.filter(p => p.l === 1).length} / 5 plantas seleccionadas
            </p>
          </div>
          <button onClick={() => plants.length > 0 ? setStep(2) : alert("Selecciona al menos una planta")} 
            className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 text-white p-6 rounded-[2rem] font-black uppercase text-xl shadow-xl flex items-center justify-center gap-2">
            {plants.length > 0 ? `Ver Recomendaciones (${plants.length} plantas)` : "Selecciona Plantas"}
            <ArrowRight/>
          </button>
          {selPos && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
              <div className="bg-white w-full max-w-md mx-auto rounded-[2.5rem] p-8 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xl text-slate-800">Seleccionar Variedad</h3>
                  <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200">
                    <Plus size={24} className="rotate-45"/>
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
        </Card>
      </div>
    );
  }

  if (step === 2) {
    const optimalEC = calculateSystemEC(plants, parseFloat(config.totalVol), config.waterType);
    const dosage = calculateCannaDosage(plants, parseFloat(config.totalVol), optimalEC.targetEC, config.waterType);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStep(1)} className="p-3 bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-500" />
            </button>
            <h2 className="text-2xl font-black text-center uppercase italic text-teal-700">DOSIS PRECISAS</h2>
            <div className="w-10"></div>
          </div>
          
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700">
                  Agua: <span className="font-black">{WATER_TYPES[config.waterType].name}</span>
                </p>
                <p className="text-xs text-blue-600">EC base: {WATER_TYPES[config.waterType].ecBase} µS/cm | Dureza: {WATER_TYPES[config.waterType].hardness} ppm</p>
              </div>
              <button 
                onClick={() => setShowWaterSelector(true)}
                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200"
              >
                <Filter className="text-blue-600" size={20} />
              </button>
            </div>
          </div>
          
          <div className="space-y-6 mb-10">
            <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-slate-50 to-blue-50 border-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-100 rounded-2xl"><p className="text-[10px] font-black text-blue-700 uppercase">Plántulas</p><p className="text-2xl font-black">{optimalEC.statistics.seedlingCount}</p></div>
                <div className="p-3 bg-purple-100 rounded-2xl"><p className="text-[10px] font-black text-purple-700 uppercase">Crecimiento</p><p className="text-2xl font-black">{optimalEC.statistics.growthCount}</p></div>
                <div className="p-3 bg-green-100 rounded-2xl"><p className="text-[10px] font-black text-green-700 uppercase">Maduras</p><p className="text-2xl font-black">{optimalEC.statistics.matureCount}</p></div>
              </div>
            </Card>
            
            <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100">
              <div className="flex justify-between items-center">
                <div><p className="text-[10px] font-black uppercase text-slate-400 mb-1">EC ÓPTIMA CALCULADA</p>
                <p className="text-4xl font-black italic text-blue-700 leading-none">{optimalEC.targetEC} µS/cm</p>
                <p className="text-[9px] font-bold mt-1 text-slate-500">Ajustada para {WATER_TYPES[config.waterType].name.toLowerCase()}</p></div>
                <Activity className="text-blue-500" size={40} />
              </div>
            </Card>
            
            <Card className="p-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 shadow-lg">
              <div className="text-center mb-6"><div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full">
                <FlaskConical className="text-emerald-600" size={16} />
                <p className="text-xs font-black text-emerald-700 uppercase">CANNA Aqua Vega A+B</p></div>
                <p className="text-[10px] font-black text-slate-400 mt-2">Dosificación para {config.totalVol}L</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-[1.5rem] border-2 border-emerald-200">
                  <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Nutriente A</p>
                  <p className="text-3xl font-black text-emerald-700">{dosage.a} ml</p>
                  <p className="text-[8px] text-slate-500 mt-1">({dosage.per10L.a} ml/10L)</p>
                </div>
                <div className="text-center p-4 bg-white rounded-[1.5rem] border-2 border-blue-200">
                  <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Nutriente B</p>
                  <p className="text-3xl font-black text-blue-700">{dosage.b} ml</p>
                  <p className="text-[8px] text-slate-500 mt-1">({dosage.per10L.b} ml/10L)</p>
                </div>
              </div>
              <p className="text-center text-[10px] font-bold text-emerald-700">
                ✅ Incluye estabilizadores de pH
              </p>
              {dosage.note && (
                <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <p className="text-[10px] font-bold text-amber-700 text-center">
                    ⚠️ {dosage.note}
                  </p>
                </div>
              )}
            </Card>
          </div>
          
          <button onClick={() => {
            setConfig(prev => ({ ...prev, targetEC: optimalEC.targetEC, targetPH: optimalEC.targetPH }));
            setStep(3);
          }} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-[2rem] font-black uppercase text-xl shadow-xl">
            CONFIRMAR DOSIS E INICIAR
          </button>
        </Card>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStep(2)} className="p-3 bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-500" />
            </button>
            <h2 className="text-2xl font-black text-center uppercase italic text-orange-700">PASO 4: PRIMERA MEDICIÓN</h2>
            <div className="w-10"></div>
          </div>
          
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700">
                  Agua: <span className="font-black">{WATER_TYPES[config.waterType].name}</span>
                </p>
                <p className="text-xs text-blue-600">EC objetivo: {config.targetEC} µS/cm | pH objetivo: {config.targetPH}</p>
              </div>
              <button 
                onClick={() => setShowWaterSelector(true)}
                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200"
              >
                <Filter className="text-blue-600" size={20} />
              </button>
            </div>
          </div>
          
          <p className="text-center text-sm font-bold text-slate-400 mb-8">Introduce los valores actuales de tu sistema</p>
          
          <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH Medido</label>
                <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} 
                  className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" placeholder="6.0"/>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC Medida</label>
                <input type="number" step="100" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} 
                  className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black text-sm" placeholder="1200"/>
                <p className="text-[8px] text-slate-500 text-center mt-1">µS/cm</p>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Litros actuales en depósito</label>
                <input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} 
                  className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black text-cyan-800" placeholder={config.totalVol}/>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temperatura Agua °C</label>
                <input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} 
                  className="w-full p-5 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-3xl font-black text-orange-800" placeholder="22"/>
              </div>
            </div>
          </Card>
          
          <button onClick={() => {
            setHistory([{...config, id: Date.now(), d: new Date().toLocaleString(), note: "Medición inicial"}, ...history]);
            setStep(4);
            setTab("overview");
          }} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl">
            Registrar e Iniciar Sistema
          </button>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // INTERFAZ PRINCIPAL (PASO 4)
  // ============================================================================

  const calendarDays = generateCalendar();
  
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black italic text-green-700 leading-none uppercase">HydroCaru v5.0</h1>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic">CANNA Aqua Vega | Clima Mediterráneo | Riego Inteligente</p>
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
                      <span className="text-blue-600 font-bold">EC base: {water.ecBase} µS/cm</span>
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
            <TabsTrigger value="irrigation"><Droplets /></TabsTrigger>
            <TabsTrigger value="calendar"><Calendar /></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb /></TabsTrigger>
            <TabsTrigger value="settings"><Settings /></TabsTrigger>
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
                    <p className="text-xs text-blue-600">EC objetivo: {config.targetEC} µS/cm | pH objetivo: {config.targetPH}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH Medido</label>
                  <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC Medida</label>
                  <input type="number" step="100" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black text-sm" />
                  <p className="text-[8px] text-slate-500 text-center mt-1">µS/cm</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Litros actuales en depósito</label>
                  <input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black text-cyan-800" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temperatura Agua °C</label>
                  <input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} className="w-full p-5 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-3xl font-black text-orange-800" />
                </div>
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
                    <Badge variant="outline" className="border-2">{plants.filter(p => p.l === l).length}/5</Badge>
                </p>
                <div className="bg-slate-200/50 p-5 rounded-[2.5rem] grid grid-cols-5 gap-4 border-4 border-white shadow-inner">
                  {[1, 2, 3, 4, 5].map(p => {
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

          <TabsContent value="irrigation" className="space-y-6">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
                    <Droplets className="text-white" size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-blue-800">Control de Riego Inteligente</h2>
                    <p className="text-xs text-slate-500">Optimizado para <strong>Clima Mediterráneo - Castellón</strong></p>
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

              {/* INFO CLIMA CASTELLÓN */}
              <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Sun className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-orange-800 text-sm">Clima Mediterráneo - Castellón</h3>
                    <p className="text-xs text-orange-600">Ajustes automáticos día/noche y estacionales</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-xs font-black text-orange-700">Modo actual</p>
                    <p className="text-lg font-black text-orange-800">
                      {irrigationData.isDaytime ? '☀️ DÍA' : '🌙 NOCHE'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-xs font-black text-amber-700">Estación</p>
                    <p className="text-lg font-black text-amber-800">
                      {irrigationData.season === 'summer' ? 'Verano' : 
                       irrigationData.season === 'winter' ? 'Invierno' : 'Primavera/Otoño'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl col-span-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs font-black text-blue-700">Ciclos día</p>
                        <p className="text-xl font-black">{irrigationData.dayCycles}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-purple-700">Ciclos noche</p>
                        <p className="text-xl font-black">{irrigationData.nightCycles}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center mt-1">
                      Total: {irrigationData.cyclesPerDay} ciclos/24h
                    </p>
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

                    {/* INTERVALO ENTRE CICLOS (DÍA) */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-black text-amber-700">Intervalo DÍA</p>
                        <p className="text-2xl font-black text-amber-800">{irrigationData.dayIntervalMinutes} min</p>
                      </div>
                      <Slider
                        value={[irrigationConfig.interval]}
                        onValueChange={(value) => setIrrigationConfig(prev => ({ ...prev, interval: value[0] }))}
                        min={20}
                        max={120}
                        step={5}
                        disabled={irrigationConfig.mode === "auto"}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>20min (verano)</span>
                        <span>60min (óptimo)</span>
                        <span>120min (invierno)</span>
                      </div>
                    </div>

                    {/* INTERVALO ENTRE CICLOS (NOCHE) */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-black text-indigo-700">Intervalo NOCHE</p>
                        <p className="text-2xl font-black text-indigo-800">{irrigationData.nightIntervalMinutes} min</p>
                      </div>
                      <div className="w-full p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
                        <p className="text-xs font-bold text-indigo-700 mb-2">
                          💡 El intervalo de noche se calcula automáticamente como <strong>+50%</strong> del intervalo de día
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-indigo-600">Día</p>
                            <p className="text-xl font-black text-amber-700">{irrigationData.dayIntervalMinutes} min</p>
                          </div>
                          <ArrowRight className="text-indigo-400" />
                          <div className="text-center">
                            <p className="text-[10px] font-black text-indigo-600">Noche</p>
                            <p className="text-xl font-black text-indigo-700">{irrigationData.nightIntervalMinutes} min</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-indigo-600 mt-2 text-center">
                          {irrigationData.nightCycles} ciclos nocturnos / {irrigationData.nightHours}h
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* NUEVA SECCIÓN: PROGRAMACIÓN PARA TEMPORIZADOR */}
                <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200">
                  <h3 className="text-sm font-black text-purple-800 mb-4 flex items-center gap-2">
                    <Timer className="text-purple-600" size={16} />
                    PROGRAMACIÓN PARA TU TEMPORIZADOR
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border-2 border-amber-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sun className="text-amber-500" size={20} />
                          <span className="font-black text-amber-700">PROGRAMACIÓN DÍA</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          {irrigationData.dayStart} - {irrigationData.dayEnd}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="text-center p-3 bg-amber-50 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-amber-600">Frecuencia</p>
                          <p className="text-xl font-black text-amber-700">{irrigationData.dayIntervalMinutes} min</p>
                          <p className="text-[9px] text-amber-800">Cada {irrigationData.dayIntervalMinutes} minutos</p>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-amber-600">Duración</p>
                          <p className="text-xl font-black text-amber-700">{irrigationData.pumpTimePerCycle} s</p>
                          <p className="text-[9px] text-amber-800">{irrigationData.pumpTimePerCycle} segundos</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <p className="text-xs font-bold text-amber-800">
                          💡 <strong>En tu temporizador:</strong> Cada {irrigationData.dayIntervalMinutes} min → ON {irrigationData.pumpTimePerCycle} seg → OFF
                        </p>
                        <p className="text-[10px] text-amber-600 mt-1">
                          Total: {irrigationData.dayCycles} ciclos ({irrigationData.dayHours}h)
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl border-2 border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Moon className="text-blue-500" size={20} />
                          <span className="font-black text-blue-700">PROGRAMACIÓN NOCHE</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          {irrigationData.dayEnd} - {irrigationData.dayStart}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-blue-600">Frecuencia</p>
                          <p className="text-xl font-black text-blue-700">{irrigationData.nightIntervalMinutes} min</p>
                          <p className="text-[9px] text-blue-800">Cada {irrigationData.nightIntervalMinutes} minutos</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-blue-600">Duración</p>
                          <p className="text-xl font-black text-blue-700">{irrigationData.pumpTimePerCycle} s</p>
                          <p className="text-[9px] text-blue-800">{irrigationData.pumpTimePerCycle} segundos</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <p className="text-xs font-bold text-blue-800">
                          💡 <strong>En tu temporizador:</strong> Cada {irrigationData.nightIntervalMinutes} min → ON {irrigationData.pumpTimePerCycle} seg → OFF
                        </p>
                        <p className="text-[10px] text-blue-600 mt-1">
                          Total: {irrigationData.nightCycles} ciclos ({irrigationData.nightHours}h)
                        </p>
                      </div>
                    </div>
                    
                    {/* EJEMPLO PRÁCTICO */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-200">
                      <h4 className="text-xs font-black text-green-800 mb-2 flex items-center gap-2">
                        <Zap className="text-green-600" size={14} />
                        EJEMPLO PRÁCTICO PARA CASTELLÓN ({irrigationData.season}):
                      </h4>
                      <div className="text-xs text-green-700 space-y-1">
                        <p><strong>Día ({irrigationData.dayStart} - {irrigationData.dayEnd}):</strong> Programa 1: Cada {irrigationData.dayIntervalMinutes}min → ON {irrigationData.pumpTimePerCycle}s → OFF</p>
                        <p><strong>Noche ({irrigationData.dayEnd} - {irrigationData.dayStart}):</strong> Programa 2: Cada {irrigationData.nightIntervalMinutes}min → ON {irrigationData.pumpTimePerCycle}s → OFF</p>
                        <p className="text-[10px] text-green-600 mt-2">💡 <strong>Consejo:</strong> Usa 2 programas en tu temporizador o 1 programador inteligente con horarios.</p>
                      </div>
                    </div>
                    
                    {/* BOTÓN PARA COPIAR CONFIGURACIÓN */}
                    <button
                      onClick={() => {
                        const configText = `CONFIGURACIÓN RIEGO HYDROCARU:\n\n` +
                          `📍 Castellón de la Plana (${irrigationData.season})\n` +
                          `🔥 Calentador activo: Temperatura estable ${config.temp}°C\n\n` +
                          `🌞 DÍA (${irrigationData.dayStart}-${irrigationData.dayEnd}):\n` +
                          `• Frecuencia: Cada ${irrigationData.dayIntervalMinutes} minutos\n` +
                          `• Duración bomba: ${irrigationData.pumpTimePerCycle} segundos\n` +
                          `• Ciclos: ${irrigationData.dayCycles} veces\n\n` +
                          `🌙 NOCHE (${irrigationData.dayEnd}-${irrigationData.dayStart}):\n` +
                          `• Frecuencia: Cada ${irrigationData.nightIntervalMinutes} minutos\n` +
                          `• Duración bomba: ${irrigationData.pumpTimePerCycle} segundos\n` +
                          `• Ciclos: ${irrigationData.nightCycles} veces\n\n` +
                          `💧 Total agua/día: ${irrigationData.totalWaterPerDay}L\n` +
                          `⚡ Consumo/día: ${irrigationData.energyConsumption}Wh`;
                        
                        navigator.clipboard.writeText(configText);
                        alert("✅ Configuración copiada al portapapeles\n\nPégalo en tu programador o en una nota.");
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white p-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:shadow-xl transition-all"
                    >
                      <Clipboard className="text-white" size={18} />
                      COPIAR CONFIGURACIÓN PARA EL TEMPORIZADOR
                    </button>
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
                      <p className="text-[9px] text-slate-500">{irrigationData.dayCycles} día / {irrigationData.nightCycles} noche</p>
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

                {/* RECOMENDACIONES ESPECÍFICAS PARA CASTELLÓN */}
                <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-amber-50 to-orange-50 border-2">
                  <h3 className="text-sm font-black text-amber-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="text-amber-600" size={16} />
                    Recomendaciones para Castellón
                  </h3>
                  <div className="space-y-3">
                    {irrigationData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-xl">
                        <span className="text-xl">{rec.icon}</span>
                        <p className="text-sm text-slate-700 flex-1" dangerouslySetInnerHTML={{ __html: rec.text }}></p>
                      </div>
                    ))}
                    
                    {/* RECOMENDACIÓN GENERAL */}
                    <div className="p-3 bg-amber-100 rounded-xl border border-amber-200">
                      <p className="text-xs font-black text-amber-800">💡 CONSEJO CASTELLÓN:</p>
                      <p className="text-xs text-amber-700 mt-1">
                        <strong>Verano:</strong> Riega al amanecer y atardecer. <strong>Invierno:</strong> Riega al mediodía.
                        Evita los vientos de poniente (12:00-18:00) que secan mucho.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* BOTÓN DE SIMULACIÓN */}
                <button
                  onClick={() => {
                    const stats = irrigationData.stats;
                    const now = new Date();
                    const hour = now.getHours();
                    const isDay = hour >= 6 && hour < 21;
                    
                    alert(`🚰 SIMULACIÓN DE RIEGO PARA CASTELLÓN:\n\n• Modo: ${isDay ? '☀️ DÍA' : '🌙 NOCHE'}\n• Estación: ${irrigationData.season === 'summer' ? 'Verano' : irrigationData.season === 'winter' ? 'Invierno' : 'Primavera/Otoño'}\n• Calentador activo: ${config.temp}°C estable\n• Día: ${irrigationData.dayStart}-${irrigationData.dayEnd}\n• Noche: ${irrigationData.dayEnd}-${irrigationData.dayStart}\n• Bomba: ${irrigationData.pumpTimePerCycle}s cada ${isDay ? irrigationData.dayIntervalMinutes : irrigationData.nightIntervalMinutes}min\n• Agua utilizada: ${irrigationData.waterPerCycle} ml\n• Humedad estimada: ${irrigationData.rockwoolMoisture}%\n\n📊 BASADO EN:\n• ${stats.seedlingCount} plántulas\n• ${stats.growthCount} en crecimiento\n• ${stats.matureCount} maduras\n\n🌡️ Temperatura: ${config.temp}°C (estable)\n📍 Ubicación: Castellón de la Plana`);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-[2.5rem] font-black uppercase text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Simular Ciclo de Riego
                </button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-8 rounded-[3.5rem] bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-2xl relative overflow-hidden border-4 border-indigo-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black italic text-indigo-200 uppercase">Calendario Mensual</h3>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <Calendar size={16} />
                  <span className="text-[10px] font-black">
                    {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <div className="mb-6 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-900/50 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-300 uppercase">Mediciones</p>
                  <p className="text-xl font-black">{plants.length > 10 ? 'Cada 2 días' : plants.length > 5 ? 'Cada 3 días' : 'Cada 4 días'}</p>
                </div>
                <div className="p-3 bg-orange-900/50 rounded-2xl">
                  <p className="text-[10px] font-black text-orange-300 uppercase">Rotaciones</p>
                  <p className="text-xl font-black">Cada 7 días</p>
                </div>
                <div className="p-3 bg-red-900/50 rounded-2xl">
                  <p className="text-[10px] font-black text-red-300 uppercase">Limpieza</p>
                  <p className="text-xl font-black">Cada 14 días</p>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia, i) => (
                  <div key={i} className="text-center text-[10px] font-black text-indigo-300 uppercase">
                    {dia}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  let type = "normal";
                  if (day.events.includes('rotation') && day.events.includes('clean')) {
                    type = 'critical';
                  } else if (day.events.includes('clean')) {
                    type = 'clean';
                  } else if (day.events.includes('rotation')) {
                    type = 'rotation';
                  } else if (day.events.includes('measure')) {
                    type = 'measure';
                  }
                  
                  const isToday = day.date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={i}
                      className={`
                        relative rounded-xl p-2 text-center border-2 min-h-[3rem] flex flex-col items-center justify-center
                        ${type === 'critical'
                          ? 'bg-gradient-to-b from-red-600 to-rose-800 border-red-400 shadow-lg shadow-red-900/50 animate-pulse'
                          : type === 'clean'
                          ? 'bg-gradient-to-b from-red-700 to-red-900 border-red-500'
                          : type === 'rotation'
                          ? 'bg-gradient-to-b from-orange-600 to-amber-800 border-orange-400'
                          : type === 'measure'
                          ? 'bg-gradient-to-b from-blue-600 to-blue-800 border-blue-400'
                          : 'bg-white/5 border-transparent'
                        }
                        ${!day.isCurrentMonth ? 'opacity-30' : ''}
                      `}
                    >
                      <p className={`text-sm font-black ${
                        type === 'normal' && !day.isCurrentMonth
                          ? 'text-white/20'
                          : type === 'normal' && day.isCurrentMonth
                          ? 'text-white/60'
                          : 'text-white'
                      }`}>
                        {day.dayOfMonth}
                      </p>
                      
                      {isToday && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-950"></div>
                      )}
                      
                      {day.events.length > 0 && (
                        <div className="flex justify-center gap-1 mt-1">
                          {day.events.includes('measure') && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
                          {day.events.includes('rotation') && <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>}
                          {day.events.includes('clean') && <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[10px] font-black uppercase text-indigo-300 mb-3">LEYENDA DEL CALENDARIO</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-blue-600 to-blue-800 rounded"></div>
                    <span className="text-[9px] text-white/80">Medir parámetros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-orange-600 to-amber-800 rounded"></div>
                    <span className="text-[9px] text-white/80">Rotar niveles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-red-700 to-red-900 rounded"></div>
                    <span className="text-[9px] text-white/80">Limpieza depósito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-red-600 to-rose-800 rounded animate-pulse"></div>
                    <span className="text-[9px] text-white/80">Doble tarea</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-indigo-950"></div>
                    <span className="text-[9px] text-white/80">Hoy</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Últimos Registros</h4>
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="p-4 bg-white border-2 rounded-2xl flex justify-between items-center text-xs font-black italic">
                  <span className="text-slate-400">{h.d.split(',')[0]}</span>
                  <div className="flex gap-4 uppercase">
                    <span className="text-purple-600">pH {h.ph}</span>
                    <span className="text-blue-600">EC {h.ec} µS/cm</span>
                    <span className="text-orange-500">{h.temp}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic text-slate-800 ml-4">Consejos Maestros</h2>
            
            {/* SECCIÓN NUEVA: PROCESO DE PLÁNTULAS Y LANTA DE ROCA */}
            <Card className="rounded-[3rem] border-4 border-emerald-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white flex items-center gap-4">
                <Sprout size={30}/>
                <h3 className="font-black uppercase text-xs tracking-widest">🌱 PROCESO DE PLÁNTULAS Y LANTA DE ROCA</h3>
              </div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-6">
                
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-emerald-700">1. PREPARACIÓN DE DADOS DE LANA DE ROCA</h4>
                  <div className="bg-emerald-50 p-4 rounded-2xl border-l-4 border-emerald-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-emerald-500 font-black">•</span> <strong>pH inicial:</strong> Remojar dados en agua con pH 5.5 durante 24h antes de sembrar.</p>
                    <p className="flex items-start gap-2"><span className="text-emerald-500 font-black">•</span> <strong>EC inicial:</strong> Remojar en solución con EC 600-800 µS/cm (nutrientes muy diluidos).</p>
                    <p className="flex items-start gap-2"><span className="text-emerald-500 font-black">•</span> <strong>Exceso de agua:</strong> Escurrir bien hasta que no gotee. La lana debe estar húmeda, no encharcada.</p>
                    <p className="flex items-start gap-2"><span className="text-emerald-500 font-black">•</span> <strong>Hoyos de siembra:</strong> Hacer hoyo de 1cm de profundidad con lápiz estéril.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-blue-700">2. LIMPIEZA DE PLÁNTULAS</h4>
                  <div className="bg-blue-50 p-4 rounded-2xl border-l-4 border-blue-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> <strong>Raíces limpias:</strong> Enjuagar raíces con agua de ósmosis a 20-22°C antes de trasplantar.</p>
                    <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> <strong>Esterilización:</strong> Sumergir en solución de peróxido de hidrógeno al 3% (10ml por litro) durante 2 minutos.</p>
                    <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> <strong>Enjuague final:</strong> Enjuagar con agua de ósmosis con pH 5.8.</p>
                    <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> <strong>Herramientas:</strong> Usar pinzas estériles para manipular plántulas.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-purple-700">3. COLOCACIÓN EN DADOS</h4>
                  <div className="bg-purple-50 p-4 rounded-2xl border-l-4 border-purple-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-purple-500 font-black">•</span> <strong>Posición:</strong> Colocar plántula en el hoyo, cubrir ligeramente con fibras de lana.</p>
                    <p className="flex items-start gap-2"><span className="text-purple-500 font-black">•</span> <strong>Profundidad:</strong> Raíz principal a 1cm de profundidad, tallo completamente cubierto.</p>
                    <p className="flex items-start gap-2"><span className="text-purple-500 font-black">•</span> <strong>Compactación:</strong> No apretar demasiado, la lana debe estar aireada.</p>
                    <p className="flex items-start gap-2"><span className="text-purple-500 font-black">•</span> <strong>Primer riego:</strong> Regar con 20ml de solución nutritiva EC 800-900 µS/cm.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-amber-700">4. VALORES DE pH RECOMENDADOS</h4>
                  <div className="bg-amber-50 p-4 rounded-2xl border-l-4 border-amber-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Germinación:</strong> pH 5.5 - 5.8 (absorción óptima de nutrientes para semillas).</p>
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Plántula (días 1-7):</strong> pH 5.8 - 6.0 (equilibrio entre nitrógeno y microelementos).</p>
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Crecimiento (días 8-21):</strong> pH 6.0 - 6.2 (máxima absorción de nitrógeno y potasio).</p>
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Maduración:</strong> pH 6.0 - 6.3 (óptimo para calcio y fósforo).</p>
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>💡 Consejo:</strong> Mantén el pH entre 5.8-6.2 para todo el ciclo. CANNA Aqua Vega lo estabiliza automáticamente.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-200">
                  <p className="text-xs font-black text-green-800">📅 CRONOGRAMA DE PRIMEROS DÍAS:</p>
                  <p className="text-xs text-green-700 mt-2">
                    <strong>Día 1:</strong> Siembra en dados preparados • <strong>Día 2-3:</strong> Primeras raíces visibles • 
                    <strong> Día 4-5:</strong> Primer riego con nutrientes • <strong>Día 7:</strong> Trasplantar a torre
                  </p>
                </div>

              </div>
            </Card>
            
            <Card className="p-6 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="text-blue-600" />
                <h3 className="font-black text-blue-800 uppercase text-sm">Ajuste Rápido EC</h3>
              </div>
              <div className="text-[11px] font-bold text-slate-700 italic p-4 bg-white rounded-2xl">
                <p>• <span className="text-blue-700">EC baja:</span> Añade <strong>2 ml de CANNA A+B por cada 100 µS/cm</strong> que quieras subir, por cada 10L de agua.</p>
                <p>• <span className="text-blue-700">EC alta:</span> Añade <strong>1 L de agua pura</strong> por cada 300 µS/cm que quieras bajar, por cada 10L de solución.</p>
              </div>
            </Card>
            
            <Card className="rounded-[3rem] border-4 border-blue-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center gap-4">
                <Droplets size={30}/>
                <h3 className="font-black uppercase text-xs tracking-widest">💧 CANNA AQUA VEGA - AGUA BLANDA</h3>
              </div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-blue-700 uppercase font-black">Estabilizador de pH:</span> Este producto incluye buffers. Tras mezclar A y B, el pH se ajusta automáticamente a 5.8-6.2. Mídelo a las 2 horas y solo corrige si está fuera de 5.5-6.5.</p>
                <p>• <span className="text-blue-700 uppercase font-black">Dosis Escalonada:</span> Para tu sistema de 15 plantas (5-5-5), la app calcula un <strong>EC promedio de ~1300 µS/cm</strong>. Es seguro para plántulas y suficiente para adultas.</p>
                <p>• <span className="text-blue-700 uppercase font-black">Mezcla:</span> <strong>SIEMPRE</strong> añade primero el componente A al agua y mezcla bien, luego el componente B. Nunca los mezcles concentrados.</p>
                <p>• <span className="text-blue-700 uppercase font-black">Agua Dura:</span> Si tu agua tiene más de 150 ppm de dureza, considera cambiar a "Aqua Vega para Agua Dura". Esta versión está optimizado para menos de 50 ppm.</p>
              </div>
            </Card>
            
            <Card className="rounded-[3rem] border-4 border-emerald-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white flex items-center gap-4"><TreePine size={30}/><h3 className="font-black uppercase text-xs tracking-widest">🌿 SISTEMA ESCALONADO (5-5-5)</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-emerald-700 uppercase font-black">Cálculo del Promedio:</span> La app promedia las necesidades de EC de tus 15 plantas. 5 plántulas (EC 900 µS/cm) + 5 crecimiento (EC 1350 µS/cm) + 5 maduras (EC 1650 µS/cm) = <strong>EC objetivo del sistema: ~1300 µS/cm</strong>.</p>
                <p>• <span className="text-emerald-700 uppercase font-black">Rotación Semanal:</span> Cada 7 días cosecha 5, mueve 5 de crecimiento a maduración, 5 de plántula a crecimiento, y siembra 5 nuevas. El EC objetivo se recalcula automáticamente.</p>
                <p>• <span className="text-emerald-700 uppercase font-black">Ventaja:</span> Este promedio evita que las plántulas se quemen (si usaras EC 1600 µS/cm) y que las adultas se queden cortas (si usaras EC 900 µS/cm). Es el punto óptimo para todo el ciclo.</p>
              </div>
            </Card>

            <Card className="rounded-[3rem] border-4 border-orange-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white flex items-center gap-4">
                <Sun size={30}/>
                <h3 className="font-black uppercase text-xs tracking-widest">🏖️ GUÍA ESPECÍFICA PARA CASTELLÓN DE LA PLANA</h3>
              </div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-6">
                
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-orange-700">CLIMA MEDITERRÁNEO - CARACTERÍSTICAS</h4>
                  <div className="bg-orange-50 p-4 rounded-2xl border-l-4 border-orange-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-orange-500 font-black">•</span> <strong>Veranos calurosos y secos:</strong> Julio-Agosto hasta 35°C. <strong>Máxima frecuencia de riego</strong> (cada 45-60min día).</p>
                    <p className="flex items-start gap-2"><span className="text-orange-500 font-black">•</span> <strong>Inviernos suaves:</strong> Rara vez bajo 0°C. <strong>Reducir frecuencia</strong> (cada 90-120min día).</p>
                    <p className="flex items-start gap-2"><span className="text-orange-500 font-black">•</span> <strong>Vientos de poniente:</strong> Secos, de tarde. <strong>Aumentar riego +25%</strong> cuando soplan.</p>
                    <p className="flex items-start gap-2"><span className="text-orange-500 font-black">•</span> <strong>Brisa marina:</strong> Aporta humedad pero también salinidad. <strong>Enjuagar sustrato cada 15 días</strong>.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-amber-700">CALENDARIO ANUAL DE RIEGO EN CASTELLÓN</h4>
                  <div className="bg-amber-50 p-4 rounded-2xl border-l-4 border-amber-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Enero-Febrero (Invierno):</strong> 120min día / 180min noche. Riego al mediodía.</p>
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Marzo-Mayo (Primavera):</strong> 90min día / 150min noche. Ideal para crecimiento.</p>
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Junio-Agosto (Verano):</strong> 45-60min día / 90-120min noche. ¡Máxima atención! Riego al amanecer y atardecer.</p>
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Septiembre-Noviembre (Otoño):</strong> 75min día / 135min noche. Estable, reducir gradualmente.</p>
                    <p className="flex items-start gap-2"><span className="text-amber-500 font-black">•</span> <strong>Diciembre (Inicio invierno):</strong> 105min día / 165min noche. Preparar para frío.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-red-700">ALERTAS ESPECIALES PARA CASTELLÓN</h4>
                  <div className="bg-red-50 p-4 rounded-2xl border-l-4 border-red-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-red-500 font-black">•</span> <strong>Ola de calor (&gt;35°C):</strong> Activar <strong>riego de emergencia</strong> al anochecer.</p>
                    <p className="flex items-start gap-2"><span className="text-red-500 font-black">•</span> <strong>Viento de poniente (12:00-18:00):</strong> <strong>+25% frecuencia</strong> de riego.</p>
                    <p className="flex items-start gap-2"><span className="text-red-500 font-black">•</span> <strong>Lluvias persistentes:</strong> <strong>Suspender riego 24h</strong> tras lluvia.</p>
                    <p className="flex items-start gap-2"><span className="text-red-500 font-black">•</span> <strong>Humedad &gt;80% (invierno):</strong> <strong>Reducir -30% frecuencia</strong>.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-cyan-700">VENTAJA DEL CALENTADOR EN CASTELLÓN</h4>
                  <div className="bg-cyan-50 p-4 rounded-2xl border-l-4 border-cyan-300 space-y-2">
                    <p className="flex items-start gap-2"><span className="text-cyan-500 font-black">•</span> <strong>Temperatura estable:</strong> Con calentador, las raíces están siempre entre 20-22°C. <strong>+30% absorción de nutrientes</strong> vs sin calentar.</p>
                    <p className="flex items-start gap-2"><span className="text-cyan-500 font-black">•</span> <strong>Invierno:</strong> El calentador evita que baje de 18°C, manteniendo el metabolismo activo.</p>
                    <p className="flex items-start gap-2"><span className="text-cyan-500 font-black">•</span> <strong>Verano:</strong> En noches frescas, el calentador mantiene 22°C ideal para absorción nocturna.</p>
                    <p className="text-center text-[10px] font-black text-cyan-700 mt-3">🔥 <strong>Calentador activo:</strong> Mayor crecimiento, menos estrés, cosechas más tempranas.</p>
                  </div>
                </div>

              </div>
            </Card>

          </TabsContent>

          <TabsContent value="settings" className="space-y-6 py-10">
            <button onClick={() => { 
              setLastClean(new Date().toISOString()); 
              alert('✅ Limpieza registrada. El calendario se reiniciará.'); 
            }} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white p-8 rounded-[2.5rem] font-black border-4 border-violet-200 uppercase text-sm flex items-center justify-center gap-2 shadow-xl">
              <ShieldAlert className="text-white"/> Registrar Limpieza Completa Hoy
            </button>
            
            <button onClick={() => { 
              if(confirm('¿RESETEO COMPLETO?\n\nSe borrarán:\n• Todas las plantas\n• Historial de mediciones\n• Configuración\n\n¿Continuar?')) { 
                localStorage.clear(); 
                window.location.reload(); 
              }
            }} className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white p-10 rounded-[2.5rem] font-black border-4 border-red-200 uppercase text-sm shadow-xl hover:scale-[1.02] transition-all">
              RESETEO MAESTRO COMPLETO
            </button>
            
            <p className="text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest pt-10 leading-relaxed">
              HydroCaru Master v5.0 - CANNA Aqua Vega<br/>
              Sistema Inteligente para Clima Mediterráneo - Castellón de la Plana<br/>
              Torre 15 plantas (5-5-5) | EC en µS/cm
            </p>
          </TabsContent>
        </Tabs>
      </main>

      {selPos && step === 4 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[4rem] p-12 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black italic text-slate-400 uppercase text-sm">Seleccionar Variedad</h3>
                <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><Plus size={24} className="rotate-45"/></button>
            </div>
            <div className="grid gap-3">
              {Object.keys(VARIETIES).map(v => (
                <button key={v} onClick={() => {
                  const newPlant = {
                    id: generatePlantId(),
                    v, 
                    l: selPos.l, 
                    p: selPos.p
                  };
                  setPlants([...plants, newPlant]); 
                  setSelPos(null);
                }} className={`w-full p-7 rounded-[2.2rem] font-black text-white shadow-xl flex justify-between items-center hover:scale-105 active:scale-95 transition-all ${VARIETIES[v].color}`}>
                    <div className="text-left">
                        <span className="text-2xl uppercase italic tracking-tighter leading-none block">{v}</span>
                        <span className="text-[10px] opacity-80 lowercase font-medium">EC máx: {VARIETIES[v].ecMax} µS/cm</span>
                    </div>
                    <Zap size={24}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
