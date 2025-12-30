"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Plant, SystemParameters, MeasurementRecord, ActionLog } from "@/app/page"
import {
  Activity,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sprout,
  Leaf,
  FlowerIcon,
} from "lucide-react"

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
  recentMeasurements,
  recentActions,
}: SystemOverviewProps) {
  const getSystemStatus = () => {
    const issues: string[] = []

    if (parameters.pH < 5.5 || parameters.pH > 6.5) issues.push("pH fuera de rango")
    if (Math.abs(parameters.ec - recommendedEC) > 0.4) issues.push("EC necesita ajuste")
    if (parameters.waterTemp < 18 || parameters.waterTemp > 24) issues.push("Temperatura no óptima")
    if (parameters.waterVolume < 15) issues.push("Nivel de agua bajo")
    if (daysUntilCleaning <= 2) issues.push("Limpieza pendiente")

    const readyToHarvest = plants.filter((p) => p.stage === "harvest").length

    if (readyToHarvest > 0)
      issues.push(
        `${readyToHarvest} planta${readyToHarvest > 1 ? "s" : ""} lista${readyToHarvest > 1 ? "s" : ""} para cosecha`,
      )

    return {
      isHealthy: issues.length === 0 || (issues.length === 1 && issues[0].includes("cosecha")),
      issues,
    }
  }

  const status = getSystemStatus()

  const getPlantCountByStage = (stage: Plant["stage"]) => {
    return plants.filter((p) => p.stage === stage).length
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Estado general del sistema */}
      <Card className={status.isHealthy ? "border-green-500" : "border-destructive"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {status.isHealthy ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Sistema Saludable
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Atención Requerida
                  </>
                )}
              </CardTitle>
              <CardDescription>Estado general de la torre hidropónica</CardDescription>
            </div>
            <Badge variant={status.isHealthy ? "default" : "destructive"} className="text-lg px-4 py-2">
              {status.isHealthy ? "OK" : `${status.issues.length} ${status.issues.length === 1 ? "alerta" : "alertas"}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {status.issues.length > 0 ? (
            <div className="space-y-2">
              {status.issues.map((issue, idx) => (
                <Alert
                  key={idx}
                  variant={issue.includes("cosecha") ? "default" : "destructive"}
                  className={issue.includes("cosecha") ? "bg-green-500/10 border-green-500" : ""}
                >
                  <AlertDescription className="flex items-center gap-2">
                    {issue.includes("cosecha") ? (
                      <FlowerIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {issue}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <p className="text-sm text-center text-green-800 dark:text-green-200">
                Todos los parámetros están en rango óptimo. El sistema funciona correctamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parámetros actuales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-muted-foreground flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-chart-4" />
              pH del Agua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{parameters.pH.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">pH</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    parameters.pH >= 5.5 && parameters.pH <= 6.5 ? "bg-green-600" : "bg-destructive"
                  }`}
                  style={{ width: `${((parameters.pH - 5.0) / 2) * 100}%` }}
                />
              </div>
              {parameters.pH >= 5.5 && parameters.pH <= 6.5 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Óptimo: 5.5-6.5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-muted-foreground flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-yellow-500" />
              Conductividad (EC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{parameters.ec.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">mS/cm</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    Math.abs(parameters.ec - recommendedEC) <= 0.4 ? "bg-green-600" : "bg-destructive"
                  }`}
                  style={{ width: `${(parameters.ec / 3) * 100}%` }}
                />
              </div>
              {Math.abs(parameters.ec - recommendedEC) <= 0.4 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Recomendado: {recommendedEC.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-muted-foreground flex items-center gap-2 text-base">
              <Thermometer className="w-4 h-4 text-destructive" />
              Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{parameters.waterTemp}</span>
              <span className="text-sm text-muted-foreground">°C</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    parameters.waterTemp >= 18 && parameters.waterTemp <= 24 ? "bg-green-600" : "bg-destructive"
                  }`}
                  style={{ width: `${(parameters.waterTemp / 40) * 100}%` }}
                />
              </div>
              {parameters.waterTemp >= 18 && parameters.waterTemp <= 24 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Óptimo: 18-24°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-muted-foreground flex items-center gap-2 text-base">
              <Droplets className="w-4 h-4 text-chart-4" />
              Volumen de Agua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{parameters.waterVolume}</span>
              <span className="text-sm text-muted-foreground">/ 20L</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    parameters.waterVolume >= 15 ? "bg-green-600" : "bg-destructive"
                  }`}
                  style={{ width: `${(parameters.waterVolume / 20) * 100}%` }}
                />
              </div>
              {parameters.waterVolume >= 15 ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Mínimo: 15L</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de las plantas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5" />
              Estado de las Plantas
            </CardTitle>
            <CardDescription>Distribución por etapa de crecimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center">
                    <Sprout className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Plantas Jóvenes</p>
                    <p className="text-xs text-muted-foreground">0-50% de crecimiento</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-3">
                  {getPlantCountByStage("young")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Plantas Medias</p>
                    <p className="text-xs text-muted-foreground">50-100% de crecimiento</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-3">
                  {getPlantCountByStage("medium")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center">
                    <FlowerIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Listas para Cosecha</p>
                    <p className="text-xs text-muted-foreground">100% de crecimiento</p>
                  </div>
                </div>
                <Badge variant="default" className="text-lg px-3 bg-green-600">
                  {getPlantCountByStage("harvest")}
                </Badge>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de plantas:</span>
                  <span className="text-2xl font-bold">{plants.length} / 18</span>
                </div>
                <div className="mt-2 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(plants.length / 18) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimas mediciones y acciones del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMeasurements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Última Medición:</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(recentMeasurements[0].timestamp)}
                      </span>
                      {recentMeasurements[0].inRange ? (
                        <Badge variant="default" className="bg-green-600 text-xs">
                          En rango
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Fuera de rango
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span>pH: {recentMeasurements[0].pH.toFixed(1)}</span>
                      <span>EC: {recentMeasurements[0].ec.toFixed(1)}</span>
                      <span>Temp: {recentMeasurements[0].waterTemp}°C</span>
                      <span>Vol: {recentMeasurements[0].waterVolume}L</span>
                    </div>
                  </div>
                </div>
              )}

              {recentActions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Acciones Recientes:</h4>
                  <div className="space-y-2">
                    {recentActions.slice(0, 5).map((action) => (
                      <div key={action.id} className="flex items-start gap-2 p-2 bg-muted rounded text-xs">
                        <Calendar className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{action.description}</p>
                          <p className="text-muted-foreground">{formatDate(action.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentMeasurements.length === 0 && recentActions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay actividad registrada aún. Comienza registrando mediciones o plantando lechugas.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos pasos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Próximos Pasos Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {daysUntilCleaning <= 5 && (
              <Alert variant={daysUntilCleaning <= 2 ? "destructive" : "default"}>
                <AlertDescription>Limpieza del depósito programada en {daysUntilCleaning} días</AlertDescription>
              </Alert>
            )}

            {plants.length < 6 && (
              <Alert>
                <AlertDescription>
                  Considera añadir más plantas al Nivel 1 para optimizar la producción
                </AlertDescription>
              </Alert>
            )}

            {getPlantCountByStage("harvest") > 0 && (
              <Alert className="bg-green-500/10 border-green-500">
                <AlertDescription className="flex items-center gap-2">
                  <FlowerIcon className="w-4 h-4 text-green-600" />
                  Tienes {getPlantCountByStage("harvest")} planta{getPlantCountByStage("harvest") > 1 ? "s" : ""} lista
                  {getPlantCountByStage("harvest") > 1 ? "s" : ""} para cosechar
                </AlertDescription>
              </Alert>
            )}

            {status.isHealthy && plants.length > 0 && (
              <Alert className="bg-green-500/10 border-green-500">
                <AlertDescription className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Sistema funcionando perfectamente. Mantén el monitoreo diario de parámetros.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
