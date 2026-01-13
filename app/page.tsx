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
  TestTube, Waves, AlertOctagon, Battery, GitCompare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

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
    recommendation: "Usar nutrientes completos desde el inicio + CALMAG.",
    needsCalMag: true,
    alcalinidad: 0
  },
  "bajo_mineral": {
    name: "Baja Mineralización",
    icon: <Droplets className="text-cyan-500" />,
    ecBase: 200,
    hardness: 50,
    phBase: 7.2,
    description: "Agua blanda, ideal para CANNA Aqua Vega.",
    recommendation: "Ajuste mínimo de pH necesario.",
    needsCalMag: false,
    alcalinidad: 80
  },
  "medio_mineral": {
    name: "Media Mineralización",
    icon: <Droplets className="text-teal-500" />,
    ecBase: 400,
    hardness: 150,
    phBase: 7.5,
    description: "Agua de grifo típica Castellón.",
    recommendation: "Considerar pre-tratamiento para pH.",
    needsCalMag: false,
    alcalinidad: 150
  },
  "alta_mineral": {
    name: "Alta Mineralización",
    icon: <Droplets className="text-amber-500" />,
    ecBase: 800,
    hardness: 300,
    phBase: 8.0,
    description: "Agua dura, alta en calcio/magnesio.",
    recommendation: "No recomendada para Aqua Vega. Pre-tratamiento obligatorio.",
    needsCalMag: false,
    alcalinidad: 250
  },
  "mezcla_osmosis": {
    name: "Mezcla Ósmosis+Grifo",
    icon: <GitCompare className="text-indigo-500" />,
    ecBase: 200,
    hardness: 75,
    phBase: 7.1,
    description: "50% ósmosis + 50% grifo - Óptimo para Castellón.",
    recommendation: "Mejor estabilidad de pH, menos ajustes.",
    needsCalMag: true,
    alcalinidad: 75,
    mixRatio: { osmosis: 50, tap: 50 }
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
// SISTEMA DIAGNÓSTICO pH - CASTELLÓN ESPECÍFICO
// ============================================================================

const PH_DIAGNOSIS_CONFIG = {
  // Alcalinidad típica agua Castellón (ppm CaCO3)
  alcalinidadCastellon: {
    bajo_mineral: 80,
    medio_mineral: 150,
    alta_mineral: 250,
    osmosis: 0,
    mezcla_osmosis: 75
  },
  
  // Tasa de cambio de pH por alcalinidad (puntos pH/hora)
  phChangeRates: {
    baja: 0.02,      // <100 ppm
    moderada: 0.05,  // 100-150 ppm
    alta: 0.08,      // 150-200 ppm
    critica: 0.12    // >200 ppm
  },
  
  // Soluciones según problema
  solutions: {
    alcalinidad_alta: [
      "Cambiar a agua ósmosis o mezcla 50/50",
      "Pre-tratar agua: bajar a pH 4.0, airear 2 horas",
      "Usar ácido fosfórico 85% en lugar de pH- genérico",
      "Ajustar pH 2 veces/día (08:00 y 20:00)"
    ],
    falta_buffer: [
      "Añadir buffer de pH (CANNA Rhizotonic 10ml/10L)",
      "Mantener EC mínima 1000 µS/cm para capacidad buffer",
      "Añadir silicio (opcional, estabiliza pH)"
    ],
    efecto_dados: [
      "Remojar dados en pH 5.2 durante 24h antes de usar",
      "Enjuagar dados con agua nutriente antes de plantar",
      "Monitorizar pH más frecuentemente primeros 3 días"
    ]
  },
  
  // CalMag necesario según agua
  calmagRequirements: {
    osmosis: { mlPerLiter: 1.0, note: "Añadir siempre con agua ósmosis" },
    mezcla_osmosis: { mlPerLiter: 0.5, note: "Media dosis por mezcla 50/50" },
    bajo_mineral: { mlPerLiter: 0.2, note: "Solo si plantas muestran deficiencias" },
    medio_mineral: { mlPerLiter: 0, note: "No necesario" },
    alta_mineral: { mlPerLiter: 0, note: "Agua ya tiene exceso" }
  }
};

// ============================================================================
// CONFIGURACIÓN ESPECÍFICA PARA DADOS PEQUEÑOS DE LANA DE ROCA (2.5x2.5cm)
// ============================================================================

const ROCKWOOL_CHARACTERISTICS = {
  name: "Dados Grodan 2.5x2.5cm",
  size: "2.5x2.5cm",
  waterRetention: 0.85,
  drainageRate: 0.20,
  airPorosity: 0.35,
  phNeutral: 7.0,
  bufferCapacity: 0.1,
  
  // SATURACIÓN RÁPIDA
  saturationTime: {
    seedling: 8,
    growth: 10,
    mature: 12
  },
  
  // HUMEDAD ÓPTIMA
  saturationLevels: {
    optimal: 0.75,
    seedling: 0.65,
    growth: 0.75,
    mature: 0.80
  },
  
  // SECADO RÁPIDO
  dryingTimes: {
    seedling: { summer: 2.0, winter: 4.5, spring: 3.0 },
    growth: { summer: 1.5, winter: 3.5, spring: 2.5 },
    mature: { summer: 1.0, winter: 3.0, spring: 2.0 }
  },
  
  // FILOSOFÍA: Riegos CORTOS y FRECUENTES
  irrigationPrinciples: {
    cycleLength: 10,
    drainagePercentage: 0.15,
    drybackPeriod: 0.25
  },
  
  // PREPARACIÓN ESPECÍFICA PARA pH CASTELLÓN
  preparation: {
    phSoak: 5.2,      // Más bajo que lo normal para compensar alcalinidad
    ecSoak: 0.4,      // EC baja inicial
    soakTime: 24,
    rinse: true       // Enjuagar con agua nutriente antes de usar
  }
};

// CONFIGURACIÓN DE BOMBA
const PUMP_CONFIG = {
  power: 7,
  flowRate: 600,
  
  volumePerRiego: {
    seedling: 88,
    growth: 110,
    mature: 132
  },
  
  pumpTimes: {
    seedling: {
      summer: { day: 8, night: 12 },
      winter: { day: 10, night: 15 },
      spring: { day: 9, night: 14 }
    },
    growth: {
      summer: { day: 10, night: 15 },
      winter: { day: 12, night: 18 },
      spring: { day: 11, night: 16 }
    },
    mature: {
      summer: { day: 12, night: 18 },
      winter: { day: 15, night: 22 },
      spring: { day: 13, night: 20 }
    }
  },
  
  intervals: {
    seedling: {
      summer: { day: 40, night: 100 },
      winter: { day: 80, night: 160 },
      spring: { day: 55, night: 130 }
    },
    growth: {
      summer: { day: 30, night: 75 },
      winter: { day: 60, night: 120 },
      spring: { day: 42, night: 100 }
    },
    mature: {
      summer: { day: 20, night: 50 },
      winter: { day: 45, night: 90 },
      spring: { day: 30, night: 70 }
    }
  }
};

// ============================================================================
// FUNCIONES DIAGNÓSTICO pH AVANZADO
// ============================================================================

const diagnosePHProblem = (currentPH, previousPH, hoursBetween, waterType, temp, volume) => {
  const phChange = currentPH - previousPH;
  const phChangePerHour = phChange / hoursBetween;
  const alcalinidad = PH_DIAGNOSIS_CONFIG.alcalinidadCastellon[waterType] || 0;
  
  const diagnoses = [];
  const solutions = [];
  
  // Diagnóstico por tasa de cambio
  if (phChangePerHour > 0.08 && alcalinidad > 150) {
    diagnoses.push({
      level: "CRÍTICO",
      title: "¡ALTA ALCALINIDAD DETECTADA!",
      description: `pH subió ${phChange.toFixed(1)} puntos en ${hoursBetween}h. El agua tiene ${alcalinidad}ppm de bicarbonatos.`,
      color: "bg-gradient-to-r from-red-600 to-rose-700",
      icon: "⚠️",
      priority: 1
    });
    
    solutions.push(...PH_DIAGNOSIS_CONFIG.solutions.alcalinidad_alta);
    
    // Calcular pre-tratamiento necesario
    const acidForPretreatment = volume * 0.3; // 0.3ml/L para bajar a pH 4.0
    diagnoses.push({
      level: "SOLUCIÓN",
      title: "Pre-tratamiento recomendado",
      description: `Añadir ${acidForPretreatment.toFixed(1)}ml de pH- (ácido fosfórico 85%), airear 2h, luego añadir nutrientes.`,
      color: "bg-gradient-to-r from-blue-600 to-cyan-700",
      icon: "🛠️",
      priority: 3
    });
    
  } else if (phChangePerHour > 0.05) {
    diagnoses.push({
      level: "ALTO",
      title: "Alcalinidad moderada-alta",
      description: `pH sube ${phChange.toFixed(1)} puntos. Agua típica de Castellón necesita ajuste frecuente.`,
      color: "bg-gradient-to-r from-amber-500 to-orange-600",
      icon: "📈",
      priority: 2
    });
    
    solutions.push(...PH_DIAGNOSIS_CONFIG.solutions.alcalinidad_alta.slice(0, 2));
  }
  
  // Diagnóstico por falta de buffer
  if (phChangePerHour > 0.04 && currentPH > 6.8) {
    diagnoses.push({
      level: "BUFFER",
      title: "Falta capacidad buffer",
      description: "CANNA Aqua Vega no tiene suficiente buffer para esta alcalinidad.",
      color: "bg-gradient-to-r from-purple-600 to-pink-700",
      icon: "📊",
      priority: 2
    });
    
    solutions.push(...PH_DIAGNOSIS_CONFIG.solutions.falta_buffer);
  }
  
  // Diagnóstico por efecto dados
  if (hoursBetween > 12 && phChangePerHour > 0.03) {
    diagnoses.push({
      level: "DADOS",
      title: "Efecto lana de roca",
      description: "Los dados de 2.5cm tienen pH ~7.0 y liberan iones alcalinos.",
      color: "bg-gradient-to-r from-emerald-600 to-green-700",
      icon: "🧱",
      priority: 3
    });
    
    solutions.push(...PH_DIAGNOSIS_CONFIG.solutions.efecto_dados);
  }
  
  // Diagnóstico por temperatura
  if (temp > 25 && phChangePerHour > 0.04) {
    diagnoses.push({
      level: "TEMPERATURA",
      title: "Efecto verano Castellón",
      description: "Calor + evaporación aceleran subida de pH.",
      color: "bg-gradient-to-r from-orange-500 to-red-500",
      icon: "🔥",
      priority: 2
    });
    
    solutions.push("Añadir hielo en botella al depósito", "Cubrir depósito del sol");
  }
  
  return {
    diagnoses,
    solutions: [...new Set(solutions)], // Eliminar duplicados
    metrics: {
      phChange,
      phChangePerHour,
      alcalinidad,
      severity: phChangePerHour > 0.08 ? "CRÍTICA" : phChangePerHour > 0.05 ? "ALTA" : "MODERADA"
    }
  };
};

const calculateCalMagDosage = (waterType, volume, currentEC = 0) => {
  const requirements = PH_DIAGNOSIS_CONFIG.calmagRequirements[waterType];
  if (!requirements) return { needed: false, ml: 0, note: "Tipo de agua no reconocido" };
  
  const baseML = requirements.mlPerLiter * volume;
  
  // Ajustar según EC actual (si ya hay nutrientes, menos CalMag)
  let adjustedML = baseML;
  let note = requirements.note;
  
  if (currentEC > 1000) {
    adjustedML *= 0.7;
    note += " (reducido por EC alta)";
  }
  
  return {
    needed: requirements.mlPerLiter > 0,
    ml: Math.round(adjustedML * 10) / 10,
    note,
    baseML: Math.round(baseML * 10) / 10,
    per10L: Math.round((requirements.mlPerLiter * 10) * 10) / 10
  };
};

const calculatePHAdjustmentAdvanced = (currentPH, targetPH, waterType, volume, usePretreatment = false) => {
  const standardAdjustment = calculatePHAdjustment(currentPH, targetPH, waterType, volume);
  const alcalinidad = PH_DIAGNOSIS_CONFIG.alcalinidadCastellon[waterType] || 0;
  
  // Factor de corrección por alcalinidad
  let correctionFactor = 1.0;
  if (alcalinidad > 200) correctionFactor = 2.0;
  else if (alcalinidad > 150) correctionFactor = 1.5;
  else if (alcalinidad > 100) correctionFactor = 1.2;
  
  // Calcular ajuste corregido
  const adjustedML = {
    phMinus: (parseFloat(standardAdjustment.phMinus) * correctionFactor).toFixed(1),
    phPlus: (parseFloat(standardAdjustment.phPlus) * correctionFactor).toFixed(1)
  };
  
  // Pre-tratamiento recomendado para agua dura
  let pretreatment = null;
  if (usePretreatment && (waterType === "alta_mineral" || waterType === "medio_mineral")) {
    const acidForPretreatment = volume * 0.3; // 0.3ml/L para bajar a pH 4.0
    const finalAdjustment = calculatePHAdjustment(4.0, targetPH, waterType, volume);
    
    pretreatment = {
      needed: true,
      acidToPH4: acidForPretreatment.toFixed(1),
      finalAdjustment,
      totalAcid: (acidForPretreatment + parseFloat(finalAdjustment.phMinus || 0)).toFixed(1),
      steps: [
        `1. Añadir ${acidForPretreatment.toFixed(1)}ml de pH- (ácido fosfórico 85%)`,
        "2. Dejar burbujear con aireador 2-3 horas",
        "3. Los bicarbonatos se convierten en CO2 y escapan",
        "4. Añadir nutrientes CANNA",
        `5. Ajustar con ${finalAdjustment.phMinus || finalAdjustment.phPlus}ml más`
      ]
    };
  }
  
  return {
    standard: standardAdjustment,
    adjusted: adjustedML,
    pretreatment,
    correctionFactor,
    note: alcalinidad > 150 ? 
      `⚠️ Agua dura (${alcalinidad}ppm). Usar ${correctionFactor}x dosis.` :
      "Dosis estándar"
  };
};

const calculatePHMaintenanceSchedule = (waterType, season, phChangePerHour) => {
  const baseSchedule = {
    alta_mineral: { adjustmentsPerDay: 3, targetPH: 5.8 },
    medio_mineral: { adjustmentsPerDay: 2, targetPH: 5.9 },
    bajo_mineral: { adjustmentsPerDay: 1, targetPH: 6.0 },
    mezcla_osmosis: { adjustmentsPerDay: 1, targetPH: 6.0 },
    osmosis: { adjustmentsPerDay: 1, targetPH: 6.1 }
  };
  
  const schedule = baseSchedule[waterType] || { adjustmentsPerDay: 1, targetPH: 6.0 };
  
  // Ajustar por estación
  if (season === "summer") schedule.adjustmentsPerDay += 1;
  if (phChangePerHour > 0.06) schedule.adjustmentsPerDay += 1;
  
  // Generar horarios
  const hours = {
    1: ["12:00"],
    2: ["08:00", "20:00"],
    3: ["08:00", "14:00", "20:00"],
    4: ["06:00", "12:00", "18:00", "22:00"]
  };
  
  return {
    ...schedule,
    times: hours[schedule.adjustmentsPerDay] || hours[2],
    recommendation: schedule.adjustmentsPerDay > 2 ? 
      "Considera cambiar a agua ósmosis o mezcla" : 
      "Horario adecuado"
  };
};

// ============================================================================
// FUNCIONES DE CÁLCULO PARA DADOS PEQUEÑOS
// ============================================================================

const getSeason = (currentTime = new Date()) => {
  const month = currentTime.getMonth() + 1;
  if (month >= 6 && month <= 9) return "summer";
  if (month >= 12 || month <= 2) return "winter";
  return "spring";
};

const calculateRockwoolMoisture = (plants, irrigationConfig, currentTime = new Date()) => {
  const stats = calculateSystemEC(plants, 20, "bajo_mineral").statistics;
  const season = getSeason(currentTime);
  const hour = currentTime.getHours();
  const isDaytime = hour >= 6 && hour < 21;
  
  let baseMoisture = 0;
  if (stats.matureCount > 0) {
    baseMoisture = ROCKWOOL_CHARACTERISTICS.saturationLevels.mature * 100;
  } else if (stats.growthCount > 0) {
    baseMoisture = ROCKWOOL_CHARACTERISTICS.saturationLevels.growth * 100;
  } else {
    baseMoisture = ROCKWOOL_CHARACTERISTICS.saturationLevels.seedling * 100;
  }
  
  const temp = parseFloat(irrigationConfig.temperature || 22);
  let tempAdjustment = 1.0;
  if (temp > 32) tempAdjustment = 0.5;
  else if (temp > 30) tempAdjustment = 0.6;
  else if (temp > 28) tempAdjustment = 0.7;
  else if (temp > 25) tempAdjustment = 0.8;
  else if (temp > 22) tempAdjustment = 0.9;
  else if (temp < 15) tempAdjustment = 1.3;
  else if (temp < 10) tempAdjustment = 1.5;
  
  let humidityAdjustment = 1.0;
  if (season === "summer") humidityAdjustment = 0.85;
  else if (season === "winter") humidityAdjustment = 1.15;
  
  let windAdjustment = 1.0;
  if (hour >= 12 && hour <= 20 && season === "summer") {
    windAdjustment = 0.7;
  }
  
  let timeAdjustment = 1.0;
  if (isDaytime) {
    timeAdjustment = 0.9;
  } else {
    timeAdjustment = 1.1;
  }
  
  const finalMoisture = Math.min(85, Math.max(40, 
    baseMoisture * tempAdjustment * humidityAdjustment * windAdjustment * timeAdjustment
  ));
  
  return Math.round(finalMoisture);
};

const calculateIrrigationForRockwool = (plants, irrigationConfig, currentTime = new Date()) => {
  const stats = calculateSystemEC(plants, 20, "bajo_mineral").statistics;
  const season = getSeason(currentTime);
  const hour = currentTime.getHours();
  const isDaytime = hour >= 6 && hour < 21;
  
  let dominantStage = "seedling";
  if (stats.matureCount >= stats.growthCount && stats.matureCount >= stats.seedlingCount) {
    dominantStage = "mature";
  } else if (stats.growthCount >= stats.seedlingCount) {
    dominantStage = "growth";
  }
  
  let pumpTime, interval;
  
  if (dominantStage === "seedling") {
    pumpTime = PUMP_CONFIG.pumpTimes.seedling[season][isDaytime ? "day" : "night"];
    interval = PUMP_CONFIG.intervals.seedling[season][isDaytime ? "day" : "night"];
  } else if (dominantStage === "growth") {
    pumpTime = PUMP_CONFIG.pumpTimes.growth[season][isDaytime ? "day" : "night"];
    interval = PUMP_CONFIG.intervals.growth[season][isDaytime ? "day" : "night"];
  } else {
    pumpTime = PUMP_CONFIG.pumpTimes.mature[season][isDaytime ? "day" : "night"];
    interval = PUMP_CONFIG.intervals.mature[season][isDaytime ? "day" : "night"];
  }
  
  if (irrigationConfig.mode === "manual") {
    pumpTime = irrigationConfig.pumpTime;
    interval = irrigationConfig.interval;
  }
  
  const temp = parseFloat(irrigationConfig.temperature || 22);
  
  if (temp > 32) {
    interval = Math.max(15, interval * 0.5);
  } else if (temp > 30) {
    interval = Math.max(18, interval * 0.6);
  } else if (temp > 28) {
    interval = Math.max(20, interval * 0.7);
  } else if (temp > 25) {
    interval = Math.max(25, interval * 0.8);
  } else if (temp < 10) {
    interval = interval * 1.5;
  } else if (temp < 15) {
    interval = interval * 1.3;
  }
  
  if (hour >= 12 && hour <= 20 && season === "summer") {
    interval = Math.max(15, interval * 0.7);
  }
  
  if (season === "winter") {
    interval = interval * 1.2;
  }
  
  const dayHours = season === "summer" ? 15 : season === "winter" ? 10 : 13;
  const nightHours = 24 - dayHours;
  
  const dayCycles = Math.floor((dayHours * 60) / 
    (dominantStage === "seedling" ? PUMP_CONFIG.intervals.seedling[season].day : 
     dominantStage === "growth" ? PUMP_CONFIG.intervals.growth[season].day : 
     PUMP_CONFIG.intervals.mature[season].day));
  
  const nightCycles = Math.floor((nightHours * 60) / 
    (dominantStage === "seedling" ? PUMP_CONFIG.intervals.seedling[season].night : 
     dominantStage === "growth" ? PUMP_CONFIG.intervals.growth[season].night : 
     PUMP_CONFIG.intervals.mature[season].night));
  
  const cyclesPerDay = dayCycles + nightCycles;
  
  let waterPerCycle = 0;
  plants.forEach(plant => {
    if (plant.l === 1) waterPerCycle += PUMP_CONFIG.volumePerRiego.seedling;
    else if (plant.l === 2) waterPerCycle += PUMP_CONFIG.volumePerRiego.growth;
    else waterPerCycle += PUMP_CONFIG.volumePerRiego.mature;
  });
  
  const totalWaterPerDay = Math.round((waterPerCycle * cyclesPerDay) / 1000);
  const energyConsumption = Math.round((pumpTime * cyclesPerDay / 3600) * PUMP_CONFIG.power * 100) / 100;
  
  const rockwoolMoisture = calculateRockwoolMoisture(plants, irrigationConfig, currentTime);
  
  const stageTimes = {
    seedling: {
      pumpTime: PUMP_CONFIG.pumpTimes.seedling[season][isDaytime ? "day" : "night"],
      interval: PUMP_CONFIG.intervals.seedling[season][isDaytime ? "day" : "night"]
    },
    growth: {
      pumpTime: PUMP_CONFIG.pumpTimes.growth[season][isDaytime ? "day" : "night"],
      interval: PUMP_CONFIG.intervals.growth[season][isDaytime ? "day" : "night"]
    },
    mature: {
      pumpTime: PUMP_CONFIG.pumpTimes.mature[season][isDaytime ? "day" : "night"],
      interval: PUMP_CONFIG.intervals.mature[season][isDaytime ? "day" : "night"]
    }
  };
  
  return {
    pumpTime,
    interval,
    cyclesPerDay,
    dayCycles,
    nightCycles,
    isDaytime,
    season,
    dayStart: "06:00",
    dayEnd: "21:00",
    dayHours,
    nightHours,
    totalWaterPerDay,
    energyConsumption,
    waterPerCycle: Math.round(waterPerCycle),
    rockwoolMoisture,
    dominantStage,
    stats,
    stageTimes,
    recommendations: getRockwoolRecommendations(stats, temp, interval, pumpTime, isDaytime, season, hour)
  };
};

const getRockwoolRecommendations = (stats, temperature, interval, pumpTime, isDaytime, season, hour) => {
  const recs = [];
  
  recs.push({
    icon: "🎯",
    text: `Sistema: <strong>Dados pequeños 2.5x2.5cm</strong> - Riegos CORTOS (${pumpTime}s) y FRECUENTES`
  });
  
  if (isDaytime) {
    recs.push({
      icon: "☀️",
      text: `Modo <strong>DÍA</strong>: Riego cada ${Math.round(interval)} minutos (${Math.round(60/interval)}x/hora)`
    });
  } else {
    recs.push({
      icon: "🌙",
      text: `Modo <strong>NOCHE</strong>: Riego cada ${Math.round(interval)} minutos`
    });
  }
  
  if (season === "summer") {
    recs.push({
      icon: "🔥",
      text: `<strong>VERANO Castellón</strong>: Máxima atención al riego`
    });
    
    if (temperature > 30) {
      recs.push({
        icon: "⚠️",
        text: `¡OLA DE CALOR! ${temperature}°C → Aumentar frecuencia +50%`
      });
    }
    
    if (hour >= 12 && hour <= 20) {
      recs.push({
        icon: "💨",
        text: `<strong>Viento PONIENTE activo</strong> (12:00-20:00) → +30% frecuencia`
      });
    }
  } else if (season === "winter") {
    recs.push({
      icon: "⛄",
      text: `<strong>INVIERNO</strong>: Riegos más espaciados, al mediodía`
    });
  }
  
  if (stats.seedlingCount > 0) {
    recs.push({
      icon: "🌱",
      text: `Nivel 1 (Plántulas): <strong>8-10 segundos</strong> → 40-80min intervalo`
    });
  }
  
  if (stats.growthCount > 0) {
    recs.push({
      icon: "🌿",
      text: `Nivel 2 (Crecimiento): <strong>10-12 segundos</strong> → 30-60min intervalo`
    });
  }
  
  if (stats.matureCount > 0) {
    recs.push({
      icon: "🥬",
      text: `Nivel 3 (Maduras): <strong>12-15 segundos</strong> → 20-45min intervalo`
    });
  }
  
  return recs;
};

const getRockwoolSchedule = (plants, season) => {
  const stats = calculateSystemEC(plants, 20, "bajo_mineral").statistics;
  
  let dominantStage = "seedling";
  if (stats.matureCount >= stats.growthCount && stats.matureCount >= stats.seedlingCount) {
    dominantStage = "mature";
  } else if (stats.growthCount >= stats.seedlingCount) {
    dominantStage = "growth";
  }
  
  return {
    seedling: PUMP_CONFIG.intervals.seedling[season],
    growth: PUMP_CONFIG.intervals.growth[season],
    mature: PUMP_CONFIG.intervals.mature[season],
    current: dominantStage,
    pumpTimes: {
      seedling: PUMP_CONFIG.pumpTimes.seedling[season],
      growth: PUMP_CONFIG.pumpTimes.growth[season],
      mature: PUMP_CONFIG.pumpTimes.mature[season]
    }
  };
};

// ============================================================================
// FUNCIONES DE CÁLCULO RESTANTES (ACTUALIZADAS)
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

const generateCalendar = (plants, lastRot, lastClean) => {
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

// ============================================================================
// COMPONENTE PRINCIPAL CON SISTEMA DIAGNÓSTICO pH COMPLETO
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
  
  // Configuración del sistema (ACTUALIZADA)
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20", 
    ph: "6.0", 
    ec: "1200",
    temp: "22", 
    targetEC: "1400",
    targetPH: "6.0",
    waterType: "medio_mineral", // Cambiado a medio_mineral por defecto (Castellón)
    hasHeater: true,
    // Nuevos campos para diagnóstico pH
    usePretreatment: false,
    useCalMag: false,
    lastPH: "6.0", // Para calcular tasa de cambio
    lastPHTime: new Date().toISOString()
  });
  
  // Configuración de riego
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    pumpTime: 10,
    interval: 30,
    temperature: "22",
    showAdvanced: false
  });

  // Historial de pH para diagnóstico
  const [phHistory, setPhHistory] = useState([
    {
      timestamp: new Date(Date.now() - 16 * 3600000).toISOString(), // 16 horas atrás
      ph: 6.0,
      ec: 1200,
      temp: 22,
      waterType: "medio_mineral"
    },
    {
      timestamp: new Date().toISOString(),
      ph: 7.2,
      ec: 1200,
      temp: 25,
      waterType: "medio_mineral"
    }
  ]);

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
        setPhHistory(data.phHistory || phHistory);
        
        if (data.plants && data.plants.length > 0) {
          setStep(4);
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
            irrigationConfig,
            phHistory
          }));
      } catch (error) {
        console.error("Error guardando:", error);
      }
    }
  }, [plants, config, history, lastRot, lastClean, irrigationConfig, phHistory, step]);

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

  const toggleTip = (tipId) => {
    setExpandedTips(prev => ({
      ...prev,
      [tipId]: !prev[tipId]
    }));
  };

  // =================== FUNCIONES DIAGNÓSTICO pH ===================

  const updatePHMeasurement = (newPH) => {
    const now = new Date();
    const previousPH = parseFloat(config.ph);
    
    // Actualizar config
    setConfig(prev => ({
      ...prev,
      ph: newPH.toString(),
      lastPH: prev.ph,
      lastPHTime: now.toISOString()
    }));
    
    // Añadir al historial de pH
    const newRecord = {
      timestamp: now.toISOString(),
      ph: parseFloat(newPH),
      ec: parseFloat(config.ec),
      temp: parseFloat(config.temp),
      waterType: config.waterType
    };
    
    setPhHistory(prev => [newRecord, ...prev.slice(0, 10)]); // Mantener últimas 10 mediciones
  };

  const getCurrentPHDiagnosis = () => {
    if (phHistory.length < 2) return null;
    
    const latest = phHistory[0];
    const previous = phHistory[1];
    const hoursDiff = (new Date(latest.timestamp) - new Date(previous.timestamp)) / (1000 * 3600);
    
    return diagnosePHProblem(
      latest.ph,
      previous.ph,
      hoursDiff,
      config.waterType,
      latest.temp,
      parseFloat(config.currentVol)
    );
  };

  const getPHMaintenanceSchedule = () => {
    const diagnosis = getCurrentPHDiagnosis();
    const phChangePerHour = diagnosis?.metrics?.phChangePerHour || 0;
    
    return calculatePHMaintenanceSchedule(
      config.waterType,
      getSeason(),
      phChangePerHour
    );
  };

  const getCalMagRecommendation = () => {
    return calculateCalMagDosage(
      config.waterType,
      parseFloat(config.currentVol),
      parseFloat(config.ec)
    );
  };

  const getPHAdjustmentAdvanced = () => {
    return calculatePHAdjustmentAdvanced(
      parseFloat(config.ph),
      parseFloat(config.targetPH),
      config.waterType,
      parseFloat(config.currentVol),
      config.usePretreatment
    );
  };

  // =================== CÁLCULO DE RIEGO ===================

  const irrigationData = useMemo(() => {
    return calculateIrrigationForRockwool(plants, irrigationConfig, new Date());
  }, [plants, irrigationConfig]);

  const rockwoolSchedule = useMemo(() => {
    return getRockwoolSchedule(plants, irrigationData.season);
  }, [plants, irrigationData.season]);

  // =================== CÁLCULO DE CALENDARIO ===================

  const calendarDays = useMemo(() => {
    return generateCalendar(plants, lastRot, lastClean);
  }, [plants, lastRot, lastClean]);

  // =================== CÁLCULO DE ALERTAS (ACTUALIZADO) ===================

  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1400;
    const tPh = parseFloat(config.targetPH) || 6.0;
    const temp = parseFloat(config.temp) || 20;
    const waterType = config.waterType || "medio_mineral";
    const res = [];

    // 1. Alerta por tipo de agua incompatible
    if (waterType === "alta_mineral") {
      res.push({ 
        title: "¡AGUA MUY DURA DETECTADA!", 
        value: "250ppm bicarbonatos",
        description: "pH subirá 1.0+ puntos cada 24h. Cambia a ósmosis o mezcla.",
        color: "bg-gradient-to-r from-red-700 to-rose-800 animate-pulse",
        icon: <AlertOctagon className="text-white" size={28} />,
        priority: 1
      });
    }

    // 2. Diagnóstico de pH automático
    const phDiagnosis = getCurrentPHDiagnosis();
    if (phDiagnosis && phDiagnosis.metrics.phChangePerHour > 0.06) {
      const severity = phDiagnosis.metrics.severity;
      res.push({
        title: `pH INESTABLE (${severity})`,
        value: `+${phDiagnosis.metrics.phChange.toFixed(1)} en ${Math.round(phDiagnosis.metrics.phChangePerHour * 24)}h`,
        description: `Agua de Castellón: ${phDiagnosis.metrics.alcalinidad}ppm bicarbonatos`,
        color: severity === "CRÍTICA" ? "bg-gradient-to-r from-red-600 to-orange-700" :
               severity === "ALTA" ? "bg-gradient-to-r from-amber-600 to-orange-600" :
               "bg-gradient-to-r from-yellow-600 to-amber-600",
        icon: <Waves className="text-white" size={28} />,
        priority: severity === "CRÍTICA" ? 1 : 2
      });
    }

    // 3. CalMag necesario
    const calmag = getCalMagRecommendation();
    if (calmag.needed && !config.useCalMag) {
      res.push({
        title: "¡FALTA CALMAG!",
        value: `${calmag.ml}ml necesario`,
        description: `Agua ${WATER_TYPES[waterType].name} necesita suplemento de Calcio+Magnesio`,
        color: "bg-gradient-to-r from-cyan-700 to-blue-800",
        icon: <Battery className="text-white" size={28} />,
        priority: 2
      });
    }

    // 4. Alertas estándar (mantenidas)
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
      const phAdjustment = getPHAdjustmentAdvanced();
      const action = ph > tPh ? "pH-" : "pH+";
      const ml = ph > tPh ? phAdjustment.adjusted.phMinus : phAdjustment.adjusted.phPlus;
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
      const phAdjustment = getPHAdjustmentAdvanced();
      const action = ph > tPh ? "pH-" : "pH+";
      const ml = ph > tPh ? phAdjustment.adjusted.phMinus : phAdjustment.adjusted.phPlus;
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

    // Alertas específicas para dados pequeños
    if (irrigationData.rockwoolMoisture > 80) {
      res.push({
        title: "¡DADO DEMASIADO HÚMEDO!",
        value: `${irrigationData.rockwoolMoisture}% humedad`,
        description: "Riesgo de asfixia radicular en dados pequeños. Aumentar intervalo.",
        color: "bg-gradient-to-r from-blue-700 to-cyan-800",
        icon: <Droplets className="text-white" size={28} />,
        priority: 1
      });
    }
    
    if (irrigationData.rockwoolMoisture < 50) {
      res.push({
        title: "DADO DEMASIADO SECO",
        value: `${irrigationData.rockwoolMoisture}% humedad`,
        description: "Dados pequeños secan rápido. Reducir intervalo entre riegos.",
        color: "bg-gradient-to-r from-amber-600 to-orange-700",
        icon: <Cloud className="text-white" size={28} />,
        priority: 2
      });
    }

    // Alerta específica para viento poniente
    const horaActual = new Date().getHours();
    if (horaActual >= 12 && horaActual <= 20 && irrigationData.season === "summer") {
      res.push({
        title: "VIENTO PONIENTE ACTIVO",
        value: "Aumentar frecuencia",
        description: "Vientos secos de tarde en Castellón. Aumenta frecuencia de riego 30%.",
        color: "bg-gradient-to-r from-yellow-600 to-amber-700",
        icon: <Breeze className="text-white" size={28} />,
        priority: 2
      });
    }

    if (config.hasHeater) {
      res.push({
        title: "🔥 CALENTADOR ACTIVO",
        value: `${config.temp}°C estable`,
        description: "Temperatura controlada por calentador - Ideal para raíces en dados pequeños",
        color: "bg-gradient-to-r from-rose-600 to-pink-700",
        icon: <ThermometerSnowflake className="text-white" size={28} />,
        priority: 3
      });
    }

    return res.sort((a, b) => a.priority - b.priority);
  }, [config, lastClean, plants, irrigationData, phHistory]);

  // =================== FLUJO DE CONFIGURACIÓN ===================

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center animate-pulse-slow">
                  <Sprout size={64} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                  <Droplets size={32} className="text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center">
                  <FlaskConical size={32} className="text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              HydroMaster CANNA
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg mx-auto">
              Sistema experto para cultivo hidropónico con <span className="font-bold text-blue-600">CANNA Aqua Vega</span> y <span className="font-bold text-emerald-600">lana de roca Grodan</span>
            </p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Sprout className="text-emerald-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Específico para lechugas</h3>
                  <p className="text-sm text-slate-600">Variedades Iceberg, Lollo Rosso, Maravilla, Trocadero</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Droplets className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Dados de lana de roca 2.5x2.5cm</h3>
                  <p className="text-sm text-slate-600">Riego optimizado para tamaño pequeño</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FlaskConical className="text-purple-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">CANNA Aqua Vega + pH inteligente</h3>
                  <p className="text-sm text-slate-600">Diagnóstico automático de problemas pH Castellón</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep(1)}
              className="px-8 py-6 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg"
            >
              Comenzar Configuración
              <ChevronRight className="ml-2" />
            </Button>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">Paso 1: Configuración Básica</h2>
              <p className="text-slate-600">Define las características de tu sistema</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Droplets className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Volumen del Sistema</h3>
                    <p className="text-sm text-slate-600">Capacidad total del depósito</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Volumen Total (Litros)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={config.totalVol}
                      onChange={(e) => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>10L</span>
                      <span className="font-bold text-blue-600">{config.totalVol}L</span>
                      <span>50L</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Agua Actual en Depósito
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={config.totalVol}
                      step="1"
                      value={config.currentVol}
                      onChange={(e) => setConfig({...config, currentVol: e.target.value})}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>0L</span>
                      <span className="font-bold text-blue-600">{config.currentVol}L</span>
                      <span>{config.totalVol}L</span>
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={(config.currentVol / config.totalVol) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Thermometer className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Condiciones Actuales</h3>
                    <p className="text-sm text-slate-600">Temperatura del agua</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Temperatura del Agua (°C)
                    </label>
                    <div className="flex items-center gap-4">
                      <ThermometerCold className="text-blue-500" />
                      <input
                        type="range"
                        min="10"
                        max="35"
                        step="0.5"
                        value={config.temp}
                        onChange={(e) => setConfig({...config, temp: e.target.value})}
                        className="w-full h-2 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-lg appearance-none cursor-pointer"
                      />
                      <ThermometerSun className="text-red-500" />
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>10°C</span>
                      <span className={`font-bold ${
                        parseFloat(config.temp) > 28 ? 'text-red-600' : 
                        parseFloat(config.temp) < 18 ? 'text-blue-600' : 
                        'text-green-600'
                      }`}>
                        {config.temp}°C
                      </span>
                      <span>35°C</span>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Estado:</span>
                        <span className={`font-bold ${
                          parseFloat(config.temp) > 28 ? 'text-red-600' : 
                          parseFloat(config.temp) < 18 ? 'text-blue-600' : 
                          'text-green-600'
                        }`}>
                          {parseFloat(config.temp) > 28 ? '¡PELIGRO! Muy caliente' :
                           parseFloat(config.temp) > 25 ? 'Alerta: Caliente' :
                           parseFloat(config.temp) < 18 ? 'Muy frío' :
                           'Óptimo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasHeater"
                      checked={config.hasHeater}
                      onChange={(e) => setConfig({...config, hasHeater: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="hasHeater" className="text-slate-700">
                      Tengo calentador de acuario en el depósito
                    </label>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 rounded-2xl md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Filter className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Tipo de Agua - CASTELLÓN ESPECIAL</h3>
                    <p className="text-sm text-slate-600">Selecciona según tu fuente de agua</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(WATER_TYPES).map(([key, water]) => (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        config.waterType === key 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setConfig({...config, waterType: key})}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {water.icon}
                        <span className="font-bold text-slate-800">{water.name}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{water.description}</p>
                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Alcalinidad:</span>
                          <span className="font-medium">{PH_DIAGNOSIS_CONFIG.alcalinidadCastellon[key]} ppm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CalMag:</span>
                          <span className="font-medium">
                            {PH_DIAGNOSIS_CONFIG.calmagRequirements[key].mlPerLiter > 0 ? 
                              `${PH_DIAGNOSIS_CONFIG.calmagRequirements[key].mlPerLiter}ml/L` : 
                              'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Mostrar recomendación específica */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-blue-800 mb-2">
                        {WATER_TYPES[config.waterType].recommendation}
                      </p>
                      {config.waterType === "osmosis" && (
                        <p className="text-sm text-blue-700">
                          <strong>IMPORTANTE:</strong> Agua ósmosis necesita CALMAG. Añade {calculateCalMagDosage(config.waterType, 20).per10L}ml por cada 10L.
                        </p>
                      )}
                      {config.waterType === "mezcla_osmosis" && (
                        <p className="text-sm text-blue-700">
                          <strong>RECOMENDADO:</strong> Mezcla 50% ósmosis + 50% grifo. Menos ajustes de pH, más estable.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Opciones avanzadas según tipo de agua */}
                {(config.waterType === "alta_mineral" || config.waterType === "medio_mineral") && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="text-amber-600" size={20} />
                      <h4 className="font-bold text-amber-700">AVISO PARA AGUA DE CASTELLÓN</h4>
                    </div>
                    <p className="text-sm text-amber-800 mb-3">
                      El agua de Castellón tiene alta alcalinidad (150-250ppm bicarbonatos). 
                      El pH subirá 0.8-1.2 puntos cada 24h aunque uses CANNA Aqua Vega.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="usePretreatment"
                        checked={config.usePretreatment}
                        onChange={(e) => setConfig({...config, usePretreatment: e.target.checked})}
                        className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="usePretreatment" className="text-amber-800">
                        <strong>Activar pre-tratamiento de agua:</strong> Bajar a pH 4.0 y airear antes de añadir nutrientes
                      </label>
                    </div>
                  </div>
                )}
                
                {config.waterType === "osmosis" && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Battery className="text-cyan-600" size={20} />
                      <h4 className="font-bold text-cyan-700">CALMAG NECESARIO</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="useCalMag"
                        checked={config.useCalMag}
                        onChange={(e) => setConfig({...config, useCalMag: e.target.checked})}
                        className="w-5 h-5 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <label htmlFor="useCalMag" className="text-cyan-800">
                        <strong>Añadir CALMAG a la solución:</strong> Agua ósmosis necesita Calcio y Magnesio suplementario
                      </label>
                    </div>
                    {config.useCalMag && (
                      <p className="text-sm text-cyan-700 mt-2">
                        Dosificación: {calculateCalMagDosage(config.waterType, parseFloat(config.currentVol)).ml}ml para {config.currentVol}L
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => setStep(0)}
                variant="outline"
                className="px-6 py-3 rounded-xl"
              >
                <ArrowLeft className="mr-2" size={18} />
                Atrás
              </Button>
              
              <Button 
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
              >
                Continuar
                <ChevronRight className="ml-2" />
              </Button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">Paso 2: Mediciones Actuales</h2>
              <p className="text-slate-600">Introduce los valores medidos de tu sistema</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Activity className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">pH del Agua</h3>
                    <p className="text-sm text-slate-600">Rango ideal: 5.5 - 6.5</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">
                        Valor de pH: <span className="font-bold text-purple-600">{config.ph}</span>
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newPH = prompt("Introduce el nuevo valor de pH:", config.ph);
                          if (newPH && !isNaN(parseFloat(newPH))) {
                            updatePHMeasurement(newPH);
                          }
                        }}
                      >
                        Actualizar
                      </Button>
                    </div>
                    
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.1"
                      value={config.ph}
                      onChange={(e) => updatePHMeasurement(e.target.value)}
                      className="w-full h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-lg appearance-none cursor-pointer"
                    />
                    
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>4.0</span>
                      <span className="font-bold text-green-600">5.5-6.5</span>
                      <span>9.0</span>
                    </div>
                    
                    {/* Diagnóstico de pH en tiempo real */}
                    {phHistory.length >= 2 && (
                      <div className="mt-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Cambio últimas 24h:</span>
                            <span className={`font-bold ${
                              phHistory[0].ph - phHistory[1].ph > 0.8 ? 'text-red-600' :
                              phHistory[0].ph - phHistory[1].ph > 0.4 ? 'text-amber-600' :
                              'text-green-600'
                            }`}>
                              +{(phHistory[0].ph - phHistory[1].ph).toFixed(1)} puntos
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="text-purple-600" size={18} />
                      <h4 className="font-bold text-purple-700">IMPORTANTE para Castellón</h4>
                    </div>
                    <p className="text-sm text-slate-700">
                      En Castellón, el pH puede subir 1.0+ puntos en 24h por los bicarbonatos del agua. 
                      Es NORMAL que necesites ajustar 2-3 veces al día.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Conductividad Eléctrica (EC)</h3>
                    <p className="text-sm text-slate-600">Nivel de nutrientes en µS/cm</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">
                        Valor de EC: <span className="font-bold text-blue-600">{config.ec} µS/cm</span>
                      </label>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        parseFloat(config.ec) >= 800 && parseFloat(config.ec) <= 1800 
                          ? 'bg-green-100 text-green-800' 
                          : parseFloat(config.ec) > 1800 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {parseFloat(config.ec) > 1800 ? 'DEMASIADO ALTA' : 
                         parseFloat(config.ec) < 800 ? 'DEMASIADO BAJA' : 'ADEQUADA'}
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="3000"
                      step="50"
                      value={config.ec}
                      onChange={(e) => setConfig({...config, ec: e.target.value})}
                      className="w-full h-2 bg-gradient-to-r from-blue-300 via-green-300 to-red-300 rounded-lg appearance-none cursor-pointer"
                    />
                    
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>0</span>
                      <span className="font-bold text-green-600">800-1800</span>
                      <span>3000</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="text-blue-600" size={18} />
                      <h4 className="font-bold text-blue-700">EC según agua Castellón</h4>
                    </div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Agua ósmosis:</span>
                        <span className="font-medium">EC medida = EC real</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agua grifo ({WATER_TYPES[config.waterType].ecBase}µS):</span>
                        <span className="font-medium">EC real = EC medida - {WATER_TYPES[config.waterType].ecBase}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 rounded-2xl md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Target className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Objetivos del Sistema</h3>
                    <p className="text-sm text-slate-600">Define los valores objetivo</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      EC Objetivo (µS/cm)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="800"
                        max="1900"
                        step="100"
                        value={config.targetEC}
                        onChange={(e) => setConfig({...config, targetEC: e.target.value})}
                        className="w-full h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>800</span>
                      <span className="font-bold text-blue-600">{config.targetEC} µS/cm</span>
                      <span>1900</span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Ajusta según tu agua: Con ósmosis EC real = medida. Con grifo EC real = medida - {WATER_TYPES[config.waterType].ecBase}.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      pH Objetivo (Castellón especial)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="5.5"
                        max="6.5"
                        step="0.1"
                        value={config.targetPH}
                        onChange={(e) => setConfig({...config, targetPH: e.target.value})}
                        className="w-full h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>5.5</span>
                      <span className="font-bold text-purple-600">{config.targetPH}</span>
                      <span>6.5</span>
                    </div>
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">
                        Para Castellón: Ajusta a <strong>pH 5.8</strong> por la mañana. 
                        Subirá a ~6.2 por la tarde. Mejor que ajustar constantemente a 6.0.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
                className="px-6 py-3 rounded-xl"
              >
                <ArrowLeft className="mr-2" size={18} />
                Atrás
              </Button>
              
              <Button 
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
              >
                Continuar a Plantación
                <ChevronRight className="ml-2" />
              </Button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">Paso 3: Configurar Torre</h2>
              <p className="text-slate-600">Añade plantas a tu sistema hidropónico</p>
            </div>
            
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TreePine className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Sistema Escalonado 5-5-5</h3>
                  <p className="text-sm text-slate-600">15 plantas en 3 niveles de desarrollo</p>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-b from-cyan-50 to-white rounded-xl border-2 border-cyan-200">
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sprout className="text-cyan-600" size={24} />
                    </div>
                    <h4 className="font-bold text-cyan-700 mb-1">Nivel 1</h4>
                    <p className="text-sm text-cyan-600">Plántulas</p>
                    <p className="text-2xl font-bold text-cyan-800 mt-2">
                      {plants.filter(p => p.l === 1).length}/5
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="text-green-600" size={24} />
                    </div>
                    <h4 className="font-bold text-green-700 mb-1">Nivel 2</h4>
                    <p className="text-sm text-green-600">Crecimiento</p>
                    <p className="text-2xl font-bold text-green-800 mt-2">
                      {plants.filter(p => p.l === 2).length}/5
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-b from-emerald-50 to-white rounded-xl border-2 border-emerald-200">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Leaf className="text-emerald-600" size={24} />
                    </div>
                    <h4 className="font-bold text-emerald-700 mb-1">Nivel 3</h4>
                    <p className="text-sm text-emerald-600">Maduración</p>
                    <p className="text-2xl font-bold text-emerald-800 mt-2">
                      {plants.filter(p => p.l === 3).length}/5
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 mb-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-amber-800">
                        Sistema 5-5-5: Siempre tendrás plantas en todas las etapas. Cada semana rotas niveles y cosechas 5 lechugas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800">Añadir Nueva Planta</h4>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {plants.length}/15 plantas
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nivel
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSelPos(prev => ({...prev, l: level}))}
                            className={`flex-1 py-3 rounded-lg text-center font-medium transition-all ${
                              selPos?.l === level 
                                ? level === 1 ? 'bg-cyan-500 text-white' :
                                  level === 2 ? 'bg-green-500 text-white' :
                                  'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Nivel {level}
                            <div className="text-xs opacity-80">
                              {level === 1 ? 'Plántula' : level === 2 ? 'Crecimiento' : 'Madura'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Variedad
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(VARIETIES).map(variety => (
                          <button
                            key={variety}
                            type="button"
                            onClick={() => setSelPos(prev => ({...prev, v: variety}))}
                            className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                              selPos?.v === variety 
                                ? `${VARIETIES[variety].color} text-white`
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {variety}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Posición en Torre
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({length: 15}, (_, i) => i + 1).map(pos => {
                          const ocupada = plants.find(p => p.p === pos);
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => !ocupada && setSelPos(prev => ({...prev, p: pos}))}
                              className={`aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${
                                ocupada 
                                  ? 'bg-red-100 text-red-700'
                                  : selPos?.p === pos
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              disabled={ocupada}
                              title={ocupada ? `Ocupada por ${ocupada.v}` : `Posición ${pos}`}
                            >
                              {ocupada ? '✗' : pos}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      if (selPos?.l && selPos?.v && selPos?.p) {
                        setPlants([...plants, {
                          id: generatePlantId(),
                          l: selPos.l,
                          v: selPos.v,
                          p: selPos.p,
                          date: new Date().toISOString()
                        }]);
                        setSelPos(null);
                      }
                    }}
                    disabled={!(selPos?.l && selPos?.v && selPos?.p)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
                  >
                    <Plus className="mr-2" />
                    Añadir Planta a la Torre
                  </Button>
                </div>
                
                {plants.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-4">Plantas Actuales</h4>
                    <div className="space-y-3">
                      {plants.map(plant => (
                        <div key={plant.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-slate-200'}`}>
                              <span className="text-white font-bold">{plant.p}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">{plant.v}</span>
                                <Badge className={
                                  plant.l === 1 ? 'bg-cyan-100 text-cyan-700' :
                                  plant.l === 2 ? 'bg-green-100 text-green-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }>
                                  Nivel {plant.l}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600">
                                {plant.l === 1 ? 'Plántula' : plant.l === 2 ? 'Crecimiento' : 'Maduración'}
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(plant.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => setStep(2)}
                variant="outline"
                className="px-6 py-3 rounded-xl"
              >
                <ArrowLeft className="mr-2" size={18} />
                Atrás
              </Button>
              
              <Button 
                onClick={() => {
                  setStep(4);
                  setTab("dashboard");
                }}
                disabled={plants.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl disabled:opacity-50"
              >
                Completar Configuración
                <ChevronRight className="ml-2" />
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // =================== COMPONENTE DE CONSEJOS ===================

  const TipsSection = () => (
    <div className="mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Sistema Inteligente pH - CASTELLÓN</h2>
      
      {/* Explicación científica del problema pH */}
      <Card className="rounded-3xl border-2 border-red-100 overflow-hidden shadow-lg bg-white">
        <div 
          className="p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between cursor-pointer"
          onClick={() => toggleTip('ph_ciencia')}
        >
          <div className="flex items-center gap-3">
            <TestTube size={24} />
            <h3 className="font-bold">CIENCIA: ¿Por qué sube el pH en Castellón?</h3>
          </div>
          {expandedTips.ph_ciencia ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expandedTips.ph_ciencia && (
          <div className="p-6 text-sm text-slate-700 space-y-4">
            <div className="space-y-3">
              <h4 className="font-bold text-red-700">🧪 LA QUÍMICA REAL EN TU DEPÓSITO:</h4>
              
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <h5 className="font-bold text-red-700 mb-2">AGUA DE CASTELLÓN CONTIENE:</h5>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Bicarbonato de Calcio</strong> - Ca(HCO₃)₂ (150-250 ppm)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Bicarbonato de Magnesio</strong> - Mg(HCO₃)₂</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Estos son ANTI-ÁCIDOS naturales</strong> que neutralizan el pH-</span>
                  </li>
                </ul>
              </div>
              
              <h5 className="font-bold text-red-700 mt-4">⏱️ CRONOLOGÍA DEL DESASTRE:</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <p className="font-semibold">Hora 0: Ajustas pH a 6.0</p>
                    <p className="text-xs text-slate-600">Añades pH-, todo parece bien</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-amber-600">2</span>
                  </div>
                  <div>
                    <p className="font-semibold">Hora 4: Reacción química comienza</p>
                    <p className="text-xs text-slate-600">HCO₃⁻ + H⁺ → H₂O + CO₂↑</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-red-600">3</span>
                  </div>
                  <div>
                    <p className="font-semibold">Hora 16: El ácido se ha consumido</p>
                    <p className="text-xs text-slate-600">pH vuelve a 7.2 (agua natural)</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <h5 className="font-bold text-blue-700">🎯 EL ERROR COMÚN:</h5>
                <p className="text-sm text-blue-800 mt-2">
                  Pensar que CANNA Aqua Vega tiene "estabilizador de pH mágico". 
                  <strong> Solo compensa 0.2-0.3 puntos</strong>, no 1.2 puntos como en Castellón.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Soluciones prácticas */}
      <Card className="rounded-3xl border-2 border-emerald-100 overflow-hidden shadow-lg bg-white">
        <div 
          className="p-5 bg-gradient-to-r from-emerald-600 to-green-700 text-white flex items-center justify-between cursor-pointer"
          onClick={() => toggleTip('soluciones_ph')}
        >
          <div className="flex items-center gap-3">
            <Waves size={24} />
            <h3 className="font-bold">SOLUCIONES PRÁCTICAS para tu sistema</h3>
          </div>
          {expandedTips.soluciones_ph ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expandedTips.soluciones_ph && (
          <div className="p-6 text-sm text-slate-700 space-y-6">
            {/* Solución 1: Ósmosis */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="text-cyan-600" size={24} />
                <h4 className="font-bold text-cyan-700 text-lg">SOLUCIÓN 1: ÓSMOSIS INVERSA (90% efectivo)</h4>
              </div>
              
              <div className="bg-cyan-50 p-4 rounded-xl border-l-4 border-cyan-300">
                <h5 className="font-bold text-cyan-700 mb-2">¿CÓMO IMPLEMENTAR?</h5>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>Inversión:</strong> Ósmosis doméstica (60-80€)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>Mezcla recomendada:</strong> 50% ósmosis + 50% grifo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>Resultado:</strong> pH estable 48-72 horas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>CALMAG necesario:</strong> Sí, 0.5ml/L con mezcla 50/50</span>
                  </li>
                </ul>
                
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-sm font-bold text-cyan-800 text-center">
                    💎 COSTE/BENEFICIO: 60€ inversión → Ahorras 2h/semana ajustando pH
                  </p>
                </div>
              </div>
            </div>

            {/* Solución 2:
