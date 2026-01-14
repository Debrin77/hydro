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
// CONFIGURACIÓN BASE - SIMPLIFICADA
// ============================================================================

const WATER_TYPES = {
  "osmosis": {
    name: "Ósmosis Inversa",
    icon: <Filter className="text-blue-500" />,
    ecBase: 0.0,
    hardness: 0,
    phBase: 7.0,
    description: "Agua pura, EC casi 0. Perfecta para hidroponía.",
    calmagRequired: true
  },
  "bajo_mineral": {
    name: "Baja Mineralización",
    icon: <Droplets className="text-cyan-500" />,
    ecBase: 200,
    hardness: 50,
    phBase: 7.2,
    description: "Agua blanda, ideal para hidroponía.",
    calmagRequired: false
  },
  "medio_mineral": {
    name: "Media Mineralización",
    icon: <Droplets className="text-teal-500" />,
    ecBase: 400,
    hardness: 150,
    phBase: 7.5,
    description: "Agua de grifo típica.",
    calmagRequired: false
  },
  "alta_mineral": {
    name: "Alta Mineralización",
    icon: <Droplets className="text-amber-500" />,
    ecBase: 800,
    hardness: 300,
    phBase: 8.0,
    description: "Agua dura, alta en calcio/magnesio.",
    calmagRequired: false
  }
};

const VARIETIES = {
  "Iceberg": { 
    color: "bg-cyan-500",
    textColor: "text-cyan-700",
    icon: <Sprout className="text-white" size={16} />,
    ecMax: 1600,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },
      growth:   { a: 22, b: 22, ec: 1300 },
      mature:   { a: 28, b: 28, ec: 1600 }
    }
  },
  "Lollo Rosso": { 
    color: "bg-purple-500",
    textColor: "text-purple-700",
    icon: <Activity className="text-white" size={16} />,
    ecMax: 1800,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },
      growth:   { a: 22, b: 22, ec: 1400 },
      mature:   { a: 28, b: 28, ec: 1700 }
    }
  },
  "Maravilla": { 
    color: "bg-amber-500",
    textColor: "text-amber-700",
    icon: <Leaf className="text-white" size={16} />,
    ecMax: 1700,
    phIdeal: 6.0,
    cannaDosage: {
      seedling: { a: 18, b: 18, ec: 900 },
      growth:   { a: 22, b: 22, ec: 1300 },
      mature:   { a: 28, b: 28, ec: 1600 }
    }
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO - SIMPLIFICADAS
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
  if (plants.length === 0) return { a: 0, b: 0, per10L: { a: 0, b: 0 } };

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
    }
  };
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
// COMPONENTE PRINCIPAL - SIMPLIFICADO Y FUNCIONAL
// ============================================================================

