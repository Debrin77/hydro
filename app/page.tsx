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
  Package, Hash, AlertOctagon as AlertOctagonIcon
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
  
  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1 text-xs",
    lg: "px-6 py-3 text-base"
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
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
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

const Label = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
)

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
// FUNCIONES DE CÁLCULO
// ============================================================================

const generatePlantId = () => {
  return `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const calculateAquaVegaDosage = (plants, totalVolume, targetEC, waterType = "bajo_mineral") => {
  if (plants.length === 0) return { a: 0, b: 0, per10L: { a: 0, b: 0 }, note: "" };

  let totalA = 0, totalB = 0;
  
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v];
    if (!variety) return;
    
    let stage;
    if (plant.l === 1) stage = "seedling";
    else if (plant.l === 2) stage = "growth";
    else stage = "mature";
    
    const dosage = variety.aquaVegaDosage[stage];
    
    totalA += (dosage.a / 10) * (totalVolume / plants.length);
    totalB += (dosage.b / 10) * (totalVolume / plants.length);
  });
  
  return {
    a: Math.round(totalA),
    b: Math.round(totalB),
    per10L: {
      a: Math.round((totalA * 10) / totalVolume),
      b: Math.round((totalB * 10) / totalVolume)
    },
    note: "✅ Dosis optimizada para agua blanda"
  };
};

const getWaterCharacteristics = (waterType) => {
  return WATER_TYPES[waterType] || WATER_TYPES.bajo_mineral;
};

// ============================================================================
// COMPONENTES REUTILIZABLES
// ============================================================================

const CircularGauge = ({ value, max, min = 0, label, unit, color = "blue", size = "md" }) => {
  const sizes = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36"
  };
  
  const safeMax = max === 0 ? 1 : max;
  const safeValue = isNaN(value) ? min : Math.max(min, Math.min(value, max || 100));
  const safeMin = min;
  
  const percentage = Math.min(100, Math.max(0, ((safeValue - safeMin) / (safeMax - safeMin)) * 100));
  const strokeDasharray = 2 * Math.PI * 32;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
  
  return (
    <div className={`flex flex-col items-center ${sizes[size]}`}>
      <div className="relative w-full h-full">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            strokeWidth="6"
            className="stroke-gray-200"
            strokeLinecap="round"
          />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            strokeWidth="6"
            className={`${
              color === "blue" ? "stroke-blue-600" :
              color === "green" ? "stroke-green-600" :
              color === "red" ? "stroke-red-600" :
              color === "purple" ? "stroke-purple-600" :
              "stroke-blue-600"
            }`}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
          <div className="text-lg font-bold text-gray-800 leading-tight text-center">
            {label === "pH" ? value.toFixed(1) : 
             label === "EC" ? Math.round(value).toString() : 
             Math.round(value).toString()}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5 truncate w-full text-center">{unit}</div>
        </div>
      </div>
      
      <div className="mt-3 text-center space-y-0.5 w-full px-1">
        <div className="text-xs font-bold text-gray-800 truncate">{label}</div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL CORREGIDO
// ============================================================================

export default function HydroAppFinal() {
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [selPos, setSelPos] = useState({ l: 1, v: "Iceberg", p: 1 });
  
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20", 
    ph: "6.0", 
    ec: "1000",
    temp: "22", 
    targetEC: "1100",
    targetPH: "6.0",
    waterType: "bajo_mineral",
    useAirDiffuser: true
  });
  
  const [measurements, setMeasurements] = useState({
    manualPH: "6.0",
    manualEC: "1000",
    manualTemp: "22",
    manualWaterTemp: "22",
    manualVolume: "20",
    manualHumidity: "65",
    lastMeasurement: new Date().toISOString()
  });

  // Encontrar primera posición libre - CORREGIDO
  const encontrarPrimeraPosicionLibre = () => {
    const posicionesOcupadas = plants.map(p => p.p);
    for (let i = 1; i <= 15; i++) {
      if (!posicionesOcupadas.includes(i)) {
        return i;
      }
    }
    return 1;
  };

  // Cálculos
  const aquaVegaDosage = useMemo(() => {
    return calculateAquaVegaDosage(
      plants,
      parseFloat(config.currentVol || "20"),
      parseFloat(config.targetEC || "1100"),
      config.waterType
    );
  }, [plants, config.currentVol, config.targetEC, config.waterType]);

  const waterCharacteristics = useMemo(() => {
    return getWaterCharacteristics(config.waterType);
  }, [config.waterType]);

  // Render por pasos
  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                  <Sprout size={64} className="text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              HydroCaru Optimizado
            </h1>
            
            <p className="text-xl text-gray-600 max-w-lg mx-auto">
              Sistema experto para cultivo hidropónico con cálculo EC escalonado seguro para lechugas
            </p>
            
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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Paso 1: Información Importante</h2>
              <p className="text-gray-600">Protocolo de preparación optimizado</p>
            </div>
            
            <Card className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="font-bold text-gray-800 text-xl mb-4">⚠️ CONSEJO SUPER IMPORTANTE</h3>
              <p className="text-gray-700 mb-4">
                El éxito en hidroponía depende del <strong>orden correcto</strong> y de usar <strong>valores seguros de EC</strong>.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800">Llenar el depósito con agua</h5>
                    <p className="text-sm text-gray-600">Usa el tipo de agua que has seleccionado</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800">Añadir AQUA VEGA A</h5>
                    <p className="text-sm text-gray-600">La cantidad calculada por este sistema</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800">Añadir AQUA VEGA B</h5>
                    <p className="text-sm text-gray-600">La misma cantidad que AQUA VEGA A</p>
                  </div>
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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Paso 2: Configuración Básica</h2>
              <p className="text-gray-600">Define las características de tu sistema</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Droplets className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Volumen del Sistema</h3>
                    <p className="text-sm text-gray-600">Capacidad total del depósito</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volumen Total (Litros)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={config.totalVol}
                      onChange={(e) => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>10L</span>
                      <span className="font-bold text-blue-600">{config.totalVol}L</span>
                      <span>50L</span>
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
                    <h3 className="font-bold text-gray-800">Tipo de Agua</h3>
                    <p className="text-sm text-gray-600">Selecciona el agua que usas</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(WATER_TYPES).map(([key, water]) => (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        config.waterType === key 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setConfig({...config, waterType: key})}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {water.icon}
                        <span className="font-bold text-gray-800">{water.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{water.description}</p>
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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Paso 3: Mediciones Actuales</h2>
              <p className="text-gray-600">Introduce los valores medidos de tu sistema</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Activity className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">pH del Agua</h3>
                    <p className="text-sm text-gray-600">Rango ideal para lechugas: 5.5 - 6.5</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
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
                  
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>4.0</span>
                    <span className="font-bold text-green-600">5.5-6.5</span>
                    <span>9.0</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Conductividad Eléctrica (EC)</h3>
                    <p className="text-sm text-gray-600">Nivel de nutrientes en µS/cm - Valores seguros</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
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
                  
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0</span>
                    <span className="font-bold text-green-600">800-1500</span>
                    <span>3000</span>
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
        // Actualizar posición automáticamente si la seleccionada está ocupada
        useEffect(() => {
          const posicionOcupada = plants.find(p => p.p === selPos.p);
          if (posicionOcupada) {
            const nuevaPosicion = encontrarPrimeraPosicionLibre();
            setSelPos(prev => ({ ...prev, p: nuevaPosicion }));
          }
        }, [plants, selPos.p]);

        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Paso 4: Configurar Torre</h2>
              <p className="text-gray-600">Añade plantas a tu sistema hidropónico</p>
            </div>
            
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TreePine className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Sistema Escalonado 5-5-5</h3>
                  <p className="text-sm text-gray-600">15 plantas en 3 niveles de desarrollo</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800">Añadir Nueva Planta</h4>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {plants.length}/15 plantas
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSelPos(prev => ({...prev, l: level}))}
                            className={`flex-1 py-3 rounded-lg text-center font-medium transition-all ${
                              selPos.l === level 
                                ? level === 1 ? 'bg-cyan-500 text-white' :
                                  level === 2 ? 'bg-green-500 text-white' :
                                  'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Nivel {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variedad
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(VARIETIES).map(variety => (
                          <button
                            key={variety}
                            type="button"
                            onClick={() => setSelPos(prev => ({...prev, v: variety}))}
                            className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                              selPos.v === variety 
                                ? `${VARIETIES[variety].color} text-white`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {variety}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                  ? 'bg-red-100 text-red-700 cursor-not-allowed'
                                  : selPos.p === pos
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      const posicionOcupada = plants.find(p => p.p === selPos.p);
                      if (posicionOcupada) {
                        alert(`La posición ${selPos.p} ya está ocupada. Selecciona otra posición.`);
                        return;
                      }
                      
                      if (plants.length >= 15) {
                        alert("Ya hay 15 plantas (máximo). No se pueden añadir más.");
                        return;
                      }
                      
                      setPlants([...plants, {
                        id: generatePlantId(),
                        l: selPos.l,
                        v: selPos.v,
                        p: selPos.p,
                        date: new Date().toISOString()
                      }]);
                      
                      // Buscar siguiente posición libre
                      const nuevaPosicion = encontrarPrimeraPosicionLibre();
                      setSelPos(prev => ({ 
                        ...prev, 
                        p: nuevaPosicion 
                      }));
                    }}
                    disabled={plants.length >= 15}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
                  >
                    <Plus className="mr-2" />
                    Añadir Planta a la Torre
                  </Button>
                </div>
                
                {plants.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4">Plantas Actuales</h4>
                    <div className="space-y-3">
                      {plants.map(plant => (
                        <div key={plant.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-gray-200'}`}>
                              <span className="text-white font-bold">{plant.p}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{plant.v}</span>
                                <Badge className={
                                  plant.l === 1 ? 'bg-cyan-100 text-cyan-700' :
                                  plant.l === 2 ? 'bg-green-100 text-green-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }>
                                  Nivel {plant.l}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Posición {plant.p}
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPlants(plants.filter(p => p.id !== plant.id));
                            }}
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

  // COMPONENTES DE PESTAÑAS
  const DashboardTab = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-gray-600">Sistema hidropónico con cálculo EC escalonado</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800">
            {plants.length}/15 plantas
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-3 bg-gradient-to-b from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={12} />
            </div>
            <span className="font-bold text-purple-700 text-xs">pH Agua</span>
          </div>
          <CircularGauge 
            value={parseFloat(config.ph || "6.0")} 
            min={4} 
            max={9} 
            label="pH" 
            unit="" 
            color="purple"
            size="sm"
          />
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={12} />
            </div>
            <span className="font-bold text-blue-700 text-xs">Conductividad</span>
          </div>
          <CircularGauge 
            value={parseFloat(config.ec || "1000")} 
            min={0} 
            max={3000} 
            label="EC" 
            unit="µS/cm" 
            color="blue"
            size="sm"
          />
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Thermometer className="text-white" size={12} />
            </div>
            <span className="font-bold text-amber-700 text-xs">Temp Agua</span>
          </div>
          <CircularGauge 
            value={parseFloat(measurements.manualWaterTemp || "22")} 
            min={0} 
            max={40} 
            label="Temp Agua" 
            unit="°C" 
            color="amber"
            size="sm"
          />
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gradient-to-b from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Droplets className="text-white" size={12} />
            </div>
            <span className="font-bold text-emerald-700 text-xs">Volumen</span>
          </div>
          <CircularGauge 
            value={parseFloat(config.currentVol || "20")} 
            min={0} 
            max={parseFloat(config.totalVol) || 20} 
            label="Volumen" 
            unit="L" 
            color="emerald"
            size="sm"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sprout className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Estado del Cultivo</h3>
              <p className="text-sm text-gray-600">Sistema 5-5-5</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Plántulas (N1):</span>
              <span className="font-bold text-cyan-600">{plants.filter(p => p.l === 1).length}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Crecimiento (N2):</span>
              <span className="font-bold text-green-600">{plants.filter(p => p.l === 2).length}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Maduras (N3):</span>
              <span className="font-bold text-emerald-600">{plants.filter(p => p.l === 3).length}/5</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Nutrición AQUA VEGA</h3>
              <p className="text-sm text-gray-600">AQUA VEGA A+B</p>
            </div>
          </div>
          
          {plants.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">EC objetivo:</span>
                <span className="font-bold text-blue-600">{config.targetEC} µS/cm</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">AQUA VEGA A:</span>
                <span className="font-bold text-emerald-600">{aquaVegaDosage.a} ml</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">AQUA VEGA B:</span>
                <span className="font-bold text-emerald-600">{aquaVegaDosage.b} ml</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Añade plantas para ver dosificación</p>
          )}
        </Card>
        
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CloudRain className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Condiciones Agua</h3>
              <p className="text-sm text-gray-600">Depósito con monitoreo</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Volumen:</span>
              <span className="font-bold text-blue-600">{config.currentVol}L / {config.totalVol}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tipo agua:</span>
              <span className="font-bold text-cyan-600">{waterCharacteristics.name}</span>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            // Simular rotación de niveles
            const nuevasPlantas = plants.map(plant => {
              if (plant.l === 1) return { ...plant, l: 2 };
              if (plant.l === 2) return { ...plant, l: 3 };
              return plant;
            }).filter(plant => plant.l !== 3); // Eliminar nivel 3 (cosechadas)
            
            // Añadir 5 nuevas plántulas
            const nuevasPlantalas = Array.from({ length: 5 }, (_, i) => ({
              id: generatePlantId(),
              l: 1,
              v: "Iceberg",
              p: i + 1,
              date: new Date().toISOString()
            }));
            
            setPlants([...nuevasPlantas, ...nuevasPlantalas]);
            alert("Rotación completada exitosamente");
          }}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
        >
          <RotateCcw className="mr-2" />
          Rotar Niveles
        </Button>
        
        <Button
          onClick={() => {
            const now = new Date().toISOString();
            setMeasurements(prev => ({
              ...prev,
              lastMeasurement: now
            }));
            alert("Medición guardada correctamente");
          }}
          variant="outline"
        >
          <Clipboard className="mr-2" />
          Guardar Medición
        </Button>
      </div>
    </div>
  );

  // RENDER PRINCIPAL
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">HydroCaru Optimizado</h1>
                <p className="text-xs text-gray-600">Sistema hidropónico simplificado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {step >= 5 ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("¿Reiniciar configuración?")) {
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
                          useAirDiffuser: true
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
                        setTab("dashboard");
                      }
                    }}
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Reiniciar
                  </Button>
                  
                  <Badge className="bg-green-100 text-green-800">
                    Sistema OK
                  </Badge>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">Paso {step + 1} de 5</div>
                  <Progress value={(step + 1) * 20} className="w-24 h-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {step >= 5 && (
        <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="container mx-auto p-4 max-w-6xl">
            <div className="grid grid-cols-4 w-full gap-2">
              <button
                onClick={() => setTab("dashboard")}
                className={`flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                  tab === "dashboard" 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105" 
                    : "bg-gradient-to-r from-blue-100 to-cyan-100 text-gray-600 hover:scale-105 hover:shadow-md"
                }`}
              >
                <Home size={20} />
              </button>
              
              <button
                onClick={() => setTab("tower")}
                className={`flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                  tab === "tower" 
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105" 
                    : "bg-gradient-to-r from-emerald-100 to-green-100 text-gray-600 hover:scale-105 hover:shadow-md"
                }`}
              >
                <TreePine size={20} />
              </button>
              
              <button
                onClick={() => setTab("calculator")}
                className={`flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                  tab === "calculator" 
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105" 
                    : "bg-gradient-to-r from-purple-100 to-pink-100 text-gray-600 hover:scale-105 hover:shadow-md"
                }`}
              >
                <Calculator size={20} />
              </button>
              
              <button
                onClick={() => setTab("history")}
                className={`flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                  tab === "history" 
                    ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg scale-105" 
                    : "bg-gradient-to-r from-rose-100 to-pink-100 text-gray-600 hover:scale-105 hover:shadow-md"
                }`}
              >
                <BarChart size={20} />
              </button>
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
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Gestión de la Torre</h2>
                  <p className="text-gray-600">Sistema escalonado 5-5-5</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Sprout className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Nivel 1 - Plántulas</h3>
                        <p className="text-sm text-gray-600">Plantas jóvenes</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {plants.filter(p => p.l === 1).map(plant => (
                        <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-gray-200'}`}>
                              <span className="text-white text-xs font-bold">{plant.p}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{plant.v}</p>
                              <p className="text-xs text-gray-500">Posición {plant.p}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPlants(plants.filter(p => p.id !== plant.id))}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Activity className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Nivel 2 - Crecimiento</h3>
                        <p className="text-sm text-gray-600">Plantas en desarrollo</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {plants.filter(p => p.l === 2).map(plant => (
                        <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-gray-200'}`}>
                              <span className="text-white text-xs font-bold">{plant.p}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{plant.v}</p>
                              <p className="text-xs text-gray-500">Posición {plant.p}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPlants(plants.filter(p => p.id !== plant.id))}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Leaf className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Nivel 3 - Maduración</h3>
                        <p className="text-sm text-gray-600">Plantas listas para cosechar</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {plants.filter(p => p.l === 3).map(plant => (
                        <div key={plant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-gray-200'}`}>
                              <span className="text-white text-xs font-bold">{plant.p}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{plant.v}</p>
                              <p className="text-xs text-gray-500">Posición {plant.p}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPlants(plants.filter(p => p.id !== plant.id))}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                
                <Button
                  onClick={() => {
                    if (plants.length >= 15) {
                      alert("La torre está llena (15/15 plantas)");
                      return;
                    }
                    setStep(4);
                  }}
                >
                  <Plus className="mr-2" />
                  Añadir Más Plantas
                </Button>
              </div>
            )}
            {tab === "calculator" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Calculadora</h2>
                  <p className="text-gray-600">Cálculos para tu sistema</p>
                </div>
                
                <Card className="p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                      <FlaskConical className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Dosis AQUA VEGA</h3>
                      <p className="text-sm text-gray-600">Para {config.currentVol}L de agua</p>
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
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FlaskConical className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500">Añade plantas a la torre para calcular dosis</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
            {tab === "history" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Historial</h2>
                  <p className="text-gray-600">Registro de plantas</p>
                </div>
                
                <Card className="p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <BarChart className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Resumen de Plantas</h3>
                      <p className="text-sm text-gray-600">Total: {plants.length} plantas</p>
                    </div>
                  </div>
                  
                  {plants.length > 0 ? (
                    <div className="space-y-4">
                      {plants.map(plant => (
                        <div key={plant.id} className="p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-gray-200'}`}>
                                <span className="text-white font-bold">{plant.p}</span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{plant.v}</p>
                                <p className="text-sm text-gray-600">
                                  Nivel {plant.l} • Posición {plant.p}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(plant.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500">No hay plantas registradas</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Sistema hidropónico HydroCaru • {plants.length} plantas
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>EC: {config.targetEC} µS/cm</span>
              <span>•</span>
              <span>pH: {config.ph}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
