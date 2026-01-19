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
  GaugeCircle, Droplets as WaterDroplets,
  Flower2, Sparkles, Shield, Zap as Lightning,
  Flask, Thermometer as ThermometerIcon, GitBranch,
  Package, Hash, AlertOctagon as AlertOctagonIcon,
  Sprout as Plant
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
// CONFIGURACIÓN BASE CON EC OPTIMIZADO
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

// VARIEDADES CON EC OPTIMIZADO (VALORES CORREGIDOS)
const VARIETIES = {
  "Iceberg": { 
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    textColor: "text-cyan-700",
    ecMax: 1400,
    phIdeal: 6.0,
    aquaVegaDosage: {
      seedling: { a: 12, b: 12, ec: 600 },
      growth:   { a: 18, b: 18, ec: 1000 },
      mature:   { a: 24, b: 24, ec: 1300 }
    },
    info: "Variedad sensible. EC conservadora para evitar bordes quemados."
  },
  "Lollo Rosso": { 
    color: "bg-gradient-to-br from-purple-600 to-purple-700",
    textColor: "text-purple-700",
    ecMax: 1500,
    phIdeal: 6.0,
    aquaVegaDosage: {
      seedling: { a: 14, b: 14, ec: 700 },
      growth:   { a: 20, b: 20, ec: 1100 },
      mature:   { a: 26, b: 26, ec: 1400 }
    },
    info: "Tolerancia media. Puede manejar EC ligeramente más alta para color."
  },
  "Maravilla": { 
    color: "bg-gradient-to-br from-amber-600 to-amber-700",
    textColor: "text-amber-700",
    ecMax: 1400,
    phIdeal: 6.0,
    aquaVegaDosage: {
      seedling: { a: 13, b: 13, ec: 650 },
      growth:   { a: 19, b: 19, ec: 1050 },
      mature:   { a: 25, b: 25, ec: 1350 }
    },
    info: "Variedad productiva pero no muy tolerante a sales altas."
  },
  "Trocadero": { 
    color: "bg-gradient-to-br from-lime-600 to-lime-700",
    textColor: "text-lime-700",
    ecMax: 1300,
    phIdeal: 6.0,
    aquaVegaDosage: {
      seedling: { a: 12, b: 12, ec: 600 },
      growth:   { a: 17, b: 17, ec: 950 },
      mature:   { a: 22, b: 22, ec: 1250 }
    },
    info: "Muy sensible en plántula. Requiere EC baja inicial."
  },
  "Hoja de Roble Rojo": { 
    color: "bg-gradient-to-br from-red-600 to-red-700",
    textColor: "text-red-700",
    ecMax: 1600,
    phIdeal: 6.0,
    aquaVegaDosage: {
      seedling: { a: 14, b: 14, ec: 700 },
      growth:   { a: 21, b: 21, ec: 1150 },
      mature:   { a: 28, b: 28, ec: 1500 }
    },
    info: "Variedad más tolerante. Puede manejar EC más alta en maduración."
  },
  "Romana": { 
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
    textColor: "text-blue-700",
    ecMax: 1450,
    phIdeal: 6.0,
    aquaVegaDosage: {
      seedling: { a: 13, b: 13, ec: 650 },
      growth:   { a: 19, b: 19, ec: 1050 },
      mature:   { a: 25, b: 25, ec: 1350 }
    },
    info: "Variedad robusta con crecimiento vertical. EC media óptima."
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO OPTIMIZADAS
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
 * Calcula EC por nivel de desarrollo con factores de seguridad
 */
const calculateECByLevel = (plants, waterType) => {
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
    
    const ecTarget = variety.aquaVegaDosage[stage].ec;
    
    // Aplicar factor de seguridad según etapa
    let safetyFactor = 1.0;
    if (plant.l === 1) safetyFactor = 0.7;  // Más protección para plántulas
    else if (plant.l === 2) safetyFactor = 0.9;
    else safetyFactor = 1.1;
    
    const adjustedEC = ecTarget * safetyFactor;
    
    // Ajustar por tipo de agua
    const waterConfig = WATER_TYPES[waterType];
    let finalEC = waterType !== "osmosis" ? Math.max(0, adjustedEC - waterConfig.ecBase) : adjustedEC;
    
    levels[plant.l].plants += 1;
    levels[plant.l].totalEC += finalEC;
  });
  
  return {
    level1: levels[1].plants > 0 ? Math.round(levels[1].totalEC / levels[1].plants) : 0,
    level2: levels[2].plants > 0 ? Math.round(levels[2].totalEC / levels[2].plants) : 0,
    level3: levels[3].plants > 0 ? Math.round(levels[3].totalEC / levels[3].plants) : 0
  };
};

/**
 * Método 1: Cálculo EC escalonado por niveles con factores de seguridad
 */
const calculateStagedEC = (plants, waterType) => {
  if (plants.length === 0) return { targetEC: "900", method: "estándar" };
  
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
  
  // Aplicar límites seguros
  finalEC = Math.max(800, Math.min(finalEC, 1500));
  
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
 * Método 2: Cálculo EC promedio simple con límites seguros
 */
const calculateAverageEC = (plants, waterType) => {
  if (plants.length === 0) return { targetEC: "900", method: "promedio" };
  
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
  
  // Aplicar límites seguros
  finalEC = Math.max(800, Math.min(finalEC, 1500));
  
  return {
    targetEC: Math.round(finalEC).toString(),
    method: "promedio"
  };
};

/**
 * Método 3: Cálculo EC conservador (mínimo de las plantas) con protección extra
 */
const calculateConservativeEC = (plants, waterType) => {
  if (plants.length === 0) return { targetEC: "800", method: "conservador" };
  
  const minEC = Math.min(...plants.map(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return 1400;
    
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    return variety.aquaVegaDosage[stage].ec;
  }));
  
  let finalEC = minEC * 0.9; // 10% más conservador
  
  const waterConfig = WATER_TYPES[waterType];
  if (waterConfig && waterType !== "osmosis") {
    finalEC = Math.max(0, finalEC - waterConfig.ecBase);
  }
  
  // Aplicar límite mínimo seguro
  finalEC = Math.max(700, finalEC);
  
  return {
    targetEC: Math.round(finalEC).toString(),
    method: "conservador"
  };
};

/**
 * Cálculo EC inteligente optimizado (selecciona el mejor método)
 */
const calculateSmartEC = (plants, waterType) => {
  const methods = {
    escalonado: calculateStagedEC(plants, waterType),
    promedio: calculateAverageEC(plants, waterType),
    conservador: calculateConservativeEC(plants, waterType)
  };
  
  const stats = calculatePlantStats(plants);
  
  let selectedMethod = "promedio";
  
  // Lógica mejorada de selección de método
  if (stats.seedlingCount > stats.growthCount + stats.matureCount) {
    selectedMethod = "conservador"; // Muchas plántulas
  } else if (stats.matureCount > stats.growthCount && stats.matureCount > stats.seedlingCount) {
    selectedMethod = "escalonado"; // Muchas plantas maduras
  } else if (stats.growthCount > 0 && stats.matureCount > 0 && stats.seedlingCount > 0) {
    selectedMethod = "escalonado"; // Mezcla equilibrada
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
 * Calcula dosis AQUA VEGA optimizada
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
      plantContribution = (dosage.a / 10) * (totalVolume / plants.length) * 1.1; // Reducido de 1.2
    } else {
      plantContribution = (dosage.a / 10) * (totalVolume / plants.length) * 0.9; // Reducido de 1.0
    }
    
    totalA += plantContribution;
    totalB += plantContribution;
  });
  
  let ecRatio = parseFloat(targetEC) / 1100; // Reducido de 1300
  
  if (waterType === "osmosis") {
    ecRatio = parseFloat(targetEC) / 1200; // Reducido de 1400
  } else if (usedWaterType.hardness > 150) {
    ecRatio *= 0.85; // Más reducción por dureza
  }
  
  totalA *= ecRatio;
  totalB *= ecRatio;
  
  let note = "";
  if (waterType === "osmosis") {
    note = "✅ DOSIS COMPLETA: Partiendo de EC 0. No restar EC base.";
  } else if (usedWaterType.hardness > 150) {
    note = "⚠️ Dosis reducida por alta dureza del agua";
  } else {
    note = "✅ Dosis optimizada para agua blanda";
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
 * Calcula ajuste de pH con recomendaciones específicas
 */
const calculatePHAdjustment = (currentPH, targetPH, waterType, volume) => {
  const waterConfig = WATER_TYPES[waterType];
  if (!waterConfig) return { phMinus: 0, phPlus: 0, recommendation: "" };
  
  const phDiff = currentPH - targetPH;
  let adjustmentFactor = 1.0;
  let bufferStrength = 1.0;
  
  if (waterConfig.hardness > 200) {
    adjustmentFactor = 1.3;
    bufferStrength = 1.5;
  } else if (waterConfig.hardness > 100) {
    adjustmentFactor = 1.15;
    bufferStrength = 1.2;
  } else if (waterType === "osmosis") {
    adjustmentFactor = 0.7; // Agua pura requiere menos ajuste
    bufferStrength = 0.5;   // Bajo poder tampón
  }
  
  const adjustment = Math.abs(phDiff) * volume * 0.1 * adjustmentFactor; // Reducido de 0.12
  
  let recommendation = "";
  if (phDiff > 0.3) { // Ajustado de > 0
    recommendation = `pH demasiado alto (${currentPH}). Añadir ${adjustment.toFixed(1)}ml de pH- (ácido fosfórico). Mezclar bien y esperar 15 minutos antes de medir de nuevo.`;
  } else if (phDiff < -0.3) { // Ajustado de < 0
    recommendation = `pH demasiado bajo (${currentPH}). Añadir ${adjustment.toFixed(1)}ml de pH+ (hidróxido de potasio). Mezclar bien y esperar 15 minutos.`;
  } else {
    recommendation = "✅ pH en el rango ideal. No se requiere ajuste.";
  }
  
  // Añadir advertencia si el agua tiene bajo poder tampón
  if (bufferStrength < 1.0) {
    recommendation += " ⚠️ Agua con bajo poder tampón: el pH puede fluctuar más fácilmente.";
  }
  
  return { 
    phMinus: phDiff > 0.3 ? adjustment.toFixed(1) : "0", 
    phPlus: phDiff < -0.3 ? adjustment.toFixed(1) : "0",
    recommendation,
    critical: Math.abs(phDiff) > 0.8 // Ajustado de > 0.5
  };
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
 * Calcula riego para torre vertical en Castellón optimizado
 */
const calculateIrrigation = (plants, temp, humidity, season) => {
  const pumpPower = 7; // 7W
  const rockwoolCubes = 2.5; // cm
  const castellonAltitude = 30; // metros sobre el mar
  
  let totalWaterNeeds = 0;
  let totalPlants = plants.length;
  
  if (totalPlants === 0) {
    return {
      totalWaterNeeds: "0.0",
      pumpMinutesPerDay: "0",
      cyclesPerDay: 0,
      minutesPerCycle: "0.0",
      pumpPower,
      rockwoolCubes,
      location: "Castellón de la Plana",
      recommendations: ["Añade plantas al sistema para calcular riego"]
    };
  }
  
  plants.forEach(plant => {
    let waterPerPlant = 0.4; // Reducido de 0.5 litros/día base
    
    // Ajustar por nivel de crecimiento
    if (plant.l === 1) waterPerPlant *= 0.5; // Plántula (reducido de 0.6)
    else if (plant.l === 2) waterPerPlant *= 0.8; // Crecimiento (reducido de 0.9)
    else waterPerPlant *= 1.0; // Madura (reducido de 1.2)
    
    // Ajustar por variedad
    const variety = VARIETIES[plant.v];
    if (variety) {
      if (plant.v === "Iceberg") waterPerPlant *= 1.0; // Reducido de 1.1
      else if (plant.v === "Lollo Rosso") waterPerPlant *= 0.8; // Reducido de 0.9
      else if (plant.v === "Hoja de Roble Rojo") waterPerPlant *= 1.1; // Reducido de 1.2
    }
    
    totalWaterNeeds += waterPerPlant;
  });
  
  // Ajustar por temperatura y humedad de Castellón
  let tempFactor = 1.0;
  if (temp > 25) tempFactor = 1.2; // Reducido de 1.3
  else if (temp > 20) tempFactor = 1.05; // Reducido de 1.1
  else if (temp < 15) tempFactor = 0.85; // Reducido de 0.8
  
  let humidityFactor = 1.0;
  if (humidity < 40) humidityFactor = 1.15; // Reducido de 1.2
  else if (humidity > 70) humidityFactor = 0.85; // Reducido de 0.9
  
  // Ajustar por estación en Castellón
  let seasonFactor = 1.0;
  if (season === "summer") seasonFactor = 1.3; // Reducido de 1.4
  else if (season === "winter") seasonFactor = 0.8; // Reducido de 0.7
  
  totalWaterNeeds = totalWaterNeeds * tempFactor * humidityFactor * seasonFactor;
  
  // Calcular tiempo de riego (bomba de 7W, aprox 5L/h)
  const pumpFlowRate = 5; // litros por hora
  const dailyPumpMinutes = (totalWaterNeeds / pumpFlowRate) * 60;
  
  // Dividir en ciclos (cada 2 horas durante luz)
  const cyclesPerDay = Math.min(Math.max(Math.round(dailyPumpMinutes / 5), 4), 12);
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
      "En verano aumentar frecuencia un 30%",
      "En invierno reducir frecuencia un 20%",
      "Los dados de lana de roca de 2.5cm retienen bien la humedad"
    ]
  };
};

