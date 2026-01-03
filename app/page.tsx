"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lock, Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, Thermometer, Zap
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// BASE DE DATOS TÉCNICA
const VARIETIES: { [key: string]: {color: string, ecMin: number, ecMax: number, cycle: number} } = {
  "Romana": { color: "bg-emerald-600", ecMin: 1.2, ecMax: 1.6, cycle: 30 },
  "Iceberg": { color: "bg-cyan-500", ecMin: 1.0, ecMax: 1.4, cycle: 45 },
  "Hoja de Roble": { color: "bg-red-600", ecMin: 1.4, ecMax: 1.8, cycle: 35 },
  "Lollo Rosso": { color: "bg-purple-600", ecMin: 1.4, ecMax: 1.8, cycle: 35 },
  "Trocadero": { color: "bg-lime-600", ecMin: 1.2, ecMax: 1.6, cycle: 40 }
};

export default function HydroAppV25() {
  const [isAuth, setIsAuth] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [tab, setTab] = useState("overview");
  
  // ESTADOS DEL SISTEMA
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [selPos, setSelPos] = useState<{l: number, p: number} | null>(null);
  
  // PARÁMETROS DE MEDICIÓN
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    currentVol: "20",
    ph: "6.0", 
    ec: "1.2", 
    temp: "22",
    targetEC: "1.4"
  });

  // CARGA DE SEGURIDAD
  useEffect(() => {
    const saved = localStorage.getItem("hydro_v25_master");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config);
      setHistory(d.history || []);
      setLastRot(d.lastRot);
      setLastClean(d.lastClean || new Date().toISOString());
      setIsSetup(d.isSetup);
    }
  }, []);

  // GUARDADO DE SEGURIDAD
  useEffect(() => {
    if (isSetup) {
      localStorage.setItem("hydro_v25_master", JSON.stringify({ isSetup, plants, config, history, lastRot, lastClean }));
    }
  }, [isSetup, plants, config, history, lastRot, lastClean]);

  // MOTOR DE CÁLCULO DE ALERTAS Y RECOMENDACIONES
  const alerts = useMemo(() => {
    const vAct = parseFloat(config.currentVol) || 0;
    const vTot = parseFloat(config.totalVol) || 20;
    const ph = parseFloat(config.ph) || 6.0;
    const ec = parseFloat(config.ec) || 0;
    const tEc = parseFloat(config.targetEC) || 1.4;
    const res = [];

    // 1. Alerta de Volumen de Agua
    if (vAct < vTot * 0.5) {
      res.push({ t: "VOLUMEN BAJO", v: `${vTot - vAct}L faltantes`, d: "Rellenar depósito para estabilizar pH/EC", c: "bg-red-600 animate-pulse", i: <Droplets /> });
    }

    // 2. Alerta de pH (Fórmula: 0.15ml por cada 0.1 de error por litro)
    if (ph > 6.2) {
      const ml = ((ph - 6.0) * 10 * vAct * 0.15).toFixed(0);
      res.push({ t: "pH ALTO (ÁCIDO)", v: `${ml}ml pH Down`, d: "Reducir para evitar bloqueo de nutrientes", c: "bg-purple-600", i: <ArrowDownCircle /> });
    } else if (ph < 5.6 && ph > 0) {
      const ml = ((6.0 - ph) * 10 * vAct * 0.15).toFixed(0);
      res.push({ t: "pH BAJO (BASE)", v: `${ml}ml pH Up`, d: "Subir para evitar toxicidad mineral", c: "bg-pink-600", i: <ArrowDownCircle className="rotate-180" /> });
    }

    // 3. Recomendación de EC (Nutrientes A+B)
    if (ec < tEc && ec > 0) {
      const ml = (((tEc - ec) / 0.1) * vAct * 0.25).toFixed(1);
      res.push({ t: "FALTAN NUTRIENTES", v: `${ml}ml A + B`, d: `Subir EC a ${tEc} para carga actual`, c: "bg-blue-700", i: <FlaskConical /> });
    } else if (ec > tEc + 0.4) {
      res.push({ t: "EC EXCESIVA", v: "AÑADIR AGUA", d: "Riesgo de quemadura osmótica", c: "bg-orange-600", i: <AlertTriangle /> });
    }

    // 4. Alerta de Rotación (7 días)
    const dRot = Math.floor((Date.now() - new Date(lastRot).getTime()) / 86400000);
    if (dRot >= 7) {
      res.push({ t: "ROTACIÓN", v: "TOCA HOY", d: "Mover niveles y cosechar Nivel 3", c: "bg-orange-500 animate-bounce", i: <Clock /> });
    }

    return res;
  }, [config, lastRot]);

  // FUNCIÓN DE ROTACIÓN REAL
  const executeRotation = () => {
    if (confirm("¿Cosechar Nivel 3 y bajar el resto?")) {
      const remaining = plants.filter(p => p.l !== 3);
      const shifted = remaining.map(p => ({ ...p, l: p.l + 1 }));
      setPlants(shifted);
      setLastRot(new Date().toISOString());
    }
  };

  // PANTALLAS DE INICIO
  if (!isAuth && !isSetup) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-10 bg-white rounded-[3rem] text-center border-b-8 border-green-600 shadow-2xl">
          <Lock className="mx-auto mb-6 text-green-600" size={40} />
          <h2 className="font-black mb-6 uppercase italic tracking-tighter">Acceso Maestro</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-4xl font-black bg-slate-100 rounded-2xl p-4 outline-none border-2 focus:border-green-600 transition-all" onChange={e => e.target.value === "1234" && setIsAuth(true)} />
        </Card>
      </div>
    );
  }

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3.5rem] shadow-2xl border-2">
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic text-green-700">Iniciar Sistema</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Litros Totales Depósito</label>
              <input type="number" value={config.totalVol} onChange={e => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})} className="w-full p-6 bg-slate-50 border-4 rounded-3xl text-3xl font-black text-center focus:border-green-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">EC Objetivo (Lechuga: 1.4)</label>
              <input type="number" step="0.1" value={config.targetEC} onChange={e => setConfig({...config, targetEC: e.target.value})} className="w-full p-6 bg-slate-50 border-4 rounded-3xl text-3xl font-black text-center focus:border-green-500 outline-none" />
            </div>
            <button onClick={() => setIsSetup(true)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-xl shadow-xl hover:bg-green-700 transition-all">Activar Torre</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black italic text-green-700 leading-none">HYDROCARU MASTER</h1>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Advanced Control System v25</p>
        </div>
        <Badge className="bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-xl">{config.currentVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-6 bg-white border-4 border-slate-100 shadow-xl rounded-[2rem] mb-8 h-16 p-1">
            <TabsTrigger value="overview"><Activity /></TabsTrigger>
            <TabsTrigger value="measure"><Beaker /></TabsTrigger>
            <TabsTrigger value="tower"><Layers /></TabsTrigger>
            <TabsTrigger value="history"><Calendar /></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb /></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {alerts.map((a, i) => (
              <Card key={i} className={`${a.c} text-white p-6 rounded-[2.5rem] flex items-center gap-5 border-none shadow-xl animate-in slide-in-from-right`}>
                <div className="bg-white/20 p-4 rounded-2xl">{a.i}</div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 mb-1">{a.t}</p>
                  <p className="text-2xl font-black italic leading-none">{a.v}</p>
                  <p className="text-[9px] font-bold mt-1 uppercase">{a.d}</p>
                </div>
              </Card>
            ))}
            {alerts.length === 0 && (
                <Card className="p-12 text-center font-black text-green-700 border-4 border-green-100 bg-green-50 rounded-[3rem]">
                    <Check className="mx-auto mb-4 bg-white rounded-full p-2" size={40}/>
                    SISTEMA ESTABLE
                </Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl border-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH Actual</label><input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC Actual</label><input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Litros Reales en Depósito</label><input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temp Agua °C</label><input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} className="w-full p-4 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-2xl font-black" /></div>
              </div>
              <button onClick={() => { setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history]); setTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-xl">Registrar Mediciones</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <button onClick={executeRotation} className="w-full p-8 rounded-[2.5rem] bg-orange-600 text-white font-black flex items-center justify-center gap-4 shadow-2xl">
                <Scissors size={28}/> 
                <div className="text-left leading-none">
                    <p className="text-[10px] uppercase opacity-70 mb-1">Cosecha y Descenso</p>
                    <p className="text-xl uppercase italic">Rotar Niveles de Torre</p>
                </div>
            </button>
            {[1, 2, 3].map(l => (
              <div key={l}>
                <p className="text-xs font-black mb-3 px-4 flex justify-between uppercase italic text-slate-500">
                    <span>Nivel {l} {l===1?'(Arriba)':l===3?'(Abajo)':'(Medio)'}</span>
                    <span>{plants.filter(p => p.l === l).length}/6</span>
                </p>
                <div className="bg-slate-100 p-5 rounded-[2.5rem] grid grid-cols-3 gap-4 border-4 border-slate-200">
                  {[1, 2, 3, 4, 5, 6].map(p => {
                    const pl = plants.find(x => x.l === l && x.p === p);
                    return (
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} className={`aspect-square rounded-3xl flex items-center justify-center border-4 relative transition-all ${pl ? `${VARIETIES[pl.v].color} border-white shadow-lg` : 'bg-white border-slate-200 text-slate-100'}`}>
                        {pl ? <Sprout size={24} className="text-white" /> : <Plus size={24} />}
                        {pl && <span className="text-[7px] font-black text-white absolute bottom-1 uppercase tracking-tighter">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-8 rounded-[3rem] bg-indigo-950 text-white shadow-2xl relative overflow-hidden">
                <h3 className="text-xs font-black italic mb-6 text-indigo-300 uppercase underline decoration-green-500 decoration-4">Calendario Maestro de Cultivo</h3>
                <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({length: 28}).map((_, i) => {
                        const d = i + 1;
                        const isM = d % 3 === 0; const isR = d % 7 === 0; const isC = d === 28;
                        return (
                            <div key={i} className={`h-10 flex items-center justify-center rounded-xl text-[10px] font-black border-2 ${isC ? 'bg-red-500 border-red-400 animate-pulse' : isR ? 'bg-orange-500 border-orange-400' : isM ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-transparent opacity-30'}`}>{d}</div>
                        )
                    })}
                </div>
                <div className="mt-8 flex justify-between text-[8px] font-black uppercase opacity-60">
                   <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 rounded"></div> Medir</div>
                   <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-500 rounded"></div> Rotar</div>
                   <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded"></div> Limpieza</div>
                </div>
            </Card>
            <div className="space-y-2">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="p-4 bg-white border-2 rounded-2xl flex justify-between items-center text-xs font-black italic shadow-sm">
                  <span className="text-slate-400">{h.d.split(',')[0]}</span>
                  <div className="flex gap-4">
                    <span className="text-purple-600">pH {h.ph}</span>
                    <span className="text-blue-600">EC {h.ec}</span>
                    <span className="text-orange-500">{h.temp}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card className="rounded-[2.5rem] border-4 border-orange-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-orange-500 p-6 text-white flex items-center gap-4"><Layers size={30}/><h3 className="font-black uppercase text-xs">Manual: Lana de Roca</h3></div>
              <div className="p-8 text-xs font-bold text-slate-700 italic leading-relaxed space-y-4">
                <p>1. <span className="text-orange-600 uppercase font-black italic">Neutralizado:</span> La lana virgen es alcalina (pH 8.0). Sumergir 24h en agua pH 5.5 es VITAL o quemarás el tallo joven.</p>
                <p>2. <span className="text-orange-600 uppercase font-black italic">Oxigenación:</span> NUNCA estrujes la lana. Al apretarla, rompes los canales de aire. Las raíces mueren por asfixia si no hay poros de oxígeno.</p>
              </div>
            </Card>
            <Card className="rounded-[2.5rem] border-4 border-blue-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-blue-600 p-6 text-white flex items-center gap-4"><Wind size={30}/><h3 className="font-black uppercase text-xs">Manual: Temperatura</h3></div>
              <div className="p-8 text-xs font-bold text-slate-700 italic leading-relaxed">
                A +25°C el agua pierde el oxígeno. Las lechugas se ponen blandas. <span className="bg-blue-50 px-1 border-b-2 border-blue-300">Usa botellas de hielo en el depósito en días calurosos.</span>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 py-6">
             <button onClick={() => { if(confirm('¿Borrar historial y configuración?')) { localStorage.removeItem("hydro_v25_master"); window.location.reload(); }}} className="w-full bg-red-100 text-red-600 p-8 rounded-[2.5rem] font-black border-4 border-red-200 uppercase text-xs">Formatear Sistema</button>
             <p className="text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest mt-10">HydroCaru v25.0 - Master Console</p>
          </TabsContent>
        </Tabs>
      </main>

      {selPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10 space-y-3 shadow-2xl animate-in slide-in-from-bottom">
            <h3 className="font-black italic text-slate-400 uppercase text-sm mb-4">Seleccionar Variedad</h3>
            <div className="grid gap-2">
              {Object.keys(VARIETIES).map(v => (
                <button key={v} onClick={() => {setPlants([...plants, {id: Date.now(), v, l: selPos.l, p: selPos.p}]); setSelPos(null);}} className={`w-full p-6 rounded-3xl font-black text-white shadow-xl flex justify-between items-center ${VARIETIES[v].color}`}>
                    <span className="text-xl uppercase italic tracking-tighter">{v}</span>
                    <Zap size={20}/>
                </button>
              ))}
            </div>
            <button onClick={() => setSelPos(null)} className="w-full p-4 font-black uppercase text-slate-300 text-[10px]">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
