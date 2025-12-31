"use client"

import React from "react"
import { Plus } from "lucide-react"

export default function TowerVisualizer({ plants = [], onAddPlant, onRemovePlant }: any) {
  const levels = [3, 2, 1] // Niveles de la torre
  const positions = [1, 2, 3, 4, 5, 6] // 6 huecos por nivel

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {levels.map((level) => (
        <div key={level} className="relative">
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">
            N{level}
          </div>
          {/* Representación circular simple de la torre */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-slate-100 rounded-full border-4 border-white shadow-inner">
            {positions.map((pos) => {
              const plant = plants.find((p: any) => p.level === level && p.position === pos)
              
              return (
                <div key={pos} className="flex items-center justify-center">
                  {plant ? (
                    <button
                      onClick={() => onRemovePlant(plant.id)}
                      className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in"
                    >
                      <span className="text-[10px] text-white font-bold leading-tight text-center">
                        {plant.variety.substring(0, 3)}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onAddPlant("Romana", level)}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-300 hover:border-green-400 hover:text-green-400 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <div className="w-16 h-20 bg-slate-200 rounded-b-xl mt-[-32px] border-x-4 border-b-4 border-white shadow-md"></div>
    </div>
  )
}
