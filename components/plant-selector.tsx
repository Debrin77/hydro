"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type LettuceVariety, lettuceData } from "@/app/page"
import { Sprout, Plus } from "lucide-react"

interface PlantSelectorProps {
  onSelectPlant: (variety: LettuceVariety) => void
}

export default function PlantSelector({ onSelectPlant }: PlantSelectorProps) {
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

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {varieties.map((variety) => {
        const info = lettuceData[variety]
        return (
          <Card
            key={variety}
            className="p-4 hover:border-primary transition-colors cursor-pointer group"
            onClick={() => onSelectPlant(variety)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${getVarietyColor(variety)} flex items-center justify-center shrink-0`}
              >
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{variety}</h4>
                <p className="text-xs text-muted-foreground">{info.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Cosecha: {info.weeksToHarvest} semanas</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
