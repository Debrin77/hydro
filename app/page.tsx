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
  Target, Brain, AlertOctagon, GitCompare, BarChart
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

// ============================================================================
// CONFIGURACIÓN BASE - ACTUALIZADA
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

// Configuración de CalMag
const CALMAG_CONFIG = {
  minRequiredHardness: 100, // ppm - debajo de esto se recomienda CalMag
  dosagePerLiter: 1.0, // ml por litro para agua de ósmosis pura
  calciumPercent: 5.0, // 5% Ca
  magnesiumPercent: 1.5, // 1.5% Mg
  maxDosage: 5, // ml por litro máximo
};

// Configuración de pretratamiento para agua dura
const HARD_WATER_PRETREATMENT = {
  phDownForHardWater: 1.5, // Factor multiplicador para pH- en agua dura
  preAdjustmentPH: 5.0, // Ajustar a pH 5.0 antes de añadir nutrientes
  waitingTime: 30, // minutos de espera después del pretratamiento
  recommendations: [
    "Usar ácido fosfórico en lugar de ácido nítrico para agua dura",
    "Pre-tratar el agua 30 minutos antes de añadir nutrientes",
    "Considerar mezclar con agua de ósmosis para reducir dureza"
  ]
};

// Variedades (con iconos añadidos)
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

// Configuración específica para dados pequeños de lana de roca
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
  irrigationPrinciples: {
    cycleLength: 10,
    drainagePercentage: 0.15,
    drybackPeriod: 0.25
  },
  volumePerDado: 15,
  preparation: {
    phSoak: 5.5,
    ecSoak: 0.6,
    soakTime: 24
  }
};

