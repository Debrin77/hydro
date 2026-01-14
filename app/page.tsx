"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Sprout, Activity, Leaf, TreePine,
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  AlertTriangle, Droplets, Thermometer, Zap, ShieldAlert, 
  ChevronRight, ArrowLeft, ArrowRight, RefreshCw, 
  Target, RotateCcw, Calendar, Home, Settings,
  X, Filter, ThermometerSnowflake, ThermometerSun
} from "lucide-react"

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
// FUNCIONES DE CÁLCULO
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

// ============================================================================
// COMPONENTE PRINCIPAL - CORREGIDO
// ============================================================================

export default function HydroAppFinal() {
  // Estados principales
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  
  // Estados para añadir plantas
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
    waterType: "bajo_minimal"
  });

  // =================== PERSISTENCIA ===================

  useEffect(() => {
    const saved = localStorage.getItem("hydro_master");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlants(data.plants || []);
        setConfig(data.config || config);
        
        if (data.plants && data.plants.length > 0) {
          setStep(4);
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
          config
        }));
    }
  }, [plants, config, step]);

  // =================== FUNCIONES UTILITARIAS ===================

  const generatePlantId = () => {
    return `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // FUNCIÓN CORREGIDA PARA AÑADIR PLANTAS
  const handleAddPlant = () => {
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

  // =================== FUNCIÓN SIMPLIFICADA PARA PASAR AL DASHBOARD ===================

  const handleCompleteConfiguration = () => {
    if (plants.length === 0) {
      alert("Debes añadir al menos una planta para continuar");
      return;
    }
    
    console.log("Plantas añadidas:", plants);
    console.log("Pasando al dashboard...");
    
    // Guardar en localStorage
    localStorage.setItem("hydro_master", 
      JSON.stringify({ 
        plants, 
        config
      }));
    
    // Ir directamente al dashboard
    setStep(4);
  };

  // =================== CÁLCULOS ===================

  const systemEC = useMemo(() => {
    return calculateSystemEC(plants, parseFloat(config.currentVol), config.waterType);
  }, [plants, config.currentVol, config.waterType]);

  // =================== RENDER DE PASOS ===================

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
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              HYDROCARU
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg mx-auto">
              Sistema experto para cultivo hidropónico
            </p>
            
            <button 
              onClick={() => setStep(1)}
              className="px-8 py-6 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg"
            >
              Comenzar Configuración
              <ChevronRight className="inline ml-2" />
            </button>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">Paso 1: Configuración Básica</h2>
              <p className="text-slate-600">Define las características de tu sistema</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 bg-white">
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
              </div>
              
              <div className="p-6 rounded-2xl border border-slate-200 bg-white">
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
              </div>
              
              <div className="p-6 rounded-2xl border border-slate-200 bg-white">
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
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setStep(0)}
                className="px-6 py-3 rounded-xl border border-slate-300"
              >
                <ArrowLeft className="inline mr-2" size={18} />
                Atrás
              </button>
              
              <button 
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
              >
                Continuar
                <ChevronRight className="inline ml-2" />
              </button>
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
            
            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 bg-white">
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
                        <input
                          type="number"
                          min="4.0"
                          max="9.0"
                          step="0.1"
                          value={config.ph}
                          onChange={(e) => setConfig({...config, ph: e.target.value})}
                          className="w-full p-2 text-center text-lg border border-slate-300 rounded"
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
              </div>
              
              <div className="p-6 rounded-2xl border border-slate-200 bg-white">
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
                        <input
                          type="number"
                          min="0"
                          max="3000"
                          step="50"
                          value={config.ec}
                          onChange={(e) => setConfig({...config, ec: e.target.value})}
                          className="w-full p-2 text-center text-lg border border-slate-300 rounded"
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
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border border-slate-300"
              >
                <ArrowLeft className="inline mr-2" size={18} />
                Atrás
              </button>
              
              <button 
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl"
              >
                Continuar a Plantación
                <ChevronRight className="inline ml-2" />
              </button>
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
            
            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
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
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {plants.length}/15 plantas
                    </span>
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
                  
                  <button
                    onClick={handleAddPlant}
                    disabled={!selectedLevel || !selectedVariety || !selectedPosition}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl disabled:opacity-50"
                  >
                    <Plus className="inline mr-2" />
                    Añadir Planta a la Torre
                  </button>
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
                                <span className={
                                  plant.l === 1 ? 'bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs' :
                                  plant.l === 2 ? 'bg-green-100 text-green-700 px-2 py-1 rounded text-xs' :
                                  'bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs'
                                }>
                                  Nivel {plant.l}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">
                                Posición {plant.p} • {plant.l === 1 ? 'Plántula' : plant.l === 2 ? 'Crecimiento' : 'Maduración'}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setShowDeleteConfirm(plant.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl border border-slate-300"
              >
                <ArrowLeft className="inline mr-2" size={18} />
                Atrás
              </button>
              
              <button 
                onClick={handleCompleteConfiguration}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl disabled:opacity-50"
                disabled={plants.length === 0}
              >
                Completar Configuración
                <ChevronRight className="inline ml-2" />
              </button>
            </div>
          </div>
        );
      
      case 4:
        // DASHBOARD SIMPLIFICADO
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800">¡Configuración Completada!</h1>
              <p className="text-slate-600">Sistema hidropónico listo para usar</p>
            </div>
            
            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Check className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Configuración Guardada</h3>
                  <p className="text-slate-600">Tu sistema está listo para funcionar</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-600">Plantas Configuradas</p>
                      <p className="text-2xl font-bold text-blue-700">{plants.length} plantas</p>
                    </div>
                    <TreePine className="text-blue-600" size={24} />
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-600">EC Objetivo</p>
                      <p className="text-2xl font-bold text-emerald-700">{systemEC.targetEC} µS/cm</p>
                    </div>
                    <Zap className="text-emerald-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-bold text-slate-800 mb-4">Resumen de Plantas</h4>
                <div className="space-y-3">
                  {plants.map(plant => (
                    <div key={plant.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${VARIETIES[plant.v]?.color || 'bg-slate-200'}`}>
                          {VARIETIES[plant.v]?.icon || <Sprout className="text-white" size={12} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{plant.v}</p>
                          <p className="text-sm text-slate-600">Nivel {plant.l}, Posición {plant.p}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => {
                    localStorage.removeItem("hydro_master");
                    setPlants([]);
                    setConfig({ 
                      totalVol: "20", 
                      currentVol: "20", 
                      ph: "6.0", 
                      ec: "1200",
                      temp: "22", 
                      targetEC: "1400",
                      targetPH: "6.0",
                      waterType: "bajo_minimal"
                    });
                    setStep(0);
                    alert("Sistema reiniciado");
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl"
                >
                  Reiniciar Sistema
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // =================== RENDER PRINCIPAL ===================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {renderStep()}
      </div>
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="p-6 rounded-2xl max-w-md w-full bg-white">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-amber-600" size={24} />
              <h3 className="font-bold text-slate-800">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que quieres eliminar esta planta? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg"
              >
                Cancelar
              </button>
              
              <button
                onClick={() => {
                  setPlants(plants.filter(p => p.id !== showDeleteConfirm));
                  setShowDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
