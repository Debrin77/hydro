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
// FUNCIONES DE CÁLCULO - CORREGIDAS
// ============================================================================

const calculateSystemEC = (plants, totalVolume, waterType = "bajo_mineral") => {
  if (!plants || plants.length === 0) return { targetEC: "1200", targetPH: "6.0", statistics: { seedlingCount: 0, growthCount: 0, matureCount: 0 } };
  
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
  if (!plants || plants.length === 0 || !totalVolume || totalVolume <= 0) return { a: 0, b: 0, per10L: { a: 0, b: 0 } };

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

// ============================================================================
// FUNCIÓN GENERATE CALENDAR - AÑADIDA
// ============================================================================

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

  // =================== COMPONENTE DE CONFIRMACIÓN ===================

  const CompletionConfirmation = () => (
    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">¡Sistema Configurado!</h3>
            <p className="text-emerald-100 text-sm">
              {plants.length} plantas activas • EC objetivo: {systemEC.targetEC} µS/cm • pH: {systemEC.targetPH}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white/20 hover:bg-white/30 border-white text-white"
          onClick={() => {
            if (confirm("¿Reiniciar todo el sistema? Se perderán todos los datos.")) {
              localStorage.removeItem("hydro_master");
              setPlants([]);
              setStep(0);
              setTab("dashboard");
            }
          }}
        >
          <RotateCcw size={14} className="mr-2" />
          Reiniciar
        </Button>
      </div>
    </div>
  );

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
              className="px-8 py-6 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
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
              
              <Button 
                onClick={() => {
                  if (plants.length === 0) {
                    alert("⚠️ Debes añadir al menos una planta para continuar");
                    return;
                  }
                  setStep(4);
                  setTab("dashboard");
                  alert("✅ ¡Configuración completada! Ahora puedes usar todas las funciones del sistema.");
                }}
                disabled={plants.length === 0}
                className={`px-8 py-3 rounded-xl ${plants.length === 0 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white'}`}
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

  const DashboardTab = () => {
    const cannaDosage = calculateCannaDosage(plants, parseFloat(config.currentVol), systemEC.targetEC, config.waterType);
    
    return (
      <div className="space-y-8 animate-fade-in">
        <CompletionConfirmation />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
            <p className="text-slate-600">Sistema hidropónico - {plants.length} plantas activas</p>
          </div>
          
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            {systemEC.targetEC} µS/cm • pH {systemEC.targetPH}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Objetivos del Sistema</h3>
                <p className="text-sm text-slate-600">Valores recomendados</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">EC Objetivo</p>
                    <p className="text-2xl font-bold text-blue-700">{systemEC.targetEC} µS/cm</p>
                  </div>
                  <Zap className="text-blue-600" size={24} />
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">pH Objetivo</p>
                    <p className="text-2xl font-bold text-purple-700">{systemEC.targetPH}</p>
                  </div>
                  <Activity className="text-purple-600" size={24} />
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">Volumen Actual</p>
                    <p className="text-2xl font-bold text-emerald-700">{config.currentVol}L</p>
                  </div>
                  <Droplets className="text-emerald-600" size={24} />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <FlaskConical className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Dosis de Nutrientes</h3>
                <p className="text-sm text-slate-600">Para {config.currentVol}L de agua</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Nutriente A</p>
                    <p className="text-3xl font-bold text-blue-700">{cannaDosage.a}ml</p>
                    <p className="text-xs text-slate-500 mt-1">{cannaDosage.per10L.a}ml/10L</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border-2 border-green-200">
                    <p className="text-sm text-green-600 font-medium">Nutriente B</p>
                    <p className="text-3xl font-bold text-green-700">{cannaDosage.b}ml</p>
                    <p className="text-xs text-slate-500 mt-1">{cannaDosage.per10L.b}ml/10L</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TreePine className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Resumen de Torre</h3>
                <p className="text-sm text-slate-600">Distribución de plantas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-cyan-50 rounded-lg">
                  <p className="text-2xl font-bold text-cyan-700">{plants.filter(p => p.l === 1).length}</p>
                  <p className="text-sm text-cyan-600">Nivel 1</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{plants.filter(p => p.l === 2).length}</p>
                  <p className="text-sm text-green-600">Nivel 2</p>
                </div>
                
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-700">{plants.filter(p => p.l === 3).length}</p>
                  <p className="text-sm text-emerald-600">Nivel 3</p>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">{plants.length}/15 plantas</span> en el sistema
                </p>
              </div>
              
              <Button
                onClick={() => {
                  const ph = prompt("pH medido:", config.ph);
                  const ec = prompt("EC medido (µS/cm):", config.ec);
                  const temp = prompt("Temperatura (°C):", config.temp);
                  
                  if (ph && ec && temp) {
                    setConfig({
                      ...config,
                      ph: ph,
                      ec: ec,
                      temp: temp
                    });
                    
                    const newRecord = {
                      id: generatePlantId(),
                      date: new Date().toISOString(),
                      ph,
                      ec,
                      notes: "Medición manual"
                    };
                    setHistory([...history, newRecord]);
                    
                    alert("✅ Parámetros actualizados");
                  }
                }}
                className="w-full"
              >
                <RefreshCw className="mr-2" size={16} />
                Actualizar Parámetros
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const TowerTab = () => {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestión de Torre</h1>
            <p className="text-slate-600">15 posiciones - Sistema 5-5-5</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRotation}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            >
              <RotateCcw className="mr-2" size={16} />
              Rotar Niveles
            </Button>
            
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setSelectedLevel(null);
                setSelectedVariety(null);
                setSelectedPosition(null);
              }}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
            >
              <Plus className="mr-2" size={16} />
              {showAddForm ? 'Ocultar Formulario' : 'Añadir Planta'}
            </Button>
          </div>
        </div>
        
        {showAddForm && (
          <Card className="p-6 rounded-2xl">
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
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl">
            <h3 className="font-bold text-slate-800 mb-6">Vista de Torre</h3>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({length: 15}, (_, i) => i + 1).map(pos => {
                const plant = plants.find(p => p.p === pos);
                
                return (
                  <div
                    key={pos}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-3 ${
                      plant 
                        ? plant.l === 1 ? 'bg-cyan-50 border-2 border-cyan-200' :
                          plant.l === 2 ? 'bg-green-50 border-2 border-green-200' :
                          'bg-emerald-50 border-2 border-emerald-200'
                        : 'bg-slate-100 border-2 border-slate-200'
                    }`}
                  >
                    <div className="text-lg font-bold mb-2">{pos}</div>
                    {plant ? (
                      <>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          plant.l === 1 ? 'bg-cyan-100' :
                          plant.l === 2 ? 'bg-green-100' :
                          'bg-emerald-100'
                        }`}>
                          {VARIETIES[plant.v]?.icon || 
                           (plant.l === 1 ? <Sprout className="text-cyan-600" size={16} /> :
                            plant.l === 2 ? <Activity className="text-green-600" size={16} /> :
                            <Leaf className="text-emerald-600" size={16} />)}
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium">{plant.v}</div>
                          <div className={`text-xs ${
                            plant.l === 1 ? 'text-cyan-600' :
                            plant.l === 2 ? 'text-green-600' :
                            'text-emerald-600'
                          }`}>
                            Nivel {plant.l}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 text-sm text-center">Vacía</div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          
          <div className="space-y-6">
            <Card className="p-6 rounded-2xl">
              <h3 className="font-bold text-slate-800 mb-4">Resumen por Niveles</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(level => {
                  const plantsInLevel = plants.filter(p => p.l === level);
                  return (
                    <div key={level} className="p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            level === 1 ? 'bg-cyan-100' :
                            level === 2 ? 'bg-green-100' :
                            'bg-emerald-100'
                          }`}>
                            {level === 1 ? <Sprout className="text-cyan-600" size={16} /> :
                             level === 2 ? <Activity className="text-green-600" size={16} /> :
                             <Leaf className="text-emerald-600" size={16} />}
                          </div>
                          <span className="font-bold text-slate-800">Nivel {level}</span>
                        </div>
                        <Badge className={
                          level === 1 ? 'bg-cyan-100 text-cyan-700' :
                          level === 2 ? 'bg-green-100 text-green-700' :
                          'bg-emerald-100 text-emerald-700'
                        }>
                          {plantsInLevel.length}/5
                        </Badge>
                      </div>
                      {plantsInLevel.length > 0 ? (
                        <div className="space-y-2">
                          {plantsInLevel.map(plant => (
                            <div key={plant.id} className="flex justify-between items-center text-sm">
                              <span>{plant.v}</span>
                              <span className="text-slate-600">Posición {plant.p}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No hay plantas en este nivel</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
            
            <Card className="p-6 rounded-2xl">
              <h3 className="font-bold text-slate-800 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    if (plants.length === 0) {
                      alert("No hay plantas para eliminar");
                      return;
                    }
                    if (confirm(`¿Eliminar TODAS las plantas? (${plants.length} plantas)`)) {
                      setPlants([]);
                      alert("Todas las plantas han sido eliminadas");
                    }
                  }}
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2" size={16} />
                  Eliminar Todas las Plantas
                </Button>
                
                <Button
                  onClick={handleRotation}
                  className="w-full"
                >
                  <RotateCcw className="mr-2" size={16} />
                  Rotar Niveles
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const CalendarTab = () => {
    const now = new Date();
    const currentMonth = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
    
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Calendario de Mantenimiento</h1>
            <p className="text-slate-600">Planificación y seguimiento de tareas</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              {currentMonth}
            </Badge>
          </div>
        </div>
        
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Calendario Mensual</h3>
              <p className="text-slate-600">Tareas programadas</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-7 gap-1 mb-3">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isToday = day.date.toDateString() === now.toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 rounded-lg border ${
                      isToday 
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300' 
                        : day.isCurrentMonth 
                        ? 'bg-white border-slate-200' 
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium ${
                        isToday 
                          ? 'text-blue-700' 
                          : day.isCurrentMonth 
                          ? 'text-slate-800' 
                          : 'text-slate-400'
                      }`}>
                        {day.dayOfMonth}
                      </span>
                      
                      {isToday && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {day.events.includes('measure') && (
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Medir pH/EC
                        </div>
                      )}
                      
                      {day.events.includes('rotation') && (
                        <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Rotar
                        </div>
                      )}
                      
                      {day.events.includes('clean') && (
                        <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Limpiar
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl">
            <h3 className="font-bold text-slate-800 mb-4">Próximas Tareas</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <h4 className="font-bold text-blue-800 mb-2">Medición de pH y EC</h4>
                <p className="text-blue-700">
                  Cada {plants.length > 10 ? '2' : plants.length > 5 ? '3' : '4'} días
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <h4 className="font-bold text-green-800 mb-2">Rotación de Niveles</h4>
                <p className="text-green-700">
                  Última: {new Date(lastRot).toLocaleDateString('es-ES')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRotation}
                  className="mt-2"
                >
                  Realizar Rotación
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 rounded-2xl">
            <h3 className="font-bold text-slate-800 mb-4">Historial Reciente</h3>
            <div className="space-y-3">
              {history.slice(-3).reverse().map(record => (
                <div key={record.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-800">
                        {new Date(record.date).toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                      <p className="text-sm text-slate-600">
                        pH: {record.ph} • EC: {record.ec} µS/cm
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHistoryRecord(record.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              
              {history.length === 0 && (
                <p className="text-slate-500 text-center py-4">No hay historial registrado</p>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const ph = prompt("pH medido:", config.ph);
                  const ec = prompt("EC medido (µS/cm):", config.ec);
                  
                  if (ph && ec) {
                    const newRecord = {
                      id: generatePlantId(),
                      date: new Date().toISOString(),
                      ph,
                      ec,
                      notes: "Medición manual"
                    };
                    setHistory([...history, newRecord]);
                    alert("✅ Medición registrada");
                  }
                }}
              >
                <Plus className="mr-2" size={16} />
                Añadir Medición
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const SettingsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h1>
        <p className="text-slate-600">Ajustes y preferencias</p>
      </div>
      
      <Card className="p-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 mb-6">Configuración General</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Volumen Total del Depósito: {config.totalVol}L
            </label>
            <Slider
              value={[parseFloat(config.totalVol)]}
              min={10}
              max={50}
              step={5}
              onValueChange={([value]) => setConfig({...config, totalVol: value.toString()})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Temperatura Objetivo: {config.temp}°C
            </label>
            <Slider
              value={[parseFloat(config.temp)]}
              min={10}
              max={35}
              step={0.5}
              onValueChange={([value]) => setConfig({...config, temp: value.toString()})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Tipo de Agua
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(WATER_TYPES).map(([key, water]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setConfig({...config, waterType: key})}
                  className={`py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                    config.waterType === key 
                      ? `${key === "osmosis" ? "bg-blue-500" : 
                          key === "bajo_mineral" ? "bg-cyan-500" : 
                          key === "medio_mineral" ? "bg-teal-500" : 
                          "bg-amber-500"} text-white`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {water.icon}
                    <span>{water.name.split(" ")[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 mb-6">Mantenimiento</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <h4 className="font-bold text-blue-800 mb-2">Última Rotación</h4>
            <p className="text-blue-700">
              {new Date(lastRot).toLocaleDateString('es-ES')}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRotation}
              className="mt-2"
            >
              Realizar Rotación
            </Button>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <h4 className="font-bold text-purple-800 mb-2">Última Limpieza</h4>
            <p className="text-purple-700">
              {new Date(lastClean).toLocaleDateString('es-ES')}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (confirm("¿Registrar limpieza del sistema?")) {
                  setLastClean(new Date().toISOString());
                  alert("✅ Limpieza registrada");
                }
              }}
              className="mt-2"
            >
              Registrar Limpieza
            </Button>
          </div>
          
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              if (confirm("¿Restablecer todos los datos? Esto eliminará todas las plantas, historial y configuraciones.")) {
                localStorage.removeItem("hydro_master");
                setPlants([]);
                setHistory([]);
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
                  osmosisMixPercentage: 0
                });
                setStep(0);
                setTab("dashboard");
                alert("✅ Sistema restablecido");
              }
            }}
          >
            <RotateCcw className="mr-2" size={16} />
            Restablecer Sistema
          </Button>
        </div>
      </Card>
    </div>
  );

  // =================== RENDER PRINCIPAL ===================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      {step < 4 ? (
        <div className="max-w-6xl mx-auto">
          {renderStep()}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <CompletionConfirmation />
          
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
          
          {tab === "dashboard" && <DashboardTab />}
          {tab === "tower" && <TowerTab />}
          {tab === "calendar" && <CalendarTab />}
          {tab === "settings" && <SettingsTab />}
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
