"use client"

import React, { useState, useEffect, useMemo } from "react"
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
// COMPONENTES UI SIMPLIFICADOS (CORREGIDO: Mejor manejo del estado de plantas)
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
// CONFIGURACIÓN BASE CON EC OPTIMIZADO - SOLO AGUA DESTILADA
// ============================================================================

const WATER_TYPES = {
  "osmosis": {
    name: "Agua Destilada",
    icon: <Filter className="text-blue-500" />,
    ecBase: 0.0,
    hardness: 0,
    phBase: 7.0,
    description: "Agua destilada pura, EC casi 0. Perfecta para AQUA VEGA A y B para aguas blandas.",
    recommendation: "Usar protocolo específico: 70ml de A y B por 20L, ajustar a 1.4 mS/cm.",
    calmagRequired: true,
    isOsmosis: true
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

// VARIEDADES CON EC OPTIMIZADO (RANGOS ACTUALIZADOS BASADOS EN INVESTIGACIÓN)[citation:5][citation:7]
// Rango general para lechuga hidropónica: 1.2-1.8 mS/cm (1200-1800 µS/cm)
// Estrategia: Comenzar bajo con plántulas, aumentar gradualmente.
const VARIETIES = {
  "Iceberg": {
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    textColor: "text-cyan-700",
    ecMax: 1700, // Ajustado hacia el límite superior del rango investigado
    phIdeal: 6.0,
    // RANGOS ACTUALIZADOS: Escalado seguro desde plántula hasta maduración
    ecRanges: {
      seedling: { min: 400, optimal: 600, max: 800 },    // Inicio bajo para plántulas sensibles
      growth:   { min: 800, optimal: 1200, max: 1500 },  // Incremento durante crecimiento
      mature:   { min: 1200, optimal: 1500, max: 1700 }  // Óptimo para maduración[citation:5]
    },
    aquaVegaDosage: {
      seedling: { a: 12, b: 12, ec: 600 },
      growth:   { a: 18, b: 18, ec: 1200 },
      mature:   { a: 24, b: 24, ec: 1500 }
    },
    info: "Variedad sensible. Comenzar con EC baja y aumentar gradualmente."
  },
  "Lollo Rosso": {
    color: "bg-gradient-to-br from-purple-600 to-purple-700",
    textColor: "text-purple-700",
    ecMax: 1800, // En el límite superior del rango general
    phIdeal: 6.0,
    ecRanges: {
      seedling: { min: 500, optimal: 700, max: 900 },
      growth:   { min: 900, optimal: 1300, max: 1600 },
      mature:   { min: 1300, optimal: 1600, max: 1800 } // [citation:5]
    },
    aquaVegaDosage: {
      seedling: { a: 14, b: 14, ec: 700 },
      growth:   { a: 20, b: 20, ec: 1300 },
      mature:   { a: 26, b: 26, ec: 1600 }
    },
    info: "Tolerancia media-alta. Puede manejar EC más alta para mejor color."
  },
  "Maravilla": {
    color: "bg-gradient-to-br from-amber-600 to-amber-700",
    textColor: "text-amber-700",
    ecMax: 1700,
    phIdeal: 6.0,
    ecRanges: {
      seedling: { min: 450, optimal: 650, max: 850 },
      growth:   { min: 850, optimal: 1250, max: 1500 },
      mature:   { min: 1250, optimal: 1500, max: 1700 } // [citation:5]
    },
    aquaVegaDosage: {
      seedling: { a: 13, b: 13, ec: 650 },
      growth:   { a: 19, b: 19, ec: 1250 },
      mature:   { a: 25, b: 25, ec: 1500 }
    },
    info: "Variedad productiva. Seguir escalado gradual de EC."
  },
  "Trocadero": {
    color: "bg-gradient-to-br from-lime-600 to-lime-700",
    textColor: "text-lime-700",
    ecMax: 1600,
    phIdeal: 6.0,
    ecRanges: {
      seedling: { min: 300, optimal: 500, max: 700 },   // Muy sensible en inicio
      growth:   { min: 700, optimal: 1100, max: 1300 },
      mature:   { min: 1100, optimal: 1400, max: 1600 }
    },
    aquaVegaDosage: {
      seedling: { a: 11, b: 11, ec: 500 },
      growth:   { a: 17, b: 17, ec: 1100 },
      mature:   { a: 22, b: 22, ec: 1400 }
    },
    info: "Muy sensible en plántula. Requiere EC baja inicial y aumento lento."
  },
  "Hoja de Roble Rojo": {
    color: "bg-gradient-to-br from-red-600 to-red-700",
    textColor: "text-red-700",
    ecMax: 1800, // Tolerante a EC más alta
    phIdeal: 6.0,
    ecRanges: {
      seedling: { min: 500, optimal: 700, max: 900 },
      growth:   { min: 900, optimal: 1400, max: 1600 },
      mature:   { min: 1400, optimal: 1700, max: 1800 } // [citation:5]
    },
    aquaVegaDosage: {
      seedling: { a: 14, b: 14, ec: 700 },
      growth:   { a: 21, b: 21, ec: 1400 },
      mature:   { a: 28, b: 28, ec: 1700 }
    },
    info: "Variedad tolerante. Puede manejar EC más alta en maduración."
  },
  "Romana": {
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
    textColor: "text-blue-700",
    ecMax: 1750,
    phIdeal: 6.0,
    ecRanges: {
      seedling: { min: 450, optimal: 650, max: 850 },
      growth:   { min: 850, optimal: 1250, max: 1500 },
      mature:   { min: 1250, optimal: 1550, max: 1750 }
    },
    aquaVegaDosage: {
      seedling: { a: 13, b: 13, ec: 650 },
      growth:   { a: 19, b: 19, ec: 1250 },
      mature:   { a: 25, b: 25, ec: 1550 }
    },
    info: "Variedad robusta. EC media-alta óptima para crecimiento vertical."
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO OPTIMIZADAS (CORREGIDAS)
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
 * Calcula EC por nivel de desarrollo con factores de seguridad - MODIFICADO PARA USAR RANGOS
 */
const calculateECByLevel = (plants, waterType) => {
  const levels = {
    1: { plants: 0, totalEC: 0, minEC: Infinity, maxEC: -Infinity },
    2: { plants: 0, totalEC: 0, minEC: Infinity, maxEC: -Infinity },
    3: { plants: 0, totalEC: 0, minEC: Infinity, maxEC: -Infinity }
  };

  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;

    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";

    const ecOptimal = variety.aquaVegaDosage[stage].ec;
    const ecRange = variety.ecRanges[stage];

    // Aplicar factor de seguridad según etapa
    let safetyFactor = 1.0;
    if (plant.l === 1) safetyFactor = 0.7; // Más protección para plántulas
    else if (plant.l === 2) safetyFactor = 0.9;
    else safetyFactor = 1.1;

    const adjustedEC = ecOptimal * safetyFactor;

    // Ajustar por tipo de agua
    const waterConfig = WATER_TYPES[waterType];
    let finalEC = waterType !== "osmosis" ? Math.max(0, adjustedEC - waterConfig.ecBase) : adjustedEC;

    levels[plant.l].plants += 1;
    levels[plant.l].totalEC += finalEC;
    
    // Actualizar min y max basado en rangos específicos de la variedad
    if (ecRange.min < levels[plant.l].minEC) levels[plant.l].minEC = ecRange.min;
    if (ecRange.max > levels[plant.l].maxEC) levels[plant.l].maxEC = ecRange.max;
  });

  // Ajustar valores si no hay plantas
  Object.keys(levels).forEach(level => {
    if (levels[level].plants === 0) {
      levels[level].minEC = 0;
      levels[level].maxEC = 0;
    }
  });

  return {
    level1: {
      avg: levels[1].plants > 0 ? Math.round(levels[1].totalEC / levels[1].plants) : 0,
      min: Math.round(levels[1].minEC),
      max: Math.round(levels[1].maxEC),
      plants: levels[1].plants
    },
    level2: {
      avg: levels[2].plants > 0 ? Math.round(levels[2].totalEC / levels[2].plants) : 0,
      min: Math.round(levels[2].minEC),
      max: Math.round(levels[2].maxEC),
      plants: levels[2].plants
    },
    level3: {
      avg: levels[3].plants > 0 ? Math.round(levels[3].totalEC / levels[3].plants) : 0,
      min: Math.round(levels[3].minEC),
      max: Math.round(levels[3].maxEC),
      plants: levels[3].plants
    }
  };
};

/**
 * Calcula el rango seguro de EC para todo el sistema basado en todas las plantas
 */
const calculateSystemECRange = (plants, waterType) => {
  if (plants.length === 0) return { min: 800, max: 1500 };

  let systemMin = Infinity;
  let systemMax = -Infinity;
  let totalOptimal = 0;

  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;

    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";

    const ecRange = variety.ecRanges[stage];
    
    // Ajustar por tipo de agua
    const waterConfig = WATER_TYPES[waterType];
    let adjustedMin = waterType !== "osmosis" ? Math.max(0, ecRange.min - waterConfig.ecBase) : ecRange.min;
    let adjustedMax = waterType !== "osmosis" ? Math.max(0, ecRange.max - waterConfig.ecBase) : ecRange.max;
    let adjustedOptimal = waterType !== "osmosis" ? Math.max(0, ecRange.optimal - waterConfig.ecBase) : ecRange.optimal;

    if (adjustedMin < systemMin) systemMin = adjustedMin;
    if (adjustedMax > systemMax) systemMax = adjustedMax;
    totalOptimal += adjustedOptimal;
  });

  return {
    min: Math.round(systemMin),
    max: Math.round(systemMax),
    avg: Math.round(totalOptimal / plants.length)
  };
};

