"use client"

import { useState, useEffect, useCallback } from "react"
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

// --- TIPOS ---
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
  pH: number; ec: number; waterTemp: number; waterVolume: number; nutrientsA: number; nutrientsB: number;
}

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [plants, setPlants] = useState<Plant[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [parameters, setParameters] = useState<SystemParameters>({
    pH: 6.0, ec: 1.2, waterTemp: 20, waterVolume: 20, nutrientsA: 100, nutrientsB: 100
  })
  const [systemStartDate, setSystemStartDate] = useState<Date>(new Date())
  const [lastCleaningDate, setLastCleaningDate] = useState<Date>(new Date())
  const [measurementHistory, setMeasurementHistory] = useState<any[]>([])

  // --- CARGA SEGURA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaruData")
    if (saved) {
      try {
        const d = JSON.parse(saved)
        if (d.isSetupComplete) {
          setIsSetupComplete(true)
          setPlants((d.plants || []).map((p: any) => ({ ...p, plantedDate: new Date(p.plantedDate) })))
          setParameters(d.parameters || parameters)
          setSystemStartDate(new Date(d.systemStartDate || Date.now()))
          setLastCleaningDate(new Date(d.lastCleaningDate || Date.now()))
          setMeasurementHistory(d.measurementHistory || [])
        }
      } catch (e) {
        console.error("Error crítico en carga:", e)
      }
    }
  }, [])

  // --- GUARDADO SEGURO ---
  useEffect(() => {
    if (isSetupComplete) {
      const data = { isSetupComplete, plants, parameters, systemStartDate, lastCleaningDate, measurementHistory }
      localStorage.setItem("hydroCaruData", JSON.stringify(data))
    }
  }, [isSetupComplete, plants, parameters, measurementHistory])

  const calculateRecommendedEC = useCallback(() => {
    if (plants.length === 0) return 1.2
    const avgWeeks = plants.reduce((sum, p) => sum + p.weeksSincePlanted, 0) / plants.length
    return avgWeeks < 2 ? 1.2 : avgWeeks < 4 ? 1.5 : 1.8
  }, [plants])

  // --- GESTIÓN DE PLANTAS (Fijado para TowerVisualizer) ---
  const handleAddPlant = (variety: LettuceVariety, level: number) => {
    const newPlant: Plant = {
      id: `p-${Date.now()}`,
      variety,
      level: Number(level),
      position: plants.filter(p => p.level === Number(level)).length + 1,
      weeksSincePlanted: 0,
      plantedDate: new Date(),
      stage: "young"
    }
    setPlants(prev => [...prev, newPlant])
    return true
  }

  const handleRemovePlant = (id: string) => {
    setPlants(prev => prev.filter(p => p.id !== id))
  }

  if (!isSetupComplete) {
    return <SetupWizard onComplete={(p) => { setParameters(p); setIsSetupComplete(true); }} />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card sticky top-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-bold"><Sprout /> HydroCaru</div>
          <Badge variant="outline">EC Obj: {calculateRecommendedEC().toFixed(1)}</Badge>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="overview"><Activity className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="measurements"><Beaker className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="tower"><Layers className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="plants"><Plus className="h-4 w-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SystemOverview 
                plants={plants} 
                parameters={parameters} 
                recommendedEC={calculateRecommendedEC()} 
                daysUntilCleaning={14} 
            />
          </TabsContent>

          <TabsContent value="measurements">
            <MeasurementInput
              parameters={parameters}
              setParameters={setParameters}
              recommendedEC={calculateRecommendedEC()}
              totalPlants={plants.length}
              onMeasurementComplete={(m: any) => {
                setParameters(prev => ({ ...prev, ...m }))
                setMeasurementHistory(prev => [m, ...prev])
                setActiveTab("overview")
              }}
              onCorrectiveAction={() => {}}
            />
          </TabsContent>

          <TabsContent value="tower">
            <div className="bg-card rounded-xl p-4 min-h-[400px]">
               <TowerVisualizer 
                  plants={plants} 
                  onRemovePlant={handleRemovePlant} 
                  onAddPlant={handleAddPlant} 
                />
            </div>
          </TabsContent>

          <TabsContent value="plants">
            <PlantManagement plants={plants} onAddPlant={handleAddPlant} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
