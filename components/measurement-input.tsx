"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Beaker, Thermometer, Droplets, Activity, AlertCircle, Info, CheckCircle2, FlaskConical, ShieldAlert } from "lucide-react"
import type { SystemParameters, MeasurementRecord } from "@/app/page"

interface MeasurementInputProps {
  parameters: SystemParameters
  setParameters: (params: SystemParameters) => void
  recommendedEC: number
  totalPlants: number
  onMeasurementComplete: (measurement: Omit<MeasurementRecord, "id" | "timestamp">) => void
  onCorrectiveAction: (action: string, details?: any) => void
}

export default function MeasurementInput({
  parameters,
  setParameters,
  recommendedEC,
  totalPlants,
  onMeasurementComplete,
  onCorrectiveAction,
}: MeasurementInputProps) {
  const [formValues, setFormValues] = useState({
    pH: parameters.pH.toString(),
    ec: parameters.ec.toString(),
    waterTemp: parameters.waterTemp.toString(),
    waterVolume: parameters.waterVolume.toString(),
  })

  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (key: string, value: string) => {
    if (/^[0-9]*[.,]?[0-9]*$/.test(value) || value === "") {
      setFormValues({ ...formValues, [key]: value })
    }
  }

  const getNum = (val: string) => parseFloat(val.replace(',', '.')) || 0

  // --- LÓGICA DE DOSIFICACIÓN PROFESIONAL HY-PRO ---

  // 1. Cálculo de pH (Ajuste suave para evitar estrés)
  const calculatePHCorrection = () => {
    const currentPH = getNum(formValues.pH)
    const currentVol = getNum(formValues.waterVolume)
    const targetPH = 6.0
    if (currentPH === 0 || currentVol === 0 || Math.abs(currentPH - targetPH) < 0.2) return null

    // Dosis de seguridad Hy-Pro: 0.1ml por litro para corregir 0.5 puntos
    const dosage = (Math.abs(currentPH - targetPH) / 0.5) * currentVol * 0.1
    return {
      type: currentPH > targetPH ? "pH- (Down)" : "pH+ (Up)",
      ml: Math.round(dosage * 10) / 10,
      action: currentPH > targetPH ? "bajar" : "subir"
    }
  }

  // 2. Cálculo de Nutrientes Hy-Pro A/B (Equilibrio plántula/adulta)
  const calculateHyProCorrection = () => {
    const currentEC = getNum(formValues.ec)
    const currentVol = getNum(formValues.waterVolume)
    
    // Si la EC actual ya es igual o superior a la recomendada por la app, no añadir más
    if (currentEC === 0 || currentVol === 0 || currentEC >= recommendedEC - 0.1) return null

    const ecDiff = recommendedEC - currentEC
    
    // Hy-Pro A/B Concentración: Aprox 0.25ml de cada parte (A y B) sube 0.1 EC por cada litro
    const dosagePerPart = (ecDiff / 0.1) * currentVol * 0.25
    
    return Math.round(dosagePerPart * 10) / 10
  }

  const handleSave = () => {
    const newParams: SystemParameters = {
      pH: getNum(formValues.pH),
      ec: getNum(formValues.ec),
      waterTemp: getNum(formValues.waterTemp),
      waterVolume: getNum(formValues.waterVolume),
      nutrientsA: parameters.nutrientsA,
      nutrientsB: parameters.nutrientsB,
    }
    const inRange = newParams.pH >= 5.5 && newParams.pH <= 6.5 && newParams.ec >= recommendedEC - 0.2
    setParameters(newParams)
    onMeasurementComplete({ ...newParams, inRange })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const phCorr = calculatePHCorrection()
  const hyproCorr = calculateHyProCorrection()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-primary/5 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Beaker className="w-5 h-5" /> Laboratorio de Control
          </CardTitle>
          <CardDescription>Introduce los valores medidos en tu torre</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">pH Actual</Label>
              <Input type="text" inputMode="decimal" value={formValues.pH} onChange={(e) => handleInputChange("pH", e.target.value)} className="text-lg font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">EC Medida (mS)</Label>
              <Input type="text" inputMode="decimal" value={formValues.ec} onChange={(e) => handleInputChange("ec", e.target.value)} className="text-lg font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Agua ºC</Label>
              <Input type="text" inputMode="decimal" value={formValues.waterTemp} onChange={(e) => handleInputChange("waterTemp", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Litros Reales</Label>
              <Input type="text" inputMode="decimal" value={formValues.waterVolume} onChange={(e) => handleInputChange("waterVolume", e.target.value)} />
            </div>
          </div>
          <Button className="w-full h-12 text-lg font-bold shadow-md" onClick={handleSave}>Analizar y Guardar</Button>
          {showSuccess && <p className="text-green-600 text-center text-sm font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> ¡Valores sincronizados con HydroCaru!
          </p>}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <CardHeader className="pb-2 bg-primary/10 border-b">
            <CardTitle className="text-sm flex items-center justify-center gap-2 uppercase tracking-tighter">
              <FlaskConical className="w-4 h-4" /> Receta Hy-Pro A/B {totalPlants > 0 ? `(${totalPlants} plantas)` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            
            {/* PANEL NUTRIENTES */}
            {hyproCorr ? (
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-inner border-b-4 border-blue-900">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Ajuste de EC</span>
                  <Droplets className="w-5 h-5 animate-pulse" />
                </div>
                <p className="text-xs opacity-90 italic">Objetivo seguro: {recommendedEC.toFixed(1)} mS/cm</p>
                <div className="text-3xl font-black mt-2">
                  {hyproCorr} ml <span className="text-xs font-normal">de Hy-Pro A + {hyproCorr} ml de B</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <p className="font-bold text-sm">Nutrición en Rango Óptimo</p>
                  <p className="text-[10px]">Las plántulas y adultas están seguras.</p>
                </div>
              </div>
            )}

            {/* PANEL PH */}
            {phCorr ? (
              <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-xl shadow-inner border-b-4 border-amber-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Corrección de pH</span>
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-xs opacity-90 italic">Para llegar al valor ideal 6.0</p>
                <div className="text-3xl font-black mt-2">
                  {phCorr.ml} ml <span className="text-xs font-normal text-white/80">de {phCorr.type}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                <CheckCircle2 className="w-6 h-6" />
                <p className="font-bold text-sm">pH Perfecto (6.0)</p>
              </div>
            )}

            {/* NOTAS DE SEGURIDAD */}
            <div className="mt-2 p-3 bg-white/40 dark:bg-black/20 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2 mb-1 text-primary font-bold text-[10px] uppercase">
                <ShieldAlert className="w-3 h-3" /> Protocolo de Mezcla
              </div>
              <ul className="text-[10px] text-muted-foreground list-disc list-inside space-y-1">
                <li>Nunca mezcles el bote A y B directamente; echa primero el A al agua.</li>
                <li>Agita bien el depósito antes de medir la EC final.</li>
                <li>Corrige el pH **solo después** de haber añadido los nutrientes.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
