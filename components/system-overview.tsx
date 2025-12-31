"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Droplets, Activity, Thermometer, FlaskConical, CheckCircle2 } from "lucide-react"
import type { Plant, SystemParameters, MeasurementRecord, ActionLog } from "@/app/page"

interface SystemOverviewProps {
  plants: Plant[]
  parameters: SystemParameters
  recommendedEC: number
  daysUntilCleaning: number
  recentMeasurements: MeasurementRecord[]
  recentActions: ActionLog[]
}

export default function SystemOverview({
  plants,
  parameters,
  recommendedEC,
  daysUntilCleaning,
}: SystemOverviewProps) {
  
  // --- CÁLCULO DE CORRECCIONES EN TIEMPO REAL ---
  const calculateCorrections = () => {
    const vol = parameters.waterVolume;
    const currentPH = parameters.pH;
    const currentEC = parameters.ec;
    
    let phText = null;
    let ecText = null;

    // Lógica pH (Objetivo 6.0)
    if (Math.abs(currentPH - 6.0) > 0.2) {
      const ml = (Math.abs(currentPH - 6.0) / 0.5) * vol * 0.1;
      phText = `Añade ${ml.toFixed(1)} ml de pH ${currentPH > 6.0 ? 'Down (-)' : 'Up (+)'}`;
    }

    // Lógica Hy-Pro A/B (Objetivo según edad plantas)
    if (currentEC < recommendedEC - 0.1) {
      const ecDiff = recommendedEC - currentEC;
      const mlPerPart = (ecDiff / 0.1) * vol * 0.25;
      ecText = `Añade ${mlPerPart.toFixed(1)} ml de Hy-Pro A y ${mlPerPart.toFixed(1)} ml de B`;
    }

    return { phText, ecText };
  };

  const { phText, ecText } = calculateCorrections();

  return (
    <div className="space-y-6">
      {/* PANEL DE ALERTAS Y CORRECCIONES */}
      {(phText || ecText) && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600 flex items-center gap-2 text-sm uppercase font-black">
              <AlertTriangle className="w-5 h-5" /> Atención: Receta de Corrección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ecText && (
              <div className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg shadow-sm">
                <FlaskConical className="w-5 h-5" />
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-80">Nutrientes Hy-Pro A/B</p>
                  <p className="text-sm font-bold">{ecText}</p>
                </div>
              </div>
            )}
            {phText && (
              <div className="flex items-center gap-3 p-3 bg-amber-500 text-white rounded-lg shadow-sm">
                <Activity className="w-5 h-5" />
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-80">Ajuste de pH</p>
                  <p className="text-sm font-bold">{phText}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* RESTO DE TUS GRÁFICAS (pH, EC, etc.) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Aquí va el código que ya tienes de las gráficas de pH y EC... */}
      </div>
    </div>
  )
}
