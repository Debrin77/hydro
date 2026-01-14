"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Sprout, Beaker, Plus, Trash2, Lightbulb, Droplets, Thermometer, 
  Zap, ChevronRight, Home, Settings, Gauge, Sun, Waves, 
  Wind, Timer, ClipboardList, Calendar, Power, Droplet, 
  RefreshCcw, Layers, AlertCircle, Info, Trash
} from "lucide-react"

// --- Componentes UI Base ---
const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-4 ${className}`}>{children}</div>
)

const Badge = ({ children, variant = "default" }: any) => {
  const styles: any = {
    default: "bg-emerald-100 text-emerald-700",
    outline: "border border-slate-200 text-slate-600",
    destructive: "bg-red-100 text-red-700",
    warning: "bg-orange-100 text-orange-700"
  }
  return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[variant]}`}>{children}</span>
}

// --- Configuración Maestra ---
const VARIETIES = {
  "Romana": { ec: [0.8, 1.4, 1.7], color: "bg-green-500" },
  "Hoja Roble": { ec: [0.9, 1.4, 1.9], color: "bg-red-500" },
  "Maravilla": { ec: [0.8, 1.3, 1.6], color: "bg-orange-400" },
  "Lollo Rosso": { ec: [0.8, 1.3, 1.8], color: "bg-purple-500" }
}

const WATER_TYPES = {
  "osmosis": { name: "Ósmosis", ec: 0, desc: "Pureza máxima" },
  "blanda": { name: "Mezcla (Blanda)", ec: 400, desc: "50% Grifo / 50% Ósmosis" },
  "dura_cs": { name: "Grifo Castellón", ec: 950, desc: "Agua muy dura (Cal)" }
}

