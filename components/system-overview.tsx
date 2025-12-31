"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Droplets, Activity, Thermometer, FlaskConical, CheckCircle2, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
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
  
  const vol = parameters.waterVolume;
  const currentPH = parameters.pH;
  const currentEC = parameters.ec;

  // --- LÓGICA DE CÁLCULO DE DOSIS ---
  const calculateCorrections = () => {
    let phText = null;
    let ecText = null;

    // Lógica pH (Objetivo 6.0)
    if (Math.abs(currentPH - 6.0) > 0.2) {
      // Hy-Pro/Estándar: 0.1ml/L para mover 0.5 puntos
      const ml = (Math.abs(currentPH - 6.0) / 0.5) * vol * 0.1;
      phText = {
        msg: `Añadir ${ml.toFixed(1)} ml de pH ${currentPH > 6.0 ? 'Down (-)' : 'Up (+)'}`,
        type: currentPH > 6.0 ? 'down' : 'up'
      };
    }

    // Lógica Hy-Pro A/B (Objetivo según edad plantas)
    if (currentEC < recommendedEC - 0.05) {
      const ecDiff = recommendedEC - currentEC;
      // Hy-Pro A/B: 0.25ml/L de cada parte para subir 0.1 EC
      const mlPerPart = (ecDiff / 0.1) * vol * 0.25;
      ecText = `Añadir ${mlPerPart.toFixed(1)} ml de Hy-Pro A + ${mlPerPart.toFixed(1)} ml de B`;
    }

    return { phText, ecText };
  };

  const { phText, ecText } = calculateCorrections();

  // Función para determinar el color de la barra según el rango
  const getStatusColor = (val: number, min: number, max: number) => {
    if (val < min || val > max) return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN 1: RECETA DE CORRECCIÓN (Solo aparece si algo está mal) */}
      {(phText || ecText) && (
        <Card className="border-red-500 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="pb-2 bg-red-50 dark:bg-red-950/20">
            <CardTitle className="text-red-600 flex items-center gap-2 text-sm uppercase font-black tracking-wider">
              <AlertTriangle className="w-5 h-5 animate-pulse" /> Acción Inmediata Requerida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {ecText && (
              <div className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-xl shadow-md">
                <FlaskConical className="w-6 h-6" />
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-80">Dosis Hy-Pro A/B</p>
                  <p className="text-md font-bold leading-tight">{ecText}</p>
                </div>
              </div>
            )}
            {phText && (
              <div className="flex items-center gap-3 p-4 bg-amber-500 text-white rounded-xl shadow-md">
                {phText.type === 'up' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-80">Corrección de pH</p>
                  <p className="text-md font-bold leading-tight">{phText.msg}</p>
                </div>
              </div>
            )}
            <p className="text-[9px] text-center text-muted-foreground italic pt-1">
              * Basado en {vol}L de agua y {plants.length} plantas activas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* SECCIÓN 2: ESTADO ACTUAL (GRÁFICAS VISUALES) */}
      <div className="grid gap-4 md:grid-cols-2">
        
        {/* Card pH */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> pH del Agua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{currentPH.toFixed(1)}</div>
            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-1000 ${getStatusColor(currentPH, 5.5, 6.5)}`}
                style={{ width: `${(currentPH / 14) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
              <span>CRÍTICO</span>
              <span className="text-primary text-xs">ÓPTIMO: 5.5 - 6.5</span>
              <span>ALCALINO</span>
            </div>
          </CardContent>
        </Card>

        {/* Card EC */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" /> Conductividad (EC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{currentEC.toFixed(1)} <span className="text-xs text-muted-foreground">mS/cm</span></div>
            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-1000 ${getStatusColor(currentEC, recommendedEC - 0.2, recommendedEC + 0.3)}`}
                style={{ width: `${(currentEC / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
              <span>BAJA</span>
              <span className="text-blue-500 text-xs">OBJETIVO: {recommendedEC.toFixed(1)}</span>
              <span>ALTA</span>
            </div>
          </CardContent>
        </Card>

        {/* Card Temperatura */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-red-500" /> Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{parameters.waterTemp}º <span className="text-xs text-muted-foreground text-red-500">C</span></div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {parameters.waterTemp > 25 ? "⚠️ Agua caliente: Riesgo de falta de oxígeno" : "✓ Temperatura ideal para raíces"}
            </p>
          </CardContent>
        </Card>

        {/* Card Mantenimiento */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Limpieza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{daysUntilCleaning} <span className="text-xs text-muted-foreground font-normal">días</span></div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-tight text-green-600">
              Próximo mantenimiento general
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
