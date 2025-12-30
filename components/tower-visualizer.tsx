"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Plant, type LettuceVariety, lettuceData } from "@/app/page"
import { Sprout, Leaf, FlowerIcon, X, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TowerVisualizerProps {
  plants: Plant[]
  onRemovePlant: (plantId: string) => void
  onAddPlant?: (variety: LettuceVariety, level: number) => boolean
}

export default function TowerVisualizer({ plants, onRemovePlant, onAddPlant }: TowerVisualizerProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getLevelPlants = (level: number) => {
    return plants.filter((p) => p.level === level).sort((a, b) => a.position - b.position)
  }

  const getPlantIcon = (stage: Plant["stage"]) => {
    switch (stage) {
      case "young":
        return <Sprout className="text-white w-[30px] h-[30px]" />
      case "medium":
        return <Leaf className="w-4 h-4 text-white" />
      case "harvest":
        return <FlowerIcon className="w-4 h-4 text-white" />
    }
  }

  const getPlantColor = (variety: Plant["variety"], stage: Plant["stage"]) => {
    const baseColors = {
      Romana: "from-green-400 to-green-600",
      Iceberg: "from-emerald-300 to-emerald-500",
      "Hoja de Roble": "from-lime-400 to-lime-600",
      "Lollo Rosso": "from-rose-400 to-rose-600",
      Trocadero: "from-teal-400 to-teal-600",
    }

    const harvestColors = {
      Romana: "from-green-600 to-green-800",
      Iceberg: "from-emerald-500 to-emerald-700",
      "Hoja de Roble": "from-lime-600 to-lime-800",
      "Lollo Rosso": "from-rose-600 to-rose-800",
      Trocadero: "from-teal-600 to-teal-800",
    }

    return stage === "harvest" ? harvestColors[variety] : baseColors[variety]
  }

  const getStageBadge = (stage: Plant["stage"]) => {
    switch (stage) {
      case "young":
        return (
          <Badge variant="secondary" className="text-[10px] px-1 py-0">
            Joven
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="text-[10px] px-1 py-0">
            Media
          </Badge>
        )
      case "harvest":
        return (
          <Badge variant="default" className="text-[10px] px-1 py-0 bg-green-600">
            Cosecha
          </Badge>
        )
    }
  }

  const handleAddPlantClick = (level: number) => {
    const levelPlants = getLevelPlants(level)
    if (levelPlants.length >= 6) {
      alert(`El Nivel ${level} está completo (6/6 plantas). Primero cosecha plantas para liberar espacio.`)
      return
    }
    setSelectedLevel(level)
    setIsDialogOpen(true)
  }

  const handleVarietySelect = (variety: LettuceVariety) => {
    if (selectedLevel && onAddPlant) {
      const success = onAddPlant(variety, selectedLevel)
      if (success) {
        setIsDialogOpen(false)
        setSelectedLevel(null)
      } else {
        alert(`El Nivel ${selectedLevel} está completo (6/6 plantas). Primero cosecha plantas para liberar espacio.`)
      }
    }
  }

  const renderLevel = (level: number) => {
    const levelPlants = getLevelPlants(level)
    const positions = Array.from({ length: 6 }, (_, i) => i + 1)

    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Nivel {level}</CardTitle>
              <CardDescription>{levelPlants.length} de 6 posiciones ocupadas</CardDescription>
            </div>
            <Badge variant="outline">{level === 1 ? "Superior" : level === 2 ? "Medio" : "Inferior"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-2">
            {positions.map((pos) => {
              const plant = levelPlants.find((p) => p.position === pos)

              if (plant) {
                const info = lettuceData[plant.variety]
                const progress = (plant.weeksSincePlanted / info.weeksToHarvest) * 100

                return (
                  <div
                    key={pos}
                    className={`relative aspect-square border rounded-lg p-2 flex flex-col items-center justify-center gap-1.5 ${
                      plant.stage === "harvest" ? "border-green-500 bg-green-500/10 shadow-lg" : "border-border bg-card"
                    }`}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-0.5 right-0.5 h-5 w-5"
                      onClick={() => onRemovePlant(plant.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <div
                      className={`rounded-full bg-gradient-to-br w-[50px] h-[50px] ${getPlantColor(plant.variety, plant.stage)} flex items-center justify-center shadow-md`}
                    >
                      {getPlantIcon(plant.stage)}
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-medium">{plant.variety}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {plant.weeksSincePlanted}s / {info.weeksToHarvest}s
                      </p>
                    </div>

                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${plant.stage === "harvest" ? "bg-green-500" : "bg-primary"}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    {getStageBadge(plant.stage)}
                  </div>
                )
              }

              return (
                <button
                  key={pos}
                  onClick={() => onAddPlant && handleAddPlantClick(level)}
                  className="aspect-square border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors mt-1">
                    Añadir
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visualización de la Torre Hidropónica</CardTitle>
          <CardDescription>
            {onAddPlant
              ? "Haz clic en las posiciones vacías para añadir plantas"
              : "Vista completa de los 3 niveles con indicadores de etapa de crecimiento"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h4 className="text-sm font-semibold">Etapas:</h4>
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-green-500" />
                <span className="text-xs">Joven (0-50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <span className="text-xs">Media (50-100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <FlowerIcon className="w-4 h-4 text-green-700" />
                <span className="text-xs">Cosecha (100%)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap pt-2 border-t">
              <h4 className="text-sm font-semibold">Variedades:</h4>
              {Object.keys(lettuceData).map((variety) => (
                <div key={variety} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded bg-gradient-to-br ${getPlantColor(variety as Plant["variety"], "medium")}`}
                  />
                  <span className="text-xs">{variety}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {renderLevel(1)}
        {renderLevel(2)}
        {renderLevel(3)}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Variedad de Lechuga</DialogTitle>
            <DialogDescription>Elige la variedad que deseas plantar en el Nivel {selectedLevel}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            {(Object.keys(lettuceData) as LettuceVariety[]).map((variety) => {
              const info = lettuceData[variety]
              const plantCount = plants.filter((p) => p.variety === variety).length

              return (
                <button
                  key={variety}
                  onClick={() => handleVarietySelect(variety)}
                  className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${getPlantColor(variety, "young")} flex items-center justify-center shrink-0 shadow-md`}
                  >
                    <Sprout className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{variety}</h4>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Cosecha en {info.weeksToHarvest} semanas</p>
                    {plantCount > 0 && (
                      <p className="text-xs font-medium text-primary mt-1">
                        Ya tienes {plantCount} planta{plantCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
