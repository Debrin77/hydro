// ============================================================================
// REESTRUCTURACIÓN COMPLETA DEL CÓDIGO CON LAS NUEVAS PESTAÑAS
// ============================================================================

"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, 
  Thermometer, Zap, ShieldAlert, ChevronRight, Anchor, 
  ArrowLeft, ArrowRight, Bell, CloudRain, ThermometerSun, 
  RefreshCw, Skull, Info, Calculator, Filter, 
  Power, Timer, Gauge, Cloud, Sun, Moon, CloudSun, 
  WindIcon, Clipboard, ThermometerSnowflake, TreePine, Settings,
  Home, BarChart3, X, RotateCcw, AlertCircle,
  Droplet, Leaf, TimerReset, ThermometerCold,
  ChevronDown, ChevronUp, Eye, EyeOff, CloudRain as Rain,
  Thermometer as Temp, Wind as Breeze, Target,
  Brain, AlertOctagon, Waves, GitCompare, BarChart,
  Ruler, Droplets as Water, Edit3, Save
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

// ... (TODAS LAS CONFIGURACIONES BASE SE MANTIENEN IGUAL) ...
// (WATER_TYPES, VARIETIES, ROCKWOOL_CHARACTERISTICS, etc.)
// Aquí agrego las configuraciones base que faltaban para que funcione:
const WATER_TYPES = {
  bajo_mineral: { name: "Agua baja en minerales", ec: 50 },
  osmosis: { name: "Agua de ósmosis", ec: 10 },
};

const VARIETIES = {
  lettuce: { name: "Lechuga", targetEC: 1400, targetPH: 6.0 },
};

const ROCKWOOL_CHARACTERISTICS = {
  size: "2.5x2.5cm",
  moisture: 70,
};

// ============================================================================
// COMPONENTE PRINCIPAL REESTRUCTURADO
// ============================================================================

