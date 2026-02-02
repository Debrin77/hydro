"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
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
  GaugeCircle, Droplets as WaterDroplets,
  Flower2, Sparkles, Shield, Zap as Lightning,
  Flask, Thermometer as ThermometerIcon, GitBranch,
  Package, Hash, AlertOctagon as AlertOctagonIcon,
  Sprout as Plant, MapPin, CheckCircle, AlertTriangle as AlertTriangleIcon,
  CloudSun as CloudSunIcon
} from "lucide-react"

// ============================================================================
// COMPONENTES UI SIMPLIFICADOS
// ============================================================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, className = "", variant = "default", disabled = false, size = "default" }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  }

  const sizes = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm"
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  )
}

const Badge = ({ children, className = "", variant = "default" }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"

  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700"
  }

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

// ============================================================================
// CONFIGURACIÓN BASE - AGUA DESTILADA ÚNICA
// ============================================================================

const WATER_TYPES = {
  "osmosis": {
    name: "Agua Destilada",
    icon: <Filter className="text-blue-500" />,
    ecBase: 0.0,
    phBase: 7.0,
    description: "Agua destilada pura, EC casi 0. Perfecta para AQUA VEGA A y B para aguas blandas.",
    recommendation: "Protocolo específico: 45ml de A y B por 18L, ajustar a 1.4 mS/cm.",
    isOsmosis: true
  }
};

// EC FIJO PARA TODAS LAS VARIEDADES Y ETAPAS: 1350-1500 µS/cm
const FIXED_EC_RANGE = {
  min: 1350,
  max: 1500,
  target: 1400,
  description: "Rango único para todas las variedades y etapas: 1.35-1.5 mS/cm"
};

// VARIEDADES CON EC FIJO
const VARIETIES = {
  "Iceberg": {
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    textColor: "text-cyan-700",
    ecTarget: 1400,
    phIdeal: 5.8,
    info: "Variedad clásica. Mantener EC en rango 1.35-1.5 mS/cm."
  },
  "Lollo Rosso": {
    color: "bg-gradient-to-br from-purple-600 to-purple-700",
    textColor: "text-purple-700",
    ecTarget: 1400,
    phIdeal: 5.8,
    info: "Mantener EC en rango 1.35-1.5 mS/cm para un buen color."
  },
  "Maravilla": {
    color: "bg-gradient-to-br from-amber-600 to-amber-700",
    textColor: "text-amber-700",
    ecTarget: 1400,
    phIdeal: 5.8,
    info: "Variedad productiva. EC fija en 1.35-1.5 mS/cm."
  },
  "Trocadero": {
    color: "bg-gradient-to-br from-lime-600 to-lime-700",
    textColor: "text-lime-700",
    ecTarget: 1400,
    phIdeal: 5.8,
    info: "EC fija 1.35-1.5 mS/cm para óptimo crecimiento."
  },
  "Hoja de Roble Rojo": {
    color: "bg-gradient-to-br from-red-600 to-red-700",
    textColor: "text-red-700",
    ecTarget: 1400,
    phIdeal: 5.8,
    info: "Variedad tolerante. EC 1.35-1.5 mS/cm ideal."
  },
  "Romana": {
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
    textColor: "text-blue-700",
    ecTarget: 1400,
    phIdeal: 5.8,
    info: "Variedad robusta. EC constante 1.35-1.5 mS/cm."
  }
};

// ============================================================================
// CONFIGURACIÓN DE ALERTAS METEOROLÓGICAS - AEMET CASTELLÓN
// ============================================================================

// Código de zona AEMET para Castellón de la Plana
const AEMET_ZONE_CODE = "7712";
const AEMET_API_BASE = "https://www.aemet.es/es/eltiempo/prediccion/avisos";

// Niveles de alerta AEMET
const WEATHER_ALERT_LEVELS = {
  "green": { name: "Sin riesgo", color: "bg-green-100 text-green-800", priority: 0 },
  "yellow": { name: "Riesgo", color: "bg-yellow-100 text-yellow-800", priority: 1 },
  "orange": { name: "Riesgo Importante", color: "bg-orange-100 text-orange-800", priority: 2 },
  "red": { name: "Riesgo Extremo", color: "bg-red-100 text-red-800", priority: 3 }
};

// Fenómenos meteorológicos a monitorizar
const WEATHER_PHENOMENA = {
  "wind": {
    name: "Viento",
    icon: <Wind size={20} />,
    thresholds: { yellow: 50, orange: 70, red: 90 }, // km/h
    recommendations: {
      yellow: "Asegurar la torre y cubrir parcialmente.",
      orange: "Mover la torre a interior o zona muy protegida.",
      red: "Desmontar temporalmente la torre o garantizar máxima protección."
    }
  },
  "rain": {
    name: "Lluvia",
    icon: <CloudRain size={20} />,
    thresholds: { yellow: 20, orange: 40, red: 60 }, // mm en 1h
    recommendations: {
      yellow: "Verificar drenaje y cubrir sistema eléctrico.",
      orange: "Proteger bombas y electrónica de humedad.",
      red: "Desconectar y proteger todo el sistema eléctrico."
    }
  },
  "storm": {
    name: "Tormenta",
    icon: <Zap size={20} />,
    thresholds: { yellow: 1, orange: 2, red: 3 }, // nivel de intensidad
    recommendations: {
      yellow: "Desconectar equipo eléctrico no esencial.",
      orange: "Desconectar toda la instalación de la red.",
      red: "Aislar completamente el sistema y buscar refugio."
    }
  },
  "heat": {
    name: "Calor extremo",
    icon: <ThermometerSun size={20} />,
    thresholds: { yellow: 32, orange: 36, red: 40 }, // °C
    recommendations: {
      yellow: "Aumentar frecuencia de riego y sombrear.",
      orange: "Añadir hielo al depósito y maximizar sombra.",
      red: "Mover a interior con clima controlado."
    }
  },
  "cold": {
    name: "Frío extremo",
    icon: <ThermometerSnowflake size={20} />,
    thresholds: { yellow: 2, orange: -2, red: -5 }, // °C
    recommendations: {
      yellow: "Aislar depósito y reducir riego nocturno.",
      orange: "Añadir calentador y cubrir completamente.",
      red: "Mover a interior o usar invernadero climatizado."
    }
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO ACTUALIZADAS - MODIFICADAS PARA 12 DÍAS
// ============================================================================

/**
 * Calcula estadísticas de plantas
 */
const calculatePlantStats = (plants) => {
  const stats = {
    seedlingCount: 0,
    growthCount: 0,
    matureCount: 0,
    total: plants.length,
    varietyCount: {}
  };

  plants.forEach(plant => {
    if (plant.l === 1) stats.seedlingCount++;
    else if (plant.l === 2) stats.growthCount++;
    else stats.matureCount++;

    stats.varietyCount[plant.v] = (stats.varietyCount[plant.v] || 0) + 1;
  });

  return stats;
};

/**
 * Calcula EC por nivel de desarrollo - TODOS CON EL MISMO RANGO FIJO
 */
const calculateECByLevel = (plants) => {
  const levels = {
    1: { plants: 0, totalEC: 0 },
    2: { plants: 0, totalEC: 0 },
    3: { plants: 0, totalEC: 0 }
  };

  plants.forEach(plant => {
    levels[plant.l].plants += 1;
    levels[plant.l].totalEC += FIXED_EC_RANGE.target;
  });

  return {
    level1: {
      avg: levels[1].plants > 0 ? Math.round(levels[1].totalEC / levels[1].plants) : 0,
      plants: levels[1].plants
    },
    level2: {
      avg: levels[2].plants > 0 ? Math.round(levels[2].totalEC / levels[2].plants) : 0,
      plants: levels[2].plants
    },
    level3: {
      avg: levels[3].plants > 0 ? Math.round(levels[3].totalEC / levels[3].plants) : 0,
      plants: levels[3].plants
    }
  };
};

/**
 * Calcula el rango de EC del sistema - FIJO
 */
const calculateSystemECRange = () => {
  return FIXED_EC_RANGE;
};

/**
 * Verifica si el EC está fuera de rango FIJO
 */
const checkECAlert = (currentEC) => {
  const ec = parseFloat(currentEC) || 0;
  
  if (ec === 0) return null;

  if (ec < FIXED_EC_RANGE.min) {
    const deviation = ((FIXED_EC_RANGE.min - ec) / FIXED_EC_RANGE.min) * 100;
    const severity = deviation > 20 ? 1 : deviation > 10 ? 2 : 3;
    return {
      type: 'low',
      severity,
      current: ec,
      targetMin: FIXED_EC_RANGE.min,
      targetMax: FIXED_EC_RANGE.max,
      deviation: Math.round(deviation),
      message: `EC ${ec} µS/cm está por debajo del mínimo (${FIXED_EC_RANGE.min} µS/cm)`
    };
  } else if (ec > FIXED_EC_RANGE.max) {
    const deviation = ((ec - FIXED_EC_RANGE.max) / FIXED_EC_RANGE.max) * 100;
    const severity = deviation > 20 ? 1 : deviation > 10 ? 2 : 3;
    return {
      type: 'high',
      severity,
      current: ec,
      targetMin: FIXED_EC_RANGE.min,
      targetMax: FIXED_EC_RANGE.max,
      deviation: Math.round(deviation),
      message: `EC ${ec} µS/cm está por encima del máximo (${FIXED_EC_RANGE.max} µS/cm)`
    };
  }

  return null;
};

/**
 * Método 1: Cálculo EC escalonado - TODOS CON EL MISMO VALOR
 */
const calculateStagedEC = (plants) => {
  return {
    targetEC: FIXED_EC_RANGE.target.toString(),
    method: "escalonado",
    note: "EC fija para todas las variedades: 1400 µS/cm"
  };
};

/**
 * Método 2: Cálculo EC promedio - FIJO
 */
const calculateAverageEC = (plants) => {
  return {
    targetEC: FIXED_EC_RANGE.target.toString(),
    method: "promedio",
    note: "EC fija: 1400 µS/cm"
  };
};

/**
 * Método 3: Cálculo EC conservador - FIJO
 */
const calculateConservativeEC = (plants) => {
  return {
    targetEC: "1350",
    method: "conservador",
    note: "EC mínima segura: 1350 µS/cm"
  };
};

/**
 * Cálculo EC inteligente optimizado
 */
const calculateSmartEC = (plants) => {
  return {
    targetEC: FIXED_EC_RANGE.target.toString(),
    method: "escalonado",
    allMethods: {
      escalonado: calculateStagedEC(plants),
      promedio: calculateAverageEC(plants),
      conservador: calculateConservativeEC(plants)
    },
    systemRange: FIXED_EC_RANGE
  };
};

/**
 * Calcula características del agua
 */
const getWaterCharacteristics = (waterType) => {
  const baseWater = WATER_TYPES[waterType] || WATER_TYPES.osmosis;
  
  return {
    ...baseWater,
    finalECBase: 0,
    finalPhBase: 7.0,
    isOsmosis: true
  };
};

/**
 * Calcula dosis AQUA VEGA para 18 litros (Protocolo CORREGIDO - 45ml A+B para 18L)
 */
const calculateAquaVegaDosage = (plants, totalVolume, targetEC) => {
  // PROTOCOLO CORREGIDO para 18 litros: 45ml de A y B para 1.4 mS/cm (2.5ml/L)
  const baseDosagePer18L = 45; // CORREGIDO: 45ml, no 63ml
  const dosage = (baseDosagePer18L * totalVolume) / 18;
  
  // Ajuste según EC objetivo
  const ecRatio = parseFloat(targetEC) / 1400;
  const adjustedDosage = dosage * ecRatio;
  
  return { 
    a: Math.round(adjustedDosage), 
    b: Math.round(adjustedDosage), 
    per10L: { 
      a: Math.round((adjustedDosage * 10) / totalVolume), 
      b: Math.round((adjustedDosage * 10) / totalVolume) 
    }, 
    note: "Protocolo para 18L: 45ml A+B → 1.4 mS/cm (2.5ml/L)",
    baseProtocol: {
      for18L: { a: 45, b: 45 }, // CORREGIDO
      perLiter: 2.5 // CORREGIDO: 2.5ml/L, no 3.5ml/L
    }
  };
};

/**
 * Calcula ajuste de pH con método de titulación (0.5ml por paso)
 */
const calculatePHAdjustment = (currentPH, targetPH, volume) => {
  const phDiff = currentPH - targetPH;
  
  if (Math.abs(phDiff) <= 0.1) {
    return {
      phMinus: "0,0",
      phPlus: "0,0",
      recommendation: "✅ pH en el rango ideal. No se requiere ajuste.",
      steps: 0,
      method: "Ningún ajuste necesario"
    };
  }
  
  // Método de titración: 0.5ml por paso (aproximadamente 10 gotas)
  const stepsNeeded = Math.ceil(Math.abs(phDiff) / 0.3); // 0.5ml baja ~0.3 pH
  const totalML = stepsNeeded * 0.5;
  
  let recommendation = "";
  let method = "";
  
  if (phDiff > 0) {
    recommendation = `pH alto (${currentPH}). Añadir 0.5ml de ácido cítrico, mezclar 2min con aireador, esperar 30s y medir. Repetir hasta pH ${targetPH}.`;
    method = `Titulación: ${stepsNeeded} pasos de 0.5ml (total ${totalML.toFixed(1).replace('.', ',')}ml)`;
  } else {
    recommendation = `pH bajo (${currentPH}). Raro con nutrientes ácidos. Si es necesario, añadir bicarbonato potásico gota a gota.`;
    method = "Ajuste con base suave (muy raro necesario)";
  }
  
  return {
    phMinus: phDiff > 0 ? totalML.toFixed(1).replace('.', ',') : "0,0",
    phPlus: phDiff < 0 ? "0,5" : "0,0",
    recommendation,
    steps: stepsNeeded,
    method,
    critical: Math.abs(phDiff) > 0.8
  };
};

/**
 * Genera calendario de mantenimiento - MODIFICADO PARA MOSTRAR SOLO MES ACTUAL
 */
const generateCalendar = (plants, lastRot, lastClean) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  const firstDayOfWeek = firstDayOfMonth.getDay();
  // Ajuste para que semana empiece en lunes (1 = lunes, 0 = domingo)
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const daysInMonth = lastDayOfMonth.getDate();
  const totalCells = 35; // 5 semanas máx
  const calendarDays = [];

  // Días del mes anterior (NINGUNO - solo mes actual)
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push({
      date: null,
      dayOfMonth: '',
      isCurrentMonth: false,
      isEmpty: true,
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
      isEmpty: false,
      events: []
    });
  }

  // Rellenar hasta completar 5 semanas (35 días)
  const remainingCells = totalCells - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      date: null,
      dayOfMonth: '',
      isCurrentMonth: false,
      isEmpty: true,
      events: []
    });
  }

  const totalPlants = plants.length;
  const measureFrequency = 1; // Medir diariamente según protocolo

  const lastRotDate = new Date(lastRot);
  const lastCleanDate = new Date(lastClean);

  calendarDays.forEach(day => {
    if (!day.isCurrentMonth || !day.date) return;

    const dayDate = day.date;
    const diffTime = dayDate - now;
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    if (diffDays < 0) return;

    // Medición diaria
    if (diffDays % measureFrequency === 0) {
      day.events.push('measure');
    }

    // Recarga de nutrientes cada 7-10 días
    if (diffDays > 0 && diffDays % 10 === 0) {
      day.events.push('recharge');
    }

    // Cambio completo cada 14 días
    if (diffDays > 0 && diffDays % 14 === 0) {
      day.events.push('change');
    }

    // Rotación según crecimiento - MODIFICADO A 12 DÍAS - AHORA COMO RECOMENDACIÓN
    const daysFromLastRot = Math.floor((dayDate - lastRotDate) / (1000 * 3600 * 24));
    if (daysFromLastRot > 0 && daysFromLastRot % 12 === 0) {
      day.events.push('rotation');
    }

    // Limpieza
    const daysFromLastClean = Math.floor((dayDate - lastCleanDate) / (1000 * 3600 * 24));
    if (daysFromLastClean > 0 && daysFromLastClean % 14 === 0) {
      day.events.push('clean');
    }
  });

  return calendarDays;
};

/**
 * Obtiene estación actual
 */
const getSeason = (currentTime = new Date()) => {
  const month = currentTime.getMonth() + 1;
  if (month >= 6 && month <= 9) return "summer";
  if (month >= 12 || month <= 2) return "winter";
  return "spring";
};

/**
 * Calcula riego para torre vertical - NUEVO PROGRAMA DE RIEGO
 */
