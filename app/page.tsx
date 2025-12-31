"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Calendar, History, Plus, Droplets, AlertTriangle } from "lucide-react"
import SetupWizard from "@/components/setup-wizard"
import TowerVisualizer from "@/components/tower-visualizer"
import MeasurementInput from "@/components/measurement-input"
import MaintenanceCalendar from "@/components/maintenance-calendar"
import HistoryLog from "@/components/history-log"
import PlantManagement from "@/components/plant-management"
import SystemOverview from "@/components/system-overview"
import PumpControl from "@/components/pump-control"
import { Badge } from "@/components/ui/badge"

// --- TIPOS E INTERFACES ---
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
  correctiveActions?: string[]
}

export interface ActionLog {
  id: string
  timestamp: Date
  type: "measurement" | "planting" | "harvest" | "cleaning" | "correction" | "nutrient_add"
  description: string
  details?: any
}

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [plants, setPlants] = useState<Plant[]>([])
  const [parameters, setParameters] = useState<SystemParameters>({
    pH: 6.0,
    ec: 1.5,
    waterTemp: 20,
    waterVolume: 20,
    nutrientsA: 100,
    nutrientsB: 100,
  })
  const [systemStartDate, setSystemStartDate] = useState<Date | null>(null)
  const [lastCleaningDate, setLastCleaningDate] = useState<Date | null>(null)
  const [measurementHistory, setMeasurementHistory] = useState<MeasurementRecord[]>([])
  const [actionLog, setActionLog] = useState<ActionLog[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  // --- PERSISTENCIA DE DATOS (LocalStorage) ---
  useEffect(() => {
    const savedData = localStorage.getItem("hydroponicTowerData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setIsSetupComplete(data.isSetupComplete || false)
      setPlants((data.plants || []).map((p: any) => ({ ...p, plantedDate: new Date(p.plantedDate) })))
      setParameters(data.parameters || parameters)
      setSystemStartDate(data.systemStartDate ? new Date(data.systemStartDate) : null)
      setLastCleaningDate(data.lastCleaningDate ? new Date(data.lastCleaningDate) : null)
      setMeasurementHistory((data.measurementHistory || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
      setActionLog((data.actionLog || []).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })))
    }
  }, [])

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroponicTowerData", JSON.stringify({
        isSetupComplete, plants, parameters, systemStartDate, lastCleaningDate, measurementHistory, actionLog
      }))
    }
  }, [isSetupComplete, plants, parameters, systemStartDate, lastCleaningDate, measurementHistory, actionLog])

  // --- LÓGICA DE CULTIVO PROFESIONAL ---

  // Cálculo de EC Recomendada según edad de las plantas (Protección para plántulas)
  const calculateRecommendedEC = () => {
    if (plants.length === 0) return 1.2; // Valor base seguro
    const avgWeeks = plants.reduce((sum, p) => sum + p.weeksSincePlanted, 0) / plants.length;
    
    if (avgWeeks < 2) return 1.2;      // Plántulas (EC suave)
    if (avgWeeks < 4) return 1.5;      // Crecimiento vegetativo
    return 1.8;                        // Plantas adultas (EC Hy-Pro estándar)
  };

  const calculateDaysUntilCleaning = () => {
    if (!lastCleaningDate) return 0;
    const daysSince = Math.floor((Date.now() - lastCleaningDate.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, 14 - daysSince);
  };

  // --- MANEJADORES DE EVENTOS ---
  const handleSetupComplete = (p: SystemParameters) => {
    setIsSetupComplete(true);
    setSystemStartDate(new Date());
    setLastCleaningDate(new Date());
    setParameters(p);
  }

  const addMeasurement = (m: Omit<MeasurementRecord, "id" | "timestamp">) => {
    const record: MeasurementRecord = { ...m, id: Date.now().toString(), timestamp: new Date() };
    setMeasurementHistory([record, ...measurementHistory]);
    // Actualizar parámetros globales para que el Resumen se actualice
    setParameters({ ...parameters, pH: m.pH, ec: m.ec, waterTemp: m.waterTemp, waterVolume: m.waterVolume });
  }

  if (!isSetupComplete) {
    return <SetupWizard onComplete={handleSetupComplete} />
  }

  return (
    <div className="min-h-screen bg-background pb-10 font-sans">
      <header className="border-b bg-card p-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sprout className="text-primary w-6 h-6" />
            <h1 className="font-bold text-xl tracking-tight text-primary">HydroCaru</h1>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="font-mono">EC Obj: {calculateRecommendedEC()}</Badge>
            <Badge variant="outline">H2O: {parameters.waterVolume}L</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full h-12 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background"><Activity className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Resumen</span></TabsTrigger>
            <TabsTrigger value="measurements" className="data-[state=active]:bg-background"><Beaker className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Medir</span></TabsTrigger>
            <TabsTrigger value="tower" className="data-[state=active]:bg-background"><Layers className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Torre</span></TabsTrigger>
            <TabsTrigger value="plants" className="data-[state=active]:bg-background"><Plus className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Plantas</span></TabsTrigger>
            <TabsTrigger value="pump" className="data-[state=active]:bg-background"><Droplets className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-background"><Calendar className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-background"><History className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          {/* REEMPLAZO TABSCONTENT OVERVIEW */}
          <TabsContent value="overview">
            <SystemOverview
              plants={plants}
              parameters={parameters}
              recommendedEC={calculateRecommendedEC()}
              daysUntilCleaning={calculateDaysUntilCleaning()}
            />
          </TabsContent>

          <TabsContent value="measurements">
            <MeasurementInput
              parameters={parameters}
              setParameters={setParameters}
              recommendedEC={calculateRecommendedEC()}
              totalPlants={plants.length}
              onMeasurementComplete={addMeasurement}
              onCorrectiveAction={(action) => console.log(action)}
            />
          </TabsContent>

          <TabsContent value="tower">
            <TowerVisualizer 
              plants={plants} 
              onRemovePlant={(id) => setPlants(plants.filter(p => p.id !== id))} 
              onAddPlant={(variety, level) => {
                const newPlant: Plant = {
                  id: Date.now().toString(),
                  variety,
                  level,
                  position: 1,
                  weeksSincePlanted: 0,
                  plantedDate: new Date(),
                  stage: "young"
                };
                setPlants([...plants, newPlant]);
                return true;
              }} 
            />
          </TabsContent>

          <TabsContent value="plants">
             <PlantManagement 
               plants={plants} 
               onAddPlant={(variety, level) => {
                 const newPlant: Plant = {
                   id: Date.now().toString(),
                   variety,
                   level,
                   position: 1,
                   weeksSincePlanted: 0,
                   plantedDate: new Date(),
                   stage: "young"
                 };
                 setPlants([...plants, newPlant]);
               }} 
             />
          </TabsContent>

          <TabsContent value="pump">
            <PumpControl
              plantCount={plants.length}
              reservoirVolume={parameters.waterVolume}
              waterTemperature={parameters.waterTemp}
              hasHeater={true}
            />
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
              actionLog={actionLog}
              plants={plants}
              onClearHistory={() => setIsSetupComplete(false)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
