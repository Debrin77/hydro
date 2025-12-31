"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Importaciones con nombres exactos de tus archivos
import SetupWizard from "@/components/setup-wizard"
import SystemOverview from "@/components/system-overview"
import MeasurementInput from "@/components/measurement-input"
import TowerVisualizer from "@/components/tower-visualizer"
import PlantManagement from "@/components/plant-management"

// --- TIPOS BÁSICOS ---
export type LettuceVariety = "Romana" | "Iceberg" | "Hoja de Roble" | "Lollo Rosso" | "Trocadero"

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [plants, setPlants] = useState<any[]>([])
  const [parameters, setParameters] = useState({
    pH: 6.0, ec: 1.2, waterTemp: 20, waterVolume: 20, nutrientsA: 100, nutrientsB: 100
  })

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaruData")
    if (saved) {
      try {
        const d = JSON.parse(saved)
        if (d.isSetupComplete) {
          setIsSetupComplete(true)
          setPlants(d.plants || [])
          setParameters(d.parameters || parameters)
        }
      } catch (e) { console.error("Error cargando datos", e) }
    }
  }, [])

  // --- GUARDADO ---
  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaruData", JSON.stringify({
        isSetupComplete, plants, parameters
      }))
    }
  }, [isSetupComplete, plants, parameters])

  // Lógica de EC Recomendada
  const recommendedEC = plants.length === 0 ? 1.2 : 1.5

  // --- FUNCIONES DE ACCIÓN ---
  const handleAddPlant = (variety: LettuceVariety, level: number) => {
    const newPlant = {
      id: `p-${Date.now()}`,
      variety,
      level: Number(level),
      position: plants.filter(p => p.level === Number(level)).length + 1,
      weeksSincePlanted: 0,
      plantedDate: new Date().toISOString(),
      stage: "young"
    }
    setPlants([...plants, newPlant])
    return true
  }

  const handleRemovePlant = (id: string) => {
    setPlants(plants.filter(p => p.id !== id))
  }

  // PANTALLA INICIAL (Si no hay configuración)
  if (!isSetupComplete) {
    return <SetupWizard onComplete={(p: any) => { setParameters(p); setIsSetupComplete(true); }} />
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* CABECERA */}
      <header className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-bold text-green-600">
          <Sprout className="w-6 h-6" />
          <span className="text-xl tracking-tight">HydroCaru</span>
        </div>
        <Badge variant="secondary" className="font-mono">
          {parameters.waterVolume}L | Obj: {recommendedEC}
        </Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* MENÚ DE ICONOS */}
          <TabsList className="grid grid-cols-4 w-full mb-8 bg-white border shadow-sm h-14">
            <TabsTrigger value="overview"><Activity className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="measurements"><Beaker className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="tower"><Layers className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="plants"><Plus className="w-5 h-5" /></TabsTrigger>
          </TabsList>

          {/* CONTENIDOS */}
          <TabsContent value="overview">
            <SystemOverview 
              plants={plants} 
              parameters={parameters} 
              recommendedEC={recommendedEC} 
              daysUntilCleaning={14} 
            />
          </TabsContent>

          <TabsContent value="measurements">
            <MeasurementInput
              parameters={parameters}
              setParameters={setParameters}
              recommendedEC={recommendedEC}
              totalPlants={plants.length}
              onMeasurementComplete={(m: any) => {
                setParameters({ ...parameters, ...m })
                setActiveTab("overview")
              }}
              onCorrectiveAction={() => {}}
            />
          </TabsContent>

          <TabsContent value="tower">
            <div className="bg-white rounded-3xl p-6 shadow-xl border min-h-[500px]">
              <h2 className="text-center font-bold mb-4 text-slate-400 uppercase text-xs">Vista de la Torre</h2>
              <TowerVisualizer 
                plants={plants} 
                onRemovePlant={handleRemovePlant} 
                onAddPlant={handleAddPlant} 
              />
            </div>
          </TabsContent>

          <TabsContent value="plants">
            <PlantManagement 
              plants={plants} 
              onAddPlant={handleAddPlant} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
