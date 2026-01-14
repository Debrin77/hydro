// ============================================================================
// HYDROCARU - SISTEMA HIDROPÓNICO COMPLETO PARA CASTELLÓN
// ============================================================================

"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// ICONOS NECESARIOS
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
  Brain, AlertOctagon, GitCompare, BarChart,
  Ruler, Edit3, Save, CalendarDays, CloudRain as RainIcon,
  Wind as WindIcon, Thermometer as ThermometerIcon,
  Droplets as WaterIcon, Sprout as SeedlingIcon,
  Shield, BookOpen, CloudSun as CloudSunIcon,
  ThermometerSun as ThermometerSunIcon,
  Waves, Target, RefreshCw as RotateIcon,
  Thermometer as ThermometerIcon2,
  Droplet as DropletIcon
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// CONFIGURACIONES BASE
const WATER_TYPES = {
  bajo_mineral: { name: "Baja Mineralización", ec: 150, ph: 7.5, calcio: 20, magnesio: 5 },
  osmosis: { name: "Ósmosis", ec: 0, ph: 7.0, calcio: 0, magnesio: 0 },
  mixta: { name: "Mezcla (50/50)", ec: 75, ph: 7.25, calcio: 10, magnesio: 2.5 },
  grifo: { name: "Grifo Castellón", ec: 850, ph: 7.8, calcio: 80, magnesio: 20 }
};

// ============================================================================
// VARIEDADES ESPECÍFICAS DE LECHUGA PARA CULTIVO ESCALONADO
// ============================================================================

