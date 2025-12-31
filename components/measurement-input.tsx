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
    // Aceptamos números con punto o coma
    if (/^[0-9]*[.,]?[0-9]*$/.test(value) || value === "") {
      setFormValues({ ...formValues, [key]: value })
    }
  }

  const getNum = (val: string) => {
    if (!val) return 0
    return parseFloat(val.replace(',', '.')) || 0
  }

  // --- LÓGICA DE CÁLCULO DE DOSIS ---

  const currentPH = getNum(formValues.pH)
  const currentEC = getNum(formValues.ec)
  const currentVol = getNum(formValues.waterVolume)

  // 1. Cálculo de pH
  const getPHCorrection = () => {
    const targetPH = 6.0
    if (currentPH <= 0 || currentVol <= 0) return null
    
    const diff = Math.abs(currentPH - targetPH)
    if (diff < 0.2) return null // Rango de seguridad: no corregir si es mínimo

    // Hy-Pro: ~0.1ml por litro para mover 0.5 puntos
    const ml = (diff / 0.5) * currentVol * 0.1
    return {
      ml: Math.round(ml * 10) / 10,
      type: currentPH > targetPH ? "pH- (Down)" : "pH+ (Up)",
      action: currentPH > targetPH ? "bajar" : "subir"
    }
  }

  // 2. Cálculo de Hy-Pro A/B
  const getNutrientCorrection = () => {
    if (currentEC <= 0 || currentVol <= 0) return null
    if (currentEC >= recommendedEC - 0.05) return null // Ya está en rango

    const ecDiff = recommendedEC - currentEC
    // Hy-Pro A/B: 0.25ml/L de cada parte para subir 0.1 de EC
    const mlPerPart = (ecDiff / 0.1) * currentVol * 0.25
    return Math.round(mlPerPart * 10) / 10
  }

  const phCorr = getPHCorrection()
  const nutCorr = getNutrientCorrection()

  const handleSave = () => {
    const newParams: SystemParameters = {
      pH: currentPH,
      ec: currentEC,
      waterTemp: getNum(formValues.waterTemp),
      waterVolume: currentVol,
      nutrientsA: parameters.nutrientsA,
      nutrientsB: parameters.nutrientsB,
    }
    const inRange = newParams.pH >= 5.5 && newParams.pH <= 6.5 && newParams.ec >= recommendedEC - 0.2
    setParameters(newParams)
    onMeasurementComplete({ ...newParams, inRange })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Beaker className="w-5 h-5" /> Registro de Medida
          </CardTitle>
          <CardDescription>Introduce los valores medidos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">pH</Label>
              <Input type="text" inputMode="decimal" value={formValues.pH} onChange={(e) => handleInputChange("pH", e.target.value)} placeholder="Ej: 7.2" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">EC (mS)</Label>
              <Input type="text" inputMode="decimal" value={formValues.ec} onChange={(e) => handleInputChange("ec", e.target.value)} placeholder="Ej: 0.8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-xs">Temp ºC</Label>
              <Input type="text" inputMode="decimal" value={formValues.waterTemp} onChange={(e) => handleInputChange("waterTemp", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs">Litros Agua</Label>
              <Input type="text" inputMode="decimal" value={formValues.waterVolume} onChange={(e) => handleInputChange("waterVolume", e.target.value)} />
            </div>
          </div>
          <Button className="w-full h-12 font-bold" onClick={handleSave}>Calcular Receta</Button>
          {showSuccess && <p className="text-green-600 text-center text-xs animate-bounce">✓ Guardado</p>}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 bg-primary/10">
            <CardTitle className="text-sm flex items-center justify-center gap-2 uppercase">
              <FlaskConical className="w-4 h-4" /> Receta de Corrección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            
            {/* PANEL NUTRIENTES HY-PRO */}
            {nutCorr && nutCorr > 0 ? (
              <div className="p-4 bg-blue-600 text-white rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase">Ajustar Nutrientes</span>
                  <Droplets className="w-5 h-5" />
                </div>
                <p className="text-xs">Para llegar a EC {recommendedEC}:</p>
                <div className="text-2xl font-black mt-1">
                  {nutCorr} ml <span className="text-xs font-normal text-white/80">de Hy-Pro A y {nutCorr} ml de B</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 text-xs font-bold border border-green-200">
                <CheckCircle2 className="w-4 h-4" /> Nutrientes en nivel óptimo
              </div>
            )}

            {/* PANEL PH */}
            {phCorr ? (
              <div className="p-4 bg-amber-500 text-white rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase">Ajustar pH</span>
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-xs text-white/90">Para {phCorr.action} a 6.0:</p>
                <div className="text-2xl font-black mt-1">
                  {phCorr.ml} ml <span className="text-xs font-normal text-white/80">de {phCorr.type}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 text-xs font-bold border border-green-200">
                <CheckCircle2 className="w-4 h-4" /> pH equilibrado (6.0)
              </div>
            )}

            <div className="p-3 bg-white/50 rounded text-[10px] space-y-1 border italic">
              <p>• Echa primero el Nutriente A, remueve y luego el B.</p>
              <p>• El pH se ajusta siempre después de los abonos.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