export default function HydroMasterComplete() {
  const [isStarted, setIsStarted] = useState(false)
  const [tab, setTab] = useState("dashboard")
  const [plants, setPlants] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  
  // Estado Dinámico de Sensores y Configuración
  const [config, setConfig] = useState({
    waterType: "osmosis",
    currentVol: 18,
    temp: 22,
    ecActual: 0,
    phActual: 7.0,
    isPoniente: false
  })

  // --- Lógica de Cálculo Dinámico (Aqua Vega A+B) ---
  const analysis = useMemo(() => {
    if (!isStarted || plants.length === 0) return null

    let totalEC = 0
    let seedlingCount = 0
    plants.forEach(p => {
      totalEC += VARIETIES[p.variety as keyof typeof VARIETIES].ec[p.level - 1]
      if (p.level === 1) seedlingCount++
    })

    let targetEC = (totalEC / plants.length) * 1000
    if (config.temp > 25 || config.isPoniente) targetEC *= 0.85 // Reducción por transpiración
    if (seedlingCount > 0) targetEC = Math.min(targetEC, 1250) // Cap seguridad plántulas

    const waterBaseEC = WATER_TYPES[config.waterType as keyof typeof WATER_TYPES].ec
    const ecNeeded = Math.max(0, targetEC - waterBaseEC)
    const mlDose = (ecNeeded / 500) * config.currentVol 

    return {
      targetEC: Math.round(targetEC),
      mlPart: (mlDose / 2).toFixed(1), // Dosis por cada botella (A y B)
      phTarget: "5.8 - 6.2",
      pumpCycle: config.temp > 25 ? "15m ON / 15m OFF" : "15m ON / 45m OFF",
      phRisk: config.temp > 26 ? "Alto (Calor)" : config.currentVol < 10 ? "Crítico (Volumen)" : "Estable"
    }
  }, [plants, config, isStarted])

  // --- Funciones de Gestión ---
  const addLog = () => {
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
      ph: config.phActual,
      ec: config.ecActual,
      temp: config.temp
    }
    setLogs([newLog, ...logs])
  }

  const deleteLog = (id: number) => setLogs(logs.filter(l => l.id !== id))

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
              <Sprout size={64} className="text-emerald-500 mx-auto mb-4" />
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">Hydro<span className="text-emerald-500">Master</span></h1>
              <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest font-bold">Vertical Tower 15 • Castellón</p>
            </div>
          </div>
          <button onClick={() => setIsStarted(true)} className="w-full bg-emerald-600 hover:bg-emerald-500 transition-all text-white font-black py-6 rounded-2xl text-xl shadow-xl shadow-emerald-900/20 uppercase">
            Iniciar Sistema de Cultivo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Header Fijo */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 p-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
              <Layers size={18} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">HM <span className="text-emerald-600 text-sm">V15</span></span>
          </div>
          <div className="flex gap-2">
            <Badge variant={config.temp > 25 ? "warning" : "default"}><Thermometer size={10} className="inline mr-1"/>{config.temp}°</Badge>
            <Badge variant="outline"><Droplet size={10} className="inline mr-1"/>{config.currentVol}L</Badge>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        
        {/* 1. PESTAÑA: PARÁMETROS ACTUALES (DASHBOARD) */}
        {tab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-900 text-white border-none shadow-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EC Objetivo</p>
                <p className="text-4xl font-black mt-1 text-emerald-400">{analysis?.targetEC || 0}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase">µS/cm Escalonado</p>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aqua Vega A+B</p>
                <p className="text-4xl font-black mt-1 text-blue-600">{analysis?.mlPart || 0} <span className="text-sm">ml</span></p>
                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase italic text-center">De cada parte</p>
              </Card>
            </div>

            <Card className="flex items-center justify-between p-5 bg-white border-none shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${analysis?.phRisk === 'Estable' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <Gauge size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Diagnóstico pH</p>
                  <p className="text-lg font-black text-slate-800">{analysis?.phRisk}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Objetivo</p>
                <p className="text-md font-bold text-emerald-600">{analysis?.phTarget}</p>
              </div>
            </Card>
          </div>
        )}

        {/* 2. PESTAÑA: MEDICIONES */}
        {tab === "measure" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="p-6 space-y-6 border-none shadow-sm">
              <h3 className="font-bold flex items-center gap-2 text-slate-800"><Beaker size={18} className="text-blue-500"/> Calibración de Sensores</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs font-black uppercase text-slate-500">pH Actual</Label>
                    <span className="text-xl font-black text-emerald-600">{config.phActual}</span>
                  </div>
                  <input type="range" min="4" max="8" step="0.1" value={config.phActual} onChange={(e) => setConfig({...config, phActual: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs font-black uppercase text-slate-500">EC Real (µS)</Label>
                    <span className="text-xl font-black text-blue-600">{config.ecActual}</span>
                  </div>
                  <input type="range" min="0" max="2500" step="10" value={config.ecActual} onChange={(e) => setConfig({...config, ecActual: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <button onClick={addLog} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <ClipboardList size={18}/> REGISTRAR MEDICIÓN
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* 3. PESTAÑA: TORRE (15 PLANTAS) */}
        {tab === "tower" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Estado de la Torre</h3>
              <button onClick={() => plants.length < 15 && setPlants([...plants, { id: Date.now(), variety: "Romana", level: 1 }])} className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg">
                <Plus size={20}/>
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(15)].map((_, i) => (
                <div key={i} onClick={() => {
                  if (plants[i]) {
                    const newPlants = [...plants];
                    newPlants[i].level = (newPlants[i].level % 3) + 1;
                    setPlants(newPlants);
                  }
                }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm relative ${plants[i] ? VARIETIES[plants[i].variety as keyof typeof VARIETIES].color + " text-white" : 'bg-white border-2 border-dashed border-slate-200 text-slate-300 hover:border-emerald-300'}`}>
                  {plants[i] ? (
                    <>
                      <span className="text-xs font-black uppercase tracking-tighter">{plants[i].level === 1 ? 'P' : plants[i].level === 2 ? 'C' : 'M'}</span>
                      <button onClick={(e) => { e.stopPropagation(); setPlants(plants.filter(p => p.id !== plants[i].id)) }} className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md text-red-500">
                        <Trash size={10} />
                      </button>
                    </>
                  ) : <Sprout size={16} />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest italic">P: Plántula | C: Crecimiento | M: Madura</p>
          </div>
        )}

        {/* 4. PESTAÑA: RIEGO */}
        {tab === "irrigation" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner shadow-blue-100">
                <Timer size={40} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ciclo Recomendado</h3>
                <p className="text-3xl font-black text-slate-800 mt-2">{analysis?.pumpCycle}</p>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3 text-left">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed italic">
                  "Con una bomba de 7W y 5 niveles, el flujo de agua oxigena las raíces al caer. Este ciclo evita el estancamiento y la formación de algas."
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* 5. PESTAÑA: REGISTRO (LOGS) */}
        {tab === "history" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-black text-slate-800 uppercase text-sm">Historial de Mediciones</h3>
              <Badge variant="outline">{logs.length} Entradas</Badge>
            </div>
            {logs.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <ClipboardList size={48} className="mx-auto text-slate-200" />
                <p className="text-slate-400 text-sm font-medium italic italic">No hay mediciones registradas hoy.</p>
              </div>
            ) : (
              logs.map(log => (
                <Card key={log.id} className="flex justify-between items-center py-4 px-6 border-none shadow-sm group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold text-[10px]">{log.date}</div>
                    <div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50">pH {log.ph}</Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50">{log.ec} µS</Badge>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteLog(log.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                    <Trash2 size={20} />
                  </button>
                </Card>
              ))
            )}
          </div>
        )}

        {/* 6. PESTAÑA: CONSEJOS MAESTROS */}
        {tab === "tips" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="border-l-4 border-l-emerald-500 shadow-md">
              <div className="flex gap-4">
                <div className="bg-emerald-100 p-3 rounded-2xl h-fit text-emerald-600 shadow-sm"><RefreshCcw size={24}/></div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Transplante de Suelo a Lana</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    1. Lava la raíz en un cuenco con agua tibia hasta eliminar la tierra.<br/>
                    2. <strong>Corte de raíz:</strong> Si es muy larga, puedes recortar un 20% para estimular el crecimiento.<br/>
                    3. Introduce en el dado de 2.5cm asegurando que la corona de la lechuga quede justo por encima del dado para evitar hongos.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-md">
              <div className="flex gap-4">
                <div className="bg-blue-100 p-3 rounded-2xl h-fit text-blue-600 shadow-sm"><Layers size={24}/></div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Dados Lana de Roca 2.5cm</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Pre-tratamiento: Sumerge 24h en agua con <strong>pH 5.2</strong>. Sin este paso, el pH alcalino de la lana bloqueará la absorción de micronutrientes como el hierro.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-md bg-orange-50/20">
              <div className="flex gap-4">
                <div className="bg-orange-100 p-3 rounded-2xl h-fit text-orange-600 shadow-sm"><Sun size={24}/></div>
                <div>
                  <h4 className="font-bold text-orange-800 text-sm tracking-tight italic">Efecto Castellón (Poniente)</h4>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Si el aire viene seco (Poniente), rellena el tanque solo con agua (sin abono). La evaporación natural ya concentra las sales en el depósito.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 7. PESTAÑA: AJUSTES (CALENDARIO/INICIO) */}
        {tab === "settings" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="p-6 space-y-6 border-none shadow-sm">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipo de Agua Inicial</Label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(WATER_TYPES).map(([key, val]) => (
                    <button key={key} onClick={() => setConfig({...config, waterType: key})} className={`p-4 rounded-[1.5rem] text-left border-2 transition-all flex justify-between items-center ${config.waterType === key ? 'border-emerald-500 bg-emerald-50 shadow-inner' : 'border-slate-100 bg-slate-50/50'}`}>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{val.name}</p>
                        <p className="text-[10px] text-slate-500">{val.desc}</p>
                      </div>
                      <Badge variant="outline">{val.ec} µS</Badge>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.isPoniente ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Wind size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Alerta de Poniente</p>
                      <p className="text-[10px] text-slate-400">Reduce EC por calor seco</p>
                    </div>
                  </div>
                  <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-14 h-8 rounded-full transition-all relative p-1 ${config.isPoniente ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${config.isPoniente ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-xs uppercase text-slate-500 tracking-widest">
                    <span>Volumen Real</span>
                    <span className="text-slate-900">{config.currentVol}L</span>
                  </div>
                  <input type="range" min="5" max="20" value={config.currentVol} onChange={(e) => setConfig({...config, currentVol: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
              </div>
            </Card>
            <button onClick={() => setIsStarted(false)} className="w-full py-4 text-red-400 text-xs font-bold uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-opacity">Reiniciar Sistema</button>
          </div>
        )}

      </main>

      {/* Navbar Inferior Estilo iOS */}
      <nav className="fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-3 flex justify-around items-center z-50 max-w-xl mx-auto">
        <NavBtn id="dashboard" icon={<Home size={22}/>} active={tab} set={setTab} />
        <NavBtn id="measure" icon={<Beaker size={22}/>} active={tab} set={setTab} />
        <NavBtn id="tower" icon={<Layers size={22}/>} active={tab} set={setTab} />
        <NavBtn id="history" icon={<ClipboardList size={22}/>} active={tab} set={setTab} />
        <NavBtn id="tips" icon={<Lightbulb size={22}/>} active={tab} set={setTab} />
        <NavBtn id="settings" icon={<Settings size={22}/>} active={tab} set={setTab} />
      </nav>
    </div>
  )
}

function NavBtn({id, icon, active, set}: any) {
  const isActive = active === id
  return (
    <button onClick={() => set(id)} className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 -translate-y-2' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
      {icon}
    </button>
  )
}
