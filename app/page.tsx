"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Droplets, 
  Check, Lock, Lightbulb, AlertTriangle, Thermometer, Zap, Info, Scissors, Clock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const VARIETY_CONFIG: { [key: string]: { color: string, bg: string } } = {
  "Romana": { color: "text-emerald-700", bg: "bg-emerald-400" },
  "Iceberg": { color: "text-blue-700", bg: "bg-blue-300" },
  "Hoja de Roble": { color: "text-red-700", bg: "bg-red-400" },
  "Lollo Rosso": { color: "text-purple-700", bg: "bg-purple-400" },
  "Trocadero": { color: "text-lime-700", bg: "bg-lime-400" }
};

export default function HydroponicTowerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRotation, setLastRotation] = useState<string>(new Date().toISOString());
  const [initialVol, setInitialVol] = useState("20");
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  const [params, setParams] = useState({ 
    pH: "6.0", ec: "1.2", waterVol: "20", temp: "22", targetEC: "1.4" 
  });

  // --- PERSISTENCIA ---
  useEffect(() => {
    const saved = localStorage.getItem("hydroCaru_V14_FIXED");
    if (saved) {
      const d = JSON.parse(saved);
      setPlants(d.plants || []);
      setParams(d.params);
      setInitialVol(d.initialVol || "20");
      setHistory(d.history || []);
      setLastRotation(d.lastRotation || new Date().toISOString());
      setIsSetupComplete(d.isSetupComplete);
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydroCaru_V14_FIXED", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation]);

  // --- LÓGICA DE TIEMPO Y ALERTAS ---
  const daysSinceRotation = Math.floor((new Date().getTime() - new Date(lastRotation).getTime()) / (1000 * 86400));
  const needsRotation = daysSinceRotation >= 7;

  const systemStatus = useMemo(() => {
    const ph = parseFloat(params.pH);
    const ec = parseFloat(params.ec);
    const vol = parseFloat(params.waterVol);
    const target = parseFloat(params.targetEC);
    const alerts = [];

    if (needsRotation) alerts.push({ title: "ROTACIÓN", val: "7 DÍAS", desc: "Cosechar Nivel 3 (Abajo)", color: "bg-orange-600 animate-pulse", icon: <Clock /> });
    if (ph > 6.2) alerts.push({ title: "pH ALTO", val: `${((ph-6.0)*vol*1.5).toFixed(0)}ml`, desc: "Añadir pH DOWN", color: "bg-purple-600", icon: <ArrowDownCircle /> });
    if (ph < 5.8 && ph > 0) alerts.push({ title: "pH BAJO", val: `${((6.0-ph)*vol*1.5).toFixed(0)}ml`, desc: "Añadir pH UP", color: "bg-pink-600", icon: <ArrowDownCircle className="rotate-180" /> });
    if (ec < target && ec > 0) alerts.push({ title: "EC BAJA", val: `${(((target-ec)/0.1)*vol*0.25).toFixed(1)}ml`, desc: "Añadir A+B", color: "bg-blue-700", icon: <FlaskConical /> });
    if (parseFloat(params.temp) > 25) alerts.push({ title: "TEMP ALTA", val: `${params.temp}°C`, desc: "Añadir Hielo", color: "bg-red-600", icon: <Thermometer /> });

    return alerts;
  }, [params, needsRotation]);

  const handleRotation = () => {
    if (confirm("¿Cosechar Nivel 3 (ABAJO) y bajar Niveles 1 y 2?")) {
      const remaining = plants.filter(p => p.level !== 3); // Cosechamos el de abajo
      const rotated = remaining.map(p => ({ ...p, level: p.level + 1 })); // El 1 baja al 2, el 2 al 3
      setPlants(rotated);
      setLastRotation(new Date().toISOString());
    }
  };

  const LevelGrid = ({ lvl }: { lvl: number }) => (
    <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 grid grid-cols-3 gap-3">
      {[1,2,3,4,5,6].map(pos => {
        const p = plants.find(x => x.level === lvl && x.position === pos);
        return (
          <button key={pos} onClick={() => { if(p) setPlants(plants.filter(x => x.id !== p.id)); else setShowPlantSelector({lvl, pos}); }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white shadow-md` : 'bg-white border-slate-200 text-slate-300'}`}>
            {p ? <Sprout className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
            {p && <span className="text-[7px] font-black uppercase mt-1">{p.variety.split(' ')[0]}</span>}
          </button>
        )
      })}
    </div>
  );

  if (!isAuthenticated && !isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-8 bg-white rounded-[2.5rem] text-center shadow-2xl">
          <Lock className="mx-auto mb-4 text-green-600" size={40} />
          <h2 className="text-xl font-black uppercase mb-6 italic italic">HydroCaru</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-3xl font-black bg-slate-100 rounded-2xl p-4 outline-none border-2 focus:border-green-500" onChange={(e) => e.target.value === "1234" && setIsAuthenticated(true)} />
        </Card>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white rounded-[3rem] shadow-2xl text-center">
          <div className="text-3xl font-[1000] italic bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent mb-8 italic">SETUP MAESTRO</div>
          {setupStep === 1 ? (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-400">Volumen Depósito (L)</h3>
              <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full bg-slate-50 rounded-3xl p-6 text-5xl font-black text-center border-2 border-green-100" />
              <button onClick={() => setSetupStep(2)} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase">Siguiente</button>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase text-slate-400 italic italic">Nivel 1 (ARRIBA)</h3>
              <LevelGrid lvl={1} />
              <button onClick={() => setIsSetupComplete(true)} className="w-full bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase shadow-xl mt-4">Activar Torre</button>
            </div>
          )}
        </Card>
        {showPlantSelector && <div className="fixed inset-0 bg-black/80 z-[9999] flex items-end p-4"><div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10"><div className="grid gap-3">{Object.keys(VARIETY_CONFIG).map(v => <button key={v} onClick={() => {setPlants([...plants, {id:Date.now(), variety:v, level:showPlantSelector.lvl, position:showPlantSelector.pos}]); setShowPlantSelector(null)}} className={`w-full p-5 rounded-2xl font-black text-white ${VARIETY_CONFIG[v].bg}`}>{v}</button>)}</div></div></div>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
        <div className="text-2xl font-[1000] italic bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent italic">HydroCaru</div>
        <Badge className="bg-slate-900 text-white font-black px-4 py-1 rounded-full text-xs italic">{params.waterVol}L / {initialVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-16 bg-white border-2 shadow-xl rounded-[1.5rem] mb-8 overflow-hidden">
            <TabsTrigger value="overview"><Activity size={18}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={18}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={18}/></TabsTrigger>
            <TabsTrigger value="history"><CalendarIcon size={18}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={18}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={18}/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {systemStatus.map((alert, i) => (
              <Card key={i} className={`${alert.color} text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-lg`}>
                <div className="w-10 h-10">{alert.icon}</div>
                <div><p className="text-[10px] font-black uppercase opacity-70 italic">{alert.title}</p><p className="text-3xl font-black italic">{alert.val}</p><p className="text-[10px] font-bold uppercase mt-1">{alert.desc}</p></div>
              </Card>
            ))}
            {systemStatus.length === 0 && <Card className="p-10 rounded-[2.5rem] bg-green-50 text-green-700 border-2 border-green-100 flex flex-col items-center justify-center gap-2 font-black italic"><Check size={40}/>SISTEMA ÓPTIMO</Card>}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-8 rounded-[3rem] bg-white shadow-2xl space-y-6">
              <div className="bg-blue-600 p-6 rounded-3xl text-white text-center shadow-inner">
                <label className="text-[9px] font-black uppercase opacity-60 italic italic">Objetivo EC Maestro</label>
                <input type="number" step="0.1" value={params.targetEC} onChange={e => setParams({...params, targetEC: e.target.value})} className="w-full bg-transparent text-5xl outline-none text-center font-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl border-2"><label className="text-[9px] text-slate-400 font-black uppercase">pH Real</label><input type="number" step="0.1" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="w-full bg-transparent text-3xl text-center font-black" /></div>
                <div className="bg-slate-50 p-5 rounded-3xl border-2"><label className="text-[9px] text-slate-400 font-black uppercase">EC Real</label><input type="number" step="0.1" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="w-full bg-transparent text-3xl text-center font-black" /></div>
                <div className="bg-cyan-50 p-5 rounded-3xl border-2 border-cyan-100"><label className="text-[9px] text-cyan-700 font-black uppercase">Agua (L)</label><input type="number" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="w-full bg-transparent text-3xl text-center font-black text-cyan-800" /></div>
                <div className="bg-orange-50 p-5 rounded-3xl border-2 border-orange-100"><label className="text-[9px] text-orange-700 font-black uppercase">Temp °C</label><input type="number" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="w-full bg-transparent text-3xl text-center font-black text-orange-800" /></div>
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-7 rounded-[2.2rem] font-black uppercase shadow-xl mt-4">Analizar Datos</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-6">
            <button onClick={handleRotation} className={`w-full p-6 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-4 shadow-xl transition-all ${needsRotation ? 'bg-orange-600 text-white animate-pulse' : 'bg-slate-900 text-white opacity-50'}`}>
              <Scissors size={20}/> {needsRotation ? "¡TOCA ROTAR Y COSECHAR!" : `ROTACIÓN EN ${7 - daysSinceRotation} DÍAS`}
            </button>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-4 italic italic">Nivel 1 (ARRIBA)</p><LevelGrid lvl={1} /></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-4 italic italic">Nivel 2 (CENTRO)</p><LevelGrid lvl={2} /></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-4 italic italic">Nivel 3 (ABAJO / COSECHA)</p><LevelGrid lvl={3} /></div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
             {needsRotation && (
               <Card className="p-6 rounded-[2.5rem] bg-orange-600 text-white shadow-xl flex items-center justify-between border-none" onClick={handleRotation}>
                  <div className="flex items-center gap-4"><Clock size={32}/><div className="font-black italic uppercase"><p className="text-[10px] opacity-70">Calendario</p><p>Toca Rotar</p></div></div>
                  <Scissors />
               </Card>
             )}
             <Card className="p-6 rounded-[2.5rem] bg-indigo-950 text-white shadow-xl">
                <h3 className="font-black uppercase text-[10px] mb-4 text-indigo-300 italic italic">Calendario de Muestreo</h3>
                <div className="grid grid-cols-4 gap-2">
                  {(plants.length / parseFloat(initialVol) > 0.6) ? 
                    ['Lun', 'Mar', 'Jue', 'Vie'].map(d => <div key={d} className="bg-white/10 p-2 rounded-xl text-center border border-white/10 font-black"><p className="text-[9px]">{d}</p><p className="text-[7px] text-red-400 uppercase">Medir</p></div>) :
                    ['Lunes', 'Jueves'].map(d => <div key={d} className="bg-white/10 p-2 rounded-xl text-center border border-white/10 font-black"><p className="text-[9px]">{d}</p><p className="text-[7px] text-indigo-300 uppercase">Medir</p></div>)
                  }
                </div>
             </Card>
             {history.map(h => {
               const bad = (parseFloat(h.pH) > 6.2 || parseFloat(h.pH) < 5.8 || parseFloat(h.ec) < parseFloat(h.targetEC));
               return (
                <Card key={h.id} className={`p-5 rounded-[2rem] bg-white border-2 font-black shadow-sm ${bad ? 'border-red-400 bg-red-50' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-center border-b pb-2 mb-1 text-[8px] text-slate-400 italic italic"><span>{h.date}</span><Badge className={bad ? 'bg-red-500' : 'bg-blue-600'}>{bad ? 'DESVIACIÓN' : 'OK'}</Badge></div>
                  <div className="flex justify-around text-xs italic italic">
                    <span className={parseFloat(h.pH) > 6.2 || parseFloat(h.pH) < 5.8 ? 'text-red-600' : 'text-slate-800'}>pH {h.pH}</span>
                    <span className={parseFloat(h.ec) < parseFloat(h.targetEC) ? 'text-red-600' : 'text-emerald-600'}>EC {h.ec}</span>
                    <span className={parseFloat(h.temp) > 25 ? 'text-red-600' : 'text-orange-400'}>{h.temp}°C</span>
                  </div>
                </Card>
               )
             })}
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card className="rounded-[3rem] shadow-xl bg-white border-2 border-orange-100 overflow-hidden">
              <div className="bg-orange-500 p-5 flex items-center gap-3 text-white"><Layers size={24} /><h3 className="font-black uppercase text-sm italic italic">Lana de Roca (Protocolo)</h3></div>
              <div className="p-7 space-y-4 text-xs font-black text-slate-600">
                <p>1. <span className="text-orange-600 uppercase">Estabilización:</span> Sumergir 24h en agua pH 5.5. La lana seca tiene pH 8.0 y quemará las raíces nuevas si no se neutraliza.</p>
                <p>2. <span className="text-orange-600 uppercase">Oxigenación:</span> No apretar la lana al sacarla del agua. Los poros deben tener aire para evitar hongos.</p>
              </div>
            </Card>
            <Card className="rounded-[3rem] shadow-xl bg-white border-2 border-emerald-100 overflow-hidden">
              <div className="bg-emerald-500 p-5 flex items-center gap-3 text-white"><Sprout size={24} /><h3 className="font-black uppercase text-sm italic italic">Sabiduría Maestro</h3></div>
              <div className="p-7 space-y-4 text-xs font-black text-slate-600">
                <div className="flex gap-4"><Zap className="text-yellow-500 shrink-0"/><p>Puntas quemadas = EC Alta. Diluye con agua pura.</p></div>
                <div className="flex gap-4"><Thermometer className="text-blue-500 shrink-0"/><p>+25°C el agua pierde oxígeno. ¡Usa botellas de hielo!</p></div>
                <div className="flex gap-4"><Droplets className="text-blue-700 shrink-0"/><p>Cosecha: 24h antes de comer, pon solo agua pura para limpiar sabores.</p></div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="py-10">
             <button onClick={() => {if(confirm('¿BORRAR TODO?')) {localStorage.removeItem("hydroCaru_V14_FIXED"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-10 rounded-[3rem] font-black uppercase text-xs border-2 border-red-200">Limpiar Base de Datos</button>
             <p className="text-center mt-6 text-[8px] font-black text-slate-300 tracking-widest uppercase italic italic italic leading-loose">HydroCaru v14.0 Honor Edition<br/>Soporte Técnico Especializado</p>
          </TabsContent>
        </Tabs>
      </main>
      {showPlantSelector && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end p-4"><div className="bg-white w-full max-w-md mx-auto rounded-[3.5rem] p-10"><div className="grid gap-3">{Object.keys(VARIETY_CONFIG).map(v => <button key={v} onClick={() => {setPlants([...plants, {id:Date.now(), variety:v, level:showPlantSelector.lvl, position:showPlantSelector.pos}]); setShowPlantSelector(null)}} className={`w-full p-5 rounded-2xl font-black text-white ${VARIETY_CONFIG[v].bg}`}>{v}</button>)}</div></div></div>}
    </div>
  );
}
