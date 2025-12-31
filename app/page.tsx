"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// IMPORTACIONES
import SetupWizard from "@/components/setup-wizard"
import SystemOverview from "@/components/system-overview"
import MeasurementInput from "@/components/measurement-input"
import TowerVisualizer from "@/components/tower-visualizer"
import PlantManagement from "@/components/plant-management"

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [plants, setPlants] = useState<any[]>([])
  const [parameters, setParameters] = useState({
    pH: 6.0, ec: 1.2, waterTemp: 20, waterVolume: 20, nutrientsA: 100, nutrientsB: 100
  })

  // CARGA DE DATOS
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaruData")
    if (saved) {
      try {
        const d = JSON.parse(saved)
        if (d.isSetupComplete) {
          setIsSetupComplete(true)
          setPlants(Array.isArray(d.plants) ? d.plants : [])
          setParameters(d.parameters || { pH: 6.0, ec: 1.2, waterTemp: 20, waterVolume: 20 })
        }
      } catch (e) { console.error("Error en carga", e) }
    }
  }, [])

  // GUARDADO
  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaruData", JSON.stringify({
        isSetupComplete, plants, parameters
      }))
    }
  }, [isSetupComplete, plants, parameters])

  // Lógica de EC Objetivo: 1.2 para bebés, 1.5 para jóvenes, 1.8 para adultas
  const getRecommendedEC = () => {
    if (plants.length === 0) return 1.2
    return 1.5 // Valor medio por defecto
  }

  // FUNCIONES DE TORRE (Añadir/Quitar)
  const handleAddPlant = (variety: string, level: number) => {
    const newPlant = {
      id: `p-${Date.now()}`,
      variety: variety || "Romana",
      level: Number(level),
      position: plants.filter(p => p.level === Number(level)).length + 1,
      plantedDate: new Date().toISOString(),
      stage: "young"
    }
    setPlants(prev => [...prev, newPlant])
    return true
  }

  const handleRemovePlant = (id: string) => {
    setPlants(prev => prev.filter(p => p.id !== id))
  }

  // PANTALLA DE BIENVENIDA
  if (!isSetupComplete) {
    return (
      <SetupWizard onComplete={(p: any) => {
        setParameters(p)
        setIsSetupComplete(true)
      }} />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-bold text-green-600">
          <Sprout className="w-6 h-6" />
          <span className="text-xl font-black tracking-tighter">HydroCaru</span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] bg-slate-50">
          {parameters.waterVolume}L | EC OBJ: {getRecommendedEC()}
        </Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-6 bg-white border shadow-sm h-14 p-1">
            <TabsTrigger value="overview"><Activity className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="measurements"><Beaker className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="tower"><Layers className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="plants"><Plus className="w-5 h-5" /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <SystemOverview 
              plants={plants} 
              parameters={parameters} 
              recommendedEC={getRecommendedEC()} 
              daysUntilCleaning={14} 
            />
          </TabsContent>

          <TabsContent value="measurements">
            <MeasurementInput
              parameters={parameters}
              setParameters={setParameters}
              recommendedEC={getRecommendedEC()}
              totalPlants={plants.length}
              onMeasurementComplete={(m: any) => {
                setParameters(prev => ({ ...prev, ...m }))
                setActiveTab("overview") // Salta a la receta tras medir
              }}
              onCorrectiveAction={() => {}}
            />
          </TabsContent>

          <TabsContent value="tower">
            <div className="bg-white rounded-3xl p-4 shadow-xl border">
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
