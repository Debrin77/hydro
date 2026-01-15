"use client"

import React, { useState, useEffect, useMemo } from "react"
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
  GaugeCircle, Droplets as WaterDroplets
} from "lucide-react"

// ============================================================================
// COMPONENTES UI SIMPLIFICADOS (para evitar errores de importación)
// ============================================================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, className = "", variant = "default", disabled = false }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
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

const Slider = ({ value, min, max, step, onValueChange, className = "" }) => {
  const handleChange = (e) => {
    onValueChange([parseFloat(e.target.value)])
  }
  
  return (
    <div className={`w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}

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
    calmagRequired: true,
    isOsmosis: true
  },
  "bajo_mineral": {
    name: "Baja Mineralización",
    icon: <Droplets className="text-cyan-500" />,
    ecBase: 200,
    hardness: 50,
    phBase: 7.2,
    description: "Agua blanda, ideal para AQUA VEGA.",
    recommendation: "Ajuste mínimo de pH necesario.",
    calmagRequired: false,
    isOsmosis: false
  },
  "medio_mineral": {
    name: "Media Mineralización",
    icon: <Droplets className="text-teal-500" />,
    ecBase: 400,
    hardness: 150,
    phBase: 7.5,
    description: "Agua de grifo típica.",
    recommendation: "Considerar dureza al mezclar.",
    calmagRequired: false,
    isOsmosis: false
  },
  "alta_mineral": {
    name: "Alta Mineralización",
    icon: <Droplets className="text-amber-500" />,
    ecBase: 800,
    hardness: 300,
    phBase: 8.0,
    description: "Agua dura, alta en calcio/magnesio.",
    recommendation: "No recomendada para AQUA VEGA de agua blanda.",
    calmagRequired: false,
    isOsmosis: false
  }
};

// Configuración de CalMag
const CALMAG_CONFIG = {
  minRequiredHardness: 100,
  dosagePerLiter: 1.0,
  calciumPercent: 5.0,
  magnesiumPercent: 1.5,
  maxDosage: 5,
};

// Variedades (6 variedades)
const VARIETIES = {
  "Iceberg": { 
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    textColor: "text-cyan-700",
    ecMax: 1600,
    phIdeal: 6.0,
    aquaVegaDosage: {
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
    aquaVegaDosage: {
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
    aquaVegaDosage: {
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
    aquaVegaDosage: {
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
    aquaVegaDosage: {
      seedling: { a: 18, b: 18, ec: 1000 },
      growth:   { a: 22, b: 22, ec: 1500 },
      mature:   { a: 28, b: 28, ec: 1800 }
    },
    info: "Crecimiento rápido, tolera EC alta."
  },
  "Romana": { 
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
    textColor: "text-blue-700",
    ecMax: 1750,
    phIdeal: 6.0,
    aquaVegaDosage: {
      seedling: { a: 18, b: 18, ec: 950 },
      growth:   { a: 22, b: 22, ec: 1350 },
      mature:   { a: 28, b: 28, ec: 1650 }
    },
    info: "Variedad robusta con hojas crujientes."
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO
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
 * Método 1: Cálculo EC escalonado por niveles
 */
const calculateStagedEC = (plants, waterType) => {
  if (plants.length === 0) return { targetEC: "1200", method: "estándar" };
  
  const levels = {
    1: { plants: 0, totalEC: 0 },
    2: { plants: 0, totalEC: 0 },
    3: { plants: 0, totalEC: 0 }
  };
  
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    levels[plant.l].plants += 1;
    levels[plant.l].totalEC += variety.aquaVegaDosage[stage].ec;
  });
  
  let weightedEC = 0;
  let totalPlants = 0;
  
  Object.keys(levels).forEach(level => {
    if (levels[level].plants > 0) {
      const avgEC = levels[level].totalEC / levels[level].plants;
      const weight = level === "1" ? 0.7 : level === "2" ? 0.9 : 1.1;
      weightedEC += avgEC * levels[level].plants * weight;
      totalPlants += levels[level].plants;
    }
  });
  
  let finalEC = weightedEC / totalPlants;
  
  const waterConfig = WATER_TYPES[waterType];
  if (waterConfig && waterType !== "osmosis") {
    finalEC = Math.max(0, finalEC - waterConfig.ecBase);
  }
  
  return {
    targetEC: Math.round(finalEC).toString(),
    method: "escalonado",
    levels: {
      level1: levels[1].plants > 0 ? Math.round(levels[1].totalEC / levels[1].plants) : 0,
      level2: levels[2].plants > 0 ? Math.round(levels[2].totalEC / levels[2].plants) : 0,
      level3: levels[3].plants > 0 ? Math.round(levels[3].totalEC / levels[3].plants) : 0
    }
  };
};

/**
 * Método 2: Cálculo EC promedio simple
 */
const calculateAverageEC = (plants, waterType) => {
  if (plants.length === 0) return { targetEC: "1200", method: "promedio" };
  
  let totalEC = 0;
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    totalEC += variety.aquaVegaDosage[stage].ec;
  });
  
  let finalEC = totalEC / plants.length;
  
  const waterConfig = WATER_TYPES[waterType];
  if (waterConfig && waterType !== "osmosis") {
    finalEC = Math.max(0, finalEC - waterConfig.ecBase);
  }
  
  return {
    targetEC: Math.round(finalEC).toString(),
    method: "promedio"
  };
};

/**
 * Método 3: Cálculo EC conservador (mínimo de las plantas)
 */
const calculateConservativeEC = (plants, waterType) => {
  if (plants.length === 0) return { targetEC: "1200", method: "conservador" };
  
  const minEC = Math.min(...plants.map(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return 1900;
    
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    return variety.aquaVegaDosage[stage].ec;
  }));
  
  let finalEC = minEC;
  
  const waterConfig = WATER_TYPES[waterType];
  if (waterConfig && waterType !== "osmosis") {
    finalEC = Math.max(0, finalEC - waterConfig.ecBase);
  }
  
  return {
    targetEC: Math.round(finalEC).toString(),
    method: "conservador"
  };
};

/**
 * Cálculo EC inteligente (selecciona el mejor método)
 */
const calculateSmartEC = (plants, waterType) => {
  const methods = {
    escalonado: calculateStagedEC(plants, waterType),
    promedio: calculateAverageEC(plants, waterType),
    conservador: calculateConservativeEC(plants, waterType)
  };
  
  const stats = calculatePlantStats(plants);
  
  let selectedMethod = "promedio";
  
  if (stats.matureCount > stats.growthCount && stats.matureCount > stats.seedlingCount) {
    selectedMethod = "escalonado";
  } else if (stats.seedlingCount > stats.matureCount * 1.5) {
    selectedMethod = "conservador";
  } else if (stats.growthCount > 0 && stats.matureCount > 0 && stats.seedlingCount > 0) {
    selectedMethod = "escalonado";
  }
  
  return {
    ...methods[selectedMethod],
    allMethods: methods
  };
};

/**
 * Calcula características del agua
 */
const getWaterCharacteristics = (waterType, osmosisMix = 0) => {
  const baseWater = WATER_TYPES[waterType] || WATER_TYPES.bajo_mineral;
  const osmosisWater = WATER_TYPES.osmosis;
  
  if (waterType === "osmosis") {
    return {
      ...baseWater,
      finalHardness: 0,
      finalECBase: 0,
      finalPhBase: 7.0,
      calmagRequired: true,
      isOsmosis: true
    };
  }
  
  if (osmosisMix === 0) {
    return {
      ...baseWater,
      finalHardness: baseWater.hardness,
      finalECBase: baseWater.ecBase,
      finalPhBase: baseWater.phBase,
      calmagRequired: baseWater.calmagRequired,
      isOsmosis: false
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
    calmagRequired,
    isOsmosis: osmosisMix > 50
  };
};

/**
 * Calcula necesidad de CalMag
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
  
  const hardnessDeficit = CALMAG_CONFIG.minRequiredHardness - waterChar.finalHardness;
  const dosagePerLiter = CALMAG_CONFIG.dosagePerLiter * (hardnessDeficit / CALMAG_CONFIG.minRequiredHardness);
  const totalDosage = Math.min(dosagePerLiter * volume, CALMAG_CONFIG.maxDosage * volume);
  
  let reason = "Agua muy blanda. Necesario para prevenir deficiencias.";
  if (waterChar.isOsmosis) {
    reason = `Agua de ósmosis (${Math.round(waterChar.finalHardness)} ppm). OBLIGATORIO para prevenir deficiencias de Ca/Mg.`;
  } else if (waterChar.finalHardness < 50) {
    reason = `Agua muy blanda (${Math.round(waterChar.finalHardness)} ppm). Recomendado para estabilidad.`;
  }
  
  return {
    required: true,
    dosage: Math.round(totalDosage * 10) / 10,
    reason: reason,
    instructions: "Añadir CalMag ANTES de los nutrientes principales. Mezclar bien 2-3 minutos.",
    critical: waterChar.isOsmosis
  };
};

/**
 * Calcula dosis AQUA VEGA
 */
const calculateAquaVegaDosage = (plants, totalVolume, targetEC, waterType = "bajo_mineral") => {
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
    
    const dosage = variety.aquaVegaDosage[stage];
    
    let plantContribution;
    if (waterType === "osmosis") {
      plantContribution = (dosage.a / 10) * (totalVolume / plants.length) * 1.2;
    } else {
      plantContribution = (dosage.a / 10) * (totalVolume / plants.length);
    }
    
    totalA += plantContribution;
    totalB += plantContribution;
  });
  
  let ecRatio = parseFloat(targetEC) / 1300;
  
  if (waterType === "osmosis") {
    ecRatio = parseFloat(targetEC) / 1400;
  } else if (usedWaterType.hardness > 150) {
    ecRatio *= 0.9;
  }
  
  totalA *= ecRatio;
  totalB *= ecRatio;
  
  let note = "";
  if (waterType === "osmosis") {
    note = "✅ DOSIS COMPLETA: Partiendo de EC 0. No restar EC base.";
  } else if (usedWaterType.hardness > 150) {
    note = "Dosis reducida por dureza del agua";
  } else {
    note = "Dosis para agua blanda";
  }
  
  return {
    a: Math.round(totalA),
    b: Math.round(totalB),
    per10L: {
      a: Math.round((totalA * 10) / totalVolume),
      b: Math.round((totalB * 10) / totalVolume)
    },
    note: note
  };
};

/**
 * Calcula ajuste de pH
 */
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

/**
 * Genera calendario de mantenimiento
 */
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
 * Calcula riego para torre vertical en Castellón
 */
const calculateIrrigation = (plants, temp, humidity, season) => {
  const pumpPower = 7; // 7W
  const rockwoolCubes = 2.5; // cm
  const castellonAltitude = 30; // metros sobre el mar
  
  let totalWaterNeeds = 0;
  let totalPlants = plants.length;
  
  plants.forEach(plant => {
    let waterPerPlant = 0.5; // litros/día base
    
    // Ajustar por nivel de crecimiento
    if (plant.l === 1) waterPerPlant *= 0.6; // Plántula
    else if (plant.l === 2) waterPerPlant *= 0.9; // Crecimiento
    else waterPerPlant *= 1.2; // Madura
    
    // Ajustar por variedad
    const variety = VARIETIES[plant.v];
    if (variety) {
      if (plant.v === "Iceberg") waterPerPlant *= 1.1;
      else if (plant.v === "Lollo Rosso") waterPerPlant *= 0.9;
      else if (plant.v === "Hoja de Roble Rojo") waterPerPlant *= 1.2;
    }
    
    totalWaterNeeds += waterPerPlant;
  });
  
  // Ajustar por temperatura y humedad de Castellón
  let tempFactor = 1.0;
  if (temp > 25) tempFactor = 1.3;
  else if (temp > 20) tempFactor = 1.1;
  else if (temp < 15) tempFactor = 0.8;
  
  let humidityFactor = 1.0;
  if (humidity < 40) humidityFactor = 1.2;
  else if (humidity > 70) humidityFactor = 0.9;
  
  // Ajustar por estación en Castellón
  let seasonFactor = 1.0;
  if (season === "summer") seasonFactor = 1.4;
  else if (season === "winter") seasonFactor = 0.7;
  
  totalWaterNeeds = totalWaterNeeds * tempFactor * humidityFactor * seasonFactor;
  
  // Calcular tiempo de riego (bomba de 7W, aprox 5L/h)
  const pumpFlowRate = 5; // litros por hora
  const dailyPumpMinutes = (totalWaterNeeds / pumpFlowRate) * 60;
  
  // Dividir en ciclos (cada 2 horas durante luz)
  const cyclesPerDay = 8;
  const minutesPerCycle = dailyPumpMinutes / cyclesPerDay;
  
  return {
    totalWaterNeeds: totalWaterNeeds.toFixed(1),
    pumpMinutesPerDay: dailyPumpMinutes.toFixed(0),
    cyclesPerDay,
    minutesPerCycle: minutesPerCycle.toFixed(1),
    pumpPower,
    rockwoolCubes,
    location: "Castellón de la Plana",
    recommendations: [
      `Regar ${cyclesPerDay} veces al día durante ${minutesPerCycle} minutos cada ciclo`,
      "Ajustar riego según humedad ambiente",
      "En verano aumentar frecuencia un 40%",
      "Los dados de lana de roca de 2.5cm retienen bien la humedad"
    ]
  };
};

// ============================================================================
// COMPONENTES REUTILIZABLES
// ============================================================================

const StagedECCalculator = ({ plants, waterType, onECCalculated }) => {
  const ecMethods = calculateSmartEC(plants, waterType);
  
  useEffect(() => {
    if (onECCalculated) {
      onECCalculated(ecMethods.targetEC);
    }
  }, [ecMethods.targetEC, onECCalculated]);
  
  return (
    <Card className="p-6 rounded-2xl mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Calculator className="text-white" size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-xl">Cálculo EC Escalonado Inteligente</h2>
          <p className="text-slate-600">3 métodos de cálculo según distribución de plantas</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200">
          <h4 className="font-bold text-blue-700 mb-2">Método Seleccionado</h4>
          <div className="text-3xl font-bold text-blue-600 mb-2">{ecMethods.targetEC} µS/cm</div>
          <Badge className="bg-blue-100 text-blue-800">{ecMethods.method}</Badge>
        </div>
        
        <div className="p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
          <h4 className="font-bold text-green-700 mb-2">Distribución</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-700">Nivel 1:</span>
              <span className="font-bold text-cyan-600">{calculatePlantStats(plants).seedlingCount} plantas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Nivel 2:</span>
              <span className="font-bold text-green-600">{calculatePlantStats(plants).growthCount} plantas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Nivel 3:</span>
              <span className="font-bold text-emerald-600">{calculatePlantStats(plants).matureCount} plantas</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-b from-purple-50 to-white rounded-xl border-2 border-purple-200">
          <h4 className="font-bold text-purple-700 mb-2">EC por Nivel</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-700">Plántulas:</span>
              <span className="font-bold text-slate-800">{ecMethods.levels?.level1 || "0"} µS/cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Crecimiento:</span>
              <span className="font-bold text-slate-800">{ecMethods.levels?.level2 || "0"} µS/cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Maduras:</span>
              <span className="font-bold text-slate-800">{ecMethods.levels?.level3 || "0"} µS/cm</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold text-blue-700 mb-3">Comparación de Métodos</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg ${ecMethods.method === "escalonado" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200'}`}>
            <p className="font-bold text-slate-800">Escalonado</p>
            <p className="text-sm text-slate-600">Peso por nivel de desarrollo</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{ecMethods.allMethods?.escalonado?.targetEC || "1200"} µS/cm</p>
          </div>
          
          <div className={`p-3 rounded-lg ${ecMethods.method === "promedio" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200'}`}>
            <p className="font-bold text-slate-800">Promedio</p>
            <p className="text-sm text-slate-600">Media aritmética simple</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{ecMethods.allMethods?.promedio?.targetEC || "1200"} µS/cm</p>
          </div>
          
          <div className={`p-3 rounded-lg ${ecMethods.method === "conservador" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200'}`}>
            <p className="font-bold text-slate-800">Conservador</p>
            <p className="text-sm text-slate-600">Mínimo de las plantas</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{ecMethods.allMethods?.conservador?.targetEC || "1200"} µS/cm</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const OsmosisDiagnosisPanel = ({ waterType, osmosisMix, calmagNeeded, volume, aquaVegaDosage }) => {
  const isOsmosis = waterType === "osmosis" || osmosisMix > 50;
  
  if (!isOsmosis) return null;
  
  const osmosisProtocol = {
    steps: [
      { 
        step: 1, 
        action: "Llenar con agua de ósmosis", 
        details: `Preparar ${volume}L de agua pura de ósmosis`,
        icon: "💧"
      },
      { 
        step: 2, 
        action: "Añadir CalMag", 
        details: `Agregar ${calmagNeeded.dosage}ml de CalMag (obligatorio para ósmosis)`,
        critical: true,
        reason: "Agua muy blanda (0 ppm). Necesario para prevenir deficiencias de Ca/Mg",
        icon: "🧪"
      },
      { 
        step: 3, 
        action: "Mezclar", 
        details: "Mezclar bien durante 2-3 minutos",
        icon: "🔄"
      },
      { 
        step: 4, 
        action: "Añadir AQUA VEGA A", 
        details: `Agregar ${aquaVegaDosage.a}ml de AQUA VEGA A`,
        icon: "⚗️"
      },
      { 
        step: 5, 
        action: "Mezclar", 
        details: "Mezclar durante 1 minuto",
        icon: "🔄"
      },
      { 
        step: 6, 
        action: "Añadir AQUA VEGA B", 
        details: `Agregar ${aquaVegaDosage.b}ml de AQUA VEGA B`,
        icon: "⚗️"
      },
      { 
        step: 7, 
        action: "Mezclar", 
        details: "Mezclar durante 2 minutos",
        icon: "🔄"
      },
      { 
        step: 8, 
        action: "Medir EC", 
        details: "Verificar EC. Objetivo: 1200-1800 µS/cm según plantas",
        icon: "📊"
      },
      { 
        step: 9, 
        action: "Ajustar pH", 
        details: "Ajustar pH a 6.0",
        note: "El agua de ósmosis tiene bajo poder tampón - ajustar cuidadosamente",
        icon: "⚖️"
      }
    ]
  };
  
  return (
    <Card className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <Filter className="text-white" size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-xl">DIAGNÓSTICO PARA ÓSMOSIS</h2>
          <p className="text-slate-600">Protocolo especial para agua de ósmosis inversa</p>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-white rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-700 mb-3">1. ✅ Detección Automática</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0 µS/cm</div>
            <p className="text-sm text-blue-700">EC base</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0 ppm</div>
            <p className="text-sm text-blue-700">Dureza</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">7.0</div>
            <p className="text-sm text-blue-700">pH base</p>
          </div>
        </div>
      </div>
      
      {calmagNeeded.required && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
          <h3 className="font-bold text-amber-700 mb-3">2. ✅ CALMAG OBLIGATORIO</h3>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-amber-800">SE REQUIERE CALMAG</p>
              <p className="text-sm text-amber-700">{calmagNeeded.reason}</p>
            </div>
            <div className="text-3xl font-bold text-amber-600">{calmagNeeded.dosage}ml</div>
          </div>
          <p className="text-sm font-bold text-amber-900">
            INSTRUCCIÓN CRÍTICA: "Añadir CalMag ANTES de los nutrientes AQUA VEGA"
          </p>
        </div>
      )}
      
      <div className="mb-6 p-4 bg-white rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-700 mb-3">3. 📋 Protocolo Especial para Ósmosis</h3>
        <div className="space-y-3">
          {osmosisProtocol.steps.map((step) => (
            <div key={step.step} className={`flex items-start gap-3 p-3 rounded-lg ${step.critical ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.critical ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {step.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{step.icon}</span>
                  <p className="font-bold text-slate-800">{step.action}</p>
                </div>
                <p className="text-sm text-slate-600 mt-1">{step.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
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
    waterNotes: "",
    calculationMethod: "escalonado"
  });
  
  // Configuración de mediciones manuales
  const [measurements, setMeasurements] = useState({
    manualPH: "6.0",
    manualEC: "1200",
    manualTemp: "22",
    manualHumidity: "65",
    lastMeasurement: new Date().toISOString()
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
        setMeasurements(data.measurements || measurements);
        
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
        localStorage.setItem("hydro_caru_app", 
          JSON.stringify({ 
            plants, 
            config, 
            history, 
            lastRot, 
            lastClean,
            measurements 
          }));
      } catch (error) {
        console.error("Error guardando:", error);
      }
    }
  }, [plants, config, history, lastRot, lastClean, measurements, step]);

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

  const handleECCalculated = (ec) => {
    setConfig(prev => ({ ...prev, targetEC: ec }));
  };

  const saveManualMeasurement = () => {
    const now = new Date().toISOString();
    setHistory([{
      id: generatePlantId(),
      date: now,
      ph: measurements.manualPH,
      ec: measurements.manualEC,
      temp: measurements.manualTemp,
      humidity: measurements.manualHumidity,
      notes: "Medición manual"
    }, ...history]);
    
    setMeasurements(prev => ({
      ...prev,
      lastMeasurement: now
    }));
    
    alert("✅ Medición guardada en historial");
  };

  // =================== CÁLCULOS ===================

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

  const aquaVegaDosage = useMemo(() => {
    return calculateAquaVegaDosage(
      plants,
      parseFloat(config.currentVol),
      parseFloat(config.targetEC),
      config.waterType
    );
  }, [plants, config.currentVol, config.targetEC, config.waterType]);

  const phAdjustment = useMemo(() => {
    return calculatePHAdjustment(
      parseFloat(config.ph),
      parseFloat(config.targetPH),
      config.waterType,
      parseFloat(config.currentVol)
    );
  }, [config.ph, config.targetPH, config.waterType, config.currentVol]);

  const plantStats = useMemo(() => {
    return calculatePlantStats(plants);
  }, [plants]);

  const calendarDays = useMemo(() => {
    return generateCalendar(plants, lastRot, lastClean);
  }, [plants, lastRot, lastClean]);

  const season = useMemo(() => {
    return getSeason();
  }, []);

  const irrigationData = useMemo(() => {
    return calculateIrrigation(
      plants,
      parseFloat(measurements.manualTemp),
      parseFloat(measurements.manualHumidity),
      season
    );
  }, [plants, measurements.manualTemp, measurements.manualHumidity, season]);

  // =================== ALERTAS ===================

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

    // Alerta para agua de ósmosis
    if (waterType === "osmosis") {
      res.push({ 
        title: "AGUA DE ÓSMOSIS DETECTADA", 
        value: "Protocolo especial", 
        description: "Activado diagnóstico completo para ósmosis inversa", 
        color: "bg-gradient-to-r from-blue-700 to-cyan-800",
        icon: <Filter className="text-white" size={28} />,
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
        icon: <Waves className="text-white" size={28} />,
        priority: 2
      });
    }

    // Alertas existentes
    if (vAct < vTot * 0.3) {
      res.push({ 
        title: "¡AGUA MUY BAJA!", 
        value: `${(vTot - vAct).toFixed(1)}L`, 
        description: `Crítico: Solo queda un ${(vAct/vTot*100).toFixed(0)}%`, 
        color: "bg-gradient-to-r from-red-600 to-rose-700",
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
        color: "bg-gradient-to-r from-red-700 to-pink-800",
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

    if (ph > tPh + 0.5 || ph < tPh - 0.5) {
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
      const mlPerLiter = aquaVegaDosage.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.5;
      res.push({ 
        title: "¡FALTAN NUTRIENTES!", 
        value: `${Math.round(mlToAdd)}ml A+B`, 
        description: `EC ${ec} µS/cm (muy baja). Añadir AQUA VEGA.`, 
        color: "bg-gradient-to-r from-blue-800 to-cyan-800",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec < tEc - 200 && ec > 0) {
      const mlPerLiter = aquaVegaDosage.per10L.a / 10;
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
  }, [config, lastClean, plants, calmagNeeded, phAdjustment, aquaVegaDosage]);

  // =================== RENDER POR PASOS ===================

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
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
              HydroCaru
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg mx-auto">
              Sistema experto para cultivo hidropónico con cálculo EC escalonado inteligente
            </p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Calculator className="text-emerald-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Cálculo EC Escalonado</h3>
                  <p className="text-sm text-slate-600">3 métodos según distribución de plantas</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Filter className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Detección Automática Ósmosis</h3>
                  <p className="text-sm text-slate-600">Protocolo especial para agua pura</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TreePine className="text-purple-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">6 Variedades de Lechuga</h3>
                  <p className="text-sm text-slate-600">Parámetros específicos por variedad</p>
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
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Filter className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Tipo de Agua</h3>
                    <p className="text-sm text-slate-600">Selecciona el agua que usas</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                  if (plants.length === 0) {
                    alert("Debes añadir al menos una planta para continuar");
                    return;
                  }
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-600">Sistema hidropónico con cálculo EC escalonado</p>
        </div>
        
        <div className="flex items-center gap-3">
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
        </div>
      </div>
      
      {/* Panel de diagnóstico de ósmosis */}
      <OsmosisDiagnosisPanel 
        waterType={config.waterType}
        osmosisMix={config.useOsmosisMix ? config.osmosisMixPercentage : 0}
        calmagNeeded={calmagNeeded}
        volume={parseFloat(config.currentVol)}
        aquaVegaDosage={aquaVegaDosage}
      />
      
      {/* Cálculo EC escalonado */}
      <StagedECCalculator 
        plants={plants}
        waterType={config.waterType}
        onECCalculated={handleECCalculated}
      />
      
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
              <span className="font-bold text-cyan-600">{plantStats.seedlingCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Crecimiento (N2)</span>
              <span className="font-bold text-green-600">{plantStats.growthCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Maduras (N3)</span>
              <span className="font-bold text-emerald-600">{plantStats.matureCount}/5</span>
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
              <h3 className="font-bold text-slate-800">Nutrición AQUA VEGA</h3>
              <p className="text-sm text-slate-600">AQUA VEGA A+B</p>
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
                <span className="text-slate-700">AQUA VEGA A</span>
                <span className="font-bold text-emerald-600">{aquaVegaDosage.a} ml</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">AQUA VEGA B</span>
                <span className="font-bold text-emerald-600">{aquaVegaDosage.b} ml</span>
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
          onClick={saveManualMeasurement}
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
          <Calculator className="mr-2" />
          Calculadora
        </Button>
      </div>
    </div>
  );

  const MeasurementsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mediciones Manuales</h2>
        <p className="text-slate-600">Introduce y verifica los parámetros medidos</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">pH Medido</h3>
              <p className="text-sm text-slate-600">Rango ideal: 5.5 - 6.5</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Valor de pH: 
                </label>
                <input
                  type="number"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={measurements.manualPH}
                  onChange={(e) => setMeasurements({...measurements, manualPH: e.target.value})}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-purple-600"
                />
              </div>
              
              <input
                type="range"
                min="4.0"
                max="9.0"
                step="0.1"
                value={measurements.manualPH}
                onChange={(e) => setMeasurements({...measurements, manualPH: e.target.value})}
                className="w-full h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>4.0</span>
                <span className="font-bold text-green-600">5.5-6.5</span>
                <span>9.0</span>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Estado:</span>
                  <Badge className={
                    parseFloat(measurements.manualPH) >= 5.5 && parseFloat(measurements.manualPH) <= 6.5 
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }>
                    {parseFloat(measurements.manualPH) >= 5.5 && parseFloat(measurements.manualPH) <= 6.5 
                      ? "DENTRO DE RANGO"
                      : "FUERA DE RANGO"}
                  </Badge>
                </div>
                {parseFloat(measurements.manualPH) > 6.5 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ pH demasiado alto. Añadir {phAdjustment.phMinus}ml de pH-
                  </p>
                )}
                {parseFloat(measurements.manualPH) < 5.5 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ pH demasiado bajo. Añadir {phAdjustment.phPlus}ml de pH+
                  </p>
                )}
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
              <h3 className="font-bold text-slate-800">EC Medida</h3>
              <p className="text-sm text-slate-600">Nivel de nutrientes en µS/cm</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Valor de EC: 
                </label>
                <input
                  type="number"
                  min="0"
                  max="3000"
                  step="50"
                  value={measurements.manualEC}
                  onChange={(e) => setMeasurements({...measurements, manualEC: e.target.value})}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-blue-600"
                />
              </div>
              
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={measurements.manualEC}
                onChange={(e) => setMeasurements({...measurements, manualEC: e.target.value})}
                className="w-full h-2 bg-gradient-to-r from-blue-300 via-green-300 to-red-300 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>0</span>
                <span className="font-bold text-green-600">800-1800</span>
                <span>3000</span>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Estado:</span>
                  <Badge className={
                    parseFloat(measurements.manualEC) >= 800 && parseFloat(measurements.manualEC) <= 1800 
                      ? "bg-green-100 text-green-800"
                      : parseFloat(measurements.manualEC) > 1800
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }>
                    {parseFloat(measurements.manualEC) > 1800 ? "DEMASIADO ALTA" :
                     parseFloat(measurements.manualEC) < 800 ? "DEMASIADO BAJA" :
                     "DENTRO DE RANGO"}
                  </Badge>
                </div>
                {parseFloat(measurements.manualEC) > 1800 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ EC demasiado alta. Diluir con {(parseFloat(measurements.manualEC) - 1800) / 1800 * parseFloat(config.currentVol)}L de agua
                  </p>
                )}
                {parseFloat(measurements.manualEC) < 800 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ EC demasiado baja. Añadir más nutrientes AQUA VEGA
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Thermometer className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Temperatura Ambiente</h3>
              <p className="text-sm text-slate-600">Castellón de la Plana</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Temperatura (°C): 
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={measurements.manualTemp}
                  onChange={(e) => setMeasurements({...measurements, manualTemp: e.target.value})}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-amber-600"
                />
              </div>
              
              <input
                type="range"
                min="0"
                max="40"
                step="0.5"
                value={measurements.manualTemp}
                onChange={(e) => setMeasurements({...measurements, manualTemp: e.target.value})}
                className="w-full h-2 bg-gradient-to-r from-blue-300 via-green-300 to-red-300 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>0°</span>
                <span className="font-bold text-green-600">18-25°</span>
                <span>40°</span>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Estado:</span>
                  <Badge className={
                    parseFloat(measurements.manualTemp) >= 18 && parseFloat(measurements.manualTemp) <= 25
                      ? "bg-green-100 text-green-800"
                      : parseFloat(measurements.manualTemp) > 25
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }>
                    {parseFloat(measurements.manualTemp) > 25 ? "DEMASIADO CALIENTE" :
                     parseFloat(measurements.manualTemp) < 18 ? "DEMASIADO FRÍO" :
                     "ÓPTIMA"}
                  </Badge>
                </div>
                {parseFloat(measurements.manualTemp) > 25 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Temperatura alta. Riesgo de bajo oxígeno. Considera añadir hielo en botella.
                  </p>
                )}
                {parseFloat(measurements.manualTemp) < 18 && (
                  <p className="text-sm text-blue-600 mt-2">
                    ⚠️ Temperatura baja. Crecimiento más lento.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Humedad Ambiente</h3>
              <p className="text-sm text-slate-600">Para cálculo de riego</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Humedad (%): 
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={measurements.manualHumidity}
                  onChange={(e) => setMeasurements({...measurements, manualHumidity: e.target.value})}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-cyan-600"
                />
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={measurements.manualHumidity}
                onChange={(e) => setMeasurements({...measurements, manualHumidity: e.target.value})}
                className="w-full h-2 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>0%</span>
                <span className="font-bold text-green-600">40-70%</span>
                <span>100%</span>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Estado:</span>
                  <Badge className={
                    parseFloat(measurements.manualHumidity) >= 40 && parseFloat(measurements.manualHumidity) <= 70
                      ? "bg-green-100 text-green-800"
                      : parseFloat(measurements.manualHumidity) > 70
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }>
                    {parseFloat(measurements.manualHumidity) > 70 ? "ALTA" :
                     parseFloat(measurements.manualHumidity) < 40 ? "BAJA" :
                     "ÓPTIMA"}
                  </Badge>
                </div>
                {parseFloat(measurements.manualHumidity) < 40 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Humedad baja. Aumenta frecuencia de riego en un 20%.
                  </p>
                )}
                {parseFloat(measurements.manualHumidity) > 70 && (
                  <p className="text-sm text-blue-600 mt-2">
                    ⚠️ Humedad alta. Reduce frecuencia de riego en un 10%.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button
          onClick={() => setTab("dashboard")}
          variant="outline"
        >
          <ArrowLeft className="mr-2" />
          Volver al Panel
        </Button>
        
        <Button
          onClick={saveManualMeasurement}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
        >
          <Clipboard className="mr-2" />
          Guardar Medición
        </Button>
      </div>
    </div>
  );

  const CalculatorTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Calculadora Completa</h2>
        <p className="text-slate-600">Cálculos exactos para tu sistema hidropónico</p>
      </div>
      
      {/* Cálculo EC escalonado */}
      <StagedECCalculator 
        plants={plants}
        waterType={config.waterType}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cálculo AQUA VEGA */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Dosis AQUA VEGA</h3>
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
                      <div className="text-3xl font-bold text-emerald-600">{aquaVegaDosage.a}</div>
                      <p className="text-sm text-emerald-700">ml AQUA VEGA A</p>
                    </div>
                    <div className="text-2xl text-emerald-500">+</div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">{aquaVegaDosage.b}</div>
                      <p className="text-sm text-emerald-700">ml AQUA VEGA B</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-center text-sm text-slate-700">
                    Equivalente a <span className="font-bold text-emerald-600">{aquaVegaDosage.per10L.a}ml A</span> y 
                    <span className="font-bold text-emerald-600"> {aquaVegaDosage.per10L.b}ml B</span> por cada 10L
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
                  {calmagNeeded.required && (
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                      <span>Añadir <strong>{calmagNeeded.dosage}ml de CalMag</strong>, mezclar 2-3 minutos</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{calmagNeeded.required ? "3" : "2"}</span>
                    <span>Añadir <strong>{aquaVegaDosage.a}ml de AQUA VEGA A</strong>, mezclar 1 minuto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{calmagNeeded.required ? "4" : "3"}</span>
                    <span>Añadir <strong>{aquaVegaDosage.b}ml de AQUA VEGA B</strong>, mezclar 2 minutos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{calmagNeeded.required ? "5" : "4"}</span>
                    <span>Medir EC: objetivo <strong>{config.targetEC} µS/cm</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{calmagNeeded.required ? "6" : "5"}</span>
                    <span>Ajustar pH a <strong>{config.targetPH}</strong></span>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FlaskConical className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">Añade plantas a la torre para calcular dosis</p>
            </div>
          )}
        </Card>
        
        {/* Cálculo pH y CalMag */}
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
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Waves className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Calculadora de CalMag</h3>
                <p className="text-sm text-slate-600">Para agua de ósmosis y mezclas</p>
              </div>
            </div>
            
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
          </Card>
        </div>
      </div>
    </div>
  );

  const TowerTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Gestión de la Torre</h2>
        <p className="text-slate-600">Sistema escalonado 5-5-5</p>
      </div>
      
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
                    <span className="text-white text-xs font-bold">{plant.p}</span>
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
                    <span className="text-white text-xs font-bold">{plant.p}</span>
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
                    <span className="text-white text-xs font-bold">{plant.p}</span>
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
            setSelPos({ l: 1, v: "Iceberg", p: 1 });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Plus className="mr-2" />
          Añadir Planta
        </Button>
      </div>
    </div>
  );

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
        </Card>
      </div>
    );
  };

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
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Humedad</span>
                      <span className="font-bold text-cyan-600">{record.humidity || "65"}%</span>
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

  const IrrigationTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cálculo de Riego</h2>
        <p className="text-slate-600">Torre vertical hidropónica en Castellón de la Plana</p>
      </div>
      
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <WaterDroplets className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Configuración del Sistema</h3>
            <p className="text-sm text-slate-600">Bomba de 7W • Dados de lana de roca 2.5cm</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-700 mb-3">💧 Bomba de Agua</h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{irrigationData.pumpPower}W</div>
              <p className="text-sm text-slate-600">Potencia de la bomba</p>
              <p className="text-xs text-slate-500 mt-2">Aprox. 5L/hora de caudal</p>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
            <h4 className="font-bold text-emerald-700 mb-3">🌱 Dados de Lana de Roca</h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{irrigationData.rockwoolCubes}cm</div>
              <p className="text-sm text-slate-600">Tamaño de los dados</p>
              <p className="text-xs text-slate-500 mt-2">Retienen humedad eficientemente</p>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-amber-700 mb-3">📍 Ubicación</h4>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">Castellón</div>
              <p className="text-sm text-slate-600">de la Plana</p>
              <p className="text-xs text-slate-500 mt-2">Clima mediterráneo</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border-2 border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 text-center">📊 Necesidades de Riego Diarias</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="font-bold text-blue-700 mb-4">Agua Requerida</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Total diario:</span>
                  <span className="text-2xl font-bold text-blue-600">{irrigationData.totalWaterNeeds} L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Por planta:</span>
                  <span className="font-bold text-slate-800">
                    {(parseFloat(irrigationData.totalWaterNeeds) / plants.length || 0).toFixed(2)} L
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Tiempo bomba:</span>
                  <span className="font-bold text-amber-600">{irrigationData.pumpMinutesPerDay} min/día</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="font-bold text-emerald-700 mb-4">Programación de Ciclos</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Ciclos por día:</span>
                  <span className="text-2xl font-bold text-emerald-600">{irrigationData.cyclesPerDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Minutos por ciclo:</span>
                  <span className="font-bold text-slate-800">{irrigationData.minutesPerCycle} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Frecuencia:</span>
                  <span className="font-bold text-blue-600">Cada 2 horas (luz)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200">
          <h3 className="font-bold text-cyan-800 mb-4">📋 Recomendaciones de Riego</h3>
          <div className="space-y-3">
            {irrigationData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-slate-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
          <h3 className="font-bold text-amber-800 mb-4">🌡️ Factores Climáticos Aplicados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Temperatura:</span>
                <span className="font-bold text-amber-600">{measurements.manualTemp}°C</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {parseFloat(measurements.manualTemp) > 25 ? "Aumenta riego +30%" :
                 parseFloat(measurements.manualTemp) > 20 ? "Aumenta riego +10%" :
                 parseFloat(measurements.manualTemp) < 15 ? "Reduce riego -20%" :
                 "Condición normal"}
              </p>
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Humedad:</span>
                <span className="font-bold text-cyan-600">{measurements.manualHumidity}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {parseFloat(measurements.manualHumidity) < 40 ? "Aumenta riego +20%" :
                 parseFloat(measurements.manualHumidity) > 70 ? "Reduce riego -10%" :
                 "Condición ideal"}
              </p>
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Estación:</span>
                <span className="font-bold text-emerald-600">
                  {season === "summer" ? "Verano" :
                   season === "winter" ? "Invierno" :
                   "Primavera/Otoño"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {season === "summer" ? "Aumenta riego +40%" :
                 season === "winter" ? "Reduce riego -30%" :
                 "Condición normal"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const TipsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Consejos y Mejores Prácticas</h2>
        <p className="text-slate-600">Aprende a optimizar tu sistema hidropónico</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Calculator className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Cálculo EC Escalonado</h3>
              <p className="text-sm text-slate-600">3 métodos inteligentes</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Método escalonado:</strong> Da más peso a plantas maduras. Ideal cuando hay plantas en diferentes etapas.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Método promedio:</strong> Simple y efectivo cuando todas las plantas están en etapas similares.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Método conservador:</strong> Usa el EC más bajo. Ideal para plántulas o plantas sensibles.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Filter className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Agua de Ósmosis</h3>
              <p className="text-sm text-slate-600">Protocolo especial</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>CalMag obligatorio:</strong> El agua de ósmosis no tiene calcio ni magnesio. Añadir siempre antes de los nutrientes.
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>pH inestable:</strong> El agua pura tiene bajo poder tampón. Monitorizar pH cada 12 horas.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Ventaja:</strong> Base perfectamente conocida (EC 0). Control total sobre los nutrientes.
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
              <h3 className="font-bold text-slate-800">6 Variedades de Lechuga</h3>
              <p className="text-sm text-slate-600">Parámetros específicos</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>Iceberg:</strong> Sensible al exceso de sales. Usar EC conservador.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Lollo Rosso:</strong> Color intenso con EC algo más alta.
              </p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Hoja de Roble Rojo:</strong> Crecimiento rápido, tolera EC alta.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Nutrición AQUA VEGA</h3>
              <p className="text-sm text-slate-600">AQUA VEGA A+B</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Orden correcto:</strong> Agua → CalMag → AQUA VEGA A → Mezclar → AQUA VEGA B → Mezclar → pH-.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dosificación:</strong> Partiendo de EC 0 (ósmosis) usar dosis completas. Para agua con minerales, restar EC base.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>pH objetivo:</strong> 6.0 para máxima absorción de nutrientes en lechugas.
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
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">HydroCaru</h1>
                <p className="text-xs text-slate-600">Cálculo EC Escalonado • 6 Variedades • 3 Métodos</p>
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
                        localStorage.removeItem("hydro_caru_app");
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
                          waterNotes: "",
                          calculationMethod: "escalonado"
                        });
                        setMeasurements({
                          manualPH: "6.0",
                          manualEC: "1200",
                          manualTemp: "22",
                          manualHumidity: "65",
                          lastMeasurement: new Date().toISOString()
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

      {/* Navegación por pestañas */}
      {step >= 4 && (
        <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="container mx-auto p-4 max-w-6xl">
            <div className="grid grid-cols-7 w-full gap-2">
              <Button
                variant={tab === "dashboard" ? "default" : "outline"}
                onClick={() => setTab("dashboard")}
                className="flex-1 justify-center"
                title="Panel de Control"
              >
                <Home size={20} />
              </Button>
              <Button
                variant={tab === "tower" ? "default" : "outline"}
                onClick={() => setTab("tower")}
                className="flex-1 justify-center"
                title="Gestión de Torre"
              >
                <TreePine size={20} />
              </Button>
              <Button
                variant={tab === "calculator" ? "default" : "outline"}
                onClick={() => setTab("calculator")}
                className="flex-1 justify-center"
                title="Calculadora"
              >
                <Calculator size={20} />
              </Button>
              <Button
                variant={tab === "measurements" ? "default" : "outline"}
                onClick={() => setTab("measurements")}
                className="flex-1 justify-center"
                title="Mediciones"
              >
                <Activity size={20} />
              </Button>
              <Button
                variant={tab === "irrigation" ? "default" : "outline"}
                onClick={() => setTab("irrigation")}
                className="flex-1 justify-center"
                title="Riego"
              >
                <WaterDroplets size={20} />
              </Button>
              <Button
                variant={tab === "calendar" ? "default" : "outline"}
                onClick={() => setTab("calendar")}
                className="flex-1 justify-center"
                title="Calendario"
              >
                <Calendar size={20} />
              </Button>
              <Button
                variant={tab === "history" ? "default" : "outline"}
                onClick={() => setTab("history")}
                className="flex-1 justify-center"
                title="Historial"
              >
                <BarChart size={20} />
              </Button>
            </div>
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
          <>
            {tab === "dashboard" && <DashboardTab />}
            {tab === "tower" && <TowerTab />}
            {tab === "calculator" && <CalculatorTab />}
            {tab === "measurements" && <MeasurementsTab />}
            {tab === "irrigation" && <IrrigationTab />}
            {tab === "calendar" && <CalendarTab />}
            {tab === "history" && <HistoryTab />}
            {tab === "tips" && <TipsTab />}
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

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              HydroCaru • Cálculo EC Escalonado • 6 Variedades • 3 Métodos • AQUA VEGA
            </div>
            
            <div className="flex items-center gap-4">
              {step >= 4 && (
                <>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      alerts.some(a => a.priority === 1) ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                    }`} />
                    <span className="text-sm text-slate-600">
                      {alerts.filter(a => a.priority === 1).length > 0 
                        ? `${alerts.filter(a => a.priority === 1).length} alertas críticas` 
                        : "Sistema estable"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-600">
                    {plants.length} plantas • EC objetivo: {config.targetEC} µS/cm
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
