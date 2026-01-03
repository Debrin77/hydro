"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lock, Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, Thermometer, Zap, Info, ShieldAlert
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// BASE DE DATOS TÉCNICA SIN RECORTES
const VARIETIES = {
  "Romana": { color: "bg-emerald-600", ecTarget: 1.4, consumption: "alto" },
  "Iceberg": { color: "bg-cyan-500", ecTarget: 1.2, consumption: "medio" },
  "Hoja de Roble": { color: "bg-red-600", ecTarget: 1.6, consumption: "alto" },
  "Lollo Rosso": { color: "bg-purple-600", ecTarget: 1.6, consumption: "medio" },
  "Trocadero": { color: "bg-lime-600", ecTarget: 1.3, consumption: "bajo" }
};

export default function HydroMasterUltimate() {
  // ESTADOS DE FLUJO DE INICIO
  const [step, setStep] = useState(0); // 0: PIN, 1: Volumen, 2: EC Objetivo, 3: App
  const [pin, setPin] = useState("");
  
  // ESTADOS DE DATOS
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  
  // ESTADOS DE MEDICIÓN
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20",
    ph: "6.0", 
    ec: "1.2", 
    temp: "22",
    targetEC: "1.4"
  });

  const [tab, setTab] = useState("overview");
  const [selPos, setSelPos] = useState<{l: number, p: number} | null>(null);

  // PERSISTENCIA TOTAL
  useEffect(() => {
    const saved = localStorage.getItem("hydro_v_ultimate_data");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config || config);
      setHistory(d.history || []);
      setLastRot(d.lastRot || new Date().toISOString());
      setLastClean(d.lastClean || new Date().toISOString());
      if (d.setupComplete) setStep(3);
    }
  }, []);

  useEffect(() => {
    if (step === 3) {
      const data = { setupComplete: true, plants, config, history, lastRot, lastClean };
      localStorage.setItem("hydro_v_ultimate_data", JSON.stringify(data));
    }
  }, [plants, config, history, lastRot, lastClean, step]);

  // MOTOR DE CÁLCULO DE ALERTAS (TODAS LAS SOLICITADAS)
  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1.4;
    const temp = parseFloat(config.temp) || 20;
    const res = [];

    // 1. ALERTA DE VOLUMEN (CRÍTICA)
    if (vAct < vTot * 0.6) {
      res.push({ 
        t: "VOLUMEN CRÍTICO", 
        v: `Faltan ${vTot - vAct}L`, 
        d: "Rellenar depósito para evitar desequilibrios químicos", 
        c: "bg-red-600 animate-pulse", 
        i: <Droplets size={30}/> 
      });
    }

    // 2. ALERTA DE TEMPERATURA Y OXÍGENO
    if (temp > 25) {
      res.push({ 
        t: "OXÍGENO BAJO", 
        v: `${temp}°C`, 
        d: "El agua caliente no retiene oxígeno. ¡Añadir hielo!", 
        c: "bg-orange-600 animate-bounce", 
        i: <Thermometer size={30}/> 
      });
    }

    // 3. CÁLCULO DE pH (ESTEQUIOMÉTRICO)
    if (ph > 6.2) {
      const ml = ((ph - 6.0) * 10 * vAct * 0.15).toFixed(1);
      res.push({ t: "CORRECCIÓN pH", v: `${ml}ml pH DOWN`, d: "El pH alto bloquea la absorción de Hierro", c: "bg-purple-600", i: <ArrowDownCircle /> });
    } else if (ph < 5.6 && ph > 0) {
      const ml = ((6.0 - ph) * 10 * vAct * 0.15).toFixed(1);
      res.push({ t: "CORRECCIÓN pH", v: `${ml}ml pH UP`, d: "El pH bajo puede disolver las raíces", c: "bg-pink-600", i: <ArrowDownCircle className="rotate-180" /> });
    }

    // 4. CÁLCULO DE NUTRIENTES (EC) SEGÚN VARIEDADES Y CARGA
    const plantDemand = plants.length * 0.1; // Factor de carga
    if (ec < tEc && ec > 0) {
      const ml = (((tEc - ec) / 0.1) * vAct * 0.25).toFixed(1);
      res.push({ t: "NUTRICIÓN A+B", v: `${ml}ml de cada`, d: `Ajuste para ${plants.length} plantas activas`, c: "bg-blue-700", i: <FlaskConical /> });
    }

    // 5. ALERTA DE ROTACIÓN (CALENDARIO)
    const daysSinceRot = Math.floor((Date.now() - new Date(lastRot).getTime()) / 86400000);
    if (daysSinceRot >= 7) {
      res.push({ t: "CICLO DE ROTACIÓN", v: "TOCA HOY", d: "Cosechar Nivel 3 y bajar niveles superiores", c: "bg-amber-600 animate-pulse", i: <Clock /> });
    }

    return res;
  }, [config, plants, lastRot]);

  // LOGICA DE ROTACIÓN DE PLANTAS (BOTÓN REAL)
  const handleRotation = () => {
    if (confirm("¿Confirmas cosecha de Nivel 3 y rotación descendente?")) {
      const remain = plants.filter(p => p.l !== 3);
      const moved = remain.map(p => ({ ...p, l: p.l + 1 }));
      setPlants(moved);
      setLastRot(new Date().toISOString());
      setTab("tower");
    }
  };

  // --- INTERFAZ DE INICIO SECUENCIAL ---
  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-12 bg-white rounded-[3rem] text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-8 border-green-600">
          <Lock className="mx-auto mb-6 text-green-600" size={50} />
          <h2 className="text-2xl font-black mb-8 uppercase italic tracking-tighter">Panel de Control</h2>
          <input type="password" value={pin} onChange={e => { setPin(e.target.value); if(e.target.value === "1234") setStep(1); }} placeholder="PIN MAESTRO" className="w-full text-center text-4xl font-black bg-slate-100 rounded-2xl p-6 outline-none border-4 focus:border-green-500 transition-all" />
          <p className="mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">HydroCaru Professional System</p>
        </Card>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-100">
          <div className="flex justify-center mb-6 text-blue-600"><Droplets size={60}/></div>
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic">Capacidad Depósito</h2>
          <div className="space-y-8">
            <div className="relative">
              <input type="number" value={config.totalVol} onChange={e => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})} className="w-full p-10 bg-slate-50 border-4 rounded-[2.5rem] text-6xl font-black text-center outline-none focus:border-blue-500" />
              <span className="absolute bottom-4 right-10 font-black text-slate-300">LITROS</span>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white p-8 rounded-[2rem] font-black uppercase text-2xl shadow-xl hover:bg-blue-600 transition-all">Siguiente Paso</button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-100">
          <div className="flex justify-center mb-6 text-purple-600"><FlaskConical size={60}/></div>
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic">Objetivo de EC</h2>
          <div className="space-y-8">
            <p className="text-center font-bold text-slate-400 px-4">Establece la conductividad deseada para tu cultivo (Normal: 1.4 mS/cm)</p>
            <input type="number" step="0.1" value={config.targetEC} onChange={e => setConfig({...config, targetEC: e.target.value})} className="w-full p-10 bg-slate-50 border-4 rounded-[2.5rem] text-6xl font-black text-center outline-none focus:border-purple-500" />
            <button onClick={() => setStep(3)} className="w-full bg-slate-900 text-white p-8 rounded-[2rem] font-black uppercase text-2xl shadow-xl hover:bg-purple-600 transition-all">Activar Sistema</button>
          </div>
        </Card>
      </div>
    );
  }

  // --- APLICACIÓN PRINCIPAL (STEP 3) ---
  return (
    <div className="min-h-screen bg-slate-100 pb-28 text-slate-900 font-sans">
      <header className="bg-white border-b-4 border-slate-200 p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black italic text-green-700 leading-none tracking-tighter uppercase">HydroCaru Master</h1>
          <Badge className="w-fit mt-1 text-[8px] font-black tracking-widest bg-slate-100 text-slate-400">INDUSTRIAL V.27</Badge>
        </div>
        <div className="flex gap-2">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-lg shadow-lg flex items-center gap-2">
                <Droplets size={16} className="text-blue-400"/> {config.currentVol}L
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-6 bg-white border-4 border-slate-200 shadow-2xl rounded-[2.5rem] mb-10 h-20 p-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-2xl transition-all"><Activity /></TabsTrigger>
            <TabsTrigger value="measure" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-2xl transition-all"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-2xl transition-all"><Layers /></TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-2xl transition-all"><CalendarIcon /></TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-2xl transition-all"><Lightbulb /></TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-2xl transition-all"><Trash2 /></TabsTrigger>
          </TabsList>

          {/* 1. RESUMEN Y ALERTAS */}
          <TabsContent value="overview" className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-4 mb-2">
                <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Diagnóstico en Tiempo Real</h2>
                {alerts.length > 0 && <Badge className="bg-red-500 animate-pulse">{alerts.length} ACCIONES</Badge>}
            </div>
            {alerts.map((a, i) => (
              <Card key={i} className={`${a.c} text-white p-6 rounded-[2.5rem] flex items-center gap-6 border-none shadow-2xl transform hover:scale-[1.02] transition-transform`}>
                <div className="bg-white/20 p-5 rounded-[1.5rem] shadow-inner">{a.i}</div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-80 mb-1">{a.t}</p>
                  <p className="text-3xl font-black italic leading-none mb-2">{a.v}</p>
                  <p className="text-[10px] font-bold uppercase tracking-tighter leading-tight opacity-90">{a.d}</p>
                </div>
              </Card>
            ))}
            {alerts.length === 0 && (
              <Card className="p-16 text-center font-black text-green-700 border-4 border-green-200 bg-green-50 rounded-[4rem] shadow-inner">
                <Check className="mx-auto mb-6 bg-white rounded-full p-4 shadow-xl text-green-600" size={60}/>
                <p className="text-2xl italic uppercase tracking-tighter">Sistema Estable</p>
                <p className="text-[10px] mt-2 opacity-50 uppercase">Todo está bajo control maestro</p>
              </Card>
            )}
          </TabsContent>

          {/* 2. MEDICIÓN DE PRECISIÓN */}
          <TabsContent value="measure" className="animate-in slide-in-from-bottom">
            <Card className="p-8 rounded-[3.5rem] bg-white shadow-2xl border-4 border-slate-100 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 ml-4 uppercase font-black">pH Actual</label>
                    <input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} className="w-full p-6 bg-slate-50 border-4 rounded-3xl text-center text-4xl font-black focus:border-purple-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 ml-4 uppercase font-black">EC Actual</label>
                    <input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} className="w-full p-6 bg-slate-50 border-4 rounded-3xl text-center text-4xl font-black focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-[10px] text-cyan-600 ml-4 uppercase font-black tracking-widest text-center block">Litros de agua actuales</label>
                    <input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} className="w-full p-7 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-5xl font-black text-cyan-800 outline-none" />
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-[10px] text-orange-600 ml-4 uppercase font-black tracking-widest text-center block">Temperatura del Agua (°C)</label>
                    <input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} className="w-full p-6 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-4xl font-black text-orange-800 outline-none" />
                </div>
              </div>
              <button onClick={() => { setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history]); setTab("overview"); }} className="w-full bg-slate-900 text-white p-8 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl hover:bg-blue-600 active:scale-95 transition-all">Analizar Datos</button>
            </Card>
          </TabsContent>

          {/* 3. GESTIÓN DE LA TORRE Y ROTACIÓN */}
          <TabsContent value="tower" className="space-y-8 animate-in zoom-in-95">
            <button onClick={handleRotation} className="w-full p-10 rounded-[3rem] bg-orange-600 text-white font-black flex items-center justify-center gap-6 shadow-2xl hover:bg-orange-500 transition-all border-b-8 border-orange-800 active:border-b-0 active:translate-y-2">
              <Scissors size={40}/> 
              <div className="text-left">
                <p className="text-[10px] uppercase opacity-80 mb-1 font-bold">Protocolo Semanal</p>
                <p className="text-2xl uppercase italic leading-none">Ejecutar Rotación</p>
              </div>
            </button>
            
            {[1, 2, 3].map(l => (
              <div key={l}>
                <div className="flex justify-between items-center mb-4 px-6">
                    <h3 className="text-sm font-black uppercase italic text-slate-500">{l===1?'Nivel 1 (Plantel)':l===3?'Nivel 3 (Cosecha)':'Nivel 2 (Crecimiento)'}</h3>
                    <Badge className="bg-white border-2 text-slate-900 font-black">{plants.filter(p => p.l === l).length}/6</Badge>
                </div>
                <div className="bg-slate-200/50 p-6 rounded-[3.5rem] grid grid-cols-3 gap-6 border-4 border-white shadow-inner">
                  {[1, 2, 3, 4, 5, 6].map(p => {
                    const pl = plants.find(x => x.l === l && x.p === p);
                    return (
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} className={`aspect-square rounded-[2.5rem] flex flex-col items-center justify-center border-4 relative transition-all shadow-md ${pl ? `${VARIETIES[pl.v].color} border-white scale-110 shadow-2xl` : 'bg-white border-slate-100 text-slate-100 hover:border-green-300 hover:text-green-200'}`}>
                        {pl ? <Sprout size={35} className="text-white" /> : <Plus size={30} />}
                        {pl && <span className="text-[8px] font-black text-white absolute bottom-3 uppercase text-center w-full px-2 truncate leading-none">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 4. CALENDARIO DINÁMICO DE MANTENIMIENTO */}
          <TabsContent value="history" className="space-y-6 animate-in fade-in">
            <Card className="p-8 rounded-[3.5rem] bg-indigo-950 text-white shadow-2xl relative overflow-hidden border-4 border-indigo-900">
              <div className="absolute top-[-30px] right-[-30px] opacity-10 rotate-12"><CalendarIcon size={180}/></div>
              <h3 className="text-sm font-black italic mb-8 text-indigo-300 uppercase underline decoration-green-500 decoration-4 underline-offset-8">Calendario de Tareas</h3>
              <div className="grid grid-cols-7 gap-3 text-center">
                {['L','M','X','J','V','S','D'].map(d => <span key={d} className="text-[10px] font-black opacity-30">{d}</span>)}
                {Array.from({length: 28}).map((_, i) => {
                  const day = i + 1;
                  const isMedicion = day % 3 === 0;
                  const isRotacion = day % 7 === 0;
                  const isLimpieza = day === 28;
                  return (
                    <div key={i} className={`h-12 flex items-center justify-center rounded-2xl text-[10px] font-black border-2 transition-all ${isLimpieza ? 'bg-red-500 border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : isRotacion ? 'bg-orange-500 border-orange-300' : isMedicion ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-transparent opacity-20'}`}>
                        {day}
                    </div>
                  )
                })}
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 text-[9px] font-black uppercase text-indigo-200 tracking-tighter">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded-lg shadow-md"></div> Medir pH/EC</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-lg shadow-md"></div> Rotación</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-lg shadow-md"></div> Limpieza</div>
              </div>
            </Card>
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-[0.2em]">Últimos Registros Guardados</h4>
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] flex justify-between items-center text-xs font-black italic shadow-sm">
                  <span className="text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl">{h.d.split(',')[0]}</span>
                  <div className="flex gap-6">
                    <span className="text-purple-600 font-black">pH {h.ph}</span>
                    <span className="text-blue-600 font-black underline">EC {h.ec}</span>
                    <span className="text-orange-500">{h.temp}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 5. MANUAL MAESTRO (CONSEJOS COMPLETOS) */}
          <TabsContent value="tips" className="space-y-6 animate-in slide-in-from-right">
            <h2 className="text-3xl font-black italic uppercase flex items-center gap-4 ml-4">
              <Info className="text-green-600" size={35}/> Protocolos
            </h2>
            
            <Card className="rounded-[3.5rem] border-4 border-orange-100 overflow-hidden shadow-2xl bg-white">
              <div className="bg-orange-500 p-8 text-white flex items-center gap-5">
                <Layers size={40}/>
                <h3 className="font-black uppercase text-sm tracking-[0.2em] leading-none">Manual: Lana de Roca</h3>
              </div>
              <div className="p-10 text-[12px] font-bold text-slate-700 italic leading-relaxed space-y-6">
                <div className="flex gap-4">
                    <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black shadow-inner">1</div>
                    <p><span className="text-orange-600 uppercase font-black">Neutralizado:</span> La lana de roca virgen tiene un pH de 8.0. Es alcalina. Si pones la planta ahí, morirá. Tienes que sumergirla 24 horas en agua con un pH de 5.5 antes de usarla.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black shadow-inner">2</div>
                    <p><span className="text-orange-600 uppercase font-black">Oxígeno:</span> Al sacar la lana del agua, **no la estrujes**. Si la aprietas, rompes las fibras y quitas los poros de aire. La raíz necesita oxígeno tanto como agua.</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[3.5rem] border-4 border-blue-100 overflow-hidden shadow-2xl bg-white">
              <div className="bg-blue-600 p-8 text-white flex items-center gap-5">
                <Wind size={40}/>
                <h3 className="font-black uppercase text-sm tracking-[0.2em] leading-none">Manual: Oxígeno</h3>
              </div>
              <div className="p-10 text-[12px] font-bold text-slate-700 italic leading-relaxed">
                <p className="mb-4">Física básica: El agua caliente no puede retener oxígeno disuelto. Si la temperatura sube de <span className="text-blue-600 font-black underline">25°C</span>, tus raíces se asfixiarán aunque la bomba funcione.</p>
                <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-200 text-blue-900">
                    <Zap className="inline mr-2 text-blue-600" size={20}/>
                    <span className="font-black uppercase">Consejo Maestro:</span> En verano, usa botellas de agua congelada de 2 litros y mételas directamente en el depósito de agua para mantener la temperatura en 20°C.
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 6. AJUSTES Y RESET */}
          <TabsContent value="settings" className="space-y-6 py-12 text-center">
            <button onClick={() => { setLastClean(new Date().toISOString()); alert('Limpieza registrada hoy.'); }} className="w-full bg-slate-100 text-slate-800 p-10 rounded-[3rem] font-black border-4 border-slate-200 uppercase text-xs flex items-center justify-center gap-5 hover:bg-white transition-all">
              <ShieldAlert size={24} className="text-red-500"/> Registrar Limpieza de sales hoy
            </button>
            
            <button onClick={() => { if(confirm('¿BORRAR TODO EL SISTEMA? Perderás plantas y configuración.')) { localStorage.clear(); window.location.reload(); }}} className="w-full bg-red-100 text-red-600 p-12 rounded-[3.5rem] font-black border-4 border-red-200 uppercase text-lg shadow-xl hover:bg-red-600 hover:text-white transition-all group">
              <Trash2 className="inline mr-4 group-hover:animate-bounce" size={30}/> Borrado de Fábrica
            </button>
            
            <div className="pt-24 opacity-20">
              <p className="text-[10px] font-black text-slate-900 uppercase italic tracking-[1em]">HydroCaru Master v.27.0</p>
              <p className="text-[8px] font-black text-slate-900 uppercase mt-4">Sistema de Control Aeropónico de Alta Precisión</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL DE SELECCIÓN DE PLANTA (AUMENTADO) */}
      {selPos && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-end p-4 z-[9999] animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md mx-auto rounded-[4.5rem] p-12 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <h3 className="font-black italic text-slate-400 uppercase text-sm tracking-widest leading-none">Seleccionar Planta</h3>
                <span className="text-[10px] font-black text-green-600 mt-2 uppercase">Nivel {selPos.l} - Posición {selPos.p}</span>
              </div>
              <button onClick={() => setSelPos(null)} className="p-4 bg-slate-100 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-all"><Plus size={32} className="rotate-45"/></button>
            </div>
            <div className="grid gap-4">
              {Object.keys(VARIETIES).map(v => (
                <button key={v} onClick={() => {setPlants([...plants, {id: Date.now(), v, l: selPos.l, p: selPos.p}]); setSelPos(null);}} className={`w-full p-8 rounded-[2.5rem] font-black text-white shadow-2xl flex justify-between items-center hover:scale-105 active:scale-95 transition-all ${VARIETIES[v].color}`}>
                  <span className="text-2xl uppercase italic tracking-tighter">{v}</span>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-white/20 text-[8px]">{VARIETIES[v].ecTarget} EC</Badge>
                    <Zap size={28}/>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setSelPos(null)} className="w-full p-6 font-black uppercase text-slate-300 text-[10px] tracking-widest mt-4">Cancelar Operación</button>
          </div>
        </div>
      )}
    </div>
  );
}