/**
 * Verifica si el EC está fuera de rango y devuelve recomendaciones específicas
 */
const checkECAlert = (currentEC, plants, waterType) => {
  const systemRange = calculateSystemECRange(plants, waterType);
  const ec = parseFloat(currentEC) || 0;
  
  if (ec === 0) return null;

  // Calcular desviación porcentual
  const deviationFromMin = ((systemRange.min - ec) / systemRange.min) * 100;
  const deviationFromMax = ((ec - systemRange.max) / systemRange.max) * 100;

  if (ec < systemRange.min) {
    // EC demasiado baja
    const severity = deviationFromMin > 30 ? 1 : deviationFromMin > 15 ? 2 : 3;
    return {
      type: 'low',
      severity,
      current: ec,
      targetMin: systemRange.min,
      targetMax: systemRange.max,
      deviation: Math.round(deviationFromMin),
      message: `EC ${ec} µS/cm está ${Math.round(deviationFromMin)}% por debajo del mínimo recomendado (${systemRange.min} µS/cm)`
    };
  } else if (ec > systemRange.max) {
    // EC demasiado alta
    const severity = deviationFromMax > 30 ? 1 : deviationFromMax > 15 ? 2 : 3;
    return {
      type: 'high',
      severity,
      current: ec,
      targetMin: systemRange.min,
      targetMax: systemRange.max,
      deviation: Math.round(deviationFromMax),
      message: `EC ${ec} µS/cm está ${Math.round(deviationFromMax)}% por encima del máximo recomendado (${systemRange.max} µS/cm)`
    };
  }

  return null;
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

  // Aplicar límites seguros basados en rangos del sistema
  const systemRange = calculateSystemECRange(plants, waterType);
  finalEC = Math.max(systemRange.min, Math.min(finalEC, systemRange.max));

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

  // Aplicar límites seguros basados en rangos del sistema
  const systemRange = calculateSystemECRange(plants, waterType);
  finalEC = Math.max(systemRange.min, Math.min(finalEC, systemRange.max));

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

  // Aplicar límite mínimo seguro basado en rangos del sistema
  const systemRange = calculateSystemECRange(plants, waterType);
  finalEC = Math.max(systemRange.min * 0.8, finalEC);

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
  const systemRange = calculateSystemECRange(plants, waterType);

  let selectedMethod = "promedio";

  // Lógica mejorada de selección de método basada en distribución de plantas
  if (stats.seedlingCount > stats.growthCount + stats.matureCount) {
    selectedMethod = "conservador"; // Muchas plántulas
  } else if (stats.matureCount > stats.growthCount && stats.matureCount > stats.seedlingCount) {
    selectedMethod = "escalonado"; // Muchas plantas maduras
  } else if (stats.growthCount > 0 && stats.matureCount > 0 && stats.seedlingCount > 0) {
    selectedMethod = "escalonado"; // Mezcla equilibrada
  }

  return {
    ...methods[selectedMethod],
    allMethods: methods,
    systemRange: systemRange
  };
};

/**
 * Calcula características del agua
 */
