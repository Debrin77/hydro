"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Droplets, Activity, Thermometer, Beaker, CheckCircle2, ArrowRight } from "lucide-react"
import type { SystemParameters } from "@/app/page"

interface SetupWizardProps {
  onComplete: (params: SystemParameters) => void
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1)
  const [params, setParams] = useState<SystemParameters>({
    pH: 6.0,
    ec: 1.5,
    waterTemp: 20,
    waterVolume: 20,
    nutrientsA: 100,
    nutrientsB: 100,
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onComplete(params)
    }
  }

  const updateParam = (key: keyof SystemParameters, value: number) => {
    setParams({ ...params, [key]: value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Configuración Inicial del Sistema</CardTitle>
          <CardDescription>
            Paso {step} de {totalSteps}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <Droplets className="w-16 h-16 mx-auto mb-4 text-[rgba(33,23,230,1)]" />
                <h3 className="text-xl font-semibold mb-2">Llenar el Depósito</h3>
                <p className="text-muted-foreground">
                  Llena el depósito con agua limpia hasta alcanzar los 20 litros. Asegúrate de que el depósito esté
                  limpio y libre de residuos antes de llenarlo.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="waterVolume" className="flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Volumen de Agua (litros)
                </Label>
                <Input
                  id="waterVolume"
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={params.waterVolume}
                  onChange={(e) => updateParam("waterVolume", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">Capacidad máxima: 20 litros</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Consejos:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Usa agua filtrada o de calidad potable</li>
                  <li>Deja reposar el agua 24h si contiene cloro</li>
                  <li>Marca el nivel de 20L en el depósito</li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <Activity className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ajustar el pH</h3>
                <p className="text-muted-foreground">
                  Mide el pH del agua con un medidor y ajústalo al rango óptimo de 5.5-6.5 para el cultivo de lechugas.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="pH" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  pH del Agua
                </Label>
                <Input
                  id="pH"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={params.pH}
                  onChange={(e) => updateParam("pH", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rango óptimo: 5.5 - 6.5</span>
                  {params.pH >= 5.5 && params.pH <= 6.5 ? (
                    <span className="text-green-600 font-medium">✓ En rango óptimo</span>
                  ) : (
                    <span className="text-destructive font-medium">⚠ Fuera de rango</span>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Cómo ajustar el pH:</h4>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>
                    <strong>Para subir el pH:</strong> Añade bicarbonato de potasio gradualmente
                  </p>
                  <p>
                    <strong>Para bajar el pH:</strong> Añade ácido fosfórico o cítrico gradualmente
                  </p>
                  <p className="text-xs">Siempre añade pequeñas cantidades, mezcla y vuelve a medir</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <Beaker className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Añadir Nutrientes High-Pro A/B</h3>
                <p className="text-muted-foreground">
                  Añade los nutrientes High-Pro A y B en partes iguales. Nunca mezcles los concentrados directamente
                  entre sí.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="nutrientsA" className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    High-Pro A (ml)
                  </Label>
                  <Input
                    id="nutrientsA"
                    type="number"
                    min="0"
                    max="100"
                    value={params.nutrientsA}
                    onChange={(e) => updateParam("nutrientsA", Number.parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                  <div className="bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${params.nutrientsA}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="nutrientsB" className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    High-Pro B (ml)
                  </Label>
                  <Input
                    id="nutrientsB"
                    type="number"
                    min="0"
                    max="100"
                    value={params.nutrientsB}
                    onChange={(e) => updateParam("nutrientsB", Number.parseFloat(e.target.value) || 0)}
                    className="text-lg"
                  />
                  <div className="bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${params.nutrientsB}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Procedimiento:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Añade primero High-Pro A al agua y mezcla bien</li>
                  <li>Luego añade High-Pro B y mezcla nuevamente</li>
                  <li>Mide la EC para verificar concentración</li>
                  <li>EC objetivo para plantas jóvenes: 1.2-1.5 mS/cm</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Label htmlFor="ec" className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  EC Medida (mS/cm)
                </Label>
                <Input
                  id="ec"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={params.ec}
                  onChange={(e) => updateParam("ec", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">Rango inicial recomendado: 1.2 - 1.5 mS/cm</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <Thermometer className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verificar Temperatura</h3>
                <p className="text-muted-foreground">
                  Mide la temperatura del agua y asegúrate de que el calentador funcione si está por debajo de 20°C.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="waterTemp" className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Temperatura del Agua (°C)
                </Label>
                <Input
                  id="waterTemp"
                  type="number"
                  step="0.5"
                  min="0"
                  max="40"
                  value={params.waterTemp}
                  onChange={(e) => updateParam("waterTemp", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rango óptimo: 18 - 24°C</span>
                  {params.waterTemp >= 18 && params.waterTemp <= 24 ? (
                    <span className="text-green-600 font-medium">✓ Temperatura ideal</span>
                  ) : params.waterTemp < 18 ? (
                    <span className="text-destructive font-medium">❄️ Activar calentador</span>
                  ) : (
                    <span className="text-destructive font-medium">🔥 Enfriar agua</span>
                  )}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-6 rounded-lg">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center mb-2">Sistema Listo</h3>
                <p className="text-center text-muted-foreground mb-4">
                  Tu sistema hidropónico está configurado correctamente y listo para comenzar el cultivo.
                </p>

                <div className="bg-background p-4 rounded space-y-2 text-sm">
                  <h4 className="font-semibold">Resumen de configuración:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Volumen:</span>
                    <span className="font-medium">{params.waterVolume}L</span>
                    <span className="text-muted-foreground">pH:</span>
                    <span className="font-medium">{params.pH}</span>
                    <span className="text-muted-foreground">EC:</span>
                    <span className="font-medium">{params.ec} mS/cm</span>
                    <span className="text-muted-foreground">Temperatura:</span>
                    <span className="font-medium">{params.waterTemp}°C</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Próximos pasos:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Selecciona y planta tus primeras lechugas</li>
                  <li>Registra mediciones diarias de pH, EC y temperatura</li>
                  <li>Mantén el nivel de agua entre 15-20 litros</li>
                  <li>Programa limpiezas según el calendario</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Anterior
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {step === totalSteps ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completar Configuración
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
