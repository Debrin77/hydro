"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, 
  Thermometer, Zap, ShieldAlert, ChevronRight, Anchor, 
  ArrowLeft, ArrowRight, Bell, CloudRain, ThermometerSun, 
  RefreshCw, Skull, Info, Calculator, Filter, 
  Power, Timer, Gauge, Cloud, Sun, Moon, CloudSun, 
  Wind as WindIcon, Clipboard, ThermometerSnowflake, TreePine, Settings,
  Home, BarChart3, X, RotateCcw, AlertCircle,
  Droplet, Leaf, TimerReset, ThermometerCold,
  ChevronDown, ChevronUp, Eye, EyeOff, CloudRain as Rain,
  Thermometer as TempIcon, Wind as BreezeIcon, Target,
  Brain, AlertOctagon, Waves, GitCompare, BarChart as BarChartIcon,
  GaugeCircle, Droplets as WaterDroplets,
  Flower2, Sparkles, Shield, Zap as Lightning,
  Flask, Thermometer as ThermometerIcon, GitBranch,
  Package, Hash, AlertOctagon as AlertOctagonIcon,
  Sprout as PlantIcon, AirVent
} from "lucide-react"

// ============================================================================
// COMPONENTES UI SIMPLIFICADOS (para evitar errores de importación)
// ============================================================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, className = "", variant = "default", disabled = false, size = "default" }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const sizes = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-sm",
    lg: "px-6 py-3 text-lg"
  }
  
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
// CONFIGURACIÓN BASE CON EC OPTIMIZADO Y PARÁMETROS DE AIREACIÓN
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
    isOsmosis: true,
    oxygenationImpact: "Alta - requiere aireación constante"
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
    isOsmosis: false,
    oxygenationImpact: "Media - beneficiosa para mezcla de nutrientes"
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
    isOsmosis: false,
    oxygenationImpact: "Media - beneficiosa para mezcla de nutrientes"
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
    isOsmosis: false,
    oxygenationImpact: "Media - beneficiosa para mezcla de nutrientes"
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

// Configuración de bomba y aireación
const PUMP_CONFIG = {
  power: 7, // 7W
  flowRate: 6, // 6 litros/hora
  cyclesPerDay: 12, // Ciclos por día durante horas de luz
  minCycleMinutes: 0.5, // 30 segundos mínimo
  maxCycleMinutes: 5, // 5 minutos máximo
  aerationEffect: {
    oxygenIncrease: 30, // % de aumento de oxígeno disuelto
    nutrientMixing: 40, // % de mejora en mezcla de nutrientes
    algaePrevention: 25, // % de reducción de algas
    temperatureStabilization: 15, // % de mejor estabilización de temperatura
    phStabilization: 20 // % de mejor estabilización de pH
  }
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
    info: "Variedad sensible. EC conservadora para evitar bordes quemados.",
    aerationBenefit: "Alta - raíces sensibles a falta de oxígeno"
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
    info: "Tolerancia media. Puede manejar EC ligeramente más alta para color.",
    aerationBenefit: "Media - mejora absorción de nutrientes"
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
    info: "Variedad productiva pero no muy tolerante a sales altas.",
    aerationBenefit: "Alta - mejora desarrollo radicular"
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
    info: "Muy sensible en plántula. Requiere EC baja inicial.",
    aerationBenefit: "Alta - muy sensible a agua estancada"
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
    info: "Variedad más tolerante. Puede manejar EC más alta en maduración.",
    aerationBenefit: "Media - tolera mejor condiciones variables"
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
    info: "Variedad robusta con crecimiento vertical. EC media óptima.",
    aerationBenefit: "Media - mejora crecimiento vertical"
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO OPTIMIZADAS CON AIREACIÓN
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
  
  const ecValues = plants.map(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return 1400;
    
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    return variety.aquaVegaDosage[stage].ec;
  });
  
  if (ecValues.length === 0) return { targetEC: "800", method: "conservador" };
  
  const minEC = Math.min(...ecValues);
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
 * Calcula dosis AQUA VEGA optimizada con consideración de aireación
 */