const calculateIrrigation = (plants, temp, humidity, season) => {
  if (plants.length === 0) {
    return {
      totalWaterNeeds: "0,0",
      pumpMinutesPerDay: "0",
      cyclesPerDay: 0,
      secondsPerCycle: "0",
      recommendations: ["Añade plantas al sistema para calcular riego"],
      notes: ["Protocolo revisado: 3 minutos cada hora de 8:30 a 20:30, luego 00:00, 03:00 y 05:30"],
      schedule: []
    };
  }

  // NUEVO PROGRAMA DE RIEGO
  const schedule = [
    { time: "08:30", duration: 180, note: "Primer riego del día" },
    { time: "09:30", duration: 180, note: "Riego horario" },
    { time: "10:30", duration: 180, note: "Riego horario" },
    { time: "11:30", duration: 180, note: "Riego horario" },
    { time: "12:30", duration: 180, note: "Riego horario" },
    { time: "13:30", duration: 180, note: "Riego horario" },
    { time: "14:30", duration: 180, note: "Riego horario" },
    { time: "15:30", duration: 180, note: "Riego horario" },
    { time: "16:30", duration: 180, note: "Riego horario" },
    { time: "17:30", duration: 180, note: "Riego horario" },
    { time: "18:30", duration: 180, note: "Riego horario" },
    { time: "19:30", duration: 180, note: "Último riego diurno" },
    { time: "20:30", duration: 180, note: "Último riego diurno" },
    { time: "00:00", duration: 180, note: "Riego nocturno" },
    { time: "03:00", duration: 180, note: "Riego nocturno" },
    { time: "05:30", duration: 180, note: "Riego previo al amanecer" }
  ];

  const cyclesPerDay = schedule.length;
  const secondsPerCycle = 180; // 3 minutos
  const totalSeconds = cyclesPerDay * secondsPerCycle;
  const totalMinutes = totalSeconds / 60;
  
  // Consumo de agua estimado (alto caudal por observación)
  const flowRate = 8; // L/hora estimado
  const hoursPerDay = totalSeconds / 3600;
  const totalWaterNeeds = hoursPerDay * flowRate;
  
  // Ajustes por temperatura y humedad
  let adjustedSecondsPerCycle = secondsPerCycle;
  let adjustedCyclesPerDay = cyclesPerDay;
  
  if (temp > 28) {
    adjustedSecondsPerCycle = 210; // 3.5 minutos
    adjustedCyclesPerDay = 18; // Más ciclos en calor
  } else if (temp > 25) {
    adjustedSecondsPerCycle = 180; // 3 minutos
  } else if (temp < 15) {
    adjustedSecondsPerCycle = 150; // 2.5 minutos
    adjustedCyclesPerDay = 14; // Menos ciclos en frío
  }
  
  // Ajustes por humedad
  if (humidity < 40) {
    adjustedSecondsPerCycle += 30; // +30 segundos si humedad baja
  } else if (humidity > 70) {
    adjustedSecondsPerCycle -= 30; // -30 segundos si humedad alta
  }
  
  // Límites seguros
  adjustedSecondsPerCycle = Math.max(120, Math.min(adjustedSecondsPerCycle, 240)); // 2-4 minutos
  adjustedCyclesPerDay = Math.max(12, Math.min(adjustedCyclesPerDay, 18));
  
  return {
    totalWaterNeeds: totalWaterNeeds.toFixed(2).replace('.', ','),
    pumpMinutesPerDay: totalMinutes.toFixed(1).replace('.', ','),
    cyclesPerDay: cyclesPerDay,
    secondsPerCycle: secondsPerCycle.toString(),
    schedule: schedule,
    recommendations: [
      "⏰ PROGRAMA DE RIEGO FIJO:",
      "• 08:30 a 20:30 → Riego cada hora (3 minutos por ciclo)",
      "• 00:00 → Riego nocturno (3 minutos)",
      "• 03:00 → Riego nocturno (3 minutos)", 
      "• 05:30 → Riego previo al amanecer (3 minutos)",
      `📊 Total: ${cyclesPerDay} ciclos/día (${totalMinutes} minutos totales)`,
      `💧 ${totalWaterNeeds.toFixed(2).replace('.', ',')}L de agua estimados por día`,
      "🌡️ Ajustar según temperatura y humedad ambiente"
    ],
    notes: [
      "Protocolo optimizado para máximo crecimiento",
      "Caudal alto estimado por eficiencia de torre",
      "3 minutos garantizan que los nutrientes lleguen a todas las raíces"
    ],
    adjustedSchedule: {
      secondsPerCycle: adjustedSecondsPerCycle,
      cyclesPerDay: adjustedCyclesPerDay,
      note: `Ajustado por condiciones: ${adjustedSecondsPerCycle}s por ciclo, ${adjustedCyclesPerDay} ciclos/día`
    }
  };
};

// ============================================================================
// FUNCIONES DE GESTIÓN METEOROLÓGICA
// ============================================================================

/**
 * Obtiene la ubicación del usuario con la API de Geolocalización
 */
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      // Fallback a coordenadas de Castellón de la Plana si no hay geolocalización
      resolve({
        latitude: 39.98567,
        longitude: -0.04935,
        accuracy: 5000,
        isFallback: true
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        // Fallback a coordenadas de Castellón de la Plana si el usuario deniega
        console.warn("Ubicación denegada, usando Castellón por defecto", error);
        resolve({
          latitude: 39.98567,
          longitude: -0.04935,
          accuracy: 5000,
          isFallback: true
        });
      },
      options
    );
  });
};

/**
 * Obtiene alertas meteorológicas de AEMET para Castellón
 */
const fetchWeatherAlerts = async (location) => {
  try {
    // Usamos datos de ejemplo ya que AEMET requiere CORS
    return getMockAlerts(location);
    
  } catch (error) {
    console.error("Error obteniendo alertas meteorológicas:", error);
    
    // Datos de ejemplo para desarrollo
    return getMockAlerts(location);
  }
};

/**
 * Alertas de ejemplo para desarrollo cuando AEMET no esté disponible
 */
const getMockAlerts = (location) => {
  const now = new Date();
  const alerts = [];
  
  // Simular alerta por viento si no hay alertas reales
  alerts.push({
    id: "mock-wind-alert",
    phenomenon: "wind",
    level: "yellow",
    title: "Viento Moderado Previsto",
    description: "Rachas de hasta 55 km/h en las próximas 12 horas.",
    startTime: now.toISOString(),
    endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
    location: location,
    source: "Sistema Local",
    recommendations: WEATHER_PHENOMENA.wind.recommendations.yellow,
    isMock: true
  });
  
  // Simular alerta por calor en verano
  const month = now.getMonth();
  if (month >= 5 && month <= 8) { // Junio a Septiembre
    alerts.push({
      id: "mock-heat-alert",
      phenomenon: "heat",
      level: "orange",
      title: "Ola de Calor",
      description: "Temperaturas superiores a 36°C previstas.",
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      location: location,
      source: "Sistema Local",
      recommendations: WEATHER_PHENOMENA.heat.recommendations.orange,
      isMock: true
    });
  }
  
  return alerts;
};

/**
 * Genera acciones de protección para la torre basadas en alertas
 */
const generateProtectionActions = (alerts, currentConditions) => {
  const actions = [];
  const priorityOrder = ["red", "orange", "yellow", "green"];
  
  // Ordenar alertas por prioridad
  const sortedAlerts = [...alerts].sort((a, b) => 
    priorityOrder.indexOf(b.level) - priorityOrder.indexOf(a.level)
  );
  
  if (sortedAlerts.length === 0) {
    return [{
      id: "no-alerts",
      title: "Sin alertas meteorológicas activas",
      description: "Condiciones normales para la torre hidropónica.",
      priority: 0,
      icon: <Check className="text-green-500" size={20} />,
      actions: ["Continuar operación normal"]
    }];
  }
  
  // Agrupar recomendaciones por fenómeno
  const phenomenaActions = {};
  
  sortedAlerts.forEach(alert => {
    if (!phenomenaActions[alert.phenomenon]) {
      phenomenaActions[alert.phenomenon] = {
        phenomenon: alert.phenomenon,
        highestLevel: alert.level,
        alerts: [alert],
        recommendations: new Set([alert.recommendations])
      };
    } else {
      phenomenaActions[alert.phenomenon].alerts.push(alert);
      phenomenaActions[alert.phenomenon].recommendations.add(alert.recommendations);
      // Mantener el nivel más alto
      if (priorityOrder.indexOf(alert.level) > priorityOrder.indexOf(phenomenaActions[alert.phenomenon].highestLevel)) {
        phenomenaActions[alert.phenomenon].highestLevel = alert.level;
      }
    }
  });
  
  // Convertir a array de acciones
  Object.values(phenomenaActions).forEach(phenomenonData => {
    const phenomenonInfo = WEATHER_PHENOMENA[phenomenonData.phenomenon];
    const alertLevel = WEATHER_ALERT_LEVELS[phenomenonData.highestLevel];
    
    actions.push({
      id: `action-${phenomenonData.phenomenon}`,
      title: `${phenomenonInfo.name} - ${alertLevel.name}`,
      description: `Alerta ${phenomenonData.highestLevel} activa. ${phenomenonData.alerts.length} aviso(s).`,
      priority: alertLevel.priority,
      icon: phenomenonInfo.icon,
      actions: Array.from(phenomenonData.recommendations),
      phenomenon: phenomenonData.phenomenon,
      level: phenomenonData.highestLevel
    });
  });
  
  // Ordenar por prioridad
  return actions.sort((a, b) => b.priority - a.priority);
};

// ============================================================================
// COMPONENTES REUTILIZABLES
// ============================================================================

