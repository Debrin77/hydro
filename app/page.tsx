// ============================================================================
// HYDROCARU - SISTEMA HIDROPÓNICO COMPLETO PARA CASTELLÓN
// ============================================================================

"use client"

import React, { useState, useEffect } from "react"

// ICONOS NECESARIOS
import { 
  Sprout, Activity, FlaskConical, Check, 
  Zap, Thermometer, CloudRain,
  RefreshCw, Calculator, TreePine, Home,
  BarChart, Ruler, Plus, Edit3, Save,
  Leaf, Waves, Droplet, ArrowRight,
  Trash2, ArrowLeft
} from "lucide-react"

// ============================================================================
// VARIEDADES DE LECHUGA
// ============================================================================

const VARIETIES = {
  trocadero: { 
    name: "Lechuga Trocadero", 
    stages: { 
      seedling: { ec: 800, days: 10, description: "Plántula inicial" }, 
      growth: { ec: 1200, days: 25, description: "Crecimiento" }, 
      mature: { ec: 1400, days: 20, description: "Maduración" } 
    },
    totalDays: 55,
    recommendedSeason: "Primavera-Verano"
  },
  iceberg: { 
    name: "Lechuga Iceberg", 
    stages: { 
      seedling: { ec: 850, days: 14, description: "Plántula lenta" }, 
      growth: { ec: 1300, days: 35, description: "Crecimiento lento" }, 
      mature: { ec: 1600, days: 30, description: "Compactación" } 
    },
    totalDays: 79,
    recommendedSeason: "Otoño-Primavera"
  },
  lolo_rosso: { 
    name: "Lechuga Lolo Rosso", 
    stages: { 
      seedling: { ec: 800, days: 10, description: "Coloración temprana" }, 
      growth: { ec: 1250, days: 25, description: "Color intenso" }, 
      mature: { ec: 1450, days: 20, description: "Maduración roja" } 
    },
    totalDays: 55,
    recommendedSeason: "Todo el año"
  }
};

// ============================================================================
// COMPONENTES UI SIMPLES
// ============================================================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, className = "", variant = "default" }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-colors"
  const styles = {
    default: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  }
  
  return (
    <button 
      onClick={onClick} 
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

const Badge = ({ children, className = "" }) => (
  <span className={`inline-block px-2 py-1 text-xs rounded-full ${className}`}>
    {children}
  </span>
)

const Input = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
  />
)

const Progress = ({ value }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div 
      className="h-full bg-green-500 transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
)

const Select = ({ value, onChange, children, placeholder }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
  >
    <option value="">{placeholder}</option>
    {children}
  </select>
)

