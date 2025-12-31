"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Beaker, Thermometer, Droplets, Activity, AlertCircle, Info, CheckCircle2 } from "lucide-react"
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
  // Usamos strings para compatibilidad con coma en iPhone
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

  // --- CALCULADORA DE DOSIFICACIÓN DE PH ---
  const calculatePHCorrection = () => {
    const currentPH = getNum(formValues.pH)
    const currentVol = getNum(formValues.waterVolume)
    const targetPH = 6.0
    
    if (currentPH === 0 || currentVol === 0) return null
    
    const diff = Math.abs(currentPH - targetPH)
    if (diff <= 0.2) return null // No necesita corrección si está cerca

    // Estimación: 0.1ml por litro para mover 0.5 puntos de pH (promedio estándar)
    // Fórmula: (Diferencia / 0.5) * Volumen * 0.1
    const dosage = (diff / 0.5) * currentVol * 0.1
    const roundedDosage = Math.round(dosage * 10) / 10

    if (currentPH > targetPH) {
      return { type: "pH-", ml: roundedDosage, action: "bajar" }
    } else {
      return { type: "pH+", ml: roundedDosage, action: "subir" }
    }
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

  const correction = calculatePHCorrection()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" /> Nueva Medición
          </CardTitle>
          <CardDescription>Introduce los valores actuales de tu depósito</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> pH</Label>
              <Input type="text" inputMode="decimal" value={formValues.pH} onChange={(e) => handleInputChange("pH", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-500" /> EC (mS/cm)</Label>
              <Input type="text" inputMode="decimal" value={formValues.ec} onChange={(e) => handleInputChange("ec", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-red-500" /> Temp (°C)</Label>
              <Input type="text" inputMode="decimal" value={formValues.waterTemp} onChange={(e) => handleInputChange("waterTemp", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Droplets className="w-4 h-4 text-cyan-500" /> Volumen (L)</Label>
              <Input type="text" inputMode="decimal" value={formValues.waterVolume} onChange={(e) => handleInputChange("waterVolume", e.target.value)} />
            </div>
          </div>

          <Button className="w-full" onClick={handleSave}>Guardar Medición</Button>
          {showSuccess && <p className="text-green-600 text-center text-sm font-medium animate-bounce">✓ Guardado correctamente</p>}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* PANEL DE RECOMENDACIONES DINÁMICAS */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5" /> Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Corrección de pH */}
            {correction ? (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Corrección de pH necesaria</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Para {correction.action} el pH a 6.0 en un depósito de {getNum(formValues.waterVolume)}L, añade aproximadamente:
                  <div className="text-lg font-bold mt-1 bg-white p-2 rounded border border-amber-200 text-center">
                    {correction.ml} ml de {correction.type}
                  </div>
                  <p className="text-[10px] mt-2 italic text-amber-600">
                    *Añade poco a poco, mezcla bien y vuelve a medir a los 10 min.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                <CheckCircle2 className="w-4 h-4" /> pH en rango óptimo. No necesita corrección.
              </div>
            )}

            {/* Recomendación de EC */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <p className="text-xs text-muted-foreground uppercase font-bold">EC Objetivo</p>
              <p className="text-2xl font-bold text-primary">{recommendedEC.toFixed(1)} <span className="text-sm font-normal">mS/cm</span></p>
              <p className="text-xs mt-1">Basado en {totalPlants} plantas activas.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
