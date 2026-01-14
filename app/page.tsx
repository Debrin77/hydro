// ============================================================================
// HYDROCARU - SISTEMA HIDROPÓNICO COMPLETO PARA CASTELLÓN
// ============================================================================

"use client"

import React, { useState, useMemo } from "react"
import { 
  Sprout, Activity, FlaskConical, Check, 
  AlertTriangle, Zap, Thermometer, CloudRain,
  RefreshCw, Calculator, TreePine, Home,
  BarChart, Ruler, Plus, Edit3, Save,
  Leaf, Waves, Droplet, ArrowRight,
  Trash2, ArrowLeft, CloudSun, X,
  ChevronRight, Info, Calendar, Clock
} from "lucide-react"

// ============================================================================
// COMPONENTES UI SIMPLIFICADOS
// ============================================================================

const Badge = ({ children, className = "", ...props }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`} {...props}>
    {children}
  </span>
)

const Card = ({ children, className = "", ...props }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

const Button = ({ children, onClick, className = "", variant = "default", size = "default", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
  const variants = {
    default: "bg-emerald-500 text-white hover:bg-emerald-600",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100",
    link: "text-emerald-600 underline-offset-4 hover:underline"
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const Progress = ({ value, className = "", ...props }) => (
  <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`} {...props}>
    <div
      className="h-full bg-emerald-500 transition-all"
      style={{ width: `${value}%` }}
    />
  </div>
)

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium leading-none ${className}`} {...props}>
    {children}
  </label>
)

const Input = ({ value, onChange, placeholder, type = "text", className = "", ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
    {...props}
  />
)

const Slider = ({ value, min, max, step, onValueChange, className = "", ...props }) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value)
    onValueChange?.([newValue])
  }
  
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value?.[0] || min}
      onChange={handleChange}
      className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 ${className}`}
      {...props}
    />
  )
}

const Select = ({ children, value, onValueChange, ...props }) => {
  const handleChange = (e) => {
    onValueChange?.(e.target.value)
  }
  
  return (
    <select 
      value={value} 
      onChange={handleChange}
      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      {...props}
    >
      {children}
    </select>
  )
}

const SelectTrigger = ({ children, ...props }) => <div {...props}>{children}</div>
const SelectValue = ({ placeholder }) => <span>{placeholder}</span>
const SelectContent = ({ children }) => (
  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
    {children}
  </div>
)
const SelectItem = ({ children, value, ...props }) => (
  <option value={value} className="px-3 py-2 text-sm hover:bg-gray-100" {...props}>
    {children}
  </option>
)

const Dialog = ({ children, open, onOpenChange, ...props }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ children, className = "", ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
)

const DialogHeader = ({ children, ...props }) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left" {...props}>
    {children}
  </div>
)

const DialogTitle = ({ children, ...props }) => (
  <h2 className="text-lg font-semibold leading-none tracking-tight" {...props}>
    {children}
  </h2>
)

const DialogFooter = ({ children, ...props }) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" {...props}>
    {children}
  </div>
)

const Tabs = ({ children, value, onValueChange }) => {
  const [activeTab, setActiveTab] = useState(value || "dashboard")
  
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    onValueChange?.(tab)
  }
  
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === TabsList || child.type === TabsContent) {
        return React.cloneElement(child, {
          activeTab,
          onTabChange: handleTabChange
        })
      }
    }
    return child
  })
  
  return <div className="tabs">{childrenWithProps}</div>
}

const TabsList = ({ children, activeTab, onTabChange, className = "" }) => {
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isActive: activeTab === child.props.value,
        onTabChange: () => onTabChange(child.props.value)
      })
    }
    return child
  })
  
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
      {childrenWithProps}
    </div>
  )
}

