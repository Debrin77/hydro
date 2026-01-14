"use client"

import React, { useState, useMemo } from "react"
import { 
  Sprout, Beaker, Plus, Trash2, Lightbulb, Droplets, Thermometer, 
  Zap, ChevronRight, Home, Settings, Gauge, Sun, Waves, 
  Wind, Timer, ClipboardList, Power, Droplet, 
  RefreshCcw, Layers, Info, Check, Activity, Search
} from "lucide-react"

// --- COMPONENTES UI PARA VERCEL ---
const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-5 ${className}`}>{children}</div>
)

const Badge = ({ children, variant = "default" }: any) => {
  const styles: any = {
    default: "bg-emerald-100 text-emerald-700",
    outline: "border border-slate-200 text-slate-600",
    destructive: "bg-red-100 text-red-700",
    warning: "bg-orange-100 text-orange-700",
  }
  return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[variant]}`}>{children}</span>
}

// --- CONFIGURACIÓN TÉCNICA (Basada en Canna Aqua Vega) ---
const WATER_TYPES = {
  "osmosis": { name: "Ósmosis Inversa", ecBase: 0, desc: "Pureza total. Requiere CalMag." },
  "blanda": { name: "Mezcla (Blanda)", ecBase: 350, desc: "Mezcla 50/50. Ideal para Canna." },
  "dura_cs": { name: "Grifo Castellón", ecBase: 900, desc: "Agua muy dura. Cuidado con bloqueos." }
}

const VARIETIES = {
  "Romana": { name: "Lechuga Romana", ec: [0.8, 1.4, 1.7], color: "bg-green-500" },
  "Hoja Roble": { name: "Hoja de Roble", ec: [0.9, 1.4, 1.9], color: "bg-red-500" },
  "Lollo Rosso": { name: "Lollo Rosso", ec: [0.8, 1.3, 1.8], color: "bg-purple-500" }
}

