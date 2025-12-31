"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { SystemParameters, MeasurementRecord } from "@/app/page"
import { Activity, Thermometer, Droplets, CheckCircle2, AlertTriangle, Beaker } from "lucide-react"

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
  
  // USAMOS STRINGS (TEXTO) PARA LOS INPUTS - ASÍ EL IPHONE NO SE LÍA CON COMAS
  const [inputs, setInputs] = useState({
    pH: parameters.pH.toString(),
    ec: parameters.ec.toString(),
    waterTemp: parameters.waterTemp.toString(),
    waterVolume: parameters.waterVolume.toString(),
  })

  const [pendingActions, setPendingActions] = useState<string[]>([])

  // Convertimos los textos a números para los cálculos de rangos
  const currentNum = {
    pH: parseFloat(inputs.pH.replace(',', '.')) || 0,
    ec: parseFloat(inputs.ec.replace(',', '.')) || 0,
    waterTemp: parseFloat(inputs.waterTemp.replace(',', '.')) || 0,
    waterVolume: parseFloat(inputs.waterVolume.replace(',', '.')) || 0,
  }

  useEffect(() => {
    checkRanges()
  }, [inputs, recommendedEC])

  const checkRanges = () => {
    const actions: string[] = []
    const { pH, ec, waterTemp, waterVolume } = currentNum

    if (pH < 5.5) actions.push("Subir pH: Añadir bicarbonato de potasio gradualmente")
    else if (pH > 6.5) actions.push("Bajar pH: Añadir ácido fosfórico o cítrico gradualmente")

    if (Math.abs(ec - recommendedEC) > 0.4) {
      if (ec < recommendedEC) actions.push(`Subir EC: Añadir nutrientes A/B (Objetivo: ${recommendedEC.toFixed(1)})`)
      else actions.push(`Bajar EC: Diluir con agua (Objetivo: ${recommendedEC.toFixed(1)})`)
    }

    if (waterTemp < 18) actions.push("Temperatura baja: Activar calentador")
    else if (waterTemp > 24) actions.push("Temperatura alta: Enfriar o ventilar")

    if (waterVolume < 15) actions.push("Nivel de agua bajo: Rellenar hasta 20L")

    setPendingActions(actions)
    return actions.length === 0
  }

  const handleSaveMeasurement = () => {
    const inRange = checkRanges()
    const finalData = {
      pH: currentNum.pH,
      ec: currentNum.ec,
      waterTemp: currentNum.waterTemp,
      waterVolume: currentNum.waterVolume,
      inRange,
      correctiveActions: inRange ? undefined : pendingActions,
    }

    onMeasurementComplete(finalData)
    setParameters({ ...parameters, ...finalData })
  }

  const handleInputChange = (key: string, value: string) => {
    // Permitimos que el usuario escriba comas o puntos libremente
    if (/^[0-9]*[.,]?[0-9]*$/.test(value) || value === "") {
      setInputs({ ...inputs, [key]: value })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Mediciones</CardTitle>
          <CardDescription>Introduce los valores. Se acepta punto o coma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: "pH", label: "pH del Agua", icon: <Activity />, key: "pH", color: "text-primary" },
              { id: "ec", label: "EC (mS/cm)", icon: <Activity />, key: "ec", color: "text-yellow-500" },
              { id: "temp", label: "Temp (°C)", icon: <Thermometer />, key: "waterTemp", color: "text-destructive" },
              { id: "vol", label: "Volumen (L)", icon: <Droplets />, key: "waterVolume", color: "text-blue-500" },
            ].map((field) => (
              <div key={field.id} className="space-y-3">
                <Label htmlFor={field.id} className="flex items-center gap-2">
                  <span className={field.color}>{field.icon}</span>
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  type="text"
                  inputMode="decimal"
                  value={inputs[field.key as keyof typeof inputs]}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="text-lg"
                />
              </div>
            ))}
          </div>

          <Button onClick={handleSaveMeasurement} size="lg" className="w-full">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Guardar Medición
          </Button>
        </CardContent>
      </Card>

      {/* Acciones Correctoras */}
      {pendingActions.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle /> Acciones Necesarias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingActions.map((action, i) => (
              <Alert key={i} variant="destructive">
                <AlertDescription className="flex justify-between items-center">
                  {action}
                  <Button size="sm" variant="outline" onClick={() => onCorrectiveAction(action)}>OK</Button>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