const getWaterCharacteristics = (waterType, osmosisMix = 0) => {
  const baseWater = WATER_TYPES[waterType] || WATER_TYPES.osmosis;
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
const calculateAquaVegaDosage = (plants, totalVolume, targetEC, waterType = "osmosis") => {
  if (plants.length === 0) {
    // Protocolo para agua destilada: 70ml de A y B por 20L para 1.4 mS/cm
    const baseDosagePer20L = 70;
    const dosage = (baseDosagePer20L * totalVolume) / 20;
    
    return { 
      a: Math.round(dosage), 
      b: Math.round(dosage), 
      per10L: { 
        a: Math.round((dosage * 10) / totalVolume), 
        b: Math.round((dosage * 10) / totalVolume) 
      }, 
      note: "Protocolo agua destilada: 70ml A+B por 20L → 1.4 mS/cm" 
    };
  }

  let totalA = 0, totalB = 0;
  let usedWaterType = WATER_TYPES[waterType] || WATER_TYPES["osmosis"];

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
      plantContribution = (dosage.a / 10) * (totalVolume / plants.length) * 1.1;
    } else {
      plantContribution = (dosage.a / 10) * (totalVolume / plants.length) * 0.9;
    }

    totalA += plantContribution;
    totalB += plantContribution;
  });

  let ecRatio = parseFloat(targetEC) / 1100;

  if (waterType === "osmosis") {
    ecRatio = parseFloat(targetEC) / 1200;
  } else if (usedWaterType.hardness > 150) {
    ecRatio *= 0.85;
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
    adjustmentFactor = 0.7;
    bufferStrength = 0.5;
  }

  const adjustment = Math.abs(phDiff) * volume * 0.1 * adjustmentFactor;

  let recommendation = "";
  if (phDiff > 0.3) {
    recommendation = `pH demasiado alto (${currentPH}). Añadir ${adjustment.toFixed(1)}ml de pH- (ácido cítrico). Mezclar bien y esperar 15 minutos antes de medir de nuevo.`;
  } else if (phDiff < -0.3) {
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
    critical: Math.abs(phDiff) > 0.8
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
 * Calcula riego para torre vertical en Castellón optimizado - CORREGIDO
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
      secondsPerCycle: "0",
      pumpPower,
      rockwoolCubes,
      location: "Castellón de la Plana",
      recommendations: ["Añade plantas al sistema para calcular riego"],
      notes: ["Basado en observación real: 6 segundos empapan lana de roca"]
    };
  }

  // Cálculo REVISADO: necesidades de agua más precisas
  plants.forEach(plant => {
    let waterPerPlant = 0.25; // REDUCIDO: 0.25L/día base (era 0.35L)

    // Ajustar por nivel de crecimiento
    if (plant.l === 1) waterPerPlant *= 0.5; // Plántula
    else if (plant.l === 2) waterPerPlant *= 0.8; // Crecimiento
    else waterPerPlant *= 1.0; // Madura

    // Ajustar por variedad
    const variety = VARIETIES[plant.v];
    if (variety) {
      if (plant.v === "Iceberg") waterPerPlant *= 1.0;
      else if (plant.v === "Lollo Rosso") waterPerPlant *= 0.8;
      else if (plant.v === "Hoja de Roble Rojo") waterPerPlant *= 1.1;
    }

    totalWaterNeeds += waterPerPlant;
  });

  // Ajustar por temperatura y humedad de Castellón
  let tempFactor = 1.0;
  if (temp > 28) tempFactor = 1.3;    // Muy caliente
  else if (temp > 25) tempFactor = 1.2;
  else if (temp > 20) tempFactor = 1.1;
  else if (temp < 15) tempFactor = 0.9;
  else if (temp < 10) tempFactor = 0.8;

  let humidityFactor = 1.0;
  if (humidity < 40) humidityFactor = 1.2;   // Muy seco
  else if (humidity < 50) humidityFactor = 1.1;
  else if (humidity > 70) humidityFactor = 0.9;
  else if (humidity > 80) humidityFactor = 0.8;

  // Ajustar por estación en Castellón
  let seasonFactor = 1.0;
  if (season === "summer") seasonFactor = 1.4;   // Verano muy seco en Castellón
  else if (season === "winter") seasonFactor = 0.7; // Invierno húmedo

  totalWaterNeeds = totalWaterNeeds * tempFactor * humidityFactor * seasonFactor;

  // CÁLCULO REVISADO BASADO EN OBSERVACIÓN REAL
  
  // 1. Primero calculamos el tiempo total diario de bomba necesario
  // Suponiendo un caudal alto (porque 6 segundos empapan)
  // Estimación: si 6 segundos empapan, probablemente caudal ≈ 1L/min por planta
  const estimatedFlowRate = 8; // L/hora - AUMENTADO por observación
  const dailyPumpHours = totalWaterNeeds / estimatedFlowRate;
  const dailyPumpMinutes = dailyPumpHours * 60;
  const dailyPumpSeconds = dailyPumpMinutes * 60;

  // 2. Determinamos número de ciclos basado en temperatura (observación real)
  let cyclesPerDay;
  if (temp > 28) {
    cyclesPerDay = 12; // Verano caluroso: cada 2 horas
  } else if (temp > 25) {
    cyclesPerDay = 10; // Verano: cada 2.4 horas
  } else if (temp > 20) {
    cyclesPerDay = 8;  // Primavera/Otoño: cada 3 horas
  } else if (temp > 15) {
    cyclesPerDay = 6;  // Templado: cada 4 horas
  } else {
    cyclesPerDay = 4;  // Invierno: cada 6 horas
  }

  // 3. Ajustar por humedad
  if (humidity < 40) cyclesPerDay += 2;   // Aire seco → más ciclos
  if (humidity > 70) cyclesPerDay -= 2;   // Aire húmedo → menos ciclos
  
  // 4. Límites seguros
  cyclesPerDay = Math.max(4, Math.min(cyclesPerDay, 16));
  
  // 5. CALCULO CLAVE: Tiempo por ciclo BASADO EN TU OBSERVACIÓN
  // Si 6 segundos empapan, usamos 4-8 segundos como rango
  let secondsPerCycle;
  if (temp > 25) {
    secondsPerCycle = 8;  // Verano: 8 segundos (evaporación alta)
  } else if (temp > 20) {
    secondsPerCycle = 6;  // Templado-cálido: 6 segundos
  } else {
    secondsPerCycle = 4;  // Frío: 4 segundos (menor evaporación)
  }
  
  // Ajuste por humedad
  if (humidity < 40) secondsPerCycle += 2;  // Aire seco → más tiempo
  if (humidity > 70) secondsPerCycle -= 1;  // Aire húmedo → menos tiempo
  
  // Límites: 3-10 segundos (basado en tu observación)
  secondsPerCycle = Math.max(3, Math.min(secondsPerCycle, 10));

  // 6. Calcular intervalo entre ciclos
  const dailyMinutes = 24 * 60;
  const intervalBetweenCycles = dailyMinutes / cyclesPerDay;
  const intervalHours = Math.floor(intervalBetweenCycles / 60);
  const intervalMinutes = Math.round(intervalBetweenCycles % 60);

  return {
    totalWaterNeeds: totalWaterNeeds.toFixed(2),
    pumpMinutesPerDay: dailyPumpMinutes.toFixed(1),
    cyclesPerDay,
    secondsPerCycle: secondsPerCycle.toFixed(0),
    intervalHours,
    intervalMinutes,
    minutesPerCycle: (secondsPerCycle / 60).toFixed(2),
    pumpPower,
    rockwoolCubes,
    location: "Castellón de la Plana",
    recommendations: [
      `⏰ ${cyclesPerDay} ciclos al día (cada ${intervalHours}h ${intervalMinutes > 0 ? intervalMinutes + 'min' : ''})`,
      `💧 ${secondsPerCycle} segundos por ciclo`,
      `📊 Necesidad diaria: ${totalWaterNeeds.toFixed(2)}L para ${plants.length} plantas`,
      season === "summer" ? "☀️ VERANO: Aumentar ciclos si la lana de roca se seca rápido" :
      season === "winter" ? "❄️ INVIERNO: Reducir ciclos si se mantiene húmeda" :
      "🌤️ OTOÑO/PRIMAVERA: Ciclos moderados",
      "⚡ AJUSTE MANUAL: Si 6s empapa → reducir a 4-5s. Si se seca rápido → aumentar a 7-8s"
    ],
    notes: [
      "Basado en tu observación: 6 segundos empapan la lana de roca",
      "Caudal estimado alto (torre con cascada eficiente)",
      "Ajustar según observación directa de humedad en lana de roca"
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
  const systemRange = calculateSystemECRange(plants, waterType);

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
  const ecAlert = checkECAlert(currentEC, plants, waterType);

  return (
    <Card className="p-6 rounded-2xl mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Calculator className="text-white" size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-xl">Cálculo EC Escalonado Optimizado</h2>
          <p className="text-slate-600">Sistema inteligente basado en variedades y niveles</p>
        </div>
      </div>

      {/* CORRECCIÓN: Ajustados los estilos para que los textos queden dentro de los cuadrados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200 min-h-[180px] flex flex-col">
          <h4 className="font-bold text-blue-700 mb-2 text-sm">Método Seleccionado</h4>
          <div className="text-3xl font-bold text-blue-600 mb-2 flex-grow flex items-center">{currentEC} µS/cm</div>
          <div className="mt-auto">
            <Badge className="bg-blue-100 text-blue-800">
              {selectedMethod || ecMethods.method}
            </Badge>
            {selectedMethod && selectedMethod !== ecMethods.method && (
              <p className="text-xs text-slate-500 mt-1">Modificado manualmente</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-b from-amber-50 to-white rounded-xl border-2 border-amber-200 min-h-[180px] flex flex-col">
          <h4 className="font-bold text-amber-700 mb-2 text-sm">Rango Seguro del Sistema</h4>
          <div className="text-3xl font-bold text-amber-600 mb-2 flex-grow flex items-center">
            {systemRange.min}-{systemRange.max} µS/cm
          </div>
          <div className="mt-auto">
            <Badge className="bg-amber-100 text-amber-800">
              Basado en {plants.length} plantas
            </Badge>
            <p className="text-xs text-slate-600 mt-1">
              {plants.length > 0 ? `Promedio: ${systemRange.avg} µS/cm` : 'Añade plantas para calcular'}
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
              <Badge className="bg-green-100 text-green-800">DENTRO DE RANGO</Badge>
            )}
            <p className="text-xs text-slate-600 mt-1">
              {ecAlert ? ecAlert.message : 'EC dentro del rango seguro'}
            </p>
          </div>
        </div>
      </div>

      {/* CORRECCIÓN: Mejorada la visualización de EC por nivel */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 mb-6">
        <h4 className="font-bold text-blue-700 mb-3">📊 EC por Nivel de Crecimiento</h4>
        <p className="text-sm text-slate-600 mb-4">Rangos específicos basados en variedades y etapas</p>

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
                      Rango: {levelData.min}-{levelData.max} µS/cm
                    </div>
                  </div>
                </div>
                
                {levelData.plants > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {level === 1 ? "🌱 Sensible a sales - Mantener EC baja" :
                       level === 2 ? "📈 Fase de crecimiento activo - EC media" :
                       "🌿 Fase de engorde - EC alta para mejor calidad"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold text-blue-700 mb-3">📈 Comparación de Métodos de Cálculo</h4>
        <p className="text-sm text-slate-600 mb-4">Selecciona el método según tu distribución de plantas</p>

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
            <p className="text-xs text-slate-500 mt-2">
              Ideal cuando hay plantas en diferentes etapas
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
            <p className="text-xs text-slate-500 mt-2">
              Para etapas similares o sistema equilibrado
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
            <p className="text-xs text-slate-500 mt-2">
              Para muchas plántulas o variedades sensibles
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            {selectedMethod
              ? `Método seleccionado manualmente: ${selectedMethod}`
              : `Método automático recomendado: ${ecMethods.method}`}
          </p>
          <Button
            variant="outline"
            onClick={() => onMethodChange && onMethodChange(null)}
            disabled={!selectedMethod}
            className="flex items-center gap-1"
          >
            <RotateCcw size={14} />
            Restaurar automático
          </Button>
        </div>
      </div>

      {/* CORRECCIÓN: Información de variedades específicas */}
      {plants.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200">
          <h4 className="font-bold text-slate-700 mb-3">🌿 Rangos de EC por Variedad</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(VARIETIES).map(([varietyName, variety]) => {
              const plantCount = plantStats.varietyCount[varietyName] || 0;
              if (plantCount === 0) return null;
              
              return (
                <div key={varietyName} className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">{varietyName}</span>
                    <Badge>{plantCount} planta{plantCount !== 1 ? 's' : ''}</Badge>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Plántula:</span>
                      <span className="font-medium">{variety.ecRanges.seedling.min}-{variety.ecRanges.seedling.max} µS/cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crecimiento:</span>
                      <span className="font-medium">{variety.ecRanges.growth.min}-{variety.ecRanges.growth.max} µS/cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Madura:</span>
                      <span className="font-medium">{variety.ecRanges.mature.min}-{variety.ecRanges.mature.max} µS/cm</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
        action: "Llenar con agua destilada",
        details: `Preparar ${volume}L de agua destilada`,
        icon: "💧"
      },
      {
        step: 2,
        action: "Añadir AQUA VEGA A",
        details: `Agregar ${aquaVegaDosage.a}ml de AQUA VEGA A para aguas blandas`,
        icon: "⚗️"
      },
      {
        step: 3,
        action: "Mezclar",
        details: "Mezclar durante 1 minuto",
        icon: "🔄"
      },
      {
        step: 4,
        action: "Añadir AQUA VEGA B",
        details: `Agregar ${aquaVegaDosage.b}ml de AQUA VEGA B para aguas blandas`,
        icon: "⚗️"
      },
      {
        step: 5,
        action: "Mezclar",
        details: "Mezclar durante 2 minutos",
        icon: "🔄"
      },
      {
        step: 6,
        action: "Esperar estabilización",
        details: "Esperar 15-30 minutos para que los nutrientes se estabilicen",
        icon: "⏰"
      },
      {
        step: 7,
        action: "Medir EC",
        details: "Verificar EC. Objetivo: 1400 µS/cm (1.4 mS/cm)",
        icon: "📊"
      },
      {
        step: 8,
        action: "Ajustar EC si es necesario",
        details: "Si EC < 1.4: añadir +3ml de A y B. Si EC > 1.4: añadir agua destilada",
        icon: "⚖️"
      },
      {
        step: 9,
        action: "Ajustar pH",
        details: "Ajustar pH a 5.8 usando ácido cítrico",
        note: "El agua destilada tiene bajo poder tampón - ajustar cuidadosamente",
        icon: "🧪"
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
          <h2 className="font-bold text-slate-800 text-xl">PROTOCOLO AGUA DESTILADA - AQUA VEGA A/B</h2>
          <p className="text-slate-600">Protocolo específico para agua destilada con AQUA VEGA para aguas blandas</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-700 mb-3">1. ✅ Protocolo Específico</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0 µS/cm</div>
            <p className="text-sm text-blue-700">EC inicial</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">70 ml</div>
            <p className="text-sm text-blue-700">AQUA VEGA A/B</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1.4 mS/cm</div>
            <p className="text-sm text-blue-700">EC objetivo</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          <strong>Nota:</strong> Con agua destilada, comenzamos desde EC 0, permitiendo control total sobre los nutrientes.
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
        <h3 className="font-bold text-blue-700 mb-3">3. 📋 Protocolo para Agua Destilada - AQUA VEGA A/B</h3>
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
        <h3 className="font-bold text-emerald-700 mb-3">✅ Ventajas del Agua Destilada + AQUA VEGA A/B</h3>
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
            <span><strong>Precisión en fórmulas:</strong> AQUA VEGA A/B para aguas blandas está diseñada para agua pura</span>
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
// COMPONENTE DE MEDIDORES CIRCULARES (VELOCÍMETROS) - MEJORADO PARA MÓVIL
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
          <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{unit}</div>
        </div>
      </div>

      {/* Etiqueta - MEJORADO: Mejor separación para móvil */}
      <div className="mt-2 sm:mt-3 text-center space-y-0.5 sm:space-y-1">
        <div className="text-xs sm:text-sm font-bold text-slate-800">{label}</div>
        <div className="text-xs text-slate-500 space-y-0.5">
          {label === "pH" && (
            <div className="flex flex-col">
              <span>Ideal: 5.5-6.5</span>
              <span className="text-xs">Actual: {value}</span>
            </div>
          )}
          {label === "EC" && (
            <div className="flex flex-col">
              <span>Ideal: 800-1500</span>
              <span className="text-xs">Actual: {value}</span>
            </div>
          )}
          {label === "Temperatura" && (
            <div className="flex flex-col">
              <span>Ideal: 18-25°C</span>
              <span className="text-xs">Actual: {value}°C</span>
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
// COMPONENTE PRINCIPAL - CON LAS MEJORAS SOLICITADAS
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
  
  // CORRECCIÓN: Nuevo estado para manejar el formulario de añadir planta en la pestaña de torre
  const [showAddPlantForm, setShowAddPlantForm] = useState(false);

  // Configuración del sistema con valores iniciales optimizados
  const [config, setConfig] = useState({
    totalVol: "20",
    currentVol: "20",
    ph: "6.0",
    ec: "1400",
    temp: "22",
    targetEC: "1400",
    targetPH: "6.0",
    waterType: "osmosis",
    hasHeater: true,
    useOsmosisMix: false,
    osmosisMixPercentage: 0,
    waterNotes: "",
    calculationMethod: "escalonado"
  });

  // Configuración de mediciones manuales con valores iniciales optimizados
  const [measurements, setMeasurements] = useState({
    manualPH: "6.0",
    manualEC: "1400",
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
          manualEC: savedMeasurements.manualEC || "1400",
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
      let newEC = "1400";

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
    setHistory([measurementRecord, ...history.slice(0, 49)]);

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

  // =================== ALERTAS OPTIMIZADAS CON RANGOS ESPECÍFICOS ===================

  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1400;
    const tPh = parseFloat(config.targetPH) || 6.0;
    const temp = parseFloat(config.temp) || 20;
    const waterType = config.waterType || "osmosis";
    const res = [];

    // Alerta para agua destilada
    if (waterType === "osmosis") {
      res.push({
        title: "AGUA DESTILADA DETECTADA",
        value: "Protocolo específico",
        description: "Activado protocolo para agua destilada + AQUA VEGA A/B para aguas blandas",
        color: "bg-gradient-to-r from-blue-700 to-cyan-800",
        icon: <Filter className="text-white" size={28} />,
        priority: 2
      });
    }

    // Alerta para agua destilada sin CalMag
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
    if (vAct < vTot * 0.25) {
      res.push({
        title: "¡AGUA MUY BAJA!",
        value: `${(vTot - vAct).toFixed(1)}L`,
        description: `Crítico: Solo queda un ${(vAct / vTot * 100).toFixed(0)}%`,
        color: "bg-gradient-to-r from-red-600 to-rose-700",
        icon: <Droplets className="text-white" size={28} />,
        priority: 1
      });
    }
    else if (vAct < vTot * 0.45) {
      res.push({
        title: "RELLENAR AGUA",
        value: `${(vTot - vAct).toFixed(1)}L`,
        description: `Depósito al ${(vAct / vTot * 100).toFixed(0)}%`,
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

    if (ph > tPh + 0.8 || ph < tPh - 0.8) {
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
    else if (ph > tPh + 0.5 || ph < tPh - 0.5) {
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

    // CORRECCIÓN: Alertas de EC optimizadas con rangos específicos
    const ecAlert = checkECAlert(ec, plants, waterType);
    if (ecAlert) {
      if (ecAlert.type === 'low') {
        const mlPerLiter = aquaVegaDosage.per10L.a / 10;
        const mlToAdd = ((ecAlert.targetMin - ec) / 100) * vAct * mlPerLiter * 0.4;
        
        if (ecAlert.severity === 1) {
          res.push({
            title: "¡FALTAN NUTRIENTES!",
            value: `${Math.round(mlToAdd)}ml A+B`,
            description: `EC ${ec} µS/cm (${ecAlert.deviation}% por debajo del mínimo). Añadir AQUA VEGA.`,
            color: "bg-gradient-to-r from-blue-800 to-cyan-800",
            icon: <FlaskConical className="text-white" size={28} />,
            priority: 1,
            details: `Rango seguro: ${ecAlert.targetMin}-${ecAlert.targetMax} µS/cm`
          });
        } else {
          res.push({
            title: "AÑADIR NUTRIENTES",
            value: `${Math.round(mlToAdd)}ml A+B`,
            description: `Subir de ${ec} a ${ecAlert.targetMin} µS/cm`,
            color: "bg-gradient-to-r from-blue-600 to-cyan-600",
            icon: <FlaskConical className="text-white" size={28} />,
            priority: 2,
            details: `Rango seguro: ${ecAlert.targetMin}-${ecAlert.targetMax} µS/cm`
          });
        }
      } else if (ecAlert.type === 'high') {
        const water = ((ec - ecAlert.targetMax) / ecAlert.targetMax * vAct).toFixed(1);
        
        if (ecAlert.severity === 1) {
          res.push({
            title: "¡EC PELIGROSAMENTE ALTA!",
            value: `${water}L AGUA`,
            description: `EC ${ec} µS/cm (${ecAlert.deviation}% por encima del máximo). Diluir URGENTE.`,
            color: "bg-gradient-to-r from-red-800 to-amber-900",
            icon: <Skull className="text-white" size={28} />,
            priority: 1,
            details: `Rango seguro: ${ecAlert.targetMin}-${ecAlert.targetMax} µS/cm`
          });
        } else {
          res.push({
            title: "DILUIR CON AGUA",
            value: `${water}L`,
            description: `EC ${ec} µS/cm > máximo seguro ${ecAlert.targetMax} µS/cm. Añadir agua sola.`,
            color: "bg-gradient-to-r from-amber-600 to-orange-600",
            icon: <AlertTriangle className="text-white" size={28} />,
            priority: 2,
            details: `Rango seguro: ${ecAlert.targetMin}-${ecAlert.targetMax} µS/cm`
          });
        }
      }
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
Hora: ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

Próxima limpieza recomendada: en 14 días`);
  };

  // =================== COMPONENTES DE PESTAÑAS CORREGIDOS ===================

  // CORRECCIÓN: DashboardMetricsPanel con layout mejorado para móvil
  const DashboardMetricsPanel = ({ config, measurements }) => {
    const getStatusText = (label, value) => {
      if (label === "pH") {
        if (value >= 5.5 && value <= 6.5) return "✅ ÓPTIMO";
        if (value < 5.0 || value > 7.0) return "⚠️ AJUSTAR";
        return "⚠️ AJUSTAR";
      } else if (label === "EC") {
        const ecAlert = checkECAlert(value, plants, config.waterType);
        if (!ecAlert) return "✅ ÓPTIMA";
        if (ecAlert.severity === 1) return "🚨 ALTA";
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

    const systemRange = calculateSystemECRange(plants, config.waterType);
    const ecAlert = checkECAlert(parseFloat(measurements.manualEC || config.ec), plants, config.waterType);

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

        <div className="space-y-8">
          {/* Medidor de pH - CORREGIDO: Layout mejorado para móvil */}
          <div className="flex flex-row items-center gap-4 p-4 bg-gradient-to-b from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            {/* Gráfico a la izquierda en móvil, a la derecha en escritorio */}
            <div className="flex-shrink-0 order-1 md:order-2">
              <CircularGauge
                value={parseFloat(measurements.manualPH || config.ph)}
                min={4}
                max={9}
                label="pH"
                unit=""
                color="purple"
                size="md"
              />
            </div>
            {/* Textos a la derecha en móvil, a la izquierda en escritorio */}
            <div className="flex-1 min-w-0 order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Activity className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-purple-700">pH del Agua</h3>
                  <p className="text-sm text-slate-600">Rango ideal: 5.5 - 6.5</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-700">Valor actual:</span>
                    <span className="text-xl md:text-2xl font-bold text-purple-600">{parseFloat(measurements.manualPH || config.ph)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Estado:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      parseFloat(measurements.manualPH || config.ph) >= 5.5 && parseFloat(measurements.manualPH || config.ph) <= 6.5
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {getStatusText("pH", parseFloat(measurements.manualPH || config.ph))}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-purple-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Objetivo:</span> {config.targetPH}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {parseFloat(measurements.manualPH || config.ph) >= 5.5 && parseFloat(measurements.manualPH || config.ph) <= 6.5
                      ? "✅ El pH está en el rango ideal para absorción de nutrientes"
                      : "⚠️ Ajustar el pH para optimizar la disponibilidad de nutrientes"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Medidor de EC - CORREGIDO: Layout mejorado para móvil */}
          <div className="flex flex-row items-center gap-4 p-4 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            {/* Gráfico a la izquierda en móvil, a la derecha en escritorio */}
            <div className="flex-shrink-0 order-1 md:order-2">
              <CircularGauge
                value={parseFloat(measurements.manualEC || config.ec)}
                min={0}
                max={3000}
                label="EC"
                unit="µS/cm"
                color={ecAlert ? (ecAlert.severity === 1 ? "red" : "amber") : "blue"}
                size="md"
              />
            </div>
            {/* Textos a la derecha en móvil, a la izquierda en escritorio */}
            <div className="flex-1 min-w-0 order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Zap className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-700">Conductividad (EC)</h3>
                  <p className="text-sm text-slate-600">Rango seguro: {systemRange.min}-{systemRange.max} µS/cm</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-700">Valor actual:</span>
                    <span className={`text-xl md:text-2xl font-bold ${
                      ecAlert ? (ecAlert.severity === 1 ? 'text-red-600' : 'text-amber-600') : 'text-blue-600'
                    }`}>
                      {parseFloat(measurements.manualEC || config.ec)} µS/cm
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Estado:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      ecAlert ? (ecAlert.severity === 1 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800') : 'bg-green-100 text-green-800'
                    }`}>
                      {getStatusText("EC", parseFloat(measurements.manualEC || config.ec))}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Rango seguro:</span> {systemRange.min}-{systemRange.max} µS/cm
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {ecAlert ? (
                      <span className={ecAlert.severity === 1 ? 'text-red-600 font-bold' : 'text-amber-600'}>
                        {ecAlert.message}
                      </span>
                    ) : (
                      "✅ La EC está en el rango seguro para todas tus plantas"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Medidor de Temperatura - CORREGIDO: Layout mejorado para móvil */}
          <div className="flex flex-row items-center gap-4 p-4 bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            {/* Gráfico a la izquierda en móvil, a la derecha en escritorio */}
            <div className="flex-shrink-0 order-1 md:order-2">
              <CircularGauge
                value={parseFloat(measurements.manualTemp || config.temp)}
                min={0}
                max={40}
                label="Temperatura"
                unit="°C"
                color="amber"
                size="md"
              />
            </div>
            {/* Textos a la derecha en móvil, a la izquierda en escritorio */}
            <div className="flex-1 min-w-0 order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Thermometer className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-700">Temperatura Ambiente</h3>
                  <p className="text-sm text-slate-600">Condiciones de crecimiento</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-700">Valor actual:</span>
                    <span className="text-xl md:text-2xl font-bold text-amber-600">{parseFloat(measurements.manualTemp || config.temp)}°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Estado:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      parseFloat(measurements.manualTemp || config.temp) >= 18 && parseFloat(measurements.manualTemp || config.temp) <= 25
                        ? 'bg-green-100 text-green-800'
                        : parseFloat(measurements.manualTemp || config.temp) > 28
                          ? 'bg-red-100 text-red-800'
                          : parseFloat(measurements.manualTemp || config.temp) < 15
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                      {getStatusText("Temperatura", parseFloat(measurements.manualTemp || config.temp))}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Rango ideal:</span> 18-25°C
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {parseFloat(measurements.manualTemp || config.temp) >= 18 && parseFloat(measurements.manualTemp || config.temp) <= 25
                      ? "✅ Temperatura óptima para crecimiento de lechugas"
                      : parseFloat(measurements.manualTemp || config.temp) > 25
                        ? "⚠️ Temperatura alta, puede reducir oxígeno en el agua"
                        : "⚠️ Temperatura baja, crecimiento más lento"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Medidor de Volumen - CORREGIDO: Layout mejorado para móvil */}
          <div className="flex flex-row items-center gap-4 p-4 bg-gradient-to-b from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
            {/* Gráfico a la izquierda en móvil, a la derecha en escritorio */}
            <div className="flex-shrink-0 order-1 md:order-2">
              <CircularGauge
                value={parseFloat(measurements.manualVolume || config.currentVol)}
                min={0}
                max={parseFloat(config.totalVol)}
                label="Volumen"
                unit="L"
                color="emerald"
                size="md"
              />
            </div>
            {/* Textos a la derecha en móvil, a la izquierda en escritorio */}
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
                    <span className="text-xl md:text-2xl font-bold text-emerald-600">{parseFloat(measurements.manualVolume || config.currentVol)}L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Capacidad total:</span>
                    <span className="font-bold text-slate-800">{config.totalVol}L</span>
                  </div>
                  <div className="mt-3">
                    <Progress
                      value={(parseFloat(measurements.manualVolume || config.currentVol) / parseFloat(config.totalVol)) * 100}
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-1">
                      <span>0L</span>
                      <span>{Math.round((parseFloat(measurements.manualVolume || config.currentVol) / parseFloat(config.totalVol)) * 100)}%</span>
                      <span>{config.totalVol}L</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Estado:</span> {getStatusText("Volumen", parseFloat(measurements.manualVolume || config.currentVol))}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(parseFloat(measurements.manualVolume || config.currentVol) / parseFloat(config.totalVol)) * 100 >= 45
                      ? "✅ Volumen adecuado para el sistema"
                      : (parseFloat(measurements.manualVolume || config.currentVol) / parseFloat(config.totalVol)) * 100 >= 25
                        ? "⚠️ Volumen bajo, considerar rellenar"
                        : "🚨 Volumen crítico, rellenar inmediatamente"}
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
                  {WATER_TYPES[config.waterType]?.name || "Agua Destilada"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                EC base: {WATER_TYPES[config.waterType]?.ecBase || "0"} µS/cm
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Temp agua:</span>
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

            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Humedad:</span>
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

  // CORRECCIÓN: IrrigationTab como componente funcional
  const IrrigationTab = () => {
    const irrigationData = useMemo(() => {
      return calculateIrrigation(
        plants,
        parseFloat(measurements.manualTemp),
        parseFloat(measurements.manualHumidity),
        season
      );
    }, [plants, measurements.manualTemp, measurements.manualHumidity, season]);

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cálculo de Riego REVISADO</h2>
          <p className="text-slate-600">Basado en observación real: 6 segundos empapan la lana de roca</p>
        </div>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <WaterDroplets className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Configuración REVISADA</h3>
              <p className="text-sm text-slate-600">Basado en tu observación real de 6 segundos</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-amber-700 mb-3">📌 OBSERVACIÓN CLAVE</h4>
            <p className="text-slate-700">
              <strong>Has observado que con solo 6 segundos de riego la lana de roca se empapa completamente.</strong>
              <br />
              Esto indica que tu sistema tiene un caudal muy alto o distribuye el agua muy eficientemente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-blue-700 mb-3">⏱️ Tiempo por Ciclo</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{irrigationData.secondsPerCycle}s</div>
                <p className="text-sm text-slate-600">Por ciclo</p>
                <p className="text-xs text-slate-500 mt-2">Basado en tu observación de 6 segundos</p>
                <div className="mt-3">
                  <Badge className="bg-blue-100 text-blue-800">
                    {irrigationData.secondsPerCycle === "6" ? "✅ Tu observación exacta" : "Ajustado por temperatura"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
              <h4 className="font-bold text-emerald-700 mb-3">🔄 Frecuencia</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600">{irrigationData.cyclesPerDay}</div>
                <p className="text-sm text-slate-600">ciclos/día</p>
                <p className="text-xs text-slate-500 mt-2">
                  Cada {irrigationData.intervalHours}h {irrigationData.intervalMinutes > 0 ? irrigationData.intervalMinutes + 'min' : ''}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
              <h4 className="font-bold text-amber-700 mb-3">💧 Agua Total</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{irrigationData.totalWaterNeeds}L</div>
                <p className="text-sm text-slate-600">por día</p>
                <p className="text-xs text-slate-500 mt-2">
                  {plants.length > 0 ? `${(parseFloat(irrigationData.totalWaterNeeds) / plants.length).toFixed(2)}L/planta` : 'Sin plantas'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border-2 border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 text-center">📋 RECOMENDACIONES BASADAS EN TU OBSERVACIÓN</h3>
            
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

            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
              <h4 className="font-bold text-cyan-700 mb-3">🎯 GUÍA DE AJUSTE MANUAL</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <h5 className="font-bold text-red-600 mb-2">SI LA LANA DE ROCA SE EMPAPA DEMASIADO:</h5>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Reducir tiempo a <strong>4-5 segundos</strong></li>
                    <li>• Aumentar intervalo entre ciclos</li>
                    <li>• Verificar que no haya goteo continuo</li>
                  </ul>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <h5 className="font-bold text-emerald-600 mb-2">SI LA LANA DE ROCA SE SECA RÁPIDO:</h5>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Aumentar tiempo a <strong>7-8 segundos</strong></li>
                    <li>• Reducir intervalo entre ciclos</li>
                    <li>• Verificar que todas las plantas reciben agua</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
            <h3 className="font-bold text-purple-800 mb-4">⚙️ Variables Consideradas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Temperatura actual:</span>
                  <span className="font-bold text-amber-600">{measurements.manualTemp}°C</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {parseFloat(measurements.manualTemp) > 25 ? "☀️ Calor → más ciclos" :
                   parseFloat(measurements.manualTemp) > 20 ? "🌤️ Templado → ciclos normales" :
                   parseFloat(measurements.manualTemp) > 15 ? "⛅ Fresco → menos ciclos" :
                   "❄️ Frío → mínimos ciclos"}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Humedad actual:</span>
                  <span className="font-bold text-cyan-600">{measurements.manualHumidity}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {parseFloat(measurements.manualHumidity) < 40 ? "🏜️ Seco → más tiempo/ciclo" :
                   parseFloat(measurements.manualHumidity) < 60 ? "✅ Ideal" :
                   "💦 Húmedo → menos tiempo/ciclo"}
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
                  {season === "summer" ? "Evaporación alta → ciclos frecuentes" :
                   season === "winter" ? "Evaporación baja → ciclos espaciados" :
                   "Condiciones moderadas"}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Plantas en sistema:</span>
                  <span className="font-bold text-blue-600">{plants.length} plantas</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {plants.length > 10 ? "Alta densidad → vigilar humedad" :
                   plants.length > 5 ? "Densidad media" :
                   "Baja densidad → ajustar según necesidad"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
            <h3 className="font-bold text-emerald-800 mb-4">📝 Protocolo de Ajuste Paso a Paso</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-800">Comienza con {irrigationData.secondsPerCycle} segundos por ciclo</p>
                  <p className="text-sm text-slate-600">Programa {irrigationData.cyclesPerDay} ciclos al día</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-800">Observa la lana de roca 1 hora después del riego</p>
                 <p className="text-sm text-slate-600">Debe estar húmeda pero no chorreando agua</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-800">Ajusta según necesidad</p>
                  <p className="text-sm text-slate-600">
                    <strong>Empapada:</strong> reduce 1-2 segundos<br />
                    <strong>Secándose rápido:</strong> aumenta 1-2 segundos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-bold text-slate-800">Revisa cada 2-3 días</p>
                  <p className="text-sm text-slate-600">Las necesidades cambian con el crecimiento de las plantas</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
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
        {/* Logo limpio y minimalista */}
        <div className="relative">
          <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl">
            <Image 
              src="/mi-imagen.jpg"
              alt="HydroCaru Logo"
              width={400}
              height={400}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
          HydroCaru Pro
        </h1>
        <p className="text-xl text-slate-600 max-w-lg mx-auto">
          Sistema experto de cultivo hidropónico con agua destilada y AQUA VEGA A/B
        </p>
      </div>

      <div className="pt-8">
        <Button
          onClick={() => setStep(1)}
          className="px-10 py-6 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <ArrowRight className="mr-2" size={24} />
          Iniciar Configuración
        </Button>
      </div>
    </div>
  );
        
      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">¡IMPORTANTE! Protocolo de Preparación para Agua Destilada</h2>
              <p className="text-slate-600">Sigue estos pasos para preparar correctamente tu sistema con agua destilada y AQUA VEGA A/B para aguas blandas</p>
            </div>

            <Card className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <AlertOctagon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">⚠️ PROTOCOLO ESPECÍFICO - AGUA DESTILADA + AQUA VEGA A/B</h3>
                  <p className="text-slate-600">Protocolo exacto según tus instrucciones con valores seguros</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                  <h4 className="font-bold text-amber-800 text-lg mb-3">📋 PASO A PASO - PROTOCOLO AGUA DESTILADA</h4>
                  <p className="text-slate-700 mb-4">
                    Protocolo específico para <strong>agua destilada</strong> y <strong>AQUA VEGA A y B para aguas blandas</strong>.
                    Sigue estrictamente esta secuencia:
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">PASO 1: Preparación de la Nueva Solución</h5>
                        <p className="text-sm text-slate-600">Llena con 20 litros de agua destilada</p>
                        <p className="text-sm text-emerald-600 font-bold mt-1">• Añade 70 ml de CANNA Aqua Vega A. Remueve manualmente durante 1 minuto</p>
                        <p className="text-sm text-emerald-600 font-bold">• Añade 70 ml de CANNA Aqua Vega B. Remueve manualmente durante 2 minutos</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">PASO 2: Estabilización y Medición Precisa</h5>
                        <p className="text-sm text-slate-600">Enciende el difusor de aire y el calentador (ajustado a 20°C)</p>
                        <p className="text-xs text-amber-600 font-bold mt-1">⚠️ Déjalos funcionar 10-15 minutos. Apaga el aireador. Espera 30 segundos</p>
                        <p className="text-sm text-emerald-600 font-bold">• Mide la EC con tu medidor (que tiene ATC). Anota el valor que muestra la pantalla</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">PASO 3: Ajuste Fino (Basado en lectura DIRECTA)</h5>
                        <p className="text-sm text-slate-600">Objetivo: 1.4 mS/cm (1400 µS/cm)</p>
                        <p className="text-sm text-emerald-600 font-bold mt-1">• Si muestra 1.4 mS/cm → Objetivo logrado. Ve al Paso 4</p>
                        <p className="text-sm text-emerald-600 font-bold">• Si muestra MENOS (ej: 1.2 o 1.3 mS/cm) → Añade +3 ml de A y +3 ml de B</p>
                        <p className="text-sm text-emerald-600 font-bold">• Si muestra MÁS (ej: 1.5 o 1.6 mS/cm) → Añade un vaso (200-300 ml) de agua destilada</p>
                        <p className="text-xs text-amber-600 font-bold mt-1">⚠️ Mezcla, estabiliza 5 min, apaga aireador y mide de nuevo. Repite hasta alcanzar 1.4</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">PASO 4: Ajuste Final del pH y Puesta en Marcha</h5>
                        <p className="text-sm text-slate-600">Con la EC en 1.4 mS/cm, ajusta el pH a 5.8</p>
                        <p className="text-sm text-emerald-600 font-bold mt-1">• Usa tu ácido cítrico (gota a gota, mezclando y midiendo)</p>
                        <p className="text-xs text-pink-600 font-bold mt-1">⚖️ Objetivo final: EC 1.4 mS/cm, pH 5.8</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
                  <h4 className="font-bold text-red-700 text-lg mb-3">🚫 ERRORES COMUNES QUE DEBES EVITAR</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> usar agua que no sea destilada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> usar otros nutrientes que no sean AQUA VEGA A y B para aguas blandas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> ajustar el pH antes de estabilizar la EC a 1.4 mS/cm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="text-red-500 mt-0.5" size={16} />
                      <span><strong>Nunca</strong> omitir los tiempos de mezcla y estabilización</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-700 text-lg mb-3">✅ CONSEJOS DE ÉXITO CON AGUA DESTILADA</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span>Usa siempre agua destilada recién abierta o almacenada correctamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span>Mide la EC con el medidor ATC después de estabilización (sin aireador)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span>Para ajustes finos: +3ml de A y B si EC baja, agua destilada si EC alta</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span>Ajusta pH gota a gota con ácido cítrico después de estabilizar EC</span>
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
                      onChange={(e) => setConfig({ ...config, totalVol: e.target.value, currentVol: e.target.value })}
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
                      onChange={(e) => setConfig({ ...config, currentVol: e.target.value })}
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

                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <strong>Nota:</strong> Este sistema está configurado específicamente para:
                    <br />• Agua destilada
                    <br />• AQUA VEGA A y B para aguas blandas
                    <br />• Protocolo: 70ml de A y B por 20L → EC objetivo 1.4 mS/cm
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
                      <span className={`px-2 py-1 rounded text-xs font-bold ${parseFloat(config.ph) >= 5.5 && parseFloat(config.ph) <= 6.5
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
                      onChange={(e) => setConfig({ ...config, ph: e.target.value })}
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
                    <p className="text-sm text-slate-600">Nivel de nutrientes en µS/cm - Protocolo agua destilada</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">
                        Valor de EC: <span className="font-bold text-blue-600">{config.ec} µS/cm</span>
                      </label>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${parseFloat(config.ec) >= 1300 && parseFloat(config.ec) <= 1500
                          ? 'bg-green-100 text-green-800'
                          : parseFloat(config.ec) > 1500
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                        {parseFloat(config.ec) > 1500 ? 'DEMASIADO ALTA' :
                          parseFloat(config.ec) < 1300 ? 'DEMASIADO BAJA' : 'ÓPTIMA'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="3000"
                      step="50"
                      value={config.ec}
                      onChange={(e) => setConfig({ ...config, ec: e.target.value })}
                      className="w-full h-2 bg-gradient-to-r from-blue-300 via-green-300 to-red-300 rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>0</span>
                      <span className="font-bold text-green-600">1300-1500</span>
                      <span>3000</span>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Protocolo agua destilada:</strong><br />
                        • Objetivo: 1400 µS/cm (1.4 mS/cm)<br />
                        • Ajuste: +3ml A+B si {'<'} 1.4, agua destilada si {'>'} 1.4<br />
                        • 70ml A+B por 20L agua destilada
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
              <p className="text-slate-600">Añade plantas a tu sistema hidropónico con agua destilada</p>
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

                  {/* CORRECCIÓN: Botón mejorado que funciona incluso después de borrar plantas */}
                  <Button
                    onClick={() => {
                      if (selPos?.l && selPos?.v && selPos?.p) {
                        // Verificar si la posición ya está ocupada
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
                        // CORRECCIÓN: Resetear solo la posición, mantener nivel y variedad seleccionados
                        setSelPos(prev => ({ ...prev, p: null }));
                      } else {
                        // Informar al usuario qué falta
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
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control - AGUA DESTILADA</h1>
          <p className="text-slate-600">Sistema hidropónico con agua destilada + AQUA VEGA A/B para aguas blandas</p>
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

      {/* Panel de diagnóstico de agua destilada */}
      <OsmosisDiagnosisPanel
        waterType={config.waterType}
        osmosisMix={config.useOsmosisMix ? config.osmosisMixPercentage : 0}
        calmagNeeded={calmagNeeded}
        volume={parseFloat(config.currentVol)}
        aquaVegaDosage={aquaVegaDosage}
      />

      {/* CORRECCIÓN: Panel de cálculo EC optimizado con rangos específicos */}
      <StagedECCalculator
        plants={plants}
        waterType={config.waterType}
        onECCalculated={handleECCalculated}
        selectedMethod={selectedECMethod}
        onMethodChange={handleECMethodChange}
      />

      {/* CORRECCIÓN: Panel de medidores de parámetros actuales - AHORA SE MUESTRA */}
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
              <p className="text-sm text-slate-600">AQUA VEGA A+B para aguas blandas</p>
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
              <span className={`font-bold ${parseFloat(config.temp) > 28 ? 'text-red-600' :
                  parseFloat(config.temp) < 18 ? 'text-blue-600' :
                    'text-green-600'
                }`}>
                {config.temp}°C
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">pH actual:</span>
              <span className={`font-bold ${Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.8 ? 'text-red-600' :
                  Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-amber-600' :
                    'text-green-600'
                }`}>
                {config.ph}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">EC actual:</span>
              <span className={`font-bold ${parseFloat(config.ec) > parseFloat(config.targetEC) + 250 ? 'text-red-600' :
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
          onClick={() => setTab("calculator")}
          variant="outline"
        >
          <Calculator className="mr-2" />
          Calculadora
        </Button>
      </div>
    </div>
  );

  // CORRECCIÓN: TowerTab con formulario de añadir planta integrado
  const TowerTab = () => {
    // Estado local para el formulario de añadir planta
    const [localSelPos, setLocalSelPos] = useState({
      l: 1,
      v: "Iceberg",
      p: null
    });

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de la Torre - AGUA DESTILADA</h2>
          <p className="text-slate-600">Sistema escalonado 5-5-5 con agua destilada</p>
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

        {/* CORRECCIÓN: Formulario de añadir planta integrado en la pestaña de torre */}
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
                  Nivel
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
                  // Verificar si la posición ya está ocupada
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
• Nivel: ${localSelPos.l}
• Posición: ${localSelPos.p}`);
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
            Rotar Niveles
          </Button>

          {/* CORRECCIÓN: Botón que siempre funciona */}
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
        <h2 className="text-2xl font-bold text-slate-800">Calculadora AGUA DESTILADA</h2>
        <p className="text-slate-600">Cálculos avanzados para tu sistema con agua destilada</p>
      </div>

      <StagedECCalculator
        plants={plants}
        waterType={config.waterType}
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
            <p className="text-slate-600">Dosificación para agua destilada</p>
          </div>
        </div>

        {plants.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                <h4 className="font-bold text-emerald-700 mb-3">AQUA VEGA A</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">{aquaVegaDosage.a} ml</div>
                  <p className="text-sm text-slate-600">Para {config.currentVol}L de agua destilada</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {aquaVegaDosage.per10L.a} ml por cada 10L
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <h4 className="font-bold text-green-700 mb-3">AQUA VEGA B</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{aquaVegaDosage.b} ml</div>
                  <p className="text-sm text-slate-600">Para {config.currentVol}L de agua destilada</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {aquaVegaDosage.per10L.b} ml por cada 10L
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-blue-700 mb-3">Protocolo Agua Destilada</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-slate-700">Añadir CalMag si es necesario: {calmagNeeded.required ? `${calmagNeeded.dosage} ml` : "No requerido"}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-slate-700">Añadir AQUA VEGA A ({aquaVegaDosage.a} ml) y mezclar durante 1 minuto</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-slate-700">Añadir AQUA VEGA B ({aquaVegaDosage.b} ml) y mezclar durante 2 minutos</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-slate-700">Esperar 15-30 minutos, medir EC y ajustar a 1400 µS/cm</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3">Notas Importantes</h4>
              <p className="text-slate-600">{aquaVegaDosage.note}</p>
              {calmagNeeded.required && (
                <p className="text-amber-600 mt-2">
                  ⚠️ {calmagNeeded.reason} Añadir {calmagNeeded.dosage} ml de CalMag antes de los nutrientes.
                </p>
              )}
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
            <h3 className="font-bold text-slate-800">Ajuste de pH</h3>
            <p className="text-slate-600">Cálculo de pH- y pH+ necesario</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200">
              <h4 className="font-bold text-pink-700 mb-3">pH- (Ácido cítrico)</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600">{phAdjustment.phMinus} ml</div>
                <p className="text-sm text-slate-600">Para bajar el pH</p>
                <p className="text-xs text-slate-500 mt-2">
                  pH actual: {config.ph} → Objetivo: {config.targetPH}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-purple-700 mb-3">pH+ (Alcalino)</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{phAdjustment.phPlus} ml</div>
                <p className="text-sm text-slate-600">Para subir el pH</p>
                <p className="text-xs text-slate-500 mt-2">
                  pH actual: {config.ph} → Objetivo: {config.targetPH}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200">
            <h4 className="font-bold text-slate-700 mb-3">Recomendación</h4>
            <p className="text-slate-600">{phAdjustment.recommendation}</p>
            {phAdjustment.critical && (
              <p className="text-red-600 mt-2 font-bold">🚨 AJUSTE URGENTE: El pH está fuera del rango seguro</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const MeasurementsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mediciones Manuales</h2>
        <p className="text-slate-600">Registra las mediciones actuales de tu sistema</p>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Clipboard className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Registro de Mediciones</h3>
            <p className="text-slate-600">Introduce los valores medidos manualmente</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                pH del Agua
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={measurements.manualPH}
                  onChange={(e) => setMeasurements({...measurements, manualPH: e.target.value})}
                  className="flex-1 h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-center font-bold text-purple-600">{measurements.manualPH}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Conductividad (EC) en µS/cm
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={measurements.manualEC}
                  onChange={(e) => setMeasurements({...measurements, manualEC: e.target.value})}
                  className="flex-1 h-2 bg-gradient-to-r from-blue-300 via-green-300 to-red-300 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-20 text-center font-bold text-blue-600">{measurements.manualEC} µS/cm</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Temperatura Ambiente (°C)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="35"
                  step="0.5"
                  value={measurements.manualTemp}
                  onChange={(e) => setMeasurements({...measurements, manualTemp: e.target.value})}
                  className="flex-1 h-2 bg-gradient-to-r from-blue-400 via-amber-400 to-red-400 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-center font-bold text-amber-600">{measurements.manualTemp}°C</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Temperatura del Agua (°C)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="0.5"
                  value={measurements.manualWaterTemp}
                  onChange={(e) => setMeasurements({...measurements, manualWaterTemp: e.target.value})}
                  className="flex-1 h-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-center font-bold text-cyan-600">{measurements.manualWaterTemp}°C</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Volumen Actual (L)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={config.totalVol}
                  step="1"
                  value={measurements.manualVolume}
                  onChange={(e) => setMeasurements({...measurements, manualVolume: e.target.value})}
                  className="flex-1 h-2 bg-gradient-to-r from-emerald-300 to-green-400 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-center font-bold text-emerald-600">{measurements.manualVolume}L</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Humedad Relativa (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="1"
                  value={measurements.manualHumidity}
                  onChange={(e) => setMeasurements({...measurements, manualHumidity: e.target.value})}
                  className="flex-1 h-2 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-center font-bold text-blue-600">{measurements.manualHumidity}%</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <Button
              onClick={saveManualMeasurement}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
            >
              <Clipboard className="mr-2" />
              Guardar Medición Completa
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
              <p className="text-slate-600">Últimas mediciones registradas</p>
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
                    <p className="text-sm text-slate-600">{record.notes || "Medición manual"}</p>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">pH</p>
                    <p className="font-bold text-blue-600">{record.ph}</p>
                  </div>
                  <div className="text-center p-2 bg-cyan-50 rounded-lg">
                    <p className="text-xs text-cyan-700">EC</p>
                    <p className="font-bold text-cyan-600">{record.ec} µS/cm</p>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-700">Temp</p>
                    <p className="font-bold text-amber-600">{record.temp}°C</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-700">Volumen</p>
                    <p className="font-bold text-emerald-600">{record.volume}L</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const CalendarTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Calendario de Mantenimiento</h2>
        <p className="text-slate-600">Planificación de tareas para tu sistema hidropónico</p>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Calendario Mensual</h3>
            <p className="text-slate-600">{new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
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
              className={`min-h-24 p-2 border rounded-lg ${day.isCurrentMonth ? 'bg-white' : 'bg-slate-50'} ${day.events.length > 0 ? 'border-blue-300' : 'border-slate-200'}`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-bold ${day.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                  {day.dayOfMonth}
                </span>
                {day.events.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {day.events.length}
                  </Badge>
                )}
              </div>
              
              <div className="mt-1 space-y-1">
                {day.events.includes('measure') && (
                  <div className="text-xs bg-cyan-50 text-cyan-700 p-1 rounded">
                    📊 Medir
                  </div>
                )}
                {day.events.includes('rotation') && (
                  <div className="text-xs bg-amber-50 text-amber-700 p-1 rounded">
                    🔄 Rotar
                  </div>
                )}
                {day.events.includes('clean') && (
                  <div className="text-xs bg-purple-50 text-purple-700 p-1 rounded">
                    🧼 Limpiar
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-700 mb-3">📅 Próximas Tareas Programadas</h4>
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
                
                // Buscar próxima rotación
                const nextRotation = calendarDays.find(day => 
                  day.isCurrentMonth && 
                  day.events.includes('rotation') && 
                  day.date > now
                );
                
                // Buscar próxima limpieza
                const nextClean = calendarDays.find(day => 
                  day.isCurrentMonth && 
                  day.events.includes('clean') && 
                  day.date > now
                );

                if (nextMeasure) {
                  nextTasks.push({
                    type: 'measure',
                    date: nextMeasure.date,
                    title: 'Próxima medición de pH y EC',
                    description: 'Control rutinario de parámetros'
                  });
                }

                if (nextRotation) {
                  nextTasks.push({
                    type: 'rotation',
                    date: nextRotation.date,
                    title: 'Próxima rotación de niveles',
                    description: 'Cosechar nivel 3, rotar plantas'
                  });
                }

                if (nextClean) {
                  nextTasks.push({
                    type: 'clean',
                    date: nextClean.date,
                    title: 'Próxima limpieza del sistema',
                    description: 'Limpieza completa del depósito'
                  });
                }

                return nextTasks
                  .sort((a, b) => a.date - b.date)
                  .slice(0, 3)
                  .map((task, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        task.type === 'measure' ? 'bg-cyan-100 text-cyan-700' :
                        task.type === 'rotation' ? 'bg-amber-100 text-amber-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {task.type === 'measure' ? '📊' :
                         task.type === 'rotation' ? '🔄' :
                         '🧼'}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Última Rotación</h4>
              <p className="text-slate-600">
                {new Date(lastRot).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {Math.floor((new Date() - new Date(lastRot)) / (1000 * 3600 * 24))} días desde última rotación
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Última Limpieza</h4>
              <p className="text-slate-600">
                {new Date(lastClean).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {Math.floor((new Date() - new Date(lastClean)) / (1000 * 3600 * 24))} días desde última limpieza
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Frecuencia de Mediciones</h4>
              <p className="text-slate-600">
                Cada {plantStats.total > 10 ? '2' : plantStats.total > 5 ? '3' : '4'} días
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Basado en {plantStats.total} plantas en el sistema
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Historial Completo</h2>
        <p className="text-slate-600">Registro de todas las actividades del sistema</p>
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
                        {record.type === 'clean' ? '🧼 Limpieza' : 
                         record.type === 'rotation' ? '🔄 Rotación' : 
                         '📊 Medición'}
                      </p>
                      <Badge className={
                        record.type === 'clean' ? 'bg-purple-100 text-purple-800' :
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
                    <div className="text-center p-2 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-700">Temperatura</p>
                      <p className="font-bold text-amber-600">{record.temp}°C</p>
                    </div>
                  )}
                  
                  {record.volume && (
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-700">Volumen</p>
                      <p className="font-bold text-emerald-600">{record.volume}L</p>
                    </div>
                  )}
                </div>

                {(record.description || record.notes) && (
                  <p className="text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                    {record.description || record.notes}
                  </p>
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
        <h2 className="text-2xl font-bold text-slate-800">Consejos Profesionales - AGUA DESTILADA</h2>
        <p className="text-slate-600">Secretos y mejores prácticas para cultivo con agua destilada y AQUA VEGA A/B</p>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Consejos Específicos para Agua Destilada</h3>
            <p className="text-slate-600">Técnicas probadas para maximizar tu producción con AQUA VEGA A/B</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
            <h4 className="font-bold text-cyan-700 mb-3">💧 Manejo del Agua Destilada y AQUA VEGA</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="text-cyan-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Protocolo exacto:</strong> Sigue siempre 70ml de A y B por 20L, ajustando a 1.4 mS/cm con +3ml o agua destilada.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-cyan-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Estabilización:</strong> Siempre espera 15-30 minutos después de mezclar antes de medir EC.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-cyan-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Medición precisa:</strong> Apaga el aireador y espera 30 segundos antes de medir EC con medidor ATC.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
            <h4 className="font-bold text-emerald-700 mb-3">🌱 Manejo de Plantas con Agua Destilada</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>CalMag obligatorio:</strong> Con agua destilada siempre añade CalMag antes de los nutrientes principales.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>pH estable:</strong> El agua destilada tiene bajo poder tampón - ajusta pH gota a gota y monitorea frecuentemente.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Ventajas:</strong> Control total sobre nutrientes, sin contaminantes, fórmulas precisas de AQUA VEGA.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-amber-700 mb-3">⚡ Solución de Problemas Comunes</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>EC baja:</strong> Añadir +3ml de AQUA VEGA A y B por cada desviación de 0.1 mS/cm por debajo de 1.4.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>EC alta:</strong> Añadir 200-300ml de agua destilada, mezclar, esperar 5min y medir de nuevo.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>pH inestable:</strong> Normal con agua destilada. Ajustar gota a gota y verificar cada 2-3 días.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <h4 className="font-bold text-purple-700 mb-3">🎯 Consejos para Lechugas con Agua Destilada</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Sprout className="text-purple-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>EC específica:</strong> Variedades sensibles como Iceberg y Trocadero pueden necesitar EC ligeramente menor (1.3 mS/cm).</span>
              </li>
              <li className="flex items-start gap-2">
                <Sprout className="text-purple-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Calidad superior:</strong> El agua destilada produce lechugas más limpias y con mejor sabor.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sprout className="text-purple-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Prevención de algas:</strong> Sin minerales en el agua inicial, hay menor riesgo de algas.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-700 mb-3">🔧 Mantenimiento del Sistema con Agua Destilada</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Limpieza:</strong> Cada 2 semanas, limpiar con agua destilada para evitar contaminación cruzada.</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Almacenamiento:</strong> Guardar agua destilada en recipientes cerrados para evitar contaminación.</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                <span><strong>Calibración:</strong> Mensualmente, calibrar medidores con soluciones estándar para máxima precisión.</span>
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
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">HydroCaru - AGUA DESTILADA</h1>
                <p className="text-xs text-slate-600">Protocolo específico: Agua destilada + AQUA VEGA A/B para aguas blandas</p>
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
                          ec: "1400",
                          temp: "22",
                          targetEC: "1400",
                          targetPH: "6.0",
                          waterType: "osmosis",
                          hasHeater: true,
                          useOsmosisMix: false,
                          osmosisMixPercentage: 0,
                          waterNotes: "",
                          calculationMethod: "escalonado"
                        });
                        setMeasurements({
                          manualPH: "6.0",
                          manualEC: "1400",
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
                Nutrientes: AQUA VEGA A y B para aguas blandas
              </p>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Nota:</strong> Este sistema está configurado específicamente para agua destilada y AQUA VEGA A/B para aguas blandas.
                No se pueden seleccionar otros tipos de agua.
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

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${alerts.some(a => a.priority === 1) ? 'bg-red-500 animate-pulse' : 'bg-green-500'
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
              <span>Agua: Destilada</span>
              <span>•</span>
              <span>Nutrientes: AQUA VEGA A/B</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