const Dialog = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HydroCaruApp() {
  // Estados principales
  const [plants, setPlants] = useState([
    { id: "1", name: "Lechuga 1", variety: "trocadero", stage: "seedling", level: 1, plantDate: new Date().toISOString() },
    { id: "2", name: "Lechuga 2", variety: "iceberg", stage: "growth", level: 2, plantDate: new Date().toISOString() },
    { id: "3", name: "Lechuga 3", variety: "lolo_rosso", stage: "mature", level: 3, plantDate: new Date().toISOString() }
  ])
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAddPlant, setShowAddPlant] = useState(false)
  
  const [config, setConfig] = useState({
    ph: "6.0",
    ec: "1200",
    temp: "22",
    volume: "20",
    targetEC: "1400",
    targetPH: "6.0",
    calculationMode: "average"
  })
  
  const [newPlant, setNewPlant] = useState({
    name: "",
    variety: "trocadero",
    stage: "seedling",
    level: 1
  })

  // Cálculo de EC escalonado
  const calculateEC = () => {
    if (plants.length === 0) return 1200
    
    let totalEC = 0
    plants.forEach(plant => {
      const variety = VARIETIES[plant.variety]
      const stageEC = variety?.stages[plant.stage]?.ec || 1200
      totalEC += stageEC
    })
    
    const averageEC = Math.round(totalEC / plants.length)
    
    // Ajuste por nivel
    let levelAdjustment = 0
    plants.forEach(plant => {
      levelAdjustment += plant.level * 25
    })
    levelAdjustment = Math.round(levelAdjustment / plants.length)
    
    return averageEC + levelAdjustment
  }
  
  const staggeredEC = calculateEC()

  // Funciones de acción
  const handleAddPlant = () => {
    if (!newPlant.name.trim()) {
      alert("Introduce un nombre para la planta")
      return
    }
    
    const plant = {
      id: Date.now().toString(),
      name: newPlant.name,
      variety: newPlant.variety,
      stage: newPlant.stage,
      level: newPlant.level,
      plantDate: new Date().toISOString()
    }
    
    setPlants([...plants, plant])
    setNewPlant({ name: "", variety: "trocadero", stage: "seedling", level: 1 })
    setShowAddPlant(false)
    alert(`Planta añadida al nivel ${newPlant.level}`)
  }
  
  const handleRemovePlant = (id) => {
    if (window.confirm("¿Eliminar esta planta?")) {
      setPlants(plants.filter(p => p.id !== id))
    }
  }
  
  const handleRotatePlants = () => {
    const rotated = plants.map(plant => {
      let newLevel = plant.level
      if (plant.level === 1) newLevel = 2
      else if (plant.level === 2) newLevel = 3
      else if (plant.level === 3) newLevel = 1
      
      return { ...plant, level: newLevel }
    })
    
    setPlants(rotated)
    alert("Plantas rotadas")
  }
  
  const handleSaveMeasurement = () => {
    const measurement = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ph: config.ph,
      ec: config.ec,
      temp: config.temp,
      plants: plants.length,
      targetEC: config.targetEC
    }
    
    setHistory([measurement, ...history.slice(0, 10)])
    alert("Medición guardada")
  }

  // Componentes de pestañas
  const DashboardTab = () => (
    <div className="space-y-6 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">HydroCaru Dashboard</h1>
        <p className="text-gray-600">Sistema de cultivo escalonado</p>
      </div>
      
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Calculator className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">EC Recomendada</h3>
            <p className="text-sm text-gray-600">Cálculo escalonado</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{staggeredEC} µS/cm</div>
          <p className="text-sm text-gray-600 mb-4">{plants.length} plantas activas</p>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {plants.filter(p => p.level === 1).length}
              </div>
              <div className="text-xs text-gray-600">Nivel 1</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {plants.filter(p => p.level === 2).length}
              </div>
              <div className="text-xs text-gray-600">Nivel 2</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">
                {plants.filter(p => p.level === 3).length}
              </div>
              <div className="text-xs text-gray-600">Nivel 3</div>
            </div>
          </div>
          
          <Button onClick={() => setConfig({...config, targetEC: staggeredEC.toString()})}>
            <Check className="inline mr-2" size={16} />
            Aplicar EC Recomendada
          </Button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="text-green-600" size={18} />
            <h3 className="font-bold text-gray-900">Plantas</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Plántulas</span>
              <span className="font-bold text-blue-600">
                {plants.filter(p => p.stage === "seedling").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">En crecimiento</span>
              <span className="font-bold text-green-600">
                {plants.filter(p => p.stage === "growth").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Maduras</span>
              <span className="font-bold text-emerald-600">
                {plants.filter(p => p.stage === "mature").length}
              </span>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="text-blue-600" size={18} />
            <h3 className="font-bold text-gray-900">Nutrición</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">EC objetivo</span>
              <span className="font-bold">{config.targetEC} µS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">pH objetivo</span>
              <span className="font-bold">{config.targetPH}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Aqua Vega A</span>
              <span className="font-bold text-green-600">15 ml</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Aqua Vega B</span>
              <span className="font-bold text-green-600">15 ml</span>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="text-orange-600" size={18} />
            <h3 className="font-bold text-gray-900">Condiciones</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">pH actual</span>
              <span className="font-bold">{config.ph}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">EC actual</span>
              <span className="font-bold">{config.ec} µS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Temperatura</span>
              <span className="font-bold">{config.temp}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Volumen</span>
              <span className="font-bold">{config.volume}L</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
  
  const TowerTab = () => (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Torre de Cultivo</h2>
          <p className="text-gray-600">{plants.length} plantas activas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddPlant(true)}>
            <Plus className="mr-2" size={16} />
            Añadir Planta
          </Button>
          <Button onClick={handleRotatePlants} variant="outline">
            <RefreshCw className="mr-2" size={16} />
            Rotar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(level => {
          const levelPlants = plants.filter(p => p.level === level)
          
          return (
            <Card key={level}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Nivel {level}</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {levelPlants.length} plantas
                </Badge>
              </div>
              
              <div className="space-y-3">
                {levelPlants.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Sin plantas</p>
                ) : (
                  levelPlants.map(plant => {
                    const variety = VARIETIES[plant.variety]
                    
                    return (
                      <div key={plant.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{plant.name}</div>
                            <div className="text-sm text-gray-600">{variety?.name}</div>
                          </div>
                          <button
                            onClick={() => handleRemovePlant(plant.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={
                            plant.stage === 'seedling' ? 'bg-blue-100 text-blue-800' :
                            plant.stage === 'growth' ? 'bg-green-100 text-green-800' :
                            'bg-emerald-100 text-emerald-800'
                          }>
                            {plant.stage === 'seedling' ? 'Plántula' : 
                             plant.stage === 'growth' ? 'Crecimiento' : 'Madura'}
                          </Badge>
                          
                          <span className="text-sm font-bold">
                            EC: {variety?.stages[plant.stage]?.ec || 1200}µS
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              
              <Button
                onClick={() => {
                  setNewPlant({...newPlant, level})
                  setShowAddPlant(true)
                }}
                variant="outline"
                className="w-full mt-4"
              >
                <Plus className="mr-2" size={14} />
                Añadir al Nivel {level}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
  
  const MeasurementsTab = () => (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mediciones</h2>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                pH del Agua
              </label>
              <Input
                type="number"
                step="0.1"
                value={config.ph}
                onChange={(e) => setConfig({...config, ph: e.target.value})}
                placeholder="Ej: 6.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EC (Conductividad)
              </label>
              <Input
                type="number"
                value={config.ec}
                onChange={(e) => setConfig({...config, ec: e.target.value})}
                placeholder="Ej: 1200"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura (°C)
              </label>
              <Input
                type="number"
                value={config.temp}
                onChange={(e) => setConfig({...config, temp: e.target.value})}
                placeholder="Ej: 22"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volumen (L)
              </label>
              <Input
                type="number"
                value={config.volume}
                onChange={(e) => setConfig({...config, volume: e.target.value})}
                placeholder="Ej: 20"
              />
              <Progress value={(parseInt(config.volume) / 20) * 100} />
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <Button onClick={handleSaveMeasurement} className="w-full">
            <Save className="mr-2" size={16} />
            Guardar Medición
          </Button>
        </div>
      </Card>
      
      {history.length > 0 && (
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Historial Reciente</h3>
          <div className="space-y-3">
            {history.slice(0, 5).map(record => (
              <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {record.plants} plantas
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-xs text-gray-600">pH</div>
                    <div className="font-bold">{record.ph}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">EC</div>
                    <div className="font-bold">{record.ec}µS</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Temp</div>
                    <div className="font-bold">{record.temp}°C</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">EC Obj</div>
                    <div className="font-bold">{record.targetEC}µS</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
  
  const CalculationsTab = () => (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cálculos</h2>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">800-1200</div>
            <div className="text-sm font-medium text-blue-700">Plántulas</div>
            <div className="text-xs text-gray-600">EC recomendada</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">1200-1600</div>
            <div className="text-sm font-medium text-green-700">Crecimiento</div>
            <div className="text-xs text-gray-600">EC recomendada</div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 mb-1">1400-1800</div>
            <div className="text-sm font-medium text-emerald-700">Maduración</div>
            <div className="text-xs text-gray-600">EC recomendada</div>
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
              </tr>
            </thead>
            <tbody>
              {Object.entries(VARIETIES).map(([key, variety]) => (
                <tr key={key} className="border-b border-gray-200">
                  <td className="p-2 font-medium">{variety.name}</td>
                  <td className="p-2">
                    <div className="font-bold text-blue-600">{variety.stages.seedling.ec} µS</div>
                    <div className="text-xs text-gray-600">{variety.stages.seedling.days} días</div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold text-green-600">{variety.stages.growth.ec} µS</div>
                    <div className="text-xs text-gray-600">{variety.stages.growth.days} días</div>
                  </td>
                  <td className="p-2">
                    <div className="font-bold text-emerald-600">{variety.stages.mature.ec} µS</div>
                    <div className="text-xs text-gray-600">{variety.stages.mature.days} días</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Sprout className="text-white" size={18} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">HydroCaru</h1>
                <p className="text-xs text-gray-600">Cultivo escalonado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                {plants.length} plantas
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                EC: {staggeredEC}µS
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Navegación */}
        <div className="border-t border-gray-200 bg-white">
          <div className="container mx-auto">
            <div className="flex overflow-x-auto">
              {[
                { id: "dashboard", label: "Panel", icon: Home },
                { id: "tower", label: "Torre", icon: TreePine },
                { id: "measurements", label: "Mediciones", icon: Ruler },
                { id: "calculations", label: "Cálculos", icon: Calculator }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="container mx-auto">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "tower" && <TowerTab />}
        {activeTab === "measurements" && <MeasurementsTab />}
        {activeTab === "calculations" && <CalculationsTab />}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              HydroCaru v1.0 • Sistema de cultivo escalonado
            </div>
            <div className="text-sm text-gray-600">
              {plants.length} plantas activas
            </div>
          </div>
        </div>
      </footer>
      
      {/* Diálogo para añadir planta */}
      <Dialog
        isOpen={showAddPlant}
        onClose={() => setShowAddPlant(false)}
        title="Añadir Nueva Planta"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la planta
            </label>
            <Input
              value={newPlant.name}
              onChange={(e) => setNewPlant({...newPlant, name: e.target.value})}
              placeholder="Ej: Lechuga Romana #1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variedad
            </label>
            <Select
              value={newPlant.variety}
              onChange={(value) => setNewPlant({...newPlant, variety: value})}
              placeholder="Selecciona variedad"
            >
              {Object.entries(VARIETIES).map(([key, variety]) => (
                <option key={key} value={key}>
                  {variety.name} ({variety.totalDays} días)
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etapa
            </label>
            <Select
              value={newPlant.stage}
              onChange={(value) => setNewPlant({...newPlant, stage: value})}
              placeholder="Selecciona etapa"
            >
              <option value="seedling">🌱 Plántula</option>
              <option value="growth">📈 Crecimiento</option>
              <option value="mature">🌿 Madura</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel en la torre
            </label>
            <Select
              value={newPlant.level.toString()}
              onChange={(value) => setNewPlant({...newPlant, level: parseInt(value)})}
              placeholder="Selecciona nivel"
            >
              <option value="1">Nivel 1 (Abajo)</option>
              <option value="2">Nivel 2 (Medio)</option>
              <option value="3">Nivel 3 (Arriba)</option>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowAddPlant(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddPlant}
              className="flex-1"
            >
              <Plus className="mr-2" size={16} />
              Añadir Planta
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
