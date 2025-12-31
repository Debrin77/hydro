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
  
  // Usamos strings para que el iPhone no bloquee la coma al escribir
  const [inputStates, setInputStates] = useState({
    pH: "6.0",
    ec: "1.5",
    waterTemp: "20",
    waterVolume: "20",
    nutrientsA: "100",
    nutrientsB: "100",
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  // Función para manejar el cambio de texto y limpiar la coma
  const handleTextChange = (key: string, value: string) => {
    // Permitimos números, puntos y comas
    if (/^[0-9]*[.,]?[0-9]*$/.test(value) || value === "") {
      setInputStates({ ...inputStates, [key]: value })
    }
  }

  // Convertimos a número real solo para mostrar avisos visuales (como el "En rango")
  const getNum = (val: string) => parseFloat(val.replace(',', '.')) || 0

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Al completar, enviamos todo convertido a números reales
      const finalParams: SystemParameters = {
        pH: getNum(inputStates.pH),
        ec: getNum(inputStates.ec),
        waterTemp: getNum(inputStates.waterTemp),
        waterVolume: getNum(inputStates.waterVolume),
        nutrientsA: getNum(inputStates.nutrientsA),
        nutrientsB: getNum(inputStates.nutrientsB),
      }
      onComplete(finalParams)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Configuración Inicial</CardTitle>
          <CardDescription> Paso {step} de {totalSteps} </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* PASO 1: VOLUMEN */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <Droplets className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">Llenar el Depósito</h3>
                <p className="text-muted-foreground text-sm">Llena con agua limpia hasta 20L.</p>
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Droplets className="w-4 h-4" /> Volumen (litros)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={inputStates.waterVolume}
                  onChange={(e) => handleTextChange("waterVolume", e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>
          )}

          {/* PASO 2: pH */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <Activity className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ajustar el pH</h3>
                <p className="text-muted-foreground text-sm">Rango óptimo: 5.5 - 6.5</p>
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Activity className="w-4 h-4" /> pH medido</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={inputStates.pH}
                  onChange={(e) => handleTextChange("pH", e.target.value)}
                  className="text-lg"
                />
                <div className="text-sm">
                  {getNum(inputStates.pH) >= 5.5 && getNum(inputStates.pH) <= 6.5 ? 
                    <span className="text-green-600">✓ Rango correcto</span> : 
                    <span className="text-destructive">⚠ Fuera de rango</span>}
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: NUTRIENTES Y EC */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <Beaker className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nutrientes y EC</h3>
                <p className="text-muted-foreground text-sm">Añade Hy-Pro A/B y mide la EC final.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nutriente A (ml)</Label>
                  <Input type="text" inputMode="decimal" value={inputStates.nutrientsA} onChange={(e) => handleTextChange("nutrientsA", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nutriente B (ml)</Label>
                  <Input type="text" inputMode="decimal" value={inputStates.nutrientsB} onChange={(e) => handleTextChange("nutrientsB", e.target.value)} />
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <Label className="flex items-center gap-2"><Activity className="w-4 h-4 text-yellow-500" /> EC Final Medida (mS/cm)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={inputStates.ec}
                  onChange={(e) => handleTextChange("ec", e.target.value)}
                  className="text-lg border-yellow-200"
                />
              </div>
            </div>
          )}

          {/* PASO 4: TEMPERATURA */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <Thermometer className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Temperatura</h3>
                <p className="text-muted-foreground text-sm">Ideal: 18°C - 24°C</p>
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Thermometer className="w-4 h-4" /> Temp. Agua (°C)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={inputStates.waterTemp}
                  onChange={(e) => handleTextChange("waterTemp", e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-center text-green-800 dark:text-green-200">¡TODO LISTO!</h4>
                <p className="text-xs text-center text-green-700 mt-1">Pulsa completar para empezar a plantar.</p>
              </div>
            </div>
          )}

          {/* BOTONES DE NAVEGACIÓN */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Anterior
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 bg-green-600 hover:bg-green-700">
              {step === totalSteps ? (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar</>
              ) : (
                <><ArrowRight className="w-4 h-4 ml-2" /> Siguiente</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
