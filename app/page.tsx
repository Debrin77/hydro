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
  Thermometer as Temp, Wind as Breeze
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
// CONFIGURACIÓN ESPECÍFICA PARA DADOS PEQUEÑOS DE LANA DE ROCA (2.5x2.5cm)
// ============================================================================

const ROCKWOOL_CHARACTERISTICS = {
  name: "Dados Grodan 2.5x2.5cm",
  size: "2.5x2.5cm",
  waterRetention: 0.85,           // Menor que cubos grandes
  drainageRate: 0.20,             // Drena más rápido por tamaño pequeño
  airPorosity: 0.35,              // Más aire por volumen reducido
  phNeutral: 7.0,
  bufferCapacity: 0.1,            // Muy poca capacidad buffer
  
  // SATURACIÓN RÁPIDA - Dados pequeños
  saturationTime: {
    seedling: 8,     // 8 segundos para saturar completamente
    growth: 10,      // 10 segundos
    mature: 12       // 12 segundos
  },
  
  // HUMEDAD ÓPTIMA PARA DADOS PEQUEÑOS
  saturationLevels: {
    optimal: 0.75,      // 75% ideal
    seedling: 0.65,     // 65% para plántulas (no encharcar)
    growth: 0.75,       // 75% para crecimiento
    mature: 0.80        // 80% para maduras (más consumo)
  },
  
  // SECADO RÁPIDO - Característica clave
  dryingTimes: {
    seedling: { summer: 2.0, winter: 4.5, spring: 3.0 },    // horas
    growth: { summer: 1.5, winter: 3.5, spring: 2.5 },
    mature: { summer: 1.0, winter: 3.0, spring: 2.0 }
  },
  
  // FILOSOFÍA: Riegos CORTOS y FRECUENTES para dados pequeños
  irrigationPrinciples: {
    cycleLength: 10,           // 10 segundos es óptimo
    drainagePercentage: 0.15,  // 15% de drenaje es suficiente
    drybackPeriod: 0.25        // Dejar secar 25% entre riegos
  },
  
  // VOLUMEN APROXIMADO POR DADO
  volumePerDado: 15, // ml de agua que retiene cuando está saturado (aproximado)
  
  // PREPARACIÓN ESPECÍFICA
  preparation: {
    phSoak: 5.5,      // Remojar a pH 5.5 (no 5.8)
    ecSoak: 0.6,      // EC inicial 0.6 mS/cm (600 µS/cm)
    soakTime: 24      // Horas de remojo mínimo
  }
};

