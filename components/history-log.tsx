"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MeasurementRecord, ActionLog, Plant } from "@/app/page"
import {
  Activity,
  Droplets,
  Thermometer,
  Beaker,
  Sprout,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Trash2,
} from "lucide-react"

interface HistoryLogProps {
  measurementHistory: MeasurementRecord[]
  actionLog: ActionLog[]
  plants: Plant[]
  onClearHistory: () => void
}

export default function HistoryLog({ measurementHistory, actionLog, plants, onClearHistory }: HistoryLogProps) {
  const [filter, setFilter] = useState<"all" | "measurements" | "actions">("all")

  const getActionIcon = (type: ActionLog["type"]) => {
    switch (type) {
      case "measurement":
        return <Activity className="w-4 h-4" />
      case "planting":
        return <Sprout className="w-4 h-4" />
      case "harvest":
        return <Scissors className="w-4 h-4" />
      case "cleaning":
        return <Droplets className="w-4 h-4" />
      case "correction":
        return <AlertTriangle className="w-4 h-4" />
      case "nutrient_add":
        return <Beaker className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  const getActionColor = (type: ActionLog["type"]) => {
    switch (type) {
      case "measurement":
        return "bg-blue-500"
      case "planting":
        return "bg-green-500"
      case "harvest":
        return "bg-amber-500"
      case "cleaning":
        return "bg-cyan-500"
      case "correction":
        return "bg-red-500"
      case "nutrient_add":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateTrends = () => {
    if (measurementHistory.length < 2) return null

    const recent = measurementHistory[0]
    const previous = measurementHistory[1]

    return {
      pH: recent.pH - previous.pH,
      ec: recent.ec - previous.ec,
      temp: recent.waterTemp - previous.waterTemp,
      volume: recent.waterVolume - previous.waterVolume,
    }
  }

  const trends = calculateTrends()

  return (
    <div className="space-y-6">
      {/* Resumen de tendencias */}
      {trends && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Tendencia pH
                {trends.pH > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : trends.pH < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <span className="text-xs">Estable</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trends.pH > 0 ? "+" : ""}
                {trends.pH.toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Tendencia EC
                {trends.ec > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : trends.ec < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <span className="text-xs">Estable</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trends.ec > 0 ? "+" : ""}
                {trends.ec.toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Tendencia Temp
                {trends.temp > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-600" />
                ) : trends.temp < 0 ? (
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                ) : (
                  <span className="text-xs">Estable</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trends.temp > 0 ? "+" : ""}
                {trends.temp.toFixed(1)}°C
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Tendencia Volumen
                {trends.volume > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : trends.volume < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <span className="text-xs">Estable</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trends.volume > 0 ? "+" : ""}
                {trends.volume.toFixed(1)}L
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial Completo del Sistema</CardTitle>
              <CardDescription>
                Registro completo de todas las mediciones, acciones y eventos del sistema hidropónico
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Borrar Historial
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Borrar todo el historial?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente todas las mediciones, acciones y registros del sistema. No se
                    puede deshacer. El sistema se reiniciará desde cero.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearHistory} className="bg-destructive hover:bg-destructive/90">
                    Confirmar y Borrar Todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="measurements">Mediciones</TabsTrigger>
              <TabsTrigger value="actions">Acciones</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {/* Historial de mediciones */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Mediciones Recientes
                </h3>
                {measurementHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay mediciones registradas aún</p>
                ) : (
                  measurementHistory.slice(0, 10).map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{formatDate(record.timestamp)}</span>
                            {record.inRange ? (
                              <Badge variant="default" className="bg-green-600">
                                En rango
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Fuera de rango</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">pH:</span>
                              <span className="font-medium">{record.pH.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">EC:</span>
                              <span className="font-medium">{record.ec.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Thermometer className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">Temp:</span>
                              <span className="font-medium">{record.waterTemp}°C</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">Vol:</span>
                              <span className="font-medium">{record.waterVolume}L</span>
                            </div>
                          </div>

                          {record.correctiveActions && record.correctiveActions.length > 0 && (
                            <div className="bg-destructive/10 p-2 rounded text-xs">
                              <p className="font-semibold text-destructive mb-1">Acciones correctoras aplicadas:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {record.correctiveActions.map((action, idx) => (
                                  <li key={idx} className="text-muted-foreground">
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Historial de acciones */}
              <div className="space-y-3 pt-6 border-t">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Acciones y Eventos
                </h3>
                {actionLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay acciones registradas aún</p>
                ) : (
                  actionLog.slice(0, 15).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div
                        className={`w-8 h-8 rounded-full ${getActionColor(log.type)} flex items-center justify-center text-white shrink-0`}
                      >
                        {getActionIcon(log.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="measurements" className="space-y-3 mt-6">
              {measurementHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay mediciones registradas aún</p>
              ) : (
                measurementHistory.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{formatDate(record.timestamp)}</span>
                          {record.inRange ? (
                            <Badge variant="default" className="bg-green-600">
                              En rango
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Fuera de rango</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">pH:</span>
                            <span className="font-medium">{record.pH.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">EC:</span>
                            <span className="font-medium">{record.ec.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">Temp:</span>
                            <span className="font-medium">{record.waterTemp}°C</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">Vol:</span>
                            <span className="font-medium">{record.waterVolume}L</span>
                          </div>
                        </div>

                        {record.correctiveActions && record.correctiveActions.length > 0 && (
                          <div className="bg-destructive/10 p-2 rounded text-xs">
                            <p className="font-semibold text-destructive mb-1">Acciones correctoras aplicadas:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {record.correctiveActions.map((action, idx) => (
                                <li key={idx} className="text-muted-foreground">
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-3 mt-6">
              {actionLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay acciones registradas aún</p>
              ) : (
                actionLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <div
                      className={`w-10 h-10 rounded-full ${getActionColor(log.type)} flex items-center justify-center text-white shrink-0`}
                    >
                      {getActionIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(log.timestamp)}</p>
                      {log.details && (
                        <div className="mt-2 p-2 bg-background rounded text-xs">
                          <pre className="text-muted-foreground overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