const calculateAquaVegaDosage = (plants, totalVolume, targetEC, waterType = "bajo_mineral", hasAeration = true) => {
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
  
  // Ajuste por aireación (mejor absorción de nutrientes)
  if (hasAeration) {
    ecRatio *= 0.95; // 5% menos concentración debido a mejor absorción
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
  
  if (hasAeration) {
    note += " Con aireación activa - mejor absorción de nutrientes.";
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
 * Calcula ajuste de pH con consideración de aireación
 */
const calculatePHAdjustment = (currentPH, targetPH, waterType, volume, hasAeration = true) => {
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
  
  // Reducir ajuste si hay aireación (mejor mezcla y estabilización)
  if (hasAeration) {
    adjustmentFactor *= 0.8; // 20% menos ajuste necesario
  }
  
  const adjustment = Math.abs(phDiff) * volume * 0.1 * adjustmentFactor;
  
  let recommendation = "";
  if (phDiff > 0.3) {
    recommendation = `pH demasiado alto (${currentPH}). Añadir ${adjustment.toFixed(1)}ml de pH- (ácido fosfórico). Mezclar bien y esperar 15 minutos antes de medir de nuevo.`;
  } else if (phDiff < -0.3) {
    recommendation = `pH demasiado bajo (${currentPH}). Añadir ${adjustment.toFixed(1)}ml de pH+ (hidróxido de potasio). Mezclar bien y esperar 15 minutos.`;
  } else {
    recommendation = "✅ pH en el rango ideal. No se requiere ajuste.";
  }
  
  // Añadir advertencia si el agua tiene bajo poder tampón
  if (bufferStrength < 1.0) {
    recommendation += " ⚠️ Agua con bajo poder tampón: el pH puede fluctuar más fácilmente.";
  }
  
  // Beneficio de aireación
  if (hasAeration) {
    recommendation += " ✅ La aireación ayuda a estabilizar el pH.";
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
 * Calcula riego para torre vertical en Castellón optimizado con aireación
 */
const calculateIrrigation = (plants, temp, humidity, season, hasAeration = true) => {
  const pumpPower = PUMP_CONFIG.power;
  const pumpFlowRate = PUMP_CONFIG.flowRate; // 6 litros/hora
  const rockwoolCubes = 2.5;
  const castellonAltitude = 30;
  
  let totalWaterNeeds = 0;
  let totalPlants = plants.length;
  
  if (totalPlants === 0) {
    return {
      totalWaterNeeds: "0.0",
      pumpMinutesPerDay: "0",
      cyclesPerDay: 0,
      minutesPerCycle: "0.0",
      pumpPower,
      pumpFlowRate,
      rockwoolCubes,
      location: "Castellón de la Plana",
      recommendations: ["Añade plantas al sistema para calcular riego"]
    };
  }
  
  plants.forEach(plant => {
    let waterPerPlant = 0.4;
    
    if (plant.l === 1) waterPerPlant *= 0.5;
    else if (plant.l === 2) waterPerPlant *= 0.8;
    else waterPerPlant *= 1.0;
    
    const variety = VARIETIES[plant.v];
    if (variety) {
      if (plant.v === "Iceberg") waterPerPlant *= 1.0;
      else if (plant.v === "Lollo Rosso") waterPerPlant *= 0.8;
      else if (plant.v === "Hoja de Roble Rojo") waterPerPlant *= 1.1;
    }
    
    totalWaterNeeds += waterPerPlant;
  });
  
  let tempFactor = 1.0;
  if (temp > 25) tempFactor = 1.2;
  else if (temp > 20) tempFactor = 1.05;
  else if (temp < 15) tempFactor = 0.85;
  
  let humidityFactor = 1.0;
  if (humidity < 40) humidityFactor = 1.15;
  else if (humidity > 70) humidityFactor = 0.85;
  
  let seasonFactor = 1.0;
  if (season === "summer") seasonFactor = 1.3;
  else if (season === "winter") seasonFactor = 0.8;
  
  // Reducción por aireación (menos evaporación, mejor absorción)
  let aerationFactor = 1.0;
  if (hasAeration) {
    aerationFactor = 0.9; // 10% menos agua necesaria
  }
  
  totalWaterNeeds = totalWaterNeeds * tempFactor * humidityFactor * seasonFactor * aerationFactor;
  
  // Calcular tiempo de riego (bomba de 7W, 6L/h)
  const dailyPumpMinutes = (totalWaterNeeds / pumpFlowRate) * 60;
  
  // Dividir en ciclos (cada 2 horas durante luz)
  const cyclesPerDay = Math.min(Math.max(Math.round(dailyPumpMinutes / 5), 4), 12);
  const minutesPerCycle = dailyPumpMinutes / cyclesPerDay;
  
  const recommendations = [
    `Regar ${cyclesPerDay} veces al día durante ${minutesPerCycle.toFixed(1)} minutos cada ciclo`,
    "En verano aumentar frecuencia un 30%",
    "En invierno reducir frecuencia un 20%",
    "Los dados de lana de roca de 2.5cm retienen bien la humedad"
  ];
  
  if (hasAeration) {
    recommendations.push("✅ Aireación activa: reduce necesidades de riego un 10%");
  }
  
  return {
    totalWaterNeeds: totalWaterNeeds.toFixed(1),
    pumpMinutesPerDay: dailyPumpMinutes.toFixed(0),
    cyclesPerDay,
    minutesPerCycle: minutesPerCycle.toFixed(1),
    pumpPower,
    pumpFlowRate,
    rockwoolCubes,
    location: "Castellón de la Plana",
    recommendations,
    aerationBenefits: hasAeration ? [
      "Mezcla uniforme de nutrientes",
      "Oxígeno disuelto aumentado 30%",
      "Prevención de algas y patógenos",
      "Estabilización de temperatura y pH"
    ] : []
  };
};

/**
 * Calcula beneficios de la aireación
 */
const calculateAerationBenefits = (hasAeration, waterType, plants) => {
  if (!hasAeration) {
    return {
      active: false,
      benefits: [],
      recommendations: ["Considera añadir un difusor de aire para mejorar oxigenación"]
    };
  }
  
  const benefits = [
    {
      title: "Oxígeno Disuelto",
      improvement: "+30%",
      description: "Mayor oxigenación para raíces saludables",
      impact: "Alta"
    },
    {
      title: "Mezcla de Nutrientes",
      improvement: "+40%",
      description: "Distribución uniforme en toda la solución",
      impact: "Alta"
    },
    {
      title: "Prevención de Algas",
      improvement: "-25%",
      description: "Reducción del riesgo de crecimiento de algas",
      impact: "Media"
    },
    {
      title: "Estabilidad de pH",
      improvement: "+20%",
      description: "Menos fluctuaciones del pH",
      impact: "Media"
    }
  ];
  
  const sensitiveVarieties = plants.filter(p => 
    VARIETIES[p.v]?.aerationBenefit === "Alta"
  ).map(p => p.v);
  
  const recommendations = [
    "Mantener el difusor funcionando 24/7",
    "Limpiar el difusor cada 2 semanas",
    "Verificar que haya burbujeo constante"
  ];
  
  if (waterType === "osmosis") {
    recommendations.push("Especialmente importante para agua de ósmosis");
  }
  
  if (sensitiveVarieties.length > 0) {
    recommendations.push(`Crucial para variedades sensibles: ${[...new Set(sensitiveVarieties)].join(", ")}`);
  }
  
  return {
    active: true,
    benefits,
    recommendations
  };
};

// ============================================================================
// COMPONENTES REUTILIZABLES CORREGIDOS
// ============================================================================

const CircularGauge = ({ value, max, min = 0, label, unit, color = "blue", size = "md" }) => {
  const sizes = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36"
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
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            strokeWidth="6"
            className={bgColors[color]}
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
          <div className={`text-xl font-bold ${getValueColor()} leading-tight`}>
            {value}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{unit}</div>
        </div>
      </div>
      <div className="mt-2 text-center space-y-0.5">
        <div className="text-xs font-bold text-slate-800 truncate w-full px-1">{label}</div>
        <div className="text-xs text-slate-500 space-y-0.5">
          {label === "pH" && (
            <>
              <div className="text-[10px]">Ideal: 5.5-6.5</div>
              <div className="text-[10px]">Actual: {value}</div>
            </>
          )}
          {label === "EC" && (
            <>
              <div className="text-[10px]">Ideal: 800-1500</div>
              <div className="text-[10px]">Actual: {value}</div>
            </>
          )}
          {label === "Temperatura" && (
            <>
              <div className="text-[10px]">Ideal: 18-25°C</div>
              <div className="text-[10px]">Actual: {value}°C</div>
            </>
          )}
          {label === "Volumen" && (
            <>
              <div className="text-[10px]">Máx: {max}L</div>
              <div className="text-[10px]">Actual: {value}L</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StagedECCalculator = ({ plants, waterType, onECCalculated, selectedMethod, onMethodChange }) => {
  const ecMethods = useMemo(() => calculateSmartEC(plants, waterType), [plants, waterType]);
  const ecByLevel = useMemo(() => calculateECByLevel(plants, waterType), [plants, waterType]);
  const plantStats = useMemo(() => calculatePlantStats(plants), [plants]);
  
  const currentMethod = selectedMethod || ecMethods.method;
  const currentEC = selectedMethod 
    ? ecMethods.allMethods?.[selectedMethod]?.targetEC || ecMethods.targetEC
    : ecMethods.targetEC;
  
  useEffect(() => {
    if (onECCalculated) {
      onECCalculated(currentEC);
    }
  }, [currentEC, onECCalculated]);
  
  return (
    <Card className="p-4 sm:p-6 rounded-2xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Calculator className="text-white" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Cálculo EC Escalonado Optimizado</h2>
          <p className="text-slate-600 text-sm">3 métodos de cálculo seguro para lechugas</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200">
          <h4 className="font-bold text-blue-700 text-sm mb-1">Método Seleccionado</h4>
          <div className="text-2xl font-bold text-blue-600 mb-1">{currentEC} µS/cm</div>
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            {selectedMethod || ecMethods.method}
          </Badge>
          {selectedMethod && selectedMethod !== ecMethods.method && (
            <p className="text-xs text-slate-500 mt-1">Modificado manualmente</p>
          )}
          <p className="text-xs text-slate-600 mt-1">
            {currentMethod === "conservador" ? "✅ Seguro para plántulas" :
             currentMethod === "escalonado" ? "✅ Ideal para múltiples etapas" :
             "✅ Balanceado para crecimiento"}
          </p>
        </div>
        
        <div className="p-3 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
          <h4 className="font-bold text-green-700 text-sm mb-1">Distribución de Plantas</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-700 text-sm">Nivel 1:</span>
              <span className="font-bold text-cyan-600">{plantStats.seedlingCount} plantas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 text-sm">Nivel 2:</span>
              <span className="font-bold text-green-600">{plantStats.growthCount} plantas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 text-sm">Nivel 3:</span>
              <span className="font-bold text-emerald-600">{plantStats.matureCount} plantas</span>
            </div>
            <div className="pt-1 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium text-sm">Total:</span>
                <span className="font-bold text-slate-800">{plantStats.total} plantas</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-b from-purple-50 to-white rounded-xl border-2 border-purple-200">
          <h4 className="font-bold text-purple-700 text-sm mb-1">EC por Nivel</h4>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-slate-700 text-sm">Plántulas:</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-sm">{ecByLevel.level1} µS/cm</span>
                <p className="text-xs text-slate-500">Rango: 600-800</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-slate-700 text-sm">Crecimiento:</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-sm">{ecByLevel.level2} µS/cm</span>
                <p className="text-xs text-slate-500">Rango: 900-1200</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-slate-700 text-sm">Maduras:</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-sm">{ecByLevel.level3} µS/cm</span>
                <p className="text-xs text-slate-500">Rango: 1200-1500</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold text-blue-700 text-sm mb-2">Comparación de Métodos</h4>
        <p className="text-xs text-slate-600 mb-3">Selecciona el método según tu distribución de plantas</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div 
            className={`p-2 rounded-lg cursor-pointer transition-all ${currentMethod === "escalonado" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200 hover:border-blue-300'}`}
            onClick={() => onMethodChange && onMethodChange("escalonado")}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-slate-800 text-sm">Escalonado</p>
              {currentMethod === "escalonado" && <Check className="text-blue-600" size={16} />}
            </div>
            <p className="text-xs text-slate-600 mb-2">Peso por nivel de desarrollo</p>
            <p className="text-xl font-bold text-blue-600">{ecMethods.allMethods?.escalonado?.targetEC || "1100"} µS/cm</p>
            <p className="text-xs text-slate-500 mt-1">
              ✅ Ideal cuando hay plantas en diferentes etapas
            </p>
          </div>
          
          <div 
            className={`p-2 rounded-lg cursor-pointer transition-all ${currentMethod === "promedio" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200 hover:border-blue-300'}`}
            onClick={() => onMethodChange && onMethodChange("promedio")}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-slate-800 text-sm">Promedio</p>
              {currentMethod === "promedio" && <Check className="text-blue-600" size={16} />}
            </div>
            <p className="text-xs text-slate-600 mb-2">Media aritmética simple</p>
            <p className="text-xl font-bold text-blue-600">{ecMethods.allMethods?.promedio?.targetEC || "1000"} µS/cm</p>
            <p className="text-xs text-slate-500 mt-1">
              ✅ Para etapas similares o sistema equilibrado
            </p>
          </div>
          
          <div 
            className={`p-2 rounded-lg cursor-pointer transition-all ${currentMethod === "conservador" ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-slate-200 hover:border-blue-300'}`}
            onClick={() => onMethodChange && onMethodChange("conservador")}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-slate-800 text-sm">Conservador</p>
              {currentMethod === "conservador" && <Check className="text-blue-600" size={16} />}
            </div>
            <p className="text-xs text-slate-600 mb-2">Mínimo + protección extra</p>
            <p className="text-xl font-bold text-blue-600">{ecMethods.allMethods?.conservador?.targetEC || "800"} µS/cm</p>
            <p className="text-xs text-slate-500 mt-1">
              ✅ Para muchas plántulas o variedades sensibles
            </p>
          </div>
        </div>
      </div>
    </Card>
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
    <Card className="p-4 sm:p-6 rounded-2xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <Activity className="text-white" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Parámetros Actuales del Sistema</h2>
          <p className="text-slate-600 text-sm">Últimos valores medidos - Monitoreo en tiempo real</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-3 bg-gradient-to-b from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white" size={12} />
              </div>
              <span className="font-bold text-purple-700 text-sm">pH</span>
            </div>
            <CircularGauge 
              value={parseFloat(measurements.manualPH || config.ph)} 
              min={4} 
              max={9} 
              label="pH" 
              unit="" 
              color="purple"
              size="sm"
            />
            <div className="mt-2 text-center">
              <div className={`text-xs font-bold ${
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
          
          <div className="flex flex-col items-center p-3 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white" size={12} />
              </div>
              <span className="font-bold text-blue-700 text-sm">EC</span>
            </div>
            <CircularGauge 
              value={parseFloat(measurements.manualEC || config.ec)} 
              min={0} 
              max={3000} 
              label="EC" 
              unit="µS/cm" 
              color="blue"
              size="sm"
            />
            <div className="mt-2 text-center">
              <div className={`text-xs font-bold ${
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
          
          <div className="flex flex-col items-center p-3 bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Thermometer className="text-white" size={12} />
              </div>
              <span className="font-bold text-amber-700 text-sm">Temp</span>
            </div>
            <CircularGauge 
              value={parseFloat(measurements.manualTemp || config.temp)} 
              min={0} 
              max={40} 
              label="Temperatura" 
              unit="°C" 
              color="amber"
              size="sm"
            />
            <div className="mt-2 text-center">
              <div className={`text-xs font-bold ${
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
          
          <div className="flex flex-col items-center p-3 bg-gradient-to-b from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Droplets className="text-white" size={12} />
              </div>
              <span className="font-bold text-emerald-700 text-sm">Volumen</span>
            </div>
            <CircularGauge 
              value={parseFloat(measurements.manualVolume || config.currentVol)} 
              min={0} 
              max={parseFloat(config.totalVol)} 
              label="Volumen" 
              unit="L" 
              color="emerald"
              size="sm"
            />
            <div className="mt-2 text-center">
              <div className={`text-xs font-bold ${
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
        
        <div className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-slate-200">
          <h4 className="font-bold text-slate-700 text-sm mb-2">📊 Resumen del Estado</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-xs">Última medición:</span>
                <span className="font-bold text-blue-600 text-xs">
                  {new Date(measurements.lastMeasurement).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(measurements.lastMeasurement).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-2 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-xs">Tipo de agua:</span>
                <span className="font-bold text-cyan-600 text-xs">
                  {WATER_TYPES[config.waterType]?.name || "Baja Mineralización"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                EC base: {WATER_TYPES[config.waterType]?.ecBase || "200"} µS/cm
              </p>
            </div>
            
            <div className="p-2 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-xs">Temp agua:</span>
                <span className={`font-bold text-xs ${
                  parseFloat(measurements.manualWaterTemp || "22") >= 18 && parseFloat(measurements.manualWaterTemp || "22") <= 22 
                    ? "text-green-600" 
                    : parseFloat(measurements.manualWaterTemp || "22") > 22 
                    ? "text-red-600" 
                    : "text-blue-600"
                }`}>
                  {measurements.manualWaterTemp || "22"}°C
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {parseFloat(measurements.manualWaterTemp || "22") > 22 ? "⚠️ Demasiado caliente" : 
                 parseFloat(measurements.manualWaterTemp || "22") < 18 ? "❄️ Demasiado fría" : 
                 "✅ Ideal"}
              </p>
            </div>
            
            <div className="p-2 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-xs">Humedad:</span>
                <span className={`font-bold text-xs ${
                  parseFloat(measurements.manualHumidity || "65") >= 40 && parseFloat(measurements.manualHumidity || "65") <= 70 
                    ? "text-green-600" 
                    : "text-amber-600"
                }`}>
                  {measurements.manualHumidity || "65"}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {parseFloat(measurements.manualHumidity || "65") < 40 ? "⚠️ Demasiado seca" : 
                 parseFloat(measurements.manualHumidity || "65") > 70 ? "⚠️ Demasiado húmeda" : 
                 "✅ Ideal"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL CORREGIDO
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
  
  // Estados para añadir nuevas plantas
  const [newPlantVariety, setNewPlantVariety] = useState(Object.keys(VARIETIES)[0]);
  const [newPlantLevel, setNewPlantLevel] = useState(1);
  const [newPlantPosition, setNewPlantPosition] = useState(1);
  
  // Configuración del sistema
  const [config, setConfig] = useState({ 
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
    calculationMethod: "escalonado",
    hasAeration: true
  });
  
  // Configuración de mediciones manuales
  const [measurements, setMeasurements] = useState({
    manualPH: "6.0",
    manualEC: "1000",
    manualTemp: "22",
    manualWaterTemp: "22",
    manualVolume: "20",
    manualHumidity: "65",
    lastMeasurement: new Date().toISOString()
  });

  // =================== FUNCIONES UTILITARIAS ===================

  const generatePlantId = useCallback(() => {
    return `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleAddPlant = useCallback(() => {
    const newPlant = {
      id: generatePlantId(),
      l: newPlantLevel,
      v: newPlantVariety,
      p: newPlantPosition,
      date: new Date().toISOString()
    };
    
    // Check if position is already taken
    const existingPlant = plants.find(p => p.l === newPlantLevel && p.p === newPlantPosition);
    if (existingPlant) {
      alert("Esta posición ya está ocupada en el mismo nivel. Por favor, elige otra.");
      return;
    }
    
    setPlants([...plants, newPlant]);
    
    // Reset form
    setNewPlantVariety(Object.keys(VARIETIES)[0]);
    setNewPlantLevel(1);
    setNewPlantPosition(1);
  }, [plants, newPlantLevel, newPlantVariety, newPlantPosition, generatePlantId]);

  const deleteHistoryRecord = useCallback((id) => {
    setHistory(history.filter(record => record.id !== id));
  }, [history]);

  const handleRotation = useCallback(() => {
    setShowRotationModal(true);
  }, []);

  const handleRotationConfirm = useCallback((newSeedlings) => {
    // Filtrar plantas maduras (nivel 3) - estas se "cosechan"
    const maturePlants = plants.filter(p => p.l === 3);
    
    // Mover plantas de nivel 2 a nivel 3
    const movedToMature = plants.filter(p => p.l === 2).map(p => ({
      ...p,
      l: 3,
      date: new Date().toISOString()
    }));
    
    // Mover plantas de nivel 1 a nivel 2
    const movedToGrowth = plants.filter(p => p.l === 1).map(p => ({
      ...p,
      l: 2,
      date: new Date().toISOString()
    }));
    
    // Combinar todas las plantas
    const updatedPlants = [...movedToMature, ...movedToGrowth, ...newSeedlings];
    
    setPlants(updatedPlants);
    setLastRot(new Date().toISOString());
    setShowRotationModal(false);
    
    alert(`✅ Rotación completada exitosamente:
• ${maturePlants.length} plantas cosechadas (nivel 3)
• ${movedToMature.length} plantas movidas a nivel 3
• ${movedToGrowth.length} plantas movidas a nivel 2
• ${newSeedlings.length} nuevas plántulas añadidas al nivel 1`);
    
    setTab("tower");
  }, [plants]);

  const handleECCalculated = useCallback((ec) => {
    setConfig(prev => ({ ...prev, targetEC: ec }));
  }, []);

  const handleECMethodChange = useCallback((method) => {
    setSelectedECMethod(method);
    
    if (method) {
      let newEC = "1100";
      
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
  }, [plants, config.waterType]);

  const saveManualMeasurement = useCallback(() => {
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
      notes: "Medición manual completa",
      aerationActive: config.hasAeration
    };
    
    setConfig(prev => ({ 
      ...prev, 
      ph: measurements.manualPH,
      ec: measurements.manualEC,
      temp: measurements.manualTemp,
      currentVol: measurements.manualVolume || prev.currentVol
    }));
    
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
Volumen: ${measurements.manualVolume || config.currentVol}L
Aireación: ${config.hasAeration ? "ACTIVA ✅" : "INACTIVA"}`);
  }, [measurements, config, history, generatePlantId]);

  const handleRegisterClean = useCallback(() => {
    const now = new Date().toISOString();
    setLastClean(now);
    
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
  }, [history, generatePlantId]);

  // =================== EFECTOS Y PERSISTENCIA ===================

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hydro_caru_app");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.plants) setPlants(data.plants);
        if (data.config) setConfig(data.config);
        if (data.history) setHistory(data.history);
        if (data.lastRot) setLastRot(data.lastRot);
        if (data.lastClean) setLastClean(data.lastClean);
        
        if (data.measurements) {
          setMeasurements({
            manualPH: data.measurements.manualPH || "6.0",
            manualEC: data.measurements.manualEC || "1000",
            manualTemp: data.measurements.manualTemp || "22",
            manualWaterTemp: data.measurements.manualWaterTemp || "22",
            manualVolume: data.measurements.manualVolume || (data.config?.currentVol || "20"),
            manualHumidity: data.measurements.manualHumidity || "65",
            lastMeasurement: data.measurements.lastMeasurement || new Date().toISOString()
          });
        }
        
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
      config.waterType,
      config.hasAeration
    );
  }, [plants, config.currentVol, config.targetEC, config.waterType, config.hasAeration]);

  const phAdjustment = useMemo(() => {
    return calculatePHAdjustment(
      parseFloat(config.ph),
      parseFloat(config.targetPH),
      config.waterType,
      parseFloat(config.currentVol),
      config.hasAeration
    );
  }, [config.ph, config.targetPH, config.waterType, config.currentVol, config.hasAeration]);

  const plantStats = useMemo(() => {
    return calculatePlantStats(plants);
  }, [plants]);

  const season = useMemo(() => {
    return getSeason();
  }, []);

  const irrigationData = useMemo(() => {
    return calculateIrrigation(
      plants,
      parseFloat(measurements.manualTemp),
      parseFloat(measurements.manualHumidity),
      season,
      config.hasAeration
    );
  }, [plants, measurements.manualTemp, measurements.manualHumidity, season, config.hasAeration]);

  const aerationBenefits = useMemo(() => {
    return calculateAerationBenefits(config.hasAeration, config.waterType, plants);
  }, [config.hasAeration, config.waterType, plants]);

  // =================== ALERTAS ===================

  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1100;
    const tPh = parseFloat(config.targetPH) || 6.0;
    const temp = parseFloat(config.temp) || 20;
    const waterType = config.waterType || "bajo_mineral";
    const hasAeration = config.hasAeration;
    const res = [];

    // Alerta para falta de aireación
    if (!hasAeration && plants.length > 0) {
      res.push({ 
        title: "⚠️ AIREACIÓN RECOMENDADA", 
        value: "Difusor de aire", 
        description: "Considera añadir un difusor para mejorar oxigenación y mezcla de nutrientes", 
        color: "bg-gradient-to-r from-cyan-700 to-blue-800",
        icon: <AirVent className="text-white" size={28} />,
        priority: 2
      });
    }

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

    // Alertas de volumen
    if (vAct < vTot * 0.25) {
      res.push({ 
        title: "¡AGUA MUY BAJA!", 
        value: `${(vTot - vAct).toFixed(1)}L`, 
        description: `Crítico: Solo queda un ${(vAct/vTot*100).toFixed(0)}%`, 
        color: "bg-gradient-to-r from-red-600 to-rose-700",
        icon: <Droplets className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (vAct < vTot * 0.45) {
      res.push({ 
        title: "RELLENAR AGUA", 
        value: `${(vTot - vAct).toFixed(1)}L`, 
        description: `Depósito al ${(vAct/vTot*100).toFixed(0)}%`, 
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: <CloudRain className="text-white" size={28} />,
        priority: 2
      });
    }

    // Alertas de temperatura
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

    // Alertas de pH
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

    // Alertas de EC
    if (ec < tEc - 300 && ec > 0) {
      const mlPerLiter = aquaVegaDosage.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.4;
      res.push({ 
        title: "¡FALTAN NUTRIENTES!", 
        value: `${Math.round(mlToAdd)}ml A+B`, 
        description: `EC ${ec} µS/cm (muy baja). Añadir AQUA VEGA.`, 
        color: "bg-gradient-to-r from-blue-800 to-cyan-800",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 1
      });
    } 
    else if (ec < tEc - 150 && ec > 0) {
      const mlPerLiter = aquaVegaDosage.per10L.a / 10;
      const mlToAdd = ((tEc - ec) / 100) * vAct * mlPerLiter * 0.4;
      res.push({ 
        title: "AÑADIR NUTRIENTES", 
        value: `${Math.round(mlToAdd)}ml A+B`, 
        description: `Subir de ${ec} a ${tEc} µS/cm`, 
        color: "bg-gradient-to-r from-blue-600 to-cyan-600",
        icon: <FlaskConical className="text-white" size={28} />,
        priority: 2
      });
    } 
    else if (ec > tEc + 400) {
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
    else if (ec > tEc + 250) {
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

    // Alerta de limpieza
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

  // =================== COMPONENTES DE PASOS ===================

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6">
                <Sprout size={40} />
              </div>
              <h1 className="text-3xl font-bold mb-4">HydroCaru Optimizado</h1>
              <p className="text-lg mb-6">Sistema de gestión hidropónica con EC escalonado y aireación</p>
              <p className="text-sm opacity-90">Especialmente diseñado para lechugas en torre vertical</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <Calculator className="text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">EC Escalonado</h3>
                <p className="text-sm text-slate-600">Cálculo inteligente por niveles de desarrollo</p>
              </div>
              
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <AirVent className="text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Aireación</h3>
                <p className="text-sm text-slate-600">Sistema optimizado con difusor de aire</p>
              </div>
              
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <TreePine className="text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">6 Variedades</h3>
                <p className="text-sm text-slate-600">Configuración específica para cada tipo</p>
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
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Volumen Total del Depósito (L)</Label>
                <input
                  type="number"
                  value={config.totalVol}
                  onChange={(e) => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <Label>Tipo de Agua</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(WATER_TYPES).map(([key, water]) => (
                    <button
                      key={key}
                      onClick={() => setConfig({...config, waterType: key})}
                      className={`p-3 rounded-lg border-2 ${
                        config.waterType === key 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {water.icon}
                        <span className="text-sm">{water.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Sistema de Aireación</p>
                  <p className="text-sm text-slate-500">Difusor de aire para oxigenación</p>
                </div>
                <Switch
                  checked={config.hasAeration}
                  onCheckedChange={(checked) => setConfig({...config, hasAeration: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Calentador para Invierno</p>
                  <p className="text-sm text-slate-500">Mantiene temperatura estable</p>
                </div>
                <Switch
                  checked={config.hasHeater}
                  onCheckedChange={(checked) => setConfig({...config, hasHeater: checked})}
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button onClick={() => setStep(0)} variant="outline">
                Atrás
              </Button>
              <Button onClick={() => setStep(2)}>
                Siguiente
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">Añadir Plantas</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Variedad</Label>
                <select
                  value={newPlantVariety}
                  onChange={(e) => setNewPlantVariety(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg"
                >
                  {Object.keys(VARIETIES).map((variety) => (
                    <option key={variety} value={variety}>
                      {variety}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label>Nivel</Label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      onClick={() => setNewPlantLevel(level)}
                      className={`flex-1 p-3 rounded-lg border-2 ${
                        newPlantLevel === level 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      Nivel {level}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Posición (en el nivel)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((position) => (
                    <button
                      key={position}
                      onClick={() => setNewPlantPosition(position)}
                      className={`flex-1 p-3 rounded-lg border-2 ${
                        newPlantPosition === position 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleAddPlant}
                className="w-full"
              >
                Añadir Planta
              </Button>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Plantas Añadidas</h3>
              <div className="space-y-2">
                {plants.map((plant) => (
                  <div key={plant.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <span className="font-bold">{plant.v}</span>
                      <span className="text-slate-600"> - Nivel {plant.l}, Posición {plant.p}</span>
                    </div>
                    <button
                      onClick={() => setPlants(plants.filter(p => p.id !== plant.id))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline">
                Atrás
              </Button>
              <Button onClick={() => setStep(3)}>
                Siguiente
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">Método de Cálculo de EC</h2>
            
            <div className="space-y-4">
              <p className="text-slate-600">Elige cómo quieres calcular la EC del sistema:</p>
              
              <div className="space-y-2">
                {[
                  { id: 'escalonado', name: 'Escalonado', description: 'Calcula la EC por nivel de desarrollo' },
                  { id: 'promedio', name: 'Promedio', description: 'Usa la media aritmética de todas las plantas' },
                  { id: 'conservador', name: 'Conservador', description: 'Usa el mínimo y añade margen de seguridad' },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setConfig({...config, calculationMethod: method.id})}
                    className={`p-4 rounded-lg border-2 cursor-pointer ${
                      config.calculationMethod === method.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-slate-800">{method.name}</div>
                    <div className="text-sm text-slate-600">{method.description}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button onClick={() => setStep(2)} variant="outline">
                Atrás
              </Button>
              <Button onClick={() => setStep(4)}>
                Siguiente
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">Resumen</h2>
            
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-bold text-slate-800">Configuración del Sistema</h3>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <p>Volumen: {config.totalVol}L</p>
                  <p>Tipo de agua: {WATER_TYPES[config.waterType].name}</p>
                  <p>Aireación: {config.hasAeration ? 'Sí' : 'No'}</p>
                  <p>Calentador: {config.hasHeater ? 'Sí' : 'No'}</p>
                </div>
              </div>
              
              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-bold text-slate-800">Plantas</h3>
                <p className="text-sm text-slate-600">{plants.length} plantas añadidas</p>
                <div className="mt-2 space-y-1">
                  {plants.slice(0, 3).map((plant) => (
                    <div key={plant.id} className="text-sm text-slate-600">
                      {plant.v} - Nivel {plant.l}, Posición {plant.p}
                    </div>
                  ))}
                  {plants.length > 3 && (
                    <div className="text-xs text-slate-500">+ {plants.length - 3} más...</div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-bold text-slate-800">Cálculo de EC</h3>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <p>Método: {config.calculationMethod}</p>
                  <p>EC objetivo: {config.targetEC} µS/cm</p>
                  <p>pH objetivo: {config.targetPH}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button onClick={() => setStep(3)} variant="outline">
                Atrás
              </Button>
              <Button onClick={() => {
                setStep(5);
                setTab("dashboard");
              }}>
                Comenzar
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Control - EC Optimizado</h1>
          <p className="text-slate-600 text-sm">Sistema hidropónico con cálculo EC escalonado seguro para lechugas</p>
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
      
      {/* Añadimos el AerationPanel aquí */}
      <AerationPanel />
      
      <DashboardMetricsPanel config={config} measurements={measurements} />
      
      {/* Calculadora de EC */}
      <StagedECCalculator 
        plants={plants} 
        waterType={config.waterType}
        onECCalculated={handleECCalculated}
        selectedMethod={selectedECMethod}
        onMethodChange={handleECMethodChange}
      />
      
      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">Alertas del Sistema</h2>
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`${alert.color} text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg`}
            >
              <div className="flex-shrink-0">
                {alert.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm">{alert.title}</h3>
                  <span className="text-xl font-bold">{alert.value}</span>
                </div>
                <p className="text-white/90 text-xs mt-1">{alert.description}</p>
                {alert.details && (
                  <p className="text-white/80 text-xs mt-1">{alert.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Botones de Acción */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleRotation}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          size="sm"
        >
          <RotateCcw className="mr-2" size={16} />
          Rotar Niveles
        </Button>
        
        <Button
          onClick={saveManualMeasurement}
          variant="outline"
          size="sm"
        >
          <Clipboard className="mr-2" size={16} />
          Guardar Medición
        </Button>
        
        <Button
          onClick={handleRegisterClean}
          variant="outline"
          size="sm"
        >
          <ShieldAlert className="mr-2" size={16} />
          Marcar Limpieza
        </Button>
        
        <Button
          onClick={() => setShowWaterSelector(true)}
          variant="outline"
          size="sm"
        >
          <Filter className="mr-2" size={16} />
          Cambiar Agua
        </Button>
      </div>
    </div>
  );

  const AerationPanel = () => (
    <Card className="p-4 sm:p-6 rounded-2xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
          <AirVent className="text-white" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Sistema de Aireación</h2>
          <p className="text-slate-600 text-sm">Difusor de aire para oxigenación del agua</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
          <div>
            <p className="font-bold text-cyan-700">Estado del Difusor</p>
            <p className="text-sm text-cyan-800">
              {config.hasAeration ? "✅ ACTIVO - Funcionando correctamente" : "❌ INACTIVO - Se recomienda activar"}
            </p>
          </div>
          <Switch
            checked={config.hasAeration}
            onCheckedChange={(checked) => setConfig({...config, hasAeration: checked})}
          />
        </div>
        
        {config.hasAeration ? (
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <h4 className="font-bold text-emerald-700 text-sm mb-2">✅ Beneficios Activos de la Aireación</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Oxígeno disuelto aumentado +30%</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Mezcla de nutrientes mejorada +40%</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Prevención de algas y patógenos -25%</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Estabilización de pH +20%</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Reducción necesidades de riego -10%</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-amber-700 text-sm mb-2">⚠️ Recomendación Importante</h4>
            <p className="text-sm text-amber-800 mb-2">
              Un difusor de aire mejora significativamente la salud de las plantas:
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Evita agua estancada y falta de oxígeno</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Mezcla uniforme de nutrientes AQUA VEGA</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Previene enfermedades radiculares</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Especialmente importante en verano</span>
              </li>
            </ul>
          </div>
        )}
        
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-700 text-sm mb-2">📋 Instrucciones para Difusor de Aire</h4>
          <ol className="space-y-1 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <span>Colocar el difusor en el fondo del depósito</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <span>Conectar a bomba de aire (3-5W es suficiente)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <span>Mantener funcionando 24 horas al día</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
              <span>Limpiar difusor cada 2 semanas con agua oxigenada</span>
            </li>
          </ol>
        </div>
      </div>
    </Card>
  );

  // =================== COMPONENTES DE MODALES ===================

  const RotationModal = () => (
    showRotationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Rotar Niveles</h3>
          <p className="text-slate-600 mb-4">¿Estás seguro de que quieres rotar los niveles? Esto cosechará las plantas del nivel 3 y moverá las plantas de los niveles inferiores.</p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowRotationModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleRotationConfirm([])}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
            >
              Confirmar Rotación
            </Button>
          </div>
        </div>
      </div>
    )
  );

  const WaterSelectorModal = () => (
    showWaterSelector && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Seleccionar Tipo de Agua</h3>
          <div className="space-y-2">
            {Object.entries(WATER_TYPES).map(([key, water]) => (
              <button
                key={key}
                onClick={() => {
                  setConfig({...config, waterType: key});
                  setShowWaterSelector(false);
                }}
                className={`w-full p-3 rounded-lg border-2 text-left ${
                  config.waterType === key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {water.icon}
                  <div>
                    <div className="font-bold text-slate-800">{water.name}</div>
                    <div className="text-sm text-slate-600">{water.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Button
              onClick={() => setShowWaterSelector(false)}
              variant="outline"
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    )
  );

  const DeleteConfirmationModal = () => (
    showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Confirmar Eliminación</h3>
          <p className="text-slate-600 mb-4">¿Estás seguro de que quieres eliminar esta planta?</p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDeleteConfirm(null)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setPlants(plants.filter(p => p.id !== showDeleteConfirm));
                setShowDeleteConfirm(null);
              }}
              variant="destructive"
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    )
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
                <Sprout className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm">HydroCaru Optimizado</h1>
                <p className="text-xs text-slate-600">EC Seguro • 6 Variedades • Aireación</p>
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
                          calculationMethod: "escalonado",
                          hasAeration: true
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
                    <RotateCcw size={14} className="mr-2" />
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
          <div className="container mx-auto p-2 sm:p-4 max-w-6xl">
            <div className="grid grid-cols-8 w-full gap-1 sm:gap-2">
              {[
                { key: "dashboard", icon: <Home size={18} />, activeColor: "from-blue-500 to-cyan-600" },
                { key: "tower", icon: <TreePine size={18} />, activeColor: "from-emerald-500 to-green-600" },
                { key: "calculator", icon: <Calculator size={18} />, activeColor: "from-purple-500 to-pink-600" },
                { key: "measurements", icon: <Activity size={18} />, activeColor: "from-amber-500 to-orange-600" },
                { key: "irrigation", icon: <WaterDroplets size={18} />, activeColor: "from-cyan-500 to-blue-600" },
                { key: "calendar", icon: <Calendar size={18} />, activeColor: "from-indigo-500 to-violet-600" },
                { key: "history", icon: <BarChartIcon size={18} />, activeColor: "from-rose-500 to-pink-600" },
                { key: "proTips", icon: <Brain size={18} />, activeColor: "from-violet-500 to-purple-600" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`flex items-center justify-center p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                    tab === item.key 
                      ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg scale-105` 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
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
          <div className="max-w-2xl mx-auto">
            {renderStep()}
          </div>
        ) : (
          <>
            {tab === "dashboard" && <DashboardTab />}
            {tab === "tower" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Torre de Cultivo</h2>
                <p className="text-slate-600">Gestiona las plantas en tu torre hidropónica</p>
              </div>
            )}
            {/* Aquí puedes añadir los otros componentes de pestañas */}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-2">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                alerts.some(a => a.priority === 1) ? 'bg-red-500 animate-pulse' : 'bg-green-500'
              }`} />
              <span>
                {alerts.filter(a => a.priority === 1).length > 0 
                  ? `${alerts.filter(a => a.priority === 1).length} alertas` 
                  : "Sistema estable"}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span>{plants.length} plantas</span>
              <span>•</span>
              <span>EC: {config.targetEC} µS/cm</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <AirVent size={12} className={config.hasAeration ? "text-green-500" : "text-slate-400"} />
                {config.hasAeration ? "Aireado" : "Sin airear"}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <RotationModal />
      <WaterSelectorModal />
      <DeleteConfirmationModal />
    </div>
  );
}
