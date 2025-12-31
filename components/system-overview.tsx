"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Droplets, Activity, FlaskConical } from "lucide-react"

export default function SystemOverview({ plants = [], parameters, recommendedEC }: any) {
  const vol = parameters?.waterVolume || 20
  const ph = parameters?.pH || 6.0
  const ec = parameters?.ec || 1.2

  // Cálculo de dosis Hy-Pro A/B
  const needsEC = ec < (recommendedEC - 0.1)
  const ecDiff = recommendedEC - ec
  const mlAB = (ecDiff / 0.1) * vol * 0.25

  return (
    <div className="space-y-4">
      {needsEC && (
        <Card className="border-2 border-blue-500 bg-blue-50 shadow-lg">
          <CardHeader className="py-3">
            <CardTitle className="text-blue-700 text-sm font-black flex items-center gap-2">
              <FlaskConical className="w-5 h-5" /> RECETA HY-PRO A/B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-blue-900">
              {mlAB.toFixed(1)} ml <span className="text-sm font-normal">de cada parte (A y B)</span>
            </p>
            <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">Para subir de {ec} a {recommendedEC} en {vol}L</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col items-center">
          <Activity className={`w-6 h-6 mb-2 ${ph < 5.5 || ph > 6.5 ? 'text-red-500' : 'text-green-500'}`} />
          <span className="text-2xl font-black">{ph.toFixed(1)}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">pH Agua</span>
        </Card>
        <Card className="p-4 flex flex-col items-center">
          <Droplets className={`w-6 h-6 mb-2 ${needsEC ? 'text-blue-500' : 'text-green-500'}`} />
          <span className="text-2xl font-black">{ec.toFixed(1)}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">EC mS/cm</span>
        </Card>
      </div>
    </div>
  )
}
