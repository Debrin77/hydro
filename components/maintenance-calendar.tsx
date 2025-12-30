"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Droplets, AlertCircle } from "lucide-react"
import type { Plant, MeasurementRecord } from "@/app/page"
import { useState } from "react"

interface MaintenanceCalendarProps {
  systemStartDate: Date
  lastCleaningDate: Date | null
  plants: Plant[]
  totalPlants: number
  measurementHistory?: MeasurementRecord[]
  onCleaningComplete: () => void
}

export default function MaintenanceCalendar({
  systemStartDate,
  lastCleaningDate,
  plants,
  totalPlants,
  measurementHistory = [],
  onCleaningComplete,
}: MaintenanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getCleaningInterval = () => {
    if (totalPlants > 12) return 7
    if (totalPlants > 6) return 10
    return 14
  }

  const getNextCleaningDate = () => {
    if (!lastCleaningDate) return null
    const cleaningInterval = getCleaningInterval()
    const nextDate = new Date(lastCleaningDate)
    nextDate.setDate(nextDate.getDate() + cleaningInterval)
    return nextDate
  }

  const getDaysUntilCleaning = () => {
    if (!lastCleaningDate) return 0
    const cleaningInterval = getCleaningInterval()
    const daysSinceLastCleaning = Math.floor((Date.now() - lastCleaningDate.getTime()) / (24 * 60 * 60 * 1000))
    return Math.max(0, cleaningInterval - daysSinceLastCleaning)
  }

  const getMeasurementSchedule = () => {
    const month = currentMonth.getMonth()
    const isSummer = month >= 5 && month <= 8
    return {
      frequency: isSummer ? 2 : 1,
      isSummer,
      season: isSummer ? "Verano" : "Primavera/Otoño/Invierno",
    }
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }

  const isRecommendedMeasurementDay = (day: number) => {
    const schedule = getMeasurementSchedule()
    if (schedule.isSummer) {
      return true // Daily in summer
    }
    return day % 2 === 0 // Every other day in other seasons
  }

  const hasMeasurement = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return measurementHistory.some((m) => {
      const mDate = new Date(m.timestamp)
      return (
        mDate.getDate() === date.getDate() &&
        mDate.getMonth() === date.getMonth() &&
        mDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const isScheduledCleaningDay = (day: number) => {
    const nextCleaningDate = getNextCleaningDate()
    if (!nextCleaningDate) return false

    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return (
      date.getDate() === nextCleaningDate.getDate() &&
      date.getMonth() === nextCleaningDate.getMonth() &&
      date.getFullYear() === nextCleaningDate.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const calendarDays = generateCalendarDays()
  const schedule = getMeasurementSchedule()
  const daysUntilCleaning = getDaysUntilCleaning()
  const cleaningInterval = getCleaningInterval()

  return (
    <div className="space-y-6">
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Calendario de Mantenimiento
              </CardTitle>
              <CardDescription>{schedule.season} - Castellón, España</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-[140px] text-center">
                <p className="font-semibold">
                  {currentMonth.toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500" />
              <span className="text-muted-foreground">Medición recomendada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500" />
              <span className="text-muted-foreground">Medición efectuada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500" />
              <span className="text-muted-foreground">Limpieza prevista</span>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold py-2 text-secondary-foreground">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const recommended = isRecommendedMeasurementDay(day)
              const measured = hasMeasurement(day)
              const cleaning = isScheduledCleaningDay(day)
              const today = isToday(day)

              return (
                <div
                  key={day}
                  className={`
                    aspect-square p-1 rounded-lg border text-center relative
                    ${today ? "ring-2 ring-primary" : ""}
                    ${cleaning ? "bg-orange-500/10 border-orange-500" : ""}
                    ${measured ? "bg-green-500/10 border-green-500" : recommended ? "bg-blue-500/10 border-blue-500" : "border-border"}
                  `}
                >
                  <div className="text-sm font-medium">{day}</div>
                  <div className="flex flex-col items-center justify-center gap-0.5 mt-1">
                    {measured && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                    {cleaning && <Droplets className="w-3 h-3 text-orange-600" />}
                    {!measured && recommended && <AlertCircle className="w-3 h-3 text-blue-500/50" />}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary info */}
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frecuencia de mediciones:</span>
              <span className="font-medium">{schedule.frequency === 2 ? "2 veces al día" : "Diario"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Próxima limpieza en:</span>
              <span className={`font-medium ${daysUntilCleaning <= 2 ? "text-destructive" : ""}`}>
                {daysUntilCleaning} días
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Intervalo de limpieza:</span>
              <span className="font-medium">
                Cada {cleaningInterval} días ({totalPlants} plantas)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plantas activas:</span>
              <span className="font-medium">{totalPlants} de 18</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            Programa de Limpieza del Depósito
          </CardTitle>
          <CardDescription>Frecuencia adaptada según la carga de plantas en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Próxima Limpieza</h3>
              {daysUntilCleaning <= 2 ? (
                <Badge variant="destructive" className="text-sm">
                  Urgente - {daysUntilCleaning} días
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm">
                  En {daysUntilCleaning} días
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">
                  Día {cleaningInterval - daysUntilCleaning} de {cleaningInterval}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    daysUntilCleaning <= 2 ? "bg-destructive" : daysUntilCleaning <= 5 ? "bg-yellow-500" : "bg-primary"
                  }`}
                  style={{ width: `${((cleaningInterval - daysUntilCleaning) / cleaningInterval) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Procedimiento de Limpieza:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Vaciar completamente el depósito de 20 litros</li>
                <li>Limpiar las paredes y fondo con agua y jabón neutro</li>
                <li>Enjuagar abundantemente con agua limpia</li>
                <li>Desinfectar con peróxido de hidrógeno al 3% (opcional)</li>
                <li>Enjuagar de nuevo y secar bien</li>
                <li>Rellenar con 20 litros de agua limpia</li>
                <li>Ajustar pH al rango 5.5-6.5</li>
                <li>Añadir nutrientes High-Pro A/B y ajustar EC</li>
                <li>Verificar temperatura del agua (18-24°C)</li>
              </ol>
            </div>

            <Button onClick={onCleaningComplete} className="w-full" size="lg">
              <CheckCircle2 className="w-5 h-5 mr-2" />
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
        </CardContent>
      </Card>
    </div>
  )
}
