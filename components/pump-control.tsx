"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Droplets, Power, Clock, Thermometer, TrendingUp, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PumpControlProps {
  plantCount: number
  reservoirVolume: number
  waterTemperature: number
  hasHeater: boolean
  onPumpScheduleChange?: (schedule: PumpSchedule) => void
}

interface PumpSchedule {
  mode: "continuous" | "timed"
  cycleOnMinutes: number
  cycleOffMinutes: number
  cyclesPerDay: number
  flowRate: number
  dailyVolume: number
}

export default function PumpControl({
  plantCount,
  reservoirVolume,
  waterTemperature,
  hasHeater,
  onPumpScheduleChange,
}: PumpControlProps) {
  const [pumpActive, setPumpActive] = useState(false)
  const [autoMode, setAutoMode] = useState(true)

  // Cálculos basados en investigación
  const calculatePumpSchedule = (): PumpSchedule => {
    // Sistema NFT requiere flujo continuo o muy frecuente
    // Torre vertical: 2 GPH (7.5 LPH) por torre base
    // Ajuste por número de plantas: +0.3 LPH por planta

    const baseFlowRate = 7.5 // Litros por hora
    const perPlantAdjustment = 0.3
    const flowRate = baseFlowRate + plantCount * perPlantAdjustment

    // Para lechugas en NFT, el sistema debe estar casi siempre activo
    // Con calentador, ciclos más frecuentes ayudan a distribuir calor

    if (plantCount === 0) {
      // Sin plantas: ciclos de mantenimiento con calentador
      return {
        mode: "timed",
        cycleOnMinutes: 5,
        cycleOffMinutes: 55,
        cyclesPerDay: 24,
        flowRate: baseFlowRate,
        dailyVolume: ((baseFlowRate * 5) / 60) * 24,
      }
    } else if (plantCount <= 6) {
      // Pocas plantas: ciclos frecuentes
      return {
        mode: "timed",
        cycleOnMinutes: 15,
        cycleOffMinutes: 15,
        cyclesPerDay: 48,
        flowRate,
        dailyVolume: ((flowRate * 15) / 60) * 48,
      }
    } else if (plantCount <= 12) {
      // Plantas moderadas: flujo casi continuo
      return {
        mode: "timed",
        cycleOnMinutes: 20,
        cycleOffMinutes: 10,
        cyclesPerDay: 48,
        flowRate,
        dailyVolume: ((flowRate * 20) / 60) * 48,
      }
    } else {
      // Torre completa o casi: flujo continuo recomendado
      return {
        mode: "continuous",
        cycleOnMinutes: 60,
        cycleOffMinutes: 0,
        cyclesPerDay: 24,
        flowRate,
        dailyVolume: flowRate * 24,
      }
    }
  }

  const schedule = calculatePumpSchedule()

  const getHeaterRecommendation = () => {
    if (!hasHeater) return null

    if (waterTemperature < 18) {
      return {
        level: "high",
        message: "Temperatura baja. Aumenta ciclos de bombeo para distribuir calor del calentador.",
      }
    } else if (waterTemperature < 20) {
      return {
        level: "medium",
        message: "Temperatura aceptable. Mantén ciclos frecuentes para homogeneizar temperatura.",
      }
    } else if (waterTemperature > 24) {
      return {
        level: "warning",
        message: "Temperatura alta. Reduce calentador y aumenta circulación para enfriar.",
      }
    }
    return null
  }

  const heaterRec = getHeaterRecommendation()

  const getEfficiencyScore = () => {
    const volumePerPlant = schedule.dailyVolume / (plantCount || 1)
    if (volumePerPlant >= 2 && volumePerPlant <= 4) return "Óptimo"
    if (volumePerPlant >= 1.5 && volumePerPlant <= 5) return "Bueno"
    return "Ajustar"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Control de Bombeo
        </CardTitle>
        <CardDescription>Programación automática según plantas en sistema NFT</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado actual */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${pumpActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            <div>
              <div className="font-medium">Bomba {pumpActive ? "Activa" : "Inactiva"}</div>
              <div className="text-sm text-muted-foreground">
                {plantCount} plantas • {reservoirVolume}L depósito
              </div>
            </div>
          </div>
          <Button variant={pumpActive ? "destructive" : "default"} size="sm" onClick={() => setPumpActive(!pumpActive)}>
            <Power className="w-4 h-4 mr-2" />
            {pumpActive ? "Detener" : "Iniciar"}
          </Button>
        </div>

        {/* Modo automático */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-mode" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Modo Automático
          </Label>
          <Switch id="auto-mode" checked={autoMode} onCheckedChange={setAutoMode} />
        </div>

        {/* Programación calculada */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4" />
            Programación Calculada
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-muted-foreground">Modo de Operación</div>
              <div className="text-lg font-semibold text-blue-700 capitalize">
                {schedule.mode === "continuous" ? "Continuo" : "Por Ciclos"}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-muted-foreground">Ciclos al Día</div>
              <div className="text-lg font-semibold text-green-700">{schedule.cyclesPerDay}</div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-xs text-muted-foreground">Encendido</div>
              <div className="text-lg font-semibold text-purple-700">{schedule.cycleOnMinutes} min</div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-xs text-muted-foreground">Apagado</div>
              <div className="text-lg font-semibold text-orange-700">
                {schedule.cycleOffMinutes === 0 ? "N/A" : `${schedule.cycleOffMinutes} min`}
              </div>
            </div>

            <div className="p-3 bg-cyan-50 rounded-lg">
              <div className="text-xs text-muted-foreground">Caudal</div>
              <div className="text-lg font-semibold text-cyan-700">{schedule.flowRate.toFixed(1)} L/h</div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="text-xs text-muted-foreground">Vol. Diario</div>
              <div className="text-lg font-semibold text-indigo-700">{schedule.dailyVolume.toFixed(1)} L</div>
            </div>
          </div>

          {/* Eficiencia */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <span>Eficiencia del Sistema</span>
            </div>
            <Badge variant={getEfficiencyScore() === "Óptimo" ? "default" : "secondary"}>{getEfficiencyScore()}</Badge>
          </div>
        </div>

        {/* Recomendación de calentador */}
        {hasHeater && heaterRec && (
          <Alert>
            <Thermometer className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">
                {waterTemperature}°C -{" "}
                {heaterRec.level === "high" ? "Atención" : heaterRec.level === "warning" ? "Precaución" : "Normal"}
              </div>
              <div className="text-sm">{heaterRec.message}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Información del sistema NFT */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 rounded-lg">
          <div className="font-medium text-blue-900 mb-2">ℹ️ Sistema NFT (Nutrient Film Technique)</div>
          <div>• Flujo continuo o muy frecuente para lechugas</div>
          <div>• Con calentador: ciclos frecuentes distribuyen temperatura</div>
          <div>• Caudal ajustado: +0.3 L/h por planta adicional</div>
          <div>• Torre completa (18 plantas): flujo continuo recomendado</div>
        </div>
      </CardContent>
    </Card>
  )
}
