"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type Plant, type LettuceVariety, lettuceData } from "@/app/page"
import { Sprout, Leaf, FlowerIcon, Plus } from "lucide-react"

interface PlantManagementProps {
  plants: Plant[]
  onAddPlant: (variety: LettuceVariety, level?: number) => boolean
}

export default function PlantManagement({ plants, onAddPlant }: PlantManagementProps) {
  const varieties: LettuceVariety[] = ["Romana", "Iceberg", "Hoja de Roble", "Lollo Rosso", "Trocadero"]

  const getVarietyColor = (variety: LettuceVariety) => {
    const colors = {
      Romana: "from-green-500 to-green-600",
      Iceberg: "from-emerald-400 to-emerald-500",
      "Hoja de Roble": "from-lime-500 to-lime-600",
      "Lollo Rosso": "from-rose-500 to-rose-600",
      Trocadero: "from-teal-500 to-teal-600",
    }
    return colors[variety]
  }

  const handleAddPlant = (variety: LettuceVariety) => {
    const success = onAddPlant(variety)
    if (!success) {
      alert("El nivel 1 está completo. Primero cosecha o mueve plantas para liberar espacio.")
    }
  }

  const getPlantCountByVariety = (variety: LettuceVariety) => {
    return plants.filter((p) => p.variety === variety).length
  }

  const getPlantCountByStage = (stage: Plant["stage"]) => {
    return plants.filter((p) => p.stage === stage).length
  }

  const getPlantsByLevel = (level: number) => {
    return plants.filter((p) => p.level === level)
  }

  const getStageIcon = (stage: Plant["stage"]) => {
    switch (stage) {
      case "young":
        return <Sprout className="w-4 h-4 text-green-600" />
      case "medium":
        return <Leaf className="w-4 h-4 text-lime-600" />
      case "harvest":
        return <FlowerIcon className="w-4 h-4 text-amber-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              Plantas Jóvenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getPlantCountByStage("young")}</div>
            <p className="text-xs text-muted-foreground mt-1">0-50% de crecimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Plantas Medias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getPlantCountByStage("medium")}</div>
            <p className="text-xs text-muted-foreground mt-1">50-100% de crecimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FlowerIcon className="w-4 h-4" />
              Listas para Cosecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getPlantCountByStage("harvest")}</div>
            <p className="text-xs text-muted-foreground mt-1">100% crecimiento completo</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución por Niveles</CardTitle>
          <CardDescription>Vista gráfica de las plantas organizadas por niveles de la torre</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((level) => {
            const levelPlants = getPlantsByLevel(level)
            const emptySlots = 6 - levelPlants.length

            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Nivel {level}</h3>
                  <span className="text-xs text-muted-foreground">{levelPlants.length}/6 plantas</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {levelPlants.map((plant) => (
                    <div
                      key={plant.id}
                      className={`aspect-square rounded-lg bg-gradient-to-br ${getVarietyColor(plant.variety)} p-2 flex flex-col items-center justify-center shadow-md relative`}
                    >
                      <div className="absolute top-1 right-1">{getStageIcon(plant.stage)}</div>
                      <Sprout className="w-6 h-6 text-white" />
                      <span className="text-[8px] text-white font-medium mt-1 text-center leading-tight">
                        {plant.variety}
                      </span>
                    </div>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Añadir Nuevas Plantas</CardTitle>
          <CardDescription>Selecciona la variedad de lechuga para plantar en el Nivel 1</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {varieties.map((variety) => {
              const info = lettuceData[variety]
              const count = getPlantCountByVariety(variety)

              return (
                <Card
                  key={variety}
                  className="p-4 hover:border-primary transition-colors cursor-pointer group"
                  onClick={() => handleAddPlant(variety)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${getVarietyColor(variety)} flex items-center justify-center shrink-0 shadow-md`}
                    >
                      <Sprout className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{variety}</h4>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Cosecha: {info.weeksToHarvest} semanas</p>
                      <p className="text-xs font-medium text-primary mt-1">
                        Actualmente: {count} planta{count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Cultivo Escalonado</CardTitle>
          <CardDescription>Guía para mantener una producción continua de lechugas frescas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Nivel 1 - Plantas Jóvenes</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Añade 6 plantas nuevas cada semana. Comienzan su crecimiento en condiciones óptimas con EC más bajo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Nivel 2 - Crecimiento Medio</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Plantas de 2-4 semanas en fase de crecimiento activo. Requieren más nutrientes (EC más alto).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Nivel 3 - Cosecha</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Plantas de 5-8 semanas listas para cosechar. Cosecha semanal para espacio nuevo.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
            <h4 className="font-semibold text-sm mb-2">Consejo para Castellón (Clima Mediterráneo)</h4>
            <p className="text-xs text-muted-foreground">
              En verano, considera reducir a 12-15 plantas para facilitar el control de temperatura. En invierno,
              aprovecha las condiciones más frescas para cultivo óptimo de lechuga.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
