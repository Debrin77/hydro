"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lock, Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, Thermometer, Zap, Info
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// --- CONSTANTES TÉCNICAS ---
const VARIETIES = {
  "Romana": { color: "bg-emerald-600", ec: 1.4, info: "Crecimiento vertical, alta demanda de agua." },
  "Iceberg": { color: "bg-cyan-500", ec: 1.2, info: "Sensible al calor, requiere agua fría." },
  "Hoja de Roble": { color: "bg-red-600", ec: 1.6, info: "Resistente, mayor tolerancia a sales." },
  "Lollo Rosso": { color: "bg-purple-600", ec: 1.6, info: "Antocianinas altas, requiere EC estable." },
  "Trocadero": { color: "bg-lime-600", ec: 1.3, info: "Textura mantecosa, sensible a pH alto." }
};

export default function HydroMasterV26() {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [step, setStep] = useState(0); // 0: Auth, 1: Vol, 2: EC, 3: App
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [selPos, setSelPos] = useState<{l: number, p: number} | null>(null);
  const [tab, setTab] = useState("overview");

  // --- CONFIGURACIÓN ---
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20",
    ph: "6.0", 
    ec: "1.2", 
    temp: "22",
    targetEC: "1.4"
  });

  // --- PERSISTENCIA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydro_v26_final");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config);
      setHistory(d.history || []);
      setLastRot(d.lastRot);
      setLastClean(d.lastClean);
      setStep(3); // Saltar al sistema si ya está configurado
    }
  }, []);

  useEffect(() => {
    if (step === 3) {
      localStorage.setItem("hydro_v26_final", JSON.stringify({ plants, config, history, lastRot, lastClean }));
    }
  }, [plants, config, history, lastRot, lastClean, step]);

  // --- MOTOR DE ALERTAS Y CÁLCULOS ---
  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1.4;
    const temp = parseFloat(config.temp) || 20;
    const res = [];

    // Alerta Volumen
    if (vAct < vTot * 0.5) {
      res.push({ t: "VOLUMEN BAJO", v: `${vTot - vAct}L`, d: "Rellenar de inmediato", c: "bg-red-600 animate-pulse", i: <Droplets /> });
    }

    // Alerta Temperatura (Oxígeno)
    if (temp > 25) {
      res.push({ t: "TEMP ALTA", v: `${temp}°C`, d: "PELIGRO: Sin oxígeno en raíz. Añadir hielo.", c: "bg-orange-600 animate-bounce", i: <Thermometer /> });
    }

    // Alerta pH
    if (ph > 6.2) {
      const ml = ((ph - 6.0) * 10 * vAct * 0.15).toFixed(0);
      res.push({ t: "pH ALTO", v: `${ml}ml pH-`, d: "Corregir para evitar bloqueo", c: "bg-purple-600", i: <ArrowDownCircle /> });
    } else if (ph < 5.6 && ph > 0) {
      const ml = ((6.0 - ph) * 10 * vAct * 0.15).toFixed(0);
      res.push({ t: "pH BAJO", v: `${ml}ml pH+`, d: "Corregir para evitar toxicidad", c: "bg-pink-600", i: <ArrowDownCircle className="rotate-180" /> });
    }

    // Alerta EC (Nutrientes)
    if (ec < tEc && ec > 0) {
      const ml = (((tEc - ec) / 0.1) * vAct * 0.25).toFixed(1);
      res.push({ t: "NUTRIENTES", v: `${ml}ml A+B`, d: `Subir para alcanzar ${tEc} EC`, c: "bg-blue-700", i: <FlaskConical /> });
    }

    return res;
  }, [config]);

  // --- LÓGICA DE ROTACIÓN ---
  const handleRotation = () => {
    if (confirm("¿Cosechar Nivel 3 y bajar el resto de niveles?")) {
      const filtered = plants.filter(p => p.l !== 3);
      const updated = filtered.map(p => ({ ...p, l: p.l + 1 }));
      setPlants(updated);
      setLastRot(new Date().toISOString());
      setTab("tower");
    }
  };

  // --- FLUJO DE INICIO SEGUIDO ---
  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-800">
        <Card className="w-full max-w-xs p-10 bg-white rounded-[3rem] text-center shadow-2xl border-b-8 border-green-600">
          <Lock className="mx-auto mb-6 text-green-600" size={40} />
          <h2 className="font-black mb-6 uppercase italic">Acceso Maestro</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-4xl font-black bg-slate-100 rounded-3xl p-5 outline-none border-4 focus:border-green-500" 
            onChange={e => e.target.value === "1234" && setStep(1)} />
        </Card>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl">
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic text-green-700">Paso 1: Depósito</h2>
          <div className="space-y-6">
            <p className="text-center text-xs font-bold text-slate-400">Indica la capacidad total de tu tanque en litros.</p>
            <input type="number" value={config.totalVol} onChange={e => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})} className="w-full p-8 bg-slate-50 border-4 rounded-[2.5rem] text-5xl font-black text-center" />
            <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-xl">Siguiente</button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl">
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic text-blue-700">Paso 2: Nutrición</h2>
          <div className="space-y-6">
            <p className="text-center text-xs font-bold text-slate-400">¿Qué nivel de EC quieres mantener? (Recomendado: 1.4)</p>
            <input type="number" step="0.1" value={config.targetEC} onChange={e => setConfig({...config, targetEC: e.target.value})} className="w-full p-8 bg-slate-50 border-4 rounded-[2.5rem] text-5xl font-black text-center" />
            <button onClick={() => setStep(3)} className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black uppercase text-xl shadow-lg">Iniciar Sistema</button>
          </div>
        </Card>
      </div>
    );
  }

  // --- APLICACIÓN PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black italic text-green-700 leading-none">HYDROCARU PRO</h1>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Advanced Control System</p>
        </div>
        <Badge className="bg-slate-900 text-white px-5 py-2 rounded-2xl font-black text-xl">{config.currentVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-6 bg-white border-4 border-slate-100 shadow-xl rounded-[2.5rem] mb-8 h-18 p-1">
            <TabsTrigger value="overview" className="rounded-2xl"><Activity /></TabsTrigger>
            <TabsTrigger value="measure" className="rounded-2xl"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower" className="rounded-2xl"><Layers /></TabsTrigger>
            <TabsTrigger value="history" className="rounded-2xl"><Calendar /></TabsTrigger>
            <TabsTrigger value="tips" className="rounded-2xl"><Lightbulb /></TabsTrigger>
            <TabsTrigger value="settings" className="rounded-2xl"><Trash2 /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-400 ml-4 tracking-widest">Estado Crítico</h2>
            {alerts.map((a, i) => (
              <Card key={i} className={`${a.c} text-white p-6 rounded-[2.5rem] flex items-center gap-5 border-none shadow-2xl animate-in slide-in-from-right`}>
                <div className="bg-white/20 p-4 rounded-2xl">{a.i}</div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 mb-1">{a.t}</p>
                  <p className="text-3xl font-black italic leading-none">{a.v}</p>
                  <p className="text-[9px] font-bold mt-1 uppercase tracking-tighter">{a.d}</p>
                </div>
              </Card>
            ))}
            {alerts.length === 0 && (
              <Card className="p-12 text-center font-black text-green-700 border-4 border-green-100 bg-green-50 rounded-[3rem] shadow-inner">
                <Check className="mx-auto mb-4 bg-white rounded-full p-4 shadow-md text-green-600" size={50}/>
                SISTEMA EN EQUILIBRIO
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6">
              <div className="grid grid-cols-2 gap-4 font-black">
                <div className="space-y-1"><label className="text-[9px] text-slate-400 ml-4 uppercase">pH Medido</label><input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black focus:border-purple-400 transition-all outline-none" /></div>
                <div className="space-y-1"><label className="text-[9px] text-slate-400 ml-4 uppercase">EC Medida</label><input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black focus:border-blue-400 transition-all outline-none" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] text-cyan-600 ml-4 uppercase font-black tracking-widest text-center block">Litros Reales en el Tanque</label><input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-5xl font-black text-cyan-800 focus:border-cyan-400 outline-none" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] text-orange-600 ml-4 uppercase font-black tracking-widest text-center block">Temperatura del Agua (°C)</label><input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} className="w-full p-5 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-3xl font-black text-orange-800 focus:border-orange-400 outline-none" /></div>
              </div>
              <button onClick={() => { setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history]); setTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black uppercase text-xl shadow-2xl hover:bg-green-600 transition-all">Analizar y Guardar</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <button onClick={handleRotation} className="w-full p-8 rounded-[2.5rem] bg-orange-600 text-white font-black flex items-center justify-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all">
              <Scissors size={32}/> 
              <div className="text-left">
                <p className="text-[10px] uppercase opacity-70 mb-1">Cosecha y Descenso</p>
                <p className="text-xl uppercase italic leading-none">Rotar Niveles de Torre</p>
              </div>
            </button>
            {[1, 2, 3].map(l => (
              <div key={l} className="animate-in slide-in-from-bottom duration-500">
                <p className="text-xs font-black mb-3 px-6 flex justify-between uppercase italic text-slate-500">
                  <span>Nivel {l} {l===1?'(Cuna)':l===3?'(Cosecha)':'(Crecimiento)'}</span>
                  <Badge variant="outline" className="border-2 font-black">{plants.filter(p => p.l === l).length}/6</Badge>
                </p>
                <div className="bg-slate-200/50 p-6 rounded-[3rem] grid grid-cols-3 gap-5 border-4 border-white shadow-inner">
                  {[1, 2, 3, 4, 5, 6].map(p => {
                    const pl = plants.find(x => x.l === l && x.p === p);
                    return (
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} className={`aspect-square rounded-[2rem] flex items-center justify-center border-4 relative transition-all ${pl ? `${VARIETIES[pl.v].color} border-white shadow-xl scale-110` : 'bg-white border-slate-100 text-slate-100 hover:border-green-200'}`}>
                        {pl ? <Sprout size={32} className="text-white" /> : <Plus size={28} />}
                        {pl && <span className="text-[7px] font-black text-white absolute bottom-2 uppercase text-center w-full px-1 truncate">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-8 rounded-[3.5rem] bg-indigo-950 text-white shadow-2xl relative overflow-hidden border-4 border-indigo-900">
              <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12"><Calendar size={150}/></div>
              <h3 className="text-sm font-black italic mb-6 text-indigo-300 uppercase underline decoration-green-500 decoration-4 underline-offset-8">Calendario de Mantenimiento</h3>
              <div className="grid grid-cols-7 gap-2 text-center">
                {Array.from({length: 28}).map((_, i) => {
                  const d = i + 1;
                  const isM = d % 3 === 0; // Medir cada 3 días
                  const isR = d % 7 === 0; // Rotar cada 7
                  const isC = d === 28;    // Limpieza total
                  return (
                    <div key={i} className={`h-11 flex items-center justify-center rounded-xl text-xs font-black border-2 transition-all ${isC ? 'bg-red-500 border-red-300' : isR ? 'bg-orange-500 border-orange-300' : isM ? 'bg-blue-600 border-blue-300 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-white/5 border-transparent opacity-20'}`}>{d}</div>
                  )
                })}
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2 text-[9px] font-black uppercase text-indigo-200">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded"></div> Medir</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded"></div> Rotar</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Limpiar</span>
              </div>
            </Card>
            <div className="space-y-3">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="p-5 bg-white border-2 border-slate-100 rounded-[2rem] flex justify-between items-center text-xs font-black italic shadow-sm hover:shadow-md transition-all">
                  <span className="text-slate-400 bg-slate-50 px-3 py-1 rounded-xl">{h.d.split(',')[0]}</span>
                  <div className="flex gap-4">
                    <span className="text-purple-600">pH {h.ph}</span>
                    <span className="text-blue-600 font-bold">EC {h.ec}</span>
                    <span className="text-orange-500">{h.temp}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase flex items-center gap-3 ml-4">
              <Info className="text-green-600" size={30}/> Manual Maestro
            </h2>
            <Card className="rounded-[3rem] border-4 border-orange-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-orange-500 p-6 text-white flex items-center gap-4"><Layers size={35}/><h3 className="font-black uppercase text-xs tracking-widest">Protocolo Lana de Roca</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p className="border-l-4 border-orange-500 pl-4 uppercase font-black text-orange-600">Neutralizado Obligatorio:</p>
                <p>La lana virgen tiene pH 8.0. Sumergir 24h en agua pH 5.5 es VITAL. Si no lo haces, la raíz joven no podrá absorber fósforo y morirá en días.</p>
                <p className="border-l-4 border-orange-500 pl-4 uppercase font-black text-orange-600">Oxigenación de Micro-poros:</p>
                <p>NUNCA estrujes la lana al sacarla del agua. Solo sacúdela. Al apretarla colapsas las fibras y eliminas el oxígeno. Sin aire en la lana, la raíz se pudre.</p>
              </div>
            </Card>
            
            <Card className="rounded-[3rem] border-4 border-blue-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-blue-600 p-6 text-white flex items-center gap-4"><Wind size={35}/><h3 className="font-black uppercase text-xs tracking-widest">Protocolo de Oxígeno</h3></div>
              <div className="p-8 text-[11px] font-bold text-slate-700 italic leading-relaxed">
                <p>El agua a más de <span className="text-blue-600 font-black underline">25°C</span> pierde físicamente su capacidad de retener oxígeno. Las raíces se vuelven marrones y viscosas (Pythium). </p>
                <p className="mt-4 bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                  <span className="font-black uppercase text-blue-800">Truco Industrial:</span> Usa botellas de agua congelada de 2L. Mete una en el depósito cada mediodía en verano para bajar la temp a 20°C.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 py-10">
            <button onClick={() => { setLastClean(new Date().toISOString()); alert('Limpieza registrada hoy.'); }} className="w-full bg-slate-100 text-slate-800 p-8 rounded-[2.5rem] font-black border-4 border-slate-200 uppercase text-xs flex items-center justify-center gap-4">
              <Check size={20}/> Registrar Limpieza de sales hoy
            </button>
            <button onClick={() => { if(confirm('¿BORRAR TODO?')) { localStorage.clear(); window.location.reload(); }}} className="w-full bg-red-100 text-red-600 p-10 rounded-[2.5rem] font-black border-4 border-red-200 uppercase text-sm shadow-xl">
              <Trash2 className="inline mr-3" size={24}/> Formatear Sistema
            </button>
            <div className="pt-20 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.5em]">HydroCaru Professional v26.0</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL DE SELECCIÓN DE PLANTA */}
      {selPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999] animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md mx-auto rounded-[4rem] p-12 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black italic text-slate-400 uppercase text-sm tracking-widest">Nivel {selPos.l} - Variedad</h3>
              <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><Plus size={28} className="rotate-45"/></button>
            </div>
            <div className="grid gap-3">
              {Object.keys(VARIETIES).map(v => (
                <button key={v} onClick={() => {setPlants([...plants, {id: Date.now(), v, l: selPos.l, p: selPos.p}]); setSelPos(null);}} className={`w-full p-7 rounded-[2rem] font-black text-white shadow-xl flex justify-between items-center hover:scale-105 active:scale-95 transition-all ${VARIETIES[v].color}`}>
                  <span className="text-2xl uppercase italic tracking-tighter">{v}</span>
                  <Zap size={24}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