// ============================================================================
// COMPONENTES REUTILIZABLES
// ============================================================================

const StagedECCalculator = ({ plants, waterType, onECCalculated, selectedMethod, onMethodChange }) => {
  const ecMethods = calculateSmartEC(plants, waterType);
  const ecByLevel = calculateECByLevel(plants, waterType);
  const plantStats = calculatePlantStats(plants);
  
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
  
  return (
    <Card className="p-6 rounded-2xl mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Calculator className="text-white" size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-xl">Cálculo EC Escalonado Optimizado</h2>
          <p className="text-slate-600">3 métodos de cálculo seguro para lechugas</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200">
          <h4 className="font-bold text-blue-700 mb-2">Método Seleccionado</h4>
          <div className="text-3xl font-bold text-blue-600 mb-2">{currentEC} µS/cm</div>
          <Badge className="bg-blue-100 text-blue-800">
            {selectedMethod || ecMethods.method}
          </Badge>
          {selectedMethod && selectedMethod !== ecMethods.method && (
            <p className="text-xs text-slate-500 mt-1">Modificado manualmente</p>
          )}
          <p className="text-xs text-slate-600 mt-2">
            {currentMethod === "conservador" ? "✅ Seguro para plántulas" :
             currentMethod === "escalonado" ? "✅ Ideal para múltiples etapas" :
             "✅ Balanceado para crecimiento"}
          </p>
        </div>
        
        <div className="p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
          <h4 className="font-bold text-green-700 mb-2">Distribución de Plantas</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-700">Nivel 1 (Plántulas):</span>
              <span className="font-bold text-cyan-600">{plantStats.seedlingCount} plantas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Nivel 2 (Crecimiento):</span>
              <span className="font-bold text-green-600">{plantStats.growthCount} plantas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Nivel 3 (Maduras):</span>
              <span className="font-bold text-emerald-600">{plantStats.matureCount} plantas</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Total:</span>
                <span className="font-bold text-slate-800">{plantStats.total} plantas</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-b from-purple-50 to-white rounded-xl border-2 border-purple-200">
          <h4 className="font-bold text-purple-700 mb-2">EC por Nivel (seguro)</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-slate-700">Plántulas:</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800">{ecByLevel.level1} µS/cm</span>
                <p className="text-xs text-slate-500">Rango seguro: 600-800</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-slate-700">Crecimiento:</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800">{ecByLevel.level2} µS/cm</span>
                <p className="text-xs text-slate-500">Rango seguro: 900-1200</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-slate-700">Maduras:</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800">{ecByLevel.level3} µS/cm</span>
                <p className="text-xs text-slate-500">Rango seguro: 1200-1500</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold text-blue-700 mb-3">Comparación de Métodos de Cálculo</h4>
        <p className="text-sm text-slate-600 mb-4">Selecciona el método según tu distribución de plantas o deja que el sistema elija automáticamente</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${currentMethod === "escalonado" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200 hover:border-blue-300'}`}
            onClick={() => onMethodChange && onMethodChange("escalonado")}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-slate-800">Escalonado</p>
              {currentMethod === "escalonado" && <Check className="text-blue-600" size={18} />}
            </div>
            <p className="text-sm text-slate-600 mb-3">Peso por nivel de desarrollo</p>
            <p className="text-2xl font-bold text-blue-600">{ecMethods.allMethods?.escalonado?.targetEC || "1100"} µS/cm</p>
            <p className="text-xs text-slate-500 mt-1">
              ✅ Ideal cuando hay plantas en diferentes etapas
            </p>
          </div>
          
          <div 
            className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${currentMethod === "promedio" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200 hover:border-blue-300'}`}
            onClick={() => onMethodChange && onMethodChange("promedio")}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-slate-800">Promedio</p>
              {currentMethod === "promedio" && <Check className="text-blue-600" size={18} />}
            </div>
            <p className="text-sm text-slate-600 mb-3">Media aritmética simple</p>
            <p className="text-2xl font-bold text-blue-600">{ecMethods.allMethods?.promedio?.targetEC || "1000"} µS/cm</p>
            <p className="text-xs text-slate-500 mt-1">
              ✅ Para etapas similares o sistema equilibrado
            </p>
          </div>
          
          <div 
            className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${currentMethod === "conservador" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200 hover:border-blue-300'}`}
            onClick={() => onMethodChange && onMethodChange("conservador")}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-slate-800">Conservador</p>
              {currentMethod === "conservador" && <Check className="text-blue-600" size={18} />}
            </div>
            <p className="text-sm text-slate-600 mb-3">Mínimo + protección extra</p>
            <p className="text-2xl font-bold text-blue-600">{ecMethods.allMethods?.conservador?.targetEC || "800"} µS/cm</p>
            <p className="text-xs text-slate-500 mt-1">
              ✅ Para muchas plántulas o variedades sensibles
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {selectedMethod 
              ? `Método seleccionado manualmente: ${selectedMethod}` 
              : `Método automático recomendado: ${ecMethods.method}`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMethodChange && onMethodChange(null)}
            disabled={!selectedMethod}
            className="flex items-center gap-1"
          >
            <RotateCcw size={14} />
            Restaurar automático
          </Button>
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
        action: "Esperar estabilización", 
        details: "Esperar 15-30 minutos para que los nutrientes se estabilicen",
        icon: "⏰"
      },
      { 
        step: 9, 
        action: "Medir EC", 
        details: "Verificar EC. Objetivo: 800-1500 µS/cm según plantas",
        icon: "📊"
      },
      { 
        step: 10, 
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
          <h2 className="font-bold text-slate-800 text-xl">DIAGNÓSTICO PARA ÓSMOSIS - EC OPTIMIZADO</h2>
          <p className="text-slate-600">Protocolo especial para agua de ósmosis inversa con valores seguros</p>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-white rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-700 mb-3">1. ✅ Detección Automática - Agua Pura</h3>
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
        <p className="text-sm text-slate-600 mt-3">
          <strong>Nota:</strong> Con agua de ósmosis, comenzamos desde EC 0, permitiendo control total sobre los nutrientes.
        </p>
      </div>
      
      {calmagNeeded.required && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
          <h3 className="font-bold text-amber-700 mb-3">2. ⚠️ CALMAG OBLIGATORIO - ATENCIÓN</h3>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-amber-800">SE REQUIERE CALMAG IMPRESCINDIBLE</p>
              <p className="text-sm text-amber-700">{calmagNeeded.reason}</p>
            </div>
            <div className="text-3xl font-bold text-amber-600">{calmagNeeded.dosage}ml</div>
          </div>
          <p className="text-sm font-bold text-amber-900 bg-amber-100 p-3 rounded-lg">
            🚨 INSTRUCCIÓN CRÍTICA: "Añadir CalMag ANTES de los nutrientes AQUA VEGA - NUNCA después"
          </p>
          <p className="text-sm text-amber-800 mt-2">
            Sin CalMag, las plantas desarrollarán deficiencias de calcio y magnesio en 3-5 días.
          </p>
        </div>
      )}
      
      <div className="mb-6 p-4 bg-white rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-700 mb-3">3. 📋 Protocolo Especial para Ósmosis - Valores Seguros</h3>
        <div className="space-y-3">
          {osmosisProtocol.steps.map((step) => (
            <div key={step.step} className={`flex items-start gap-3 p-3 rounded-lg ${step.critical ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.critical ? 'bg-amber-100 text-amber-700 font-bold' : 'bg-blue-100 text-blue-700 font-bold'}`}>
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
      
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
        <h3 className="font-bold text-emerald-700 mb-3">✅ Ventajas del Agua de Ósmosis</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt-0.5" size={16} />
            <span><strong>Control total:</strong> Comienzas desde EC 0, sabes exactamente lo que añades</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt-0.5" size={16} />
            <span><strong>Sin contaminantes:</strong> Eliminación de cloro, metales pesados y patógenos</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt-0.5" size={16} />
            <span><strong>Precisión en fórmulas:</strong> Las fórmulas AQUA VEGA están diseñadas para agua pura</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-emerald-500 mt-0.5" size={16} />
            <span><strong>Menos ajustes de pH:</strong> pH inicial neutro, más fácil de ajustar</span>
          </li>
        </ul>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPONENTE DE MEDIDORES CIRCULARES (VELOCÍMETROS) - MEJORADO
// ============================================================================

const CircularGauge = ({ value, max, min = 0, label, unit, color = "blue", size = "md" }) => {
  const sizes = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40"
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
  const strokeDasharray = 2 * Math.PI * 40; // radio del círculo
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
  
  // Determinar color del valor según el rango
  const getValueColor = () => {
    if (label === "pH") {
      if (value >= 5.5 && value <= 6.5) return "text-green-600";
      if (value < 5.0 || value > 7.0) return "text-red-600";
      return "text-amber-600";
    } else if (label === "EC") {
      if (value >= 800 && value <= 1500) return "text-green-600";
      if (value > 1500) return "text-red-600";
      return "text-amber-600";
    } else if (label === "Temperatura") {
      if (value >= 18 && value <= 25) return "text-green-600";
      if (value > 28) return "text-red-600";
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
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Fondo del círculo */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
            className={bgColors[color]}
            strokeLinecap="round"
          />
          
          {/* Indicador de progreso */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
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
          <div className={`text-2xl font-bold ${getValueColor()}`}>
            {value}
          </div>
          <div className="text-xs text-slate-500 mt-1">{unit}</div>
        </div>
      </div>
      
      {/* Etiqueta - MEJORADO: Separación clara */}
      <div className="mt-3 text-center space-y-1">
        <div className="text-sm font-bold text-slate-800">{label}</div>
        <div className="text-xs text-slate-500 space-y-0.5">
          {label === "pH" && (
            <>
              <div>Ideal: 5.5-6.5</div>
              <div>Actual: {value}</div>
            </>
          )}
          {label === "EC" && (
            <>
              <div>Ideal: 800-1500</div>
              <div>Actual: {value}</div>
            </>
          )}
          {label === "Temperatura" && (
            <>
              <div>Ideal: 18-25°C</div>
              <div>Actual: {value}°C</div>
            </>
          )}
          {label === "Volumen" && (
            <>
              <div>Máximo: {max}L</div>
              <div>Actual: {value}L</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardMetricsPanel = ({ config, measurements }) => {
  const getStatusText = (label, value) => {
    if (label === "pH") {
      if (value >= 5.5 && value <= 6.5) return "✅ ÓPTIMO";
      if (value < 5.0 || value > 7.0) return "⚠️ AJUSTAR";
      return "⚠️ AJUSTAR";
    } else if (label === "EC") {
      if (value >= 800 && value <= 1500) return "✅ ÓPTIMA";
      if (value > 1500) return "🚨 ALTA";
      return "⚠️ BAJA";
    } else if (label === "Temperatura") {
      if (value >= 18 && value <= 25) return "✅ ÓPTIMA";
      if (value > 28) return "🚨 ALTA";
      if (value < 15) return "❄️ BAJA";
      return "⚠️ AJUSTAR";
    } else if (label === "Volumen") {
      const volumePercentage = (value / parseFloat(config.totalVol)) * 100;
      if (volumePercentage >= 45) return "✅ ADECUADO";
      if (volumePercentage >= 25) return "⚠️ BAJO";
      return "🚨 MUY BAJO";
    }
    return "";
  };
  
  return (
    <Card className="p-6 rounded-2xl mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <Activity className="text-white" size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-xl">Parámetros Actuales del Sistema</h2>
          <p className="text-slate-600">Últimos valores medidos - Monitoreo en tiempo real</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Medidor de pH */}
        <div className="flex flex-col items-center p-4 bg-gradient-to-b from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={16} />
            </div>
            <span className="font-bold text-purple-700">pH del Agua</span>
          </div>
          <CircularGauge 
            value={parseFloat(measurements.manualPH || config.ph)} 
            min={4} 
            max={9} 
            label="pH" 
            unit="" 
            color="purple"
            size="md"
          />
          <div className="mt-4 text-center space-y-1">
            <div className={`text-sm font-bold ${
              parseFloat(measurements.manualPH || config.ph) >= 5.5 && parseFloat(measurements.manualPH || config.ph) <= 6.5 
                ? "text-green-600" 
                : "text-amber-600"
            }`}>
              {getStatusText("pH", parseFloat(measurements.manualPH || config.ph))}
            </div>
            <p className="text-xs text-slate-500">
              Objetivo: {config.targetPH}
            </p>
          </div>
        </div>
        
        {/* Medidor de EC */}
        <div className="flex flex-col items-center p-4 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={16} />
            </div>
            <span className="font-bold text-blue-700">Conductividad (EC)</span>
          </div>
          <CircularGauge 
            value={parseFloat(measurements.manualEC || config.ec)} 
            min={0} 
            max={3000} 
            label="EC" 
            unit="µS/cm" 
            color="blue"
            size="md"
          />
          <div className="mt-4 text-center space-y-1">
            <div className={`text-sm font-bold ${
              parseFloat(measurements.manualEC || config.ec) >= 800 && parseFloat(measurements.manualEC || config.ec) <= 1500 
                ? "text-green-600" 
                : parseFloat(measurements.manualEC || config.ec) > 1500 
                ? "text-red-600" 
                : "text-amber-600"
            }`}>
              {getStatusText("EC", parseFloat(measurements.manualEC || config.ec))}
            </div>
            <p className="text-xs text-slate-500">
              Objetivo: {config.targetEC} µS/cm
            </p>
          </div>
        </div>
        
        {/* Medidor de Temperatura */}
        <div className="flex flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Thermometer className="text-white" size={16} />
            </div>
            <span className="font-bold text-amber-700">Temperatura</span>
          </div>
          <CircularGauge 
            value={parseFloat(measurements.manualTemp || config.temp)} 
            min={0} 
            max={40} 
            label="Temperatura" 
            unit="°C" 
            color="amber"
            size="md"
          />
          <div className="mt-4 text-center space-y-1">
            <div className={`text-sm font-bold ${
              parseFloat(measurements.manualTemp || config.temp) >= 18 && parseFloat(measurements.manualTemp || config.temp) <= 25 
                ? "text-green-600" 
                : parseFloat(measurements.manualTemp || config.temp) > 28 
                ? "text-red-600" 
                : parseFloat(measurements.manualTemp || config.temp) < 15 
                ? "text-blue-600" 
                : "text-amber-600"
            }`}>
              {getStatusText("Temperatura", parseFloat(measurements.manualTemp || config.temp))}
            </div>
            <p className="text-xs text-slate-500">
              Ideal: 18-25°C
            </p>
          </div>
        </div>
        
        {/* Medidor de Volumen */}
        <div className="flex flex-col items-center p-4 bg-gradient-to-b from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Droplets className="text-white" size={16} />
            </div>
            <span className="font-bold text-emerald-700">Volumen Agua</span>
          </div>
          <CircularGauge 
            value={parseFloat(measurements.manualVolume || config.currentVol)} 
            min={0} 
            max={parseFloat(config.totalVol)} 
            label="Volumen" 
            unit="L" 
            color="emerald"
            size="md"
          />
          <div className="mt-4 text-center space-y-1">
            <div className={`text-sm font-bold ${
              (parseFloat(measurements.manualVolume || config.currentVol) / parseFloat(config.totalVol)) * 100 >= 45 
                ? "text-green-600" 
                : (parseFloat(measurements.manualVolume || config.currentVol) / parseFloat(config.totalVol)) * 100 >= 25 
                ? "text-amber-600" 
                : "text-red-600"
            }`}>
              {getStatusText("Volumen", parseFloat(measurements.manualVolume || config.currentVol))}
            </div>
            <p className="text-xs text-slate-500">
              {config.currentVol}L / {config.totalVol}L
            </p>
          </div>
        </div>
      </div>
      
      {/* Resumen de estado */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200">
        <h4 className="font-bold text-slate-700 mb-3">📊 Resumen del Estado del Sistema</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Última medición:</span>
              <span className="font-bold text-blue-600">
                {new Date(measurements.lastMeasurement).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(measurements.lastMeasurement).toLocaleDateString()}
            </p>
          </div>
          
          <div className="p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Tipo de agua:</span>
              <span className="font-bold text-cyan-600">
                {WATER_TYPES[config.waterType]?.name || "Baja Mineralización"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              EC base: {WATER_TYPES[config.waterType]?.ecBase || "200"} µS/cm
            </p>
          </div>
          
          <div className="p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Temperatura agua:</span>
              <span className={`font-bold ${
                parseFloat(measurements.manualWaterTemp || "22") >= 18 && parseFloat(measurements.manualWaterTemp || "22") <= 22 
                  ? "text-green-600" 
                  : parseFloat(measurements.manualWaterTemp || "22") > 22 
                  ? "text-red-600" 
                  : "text-blue-600"
              }`}>
                {measurements.manualWaterTemp || "22"}°C
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {parseFloat(measurements.manualWaterTemp || "22") > 22 ? "⚠️ Demasiado caliente" : 
               parseFloat(measurements.manualWaterTemp || "22") < 18 ? "❄️ Demasiado fría" : 
               "✅ Ideal"}
            </p>
          </div>
          
          <div className="p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Humedad ambiente:</span>
              <span className={`font-bold ${
                parseFloat(measurements.manualHumidity || "65") >= 40 && parseFloat(measurements.manualHumidity || "65") <= 70 
                  ? "text-green-600" 
                  : "text-amber-600"
              }`}>
                {measurements.manualHumidity || "65"}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {parseFloat(measurements.manualHumidity || "65") < 40 ? "⚠️ Demasiado seca" : 
               parseFloat(measurements.manualHumidity || "65") > 70 ? "⚠️ Demasiado húmeda" : 
               "✅ Ideal"}
            </p>
          </div>
        </div>
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
              <h4 className="font-bold text-blue-700 mb-3">📋 Proceso de Rotación</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 3 → Cosecha</p>
                    <p className="text-sm text-slate-600">Plantas maduras se cosechan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 2 → Nivel 3</p>
                    <p className="text-sm text-slate-600">Plantas en crecimiento pasan a maduración</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Nivel 1 → Nivel 2</p>
                    <p className="text-sm text-slate-600">Plántulas pasan a crecimiento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Añadir nuevas plántulas</p>
                    <p className="text-sm text-slate-600">Nuevas plantas en nivel 1 (5 máximo)</p>
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
              <h4 className="font-bold text-purple-700 mb-3">📊 Resumen de Rotación</h4>
              
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
              Confirmar Rotación
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL - CON LAS MEJORAS
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
  
  // Configuración del sistema con valores iniciales optimizados
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20", 
    ph: "6.0", 
    ec: "1000", // Reducido de 1200
    temp: "22", 
    targetEC: "1100", // Reducido de 1400
    targetPH: "6.0",
    waterType: "bajo_mineral",
    hasHeater: true,
    useOsmosisMix: false,
    osmosisMixPercentage: 0,
    waterNotes: "",
    calculationMethod: "escalonado"
  });
  
  // Configuración de mediciones manuales con valores iniciales optimizados
  const [measurements, setMeasurements] = useState({
    manualPH: "6.0",
    manualEC: "1000", // Reducido de 1200
    manualTemp: "22",
    manualWaterTemp: "22",
    manualVolume: "20",
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
        
        // Manejar compatibilidad con versiones anteriores
        const savedMeasurements = data.measurements || {};
        setMeasurements({
          manualPH: savedMeasurements.manualPH || "6.0",
          manualEC: savedMeasurements.manualEC || "1000", // Reducido de 1200
          manualTemp: savedMeasurements.manualTemp || "22",
          manualWaterTemp: savedMeasurements.manualWaterTemp || "22",
          manualVolume: savedMeasurements.manualVolume || (data.config?.currentVol || "20"),
          manualHumidity: savedMeasurements.manualHumidity || "65",
          lastMeasurement: savedMeasurements.lastMeasurement || new Date().toISOString()
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
    
    alert(`✅ Rotación completada exitosamente:
• ${plants.filter(p => p.l === 3).length} plantas cosechadas (nivel 3)
• ${plants.filter(p => p.l === 2).length} plantas movidas a nivel 3
• ${plants.filter(p => p.l === 1).length} plantas movidas a nivel 2
• ${newSeedlings.length} nuevas plántulas añadidas al nivel 1`);
    
    setTab("tower");
  };

  const handleECCalculated = (ec) => {
    setConfig(prev => ({ ...prev, targetEC: ec }));
  };

  const handleECMethodChange = (method) => {
    setSelectedECMethod(method);
    
    // Calcular el EC usando el método seleccionado
    if (method) {
      let newEC = "1100"; // Valor por defecto optimizado
      
      if (method === "escalonado") {
        const result = calculateStagedEC(plants, config.waterType);
        newEC = result.targetEC;
      } else if (method === "promedio") {
        const result = calculateAverageEC(plants, config.waterType);
        newEC = result.targetEC;
      } else if (method === "conservador") {
        const result = calculateConservativeEC(plants, config.waterType);
        newEC = result.targetEC;
      }
      
      setConfig(prev => ({ ...prev, targetEC: newEC }));
    }
  };

  const saveManualMeasurement = () => {
    const now = new Date().toISOString();
    const measurementRecord = {
      id: generatePlantId(),
      date: now,
      ph: measurements.manualPH,
      ec: measurements.manualEC,
      temp: measurements.manualTemp,
      waterTemp: measurements.manualWaterTemp,
      volume: measurements.manualVolume || config.currentVol,
      humidity: measurements.manualHumidity,
      notes: "Medición manual completa"
    };
    
    // Actualizar configuración con nuevos valores
    setConfig(prev => ({ 
      ...prev, 
      ph: measurements.manualPH,
      ec: measurements.manualEC,
      temp: measurements.manualTemp,
      currentVol: measurements.manualVolume || prev.currentVol
    }));
    
    // Guardar en historial
    setHistory([measurementRecord, ...history.slice(0, 49)]); // Mantener solo las últimas 50 mediciones
    
    setMeasurements(prev => ({
      ...prev,
      lastMeasurement: now
    }));
    
    alert(`✅ Medición completa guardada:
pH: ${measurements.manualPH}
EC: ${measurements.manualEC} µS/cm
Temp ambiente: ${measurements.manualTemp}°C
Temp agua: ${measurements.manualWaterTemp}°C
Volumen: ${measurements.manualVolume || config.currentVol}L`);
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

  // =================== ALERTAS OPTIMIZADAS ===================

  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1100;
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

    // Alertas existentes optimizadas
    if (vAct < vTot * 0.25) { // Reducido de 0.3
      res.push({ 
        title: "¡AGUA MUY BAJA!", 
        value: `${(vTot - vAct).toFixed(1)}L`, 
        description: `Crítico: Solo queda un ${(vAct/vTot*100).toFixed(0)}%`, 
        color: "bg-gradient-to-r from-red-600 to-rose-700",
        icon: <Droplets className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (vAct < vTot * 0.45) { // Reducido de 0.5
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

    if (ph > tPh + 0.8 || ph < tPh - 0.8) { // Aumentado de 0.5
      const action = ph > tPh ? "pH-" : "pH+";
      const ml = ph > tPh ? phAdjustment.phMinus : phAdjustment.phPlus;
      res.push({ 
        title: `AJUSTE ${action} URGENTE`, 
        value: `${ml}ml`, 
        description: `pH ${ph} → objetivo ${tPh}. ${phAdjustment.recommendation}`, 
        color: "bg-gradient-to-r from-purple-700 to-pink-700",
        icon: <RefreshCw className="text-white" size={28} />,
        priority: 1,
        details: phAdjustment.critical ? "CRÍTICO: Fuera del rango seguro para absorción de nutrientes" : "Ajustar gradualmente"
      });
    } 
    else if (ph > tPh + 0.5 || ph < tPh - 0.5) { // Aumentado de 0.2
      const action = ph > tPh ? "pH-" : "pH+";
      const ml = ph > tPh ? phAdjustment.phMinus : phAdjustment.phPlus;
      res.push({ 
        title: `AJUSTAR ${action}`, 
        value: `${ml}ml`, 
        description: `pH ${ph} → objetivo ${tPh}. Ajustar gradualmente.`, 
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        icon: <ArrowDownCircle className={ph > tPh ? "" : "rotate-180"} size={28} />,
        priority: 2,
        details: phAdjustment.recommendation
      });
    }

    if (ec < tEc - 300 && ec > 0) { // Reducido de 400
      const mlPerLiter = aquaVegaDosage.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.4; // Reducido de 0.5
      res.push({ 
        title: "¡FALTAN NUTRIENTES!", 
        value: `${Math.round(mlToAdd)}ml A+B`, 
        description: `EC ${ec} µS/cm (muy baja). Añadir AQUA VEGA.`, 
        color: "bg-gradient-to-r from-blue-800 to-cyan-800",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec < tEc - 150 && ec > 0) { // Reducido de 200
      const mlPerLiter = aquaVegaDosage.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.4; // Reducido de 0.5
      res.push({ 
        title: "AÑADIR NUTRIENTES", 
        value: `${Math.round(mlToAdd)}ml A+B`, 
        description: `Subir de ${ec} a ${tEc} µS/cm`, 
        color: "bg-gradient-to-r from-blue-600 to-cyan-600",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 2
      });
    } 
    else if (ec > tEc + 400) { // Reducido de 500
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
    else if (ec > tEc + 250) { // Reducido de 300
      const water = ((ec - tEc) / tEc * vAct).toFixed(1);
      res.push({ 
        title: "DILUIR CON AGUA", 
        value: `${water}L`, 
        description: `EC ${ec} µS/cm &gt; objetivo ${tEc} µS/cm. Añadir agua sola.`, 
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

  // =================== FUNCIÓN PARA REGISTRAR LIMPIEZA ===================

  const handleRegisterClean = () => {
    const now = new Date().toISOString();
    setLastClean(now);
    
    // Guardar en historial
    const cleanRecord = {
      id: generatePlantId(),
      date: now,
      type: "clean",
      description: "Limpieza del sistema completada",
      notes: "Limpieza registrada manualmente"
    };
    
    setHistory([cleanRecord, ...history.slice(0, 49)]);
    
    alert(`✅ Limpieza registrada exitosamente:
Fecha: ${new Date(now).toLocaleDateString()}
Hora: ${new Date(now).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}

Próxima limpieza recomendada: en 14 días`);
  };

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
              HydroCaru Optimizado
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg mx-auto">
              Sistema experto para cultivo hidropónico con cálculo EC escalonado seguro para lechugas
            </p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Calculator className="text-emerald-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Cálculo EC Optimizado</h3>
                  <p className="text-sm text-slate-600">Valores seguros para lechugas: 800-1500 µS/cm</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Filter className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Protección de Plántulas</h3>
                  <p className="text-sm text-slate-600">EC reducido para plantas jóvenes: 600-800 µS/cm</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TreePine className="text-purple-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">6 Variedades Específicas</h3>
                  <p className="text-sm text-slate-600">Parámetros optimizados por variedad</p>
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
              <h2 className="text-3xl font-bold text-slate-800">¡IMPORTANTE! Protocolo de Preparación Optimizado</h2>
              <p className="text-slate-600">Sigue estos pasos para preparar correctamente tu sistema con valores seguros</p>
            </div>
            
            <Card className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <AlertOctagon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">⚠️ CONSEJO SUPER IMPORTANTE - EC OPTIMIZADO</h3>
                  <p className="text-slate-600">Orden correcto para añadir nutrientes con valores seguros</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                  <h4 className="font-bold text-amber-800 text-lg mb-3">📋 PASO A PASO - ORDEN CORRECTO CON VALORES SEGUROS</h4>
                  <p className="text-slate-700 mb-4">
                    El éxito en hidroponía depende del <strong>orden correcto</strong> y de usar <strong>valores seguros de EC</strong>.
                    Sigue estrictamente esta secuencia con los valores optimizados:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">Llenar el depósito con agua</h5>
                        <p className="text-sm text-slate-600">Usa el tipo de agua que has seleccionado en el paso anterior</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">Añadir CALMAG (si es necesario)</h5>
                        <p className="text-sm text-slate-600">SOLO si usas agua de ósmosis o agua muy blanda</p>
                        <p className="text-xs text-amber-600 font-bold mt-1">⚠️ CRÍTICO: Siempre antes de AQUA VEGA</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">Añadir AQUA VEGA A</h5>
                        <p className="text-sm text-slate-600">La cantidad calculada por este sistema (valores optimizados)</p>
                        <p className="text-xs text-emerald-600 font-bold mt-1">✅ Mezclar durante 1-2 minutos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">Añadir AQUA VEGA B</h5>
                        <p className="text-sm text-slate-600">La misma cantidad que AQUA VEGA A</p>
                        <p className="text-xs text-emerald-600 font-bold mt-1">✅ Mezclar durante 2-3 minutos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        5
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">Esperar 15-30 minutos</h5>
                        <p className="text-sm text-slate-600">Dejar que los nutrientes se estabilicen</p>
                        <p className="text-xs text-purple-600 font-bold mt-1">⏰ NO OMITIR este paso</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold">
                        6
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">Medir pH y ajustar si es necesario</h5>
                        <p className="text-sm text-slate-600">Objetivo: pH 5.8-6.2 (óptimo para lechugas)</p>
                        <p className="text-xs text-pink-600 font-bold mt-1">⚖️ NUNCA ajustar pH antes de añadir nutrientes</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
                  <h4 className="font-bold text-red-700 text-lg mb-3">🚫 ERRORES COMUNES QUE DEBES EVITAR CON VALORES OPTIMIZADOS</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> usar EC &gt; 1500 µS/cm para lechugas (quemaduras garantizadas)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> dar EC &gt; 800 µS/cm a plántulas (estrés salino)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> mezclar AQUA VEGA A y B directamente (crean precipitados)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> ajustar el pH antes de añadir todos los nutrientes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> añadir CalMag después de AQUA VEGA (se bloquea el calcio)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-700 text-lg mb-3">✅ CONSEJOS DE ÉXITO CON EC OPTIMIZADO</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span>Usa EC 600-800 µS/cm para plántulas (primeras 2 semanas)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span>Incrementa gradualmente EC: +100-200 µS/cm por semana</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span>Monitorea síntomas: hojas pálidas = EC baja, bordes quemados = EC alta</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span>Para ósmosis: añadir siempre CalMag antes de nutrientes</span>
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
              <h2 className="text-3xl font-bold text-slate-800">Paso 2: Configuración Básica</h2>
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
              <h2 className="text-3xl font-bold text-slate-800">Paso 3: Mediciones Actuales</h2>
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
                    <p className="text-sm text-slate-600">Rango ideal para lechugas: 5.5 - 6.5</p>
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
                    <p className="text-sm text-slate-600">Nivel de nutrientes en µS/cm - Valores seguros</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">
                        Valor de EC: <span className="font-bold text-blue-600">{config.ec} µS/cm</span>
                      </label>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        parseFloat(config.ec) >= 800 && parseFloat(config.ec) <= 1500 
                          ? 'bg-green-100 text-green-800' 
                          : parseFloat(config.ec) > 1500 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {parseFloat(config.ec) > 1500 ? 'DEMASIADO ALTA' : 
                         parseFloat(config.ec) < 800 ? 'DEMASIADO BAJA' : 'ÓPTIMA'}
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
                      <span className="font-bold text-green-600">800-1500</span>
                      <span>3000</span>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Rangos seguros para lechugas:</strong><br/>
                        • Plántulas: 600-800 µS/cm<br/>
                        • Crecimiento: 800-1200 µS/cm<br/>
                        • Maduración: 1200-1500 µS/cm
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
              <h2 className="text-3xl font-bold text-slate-800">Paso 4: Configurar Torre</h2>
              <p className="text-slate-600">Añade plantas a tu sistema hidropónico con EC optimizado</p>
            </div>
            
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TreePine className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Sistema Escalonado 5-5-5</h3>
                  <p className="text-sm text-slate-600">15 plantas en 3 niveles de desarrollo con EC seguro</p>
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
                              {level === 1 ? 'Plántula (600-800)' : 
                               level === 2 ? 'Crecimiento (800-1200)' : 
                               'Madura (1200-1500)'}
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
                                EC óptimo: {plant.l === 1 ? '600-800 µS/cm' : 
                                           plant.l === 2 ? '800-1200 µS/cm' : 
                                           '1200-1500 µS/cm'}
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control - EC Optimizado</h1>
          <p className="text-slate-600">Sistema hidropónico con cálculo EC escalonado seguro para lechugas</p>
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
      
      {/* Panel de medidores de parámetros actuales */}
      <DashboardMetricsPanel config={config} measurements={measurements} />
      
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
              <p className="text-sm text-slate-600">Sistema 5-5-5 con EC seguro</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Plántulas (N1):</span>
              <span className="font-bold text-cyan-600">{plantStats.seedlingCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Crecimiento (N2):</span>
              <span className="font-bold text-green-600">{plantStats.growthCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Maduras (N3):</span>
              <span className="font-bold text-emerald-600">{plantStats.matureCount}/5</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex justify-between">
              <span className="font-bold text-slate-800">Total plantas</span>
              <span className="font-bold text-blue-600">{plants.length}/15</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              EC objetivo: {config.targetEC} µS/cm (optimizado)
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
              <p className="text-sm text-slate-600">AQUA VEGA A+B con dosis segura</p>
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
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 text-center">
                  {aquaVegaDosage.note}
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
              <span className="font-bold text-blue-600">{config.currentVol}L / {config.totalVol}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Temperatura:</span>
              <span className={`font-bold ${
                parseFloat(config.temp) > 28 ? 'text-red-600' : 
                parseFloat(config.temp) < 18 ? 'text-blue-600' : 
                'text-green-600'
              }`}>
                {config.temp}°C
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">pH actual:</span>
              <span className={`font-bold ${
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.8 ? 'text-red-600' :
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ph}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">EC actual:</span>
              <span className={`font-bold ${
                parseFloat(config.ec) > parseFloat(config.targetEC) + 250 ? 'text-red-600' :
                parseFloat(config.ec) < parseFloat(config.targetEC) - 250 ? 'text-amber-600' :
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
          onClick={handleRegisterClean}
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

  const MeasurementsTab = () => {
    // Cálculo de ajuste de pH para el valor medido
    const phAdjustmentManual = calculatePHAdjustment(
      parseFloat(measurements.manualPH),
      parseFloat(config.targetPH),
      config.waterType,
      parseFloat(measurements.manualVolume || config.currentVol)
    );

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Mediciones Manuales - Valores Seguros</h2>
            <p className="text-slate-600">Introduce los parámetros medidos de tu sistema</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800">
              Última: {new Date(measurements.lastMeasurement).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* pH Medido */}
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">pH Medido</h3>
                <p className="text-sm text-slate-600">Rango ideal para lechugas: 5.5 - 6.5</p>
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
                
                <div className={`mt-4 p-4 rounded-xl border-2 ${
                  Math.abs(parseFloat(measurements.manualPH) - parseFloat(config.targetPH)) > 0.8 
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' 
                    : Math.abs(parseFloat(measurements.manualPH) - parseFloat(config.targetPH)) > 0.5
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
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
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700">pH actual:</span>
                      <span className="font-bold text-purple-600">{measurements.manualPH}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">pH objetivo:</span>
                      <span className="font-bold text-green-600">{config.targetPH}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Diferencia:</span>
                      <span className="font-bold text-slate-800">
                        {Math.abs(parseFloat(measurements.manualPH) - parseFloat(config.targetPH)).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  {parseFloat(measurements.manualPH) > parseFloat(config.targetPH) + 0.5 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <p className="text-sm font-bold text-purple-700 mb-1">📋 Corrección requerida:</p>
                      <p className="text-sm text-purple-800">
                        Añadir <span className="font-bold">{phAdjustmentManual.phMinus}ml de pH-</span> 
                        y mezclar bien durante 2 minutos
                      </p>
                    </div>
                  )}
                  
                  {parseFloat(measurements.manualPH) < parseFloat(config.targetPH) - 0.5 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                      <p className="text-sm font-bold text-pink-700 mb-1">📋 Corrección requerida:</p>
                      <p className="text-sm text-pink-800">
                        Añadir <span className="font-bold">{phAdjustmentManual.phPlus}ml de pH+</span> 
                        y mezclar bien durante 2 minutos
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          {/* EC Medida */}
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">EC Medida</h3>
                <p className="text-sm text-slate-600">Nivel de nutrientes en µS/cm - Valores seguros</p>
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
                  <span className="font-bold text-green-600">800-1500</span>
                  <span>3000</span>
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">Estado:</span>
                    <Badge className={
                      parseFloat(measurements.manualEC) >= 800 && parseFloat(measurements.manualEC) <= 1500 
                        ? "bg-green-100 text-green-800"
                        : parseFloat(measurements.manualEC) > 1500
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }>
                      {parseFloat(measurements.manualEC) > 1500 ? "DEMASIADO ALTA" :
                       parseFloat(measurements.manualEC) < 800 ? "DEMASIADO BAJA" :
                       "DENTRO DE RANGO"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700">EC actual:</span>
                      <span className="font-bold text-blue-600">{measurements.manualEC} µS/cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">EC objetivo:</span>
                      <span className="font-bold text-green-600">{config.targetEC} µS/cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Diferencia:</span>
                      <span className="font-bold text-slate-800">
                        {Math.abs(parseFloat(measurements.manualEC) - parseFloat(config.targetEC))} µS/cm
                      </span>
                    </div>
                  </div>
                  
                  {parseFloat(measurements.manualEC) > parseFloat(config.targetEC) + 250 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg">
                      <p className="text-sm font-bold text-red-700 mb-1">📋 Corrección requerida:</p>
                      <p className="text-sm text-red-800">
                        Añadir {((parseFloat(measurements.manualEC) - parseFloat(config.targetEC)) / parseFloat(config.targetEC) * parseFloat(config.currentVol)).toFixed(1)}L de agua pura
                        para diluir. Mezclar bien y medir nuevamente.
                      </p>
                    </div>
                  )}
                  
                  {parseFloat(measurements.manualEC) < parseFloat(config.targetEC) - 250 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                      <p className="text-sm font-bold text-amber-700 mb-1">📋 Corrección requerida:</p>
                      <p className="text-sm text-amber-800">
                        Añadir más nutrientes. Calcular nueva dosificación en la pestaña Calculadora.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Temperatura Ambiente */}
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ThermometerSun className="text-white" size={24} />
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
                
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex items-center justify-between mb-2">
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
                    <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg">
                      <p className="text-sm font-bold text-red-700 mb-1">⚠️ Riesgo detectado:</p>
                      <p className="text-sm text-red-800">
                        Temperatura alta reduce el oxígeno disuelto. Considera:
                        <ul className="list-disc pl-4 mt-1">
                          <li>Añadir hielo en botella al depósito</li>
                          <li>Mejorar ventilación del espacio</li>
                          <li>Reducir temperatura del aire</li>
                        </ul>
                      </p>
                    </div>
                  )}
                  
                  {parseFloat(measurements.manualTemp) < 18 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <p className="text-sm font-bold text-blue-700 mb-1">📋 Recomendación:</p>
                      <p className="text-sm text-blue-800">
                        Temperatura baja ralentiza el crecimiento. Considera usar calentador de agua.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Temperatura del Agua Depósito */}
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Thermometer className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Temperatura del Agua</h3>
                <p className="text-sm text-slate-600">Depósito - Crítico para oxígeno</p>
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
                    value={measurements.manualWaterTemp || "22"}
                    onChange={(e) => setMeasurements({...measurements, manualWaterTemp: e.target.value})}
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-cyan-600"
                  />
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={measurements.manualWaterTemp || "22"}
                  onChange={(e) => setMeasurements({...measurements, manualWaterTemp: e.target.value})}
                  className="w-full h-2 bg-gradient-to-r from-blue-300 via-green-300 to-red-300 rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>0°</span>
                  <span className="font-bold text-green-600">18-22°</span>
                  <span>40°</span>
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">Estado:</span>
                    <Badge className={
                      parseFloat(measurements.manualWaterTemp || "22") >= 18 && parseFloat(measurements.manualWaterTemp || "22") <= 22
                        ? "bg-green-100 text-green-800"
                        : parseFloat(measurements.manualWaterTemp || "22") > 22
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }>
                      {parseFloat(measurements.manualWaterTemp || "22") > 22 ? "DEMASIADO CALIENTE" :
                       parseFloat(measurements.manualWaterTemp || "22") < 18 ? "DEMASIADO FRÍA" :
                       "ÓPTIMA"}
                    </Badge>
                  </div>
                  
                  {parseFloat(measurements.manualWaterTemp || "22") > 22 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg">
                      <p className="text-sm font-bold text-red-700 mb-1">⚠️ Peligro detectado:</p>
                      <p className="text-sm text-red-800">
                        Agua caliente favorece patógenos como Pythium. Acciones inmediatas:
                        <ul className="list-disc pl-4 mt-1">
                          <li>Añadir hielo en botellas selladas</li>
                          <li>Colocar depósito en zona más fresca</li>
                          <li>Considerar enfriador de agua</li>
                        </ul>
                      </p>
                    </div>
                  )}
                  
                  {parseFloat(measurements.manualWaterTemp || "22") < 18 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <p className="text-sm font-bold text-blue-700 mb-1">📋 Recomendación:</p>
                      <p className="text-sm text-blue-800">
                        Agua fría reduce absorción de nutrientes. Considera usar calentador de acuario ajustado a 20°C.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Volumen Depósito */}
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Droplets className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Volumen del Depósito</h3>
                <p className="text-sm text-slate-600">Agua actual disponible</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Volumen (L): 
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={config.totalVol}
                    step="1"
                    value={measurements.manualVolume || config.currentVol}
                    onChange={(e) => setMeasurements({...measurements, manualVolume: e.target.value})}
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-blue-600"
                  />
                </div>
                
                <input
                  type="range"
                  min="0"
                  max={config.totalVol}
                  step="1"
                  value={measurements.manualVolume || config.currentVol}
                  onChange={(e) => setMeasurements({...measurements, manualVolume: e.target.value})}
                  className="w-full h-2 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>0L</span>
                  <span className="font-bold text-blue-600">{measurements.manualVolume || config.currentVol}L</span>
                  <span>{config.totalVol}L</span>
                </div>
                
                <div className="mt-4">
                  <Progress 
                    value={(parseFloat(measurements.manualVolume || config.currentVol) / parseFloat(config.totalVol)) * 100} 
                    className="h-3"
                  />
                </div>
                
                <div className={`mt-4 p-4 rounded-lg ${
                  parseFloat(measurements.manualVolume || config.currentVol) >= parseFloat(config.totalVol) * 0.45
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
                    : parseFloat(measurements.manualVolume || config.currentVol) >= parseFloat(config.totalVol) * 0.25
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">Estado:</span>
                    <Badge className={
                      parseFloat(measurements.manualVolume || config.currentVol) >= parseFloat(config.totalVol) * 0.45
                        ? "bg-green-100 text-green-800"
                        : parseFloat(measurements.manualVolume || config.currentVol) >= parseFloat(config.totalVol) * 0.25
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }>
                      {parseFloat(measurements.manualVolume || config.currentVol) >= parseFloat(config.totalVol) * 0.45
                        ? "ADEQUADO"
                        : parseFloat(measurements.manualVolume || config.currentVol) >= parseFloat(config.totalVol) * 0.25
                        ? "BAJO"
                        : "MUY BAJO"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Volumen actual:</span>
                      <span className="font-bold text-blue-600">{measurements.manualVolume || config.currentVol}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Capacidad total:</span>
                      <span className="font-bold text-slate-800">{config.totalVol}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Disponible:</span>
                      <span className="font-bold text-emerald-600">
                        {(parseFloat(config.totalVol) - parseFloat(measurements.manualVolume || config.currentVol)).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                  
                  {parseFloat(measurements.manualVolume || config.currentVol) < parseFloat(config.totalVol) * 0.45 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                      <p className="text-sm font-bold text-amber-700 mb-1">📋 Acción recomendada:</p>
                      <p className="text-sm text-amber-800">
                        Rellenar con {(parseFloat(config.totalVol) - parseFloat(measurements.manualVolume || config.currentVol)).toFixed(1)}L de agua
                        {config.waterType === "osmosis" ? " de ósmosis" : ""}.
                        {calmagNeeded.required && " No olvides añadir CalMag antes de los nutrientes."}
                      </p>
                    </div>
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
            Guardar Medición Completa
          </Button>
        </div>
      </div>
    );
  };

  const CalculatorTab = () => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Calculadora Completa - EC Optimizado</h2>
      <p className="text-slate-600">Cálculos exactos para tu sistema hidropónico con valores seguros</p>
    </div>
    
    {/* Cálculo EC escalonado */}
    <StagedECCalculator 
      plants={plants}
      waterType={config.waterType}
      onECCalculated={handleECCalculated}
      selectedMethod={selectedECMethod}
      onMethodChange={handleECMethodChange}
    />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cálculo AQUA VEGA */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <FlaskConical className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Dosis AQUA VEGA Optimizada</h3>
            <p className="text-sm text-slate-600">Para {config.currentVol}L de agua - Valores seguros</p>
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
                <p className="text-center text-xs text-slate-500 mt-1">
                  {aquaVegaDosage.note}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-700 mb-3">📝 Instrucciones de mezcla optimizadas</h4>
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
                  <span>Esperar 15-30 minutos para estabilización</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{calmagNeeded.required ? "6" : "5"}</span>
                  <span>Medir EC: objetivo <strong>{config.targetEC} µS/cm</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{calmagNeeded.required ? "7" : "6"}</span>
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
              <h3 className="font-bold text-slate-800">Ajuste de pH Optimizado</h3>
              <p className="text-sm text-slate-600">De {config.ph} a {config.targetPH} - Tolerancia ampliada</p>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${
            Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.8 
              ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' 
              : Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className="text-center">
              <p className="text-sm text-slate-700 mb-3">
                pH actual: <span className="font-bold">{config.ph}</span> → 
                Objetivo: <span className="font-bold">{config.targetPH}</span>
              </p>
              
              {parseFloat(config.ph) > parseFloat(config.targetPH) + 0.3 ? (
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {phAdjustment.phMinus} ml
                  </div>
                  <p className="text-lg font-bold text-purple-700">pH- (Ácido)</p>
                  <p className="text-sm text-slate-600 mt-2">Reducir pH - Ajuste necesario</p>
                </div>
              ) : parseFloat(config.ph) < parseFloat(config.targetPH) - 0.3 ? (
                <div>
                  <div className="text-3xl font-bold text-pink-600 mb-2">
                    {phAdjustment.phPlus} ml
                  </div>
                  <p className="text-lg font-bold text-pink-700">pH+ (Alcalino)</p>
                  <p className="text-sm text-slate-600 mt-2">Aumentar pH - Ajuste necesario</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    0 ml
                  </div>
                  <p className="text-lg font-bold text-green-700">✅ pH ÓPTIMO</p>
                  <p className="text-sm text-slate-600 mt-2">No se requiere ajuste</p>
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
              
              {calmagNeeded.required && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">{calmagNeeded.reason}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {calmagNeeded.instructions}
                  </p>
                </div>
              )}
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
        <h2 className="text-2xl font-bold text-slate-800">Gestión de la Torre - EC Optimizado</h2>
        <p className="text-slate-600">Sistema escalonado 5-5-5 con valores seguros de EC</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sprout className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Nivel 1 - Plántulas</h3>
              <p className="text-sm text-slate-600">Plantas jóvenes (600-800 µS/cm)</p>
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
                    <p className="text-xs text-slate-500">Posición {plant.p} • EC: 600-800</p>
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
                <p className="text-xs text-slate-400">EC recomendado: 600-800 µS/cm</p>
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
              <p className="text-sm text-slate-600">Plantas en desarrollo (800-1200 µS/cm)</p>
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
                    <p className="text-xs text-slate-500">Posición {plant.p} • EC: 800-1200</p>
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
                <p className="text-xs text-slate-400">EC recomendado: 800-1200 µS/cm</p>
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
              <p className="text-sm text-slate-600">Plantas listas para cosechar (1200-1500 µS/cm)</p>
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
                    <p className="text-xs text-slate-500">Posición {plant.p} • EC: 1200-1500</p>
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
                <p className="text-xs text-slate-400">EC recomendado: 1200-1500 µS/cm</p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Calendario de Mantenimiento</h2>
            <p className="text-slate-600">Planificación de tareas del sistema - Optimizado para móvil</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              {monthNames[currentMonth]} {currentYear}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegisterClean}
            >
              <ShieldAlert className="mr-2" size={16} />
              Limpieza Hecha
            </Button>
          </div>
        </div>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Calendario Inteligente</h3>
              <p className="text-sm text-slate-600">Tareas programadas automáticamente según tus plantas - Optimizado para iPhone</p>
            </div>
          </div>
          
          {/* Días de la semana - Optimizado para móvil */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day, index) => (
              <div 
                key={day} 
                className={`text-center font-bold py-2 rounded-lg text-xs sm:text-sm ${
                  index >= 5 
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700" 
                    : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Días del mes - Optimizado para iPhone */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isToday = day.date.toDateString() === now.toDateString();
              const hasEvents = day.events.length > 0;
              const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
              
              return (
                <div
                  key={index}
                  className={`min-h-[70px] sm:min-h-28 p-1 sm:p-2 rounded-lg border-2 transition-all duration-200 ${
                    isToday
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                      : !day.isCurrentMonth
                      ? 'border-slate-100 bg-slate-50 text-slate-400'
                      : isWeekend
                      ? 'border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50'
                      : 'border-slate-200 bg-white'
                  } ${hasEvents ? 'shadow-sm' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm sm:text-lg font-bold ${
                      isToday 
                        ? 'text-blue-600' 
                        : !day.isCurrentMonth 
                        ? 'text-slate-300' 
                        : 'text-slate-800'
                    }`}>
                      {day.dayOfMonth}
                    </span>
                    
                    {isToday && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs px-1 sm:px-2">
                        Hoy
                      </Badge>
                    )}
                  </div>
                  
                  {/* Eventos - Optimizados para pantallas pequeñas */}
                  <div className="space-y-0.5 sm:space-y-1">
                    {day.events.includes('measure') && (
                      <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity size={10} className="text-white" />
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs font-bold text-blue-800">Medir</p>
                          <p className="text-xs text-blue-600">pH, EC, temperatura</p>
                        </div>
                      </div>
                    )}
                    
                    {day.events.includes('rotation') && (
                      <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <RotateCcw size={10} className="text-white" />
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs font-bold text-green-800">Rotar</p>
                          <p className="text-xs text-green-600">Niveles de plantas</p>
                        </div>
                      </div>
                    )}
                    
                    {day.events.includes('clean') && (
                      <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShieldAlert size={10} className="text-white" />
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs font-bold text-purple-800">Limpiar</p>
                          <p className="text-xs text-purple-600">Sistema completo</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Indicador móvil de eventos */}
                  {hasEvents && (
                    <div className="sm:hidden mt-1 flex justify-center">
                      <div className="flex gap-1">
                        {day.events.includes('measure') && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                        {day.events.includes('rotation') && (
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        )}
                        {day.events.includes('clean') && (
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Indicador si no hay eventos */}
                  {!hasEvents && day.isCurrentMonth && (
                    <div className="mt-1 sm:mt-2 text-center">
                      <p className="text-xs text-slate-400 italic hidden sm:block">Sin tareas</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Leyenda - Optimizada para móvil */}
          <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border-2 border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Info size={16} className="text-blue-600" />
              Leyenda de Tareas - iPhone Optimizado
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-slate-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">Medición</p>
                  <p className="text-xs text-slate-600 hidden sm:block">pH, EC, temperatura</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-slate-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RotateCcw size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">Rotación</p>
                  <p className="text-xs text-slate-600 hidden sm:block">Mover niveles de plantas</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-slate-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldAlert size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">Limpieza</p>
                  <p className="text-xs text-slate-600 hidden sm:block">Depósito y tuberías</p>
                </div>
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
        <h2 className="text-2xl font-bold text-slate-800">Cálculo de Riego Optimizado</h2>
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
                {parseFloat(measurements.manualTemp) > 25 ? "Aumenta riego +20%" :
                 parseFloat(measurements.manualTemp) > 20 ? "Aumenta riego +5%" :
                 parseFloat(measurements.manualTemp) < 15 ? "Reduce riego -15%" :
                 "Condición normal"}
              </p>
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Humedad:</span>
                <span className="font-bold text-cyan-600">{measurements.manualHumidity}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {parseFloat(measurements.manualHumidity) < 40 ? "Aumenta riego +15%" :
                 parseFloat(measurements.manualHumidity) > 70 ? "Reduce riego -15%" :
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
                {season === "summer" ? "Aumenta riego +30%" :
                 season === "winter" ? "Reduce riego -20%" :
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
        <h2 className="text-2xl font-bold text-slate-800">Consejos y Mejores Prácticas - EC Optimizado</h2>
        <p className="text-slate-600">Aprende a optimizar tu sistema hidropónico con valores seguros</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Calculator className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Cálculo EC Seguro para Lechugas</h3>
              <p className="text-sm text-slate-600">3 métodos con valores optimizados</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Método escalonado:</strong> Da más peso a plantas maduras pero protege plántulas. Ideal para múltiples etapas.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Método promedio:</strong> Simple y efectivo cuando todas las plantas están en etapas similares.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Método conservador:</strong> Usa el EC más bajo + protección extra. Ideal para plántulas o variedades sensibles.
              </p>
            </div>
            
            <div className="p-3 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>Rangos seguros:</strong> Plántulas: 600-800, Crecimiento: 800-1200, Maduración: 1200-1500 µS/cm
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
              <h3 className="font-bold text-slate-800">Agua de Ósmosis - Protocolo Especial</h3>
              <p className="text-sm text-slate-600">Valores optimizados para agua pura</p>
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
            
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>EC inicial:</strong> Comenzar con EC 600-800 para plántulas, incrementar gradualmente.
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
              <h3 className="font-bold text-slate-800">6 Variedades de Lechuga - EC Optimizado</h3>
              <p className="text-sm text-slate-600">Parámetros específicos con valores seguros</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>Iceberg:</strong> Muy sensible al exceso de sales. Usar EC conservador (600-1400).
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Lollo Rosso:</strong> Tolerancia media. Puede manejar EC ligeramente más alta para color (700-1500).
              </p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Hoja de Roble Rojo:</strong> Variedad más tolerante. Puede manejar EC más alta en maduración (700-1600).
              </p>
            </div>
            
            <div className="p-3 bg-lime-50 rounded-lg">
              <p className="text-sm text-lime-800">
                <strong>Trocadero:</strong> Muy sensible en plántula. Requiere EC baja inicial (600-1300).
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
              <h3 className="font-bold text-slate-800">Nutrición AQUA VEGA Optimizada</h3>
              <p className="text-sm text-slate-600">AQUA VEGA A+B con dosis segura</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Orden correcto:</strong> Agua → CalMag → AQUA VEGA A → Mezclar → AQUA VEGA B → Mezclar → Esperar → pH-.
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
            
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Esperar estabilización:</strong> 15-30 minutos después de añadir nutrientes antes de ajustar pH.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const ProfessionalTipsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Consejos Profesionales - EC Optimizado</h2>
          <p className="text-slate-600">Técnicas avanzadas para cultivo hidropónico con valores seguros</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          Nivel: Avanzado - Valores Seguros
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consejo 1 */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Optimización de EC Segura</h3>
              <p className="text-sm text-slate-600">Técnicas profesionales con protección</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-bold text-blue-700 mb-2">🔬 EC Dinámica Segura</h4>
              <p className="text-sm text-slate-700">
                Ajusta la EC según la tasa de absorción. Si las plantas beben más agua que nutrientes (EC sube &gt;1500), reducir inmediatamente.
              </p>
            </div>
            
            <div className="p-4 bg-cyan-50 rounded-xl">
              <h4 className="font-bold text-cyan-700 mb-2">📊 Monitorización Continua</h4>
              <p className="text-sm text-slate-700">
                Instala sensores de EC continuos para detectar tendencias antes de que se conviertan en problemas graves.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-bold text-purple-700 mb-2">🌡️ EC vs Temperatura Segura</h4>
              <p className="text-sm text-slate-700">
                En temperaturas altas (&gt;25°C), reducir EC 15% para compensar mayor transpiración y prevenir quemaduras.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Consejo 2 */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Gestión de Nutrientes Segura</h3>
              <p className="text-sm text-slate-600">AQUA VEGA profesional con límites</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <h4 className="font-bold text-emerald-700 mb-2">⚗️ Mezcla Perfecta Segura</h4>
              <p className="text-sm text-slate-700">
                Siempre añadir AQUA VEGA A primero, mezclar 2 minutos, luego B. Nunca superar 1500 µS/cm para lechugas.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="font-bold text-green-700 mb-2">💧 Prevención de Precipitados</h4>
              <p className="text-sm text-slate-700">
                Mantener pH entre 5.8-6.2 para evitar precipitación de calcio. Si el agua se enturbia, ajustar pH inmediatamente.
              </p>
            </div>
            
            <div className="p-4 bg-lime-50 rounded-xl">
              <h4 className="font-bold text-lime-700 mb-2">🔄 Renovación de Solución</h4>
              <p className="text-sm text-slate-700">
                Cambiar completamente la solución cada 2-3 semanas para evitar acumulación de sales y desequilibrios.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Consejo 3 */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Thermometer className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Control de Temperatura Seguro</h3>
              <p className="text-sm text-slate-600">Técnicas avanzadas con límites</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl">
              <h4 className="font-bold text-amber-700 mb-2">❄️ Enfriamiento Pasivo Seguro</h4>
              <p className="text-sm text-slate-700">
                Usar botellas de hielo en el depósito durante olas de calor. Cambiar cada 6 horas para mantener 18-22°C.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-xl">
              <h4 className="font-bold text-orange-700 mb-2">🌊 Oxigenación Crítica</h4>
              <p className="text-sm text-slate-700">
                En agua caliente (&gt;22°C), el oxígeno disminuye. Añadir piedra difusora adicional o aumentar frecuencia de bombeo.
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-xl">
              <h4 className="font-bold text-red-700 mb-2">⚠️ Temperaturas Críticas Seguras</h4>
              <p className="text-sm text-slate-700">
                Por encima de 28°C: riesgo de Pythium. Por debajo de 15°C: crecimiento muy lento. Monitorizar continuamente.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Consejo 4 */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <GitCompare className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Sistema Escalonado Seguro</h3>
              <p className="text-sm text-slate-600">Optimización 5-5-5 con EC seguro</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-bold text-purple-700 mb-2">🌱 Rotación Perfecta Segura</h4>
              <p className="text-sm text-slate-700">
                Rotar plantas cada 7 días exactamente. Mantener ciclo continuo para cosecha semanal constante.
              </p>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-xl">
              <h4 className="font-bold text-pink-700 mb-2">🎯 EC por Etapa Segura</h4>
              <p className="text-sm text-slate-700">
                Plántulas: EC baja (600-800). Crecimiento: EC media (800-1200). Maduración: EC alta (1200-1500).
              </p>
            </div>
            
            <div className="p-4 bg-rose-50 rounded-xl">
              <h4 className="font-bold text-rose-700 mb-2">📈 Optimización de Espacio Seguro</h4>
              <p className="text-sm text-slate-700">
                Variedades de hoja pequeña en niveles altos, variedades grandes en niveles bajos. Maximiza producción.
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* NUEVA SECCIÓN: Preparación de Plántulas y Lana de Roca */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <Plant className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">🌱 Preparación Profesional de Plántulas y Lana de Roca</h3>
            <p className="text-slate-600">Protocolo completo desde la germinación hasta la torre con EC seguro</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
              <h4 className="font-bold text-cyan-700 mb-3">🧼 Paso 1: Limpieza y Preparación de Plántulas</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Limpieza de raíces</p>
                    <p className="text-sm text-slate-600">Enjuagar suavemente las raíces con agua templada para eliminar restos de tierra o sustrato.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Desinfección (opcional pero recomendado)</p>
                    <p className="text-sm text-slate-600">Sumergir raíces en solución de agua oxigenada al 3% (1ml por litro) durante 5 minutos.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Recorte de raíces dañadas</p>
                    <p className="text-sm text-slate-600">Con tijeras esterilizadas, cortar raíces marrones o dañadas. Dejar solo raíces blancas y sanas.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
              <h4 className="font-bold text-emerald-700 mb-3">📏 Paso 2: Preparación de Dados de Lana de Roca 2.5cm</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Acondicionamiento del pH</p>
                    <p className="text-sm text-slate-600">Remojar los dados en agua con pH 5.5 durante 24 horas para estabilizar su pH natural (alcalino).</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Humedecimiento uniforme</p>
                    <p className="text-sm text-slate-600">Exprimir suavemente para eliminar exceso de agua, dejando el dado húmedo pero no encharcado.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Creación del orificio</p>
                    <p className="text-sm text-slate-600">Hacer un orificio central de 1-1.5cm de profundidad usando un lápiz o herramienta similar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
              <h4 className="font-bold text-amber-700 mb-3">🌿 Paso 3: Inserción y Colocación Correcta</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Inserción de la plántula</p>
                    <p className="text-sm text-slate-600">Colocar las raíces en el orificio, asegurando que el cuello de la planta quede justo en la superficie del dado.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Sujeción suave</p>
                    <p className="text-sm text-slate-600">Apretar suavemente el dado alrededor del tallo para fijar la planta, sin aplastar el tejido vegetal.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Colocación en la cesta</p>
                    <p className="text-sm text-slate-600">Insertar el dado en la cesta de la torre, asegurando que quede firme pero sin comprimirlo excesivamente.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-purple-700 mb-3">🎯 Paso 4: Consideraciones Especiales para Torre Vertical</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Orientación de las raíces</p>
                    <p className="text-sm text-slate-600">Asegurar que las raíces apunten hacia abajo, facilitando su crecimiento hacia el flujo de nutrientes.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Espaciado correcto</p>
                    <p className="text-sm text-slate-600">Dejar al menos 2cm entre el borde del dado y la pared de la cesta para permitir expansión radicular.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Ajuste inicial de EC SEGURO</p>
                    <p className="text-sm text-slate-600">Usar EC baja (600-800 µS/cm) durante los primeros 3-5 días tras el trasplante.</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <p className="text-sm font-bold text-blue-700">💡 Consejo Pro Seguro:</p>
                  <p className="text-sm text-blue-800">
                    Los primeros 2 días mantener las plántulas en ambiente con humedad alta (70-80%) para reducir estrés del trasplante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200">
          <h4 className="font-bold text-slate-700 mb-3">⏰ Cronología Recomendada con EC Seguro</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <p className="font-bold text-cyan-700">Día 1</p>
              <p className="text-sm text-slate-600">Preparación dados y limpieza plántulas</p>
              <p className="text-xs text-cyan-600">EC: 600 µS/cm</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="font-bold text-emerald-700">Día 2-5</p>
              <p className="text-sm text-slate-600">Trasplante y adaptación</p>
              <p className="text-xs text-emerald-600">EC: 600-800 µS/cm</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="font-bold text-amber-700">Día 6+</p>
              <p className="text-sm text-slate-600">Crecimiento progresivo</p>
              <p className="text-xs text-amber-600">EC: +100/semana hasta 1500</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Sección de Problemas y Soluciones */}
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
            <AlertOctagonIcon className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Diagnóstico Rápido de Problemas - EC Optimizado</h3>
            <p className="text-slate-600">Identifica y soluciona problemas comunes con valores seguros</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
              <h4 className="font-bold text-red-700 mb-2">🍃 Hojas Amarillas</h4>
              <p className="text-sm text-slate-700 mb-2"><strong>Causa:</strong> Deficiencia de nitrógeno o pH alto</p>
              <p className="text-sm text-slate-700"><strong>Solución:</strong> Ajustar pH a 6.0 y aumentar AQUA VEGA gradualmente</p>
              <p className="text-xs text-red-600 mt-1"><strong>EC seguro:</strong> Aumentar a 1000-1200 µS/cm</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
              <h4 className="font-bold text-amber-700 mb-2">🔥 Puntas Quemadas</h4>
              <p className="text-sm text-slate-700 mb-2"><strong>Causa:</strong> Exceso de nutrientes (EC &gt;1500 µS/cm)</p>
              <p className="text-sm text-slate-700"><strong>Solución:</strong> Diluir con agua pura hasta EC 1200-1300</p>
              <p className="text-xs text-amber-600 mt-1"><strong>EC seguro:</strong> Nunca superar 1500 µS/cm</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-blue-700 mb-2">💧 Raíces Marrones</h4>
              <p className="text-sm text-slate-700 mb-2"><strong>Causa:</strong> Podredumbre radicular (temperatura &gt;25°C)</p>
              <p className="text-sm text-slate-700"><strong>Solución:</strong> Bajar temperatura a 20°C, añadir oxígeno, reducir EC</p>
              <p className="text-xs text-blue-600 mt-1"><strong>EC seguro:</strong> Reducir a 800-1000 µS/cm temporalmente</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-purple-700 mb-2">🐌 Crecimiento Lento</h4>
              <p className="text-sm text-slate-700 mb-2"><strong>Causa:</strong> Temperatura baja o EC muy baja</p>
              <p className="text-sm text-slate-700"><strong>Solución:</strong> Aumentar temperatura a 22°C, incrementar EC gradualmente</p>
              <p className="text-xs text-purple-600 mt-1"><strong>EC seguro:</strong> Aumentar 100 µS/cm cada 3 días</p>
            </div>
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
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">HydroCaru Optimizado</h1>
                <p className="text-xs text-slate-600">Cálculo EC Seguro • 6 Variedades • Valores Optimizados</p>
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
                          totalVol: "20", 
                          currentVol: "20", 
                          ph: "6.0", 
                          ec: "1000",
                          temp: "22", 
                          targetEC: "1100",
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
                          manualEC: "1000",
                          manualTemp: "22",
                          manualWaterTemp: "22",
                          manualVolume: "20",
                          manualHumidity: "65",
                          lastMeasurement: new Date().toISOString()
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

      {/* Navegación por pestañas - MODIFICADO: Sin texto, solo iconos coloridos */}
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
                  className={`flex items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                    tab === item.key 
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
      )
      }

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
            {tab === "proTips" && <ProfessionalTipsTab />}
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

      {/* Modal de Rotación */}
      <RotationModal 
        isOpen={showRotationModal}
        onClose={() => setShowRotationModal(false)}
        onConfirm={handleRotationConfirm}
        plants={plants}
      />

      {/* Footer - SIMPLIFICADO */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                alerts.some(a => a.priority === 1) ? 'bg-red-500 animate-pulse' : 'bg-green-500'
              }`} />
              <span>
                {alerts.filter(a => a.priority === 1).length > 0 
                  ? `${alerts.filter(a => a.priority === 1).length} alertas` 
                  : "Sistema estable"}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>{plants.length} plantas</span>
              <span>•</span>
              <span>EC: {config.targetEC} µS/cm</span>
              <span>•</span>
              <span>Método: {selectedECMethod || "automático"}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 
