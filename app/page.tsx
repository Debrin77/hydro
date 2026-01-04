"use client";
import React, { useState, useEffect, useMemo } from "react"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lock, Lightbulb, Scissors, Clock, AlertTriangle, Wind, 
  Droplets, Thermometer, Zap, ShieldAlert, ChevronRight, 
  Anchor, ArrowLeft, ArrowRight, Bell, CloudRain, 
  ThermometerSun, RefreshCw, Skull, Info, Leaf
} from "lucide-react"

// ==================== BASE DE DATOS DE VARIEDADES ====================
const VARIETIES = {
  "Iceberg": { 
    color: "bg-cyan-500",
    ecMax: 1.6,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 6, b: 6, ec: 0.7 },
      growth:   { a: 10, b: 10, ec: 1.1 },
      mature:   { a: 14, b: 14, ec: 1.6 }
    },
    info: "Sensible al exceso de sales."
  },
  "Lollo Rosso": { 
    color: "bg-purple-600",
    ecMax: 1.8,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 8, b: 8, ec: 0.9 },
      growth:   { a: 13, b: 13, ec: 1.3 },
      mature:   { a: 17, b: 17, ec: 1.8 }
    },
    info: "Color intenso con EC alta."
  },
  "Maravilla": { 
    color: "bg-amber-600",
    ecMax: 1.7,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 7, b: 7, ec: 0.8 },
      growth:   { a: 12, b: 12, ec: 1.2 },
      mature:   { a: 16, b: 16, ec: 1.7 }
    },
    info: "Clásica de alto rendimiento."
  },
  "Trocadero": { 
    color: "bg-lime-600",
    ecMax: 1.6,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 6, b: 6, ec: 0.7 },
      growth:   { a: 11, b: 11, ec: 1.1 },
      mature:   { a: 15, b: 15, ec: 1.6 }
    },
    info: "Sabor suave. Cuidado en plántula."
  },
  "Hoja de Roble Rojo": { 
    color: "bg-red-600",
    ecMax: 1.9,
    phIdeal: 6.0,
    hyproDosage: {
      seedling: { a: 9, b: 9, ec: 0.9 },
      growth:   { a: 14, b: 14, ec: 1.4 },
      mature:   { a: 18, b: 18, ec: 1.9 }
    },
    info: "Crecimiento rápido, tolera EC alta."
  }
}