export default function HydroAppFinal() {
  // Estados principales
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [tab, setTab] = useState("dashboard");
  
  // Estados para añadir plantas - CORREGIDOS
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  
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
    osmosisMixPercentage: 0
  });

  // =================== PERSISTENCIA ===================

  useEffect(() => {
    const saved = localStorage.getItem("hydro_master");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlants(data.plants || []);
        setConfig(data.config || config);
        setHistory(data.history || []);
        setLastRot(data.lastRot || lastRot);
        setLastClean(data.lastClean || lastClean);
        
        // CORRECCIÓN: Si hay plantas, ir directamente al dashboard
        if (data.plants && data.plants.length > 0) {
          setStep(4);
          setTab("dashboard");
        }
      } catch (e) {
        console.log("Error cargando datos, empezando fresco");
      }
    }
  }, []);

  useEffect(() => {
    if (step >= 2) {
      localStorage.setItem("hydro_master", 
        JSON.stringify({ 
          plants, 
          config, 
          history, 
          lastRot, 
          lastClean
        }));
    }
  }, [plants, config, history, lastRot, lastClean, step]);

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

  // FUNCIÓN CORREGIDA PARA AÑADIR PLANTAS
  const handleAddPlant = () => {
    // Validar que todo esté seleccionado
    if (!selectedLevel || !selectedVariety || !selectedPosition) {
      alert("Por favor, selecciona nivel, variedad y posición");
      return;
    }

    // Verificar si la posición ya está ocupada
    const isPositionOccupied = plants.some(p => p.p === selectedPosition);
    if (isPositionOccupied) {
      alert(`❌ La posición ${selectedPosition} ya está ocupada.`);
      return;
    }

    // Verificar límite por nivel
    const plantsInLevel = plants.filter(p => p.l === selectedLevel).length;
    if (plantsInLevel >= 5) {
      alert(`❌ El nivel ${selectedLevel} ya tiene 5 plantas (máximo).`);
      return;
    }

    // Añadir la planta
    const newPlant = {
      id: generatePlantId(),
      l: selectedLevel,
      v: selectedVariety,
      p: selectedPosition,
      date: new Date().toISOString()
    };

    setPlants([...plants, newPlant]);
    
    // Limpiar selección
    setSelectedLevel(null);
    setSelectedVariety(null);
    setSelectedPosition(null);
    
    // Mostrar confirmación
    alert(`✅ Planta "${selectedVariety}" añadida en Nivel ${selectedLevel}, Posición ${selectedPosition}`);
  };

  // =================== CÁLCULOS ===================

  const calendarDays = useMemo(() => {
    return generateCalendar(plants, lastRot, lastClean);
  }, [plants, lastRot, lastClean]);

  const systemEC = useMemo(() => {
    return calculateSystemEC(plants, parseFloat(config.currentVol), config.waterType);
  }, [plants, config.currentVol, config.waterType]);

  // =================== FUNCIÓN PARA PASAR AL SIGUIENTE PASO ===================
  // CORRECCIÓN CRÍTICA: Función que maneja la transición del paso 3 al 4

  const handleCompleteConfiguration = () => {
    if (plants.length === 0) {
      alert("Debes añadir al menos una planta para continuar");
      return;
    }
    
    console.log("Pasando al dashboard con plantas:", plants);
    
    // FORZAR EL GUARDADO
    localStorage.setItem("hydro_master", 
      JSON.stringify({ 
        plants, 
        config, 
        history, 
        lastRot, 
        lastClean
      }));
    
    // Ir al dashboard
    setStep(4);
    setTab("dashboard");
    
    // Forzar un re-render si es necesario
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
  };

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
                  <h3 className="font-bold text-slate-800">Gestión de Plantas</h3>
                  <p className="text-sm text-slate-600">Sistema 5-5-5 simplificado</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Droplets className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">Control de Nutrientes</h3>
                  <p className="text-sm text-slate-600">Cálculos automáticos de EC y pH</p>
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
                        Valor de pH
                      </label>
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
                            onClick={() => setSelectedLevel(level)}
                            className={`flex-1 py-3 rounded-lg text-center font-medium transition-all ${
                              selectedLevel === level 
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
                      <div className="grid grid-cols-1 gap-2">
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
                            <div className="flex items-center justify-center gap-2">
                              {VARIETIES[variety].icon}
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
                          const isOccupied = plants.some(p => p.p === pos);
                          const isSelected = selectedPosition === pos;
                          
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => {
                                if (!isOccupied) {
                                  setSelectedPosition(pos);
                                }
                              }}
                              className={`aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${
                                isOccupied 
                                  ? 'bg-red-100 text-red-700 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              disabled={isOccupied}
                              title={isOccupied ? `Ocupada por ${plants.find(p => p.p === pos)?.v}` : `Posición ${pos}`}
                            >
                              {isOccupied ? (
                                <X className="text-red-500" size={16} />
                              ) : isSelected ? (
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
                    onClick={handleAddPlant}
                    disabled={!selectedLevel || !selectedVariety || !selectedPosition}
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
              
              {/* CORRECCIÓN: Usar la nueva función para completar la configuración */}
              <Button 
                onClick={handleCompleteConfiguration}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={plants.length === 0}
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

  // Resto del código se mantiene igual...
  // [El resto del código permanece exactamente igual que en tu versión original]

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
              <TabsTrigger value="dashboard" onClick={() => setTab("dashboard")} className="flex items-center justify-center gap-2 px-2 py-3">
                <Home size={16} />
                <span className="hidden sm:inline">Panel</span>
              </TabsTrigger>
              <TabsTrigger value="tower" onClick={() => setTab("tower")} className="flex items-center justify-center gap-2 px-2 py-3">
                <TreePine size={16} />
                <span className="hidden sm:inline">Torre</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" onClick={() => setTab("calendar")} className="flex items-center justify-center gap-2 px-2 py-3">
                <Calendar size={16} />
                <span className="hidden sm:inline">Calendario</span>
              </TabsTrigger>
              <TabsTrigger value="settings" onClick={() => setTab("settings")} className="flex items-center justify-center gap-2 px-2 py-3">
                <Settings size={16} />
                <span className="hidden sm:inline">Ajustes</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Resto del renderizado de pestañas... */}
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
