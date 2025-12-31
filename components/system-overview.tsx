"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Droplets, Activity, Thermometer, FlaskConical, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import type { Plant, SystemParameters } from "@/app/page"

interface SystemOverviewProps {
  plants: Plant[]
  parameters: SystemParameters
  recommendedEC: number
  daysUntilCleaning: number
}

export default function SystemOverview({
  plants,
  parameters,
  recommendedEC,
  daysUntilCleaning,
}: SystemOverviewProps) {
  
  // Variables simplificadas para asegurar el renderizado
  const vol = parameters.waterVolume || 20; // Si no hay valor, asume 20L por defecto
  const currentPH = parameters.pH;
  const currentEC = parameters.ec;

  // --- CÁLCULO DE DOSIS DIRECTO ---
  let phCorrection = null;
  let ecCorrection = null;

  // Lógica pH (Si el pH es menor a 5.8 o mayor a 6.2)
  if (currentPH < 5.8 || currentPH > 6.2) {
    const diff = Math.abs(currentPH - 6.0);
    const ml = (diff / 0.5) * vol * 0.1;
    phCorrection = {
      ml: ml.toFixed(1),
      type: currentPH > 6.0 ? 'pH Down (-)' : 'pH Up (+)',
      isUp: currentPH < 6.0
    };
  }

  // Lógica Hy-Pro A/B (Si la EC es menor al objetivo)
  if (currentEC < recommendedEC) {
    const ecDiff = recommendedEC - currentEC;
    // Fórmula Hy-Pro: 0.25ml por cada 0.1 de EC por litro
    const mlAB = (ecDiff / 0.1) * vol * 0.25;
    ecCorrection = mlAB.toFixed(1);
  }

  return (
    <div className="space-y-6">
      
      {/* PANEL DE DOSIS EXACTAS (FORZADO) */}
      {(phCorrection || ecCorrection) ? (
        <Card className="border-2 border-red-500 bg-white dark:bg-slate-950 shadow-xl">
          <CardHeader className="bg-red-500 py-2">
            <CardTitle className="text-white text-xs uppercase font-black flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Receta de Ajuste Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            
            {ecCorrection && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="bg-blue-600 p-2 rounded-lg">
                   <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-800 uppercase">Añadir Hy-Pro A/B</p>
                  <p className="text-lg font-black text-blue-900">
                    {ecCorrection} ml <span className="text-sm font-normal">de A y de B</span>
                  </p>
                </div>
              </div>
            )}

            {phCorrection && (
              <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="bg-amber-500 p-2 rounded-lg">
                   {phCorrection.isUp ? <ArrowUpCircle className="w-6 h-6 text-white" /> : <ArrowDownCircle className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Ajustar pH</p>
                  <p className="text-lg font-black text-amber-900">
                    {phCorrection.ml} ml <span className="text-sm font-normal">de {phCorrection.type}</span>
                  </p>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-slate-500 text-center italic">
              Cálculo para {vol}L de agua y objetivo EC {recommendedEC.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-full">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <p className="text-green-800 font-bold text-sm">El agua está en niveles perfectos.</p>
        </div>
      )}

      {/* GRÁFICAS INFERIORES */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold opacity-70">pH</span>
              <span className="text-2xl font-black">{currentPH.toFixed(1)}</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full ${currentPH < 5.5 || currentPH > 6.5 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${(currentPH / 14) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold opacity-70">EC</span>
              <span className="text-2xl font-black">{currentEC.toFixed(1)}</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full ${currentEC < recommendedEC ? 'bg-blue-500' : 'bg-green-500'}`}
                style={{ width: `${(currentEC / 3) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
