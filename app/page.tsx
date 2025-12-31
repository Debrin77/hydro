"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Activity, Layers, Beaker, Calendar, History, Plus, Droplets, AlertTriangle } from "lucide-react"
import SetupWizard from "@/components/setup-wizard"
import TowerVisualizer from "@/components/tower-visualizer"
import MeasurementInput from "@/components/measurement-input"
import MaintenanceCalendar from "@/components/maintenance-calendar"
import HistoryLog from "@/components/history-log"
import PlantManagement from "@/components/plant-management"
import SystemOverview from "@/components/system-overview"
import PumpControl from "@/components/pump-control"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type LettuceVariety = "Romana" | "Iceberg" | "Hoja de Roble" | "Lollo Rosso" | "Trocadero"
export type PlantStage = "young" | "medium" | "harvest"

export interface Plant {
  id: string
  variety: LettuceVariety
  level: number
  position: number
  weeksSincePlanted: number
  plantedDate: Date
  stage: PlantStage
}

export interface SystemParameters {
  pH: number
  ec: number
  waterTemp: number
  waterVolume: number
  nutrientsA: number
  nutrientsB: number
}

export interface MeasurementRecord {
  id: string
  timestamp: Date
  pH: number
  ec: number
  waterTemp: number
  waterVolume: number
  inRange: boolean
  correctiveActions?: string[]
}

export interface ActionLog {
  id: string
  timestamp: Date
  type: "measurement" | "planting" | "harvest" | "cleaning" | "correction" | "nutrient_add"
  description: string
  details?: any
}

export interface LettuceInfo {
  name: LettuceVariety
  weeksToHarvest: number
  optimalPH: [number, number]
  optimalEC: [number, number]
  optimalTemp: [number, number]
  description: string
}

export const lettuceData: Record<LettuceVariety, LettuceInfo> = {
  Romana: {
    name: "Romana",
    weeksToHarvest: 6,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Lechuga crujiente de hojas alargadas",
  },
  Iceberg: {
    name: "Iceberg",
    weeksToHarvest: 8,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Lechuga compacta y crujiente",
  },
  "Hoja de Roble": {
    name: "Hoja de Roble",
    weeksToHarvest: 5,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Hojas onduladas y suaves",
  },
  "Lollo Rosso": {
    name: "Lollo Rosso",
    weeksToHarvest: 5,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Lechuga roja de hojas rizadas",
  },
  Trocadero: {
    name: "Trocadero",
    weeksToHarvest: 6,
    optimalPH: [5.5, 6.5],
    optimalEC: [1.2, 2.0],
    optimalTemp: [18, 24],
    description: "Lechuga mantecosa de hojas tiernas",
  },
}

export default function HydroponicTowerApp() {
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [isFirstSetup, setIsFirstSetup] = useState(false)
  const [plants, setPlants] = useState<Plant[]>([])
  const [parameters, setParameters] = useState<SystemParameters>({
    pH: 6.0,
    ec: 1.5,
    waterTemp: 20,
    waterVolume: 20,
    nutrientsA: 100,
    nutrientsB: 100,
  })
  const [systemStartDate, setSystemStartDate] = useState<Date | null>(null)
  const [lastCleaningDate, setLastCleaningDate] = useState<Date | null>(null)
  const [measurementHistory, setMeasurementHistory] = useState<MeasurementRecord[]>([])
  const [actionLog, setActionLog] = useState<ActionLog[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const savedData = localStorage.getItem("hydroponicTowerData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setIsSetupComplete(data.isSetupComplete || false)
      setIsFirstSetup(data.isFirstSetup || false)
      setPlants(
        (data.plants || []).map((p: Plant) => ({
          ...p,
          plantedDate: new Date(p.plantedDate),
        })),
      )
      setParameters(
        data.parameters || {
          pH: 6.0,
          ec: 1.5,
          waterTemp: 20,
          waterVolume: 20,
          nutrientsA: 100,
          nutrientsB: 100,
        },
      )
      setSystemStartDate(data.systemStartDate ? new Date(data.systemStartDate) : null)
      setLastCleaningDate(data.lastCleaningDate ? new Date(data.lastCleaningDate) : null)
      setMeasurementHistory(
        (data.measurementHistory || []).map((m: MeasurementRecord) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      )
      setActionLog(
        (data.actionLog || []).map((a: ActionLog) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        })),
      )
    }
  }, [])

  useEffect(() => {
    if (isSetupComplete) {
      const dataToSave = {
        isSetupComplete,
        isFirstSetup,
        plants,
        parameters,
        systemStartDate,
        lastCleaningDate,
        measurementHistory,
        actionLog,
      }
      localStorage.setItem("hydroponicTowerData", JSON.stringify(dataToSave))
    }
  }, [
    isSetupComplete,
    isFirstSetup,
    plants,
    parameters,
    systemStartDate,
    lastCleaningDate,
    measurementHistory,
    actionLog,
  ])

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPlants((prevPlants) =>
        prevPlants.map((plant) => {
          const weeksPassed = Math.floor((Date.now() - plant.plantedDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
          const info = lettuceData[plant.variety]

          let stage: PlantStage = "young"
          if (weeksPassed >= info.weeksToHarvest) {
            stage = "harvest"