// Configuración de bomba
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
  castellonAdjustments: {
    summer: {
      vientoPoniente: 0.7,
      olaCalor: 0.6,
      humedadAlta: 1.3
    },
    winter: {
      lluvia: 1.6,
      frio: 1.4,
      humedadAlta: 1.5
    },
    spring: {
      normal: 1.0,
      viento: 0.8
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

// Configuración clima Castellón
const CASTELLON_CLIMA = {
  location: "Castellón de la Plana",
  coordinates: "40.6789° N, 0.2822° O",
  clima: "Mediterráneo costero",
  elevacion: "30m",
  temperaturas: {
    verano: { max: 31, min: 22, promedio: 26.5 },
    invierno: { max: 16, min: 8, promedio: 12 },
    primavera: { max: 22, min: 13, promedio: 17.5 }
  },
  humedad: {
    verano: 65,
    invierno: 75,
    primavera: 70
  },
  vientos: {
    poniente: { 
      direccion: "Oeste",
      temporada: "Verano",
      horas: "12:00-20:00",
      efecto: "Secante, reduce humedad 30%",
      impactoRiego: "+30% frecuencia"
    },
    levante: {
      direccion: "Este",
      temporada: "Invierno",
      efecto: "Húmedo, aumenta humedad 20%",
      impactoRiego: "-20% frecuencia"
    }
  },
  evapotranspiracion: {
    verano: 7.0,
    invierno: 2.5,
    primavera: 4.5,
    promedio: 4.7
  },
  recomendacionesRiego: {
    verano: "Riegos cortos (8-12s) cada 20-40min día. Evitar 12:00-16:00.",
    invierno: "Riegos moderados (10-15s) cada 45-90min. Riego al mediodía.",
    primavera: "Riegos adaptativos según temperatura del día."
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

/**
 * Calcula las características del agua según el tipo y mezcla
 */
const getWaterCharacteristics = (waterType, osmosisMix = 0) => {
  const baseWater = WATER_TYPES[waterType] || WATER_TYPES.bajo_mineral;
  const osmosisWater = WATER_TYPES.osmosis;
  
  // Si no se usa mezcla o el tipo ya es osmosis, devolver base
  if (waterType === "osmosis" || osmosisMix === 0) {
    return {
      ...baseWater,
      finalHardness: baseWater.hardness,
      finalECBase: baseWater.ecBase,
      finalPhBase: baseWater.phBase,
      calmagRequired: baseWater.calmagRequired
    };
  }
  
  // Calcular mezcla
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

/**
 * Calcula la dosis de CalMag necesaria
 */
const calculateCalMagNeeded = (waterType, osmosisMix, volume) => {
  const waterChar = getWaterCharacteristics(waterType, osmosisMix);
  
  if (!waterChar.calmagRequired) {
    return {
      required: false,
      dosage: 0,
      reason: "El agua tiene suficiente dureza (calcio/magnesio)"
    };
  }
  
  // Calcular dosis basada en la deficiencia
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

/**
 * Diagnóstico avanzado de problemas de pH para Castellón
 */
const diagnosePHProblem = (currentPH, targetPH, waterType, osmosisMix, phHistory = [], temperature) => {
  const waterChar = getWaterCharacteristics(waterType, osmosisMix);
  const problems = [];
  const solutions = [];
  const warnings = [];
  
  const phDiff = currentPH - targetPH;
  const absoluteDiff = Math.abs(phDiff);
  
  // 1. Diagnóstico básico de diferencia
  if (absoluteDiff > 0.5) {
    problems.push({
      level: "high",
      title: "pH fuera de rango seguro",
      description: `Diferencia de ${absoluteDiff.toFixed(1)} puntos. Riesgo de bloqueo de nutrientes.`
    });
  }
  
  // 2. Diagnóstico específico para agua dura en Castellón
  if (waterChar.finalHardness > 200) {
    problems.push({
      level: "medium",
      title: "Agua dura + clima cálido",
      description: "El agua dura tiene alto poder tampón. En clima cálido de Castellón, el pH tiende a subir más rápido."
    });
    
    solutions.push({
      priority: 1,
      action: "Pre-tratar agua dura",
      details: "Bajar pH a 5.0 antes de añadir nutrientes. Esperar 30 minutos.",
      dosage: `Usar ${HARD_WATER_PRETREATMENT.phDownForHardWater}x más pH- de lo normal`
    });
    
    solutions.push({
      priority: 2,
      action: "Considerar mezcla con ósmosis",
      details: `Mezclar con ${Math.min(50, osmosisMix + 30)}% agua de ósmosis para reducir dureza.`,
      immediate: false
    });
  }
  
  // 3. Diagnóstico para agua de ósmosis
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
    
    solutions.push({
      priority: 2,
      action: "Monitorizar pH cada 12 horas",
      details: "El pH puede cambiar rápidamente. Medir con frecuencia.",
      immediate: false
    });
  }
  
  // 4. Análisis de tendencia del historial
  if (phHistory.length >= 3) {
    const recentChanges = [];
    for (let i = 1; i < Math.min(4, phHistory.length); i++) {
      recentChanges.push(phHistory[i-1].ph - phHistory[i].ph);
    }
    
    const averageChange = recentChanges.reduce((a, b) => a + b, 0) / recentChanges.length;
    const maxChange = Math.max(...recentChanges.map(c => Math.abs(c)));
    
    if (maxChange > 0.3) {
      warnings.push({
        type: "volatile",
        message: "Cambios bruscos de pH detectados",
        details: `Cambio máximo de ${maxChange.toFixed(1)} en 24h. Posible problema de estabilidad.`
      });
    }
    
    if (averageChange > 0.1) {
      problems.push({
        level: "medium",
        title: "pH subiendo consistentemente",
        description: "Tendencia alcista detectada. Común en agua dura o con alta temperatura."
      });
      
      solutions.push({
        priority: 1,
        action: "Revisar temperatura del agua",
        details: "Temperaturas >25°C aceleran el aumento de pH.",
        check: `Temperatura actual: ${temperature}°C`
      });
    }
  }
  
  // 5. Efecto de temperatura (específico Castellón)
  if (temperature > 28) {
    problems.push({
      level: "high",
      title: "Temperatura alta afectando pH",
      description: "En verano Castellón, el agua caliente pierde CO2 más rápido, subiendo el pH."
    });
    
    solutions.push({
      priority: 1,
      action: "Enfriar el depósito",
      details: "Usar botellas de hielo o sombra. Ideal mantener <25°C.",
      immediate: true
    });
  }
  
  // 6. Recomendaciones específicas para lana de roca
  problems.push({
    level: "info",
    title: "Consideración para lana de roca",
    description: "La lana de roca tiene pH alcalino natural. Puede elevar el pH los primeros días."
  });
  
  // Ordenar soluciones por prioridad
  solutions.sort((a, b) => a.priority - b.priority);
  
  return {
    problems,
    solutions,
    warnings,
    summary: problems.length > 0 ? "Se requieren ajustes" : "pH estable",
    riskLevel: problems.some(p => p.level === "high") ? "high" : 
               problems.some(p => p.level === "medium") ? "medium" : "low"
  };
};

/**
 * Calcula ajuste de pH considerando pretratamiento para agua dura
 */
const calculatePHAdjustmentWithPretreatment = (currentPH, targetPH, waterType, osmosisMix, volume) => {
  const waterChar = getWaterCharacteristics(waterType, osmosisMix);
  const phDiff = currentPH - targetPH;
  
  let adjustmentFactor = 1.0;
  
  // Ajuste por dureza del agua
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
  
  // Recomendaciones de pretratamiento para agua dura
  let pretreatment = null;
  if (waterChar.finalHardness > 200 && phDiff > 0) {
    pretreatment = {
      recommended: true,
      preAdjustmentPH: HARD_WATER_PRETREATMENT.preAdjustmentPH,
      waitingTime: HARD_WATER_PRETREATMENT.waitingTime,
      dosage: (phMinus * 1.5).toFixed(1), // Dosis mayor para pretratamiento
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

/**
 * Detecta cambios bruscos en el historial de pH
 */
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
    dayStart: PUMP_CONFIG.schedule[season].dayStart,
    dayEnd: PUMP_CONFIG.schedule[season].dayEnd,
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
  
  recs.push({
    icon: "⏱️",
    text: `Ciclo: ${pumpTime} segundos cada ${Math.round(interval)} minutos (${Math.round(60/interval)}x/hora)`
  });
  
  if (isDaytime) {
    recs.push({
      icon: "☀️",
      text: `Modo <strong>DÍA</strong>: Máxima frecuencia por evaporación`
    });
  } else {
    recs.push({
      icon: "🌙",
      text: `Modo <strong>NOCHE</strong>: Reducir frecuencia 40-50%`
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
    
    recs.push({
      icon: "⏰",
      text: `Horario óptimo: <strong>06:00-10:00</strong> y <strong>18:00-21:00</strong>`
    });
    
    recs.push({
      icon: "🚫",
      text: `Evitar riego: <strong>12:00-16:00</strong> (máxima evaporación)`
    });
    
  } else if (season === "winter") {
    recs.push({
      icon: "⛄",
      text: `<strong>INVIERNO</strong>: Riegos más espaciados, al mediodía`
    });
    
    recs.push({
      icon: "💧",
      text: `Precaución: Humedad alta → Reducir frecuencia 30%`
    });
    
    recs.push({
      icon: "⏰",
      text: `Horario ideal: <strong>11:00-14:00</strong> (horas más cálidas)`
    });
    
    if (temperature < 15) {
      recs.push({
        icon: "❄️",
        text: `Temperatura baja (${temperature}°C) → Reducir frecuencia 40%`
      });
    }
  } else {
    recs.push({
      icon: "🌱",
      text: `<strong>PRIMAVERA/OTOÑO</strong>: Ajustar según temperatura diaria`
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
  
  recs.push({
    icon: "💎",
    text: `<strong>CLAVE DADOS PEQUEÑOS:</strong> Riego corto → Secado rápido → Repetir`
  });
  
  recs.push({
    icon: "👆",
    text: `Verifica: Dado debe estar húmedo uniformemente, no encharcado`
  });
  
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
// COMPONENTE PRINCIPAL - CORREGIDO
// ============================================================================

export default function HydroAppFinal() {
  // Estados principales
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [tab, setTab] = useState("dashboard");
  const [selPos, setSelPos] = useState({ l: null, v: null, p: null }); // CORREGIDO: Inicializado como objeto
  const [showWaterSelector, setShowWaterSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedTips, setExpandedTips] = useState({});
  const [showAddForm, setShowAddForm] = useState(false); // Nuevo estado para mostrar formulario en TowerTab
  
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
      setShowAddForm(true); // Mostrar formulario para añadir nuevas plantas
    }
  };

  const toggleTip = (tipId) => {
    setExpandedTips(prev => ({
      ...prev,
      [tipId]: !prev[tipId]
    }));
  };

  // =================== CÁLCULOS CON NUEVAS FUNCIONES ===================

  const irrigationData = useMemo(() => {
    return calculateIrrigationForRockwool(plants, irrigationConfig, new Date());
  }, [plants, irrigationConfig]);

  const rockwoolSchedule = useMemo(() => {
    return getRockwoolSchedule(plants, irrigationData.season);
  }, [plants, irrigationData.season]);

  const calendarDays = useMemo(() => {
    return generateCalendar(plants, lastRot, lastClean);
  }, [plants, lastRot, lastClean]);

  // Obtener características del agua actual
  const waterCharacteristics = useMemo(() => {
    return getWaterCharacteristics(
      config.waterType, 
      config.useOsmosisMix ? config.osmosisMixPercentage : 0
    );
  }, [config.waterType, config.useOsmosisMix, config.osmosisMixPercentage]);

  // Calcular necesidad de CalMag
  const calmagNeeded = useMemo(() => {
    return calculateCalMagNeeded(
      config.waterType,
      config.useOsmosisMix ? config.osmosisMixPercentage : 0,
      parseFloat(config.currentVol)
    );
  }, [config.waterType, config.useOsmosisMix, config.osmosisMixPercentage, config.currentVol]);

  // Diagnóstico de pH
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

  // Detección de cambios bruscos de pH
  const phSpikes = useMemo(() => {
    const phHistory = history
      .filter(record => record.ph)
      .map(record => ({
        ph: parseFloat(record.ph),
        date: record.date
      }));
    
    return detectPHSpikes(phHistory, 24);
  }, [history]);

  // Ajuste de pH con pretratamiento
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

    // Alerta para agua dura no tratada
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

    // Alerta para agua de ósmosis sin CalMag
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

    // Alertas de pH inteligentes
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

    // Alertas de diagnóstico de pH
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

    // Alertas existentes
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

    // Alertas específicas para dados pequeños de lana de roca
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

    // Alerta específica para viento poniente en Castellón
    const horaActual = new Date().getHours();
    if (horaActual >= 12 && horaActual <= 20 && irrigationData.season === "summer") {
      res.push({
        title: "VIENTO PONIENTE ACTIVO",
        value: "Aumentar frecuencia",
        description: "Vientos secos de tarde en Castellón. Aumenta frecuencia de riego 30%.",
        color: "bg-gradient-to-r from-yellow-600 to-amber-700",
        icon: <Wind className="text-white" size={28} />,
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
  }, [config, lastClean, plants, irrigationData, waterCharacteristics, calmagNeeded, phSpikes, phDiagnosis]);

  // =================== FLUJO DE CONFIGURACIÓN - CORREGIDO ===================

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
                  <h3 className="font-bold text-slate-800">Diagnóstico Inteligente de pH</h3>
                  <p className="text-sm text-slate-600">Nuevo: análisis avanzado para Castellón</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Droplets className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Gestión de Agua Completa</h3>
                  <p className="text-sm text-slate-600">Ósmosis, CalMag y pretratamiento para agua dura</p>
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
                        <div className="flex justify-between">
                          <span>pH base:</span>
                          <span className="font-medium">{water.phBase}</span>
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
                      
                      <div className="p-3 bg-white rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-700">Dureza resultante:</span>
                          <span className="font-bold text-blue-600">{waterCharacteristics.finalHardness} ppm</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-700">EC base resultante:</span>
                          <span className="font-bold text-blue-600">{waterCharacteristics.finalECBase} µS/cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700">Necesita CalMag:</span>
                          <span className={`font-bold ${calmagNeeded.required ? 'text-amber-600' : 'text-green-600'}`}>
                            {calmagNeeded.required ? 'SÍ' : 'NO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="text-emerald-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-emerald-800">
                        {waterCharacteristics.recommendation}
                        {calmagNeeded.required && ` ${calmagNeeded.reason}`}
                      </p>
                    </div>
                  </div>
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
                        Valor de pH: <span className="font-bold text-purple-600">{config.ph}</span>
                      </label>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5 ? 'ÓPTIMO' : 'FUERA DE RANGO'}
                      </span>
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
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-700 mb-2">📊 Diagnóstico Rápido</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-700">Estado:</span>
                        <span className={`font-bold ${
                          phDiagnosis.riskLevel === 'high' ? 'text-red-600' :
                          phDiagnosis.riskLevel === 'medium' ? 'text-amber-600' :
                          'text-green-600'
                        }`}>
                          {phDiagnosis.summary}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Problemas detectados:</span>
                        <span className="font-bold text-slate-800">{phDiagnosis.problems.length}</span>
                      </div>
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
                      <h4 className="font-bold text-blue-700">Guía rápida de EC</h4>
                    </div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Plántulas:</span>
                        <span className="font-medium">800-1000 µS/cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crecimiento:</span>
                        <span className="font-medium">1200-1500 µS/cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maduras:</span>
                        <span className="font-medium">1500-1800 µS/cm</span>
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
                        Las plántulas necesitan EC baja (800-1000). Las plantas maduras toleran EC más alta (1500-1800).
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      pH Objetivo
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
                        Para lechugas en hidroponía, el pH ideal es 6.0. Permite máxima absorción de nutrientes.
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
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => !ocupada && setSelPos({...selPos, p: pos})}
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
                              {ocupada ? (
                                <X className="text-red-500" size={16} />
                              ) : selPos?.p === pos ? (
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
                        // Verificar si la posición ya está ocupada
                        const isPositionOccupied = plants.some(p => p.p === selPos.p);
                        if (isPositionOccupied) {
                          alert(`La posición ${selPos.p} ya está ocupada. Por favor selecciona otra posición.`);
                          return;
                        }
                        
                        setPlants([...plants, {
                          id: generatePlantId(),
                          l: selPos.l,
                          v: selPos.v,
                          p: selPos.p,
                          date: new Date().toISOString()
                        }]);
                        setSelPos({ l: null, v: null, p: null }); // Reiniciar selección
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
            {irrigationData.season === "summer" ? "Verano Castellón" :
             irrigationData.season === "winter" ? "Invierno Castellón" :
             "Primavera/Otoño Castellón"}
          </Badge>
          
          <Badge className={
            phDiagnosis.riskLevel === "high" ? "bg-red-100 text-red-800" :
            phDiagnosis.riskLevel === "medium" ? "bg-amber-100 text-amber-800" :
            "bg-green-100 text-green-800"
          }>
            pH: {phDiagnosis.riskLevel === "high" ? "ALTO RIESGO" : 
                  phDiagnosis.riskLevel === "medium" ? "PRECAUCIÓN" : "ESTABLE"}
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
              <p className="text-slate-600">Dados de lana 2.5x2.5cm - Castellón</p>
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
              
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Lightbulb className="text-amber-600" size={18} />
                <p className="text-sm text-amber-800">
                  {irrigationConfig.mode === "auto" 
                    ? `Modo automático: ${irrigationData.pumpTime}s cada ${Math.round(irrigationData.interval)}min (${irrigationData.season})`
                    : 'Modo manual: Tú controlas los tiempos'}
                </p>
              </div>
            </div>
          </div>
          
          {irrigationConfig.showAdvanced && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3">Configuración Avanzada</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Temperatura referencia (°C)
                  </label>
                  <input
                    type="number"
                    value={irrigationConfig.temperature}
                    onChange={(e) => setIrrigationConfig({...irrigationConfig, temperature: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    min="10"
                    max="35"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estación actual
                  </label>
                  <div className="px-3 py-2 bg-white border border-slate-300 rounded-lg">
                    <span className={
                      irrigationData.season === "summer" ? "text-amber-600 font-medium" :
                      irrigationData.season === "winter" ? "text-blue-600 font-medium" :
                      "text-green-600 font-medium"
                    }>
                      {irrigationData.season === "summer" ? "Verano" :
                       irrigationData.season === "winter" ? "Invierno" :
                       "Primavera/Otoño"}
                    </span>
                    <span className="text-slate-500 text-sm ml-2">(detectada automáticamente)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
          <h3 className="font-bold text-blue-800 mb-3">💡 Recomendaciones de Riego</h3>
          <div className="space-y-3">
            {irrigationData.recommendations?.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-xl">{rec.icon}</span>
                <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{__html: rec.text}} />
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl">Diagnóstico Avanzado de pH</h2>
              <p className="text-slate-600">Análisis específico para Castellón</p>
            </div>
          </div>
          
          <Badge className={
            phDiagnosis.riskLevel === "high" ? "bg-red-100 text-red-800" :
            phDiagnosis.riskLevel === "medium" ? "bg-amber-100 text-amber-800" :
            "bg-green-100 text-green-800"
          }>
            {phDiagnosis.riskLevel === "high" ? "ALTO RIESGO" : 
             phDiagnosis.riskLevel === "medium" ? "PRECAUCIÓN" : "ESTABLE"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Problemas Detectados</h3>
            <div className="space-y-3">
              {phDiagnosis.problems.length > 0 ? (
                phDiagnosis.problems.map((problem, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border-l-4 ${
                      problem.level === "high" ? "border-red-500 bg-red-50" :
                      problem.level === "medium" ? "border-amber-500 bg-amber-50" :
                      "border-blue-500 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        problem.level === "high" ? "bg-red-100 text-red-700" :
                        problem.level === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {problem.level === "high" ? "!" : problem.level === "medium" ? "⚠" : "i"}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{problem.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{problem.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <Check className="text-green-600" size={24} />
                    <div>
                      <h4 className="font-bold text-green-700">pH Estable</h4>
                      <p className="text-sm text-green-600">No se detectaron problemas críticos de pH</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Soluciones Recomendadas</h3>
            <div className="space-y-3">
              {phDiagnosis.solutions.length > 0 ? (
                phDiagnosis.solutions.slice(0, 3).map((solution, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-white rounded-xl border border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {solution.priority}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{solution.action}</h4>
                        <p className="text-sm text-slate-600 mt-1">{solution.details}</p>
                        {solution.dosage && (
                          <p className="text-sm font-medium text-blue-700 mt-2">{solution.dosage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-600 text-center">No se requieren acciones inmediatas</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <GitCompare className="text-purple-600" size={18} />
              <h4 className="font-bold text-slate-800">Cambios Bruscos</h4>
            </div>
            <p className="text-sm text-slate-600">
              {phSpikes && phSpikes.isSpiking 
                ? `Se detectó cambio de ${phSpikes.maxChange.toFixed(1)} en 24h`
                : "Sin cambios bruscos detectados"}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="text-blue-600" size={18} />
              <h4 className="font-bold text-slate-800">CalMag</h4>
            </div>
            <p className="text-sm text-slate-600">
              {calmagNeeded.required 
                ? `Se recomiendan ${calmagNeeded.dosage}ml`
                : "No se requiere CalMag"}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="text-amber-600" size={18} />
              <h4 className="font-bold text-slate-800">Temperatura</h4>
            </div>
            <p className={`text-sm font-medium ${
              parseFloat(config.temp) > 28 ? 'text-red-600' :
              parseFloat(config.temp) > 25 ? 'text-amber-600' :
              'text-green-600'
            }`}>
              {config.temp}°C - {parseFloat(config.temp) > 28 ? 'Alto impacto en pH' :
                               parseFloat(config.temp) > 25 ? 'Moderado impacto' :
                               'Bajo impacto'}
            </p>
          </div>
        </div>
      </Card>
      
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
              <h3 className="font-bold text-slate-800">Nutrición CANNA</h3>
              <p className="text-sm text-slate-600">Aqua Vega A+B</p>
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
              
              {(() => {
                const dosage = calculateCannaDosage(plants, config.currentVol, config.targetEC, config.waterType);
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">CANNA A</span>
                      <span className="font-bold text-emerald-600">{dosage.a} ml</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">CANNA B</span>
                      <span className="font-bold text-emerald-600">{dosage.b} ml</span>
                    </div>
                  </>
                );
              })()}
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
              <h3 className="font-bold text-slate-800">Condiciones Agua</h3>
              <p className="text-sm text-slate-600">Depósito</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Volumen</span>
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
          </div>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleRotation}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
        >
          <RotateCcw className="mr-2" />
          Rotar Niveles
        </Button>
        
        <Button
          onClick={() => {
            const now = new Date().toISOString();
            setHistory([{
              id: generatePlantId(),
              date: now,
              ph: config.ph,
              ec: config.ec,
              temp: config.temp,
              notes: "Medición manual"
            }, ...history]);
            alert("✅ Medición guardada en historial");
          }}
          variant="outline"
        >
          <Clipboard className="mr-2" />
          Guardar Medición
        </Button>
        
        <Button
          onClick={() => setLastClean(new Date().toISOString())}
          variant="outline"
        >
          <ShieldAlert className="mr-2" />
          Marcar Limpieza
        </Button>
        
        <Button
          onClick={() => setShowWaterSelector(true)}
          variant="outline"
        >
          <Filter className="mr-2" />
          Cambiar Agua
        </Button>
        
        <Button
          onClick={() => setTab("calculator")}
          variant="outline"
        >
          <Brain className="mr-2" />
          Diagnóstico pH
        </Button>
      </div>
    </div>
  );

  // =================== TOWER TAB - CORREGIDO CON FORMULARIO ===================

  const TowerTab = () => {
    // Estado local para el formulario en TowerTab
    const [localSelPos, setLocalSelPos] = useState({ l: null, v: null, p: null });
    
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de la Torre</h2>
          <p className="text-slate-600">Sistema escalonado 5-5-5</p>
        </div>
        
        {/* Botón para mostrar/ocultar formulario de añadir planta */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Plantas en la Torre</h3>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
          >
            {showAddForm ? (
              <>
                <X className="mr-2" size={16} />
                Ocultar Formulario
              </>
            ) : (
              <>
                <Plus className="mr-2" size={16} />
                Añadir Nueva Planta
              </>
            )}
          </Button>
        </div>
        
        {/* Formulario para añadir planta */}
        {showAddForm && (
          <Card className="p-6 rounded-2xl mb-8">
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
                      onClick={() => setLocalSelPos({...localSelPos, l: level})}
                      className={`flex-1 py-3 rounded-lg text-center font-medium transition-all ${
                        localSelPos?.l === level 
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
                      onClick={() => setLocalSelPos({...localSelPos, v: variety})}
                      className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                        localSelPos?.v === variety 
                          ? `${VARIETIES[variety].color} text-white`
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {localSelPos?.v === variety ? VARIETIES[variety].iconSelected : VARIETIES[variety].icon}
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
                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => !ocupada && setLocalSelPos({...localSelPos, p: pos})}
                        className={`aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${
                          ocupada 
                            ? 'bg-red-100 text-red-700'
                            : localSelPos?.p === pos
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        disabled={ocupada}
                        title={ocupada ? `Ocupada por ${ocupada.v}` : `Posición ${pos}`}
                      >
                        {ocupada ? (
                          <X className="text-red-500" size={16} />
                        ) : localSelPos?.p === pos ? (
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
                if (localSelPos?.l && localSelPos?.v && localSelPos?.p) {
                  // Verificar si la posición ya está ocupada
                  const isPositionOccupied = plants.some(p => p.p === localSelPos.p);
                  if (isPositionOccupied) {
                    alert(`La posición ${localSelPos.p} ya está ocupada. Por favor selecciona otra posición.`);
                    return;
                  }
                  
                  if (plants.length >= 15) {
                    alert("La torre está llena (15/15 plantas). Elimina alguna planta antes de añadir más.");
                    return;
                  }
                  
                  setPlants([...plants, {
                    id: generatePlantId(),
                    l: localSelPos.l,
                    v: localSelPos.v,
                    p: localSelPos.p,
                    date: new Date().toISOString()
                  }]);
                  setLocalSelPos({ l: null, v: null, p: null }); // Reiniciar selección
                  alert("✅ Planta añadida correctamente");
                } else {
                  alert("Por favor selecciona nivel, variedad y posición");
                }
              }}
              disabled={!(localSelPos?.l && localSelPos?.v && localSelPos?.p)}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
            >
              <Plus className="mr-2" />
              Añadir Planta a la Torre
            </Button>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sprout className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Nivel 1 - Plántulas</h3>
                <p className="text-sm text-slate-600">Plantas jóvenes</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {plants.filter(p => p.l === 1).map(plant => (
                <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-slate-200'}`}>
                      {VARIETIES[plant.v]?.icon || <Sprout className="text-white" size={12} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{plant.v}</p>
                      <p className="text-xs text-slate-500">Posición {plant.p}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(plant.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              
              {plants.filter(p => p.l === 1).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-slate-500">No hay plántulas</p>
                </div>
              )}
            </div>
          </Card>
          
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Nivel 2 - Crecimiento</h3>
                <p className="text-sm text-slate-600">Plantas en desarrollo</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {plants.filter(p => p.l === 2).map(plant => (
                <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-slate-200'}`}>
                      {VARIETIES[plant.v]?.icon || <Activity className="text-white" size={12} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{plant.v}</p>
                      <p className="text-xs text-slate-500">Posición {plant.p}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(plant.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              
              {plants.filter(p => p.l === 2).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-slate-500">No hay plantas en crecimiento</p>
                </div>
              )}
            </div>
          </Card>
          
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Leaf className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Nivel 3 - Maduración</h3>
                <p className="text-sm text-slate-600">Plantas listas para cosechar</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {plants.filter(p => p.l === 3).map(plant => (
                <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-slate-200'}`}>
                      {VARIETIES[plant.v]?.icon || <Leaf className="text-white" size={12} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{plant.v}</p>
                      <p className="text-xs text-slate-500">Posición {plant.p}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(plant.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              
              {plants.filter(p => p.l === 3).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-slate-500">No hay plantas maduras</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="flex justify-between">
          <Button
            onClick={handleRotation}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            <RotateCcw className="mr-2" />
            Rotar Niveles
          </Button>
          
          <Button
            onClick={() => {
              if (plants.length >= 15) {
                alert("La torre está llena (15/15 plantas)");
                return;
              }
              setShowAddForm(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Plus className="mr-2" />
            Añadir Planta
          </Button>
        </div>
      </div>
    );
  };

  // =================== CALCULATOR TAB ===================

  const CalculatorTab = () => {
    const dosage = calculateCannaDosage(plants, config.currentVol, config.targetEC, config.waterType);
    
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calculadora CANNA + Diagnóstico</h2>
          <p className="text-slate-600">Cálculos exactos y diagnóstico avanzado de pH</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Calculator className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Dosis CANNA Aqua Vega</h3>
                  <p className="text-sm text-slate-600">Para {config.currentVol}L de agua</p>
                </div>
              </div>
              
              {plants.length > 0 ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                    <div className="text-center mb-4">
                      <p className="text-sm text-emerald-700">Dosis total para el depósito</p>
                      <div className="flex items-center justify-center gap-6 mt-3">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">{dosage.a}</div>
                          <p className="text-sm text-emerald-700">ml CANNA A</p>
                        </div>
                        <div className="text-2xl text-emerald-500">+</div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">{dosage.b}</div>
                          <p className="text-sm text-emerald-700">ml CANNA B</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-center text-sm text-slate-700">
                        Equivalente a <span className="font-bold text-emerald-600">{dosage.per10L.a}ml A</span> y 
                        <span className="font-bold text-emerald-600"> {dosage.per10L.b}ml B</span> por cada 10L
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-700 mb-3">📝 Instrucciones de mezcla</h4>
                    <ol className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Llena el depósito con <strong>{config.currentVol}L</strong> de agua</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                        <span>Añadir <strong>{dosage.a}ml de CANNA A</strong>, mezclar 1 minuto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                        <span>Añadir <strong>{dosage.b}ml de CANNA B</strong>, mezclar 2 minutos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                        <span>Medir EC: objetivo <strong>{config.targetEC} µS/cm</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</span>
                        <span>Ajustar pH a <strong>{config.targetPH}</strong></span>
                      </li>
                    </ol>
                  </div>
                  
                  {dosage.note && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800 text-center">
                        ⚠️ {dosage.note}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FlaskConical className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500">Añade plantas a la torre para calcular dosis</p>
                </div>
              )}
            </Card>
            
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Brain className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Diagnóstico Completo de pH</h3>
                  <p className="text-sm text-slate-600">Análisis específico para Castellón</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border-2 ${
                  phDiagnosis.riskLevel === "high" ? "border-red-200 bg-red-50" :
                  phDiagnosis.riskLevel === "medium" ? "border-amber-200 bg-amber-50" :
                  "border-green-200 bg-green-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">Estado del pH</h4>
                      <p className="text-sm text-slate-600">{config.ph} actual → {config.targetPH} objetivo</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      phDiagnosis.riskLevel === "high" ? "bg-red-100 text-red-800" :
                      phDiagnosis.riskLevel === "medium" ? "bg-amber-100 text-amber-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {phDiagnosis.summary}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3">Problemas Detectados</h4>
                    <div className="space-y-3">
                      {phDiagnosis.problems.length > 0 ? (
                        phDiagnosis.problems.map((problem, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                problem.level === "high" ? "bg-red-500" :
                                problem.level === "medium" ? "bg-amber-500" :
                                "bg-blue-500"
                              }`} />
                              <div>
                                <p className="font-medium text-slate-800">{problem.title}</p>
                                <p className="text-sm text-slate-600">{problem.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-green-700 text-center">✅ No se detectaron problemas</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3">Soluciones Recomendadas</h4>
                    <div className="space-y-3">
                      {phDiagnosis.solutions.map((solution, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-1">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{solution.action}</p>
                              <p className="text-sm text-slate-600">{solution.details}</p>
                              {solution.immediate && (
                                <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                  ACCIÓN INMEDIATA
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {phDiagnosis.warnings.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <h4 className="font-bold text-amber-800 mb-3">⚠️ Advertencias</h4>
                    <div className="space-y-2">
                      {phDiagnosis.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="text-amber-600 mt-1" size={16} />
                          <div>
                            <p className="font-medium text-amber-800">{warning.message}</p>
                            <p className="text-sm text-amber-700">{warning.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <RefreshCw className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Ajuste de pH</h3>
                  <p className="text-sm text-slate-600">De {config.ph} a {config.targetPH}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border-2 ${
                  Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' 
                    : Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.2
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <div className="text-center">
                    <p className="text-sm text-slate-700 mb-3">
                      pH actual: <span className="font-bold">{config.ph}</span> → 
                      Objetivo: <span className="font-bold">{config.targetPH}</span>
                    </p>
                    
                    {parseFloat(config.ph) > parseFloat(config.targetPH) ? (
                      <div>
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {phAdjustmentWithPretreatment.phMinus} ml
                        </div>
                        <p className="text-lg font-bold text-purple-700">pH- (Ácido)</p>
                        <p className="text-sm text-slate-600 mt-2">Reducir pH</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-pink-600 mb-2">
                          {phAdjustmentWithPretreatment.phPlus} ml
                        </div>
                        <p className="text-lg font-bold text-pink-700">pH+ (Alcalino)</p>
                        <p className="text-sm text-slate-600 mt-2">Aumentar pH</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {phAdjustmentWithPretreatment.pretreatment && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                    <h4 className="font-bold text-blue-700 mb-3">💧 Pre-tratamiento para Agua Dura</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-700">Dosis pH- inicial:</span>
                        <span className="font-bold text-blue-600">{phAdjustmentWithPretreatment.pretreatment.dosage}ml</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Ajustar a pH:</span>
                        <span className="font-bold text-blue-600">{phAdjustmentWithPretreatment.pretreatment.preAdjustmentPH}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Esperar:</span>
                        <span className="font-bold text-blue-600">{phAdjustmentWithPretreatment.pretreatment.waitingTime} min</span>
                      </div>
                      <p className="text-sm text-blue-800 mt-2">
                        {phAdjustmentWithPretreatment.pretreatment.instructions}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-3">📝 Recomendaciones para Castellón</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span><strong>Verano:</strong> El pH tiende a subir más rápido por temperatura alta</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span><strong>Agua dura:</strong> Usar ácido fosfórico en lugar de nítrico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span><strong>Ósmosis:</strong> Ajustar pH después de añadir CalMag</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Droplets className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Calculadora de CalMag</h3>
                  <p className="text-sm text-slate-600">Para agua de ósmosis y mezclas</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border-2 ${
                  calmagNeeded.required 
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      calmagNeeded.required ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {calmagNeeded.required ? `${calmagNeeded.dosage} ml` : 'No necesario'}
                    </div>
                    <p className="text-lg font-bold text-slate-700">CalMag</p>
                    <p className="text-sm text-slate-600 mt-2">
                      Para {config.currentVol}L de agua
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-3">📊 Información del Agua</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Dureza actual:</span>
                      <span className="font-bold text-blue-600">{waterCharacteristics.finalHardness} ppm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Mínimo recomendado:</span>
                      <span className="font-bold text-blue-600">{CALMAG_CONFIG.minRequiredHardness} ppm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Necesita CalMag:</span>
                      <span className={`font-bold ${calmagNeeded.required ? 'text-amber-600' : 'text-green-600'}`}>
                        {calmagNeeded.required ? 'SÍ' : 'NO'}
                      </span>
                    </div>
                  </div>
                  
                  {calmagNeeded.required && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {calmagNeeded.reason}
                      </p>
                      {calmagNeeded.instructions && (
                        <p className="text-sm font-medium text-blue-900 mt-2">
                          {calmagNeeded.instructions}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {calmagNeeded.required && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <h4 className="font-bold text-amber-700 mb-3">📝 Instrucciones de uso</h4>
                    <ol className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Añadir CalMag al agua primero</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                        <span>Mezclar bien durante 2-3 minutos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                        <span>Añadir CANNA A y B después</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-amber-100 text-amber-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                        <span>Finalmente ajustar pH si es necesario</span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // =================== CALENDAR TAB ===================

  const CalendarTab = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario de Mantenimiento</h2>
          <p className="text-slate-600">Planificación de tareas del sistema</p>
        </div>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{monthNames[currentMonth]} {currentYear}</h3>
                <p className="text-sm text-slate-600">Tareas programadas automáticamente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLastClean(new Date().toISOString())}
              >
                <ShieldAlert className="mr-2" size={16} />
                Limpieza Hecha
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center font-bold text-slate-700 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 p-2 rounded-lg border ${
                    day.isCurrentMonth
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-medium ${
                      day.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {day.dayOfMonth}
                    </span>
                    
                    {day.date.toDateString() === now.toDateString() && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {day.events.includes('measure') && (
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        📊 Medir
                      </div>
                    )}
                    
                    {day.events.includes('rotation') && (
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        🔄 Rotar
                      </div>
                    )}
                    
                    {day.events.includes('clean') && (
                      <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        🧼 Limpiar
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">📅 Próximas tareas</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Última rotación:</span>
                <span className="font-bold text-slate-800">
                  {new Date(lastRot).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Última limpieza:</span>
                <span className="font-bold text-slate-800">
                  {new Date(lastClean).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Próxima medición:</span>
                <span className="font-bold text-slate-800">
                  {(() => {
                    const nextMeasure = calendarDays.find(day => 
                      day.isCurrentMonth && 
                      day.events.includes('measure') && 
                      day.date > now
                    );
                    return nextMeasure ? nextMeasure.date.toLocaleDateString() : 'Hoy';
                  })()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // =================== HISTORY TAB ===================

  const HistoryTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Historial del Sistema</h2>
        <p className="text-slate-600">Registro de mediciones y eventos</p>
      </div>
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <BarChart className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Registro Histórico</h3>
            <p className="text-sm text-slate-600">Todas las mediciones guardadas</p>
          </div>
        </div>
        
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.slice(0, 10).map((record, index) => (
              <div key={record.id} className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                      <Clipboard className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-sm text-slate-600">{record.notes || "Medición manual"}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHistoryRecord(record.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">pH</span>
                      <span className="font-bold text-purple-600">{record.ph}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">EC</span>
                      <span className="font-bold text-blue-600">{record.ec} µS/cm</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Temperatura</span>
                      <span className="font-bold text-amber-600">{record.temp}°C</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {history.length > 10 && (
              <div className="text-center py-4">
                <p className="text-slate-600">
                  Mostrando las 10 mediciones más recientes de {history.length} totales
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">No hay historial de mediciones</p>
            <p className="text-sm text-slate-400 mt-2">
              Guarda mediciones desde el panel principal para verlas aquí
            </p>
          </div>
        )}
      </Card>
    </div>
  );

  // =================== TIPS TAB ===================

  const TipsSection = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Consejos y Mejores Prácticas</h2>
        <p className="text-slate-600">Aprende a optimizar tu sistema hidropónico</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">CANNA Aqua Vega</h3>
              <p className="text-sm text-slate-600">Mejores prácticas</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>CANNA A y B siempre por separado:</strong> Nunca mezclar directamente. Primero A, mezclar, luego B.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Orden correcto:</strong> Agua → CalMag (si es necesario) → CANNA A → Mezclar → CANNA B → Mezclar → pH- → Mezclar.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Para agua dura:</strong> Considerar CANNA Aqua Flores o CANNA Hydro en lugar de Aqua Vega.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Gestión del Agua</h3>
              <p className="text-sm text-slate-600">Ósmosis y CalMag</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>Agua de ósmosis:</strong> Siempre añadir CalMag antes que los nutrientes principales.
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Agua dura:</strong> Considerar mezclar con ósmosis para reducir la dureza.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Temperatura ideal:</strong> Mantener entre 18-25°C. Por encima de 28°C es peligroso.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TreePine className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Lana de Roca Grodan</h3>
              <p className="text-sm text-slate-600">Dados pequeños 2.5x2.5cm</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>Preparación inicial:</strong> Remojar en agua con pH 5.5 y EC 0.6 durante 24h.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Riegos:</strong> Cortos y frecuentes. Los dados pequeños secan rápido.
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Humedad ideal:</strong> Mantener entre 60-80% de humedad en el dado.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ThermometerSun className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Clima Castellón</h3>
              <p className="text-sm text-slate-600">Consideraciones locales</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Verano:</strong> Viento poniente (12:00-20:00) reduce humedad 30%. Aumentar frecuencia de riego.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Invierno:</strong> Humedad alta reduce necesidades de riego. Espaciar riegos.
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Temperatura:</strong> En verano, sombrear el depósito para evitar sobrecalentamiento.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // =================== RENDER PRINCIPAL ===================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">HydroMaster CANNA</h1>
                <p className="text-xs text-slate-600">Diagnóstico pH • Ósmosis • CalMag • Castellón</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {step >= 4 ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("¿Reiniciar configuración? Se perderán todos los datos.")) {
                        localStorage.removeItem("hydro_master_canna");
                        setStep(0);
                        setPlants([]);
                        setConfig({ 
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
                        setIrrigationConfig({
                          enabled: true,
                          mode: "auto",
                          pumpTime: 10,
                          interval: 30,
                          temperature: "22",
                          showAdvanced: false
                        });
                        setTab("dashboard");
                        setSelPos({ l: null, v: null, p: null });
                        setShowAddForm(false);
                      }
                    }}
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Reiniciar
                  </Button>
                  
                  <Badge className={
                    alerts.some(a => a.priority === 1) 
                      ? "bg-red-100 text-red-800 animate-pulse" 
                      : alerts.some(a => a.priority === 2)
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }>
                    {alerts.filter(a => a.priority === 1).length > 0 
                      ? `${alerts.filter(a => a.priority === 1).length} ALERTAS` 
                      : alerts.filter(a => a.priority === 2).length > 0
                      ? `${alerts.filter(a => a.priority === 2).length} advertencias`
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

      {step >= 4 && (
        <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="container mx-auto p-4 max-w-6xl">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="dashboard" onClick={() => setTab("dashboard")}>
                <Home size={16} className="mr-2" />
                Panel
              </TabsTrigger>
              <TabsTrigger value="tower" onClick={() => setTab("tower")}>
                <TreePine size={16} className="mr-2" />
                Torre
              </TabsTrigger>
              <TabsTrigger value="calculator" onClick={() => setTab("calculator")}>
                <Brain size={16} className="mr-2" />
                Diagnóstico
              </TabsTrigger>
              <TabsTrigger value="calendar" onClick={() => setTab("calendar")}>
                <Calendar size={16} className="mr-2" />
                Calendario
              </TabsTrigger>
              <TabsTrigger value="history" onClick={() => setTab("history")}>
                <BarChart size={16} className="mr-2" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="tips" onClick={() => setTab("tips")}>
                <Lightbulb size={16} className="mr-2" />
                Consejos
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 max-w-6xl">
        {step < 4 ? (
          <div className="max-w-2xl mx-auto">
            {renderStep()}
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="dashboard" className="mt-6">
              <DashboardTab />
            </TabsContent>
            
            <TabsContent value="tower" className="mt-6">
              <TowerTab />
            </TabsContent>
            
            <TabsContent value="calculator" className="mt-6">
              <CalculatorTab />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-6">
              <CalendarTab />
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <HistoryTab />
            </TabsContent>
            
            <TabsContent value="tips" className="mt-6">
              <TipsSection />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 rounded-2xl max-w-md w-full">
            <h3 className="font-bold text-slate-800 text-lg mb-3">Eliminar Planta</h3>
            <p className="text-slate-600 mb-6">¿Estás seguro de que quieres eliminar esta planta? Esta acción no se puede deshacer.</p>
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

      {showWaterSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Cambiar Tipo de Agua</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWaterSelector(false)}
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(WATER_TYPES).map(([key, water]) => (
                <div
                  key={key}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    config.waterType === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => {
                    setConfig({...config, waterType: key});
                    setShowWaterSelector(false);
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {water.icon}
                    <span className="font-bold text-slate-800">{water.name}</span>
                  </div>
                  <p className="text-sm text-slate-600">{water.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              HydroMaster CANNA • Diagnóstico pH • Ósmosis/CalMag • Castellón
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
                        ? `${irrigationData.pumpTime}s cada ${Math.round(irrigationData.interval)}min` 
                        : 'INACTIVO'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Brain className={`${
                      phDiagnosis.riskLevel === "high" ? "text-red-500" :
                      phDiagnosis.riskLevel === "medium" ? "text-amber-500" :
                      "text-green-500"
                    }`} size={14} />
                    <span className="text-sm text-slate-600">
                      pH: {phDiagnosis.riskLevel === "high" ? "ALERTA" : 
                            phDiagnosis.riskLevel === "medium" ? "PRECAUCIÓN" : "ESTABLE"}
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
