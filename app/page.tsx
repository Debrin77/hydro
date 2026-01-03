"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Check, 
  Lock, Lightbulb, Scissors, Clock, AlertTriangle, Wind, Droplets, Thermometer
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const VARIETIES: { [key: string]: {color: string, demand: number} } = {
  "Romana": { color: "bg-emerald-600", demand: 1.0 },
  "Iceberg": { color: "bg-cyan-500", demand: 0.9 },
  "Hoja de Roble": { color: "bg-red-600", demand: 1.1 },
  "Lollo Rosso": { color: "bg-purple-600", demand: 1.1 },
  "Trocadero": { color: "bg-lime-600", demand: 1.0 }
};

export default function HydroAppV24() {
  const [isAuth, setIsAuth] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [tab, setTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [config, setConfig] = useState({ 
    totalVol: "20", 
    targetEC: "1.4", 
    ph: "6.0", 
    ec: "1.2", 
    temp: "22",
    currentVol: "18" 
  });
  const [lastRot, setLastRot] = useState(new Date().toISOString());
  const [lastClean, setLastClean] = useState(new Date().toISOString());
  const [selPos, setSelPos] = useState<{l: number, p: number} | null>(null);

  // Persistencia de datos
  useEffect(() => {
    const saved = localStorage.getItem("hydro_v24_master");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setConfig(d.config);
      setHistory(d.history || []);
      setLastRot(d.lastRot);
      setLastClean(d.lastClean);
      setIsSetup(d.isSetup);
    }
  }, []);

  useEffect(() => {
    if (isSetup) {
      localStorage.setItem("hydro_v24_master", JSON.stringify({ isSetup, plants, config, history, lastRot, lastClean }));
    }
  }, [isSetup, plants, config, history, lastRot, lastClean]);

  // MOTOR DE CÁLCULO GLOBAL
  const alerts = useMemo(() => {
    const vTotal = parseFloat(config.totalVol) || 20;
    const vActual = parseFloat(config.currentVol) || 0;
    const ph = parseFloat(config.ph) || 0;
    const ec = parseFloat(config.ec) || 0;
    const targetEc = parseFloat(config.targetEC) || 1.4;
    const res = [];

    // 1. Alerta de Volumen (Nivel Crítico)
    if (vActual < vTotal * 0.4) {
      const litrosAFaltar = vTotal - vActual;
      res.push({ t: "VOLUMEN CRÍTICO", v: `Faltan ${litrosAFaltar}L`, d: "Rellenar depósito para evitar subida de temp.", c: "bg-red-600 animate-pulse", i: <Droplets /> });
    }

    // 2. Alerta pH con factor de corrección por volumen
    if (vActual > 0) {
      if (ph > 6.2) {
        const ml = ((ph - 6.0) * 10 * vActual * 0.15).toFixed(0);
        res.push({ t: "pH ALTO", v: `${ml}ml`, d: "Añadir pH Down", c: "bg-purple-600", i: <ArrowDownCircle /> });
      }
      if (ph < 5.6 && ph > 0) {
        const ml = ((6.0 - ph) * 10 * vActual * 0.15).toFixed(0);
        res.push({ t: "pH BAJO", v: `${ml}ml`, d: "Añadir pH Up", c: "bg-pink-600", i: <ArrowDownCircle className="rotate-180" /> });
      }
    }

    // 3. Alerta Nutrientes (Ajustada por carga de plantas y variedad)
    const plantCharge = plants.reduce((acc, p) => acc + (VARIETIES[p.v]?.demand || 1), 0);
    if (ec < targetEc && ec > 0 && vActual > 0) {
      // Cálculo: ml = (Falta EC) * Volumen * Factor (0.25ml por 0.1 de EC por Litro)
      const ml = (((targetEc - ec) / 0.1) * vActual * 0.25).toFixed(1);
      res.push({ t: "NUTRIENTES", v: `${ml}ml A+B`, d: `Carga: ${plantCharge.toFixed(1)} unidades de demanda`, c: "bg-blue-700", i: <FlaskConical /> });
    }

    // 4. Alerta Temperatura/Oxígeno
    if (parseFloat(config.temp) > 25) {
      res.push({ t: "TEMP ALTA", v: `${config.temp}°C`, d: "Oxígeno bajo. Añadir hielo.", c: "bg-orange-500", i: <Wind /> });
    }

    return res;
  }, [config, plants]);

  const handleRotation = () => {
    if (confirm("¿Cosechar Nivel 3 y bajar el resto?")) {
      const sinN3 = plants.filter(p => p.l !== 3);
      const rotadas = sinN3.map(p => ({ ...p, l: p.l + 1 }));
      setPlants(rotadas);
      setLastRot(new Date().toISOString());
      setTab("tower");
    }
  };

  if (!isAuth && !isSetup) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-10 bg-white rounded-[3rem] text-center shadow-2xl border-4 border-green-500">
          <Lock className="mx-auto mb-6 text-green-600" size={40} />
          <input type="password" placeholder="PIN" className="w-full text-center text-4xl font-black bg-slate-100 rounded-3xl p-5 border-4 focus:border-green-500" 
            onChange={e => e.target.value === "1234" && setIsAuth(true)} />
        </Card>
      </div>
    );
  }

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 bg-white rounded-[3rem] shadow-2xl border-2">
          <h2 className="text-2xl font-black text-center mb-8 uppercase italic underline decoration-green-500">Torre Config</h2>
          <div className="space-y-6">
            <div><label className="text-[10px] font-black uppercase text-slate-400 ml-4">Litros Totales</label><input type="number" value={config.totalVol} onChange={e => setConfig({...config, totalVol: e.target.value, currentVol: e.target.value})} className="w-full p-6 bg-slate-50 border-4 rounded-[2rem] text-3xl font-black text-center" /></div>
            <div><label className="text-[10px] font-black uppercase text-slate-400 ml-4">EC Meta</label><input type="number" step="0.1" value={config.targetEC} onChange={e => setConfig({...config, targetEC: e.target.value})} className="w-full p-6 bg-slate-50 border-4 rounded-[2rem] text-3xl font-black text-center" /></div>
            <button onClick={() => setIsSetup(true)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-xl shadow-xl">Activar Sistema</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      <header className="bg-white border-b-4 p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-2xl font-black italic text-green-700 leading-none tracking-tighter">HYDROCARU MASTER</span>
          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">SISTEMA DE CONTROL AEROPÓNICO</span>
        </div>
        <Badge className="bg-slate-900 text-white px-5 py-2 rounded-2xl font-black text-lg">{config.currentVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-5 bg-white border-4 border-slate-100 shadow-xl rounded-[2rem] mb-8 h-16 p-1">
            <TabsTrigger value="overview"><Activity size={22}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={22}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={22}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={22}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={22}/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {alerts.map((a, i) => (
              <Card key={i} className={`${a.c} text-white p-6 rounded-[2rem] flex items-center gap-5 border-none shadow-xl`}>
                <div className="bg-white/20 p-4 rounded-2xl">{a.i}</div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 mb-1">{a.t}</p>
                  <p className="text-3xl font-black italic leading-none">{a.v}</p>
                  <p className="text-[10px] font-bold mt-1 uppercase tracking-tight">{a.d}</p>
                </div>
              </Card>
            ))}
            {alerts.length === 0 && (
              <Card className="p-12 text-center font-black text-green-700 border-4 border-green-100 bg-green-50 rounded-[3rem]">
                <Check className="mx-auto mb-4 bg-white rounded-full p-2" size={50}/>
                SISTEMA EN EQUILIBRIO PERFECTO
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl space-y-6 border-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">pH</label><input type="number" step="0.1" value={config.ph} onChange={e => setConfig({...config, ph: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-4">EC</label><input type="number" step="0.1" value={config.ec} onChange={e => setConfig({...config, ec: e.target.value})} className="w-full p-5 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-cyan-600 ml-4">Agua actual en depósito (Litros)</label><input type="number" value={config.currentVol} onChange={e => setConfig({...config, currentVol: e.target.value})} className="w-full p-5 bg-cyan-50 border-4 border-cyan-100 rounded-3xl text-center text-4xl font-black text-cyan-700" /></div>
                <div className="space-y-1 col-span-2"><label className="text-[9px] font-black uppercase text-orange-600 ml-4">Temperatura Agua °C</label><input type="number" value={config.temp} onChange={e => setConfig({...config, temp: e.target.value})} className="w-full p-4 bg-orange-50 border-4 border-orange-100 rounded-3xl text-center text-2xl font-black" /></div>
              </div>
              <button onClick={() => { setHistory([{...config, id: Date.now(), d: new Date().toLocaleString()}, ...history]); setTab("overview"); }} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-xl">Registrar Datos</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <button onClick={handleRotation} className="w-full p-8 rounded-[2.5rem] bg-orange-600 text-white font-black flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all">
                <Scissors size={28}/> 
                <div className="text-left">
                  <p className="text-[10px] uppercase opacity-70">Ciclo Maestro</p>
                  <p className="text-xl uppercase italic leading-none">Cosechar N3 y Rotar</p>
                </div>
            </button>
            {[1, 2, 3].map(l => (
              <div key={l}>
                <p className="text-xs font-black text-slate-900 mb-3 px-4 flex justify-between uppercase italic">
                    <span>{l === 1 ? 'Nivel 1 - ARRIBA' : l === 3 ? 'Nivel 3 - ABAJO (Cosecha)' : 'Nivel 2 - CENTRO'}</span>
                    <span className="text-slate-400">{plants.filter(p => p.l === l).length}/6</span>
                </p>
                <div className="bg-slate-100 p-5 rounded-[2.5rem] grid grid-cols-3 gap-4 border-4">
                  {[1, 2, 3, 4, 5, 6].map(p => {
                    const pl = plants.find(x => x.l === l && x.p === p);
                    return (
                      <button key={p} onClick={() => pl ? setPlants(plants.filter(x => x.id !== pl.id)) : setSelPos({l, p})} className={`aspect-square rounded-3xl flex flex-col items-center justify-center border-4 transition-all ${pl ? `${VARIETIES[pl.v]?.color} border-white shadow-xl scale-105` : 'bg-white border-slate-200 text-slate-200'}`}>
                        {pl ? <Sprout size={28} className="text-white" /> : <Plus size={24} />}
                        {pl && <span className="text-[7px] font-black uppercase mt-1 text-white absolute bottom-2">{pl.v}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card className="rounded-[2.5rem] border-4 border-orange-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-orange-500 p-6 text-white flex items-center gap-4"><Layers size={30}/><h3 className="font-black uppercase text-xs tracking-widest">Manual: Lana de Roca</h3></div>
              <div className="p-8 space-y-4 text-xs font-bold text-slate-700 italic leading-relaxed">
                <p>1. <span className="text-orange-600 uppercase font-black">pH Virgen:</span> La lana viene a pH 8.0. Sumergir 24h en agua pH 5.5 es obligatorio o las raíces morirán bloqueadas.</p>
                <p>2. <span className="text-orange-600 uppercase font-black">Aireación:</span> Nunca estrujes la lana al sacarla. Si rompes su estructura, eliminas los micro-poros de oxígeno y las raíces se asfixian.</p>
              </div>
            </Card>
            
            <Card className="rounded-[2.5rem] border-4 border-blue-100 overflow-hidden shadow-xl bg-white">
              <div className="bg-blue-600 p-6 text-white flex items-center gap-4"><Wind size={30}/><h3 className="font-black uppercase text-xs tracking-widest">Manual: Oxígeno</h3></div>
              <div className="p-8 text-xs font-bold text-slate-700 italic leading-relaxed">
                A partir de 25°C, el agua pierde su capacidad de retener oxígeno. Si no puedes bajar la temperatura, aumenta el chapoteo del agua de retorno o introduce botellas congeladas.
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 py-10">
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-red-100 text-red-600 p-8 rounded-[2rem] font-black border-4 border-red-200 uppercase text-xs">Resetear Sistema Completo</button>
            <p className="text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest">HydroCaru Master v24.0 - Industrial Control</p>
          </TabsContent>
        </Tabs>
      </main>

      {selPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black italic text-slate-400 uppercase text-sm tracking-widest">Variedad Nivel {selPos.l}</h3>
                <button onClick={() => setSelPos(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><Plus size={24} className="rotate-45"/></button>
            </div>
            <div className="grid gap-3">
              {Object.keys(VARIETIES).map(v => (
                <button key={v} onClick={() => {setPlants([...plants, {id: Date.now(), v, l: selPos.l, p: selPos.p}]); setSelPos(null);}} className={`w-full p-6 rounded-3xl font-black text-white shadow-xl ${VARIETIES[v].color} text-left flex justify-between items-center`}>
                    <span className="text-xl italic uppercase tracking-tighter">{v}</span>
                    <Sprout size={24}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