const StagedECCalculator = ({ plants, onECCalculated, selectedMethod, onMethodChange }) => {
  const ecMethods = calculateSmartEC(plants);
  const ecByLevel = calculateECByLevel(plants);
  const plantStats = calculatePlantStats(plants);
  const systemRange = calculateSystemECRange();

  // Usar el método seleccionado manualmente o el automático
  const currentMethod = selectedMethod || ecMethods.method;
  const currentEC = selectedMethod
    ? ecMethods.allMethods[selectedMethod]?.targetEC || ecMethods.targetEC
    : ecMethods.targetEC;

  useEffect(() => {
    if (onECCalculated) {
      onECCalculated(currentEC);
    }
  }, [currentEC, onECCalculated]);

  // Verificar alerta de EC
  const ecAlert = checkECAlert(currentEC);

  return (
    <Card className="p-6 rounded-2xl mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Calculator className="text-white" size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-xl">EC FIJO - Protocolo Simplificado</h2>
          <p className="text-slate-600">Rango único para todas las variedades: 1350-1500 µS/cm</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200 min-h-[180px] flex flex-col">
          <h4 className="font-bold text-blue-700 mb-2 text-sm">EC Objetivo Fijo</h4>
          <div className="text-3xl font-bold text-blue-600 mb-2 flex-grow flex items-center">1400 µS/cm</div>
          <div className="mt-auto">
            <Badge className="bg-blue-100 text-blue-800">
              Protocolo 18L
            </Badge>
            <p className="text-xs text-slate-500 mt-1">45ml AQUA VEGA A+B</p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-b from-amber-50 to-white rounded-xl border-2 border-amber-200 min-h-[180px] flex flex-col">
          <h4 className="font-bold text-amber-700 mb-2 text-sm">Rango de Trabajo</h4>
          <div className="text-3xl font-bold text-amber-600 mb-2 flex-grow flex items-center">
            1350-1500 µS/cm
          </div>
          <div className="mt-auto">
            <Badge className="bg-amber-100 text-amber-800">
              Para todas las variedades
            </Badge>
            <p className="text-xs text-slate-600 mt-1">
              {systemRange.description}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-b from-purple-50 to-white rounded-xl border-2 border-purple-200 min-h-[180px] flex flex-col">
          <h4 className="font-bold text-purple-700 mb-2 text-sm">Estado EC Actual</h4>
          <div className={`text-3xl font-bold mb-2 flex-grow flex items-center ${
            ecAlert ? (ecAlert.severity === 1 ? 'text-red-600' : 'text-amber-600') : 'text-green-600'
          }`}>
            {currentEC} µS/cm
          </div>
          <div className="mt-auto">
            {ecAlert ? (
              <Badge className={ecAlert.severity === 1 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>
                {ecAlert.type === 'low' ? 'EC BAJA' : 'EC ALTA'}
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">EN RANGO</Badge>
            )}
            <p className="text-xs text-slate-600 mt-1">
              {ecAlert ? ecAlert.message : 'EC dentro del rango fijo'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 mb-6">
        <h4 className="font-bold text-blue-700 mb-3">📊 EC por Nivel de Crecimiento</h4>
        <p className="text-sm text-slate-600 mb-4">Mismo rango EC para todas las etapas</p>

        <div className="space-y-4">
          {[1, 2, 3].map(level => {
            const levelData = ecByLevel[`level${level}`];
            const levelName = level === 1 ? "Plántulas" : level === 2 ? "Crecimiento" : "Maduras";
            const levelColorClass = level === 1 ? "bg-cyan-500" : level === 2 ? "bg-green-500" : "bg-emerald-500";
            
            return (
              <div key={level} className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${levelColorClass}`}></div>
                    <div>
                      <h5 className="font-bold text-slate-800">{levelName}</h5>
                      <p className="text-sm text-slate-600">
                        {levelData.plants} {levelData.plants === 1 ? 'planta' : 'plantas'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end">
                    <div className="text-2xl font-bold text-slate-800">{levelData.avg} µS/cm</div>
                    <div className="text-sm text-slate-600">
                      Rango fijo: 1350-1500 µS/cm
                    </div>
                  </div>
                </div>
                
                {levelData.plants > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {level === 1 ? "🌱 EC constante desde plántula" :
                       level === 2 ? "📈 Mismo rango EC durante crecimiento" :
                       "🌿 EC fija hasta cosecha"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

const Protocolo18LPanel = ({ volume, aquaVegaDosage }) => {
  const protocolo18L = {
    title: "PROTOCOLO CORREGIDO PARA 18 LITROS",
    steps: [
      {
        phase: "FASE 1: PREPARACIÓN",
        steps: [
          {
            step: 1,
            action: "Limpieza del depósito",
            details: "Vacía y limpia con agua caliente. Elimina residuos o sarro.",
            icon: "🧼"
          },
          {
            step: 2,
            action: "Llenado con agua destilada",
            details: `Llena con ${volume}L de agua destilada`,
            icon: "💧"
          },
          {
            step: 3,
            action: "Añadir AQUA VEGA A",
            details: `Agregar 45ml de AQUA VEGA A`,
            note: "Remover manualmente 1 minuto",
            icon: "⚗️"
          },
          {
            step: 4,
            action: "Añadir AQUA VEGA B",
            details: `Agregar 45ml de AQUA VEGA B`,
            note: "Remover manualmente 2 minutos",
            icon: "⚗️"
          },
          {
            step: 5,
            action: "Homogenización",
            details: "Encender difusor de aire y calentador (20°C) durante 15 minutos",
            icon: "🔄"
          }
        ]
      },
      {
        phase: "FASE 2: CALIBRACIÓN Y AJUSTE",
        steps: [
          {
            step: 1,
            action: "Medición de EC",
            details: "Apagar aireador, esperar 30 segundos, medir EC con ATC",
            icon: "📊"
          },
          {
            step: 2,
            action: "Objetivo EC: 1.4 mS/cm",
            details: "Si <1.3: añadir +3.2ml de A y B. Si >1.6: añadir 100-200ml agua destilada",
            icon: "🎯"
          },
          {
            step: 3,
            action: "Ajuste pH con titulación",
            details: "Añadir 0.5ml ácido cítrico (≈10 gotas), mezclar 2min, esperar 30s, medir",
            note: "Repetir hasta pH 5.8",
            icon: "🧪"
          }
        ]
      },
      {
        phase: "FASE 3: MANTENIMIENTO",
        steps: [
          {
            step: 1,
            action: "Medición diaria",
            details: "Medir pH y EC 1 vez al día (mañana, aireador apagado)",
            icon: "📅"
          },
          {
            step: 2,
            action: "Rellenar evaporación",
            details: "Solo con agua destilada (bajará EC ligeramente)",
            icon: "🔄"
          },
          {
            step: 3,
            action: "Recarga nutrientes",
            details: "Cada 7-10 días, o cuando EC baje 30% (a ~1.0 mS/cm)",
            note: "Añadir A y B en partes iguales",
            icon: "⚡"
          },
          {
            step: 4,
            action: "Cambio completo",
            details: "Realizar vaciado, limpieza y preparación nueva cada 2 semanas",
            icon: "🔄"
          }
        ]
      }
    ]
  };

  return (
    <Card className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <FlaskConical className="text-white" size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-xl">PROTOCOLO CORREGIDO 18L - AQUA VEGA A/B</h2>
          <p className="text-slate-600">Protocolo específico para cultivo de lechuga hidropónica</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-700 mb-3">📊 Tabla de Valores Objetivo (Para 18L)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="text-xs text-slate-700 bg-blue-50">
              <tr>
                <th className="px-4 py-3">Parámetro</th>
                <th className="px-4 py-3">Valor Objetivo</th>
                <th className="px-4 py-3">Rango de Trabajo</th>
                <th className="px-4 py-3">Acción Correctiva</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b">
                <td className="px-4 py-3 font-medium">EC</td>
                <td className="px-4 py-3 font-bold text-blue-600">1.4 mS/cm</td>
                <td className="px-4 py-3">1.3 - 1.6 mS/cm</td>
                <td className="px-4 py-3 text-sm">
                  <div>&lt;1.3: +3.2ml A+B (por cada 0.1 mS/cm)</div>
                  <div>&gt;1.6: +100-200ml agua destilada</div>
                </td>
              </tr>
              <tr className="bg-white border-b">
                <td className="px-4 py-3 font-medium">pH</td>
                <td className="px-4 py-3 font-bold text-purple-600">5.8</td>
                <td className="px-4 py-3">5.5 - 6.5</td>
                <td className="px-4 py-3 text-sm">
                  <div>&gt;6.5: ácido cítrico (0.5ml/paso)</div>
                  <div>&lt;5.5: base suave (muy raro)</div>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 font-medium">Temp. Agua</td>
                <td className="px-4 py-3 font-bold text-amber-600">20°C</td>
                <td className="px-4 py-3">18 - 22°C</td>
                <td className="px-4 py-3 text-sm">Mantener con calentador</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {protocolo18L.steps.map((phase, phaseIndex) => (
        <div key={phaseIndex} className="mb-6 p-4 bg-white rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-700 mb-3">{phase.phase}</h3>
          <div className="space-y-3">
            {phase.steps.map((step) => (
              <div key={step.step} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{step.icon}</span>
                    <p className="font-bold text-slate-800">{step.action}</p>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{step.details}</p>
                  {step.note && (
                    <p className="text-xs text-blue-600 mt-1 bg-blue-50 p-2 rounded">{step.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
        <h3 className="font-bold text-emerald-700 mb-3">✅ Ventajas del Protocolo 18L Corregido</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt-0.5" size={16} />
            <span><strong>EC constante:</strong> Simplifica el manejo, mismo rango para todas las plantas</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt-0.5" size={16} />
            <span><strong>Sin CalMag:</strong> AQUA VEGA A/B para aguas blandas ya contiene Ca y Mg en proporción óptima</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt-0.5" size={16} />
            <span><strong>Protocolo exacto:</strong> 45ml de A y B por 18L = 2.5ml por litro (CORREGIDO)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt-0.5" size={16} />
            <span><strong>Estabilidad:</strong> Medición diaria y ajustes mínimos mantienen el sistema estable</span>
          </li>
        </ul>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPONENTE DE MEDIDORES CIRCULARES
// ============================================================================

const CircularGauge = ({ value, max, min = 0, label, unit, color = "blue", size = "md" }) => {
  const sizes = {
    sm: "w-16 h-16 sm:w-24 sm:h-24",
    md: "w-20 h-20 sm:w-32 sm:h-32",
    lg: "w-24 h-24 sm:w-40 sm:h-40"
  };

  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    cyan: "text-cyan-600",
    emerald: "text-emerald-600"
  };

  const bgColors = {
    blue: "stroke-blue-200",
    green: "stroke-green-200",
    red: "stroke-red-200",
    purple: "stroke-purple-200",
    amber: "stroke-amber-200",
    cyan: "stroke-cyan-200",
    emerald: "stroke-emerald-200"
  };

  const fillColors = {
    blue: "stroke-blue-600",
    green: "stroke-green-600",
    red: "stroke-red-600",
    purple: "stroke-purple-600",
    amber: "stroke-amber-600",
    cyan: "stroke-cyan-600",
    emerald: "stroke-emerald-600"
  };

  const percentage = Math.min(100, ((value - min) / (max - min)) * 100);
  const strokeDasharray = 2 * Math.PI * 32;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  // Determinar color del valor según el rango
  const getValueColor = () => {
    if (label === "pH") {
      if (value >= 5.5 && value <= 6.5) return "text-green-600";
      if (value < 5.5 || value > 6.5) return "text-red-600";
      return "text-amber-600";
    } else if (label === "EC") {
      if (value >= 1350 && value <= 1500) return "text-green-600";
      if (value > 1500) return "text-red-600";
      return "text-amber-600";
    } else if (label === "Temperatura") {
      if (value >= 18 && value <= 22) return "text-green-600";
      if (value > 25) return "text-red-600";
      if (value < 15) return "text-blue-600";
      return "text-amber-600";
    } else if (label === "Volumen") {
      const volumePercentage = (value / max) * 100;
      if (volumePercentage >= 45) return "text-green-600";
      if (volumePercentage >= 25) return "text-amber-600";
      return "text-red-600";
    }
    return colors[color];
  };

  const colorClass = colors[color] || colors.blue;
  const bgColorClass = bgColors[color] || bgColors.blue;
  const fillColorClass = fillColors[color] || fillColors.blue;

  return (
    <div className={`flex flex-col items-center ${sizes[size]}`}>
      <div className="relative">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          {/* Fondo del círculo */}
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            strokeWidth="6"
            className={bgColorClass}
            strokeLinecap="round"
          />

          {/* Indicador de progreso */}
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            strokeWidth="6"
            className={fillColorClass}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.5s ease-in-out"
            }}
          />
        </svg>

        {/* Valor central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-lg sm:text-2xl font-bold ${getValueColor()}`}>
            {value}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{unit}</div>
        </div>
      </div>

      {/* Etiqueta */}
      <div className="mt-2 sm:mt-3 text-center space-y-0.5 sm:space-y-1">
        <div className="text-xs sm:text-sm font-bold text-slate-800">{label}</div>
        <div className="text-xs text-slate-500 space-y-0.5">
          {label === "pH" && (
            <div className="flex flex-col">
              <span>Ideal: 5.5-6.5</span>
              <span className="text-xs">Objetivo: 5.8</span>
            </div>
          )}
          {label === "EC" && (
            <div className="flex flex-col">
              <span>Ideal: 1350-1500</span>
              <span className="text-xs">Objetivo: 1400</span>
            </div>
          )}
          {label === "Temperatura" && (
            <div className="flex flex-col">
              <span>Ideal: 18-22°C</span>
              <span className="text-xs">Objetivo: 20°C</span>
            </div>
          )}
          {label === "Volumen" && (
            <div className="flex flex-col">
              <span>Máx: {max}L</span>
              <span className="text-xs">Actual: {value}L</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE DE ALERTAS METEOROLÓGICAS
// ============================================================================

const WeatherAlertsPanel = ({ alerts, protectionActions, location, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };
  
  return (
    <Card className="p-6 rounded-2xl mb-8 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <CloudRain className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-xl">Protección Meteorológica - Castellón</h2>
            <p className="text-slate-600">
              Monitoreo AEMET • Ubicación: {location?.latitude?.toFixed(4) || "39.9857"}, {location?.longitude?.toFixed(4) || "-0.0494"}
              {location?.isFallback && " (Castellón por defecto)"}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
          className="bg-white hover:bg-amber-100"
        >
          <RefreshCw className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} size={18} />
          {isRefreshing ? "Actualizando..." : "Actualizar Alertas"}
        </Button>
      </div>
      
      {/* Resumen de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl border-2 border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-slate-700">Nivel Actual</span>
            <Badge className={
              alerts?.some(a => a.level === "red") ? "bg-red-100 text-red-800" :
              alerts?.some(a => a.level === "orange") ? "bg-orange-100 text-orange-800" :
              alerts?.some(a => a.level === "yellow") ? "bg-yellow-100 text-yellow-800" :
              "bg-green-100 text-green-800"
            }>
              {alerts?.some(a => a.level === "red") ? "ROJO" :
               alerts?.some(a => a.level === "orange") ? "NARANJA" :
               alerts?.some(a => a.level === "yellow") ? "AMARILLO" : "SIN RIESGO"}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{alerts?.length || 0}</p>
          <p className="text-sm text-slate-600">Alertas activas</p>
        </div>
        
        <div className="p-4 bg-white rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Wind size={18} className="text-blue-600" />
            <span className="text-slate-700">Viento</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {alerts?.filter(a => a.phenomenon === "wind").length || 0}
          </p>
          <p className="text-sm text-slate-600">Alertas</p>
        </div>
        
        <div className="p-4 bg-white rounded-xl border-2 border-cyan-200">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain size={18} className="text-cyan-600" />
            <span className="text-slate-700">Lluvia</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {alerts?.filter(a => a.phenomenon === "rain").length || 0}
          </p>
          <p className="text-sm text-slate-600">Alertas</p>
        </div>
        
        <div className="p-4 bg-white rounded-xl border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} className="text-purple-600" />
            <span className="text-slate-700">Tormentas</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {alerts?.filter(a => a.phenomenon === "storm").length || 0}
          </p>
          <p className="text-sm text-slate-600">Alertas</p>
        </div>
      </div>
      
      {/* Alertas Activas */}
      {alerts && alerts.length > 0 ? (
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-4">⚠️ Alertas Meteorológicas Activas</h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-xl border-2 ${
                alert.level === "red" ? "border-red-300 bg-red-50" :
                alert.level === "orange" ? "border-orange-300 bg-orange-50" :
                "border-yellow-300 bg-yellow-50"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.level === "red" ? "bg-red-100" :
                      alert.level === "orange" ? "bg-orange-100" :
                      "bg-yellow-100"
                    }`}>
                      {WEATHER_PHENOMENA[alert.phenomenon]?.icon || <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{alert.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={
                          alert.level === "red" ? "bg-red-100 text-red-800" :
                          alert.level === "orange" ? "bg-orange-100 text-orange-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {alert.level.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Hasta: {new Date(alert.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {alert.isMock && (
                          <Badge className="bg-slate-100 text-slate-800">Simulación</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <h3 className="font-bold text-green-800">✅ Sin alertas meteorológicas</h3>
              <p className="text-green-700">No hay avisos activos de AEMET para Castellón</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Acciones de Protección */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4">🛡️ Acciones Recomendadas para la Torre</h3>
        <div className="space-y-4">
          {protectionActions?.map(action => (
            <div key={action.id} className="p-4 bg-white rounded-xl border-2 border-slate-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800">{action.title}</h4>
                    <Badge className={
                      action.level === "red" ? "bg-red-100 text-red-800" :
                      action.level === "orange" ? "bg-orange-100 text-orange-800" :
                      "bg-yellow-100 text-yellow-800"
                    }>
                      Prioridad {action.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                </div>
              </div>
              
              <div className="pl-9">
                <h5 className="font-medium text-slate-700 mb-2">Acciones específicas:</h5>
                <ul className="space-y-2">
                  {action.actions.map((actionItem, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-slate-700">{actionItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Información de Fuente */}
      <div className="mt-6 pt-4 border-t border-amber-200">
        <p className="text-xs text-slate-500">
          <strong>Fuente:</strong> Datos meteorológicos proporcionados por AEMET (Agencia Estatal de Meteorología) 
          para Castellón de la Plana (Zona {AEMET_ZONE_CODE}). 
          Actualizado: {new Date().toLocaleString()}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          <strong>Nota:</strong> En caso de denegar ubicación, se usan coordenadas por defecto de Castellón. 
          Para máxima precisión, permite el acceso a tu ubicación.
        </p>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPONENTES PARA MODALES
// ============================================================================

const RotationModal = ({ isOpen, onClose, onConfirm, plants }) => {
  const [newSeedlings, setNewSeedlings] = useState([]);
  const [selectedVariety, setSelectedVariety] = useState("Iceberg");
  const [selectedPositions, setSelectedPositions] = useState([]);

  // Posiciones disponibles en el nivel 1 (1-5)
  const availablePositions = Array.from({ length: 5 }, (_, i) => i + 1);

  // Obtener posiciones ocupadas actualmente
  const occupiedPositions = plants.filter(p => p.l === 1).map(p => p.p);

  // Posiciones libres en el nivel 1
  const freePositions = availablePositions.filter(pos => !occupiedPositions.includes(pos));

  const addSeedling = () => {
    if (newSeedlings.length >= 5) {
      alert("Ya has seleccionado 5 plántulas (máximo para el nivel 1)");
      return;
    }

    // Encontrar la siguiente posición disponible
    let nextPosition = 1;
    while (selectedPositions.includes(nextPosition) || newSeedlings.some(s => s.position === nextPosition)) {
      nextPosition++;
      if (nextPosition > 5) break;
    }

    if (nextPosition > 5) {
      alert("No hay posiciones disponibles en el nivel 1");
      return;
    }

    const newSeedling = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      variety: selectedVariety,
      position: nextPosition,
      level: 1
    };

    setNewSeedlings([...newSeedlings, newSeedling]);
    setSelectedPositions([...selectedPositions, nextPosition]);
  };

  const removeSeedling = (id) => {
    const seedling = newSeedlings.find(s => s.id === id);
    if (seedling) {
      setNewSeedlings(newSeedlings.filter(s => s.id !== id));
      setSelectedPositions(selectedPositions.filter(p => p !== seedling.position));
    }
  };

  const handleConfirm = () => {
    if (newSeedlings.length === 0) {
      alert("Debes añadir al menos una plántula para el nivel 1");
      return;
    }

    onConfirm(newSeedlings);
    setNewSeedlings([]);
    setSelectedPositions([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-xl">Rotación de Niveles y Nuevas Plántulas</h3>
            <p className="text-slate-600">Selecciona las 5 nuevas plántulas para el nivel 1</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-blue-700 mb-3">📋 Proceso de Rotación - RECOMENDACIÓN CADA 12 DÍAS</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 3 → Cosecha</p>
                    <p className="text-sm text-slate-600">Plantas maduras se cosechan después de aproximadamente 36 días</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 2 → Nivel 3</p>
                    <p className="text-sm text-slate-600">Plantas en crecimiento pasan a maduración (aproximadamente días 13-24)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 1 → Nivel 2</p>
                    <p className="text-sm text-slate-600">Plántulas pasan a crecimiento (aproximadamente días 1-12)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Añadir nuevas plántulas</p>
                    <p className="text-sm text-slate-600">Nuevas plantas en nivel 1 (5 máximo) según estado de crecimiento</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
              <h4 className="font-bold text-emerald-700 mb-3">🌱 Seleccionar Nueva Plántula</h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Variedad
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(VARIETIES).map(variety => (
                    <button
                      key={variety}
                      type="button"
                      onClick={() => setSelectedVariety(variety)}
                      className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                        selectedVariety === variety
                          ? `${VARIETIES[variety].color} text-white`
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {variety}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={addSeedling}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                disabled={newSeedlings.length >= 5}
              >
                <Plus className="mr-2" />
                Añadir Plántula {selectedVariety}
              </Button>

              <p className="text-xs text-slate-500 mt-3 text-center">
                {newSeedlings.length}/5 plántulas seleccionadas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-purple-700 mb-3">📊 Resumen de Rotación - CICLO APROXIMADO 36 DÍAS</h4>

              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-700">Plantas actuales:</span>
                    <span className="font-bold text-slate-800">{plants.length} plantas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Después de rotar:</span>
                    <span className="font-bold text-emerald-600">
                      {plants.filter(p => p.l !== 3).length + newSeedlings.length} plantas
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <h5 className="font-bold text-slate-800 mb-2">Nueva distribución:</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 1 (nuevas):</span>
                      <span className="font-bold text-cyan-600">{newSeedlings.length} plantas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 2 (ex nivel 1):</span>
                      <span className="font-bold text-green-600">{plants.filter(p => p.l === 1).length} plantas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 3 (ex nivel 2):</span>
                      <span className="font-bold text-emerald-600">{plants.filter(p => p.l === 2).length} plantas</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <h5 className="font-bold text-blue-700 mb-2">📅 Cronograma de Rotación (RECOMENDADO)</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 1 (plántulas):</span>
                      <span className="font-bold text-cyan-600">Aprox. días 1-12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 2 (crecimiento):</span>
                      <span className="font-bold text-green-600">Aprox. días 13-24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 3 (maduración):</span>
                      <span className="font-bold text-emerald-600">Aprox. días 25-36</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    ⚠️ Los tiempos pueden variar según condiciones climáticas y horas de sol
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3">🌿 Plántulas Seleccionadas</h4>

              {newSeedlings.length === 0 ? (
                <div className="text-center py-6">
                  <TreePine className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-slate-500">No hay plántulas seleccionadas</p>
                  <p className="text-sm text-slate-400">Añade plántulas usando el botón de la izquierda</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {newSeedlings.map(seedling => (
                    <div key={seedling.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[seedling.variety]?.color || 'bg-slate-200'}`}>
                          <span className="text-white text-xs font-bold">{seedling.position}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{seedling.variety}</p>
                          <p className="text-xs text-slate-500">Posición {seedling.position} • Nivel 1</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSeedling(seedling.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <div className="flex items-center gap-3">
            <Badge className="bg-amber-100 text-amber-800">
              {newSeedlings.length} / 5 plántulas
            </Badge>

            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              disabled={newSeedlings.length === 0}
            >
              <RotateCcw className="mr-2" />
              Confirmar Rotación (Según estado de crecimiento)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL - CON FUNCIONALIDAD METEOROLÓGICA INTEGRADA
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
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [selectedECMethod, setSelectedECMethod] = useState(null);
  const [showAddPlantForm, setShowAddPlantForm] = useState(false);

  // Configuración del sistema con valores iniciales según protocolo 18L
  const [config, setConfig] = useState({
    totalVol: "18",
    currentVol: "18",
    ph: "5,8",
    ec: "1400",
    temp: "20",
    targetEC: "1400",
    targetPH: "5,8",
    waterType: "osmosis",
    hasHeater: true,
    useOsmosisMix: false,
    osmosisMixPercentage: 0,
    waterNotes: "",
    calculationMethod: "escalonado"
  });

  // Estado para las mediciones
  const [measurements, setMeasurements] = useState({
    manualPH: "5,8",
    manualEC: "1400",
    manualTemp: "20",
    manualWaterTemp: "20",
    manualVolume: "18",
    manualHumidity: "65",
    phCorrectionMinus: "0,0",
    phCorrectionPlus: "0,0",
    ecCorrectionA: "0,0",
    ecCorrectionB: "0,0",
    ecCorrectionWater: "0,0",
    lastMeasurement: new Date().toISOString()
  });

  // Estado para los inputs temporales en la pestaña de mediciones
  const [tempMeasurements, setTempMeasurements] = useState({
    manualPH: "5,8",
    manualEC: "1400",
    manualTemp: "20",
    manualWaterTemp: "20",
    manualVolume: "18",
    manualHumidity: "65",
    phCorrectionMinus: "0,0",
    phCorrectionPlus: "0,0",
    ecCorrectionA: "0,0",
    ecCorrectionB: "0,0",
    ecCorrectionWater: "0,0"
  });

  // =================== NUEVOS ESTADOS PARA GESTIÓN METEOROLÓGICA ===================
  const [weatherData, setWeatherData] = useState({
    location: {
      latitude: 39.98567,
      longitude: -0.04935,
      accuracy: 5000,
      isFallback: true,
      lastUpdated: null
    },
    alerts: [],
    protectionActions: [],
    lastAlertCheck: null,
    isCheckingLocation: false,
    locationPermission: "pending" // "granted", "denied", "pending"
  });

  // =================== EFECTOS Y PERSISTENCIA ===================

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const saved = localStorage.getItem("hydro_caru_app");
        if (saved) {
          const data = JSON.parse(saved);
          
          // Restaurar datos existentes
          setPlants(data.plants || []);
          setConfig(data.config || config);
          setHistory(data.history || []);
          setLastRot(data.lastRot || lastRot);
          setLastClean(data.lastClean || lastClean);
          
          const savedMeasurements = data.measurements || {};
          setMeasurements({
            manualPH: savedMeasurements.manualPH || "5,8",
            manualEC: savedMeasurements.manualEC || "1400",
            manualTemp: savedMeasurements.manualTemp || "20",
            manualWaterTemp: savedMeasurements.manualWaterTemp || "20",
            manualVolume: savedMeasurements.manualVolume || (data.config?.currentVol || "18"),
            manualHumidity: savedMeasurements.manualHumidity || "65",
            phCorrectionMinus: savedMeasurements.phCorrectionMinus || "0,0",
            phCorrectionPlus: savedMeasurements.phCorrectionPlus || "0,0",
            ecCorrectionA: savedMeasurements.ecCorrectionA || "0,0",
            ecCorrectionB: savedMeasurements.ecCorrectionB || "0,0",
            ecCorrectionWater: savedMeasurements.ecCorrectionWater || "0,0",
            lastMeasurement: savedMeasurements.lastMeasurement || new Date().toISOString()
          });
          
          setTempMeasurements({
            manualPH: savedMeasurements.manualPH || "5,8",
            manualEC: savedMeasurements.manualEC || "1400",
            manualTemp: savedMeasurements.manualTemp || "20",
            manualWaterTemp: savedMeasurements.manualWaterTemp || "20",
            manualVolume: savedMeasurements.manualVolume || (data.config?.currentVol || "18"),
            manualHumidity: savedMeasurements.manualHumidity || "65",
            phCorrectionMinus: savedMeasurements.phCorrectionMinus || "0,0",
            phCorrectionPlus: savedMeasurements.phCorrectionPlus || "0,0",
            ecCorrectionA: savedMeasurements.ecCorrectionA || "0,0",
            ecCorrectionB: savedMeasurements.ecCorrectionB || "0,0",
            ecCorrectionWater: savedMeasurements.ecCorrectionWater || "0,0"
          });
          
          // Restaurar datos meteorológicos si existen
          if (data.weatherData) {
            setWeatherData(data.weatherData);
          } else {
            // Inicializar datos meteorológicos si no existen
            initializeWeatherMonitoring();
          }
          
          if (data.plants && data.plants.length > 0) {
            setStep(5);
            setTab("dashboard");
          }
        } else {
          // Inicializar datos meteorológicos en primera carga
          initializeWeatherMonitoring();
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        initializeWeatherMonitoring();
      }
    };
    
    loadSavedData();
  }, []);

  useEffect(() => {
    if (step >= 2) {
      try {
        localStorage.setItem("hydro_caru_app",
          JSON.stringify({
            plants,
            config,
            history,
            lastRot,
            lastClean,
            measurements,
            selectedECMethod,
            weatherData // Guardar también datos meteorológicos
          }));
      } catch (error) {
        console.error("Error guardando:", error);
      }
    }
  }, [plants, config, history, lastRot, lastClean, measurements, step, selectedECMethod, weatherData]);

  // Efecto para verificar alertas periódicamente (cada 30 minutos)
  useEffect(() => {
    const checkAlertsInterval = setInterval(() => {
      if (step >= 5) { // Solo si ya está configurado el sistema
        checkWeatherAlerts();
      }
    }, 30 * 60 * 1000); // 30 minutos
    
    return () => clearInterval(checkAlertsInterval);
  }, [step]);

  // =================== FUNCIONES UTILITARIAS ===================

  const generatePlantId = () => {
    return `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const deleteHistoryRecord = (id) => {
    setHistory(history.filter(record => record.id !== id));
  };

  const handleRotation = () => {
    setShowRotationModal(true);
  };

  const handleRotationConfirm = (newSeedlings) => {
    // 1. Eliminar plantas del nivel 3 (cosecha)
    const withoutMature = plants.filter(p => p.l !== 3);

    // 2. Mover plantas del nivel 2 al 3
    const movedToMature = withoutMature.map(p => {
      if (p.l === 2) {
        return { ...p, l: 3 };
      }
      return p;
    });

    // 3. Mover plantas del nivel 1 al 2
    const movedToGrowth = movedToMature.map(p => {
      if (p.l === 1) {
        return { ...p, l: 2 };
      }
      return p;
    });

    // 4. Añadir las nuevas plántulas al nivel 1
    const newPlants = newSeedlings.map(seedling => ({
      id: seedling.id,
      l: 1,
      v: seedling.variety,
      p: seedling.position,
      date: new Date().toISOString()
    }));

    // 5. Actualizar el estado de plantas
    setPlants([...movedToGrowth, ...newPlants]);

    // 6. Actualizar fecha de última rotación
    setLastRot(new Date().toISOString());

    // 7. Cerrar modal y mostrar confirmación
    setShowRotationModal(false);

    alert(`✅ Rotación completada exitosamente:
• ${plants.filter(p => p.l === 3).length} plantas cosechadas (nivel 3)
• ${plants.filter(p => p.l === 2).length} plantas movidas a nivel 3
• ${plants.filter(p => p.l === 1).length} plantas movidas a nivel 2
• ${newSeedlings.length} nuevas plántulas añadidas al nivel 1

⚠️ Nota: El tiempo de crecimiento puede variar según condiciones climáticas y horas de sol.`);

    setTab("tower");
  };

  const handleECCalculated = (ec) => {
    setConfig(prev => ({ ...prev, targetEC: ec }));
  };

  const handleECMethodChange = (method) => {
    setSelectedECMethod(method);

    if (method) {
      let newEC = "1400";

      if (method === "escalonado") {
        const result = calculateStagedEC(plants);
        newEC = result.targetEC;
      } else if (method === "promedio") {
        const result = calculateAverageEC(plants);
        newEC = result.targetEC;
      } else if (method === "conservador") {
        const result = calculateConservativeEC(plants);
        newEC = result.targetEC;
      }

      setConfig(prev => ({ ...prev, targetEC: newEC }));
    }
  };

  // =================== FUNCIONES DE GESTIÓN METEOROLÓGICA ===================

  /**
   * Inicializa el monitoreo meteorológico
   */
  const initializeWeatherMonitoring = async () => {
    setWeatherData(prev => ({
      ...prev,
      isCheckingLocation: true
    }));
    
    try {
      // Obtener ubicación del usuario
      const location = await getUserLocation();
      
      // Obtener alertas para esa ubicación
      const alerts = await fetchWeatherAlerts(location);
      
      // Generar acciones de protección
      const protectionActions = generateProtectionActions(alerts, {});
      
      setWeatherData(prev => ({
        ...prev,
        location: {
          ...location,
          lastUpdated: new Date().toISOString()
        },
        alerts,
        protectionActions,
        lastAlertCheck: new Date().toISOString(),
        isCheckingLocation: false,
        locationPermission: location.isFallback ? "denied" : "granted"
      }));
      
    } catch (error) {
      console.error("Error inicializando monitoreo meteorológico:", error);
      
      // Usar datos por defecto
      const defaultLocation = {
        latitude: 39.98567,
        longitude: -0.04935,
        accuracy: 5000,
        isFallback: true,
        lastUpdated: new Date().toISOString()
      };
      
      const mockAlerts = getMockAlerts(defaultLocation);
      const protectionActions = generateProtectionActions(mockAlerts, {});
      
      setWeatherData(prev => ({
        ...prev,
        location: defaultLocation,
        alerts: mockAlerts,
        protectionActions,
        lastAlertCheck: new Date().toISOString(),
        isCheckingLocation: false,
        locationPermission: "denied"
      }));
    }
  };

  /**
   * Verifica alertas meteorológicas actuales
   */
  const checkWeatherAlerts = async () => {
    try {
      const alerts = await fetchWeatherAlerts(weatherData.location);
      const protectionActions = generateProtectionActions(alerts, {});
      
      setWeatherData(prev => ({
        ...prev,
        alerts,
        protectionActions,
        lastAlertCheck: new Date().toISOString()
      }));
      
      // Mostrar notificación si hay nuevas alertas importantes
      const newImportantAlerts = alerts.filter(alert => 
        ["red", "orange"].includes(alert.level) &&
        !prev.alerts.some(prevAlert => prevAlert.id === alert.id)
      );
      
      if (newImportantAlerts.length > 0) {
        alert(`⚠️ NUEVAS ALERTAS METEOROLÓGICAS IMPORTANTES\n\n` +
              `${newImportantAlerts.map(a => `• ${a.title}`).join('\n')}\n\n` +
              `Revisa el panel de protección meteorológica para acciones recomendadas.`);
      }
      
    } catch (error) {
      console.error("Error verificando alertas:", error);
    }
  };

  /**
   * Actualiza manualmente las alertas meteorológicas
   */
  const refreshWeatherAlerts = async () => {
    setWeatherData(prev => ({ ...prev, isCheckingLocation: true }));
    
    try {
      // Re-obtener ubicación (pueda haber cambiado)
      const location = await getUserLocation();
      const alerts = await fetchWeatherAlerts(location);
      const protectionActions = generateProtectionActions(alerts, {});
      
      setWeatherData(prev => ({
        ...prev,
        location: {
          ...location,
          lastUpdated: new Date().toISOString()
        },
        alerts,
        protectionActions,
        lastAlertCheck: new Date().toISOString(),
        isCheckingLocation: false,
        locationPermission: location.isFallback ? "denied" : "granted"
      }));
      
    } catch (error) {
      console.error("Error actualizando alertas:", error);
      setWeatherData(prev => ({ ...prev, isCheckingLocation: false }));
    }
  };

  // =================== FUNCIONES CORREGIDAS PARA INPUTS ===================
  
  // Función para manejar cambios en los inputs de mediciones
  const handleMeasurementInputChange = (field, value) => {
    // Permitir números, coma y un solo decimal
    let sanitizedValue = value;
    
    // Reemplazar punto por coma para consistencia
    sanitizedValue = sanitizedValue.replace('.', ',');
    
    // Permitir números, coma, y máximo un decimal después de la coma
    const regex = /^(\d+)(,?\d{0,2})?$/;
    
    // Si el valor está vacío o cumple con la expresión regular, actualizar
    if (sanitizedValue === '' || regex.test(sanitizedValue)) {
      setTempMeasurements(prev => ({
        ...prev,
        [field]: sanitizedValue
      }));
    }
  };

  // Función para convertir string con coma a número
  const parseDecimal = (value) => {
    if (typeof value !== 'string') return parseFloat(value);
    // Permitir tanto punto como coma como separador decimal
    const normalizedValue = value.replace(',', '.');
    return parseFloat(normalizedValue) || 0;
  };

  // Función para formatear número a string con coma
  const formatDecimal = (value) => {
    if (typeof value === 'number') {
      return value.toString().replace('.', ',');
    }
    return value;
  };

  // Función para guardar medición individual al perder foco
  const saveMeasurementOnBlur = (field) => {
    const value = tempMeasurements[field];
    
    if (value === '') {
      // Si está vacío, restaurar el valor anterior
      setTempMeasurements(prev => ({
        ...prev,
        [field]: measurements[field]
      }));
      return;
    }
    
    // Convertir a número
    const numericValue = parseDecimal(value);
    
    if (!isNaN(numericValue)) {
      const formattedValue = formatDecimal(numericValue);
      
      // Actualizar estado principal
      setMeasurements(prev => ({
        ...prev,
        [field]: formattedValue
      }));

      // Actualizar config si corresponde
      if (field === 'manualPH') {
        setConfig(prev => ({ ...prev, ph: formattedValue }));
      } else if (field === 'manualEC') {
        setConfig(prev => ({ ...prev, ec: formattedValue }));
      } else if (field === 'manualTemp') {
        setConfig(prev => ({ ...prev, temp: formattedValue }));
      } else if (field === 'manualVolume') {
        setConfig(prev => ({ ...prev, currentVol: formattedValue }));
      }
    } else {
      // Si no es un número válido, restaurar el valor anterior
      setTempMeasurements(prev => ({
        ...prev,
        [field]: measurements[field]
      }));
    }
  };

  // Función para actualizar mediciones desde sliders
  const updateMeasurementFromSlider = (field, value) => {
    const stringValue = formatDecimal(value);
    
    // Actualizar ambos estados inmediatamente
    setMeasurements(prev => ({
      ...prev,
      [field]: stringValue
    }));
    
    setTempMeasurements(prev => ({
      ...prev,
      [field]: stringValue
    }));

    // Actualizar config si corresponde
    if (field === 'manualPH') {
      setConfig(prev => ({ ...prev, ph: stringValue }));
    } else if (field === 'manualEC') {
      setConfig(prev => ({ ...prev, ec: stringValue }));
    } else if (field === 'manualTemp') {
      setConfig(prev => ({ ...prev, temp: stringValue }));
    } else if (field === 'manualVolume') {
        setConfig(prev => ({ ...prev, currentVol: stringValue }));
      }
    };
  
    // Función para guardar todas las mediciones manuales
    const saveAllManualMeasurements = () => {
      const now = new Date().toISOString();
      
      // Primero sincronizar todos los campos
      const fieldsToSync = [
        'manualPH', 'manualEC', 'manualTemp', 
        'manualWaterTemp', 'manualVolume', 'manualHumidity',
        'phCorrectionMinus', 'phCorrectionPlus',
        'ecCorrectionA', 'ecCorrectionB', 'ecCorrectionWater'
      ];
      
      let allValid = true;
      const updatedMeasurements = { ...measurements };
      const updatedConfig = { ...config };
      
      fieldsToSync.forEach(field => {
        const value = tempMeasurements[field];
        
        // Si el campo está vacío, usar el valor anterior
        if (value === '') {
          updatedMeasurements[field] = measurements[field];
          return;
        }
        
        const numericValue = parseDecimal(value);
        
        if (!isNaN(numericValue)) {
          const formattedValue = formatDecimal(numericValue);
          updatedMeasurements[field] = formattedValue;
          
          // Actualizar config si corresponde
          if (field === 'manualPH') {
            updatedConfig.ph = formattedValue;
          } else if (field === 'manualEC') {
            updatedConfig.ec = formattedValue;
          } else if (field === 'manualTemp') {
            updatedConfig.temp = formattedValue;
          } else if (field === 'manualVolume') {
            updatedConfig.currentVol = formattedValue;
          }
        } else {
          allValid = false;
          // Restaurar valor anterior si no es válido
          updatedMeasurements[field] = measurements[field];
        }
      });
      
      if (!allValid) {
        alert("Algunos valores no son números válidos. Por favor, corrige los campos en rojo.");
        return;
      }
      
      // Actualizar estados
      setMeasurements({
        ...updatedMeasurements,
        lastMeasurement: now
      });
      setConfig(updatedConfig);
      
      // Guardar en historial
      const measurementRecord = {
        id: generatePlantId(),
        date: now,
        ph: updatedMeasurements.manualPH,
        ec: updatedMeasurements.manualEC,
        temp: updatedMeasurements.manualTemp,
        waterTemp: updatedMeasurements.manualWaterTemp,
        volume: updatedMeasurements.manualVolume,
        humidity: updatedMeasurements.manualHumidity,
        corrections: {
          phMinus: updatedMeasurements.phCorrectionMinus,
          phPlus: updatedMeasurements.phCorrectionPlus,
          ecA: updatedMeasurements.ecCorrectionA,
          ecB: updatedMeasurements.ecCorrectionB,
          ecWater: updatedMeasurements.ecCorrectionWater
        },
        notes: "Medición manual completa",
        type: "measurement"
      };
      
      setHistory([measurementRecord, ...history.slice(0, 49)]);

      alert(`✅ Medición completa guardada:
pH: ${updatedMeasurements.manualPH}
EC: ${updatedMeasurements.manualEC} µS/cm
Temp ambiente: ${updatedMeasurements.manualTemp}°C
Temp agua: ${updatedMeasurements.manualWaterTemp}°C
Volumen: ${updatedMeasurements.manualVolume}L
Humedad: ${updatedMeasurements.manualHumidity}%

Correcciones aplicadas:
pH-: ${updatedMeasurements.phCorrectionMinus}ml
pH+: ${updatedMeasurements.phCorrectionPlus}ml
EC A: ${updatedMeasurements.ecCorrectionA}ml
EC B: ${updatedMeasurements.ecCorrectionB}ml
Agua destilada: ${updatedMeasurements.ecCorrectionWater}ml`);
    };
  
    // =================== CÁLCULOS ===================
  
    const waterCharacteristics = useMemo(() => {
      return getWaterCharacteristics(config.waterType);
    }, [config.waterType]);
  
    const aquaVegaDosage = useMemo(() => {
      return calculateAquaVegaDosage(
        plants,
        parseDecimal(measurements.manualVolume || config.currentVol),
        parseDecimal(config.targetEC)
      );
    }, [plants, measurements.manualVolume, config.currentVol, config.targetEC]);
  
    const phAdjustment = useMemo(() => {
      return calculatePHAdjustment(
        parseDecimal(measurements.manualPH),
        parseDecimal(config.targetPH),
        parseDecimal(measurements.manualVolume || config.currentVol)
      );
    }, [measurements.manualPH, config.targetPH, measurements.manualVolume, config.currentVol]);
  
    const plantStats = useMemo(() => {
      return calculatePlantStats(plants);
    }, [plants]);
  
    const calendarDays = useMemo(() => {
      return generateCalendar(plants, lastRot, lastClean);
    }, [plants, lastRot, lastClean]);
  
    const season = useMemo(() => {
      return getSeason();
    }, []);
  
    // =================== ALERTAS ACTUALIZADAS CON METEOROLOGÍA ===================
  
    const alerts = useMemo(() => {
      const vAct = parseDecimal(measurements.manualVolume || config.currentVol) || 0;
      const vTot = parseDecimal(config.totalVol) || 18;
      const ph = parseDecimal(measurements.manualPH) || 5.8;
      const ec = parseDecimal(measurements.manualEC) || 0;
      const tEc = parseDecimal(config.targetEC) || 1400;
      const tPh = parseDecimal(config.targetPH) || 5.8;
      const temp = parseDecimal(measurements.manualTemp) || 20;
      const waterTemp = parseDecimal(measurements.manualWaterTemp) || 20;
      const res = [];
  
      // Añadir alertas meteorológicas importantes al principio
      const importantWeatherAlerts = weatherData.alerts?.filter(alert => 
        ["red", "orange"].includes(alert.level)
      ) || [];
      
      importantWeatherAlerts.forEach(alert => {
        const alertConfig = {
          title: `ALERTA ${alert.level.toUpperCase()}: ${WEATHER_PHENOMENA[alert.phenomenon]?.name || alert.phenomenon}`,
          value: alert.level.toUpperCase(),
          description: alert.description,
          color: alert.level === "red" ? "bg-gradient-to-r from-red-700 to-rose-800" :
                 alert.level === "orange" ? "bg-gradient-to-r from-orange-600 to-red-500" :
                 "bg-gradient-to-r from-amber-500 to-orange-500",
          icon: WEATHER_PHENOMENA[alert.phenomenon]?.icon || <AlertTriangle className="text-white" size={28} />,
          priority: alert.level === "red" ? 1 : 2,
          details: `Recomendación: ${alert.recommendations}`
        };
        
        // Insertar al principio por prioridad
        res.unshift(alertConfig);
      });

      // Alerta para agua destilada
      res.push({
        title: "PROTOCOLO 18L ACTIVADO",
        value: "45ml A+B",
        description: "Protocolo específico para 18L: 45ml AQUA VEGA A y B",
        color: "bg-gradient-to-r from-blue-700 to-cyan-800",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 3
      });

      // Alertas de volumen
      if (vAct < vTot * 0.25) {
        res.push({
          title: "¡AGUA MUY BAJA!",
          value: `${formatDecimal(vTot - vAct)}L`,
          description: `Crítico: Solo queda un ${(vAct / vTot * 100).toFixed(0)}%`,
          color: "bg-gradient-to-r from-red-600 to-rose-700",
          icon: <Droplets className="text-white" size={28} />,
          priority: 1
        });
      }
      else if (vAct < vTot * 0.45) {
        res.push({
          title: "RELLENAR AGUA",
          value: `${formatDecimal(vTot - vAct)}L`,
          description: `Depósito al ${(vAct / vTot * 100).toFixed(0)}%`,
          color: "bg-gradient-to-r from-amber-500 to-orange-500",
          icon: <CloudRain className="text-white" size={28} />,
          priority: 2
        });
      }

      // Alertas de temperatura agua
      if (waterTemp > 22) {
        res.push({
          title: "¡TEMP AGUA ALTA!",
          value: `${waterTemp}°C`,
          description: "Riesgo de baja oxigenación. Ajustar calentador a 20°C.",
          color: "bg-gradient-to-r from-red-700 to-pink-800",
          icon: <ThermometerSun className="text-white" size={28} />,
          priority: 1
        });
      }
      else if (waterTemp < 18) {
        res.push({
          title: "TEMP AGUA BAJA",
          value: `${waterTemp}°C`,
          description: "Crecimiento lento. Ajustar calentador a 20°C.",
          color: "bg-gradient-to-r from-blue-700 to-cyan-800",
          icon: <ThermometerSnowflake className="text-white" size={28} />,
          priority: 2
        });
      }

      // Alertas de temperatura ambiente
      if (temp > 28) {
        res.push({
          title: "¡PELIGRO TEMPERATURA!",
          value: `${temp}°C`,
          description: "Alto riesgo. Considerar ventilación adicional.",
          color: "bg-gradient-to-r from-red-700 to-pink-800",
          icon: <ThermometerSun className="text-white" size={28} />,
          priority: 1
        });
      }
      else if (temp > 25) {
        res.push({
          title: "TEMPERATURA ALTA",
          value: `${temp}°C`,
          description: "Oxígeno bajo. Considerar ventilación.",
          color: "bg-gradient-to-r from-orange-500 to-red-500",
          icon: <Thermometer className="text-white" size={28} />,
          priority: 2
        });
      }

      // Alertas de pH
      if (ph > 6.5 || ph < 5.5) {
        const action = ph > 6.5 ? "pH-" : "pH+";
        const ml = ph > 6.5 ? phAdjustment.phMinus : phAdjustment.phPlus;
        const severity = Math.abs(ph - tPh) > 0.8 ? 1 : 2;
        
        res.push({
          title: `AJUSTAR ${action}`,
          value: `${ml}ml`,
          description: `pH ${ph} fuera de rango (5.5-6.5). Objetivo ${tPh}. ${phAdjustment.recommendation}`,
          color: severity === 1 
            ? "bg-gradient-to-r from-red-700 to-pink-800" 
            : "bg-gradient-to-r from-purple-500 to-pink-500",
          icon: <ArrowDownCircle className={ph > tPh ? "" : "rotate-180"} size={28} />,
          priority: severity,
          details: phAdjustment.method
        });
      }

      // Alertas de EC
      const ecAlert = checkECAlert(ec);
      if (ecAlert) {
        if (ecAlert.type === 'low') {
          const mlPerPoint = 3.2; // 3.2ml por cada 0.1 mS/cm (CORREGIDO)
          const pointsLow = (FIXED_EC_RANGE.target - ec) / 100;
          const mlToAdd = pointsLow * mlPerPoint * 2; // x2 para A y B
          
          res.push({
            title: "EC BAJA - AÑADIR A+B",
            value: `${Math.round(mlToAdd)}ml`,
            description: `EC ${ec} µS/cm. Añadir AQUA VEGA A y B.`,
            color: ecAlert.severity === 1 
              ? "bg-gradient-to-r from-red-700 to-amber-800" 
              : "bg-gradient-to-r from-blue-600 to-cyan-600",
            icon: <FlaskConical className="text-white" size={28} />,
            priority: ecAlert.severity,
            details: `Objetivo: ${FIXED_EC_RANGE.target} µS/cm (3.2ml por cada 0.1 mS/cm)`
          });
        } else if (ecAlert.type === 'high') {
          const waterToAdd = ((ec - FIXED_EC_RANGE.target) / 100) * 100; // 100ml por cada 0.1 mS/cm
          
          res.push({
            title: "EC ALTA - DILUIR",
            value: `${Math.round(waterToAdd)}ml`,
            description: `EC ${ec} µS/cm. Añadir agua destilada.`,
            color: ecAlert.severity === 1 
              ? "bg-gradient-to-r from-red-800 to-amber-900" 
              : "bg-gradient-to-r from-amber-600 to-orange-600",
            icon: <AlertTriangle className="text-white" size={28} />,
            priority: ecAlert.severity,
            details: `Objetivo: ${FIXED_EC_RANGE.target} µS/cm`
          });
        }
      }

      // Alerta de recarga de nutrientes
      const daysSinceLastRecharge = history.filter(h => 
        h.type === 'recharge' || (h.notes && h.notes.includes('recarga'))
      ).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      
      if (daysSinceLastRecharge) {
        const daysDiff = Math.floor((new Date() - new Date(daysSinceLastRecharge.date)) / (1000 * 3600 * 24));
        if (daysDiff >= 10) {
          res.push({
            title: "RECARGA DE NUTRIENTES",
            value: `${daysDiff} días`,
            description: "EC puede haber bajado 30%. Recargar con A y B.",
            color: "bg-gradient-to-r from-emerald-600 to-green-700",
            icon: <RefreshCw className="text-white" size={28} />,
            priority: 2
          });
        }
      }

      // Alerta de cambio completo
      const lastCleanDate = new Date(lastClean);
      const now = new Date();
      const daysSinceClean = Math.floor((now - lastCleanDate) / (1000 * 3600 * 24));

      if (daysSinceClean >= 12) {
        res.push({
          title: daysSinceClean >= 14 ? "¡CAMBIO COMPLETO URGENTE!" : "CAMBIO COMPLETO PRÓXIMO",
          value: `${daysSinceClean} días`,
          description: daysSinceClean >= 14 ? "Realizar cambio completo de solución" : "Programar cambio en próximos días",
          color: daysSinceClean >= 14 ? "bg-gradient-to-r from-red-700 to-rose-800" : "bg-gradient-to-r from-violet-600 to-purple-700",
          icon: <ShieldAlert className="text-white" size={28} />,
          priority: daysSinceClean >= 14 ? 1 : 3
        });
      }

      // ALERTA DE ROTACIÓN MODIFICADA: AHORA ES UNA RECOMENDACIÓN, NO OBLIGACIÓN
      const lastRotDate = new Date(lastRot);
      const daysSinceRot = Math.floor((now - lastRotDate) / (1000 * 3600 * 24));
      
      if (daysSinceRot >= 10) {
        // Cambiado de "urgente" a "recomendada"
        res.push({
          title: "RECOMENDACIÓN: ROTACIÓN",
          value: `${daysSinceRot} días`,
          description: `Considerar rotación de niveles. El tiempo puede variar según clima y horas de sol.`,
          color: "bg-gradient-to-r from-blue-600 to-cyan-700",
          icon: <RotateCcw className="text-white" size={28} />,
          priority: 3, // Prioridad baja, solo recomendación
          details: "Recomendación cada 12 días según condiciones óptimas de crecimiento"
        });
      }

      return res.sort((a, b) => a.priority - b.priority);
    }, [config, lastClean, lastRot, history, phAdjustment, aquaVegaDosage, measurements, weatherData.alerts]);

    // =================== FUNCIÓN PARA REGISTRAR LIMPIEZA ===================

    const handleRegisterClean = () => {
      const now = new Date().toISOString();
      setLastClean(now);

      const cleanRecord = {
        id: generatePlantId(),
        date: now,
        type: "clean",
        description: "Limpieza y cambio completo de solución",
        notes: "Protocolo 18L: cambio completo cada 2 semanas"
      };

      setHistory([cleanRecord, ...history.slice(0, 49)]);

      alert(`✅ Cambio completo registrado:
Fecha: ${new Date(now).toLocaleDateString()}
Hora: ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

Próximo cambio recomendado: en 14 días`);
    };

    // =================== FUNCIÓN PARA REGISTRAR RECARGA ===================

    const handleRegisterRecharge = () => {
      const now = new Date().toISOString();
      
      const rechargeRecord = {
        id: generatePlantId(),
        date: now,
        type: "recharge",
        description: "Recarga de nutrientes AQUA VEGA A y B",
        notes: `Recarga estándar: +13ml A y B para 18L`,
        dosage: { a: 13, b: 13 }
      };

      setHistory([rechargeRecord, ...history.slice(0, 49)]);

      alert(`✅ Recarga de nutrientes registrada:
• +13ml AQUA VEGA A
• +13ml AQUA VEGA B
• Para 18L de solución

Próxima recarga: en 10 días o cuando EC baje a ~1.0 mS/cm`);
    };

    // =================== COMPONENTES DE PESTAÑAS ===================

    const DashboardTab = ({ config, measurements }) => {
      const getStatusText = (label, value) => {
        const numValue = parseDecimal(value);
        if (label === "pH") {
          if (numValue >= 5.5 && numValue <= 6.5) return "✅ ÓPTIMO";
          if (numValue < 5.5 || numValue > 6.5) return "⚠️ AJUSTAR";
          return "⚠️ AJUSTAR";
        } else if (label === "EC") {
          const ecAlert = checkECAlert(numValue);
          if (!ecAlert) return "✅ ÓPTIMA";
          if (ecAlert.severity === 1) return "🚨 ALTA";
          return "⚠️ BAJA";
        } else if (label === "Temperatura") {
          if (numValue >= 18 && numValue <= 22) return "✅ ÓPTIMA";
          if (numValue > 25) return "🚨 ALTA";
          if (numValue < 15) return "❄️ BAJA";
          return "⚠️ AJUSTAR";
        } else if (label === "Volumen") {
          const volumePercentage = (numValue / parseDecimal(config.totalVol)) * 100;
          if (volumePercentage >= 45) return "✅ ADECUADO";
          if (volumePercentage >= 25) return "⚠️ BAJO";
          return "🚨 MUY BAJO";
        }
        return "";
      };

      const systemRange = calculateSystemECRange();
      const ecAlert = checkECAlert(parseDecimal(measurements.manualEC));

      return (
        <Card className="p-6 rounded-2xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl">Parámetros Actuales - Protocolo 18L Corregido</h2>
              <p className="text-slate-600">Valores según protocolo corregido para cultivo de lechuga</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Medidor de pH */}
            <div className="flex flex-row items-center gap-4 p-4 bg-gradient-to-b from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <div className="flex-shrink-0 order-1 md:order-2">
                <CircularGauge
                  value={parseDecimal(measurements.manualPH)}
                  min={4}
                  max={9}
                  label="pH"
                  unit=""
                  color="purple"
                  size="md"
                />
              </div>
              <div className="flex-1 min-w-0 order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Activity className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-700">pH del Agua</h3>
                    <p className="text-sm text-slate-600">Rango de trabajo: 5.5 - 6.5</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">Valor actual:</span>
                      <span className="text-xl md:text-2xl font-bold text-purple-600">{measurements.manualPH}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">Estado:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        parseDecimal(measurements.manualPH) >= 5.5 && parseDecimal(measurements.manualPH) <= 6.5
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {getStatusText("pH", measurements.manualPH)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-purple-100">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Objetivo:</span> {config.targetPH}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {parseDecimal(measurements.manualPH) >= 5.5 && parseDecimal(measurements.manualPH) <= 6.5
                        ? "✅ pH en rango ideal para absorción de nutrientes"
                        : "⚠️ Ajustar con método de titulación (0,5ml por paso)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medidor de EC */}
            <div className="flex flex-row items-center gap-4 p-4 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <div className="flex-shrink-0 order-1 md:order-2">
                <CircularGauge
                  value={parseDecimal(measurements.manualEC)}
                  min={0}
                  max={3000}
                  label="EC"
                  unit="µS/cm"
                  color={ecAlert ? (ecAlert.severity === 1 ? "red" : "amber") : "blue"}
                  size="md"
                />
              </div>
              <div className="flex-1 min-w-0 order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Zap className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-700">Conductividad (EC)</h3>
                    <p className="text-sm text-slate-600">Rango fijo: 1350-1500 µS/cm</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">Valor actual:</span>
                      <span className={`text-xl md:text-2xl font-bold ${
                        ecAlert ? (ecAlert.severity === 1 ? 'text-red-600' : 'text-amber-600') : 'text-blue-600'
                      }`}>
                        {measurements.manualEC} µS/cm
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">Estado:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        ecAlert ? (ecAlert.severity === 1 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800') : 'bg-green-100 text-green-800'
                      }`}>
                        {getStatusText("EC", measurements.manualEC)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-100">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Rango fijo:</span> 1350-1500 µS/cm
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {ecAlert ? (
                        <span className={ecAlert.severity === 1 ? 'text-red-600 font-bold' : 'text-amber-600'}>
                          {ecAlert.message}
                        </span>
                      ) : (
                        "✅ EC en rango fijo para todas las variedades"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medidor de Temperatura Agua */}
            <div className="flex flex-row items-center gap-4 p-4 bg-gradient-to-b from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
              <div className="flex-shrink-0 order-1 md:order-2">
                <CircularGauge
                  value={parseDecimal(measurements.manualWaterTemp || "20")}
                  min={0}
                  max={40}
                  label="Temp. Agua"
                  unit="°C"
                  color="cyan"
                  size="md"
                />
              </div>
              <div className="flex-1 min-w-0 order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Thermometer className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-cyan-700">Temperatura del Agua</h3>
                    <p className="text-sm text-slate-600">Fundamental para salud radicular</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">Valor actual:</span>
                      <span className="text-xl md:text-2xl font-bold text-cyan-600">{measurements.manualWaterTemp || "20"}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">Estado:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        parseDecimal(measurements.manualWaterTemp || "20") >= 18 && parseDecimal(measurements.manualWaterTemp || "20") <= 22
                          ? 'bg-green-100 text-green-800'
                          : parseDecimal(measurements.manualWaterTemp || "20") > 22
                            ? 'bg-red-100 text-red-800'
                            : parseDecimal(measurements.manualWaterTemp || "20") < 18
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                      }`}>
                        {parseDecimal(measurements.manualWaterTemp || "20") >= 18 && parseDecimal(measurements.manualWaterTemp || "20") <= 22
                          ? "✅ ÓPTIMA"
                          : parseDecimal(measurements.manualWaterTemp || "20") > 22
                            ? "🚨 ALTA"
                            : parseDecimal(measurements.manualWaterTemp || "20") < 18
                              ? "❄️ BAJA"
                              : "⚠️ AJUSTAR"}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-cyan-100">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Rango ideal:</span> 18-22°C
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {parseDecimal(measurements.manualWaterTemp || "20") >= 18 && parseDecimal(measurements.manualWaterTemp || "20") <= 22
                        ? "✅ Temperatura óptima para absorción de nutrientes"
                        : parseDecimal(measurements.manualWaterTemp || "20") > 22
                          ? "⚠️ Temperatura alta reduce oxígeno disuelto"
                          : "⚠️ Temperatura baja ralentiza el crecimiento"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medidor de Volumen */}
            <div className="flex flex-row items-center gap-4 p-4 bg-gradient-to-b from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
              <div className="flex-shrink-0 order-1 md:order-2">
                <CircularGauge
                  value={parseDecimal(measurements.manualVolume || config.currentVol)}
                  min={0}
                  max={parseDecimal(config.totalVol)}
                  label="Volumen"
                  unit="L"
                  color="emerald"
                  size="md"
                />
              </div>
              <div className="flex-1 min-w-0 order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Droplets className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-700">Volumen de Agua</h3>
                    <p className="text-sm text-slate-600">Depósito del sistema</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">Volumen actual:</span>
                      <span className="text-xl md:text-2xl font-bold text-emerald-600">{measurements.manualVolume || config.currentVol}L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">Capacidad total:</span>
                      <span className="font-bold text-slate-800">{config.totalVol}L</span>
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={(parseDecimal(measurements.manualVolume || config.currentVol) / parseDecimal(config.totalVol)) * 100}
                        className="h-3"
                      />
                      <div className="flex justify-between text-sm text-slate-600 mt-1">
                        <span>0L</span>
                        <span>{Math.round((parseDecimal(measurements.manualVolume || config.currentVol) / parseDecimal(config.totalVol)) * 100)}%</span>
                        <span>{config.totalVol}L</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-emerald-100">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Estado:</span> {getStatusText("Volumen", measurements.manualVolume || config.currentVol)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(parseDecimal(measurements.manualVolume || config.currentVol) / parseDecimal(config.totalVol)) * 100 >= 45
                        ? "✅ Volumen adecuado"
                        : (parseDecimal(measurements.manualVolume || config.currentVol) / parseDecimal(config.totalVol)) * 100 >= 25
                          ? "⚠️ Rellenar con agua destilada"
                          : "🚨 Rellenar inmediatamente"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de estado */}
          <div className="mt-6 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200">
            <h4 className="font-bold text-slate-700 mb-4 text-lg">📊 Resumen del Estado del Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Última medición:</span>
                  <span className="font-bold text-blue-600">
                    {new Date(measurements.lastMeasurement).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(measurements.lastMeasurement).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Tipo de agua:</span>
                  <span className="font-bold text-cyan-600">
                    Agua Destilada
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Protocolo: 45ml A+B por 18L (CORREGIDO)
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Temp agua:</span>
                  <span className={`font-bold ${
                    parseDecimal(measurements.manualWaterTemp || "20") >= 18 && parseDecimal(measurements.manualWaterTemp || "20") <= 22
                      ? "text-green-600"
                      : parseDecimal(measurements.manualWaterTemp || "20") > 22
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}>
                    {measurements.manualWaterTemp || "20"}°C
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {parseDecimal(measurements.manualWaterTemp || "20") > 22 ? "⚠️ Demasiado caliente" :
                    parseDecimal(measurements.manualWaterTemp || "20") < 18 ? "❄️ Demasiado fría" :
                      "✅ Ideal"}
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Humedad:</span>
                  <span className={`font-bold ${
                    parseDecimal(measurements.manualHumidity || "65") >= 40 && parseDecimal(measurements.manualHumidity || "65") <= 70
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}>
                    {measurements.manualHumidity || "65"}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {parseDecimal(measurements.manualHumidity || "65") < 40 ? "⚠️ Demasiado seca" :
                    parseDecimal(measurements.manualHumidity || "65") > 70 ? "⚠️ Demasiado húmeda" :
                      "✅ Ideal"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      );
    };

    const IrrigationTab = () => {
      const irrigationData = useMemo(() => {
        return calculateIrrigation(
          plants,
          parseDecimal(measurements.manualTemp),
          parseDecimal(measurements.manualHumidity),
          season
        );
      }, [plants, measurements.manualTemp, measurements.manualHumidity, season]);

      return (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Programa de Riego Optimizado - 3 minutos por ciclo</h2>
            <p className="text-slate-600">Nuevo programa: 08:30-20:30 cada hora, luego 00:00, 03:00 y 05:30</p>
          </div>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <WaterDroplets className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Programa de Riego Optimizado</h3>
                <p className="text-sm text-slate-600">3 minutos por ciclo para garantizar que los nutrientes lleguen a todas las raíces</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
              <h4 className="font-bold text-emerald-700 mb-3">✅ PROGRAMA OPTIMIZADO CONFIRMADO</h4>
              <p className="text-slate-700">
                <strong>Programa de riego mejorado:</strong> 3 minutos por ciclo garantizan que los nutrientes lleguen a todas las raíces de la torre vertical.
                <br />
                <strong>Horario:</strong> 08:30 a 20:30 cada hora + 00:00, 03:00 y 05:30.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-blue-700 mb-3">⏱️ Tiempo por Ciclo</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">3:00</div>
                  <p className="text-sm text-slate-600">minutos por ciclo</p>
                  <p className="text-xs text-slate-500 mt-2">Garantiza llegada a todas las raíces</p>
                  <div className="mt-3">
                    <Badge className="bg-blue-100 text-blue-800">
                      ✅ Programa optimizado
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                <h4 className="font-bold text-emerald-700 mb-3">🔄 Frecuencia Total</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">{irrigationData.cyclesPerDay}</div>
                  <p className="text-sm text-slate-600">ciclos/día</p>
                  <p className="text-xs text-slate-500 mt-2">
                    13 diurnos + 3 nocturnos
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <h4 className="font-bold text-amber-700 mb-3">💧 Consumo Estimado</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">{irrigationData.totalWaterNeeds}L</div>
                  <p className="text-sm text-slate-600">por día</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {plants.length > 0 ? `${formatDecimal(parseDecimal(irrigationData.totalWaterNeeds) / plants.length)}L/planta` : 'Sin plantas'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border-2 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6 text-center">📋 HORARIO COMPLETO DE RIEGO</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {irrigationData.schedule.map((item, index) => (
                  <div key={index} className="p-4 bg-white rounded-xl border-2 border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-blue-600">{item.time}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {item.duration}s
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{item.note}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {index < 12 ? "🌞 Diurno" : "🌙 Nocturno"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {irrigationData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                <h4 className="font-bold text-amber-700 mb-3">⚙️ AJUSTES POR CONDICIONES AMBIENTALES</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <h5 className="font-bold text-red-600 mb-2">EN VERANO O DÍAS CALUROSOS (&gt;28°C):</h5>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• Aumentar a 3.5 minutos por ciclo</li>
                      <li>• Añadir 2-3 ciclos adicionales</li>
                      <li>• Verificar humedad de lana de roca</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <h5 className="font-bold text-blue-600 mb-2">EN INVIERNO O DÍAS FRÍOS (&lt;15°C):</h5>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• Reducir a 2.5 minutos por ciclo</li>
                      <li>• Eliminar 1-2 ciclos nocturnos</li>
                      <li>• Verificar que no haya exceso de humedad</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <h3 className="font-bold text-purple-800 mb-4">📊 RESUMEN DEL PROGRAMA DE RIEGO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Ciclos diurnos (08:30-20:30):</span>
                    <span className="font-bold text-emerald-600">13 ciclos</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Cada hora exacta
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Ciclos nocturnos:</span>
                    <span className="font-bold text-blue-600">3 ciclos</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    00:00, 03:00 y 05:30
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Tiempo total de riego:</span>
                    <span className="font-bold text-amber-600">{irrigationData.pumpMinutesPerDay} min/día</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {Math.floor(parseDecimal(irrigationData.pumpMinutesPerDay) / 60)}h {parseDecimal(irrigationData.pumpMinutesPerDay) % 60}min
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Consumo agua estimado:</span>
                    <span className="font-bold text-cyan-600">{irrigationData.totalWaterNeeds}L/día</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {plants.length > 0 ? `${formatDecimal(parseDecimal(irrigationData.totalWaterNeeds) / plants.length)}L por planta` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <h3 className="font-bold text-emerald-800 mb-4">🎯 BENEFICIOS DEL NUEVO PROGRAMA</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nutrientes garantizados en todas las raíces</p>
                    <p className="text-sm text-slate-600">3 minutos aseguran distribución completa en la torre</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Crecimiento óptimo día y noche</p>
                    <p className="text-sm text-slate-600">Ciclos nocturnos mantienen hidratación constante</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Prevención de estrés hídrico</p>
                    <p className="text-sm text-slate-600">Frecuencia adecuada evita sequía entre riegos</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Maximización de producción</p>
                    <p className="text-sm text-slate-600">Condiciones ideales para crecimiento acelerado</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    };

    // =================== PESTAÑA DE METEOROLOGÍA ===================

    const MeteorologyTab = () => (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monitoreo Meteorológico Avanzado</h2>
          <p className="text-slate-600">Protección activa de la torre hidropónica basada en alertas AEMET</p>
        </div>
        
        <WeatherAlertsPanel
          alerts={weatherData.alerts}
          protectionActions={weatherData.protectionActions}
          location={weatherData.location}
          onRefresh={refreshWeatherAlerts}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Configuración de Ubicación</h3>
                <p className="text-slate-600">Precisión de alertas meteorológicas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-bold text-slate-700 mb-2">Ubicación Actual</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Latitud:</span>
                    <span className="font-bold text-slate-800">
                      {weatherData.location?.latitude?.toFixed(6) || "39.985670"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Longitud:</span>
                    <span className="font-bold text-slate-800">
                      {weatherData.location?.longitude?.toFixed(6) || "-0.049350"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Precisión:</span>
                    <span className="font-bold text-slate-800">
                      ±{Math.round(weatherData.location?.accuracy || 5000)} metros
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Estado:</span>
                    <Badge className={
                      weatherData.location?.isFallback ? "bg-amber-100 text-amber-800" :
                      "bg-green-100 text-green-800"
                    }>
                      {weatherData.location?.isFallback ? "Castellón por defecto" : "Ubicación precisa"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={refreshWeatherAlerts}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                disabled={weatherData.isCheckingLocation}
              >
                <RefreshCw className={`mr-2 ${weatherData.isCheckingLocation ? "animate-spin" : ""}`} />
                {weatherData.isCheckingLocation ? "Obteniendo ubicación..." : "Actualizar Ubicación y Alertas"}
              </Button>
              
              <p className="text-xs text-slate-500 text-center">
                Permite el acceso a tu ubicación para alertas más precisas.
              </p>
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Protocolos de Protección</h3>
                <p className="text-slate-600">Acciones automáticas por nivel de alerta</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(WEATHER_PHENOMENA).map(([key, phenomenon]) => (
                <div key={key} className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    {phenomenon.icon}
                    <h4 className="font-bold text-slate-800">{phenomenon.name}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-yellow-50 rounded-lg">
                        <p className="text-xs font-bold text-yellow-800">Amarillo</p>
                        <p className="text-sm font-bold text-yellow-600">
                          {typeof phenomenon.thresholds.yellow === "number" 
                            ? `${phenomenon.thresholds.yellow}${key === "wind" ? "km/h" : key === "rain" ? "mm" : "°C"}`
                            : "Activado"}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs font-bold text-orange-800">Naranja</p>
                        <p className="text-sm font-bold text-orange-600">
                          {typeof phenomenon.thresholds.orange === "number"
                            ? `${phenomenon.thresholds.orange}${key === "wind" ? "km/h" : key === "rain" ? "mm" : "°C"}`
                            : "Activado"}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <p className="text-xs font-bold text-red-800">Rojo</p>
                        <p className="text-sm font-bold text-red-600">
                          {typeof phenomenon.thresholds.red === "number"
                            ? `${phenomenon.thresholds.red}${key === "wind" ? "km/h" : key === "rain" ? "mm" : "°C"}`
                            : "Activado"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">
                        <strong>Acción en rojo:</strong> {phenomenon.recommendations.red}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <BarChart className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Historial de Alertas Meteorológicas</h3>
              <p className="text-slate-600">Registro de avisos y acciones tomadas</p>
            </div>
          </div>
          
          {weatherData.alerts?.length === 0 ? (
            <div className="text-center py-8">
              <CloudSun className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">No hay alertas meteorológicas recientes</p>
              <p className="text-sm text-slate-400 mt-1">El sistema verificará automáticamente cada 30 minutos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weatherData.alerts.map((alert, index) => (
                <div key={alert.id} className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.level === "red" ? "bg-red-100" :
                        alert.level === "orange" ? "bg-orange-100" :
                        "bg-yellow-100"
                      }`}>
                        {WEATHER_PHENOMENA[alert.phenomenon]?.icon || <AlertTriangle size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800">{alert.title}</h4>
                          <Badge className={
                            alert.level === "red" ? "bg-red-100 text-red-800" :
                            alert.level === "orange" ? "bg-orange-100 text-orange-800" :
                            "bg-yellow-100 text-yellow-800"
                          }>
                            {alert.level.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(alert.startTime).toLocaleString()} - 
                          {new Date(alert.endTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {alert.isMock && (
                      <Badge className="bg-slate-100 text-slate-800">Simulación</Badge>
                    )}
                  </div>
                  
                  <div className="pl-12">
                    <p className="text-sm font-medium text-slate-700 mb-2">Acciones recomendadas:</p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {alert.recommendations}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              <strong>Última verificación:</strong> {
                weatherData.lastAlertCheck 
                  ? new Date(weatherData.lastAlertCheck).toLocaleString() 
                  : "No verificada"
              }
            </p>
            <p className="text-xs text-slate-500 mt-1">
              El sistema verifica automáticamente con AEMET cada 30 minutos
            </p>
          </div>
        </Card>
      </div>
    );

  // =================== PESTAÑA DE TORRE ===================

  const TowerTab = () => {
    const plantStats = calculatePlantStats(plants);
    const levels = {
      1: plants.filter(p => p.l === 1),
      2: plants.filter(p => p.l === 2),
      3: plants.filter(p => p.l === 3)
    };

    const handleAddPlant = (level, position, variety) => {
      const newPlant = {
        id: generatePlantId(),
        l: level,
        v: variety,
        p: position,
        date: new Date().toISOString()
      };

      setPlants([...plants, newPlant]);
    };

    const handleRemovePlant = (id) => {
      setPlants(plants.filter(p => p.id !== id));
    };

    // Mapeo de colores para los niveles
    const levelColors = {
      1: { bg: "from-cyan-500 to-cyan-600", text: "text-cyan-600" },
      2: { bg: "from-green-500 to-green-600", text: "text-green-600" },
      3: { bg: "from-emerald-500 to-emerald-600", text: "text-emerald-600" }
    };

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Torre Hidropónica - Sistema 5-5-5</h2>
          <p className="text-slate-600">Gestión visual de las plantas en cada nivel (aproximadamente 12 días por nivel)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(level => {
            const levelName = level === 1 ? "Plántulas" : level === 2 ? "Crecimiento" : "Maduras";
            const levelColor = levelColors[level];
            const levelDays = level === 1 ? "Aprox. 12 días" : level === 2 ? "Aprox. 12 días" : "Aprox. 12 días";
            
            return (
              <Card key={level} className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${levelColor.bg} rounded-xl flex items-center justify-center`}>
                    {level === 1 ? <Sprout className="text-white" size={24} /> :
                     level === 2 ? <Leaf className="text-white" size={24} /> :
                     <TreePine className="text-white" size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Nivel {level} - {levelName}</h3>
                    <p className="text-slate-600">{levelDays} • 5 posiciones máximo</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Plantas:</span>
                    <span className={`font-bold ${levelColor.text}`}>{levels[level].length}/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Posiciones ocupadas:</span>
                    <span className="font-bold text-slate-800">
                      {levels[level].map(p => p.p).join(', ') || 'Ninguna'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(position => {
                    const plant = levels[level].find(p => p.p === position);
                    
                    return (
                      <div key={position} className="aspect-square relative">
                        {plant ? (
                          <div className={`w-full h-full rounded-lg flex flex-col items-center justify-center ${
                            VARIETIES[plant.v]?.color || 'bg-slate-200'
                          } text-white p-2`}>
                            <span className="text-lg font-bold">{position}</span>
                            <span className="text-xs text-center mt-1">{plant.v}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePlant(plant.id)}
                              className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white"
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const variety = Object.keys(VARIETIES)[0];
                              handleAddPlant(level, position, variety);
                            }}
                            className="w-full h-full border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <span className="text-lg font-bold">{position}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {levels[level].length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <h4 className="font-bold text-slate-700 mb-2">Variedades en este nivel:</h4>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(levels[level].map(p => p.v))].map(variety => (
                        <Badge key={variety} className={`${VARIETIES[variety]?.textColor} bg-white border`}>
                          {variety}: {levels[level].filter(p => p.v === variety).length}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Gestión de la Torre</h3>
              <p className="text-slate-600">Acciones rápidas para la gestión del cultivo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={handleRotation}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-full"
            >
              <RotateCcw className="mr-2" />
              Rotar Niveles
            </Button>

            <Button
              onClick={() => setShowAddPlantForm(true)}
              variant="outline"
              className="h-full"
            >
              <Plus className="mr-2" />
              Añadir Planta
            </Button>

            <Button
              onClick={() => {
                if (plants.length === 0) {
                  alert("No hay plantas para reiniciar");
                  return;
                }
                if (confirm("¿Reiniciar todas las plantas? Esta acción no se puede deshacer.")) {
                  setPlants([]);
                }
              }}
              variant="outline"
              className="h-full"
            >
              <RotateCcw className="mr-2" />
              Reiniciar Torre
            </Button>

            <Button
              onClick={() => setTab("dashboard")}
              variant="outline"
              className="h-full"
            >
              <Home className="mr-2" />
              Volver al Panel
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // =================== PESTAÑA DE CALCULADORA ===================

  const CalculatorTab = () => {
    const [calculatorVolume, setCalculatorVolume] = useState("18");
    const [calculatorEC, setCalculatorEC] = useState("1400");
    const [calculatorPH, setCalculatorPH] = useState("5,8");

    const calculatedDosage = useMemo(() => {
      return calculateAquaVegaDosage(
        plants,
        parseDecimal(calculatorVolume),
        parseDecimal(calculatorEC)
      );
    }, [calculatorVolume, calculatorEC, plants]);

    const calculatedPHAdjustment = useMemo(() => {
      return calculatePHAdjustment(
        parseDecimal(calculatorPH),
        5.8,
        parseDecimal(calculatorVolume)
      );
    }, [calculatorPH, calculatorVolume]);

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calculadora de Nutrientes</h2>
          <p className="text-slate-600">Calcula las dosis exactas de AQUA VEGA A y B para tu volumen específico</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Calculator className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Calculadora AQUA VEGA A/B</h3>
              <p className="text-slate-600">Protocolo 18L corregido: 45ml A+B para 1.4 mS/cm</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Volumen de agua (L)
                </label>
                <input
                  type="text"
                  value={calculatorVolume}
                  onChange={(e) => setCalculatorVolume(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="18"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Volumen total del depósito
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  EC objetivo (µS/cm)
                </label>
                <input
                  type="text"
                  value={calculatorEC}
                  onChange={(e) => setCalculatorEC(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="1400"
                />
                <p className="text-xs text-slate-500 mt-2">
                  EC fija recomendada: 1350-1500
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  pH actual
                </label>
                <input
                  type="text"
                  value={calculatorPH}
                  onChange={(e) => setCalculatorPH(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="5,8"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Rango ideal: 5.5 - 6.5
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 h-full">
                <h4 className="font-bold text-blue-700 mb-4 text-lg">📊 Resultados del Cálculo</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-xl">
                    <h5 className="font-bold text-emerald-700 mb-3">AQUA VEGA A</h5>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-emerald-600 mb-2">{calculatedDosage.a} ml</div>
                      <p className="text-sm text-slate-600">
                        {formatDecimal(calculatedDosage.per10L.a)} ml por 10L
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatDecimal(calculatedDosage.a / parseDecimal(calculatorVolume) || 0)} ml/L
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl">
                    <h5 className="font-bold text-emerald-700 mb-3">AQUA VEGA B</h5>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-emerald-600 mb-2">{calculatedDosage.b} ml</div>
                      <p className="text-sm text-slate-600">
                        {formatDecimal(calculatedDosage.per10L.b)} ml por 10L
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatDecimal(calculatedDosage.b / parseDecimal(calculatorVolume) || 0)} ml/L
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-xl">
                  <h5 className="font-bold text-purple-700 mb-3">Ajuste de pH</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Ácido cítrico (pH-):</span>
                      <span className="font-bold text-purple-600">{calculatedPHAdjustment.phMinus} ml</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Base (pH+):</span>
                      <span className="font-bold text-purple-600">{calculatedPHAdjustment.phPlus} ml</span>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700">{calculatedPHAdjustment.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
            <h4 className="font-bold text-emerald-700 mb-3">📋 Protocolo de Preparación</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-800">Llenar con agua destilada</p>
                  <p className="text-sm text-slate-600">Usar {calculatorVolume}L de agua destilada pura</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-800">Añadir AQUA VEGA A y B</p>
                  <p className="text-sm text-slate-600">
                    Agregar {calculatedDosage.a}ml de A y {calculatedDosage.b}ml de B, mezclar entre cada adición
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-800">Homogenizar</p>
                  <p className="text-sm text-slate-600">Encender aireador durante 15 minutos para mezcla completa</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-bold text-slate-800">Ajustar pH</p>
                  <p className="text-sm text-slate-600">
                    {calculatedPHAdjustment.phMinus !== "0,0" ? 
                      `Añadir ${calculatedPHAdjustment.phMinus}ml de ácido cítrico en pasos de 0.5ml` :
                      'pH en rango ideal, no se requiere ajuste'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // =================== PESTAÑA DE MEDICIONES ===================

  const MeasurementsTab = () => {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Registro de Mediciones</h2>
          <p className="text-slate-600">Introduce y gestiona las mediciones diarias del sistema</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Medición Diaria Completa</h3>
              <p className="text-slate-600">Registra todos los parámetros del sistema hidropónico</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* pH */}
            <div className="space-y-4">
              <h4 className="font-bold text-purple-700">pH del Agua</h4>
              <div className="p-4 bg-white rounded-xl border-2 border-purple-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-700">Valor actual:</span>
                  <span className="text-2xl font-bold text-purple-600">{tempMeasurements.manualPH}</span>
                </div>
                <input
                  type="text"
                  value={tempMeasurements.manualPH}
                  onChange={(e) => handleMeasurementInputChange('manualPH', e.target.value)}
                  onBlur={() => saveMeasurementOnBlur('manualPH')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-center text-lg font-bold"
                  placeholder="5,8"
                />
                <div className="mt-4">
                  <label className="block text-sm text-slate-600 mb-2">Ajustar pH</label>
                  <input
                    type="range"
                    min="45"
                    max="85"
                    step="1"
                    value={parseDecimal(tempMeasurements.manualPH) * 10 || 58}
                    onChange={(e) => updateMeasurementFromSlider('manualPH', parseDecimal(e.target.value) / 10)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-slate-600 mt-2">
                    <span>4.5</span>
                    <span className="font-bold text-purple-600">5.8 (ideal)</span>
                    <span>8.5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EC */}
            <div className="space-y-4">
              <h4 className="font-bold text-blue-700">Conductividad (EC)</h4>
              <div className="p-4 bg-white rounded-xl border-2 border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-700">Valor actual:</span>
                  <span className="text-2xl font-bold text-blue-600">{tempMeasurements.manualEC} µS/cm</span>
                </div>
                <input
                  type="text"
                  value={tempMeasurements.manualEC}
                  onChange={(e) => handleMeasurementInputChange('manualEC', e.target.value)}
                  onBlur={() => saveMeasurementOnBlur('manualEC')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center text-lg font-bold"
                  placeholder="1400"
                />
                <div className="mt-4">
                  <label className="block text-sm text-slate-600 mb-2">Ajustar EC</label>
                  <input
                    type="range"
                    min="800"
                    max="2500"
                    step="10"
                    value={parseDecimal(tempMeasurements.manualEC) || 1400}
                    onChange={(e) => updateMeasurementFromSlider('manualEC', parseDecimal(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-slate-600 mt-2">
                    <span>800</span>
                    <span className="font-bold text-blue-600">1400 (ideal)</span>
                    <span>2500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Temperatura Agua */}
            <div className="space-y-4">
              <h4 className="font-bold text-cyan-700">Temperatura Agua</h4>
              <div className="p-4 bg-white rounded-xl border-2 border-cyan-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-700">Valor actual:</span>
                  <span className="text-2xl font-bold text-cyan-600">{tempMeasurements.manualWaterTemp}°C</span>
                </div>
                <input
                  type="text"
                  value={tempMeasurements.manualWaterTemp}
                  onChange={(e) => handleMeasurementInputChange('manualWaterTemp', e.target.value)}
                  onBlur={() => saveMeasurementOnBlur('manualWaterTemp')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-center text-lg font-bold"
                  placeholder="20"
                />
                <div className="mt-4">
                  <label className="block text-sm text-slate-600 mb-2">Ajustar temperatura</label>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={parseDecimal(tempMeasurements.manualWaterTemp) || 20}
                    onChange={(e) => updateMeasurementFromSlider('manualWaterTemp', parseDecimal(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-slate-600 mt-2">
                    <span>5°C</span>
                    <span className="font-bold text-cyan-600">20°C (ideal)</span>
                    <span>35°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Volumen */}
            <div className="space-y-4">
              <h4 className="font-bold text-emerald-700">Volumen de Agua</h4>
              <div className="p-4 bg-white rounded-xl border-2 border-emerald-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-700">Valor actual:</span>
                  <span className="text-2xl font-bold text-emerald-600">{tempMeasurements.manualVolume}L</span>
                </div>
                <input
                  type="text"
                  value={tempMeasurements.manualVolume}
                  onChange={(e) => handleMeasurementInputChange('manualVolume', e.target.value)}
                  onBlur={() => saveMeasurementOnBlur('manualVolume')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-center text-lg font-bold"
                  placeholder="18"
                />
                <div className="mt-4">
                  <Progress
                    value={(parseDecimal(tempMeasurements.manualVolume) / parseDecimal(config.totalVol)) * 100}
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-slate-600 mt-2">
                    <span>0L</span>
                    <span>{Math.round((parseDecimal(tempMeasurements.manualVolume) / parseDecimal(config.totalVol)) * 100)}%</span>
                    <span>{config.totalVol}L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Temperatura Ambiente */}
            <div className="space-y-4">
              <h4 className="font-bold text-amber-700">Temperatura Ambiente</h4>
              <div className="p-4 bg-white rounded-xl border-2 border-amber-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-700">Valor actual:</span>
                  <span className="text-2xl font-bold text-amber-600">{tempMeasurements.manualTemp}°C</span>
                </div>
                <input
                  type="text"
                  value={tempMeasurements.manualTemp}
                  onChange={(e) => handleMeasurementInputChange('manualTemp', e.target.value)}
                  onBlur={() => saveMeasurementOnBlur('manualTemp')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-center text-lg font-bold"
                  placeholder="20"
                />
                <div className="mt-4">
                  <label className="block text-sm text-slate-600 mb-2">Rango ideal: 18-25°C</label>
                  <div className={`p-3 rounded-lg ${
                    parseDecimal(tempMeasurements.manualTemp) >= 18 && parseDecimal(tempMeasurements.manualTemp) <= 25
                      ? 'bg-green-50 text-green-700'
                      : parseDecimal(tempMeasurements.manualTemp) > 25
                        ? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                  }`}>
                    {parseDecimal(tempMeasurements.manualTemp) >= 18 && parseDecimal(tempMeasurements.manualTemp) <= 25
                      ? '✅ Temperatura óptima'
                      : parseDecimal(tempMeasurements.manualTemp) > 25
                        ? '⚠️ Temperatura alta - Riesgo de estrés'
                        : '⚠️ Temperatura baja - Crecimiento lento'}
                  </div>
                </div>
              </div>
            </div>

            {/* Humedad */}
            <div className="space-y-4">
              <h4 className="font-bold text-blue-700">Humedad Relativa</h4>
              <div className="p-4 bg-white rounded-xl border-2 border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-700">Valor actual:</span>
                  <span className="text-2xl font-bold text-blue-600">{tempMeasurements.manualHumidity}%</span>
                </div>
                <input
                  type="text"
                  value={tempMeasurements.manualHumidity}
                  onChange={(e) => handleMeasurementInputChange('manualHumidity', e.target.value)}
                  onBlur={() => saveMeasurementOnBlur('manualHumidity')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center text-lg font-bold"
                  placeholder="65"
                />
                <div className="mt-4">
                  <label className="block text-sm text-slate-600 mb-2">Rango ideal: 40-70%</label>
                  <div className={`p-3 rounded-lg ${
                    parseDecimal(tempMeasurements.manualHumidity) >= 40 && parseDecimal(tempMeasurements.manualHumidity) <= 70
                      ? 'bg-green-50 text-green-700'
                      : parseDecimal(tempMeasurements.manualHumidity) > 70
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}>
                    {parseDecimal(tempMeasurements.manualHumidity) >= 40 && parseDecimal(tempMeasurements.manualHumidity) <= 70
                      ? '✅ Humedad óptima'
                      : parseDecimal(tempMeasurements.manualHumidity) > 70
                        ? '⚠️ Humedad alta - Riesgo de hongos'
                        : '⚠️ Humedad baja - Riesgo de deshidratación'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={saveAllManualMeasurements}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 text-lg"
            >
              <Check className="mr-2" />
              Guardar Medición Completa
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // =================== PESTAÑA DE CALENDARIO ===================

  const CalendarTab = () => {
    const now = new Date();
    const currentMonth = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const monthName = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

    const getEventIcon = (event) => {
      switch (event) {
        case 'measure': return '📊';
        case 'recharge': return '⚡';
        case 'change': return '🔄';
        case 'rotation': return '🔄';
        case 'clean': return '🧼';
        default: return '📅';
      }
    };

    const getEventColor = (event) => {
      switch (event) {
        case 'measure': return 'bg-blue-100 text-blue-800';
        case 'recharge': return 'bg-emerald-100 text-emerald-800';
        case 'change': return 'bg-purple-100 text-purple-800';
        case 'rotation': return 'bg-amber-100 text-amber-800';
        case 'clean': return 'bg-cyan-100 text-cyan-800';
        default: return 'bg-slate-100 text-slate-800';
      }
    };

    const getEventName = (event) => {
      switch (event) {
        case 'measure': return 'Medición';
        case 'recharge': return 'Recarga';
        case 'change': return 'Cambio';
        case 'rotation': return 'Rotación';
        case 'clean': return 'Limpieza';
        default: return 'Evento';
      }
    };

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario de Mantenimiento</h2>
          <p className="text-slate-600">Planificación de tareas para el mes de {monthName}</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Calendario de Tareas</h3>
              <p className="text-slate-600">Actividades programadas para el mantenimiento del sistema</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="text-center font-bold text-slate-700 p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 p-2 rounded-xl border-2 ${
                    day.isCurrentMonth
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-100 bg-slate-50 opacity-50'
                  } ${day.date && day.date.getDate() === now.getDate() && day.isCurrentMonth
                      ? 'border-blue-300 bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${
                      day.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {day.dayOfMonth}
                    </span>
                    {day.date && day.date.getDate() === now.getDate() && day.isCurrentMonth && (
                      <Badge className="bg-blue-100 text-blue-800">Hoy</Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {day.events.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`text-xs p-1 rounded-lg ${getEventColor(event)}`}
                      >
                        {getEventIcon(event)} {getEventName(event)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border-2 border-indigo-200">
            <h4 className="font-bold text-indigo-700 mb-4">📋 Leyenda de Eventos</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                <span className="text-lg">📊</span>
                <div>
                  <p className="font-bold text-slate-800">Medición</p>
                  <p className="text-xs text-slate-600">Diaria</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="font-bold text-slate-800">Recarga</p>
                  <p className="text-xs text-slate-600">Cada 7-10 días</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                <span className="text-lg">🔄</span>
                <div>
                  <p className="font-bold text-slate-800">Cambio</p>
                  <p className="text-xs text-slate-600">Cada 14 días</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                <span className="text-lg">🔄</span>
                <div>
                  <p className="font-bold text-slate-800">Rotación</p>
                  <p className="text-xs text-slate-600">Recomendación 12 días</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                <span className="text-lg">🧼</span>
                <div>
                  <p className="font-bold text-slate-800">Limpieza</p>
                  <p className="text-xs text-slate-600">Cada 14 días</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleRegisterClean}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              <ShieldAlert className="mr-2" />
              Marcar Cambio Completo
            </Button>

            <Button
              onClick={handleRegisterRecharge}
              variant="outline"
            >
              <RefreshCw className="mr-2" />
              Marcar Recarga
            </Button>

            <Button
              onClick={handleRotation}
              variant="outline"
            >
              <RotateCcw className="mr-2" />
              Programar Rotación
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // =================== PESTAÑA DE HISTORIAL ===================

  const HistoryTab = () => {
    const [filterType, setFilterType] = useState("all");

    const filteredHistory = useMemo(() => {
      if (filterType === "all") return history;
      return history.filter(record => record.type === filterType);
    }, [history, filterType]);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case "measurement": return <Activity className="text-blue-600" size={20} />;
        case "recharge": return <RefreshCw className="text-emerald-600" size={20} />;
        case "clean": return <ShieldAlert className="text-purple-600" size={20} />;
        case "rotation": return <RotateCcw className="text-amber-600" size={20} />;
        default: return <Calendar className="text-slate-600" size={20} />;
      }
    };

    const getTypeColor = (type) => {
      switch (type) {
        case "measurement": return "bg-blue-100 text-blue-800";
        case "recharge": return "bg-emerald-100 text-emerald-800";
        case "clean": return "bg-purple-100 text-purple-800";
        case "rotation": return "bg-amber-100 text-amber-800";
        default: return "bg-slate-100 text-slate-800";
      }
    };

    const getTypeName = (type) => {
      switch (type) {
        case "measurement": return "Medición";
        case "recharge": return "Recarga";
        case "clean": return "Limpieza";
        case "rotation": return "Rotación";
        default: return "Evento";
      }
    };

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Historial del Sistema</h2>
          <p className="text-slate-600">Registro completo de todas las actividades realizadas</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Historial de Actividades</h3>
              <p className="text-slate-600">Últimas 50 actividades registradas en el sistema</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                Todas
              </Button>
              <Button
                variant={filterType === "measurement" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("measurement")}
              >
                Mediciones
              </Button>
              <Button
                variant={filterType === "recharge" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("recharge")}
              >
                Recargas
              </Button>
              <Button
                variant={filterType === "clean" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("clean")}
              >
                Limpiezas
              </Button>
              <Button
                variant={filterType === "rotation" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("rotation")}
              >
                Rotaciones
              </Button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <BarChart className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">No hay registros en el historial</p>
              <p className="text-sm text-slate-400 mt-1">
                {filterType !== "all" ? `No hay registros de tipo "${getTypeName(filterType)}"` : "Realiza actividades para ver el historial"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredHistory.map((record) => (
                <div key={record.id} className="p-4 bg-white rounded-xl border-2 border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {getTypeIcon(record.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800">{record.description || getTypeName(record.type)}</h4>
                          <Badge className={getTypeColor(record.type)}>
                            {getTypeName(record.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{formatDate(record.date)}</p>
                        {record.notes && (
                          <p className="text-sm text-slate-700 mt-2">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHistoryRecord(record.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {record.type === "measurement" && (
                    <div className="pl-12 mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-slate-600">pH</p>
                          <p className="font-bold text-blue-600">{record.ph}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-slate-600">EC</p>
                          <p className="font-bold text-blue-600">{record.ec} µS/cm</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-slate-600">Temp agua</p>
                          <p className="font-bold text-blue-600">{record.waterTemp}°C</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-slate-600">Volumen</p>
                          <p className="font-bold text-blue-600">{record.volume}L</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-slate-600">Temp ambiente</p>
                          <p className="font-bold text-blue-600">{record.temp}°C</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-slate-600">Humedad</p>
                          <p className="font-bold text-blue-600">{record.humidity}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {record.type === "recharge" && record.dosage && (
                    <div className="pl-12 mt-4">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <p className="text-sm font-bold text-emerald-700">Dosificación aplicada:</p>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600">AQUA VEGA A:</span>
                            <span className="font-bold">{record.dosage.a}ml</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600">AQUA VEGA B:</span>
                            <span className="font-bold">{record.dosage.b}ml</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total registros:</span>
                <span className="font-bold text-slate-800">{filteredHistory.length} de {history.length}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                El historial se guarda automáticamente y mantiene los últimos 50 registros
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // =================== RENDER POR PASOS ===================

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-10">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl border-4 border-emerald-400">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      <img
                        src="/mi-imagen.jpg"
                        alt="HydroCaru Logo"
                        className="object-cover rounded-full w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                HydroCaru Pro 18L
              </h1>
              <p className="text-xl text-slate-600 max-w-lg mx-auto">
                Sistema experto de cultivo hidropónico con protocolo 18L y AQUA VEGA A/B
              </p>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => setStep(1)}
                className="px-10 py-6 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <ArrowRight className="mr-2" size={24} />
                Iniciar Protocolo 18L
              </Button>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Paso 1: Configuración del Depósito</h2>
              <p className="text-slate-600">Define las características principales del sistema</p>
            </div>

            <Card className="p-6 rounded-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Capacidad total del depósito (L)
                  </label>
                  <input
                    type="text"
                    value={config.totalVol}
                    onChange={(e) => setConfig({ ...config, totalVol: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="18"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Recomendado: 18 litros para el protocolo estándar
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de agua
                  </label>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800">
                      Agua Destilada
                    </Badge>
                    <p className="text-sm text-slate-600">
                      Protocolo específico para AQUA VEGA A y B
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ¿Tiene calentador de agua?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setConfig({ ...config, hasHeater: true })}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        config.hasHeater
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, hasHeater: false })}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        !config.hasHeater
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Recomendado: Sí, para mantener temperatura estable de 20°C
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft className="mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                >
                  Siguiente
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Paso 2: Configuración Inicial</h2>
              <p className="text-slate-600">Establece los valores objetivo del sistema</p>
            </div>

            <Card className="p-6 rounded-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    EC objetivo (µS/cm)
                  </label>
                  <input
                    type="text"
                    value={config.targetEC}
                    onChange={(e) => setConfig({ ...config, targetEC: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="1400"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Rango fijo: 1350-1500 µS/cm para todas las variedades
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    pH objetivo
                  </label>
                  <input
                    type="text"
                    value={config.targetPH}
                    onChange={(e) => setConfig({ ...config, targetPH: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="5,8"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Rango ideal: 5.5 - 6.5
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Temperatura objetivo del agua (°C)
                  </label>
                  <input
                    type="text"
                    value={config.temp}
                    onChange={(e) => setConfig({ ...config, temp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="20"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Rango ideal: 18 - 22°C
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                >
                  Siguiente
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 3:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Paso 3: Valores Iniciales</h2>
              <p className="text-slate-600">Introduce los valores actuales del sistema</p>
            </div>

            <Card className="p-6 rounded-2xl">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      pH actual
                    </label>
                    <input
                      type="text"
                      value={config.ph}
                      onChange={(e) => setConfig({ ...config, ph: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="5,8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      EC actual (µS/cm)
                    </label>
                    <input
                      type="text"
                      value={config.ec}
                      onChange={(e) => setConfig({ ...config, ec: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="1400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Volumen actual (L)
                  </label>
                  <input
                    type="text"
                    value={config.currentVol}
                    onChange={(e) => setConfig({ ...config, currentVol: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="18"
                  />
                  <div className="mt-2">
                    <Progress
                      value={(parseDecimal(config.currentVol) / parseDecimal(config.totalVol)) * 100}
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-1">
                      <span>0L</span>
                      <span>{Math.round((parseDecimal(config.currentVol) / parseDecimal(config.totalVol)) * 100)}%</span>
                      <span>{config.totalVol}L</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                >
                  Siguiente
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Paso 4: Configuración Completa</h2>
              <p className="text-slate-600">Revisa y confirma la configuración del sistema</p>
            </div>

            <Card className="p-6 rounded-2xl">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-bold text-slate-700 mb-2">Depósito</h4>
                    <p className="text-2xl font-bold text-blue-600">{config.totalVol}L</p>
                    <p className="text-sm text-slate-600">Capacidad total</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-bold text-slate-700 mb-2">Tipo de agua</h4>
                    <p className="text-lg font-bold text-cyan-600">Agua Destilada</p>
                    <p className="text-sm text-slate-600">Protocolo 18L</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-bold text-slate-700 mb-2">EC objetivo</h4>
                    <p className="text-2xl font-bold text-emerald-600">{config.targetEC} µS/cm</p>
                    <p className="text-sm text-slate-600">Rango fijo 1350-1500</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-bold text-slate-700 mb-2">pH objetivo</h4>
                    <p className="text-2xl font-bold text-purple-600">{config.targetPH}</p>
                    <p className="text-sm text-slate-600">Rango 5.5-6.5</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                  <h4 className="font-bold text-emerald-700 mb-2">✅ Configuración Recomendada</h4>
                  <p className="text-sm text-slate-700">
                    Protocolo 18L activado: 45ml AQUA VEGA A y B por 18 litros de agua destilada.
                    EC fija para todas las variedades. Sin necesidad de CalMag adicional.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                >
                  <ArrowLeft className="mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={() => {
                    setStep(5);
                    setTab("dashboard");
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                >
                  Completar Configuración
                  <Check className="ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // =================== CONFIGURACIÓN DE PESTAÑAS ACTUALIZADA ===================

  const tabConfig = [
    {
      key: "dashboard",
      icon: <Home size={20} />,
      activeColor: "from-blue-500 to-cyan-600",
      inactiveColor: "from-blue-100 to-cyan-100",
      colorName: "blue"
    },
    {
      key: "meteorology",
      icon: <CloudRain size={20} />,
      activeColor: "from-amber-500 to-orange-600",
      inactiveColor: "from-amber-100 to-orange-100",
      colorName: "amber"
    },
    {
      key: "tower",
      icon: <TreePine size={20} />,
      activeColor: "from-emerald-500 to-green-600",
      inactiveColor: "from-emerald-100 to-green-100",
      colorName: "emerald"
    },
    {
      key: "calculator",
      icon: <Calculator size={20} />,
      activeColor: "from-purple-500 to-pink-600",
      inactiveColor: "from-purple-100 to-pink-100",
      colorName: "purple"
    },
    {
      key: "measurements",
      icon: <Activity size={20} />,
      activeColor: "from-rose-500 to-pink-600",
      inactiveColor: "from-rose-100 to-pink-100",
      colorName: "rose"
    },
    {
      key: "irrigation",
      icon: <WaterDroplets size={20} />,
      activeColor: "from-cyan-500 to-blue-600",
      inactiveColor: "from-cyan-100 to-blue-100",
      colorName: "cyan"
    },
    {
      key: "calendar",
      icon: <Calendar size={20} />,
      activeColor: "from-indigo-500 to-violet-600",
      inactiveColor: "from-indigo-100 to-violet-100",
      colorName: "indigo"
    },
    {
      key: "history",
      icon: <BarChart size={20} />,
      activeColor: "from-violet-500 to-purple-600",
      inactiveColor: "from-violet-100 to-purple-100",
      colorName: "violet"
    }
  ];

  // =================== RENDER PRINCIPAL MODIFICADO ===================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-emerald-300">
                <div className="relative w-9 h-9">
                  <img
                    src="/mi-imagen.jpg"
                    alt="HydroCaru Logo"
                    className="object-cover rounded-full w-full h-full"
                  />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-slate-800">HydroCaru</h1>
                <p className="text-xs text-slate-600">EC fija 1350-1500 µS/cm | Sin CalMag | 45ml AQUA VEGA A+B | Rotación según crecimiento</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {step >= 5 ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("¿Reiniciar configuración? Se perderán todos los datos.")) {
                        localStorage.removeItem("hydro_caru_app");
                        setStep(0);
                        setPlants([]);
                        setConfig({
                          totalVol: "18",
                          currentVol: "18",
                          ph: "5,8",
                          ec: "1400",
                          temp: "20",
                          targetEC: "1400",
                          targetPH: "5,8",
                          waterType: "osmosis",
                          hasHeater: true,
                          useOsmosisMix: false,
                          osmosisMixPercentage: 0,
                          waterNotes: "",
                          calculationMethod: "escalonado"
                        });
                        setMeasurements({
                          manualPH: "5,8",
                          manualEC: "1400",
                          manualTemp: "20",
                          manualWaterTemp: "20",
                          manualVolume: "18",
                          manualHumidity: "65",
                          phCorrectionMinus: "0,0",
                          phCorrectionPlus: "0,0",
                          ecCorrectionA: "0,0",
                          ecCorrectionB: "0,0",
                          ecCorrectionWater: "0,0",
                          lastMeasurement: new Date().toISOString()
                        });
                        setTempMeasurements({
                          manualPH: "5,8",
                          manualEC: "1400",
                          manualTemp: "20",
                          manualWaterTemp: "20",
                          manualVolume: "18",
                          manualHumidity: "65",
                          phCorrectionMinus: "0,0",
                          phCorrectionPlus: "0,0",
                          ecCorrectionA: "0,0",
                          ecCorrectionB: "0,0",
                          ecCorrectionWater: "0,0"
                        });
                        setSelectedECMethod(null);
                        setTab("dashboard");
                        initializeWeatherMonitoring();
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
                        : "✅ Sistema OK"}
                  </Badge>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-600">Paso {step + 1} de 5</div>
                  <Progress value={(step + 1) * 20} className="w-24 h-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navegación por pestañas */}
      {step >= 5 && (
        <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="container mx-auto p-4 max-w-6xl">
            <div className="grid grid-cols-8 w-full gap-2">
              {tabConfig.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`flex items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-300 ${tab === item.key
                      ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg scale-105`
                      : `bg-gradient-to-r ${item.inactiveColor} text-${item.colorName}-600 hover:scale-105 hover:shadow-md`
                    }`}
                  title={item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 max-w-6xl">
        {step < 5 ? (
          // Flujo de configuración (pasos 0-4)
          <div className="max-w-2xl mx-auto">
            {renderStep()}
          </div>
        ) : (
          // Panel principal con pestañas
          <>
            {tab === "dashboard" && <DashboardTab config={config} measurements={measurements} />}
            {tab === "meteorology" && <MeteorologyTab />}
            {tab === "tower" && <TowerTab />}
            {tab === "calculator" && <CalculatorTab />}
            {tab === "measurements" && <MeasurementsTab />}
            {tab === "irrigation" && <IrrigationTab />}
            {tab === "calendar" && <CalendarTab />}
            {tab === "history" && <HistoryTab />}
          </>
        )}
      </main>

      {/* Modales */}
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

      {/* Modal de Rotación */}
      <RotationModal
        isOpen={showRotationModal}
        onClose={() => setShowRotationModal(false)}
        onConfirm={handleRotationConfirm}
        plants={plants}
      />
    </div>
  );
}