export default function HydroAppFinal() {
  // Estados principales
  const [step, setStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [tab, setTab] = useState("dashboard");
  const [selPos, setSelPos] = useState(null);
  const [showWaterSelector, setShowWaterSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedTips, setExpandedTips] = useState({});
  
  // Configuración del sistema - AHORA CON MÁS CONTROL
  const [config, setConfig] = useState({ 
    // Valores medidos manualmente
    ph: "6.0",
    ec: "1200",
    temp: "22",
    currentVol: "20",
    totalVol: "20",
    
    // Objetivos
    targetEC: "1400",
    targetPH: "6.0",
    
    // Configuración agua
    waterType: "bajo_mineral",
    useOsmosisMix: false,
    osmosisMixPercentage: 0,
    waterNotes: "",
    hasHeater: true,
    
    // Parámetros adicionales
    humidity: "65",
    lightHours: "12"
  });
  
  // Configuración de riego - MÁS DETALLADA
  const [irrigationConfig, setIrrigationConfig] = useState({
    enabled: true,
    mode: "auto",
    // Parámetros manuales
    pumpTime: 10,
    interval: 30,
    // Parámetros calculados automáticamente
    calculatedPumpTime: 10,
    calculatedInterval: 30,
    // Configuración avanzada
    showAdvanced: false,
    customSchedule: false,
    // Notas
    notes: ""
  });

  // Estado para controlar si estamos editando valores manualmente
  const [editingPH, setEditingPH] = useState(false);
  const [editingEC, setEditingEC] = useState(false);
  const [editingVolume, setEditingVolume] = useState(false);
  
  // =================== FUNCIONES PARA EDICIÓN MANUAL ===================
  
  const handleManualPHChange = (value) => {
    setConfig({...config, ph: value});
    // Guardar en historial
    const now = new Date().toISOString();
    setHistory([{
      id: generatePlantId(),
      date: now,
      ph: value,
      ec: config.ec,
      temp: config.temp,
      notes: "Medición manual de pH"
    }, ...history.slice(0, 49)]); // Mantener solo últimas 50
  };
  
  const handleManualECChange = (value) => {
    setConfig({...config, ec: value});
    const now = new Date().toISOString();
    setHistory([{
      id: generatePlantId(),
      date: now,
      ph: config.ph,
      ec: value,
      temp: config.temp,
      notes: "Medición manual de EC"
    }, ...history.slice(0, 49)]);
  };
  
  const handleManualVolumeChange = (value) => {
    setConfig({...config, currentVol: value});
  };
  
  // =================== CÁLCULOS (MANTENER FUNCIONES EXISTENTES) ===================
  
  // ... (TODAS LAS FUNCIONES DE CÁLCULO SE MANTIENEN) ...
  // calculateSystemEC, calculateCannaDosage, etc.
  // Aquí agrego las funciones faltantes para que funcione:
  const generatePlantId = () => Date.now().toString();
  const calculateSystemEC = (plants, volume, waterType) => {
    const baseEC = WATER_TYPES[waterType]?.ec || 50;
    const plantCount = plants.length;
    const targetEC = plantCount > 0 ? VARIETIES[plants[0]?.v]?.targetEC || 1400 : 1400;
    return { targetEC, currentEC: baseEC + (plantCount * 50) };
  };
  const calculateCannaDosage = (plants, volume) => {
    const plantCount = plants.length;
    const baseDosage = { a: 5, b: 5 };
    const totalA = (baseDosage.a * volume) / 10;
    const totalB = (baseDosage.b * volume) / 10;
    return { a: Math.round(totalA), b: Math.round(totalB), per10L: baseDosage };
  };

  // Estados calculados agregados para que funcione
  const alerts = useMemo(() => {
    const newAlerts = [];
    if (parseFloat(config.ph) < 5.5) newAlerts.push({ title: 'pH Bajo', description: 'El pH está por debajo de 5.5. Añade pH+ para subirlo.', color: 'bg-red-500', icon: '⚠️', priority: 1 });
    if (parseFloat(config.ph) > 6.5) newAlerts.push({ title: 'pH Alto', description: 'El pH está por encima de 6.5. Añade pH- para bajarlo.', color: 'bg-red-500', icon: '⚠️', priority: 1 });
    if (parseFloat(config.ec) > parseFloat(config.targetEC) + 300) newAlerts.push({ title: 'EC Alta', description: 'La EC es demasiado alta. Diluye con agua.', color: 'bg-amber-500', icon: '⚠️', priority: 2 });
    if (parseFloat(config.temp) > 28) newAlerts.push({ title: 'Temperatura Alta', description: 'La temperatura del agua supera 28°C.', color: 'bg-red-500', icon: '🌡️', priority: 1 });
    return newAlerts;
  }, [config]);

  const irrigationData = useMemo(() => {
    const plantCount = plants.length;
    const volume = parseFloat(config.currentVol);
    const pumpTime = irrigationConfig.pumpTime;
    const interval = irrigationConfig.interval;
    const cyclesPerDay = Math.round(1440 / interval);
    const totalWaterPerDay = (pumpTime * cyclesPerDay * 0.1) / 1000;
    const waterPerCycle = (pumpTime * 0.1);
    const rockwoolMoisture = 70;
    const dayCycles = Math.round(cyclesPerDay * 0.6);
    const nightCycles = cyclesPerDay - dayCycles;
    const season = new Date().getMonth() < 3 || new Date().getMonth() > 9 ? 'winter' : 'summer';
    const stats = {
      seedlingCount: plants.filter(p => p.level === 'N1').length,
      growthCount: plants.filter(p => p.level === 'N2').length,
      matureCount: plants.filter(p => p.level === 'N3').length,
    };
    const recommendations = [
      { icon: '💧', text: `Con ${plantCount} plantas, riega ${cyclesPerDay} veces al día.` },
      { icon: '🌡️', text: `Mantén la humedad de los dados de lana de roca al ${rockwoolMoisture}%.` },
    ];
    return { season, stats, pumpTime, interval, cyclesPerDay, totalWaterPerDay, recommendations, waterPerCycle, rockwoolMoisture, dayCycles, nightCycles };
  }, [plants, config, irrigationConfig]);

  const cannaDosage = useMemo(() => calculateCannaDosage(plants, parseFloat(config.currentVol)), [plants, config]);

  const phAdjustmentWithPretreatment = useMemo(() => {
    const diff = parseFloat(config.targetPH) - parseFloat(config.ph);
    const volume = parseFloat(config.currentVol);
    const phMinus = diff < 0 ? Math.abs(diff) * volume * 0.5 : 0;
    const phPlus = diff > 0 ? diff * volume * 0.5 : 0;
    return { phMinus: Math.round(phMinus), phPlus: Math.round(phPlus) };
  }, [config]);

  const calmagNeeded = useMemo(() => {
    const needed = config.waterType === 'osmosis';
    return { required: needed, dosage: needed ? Math.round(parseFloat(config.currentVol) * 0.5) : 0, reason: needed ? 'Agua de ósmosis necesita CalMag para minerales.' : '' };
  }, [config]);

  const waterCharacteristics = useMemo(() => WATER_TYPES[config.waterType] || { name: 'Desconocido' }, [config]);

  const rockwoolSchedule = useMemo(() => ({
    seedling: { day: 10, night: 15 },
    growth: { day: 15, night: 20 },
    mature: { day: 20, night: 25 }
  }), []);

  // =================== COMPONENTES DE PESTAÑAS REORGANIZADAS ===================

  // 1. 📊 PANEL PRINCIPAL
  const DashboardTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-600">Resumen general del sistema</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={
            irrigationData.season === "summer" ? "bg-amber-100 text-amber-800" :
            irrigationData.season === "winter" ? "bg-blue-100 text-blue-800" :
            "bg-green-100 text-green-800"
          }>
            {irrigationData.season === "summer" ? "Verano Castellón" :
             irrigationData.season === "winter" ? "Invierno Castellón" :
             "Primavera/Otoño Castellón"}
          </Badge>
        </div>
      </div>
      
      {/* ALERTAS */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">⚠️ Alertas del Sistema</h2>
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`${alert.color} text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg`}
            >
              <div className="flex-shrink-0">
                {alert.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{alert.title}</h3>
                  <span className="text-2xl font-bold">{alert.value}</span>
                </div>
                <p className="text-white/90 mt-1">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sprout className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Estado del Cultivo</h3>
              <p className="text-sm text-slate-600">Sistema 5-5-5</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Plántulas (N1)</span>
              <span className="font-bold text-cyan-600">{irrigationData.stats.seedlingCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Crecimiento (N2)</span>
              <span className="font-bold text-green-600">{irrigationData.stats.growthCount}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Maduras (N3)</span>
              <span className="font-bold text-emerald-600">{irrigationData.stats.matureCount}/5</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex justify-between">
              <span class
