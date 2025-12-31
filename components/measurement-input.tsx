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
  const [currentMeasurements, setCurrentMeasurements] = useState({
    pH: parameters.pH,
    ec: parameters.ec,
    waterTemp: parameters.waterTemp,
    waterVolume: parameters.waterVolume,
  })

  const [pendingActions, setPendingActions] = useState<string[]>([])

  useEffect(() => {
    checkRanges()
  }, [currentMeasurements, recommendedEC])

  const checkRanges = () => {
    const actions: string[] = []

    if (currentMeasurements.pH < 5.5) {
      actions.push("Subir pH: Añadir bicarbonato de potasio gradualmente")
    } else if (currentMeasurements.pH > 6.5) {
      actions.push("Bajar pH: Añadir ácido fosfórico o cítrico gradualmente")
    }

    if (Math.abs(currentMeasurements.ec - recommendedEC) > 0.4) {
      if (currentMeasurements.ec < recommendedEC) {
        actions.push(`Subir EC: Añadir más nutrientes High-Pro A/B (objetivo: ${recommendedEC.toFixed(1)} mS/cm)`)
      } else {
        actions.push(`Bajar EC: Diluir con agua limpia (objetivo: ${recommendedEC.toFixed(1)} mS/cm)`)
      }
    }

    if (currentMeasurements.waterTemp < 18) {
      actions.push("Temperatura baja: Activar o verificar el calentador")
    } else if (currentMeasurements.waterTemp > 24) {
      actions.push("Temperatura alta: Enfriar el agua o mejorar ventilación")
    }

    if (currentMeasurements.waterVolume < 15) {
      actions.push("Nivel de agua bajo: Rellenar hasta 18-20 litros")
    }

    setPendingActions(actions)
    return actions.length === 0
  }

  const handleSaveMeasurement = () => {
    const inRange = checkRanges()

    onMeasurementComplete({
      pH: currentMeasurements.pH,
      ec: currentMeasurements.ec,
      waterTemp: currentMeasurements.waterTemp,
      waterVolume: currentMeasurements.waterVolume,
      inRange,
      correctiveActions: inRange ? undefined : pendingActions,
    })

    setParameters({
      ...parameters,
      pH: currentMeasurements.pH,
      ec: currentMeasurements.ec,
      waterTemp: currentMeasurements.waterTemp,
      waterVolume: currentMeasurements.waterVolume,
    })
  }

  const handleActionCompleted = (action: string) => {
    onCorrectiveAction(action)
    setPendingActions(pendingActions.filter((a) => a !== action))
  }

  const updateMeasurement = (key: keyof typeof currentMeasurements, value: number) => {
    setCurrentMeasurements({ ...currentMeasurements, [key]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Mediciones</CardTitle>
          <CardDescription>
            Introduce los valores medidos del sistema. El sistema calculará automáticamente si están en rango óptimo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="pH" className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                pH del Agua
              </Label>
              <Input
                id="pH"
                type="text"
inputMode="decimal"
step="any"
                step="0.1"
                min="0"
                max="14"
                value={currentMeasurements.pH}
                onChange={(e) => updateMeasurement("pH", Number.parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Rango óptimo: 5.5 - 6.5</span>
                {currentMeasurements.pH >= 5.5 && currentMeasurements.pH <= 6.5 ? (
                  <Badge variant="default" className="bg-green-600">
                    En rango
                  </Badge>
                ) : (
                  <Badge variant="destructive">Fuera de rango</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="ec" className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-yellow-300" />
                EC (mS/cm)
              </Label>
              <Input
                id="ec"
                type="text"
inputMode="decimal"
step="any"
                step="0.1"
                min="0"
                max="5"
                value={currentMeasurements.ec}
                onChange={(e) => updateMeasurement("ec", Number.parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Recomendado: {recommendedEC.toFixed(1)} mS/cm</span>
                {Math.abs(currentMeasurements.ec - recommendedEC) <= 0.4 ? (
                  <Badge variant="default" className="bg-green-600">
                    En rango
                  </Badge>
                ) : (
                  <Badge variant="destructive">Ajustar</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="temp" className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-destructive" />
                Temperatura (°C)
              </Label>
              <Input
                id="temp"
                type="text"
inputMode="decimal"
step="any"
                step="0.5"
                min="0"
                max="40"
                value={currentMeasurements.waterTemp}
                onChange={(e) => updateMeasurement("waterTemp", Number.parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Rango óptimo: 18 - 24°C</span>
                {currentMeasurements.waterTemp >= 18 && currentMeasurements.waterTemp <= 24 ? (
                  <Badge variant="default" className="bg-green-600">
                    En rango
                  </Badge>
                ) : (
                  <Badge variant="destructive">Fuera de rango</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="volume" className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-chart-4" />
                Volumen de Agua (L)
              </Label>
              <Input
                id="volume"
                type="text"
inputMode="decimal"
step="any"
                step="0.5"
                min="0"
                max="20"
                value={currentMeasurements.waterVolume}
                onChange={(e) => updateMeasurement("waterVolume", Number.parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Capacidad: 20L / Mínimo: 15L</span>
                {currentMeasurements.waterVolume >= 15 ? (
                  <Badge variant="default" className="bg-green-600">
                    Nivel OK
                  </Badge>
                ) : (
                  <Badge variant="destructive">Rellenar</Badge>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handleSaveMeasurement} size="lg" className="w-full">
            <CheckCircle2 className="mr-2 h-[50px] w-[50px]" />
            Guardar Medición
          </Button>
        </CardContent>
      </Card>

      {pendingActions.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle>Acciones Correctoras Necesarias</CardTitle>
            </div>
            <CardDescription>
              Los siguientes parámetros están fuera de rango. Realiza las acciones indicadas y marca cuando estén
              completadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.map((action, idx) => (
                <Alert key={idx} variant="destructive">
                  <AlertDescription className="flex items-center justify-between gap-4">
                    <span className="flex-1">{action}</span>
                    <Button size="sm" variant="outline" onClick={() => handleActionCompleted(action)}>
                      Medida Efectuada
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guía rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            Guía Rápida de Ajustes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <h4 className="font-semibold">Ajustar pH</h4>
              <p className="text-muted-foreground">
                <strong className="text-foreground">↑ Subir:</strong> Bicarbonato de potasio
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">↓ Bajar:</strong> Ácido fosfórico/cítrico
              </p>
              <p className="text-xs text-muted-foreground">Añadir poco a poco y volver a medir</p>
            </div>

            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <h4 className="font-semibold">Ajustar EC</h4>
              <p className="text-muted-foreground">
                <strong className="text-foreground">↑ Subir:</strong> Añadir High-Pro A/B (1:1)
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">↓ Bajar:</strong> Diluir con agua limpia
              </p>
              <p className="text-xs text-muted-foreground">Nunca mezclar concentrados directamente</p>
            </div>

            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <h4 className="font-semibold">Temperatura</h4>
              <p className="text-muted-foreground">
                <strong className="text-foreground">❄ Frío:</strong> Activar calentador sumergible
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">🔥 Calor:</strong> Mejorar ventilación/sombrear
              </p>
              <p className="text-xs text-muted-foreground">Ideal para Castellón: 20-22°C</p>
            </div>

            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <h4 className="font-semibold">Volumen de Agua</h4>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Rellenar:</strong> Usar agua reposada 24h
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Ajustar:</strong> pH y EC tras rellenar
              </p>
              <p className="text-xs text-muted-foreground">
                Consumo: ~{(totalPlants * 0.5 || 0).toFixed(1)} L/día con {totalPlants} plantas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