export default function HydroMasterPro() {
  const [isStarted, setIsStarted] = useState(false)
  const [tab, setTab] = useState("dashboard")
  const [plants, setPlants] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  
  const [config, setConfig] = useState({
    waterType: "osmosis",
    vol: 18,
    temp: 24,
    phActual: 7.0,
    ecActual: 0,
    isPoniente: false
  })

  // --- MOTOR DE CÁLCULO DINÁMICO ---
  const analysis = useMemo(() => {
    if (plants.length === 0) return null

    // 1. Cálculo de EC Objetivo según plantas en la torre
    let totalTargetEC = 0
    plants.forEach(p => {
      const varietyData = VARIETIES[p.variety as keyof typeof VARIETIES]
      totalTargetEC += varietyData.ec[p.level - 1]
    })
    let targetEC = (totalTargetEC / plants.length) * 1000

    // 2. Ajustes Climatológicos de Castellón
    if (config.temp > 26 || config.isPoniente) targetEC *= 0.85 // Bajamos EC porque beben más agua

    // 3. Dosificación Aqua Vega A+B
    const waterBase = WATER_TYPES[config.waterType as keyof typeof WATER_TYPES].ecBase
    const ecNeeded = Math.max(0, targetEC - waterBase)
    const mlTotal = (ecNeeded / 500) * config.vol // Ratio estándar 2ml/L para subir 1000uS

    return {
      targetEC: Math.round(targetEC),
      mlPart: (mlTotal / 2).toFixed(1),
      irrigation: config.temp > 25 ? "15m ON / 15m OFF" : "15m ON / 45m OFF",
      phRisk: config.temp > 27 ? "Alto (Riesgo Algas)" : "Normal"
    }
  }, [plants, config])

  // --- FUNCIONES ---
  const addPlant = (v: string) => {
    if (plants.length < 15) setPlants([...plants, { id: Date.now(), variety: v, level: 1 }])
  }

  const saveLog = () => {
    const log = {
      id: Date.now(),
      date: new Date().toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      ph: config.phActual,
      ec: config.ecActual
    }
    setHistory([log, ...history])
  }

  const deleteLog = (id: number) => setHistory(history.filter(h => h.id !== id))

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
              <Sprout size={64} className="text-emerald-500 mx-auto mb-4" />
              <h1 className="text-4xl font-black tracking-tighter italic">HYDRO<span className="text-emerald-500">MASTER</span></h1>
              <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest font-bold font-mono text-[10px]">Tower V15 • Castellón de la Plana</p>
            </div>
          </div>
          <button onClick={() => setIsStarted(true)} className="w-full bg-emerald-600 hover:bg-emerald-500 transition-all text-white font-black py-6 rounded-2xl shadow-xl shadow-emerald-900/20 text-xl">
            INICIAR SISTEMA
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* HEADER NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 p-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg"><Layers size={18} className="text-white" /></div>
            <span className="font-black text-xl tracking-tighter italic">HM<span className="text-emerald-600">V15</span></span>
          </div>
          <div className="flex gap-2">
            <Badge variant={config.temp > 25 ? "warning" : "default"}>{config.temp}°C</Badge>
            <Badge variant="outline">{config.vol}L</Badge>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        
        {/* 1. PESTAÑA: PARÁMETROS ACTUALES (DASHBOARD) */}
        {tab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={48}/></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EC Objetivo</p>
                <p className="text-4xl font-black mt-1 text-emerald-400">{analysis?.targetEC || 0}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1">µS/cm (Ajustado)</p>
              </Card>
              <Card className="bg-white border-none shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Dosificación A+B</p>
                <p className="text-3xl font-black mt-1 text-blue-600 text-center">{analysis?.mlPart || 0} <span className="text-sm">ml</span></p>
                <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase italic text-center">Por cada botella</p>
              </Card>
            </div>

            <Card className="flex items-center justify-between p-5 bg-white border-none shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Timer size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Estado de Riego</p>
                  <p className="text-md font-black text-slate-800">{analysis?.irrigation}</p>
                </div>
              </div>
              <Badge variant="outline">Automático</Badge>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-emerald-50 rounded-2xl">
                <p className="text-[10px] font-bold text-emerald-600">pH IDEAL</p>
                <p className="text-lg font-black text-emerald-800">5.8 - 6.2</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-2xl">
                <p className="text-[10px] font-bold text-blue-600">TEMP AGUA</p>
                <p className="text-lg font-black text-blue-800">{config.temp}°C</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400">PLANTAS</p>
                <p className="text-lg font-black text-slate-800">{plants.length}/15</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. PESTAÑA: MEDICIONES (CALIBRACIÓN) */}
        {tab === "measure" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="p-6 space-y-6 border-none shadow-sm">
              <h3 className="font-black text-slate-800 flex items-center gap-2"><Beaker size={18} className="text-blue-500"/> Lectura de Sensores</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-xs text-slate-500 uppercase"><span>pH Medido</span><span className="text-emerald-600 text-xl">{config.phActual}</span></div>
                  <input type="range" min="4" max="8" step="0.1" value={config.phActual} onChange={(e) => setConfig({...config, phActual: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-xs text-slate-500 uppercase"><span>EC Medida (µS)</span><span className="text-blue-600 text-xl">{config.ecActual}</span></div>
                  <input type="range" min="0" max="2500" step="10" value={config.ecActual} onChange={(e) => setConfig({...config, ecActual: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <button onClick={saveLog} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <ClipboardList size={18}/> REGISTRAR LECTURA
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* 3. PESTAÑA: TORRE (15 PLANTAS) */}
        {tab === "tower" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Estado de la Torre</h3>
              <div className="flex gap-1">
                {Object.keys(VARIETIES).map(v => (
                  <button key={v} onClick={() => addPlant(v)} className="bg-white border border-slate-100 p-2 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50">
                    + {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(15)].map((_, i) => (
                <div key={i} onClick={() => {
                  if (plants[i]) {
                    const newPlants = [...plants];
                    newPlants[i].level = (newPlants[i].level % 3) + 1;
                    setPlants(newPlants);
                  }
                }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm relative ${plants[i] ? VARIETIES[plants[i].variety as keyof typeof VARIETIES].color + " text-white" : 'bg-white border-2 border-dashed border-slate-200 text-slate-300'}`}>
                  {plants[i] ? (
                    <>
                      <span className="text-[10px] font-black uppercase">{plants[i].level === 1 ? 'P' : plants[i].level === 2 ? 'C' : 'M'}</span>
                      <button onClick={(e) => { e.stopPropagation(); setPlants(plants.filter((_, idx) => idx !== i)) }} className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-1 shadow-md">
                        <Trash2 size={8} />
                      </button>
                    </>
                  ) : <Plus size={16}/>}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest italic pt-2">P: Plántula | C: Crecimiento | M: Madura</p>
          </div>
        )}

        {/* 4. PESTAÑA: RIEGO */}
        {tab === "irrigation" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto">
                <Waves size={40} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuración de Bomba (7W)</h3>
                <p className="text-3xl font-black text-slate-800 mt-2">{analysis?.irrigation}</p>
                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed italic border-t pt-4">
                  "En Castellón, con altas temperaturas, el riego frecuente oxigena la raíz y evita el calentamiento del agua en la torre."
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* 5. PESTAÑA: CALENDARIO / REGISTROS */}
        {tab === "history" && (
          <div className="space-y-4 animate-in fade-in">
             <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest px-2">Registro Histórico</h3>
             {history.length === 0 ? (
               <Card className="p-10 text-center opacity-30 italic text-sm">No hay registros guardados hoy.</Card>
             ) : (
               history.map(h => (
                 <Card key={h.id} className="flex justify-between items-center py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center bg-slate-50 p-2 rounded-xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase leading-none">{h.date}</p></div>
                      <div className="flex gap-2 font-bold text-xs uppercase">
                        <span className="text-emerald-600">pH {h.ph}</span>
                        <span className="text-blue-600">{h.ec} µS</span>
                      </div>
                    </div>
                    <button onClick={() => deleteLog(h.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                      <Trash2 size={18} />
                    </button>
                 </Card>
               ))
             )}
          </div>
        )}

        {/* 6. PESTAÑA: CONSEJOS MAESTROS */}
        {tab === "tips" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/10">
              <div className="flex gap-4 p-2">
                <div className="bg-emerald-100 p-3 rounded-2xl h-fit text-emerald-600"><RefreshCcw size={24}/></div>
                <div>
                  <h4 className="font-black text-slate-800 text-xs uppercase">Transplante de Suelo a Lana</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    1. Lava la raíz en agua tibia para eliminar toda la tierra.<br/>
                    2. Introduce con cuidado en el dado de 2.5cm.<br/>
                    3. <strong>IMPORTANTE:</strong> Coloca el dado a media altura en la cesta; si toca el fondo de la torre, la raíz puede pudrirse por falta de oxígeno.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-orange-500 bg-orange-50/10">
              <div className="flex gap-4 p-2">
                <div className="bg-orange-100 p-3 rounded-2xl h-fit text-orange-600"><Wind size={24}/></div>
                <div>
                  <h4 className="font-black text-slate-800 text-xs uppercase">Efecto Poniente (Castellón)</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Cuando sople viento seco (Poniente), la lechuga evapora agua mucho más rápido. <strong>Baja la EC a 0.8 - 1.0</strong> para evitar que las hojas se quemen por acumulación de sales.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-blue-500 bg-blue-50/10">
              <div className="flex gap-4 p-2">
                <div className="bg-blue-100 p-3 rounded-2xl h-fit text-blue-600"><Droplets size={24}/></div>
                <div>
                  <h4 className="font-black text-slate-800 text-xs uppercase">Estabilización de Lana</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Sumerge siempre tus dados nuevos 24h en agua con <strong>pH 5.2</strong>. La lana de roca es alcalina por defecto y disparará tu pH si no la preparas.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 7. PESTAÑA: CONFIGURACIÓN / INICIAR SISTEMA */}
        {tab === "settings" && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="p-6 space-y-6 border-none shadow-sm">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fuente de Agua</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(WATER_TYPES).map(([key, val]) => (
                    <button key={key} onClick={() => setConfig({...config, waterType: key})} className={`p-4 rounded-2xl text-left border-2 transition-all flex justify-between items-center ${config.waterType === key ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 bg-slate-50/50'}`}>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{val.name}</p>
                        <p className="text-[10px] text-slate-500 italic">{val.desc}</p>
                      </div>
                      {config.waterType === key && <Check size={16} className="text-emerald-500"/>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex justify-between font-bold text-xs text-slate-500 uppercase"><span>Temperatura Agua</span><span className="text-blue-600">{config.temp}°C</span></div>
                <input type="range" min="10" max="30" value={config.temp} onChange={(e) => setConfig({...config, temp: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                
                <div className="flex justify-between font-bold text-xs text-slate-500 uppercase"><span>Volumen Depósito</span><span className="text-slate-900">{config.vol}L</span></div>
                <input type="range" min="5" max="20" value={config.vol} onChange={(e) => setConfig({...config, vol: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className={config.isPoniente ? 'text-orange-600' : 'text-slate-300'}><Wind size={24}/></div>
                    <div><p className="text-xs font-bold text-orange-900">Alerta Poniente</p><p className="text-[9px] text-orange-600 uppercase">Ajuste automático de EC</p></div>
                  </div>
                  <button onClick={() => setConfig({...config, isPoniente: !config.isPoniente})} className={`w-12 h-6 rounded-full transition-all relative ${config.isPoniente ? 'bg-orange-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isPoniente ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </Card>
            <button onClick={() => { setPlants([]); setHistory([]); setIsStarted(false); }} className="w-full py-4 text-red-500 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Reiniciar Sistema Completo</button>
          </div>
        )}

      </main>

      {/* NAVBAR INFERIOR (ESTILO iOS) */}
      <nav className="fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-3 flex justify-around items-center z-50 max-w-xl mx-auto">
        <NavBtn id="dashboard" icon={<Home size={20}/>} active={tab} set={setTab} />
        <NavBtn id="measure" icon={<Beaker size={20}/>} active={tab} set={setTab} />
        <NavBtn id="tower" icon={<Layers size={20}/>} active={tab} set={setTab} />
        <NavBtn id="irrigation" icon={<Waves size={20}/>} active={tab} set={setTab} />
        <NavBtn id="history" icon={<ClipboardList size={20}/>} active={tab} set={setTab} />
        <NavBtn id="tips" icon={<Lightbulb size={20}/>} active={tab} set={setTab} />
        <NavBtn id="settings" icon={<Settings size={20}/>} active={tab} set={setTab} />
      </nav>
    </div>
  )
}

function NavBtn({id, icon, active, set}: any) {
  const isActive = active === id
  return (
    <button onClick={() => set(id)} className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 -translate-y-3' : 'text-slate-300 hover:text-slate-500'}`}>
      {icon}
    </button>
  )
}
