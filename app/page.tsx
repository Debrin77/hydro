"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Calendar, History, Plus, Droplets } from "lucide-react"
import SetupWizard from "@/components/setup-wizard"
import TowerVisualizer from "@/components/tower-visualizer"
import MeasurementInput from "@/components/measurement-input"
import MaintenanceCalendar from "@/components/maintenance-calendar"
import HistoryLog from "@/components/history-log"
import PlantManagement from "@/components/plant-management"
import SystemOverview from "@/components/system-overview"
import PumpControl from "@/components/pump-control"
import { Badge } from "@/components/ui/badge"

// --- DEFINICIÓN DE TIPOS ---
export type LettuceVariety = "Romana" | "Iceberg" | "Hoja de Roble" | "Lollo Rosso" | "Trocadero"
export type PlantStage = "young" | "medium" | "harvest"

export interface Plant {
  id: string
  variety: LettuceVariety
  level: number
  position: number
  weeksSincePlanted: number
  plantedDate: Date
  stage: PlantStage
}

export interface SystemParameters {
  pH: number
  ec: number
  waterTemp: number
  waterVolume: number
  nutrientsA: number
  nutrientsB: number
}

export interface MeasurementRecord {
  id: string
  timestamp: Date
  pH: number
  ec: number
  waterTemp: number
  waterVolume: number
  inRange: boolean
}

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [plants, setPlants] = useState<Plant[]>([])
  const [parameters, setParameters] = useState<SystemParameters>({
    pH: 6.0, ec: 1.2, waterTemp: 20, waterVolume: 20, nutrientsA: 100, nutrientsB: 100
  })
  const [systemStartDate, setSystemStartDate] = useState<Date | null>(null)
  const [lastCleaningDate, setLastCleaningDate] = useState<Date | null>(null)
  const [measurementHistory, setMeasurementHistory] = useState<MeasurementRecord[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  // --- CARGA DE DATOS AL INICIAR ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaruData")
    if (saved) {
      try {
        const d = JSON.parse(saved)
        setIsSetupComplete(d.isSetupComplete || false)
        setPlants((d.plants || []).map((p: any) => ({ ...p, plantedDate: new Date(p.plantedDate) })))
        setParameters(d.parameters || { pH: 6.0, ec: 1.2, waterTemp: 20, waterVolume: 20, nutrientsA: 100, nutrientsB: 100 })
        setSystemStartDate(d.systemStartDate ? new Date(d.systemStartDate) : null)
        setLastCleaningDate(d.lastCleaningDate ? new Date(d.lastCleaningDate) : null)
        setMeasurementHistory((d.measurementHistory || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
      } catch (e) {
        console.error("Error cargando datos:", e)
      }
    }
  }, [])

  // --- GUARDADO AUTOMÁTICO ---
  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaruData", JSON.stringify({
        isSetupComplete, plants, parameters, systemStartDate, lastCleaningDate, measurementHistory
      }))
    }
  }, [isSetupComplete, plants, parameters, measurementHistory, lastCleaningDate, systemStartDate])

  // --- LÓGICA DE NUTRIENTES (HY-PRO) ---
  const calculateRecommendedEC = () => {
    if (plants.length === 0) return 1.2
    const avgWeeks = plants.reduce((sum, p) => sum + p.weeksSincePlanted, 0) / plants.length
    if (avgWeeks < 2) return 1.2 // Plántulas
    if (avgWeeks < 4) return 1.5 // Crecimiento
    return 1.8 // Adultas
  }

  // --- GESTIÓN DE PLANTAS ---
  const handleAddPlant = (variety: LettuceVariety, level: number) => {
    const newPlant: Plant = {
      id: `plant-${Date.now()}`,
      variety,
      level,
      position: plants.filter(p => p.level === level).length + 1,
      weeksSincePlanted: 0,
      plantedDate: new Date(),
      stage: "young"
    }
    setPlants([...plants, newPlant])
    return true
  }

  const handleRemovePlant = (id: string) => {
    setPlants(plants.filter(p => p.id !== id))
  }

  // --- FLUJO DE INICIALIZACIÓN ---
  if (!isSetupComplete) {
    return (
      <SetupWizard 
        onComplete={(initialParams) => {
          setParameters(initialParams)
          setSystemStartDate(new Date())
          setLastCleaningDate(new Date())
          setIsSetupComplete(true)
        }} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 font-sans">
      <header className="border-b bg-card sticky top-0 z-10 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-black text-xl">
            <Sprout className="w-6 h-6" /> HydroCaru
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
             EC OBJ: {calculateRecommendedEC()} | {parameters.waterVolume}L
          </Badge>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full sticky top-[72px] z-10 bg-background/95 backdrop-blur">
            <TabsTrigger value="overview"><Activity className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="measurements"><Beaker className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="tower"><Layers className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="plants"><Plus className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="pump" className="hidden lg:flex"><Droplets className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="calendar" className="hidden lg:flex"><Calendar className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="history" className="hidden lg:flex"><History className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SystemOverview
              plants={plants}
              parameters={parameters}
              recommendedEC={calculateRecommendedEC()}
              daysUntilCleaning={lastCleaningDate ? 14 - Math.floor((Date.now() - lastCleaningDate.getTime())/(1000*60*60*24)) : 0}
            />
          </TabsContent>

          <TabsContent value="measurements">
            <MeasurementInput
              parameters={parameters}
              setParameters={setParameters}
              recommendedEC={calculateRecommendedEC()}
              totalPlants={plants.length}
              onMeasurementComplete={(m) => {
                setMeasurementHistory([{...m, id: Date.now().toString(), timestamp: new Date()}, ...measurementHistory])
                setParameters({...parameters, pH: m.pH, ec: m.ec, waterVolume: m.waterVolume, waterTemp: m.waterTemp})
                setActiveTab("overview") // Al medir, te lleva a ver la dosis
              }}
              onCorrectiveAction={() => {}}
            />
          </TabsContent>

          <TabsContent value="tower">
            <TowerVisualizer 
              plants={plants} 
              onRemovePlant={handleRemovePlant} 
              onAddPlant={handleAddPlant} 
            />
          </TabsContent>

          <TabsContent value="plants">
            <PlantManagement 
              plants={plants} 
              onAddPlant={handleAddPlant} 
            />
          </TabsContent>

          <TabsContent value="pump">
            <PumpControl plantCount={plants.length} reservoirVolume={parameters.waterVolume} waterTemperature={parameters.waterTemp} hasHeater={true} />
          </TabsContent>

          <TabsContent value="calendar">
            <MaintenanceCalendar 
              systemStartDate={systemStartDate!} 
              lastCleaningDate={lastCleaningDate} 
              plants={plants} 
              totalPlants={plants.length} 
              measurementHistory={measurementHistory} 
              onCleaningComplete={() => setLastCleaningDate(new Date())} 
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoryLog 
              measurementHistory={measurementHistory} 
              actionLog={[]} 
              plants={plants} 
              onClearHistory={() => { 
                localStorage.removeItem("hydroCaruData"); 
                window.location.reload(); 
              }} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
