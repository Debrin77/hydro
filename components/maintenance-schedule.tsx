"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SystemParameters } from "@/app/page"
import { Calendar, CheckCircle2, Droplets, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MaintenanceScheduleProps {
  lastCleaningDate: Date | null
  setLastCleaningDate: (date: Date) => void
  daysUntilCleaning: number
  totalPlants: number
  parameters: SystemParameters
}

export default function MaintenanceSchedule({
  lastCleaningDate,
  setLastCleaningDate,
  daysUntilCleaning,
  totalPlants,
  parameters,
}: MaintenanceScheduleProps) {
  const handleCleaningComplete = () => {
    setLastCleaningDate(new Date())
  }

  const getCleaningInterval = () => {
    if (totalPlants > 12) return 7
    if (totalPlants > 6) return 10
    return 14
  }

  const getDaysSinceLastCleaning = () => {
    if (!lastCleaningDate) return 0
    return Math.floor((Date.now() - lastCleaningDate.getTime()) / (24 * 60 * 60 * 1000))
  }

  const cleaningInterval = getCleaningInterval()
  const daysSinceCleaning = getDaysSinceLastCleaning()
  const cleaningProgress = (daysSinceCleaning / cleaningInterval) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Programa de Mantenimiento
          </CardTitle>
          <CardDescription>Mantén tu sistema hidropónico en condiciones óptimas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Limpieza del depósito */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Limpieza del Depósito</h3>
              {daysUntilCleaning <= 2 ? (
                <Badge variant="destructive">Urgente</Badge>
              ) : (
                <Badge variant="outline">En {daysUntilCleaning} días</Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">
                  {daysSinceCleaning} de {cleaningInterval} días
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    cleaningProgress >= 90 ? "bg-destructive" : cleaningProgress >= 70 ? "bg-yellow-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(cleaningProgress, 100)}%` }}
                />
              </div>
            </div>

            {daysUntilCleaning <= 2 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  La limpieza del depósito debe realizarse pronto para mantener la salud de las plantas
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">Procedimiento de Limpieza:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Vaciar completamente el depósito</li>
                <li>Limpiar las paredes con agua y jabón neutro</li>
                <li>Enjuagar abundantemente con agua limpia</li>
                <li>Desinfectar con peróxido de hidrógeno al 3%</li>
                <li>Enjuagar de nuevo y secar</li>
                <li>Rellenar con 20 litros de agua limpia</li>
                <li>Ajustar pH, EC y añadir nutrientes High-Pro A/B</li>
              </ol>
            </div>

            <Button onClick={handleCleaningComplete} className="w-full" size="lg">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar Limpieza Completada
            </Button>

            {lastCleaningDate && (
              <p className="text-xs text-center text-muted-foreground">
                Última limpieza:{" "}
                {lastCleaningDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Frecuencia de limpieza */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  Frecuencia de Limpieza Según Carga
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-6 plantas:</span>
                    <span className="font-medium">Cada 14 días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">7-12 plantas:</span>
                    <span className="font-medium">Cada 10 días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">13-18 plantas:</span>
                    <span className="font-medium">Cada 7 días</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Tu sistema actual: <strong>{totalPlants} plantas</strong> → Limpiar cada{" "}
                    <strong>{cleaningInterval} días</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Mantenimiento diario */}
      <Card>
        <CardHeader>
          <CardTitle>Tareas de Mantenimiento Diario</CardTitle>
          <CardDescription>Checklist para mantener el sistema saludable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Verificar nivel de agua</p>
                <p className="text-xs text-muted-foreground">Rellenar si está por debajo de 15 litros</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Medir y ajustar pH</p>
                <p className="text-xs text-muted-foreground">Mantener entre 5.5 y 6.5</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Controlar temperatura del agua</p>
                <p className="text-xs text-muted-foreground">Verificar que el calentador mantenga {">"} 20°C</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Inspeccionar plantas</p>
                <p className="text-xs text-muted-foreground">Buscar signos de plagas, enfermedades o deficiencias</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Verificar circulación del agua</p>
                <p className="text-xs text-muted-foreground">Asegurar que la bomba funciona correctamente</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mantenimiento semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Tareas Semanales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Mover plantas al siguiente nivel</p>
                <p className="text-xs text-muted-foreground">Parte del sistema de cultivo escalonado</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Añadir 6 plantas nuevas al nivel 1</p>
                <p className="text-xs text-muted-foreground">Para mantener producción continua</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Cosechar lechugas maduras del nivel 3</p>
                <p className="text-xs text-muted-foreground">Plantas con 5-8 semanas según variedad</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Verificar y ajustar EC</p>
                <p className="text-xs text-muted-foreground">Ajustar según edad promedio de las plantas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Limpiar filtros y tuberías</p>
                <p className="text-xs text-muted-foreground">Prevenir obstrucciones en el sistema</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
