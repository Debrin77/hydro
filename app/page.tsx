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
  Clipboard, ThermometerSnowflake, TreePine, Settings,
  Home, BarChart3, X, RotateCcw, AlertCircle,
  Droplet, Leaf, TimerReset,
  ChevronDown, ChevronUp, Eye, EyeOff,
  Target, Brain, AlertOctagon, GitCompare, BarChart,
  History
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
    recommendation: "Usar nutrientes completos desde el inicio.",
    calmagRequired: true
  },
  "bajo_mineral": {
    name: "Baja Mineralización",
    icon: <Droplets className="text-cyan-500" />,
    ecBase: 200,
    hardness: 50,
    phBase: 7.2,
    description: "Agua blanda, ideal para CANNA Aqua Vega.",
    recommendation: "Ajuste mínimo de pH necesario.",
    calmagRequired: false
  },
  "medio_mineral": {
    name: "Media Mineralización",
    icon: <Droplets className="text-teal-500" />,
    ecBase: 400,
    hardness: 150,
    phBase: 7.5,
    description: "Agua de grifo típica.",
    recommendation: "Considerar dureza al mezclar.",
    calmagRequired: false
  },
  "alta_mineral": {
    name: "Alta Mineralización",
    icon: <Droplets className="text-amber-500" />,
    ecBase: 800,
    hardness: 300,
    phBase: 8.0,
    description: "Agua dura, alta en calcio/magnesio.",
    recommendation: "No recomendada para Aqua Vega de agua blanda.",
    calmagRequired: false
  }
};

const CALMAG_CONFIG = {
  minRequiredHardness: 100,
  dosagePerLiter: 1.0,
  calciumPercent: 5.0,
  magnesiumPercent: 1.5,
  maxDosage: 5,
};

const HARD_WATER_PRETREATMENT = {
  phDownForHardWater: 1.5,
  preAdjustmentPH: 5.0,
  waitingTime: 30,
  recommendations: [
    "Usar ácido fosfórico en lugar de ácido nítrico para agua dura",
    "Pre-tratar el agua 30 minutos antes de añadir nutrientes",
    "Considerar mezclar con agua de ósmosis para reducir dureza"
  ]
};

