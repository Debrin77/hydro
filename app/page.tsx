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
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

export interface LettuceInfo {
  name: LettuceVariety
  weeksToHarvest: number
  optimalPH: [number, number]
  optimalEC: [number, number]
  optimalTemp: [number, number]
  description: string
}

export const lettuceData: Record<LettuceVariety, LettuceInfo> = {
  Romana: {
    name: "Romana",
    weeksToHarvest: 6,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Lechuga crujiente de hojas alargadas",
  },
  Iceberg: {
    name: "Iceberg",
    weeksToHarvest: 8,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Lechuga compacta y crujiente",
  },
  "Hoja de Roble": {
    name: "Hoja de Roble",
    weeksToHarvest: 5,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Hojas onduladas y suaves",
  },
  "Lollo Rosso": {
    name: "Lollo Rosso",
    weeksToHarvest: 5,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Lechuga roja de hojas rizadas",
  },
  Trocadero: {
    name: "Trocadero",
    weeksToHarvest: 6,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Lechuga mantecosa de hojas tiernas",
  },
}

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [isFirstSetup, setIsFirstSetup] = useState(false)
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

  useEffect(() => {
    const savedData = localStorage.getItem("hydroponicTowerData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setIsSetupComplete(data.isSetupComplete || false)
      setIsFirstSetup(data.isFirstSetup || false)
      setPlants(
        (data.plants || []).map((p: Plant) => ({
          ...p,
          plantedDate: new Date(p.plantedDate),
        })),
      )
      setParameters(
        data.parameters || {
          pH: 6.0,
          ec: 1.5,
          waterTemp: 20,
          waterVolume: 20,
          nutrientsA: 100,
          nutrientsB: 100,
        },
      )
      setSystemStartDate(data.systemStartDate ? new Date(data.systemStartDate) : null)
      setLastCleaningDate(data.lastCleaningDate ? new Date(data.lastCleaningDate) : null)
      setMeasurementHistory(
        (data.measurementHistory || []).map((m: MeasurementRecord) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      )
      setActionLog(
        (data.actionLog || []).map((a: ActionLog) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        })),
      )
    }
  }, [])

  useEffect(() => {
    if (isSetupComplete) {
      const dataToSave = {
        isSetupComplete,
        isFirstSetup,
        plants,
        parameters,
        systemStartDate,
        lastCleaningDate,
        measurementHistory,
        actionLog,
      }
      localStorage.setItem("hydroponicTowerData", JSON.stringify(dataToSave))
    }
  }, [
    isSetupComplete,
    isFirstSetup,
    plants,
    parameters,
    systemStartDate,
    lastCleaningDate,
    measurementHistory,
    actionLog,
  ])

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPlants((prevPlants) =>
        prevPlants.map((plant) => {
          const weeksPassed = Math.floor((Date.now() - plant.plantedDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
          const info = lettuceData[plant.variety]

          let stage: PlantStage = "young"
          if (weeksPassed >= info.weeksToHarvest) {
            stage = "harvest"
          } else if (weeksPassed >= Math.floor(info.weeksToHarvest / 2)) {
            stage = "medium"
          }

          return { ...plant, weeksSincePlanted: weeksPassed, stage }
        }),
      )
    }, 60000)

    return () => clearInterval(updateInterval)
  }, [])

  const handleSetupComplete = (initialParams: SystemParameters) => {
    setIsSetupComplete(true)
    setIsFirstSetup(true)
    setSystemStartDate(new Date())
    setLastCleaningDate(new Date())
    setParameters(initialParams)

    const log: ActionLog = {
      id: `action-${Date.now()}`,
      timestamp: new Date(),
      type: "cleaning",
      description: "Sistema inicializado - Depósito llenado y limpiado",
      details: initialParams,
    }
    setActionLog([log])
  }

  const addPlant = (variety: LettuceVariety, level = 1) => {
    const levelPlants = plants.filter((p) => p.level === level)
    if (levelPlants.length >= 6) {
      return false
    }

    const usedPositions = levelPlants.map((p) => p.position)
    let position = 1
    for (let i = 1; i <= 6; i++) {
      if (!usedPositions.includes(i)) {
        position = i
        break
      }
    }

    const newPlant: Plant = {
      id: `plant-${Date.now()}-${Math.random()}`,
      variety,
      level,
      position,
      weeksSincePlanted: 0,
      plantedDate: new Date(),
      stage: "young",
    }

    setPlants([...plants, newPlant])

    if (isFirstSetup) {
      setIsFirstSetup(false)
    }

    const log: ActionLog = {
      id: `action-${Date.now()}`,
      timestamp: new Date(),
      type: "planting",
      description: `Plantada ${variety} en Nivel ${level}, Posición ${position}`,
      details: { variety, level, position },
    }
    setActionLog([log, ...actionLog])

    return true
  }

  const removePlant = (plantId: string) => {
    const plant = plants.find((p) => p.id === plantId)
    if (plant) {
      const log: ActionLog = {
        id: `action-${Date.now()}`,
        timestamp: new Date(),
        type: "harvest",
        description: `Cosechada ${plant.variety} del Nivel ${plant.level}`,
        details: { variety: plant.variety, level: plant.level, weeksSincePlanted: plant.weeksSincePlanted },
      }
      setActionLog([log, ...actionLog])
    }

    setPlants(plants.filter((p) => p.id !== plantId))
  }

  const addMeasurement = (measurement: Omit<MeasurementRecord, "id" | "timestamp">) => {
    const record: MeasurementRecord = {
      id: `measurement-${Date.now()}`,
      timestamp: new Date(),
      ...measurement,
    }
    setMeasurementHistory([record, ...measurementHistory])

    const log: ActionLog = {
      id: `action-${Date.now()}`,
      timestamp: new Date(),
      type: "measurement",
      description: `Medición registrada - pH: ${measurement.pH}, EC: ${measurement.ec}, Temp: ${measurement.waterTemp}°C`,
      details: measurement,
    }
    setActionLog([log, ...actionLog])
  }

  const addCorrectiveAction = (action: string, details?: any) => {
    const log: ActionLog = {
      id: `action-${Date.now()}`,
      timestamp: new Date(),
      type: "correction",
      description: action,
      details,
    }
    setActionLog([log, ...actionLog])
  }

  const handleCleaningComplete = () => {
    setLastCleaningDate(new Date())

    const log: ActionLog = {
      id: `action-${Date.now()}`,
      timestamp: new Date(),
      type: "cleaning",
      description: "Limpieza del depósito completada",
    }
    setActionLog([log, ...actionLog])
  }

  const handleClearHistory = () => {
    setIsSetupComplete(false)
    setIsFirstSetup(false)
    setPlants([])
    setParameters({
      pH: 6.0,
      ec: 1.5,
      waterTemp: 20,
      waterVolume: 20,
      nutrientsA: 100,
      nutrientsB: 100,
    })
    setSystemStartDate(null)
    setLastCleaningDate(null)
    setMeasurementHistory([])
    setActionLog([])
    setActiveTab("overview")
    localStorage.removeItem("hydroponicTowerData")
  }

  const calculateRecommendedEC = () => {
    if (plants.length === 0) return 1.5
    const avgAge = plants.reduce((sum, p) => sum + p.weeksSincePlanted, 0) / plants.length
    if (avgAge < 2) return 1.2
    if (avgAge < 4) return 1.5
    return 1.8
  }

  const calculateDaysUntilCleaning = () => {
    if (!lastCleaningDate) return 0
    const totalPlants = plants.length
    let cleaningInterval = 14
    if (totalPlants > 12) cleaningInterval = 7
    else if (totalPlants > 6) cleaningInterval = 10

    const daysSinceLastCleaning = Math.floor((Date.now() - lastCleaningDate.getTime()) / (24 * 60 * 60 * 1000))
    return Math.max(0, cleaningInterval - daysSinceLastCleaning)
  }

  useEffect(() => {
    if (isFirstSetup && plants.length === 0) {
      setActiveTab("tower")
    }
  }, [isFirstSetup, plants.length])

  if (!isSetupComplete) {
    return <SetupWizard onComplete={handleSetupComplete} />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{"HydroCaru"}</h1>
                <p className="text-sm text-muted-foreground">{plants.length} de 18 plantas activas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">
                pH: {parameters.pH.toFixed(1)}
              </Badge>
              <Badge variant="outline" className="hidden sm:flex">
                {parameters.waterVolume}L / 20L
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isFirstSetup && plants.length === 0 && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Sprout className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">¡Sistema listo para comenzar!</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tu depósito está configurado correctamente. Ahora puedes añadir tus primeras plantas haciendo clic
                    en las posiciones vacías de la torre.
                  </p>
                  <p className="text-sm font-medium text-primary">
                    💡 Consejo: Comienza con 3-6 plantas en el Nivel 1 y añade más cada semana para cultivo escalonado.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsFirstSetup(false)} className="shrink-0">
                  ✓ Entendido
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-7 w-full">
            <TabsTrigger value="overview">
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="measurements">
              <Beaker className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Mediciones</span>
            </TabsTrigger>
            <TabsTrigger value="tower">
              <Layers className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Torre</span>
            </TabsTrigger>
            <TabsTrigger value="plants">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Plantas</span>
            </TabsTrigger>
            <TabsTrigger value="pump">
              <Droplets className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Bombeo</span>
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SystemOverview
              plants={plants}
              parameters={parameters}
              recommendedEC={calculateRecommendedEC()}
              daysUntilCleaning={calculateDaysUntilCleaning()}
              recentMeasurements={measurementHistory.slice(0, 5)}
              recentActions={actionLog.slice(0, 5)}
            />
          </TabsContent>

          <TabsContent value="measurements">
            <MeasurementInput
              parameters={parameters}
              setParameters={setParameters}
              recommendedEC={calculateRecommendedEC()}
              totalPlants={plants.length}
              onMeasurementComplete={addMeasurement}
              onCorrectiveAction={addCorrectiveAction}
            />
          </TabsContent>

          <TabsContent value="tower">
            <TowerVisualizer plants={plants} onRemovePlant={removePlant} onAddPlant={addPlant} />
          </TabsContent>

          <TabsContent value="plants">
            <PlantManagement plants={plants} onAddPlant={addPlant} />
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
              onCleaningComplete={handleCleaningComplete}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoryLog
              measurementHistory={measurementHistory}
              actionLog={actionLog}
              plants={plants}
              onClearHistory={handleClearHistory}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
