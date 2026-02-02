"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import Image from 'next/image'
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
  Sprout as Plant
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
      style={{ width: `${value}%` }}
    />
  </div>
)

const Label = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
)

const Switch = ({ checked, onCheckedChange }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
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

    // Rotación según crecimiento - MODIFICADO A 12 DÍAS
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
    { time: "19:30", duration: 180, note: "Riego horario" },
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
            const levelColor = level === 1 ? "cyan" : level === 2 ? "green" : "emerald";
            
            return (
              <div key={level} className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${levelColor}-500`}></div>
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
            <Check className="text-emerald-500 mt=0.5" size={16} />
            <span><strong>EC constante:</strong> Simplifica el manejo, mismo rango para todas las plantas</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt=0.5" size={16} />
            <span><strong>Sin CalMag:</strong> AQUA VEGA A/B para aguas blandas ya contiene Ca y Mg en proporción óptima</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt=0.5" size={16} />
            <span><strong>Protocolo exacto:</strong> 45ml de A y B por 18L = 2.5ml por litro (CORREGIDO)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt=0.5" size={16} />
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
            className={bgColors[color]}
            strokeLinecap="round"
          />

          {/* Indicador de progreso */}
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            strokeWidth="6"
            className={fillColors[color]}
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
          <div className="text-xs sm:text-sm text-slate-500 mt=0.5">{unit}</div>
        </div>
      </div>

      {/* Etiqueta */}
      <div className="mt-2 sm:mt-3 text-center space-y=0.5 sm:space-y=1">
        <div className="text-xs sm:text-sm font-bold text-slate-800">{label}</div>
        <div className="text-xs text-slate-500 space-y=0.5">
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
              <h4 className="font-bold text-blue-700 mb-3">📋 Proceso de Rotación - CADA 12 DÍAS</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 3 → Cosecha</p>
                    <p className="text-sm text-slate-600">Plantas maduras se cosechan después de 36 días</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 2 → Nivel 3</p>
                    <p className="text-sm text-slate-600">Plantas en crecimiento pasan a maduración (días 13-24)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 1 → Nivel 2</p>
                    <p className="text-sm text-slate-600">Plántulas pasan a crecimiento (días 1-12)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Añadir nuevas plántulas</p>
                    <p className="text-sm text-slate-600">Nuevas plantas en nivel 1 (5 máximo) cada 12 días</p>
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
              <h4 className="font-bold text-purple-700 mb-3">📊 Resumen de Rotación - CICLO 36 DÍAS</h4>

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
                  <h5 className="font-bold text-blue-700 mb-2">📅 Cronograma de Rotación</h5>
                  <div className="space-y=2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 1 (plántulas):</span>
                      <span className="font-bold text-cyan-600">Días 1-12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 2 (crecimiento):</span>
                      <span className="font-bold text-green-600">Días 13-24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Nivel 3 (maduración):</span>
                      <span className="font-bold text-emerald-600">Días 25-36</span>
                    </div>
                  </div>
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
              Confirmar Rotación (Cada 12 días)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL - REESCRITO COMPLETAMENTE CON LOS CAMBIOS SOLICITADOS
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

  // =================== ESTADO MEJORADO PARA MEDICIONES ===================
  const [measurements, setMeasurements] = useState({
    manualPH: "5,8",
    manualEC: "1400",
    manualTemp: "20",
    manualWaterTemp: "20",
    manualVolume: "18",
    manualHumidity: "65",
    // NUEVOS CAMPOS PARA CORRECCIONES
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

  // =================== EFECTOS Y PERSISTENCIA ===================

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hydro_caru_app");
      if (saved) {
        const data = JSON.parse(saved);
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

        // Inicializar tempMeasurements con los mismos valores
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

        if (data.plants && data.plants.length > 0) {
          setStep(5);
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
        localStorage.setItem("hydro_caru_app",
          JSON.stringify({
            plants,
            config,
            history,
            lastRot,
            lastClean,
            measurements,
            selectedECMethod
          }));
      } catch (error) {
        console.error("Error guardando:", error);
      }
    }
  }, [plants, config, history, lastRot, lastClean, measurements, step, selectedECMethod]);

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

    alert(`✅ Rotación completada exitosamente (Cada 12 días):
• ${plants.filter(p => p.l === 3).length} plantas cosechadas (nivel 3 - 36 días)
• ${plants.filter(p => p.l === 2).length} plantas movidas a nivel 3 (días 25-36)
• ${plants.filter(p => p.l === 1).length} plantas movidas a nivel 2 (días 13-24)
• ${newSeedlings.length} nuevas plántulas añadidas al nivel 1 (días 1-12)`);

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

  // =================== FUNCIONES MEJORADAS PARA MEDICIONES ===================

  // Función para convertir string con coma a número
  const parseDecimal = (value) => {
    if (typeof value !== 'string') return parseFloat(value);
    // Reemplazar coma por punto para parseo
    const stringValue = value.replace(',', '.');
    return parseFloat(stringValue);
  };

  // Función para formatear número a string con coma
  const formatDecimal = (value) => {
    if (typeof value === 'number') {
      // Formatear a string con coma decimal
      const parts = value.toString().split('.');
      if (parts.length === 2) {
        return `${parts[0]},${parts[1]}`;
      }
      return `${parts[0]},0`;
    }
    // Si ya es string, asegurarse de que tenga coma
    if (value.includes('.')) {
      return value.replace('.', ',');
    }
    if (!value.includes(',')) {
      return `${value},0`;
    }
    return value;
  };

  // Función para validar y formatear input de medición
  const handleMeasurementChange = (field, value) => {
    // Permitir números, coma, punto y backspace
    const sanitizedValue = value.replace(/[^0-9,.]/g, '');
    
    // Reemplazar punto por coma si se escribe punto
    let formattedValue = sanitizedValue.replace('.', ',');
    
    // Asegurar solo una coma decimal
    const parts = formattedValue.split(',');
    if (parts.length > 2) {
      formattedValue = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limitar a un decimal después de la coma
    if (parts.length === 2 && parts[1].length > 1) {
      formattedValue = parts[0] + ',' + parts[1].substring(0, 1);
    }

    // Actualizar el estado temporal inmediatamente
    setTempMeasurements(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // Función para guardar medición cuando se pierde el foco
  const saveMeasurement = (field) => {
    const tempValue = tempMeasurements[field];
    
    if (tempValue === '' || tempValue === undefined) {
      // Si está vacío, restaurar valor anterior
      setTempMeasurements(prev => ({
        ...prev,
        [field]: measurements[field]
      }));
      return;
    }

    const numericValue = parseDecimal(tempValue);
    
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

      // Actualizar tempMeasurements con valor formateado
      setTempMeasurements(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      // Si no es un número válido, restaurar valor anterior
      setTempMeasurements(prev => ({
        ...prev,
        [field]: measurements[field]
      }));
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
      if (value === '' || value === undefined) {
        allValid = false;
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

  // =================== ALERTAS ACTUALIZADAS - MODIFICADAS PARA 12 DÍAS ===================

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

    // Alerta de rotación (cada 12 días)
    const lastRotDate = new Date(lastRot);
    const daysSinceRot = Math.floor((now - lastRotDate) / (1000 * 3600 * 24));
    
    if (daysSinceRot >= 10) {
      res.push({
        title: daysSinceRot >= 12 ? "¡ROTACIÓN URGENTE!" : "ROTACIÓN PRÓXIMO",
        value: `${daysSinceRot} días`,
        description: daysSinceRot >= 12 ? "Realizar rotación de niveles" : "Programar rotación en próximos días",
        color: daysSinceRot >= 12 ? "bg-gradient-to-r from-orange-700 to-red-800" : "bg-gradient-to-r from-amber-600 to-orange-600",
        icon: <RotateCcw className="text-white" size={28} />,
        priority: daysSinceRot >= 12 ? 1 : 2,
        details: "Rotación cada 12 días: N1→N2→N3→Cosecha"
      });
    }

    return res.sort((a, b) => a.priority - b.priority);
  }, [config, lastClean, lastRot, history, phAdjustment, aquaVegaDosage, measurements]);

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

  const DashboardMetricsPanel = ({ config, measurements }) => {
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
      <div className="space-y-8 animate-fade-in">
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
                  <ul className="text-sm text-slate-700 space-y=1">
                    <li>• Aumentar a 3.5 minutos por ciclo</li>
                    <li>• Añadir 2-3 ciclos adicionales</li>
                    <li>• Verificar humedad de lana de roca</li>
                  </ul>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <h5 className="font-bold text-blue-600 mb-2">EN INVIERNO O DÍAS FRÍOS (&lt;15°C):</h5>
                  <ul className="text-sm text-slate-700 space-y=1">
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
            <div className="grid grid-cols=1 md:grid-cols=2 gap=4">
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

  // =================== PESTAÑA DE MEDICIONES CORREGIDA - SIN SLIDERS ===================

  const MeasurementsTab = () => {
    // Helper function para obtener recomendaciones de corrección
    const getCorrectionRecommendation = (param, value) => {
      const numericValue = parseDecimal(value);
      
      if (param === 'manualPH') {
        if (numericValue < 5.5) {
          return "pH bajo. Añadir pH+ (base suave) gota a gota.";
        } else if (numericValue > 6.5) {
          return `pH alto. Añadir ácido cítrico: ${phAdjustment.phMinus}ml recomendados.`;
        }
      } else if (param === 'manualEC') {
        const ecAlert = checkECAlert(numericValue);
        if (ecAlert) {
          if (ecAlert.type === 'low') {
            const mlPerPoint = 3.2;
            const pointsLow = (FIXED_EC_RANGE.target - numericValue) / 100;
            const mlToAdd = Math.round(pointsLow * mlPerPoint * 2);
            return `EC baja. Añadir ${mlToAdd}ml de AQUA VEGA A y B.`;
          } else if (ecAlert.type === 'high') {
            const waterToAdd = Math.round(((numericValue - FIXED_EC_RANGE.target) / 100) * 100);
            return `EC alta. Añadir ${waterToAdd}ml de agua destilada.`;
          }
        }
      } else if (param === 'manualVolume') {
        const totalVol = parseDecimal(config.totalVol);
        const percentage = (numericValue / totalVol) * 100;
        if (percentage < 45) {
          const waterToAdd = totalVol - numericValue;
          return `Volumen bajo. Añadir ${Math.round(waterToAdd)}L de agua destilada.`;
        }
      } else if (param === 'manualWaterTemp') {
        if (numericValue < 18) {
          return "Temp. agua baja. Ajustar calentador a 20°C.";
        } else if (numericValue > 22) {
          return "Temp. agua alta. Reducir calentador a 20°C.";
        }
      }
      
      return "✅ Valor en rango. No se requiere corrección.";
    };

    // Verificar si un parámetro necesita corrección
    const needsCorrection = (param, value) => {
      const numericValue = parseDecimal(value);
      
      if (param === 'manualPH') {
        return numericValue < 5.5 || numericValue > 6.5;
      } else if (param === 'manualEC') {
        const ecAlert = checkECAlert(numericValue);
        return ecAlert !== null;
      } else if (param === 'manualVolume') {
        const totalVol = parseDecimal(config.totalVol);
        const percentage = (numericValue / totalVol) * 100;
        return percentage < 45;
      } else if (param === 'manualWaterTemp') {
        return numericValue < 18 || numericValue > 22;
      }
      
      return false;
    };

    // Botones rápidos para valores comunes
    const QuickValueButtons = ({ field, values }) => (
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              const stringValue = formatDecimal(value);
              setTempMeasurements(prev => ({
                ...prev,
                [field]: stringValue
              }));
            }}
            className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            {value}
          </button>
        ))}
      </div>
    );

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mediciones Manuales - Protocolo 18L</h2>
          <p className="text-slate-600">Registra las mediciones actuales de tu sistema según protocolo diario</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clipboard className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Registro de Mediciones Diarias</h3>
              <p className="text-slate-600">Protocolo: Medir 1 vez al día (mañana, aireador apagado)</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-8">
              {/* pH del Agua */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Activity className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-700">pH del Agua</h4>
                        <p className="text-sm text-slate-600">Objetivo: 5.8 | Rango: 5.5-6.5</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Valor medido
                        </label>
                        <div className="flex flex-col">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tempMeasurements.manualPH}
                            onChange={(e) => handleMeasurementChange('manualPH', e.target.value)}
                            onBlur={() => saveMeasurement('manualPH')}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                            className={`w-full px-4 py-3 border rounded-lg text-center font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                              needsCorrection('manualPH', tempMeasurements.manualPH) 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-slate-300'
                            }`}
                            placeholder="5,8"
                          />
                          <QuickValueButtons field="manualPH" values={[5.5, 5.8, 6.0, 6.5]} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Rango ideal: 5,5 - 6,5 | Objetivo: 5,8
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Corrección aplicada (ml)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">pH- (ácido cítrico)</p>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={tempMeasurements.phCorrectionMinus}
                              onChange={(e) => handleMeasurementChange('phCorrectionMinus', e.target.value)}
                              onBlur={() => saveMeasurement('phCorrectionMinus')}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                              className={`w-full px-3 py-2 border rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:border-pink-500 ${
                                needsCorrection('manualPH', tempMeasurements.manualPH) && parseDecimal(tempMeasurements.manualPH) > 6.5
                                  ? 'border-red-500 bg-red-50 text-red-600 focus:ring-red-500'
                                  : 'border-slate-300 text-pink-600 focus:ring-pink-500'
                              }`}
                              placeholder="0,0"
                            />
                            <QuickValueButtons field="phCorrectionMinus" values={[0.5, 1.0, 2.0, 3.0]} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">pH+ (base)</p>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={tempMeasurements.phCorrectionPlus}
                              onChange={(e) => handleMeasurementChange('phCorrectionPlus', e.target.value)}
                              onBlur={() => saveMeasurement('phCorrectionPlus')}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                              className={`w-full px-3 py-2 border rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:border-blue-500 ${
                                needsCorrection('manualPH', tempMeasurements.manualPH) && parseDecimal(tempMeasurements.manualPH) < 5.5
                                  ? 'border-red-500 bg-red-50 text-red-600 focus:ring-red-500'
                                  : 'border-slate-300 text-blue-600 focus:ring-blue-500'
                              }`}
                              placeholder="0,0"
                            />
                            <QuickValueButtons field="phCorrectionPlus" values={[0.5, 1.0, 2.0]} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <h5 className="font-bold text-slate-800 mb-3">📋 Recomendación</h5>
                    <div className={`p-3 rounded-lg mb-3 ${
                      needsCorrection('manualPH', tempMeasurements.manualPH)
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <p className="text-sm font-medium text-slate-700">
                        {getCorrectionRecommendation('manualPH', tempMeasurements.manualPH)}
                      </p>
                    </div>
                    
                    {needsCorrection('manualPH', tempMeasurements.manualPH) && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600">
                          <strong>Valor actual:</strong> {tempMeasurements.manualPH}
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong>Valor objetivo:</strong> {config.targetPH}
                        </p>
                        <p className="text-xs text-amber-600 font-bold">
                          ⚠️ Requiere corrección
                        </p>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700">
                        <strong>Método de titulación:</strong>
                        <br />
                        • Añadir 0,5ml de ácido cítrico (≈10 gotas)
                        <br />
                        • Mezclar 2 minutos con aireador
                        <br />
                        • Esperar 30 segundos, medir
                        <br />
                        • Repetir hasta pH 5,8
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conductividad (EC) */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Zap className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-700">Conductividad (EC)</h4>
                        <p className="text-sm text-slate-600">Objetivo: 1400 µS/cm | Rango: 1350-1500</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Valor medido (µS/cm)
                        </label>
                        <div className="flex flex-col">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tempMeasurements.manualEC}
                            onChange={(e) => handleMeasurementChange('manualEC', e.target.value)}
                            onBlur={() => saveMeasurement('manualEC')}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                            className={`w-full px-4 py-3 border rounded-lg text-center font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              needsCorrection('manualEC', tempMeasurements.manualEC) 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-slate-300'
                            }`}
                            placeholder="1400"
                          />
                          <QuickValueButtons field="manualEC" values={[1350, 1400, 1450, 1500]} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Rango fijo: 1350-1500 µS/cm | Objetivo: 1400 µS/cm
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Corrección aplicada (ml)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">AQUA VEGA A</p>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={tempMeasurements.ecCorrectionA}
                              onChange={(e) => handleMeasurementChange('ecCorrectionA', e.target.value)}
                              onBlur={() => saveMeasurement('ecCorrectionA')}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                              className={`w-full px-3 py-2 border rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:border-emerald-500 ${
                                needsCorrection('manualEC', tempMeasurements.manualEC) && parseDecimal(tempMeasurements.manualEC) < 1350
                                  ? 'border-red-500 bg-red-50 text-red-600 focus:ring-red-500'
                                  : 'border-slate-300 text-emerald-600 focus:ring-emerald-500'
                              }`}
                              placeholder="0,0"
                            />
                            <QuickValueButtons field="ecCorrectionA" values={[3.2, 6.4, 9.6]} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">AQUA VEGA B</p>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={tempMeasurements.ecCorrectionB}
                              onChange={(e) => handleMeasurementChange('ecCorrectionB', e.target.value)}
                              onBlur={() => saveMeasurement('ecCorrectionB')}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                              className={`w-full px-3 py-2 border rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:border-green-500 ${
                                needsCorrection('manualEC', tempMeasurements.manualEC) && parseDecimal(tempMeasurements.manualEC) < 1350
                                  ? 'border-red-500 bg-red-50 text-red-600 focus:ring-red-500'
                                  : 'border-slate-300 text-green-600 focus:ring-green-500'
                              }`}
                              placeholder="0,0"
                            />
                            <QuickValueButtons field="ecCorrectionB" values={[3.2, 6.4, 9.6]} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Agua destilada</p>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={tempMeasurements.ecCorrectionWater}
                              onChange={(e) => handleMeasurementChange('ecCorrectionWater', e.target.value)}
                              onBlur={() => saveMeasurement('ecCorrectionWater')}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                              className={`w-full px-3 py-2 border rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:border-cyan-500 ${
                                needsCorrection('manualEC', tempMeasurements.manualEC) && parseDecimal(tempMeasurements.manualEC) > 1500
                                  ? 'border-red-500 bg-red-50 text-red-600 focus:ring-red-500'
                                  : 'border-slate-300 text-cyan-600 focus:ring-cyan-500'
                              }`}
                              placeholder="0,0"
                            />
                            <QuickValueButtons field="ecCorrectionWater" values={[100, 200, 300]} />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Ajuste EC: +3,2ml A+B por cada 0,1 mS/cm de diferencia
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <h5 className="font-bold text-slate-800 mb-3">📋 Recomendación</h5>
                    <div className={`p-3 rounded-lg mb-3 ${
                      needsCorrection('manualEC', tempMeasurements.manualEC)
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <p className="text-sm font-medium text-slate-700">
                        {getCorrectionRecommendation('manualEC', tempMeasurements.manualEC)}
                      </p>
                    </div>
                    
                    {needsCorrection('manualEC', tempMeasurements.manualEC) && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600">
                          <strong>Valor actual:</strong> {tempMeasurements.manualEC} µS/cm
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong>Rango objetivo:</strong> 1350-1500 µS/cm
                        </p>
                        <p className="text-xs text-amber-600 font-bold">
                          ⚠️ Requiere corrección
                        </p>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Protocolo 18L:</strong>
                        <br />
                        • 45ml AQUA VEGA A+B para 18L
                        <br />
                        • Objetivo: 1400 µS/cm (1,4 mS/cm)
                        <br />
                        • Rango fijo: 1350-1500 µS/cm
                        <br />
                        • Ajuste: +3,2ml A+B por cada 0,1 mS/cm
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Volumen de Agua */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Droplets className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-700">Volumen de Agua</h4>
                        <p className="text-sm text-slate-600">Depósito: {config.totalVol}L | Mínimo: {formatDecimal(parseDecimal(config.totalVol) * 0.45)}L</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Volumen actual (L)
                        </label>
                        <div className="flex flex-col">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tempMeasurements.manualVolume}
                            onChange={(e) => handleMeasurementChange('manualVolume', e.target.value)}
                            onBlur={() => saveMeasurement('manualVolume')}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                            className={`w-full px-4 py-3 border rounded-lg text-center font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              needsCorrection('manualVolume', tempMeasurements.manualVolume) 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-slate-300'
                            }`}
                            placeholder={config.currentVol}
                          />
                          <QuickValueButtons field="manualVolume" values={[9, 13.5, 18]} />
                        </div>
                        <div className="mt-3">
                          <Progress
                            value={(parseDecimal(tempMeasurements.manualVolume) / parseDecimal(config.totalVol)) * 100}
                            className="h-3"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0L</span>
                            <span>{Math.round((parseDecimal(tempMeasurements.manualVolume) / parseDecimal(config.totalVol)) * 100)}%</span>
                            <span>{config.totalVol}L</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Corrección agua destilada (ml)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={tempMeasurements.ecCorrectionWater}
                          onChange={(e) => handleMeasurementChange('ecCorrectionWater', e.target.value)}
                          onBlur={() => saveMeasurement('ecCorrectionWater')}
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                          className={`w-full px-4 py-3 border rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:border-cyan-500 ${
                            needsCorrection('manualVolume', tempMeasurements.manualVolume)
                              ? 'border-red-500 bg-red-50 text-red-600 focus:ring-red-500'
                              : 'border-slate-300 text-cyan-600 focus:ring-cyan-500'
                          }`}
                          placeholder="0,0"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          ml de agua destilada añadidos para rellenar
                        </p>
                        <QuickValueButtons field="ecCorrectionWater" values={[500, 1000, 2000]} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <h5 className="font-bold text-slate-800 mb-3">📋 Recomendación</h5>
                    <div className={`p-3 rounded-lg mb-3 ${
                      needsCorrection('manualVolume', tempMeasurements.manualVolume)
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <p className="text-sm font-medium text-slate-700">
                        {getCorrectionRecommendation('manualVolume', tempMeasurements.manualVolume)}
                      </p>
                    </div>
                    
                    {needsCorrection('manualVolume', tempMeasurements.manualVolume) && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600">
                          <strong>Volumen actual:</strong> {tempMeasurements.manualVolume}L
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong>Volumen mínimo:</strong> {formatDecimal(parseDecimal(config.totalVol) * 0.45)}L
                        </p>
                        <p className="text-xs text-amber-600 font-bold">
                          ⚠️ Requiere rellenar
                        </p>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-emerald-700">
                        <strong>Nota importante:</strong>
                        <br />
                        • Rellenar solo con agua destilada
                        <br />
                        • La EC bajará ligeramente al rellenar (normal)
                        <br />
                        • Mantener mínimo 45% del volumen total
                        <br />
                        • Protocolo: 18L total, mínimo 8L
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Temperatura del Agua */}
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Thermometer className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-cyan-700">Temperatura del Agua</h4>
                        <p className="text-sm text-slate-600">Objetivo: 20°C | Rango: 18-22°C</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Temperatura medida (°C)
                        </label>
                        <div className="flex flex-col">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tempMeasurements.manualWaterTemp}
                            onChange={(e) => handleMeasurementChange('manualWaterTemp', e.target.value)}
                            onBlur={() => saveMeasurement('manualWaterTemp')}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                            className={`w-full px-4 py-3 border rounded-lg text-center font-bold text-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${
                              needsCorrection('manualWaterTemp', tempMeasurements.manualWaterTemp) 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-slate-300'
                            }`}
                            placeholder="20"
                          />
                          <QuickValueButtons field="manualWaterTemp" values={[18, 20, 22]} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Rango ideal: 18-22°C | Objetivo: 20°C
                        </p>
                      </div>

                      <div>
                        <div className="p-3 bg-cyan-50 rounded-lg">
                          <p className="text-sm text-cyan-700">
                            <strong>Nota:</strong> La temperatura del agua se ajusta con el calentador. 
                            No hay corrección manual en ml. Ajustar calentador a 20°C.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <h5 className="font-bold text-slate-800 mb-3">📋 Recomendación</h5>
                    <div className={`p-3 rounded-lg mb-3 ${
                      needsCorrection('manualWaterTemp', tempMeasurements.manualWaterTemp)
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <p className="text-sm font-medium text-slate-700">
                        {getCorrectionRecommendation('manualWaterTemp', tempMeasurements.manualWaterTemp)}
                      </p>
                    </div>
                    
                    {needsCorrection('manualWaterTemp', tempMeasurements.manualWaterTemp) && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600">
                          <strong>Temperatura actual:</strong> {tempMeasurements.manualWaterTemp}°C
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong>Rango objetivo:</strong> 18-22°C
                        </p>
                        <p className="text-xs text-amber-600 font-bold">
                          ⚠️ Ajustar calentador
                        </p>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Importancia temperatura:</strong>
                        <br />
                        • 18-22°C: Absorción óptima de nutrientes
                        <br />
                        • &lt;18°C: Crecimiento lento, riesgo de pudrición
                        <br />
                        • &gt;22°C: Baja oxigenación, estrés radicular
                        <br />
                        • Usar calentador con termostato a 20°C
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Temperatura y Humedad Ambiente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <ThermometerSun className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-700">Temperatura Ambiente</h4>
                      <p className="text-sm text-slate-600">Ideal: 18-25°C</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Temperatura medida (°C)
                    </label>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={tempMeasurements.manualTemp}
                        onChange={(e) => handleMeasurementChange('manualTemp', e.target.value)}
                        onBlur={() => saveMeasurement('manualTemp')}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-center font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="20"
                      />
                      <QuickValueButtons field="manualTemp" values={[18, 22, 25, 28]} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Rango ideal: 18-25°C
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <CloudRain className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-700">Humedad Relativa</h4>
                      <p className="text-sm text-slate-600">Ideal: 40-70%</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Humedad medida (%)
                    </label>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={tempMeasurements.manualHumidity}
                        onChange={(e) => handleMeasurementChange('manualHumidity', e.target.value)}
                        onBlur={() => saveMeasurement('manualHumidity')}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-center font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="65"
                      />
                      <QuickValueButtons field="manualHumidity" values={[40, 50, 60, 70]} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Rango ideal: 40-70%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <Button
                onClick={saveAllManualMeasurements}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
              >
                <Clipboard className="mr-2" />
                Guardar Medición Diaria con Correcciones
              </Button>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Última medición: {new Date(measurements.lastMeasurement).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {history.length > 0 && (
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800">Historial Reciente</h3>
                <p className="text-slate-600">Últimas mediciones registradas con correcciones</p>
              </div>
              <Badge>{history.length} registros</Badge>
            </div>

            <div className="space-y-4">
              {history.slice(0, 5).map((record, index) => (
                <div key={record.id} className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-800">
                        {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-slate-600">{record.notes || "Medición diaria"}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHistoryRecord(record.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-700">pH</p>
                      <p className="font-bold text-purple-600">{record.ph}</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">EC</p>
                      <p className="font-bold text-blue-600">{record.ec} µS/cm</p>
                    </div>
                    <div className="text-center p-2 bg-cyan-50 rounded-lg">
                      <p className="text-xs text-cyan-700">Temp Agua</p>
                      <p className="font-bold text-cyan-600">{record.temp}°C</p>
                    </div>
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-700">Volumen</p>
                      <p className="font-bold text-emerald-600">{record.volume}L</p>
                    </div>
                  </div>

                  {/* Mostrar correcciones si existen */}
                  {record.corrections && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-700 mb-2">Correcciones aplicadas:</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div className="text-center p-2 bg-pink-50 rounded">
                          <p className="text-xs text-pink-700">pH-</p>
                          <p className="font-bold text-pink-600">{record.corrections.phMinus}ml</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-xs text-blue-700">pH+</p>
                          <p className="font-bold text-blue-600">{record.corrections.phPlus}ml</p>
                        </div>
                        <div className="text-center p-2 bg-emerald-50 rounded">
                          <p className="text-xs text-emerald-700">EC A</p>
                          <p className="font-bold text-emerald-600">{record.corrections.ecA}ml</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-xs text-green-700">EC B</p>
                          <p className="font-bold text-green-600">{record.corrections.ecB}ml</p>
                        </div>
                        <div className="text-center p-2 bg-cyan-50 rounded">
                          <p className="text-xs text-cyan-700">Agua</p>
                          <p className="font-bold text-cyan-600">{record.corrections.ecWater}ml</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // =================== RENDER POR PASOS ===================

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-10 animate-fade-in">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl border-4 border-emerald-400">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                    {/* Reemplazamos el icono con la imagen personalizada */}
                    <div className="relative w-64 h-64">
                      <Image
                        src="/mi-imagen.jpg"
                        alt="HydroCaru Logo"
                        fill
                        className="object-cover rounded-full"
                        priority
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
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">¡IMPORTANTE! Protocolo Corregido 18L</h2>
              <p className="text-slate-600">Sigue estos pasos para preparar correctamente tu sistema con agua destilada</p>
            </div>

            <Card className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <AlertOctagon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">⚠️ PROTOCOLO CORREGIDO - 18 LITROS</h3>
                  <p className="text-slate-600">Protocolo exacto según dosis correcta: 45ml A+B para 18L</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                  <h4 className="font-bold text-amber-800 text-lg mb-3">📋 PROTOCOLO 18L - PASO A PASO</h4>
                  <p className="text-slate-700 mb-4">
                    Protocolo específico para <strong>18 litros de agua destilada</strong> y <strong>AQUA VEGA A y B para aguas blandas</strong>.
                    Sigue estrictamente esta secuencia:
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">FASE 1: PREPARACIÓN</h5>
                        <p className="text-sm text-slate-600">Limpia el depósito con agua caliente. Elimina residuos.</p>
                        <p className="text-sm text-emerald-600 font-bold mt-1">• Llena con 18L de agua destilada</p>
                        <p className="text-sm text-emerald-600 font-bold">• Añade 45ml de AQUA VEGA A. Remueve 1 minuto</p>
                        <p className="text-sm text-emerald-600 font-bold">• Añade 45ml de AQUA VEGA B. Remueve 2 minutos</p>
                        <p className="text-sm text-emerald-600 font-bold">• Enciende difusor y calentador (20°C) durante 15 minutos</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">FASE 2: CALIBRACIÓN Y AJUSTE</h5>
                        <p className="text-sm text-slate-600">Objetivo: EC 1.4 mS/cm (1400 µS/cm)</p>
                        <p className="text-xs text-amber-600 font-bold mt-1">⚠️ Apaga aireador, espera 30 segundos, mide EC con ATC</p>
                        <p className="text-sm text-emerald-600 font-bold">• Si muestra 1.4 → Objetivo logrado</p>
                        <p className="text-sm text-emerald-600 font-bold">• Si muestra MENOS (ej: 1.2 o 1.3) → Añade +3.2ml de A y +3.2ml de B por cada 0.1 mS/cm de diferencia</p>
                        <p className="text-sm text-emerald-600 font-bold">• Si muestra MÁS (ej: 1.5 o 1.6) → Añade 100-200ml de agua destilada</p>
                        <p className="text-xs text-amber-600 font-bold mt-1">⚠️ Mezcla, airea 5 min, apaga aireador y mide de nuevo</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">FASE 3: AJUSTE pH CON TITULACIÓN</h5>
                        <p className="text-sm text-slate-600">Objetivo: pH 5.8</p>
                        <p className="text-sm text-emerald-600 font-bold mt-1">• Añade 0.5ml de ácido cítrico (≈10 gotas)</p>
                        <p className="text-sm text-emerald-600 font-bold">• Enciende aireador 2 minutos para mezclar</p>
                        <p className="text-sm text-emerald-600 font-bold">• Apaga aireador, espera 30 segundos, mide pH</p>
                        <p className="text-xs text-pink-600 font-bold mt-1">⚖️ Repetir ciclo hasta pH 5.8 (normalmente 1-3ml total)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">FASE 4: MANTENIMIENTO DIARIO</h5>
                        <p className="text-sm text-slate-600">Rutina a partir del día 2</p>
                        <p className="text-sm text-emerald-600 font-bold mt-1">• Medir pH y EC 1 vez al día (mañana, aireador apagado)</p>
                        <p className="text-sm text-emerald-600 font-bold">• Rellenar agua evaporada solo con agua destilada</p>
                        <p className="text-sm text-emerald-600 font-bold">• Cada 10 días: recargar nutrientes si EC baja 30%</p>
                        <p className="text-sm text-emerald-600 font-bold">• Cada 2 semanas: cambio completo de solución</p>
                        <p className="text-sm text-emerald-600 font-bold">• Cada 12 días: rotación de niveles (Ciclo 36 días)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
                  <h4 className="font-bold text-red-700 text-lg mb-3">🚫 ERRORES COMUNES QUE DEBES EVITAR</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt=0.5" size={16} />
                      <span><strong>Nunca</strong> usar agua que no sea destilada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt=0.5" size={16} />
                      <span><strong>Nunca</strong> usar otros nutrientes que no sean AQUA VEGA A y B para aguas blandas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt=0.5" size={16} />
                      <span><strong>Nunca</strong> ajustar el pH antes de estabilizar la EC a 1.4 mS/cm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt=0.5" size={16} />
                      <span><strong>Nunca</strong> omitir los tiempos de mezcla y estabilización</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt=0.5" size={16} />
                      <span><strong>Nunca</strong> añadir CalMag - AQUA VEGA ya contiene Ca y Mg en proporción óptima</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt=0.5" size={16} />
                      <span><strong>Nunca</strong> usar 63ml A+B (error anterior) - La dosis correcta es 45ml A+B</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-700 text-lg mb-3">✅ CONSEJOS DE ÉXITO CON PROTOCOLO CORREGIDO</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt=0.5" size={16} />
                      <span><strong>Dosis correcta:</strong> 45ml de A y B para 18L (2.5ml/L)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt=0.5" size={16} />
                      <span><strong>Sin CalMag:</strong> AQUA VEGA A/B para aguas blandas contiene Ca y Mg equilibrados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt=0.5" size={16} />
                      <span><strong>Medición precisa:</strong> Siempre con aireador apagado 30 segundos antes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt=0.5" size={16} />
                      <span><strong>Titulación pH:</strong> Ajustar gota a gota (0.5ml por paso) para evitar sobrecorrección</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt=0.5" size={16} />
                      <span><strong>Rellenar solo agua destilada:</strong> Mantiene estabilidad sin alterar nutrientes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt=0.5" size={16} />
                      <span><strong>Ajuste EC:</strong> +3.2ml A+B por cada 0.1 mS/cm de diferencia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt=0.5" size={16} />
                      <span><strong>Rotación cada 12 días:</strong> Ciclo completo de 36 días (12+12+12)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

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
                Entendido, continuar
                <ChevronRight className="ml-2" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">Paso 2: Configuración Básica - Protocolo 18L</h2>
              <p className="text-slate-600">Define las características de tu sistema con agua destilada</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Droplets className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Volumen del Sistema</h3>
                    <p className="text-sm text-slate-600">Protocolo específico para 18 litros</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Volumen Total (Litros)
                    </label>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">18L</div>
                        <p className="text-sm text-slate-600">Protocolo específico</p>
                        <p className="text-xs text-blue-600 mt-2">
                          45ml AQUA VEGA A + 45ml AQUA VEGA B (CORREGIDO)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Agua Actual en Depósito
                    </label>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={config.currentVol}
                        onChange={(e) => setConfig({ ...config, currentVol: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-center font-bold text-blue-600"
                        placeholder="18"
                      />
                      <div className="flex justify-between text-sm text-slate-600 mt-2">
                        <span>0L</span>
                        <span className="font-bold text-blue-600">{config.currentVol}L</span>
                        <span>{config.totalVol}L</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={(parseDecimal(config.currentVol) / parseDecimal(config.totalVol)) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Filter className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Tipo de Agua</h3>
                    <p className="text-sm text-slate-600">Sistema configurado para AGUA DESTILADA</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    {WATER_TYPES["osmosis"].icon}
                    <span className="font-bold text-slate-800">AGUA DESTILADA</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{WATER_TYPES["osmosis"].description}</p>
                  <p className="text-xs text-blue-600 font-bold">
                    ✅ Sistema configurado para uso exclusivo de agua destilada
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Nutrientes: AQUA VEGA A y B para aguas blandas
                  </p>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    <strong>Nota importante:</strong> Este sistema está configurado específicamente para:
                    <br />• 18 litros de agua destilada
                    <br />• AQUA VEGA A y B para aguas blandas
                    <br />• Protocolo: 45ml de A y B → EC objetivo 1.4 mS/cm (CORREGIDO)
                    <br />• <strong>NO se requiere CalMag</strong> - Los nutrientes ya contienen Ca y Mg
                    <br />• Ajuste EC: +3.2ml A+B por cada 0.1 mS/cm de diferencia
                    <br />• Rotación: Cada 12 días (Ciclo completo 36 días)
                  </p>
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
                Continuar
                <ChevronRight className="ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">Paso 3: Valores Objetivo - Protocolo 18L</h2>
              <p className="text-slate-600">Configura los valores objetivo según el protocolo corregido</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Activity className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">pH del Agua</h3>
                    <p className="text-sm text-slate-600">Rango de trabajo: 5.5 - 6.5</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">
                        Valor de pH: <span className="font-bold text-purple-600">{config.ph}</span>
                      </label>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${parseDecimal(config.ph) >= 5.5 && parseDecimal(config.ph) <= 6.5
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {parseDecimal(config.ph) >= 5.5 && parseDecimal(config.ph) <= 6.5 ? 'EN RANGO' : 'FUERA DE RANGO'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={config.ph}
                        onChange={(e) => setConfig({ ...config, ph: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-center font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="5,8"
                      />
                      <div className="flex justify-between text-sm text-slate-600 mt-2">
                        <span>4.0</span>
                        <span className="font-bold text-green-600">5.5-6.5</span>
                        <span>9.0</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700">
                        <strong>Método de titulación:</strong><br />
                        • Añadir 0,5ml de ácido cítrico (≈10 gotas)<br />
                        • Mezclar 2 minutos con aireador<br />
                        • Esperar 30 segundos, medir<br />
                        • Repetir hasta pH 5,8
                      </p>
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
                    <p className="text-sm text-slate-600">Rango fijo: 1350-1500 µS/cm</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">
                        Valor de EC: <span className="font-bold text-blue-600">{config.ec} µS/cm</span>
                      </label>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${parseDecimal(config.ec) >= 1350 && parseDecimal(config.ec) <= 1500
                          ? 'bg-green-100 text-green-800'
                          : parseDecimal(config.ec) > 1500
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                        {parseDecimal(config.ec) > 1500 ? 'DEMASIADO ALTA' :
                          parseDecimal(config.ec) < 1350 ? 'DEMASIADO BAJA' : 'EN RANGO'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={config.ec}
                        onChange={(e) => setConfig({ ...config, ec: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-center font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1400"
                      />
                      <div className="flex justify-between text-sm text-slate-600 mt-2">
                        <span>0</span>
                        <span className="font-bold text-green-600">1350-1500</span>
                        <span>3000</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Protocolo 18L Corregido:</strong><br />
                        • Objetivo: 1400 µS/cm (1.4 mS/cm)<br />
                        • Ajuste: +3,2ml A+B por cada 0.1 mS/cm si {'<'} 1.3<br />
                        • Agua destilada si {'>'} 1.6<br />
                        • 45ml A+B por 18L agua destilada<br />
                        • <strong>NO CalMag</strong> - Ya incluido en AQUA VEGA
                        • <strong>Rotación cada 12 días</strong> - Ciclo 36 días
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

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
                onClick={() => setStep(4)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
              >
                Continuar a Plantación
                <ChevronRight className="ml-2" />
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">Paso 4: Configurar Torre - EC FIJO</h2>
              <p className="text-slate-600">Añade plantas a tu sistema con EC constante 1350-1500 µS/cm</p>
            </div>

            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TreePine className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Sistema Escalonado 5-5-5 - CICLO 36 DÍAS</h3>
                  <p className="text-sm text-slate-600">15 plantas en 3 niveles - Rotación cada 12 días</p>
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
                        Nivel (12 días por nivel)
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSelPos(prev => ({ ...prev, l: level }))}
                            className={`flex-1 py-3 rounded-lg text-center font-medium transition-all ${selPos?.l === level
                                ? level === 1 ? 'bg-cyan-500 text-white' :
                                  level === 2 ? 'bg-green-500 text-white' :
                                    'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                          >
                            Nivel {level}
                            <div className="text-xs opacity-80">
                              {level === 1 ? "Días 1-12" : 
                               level === 2 ? "Días 13-24" : 
                               "Días 25-36"}
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
                            onClick={() => setSelPos(prev => ({ ...prev, v: variety }))}
                            className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${selPos?.v === variety
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
                        {Array.from({ length: 15 }, (_, i) => i + 1).map(pos => {
                          const ocupada = plants.find(p => p.p === pos);
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => !ocupada && setSelPos(prev => ({ ...prev, p: pos }))}
                              className={`aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${ocupada
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
                        const isPositionOccupied = plants.some(p => p.p === selPos.p);
                        if (isPositionOccupied) {
                          alert(`La posición ${selPos.p} ya está ocupada. Por favor, selecciona otra posición.`);
                          return;
                        }

                        const newPlant = {
                          id: generatePlantId(),
                          l: selPos.l,
                          v: selPos.v,
                          p: selPos.p,
                          date: new Date().toISOString()
                        };

                        setPlants([...plants, newPlant]);
                        setSelPos(prev => ({ ...prev, p: null }));
                      } else {
                        let missing = [];
                        if (!selPos?.l) missing.push("nivel");
                        if (!selPos?.v) missing.push("variedad");
                        if (!selPos?.p) missing.push("posición");
                        
                        alert(`Por favor, selecciona: ${missing.join(", ")}`);
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
                    <h4 className="font-bold text-slate-800 mb-4">Plantas Actuales - CICLO 36 DÍAS</h4>
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
                                  Nivel {plant.l} ({plant.l === 1 ? "1-12d" : plant.l === 2 ? "13-24d" : "25-36d"})
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600">
                                EC fija: 1350-1500 µS/cm • Rotación cada 12 días
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
                onClick={() => setStep(3)}
                variant="outline"
                className="px-6 py-3 rounded-xl"
              >
                <ArrowLeft className="mr-2" size={18} />
                Atrás
              </Button>

              <Button
                onClick={() => {
                  if (plants.length === 0) {
                    alert("Debes añadir al menos una planta para continuar");
                    return;
                  }
                  setStep(5);
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
      {/* Header con imagen personalizada */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 overflow-hidden shadow-2xl flex items-center justify-center border-4 border-emerald-300">
            {/* Reemplazamos el icono con la imagen personalizada */}
            <div className="relative w-28 h-28">
              <Image
                src="/mi-imagen.jpg"
                alt="HydroCaru Logo"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </div>
        </div>
        
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-600">Sistema hidropónico con EC fija 1350-1500 µS/cm • Rotación cada 12 días</p>
          
          <div className="flex items-center gap-3 mt-4">
            <Badge className={
              season === "summer" ? "bg-amber-100 text-amber-800" :
                season === "winter" ? "bg-blue-100 text-blue-800" :
                  "bg-green-100 text-green-800"
            }>
              {season === "summer" ? "Verano" :
                season === "winter" ? "Invierno" :
                  "Primavera/Otoño"}
            </Badge>

            <Badge className="bg-blue-100 text-blue-800">
              {plants.length}/15 plantas
            </Badge>

            <Badge className="bg-emerald-100 text-emerald-800">
              Ciclo 36 días
            </Badge>
          </div>
        </div>
      </div>

      {/* Panel de medidores primero (parámetros actuales) */}
      <DashboardMetricsPanel config={config} measurements={measurements} />

      {/* Panel de cálculo EC fijo */}
      <StagedECCalculator
        plants={plants}
        onECCalculated={handleECCalculated}
        selectedMethod={selectedECMethod}
        onMethodChange={handleECMethodChange}
      />

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Alertas del Sistema - Protocolo 18L</h2>
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
                {alert.details && (
                  <p className="text-white/80 text-sm mt-2">{alert.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sprout className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Estado del Cultivo</h3>
              <p className="text-sm text-slate-600">Sistema 5-5-5 con rotación 12 días</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Plántulas (N1 - 12d):</span>
              <span className="font-bold text-cyan-600">{plantStats.seedlingCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Crecimiento (N2 - 12d):</span>
              <span className="font-bold text-green-600">{plantStats.growthCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Maduras (N3 - 12d):</span>
              <span className="font-bold text-emerald-600">{plantStats.matureCount}/5</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex justify-between">
              <span className="font-bold text-slate-800">Total plantas</span>
              <span className="font-bold text-blue-600">{plants.length}/15</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              EC fija: 1350-1500 µS/cm • Rotación cada 12 días
            </p>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Nutrición AQUA VEGA</h3>
              <p className="text-sm text-slate-600">Protocolo 18L Corregido - Sin CalMag</p>
            </div>
          </div>

          {plants.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">EC objetivo:</span>
                <span className="font-bold text-blue-600">{config.targetEC} µS/cm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">pH objetivo:</span>
                <span className="font-bold text-purple-600">{config.targetPH}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-700">AQUA VEGA A:</span>
                <span className="font-bold text-emerald-600">{aquaVegaDosage.a} ml</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">AQUA VEGA B:</span>
                <span className="font-bold text-emerald-600">{aquaVegaDosage.b} ml</span>
              </div>

              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-700 text-center">
                  ✅ Protocolo corregido: 45ml A+B para 18L (2.5ml/L)
                </p>
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
              <h3 className="font-bold text-slate-800">Condiciones Agua</h3>
              <p className="text-sm text-slate-600">Depósito con monitoreo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Volumen:</span>
              <span className="font-bold text-blue-600">{measurements.manualVolume}L / {config.totalVol}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Temp. agua:</span>
              <span className={`font-bold ${parseDecimal(measurements.manualWaterTemp) > 22 ? 'text-red-600' :
                  parseDecimal(measurements.manualWaterTemp) < 18 ? 'text-blue-600' :
                    'text-green-600'
                }`}>
                {measurements.manualWaterTemp}°C
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">pH actual:</span>
              <span className={`font-bold ${Math.abs(parseDecimal(measurements.manualPH) - parseDecimal(config.targetPH)) > 0.8 ? 'text-red-600' :
                  Math.abs(parseDecimal(measurements.manualPH) - parseDecimal(config.targetPH)) > 0.5 ? 'text-amber-600' :
                    'text-green-600'
                }`}>
                {measurements.manualPH}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">EC actual:</span>
              <span className={`font-bold ${parseDecimal(measurements.manualEC) > parseDecimal(config.targetEC) + 100 ? 'text-red-600' :
                  parseDecimal(measurements.manualEC) < parseDecimal(config.targetEC) - 100 ? 'text-amber-600' :
                    'text-green-600'
                }`}>
                {measurements.manualEC} µS/cm
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
          Rotar Niveles (12 días)
        </Button>

        <Button
          onClick={saveAllManualMeasurements}
          variant="outline"
        >
          <Clipboard className="mr-2" />
          Guardar Medición
        </Button>

        <Button
          onClick={handleRegisterClean}
          variant="outline"
        >
          <ShieldAlert className="mr-2" />
          Marcar Cambio Completo
        </Button>

        <Button
          onClick={handleRegisterRecharge}
          variant="outline"
          className="bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
        >
          <RefreshCw className="mr-2" />
          Recargar Nutrientes
        </Button>

        <Button
          onClick={() => setTab("calculator")}
          variant="outline"
        >
          <Calculator className="mr-2" />
          Calculadora
        </Button>
      </div>
    </div>
  );

  const TowerTab = () => {
    const [localSelPos, setLocalSelPos] = useState({
      l: 1,
      v: "Iceberg",
      p: null
    });

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de la Torre - CICLO 36 DÍAS</h2>
          <p className="text-slate-600">Sistema escalonado 5-5-5 con rotación cada 12 días</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sprout className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Nivel 1 - Plántulas</h3>
                <p className="text-sm text-slate-600">Días 1-12 • EC: 1350-1500 µS/cm</p>
              </div>
            </div>

            <div className="space-y-3">
              {plants.filter(p => p.l === 1).map(plant => (
                <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-slate-200'}`}>
                      <span className="text-white text-xs font-bold">{plant.p}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{plant.v}</p>
                      <p className="text-xs text-slate-500">Posición {plant.p} • Días 1-12</p>
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
                  <p className="text-xs text-slate-400">Días 1-12 • EC: 1350-1500 µS/cm</p>
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
                <p className="text-sm text-slate-600">Días 13-24 • EC: 1350-1500 µS/cm</p>
              </div>
            </div>

            <div className="space-y-3">
              {plants.filter(p => p.l === 2).map(plant => (
                <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-slate-200'}`}>
                      <span className="text-white text-xs font-bold">{plant.p}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{plant.v}</p>
                      <p className="text-xs text-slate-500">Posición {plant.p} • Días 13-24</p>
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
                  <p className="text-xs text-slate-400">Días 13-24 • EC: 1350-1500 µS/cm</p>
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
                <p className="text-sm text-slate-600">Días 25-36 • EC: 1350-1500 µS/cm</p>
              </div>
            </div>

            <div className="space-y-3">
              {plants.filter(p => p.l === 3).map(plant => (
                <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-slate-200'}`}>
                      <span className="text-white text-xs font-bold">{plant.p}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{plant.v}</p>
                      <p className="text-xs text-slate-500">Posición {plant.p} • Días 25-36</p>
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
                  <p className="text-xs text-slate-400">Días 25-36 • EC: 1350-1500 µS/cm</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Formulario de añadir planta */}
        {showAddPlantForm && (
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-xl">Añadir Nueva Planta</h3>
                <p className="text-slate-600">Completa los datos para añadir una nueva planta</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddPlantForm(false);
                  setLocalSelPos({ l: 1, v: "Iceberg", p: null });
                }}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nivel (12 días por nivel)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setLocalSelPos(prev => ({ ...prev, l: level }))}
                      className={`flex-1 py-3 rounded-lg text-center font-medium transition-all ${localSelPos.l === level
                          ? level === 1 ? 'bg-cyan-500 text-white' :
                            level === 2 ? 'bg-green-500 text-white' :
                              'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      Nivel {level}
                      <div className="text-xs opacity-80">
                        {level === 1 ? "1-12d" : level === 2 ? "13-24d" : "25-36d"}
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
                      onClick={() => setLocalSelPos(prev => ({ ...prev, v: variety }))}
                      className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${localSelPos.v === variety
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
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(pos => {
                    const ocupada = plants.find(p => p.p === pos);
                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => !ocupada && setLocalSelPos(prev => ({ ...prev, p: pos }))}
                        className={`aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${ocupada
                            ? 'bg-red-100 text-red-700'
                            : localSelPos.p === pos
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
                if (localSelPos.l && localSelPos.v && localSelPos.p) {
                  const isPositionOccupied = plants.some(p => p.p === localSelPos.p);
                  if (isPositionOccupied) {
                    alert(`La posición ${localSelPos.p} ya está ocupada. Por favor, selecciona otra posición.`);
                    return;
                  }

                  const newPlant = {
                    id: generatePlantId(),
                    l: localSelPos.l,
                    v: localSelPos.v,
                    p: localSelPos.p,
                    date: new Date().toISOString()
                  };

                  setPlants([...plants, newPlant]);
                  setLocalSelPos({ l: 1, v: "Iceberg", p: null });
                  setShowAddPlantForm(false);
                  
                  alert(`✅ Planta añadida exitosamente:
• Variedad: ${localSelPos.v}
• Nivel: ${localSelPos.l} (${localSelPos.l === 1 ? "Días 1-12" : localSelPos.l === 2 ? "Días 13-24" : "Días 25-36"})
• Posición: ${localSelPos.p}
• EC fija: 1350-1500 µS/cm
• Rotación: Cada 12 días`);
                } else {
                  let missing = [];
                  if (!localSelPos.l) missing.push("nivel");
                  if (!localSelPos.v) missing.push("variedad");
                  if (!localSelPos.p) missing.push("posición");
                  
                  alert(`Por favor, selecciona: ${missing.join(", ")}`);
                }
              }}
              disabled={!(localSelPos.l && localSelPos.v && localSelPos.p)}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
            >
              <Plus className="mr-2" />
              Añadir Planta a la Torre
            </Button>
          </Card>
        )}

        <div className="flex justify-between">
          <Button
            onClick={handleRotation}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            <RotateCcw className="mr-2" />
            Rotar Niveles (Cada 12 días)
          </Button>

          <Button
            onClick={() => {
              if (plants.length >= 15) {
                alert("La torre está llena (15/15 plantas)");
                return;
              }
              setShowAddPlantForm(true);
            }}
            disabled={plants.length >= 15}
          >
            <Plus className="mr-2" />
            Añadir Planta
          </Button>
        </div>
      </div>
    );
  };

  const CalculatorTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Calculadora PROTOCOLO 18L CORREGIDO</h2>
        <p className="text-slate-600">Cálculos específicos para tu sistema con EC fija</p>
      </div>

      <StagedECCalculator
        plants={plants}
        onECCalculated={handleECCalculated}
        selectedMethod={selectedECMethod}
        onMethodChange={handleECMethodChange}
      />

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <FlaskConical className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Cálculo de Nutrientes AQUA VEGA A/B</h3>
            <p className="text-slate-600">Dosificación para protocolo 18L Corregido - Sin CalMag</p>
          </div>
        </div>

        {plants.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                <h4 className="font-bold text-emerald-700 mb-3">AQUA VEGA A</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">{aquaVegaDosage.a} ml</div>
                  <p className="text-sm text-slate-600">Para {measurements.manualVolume}L de agua destilada</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {aquaVegaDosage.per10L.a} ml por cada 10L
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <h4 className="font-bold text-green-700 mb-3">AQUA VEGA B</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{aquaVegaDosage.b} ml</div>
                  <p className="text-sm text-slate-600">Para {measurements.manualVolume}L de agua destilada</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {aquaVegaDosage.per10L.b} ml por cada 10L
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-blue-700 mb-3">Protocolo 18L Corregido - Sin CalMag</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-slate-700">Añadir AQUA VEGA A ({aquaVegaDosage.a} ml) y mezclar durante 1 minuto</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-slate-700">Añadir AQUA VEGA B ({aquaVegaDosage.b} ml) y mezclar durante 2 minutos</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-slate-700">Homogenizar con aireador y calentador (20°C) durante 15 minutos</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-slate-700">Apagar aireador, esperar 30s, medir EC y ajustar a 1400 µS/cm</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3">Notas Importantes - Protocolo 18L Corregido</h4>
              <p className="text-slate-600">{aquaVegaDosage.note}</p>
              <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-700">
                  ✅ <strong>PROTOCOLO CORREGIDO:</strong> 45ml A+B para 18L = 2.5ml/L (antes 63ml = 3.5ml/L era incorrecto)
                </p>
              </div>
              <div className="mt-2 p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-700">
                  ✅ <strong>NO se requiere CalMag</strong> - AQUA VEGA A/B para aguas blandas ya contiene 
                  calcio y magnesio en proporción óptima para agua destilada.
                </p>
              </div>
              <div className="mt-2 p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-700">
                  ⚠️ <strong>AJUSTE EC:</strong> +3,2ml de A y B por cada 0.1 mS/cm de diferencia
                </p>
              </div>
              <div className="mt-2 p-3 bg-cyan-50 rounded-lg">
                <p className="text-sm text-cyan-700">
                  🔄 <strong>ROTACIÓN CADA 12 DÍAS:</strong> Ciclo completo de 36 días (12+12+12)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FlaskConical className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">Añade plantas al sistema para calcular dosificación</p>
          </div>
        )}
      </Card>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <ArrowDownCircle className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Ajuste de pH - Método de Titulación</h3>
            <p className="text-slate-600">Ajuste preciso gota a gota según protocolo 18L</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200">
              <h4 className="font-bold text-pink-700 mb-3">pH- (Ácido cítrico)</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600">{phAdjustment.phMinus} ml</div>
                <p className="text-sm text-slate-600">Total estimado</p>
                <p className="text-xs text-slate-500 mt-2">
                  {phAdjustment.steps} pasos de 0,5ml
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-purple-700 mb-3">Método</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Titulación</div>
                <p className="text-sm text-slate-600">0,5ml por paso</p>
                <p className="text-xs text-slate-500 mt-2">
                  ≈10 gotas por paso
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200">
            <h4 className="font-bold text-slate-700 mb-3">Procedimiento de Titulación</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-slate-700">Añadir 0,5ml de ácido cítrico (≈10 gotas)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-slate-700">Encender aireador 2 minutos para mezclar</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-slate-700">Apagar aireador, esperar 30 segundos</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-sm text-slate-700">Medir pH. Repetir si necesario hasta pH 5,8</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Normalmente se requieren 1-3ml total (2-6 pasos) para ajustar de pH 7,0 a 5,8
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-amber-700 mb-3">Recomendación</h4>
            <p className="text-slate-600">{phAdjustment.recommendation}</p>
            {phAdjustment.critical && (
              <p className="text-red-600 mt-2 font-bold">🚨 AJUSTE URGENTE: El pH está fuera del rango seguro</p>
            )}
            <p className="text-xs text-amber-600 mt-2">
              {phAdjustment.method}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const CalendarTab = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario de Mantenimiento - {monthNames[currentMonth]} {currentYear}</h2>
          <p className="text-slate-600">Planificación de tareas según protocolo corregido - Solo mes actual</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Calendario Mensual - Protocolo 18L</h3>
              <p className="text-slate-600">{monthNames[currentMonth]} {currentYear}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-7 gap-1">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="text-center py-2 font-bold text-slate-700">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded-lg ${day.isCurrentMonth ? 'bg-white' : 'bg-slate-50'} ${day.events.length > 0 && day.isCurrentMonth ? 'border-blue-300' : 'border-slate-200'}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-bold ${day.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                    {day.dayOfMonth}
                  </span>
                  {day.events.length > 0 && day.isCurrentMonth && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {day.events.length}
                    </Badge>
                  )}
                </div>
                
                {day.isCurrentMonth && day.dayOfMonth && (
                  <div className="mt-1 space-y-1">
                    {day.events.includes('measure') && (
                      <div className="text-xs bg-cyan-50 text-cyan-700 p-1 rounded">
                        📊 Medir
                      </div>
                    )}
                    {day.events.includes('recharge') && (
                      <div className="text-xs bg-emerald-50 text-emerald-700 p-1 rounded">
                        ⚡ Recargar
                      </div>
                    )}
                    {day.events.includes('change') && (
                      <div className="text-xs bg-purple-50 text-purple-700 p-1 rounded">
                        🔄 Cambio
                      </div>
                    )}
                    {day.events.includes('rotation') && (
                      <div className="text-xs bg-amber-50 text-amber-700 p-1 rounded">
                        🔄 Rotar 12d
                      </div>
                    )}
                    {day.events.includes('clean') && (
                      <div className="text-xs bg-blue-50 text-blue-700 p-1 rounded">
                        🧼 Limpiar
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-blue-700 mb-3">📅 Próximas Tareas Programadas - Protocolo 18L</h4>
              <div className="space-y-3">
                {(() => {
                  const now = new Date();
                  const nextTasks = [];
                  
                  // Buscar próxima medición
                  const nextMeasure = calendarDays.find(day => 
                    day.isCurrentMonth && 
                    day.events.includes('measure') && 
                    day.date > now
                  );
                  
                  // Buscar próxima recarga
                  const nextRecharge = calendarDays.find(day => 
                    day.isCurrentMonth && 
                    day.events.includes('recharge') && 
                    day.date > now
                  );
                  
                  // Buscar próximo cambio
                  const nextChange = calendarDays.find(day => 
                    day.isCurrentMonth && 
                    day.events.includes('change') && 
                    day.date > now
                  );

                  // Buscar próxima rotación
                  const nextRotation = calendarDays.find(day => 
                    day.isCurrentMonth && 
                    day.events.includes('rotation') && 
                    day.date > now
                  );

                  if (nextMeasure) {
                    nextTasks.push({
                      type: 'measure',
                      date: nextMeasure.date,
                      title: 'Próxima medición diaria',
                      description: 'Medir pH y EC (aireador apagado)'
                    });
                  }

                  if (nextRecharge) {
                    nextTasks.push({
                      type: 'recharge',
                      date: nextRecharge.date,
                      title: 'Próxima recarga de nutrientes',
                      description: 'Añadir AQUA VEGA A y B en partes iguales'
                    });
                  }

                  if (nextChange) {
                    nextTasks.push({
                      type: 'change',
                      date: nextChange.date,
                      title: 'Próximo cambio completo',
                      description: 'Cambio de solución cada 2 semanas'
                    });
                  }

                  if (nextRotation) {
                    nextTasks.push({
                      type: 'rotation',
                      date: nextRotation.date,
                      title: 'Próxima rotación de niveles',
                      description: 'Rotación cada 12 días - Ciclo 36 días'
                    });
                  }

                  return nextTasks
                    .sort((a, b) => a.date - b.date)
                    .slice(0, 4)
                    .map((task, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          task.type === 'measure' ? 'bg-cyan-100 text-cyan-700' :
                          task.type === 'recharge' ? 'bg-emerald-100 text-emerald-700' :
                          task.type === 'change' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {task.type === 'measure' ? '📊' :
                           task.type === 'recharge' ? '⚡' :
                           task.type === 'change' ? '🔄' :
                           '🔄'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{task.title}</p>
                          <p className="text-sm text-slate-600">{task.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {task.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Último Cambio</h4>
                <p className="text-slate-600">
                  {new Date(lastClean).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.floor((new Date() - new Date(lastClean)) / (1000 * 3600 * 24))} días desde último cambio
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Protocolo: Cambio cada 2 semanas
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Última Recarga</h4>
                <p className="text-slate-600">
                  {(() => {
                    const lastRecharge = history.filter(h => 
                      h.type === 'recharge' || (h.notes && h.notes.includes('recarga'))
                    ).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                    
                    if (lastRecharge) {
                      return new Date(lastRecharge.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
                    }
                    return "No registrada";
                  })()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Protocolo: Recargar cada 10 días
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Última Rotación</h4>
                <p className="text-slate-600">
                  {new Date(lastRot).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.floor((new Date() - new Date(lastRot)) / (1000 * 3600 * 24))} días desde última rotación
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Protocolo: Rotación cada 12 días
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Frecuencia de Mediciones</h4>
                <p className="text-slate-600">
                  1 vez al día
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Protocolo: Medir por la mañana con aireador apagado
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  EC fija: 1350-1500 µS/cm
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const HistoryTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Historial Completo - Protocolo 18L</h2>
        <p className="text-slate-600">Registro de todas las actividades del sistema con correcciones</p>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <BarChart className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Registros Históricos</h3>
              <p className="text-slate-600">{history.length} eventos registrados</p>
            </div>
          </div>
          
          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("¿Eliminar todo el historial? Esta acción no se puede deshacer.")) {
                  setHistory([]);
                }
              }}
            >
              <Trash2 className="mr-2" size={16} />
              Limpiar Historial
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <BarChart className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">No hay registros históricos</p>
            <p className="text-sm text-slate-400 mt-1">Realiza mediciones para comenzar el historial</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div key={record.id} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800">
                        {record.type === 'clean' ? '🔄 Cambio Completo' : 
                         record.type === 'recharge' ? '⚡ Recarga' : 
                         record.type === 'rotation' ? '🔄 Rotación' : 
                         '📊 Medición'}
                      </p>
                      <Badge className={
                        record.type === 'clean' ? 'bg-purple-100 text-purple-800' :
                        record.type === 'recharge' ? 'bg-emerald-100 text-emerald-800' :
                        record.type === 'rotation' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {record.type || 'medición'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {new Date(record.date).toLocaleDateString('es-ES', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHistoryRecord(record.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {record.ph && (
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-700">pH</p>
                      <p className="font-bold text-purple-600">{record.ph}</p>
                    </div>
                  )}
                  
                  {record.ec && (
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">EC</p>
                      <p className="font-bold text-blue-600">{record.ec} µS/cm</p>
                    </div>
                  )}
                  
                  {record.temp && (
                    <div className="text-center p-2 bg-cyan-50 rounded-lg">
                      <p className="text-xs text-cyan-700">Temp. Agua</p>
                      <p className="font-bold text-cyan-600">{record.temp}°C</p>
                    </div>
                  )}
                  
                  {record.volume && (
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-700">Volumen</p>
                      <p className="font-bold text-emerald-600">{record.volume}L</p>
                    </div>
                  )}
                </div>

                {/* Mostrar correcciones si existen */}
                {record.corrections && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-700 mb-2">Correcciones aplicadas (ml):</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div className="text-center p-2 bg-pink-50 rounded">
                        <p className="text-xs text-pink-700">pH-</p>
                        <p className="font-bold text-pink-600">{record.corrections.phMinus}</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-xs text-blue-700">pH+</p>
                        <p className="font-bold text-blue-600">{record.corrections.phPlus}</p>
                      </div>
                      <div className="text-center p-2 bg-emerald-50 rounded">
                        <p className="text-xs text-emerald-700">EC A</p>
                        <p className="font-bold text-emerald-600">{record.corrections.ecA}</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-green-700">EC B</p>
                        <p className="font-bold text-green-600">{record.corrections.ecB}</p>
                      </div>
                      <div className="text-center p-2 bg-cyan-50 rounded">
                        <p className="text-xs text-cyan-700">Agua</p>
                        <p className="font-bold text-cyan-600">{record.corrections.ecWater}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(record.description || record.notes) && (
                  <p className="text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                    {record.description || record.notes}
                  </p>
                )}

                {record.dosage && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-700">
                      Dosificación: A={record.dosage.a}ml, B={record.dosage.b}ml
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const ProTipsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Consejos Profesionales - PROTOCOLO 18L CORREGIDO</h2>
        <p className="text-slate-600">Secretos y mejores prácticas para cultivo con EC fija 1350-1500 µS/cm</p>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Consejos Específicos para Protocolo 18L Corregido</h3>
            <p className="text-slate-600">Técnicas probadas para maximizar tu producción con EC fija</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
            <h4 className="font-bold text-cyan-700 mb-3">💧 Manejo del Protocolo 18L Corregido</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="text-cyan-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Dosis CORREGIDA:</strong> 45ml A+B para 18L (2.5ml/L). El anterior cálculo de 63ml era incorrecto.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-cyan-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>EC constante:</strong> Simplifica enormemente el manejo. Mismo rango (1350-1500 µS/cm) para todas las variedades y etapas.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-cyan-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Sin CalMag:</strong> AQUA VEGA A/B para aguas blandas ya contiene Ca y Mg en proporción óptima. No añadir suplementos.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-cyan-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Ajuste EC corregido:</strong> +3,2ml de A y B por cada 0.1 mS/cm de diferencia (antes +9ml era incorrecto).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-cyan-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Rotación cada 12 días:</strong> Ciclo completo de 36 días garantiza producción continua.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
            <h4 className="font-bold text-emerald-700 mb-3">🌱 Ventajas del EC Fijo y Rotación 12 Días</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Simplicidad:</strong> No necesitas calcular diferentes EC para diferentes variedades o etapas.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Producción continua:</strong> Con rotación cada 12 días, siempre tendrás plantas en todas las etapas.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Mejor calidad:</strong> EC constante produce lechugas más uniformes y de mejor textura.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Ahorro de nutrientes:</strong> Con la dosis corregida (45ml vs 63ml) ahorrarás un 29% en nutrientes.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Planificación precisa:</strong> Sabes exactamente cuándo cosechar y cuándo añadir nuevas plantas.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-amber-700 mb-3">⚡ Solución de Problemas - Protocolo 18L Corregido</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <AlertTriangle className="text-amber-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>EC baja (&lt;1.3 mS/cm):</strong> Añadir +3,2ml de AQUA VEGA A y B por cada 0.1 mS/cm de diferencia. Mezclar, airear 5min, medir.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="text-amber-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>EC alta (&gt;1.6 mS/cm):</strong> Añadir 100-200ml de agua destilada. Mezclar, airear 5min, medir.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="text-amber-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>pH inestable:</strong> Normal con agua destilada. Mantener en rango 5.5-6.5.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="text-amber-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Plantas amarillas:</strong> Si usaste la dosis anterior (63ml), probablemente EC demasiado alta. Diluir con agua destilada.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="text-amber-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Crecimiento lento:</strong> Verificar temperatura agua (20°C ideal) y programa de riego (3 minutos por ciclo).</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <h4 className="font-bold text-purple-700 mb-3">⏰ Programa de Riego Optimizado - 3 minutos por ciclo</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Sprout className="text-purple-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>3 minutos garantizados:</strong> Tiempo suficiente para que los nutrientes lleguen a todas las raíces de la torre.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sprout className="text-purple-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Horario optimizado:</strong> 08:30-20:30 cada hora + 00:00, 03:00 y 05:30 para crecimiento continuo.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sprout className="text-purple-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Ajuste por temperatura:</strong> En verano aumentar a 3.5 minutos, en invierno reducir a 2.5 minutos.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sprout className="text-purple-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Control visual:</strong> Observa las raíces. Blancas = sanas, marrones = exceso de agua.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sprout className="text-purple-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Verificar humedad:</strong> La lana de roca debe estar húmeda pero no chorreando 1 hora después del riego.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-700 mb-3">🔧 Mantenimiento del Sistema - Protocolo 18L</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Medición diaria:</strong> 1 vez al día, por la mañana, con aireador apagado unos minutos.</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Rellenar solo agua destilada:</strong> Mantiene estabilidad. La EC bajará ligeramente, es normal.</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Cambio completo cada 2 semanas:</strong> Elimina acumulación de sales y mantiene sistema saludable.</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Rotación cada 12 días:</strong> Mantiene producción continua y optimiza espacio.</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Calibración mensual:</strong> Calibrar medidores con soluciones estándar para máxima precisión.</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt=1 flex-shrink-0" size={16} />
                <span><strong>Revisión semanal:</strong> Limpiar filtros, verificar bombas y conexiones.</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
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
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-emerald-300">
                {/* Reemplazamos el icono con la imagen personalizada */}
                <div className="relative w-9 h-9">
                  <Image
                    src="/mi-imagen.jpg"
                    alt="HydroCaru Logo"
                    fill
                    className="object-cover rounded-full"
                    priority
                  />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-slate-800">HydroCaru</h1>
                <p className="text-xs text-slate-600">EC fija 1350-1500 µS/cm | Sin CalMag | 45ml AQUA VEGA A+B | Rotación 12 días</p>
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
              {[
                {
                  key: "dashboard",
                  icon: <Home size={20} />,
                  activeColor: "from-blue-500 to-cyan-600",
                  inactiveColor: "from-blue-100 to-cyan-100",
                  colorName: "blue"
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
                  activeColor: "from-amber-500 to-orange-600",
                  inactiveColor: "from-amber-100 to-orange-100",
                  colorName: "amber"
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
                  activeColor: "from-rose-500 to-pink-600",
                  inactiveColor: "from-rose-100 to-pink-100",
                  colorName: "rose"
                },
                {
                  key: "proTips",
                  icon: <Brain size={20} />,
                  activeColor: "from-violet-500 to-purple-600",
                  inactiveColor: "from-violet-100 to-purple-100",
                  colorName: "violet"
                },
              ].map((item) => (
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
            {tab === "dashboard" && <DashboardTab />}
            {tab === "tower" && <TowerTab />}
            {tab === "calculator" && <CalculatorTab />}
            {tab === "measurements" && <MeasurementsTab />}
            {tab === "irrigation" && <IrrigationTab />}
            {tab === "calendar" && <CalendarTab />}
            {tab === "history" && <HistoryTab />}
            {tab === "proTips" && <ProTipsTab />}
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

      {showWaterSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Configuración de Agua</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWaterSelector(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                {WATER_TYPES["osmosis"].icon}
                <span className="font-bold text-slate-800">AGUA DESTILADA</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{WATER_TYPES["osmosis"].description}</p>
              <p className="text-xs text-blue-600 font-bold">
                ✅ Sistema configurado para uso exclusivo de agua destilada
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Protocolo 18L: 45ml AQUA VEGA A+B (CORREGIDO)
              </p>
            </div>

            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                <strong>Nota:</strong> Este sistema está configurado específicamente para:
                <br />• 18 litros de agua destilada
                <br />• AQUA VEGA A y B para aguas blandas
                <br />• EC fija: 1350-1500 µS/cm
                <br />• <strong>Protocolo corregido:</strong> 45ml A+B (antes 63ml era incorrecto)
                <br />• <strong>NO se requiere CalMag</strong>
                <br />• <strong>Rotación cada 12 días</strong> - Ciclo 36 días
              </p>
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