const TabsTrigger = ({ children, value, isActive, onTabChange, className = "" }) => (
  <button
    onClick={onTabChange}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
      isActive 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'
    } ${className}`}
  >
    {children}
  </button>
)

const TabsContent = ({ children, value, activeTab, ...props }) => {
  if (value !== activeTab) return null
  return <div {...props}>{children}</div>
}

// ============================================================================
// CONFIGURACIONES BASE
// ============================================================================

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
  // Estados principales - INICIALIZADOS CORRECTAMENTE
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRotation, setLastRotation] = useState(new Date().toISOString());
  const [tab, setTab] = useState("dashboard"); // ¡IMPORTANTE! Inicializar con "dashboard"
  const [showAddPlantDialog, setShowAddPlantDialog] = useState(false);
  const [showECCalculator, setShowECCalculator] = useState(false);
  
  const [newPlant, setNewPlant] = useState({
    name: "",
    variety: "trocadero",
    stage: "seedling",
    level: 1,
    plantDate: new Date().toISOString()
  });
  
  const [config, setConfig] = useState({ 
    ph: "6.0",
    ec: "1200",
    temp: "22",
    currentVol: "20",
    totalVol: "20",
    targetEC: "1400",
    targetPH: "6.0",
    waterType: "bajo_mineral",
    calculationMode: "average",
    dominantStage: "growth"
  });
  
  const [editingPH, setEditingPH] = useState(false);
  const [editingEC, setEditingEC] = useState(false);
  const [editingTemp, setEditingTemp] = useState(false);
  const [editingVolume, setEditingVolume] = useState(false);
  
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  // =================== CÁLCULO ESCALONADO AVANZADO ===================
  
  const calculateStaggeredEC = useMemo(() => {
    if (plants.length === 0) {
      return {
        recommendedEC: 1200,
        method: "Sin plantas",
        details: [],
        adjustment: 0,
        levelBreakdown: {1: [], 2: [], 3: []}
      };
    }
    
    let recommendedEC = 0;
    let method = "";
    const details = [];
    
    const levels = {1: [], 2: [], 3: []};
    plants.forEach(plant => levels[plant.level].push(plant));
    
    const plantECs = plants.map(plant => {
      const variety = VARIETIES[plant.variety];
      return variety?.stages[plant.stage]?.ec || 1200;
    });
    
    switch(config.calculationMode) {
      case "average":
        recommendedEC = Math.round(plantECs.reduce((a, b) => a + b, 0) / plantECs.length);
        method = "Promedio simple";
        details.push(`Promedio de ${plantECs.length} plantas: ${recommendedEC} µS/cm`);
        break;
        
      case "weighted":
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
        details.push(`${dominantPlants.length} plantas en etapa ${dominStage}`);
        break;
    }
    
    const levelAdjustment = plants.reduce((adjust, plant) => {
      return adjust + (plant.level * 25);
    }, 0) / plants.length;
    
    recommendedEC = Math.round(recommendedEC + levelAdjustment);
    details.push(`Ajuste por niveles: +${Math.round(levelAdjustment)} µS/cm`);
    
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
  
  // =================== FUNCIONES ===================
  
  const handleManualPHChange = (value) => setConfig({...config, ph: value});
  const handleManualECChange = (value) => setConfig({...config, ec: value});
  const handleManualTempChange = (value) => setConfig({...config, temp: value});
  const handleManualVolumeChange = (value) => setConfig({...config, currentVol: value});
  
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
  
  const handleSaveMeasurement = () => {
    const measurement = {
      id: generateId(),
      date: new Date().toISOString(),
      ph: config.ph,
      ec: config.ec,
      temp: config.temp,
      volume: config.currentVol,
      plantCount: plants.length,
      targetEC: config.targetEC
    };
    
    setHistory([measurement, ...history.slice(0, 49)]);
    alert("✅ Medición guardada en el historial");
  };
  
  const aquaVegaDosage = useMemo(() => {
    const volume = parseFloat(config.currentVol);
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
  
  // =================== COMPONENTES DE PESTAÑAS ===================
  
  const DashboardTab = () => (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panel de Control HydroCaru</h1>
          <p className="text-gray-600 text-sm">Cultivo escalonado de lechugas • Castellón</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-purple-100 text-purple-800 border border-purple-200">
            {plants.length} plantas • {calculateStaggeredEC.recommendedEC}µS
          </Badge>
          
          <Badge className="bg-cyan-100 text-cyan-800 border border-cyan-200">
            {config.calculationMode === "average" ? "Cálculo: Promedio" :
             config.calculationMode === "weighted" ? "Cálculo: Ponderado" :
             "Cálculo: Etapa dominante"}
          </Badge>
        </div>
      </div>
      
      {/* CÁLCULO ESCALONADO */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Calculator className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Cálculo de EC Escalonado</h3>
              <p className="text-sm text-gray-600">Ajuste inteligente por variedad y etapa</p>
            </div>
          </div>
          
          <Button onClick={() => setShowECCalculator(true)} variant="outline">
            Configurar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">
              {calculateStaggeredEC.recommendedEC} µS/cm
            </div>
            <p className="text-sm font-medium text-emerald-700">EC Recomendada</p>
            <p className="text-xs text-gray-600 mt-1">{calculateStaggeredEC.method}</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {plants.length}
            </div>
            <p className="text-sm font-medium text-blue-700">Plantas activas</p>
            <p className="text-xs text-gray-600 mt-1">
              N1: {calculateStaggeredEC.levelBreakdown[1].length} • 
              N2: {calculateStaggeredEC.levelBreakdown[2].length} • 
              N3: {calculateStaggeredEC.levelBreakdown[3].length}
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {config.targetEC} µS/cm
            </div>
            <p className="text-sm font-medium text-purple-700">EC Objetivo Actual</p>
            <p className="text-xs text-gray-600 mt-1">
              Dif: {Math.abs(parseInt(config.targetEC) - calculateStaggeredEC.recommendedEC)}µS
            </p>
          </div>
        </div>
        
        {calculateStaggeredEC.details.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-700 text-sm mb-2">Detalles del cálculo:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {calculateStaggeredEC.details.map((detail, idx) => (
                <li key={idx}>• {detail}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            onClick={() => {
              setConfig({
                ...config,
                targetEC: calculateStaggeredEC.recommendedEC.toString()
              });
              alert(`✅ EC objetivo actualizada a ${calculateStaggeredEC.recommendedEC} µS/cm`);
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Check className="mr-2" size={16} />
            Aplicar EC Recomendada como Objetivo
          </Button>
        </div>
      </Card>
      
      {/* RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Sprout className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Distribución por Etapa</h3>
              <p className="text-xs text-gray-600">Cultivo escalonado</p>
            </div>
          </div>
          
          {plants.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">🌱 Plántulas</span>
                <span className="font-bold text-cyan-600">
                  {plants.filter(p => p.stage === "seedling").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">📈 En crecimiento</span>
                <span className="font-bold text-green-600">
                  {plants.filter(p => p.stage === "growth").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">🌿 Maduras</span>
                <span className="font-bold text-emerald-600">
                  {plants.filter(p => p.stage === "mature").length}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Añade plantas para comenzar</p>
              <Button onClick={() => setShowAddPlantDialog(true)} variant="outline" size="sm" className="mt-2">
                <Plus className="mr-1" size={12} />
                Añadir primera planta
              </Button>
            </div>
          )}
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Nutrición Actual</h3>
              <p className="text-xs text-gray-600">Para {config.currentVol}L</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">EC objetivo</span>
              <span className="font-bold text-blue-600">{config.targetEC} µS/cm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">pH objetivo</span>
              <span className="font-bold text-purple-600">{config.targetPH}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Aqua Vega A</span>
              <span className="font-bold text-emerald-600">{aquaVegaDosage.a} ml</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Aqua Vega B</span>
              <span className="font-bold text-emerald-600">{aquaVegaDosage.b} ml</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <CloudRain className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Condiciones</h3>
              <p className="text-xs text-gray-600">Estado actual</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">pH actual</span>
              <span className={`font-bold ${
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.5 ? 'text-red-600' :
                Math.abs(parseFloat(config.ph) - parseFloat(config.targetPH)) > 0.2 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ph}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">EC actual</span>
              <span className={`font-bold ${
                Math.abs(parseFloat(config.ec) - calculateStaggeredEC.recommendedEC) > 200 ? 'text-red-600' :
                Math.abs(parseFloat(config.ec) - calculateStaggeredEC.recommendedEC) > 100 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {config.ec} µS/cm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Temperatura</span>
              <span className={`font-bold ${
                parseFloat(config.temp) > 28 ? 'text-red-600' : 
                parseFloat(config.temp) < 18 ? 'text-blue-600' : 
                'text-green-600'
              }`}>
                {config.temp}°C
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Volumen</span>
              <span className="font-bold text-blue-600">{config.currentVol}L / {config.totalVol}L</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
  
  const MeasurementsTab = () => (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📝 Mediciones Manuales</h2>
        <p className="text-gray-600 text-sm">Control preciso del sistema escalonado</p>
      </div>
      
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="text-purple-600" size={18} />
                  <span className="font-bold text-gray-900">pH del Agua</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingPH(!editingPH)}>
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
                    className="text-center text-xl font-bold"
                  />
                  <Slider
                    value={[parseFloat(config.ph)]}
                    min={4.0}
                    max={9.0}
                    step={0.1}
                    onValueChange={([value]) => handleManualPHChange(value.toString())}
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
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="text-blue-600" size={18} />
                  <span className="font-bold text-gray-900">EC (Conductividad)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingEC(!editingEC)}>
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
                    className="text-center text-xl font-bold"
                  />
                  <Slider
                    value={[parseFloat(config.ec)]}
                    min={0}
                    max={3000}
                    step={50}
                    onValueChange={([value]) => handleManualECChange(value.toString())}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{config.ec} µS/cm</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Recomendado: {calculateStaggeredEC.recommendedEC} µS/cm
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="text-amber-600" size={18} />
                  <span className="font-bold text-gray-900">Temperatura</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingTemp(!editingTemp)}>
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
                    className="text-center text-xl font-bold"
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
            
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Droplet className="text-cyan-600" size={18} />
                  <span className="font-bold text-gray-900">Volumen Depósito</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingVolume(!editingVolume)}>
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
                    className="text-center text-xl font-bold"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 mb-1">{config.currentVol}L</div>
                  <Progress value={(parseFloat(config.currentVol) / parseFloat(config.totalVol)) * 100} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <Button onClick={handleSaveMeasurement} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            <Save className="mr-2" size={16} />
            Guardar Medición Actual
          </Button>
        </div>
      </Card>
    </div>
  );
  
  const CalculationsTab = () => (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🧪 Cálculos para Cultivo Escalonado</h2>
        <p className="text-gray-600 text-sm">Ajustes específicos por variedad y etapa</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <RefreshCw className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Ajuste pH</h3>
              <p className="text-xs text-gray-600">{config.ph} → {config.targetPH}</p>
            </div>
          </div>
          
          {parseFloat(config.ph) > parseFloat(config.targetPH) ? (
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {phAdjustment.phMinus} ml
              </div>
              <p className="text-sm font-bold text-purple-700">pH- (Ácido)</p>
              <p className="text-xs text-gray-600">Para {config.currentVol}L</p>
            </div>
          ) : (
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600 mb-1">
                {phAdjustment.phPlus} ml
              </div>
              <p className="text-sm font-bold text-pink-700">pH+ (Alcalino)</p>
              <p className="text-xs text-gray-600">Para {config.currentVol}L</p>
            </div>
          )}
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Aqua Vega</h3>
              <p className="text-xs text-gray-600">Para {config.currentVol}L</p>
            </div>
          </div>
          
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
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
            <p className="text-xs text-gray-600">Factor EC: {aquaVegaDosage.ecFactor}x</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Waves className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">CalMag</h3>
              <p className="text-xs text-gray-600">Agua: {WATER_TYPES[config.waterType].name}</p>
            </div>
          </div>
          
          <div className="text-center p-3 bg-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600 mb-1">
              {config.waterType === "osmosis" ? "20 ml" : 
               config.waterType === "mixta" ? "10 ml" : "5 ml"}
            </div>
            <p className="text-sm font-bold text-cyan-700">CalMag</p>
            <p className="text-xs text-gray-600">
              {config.waterType === "osmosis" ? "Alta necesidad" : 
               config.waterType === "mixta" ? "Media necesidad" : "Baja necesidad"}
            </p>
          </div>
        </Card>
      </div>
      
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Leaf className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Parámetros por Variedad</h3>
            <p className="text-sm text-gray-600">EC objetivo por etapa de crecimiento</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Variedad</th>
                <th className="p-2 text-left">Plántula</th>
                <th className="p-2 text-left">Crecimiento</th>
                <th className="p-2 text-left">Madura</th>
                <th className="p-2 text-left">Días total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(VARIETIES).map(([key, variety]) => (
                <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 font-medium text-gray-900">{variety.name}</td>
                  <td className="p-2">
                    <div className="font-bold text-cyan-600">{variety.stages.seedling.ec} µS</div>
                    <div className="text-xs text-gray-600">{variety.stages.seedling.days}d</div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold text-green-600">{variety.stages.growth.ec} µS</div>
                    <div className="text-xs text-gray-600">{variety.stages.growth.days}d</div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold text-emerald-600">{variety.stages.mature.ec} µS</div>
                    <div className="text-xs text-gray-600">{variety.stages.mature.days}d</div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold text-gray-900">{variety.totalDays} días</div>
                    <div className="text-xs text-gray-600">{variety.recommendedSeason}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
  
  const TowerTab = () => {
    const levelStats = {
      1: { count: plants.filter(p => p.level === 1).length, max: 5, plants: plants.filter(p => p.level === 1) },
      2: { count: plants.filter(p => p.level === 2).length, max: 5, plants: plants.filter(p => p.level === 2) },
      3: { count: plants.filter(p => p.level === 3).length, max: 5, plants: plants.filter(p => p.level === 3) }
    };
    
    return (
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🌿 Torre de Cultivo Escalonado</h2>
          <p className="text-gray-600 text-sm">Gestión avanzada por nivel y etapa</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TreePine className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Cultivo Escalonado</h3>
              <p className="text-gray-600 text-sm">
                {plants.length} plantas • EC rec: {calculateStaggeredEC.recommendedEC}µS
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => setShowAddPlantDialog(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="mr-2" size={16} />
              Añadir Planta
            </Button>
            
            <Button onClick={handleRotatePlants} className="bg-amber-500 hover:bg-amber-600 text-white">
              <RefreshCw className="mr-2" size={16} />
              Rotar Plantas
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(level => (
            <Card key={level} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    level === 1 ? 'bg-cyan-500' : 
                    level === 2 ? 'bg-green-500' : 
                    'bg-emerald-500'
                  }`} />
                  <span className="font-bold text-gray-900">Nivel {level}</span>
                  <Badge className={
                    level === 1 ? 'bg-cyan-100 text-cyan-800' :
                    level === 2 ? 'bg-green-100 text-green-800' :
                    'bg-emerald-100 text-emerald-800'
                  }>
                    {levelStats[level].count}/{levelStats[level].max}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                {levelStats[level].plants.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">Nivel vacío</p>
                    <p className="text-gray-400 text-xs">Añade plantas para comenzar</p>
                  </div>
                ) : (
                  levelStats[level].plants.map(plant => {
                    const variety = VARIETIES[plant.variety];
                    const stageInfo = variety?.stages[plant.stage];
                    
                    return (
                      <div key={plant.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{plant.name}</div>
                            <div className="text-xs text-gray-600">{variety?.name}</div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleAdvanceStage(plant.id)} className="h-6 w-6 p-0 text-blue-500">
                              <ArrowRight size={12} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRemovePlant(plant.id)} className="h-6 w-6 p-0 text-red-500">
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
                          
                          <div className="text-xs font-bold text-gray-700">
                            EC: {stageInfo?.ec || 1200}µS
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-2">
                          {stageInfo?.description}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
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
  
  const HistoryTab = () => (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📈 Historial de Mediciones</h2>
        <p className="text-gray-600 text-sm">{history.length} registros</p>
      </div>
      
      <Card className="p-5">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay mediciones registradas</p>
            <Button onClick={handleSaveMeasurement} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Save className="mr-2" size={16} />
              Crear primera medición
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div key={record.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-gray-900">
                    {new Date(record.date).toLocaleDateString('es-ES')} {new Date(record.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {record.plantCount} plantas
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-xs text-gray-600">pH</div>
                    <div className="font-bold">{record.ph}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">EC</div>
                    <div className="font-bold">{record.ec}µS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Temp</div>
                    <div className="font-bold">{record.temp}°C</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Vol</div>
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
            />
          </div>
          
          <div>
            <Label>Variedad de Lechuga</Label>
            <Select value={newPlant.variety} onValueChange={(value) => setNewPlant({...newPlant, variety: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona variedad" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VARIETIES).map(([key, variety]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{variety.name}</span>
                      <span className="text-xs text-gray-500">
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
              <SelectTrigger>
                <SelectValue placeholder="Selecciona etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seedling">
                  <div className="flex flex-col">
                    <span>🌱 Plántula</span>
                    <span className="text-xs text-gray-500">
                      EC: {VARIETIES[newPlant.variety]?.stages.seedling.ec}µS
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="growth">
                  <div className="flex flex-col">
                    <span>📈 Crecimiento</span>
                    <span className="text-xs text-gray-500">
                      EC: {VARIETIES[newPlant.variety]?.stages.growth.ec}µS
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="mature">
                  <div className="flex flex-col">
                    <span>🌿 Madura</span>
                    <span className="text-xs text-gray-500">
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
              <SelectTrigger>
                <SelectValue placeholder="Selecciona nivel" />
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
          <Button onClick={handleAddPlant} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Añadir Planta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  const ECCalculatorDialog = () => (
    <Dialog open={showECCalculator} onOpenChange={setShowECCalculator}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Cálculo de EC</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Método de Cálculo</Label>
            <Select value={config.calculationMode} onValueChange={(value) => setConfig({...config, calculationMode: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="average">Promedio Simple</SelectItem>
                <SelectItem value="weighted">Ponderado por Etapa</SelectItem>
                <SelectItem value="dominant">Etapa Dominante</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.calculationMode === "dominant" && (
            <div>
              <Label>Etapa Dominante Forzada</Label>
              <Select value={config.dominantStage} onValueChange={(value) => setConfig({...config, dominantStage: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seedling">🌱 Plántula</SelectItem>
                  <SelectItem value="growth">📈 Crecimiento</SelectItem>
                  <SelectItem value="mature">🌿 Madura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-700 text-sm mb-2">Resumen Actual:</h4>
            <div className="text-sm text-gray-600">
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
          <Button onClick={() => {
            setConfig({...config, targetEC: calculateStaggeredEC.recommendedEC.toString()});
            setShowECCalculator(false);
            alert(`✅ EC objetivo actualizada a ${calculateStaggeredEC.recommendedEC} µS/cm`);
          }} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Aplicar EC Recomendada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // =================== RENDER PRINCIPAL ===================
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={18} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">HydroCaru</h1>
                <p className="text-xs text-gray-600">Cultivo Escalonado • Castellón</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
                {plants.length} plantas
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="sticky top-14 z-10 bg-white border-b border-gray-200 pt-4">
            <TabsList className="flex w-full overflow-x-auto py-1 px-1 mb-4 mx-4">
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
          </div>
          
          <div className="px-4">
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

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {plants.length} plantas • EC rec: {calculateStaggeredEC.recommendedEC}µS
            </div>
            <div className="text-xs text-gray-500">
              HydroCaru v1.0
            </div>
          </div>
        </div>
      </footer>

      <AddPlantDialog />
      <ECCalculatorDialog />
    </div>
  );
}