// CONFIGURACIÓN DE BOMBA PARA SISTEMA DE GOTEO EN DADOS PEQUEÑOS
const PUMP_CONFIG = {
  power: 7,
  flowRate: 600,         // 600L/h = 10L/min = 166ml/seg
  
  // CÁLCULO DE DISTRIBUCIÓN:
  // 166ml/seg ÷ 15 plantas = ~11ml/seg por planta
  // Con 10 segundos: 110ml por planta por riego
  
  // VOLUMEN POR ETAPA (ml por riego) - CALCULADO
  volumePerRiego: {
    seedling: 88,    // 8 seg × 11ml/seg = 88ml
    growth: 110,     // 10 seg × 11ml/seg = 110ml
    mature: 132      // 12 seg × 11ml/seg = 132ml
  },
  
  // TIEMPOS DE BOMBA POR ETAPA (segundos) - OPTIMIZADOS
  pumpTimes: {
    seedling: {
      summer: { day: 8, night: 12 },     // 8s día, 12s noche
      winter: { day: 10, night: 15 },    // 10s día, 15s noche
      spring: { day: 9, night: 14 }      // 9s día, 14s noche
    },
    growth: {
      summer: { day: 10, night: 15 },    // 10s día, 15s noche
      winter: { day: 12, night: 18 },    // 12s día, 18s noche
      spring: { day: 11, night: 16 }     // 11s día, 16s noche
    },
    mature: {
      summer: { day: 12, night: 18 },    // 12s día, 18s noche
      winter: { day: 15, night: 22 },    // 15s día, 22s noche
      spring: { day: 13, night: 20 }     // 13s día, 20s noche
    }
  },
  
  // INTERVALOS ENTRE RIEGOS (minutos) - FRECUENCIAS ALTAS
  intervals: {
    seedling: {
      summer: { day: 40, night: 100 },   // 40min día, 1h40min noche
      winter: { day: 80, night: 160 },   // 1h20min día, 2h40min noche
      spring: { day: 55, night: 130 }    // 55min día, 2h10min noche
    },
    growth: {
      summer: { day: 30, night: 75 },    // 30min día, 1h15min noche
      winter: { day: 60, night: 120 },   // 1h día, 2h noche
      spring: { day: 42, night: 100 }    // 42min día, 1h40min noche
    },
    mature: {
      summer: { day: 20, night: 50 },    // 20min día, 50min noche
      winter: { day: 45, night: 90 },    // 45min día, 1h30min noche
      spring: { day: 30, night: 70 }     // 30min día, 1h10min noche
    }
  },
  
  // AJUSTES POR CLIMA CASTELLÓN - OPTIMIZADOS PARA DADOS PEQUEÑOS
  castellonAdjustments: {
    summer: {
      vientoPoniente: 0.7,   // REDUCIR intervalo 30% (más frecuencia)
      olaCalor: 0.6,         // REDUCIR intervalo 40% en ola calor
      humedadAlta: 1.3       // AUMENTAR intervalo 30% con humedad >80%
    },
    winter: {
      lluvia: 1.6,           // AUMENTAR intervalo 60% si llueve
      frio: 1.4,             // AUMENTAR intervalo 40% si <10°C
      humedadAlta: 1.5       // AUMENTAR intervalo 50% con humedad >90%
    },
    spring: {
      normal: 1.0,
      viento: 0.8            // REDUCIR 20% con viento
    }
  },
  
  // HORARIOS RECOMENDADOS PARA CASTELLÓN CON DADOS PEQUEÑOS
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

// CONFIGURACIÓN CLIMA CASTELLÓN - ACTUALIZADA PARA DADOS PEQUEÑOS
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
  
  // EVAPOTRANSPIRACIÓN AJUSTADA PARA DADOS PEQUEÑOS
  evapotranspiracion: {
    verano: 7.0,    // mm/día (ALTA - dados secan rápido)
    invierno: 2.5,  // mm/día
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
// FUNCIONES DE CÁLCULO PARA DADOS PEQUEÑOS DE LANA DE ROCA
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
  
  // Base según etapa - DADOS PEQUEÑOS tienen humedad más variable
  let baseMoisture = 0;
  if (stats.matureCount > 0) {
    baseMoisture = ROCKWOOL_CHARACTERISTICS.saturationLevels.mature * 100;
  } else if (stats.growthCount > 0) {
    baseMoisture = ROCKWOOL_CHARACTERISTICS.saturationLevels.growth * 100;
  } else {
    baseMoisture = ROCKWOOL_CHARACTERISTICS.saturationLevels.seedling * 100;
  }
  
  // Ajuste por temperatura - MÁS SENSIBLE en dados pequeños
  const temp = parseFloat(irrigationConfig.temperature || 22);
  let tempAdjustment = 1.0;
  if (temp > 32) tempAdjustment = 0.5;   // -50% humedad en calor extremo
  else if (temp > 30) tempAdjustment = 0.6;
  else if (temp > 28) tempAdjustment = 0.7;
  else if (temp > 25) tempAdjustment = 0.8;
  else if (temp > 22) tempAdjustment = 0.9;
  else if (temp < 15) tempAdjustment = 1.3;
  else if (temp < 10) tempAdjustment = 1.5;
  else if (temp < 5) tempAdjustment = 1.8;
  
  // Ajuste por humedad ambiental (Castellón)
  let humidityAdjustment = 1.0;
  if (season === "summer") humidityAdjustment = 0.85; // Verano más seco
  else if (season === "winter") humidityAdjustment = 1.15; // Invierno húmedo
  
  // Ajuste por viento poniente (Castellón específico)
  let windAdjustment = 1.0;
  if (hour >= 12 && hour <= 20 && season === "summer") {
    windAdjustment = 0.7; // -30% humedad por viento seco
  }
  
  // Hora del día - DADOS secan más rápido de día
  let timeAdjustment = 1.0;
  if (isDaytime) {
    timeAdjustment = 0.9; // -10% humedad de día
  } else {
    timeAdjustment = 1.1; // +10% humedad de noche
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
  
  // Determinar etapa dominante
  let dominantStage = "seedling";
  if (stats.matureCount >= stats.growthCount && stats.matureCount >= stats.seedlingCount) {
    dominantStage = "mature";
  } else if (stats.growthCount >= stats.seedlingCount) {
    dominantStage = "growth";
  }
  
  // Obtener configuración base según etapa y estación
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
  
  // Si está en modo manual, usar valores del usuario
  if (irrigationConfig.mode === "manual") {
    pumpTime = irrigationConfig.pumpTime;
    interval = irrigationConfig.interval;
  }
  
  // AJUSTES ESPECÍFICOS PARA DADOS PEQUEÑOS EN CASTELLÓN
  
  const temp = parseFloat(irrigationConfig.temperature || 22);
  
  // 1. Ajuste por temperatura (más sensible en dados pequeños)
  if (temp > 32) {
    interval = Math.max(15, interval * 0.5); // +50% frecuencia calor extremo
  } else if (temp > 30) {
    interval = Math.max(18, interval * 0.6); // +40% frecuencia
  } else if (temp > 28) {
    interval = Math.max(20, interval * 0.7); // +30% frecuencia
  } else if (temp > 25) {
    interval = Math.max(25, interval * 0.8); // +20% frecuencia
  } else if (temp < 10) {
    interval = interval * 1.5; // -33% frecuencia en frío
  } else if (temp < 15) {
    interval = interval * 1.3; // -23% frecuencia
  }
  
  // 2. Ajuste por viento poniente (VERANO, TARDE)
  if (hour >= 12 && hour <= 20 && season === "summer") {
    interval = Math.max(15, interval * 0.7); // +30% frecuencia
  }
  
  // 3. Ajuste por humedad (estimada)
  if (season === "winter") {
    // Invierno húmedo en Castellón
    interval = interval * 1.2; // -17% frecuencia
  }
  
  // Calcular estadísticas
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
  
  // Calcular agua por ciclo (ml) - ESPECÍFICO PARA DADOS
  let waterPerCycle = 0;
  plants.forEach(plant => {
    if (plant.l === 1) waterPerCycle += PUMP_CONFIG.volumePerRiego.seedling;
    else if (plant.l === 2) waterPerCycle += PUMP_CONFIG.volumePerRiego.growth;
    else waterPerCycle += PUMP_CONFIG.volumePerRiego.mature;
  });
  
  const totalWaterPerDay = Math.round((waterPerCycle * cyclesPerDay) / 1000);
  const energyConsumption = Math.round((pumpTime * cyclesPerDay / 3600) * PUMP_CONFIG.power * 100) / 100;
  
  const rockwoolMoisture = calculateRockwoolMoisture(plants, irrigationConfig, currentTime);
  
  // Calcular tiempos para cada etapa (útil para sistema escalonado)
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
  
  // Recomendaciones por etapa en sistema escalonado
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
  
  // Recomendación clave para dados pequeños
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

// ============================================================================
// FUNCIONES DE CÁLCULO RESTANTES (MANTENIDAS)
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
  const [expandedTips, setExpandedTips] = useState({});
  
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
  
  // Configuración de riego - VALORES INICIALES PARA DADOS PEQUEÑOS
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    pumpTime: 10,     // 10 segundos inicial (óptimo para dados pequeños)
    interval: 30,     // 30 minutos inicial
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
    }
  };

  const toggleTip = (tipId) => {
    setExpandedTips(prev => ({
      ...prev,
      [tipId]: !prev[tipId]
    }));
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
  }, [config, lastClean, plants, irrigationData]);

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
                  <h3 className="font-bold text-slate-800">CANNA Aqua Vega</h3>
                  <p className="text-sm text-slate-600">Cálculos exactos de dosis y EC</p>
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
                    <h3 className="font-bold text-slate-800">Tipo de Agua</h3>
                    <p className="text-sm text-slate-600">Selecciona el agua que usas</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-blue-800">
                        {WATER_TYPES[config.waterType].recommendation}
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
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="text-purple-600" size={18} />
                      <h4 className="font-bold text-purple-700">Importancia del pH</h4>
                    </div>
                    <p className="text-sm text-slate-700">
                      El pH controla la disponibilidad de nutrientes. Fuera de rango, las plantas no pueden absorber nutrientes aunque estén presentes en el agua.
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
      <h2 className="text-2xl font-bold text-slate-800">Consejos Maestros - Dados de Lana de Roca 2.5x2.5cm</h2>
      
      {/* Sistema Específico para Dados Pequeños */}
      <Card className="rounded-3xl border-2 border-cyan-100 overflow-hidden shadow-lg bg-white">
        <div 
          className="p-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-between cursor-pointer"
          onClick={() => toggleTip('dados_pequenos')}
        >
          <div className="flex items-center gap-3">
            <Droplet size={24} />
            <h3 className="font-bold">Sistema Específico: Dados Pequeños de Lana (2.5x2.5cm)</h3>
          </div>
          {expandedTips.dados_pequenos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expandedTips.dados_pequenos && (
          <div className="p-6 text-sm text-slate-700 space-y-4">
            <div className="space-y-3">
              <h4 className="font-bold text-cyan-700">🎯 CONFIGURACIÓN EXACTA PARA TU SISTEMA</h4>
              
              <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                <h5 className="font-bold text-cyan-700 mb-2">TU EQUIPO REAL:</h5>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>Dados Grodan 2.5x2.5cm</strong> - Volumen: ~15ml cuando saturado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>Bomba 7W (600L/h)</strong> → 11ml/seg por planta → <strong>10 segundos</strong> = 110ml</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>Riego por goteo desde arriba</strong> - El agua cae directamente sobre el dado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>Sistema escalonado 5-5-5</strong> - 15 plantas total en 3 niveles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 mt-1" size={16} />
                    <span><strong>Ubicación: Castellón</strong> - Clima mediterráneo con viento poniente</span>
                  </li>
                </ul>
              </div>
              
              <h5 className="font-bold text-cyan-700 mt-4">⏱️ TIEMPOS CORRECTOS CONFIRMADOS:</h5>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-cyan-50">
                      <th className="border border-cyan-200 p-2 text-left font-bold text-cyan-700">Etapa</th>
                      <th className="border border-cyan-200 p-2 text-center font-bold text-cyan-700">Tiempo Bomba</th>
                      <th className="border border-cyan-200 p-2 text-center font-bold text-cyan-700">Volumen/planta</th>
                      <th className="border border-cyan-200 p-2 text-center font-bold text-cyan-700">Frecuencia Día*</th>
                      <th className="border border-cyan-200 p-2 text-center font-bold text-cyan-700">Frecuencia Noche*</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-cyan-100 p-2 font-semibold">Plántulas 🌱</td>
                      <td className="border border-cyan-100 p-2 text-center font-bold text-blue-600">8-10 seg</td>
                      <td className="border border-cyan-100 p-2 text-center">90-110ml</td>
                      <td className="border border-cyan-100 p-2 text-center">Cada 40min</td>
                      <td className="border border-cyan-100 p-2 text-center">Cada 100min</td>
                    </tr>
                    <tr className="bg-cyan-50/50">
                      <td className="border border-cyan-100 p-2 font-semibold">Crecimiento 🌿</td>
                      <td className="border border-cyan-100 p-2 text-center font-bold text-green-600">10-12 seg</td>
                      <td className="border border-cyan-100 p-2 text-center">110-132ml</td>
                      <td className="border border-cyan-100 p-2 text-center">Cada 30min</td>
                      <td className="border border-cyan-100 p-2 text-center">Cada 75min</td>
                    </tr>
                    <tr>
                      <td className="border border-cyan-100 p-2 font-semibold">Maduras 🥬</td>
                      <td className="border border-cyan-100 p-2 text-center font-bold text-purple-600">12-15 seg</td>
                      <td className="border border-cyan-100 p-2 text-center">132-165ml</td>
                      <td className="border border-cyan-100 p-2 text-center">Cada 20min</td>
                      <td className="border border-cyan-100 p-2 text-center">Cada 50min</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-slate-500 mt-2 text-center">* Verano Castellón - Ajustar según temperatura real</p>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <h5 className="font-bold text-green-700">✅ VERIFICACIÓN PRÁCTICA:</h5>
                <p className="text-sm text-green-800 mt-2">
                  <strong>Después de 10 segundos de riego:</strong> El dado debe estar completamente húmedo 
                  (no encharcado) y gotear ligeramente por abajo. Si solo se moja la superficie → aumentar 2-3 segundos.
                  Si el agua escurre demasiado rápido → reducir 2-3 segundos.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <h5 className="font-bold text-amber-700">⚠️ CARACTERÍSTICA CLAVE DE DADOS PEQUEÑOS:</h5>
                <p className="text-sm text-amber-800 mt-2">
                  Los dados de 2.5cm <strong>secan MUY RÁPIDO</strong> (1-3 horas en verano). Por eso necesitan 
                  riegos cortos pero frecuentes. NO aplicar la filosofía de cubos grandes ("riegos largos y espaciados").
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Filosofía de Riego para Dados Pequeños */}
      <Card className="rounded-3xl border-2 border-blue-100 overflow-hidden shadow-lg bg-white">
        <div 
          className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between cursor-pointer"
          onClick={() => toggleTip('filosofia_dados')}
        >
          <div className="flex items-center gap-3">
            <Zap size={24} />
            <h3 className="font-bold">Filosofía de Riego para Dados Pequeños</h3>
          </div>
          {expandedTips.filosofia_dados ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expandedTips.filosofia_dados && (
          <div className="p-6 text-sm text-slate-700 space-y-4">
            <div className="space-y-3">
              <h4 className="font-bold text-blue-700 text-lg">🎯 PRINCIPIO FUNDAMENTAL PARA DADOS DE 2.5cm</h4>
              <p className="font-semibold text-slate-800">
                "Riegos CORTOS (8-15s) y FRECUENTES (cada 20-90min)"
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h5 className="font-bold text-blue-700 mb-2">✅ LO CORRECTO PARA DADOS PEQUEÑOS:</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={16} />
                      <span><strong>8-15 segundos</strong> por riego</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={16} />
                      <span><strong>Cada 20-90 minutos</strong> (según etapa y clima)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={16} />
                      <span>Mojar completamente el dado pequeño</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={16} />
                      <span>Dejar secar un 20-30% entre riegos</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <h5 className="font-bold text-red-700 mb-2">❌ LO INCORRECTO PARA DADOS PEQUEÑOS:</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-1" size={16} />
                      <span>Riegos de 30-60 segundos (para cubos grandes)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-1" size={16} />
                      <span>Esperar 2-4 horas entre riegos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-1" size={16} />
                      <span>Dejar que se seque completamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-1" size={16} />
                      <span>Mantener constantemente encharcado</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <h5 className="font-bold text-emerald-700">¿POR QUÉ ES DIFERENTE A CUBOS GRANDES?</h5>
                <p className="text-slate-700">
                  Un dado de 2.5cm tiene <strong>poca reserva de agua</strong> y <strong>gran superficie de evaporación</strong>. 
                  Se seca 3-4 veces más rápido que un cubo de 10cm. Por eso necesita riegos frecuentes pero 
                  con volúmenes pequeños que no lo encharquen.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Preparación de Dados de 2.5cm */}
      <Card className="rounded-3xl border-2 border-amber-100 overflow-hidden shadow-lg bg-white">
        <div 
          className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between cursor-pointer"
          onClick={() => toggleTip('preparacion_dados')}
        >
          <div className="flex items-center gap-3">
            <Sprout size={24} />
            <h3 className="font-bold">Preparación de Dados de 2.5x2.5cm</h3>
          </div>
          {expandedTips.preparacion_dados ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expandedTips.preparacion_dados && (
          <div className="p-6 text-sm text-slate-700 space-y-4">
            <div className="space-y-3">
              <h4 className="font-bold text-amber-700">PASO 1: AJUSTE DE pH (ESPECIAL PARA DADOS PEQUEÑOS)</h4>
              <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-300 space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">1.</span>
                  <span>Prepara solución con <strong>pH 5.2</strong> (más bajo que para cubos)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">2.</span>
                  <span>Sumerge dados <strong>12-24 horas</strong> (se saturan rápido)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">3.</span>
                  <span>Escurrir SIN APRETAR - Dejar que drene naturalmente</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">4.</span>
                  <span>pH final del dado: <strong>5.8-6.0</strong> (perfecto)</span>
                </p>
              </div>
              
              <h4 className="font-bold text-amber-700 mt-4">PASO 2: EC INICIAL PARA DADOS PEQUEÑOS</h4>
              <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-300 space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Primer remojo: <strong>EC 0.3-0.4 mS/cm (300-400 µS/cm)</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>1/5 de dosis normal</strong> de CANNA Aqua Vega</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Plántulas recién germinadas: <strong>EC 0.6 mS/cm máximo</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Los dados pequeños acumulan sales más rápido → EC inicial baja</span>
                </p>
              </div>
              
              <h4 className="font-bold text-amber-700 mt-4">PASO 3: SIEMBRA CORRECTA EN DADOS PEQUEÑOS</h4>
              <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-300 space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>Hacer hoyo de <strong>5mm</strong> con lápiz estéril (no muy profundo)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>Colocar semilla/plántula, cubrir ligeramente con lana triturada</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>Primer riego: <strong>5-10ml</strong> de solución nutritiva</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span><strong>NO aplastar</strong> el dado - Mantener estructura aireada</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>Colocar en torre cuando raíces asomen por abajo (2-4 días)</span>
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
                <p className="font-bold text-red-700">⚠️ ERROR COMÚN CON DADOS PEQUEÑOS:</p>
                <p className="text-sm text-red-800 mt-1">
                  NO uses el mismo pH/EC que para cubos grandes. Los dados pequeños tienen 
                  menos capacidad buffer y acumulan sales más rápido. pH 5.2 para remojo y 
                  EC baja inicial son CRÍTICOS.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Calendario Anual de Riego para Dados en Castellón */}
      <Card className="rounded-3xl border-2 border-emerald-100 overflow-hidden shadow-lg bg-white">
        <div 
          className="p-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex items-center justify-between cursor-pointer"
          onClick={() => toggleTip('calendario_dados')}
        >
          <div className="flex items-center gap-3">
            <Calendar size={24} />
            <h3 className="font-bold">Calendario Anual de Riego - Dados en Castellón</h3>
          </div>
          {expandedTips.calendario_dados ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expandedTips.calendario_dados && (
          <div className="p-6 text-sm text-slate-700 space-y-6">
            {/* VERANO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sun className="text-amber-600" size={24} />
                <h4 className="font-bold text-amber-700 text-lg">VERANO Castellón (Junio-Agosto)</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="border border-amber-200 p-2 text-left font-bold text-amber-700">Etapa</th>
                      <th className="border border-amber-200 p-2 text-center font-bold text-amber-700">Día ☀️</th>
                      <th className="border border-amber-200 p-2 text-center font-bold text-amber-700">Noche 🌙</th>
                      <th className="border border-amber-200 p-2 text-center font-bold text-amber-700">Tiempo Bomba</th>
                      <th className="border border-amber-200 p-2 text-center font-bold text-amber-700">Con viento*</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-amber-100 p-2 font-semibold">Plántulas 🌱</td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-blue-600">40 min</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-purple-600">100 min</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">8s día / 12s noche</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-red-600">28 min</span>
                      </td>
                    </tr>
                    <tr className="bg-amber-50/50">
                      <td className="border border-amber-100 p-2 font-semibold">Crecimiento 🌿</td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-blue-600">30 min</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-purple-600">75 min</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">10s día / 15s noche</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-red-600">21 min</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-amber-100 p-2 font-semibold">Maduras 🥬</td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-blue-600">20 min</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-purple-600">50 min</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">12s día / 18s noche</span>
                      </td>
                      <td className="border border-amber-100 p-2 text-center">
                        <span className="font-bold text-red-600">14 min</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-slate-500 mt-2 text-center">* Viento poniente 12:00-20:00: Reducir intervalo 30%</p>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h5 className="font-bold text-amber-700 mb-2">💡 CONSEJOS VERANO CASTELLÓN PARA DADOS:</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span><strong>¡Ojo con el viento poniente!</strong> 12:00-20:00 → +30% frecuencia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span><strong>Temperatura &gt;30°C:</strong> Añadir riego extra al anochecer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span><strong>Horario ideal:</strong> 06:00-10:00 y 18:00-21:00</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span><strong>Evitar:</strong> 12:00-16:00 (máxima evaporación)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>Los dados de 2.5cm pueden secarse en <strong>1 hora</strong> con viento</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* INVIERNO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ThermometerCold className="text-blue-600" size={24} />
                <h4 className="font-bold text-blue-700 text-lg">INVIERNO Castellón (Diciembre-Febrero)</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-blue-200 p-2 text-left font-bold text-blue-700">Etapa</th>
                      <th className="border border-blue-200 p-2 text-center font-bold text-blue-700">Día ☀️</th>
                      <th className="border border-blue-200 p-2 text-center font-bold text-blue-700">Noche 🌙</th>
                      <th className="border border-blue-200 p-2 text-center font-bold text-blue-700">Tiempo Bomba</th>
                      <th className="border border-blue-200 p-2 text-center font-bold text-blue-700">Con lluvia*</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-blue-100 p-2 font-semibold">Plántulas 🌱</td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-blue-600">80 min</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-purple-600">160 min</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">10s día / 15s noche</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-cyan-600">128 min</span>
                      </td>
                    </tr>
                    <tr className="bg-blue-50/50">
                      <td className="border border-blue-100 p-2 font-semibold">Crecimiento 🌿</td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-blue-600">60 min</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-purple-600">120 min</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">12s día / 18s noche</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-cyan-600">96 min</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-blue-100 p-2 font-semibold">Maduras 🥬</td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-blue-600">45 min</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-purple-600">90 min</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">15s día / 22s noche</span>
                      </td>
                      <td className="border border-blue-100 p-2 text-center">
                        <span className="font-bold text-cyan-600">72 min</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-slate-500 mt-2 text-center">* Días de lluvia: Aumentar intervalo 60%</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h5 className="font-bold text-blue-700 mb-2">💡 CONSEJOS INVIERNO CASTELLÓN PARA DADOS:</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span><strong>Humedad alta:</strong> Los dados tardan más en secarse (3-5 horas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span><strong>Riega al mediodía:</strong> 11:00-14:00 (horas más cálidas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span><strong>Días de lluvia:</strong> Reducir frecuencia 60%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span><strong>Temperatura &lt;15°C:</strong> Aumentar tiempo de bomba (más agua cada riego)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Vigilar hongos: La humedad alta favorece patógenos</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* PRIMAVERA/OTOÑO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="text-green-600" size={24} />
                <h4 className="font-bold text-green-700 text-lg">PRIMAVERA/OTOÑO Castellón</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="border border-green-200 p-2 text-left font-bold text-green-700">Etapa</th>
                      <th className="border border-green-200 p-2 text-center font-bold text-green-700">Día ☀️</th>
                      <th className="border border-green-200 p-2 text-center font-bold text-green-700">Noche 🌙</th>
                      <th className="border border-green-200 p-2 text-center font-bold text-green-700">Tiempo Bomba</th>
                      <th className="border border-green-200 p-2 text-center font-bold text-green-700">Ajuste temperatura</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-green-100 p-2 font-semibold">Plántulas 🌱</td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-blue-600">55 min</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-purple-600">130 min</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">9s día / 14s noche</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="text-sm">±20% según temp</span>
                      </td>
                    </tr>
                    <tr className="bg-green-50/50">
                      <td className="border border-green-100 p-2 font-semibold">Crecimiento 🌿</td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-blue-600">42 min</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-purple-600">100 min</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">11s día / 16s noche</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="text-sm">±25% según temp</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-green-100 p-2 font-semibold">Maduras 🥬</td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-blue-600">30 min</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-purple-600">70 min</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="font-bold text-emerald-600">13s día / 20s noche</span>
                      </td>
                      <td className="border border-green-100 p-2 text-center">
                        <span className="text-sm">±30% según temp</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h5 className="font-bold text-green-700 mb-2">💡 CONSEJOS TEMPORADAS INTERMEDIAS:</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span><strong>Época óptima</strong> para crecimiento rápido en dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Ajusta según <strong>temperatura real del día</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Días soleados: Riego como verano</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Días nublados: Riego como invierno</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Observa las plantas: <strong>hojas perezosas</strong> = más agua</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* RESUMEN FINAL */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200">
              <h5 className="font-bold text-purple-700 text-lg mb-3">📊 RESUMEN: AJUSTE EN TIEMPO REAL PARA DADOS</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h6 className="font-bold text-purple-600">🔍 MÉTODO DEL TACTO PARA DADOS:</h6>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">1.</span>
                      <span>Toca el dado 30min después de regar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">2.</span>
                      <span><strong>Demasiado húmedo</strong> (gotea): +10min al intervalo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">3.</span>
                      <span><strong>Demasiado seco</strong> (duro): -10min al intervalo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">4.</span>
                      <span><strong>Óptimo:</strong> Húmedo al tacto, flexible, no gotea</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h6 className="font-bold text-purple-600">🌱 SEÑALES DE LAS PLANTAS EN DADOS:</h6>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">✓</span>
                      <span><strong>Hojas vibrantes, erectas:</strong> Riego correcto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">⚠️</span>
                      <span><strong>Hojas caídas (tallo firme):</strong> Dado demasiado seco</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">❌</span>
                      <span><strong>Hojas amarillas + caídas + tallo blando:</strong> Exceso de agua/hongos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">🔥</span>
                      <span><strong>Crecimiento lento + hojas pequeñas:</strong> Dado demasiado seco frecuentemente</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
                <p className="text-sm font-bold text-purple-700 text-center">
                  💎 REGLA DE ORO PARA DADOS 2.5cm: <strong>Mejor mantener húmedo que dejar secar.</strong> 
                  Los dados pequeños no perdonan la deshidratación.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Sistema 5-5-5 con Dados Pequeños */}
      <Card className="rounded-3xl border-2 border-green-100 overflow-hidden shadow-lg bg-white">
        <div 
          className="p-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between cursor-pointer"
          onClick={() => toggleTip('sistema_555_dados')}
        >
          <div className="flex items-center gap-3">
            <Layers size={24} />
            <h3 className="font-bold">Sistema 5-5-5 Optimizado para Dados Pequeños</h3>
          </div>
          {expandedTips.sistema_555_dados ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expandedTips.sistema_555_dados && (
          <div className="p-6 text-sm text-slate-700 space-y-4">
            <div className="space-y-3">
              <h4 className="font-bold text-green-700">¿CÓMO FUNCIONA EL RIEGO EN SISTEMA ESCALONADO?</h4>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="font-semibold text-slate-800 mb-3">
                  Tu torre tiene 15 plantas (5+5+5) en dados pequeños con diferentes necesidades:
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-cyan-200">
                    <p className="text-xs font-bold text-blue-600">5 Plántulas N1</p>
                    <p className="text-lg font-bold text-blue-700">8-10 seg</p>
                    <p className="text-xs text-slate-500">40-80min intervalo</p>
                    <div className="mt-2 text-xs text-cyan-600">
                      Dado: 60-70% humedad
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                    <p className="text-xs font-bold text-green-600">5 Crecimiento N2</p>
                    <p className="text-lg font-bold text-green-700">10-12 seg</p>
                    <p className="text-xs text-slate-500">30-60min intervalo</p>
                    <div className="mt-2 text-xs text-green-600">
                      Dado: 70-75% humedad
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-600">5 Maduras N3</p>
                    <p className="text-lg font-bold text-emerald-700">12-15 seg</p>
                    <p className="text-xs text-slate-500">20-45min intervalo</p>
                    <div className="mt-2 text-xs text-emerald-600">
                      Dado: 75-80% humedad
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                  <p className="text-center font-bold text-blue-800">
                    ⚙️ SOLUCIÓN PRÁCTICA: Usar configuración de <span className="text-2xl">PLANTAS MADURAS</span>
                  </p>
                  <p className="text-center text-sm text-blue-600 mt-1">
                    La bomba riega TODAS las plantas igual. Configurar para las que más necesitan (maduras) 
                    y las plántulas recibirán un poco más de lo necesario (seguro).
                  </p>
                </div>
                
                <p className="mt-4 text-sm text-slate-700">
                  Esta configuración es <strong>segura para plántulas</strong> (reciben suficiente agua) y 
                  <strong> adecuada para adultas</strong> (no se quedan cortas). Los dados pequeños de 
                  plántulas drenan el exceso rápidamente.
                </p>
              </div>
              
              <h4 className="font-bold text-green-700 mt-4">VENTAJAS DE DADOS PEQUEÑOS EN SISTEMA 5-5-5</h4>
              <div className="bg-green-50 p-4 rounded-xl space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>Rápida respuesta:</strong> Los dados pequeños muestran problemas en horas (no días)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>Fácil diagnóstico:</strong> Puedes sacar un dado para inspeccionar raíces fácilmente</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>Menos riesgo:</strong> Si una planta tiene problemas, no afecta a las demás</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>Crecimiento acelerado:</strong> Raíces encuentran nutrientes inmediatamente en todo el dado</span>
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <h5 className="font-bold text-amber-700">🔄 ROTACIÓN SEMANAL - CRONOGRAMA PRÁCTICO</h5>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-600">Semana 1</span>
                      <span className="text-sm text-slate-600">Inicio del ciclo - Todas plántulas</span>
                    </div>
                    <span className="text-amber-600 font-bold">EC: 800-1000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-600">Semana 2</span>
                      <span className="text-sm text-slate-600">Plántulas → Crecimiento</span>
                    </div>
                    <span className="text-blue-600 font-bold">EC: 1200-1400</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-purple-600">Semana 3</span>
                      <span className="text-sm text-slate-600">Crecimiento → Maduración</span>
                    </div>
                    <span className="text-purple-600 font-bold">EC: 1500-1700</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-600">Semana 4</span>
                      <span className="text-sm text-slate-600">Maduración → Cosecha</span>
                    </div>
                    <span className="text-emerald-600 font-bold">¡Cosechar!</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-600">Semana 5</span>
                      <span className="text-sm text-slate-600">Nuevas plántulas + Rotar niveles</span>
                    </div>
                    <span className="text-green-600 font-bold">EC: 800-1000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  // =================== COMPONENTES DE PESTAÑAS ===================

  const DashboardTab = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-600">Sistema hidropónico con dados de lana de roca 2.5x2.5cm</p>
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
            irrigationData.rockwoolMoisture > 75 ? "bg-blue-100 text-blue-800" :
            irrigationData.rockwoolMoisture < 55 ? "bg-amber-100 text-amber-800" :
            "bg-green-100 text-green-800"
          }>
            Humedad dados: {irrigationData.rockwoolMoisture}%
          </Badge>
        </div>
      </div>
      
      {/* Alertas */}
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
      
      {/* Sistema de Riego */}
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
        
        {/* Configuración de Riego */}
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
        
        {/* Recomendaciones de Riego */}
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
      
      {/* Resumen del Sistema */}
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
      
      {/* Botones de Acción */}
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
      </div>
    </div>
  );

  const TowerTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Torre Hidropónica</h2>
          <p className="text-slate-600">Sistema 5-5-5 con dados de lana de roca</p>
        </div>
        
        <Badge className="bg-blue-100 text-blue-800">
          {plants.length}/15 plantas
        </Badge>
      </div>
      
      {/* Representación visual de la torre */}
      <Card className="p-6 rounded-2xl">
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Distribución de Plantas</h3>
          
          <div className="flex flex-col items-center gap-4">
            {/* Nivel 3 - Maduras */}
            <div className="w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-emerald-700">Nivel 3 - Maduras (Cosecha próxima)</h4>
                <Badge className="bg-emerald-100 text-emerald-800">
                  {plants.filter(p => p.l === 3).length}/5
                </Badge>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {Array.from({length: 5}, (_, i) => 11 + i).map(pos => {
                  const plant = plants.find(p => p.p === pos);
                  return (
                    <div 
                      key={pos}
                      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-3 ${
                        plant 
                          ? `border-emerald-300 ${VARIETIES[plant.v]?.color || 'bg-emerald-100'}`
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-slate-800">{pos}</span>
                      {plant ? (
                        <>
                          <span className={`text-sm font-bold ${VARIETIES[plant.v]?.textColor || 'text-slate-700'}`}>
                            {plant.v}
                          </span>
                          <span className="text-xs text-slate-600 mt-1">Madura</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400 mt-1">Vacío</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Separador */}
            <div className="w-1 h-8 bg-slate-200 rounded-full" />
            
            {/* Nivel 2 - Crecimiento */}
            <div className="w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h4 className="font-bold text-green-700">Nivel 2 - Crecimiento</h4>
                <Badge className="bg-green-100 text-green-800">
                  {plants.filter(p => p.l === 2).length}/5
                </Badge>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {Array.from({length: 5}, (_, i) => 6 + i).map(pos => {
                  const plant = plants.find(p => p.p === pos);
                  return (
                    <div 
                      key={pos}
                      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-3 ${
                        plant 
                          ? `border-green-300 ${VARIETIES[plant.v]?.color || 'bg-green-100'}`
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-slate-800">{pos}</span>
                      {plant ? (
                        <>
                          <span className={`text-sm font-bold ${VARIETIES[plant.v]?.textColor || 'text-slate-700'}`}>
                            {plant.v}
                          </span>
                          <span className="text-xs text-slate-600 mt-1">Crecimiento</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400 mt-1">Vacío</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Separador */}
            <div className="w-1 h-8 bg-slate-200 rounded-full" />
            
            {/* Nivel 1 - Plántulas */}
            <div className="w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <h4 className="font-bold text-cyan-700">Nivel 1 - Plántulas</h4>
                <Badge className="bg-cyan-100 text-cyan-800">
                  {plants.filter(p => p.l === 1).length}/5
                </Badge>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {Array.from({length: 5}, (_, i) => 1 + i).map(pos => {
                  const plant = plants.find(p => p.p === pos);
                  return (
                    <div 
                      key={pos}
                      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-3 ${
                        plant 
                          ? `border-cyan-300 ${VARIETIES[plant.v]?.color || 'bg-cyan-100'}`
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-slate-800">{pos}</span>
                      {plant ? (
                        <>
                          <span className={`text-sm font-bold ${VARIETIES[plant.v]?.textColor || 'text-slate-700'}`}>
                            {plant.v}
                          </span>
                          <span className="text-xs text-slate-600 mt-1">Plántula</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400 mt-1">Vacío</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Resumen */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-3">Resumen del Sistema Escalonado</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Rotación última:</span>
                <span className="font-medium">
                  {new Date(lastRot).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Limpieza última:</span>
                <span className="font-medium">
                  {new Date(lastClean).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Días desde rotación:</span>
                <span className="font-medium">
                  {Math.floor((new Date() - new Date(lastRot)) / (1000 * 3600 * 24))} días
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Días desde limpieza:</span>
                <span className="font-medium">
                  {Math.floor((new Date() - new Date(lastClean)) / (1000 * 3600 * 24))} días
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Button
                onClick={handleRotation}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <RotateCcw className="mr-2" />
                Rotar Niveles
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Añadir/Editar Plantas */}
      <Card className="p-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 mb-6">Gestión de Plantas</h3>
        
        <div className="space-y-6">
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
        
        {/* Lista de plantas existentes */}
        {plants.length > 0 && (
          <div className="mt-8">
            <h4 className="font-bold text-slate-800 mb-4">Plantas en la Torre</h4>
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
                        Añadida {new Date(plant.date).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
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
      </Card>
    </div>
  );

  const CalculatorTab = () => {
    const dosage = calculateCannaDosage(plants, config.currentVol, config.targetEC, config.waterType);
    const phAdjustment = calculatePHAdjustment(parseFloat(config.ph), parseFloat(config.targetPH), config.waterType, parseFloat(config.currentVol));
    
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calculadora CANNA Aqua Vega</h2>
          <p className="text-slate-600">Cálculos exactos para tu sistema con dados de lana</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cálculo de dosis */}
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
          
          {/* Ajuste de pH */}
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
                        {phAdjustment.phMinus} ml
                      </div>
                      <p className="text-lg font-bold text-purple-700">pH- (Ácido)</p>
                      <p className="text-sm text-slate-600 mt-2">Reducir pH</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-pink-600 mb-2">
                        {phAdjustment.phPlus} ml
                      </div>
                      <p className="text-lg font-bold text-pink-700">pH+ (Alcalino)</p>
                      <p className="text-sm text-slate-600 mt-2">Aumentar pH</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-700 mb-3">📝 Instrucciones de ajuste</h4>
                <ol className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Mezclar nutrientes primero (CANNA A+B)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                    <span>
                      Añadir {parseFloat(config.ph) > parseFloat(config.targetPH) 
                        ? `${phAdjustment.phMinus}ml de pH-` 
                        : `${phAdjustment.phPlus}ml de pH+`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                    <span>Mezclar bien durante 2-3 minutos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                    <span>Esperar 15 minutos y medir pH nuevamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</span>
                    <span>Repetir si es necesario con dosis menores</span>
                  </li>
                </ol>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 text-center">
                  💡 <strong>Importante:</strong> Ajusta el pH DESPUÉS de añadir los nutrientes. 
                  El pH cambia cuando añades CANNA.
                </p>
              </div>
            </div>
          </Card>
          
          {/* EC Target Calculator */}
          <Card className="p-6 rounded-2xl md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Calculadora de EC Objetivo</h3>
                <p className="text-sm text-slate-600">Sistema escalonado 5-5-5</p>
              </div>
            </div>
            
            {plants.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-b from-cyan-50 to-white rounded-xl border-2 border-cyan-200">
                    <div className="text-2xl font-bold text-cyan-600 mb-2">
                      {irrigationData.stats.seedlingCount} plántulas
                    </div>
                    <p className="text-sm text-cyan-700">EC recomendada: 900 µS/cm</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {irrigationData.stats.growthCount} crecimiento
                    </div>
                    <p className="text-sm text-green-700">EC recomendada: 1300 µS/cm</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-b from-emerald-50 to-white rounded-xl border-2 border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600 mb-2">
                      {irrigationData.stats.matureCount} maduras
                    </div>
                    <p className="text-sm text-emerald-700">EC recomendada: 1600 µS/cm</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-blue-700 mb-2">EC objetivo del sistema:</p>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {config.targetEC} µS/cm
                    </div>
                    <p className="text-sm text-blue-800">
                      Promedio ponderado seguro para todas las etapas
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-bold text-slate-800 mb-3">¿Cómo se calcula la EC objetivo?</h4>
                  <p className="text-sm text-slate-700">
                    Con sistema escalonado 5-5-5, usamos un promedio que sea <strong>seguro para plántulas</strong> 
                    (no se queman) y <strong>suficiente para adultas</strong> (no se quedan cortas). 
                    La lana de roca proporciona un buffer adicional que permite este equilibrio.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">Añade plantas a la torre para calcular EC objetivo</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  const CalendarTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Calendario de Mantenimiento</h2>
        <p className="text-slate-600">Programa de tareas para tu sistema hidropónico</p>
      </div>
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Calendario Mensual</h3>
              <p className="text-sm text-slate-600">{new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLastRot(new Date().toISOString())}
            >
              <RotateCcw className="mr-2" size={16} />
              Marcar Rotación
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLastClean(new Date().toISOString())}
            >
              <ShieldAlert className="mr-2" size={16} />
              Marcar Limpieza
            </Button>
          </div>
        </div>
        
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div key={index} className="text-center p-2">
              <span className="font-bold text-slate-700">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const isToday = day.date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index}
                className={`aspect-square rounded-lg p-2 border ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50' 
                    : day.isCurrentMonth 
                    ? 'border-slate-200 bg-white' 
                    : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${
                    isToday 
                      ? 'text-blue-600' 
                      : day.isCurrentMonth 
                      ? 'text-slate-700' 
                      : 'text-slate-400'
                  }`}>
                    {day.dayOfMonth}
                  </span>
                  
                  <div className="flex gap-1">
                    {day.events.includes('measure') && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" title="Medir pH/EC" />
                    )}
                    {day.events.includes('rotation') && (
                      <div className="w-2 h-2 rounded-full bg-amber-500" title="Rotar niveles" />
                    )}
                    {day.events.includes('clean') && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" title="Limpieza sistema" />
                    )}
                  </div>
                </div>
                
                {day.events.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {day.events.includes('measure') && (
                      <div className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        Medir
                      </div>
                    )}
                    {day.events.includes('rotation') && (
                      <div className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                        Rotar
                      </div>
                    )}
                    {day.events.includes('clean') && (
                      <div className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                        Limpiar
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Leyenda */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-bold text-slate-800 mb-3">Leyenda</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="font-medium text-slate-700">Medir pH/EC</p>
                <p className="text-sm text-slate-600">Cada {plants.length > 10 ? 2 : plants.length > 5 ? 3 : 4} días</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div>
                <p className="font-medium text-slate-700">Rotar Niveles</p>
                <p className="text-sm text-slate-600">Cada 7 días desde {new Date(lastRot).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <div>
                <p className="font-medium text-slate-700">Limpieza Sistema</p>
                <p className="text-sm text-slate-600">Cada 14 días desde {new Date(lastClean).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Próximas tareas */}
      <Card className="p-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 mb-6">Próximas Tareas</h3>
        
        <div className="space-y-4">
          {/* Medición próxima */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="text-blue-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Medir pH y EC</h4>
                <p className="text-sm text-slate-600">Control de nutrientes y pH</p>
              </div>
            </div>
            
            <Badge className="bg-blue-100 text-blue-800">
              Próximos días
            </Badge>
          </div>
          
          {/* Rotación próxima */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <RotateCcw className="text-amber-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Rotar Niveles</h4>
                <p className="text-sm text-slate-600">
                  Última: {new Date(lastRot).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-600">
                {Math.floor((new Date() - new Date(lastRot)) / (1000 * 3600 * 24))} días
              </p>
              <Button
                size="sm"
                onClick={handleRotation}
                className="mt-2"
              >
                Rotar Ahora
              </Button>
            </div>
          </div>
          
          {/* Limpieza próxima */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="text-purple-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Limpieza del Sistema</h4>
                <p className="text-sm text-slate-600">
                  Última: {new Date(lastClean).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-600">
                {Math.floor((new Date() - new Date(lastClean)) / (1000 * 3600 * 24))} días
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLastClean(new Date().toISOString())}
                className="mt-2"
              >
                Marcar Limpio
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Historial de Mediciones</h2>
        <p className="text-slate-600">Registro de pH, EC y temperatura</p>
      </div>
      
      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map(record => (
            <Card key={record.id} className="p-5 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {new Date(record.date).toLocaleDateString('es-ES', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </h3>
                  {record.notes && (
                    <p className="text-sm text-slate-600 mt-1">{record.notes}</p>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteHistoryRecord(record.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Activity className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">pH</p>
                    <p className={`text-xl font-bold ${
                      Math.abs(parseFloat(record.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-red-600' :
                      Math.abs(parseFloat(record.ph) - parseFloat(config.targetPH)) > 0.2 ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {record.ph}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">EC</p>
                    <p className={`text-xl font-bold ${
                      parseFloat(record.ec) > parseFloat(config.targetEC) + 300 ? 'text-red-600' :
                      parseFloat(record.ec) < parseFloat(config.targetEC) - 300 ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {record.ec} µS/cm
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Thermometer className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Temperatura</p>
                    <p className={`text-xl font-bold ${
                      parseFloat(record.temp) > 28 ? 'text-red-600' : 
                      parseFloat(record.temp) < 18 ? 'text-blue-600' : 
                      'text-green-600'
                    }`}>
                      {record.temp}°C
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 rounded-2xl text-center">
          <Clipboard className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="font-bold text-slate-800 mb-2">No hay mediciones registradas</h3>
          <p className="text-slate-600 mb-6">
            Guarda tu primera medición desde el panel de control
          </p>
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
              setTab("dashboard");
            }}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
          >
            <Clipboard className="mr-2" />
            Guardar Medición Actual
          </Button>
        </Card>
      )}
      
      {history.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("¿Borrar todo el historial? Esta acción no se puede deshacer.")) {
                setHistory([]);
              }
            }}
          >
            <Trash2 className="mr-2" />
            Borrar Todo el Historial
          </Button>
        </div>
      )}
    </div>
  );

  // =================== RENDER PRINCIPAL ===================

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
                <p className="text-xs text-slate-600">Dados lana 2.5cm • Sistema 5-5-5 • Castellón</p>
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
                          hasHeater: true
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

      {/* Navegación por pestañas (solo cuando step >= 4) */}
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
                <Calculator size={16} className="mr-2" />
                Calculadora
              </TabsTrigger>
              <TabsTrigger value="calendar" onClick={() => setTab("calendar")}>
                <Calendar size={16} className="mr-2" />
                Calendario
              </TabsTrigger>
              <TabsTrigger value="history" onClick={() => setTab("history")}>
                <BarChart3 size={16} className="mr-2" />
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
          // Flujo de configuración (pasos 0-3)
          <div className="max-w-2xl mx-auto">
            {renderStep()}
          </div>
        ) : (
          // Panel principal con pestañas
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

      {/* Modal de confirmación de borrado */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-2">¿Eliminar planta?</h3>
            <p className="text-slate-600 mb-6">
              Esta acción no se puede deshacer. La planta será eliminada permanentemente del sistema.
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
                <Trash2 className="mr-2" size={16} />
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal selector de agua */}
      {showWaterSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Cambiar Tipo de Agua</h3>
            
            <div className="space-y-3 mb-6">
              {Object.entries(WATER_TYPES).map(([key, water]) => (
                <div
                  key={key}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    config.waterType === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setConfig({...config, waterType: key})}
                >
                  <div className="flex items-center gap-3">
                    {water.icon}
                    <div>
                      <h4 className="font-bold text-slate-800">{water.name}</h4>
                      <p className="text-sm text-slate-600">{water.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowWaterSelector(false)}>
                Aplicar Cambios
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              HydroMaster CANNA • Dados lana 2.5x2.5cm • Sistema 5-5-5 • Castellón
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
                    <Droplet className="text-blue-500" size={14} />
                    <span className="text-sm text-slate-600">
                      Humedad dados: {irrigationData.rockwoolMoisture}%
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