const VARIETIES = {
  "Iceberg": { 
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    textColor: "text-cyan-700",
    icon: <Sprout className="text-white" size={16} />,
    iconSelected: <Check className="text-white" size={16} />,
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
    icon: <Activity className="text-white" size={16} />,
    iconSelected: <Check className="text-white" size={16} />,
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
    icon: <Leaf className="text-white" size={16} />,
    iconSelected: <Check className="text-white" size={16} />,
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
    icon: <Sprout className="text-white" size={16} />,
    iconSelected: <Check className="text-white" size={16} />,
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
    icon: <Leaf className="text-white" size={16} />,
    iconSelected: <Check className="text-white" size={16} />,
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

const ROCKWOOL_CHARACTERISTICS = {
  name: "Dados Grodan 2.5x2.5cm",
  size: "2.5x2.5cm",
  waterRetention: 0.85,
  drainageRate: 0.20,
  airPorosity: 0.35,
  phNeutral: 7.0,
  bufferCapacity: 0.1,
  saturationTime: {
    seedling: 8,
    growth: 10,
    mature: 12
  },
  saturationLevels: {
    optimal: 0.75,
    seedling: 0.65,
    growth: 0.75,
    mature: 0.80
  },
  dryingTimes: {
    seedling: { summer: 2.0, winter: 4.5, spring: 3.0 },
    growth: { summer: 1.5, winter: 3.5, spring: 2.5 },
    mature: { summer: 1.0, winter: 3.0, spring: 2.0 }
  },
  volumePerDado: 15,
  preparation: {
    phSoak: 5.5,
    ecSoak: 0.6,
    soakTime: 24
  }
};

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
  },
  schedule: {
    summer: {
      dayStart: "06:00",
      dayEnd: "21:00",
      avoidHours: ["12:00", "13:00", "14:00", "15:00"],
      bestHours: ["06:00-10:00", "18:00-21:00"]
    },
    winter: {
      dayStart: "08:00",
      dayEnd: "18:00",
      bestHours: ["11:00", "12:00", "13:00", "14:00"]
    },
    spring: {
      dayStart: "07:00",
      dayEnd: "20:00",
      bestHours: ["07:00-10:00", "16:00-19:00"]
    }
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

const getWaterCharacteristics = (waterType, osmosisMix = 0) => {
  const baseWater = WATER_TYPES[waterType] || WATER_TYPES.bajo_mineral;
  const osmosisWater = WATER_TYPES.osmosis;
  
  if (waterType === "osmosis" || osmosisMix === 0) {
    return {
      ...baseWater,
      finalHardness: baseWater.hardness,
      finalECBase: baseWater.ecBase,
      finalPhBase: baseWater.phBase,
      calmagRequired: baseWater.calmagRequired
    };
  }
  
  const mixRatio = osmosisMix / 100;
  const finalHardness = baseWater.hardness * (1 - mixRatio);
  const finalECBase = baseWater.ecBase * (1 - mixRatio);
  const finalPhBase = baseWater.phBase * (1 - mixRatio) + osmosisWater.phBase * mixRatio;
  
  const calmagRequired = finalHardness < CALMAG_CONFIG.minRequiredHardness;
  
  return {
    ...baseWater,
    finalHardness,
    finalECBase,
    finalPhBase,
    calmagRequired
  };
};

const calculateCalMagNeeded = (waterType, osmosisMix, volume) => {
  const waterChar = getWaterCharacteristics(waterType, osmosisMix);
  
  if (!waterChar.calmagRequired) {
    return {
      required: false,
      dosage: 0,
      reason: "El agua tiene suficiente dureza (calcio/magnesio)"
    };
  }
  
  const hardnessDeficit = CALMAG_CONFIG.minRequiredHardness - waterChar.finalHardness;
  const dosagePerLiter = CALMAG_CONFIG.dosagePerLiter * (hardnessDeficit / CALMAG_CONFIG.minRequiredHardness);
  const totalDosage = Math.min(dosagePerLiter * volume, CALMAG_CONFIG.maxDosage * volume);
  
  return {
    required: true,
    dosage: Math.round(totalDosage * 10) / 10,
    reason: `Agua muy blanda (${Math.round(waterChar.finalHardness)} ppm). Necesario para prevenir deficiencias.`,
    instructions: "Añadir CalMag ANTES de los nutrientes principales. Mezclar bien."
  };
};

const diagnosePHProblem = (currentPH, targetPH, waterType, osmosisMix, phHistory = [], temperature) => {
  const waterChar = getWaterCharacteristics(waterType, osmosisMix);
  const problems = [];
  const solutions = [];
  
  const phDiff = currentPH - targetPH;
  const absoluteDiff = Math.abs(phDiff);
  
  if (absoluteDiff > 0.5) {
    problems.push({
      level: "high",
      title: "pH fuera de rango seguro",
      description: `Diferencia de ${absoluteDiff.toFixed(1)} puntos. Riesgo de bloqueo de nutrientes.`
    });
  }
  
  if (waterChar.finalHardness > 200) {
    problems.push({
      level: "medium",
      title: "Agua dura + clima cálido",
      description: "El agua dura tiene alto poder tampón. En clima cálido, el pH tiende a subir más rápido."
    });
    
    solutions.push({
      priority: 1,
      action: "Pre-tratar agua dura",
      details: "Bajar pH a 5.0 antes de añadir nutrientes. Esperar 30 minutos.",
      dosage: `Usar ${HARD_WATER_PRETREATMENT.phDownForHardWater}x más pH- de lo normal`
    });
  }
  
  if (waterType === "osmosis" || osmosisMix > 50) {
    problems.push({
      level: "low",
      title: "Agua con bajo poder tampón",
      description: "El agua de ósmosis tiene poca capacidad buffer. El pH puede fluctuar rápidamente."
    });
    
    solutions.push({
      priority: 1,
      action: "Añadir CalMag antes de nutrientes",
      details: "Estabiliza el agua y proporciona calcio/magnesio.",
      immediate: true
    });
  }
  
  if (temperature > 28) {
    problems.push({
      level: "high",
      title: "Temperatura alta afectando pH",
      description: "El agua caliente pierde CO2 más rápido, subiendo el pH."
    });
    
    solutions.push({
      priority: 1,
      action: "Enfriar el depósito",
      details: "Usar botellas de hielo o sombra. Ideal mantener <25°C.",
      immediate: true
    });
  }
  
  solutions.sort((a, b) => a.priority - b.priority);
  
  return {
    problems,
    solutions,
    summary: problems.length > 0 ? "Se requieren ajustes" : "pH estable",
    riskLevel: problems.some(p => p.level === "high") ? "high" : 
               problems.some(p => p.level === "medium") ? "medium" : "low"
  };
};

const calculatePHAdjustmentWithPretreatment = (currentPH, targetPH, waterType, osmosisMix, volume) => {
  const waterChar = getWaterCharacteristics(waterType, osmosisMix);
  const phDiff = currentPH - targetPH;
  
  let adjustmentFactor = 1.0;
  
  if (waterChar.finalHardness > 200) {
    adjustmentFactor = HARD_WATER_PRETREATMENT.phDownForHardWater;
  } else if (waterChar.finalHardness > 100) {
    adjustmentFactor = 1.2;
  }
  
  const adjustment = Math.abs(phDiff) * volume * 0.15 * adjustmentFactor;
  
  let phMinus = 0;
  let phPlus = 0;
  
  if (phDiff > 0) {
    phMinus = adjustment;
  } else {
    phPlus = adjustment;
  }
  
  let pretreatment = null;
  if (waterChar.finalHardness > 200 && phDiff > 0) {
    pretreatment = {
      recommended: true,
      preAdjustmentPH: HARD_WATER_PRETREATMENT.preAdjustmentPH,
      waitingTime: HARD_WATER_PRETREATMENT.waitingTime,
      dosage: (phMinus * 1.5).toFixed(1),
      instructions: "Bajar pH a 5.0 primero, esperar 30 min, luego añadir nutrientes y ajustar a pH final."
    };
  }
  
  return {
    phMinus: phMinus.toFixed(1),
    phPlus: phPlus.toFixed(1),
    adjustmentFactor,
    pretreatment
  };
};

const detectPHSpikes = (phHistory, hours = 24) => {
  if (phHistory.length < 2) return null;
  
  const now = new Date();
  const recentReadings = phHistory.filter(reading => {
    const readingTime = new Date(reading.date);
    const hoursDiff = (now - readingTime) / (1000 * 60 * 60);
    return hoursDiff <= hours;
  });
  
  if (recentReadings.length < 2) return null;
  
  const changes = [];
  for (let i = 1; i < recentReadings.length; i++) {
    const change = Math.abs(recentReadings[i].ph - recentReadings[i-1].ph);
    const timeDiff = (new Date(recentReadings[i].date) - new Date(recentReadings[i-1].date)) / (1000 * 60 * 60);
    changes.push({
      change,
      timeDiff,
      rate: change / timeDiff
    });
  }
  
  const maxChange = Math.max(...changes.map(c => c.change));
  const maxRate = Math.max(...changes.map(c => c.rate));
  
  return {
    maxChange,
    maxRate,
    isSpiking: maxChange > 0.3 || maxRate > 0.15,
    readings: recentReadings.length,
    trend: recentReadings[recentReadings.length-1].ph - recentReadings[0].ph
  };
};

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
  else if (temp < 5) tempAdjustment = 1.8;
  
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
  const rockwoolMoisture = calculateRockwoolMoisture(plants, irrigationConfig, currentTime);
  
  return {
    pumpTime,
    interval,
    cyclesPerDay,
    dayCycles,
    nightCycles,
    isDaytime,
    season,
    dayStart: PUMP_CONFIG.schedule[season].dayStart,
    dayEnd: PUMP_CONFIG.schedule[season].dayEnd,
    dayHours,
    nightHours,
    totalWaterPerDay,
    waterPerCycle: Math.round(waterPerCycle),
    rockwoolMoisture,
    dominantStage,
    stats
  };
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
  const [selPos, setSelPos] = useState({ l: null, v: null, p: null });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
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
    hasHeater: true,
    useOsmosisMix: false,
    osmosisMixPercentage: 0,
    waterNotes: ""
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
            irrigationConfig 
          }));
      } catch (error) {
        console.error("Error guardando:", error);
      }
    }
  }, [plants, config, history, lastRot, lastClean, irrigationConfig, step]);

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
      setShowAddForm(true);
    }
  };

  const verificarDisponibilidadPosicion = (posicion, nivel) => {
    // Verificar si la posición ya está ocupada
    const posicionOcupada = plants.some(p => p.p === posicion);
    if (posicionOcupada) {
      return { disponible: false, motivo: `Posición ${posicion} ya ocupada` };
    }
    
    // Verificar límite por nivel
    const plantasEnNivel = plants.filter(p => p.l === nivel).length;
    if (plantasEnNivel >= 5) {
      return { disponible: false, motivo: `Nivel ${nivel} completo (5/5)` };
    }
    
    return { disponible: true };
  };

  // =================== CÁLCULOS ===================

  const irrigationData = useMemo(() => {
    return calculateIrrigationForRockwool(plants, irrigationConfig, new Date());
  }, [plants, irrigationConfig]);

  const rockwoolSchedule = useMemo(() => {
    return getRockwoolSchedule(plants, irrigationData.season);
  }, [plants, irrigationData.season]);

  const calendarDays = useMemo(() => {
    return generateCalendar(plants, lastRot, lastClean);
  }, [plants, lastRot, lastClean]);

  const waterCharacteristics = useMemo(() => {
    return getWaterCharacteristics(
      config.waterType, 
      config.useOsmosisMix ? config.osmosisMixPercentage : 0
    );
  }, [config.waterType, config.useOsmosisMix, config.osmosisMixPercentage]);

  const calmagNeeded = useMemo(() => {
    return calculateCalMagNeeded(
      config.waterType,
      config.useOsmosisMix ? config.osmosisMixPercentage : 0,
      parseFloat(config.currentVol)
    );
  }, [config.waterType, config.useOsmosisMix, config.osmosisMixPercentage, config.currentVol]);

  const phDiagnosis = useMemo(() => {
    const phHistory = history
      .filter(record => record.ph)
      .map(record => ({
        ph: parseFloat(record.ph),
        date: record.date
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10);
    
    return diagnosePHProblem(
      parseFloat(config.ph),
      parseFloat(config.targetPH),
      config.waterType,
      config.useOsmosisMix ? config.osmosisMixPercentage : 0,
      phHistory,
      parseFloat(config.temp)
    );
  }, [config.ph, config.targetPH, config.waterType, config.useOsmosisMix, config.osmosisMixPercentage, config.temp, history]);

  const phSpikes = useMemo(() => {
    const phHistory = history
      .filter(record => record.ph)
      .map(record => ({
        ph: parseFloat(record.ph),
        date: record.date
      }));
    
    return detectPHSpikes(phHistory, 24);
  }, [history]);

  const phAdjustmentWithPretreatment = useMemo(() => {
    return calculatePHAdjustmentWithPretreatment(
      parseFloat(config.ph),
      parseFloat(config.targetPH),
      config.waterType,
      config.useOsmosisMix ? config.osmosisMixPercentage : 0,
      parseFloat(config.currentVol)
    );
  }, [config.ph, config.targetPH, config.waterType, config.useOsmosisMix, config.osmosisMixPercentage, config.currentVol]);

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

    if (waterCharacteristics.finalHardness > 200 && !config.useOsmosisMix) {
      res.push({ 
        title: "AGUA DURA NO TRATADA", 
        value: `${waterCharacteristics.finalHardness} ppm`, 
        description: "Alta dureza puede causar problemas de pH y bloqueo de nutrientes.", 
        color: "bg-gradient-to-r from-amber-600 to-orange-600",
        icon: <AlertOctagon className="text-white" size={28} />,
        priority: 2
      });
    }

    if (calmagNeeded.required && calmagNeeded.dosage > 0) {
      res.push({ 
        title: "FALTA CALMAG", 
        value: `${calmagNeeded.dosage}ml`, 
        description: calmagNeeded.reason, 
        color: "bg-gradient-to-r from-blue-700 to-cyan-800",
        icon: <Droplets className="text-white" size={28} />,
        priority: 2
      });
    }

    if (phSpikes && phSpikes.isSpiking) {
      res.push({ 
        title: "CAMBIO BRUSCO DE pH", 
        value: `${phSpikes.maxChange.toFixed(1)} en 24h`, 
        description: "El pH está cambiando rápidamente. Verificar estabilidad del sistema.", 
        color: "bg-gradient-to-r from-purple-700 to-pink-800",
        icon: <GitCompare className="text-white" size={28} />,
        priority: 1
      });
    }

    if (phDiagnosis.riskLevel === "high") {
      res.push({ 
        title: "PROBLEMA GRAVE DE pH", 
        value: phDiagnosis.summary, 
        description: "Se detectaron múltiples problemas de pH que requieren atención inmediata.", 
        color: "bg-gradient-to-r from-red-700 to-rose-800 animate-pulse",
        icon: <Brain className="text-white" size={28} />,
        priority: 1
      });
    }

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
  }, [config, lastClean, plants, waterCharacteristics, calmagNeeded, phSpikes, phDiagnosis]);

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
              HYDROCARU
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg mx-auto">
              Sistema experto para cultivo hidropónico
            </p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Sprout className="text-emerald-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Diagnóstico Inteligente de pH</h3>
                  <p className="text-sm text-slate-600">Análisis avanzado para hidroponía</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Droplets className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Gestión de Agua Completa</h3>
                  <p className="text-sm text-slate-600">Ósmosis, CalMag y pretratamiento</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="text-purple-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Alertas Inteligentes</h3>
                  <p className="text-sm text-slate-600">Detección de cambios bruscos y patrones</p>
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
                      <ThermometerSnowflake className="text-blue-500" />
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
                    <h3 className="font-bold text-slate-800">Tipo de Agua</h3>
                    <p className="text-sm text-slate-600">Selecciona el agua que usas</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                          <span>EC base:</span>
                          <span className="font-medium">{water.ecBase} µS/cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dureza:</span>
                          <span className="font-medium">{water.hardness} ppm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Droplets className="text-blue-600" size={20} />
                      <div>
                        <h4 className="font-bold text-slate-800">Mezcla con Agua de Ósmosis</h4>
                        <p className="text-sm text-slate-600">Mezclar agua del grifo con ósmosis para controlar dureza</p>
                      </div>
                    </div>
                    
                    <Switch
                      checked={config.useOsmosisMix}
                      onCheckedChange={(checked) => setConfig({...config, useOsmosisMix: checked})}
                    />
                  </div>
                  
                  {config.useOsmosisMix && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Porcentaje de agua de ósmosis en la mezcla: {config.osmosisMixPercentage}%
                        </label>
                        <Slider
                          value={[config.osmosisMixPercentage]}
                          min={0}
                          max={100}
                          step={10}
                          onValueChange={([value]) => setConfig({...config, osmosisMixPercentage: value})}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-slate-600 mt-2">
                          <span>0% (solo agua grifo)</span>
                          <span>50% (mitad y mitad)</span>
                          <span>100% (solo ósmosis)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                        Valor de pH
                      </label>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5 ? 'ÓPTIMO' : 'FUERA DE RANGO'}
                      </span>
                    </div>
                    
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="4.0"
                          max="9.0"
                          step="0.1"
                          value={config.ph}
                          onChange={(e) => setConfig({...config, ph: e.target.value})}
                          className="w-full text-center text-lg"
                          placeholder="Ej: 6.0"
                        />
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.1"
                      value={config.ph}
                      onChange={(e) => setConfig({...config, ph: e.target.value})}
                      className="w-full h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-lg appearance-none cursor-pointer"
                    />
                    
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>4.0</span>
                      <span className="font-bold text-green-600">5.5-6.5</span>
                      <span>9.0</span>
                    </div>
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
                        Valor de EC (µS/cm)
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
                    
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="0"
                          max="3000"
                          step="50"
                          value={config.ec}
                          onChange={(e) => setConfig({...config, ec: e.target.value})}
                          className="w-full text-center text-lg"
                          placeholder="Ej: 1200"
                        />
                      </div>
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
                </div>
              </Card>
              
              <Card className="p-6 rounded-2xl md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Target className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Objetivos del Sistema</h3>
                    <p className="text-slate-600">Define los valores objetivo</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      EC Objetivo (µS/cm)
                    </label>
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="800"
                          max="1900"
                          step="100"
                          value={config.targetEC}
                          onChange={(e) => setConfig({...config, targetEC: e.target.value})}
                          className="w-full text-center text-lg"
                          placeholder="Ej: 1400"
                        />
                      </div>
                    </div>
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
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      pH Objetivo
                    </label>
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="5.5"
                          max="6.5"
                          step="0.1"
                          value={config.targetPH}
                          onChange={(e) => setConfig({...config, targetPH: e.target.value})}
                          className="w-full text-center text-lg"
                          placeholder="Ej: 6.0"
                        />
                      </div>
                    </div>
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
                            onClick={() => setSelPos({...selPos, l: level})}
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
                            onClick={() => setSelPos({...selPos, v: variety})}
                            className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                              selPos?.v === variety 
                                ? `${VARIETIES[variety].color} text-white`
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {selPos?.v === variety ? VARIETIES[variety].iconSelected : VARIETIES[variety].icon}
                              <span>{variety}</span>
                            </div>
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
                          const esSeleccionada = selPos?.p === pos;
                          
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => {
                                if (!ocupada) {
                                  setSelPos({...selPos, p: pos});
                                }
                              }}
                              className={`aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${
                                ocupada 
                                  ? 'bg-red-100 text-red-700 cursor-not-allowed'
                                  : esSeleccionada
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              disabled={ocupada}
                              title={ocupada ? `Ocupada por ${ocupada.v}` : `Posición ${pos}`}
                            >
                              {ocupada ? (
                                <X className="text-red-500" size={16} />
                              ) : esSeleccionada ? (
                                <Check className="text-white" size={16} />
                              ) : (
                                pos
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      if (selPos?.l && selPos?.v && selPos?.p) {
                        // VERIFICACIÓN MEJORADA
                        const posicionOcupada = plants.some(p => p.p === selPos.p);
                        if (posicionOcupada) {
                          alert(`❌ Error: La posición ${selPos.p} ya está ocupada. Por favor selecciona otra posición.`);
                          setSelPos({...selPos, p: null});
                          return;
                        }
                        
                        // Verificar si el nivel tiene espacio
                        const plantasEnNivel = plants.filter(p => p.l === selPos.l).length;
                        if (plantasEnNivel >= 5) {
                          alert(`❌ Error: El Nivel ${selPos.l} ya está completo (5/5 plantas).`);
                          return;
                        }
                        
                        // Añadir la planta
                        setPlants([...plants, {
                          id: generatePlantId(),
                          l: selPos.l,
                          v: selPos.v,
                          p: selPos.p,
                          date: new Date().toISOString()
                        }]);
                        
                        // Limpiar selección
                        setSelPos({ l: null, v: null, p: null });
                        
                        // Mensaje de confirmación
                        alert(`✅ Planta "${selPos.v}" añadida en Nivel ${selPos.l}, Posición ${selPos.p}`);
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
                              {VARIETIES[plant.v]?.icon || <Sprout className="text-white" size={16} />}
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
                                Posición {plant.p} • {plant.l === 1 ? 'Plántula' : plant.l === 2 ? 'Crecimiento' : 'Maduración'}
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

  // =================== COMPONENTES DE PESTAÑAS ===================

  const DashboardTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-600">Sistema hidropónico con diagnóstico inteligente de pH</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={
            irrigationData.season === "summer" ? "bg-amber-100 text-amber-800" :
            irrigationData.season === "winter" ? "bg-blue-100 text-blue-800" :
            "bg-green-100 text-green-800"
          }>
            {irrigationData.season === "summer" ? "Verano" :
             irrigationData.season === "winter" ? "Invierno" :
             "Primavera/Otoño"}
          </Badge>
        </div>
      </div>
      
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Alertas del Sistema</h2>
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
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl">Sistema de Riego Automático</h2>
              <p className="text-slate-600">Dados de lana 2.5x2.5cm</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${irrigationConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="font-medium">{irrigationConfig.enabled ? 'ACTIVO' : 'INACTIVO'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{irrigationData.pumpTime}s</div>
            <p className="text-sm text-blue-700 font-medium">Tiempo de Bomba</p>
            <p className="text-xs text-slate-500 mt-1">Por ciclo de riego</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(irrigationData.interval)}min</div>
            <p className="text-sm text-green-700 font-medium">Intervalo</p>
            <p className="text-xs text-slate-500 mt-1">Entre riegos</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-white rounded-xl border-2 border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">{irrigationData.cyclesPerDay}</div>
            <p className="text-sm text-purple-700 font-medium">Ciclos/Día</p>
            <p className="text-xs text-slate-500 mt-1">{irrigationData.dayCycles} día + {irrigationData.nightCycles} noche</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-b from-cyan-50 to-white rounded-xl border-2 border-cyan-200">
            <div className="text-3xl font-bold text-cyan-600 mb-2">{irrigationData.totalWaterPerDay}L</div>
            <p className="text-sm text-cyan-700 font-medium">Agua/Día</p>
            <p className="text-xs text-slate-500 mt-1">{irrigationData.waterPerCycle}ml/ciclo</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Configuración de Riego</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIrrigationConfig({...irrigationConfig, showAdvanced: !irrigationConfig.showAdvanced})}
            >
              {irrigationConfig.showAdvanced ? 'Ocultar' : 'Avanzado'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Tiempo de Bomba: <span className="font-bold text-blue-600">{irrigationConfig.pumpTime} segundos</span>
                </label>
                <Slider
                  value={[irrigationConfig.pumpTime]}
                  min={5}
                  max={30}
                  step={1}
                  onValueChange={([value]) => setIrrigationConfig({...irrigationConfig, pumpTime: value, mode: "manual"})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>5s</span>
                  <span>15s</span>
                  <span>30s</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Intervalo: <span className="font-bold text-green-600">{irrigationConfig.interval} minutos</span>
                </label>
                <Slider
                  value={[irrigationConfig.interval]}
                  min={10}
                  max={180}
                  step={5}
                  onValueChange={([value]) => setIrrigationConfig({...irrigationConfig, interval: value, mode: "manual"})}
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
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-xl">Parámetros Actuales del Sistema</h2>
            <p className="text-slate-600">Edita manualmente los valores medidos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              pH Actual
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="4.0"
                max="9.0"
                step="0.1"
                value={config.ph}
                onChange={(e) => setConfig({...config, ph: e.target.value})}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const value = prompt("Introduce el nuevo valor de pH:", config.ph);
                  if (value !== null && !isNaN(parseFloat(value))) {
                    setConfig({...config, ph: value});
                  }
                }}
              >
                Editar
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Rango ideal: 5.5 - 6.5</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              EC Actual (µS/cm)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="3000"
                step="50"
                value={config.ec}
                onChange={(e) => setConfig({...config, ec: e.target.value})}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const value = prompt("Introduce el nuevo valor de EC (µS/cm):", config.ec);
                  if (value !== null && !isNaN(parseFloat(value))) {
                    setConfig({...config, ec: value});
                  }
                }}
              >
                Editar
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Rango ideal: 800 - 1800</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Temperatura (°C)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="10"
                max="35"
                step="0.5"
                value={config.temp}
                onChange={(e) => setConfig({...config, temp: e.target.value})}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const value = prompt("Introduce la nueva temperatura (°C):", config.temp);
                  if (value !== null && !isNaN(parseFloat(value))) {
                    setConfig({...config, temp: value});
                  }
                }}
              >
                Editar
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Rango ideal: 18 - 25°C</p>
          </div>
        </div>
        
        <div className="mt-6">
          <Button
            className="w-full"
            onClick={() => {
              const ph = prompt("pH medido:", config.ph);
              const ec = prompt("EC medido (µS/cm):", config.ec);
              const temp = prompt("Temperatura (°C):", config.temp);
              
              if (ph !== null && ec !== null && temp !== null) {
                setConfig({
                  ...config,
                  ph: ph,
                  ec: ec,
                  temp: temp
                });
                
                // Añadir al historial
                const newRecord = {
                  id: generatePlantId(),
                  date: new Date().toISOString(),
                  ph,
                  ec,
                  notes: "Medición manual actualizada"
                };
                setHistory([...history, newRecord]);
                
                alert("✅ Parámetros actualizados y guardados en historial");
              }
            }}
          >
            <RefreshCw className="mr-2" size={16} />
            Actualizar Todos los Parámetros
          </Button>
        </div>
      </Card>
    </div>
  );

  const NutritionTab = () => {
    const systemEC = calculateSystemEC(plants, parseFloat(config.currentVol), config.waterType);
    const cannaDosage = calculateCannaDosage(plants, parseFloat(config.currentVol), systemEC.targetEC, config.waterType);
    const phAdjustment = calculatePHAdjustment(parseFloat(config.ph), parseFloat(config.targetPH), config.waterType, parseFloat(config.currentVol));
    
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Nutrición</h1>
            <p className="text-slate-600">Cálculo preciso de nutrientes</p>
          </div>
          
          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            {config.waterType === "osmosis" ? "Agua de Ósmosis" : 
             config.waterType === "bajo_mineral" ? "Agua Baja Mineralización" :
             config.waterType === "medio_mineral" ? "Agua Media Mineralización" :
             "Agua Alta Mineralización"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Objetivos del Sistema</h3>
                <p className="text-sm text-slate-600">Valores recomendados</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">EC Objetivo</p>
                    <p className="text-2xl font-bold text-blue-700">{systemEC.targetEC} µS/cm</p>
                  </div>
                  <Zap className="text-blue-600" size={24} />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Basado en {plants.length} plantas ({systemEC.statistics.seedlingCount} plántulas, {systemEC.statistics.growthCount} crecimiento, {systemEC.statistics.matureCount} maduras)
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">pH Objetivo</p>
                    <p className="text-2xl font-bold text-purple-700">{systemEC.targetPH}</p>
                  </div>
                  <Activity className="text-purple-600" size={24} />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Ideal para absorción de nutrientes en lechugas
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">Volumen Actual</p>
                    <p className="text-2xl font-bold text-emerald-700">{config.currentVol}L</p>
                  </div>
                  <Droplets className="text-emerald-600" size={24} />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  de {config.totalVol}L totales ({(config.currentVol/config.totalVol*100).toFixed(0)}%)
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <FlaskConical className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Dosis de Nutrientes</h3>
                <p className="text-sm text-slate-600">Para {config.currentVol}L de agua</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Nutriente A</p>
                    <p className="text-3xl font-bold text-blue-700">{cannaDosage.a}ml</p>
                    <p className="text-xs text-slate-500 mt-1">{cannaDosage.per10L.a}ml/10L</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
                    <p className="text-sm text-green-600 font-medium">Nutriente B</p>
                    <p className="text-3xl font-bold text-green-700">{cannaDosage.b}ml</p>
                    <p className="text-xs text-slate-500 mt-1">{cannaDosage.per10L.b}ml/10L</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800">Instrucciones de Mezcla</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-slate-700">Llena el depósito con {config.currentVol}L de agua</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-slate-700">Añadir {cannaDosage.a}ml de Nutriente A, mezclar bien</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      3
                    </div>
                    <p className="text-sm text-slate-700">Añadir {cannaDosage.b}ml de Nutriente B, mezclar bien</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      4
                    </div>
                    <p className="text-sm text-slate-700">Medir y ajustar pH si es necesario</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <RefreshCw className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Ajuste de pH</h3>
                <p className="text-sm text-slate-600">De {config.ph} a {config.targetPH}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                {parseFloat(config.ph) > parseFloat(config.targetPH) ? (
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="text-4xl font-bold text-purple-700 mb-2">{phAdjustment.phMinus}ml</div>
                    <p className="text-lg font-medium text-purple-800">pH- (ácido)</p>
                    <p className="text-sm text-slate-600 mt-2">Para bajar de {config.ph} a {config.targetPH}</p>
                  </div>
                ) : parseFloat(config.ph) < parseFloat(config.targetPH) ? (
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="text-4xl font-bold text-blue-700 mb-2">{phAdjustment.phPlus}ml</div>
                    <p className="text-lg font-medium text-blue-800">pH+ (álcali)</p>
                    <p className="text-sm text-slate-600 mt-2">Para subir de {config.ph} a {config.targetPH}</p>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-4xl font-bold text-green-700 mb-2">0ml</div>
                    <p className="text-lg font-medium text-green-800">pH Perfecto</p>
                    <p className="text-sm text-slate-600 mt-2">No se requiere ajuste</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">CalMag y Agua Dura</h3>
              <p className="text-slate-600">Gestión de calcio y magnesio</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Análisis de Agua</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-700">Tipo de agua:</span>
                  <span className="font-bold text-blue-600">{WATER_TYPES[config.waterType].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Dureza del agua:</span>
                  <span className="font-bold text-blue-600">{waterCharacteristics.finalHardness} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Necesita CalMag:</span>
                  <span className={`font-bold ${calmagNeeded.required ? 'text-amber-600' : 'text-green-600'}`}>
                    {calmagNeeded.required ? 'SÍ' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Recomendaciones</h4>
              <div className="space-y-3">
                {calmagNeeded.required ? (
                  <>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-bold">Añadir {calmagNeeded.dosage}ml de CalMag</span> antes de los nutrientes principales
                      </p>
                    </div>
                    <p className="text-sm text-slate-700">{calmagNeeded.reason}</p>
                  </>
                ) : (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      El agua tiene suficiente dureza. No es necesario añadir CalMag.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const TowerTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Torre</h1>
          <p className="text-slate-600">15 posiciones - Sistema 5-5-5</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRotation}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700 hover:bg-amber-100"
          >
            <RotateCcw className="mr-2" size={16} />
            Rotar Niveles
          </Button>
          
          <Button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setSelPos({ l: null, v: null, p: null });
            }}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
          >
            <Plus className="mr-2" size={16} />
            {showAddForm ? 'Ocultar Formulario' : 'Añadir Planta'}
          </Button>
        </div>
      </div>
      
      {showAddForm && (
        <Card className="p-6 rounded-2xl">
          <h3 className="font-bold text-slate-800 mb-4">Añadir Nueva Planta</h3>
          
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
                    onClick={() => setSelPos({...selPos, l: level})}
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
                    onClick={() => setSelPos({...selPos, v: variety})}
                    className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                      selPos?.v === variety 
                        ? `${VARIETIES[variety].color} text-white`
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {selPos?.v === variety ? VARIETIES[variety].iconSelected : VARIETIES[variety].icon}
                      <span>{variety}</span>
                    </div>
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
                  const esSeleccionada = selPos?.p === pos;
                  
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => {
                        if (!ocupada) {
                          setSelPos({...selPos, p: pos});
                        }
                      }}
                      className={`aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${
                        ocupada 
                          ? 'bg-red-100 text-red-700 cursor-not-allowed'
                          : esSeleccionada
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      disabled={ocupada}
                      title={ocupada ? `Ocupada por ${ocupada.v}` : `Posición ${pos}`}
                    >
                      {ocupada ? (
                        <X className="text-red-500" size={16} />
                      ) : esSeleccionada ? (
                        <Check className="text-white" size={16} />
                      ) : (
                        pos
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => {
              if (selPos?.l && selPos?.v && selPos?.p) {
                // VERIFICACIÓN MEJORADA
                const posicionOcupada = plants.some(p => p.p === selPos.p);
                if (posicionOcupada) {
                  alert(`❌ Error: La posición ${selPos.p} ya está ocupada. Por favor selecciona otra posición.`);
                  setSelPos({...selPos, p: null});
                  return;
                }
                
                // Verificar si el nivel tiene espacio
                const plantasEnNivel = plants.filter(p => p.l === selPos.l).length;
                if (plantasEnNivel >= 5) {
                  alert(`❌ Error: El Nivel ${selPos.l} ya está completo (5/5 plantas).`);
                  return;
                }
                
                // Añadir la planta
                setPlants([...plants, {
                  id: generatePlantId(),
                  l: selPos.l,
                  v: selPos.v,
                  p: selPos.p,
                  date: new Date().toISOString()
                }]);
                
                // Limpiar selección
                setSelPos({ l: null, v: null, p: null });
                
                // Mensaje de confirmación
                alert(`✅ Planta "${selPos.v}" añadida en Nivel ${selPos.l}, Posición ${selPos.p}`);
              }
            }}
            disabled={!(selPos?.l && selPos?.v && selPos?.p)}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
          >
            <Plus className="mr-2" />
            Añadir Planta a la Torre
          </Button>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Sprout className="text-cyan-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Nivel 1 - Plántulas</h3>
                <p className="text-sm text-slate-600">Primeras 2-3 semanas</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {plants.filter(p => p.l === 1).length === 0 ? (
                <p className="text-slate-500 text-center py-4">No hay plantas en este nivel</p>
              ) : (
                plants.filter(p => p.l === 1).map(plant => (
                  <div key={plant.id} className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                        {VARIETIES[plant.v]?.icon || <Sprout className="text-cyan-600" size={14} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{plant.v}</p>
                        <p className="text-xs text-slate-600">Posición {plant.p}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(plant.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              )}
              
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-bold text-cyan-700">{plants.filter(p => p.l === 1).length}/5 plantas</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Activity className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Nivel 2 - Crecimiento</h3>
                <p className="text-sm text-slate-600">Semanas 3-5</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {plants.filter(p => p.l === 2).length === 0 ? (
                <p className="text-slate-500 text-center py-4">No hay plantas en este nivel</p>
              ) : (
                plants.filter(p => p.l === 2).map(plant => (
                  <div key={plant.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        {VARIETIES[plant.v]?.icon || <Activity className="text-green-600" size={14} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{plant.v}</p>
                        <p className="text-xs text-slate-600">Posición {plant.p}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(plant.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              )}
              
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-bold text-green-700">{plants.filter(p => p.l === 2).length}/5 plantas</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Leaf className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Nivel 3 - Maduración</h3>
                <p className="text-sm text-slate-600">Semanas 5-7 (cosecha)</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {plants.filter(p => p.l === 3).length === 0 ? (
                <p className="text-slate-500 text-center py-4">No hay plantas en este nivel</p>
              ) : (
                plants.filter(p => p.l === 3).map(plant => (
                  <div key={plant.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        {VARIETIES[plant.v]?.icon || <Leaf className="text-emerald-600" size={14} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{plant.v}</p>
                        <p className="text-xs text-slate-600">Posición {plant.p}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(plant.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              )}
              
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-bold text-emerald-700">{plants.filter(p => p.l === 3).length}/5 plantas</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TreePine className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Vista General de la Torre</h3>
                <p className="text-slate-600">15 posiciones - 3 niveles</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-5 gap-3">
                {Array.from({length: 15}, (_, i) => i + 1).map(pos => {
                  const plant = plants.find(p => p.p === pos);
                  const level = plant?.l || 0;
                  const variety = plant?.v;
                  
                  return (
                    <div
                      key={pos}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center p-3 ${
                        level === 1 ? 'bg-cyan-50 border-2 border-cyan-200' :
                        level === 2 ? 'bg-green-50 border-2 border-green-200' :
                        level === 3 ? 'bg-emerald-50 border-2 border-emerald-200' :
                        'bg-slate-100 border-2 border-slate-200'
                      }`}
                    >
                      <div className="text-lg font-bold mb-2">{pos}</div>
                      {plant ? (
                        <>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            level === 1 ? 'bg-cyan-100' :
                            level === 2 ? 'bg-green-100' :
                            'bg-emerald-100'
                          }`}>
                            {VARIETIES[variety]?.icon || 
                             (level === 1 ? <Sprout className="text-cyan-600" size={16} /> :
                              level === 2 ? <Activity className="text-green-600" size={16} /> :
                              <Leaf className="text-emerald-600" size={16} />)}
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-medium">{variety}</div>
                            <div className={`text-xs ${
                              level === 1 ? 'text-cyan-600' :
                              level === 2 ? 'text-green-600' :
                              'text-emerald-600'
                            }`}>
                              Nivel {level}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400 text-sm text-center">Vacía</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-b from-cyan-50 to-white rounded-xl border-2 border-cyan-200">
                <div className="text-2xl font-bold text-cyan-700 mb-1">{plants.filter(p => p.l === 1).length}/5</div>
                <p className="text-sm text-cyan-600">Nivel 1 (Plántulas)</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
                <div className="text-2xl font-bold text-green-700 mb-1">{plants.filter(p => p.l === 2).length}/5</div>
                <p className="text-sm text-green-600">Nivel 2 (Crecimiento)</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-b from-emerald-50 to-white rounded-xl border-2 border-emerald-200">
                <div className="text-2xl font-bold text-emerald-700 mb-1">{plants.filter(p => p.l === 3).length}/5</div>
                <p className="text-sm text-emerald-600">Nivel 3 (Maduración)</p>
              </div>
            </div>
          </Card>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h3 className="font-bold text-amber-800 mb-3">💡 Sistema 5-5-5 - Rotación Semanal</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs mt-0.5">
                  1
                </div>
                <p className="text-sm text-slate-700"><strong>Cosecha Nivel 3:</strong> Recoge 5 lechugas maduras</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs mt-0.5">
                  2
                </div>
                <p className="text-sm text-slate-700"><strong>Rotar Nivel 2 → 3:</strong> 5 plantas de crecimiento pasan a maduración</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs mt-0.5">
                  3
                </div>
                <p className="text-sm text-slate-700"><strong>Rotar Nivel 1 → 2:</strong> 5 plántulas pasan a crecimiento</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs mt-0.5">
                  4
                </div>
                <p className="text-sm text-slate-700"><strong>Añadir nuevas plántulas:</strong> 5 nuevas plantas en Nivel 1</p>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  Resultado: Siempre tendrás lechugas listas para cosechar cada semana
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CalendarTab = () => {
    const now = new Date();
    const currentMonth = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
    
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Calendario de Mantenimiento</h1>
            <p className="text-slate-600">Planificación y seguimiento de tareas</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              {currentMonth}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {plants.length} plantas activas
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Calendario Mensual</h3>
                  <p className="text-slate-600">Tareas programadas</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-slate-500 p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isToday = day.date.toDateString() === now.toDateString();
                    const hasEvents = day.events.length > 0;
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 rounded-lg border ${
                          isToday 
                            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300' 
                            : day.isCurrentMonth 
                            ? 'bg-white border-slate-200' 
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-medium ${
                            isToday 
                              ? 'text-blue-700' 
                              : day.isCurrentMonth 
                              ? 'text-slate-800' 
                              : 'text-slate-400'
                          }`}>
                            {day.dayOfMonth}
                          </span>
                          
                          {isToday && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {day.events.includes('measure') && (
                            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                              <Activity size={10} />
                              Medir pH/EC
                            </div>
                          )}
                          
                          {day.events.includes('rotation') && (
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                              <RotateCcw size={10} />
                              Rotar
                            </div>
                          )}
                          
                          {day.events.includes('clean') && (
                            <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                              <Droplets size={10} />
                              Limpiar
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm text-slate-600">Hoy</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span className="text-sm text-slate-600">Medición pH/EC</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span className="text-sm text-slate-600">Rotación</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-100 rounded"></div>
                  <span className="text-sm text-slate-600">Limpieza</span>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Bell className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Próximas Tareas</h3>
                  <p className="text-slate-600">Actividades programadas</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Medición de pH y EC</h4>
                      <p className="text-sm text-slate-600">Cada {plants.length > 10 ? '2' : plants.length > 5 ? '3' : '4'} días</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">
                    Verificar y ajustar parámetros del agua. Registrar en historial.
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <RotateCcw className="text-green-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Rotación de Niveles</h4>
                      <p className="text-sm text-slate-600">Cada 7 días</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">
                    Última rotación: {new Date(lastRot).toLocaleDateString('es-ES')}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRotation}
                    className="mt-2 w-full"
                  >
                    Realizar Rotación Ahora
                  </Button>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Droplets className="text-purple-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Limpieza del Sistema</h4>
                      <p className="text-sm text-slate-600">Cada 14 días</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">
                    Última limpieza: {new Date(lastClean).toLocaleDateString('es-ES')}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (confirm("¿Confirmar limpieza del sistema?\n\n• Vaciar depósito\n• Limpiar con agua oxigenada\n• Enjuagar bien")) {
                        setLastClean(new Date().toISOString());
                        alert("✅ Limpieza registrada");
                      }
                    }}
                    className="mt-2 w-full"
                  >
                    Registrar Limpieza
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <History className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Historial Reciente</h3>
                  <p className="text-slate-600">Últimas mediciones</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {history.slice(-3).reverse().map(record => (
                  <div key={record.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">
                          {new Date(record.date).toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </p>
                        <p className="text-sm text-slate-600">
                          pH: {record.ph} • EC: {record.ec} µS/cm
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHistoryRecord(record.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-slate-700 mt-2">{record.notes}</p>
                    )}
                  </div>
                ))}
                
                {history.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No hay historial registrado</p>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const ph = prompt("pH medido:", config.ph);
                    const ec = prompt("EC medido (µS/cm):", config.ec);
                    const notes = prompt("Notas (opcional):", "");
                    
                    if (ph && ec) {
                      const newRecord = {
                        id: generatePlantId(),
                        date: new Date().toISOString(),
                        ph,
                        ec,
                        notes
                      };
                      setHistory([...history, newRecord]);
                      alert("✅ Medición registrada en historial");
                    }
                  }}
                >
                  <Plus className="mr-2" size={16} />
                  Añadir Medición Actual
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const SettingsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h1>
        <p className="text-slate-600">Ajustes avanzados y preferencias</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Configuración General</h3>
              <p className="text-slate-600">Ajustes básicos del sistema</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Volumen Total del Depósito: <span className="font-bold text-blue-600">{config.totalVol}L</span>
              </label>
              <Slider
                value={[parseFloat(config.totalVol)]}
                min={10}
                max={50}
                step={5}
                onValueChange={([value]) => setConfig({...config, totalVol: value.toString()})}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>10L</span>
                <span>25L</span>
                <span>50L</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Temperatura Objetivo: <span className="font-bold text-blue-600">{config.temp}°C</span>
              </label>
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
                <span>22.5°C</span>
                <span>35°C</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Configuración de Agua</h3>
              <p className="text-slate-600">Tipo y características del agua</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tipo de Agua
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(WATER_TYPES).map(([key, water]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setConfig({...config, waterType: key})}
                    className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                      config.waterType === key 
                        ? `${key === "osmosis" ? "bg-blue-500" : 
                            key === "bajo_mineral" ? "bg-cyan-500" : 
                            key === "medio_mineral" ? "bg-teal-500" : 
                            "bg-amber-500"} text-white`
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {water.icon}
                      <span>{water.name.split(" ")[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {config.useOsmosisMix && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Porcentaje de ósmosis en mezcla: {config.osmosisMixPercentage}%
                </label>
                <Slider
                  value={[config.osmosisMixPercentage]}
                  min={0}
                  max={100}
                  step={10}
                  onValueChange={([value]) => setConfig({...config, osmosisMixPercentage: value})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>0% (solo grifo)</span>
                  <span>50%</span>
                  <span>100% (solo ósmosis)</span>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Objetivos de Nutrición</h3>
              <p className="text-slate-600">Valores objetivo del sistema</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                EC Objetivo: <span className="font-bold text-blue-600">{config.targetEC} µS/cm</span>
              </label>
              <Slider
                value={[parseFloat(config.targetEC)]}
                min={800}
                max={1900}
                step={100}
                onValueChange={([value]) => setConfig({...config, targetEC: value.toString()})}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>800</span>
                <span>1350</span>
                <span>1900</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                pH Objetivo: <span className="font-bold text-purple-600">{config.targetPH}</span>
              </label>
              <Slider
                value={[parseFloat(config.targetPH)]}
                min={5.5}
                max={6.5}
                step={0.1}
                onValueChange={([value]) => setConfig({...config, targetPH: value.toString()})}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>5.5</span>
                <span>6.0</span>
                <span>6.5</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Mantenimiento y Seguridad</h3>
              <p className="text-slate-600">Control y limpieza del sistema</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <h4 className="font-bold text-blue-800 mb-2">Última Rotación</h4>
              <p className="text-blue-700">
                {new Date(lastRot).toLocaleDateString('es-ES', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRotation}
                className="mt-2"
              >
                Realizar Rotación Ahora
              </Button>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <h4 className="font-bold text-purple-800 mb-2">Última Limpieza</h4>
              <p className="text-purple-700">
                {new Date(lastClean).toLocaleDateString('es-ES', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (confirm("¿Confirmar limpieza del sistema?\n\n• Vaciar depósito\n• Limpiar con agua oxigenada\n• Enjuagar bien")) {
                    setLastClean(new Date().toISOString());
                    alert("✅ Limpieza registrada");
                  }
                }}
                className="mt-2"
              >
                Registrar Limpieza
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // =================== RENDER PRINCIPAL ===================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      {step < 4 ? (
        <div className="max-w-6xl mx-auto">
          {renderStep()}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="dashboard" className="flex items-center justify-center gap-2 px-2 py-3">
                <Home size={16} />
                <span className="hidden sm:inline">Panel</span>
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex items-center justify-center gap-2 px-2 py-3">
                <FlaskConical size={16} />
                <span className="hidden sm:inline">Nutrición</span>
              </TabsTrigger>
              <TabsTrigger value="tower" className="flex items-center justify-center gap-2 px-2 py-3">
                <TreePine size={16} />
                <span className="hidden sm:inline">Torre</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center justify-center gap-2 px-2 py-3">
                <Calendar size={16} />
                <span className="hidden sm:inline">Calendario</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center justify-center gap-2 px-2 py-3">
                <Settings size={16} />
                <span className="hidden sm:inline">Ajustes</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="dashboard" className="mt-0">
              <DashboardTab />
            </TabsContent>
            
            <TabsContent value="nutrition" className="mt-0">
              <NutritionTab />
            </TabsContent>
            
            <TabsContent value="tower" className="mt-0">
              <TowerTab />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-0">
              <CalendarTab />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 rounded-2xl max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-amber-600" size={24} />
              <h3 className="font-bold text-slate-800">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que quieres eliminar esta planta? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => {
                  setPlants(plants.filter(p => p.id !== showDeleteConfirm));
                  setShowDeleteConfirm(null);
                }}
              >
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