// ==================== FUNCIONES DE CÁLCULO ====================
const calculateOptimalValues = (plants, currentVolume, totalVolume) => {
  if (!plants || plants.length === 0) {
    return { 
      targetEC: "0.8", 
      targetPH: "6.0",
      statistics: { totalPlants: 0, seedlingCount: 0, growthCount: 0, matureCount: 0 }
    }
  }
  
  let totalECWeighted = 0
  let totalPH = 0
  let seedlingCount = 0, growthCount = 0, matureCount = 0
  
  plants.forEach(plant => {
    const variety = VARIETIES[plant.v]
    if (!variety) return
    
    let weight
    if (plant.l === 1) { 
      weight = 0.35
      seedlingCount++
    } else if (plant.l === 2) { 
      weight = 0.75
      growthCount++
    } else { 
      weight = 1.0
      matureCount++
    }
    
    totalECWeighted += variety.ecMax * weight
    totalPH += variety.phIdeal
  })
  
  let systemEC = totalECWeighted / plants.length
  const systemPH = totalPH / plants.length
  
  const seedlingRatio = seedlingCount / plants.length
  if (seedlingRatio > 0.5) systemEC *= 0.85
  
  const volumeRatio = currentVolume / totalVolume
  if (volumeRatio < 0.3) systemEC *= 0.9
  else if (volumeRatio < 0.5) systemEC *= 0.95
  
  if (matureCount > seedlingCount * 2) systemEC *= 1.1
  
  systemEC = Math.max(0.6, Math.min(2.0, systemEC))
  
  return {
    targetEC: systemEC.toFixed(2),
    targetPH: systemPH.toFixed(1),
    statistics: { totalPlants: plants.length, seedlingCount, growthCount, matureCount }
  }
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function HydroApp() {
  const [step, setStep] = useState(0)
  const [plants, setPlants] = useState([])
  const [history, setHistory] = useState([])
  const [lastRot, setLastRot] = useState(new Date().toISOString())
  const [lastClean, setLastClean] = useState(new Date().toISOString())
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20", 
    ph: "6.0", 
    ec: "1.2", 
    temp: "22",
    targetEC: "1.4", 
    targetPH: "6.0"
  })
  const [tab, setTab] = useState("overview")
  const [selPos, setSelPos] = useState(null)

  // Cálculo en tiempo real
  const currentOptimalValues = useMemo(() => {
    return calculateOptimalValues(
      plants,
      parseFloat(config.currentVol) || 0,
      parseFloat(config.totalVol) || 20
    )
  }, [plants, config.currentVol, config.totalVol])

  // Cargar datos guardados
  useEffect(() => {
    const saved = localStorage.getItem("hydro_master")
    if (saved) {
      try {
        const d = JSON.parse(saved)
        setPlants(d.plants || [])
        setConfig(d.config || config)
        setHistory(d.history || [])
        setLastRot(d.lastRot || new Date().toISOString())
        setLastClean(d.lastClean || new Date().toISOString())
        setStep(3)
      } catch (e) {
        console.log("Primer inicio sin datos guardados")
      }
    }
  }, [])

  // Guardar automáticamente
  useEffect(() => {
    if (step >= 2) {
      localStorage.setItem("hydro_master", 
        JSON.stringify({ 
          plants, 
          config: {
            ...config,
            targetEC: currentOptimalValues.targetEC,
            targetPH: currentOptimalValues.targetPH
          }, 
          history, 
          lastRot, 
          lastClean 
        })
      )
    }
  }, [plants, config, history, lastRot, lastClean, step, currentOptimalValues])

  // Actualizar EC objetivo (solo en modo operativo)
  useEffect(() => {
    if (step >= 3 && plants.length > 0) {  // Cambiado de 2 a 3
      setConfig(prev => ({
        ...prev,
        targetEC: currentOptimalValues.targetEC,
        targetPH: currentOptimalValues.targetPH
      }))
    }
  }, [currentOptimalValues, step, plants.length])

  // ==================== PANTALLA 1: VOLUMEN ====================
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-12 bg-white rounded-[4rem] text-center border-b-8 border-cyan-500 shadow-2xl">
          <div className="mx-auto mb-8 w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <Droplets className="text-white" size={48} />
          </div>
          
          <h1 className="text-3xl font-black mb-2 text-slate-800 uppercase italic">HydroCaru</h1>
          <p className="text-sm font-bold mb-10 text-slate-400 uppercase tracking-widest">Configuración Inicial</p>
          
          <div className="mb-10">
            <h2 className="text-2xl font-black mb-4 text-cyan-700">PASO 1: CONFIGURAR DEPÓSITO</h2>
            <p className="text-sm font-bold mb-6 text-slate-500">Capacidad total de agua (Litros)</p>
            
            <div className="relative">
              <input 
                type="number" 
                value={config.totalVol} 
                onChange={e => setConfig({
                  ...config, 
                  totalVol: e.target.value, 
                  currentVol: e.target.value
                })} 
                className="w-full p-8 bg-gradient-to-b from-slate-50 to-white border-4 border-cyan-100 rounded-[3rem] text-6xl font-black text-center text-cyan-800 shadow-inner"
                placeholder="20"
                min="5"
                max="100"
              />
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <span className="text-2xl font-black text-cyan-400">L</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (parseFloat(config.totalVol) < 5) {
                alert("Por favor, introduce un volumen válido (mínimo 5L)")
                return
              }
              setStep(1)
            }} 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl flex items-center justify-center gap-3 hover:shadow-3xl transition-all"
          >
            Continuar a Selección de Plantas
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    )
  }

  // ==================== PANTALLA 2: SELECCIÓN DE 6 PLÁNTULAS ====================
  if (step === 1) {
    const level1Plants = plants.filter(p => p.l === 1)
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-10 bg-white rounded-[4rem] shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <button onClick={() => setStep(0)} className="p-3 bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-500" size={24} />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-black uppercase italic text-emerald-700">PASO 2: PRIMERAS 6 PLÁNTULAS</h2>
              <p className="text-sm font-bold text-slate-400">Selecciona variedades para el Nivel 1</p>
            </div>
            
            <div className="w-12"></div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-emerald-600 uppercase">
                {level1Plants.length}/6 Seleccionadas
              </span>
              <div className={`px-4 py-1 rounded-full font-black ${level1Plants.length === 6 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {level1Plants.length === 6 ? 'Completo' : 'Pendiente'}
              </div>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300"
                style={{ width: `${(level1Plants.length / 6) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-10">
            <div className="bg-gradient-to-b from-emerald-100 to-green-50 p-8 rounded-[3rem] border-4 border-emerald-200 shadow-inner">
              <div className="grid grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(position => {
                  const plant = plants.find(p => p.l === 1 && p.p === position)
                  
                  return (
                    <button
                      key={position}
                      onClick={() => {
                        if (plant) {
                          setPlants(plants.filter(p => p.id !== plant.id))
                        } else if (level1Plants.length < 6) {
                          setSelPos({ l: 1, p: position })
                        } else {
                          alert("Ya tienes 6 plántulas. Elimina una primero.")
                        }
                      }}
                      className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center border-4 relative transition-all ${
                        plant 
                          ? `${VARIETIES[plant.v].color} border-white shadow-xl scale-105` 
                          : 'bg-gradient-to-b from-white to-slate-50 border-emerald-100'
                      }`}
                    >
                      {plant ? (
                        <>
                          <Leaf className="text-white" size={32} />
                          <span className="text-[9px] font-black text-white absolute bottom-2 uppercase px-2 truncate w-full text-center">
                            {plant.v}
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="text-emerald-300" size={28} />
                          <span className="text-[10px] font-black text-emerald-400 mt-2 uppercase">
                            Pos {position}
                          </span>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* CÁLCULO EN TIEMPO REAL */}
            {level1Plants.length > 0 && (
              <div className="mt-6 p-6 rounded-[2.5rem] bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase text-slate-400 mb-1">
                      EC CALCULADA EN TIEMPO REAL
                    </p>
                    <p className="text-4xl font-black italic text-blue-700 leading-none">
                      {calculateOptimalValues(
                        level1Plants,
                        parseFloat(config.currentVol),
                        parseFloat(config.totalVol)
                      ).targetEC} mS/cm
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      Para {level1Plants.length} plántulas con {config.currentVol}L/{config.totalVol}L
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow">
                    <RefreshCw className="text-blue-500" size={32} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              if (level1Plants.length === 6) {
                setStep(2)
              } else {
                alert(`Necesitas seleccionar 6 plántulas. Tienes ${level1Plants.length}/6.`)
              }
            }}
            disabled={level1Plants.length !== 6}
            className={`w-full p-8 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl flex items-center justify-center gap-3 ${
              level1Plants.length === 6
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-3xl'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {level1Plants.length === 6 ? (
              <>
                <span>Ver Resumen y Comenzar</span>
                <ArrowRight size={24} />
              </>
            ) : (
              `Selecciona ${6 - level1Plants.length} más`
            )}
          </button>
        </div>
      </div>
    )
  }

  // ==================== PANTALLA 3: RESUMEN FINAL ====================
  if (step === 2) {
    const level1Plants = plants.filter(p => p.l === 1)
    const initialValues = calculateOptimalValues(
      level1Plants,
      parseFloat(config.currentVol),
      parseFloat(config.totalVol)
    )
    
    const handleActivateSystem = () => {
      // Crear la configuración actualizada primero
      const updatedConfig = {
        ...config,
        targetEC: initialValues.targetEC,
        targetPH: initialValues.targetPH,
        ec: initialValues.targetEC
      }
      
      // Actualizar el estado de configuración
      setConfig(updatedConfig)
      
      // Crear el registro histórico con los valores correctos
      const initialRecord = {
        ...updatedConfig,
        id: Date.now(),
        d: new Date().toLocaleString(),
        note: "Inicio del sistema - 6 plántulas"
      }
      
      // Actualizar el historial
      setHistory([initialRecord, ...history])
      
      // Cambiar a la pantalla principal
      setStep(3)
      setTab("overview")
      
      setTimeout(() => {
        alert("✅ Sistema iniciado!\n\nLa app ajustará automáticamente los valores según:\n• Crecimiento de plantas\n• Cambios en volumen\n• Rotaciones semanales")
      }, 300)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-12 bg-white rounded-[4rem] shadow-2xl">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
              <Check className="text-white" size={36} />
            </div>
            
            <h2 className="text-3xl font-black uppercase italic text-emerald-700 mb-3">
              ¡Sistema Listo!
            </h2>
            <p className="text-sm font-bold text-slate-400">
              Valores calculados para tu configuración inicial
            </p>
          </div>
          
          <div className="p-8 rounded-[3rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 mb-6">
            <div className="mb-6">
              <p className="text-[12px] font-black uppercase text-slate-400 mb-1">
                VALORES CALCULADOS
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-5xl font-black italic text-emerald-700 leading-none">
                    {initialValues.targetEC}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500">EC (mS/cm)</p>
                </div>
                <div>
                  <p className="text-5xl font-black italic text-emerald-700 leading-none">
                    {initialValues.targetPH}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500">pH</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-500 mt-4">
                Para 6 plántulas con {config.currentVol}L de {config.totalVol}L total
              </p>
            </div>
          </div>
          
          <button
            onClick={handleActivateSystem}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white p-9 rounded-[2.5rem] font-black uppercase text-2xl shadow-2xl hover:shadow-3xl transition-all active:scale-95"
          >
            Activar Sistema Inteligente
          </button>
        </div>
      </div>
    )
  }

  // ==================== PANEL PRINCIPAL ====================
  
  // Generar alertas
  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0
    const vTot = parseFloat(config.totalVol) || 20
    const ph = parseFloat(config.ph) || 6.0
    const ec = parseFloat(config.ec) || 0
    const tEc = parseFloat(config.targetEC) || 1.4
    const tPh = parseFloat(config.targetPH) || 6.0
    const temp = parseFloat(config.temp) || 20
    const res = []

    if (vAct < vTot * 0.3) {
      res.push({ 
        t: "¡AGUA MUY BAJA!", 
        v: `${(vTot - vAct).toFixed(1)}L`, 
        d: `Crítico: Solo queda un ${(vAct/vTot*100).toFixed(0)}%`, 
        c: "bg-gradient-to-r from-red-600 to-rose-700 animate-pulse",
        icon: <Droplets className="text-white" size={28} />
      })
    } 
    else if (vAct < vTot * 0.5) {
      res.push({ 
        t: "RELLENAR AGUA", 
        v: `${(vTot - vAct).toFixed(1)}L`, 
        d: `Depósito al ${(vAct/vTot*100).toFixed(0)}%`, 
        c: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: <CloudRain className="text-white" size={28} />
      })
    }

    if (temp > 28) {
      res.push({ 
        t: "¡PELIGRO TEMPERATURA!", 
        v: `${temp}°C`, 
        d: "Añadir hielo YA", 
        c: "bg-gradient-to-r from-red-700 to-pink-800 animate-pulse",
        icon: <ThermometerSun className="text-white" size={28} />
      })
    } 
    else if (temp > 25) {
      res.push({ 
        t: "TEMPERATURA ALTA", 
        v: `${temp}°C`, 
        d: "Oxígeno bajo. Considera añadir hielo", 
        c: "bg-gradient-to-r from-orange-500 to-red-500",
        icon: <Thermometer className="text-white" size={28} />
      })
    }

    if (ph > tPh + 0.5 || ph < tPh - 0.5) {
      const diff = Math.abs(ph - tPh)
      const ml = (diff * 10 * vAct * 0.15).toFixed(1)
      const action = ph > tPh ? "pH-" : "pH+"
      res.push({ 
        t: `AJUSTE ${action} URGENTE`, 
        v: `${ml}ml`, 
        d: `pH ${ph} → ${tPh}`, 
        c: "bg-gradient-to-r from-purple-700 to-pink-700 animate-pulse",
        icon: <RefreshCw className="text-white" size={28} />
      })
    }

    if (ec < tEc - 0.4 && ec > 0) {
      const ml = (((tEc - ec) / 0.1) * vAct * 0.25).toFixed(1)
      res.push({ 
        t: "¡FALTAN NUTRIENTES!", 
        v: `${ml}ml A+B`, 
        d: `EC ${ec} (muy baja)`, 
        c: "bg-gradient-to-r from-blue-800 to-cyan-800 animate-pulse",
        icon: <FlaskConical className="text-white" size={28} />
      })
    }

    return res
  }, [config, lastClean])

  // Función de rotación
  const handleRotation = () => {
    if (confirm("¿ROTAR NIVELES?\n• Nivel 3 → Cosecha\n• Nivel 2 → Nivel 3\n• Nivel 1 → Nivel 2\n• Nuevas plántulas en Nivel 1")) {
      const withoutMature = plants.filter(p => p.l !== 3)
      const moved = withoutMature.map(p => ({ ...p, l: p.l + 1 }))
      setPlants(moved)
      setLastRot(new Date().toISOString())
      alert("✅ Rotación completada")
      setTab("overview")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black italic text-green-700 leading-none uppercase">HydroCaru</h1>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic">Cultivo Inteligente</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-lg">
            {config.currentVol}L/{config.totalVol}L
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        {/* Pestañas simplificadas */}
        <div className="grid grid-cols-6 bg-white border-4 border-slate-100 shadow-xl rounded-[2.5rem] mb-8 h-18 p-1">
          <button onClick={() => setTab("overview")} className={`rounded-[2rem] flex items-center justify-center ${tab === "overview" ? "bg-slate-900 text-white" : "text-slate-400"}`}>
            <Activity size={20} />
          </button>
          <button onClick={() => setTab("measure")} className={`rounded-[2rem] flex items-center justify-center ${tab === "measure" ? "bg-slate-900 text-white" : "text-slate-400"}`}>
            <Beaker size={20} />
          </button>
          <button onClick={() => setTab("tower")} className={`rounded-[2rem] flex items-center justify-center ${tab === "tower" ? "bg-slate-900 text-white" : "text-slate-400"}`}>
            <Layers size={20} />
          </button>
          <button onClick={() => setTab("calendar")} className={`rounded-[2rem] flex items-center justify-center ${tab === "calendar" ? "bg-slate-900 text-white" : "text-slate-400"}`}>
            <Calendar size={20} />
          </button>
          <button onClick={() => setTab("tips")} className={`rounded-[2rem] flex items-center justify-center ${tab === "tips" ? "bg-slate-900 text-white" : "text-slate-400"}`}>
            <Lightbulb size={20} />
          </button>
          <button onClick={() => setTab("settings")} className={`rounded-[2rem] flex items-center justify-center ${tab === "settings" ? "bg-slate-900 text-white" : "text-slate-400"}`}>
            <Trash2 size={20} />
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="p-6 rounded-[2.5rem] bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    VALORES CALCULADOS ACTUALES
                  </p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-3xl font-black italic text-emerald-700">{config.targetEC} mS/cm</p>
                      <p className="text-[9px] text-slate-500">EC objetivo</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black italic text-emerald-700">{config.targetPH}</p>
                      <p className="text-[9px] text-slate-500">pH objetivo</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-2xl">
                  <RefreshCw className="text-emerald-500" size={24} />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Basado en {plants.length} plantas y {config.currentVol}L
              </p>
            </div>
            
            {/* Alertas */}
            {alerts.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Bell className="text-amber-600" size={18} />
                  <p className="text-[11px] font-black uppercase text-slate-500">ALERTAS ({alerts.length})</p>
                </div>
                {alerts.map((alert, i) => (
                  <div key={i} className={`${alert.c} text-white p-6 rounded-[2.5rem] flex items-center gap-5 border-none shadow-xl`}>
                    <div className="bg-white/20 p-3 rounded-2xl">
                      {alert.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black uppercase opacity-90 mb-1">{alert.t}</p>
                      <p className="text-2xl font-black italic leading-none mb-1">{alert.v}</p>
                      <p className="text-[10px] font-bold opacity-80">{alert.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center font-black text-green-700 border-4 border-green-100 bg-gradient-to-b from-green-50 to-emerald-50 rounded-[3rem]">
                <Check className="mx-auto mb-4 bg-white rounded-full p-4 text-green-600" size={50}/>
                <p className="text-xl mb-2">SISTEMA EN EQUILIBRIO</p>
                <p className="text-[12px] font-normal text-slate-600">Todos los parámetros óptimos</p>
              </div>
            )}
          </div>
        )}

        {/* MEDICIÓN */}
        {tab === "measure" && (
          <div className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH Medido</label>
                <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} 
                  className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC Medida</label>
                <input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} 
                  className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Litros actuales</label>
                <input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} 
                  className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black text-cyan-800" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temperatura °C</label>
                <input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} 
                  className="w-full p-5 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-3xl font-black text-orange-800" />
              </div>
            </div>
            
            <button onClick={() => { 
              setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history])
              setTab("overview")
              alert("✅ Medición registrada")
            }} className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl">
              Registrar Mediciones
            </button>
          </div>
        )}

        {/* TORRE */}
        {tab === "tower" && (
          <div className="space-y-6">
            <button onClick={handleRotation} className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-orange-500 to-red-500 text-white font-black flex items-center justify-center gap-4 shadow-2xl">
                <Scissors size={28}/> 
                <div className="text-left leading-none">
                  <p className="text-[10px] uppercase opacity-70 mb-1">Cosecha y Rotación</p>
                  <p className="text-xl uppercase italic">Rotar Niveles</p>
                </div>
            </button>
            
            {[1, 2, 3].map(l => (
              <div key={l}>
                <p className="text-[10px] font-black mb-3 px-4 flex justify-between uppercase italic text-slate-400">
                    <span>Nivel {l} {l===1?'(Siembra)':l===3?'(Cosecha)':'(Crecimiento)'}</span>
                    <div className="border-2 px-2 py-1 rounded-full">{plants.filter(p => p.l === l).length}/6</div>
                </p>
                <div className="bg-slate-200/50 p-5 rounded-[2.5rem] grid grid-cols-3 gap-4 border-4 border-white shadow-inner">
                  {[1, 2, 3, 4, 5, 6].map(p => {
                    const pl = plants.find(x => x.l === l && x.p === p)
                    return (
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} 
                        className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center border-4 relative transition-all ${
                          pl ? `${VARIETIES[pl.v].color} border-white shadow-xl scale-110` : 'bg-white border-slate-100 text-slate-100'
                        }`}>
                        {pl ? <Sprout size={28} className="text-white" /> : <Plus size={24} />}
                        {pl && <span className="text-[7px] font-black text-white absolute bottom-1 uppercase px-1 truncate w-full text-center leading-none">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CALENDARIO */}
        {tab === "calendar" && (
          <div className="space-y-6">
            <div className="p-8 rounded-[3.5rem] bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-2xl border-4 border-indigo-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black italic text-indigo-200 uppercase">Calendario</h3>
                <div className="bg-white/20 text-white px-3 py-1 rounded-full">
                  {plants.length} plantas
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {Array.from({length: 15}).map((_, i) => {
                  const day = i + 1
                  const isMed = day % 3 === 0
                  const isRot = day % 7 === 0
                  const isLim = day === 15
                  
                  return (
                    <div key={i} className={`relative rounded-xl p-3 text-center border-2 ${
                      isLim ? 'bg-gradient-to-b from-red-700 to-red-900 border-red-500' :
                      isRot ? 'bg-gradient-to-b from-orange-600 to-amber-800 border-orange-400' :
                      isMed ? 'bg-gradient-to-b from-blue-600 to-blue-800 border-blue-400' :
                      'bg-white/5 border-transparent'
                    }`}>
                      <p className={`text-lg font-black ${isLim || isRot || isMed ? 'text-white' : 'text-white/30'}`}>
                        {day}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONSEJOS */}
        {tab === "tips" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic text-slate-800 ml-4">Consejos</h2>
            
            <div className="rounded-[3rem] border-4 border-emerald-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white flex items-center gap-4">
                <Sprout size={30}/>
                <h3 className="font-black uppercase text-xs tracking-widest">CÁLCULO DINÁMICO</h3>
              </div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>• <span className="text-emerald-700 uppercase font-black">EC en tiempo real:</span> La app calcula constantemente la EC ideal basándose en el número real de plantas, sus variedades, etapas y volumen actual de agua.</p>
                <p>• <span className="text-emerald-700 uppercase font-black">Protección automática:</span> Si añades nuevas plántulas, la EC se reduce automáticamente para no quemar raíces jóvenes.</p>
                <p>• <span className="text-emerald-700 uppercase font-black">Adaptación al volumen:</span> A medida que el agua disminuye, los cálculos se ajustan para mantener concentraciones seguras.</p>
              </div>
            </div>
          </div>
        )}

        {/* AJUSTES */}
        {tab === "settings" && (
          <div className="space-y-6 py-10">
            <button onClick={() => { 
              setLastClean(new Date().toISOString())
              alert('✅ Limpieza registrada')
            }} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white p-8 rounded-[2.5rem] font-black border-4 border-violet-200 uppercase text-sm shadow-xl">
              <ShieldAlert className="inline mr-2"/> Registrar Limpieza
            </button>
            
            <button onClick={() => { 
              if(confirm('¿RESETEO COMPLETO?')) { 
                localStorage.clear()
                window.location.reload()
              }
            }} className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white p-10 rounded-[2.5rem] font-black border-4 border-red-200 uppercase text-sm shadow-xl">
              RESETEO COMPLETO
            </button>
          </div>
        )}
      </main>

      {/* Modal para seleccionar variedad */}
      {selPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[4rem] p-12 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black italic text-slate-400 uppercase text-sm">Seleccionar Variedad</h3>
                <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                  <Plus size={24} className="rotate-45"/>
                </button>
            </div>
            <div className="grid gap-3">
              {Object.keys(VARIETIES).map(v => (
                <button 
                  key={v} 
                  onClick={() => {
                    setPlants([...plants, {id: Date.now(), v, l: selPos.l, p: selPos.p}])
                    setSelPos(null)
                  }}
                  className={`w-full p-7 rounded-[2.2rem] font-black text-white shadow-xl flex justify-between items-center ${VARIETIES[v].color}`}
                >
                  <div className="text-left">
                    <span className="text-2xl uppercase italic tracking-tighter leading-none block">{v}</span>
                    <span className="text-[10px] opacity-80 lowercase font-medium">
                      EC plántula: {VARIETIES[v].hyproDosage.seedling.ec}
                    </span>
                  </div>
                  <Zap size={24}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