const VARIETIES = {
  // LECHUGA TROCADERO (Batavia) - Rápida, resistente
  trocadero: { 
    name: "Lechuga Trocadero (Batavia)", 
    stages: { 
      seedling: { 
        ec: 800, 
        days: 10, 
        description: "Plántula - Inicio rápido, mantener EC baja",
        ph: { min: 5.8, max: 6.2, ideal: 6.0 }
      }, 
      growth: { 
        ec: 1200, 
        days: 25, 
        description: "Crecimiento vigoroso - Formación de cogollo",
        ph: { min: 5.8, max: 6.3, ideal: 6.0 }
      }, 
      mature: { 
        ec: 1400, 
        days: 20, 
        description: "Maduración - Endurecimiento del cogollo",
        ph: { min: 5.8, max: 6.5, ideal: 6.1 }
      } 
    },
    totalDays: 55,
    characteristics: ["Rápido crecimiento", "Resistente al calor", "Cogollo compacto"],
    recommendedSeason: "Primavera-Verano"
  },
  
  // LECHUGA ICEBERG - Lenta, requiere más nutrientes
  iceberg: { 
    name: "Lechuga Iceberg", 
    stages: { 
      seedling: { 
        ec: 850, 
        days: 14, 
        description: "Plántula - Crecimiento lento inicial",
        ph: { min: 5.8, max: 6.2, ideal: 6.0 }
      }, 
      growth: { 
        ec: 1300, 
        days: 35, 
        description: "Crecimiento lento - Formación de cabeza",
        ph: { min: 5.8, max: 6.3, ideal: 6.0 }
      }, 
      mature: { 
        ec: 1600, 
        days: 30, 
        description: "Maduración - Compactación de cabeza",
        ph: { min: 5.8, max: 6.5, ideal: 6.1 }
      } 
    },
    totalDays: 79,
    characteristics: ["Crecimiento lento", "Alta demanda de nutrientes", "Cabeza compacta"],
    recommendedSeason: "Otoño-Primavera"
  },
  
  // LOLO ROSSO - Variedad de hoja roja, media demanda
  lolo_rosso: { 
    name: "Lechuga Lolo Rosso", 
    stages: { 
      seedling: { 
        ec: 800, 
        days: 10, 
        description: "Plántula - Desarrollo rápido de pigmentación",
        ph: { min: 5.8, max: 6.2, ideal: 6.0 }
      }, 
      growth: { 
        ec: 1250, 
        days: 25, 
        description: "Crecimiento - Intensificación del color rojo",
        ph: { min: 5.8, max: 6.3, ideal: 6.0 }
      }, 
      mature: { 
        ec: 1450, 
        days: 20, 
        description: "Maduración - Color rojo intenso, hojas rizadas",
        ph: { min: 5.8, max: 6.5, ideal: 6.1 }
      } 
    },
    totalDays: 55,
    characteristics: ["Color rojo intenso", "Hojas rizadas", "Media demanda de nutrientes"],
    recommendedSeason: "Todo el año"
  },
  
  // MARAVILLA (Mantecosa) - Variedad tradicional
  maravilla: { 
    name: "Lechuga Maravilla (Mantecosa)", 
    stages: { 
      seedling: { 
        ec: 800, 
        days: 12, 
        description: "Plántula - Hojas tiernas, crecimiento medio",
        ph: { min: 5.8, max: 6.2, ideal: 6.0 }
      }, 
      growth: { 
        ec: 1250, 
        days: 28, 
        description: "Crecimiento - Desarrollo de corazón mantecoso",
        ph: { min: 5.8, max: 6.3, ideal: 6.0 }
      }, 
      mature: { 
        ec: 1500, 
        days: 25, 
        description: "Maduración - Corazón compacto y tierno",
        ph: { min: 5.8, max: 6.5, ideal: 6.1 }
      } 
    },
    totalDays: 65,
    characteristics: ["Corazón mantecoso", "Tradicional española", "Buena resistencia"],
    recommendedSeason: "Todo el año"
  },
  
  // ROMANA - Alargada, requiere espacio vertical
  romana: { 
    name: "Lechuga Romana", 
    stages: { 
      seedling: { 
        ec: 850, 
        days: 12, 
        description: "Plántula - Desarrollo vertical inicial",
        ph: { min: 5.8, max: 6.2, ideal: 6.0 }
      }, 
      growth: { 
        ec: 1300, 
        days: 30, 
        description: "Crecimiento - Alargamiento vertical, hojas erectas",
        ph: { min: 5.8, max: 6.3, ideal: 6.0 }
      }, 
      mature: { 
        ec: 1550, 
        days: 28, 
        description: "Maduración - Cogollo alargado y compacto",
        ph: { min: 5.8, max: 6.5, ideal: 6.1 }
      } 
    },
    totalDays: 70,
    characteristics: ["Forma alargada", "Requiere espacio vertical", "Hojas crujientes"],
    recommendedSeason: "Primavera-Otoño"
  },
  
  // HOJA DE ROBLE ROJO - Decorativa, rápida
  roble_rojo: { 
    name: "Lechuga Hoja de Roble Rojo", 
    stages: { 
      seedling: { 
        ec: 750, 
        days: 8, 
        description: "Plántula - Coloración temprana, rápido crecimiento",
        ph: { min: 5.8, max: 6.2, ideal: 6.0 }
      }, 
      growth: { 
        ec: 1150, 
        days: 22, 
        description: "Crecimiento - Desarrollo de hojas lobuladas",
        ph: { min: 5.8, max: 6.3, ideal: 6.0 }
      }, 
      mature: { 
        ec: 1350, 
        days: 18, 
        description: "Maduración - Color rojo intenso, hojas decorativas",
        ph: { min: 5.8, max: 6.5, ideal: 6.1 }
      } 
    },
    totalDays: 48,
    characteristics: ["Crecimiento rápido", "Muy decorativa", "Baja demanda de nutrientes"],
    recommendedSeason: "Primavera-Verano"
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL - HYDROCARU
// ============================================================================

export default function HydroCaruApp() {
  // Estados principales
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRotation, setLastRotation] = useState(new Date().toISOString());
  const [lastCleaning, setLastCleaning] = useState(new Date().toISOString());
  const [tab, setTab] = useState("dashboard");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showAddPlantDialog, setShowAddPlantDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showECCalculator, setShowECCalculator] = useState(false);
  
  // Nueva planta en formulario
  const [newPlant, setNewPlant] = useState({
    name: "",
    variety: "trocadero",
    stage: "seedling",
    level: 1,
    plantDate: new Date().toISOString()
  });
  
  // Configuración del sistema
  const [config, setConfig] = useState({ 
    ph: "6.0",
    ec: "1200",
    temp: "22",
    currentVol: "20",
    totalVol: "20",
    targetEC: "1400",
    targetPH: "6.0",
    waterType: "bajo_mineral",
    waterNotes: "",
    hasHeater: true,
    humidity: "65",
    lightHours: "14",
    location: "Castellón",
    // Nuevos parámetros para cálculo escalonado
    calculationMode: "average", // average, dominant, weighted
    dominantStage: "growth" // Para modo dominant
  });
  
  // Configuración de riego
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    pumpTime: 15,
    interval: 120,
    showAdvanced: false,
    notes: "",
    rockwoolSize: "2.5x2.5cm"
  });

  // Estados para edición
  const [editingPH, setEditingPH] = useState(false);
  const [editingEC, setEditingEC] = useState(false);
  const [editingTemp, setEditingTemp] = useState(false);
  const [editingVolume, setEditingVolume] = useState(false);
  
  // =================== FUNCIONES DE UTILIDAD ===================
  
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  // =================== CÁLCULO ESCALONADO AVANZADO ===================
  
  const calculateStaggeredEC = useMemo(() => {
    if (plants.length === 0) {
      return {
        recommendedEC: 1200,
        method: "Sin plantas",
        details: [],
        adjustment: 0
      };
    }
    
    let recommendedEC = 0;
    let method = "";
    const details = [];
    
    // Calcular por nivel
    const levels = {1: [], 2: [], 3: []};
    plants.forEach(plant => {
      levels[plant.level].push(plant);
    });
    
    // Calcular EC objetivo por planta según su variedad y etapa
    const plantECs = plants.map(plant => {
      const variety = VARIETIES[plant.variety];
      if (!variety) return 1200;
      
      const stageEC = variety.stages[plant.stage]?.ec || 1200;
      return stageEC;
    });
    
    // Diferentes métodos de cálculo
    switch(config.calculationMode) {
      case "average":
        recommendedEC = Math.round(plantECs.reduce((a, b) => a + b, 0) / plantECs.length);
        method = "Promedio simple";
        details.push(`Promedio de ${plantECs.length} plantas: ${recommendedEC} µS/cm`);
        break;
        
      case "weighted":
        // Ponderar por etapa (mature: 1.2, growth: 1.0, seedling: 0.8)
        const weights = { mature: 1.2, growth: 1.0, seedling: 0.8 };
        const weightedSum = plants.reduce((sum, plant, index) => {
          return sum + (plantECs[index] * weights[plant.stage]);
        }, 0);
        const totalWeight = plants.reduce((sum, plant) => sum + weights[plant.stage], 0);
        recommendedEC = Math.round(weightedSum / totalWeight);
        method = "Ponderado por etapa";
        details.push(`Plantas maduras tienen mayor peso en el cálculo`);
        break;
        
      case "dominant":
        // Encontrar etapa dominante
        const stageCounts = { seedling: 0, growth: 0, mature: 0 };
        plants.forEach(plant => stageCounts[plant.stage]++);
        
        let dominantStage = config.dominantStage;
        if (stageCounts.growth >= stageCounts.seedling && stageCounts.growth >= stageCounts.mature) {
          dominantStage = "growth";
        } else if (stageCounts.mature > stageCounts.growth) {
          dominantStage = "mature";
        } else {
          dominantStage = "seedling";
        }
        
        // Calcular EC para plantas en etapa dominante
        const dominantPlants = plants.filter(p => p.stage === dominantStage);
        if (dominantPlants.length > 0) {
          const dominantECs = dominantPlants.map(plant => {
            const variety = VARIETIES[plant.variety];
            return variety?.stages[plant.stage]?.ec || 1200;
          });
          recommendedEC = Math.round(dominantECs.reduce((a, b) => a + b, 0) / dominantECs.length);
        } else {
          recommendedEC = 1200;
        }
        
        method = `Etapa dominante: ${dominantStage}`;
        details.push(`${dominantPlants.length} plantas en etapa ${dominantStage}`);
        break;
    }
    
    // Ajustar por nivel (las plantas de arriba necesitan más)
    const levelAdjustment = plants.reduce((adjust, plant) => {
      return adjust + (plant.level * 25); // Nivel 1: +25, Nivel 2: +50, Nivel 3: +75
    }, 0) / plants.length;
    
    recommendedEC = Math.round(recommendedEC + levelAdjustment);
    details.push(`Ajuste por niveles: +${Math.round(levelAdjustment)} µS/cm`);
    
    // Ajustar por temperatura
    const temp = parseFloat(config.temp);
    let tempAdjustment = 0;
    if (temp > 28) {
      tempAdjustment = -100;
      details.push(`Ajuste por temperatura alta (${temp}°C): -100 µS/cm`);
    } else if (temp < 18) {
      tempAdjustment = 100;
      details.push(`Ajuste por temperatura baja (${temp}°C): +100 µS/cm`);
    }
    
    recommendedEC += tempAdjustment;
    
    // Asegurar rango seguro
    recommendedEC = Math.max(800, Math.min(1800, recommendedEC));
    
    return {
      recommendedEC,
      method,
      details,
      adjustment: Math.round(levelAdjustment + tempAdjustment),
      plantCount: plants.length,
      levelBreakdown: levels
    };
  }, [plants, config.calculationMode, config.dominantStage, config.temp]);
  
  // =================== FUNCIONES PARA EDICIÓN ===================
  
  const handleManualPHChange = (value) => {
    setConfig({...config, ph: value});
  };
  
  const handleManualECChange = (value) => {
    setConfig({...config, ec: value});
  };
  
  const handleManualTempChange = (value) => {
    setConfig({...config, temp: value});
  };
  
  const handleManualVolumeChange = (value) => {
    setConfig({...config, currentVol: value});
  };
  
  // =================== FUNCIONES DE ACCIÓN ===================
  
  const handleAddPlant = () => {
    if (!newPlant.name.trim()) {
      alert("Por favor, introduce un nombre para la planta");
      return;
    }
    
    if (plants.length >= 15) {
      alert("Máximo 15 plantas permitidas en la torre");
      return;
    }
    
    const levelPlants = plants.filter(p => p.level === newPlant.level);
    if (levelPlants.length >= 5) {
      alert(`El nivel ${newPlant.level} ya tiene 5 plantas (máximo por nivel)`);
      return;
    }
    
    const plant = {
      id: generateId(),
      name: newPlant.name.trim(),
      variety: newPlant.variety,
      stage: newPlant.stage,
      level: newPlant.level,
      plantDate: new Date().toISOString(),
      notes: ""
    };
    
    setPlants([...plants, plant]);
    setNewPlant({
      name: "",
      variety: "trocadero",
      stage: "seedling",
      level: 1,
      plantDate: new Date().toISOString()
    });
    setShowAddPlantDialog(false);
    
    // Actualizar EC objetivo si hay plantas
    if (plants.length > 0) {
      setConfig({
        ...config,
        targetEC: calculateStaggeredEC.recommendedEC.toString()
      });
    }
    
    alert(`✅ ${VARIETIES[newPlant.variety].name} añadida al nivel ${newPlant.level}`);
  };
  
  const handleRemovePlant = (id) => {
    if (confirm("¿Eliminar esta planta?")) {
      setPlants(plants.filter(plant => plant.id !== id));
    }
  };
  
  const handleRotatePlants = () => {
    if (plants.length === 0) {
      alert("No hay plantas para rotar");
      return;
    }
    
    const updatedPlants = plants.map(plant => {
      let newLevel = plant.level;
      if (plant.level === 1) newLevel = 2;
      else if (plant.level === 2) newLevel = 3;
      else if (plant.level === 3) newLevel = 1;
      
      // Avanzar etapa si es tiempo
      const plantDate = new Date(plant.plantDate);
      const daysOld = Math.floor((new Date() - plantDate) / (1000 * 60 * 60 * 24));
      const variety = VARIETIES[plant.variety];
      let newStage = plant.stage;
      
      if (plant.stage === "seedling" && daysOld >= (variety?.stages.seedling.days || 14)) {
        newStage = "growth";
      } else if (plant.stage === "growth" && daysOld >= ((variety?.stages.seedling.days || 14) + (variety?.stages.growth.days || 21))) {
        newStage = "mature";
      }
      
      return { 
        ...plant, 
        level: newLevel,
        stage: newStage
      };
    });
    
    setPlants(updatedPlants);
    setLastRotation(new Date().toISOString());
    
    // Recalcular EC objetivo
    if (updatedPlants.length > 0) {
      const newEC = calculateStaggeredEC.recommendedEC;
      setConfig({
        ...config,
        targetEC: newEC.toString()
      });
    }
    
    alert("✅ Plantas rotadas y etapas actualizadas");
  };
  
  const handleAdvanceStage = (plantId) => {
    setPlants(plants.map(plant => {
      if (plant.id === plantId) {
        const stages = ["seedling", "growth", "mature"];
        const currentIndex = stages.indexOf(plant.stage);
        if (currentIndex < stages.length - 1) {
          return { ...plant, stage: stages[currentIndex + 1] };
        }
      }
      return plant;
    }));
  };
  
  const handleResetSystem = () => {
    if (confirm("⚠️ ¿REINICIAR SISTEMA COMPLETO?\n\nSe eliminarán TODAS las plantas y el historial.")) {
      setIsResetting(true);
      setPlants([]);
      setHistory([]);
      setConfig({
        ph: "6.0",
        ec: "1200",
        temp: "22",
        currentVol: "20",
        totalVol: "20",
        targetEC: "1400",
        targetPH: "6.0",
        waterType: "bajo_mineral",
        waterNotes: "",
        hasHeater: true,
        humidity: "65",
        lightHours: "14",
        location: "Castellón",
        calculationMode: "average",
        dominantStage: "growth"
      });
      setStep(0);
      setTab("dashboard");
      alert("✅ Sistema reiniciado. Configura de nuevo.");
      setTimeout(() => setIsResetting(false), 100);
    }
  };
  
  const handleSaveMeasurement = () => {
    const now = new Date().toISOString();
    const measurement = {
      id: generateId(),
      date: now,
      ph: config.ph,
      ec: config.ec,
      temp: config.temp,
      volume: config.currentVol,
      plantCount: plants.length,
      targetEC: config.targetEC,
      notes: "Medición del sistema escalonado"
    };
    
    setHistory([measurement, ...history.slice(0, 49)]);
    alert("✅ Medición guardada en el historial");
  };
  
  // =================== CÁLCULOS DE NUTRICIÓN ===================
  
  const aquaVegaDosage = useMemo(() => {
    const volume = parseFloat(config.currentVol);
    // Dosificación ajustada por EC objetivo
    const baseEC = 1400;
    const targetEC = parseFloat(config.targetEC);
    const ecFactor = targetEC / baseEC;
    
    const basePer10L = { a: 15, b: 15 };
    const totalA = (volume / 10) * basePer10L.a * ecFactor;
    const totalB = (volume / 10) * basePer10L.b * ecFactor;
    
    return {
      a: Math.round(totalA * 100) / 100,
      b: Math.round(totalB * 100) / 100,
      per10L: basePer10L,
      ecFactor: Math.round(ecFactor * 100) / 100
    };
  }, [config.currentVol, config.targetEC]);
  
  const phAdjustment = useMemo(() => {
    const currentPH = parseFloat(config.ph);
    const targetPH = parseFloat(config.targetPH);
    const volume = parseFloat(config.currentVol);
    
    let phMinus = 0;
    let phPlus = 0;
    
    if (currentPH > targetPH) {
      phMinus = ((currentPH - targetPH) * volume * 0.5).toFixed(1);
    } else if (currentPH < targetPH) {
      phPlus = ((targetPH - currentPH) * volume * 0.3).toFixed(1);
    }
    
    return {
      phMinus: phMinus,
      phPlus: phPlus,
      adjustmentNeeded: Math.abs(currentPH - targetPH) > 0.1
    };
  }, [config.ph, config.targetPH, config.currentVol]);
  
  // =================== CÁLCULO DE RIEGO ===================
  
  const irrigationData = useMemo(() => {
    const plantCount = plants.length || 1;
    const temp = parseFloat(config.temp);
    
    // Determinar estación
    const month = new Date().getMonth();
    let season = "spring";
    if (month >= 5 && month <= 8) season = "summer";
    else if (month >= 11 || month <= 2) season = "winter";
    else if (month >= 9 && month <= 10) season = "autumn";
    
    // Ajustar por etapas de plantas
    const seedlingCount = plants.filter(p => p.stage === "seedling").length;
    const matureCount = plants.filter(p => p.stage === "mature").length;
    
    let pumpTime = 15;
    let interval = 120;
    
    // Plantas maduras necesitan más agua
    if (matureCount > seedlingCount) {
      pumpTime = 18;
      interval = 110;
    }
    
    // Ajustes por temperatura
    if (temp > 25) {
      interval = 90;
      pumpTime = 20;
    }
    if (temp < 18) {
      interval = 150;
      pumpTime = 12;
    }
    
    const dayCycles = Math.round((14 * 60) / interval);
    
    return {
      season,
      pumpTime,
      interval,
      dayCycles,
      waterPerCycle: plantCount * 50,
      totalWaterPerDay: ((plantCount * 50 * dayCycles) / 1000).toFixed(1),
      seedlingCount,
      matureCount
    };
  }, [plants, config.temp]);
  
  // =================== ALERTAS INTELIGENTES ===================
  
  const alerts = useMemo(() => {
    const alertList = [];
    
    // Alerta de pH
    const phDiff = Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH));
    if (phDiff > 0.5) {
      alertList.push({
        title: "pH fuera de rango",
        description: `pH actual: ${config.ph} (objetivo: ${config.targetPH})`,
        value: config.ph,
        color: "bg-gradient-to-r from-red-500 to-rose-600",
        icon: <AlertTriangle />,
        priority: 1
      });
    }
    
    // Alerta de EC comparada con recomendación escalonada
    const ecCurrent = parseFloat(config.ec);
    const ecRecommended = calculateStaggeredEC.recommendedEC;
    if (Math.abs(ecCurrent - ecRecommended) > 200) {
      alertList.push({
        title: "EC necesita ajuste",
        description: `Actual: ${config.ec}µS (Recomendado: ${ecRecommended}µS)`,
        value: `${config.ec}µS`,
        color: "bg-gradient-to-r from-amber-500 to-orange-600",
        icon: <Zap />,
        priority: 2
      });
    }
    
    // Alerta de temperatura
    const temp = parseFloat(config.temp);
    if (temp > 28) {
      alertList.push({
        title: "Temperatura alta",
        description: `Temperatura del agua: ${config.temp}°C (ideal: 18-25°C)`,
        value: `${config.temp}°C`,
        color: "bg-gradient-to-r from-red-500 to-orange-600",
        icon: <Thermometer />,
        priority: 1
      });
    }
    
    // Alerta de rotación
    const daysSinceRotation = Math.floor((new Date() - new Date(lastRotation)) / (1000 * 60 * 60 * 24));
    if (daysSinceRotation >= 7 && plants.length > 0) {
      alertList.push({
        title: "Rotación pendiente",
        description: `Han pasado ${daysSinceRotation} días desde la última rotación`,
        value: `${daysSinceRotation}d`,
        color: "bg-gradient-to-r from-blue-500 to-cyan-600",
        icon: <RotateIcon />,
        priority: 2
      });
    }
    
    return alertList;
  }, [config.ph, config.targetPH, config.ec, config.temp, calculateStaggeredEC.recommendedEC, lastRotation, plants.length]);
  
  // =================== COMPONENTES DE PESTAÑAS ===================

  // 1. 📊 PANEL PRINCIPAL CON CÁLCULO ESCALONADO
  const DashboardTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Panel de Control HydroCaru</h1>
          <p className="text-slate-600 text-sm">Cultivo escalonado de lechugas • Castellón</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge className={
            irrigationData.season === "summer" ? "bg-amber-100 text-amber-800" :
            irrigationData.season === "winter" ? "bg-blue-100 text-blue-800" :
            irrigationData.season === "autumn" ? "bg-orange-100 text-orange-800" :
            "bg-green-100 text-green-800"
          }>
            {irrigationData.season === "summer" ? "Verano Castellón" :
             irrigationData.season === "winter" ? "Invierno Castellón" :
             irrigationData.season === "autumn" ? "Otoño Castellón" :
             "Primavera Castellón"}
          </Badge>
          
          <Badge className="bg-purple-100 text-purple-800">
            {plants.length} plantas • {calculateStaggeredEC.recommendedEC}µS
          </Badge>
          
          <Badge className="bg-cyan-100 text-cyan-800">
            {config.calculationMode === "average" ? "Cálculo: Promedio" :
             config.calculationMode === "weighted" ? "Cálculo: Ponderado" :
             "Cálculo: Etapa dominante"}
          </Badge>
        </div>
      </div>
      
      {/* CÁLCULO ESCALONADO */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Calculator className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Cálculo de EC Escalonado</h3>
              <p className="text-sm text-slate-600">Ajuste inteligente por variedad y etapa</p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowECCalculator(true)}
            variant="outline"
            size="sm"
          >
            Configurar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">
              {calculateStaggeredEC.recommendedEC} µS/cm
            </div>
            <p className="text-sm font-medium text-emerald-700">EC Recomendada</p>
            <p className="text-xs text-slate-600 mt-1">{calculateStaggeredEC.method}</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {plants.length}
            </div>
            <p className="text-sm font-medium text-blue-700">Plantas activas</p>
            <p className="text-xs text-slate-600 mt-1">
              N1: {calculateStaggeredEC.levelBreakdown[1].length} • 
              N2: {calculateStaggeredEC.levelBreakdown[2].length} • 
              N3: {calculateStaggeredEC.levelBreakdown[3].length}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {config.targetEC} µS/cm
            </div>
            <p className="text-sm font-medium text-purple-700">EC Objetivo Actual</p>
            <p className="text-xs text-slate-600 mt-1">
              Dif: {Math.abs(parseInt(config.targetEC) - calculateStaggeredEC.recommendedEC)}µS
            </p>
          </div>
        </div>
        
        {calculateStaggeredEC.details.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-700 text-sm mb-2">Detalles del cálculo:</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              {calculateStaggeredEC.details.map((detail, idx) => (
                <li key={idx}>• {detail}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button
            onClick={() => {
              setConfig({
                ...config,
                targetEC: calculateStaggeredEC.recommendedEC.toString()
              });
              alert(`✅ EC objetivo actualizada a ${calculateStaggeredEC.recommendedEC} µS/cm`);
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          >
            <Check className="mr-2" size={16} />
            Aplicar EC Recomendada como Objetivo
          </Button>
        </div>
      </Card>
      
      {/* RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sprout className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Distribución por Etapa</h3>
              <p className="text-xs text-slate-600">Cultivo escalonado</p>
            </div>
          </div>
          
          {plants.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">🌱 Plántulas</span>
                <span className="font-bold text-cyan-600">
                  {plants.filter(p => p.stage === "seedling").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">📈 En crecimiento</span>
                <span className="font-bold text-green-600">
                  {plants.filter(p => p.stage === "growth").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">🌿 Maduras</span>
                <span className="font-bold text-emerald-600">
                  {plants.filter(p => p.stage === "mature").length}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-3 text-sm">Añade plantas para comenzar</p>
          )}
        </Card>
        
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Nutrición Actual</h3>
              <p className="text-xs text-slate-600">Para {config.currentVol}L</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">EC objetivo</span>
              <span className="font-bold text-blue-600">{config.targetEC} µS/cm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">pH objetivo</span>
              <span className="font-bold text-purple-600">{config.targetPH}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Aqua Vega A</span>
              <span className="font-bold text-emerald-600">{aquaVegaDosage.a} ml</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Aqua Vega B</span>
              <span className="font-bold text-emerald-600">{aquaVegaDosage.b} ml</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <CloudRain className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Condiciones</h3>
              <p className="text-xs text-slate-600">Estado actual</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">pH actual</span>
              <span className={`font-bold ${
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-red-600' :
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.2 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ph}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">EC actual</span>
              <span className={`font-bold ${
                Math.abs(parseFloat(config.ec) - calculateStaggeredEC.recommendedEC) > 200 ? 'text-red-600' :
                Math.abs(parseFloat(config.ec) - calculateStaggeredEC.recommendedEC) > 100 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ec} µS/cm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Temperatura</span>
              <span className={`font-bold ${
                parseFloat(config.temp) > 28 ? 'text-red-600' : 
                parseFloat(config.temp) < 18 ? 'text-blue-600' : 
                'text-green-600'
              }`}>
                {config.temp}°C
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Volumen</span>
              <span className="font-bold text-blue-600">{config.currentVol}L / {config.totalVol}L</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // 2. 📝 MEDICIONES MANUALES
  const MeasurementsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📝 Mediciones Manuales</h2>
        <p className="text-slate-600 text-sm">Control preciso del sistema escalonado</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* COLUMNA IZQUIERDA - MEDICIONES */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="text-purple-600" size={18} />
                  <span className="font-bold text-slate-800">pH del Agua</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPH(!editingPH)}
                  className="h-8 px-2"
                >
                  {editingPH ? <Save size={14} /> : <Edit3 size={14} />}
                </Button>
              </div>
              
              {editingPH ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    step="0.1"
                    min="4.0"
                    max="9.0"
                    value={config.ph}
                    onChange={(e) => handleManualPHChange(e.target.value)}
                    className="text-center text-xl font-bold h-10"
                  />
                  <Slider
                    value={[parseFloat(config.ph)]}
                    min={4.0}
                    max={9.0}
                    step={0.1}
                    onValueChange={([value]) => handleManualPHChange(value.toString())}
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{config.ph}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    parseFloat(config.ph) >= 5.8 && parseFloat(config.ph) <= 6.5 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {parseFloat(config.ph) >= 5.8 && parseFloat(config.ph) <= 6.5 ? '✅ ÓPTIMO' : '⚠️ AJUSTAR'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="text-blue-600" size={18} />
                  <span className="font-bold text-slate-800">EC (Conductividad)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingEC(!editingEC)}
                  className="h-8 px-2"
                >
                  {editingEC ? <Save size={14} /> : <Edit3 size={14} />}
                </Button>
              </div>
              
              {editingEC ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    min="0"
                    max="3000"
                    step="50"
                    value={config.ec}
                    onChange={(e) => handleManualECChange(e.target.value)}
                    className="text-center text-xl font-bold h-10"
                  />
                  <Slider
                    value={[parseFloat(config.ec)]}
                    min={0}
                    max={3000}
                    step={50}
                    onValueChange={([value]) => handleManualECChange(value.toString())}
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{config.ec} µS/cm</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Recomendado: {calculateStaggeredEC.recommendedEC} µS/cm
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* COLUMNA DERECHA - TEMPERATURA Y VOLUMEN */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ThermometerIcon2 className="text-amber-600" size={18} />
                  <span className="font-bold text-slate-800">Temperatura</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTemp(!editingTemp)}
                  className="h-8 px-2"
                >
                  {editingTemp ? <Save size={14} /> : <Edit3 size={14} />}
                </Button>
              </div>
              
              {editingTemp ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    min="0"
                    max="40"
                    step="0.5"
                    value={config.temp}
                    onChange={(e) => handleManualTempChange(e.target.value)}
                    className="text-center text-xl font-bold h-10"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">{config.temp}°C</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    parseFloat(config.temp) >= 18 && parseFloat(config.temp) <= 25 
                      ? 'bg-green-100 text-green-800' 
                      : parseFloat(config.temp) > 25 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {parseFloat(config.temp) > 25 ? '⚠️ CALIENTE' : 
                     parseFloat(config.temp) < 18 ? '⚠️ FRÍA' : '✅ ÓPTIMA'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DropletIcon className="text-cyan-600" size={18} />
                  <span className="font-bold text-slate-800">Volumen Depósito</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingVolume(!editingVolume)}
                  className="h-8 px-2"
                >
                  {editingVolume ? <Save size={14} /> : <Edit3 size={14} />}
                </Button>
              </div>
              
              {editingVolume ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    min="0"
                    max={parseFloat(config.totalVol)}
                    step="0.5"
                    value={config.currentVol}
                    onChange={(e) => handleManualVolumeChange(e.target.value)}
                    className="text-center text-xl font-bold h-10"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 mb-1">{config.currentVol}L</div>
                  <Progress 
                    value={(parseFloat(config.currentVol) / parseFloat(config.totalVol)) * 100} 
                    className="h-2 mt-2"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
          <Button
            onClick={handleSaveMeasurement}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-10"
          >
            <Save className="mr-2" size={16} />
            Guardar Medición Actual
          </Button>
        </div>
      </Card>
    </div>
  );

  // 3. 🧪 CÁLCULOS Y AJUSTES
  const CalculationsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🧪 Cálculos para Cultivo Escalonado</h2>
        <p className="text-slate-600 text-sm">Ajustes específicos por variedad y etapa</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <RefreshCw className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Ajuste pH</h3>
              <p className="text-xs text-slate-600">{config.ph} → {config.targetPH}</p>
            </div>
          </div>
          
          {parseFloat(config.ph) > parseFloat(config.targetPH) ? (
            <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {phAdjustment.phMinus} ml
              </div>
              <p className="text-sm font-bold text-purple-700">pH- (Ácido)</p>
              <p className="text-xs text-slate-600">Para {config.currentVol}L</p>
            </div>
          ) : (
            <div className="text-center p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600 mb-1">
                {phAdjustment.phPlus} ml
              </div>
              <p className="text-sm font-bold text-pink-700">pH+ (Alcalino)</p>
              <p className="text-xs text-slate-600">Para {config.currentVol}L</p>
            </div>
          )}
        </Card>
        
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Aqua Vega</h3>
              <p className="text-xs text-slate-600">Para {config.currentVol}L</p>
            </div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
            <div className="flex justify-center gap-4 mb-2">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{aquaVegaDosage.a}</div>
                <p className="text-xs text-emerald-700">ml A</p>
              </div>
              <div className="text-xl text-emerald-500">+</div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{aquaVegaDosage.b}</div>
                <p className="text-xs text-emerald-700">ml B</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Factor EC: {aquaVegaDosage.ecFactor}x
            </p>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Waves className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">CalMag</h3>
              <p className="text-xs text-slate-600">Agua: {WATER_TYPES[config.waterType].name}</p>
            </div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600 mb-1">
              {config.waterType === "osmosis" ? "20 ml" : 
               config.waterType === "mixta" ? "10 ml" : "5 ml"}
            </div>
            <p className="text-sm font-bold text-cyan-700">CalMag</p>
            <p className="text-xs text-slate-600">
              {config.waterType === "osmosis" ? "Alta necesidad" : 
               config.waterType === "mixta" ? "Media necesidad" : "Baja necesidad"}
            </p>
          </div>
        </Card>
      </div>
      
      {/* TABLA DE VARIEDADES */}
      <Card className="p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Leaf className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Parámetros por Variedad</h3>
            <p className="text-sm text-slate-600">EC objetivo por etapa de crecimiento</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Variedad</th>
                <th className="p-2 text-left">Plántula</th>
                <th className="p-2 text-left">Crecimiento</th>
                <th className="p-2 text-left">Madura</th>
                <th className="p-2 text-left">Días total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(VARIETIES).map(([key, variety]) => (
                <tr key={key} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 font-medium text-slate-800">{variety.name}</td>
                  <td className="p-2">
                    <div className="font-bold text-cyan-600">{variety.stages.seedling.ec} µS</div>
                    <div className="text-xs text-slate-600">{variety.stages.seedling.days}d</div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold text-green-600">{variety.stages.growth.ec} µS</div>
                    <div className="text-xs text-slate-600">{variety.stages.growth.days}d</div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold text-emerald-600">{variety.stages.mature.ec} µS</div>
                    <div className="text-xs text-slate-600">{variety.stages.mature.days}d</div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold text-slate-800">{variety.totalDays} días</div>
                    <div className="text-xs text-slate-600">{variety.recommendedSeason}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // 4. 🌿 TORRE DE CULTIVO ESCALONADO
  const TowerTab = () => {
    // Calcular estadísticas por nivel
    const levelStats = {
      1: { 
        count: plants.filter(p => p.level === 1).length, 
        max: 5,
        plants: plants.filter(p => p.level === 1),
        avgEC: calculateAverageECForLevel(1)
      },
      2: { 
        count: plants.filter(p => p.level === 2).length, 
        max: 5,
        plants: plants.filter(p => p.level === 2),
        avgEC: calculateAverageECForLevel(2)
      },
      3: { 
        count: plants.filter(p => p.level === 3).length, 
        max: 5,
        plants: plants.filter(p => p.level === 3),
        avgEC: calculateAverageECForLevel(3)
      }
    };
    
    function calculateAverageECForLevel(level) {
      const levelPlants = plants.filter(p => p.level === level);
      if (levelPlants.length === 0) return 0;
      
      const totalEC = levelPlants.reduce((sum, plant) => {
        const variety = VARIETIES[plant.variety];
        return sum + (variety?.stages[plant.stage]?.ec || 1200);
      }, 0);
      
      return Math.round(totalEC / levelPlants.length);
    }
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">🌿 Torre de Cultivo Escalonado</h2>
          <p className="text-slate-600 text-sm">Gestión avanzada por nivel y etapa</p>
        </div>
        
        {/* CONTROLES PRINCIPALES */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <TreePine className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Cultivo Escalonado</h3>
              <p className="text-slate-600 text-sm">
                {plants.length} plantas • EC rec: {calculateStaggeredEC.recommendedEC}µS
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddPlantDialog(true)}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              <Plus className="mr-2" size={16} />
              Añadir Planta
            </Button>
            
            <Button
              onClick={handleRotatePlants}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <RotateIcon className="mr-2" size={16} />
              Rotar Plantas
            </Button>
          </div>
        </div>
        
        {/* PANELES POR NIVEL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(level => (
            <Card key={level} className="p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    level === 1 ? 'bg-cyan-500' : 
                    level === 2 ? 'bg-green-500' : 
                    'bg-emerald-500'
                  }`} />
                  <span className="font-bold text-slate-800">Nivel {level}</span>
                  <Badge className={
                    level === 1 ? 'bg-cyan-100 text-cyan-800' :
                    level === 2 ? 'bg-green-100 text-green-800' :
                    'bg-emerald-100 text-emerald-800'
                  }>
                    {levelStats[level].count}/{levelStats[level].max}
                  </Badge>
                </div>
                
                <div className="text-sm font-bold text-slate-700">
                  EC: {levelStats[level].avgEC}µS
                </div>
              </div>
              
              {/* LISTA DE PLANTAS */}
              <div className="space-y-3 mb-4">
                {levelStats[level].plants.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-lg">
                    <p className="text-slate-500 text-sm">Nivel vacío</p>
                    <p className="text-slate-400 text-xs">Añade plantas para comenzar</p>
                  </div>
                ) : (
                  levelStats[level].plants.map(plant => {
                    const variety = VARIETIES[plant.variety];
                    const stageInfo = variety?.stages[plant.stage];
                    
                    return (
                      <div 
                        key={plant.id} 
                        className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{plant.name}</div>
                            <div className="text-xs text-slate-600">{variety?.name}</div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAdvanceStage(plant.id)}
                              className="h-6 w-6 p-0 text-blue-500"
                              title="Avanzar etapa"
                            >
                              <ArrowRight size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePlant(plant.id)}
                              className="h-6 w-6 p-0 text-red-500"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={
                            plant.stage === 'seedling' ? 'bg-cyan-100 text-cyan-800' :
                            plant.stage === 'growth' ? 'bg-green-100 text-green-800' :
                            'bg-emerald-100 text-emerald-800'
                          }>
                            {plant.stage === 'seedling' ? '🌱 Plántula' : 
                             plant.stage === 'growth' ? '📈 Crecimiento' : '🌿 Madura'}
                          </Badge>
                          
                          <div className="text-xs font-bold text-slate-700">
                            EC: {stageInfo?.ec || 1200}µS
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-500 mt-2">
                          {stageInfo?.description}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* BOTÓN AÑADIR AL NIVEL */}
              <Button
                onClick={() => {
                  setNewPlant({...newPlant, level});
                  setShowAddPlantDialog(true);
                }}
                variant="outline"
                className="w-full"
                disabled={levelStats[level].count >= levelStats[level].max}
              >
                <Plus className="mr-2" size={12} />
                Añadir al Nivel {level}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // 5. 📈 HISTORIAL
  const HistoryTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📈 Historial de Mediciones</h2>
        <p className="text-slate-600 text-sm">{history.length} registros</p>
      </div>
      
      <Card className="p-5 rounded-xl">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No hay mediciones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record, index) => (
              <div key={record.id} className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-slate-800">
                    {new Date(record.date).toLocaleDateString('es-ES')}
                  </div>
                  <div className="text-sm text-slate-600">
                    {record.plantCount} plantas
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-xs text-slate-600">pH</div>
                    <div className="font-bold">{record.ph}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-600">EC</div>
                    <div className="font-bold">{record.ec}µS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-600">Temp</div>
                    <div className="font-bold">{record.temp}°C</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-600">Vol</div>
                    <div className="font-bold">{record.volume}L</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  // =================== DIÁLOGOS ===================

  // Diálogo para añadir planta
  const AddPlantDialog = () => (
    <Dialog open={showAddPlantDialog} onOpenChange={setShowAddPlantDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Planta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Nombre de la Planta</Label>
            <Input
              value={newPlant.name}
              onChange={(e) => setNewPlant({...newPlant, name: e.target.value})}
              placeholder="Ej: Lechuga Romana #1"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Variedad de Lechuga</Label>
            <Select value={newPlant.variety} onValueChange={(value) => setNewPlant({...newPlant, variety: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VARIETIES).map(([key, variety]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{variety.name}</span>
                      <span className="text-xs text-slate-500">
                        {variety.totalDays} días • {variety.recommendedSeason}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Etapa de Crecimiento</Label>
            <Select value={newPlant.stage} onValueChange={(value) => setNewPlant({...newPlant, stage: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seedling">
                  <div className="flex flex-col">
                    <span>🌱 Plántula</span>
                    <span className="text-xs text-slate-500">
                      EC: {VARIETIES[newPlant.variety]?.stages.seedling.ec}µS
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="growth">
                  <div className="flex flex-col">
                    <span>📈 Crecimiento</span>
                    <span className="text-xs text-slate-500">
                      EC: {VARIETIES[newPlant.variety]?.stages.growth.ec}µS
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="mature">
                  <div className="flex flex-col">
                    <span>🌿 Madura</span>
                    <span className="text-xs text-slate-500">
                      EC: {VARIETIES[newPlant.variety]?.stages.mature.ec}µS
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Nivel en la Torre</Label>
            <Select value={newPlant.level.toString()} onValueChange={(value) => setNewPlant({...newPlant, level: parseInt(value)})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Nivel 1 (Abajo) - Para plántulas</SelectItem>
                <SelectItem value="2">Nivel 2 (Medio) - Para crecimiento</SelectItem>
                <SelectItem value="3">Nivel 3 (Arriba) - Para maduración</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddPlantDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddPlant} className="bg-gradient-to-r from-emerald-500 to-green-600">
            Añadir Planta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Diálogo para configurar cálculo EC
  const ECCalculatorDialog = () => (
    <Dialog open={showECCalculator} onOpenChange={setShowECCalculator}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Cálculo de EC</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Método de Cálculo</Label>
            <Select 
              value={config.calculationMode} 
              onValueChange={(value) => setConfig({...config, calculationMode: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="average">
                  <div className="flex flex-col">
                    <span>Promedio Simple</span>
                    <span className="text-xs text-slate-500">EC promedio de todas las plantas</span>
                  </div>
                </SelectItem>
                <SelectItem value="weighted">
                  <div className="flex flex-col">
                    <span>Ponderado por Etapa</span>
                    <span className="text-xs text-slate-500">Maduras (1.2x), Crecimiento (1.0x), Plántulas (0.8x)</span>
                  </div>
                </SelectItem>
                <SelectItem value="dominant">
                  <div className="flex flex-col">
                    <span>Etapa Dominante</span>
                    <span className="text-xs text-slate-500">Solo plantas en etapa mayoritaria</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.calculationMode === "dominant" && (
            <div>
              <Label>Etapa Dominante Forzada</Label>
              <Select 
                value={config.dominantStage} 
                onValueChange={(value) => setConfig({...config, dominantStage: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seedling">🌱 Plántula</SelectItem>
                  <SelectItem value="growth">📈 Crecimiento</SelectItem>
                  <SelectItem value="mature">🌿 Madura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-700 text-sm mb-2">Resumen Actual:</h4>
            <div className="text-sm text-slate-600">
              <p>• Plantas: {plants.length}</p>
              <p>• EC recomendada: {calculateStaggeredEC.recommendedEC} µS/cm</p>
              <p>• Método: {calculateStaggeredEC.method}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowECCalculator(false)}>
            Cerrar
          </Button>
          <Button 
            onClick={() => {
              setConfig({
                ...config,
                targetEC: calculateStaggeredEC.recommendedEC.toString()
              });
              setShowECCalculator(false);
              alert(`✅ EC objetivo actualizada a ${calculateStaggeredEC.recommendedEC} µS/cm`);
            }}
            className="bg-gradient-to-r from-emerald-500 to-green-600"
          >
            Aplicar EC Recomendada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // =================== RENDER PRINCIPAL ===================

  if (step < 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Configuración inicial simplificada */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">HydroCaru</h1>
            <p className="text-slate-600 mb-6">Cultivo escalonado de lechugas</p>
            <Button 
              onClick={() => {
                setStep(4);
                setTab("dashboard");
              }} 
              className="bg-gradient-to-r from-emerald-500 to-green-600 w-full h-12"
            >
              Iniciar Sistema <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={18} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm">HydroCaru</h1>
                <p className="text-xs text-slate-600">Cultivo Escalonado • Castellón</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${
                alerts.some(a => a.priority === 1) 
                  ? "bg-red-100 text-red-800" 
                  : alerts.some(a => a.priority === 2)
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {alerts.filter(a => a.priority === 1).length > 0 
                  ? `${alerts.filter(a => a.priority === 1).length}⚠️` 
                  : alerts.filter(a => a.priority === 2).length > 0
                  ? `${alerts.filter(a => a.priority === 2).length}📋`
                  : "OK"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación principal */}
      <div className="sticky top-14 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-2 max-w-6xl">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex w-full overflow-x-auto py-1 px-1">
              <TabsTrigger value="dashboard" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                <Home size={14} />
                <span className="ml-1 hidden xs:inline">Panel</span>
              </TabsTrigger>
              <TabsTrigger value="measurements" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                <Ruler size={14} />
                <span className="ml-1 hidden xs:inline">Mediciones</span>
              </TabsTrigger>
              <TabsTrigger value="calculations" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                <Calculator size={14} />
                <span className="ml-1 hidden xs:inline">Cálculos</span>
              </TabsTrigger>
              <TabsTrigger value="tower" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                <TreePine size={14} />
                <span className="ml-1 hidden xs:inline">Torre</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 min-w-[70px] px-2 py-2 text-xs">
                <BarChart size={14} />
                <span className="ml-1 hidden xs:inline">Historial</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 px-2">
              <TabsContent value="dashboard">
                <DashboardTab />
              </TabsContent>
              
              <TabsContent value="measurements">
                <MeasurementsTab />
              </TabsContent>
              
              <TabsContent value="calculations">
                <CalculationsTab />
              </TabsContent>
              
              <TabsContent value="tower">
                <TowerTab />
              </TabsContent>
              
              <TabsContent value="history">
                <HistoryTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <main className="container mx-auto p-4 max-w-6xl">
        {/* Los componentes se renderizan en las pestañas */}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600">
              {plants.length} plantas • EC: {calculateStaggeredEC.recommendedEC}µS
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                irrigationConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
              }`} />
              <span className="text-xs text-slate-600">
                Riego: {irrigationConfig.enabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Diálogos */}
      <AddPlantDialog />
      <ECCalculatorDialog />
    </div>
  );
}
