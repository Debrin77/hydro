"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { SystemParameters } from "@/app/page"
import { Droplets, Thermometer, Activity, Beaker, Plus, Minus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ParameterMonitorProps {
  parameters: SystemParameters
  setParameters: (params: SystemParameters) => void
  recommendedEC: number
  totalPlants: number
}

export default function ParameterMonitor({
  parameters,
  setParameters,
  recommendedEC,
  totalPlants,
}: ParameterMonitorProps) {
  const updateParameter = (key: keyof SystemParameters, value: number) => {
    setParameters({ ...parameters, [key]: value })
  }

  const adjustWaterVolume = (change: number) => {
    const newVolume = Math.max(0, Math.min(20, parameters.waterVolume + change))
    updateParameter("waterVolume", newVolume)
  }

  const adjustNutrients = (type: "nutrientsA" | "nutrientsB", change: number) => {
    const newValue = Math.max(0, Math.min(100, parameters[type] + change))
    updateParameter(type, newValue)
  }

  const calculateNutrientConsumption = () => {
    // Consumo basado en número de plantas y edad promedio
    // Más plantas = más consumo
    const dailyConsumptionPerPlant = 0.5 // ml por día por planta
    return (totalPlants * dailyConsumptionPerPlant).toFixed(1)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitoreo de Parámetros</CardTitle>
          <CardDescription>Ajusta y monitorea los parámetros del sistema hidropónico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Beaker className="h-4 w-4" />
            <AlertDescription>
              Consumo estimado de nutrientes: <strong>{calculateNutrientConsumption()} ml/día</strong> con {totalPlants}{" "}
              plantas
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {/* pH */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <Label htmlFor="ph">pH del Agua</Label>
              </div>
              <Input
                id="ph"
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={parameters.pH}
                onChange={(e) => updateParameter("pH", Number.parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">Rango óptimo: 5.5 - 6.5 pH</p>
              {(parameters.pH < 5.5 || parameters.pH > 6.5) && (
                <p className="text-xs text-destructive">⚠️ Fuera del rango óptimo</p>
              )}
            </div>

            {/* EC */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <Label htmlFor="ec">Conductividad Eléctrica (EC)</Label>
              </div>
              <Input
                id="ec"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={parameters.ec}
                onChange={(e) => updateParameter("ec", Number.parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: {recommendedEC.toFixed(1)} mS/cm (1.2 - 2.0 mS/cm)
              </p>
              {Math.abs(parameters.ec - recommendedEC) > 0.4 && (
                <p className="text-xs text-destructive">⚠️ Ajustar a {recommendedEC.toFixed(1)} mS/cm</p>
              )}
            </div>

            {/* Temperatura */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-primary" />
                <Label htmlFor="temp">Temperatura del Agua</Label>
              </div>
              <Input
                id="temp"
                type="number"
                step="0.5"
                min="0"
                max="40"
                value={parameters.waterTemp}
                onChange={(e) => updateParameter("waterTemp", Number.parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">Rango óptimo: 18 - 24°C (calentador activo si {"<"} 20°C)</p>
              {parameters.waterTemp < 18 && (
                <p className="text-xs text-destructive">❄️ Demasiado frío - activar calentador</p>
              )}
              {parameters.waterTemp > 24 && (
                <p className="text-xs text-destructive">🔥 Demasiado caliente - enfriar agua</p>
              )}
            </div>

            {/* Volumen de Agua */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary" />
                <Label htmlFor="volume">Volumen de Agua</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => adjustWaterVolume(-1)}
                  disabled={parameters.waterVolume <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  id="volume"
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={parameters.waterVolume}
                  onChange={(e) => updateParameter("waterVolume", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg text-center"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => adjustWaterVolume(1)}
                  disabled={parameters.waterVolume >= 20}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Capacidad: 20 litros</p>
              {parameters.waterVolume < 15 && (
                <p className="text-xs text-destructive">⚠️ Nivel bajo - rellenar depósito</p>
              )}
            </div>
          </div>

          {/* Nutrientes High-Pro A/B */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              Nutrientes High-Pro A/B
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="nutrientsA">High-Pro A (%)</Label>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => adjustNutrients("nutrientsA", -5)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      id="nutrientsA"
                      type="number"
                      min="0"
                      max="100"
                      value={parameters.nutrientsA}
                      onChange={(e) => updateParameter("nutrientsA", Number.parseFloat(e.target.value) || 0)}
                      className="text-center"
                    />
                    <div className="mt-2 bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${parameters.nutrientsA}%` }}
                      />
                    </div>
                  </div>
                  <Button size="icon" variant="outline" onClick={() => adjustNutrients("nutrientsA", 5)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="nutrientsB">High-Pro B (%)</Label>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => adjustNutrients("nutrientsB", -5)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      id="nutrientsB"
                      type="number"
                      min="0"
                      max="100"
                      value={parameters.nutrientsB}
                      onChange={(e) => updateParameter("nutrientsB", Number.parseFloat(e.target.value) || 0)}
                      className="text-center"
                    />
                    <div className="mt-2 bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${parameters.nutrientsB}%` }}
                      />
                    </div>
                  </div>
                  <Button size="icon" variant="outline" onClick={() => adjustNutrients("nutrientsB", 5)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {(parameters.nutrientsA < 20 || parameters.nutrientsB < 20) && (
              <Alert variant="destructive">
                <AlertDescription>
                  ⚠️ Nivel de nutrientes bajo. Considera reponer para mantener el crecimiento óptimo.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guía de Ajuste de Parámetros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">Para subir el pH:</h4>
            <p className="text-muted-foreground">Añade bicarbonato de potasio o hidróxido de potasio gradualmente</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Para bajar el pH:</h4>
            <p className="text-muted-foreground">Añade ácido fosfórico o ácido cítrico gradualmente</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Para ajustar EC:</h4>
            <p className="text-muted-foreground">
              Subir: Añade más nutrientes High-Pro A/B en proporción 1:1
              <br />
              Bajar: Diluye con agua limpia
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Ratio de nutrientes:</h4>
            <p className="text-muted-foreground">
              High-Pro A y B deben usarse en partes iguales. Nunca mezclar los concentrados directamente entre sí.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
