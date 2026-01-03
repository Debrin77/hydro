"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sprout, Activity, Layers, Beaker, Calendar as CalendarIcon, 
  Plus, Trash2, FlaskConical, ArrowDownCircle, Droplets, 
  Check, Lock, Lightbulb, Thermometer, Scissors, Clock, ShieldAlert
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const VARIETY_CONFIG: { [key: string]: { bg: string } } = {
  "Romana": { bg: "bg-emerald-500" },
  "Iceberg": { bg: "bg-blue-400" },
  "Hoja de Roble": { bg: "bg-red-500" },
  "Lollo Rosso": { bg: "bg-purple-500" },
  "Trocadero": { bg: "bg-lime-500" }
};

export default function HydroponicTowerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [plants, setPlants] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastRotation, setLastRotation] = useState<string>(new Date().toISOString());
  const [lastCleaning, setLastCleaning] = useState<string>(new Date().toISOString());
  const [initialVol, setInitialVol] = useState("20");
  const [showPlantSelector, setShowPlantSelector] = useState<{lvl: number, pos: number} | null>(null);
  const [params, setParams] = useState({ pH: "6.0", ec: "1.2", waterVol: "20", temp: "22", targetEC: "1.4" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hydro_v17_fix");
      if (saved) {
        const d = JSON.parse(saved);
        if (d) {
          setPlants(d.plants || []);
          setParams(d.params || { pH: "6.0", ec: "1.2", waterVol: "20", temp: "22", targetEC: "1.4" });
          setInitialVol(d.initialVol || "20");
          setHistory(d.history || []);
          setLastRotation(d.lastRotation || new Date().toISOString());
          setLastCleaning(d.lastCleaning || new Date().toISOString());
          setIsSetupComplete(d.isSetupComplete || false);
        }
      }
    } catch (e) { console.error("Error loading data", e); }
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem("hydro_v17_fix", JSON.stringify({
        isSetupComplete, plants, params, initialVol, history, lastRotation, lastCleaning
      }));
    }
  }, [isSetupComplete, plants, params, initialVol, history, lastRotation, lastCleaning]);

  const daysSinceRotation = Math.floor((Date.now() - new Date(lastRotation).getTime()) / 86400000) || 0;
  const daysSinceCleaning = Math.floor((Date.now() - new Date(lastCleaning).getTime()) / 86400000) || 0;

  const activeAlerts = useMemo(() => {
    const v = parseFloat(params.waterVol) || 0;
    const ph = parseFloat(params.pH) || 0;
    const ec = parseFloat(params.ec) || 0;
    const target = parseFloat(params.targetEC) || 1.4;
    const list = [];

    if (v > 0) {
      if (daysSinceRotation >= 7) list.push({ title: "ROTACIÓN", val: "TOCA", desc: "Cosechar Nivel 3", color: "bg-orange-600 animate-pulse", icon: <Clock /> });
      if (daysSinceCleaning >= 30) list.push({ title: "LIMPIEZA", val: "HOY", desc: "Lavar depósito", color: "bg-red-700", icon: <ShieldAlert /> });
      if (ph > 6.2) list.push({ title: "BAJAR pH", val: `${((ph - 6.0) * v * 1.5).toFixed(0)}ml`, desc: "pH DOWN", color: "bg-purple-600", icon: <ArrowDownCircle /> });
      if (ph < 5.6 && ph > 0) list.push({ title: "SUBIR pH", val: `${((6.0 - ph) * v * 1.5).toFixed(0)}ml`, desc: "pH UP", color: "bg-pink-600", icon: <ArrowDownCircle className="rotate-180" /> });
      if (ec < target && ec > 0) list.push({ title: "NUTRIENTES", val: `${(((target - ec) / 0.1) * v * 0.25).toFixed(1)}ml`, desc: "Solución A+B", color: "bg-blue-700", icon: <FlaskConical /> });
      if (parseFloat(params.temp) > 25) list.push({ title: "TEMP ALTA", val: `${params.temp}°C`, desc: "Hielo", color: "bg-red-500", icon: <Thermometer /> });
    }
    return list;
  }, [params, daysSinceRotation, daysSinceCleaning]);

  const handleRotation = () => {
    if (confirm("¿Cosechar Nivel 3 (ABAJO) y bajar niveles 1 y 2?")) {
      setPlants(prev => {
        const filtered = prev.filter(p => p.level !== 3);
        return filtered.map(p => ({ ...p, level: p.level + 1 }));
      });
      setLastRotation(new Date().toISOString());
    }
  };

  const LevelGrid = ({ lvl }: { lvl: number }) => (
    <div className="bg-slate-100 p-3 rounded-2xl grid grid-cols-3 gap-2 border border-slate-200">
      {[1,2,3,4,5,6].map(pos => {
        const p = plants.find(x => x.level === lvl && x.position === pos);
        return (
          <button key={pos} onClick={() => p ? setPlants(plants.filter(x => x.id !== p.id)) : setShowPlantSelector({lvl, pos})} className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 ${p ? `${VARIETY_CONFIG[p.variety]?.bg} border-white text-white` : 'bg-white border-slate-300 text-slate-300'}`}>
            {p ? <Sprout size={16} /> : <Plus size={16} />}
            {p && <span className="text-[6px] font-black uppercase mt-1">{p.variety}</span>}
          </button>
        )
      })}
    </div>
  );

  if (!isAuthenticated && !isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-xs p-8 bg-white rounded-3xl text-center">
          <Lock className="mx-auto mb-4 text-green-600" />
          <h2 className="text-xl font-black mb-6">HYDROCARU</h2>
          <input type="password" placeholder="PIN" className="w-full text-center text-2xl font-black bg-slate-100 rounded-xl p-4 outline-none" onChange={(e) => e.target.value === "1234" && setIsAuthenticated(true)} />
        </Card>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl font-black text-center text-green-700 italic uppercase">Setup Torre</h2>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400">Volumen Agua (L)</label>
            <input type="number" value={initialVol} onChange={e => {setInitialVol(e.target.value); setParams({...params, waterVol: e.target.value})}} className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-2xl font-black text-center" />
          </div>
          <button onClick={() => setIsSetupComplete(true)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase">Activar</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-xl font-black italic text-green-700">HydroCaru v17</div>
        <Badge className="bg-slate-900 text-white">{params.waterVol}L</Badge>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 bg-white border shadow-sm rounded-xl mb-6 overflow-hidden">
            <TabsTrigger value="overview"><Activity size={18}/></TabsTrigger>
            <TabsTrigger value="measure"><Beaker size={18}/></TabsTrigger>
            <TabsTrigger value="tower"><Layers size={18}/></TabsTrigger>
            <TabsTrigger value="history"><CalendarIcon size={18}/></TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb size={18}/></TabsTrigger>
            <TabsTrigger value="settings"><Trash2 size={18}/></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            {activeAlerts.map((a, i) => (
              <Card key={i} className={`${a.color} text-white p-4 rounded-2xl flex items-center gap-4 border-none shadow-md`}>
                {a.icon}
                <div><p className="text-[8px] font-black uppercase opacity-70">{a.title}</p><p className="text-xl font-black">{a.val}</p><p className="text-[8px] font-bold">{a.desc}</p></div>
              </Card>
            ))}
            {activeAlerts.length === 0 && <Card className="p-10 text-center font-black text-green-700 border-2 border-green-200 bg-green-50 rounded-3xl">TODO OK</Card>}
          </TabsContent>

          <TabsContent value="measure">
            <Card className="p-6 rounded-3xl bg-white space-y-4 shadow-sm border">
              <div className="bg-blue-600 p-3 rounded-xl text-white text-center">
                <label className="text-[10px] font-black uppercase">EC Objetivo</label>
                <input type="number" step="0.1" value={params.targetEC} onChange={e => setParams({...params, targetEC: e.target.value})} className="w-full bg-transparent text-3xl text-center font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="pH" value={params.pH} onChange={e => setParams({...params, pH: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-center font-black" />
                <input type="number" placeholder="EC" value={params.ec} onChange={e => setParams({...params, ec: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-center font-black" />
                <input type="number" placeholder="Agua L" value={params.waterVol} onChange={e => setParams({...params, waterVol: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-center font-black" />
                <input type="number" placeholder="Temp" value={params.temp} onChange={e => setParams({...params, temp: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-center font-black" />
              </div>
              <button onClick={() => { setHistory([{...params, id: Date.now(), date: new Date().toLocaleString()}, ...history]); setActiveTab("overview"); }} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black uppercase">Guardar</button>
            </Card>
          </TabsContent>

          <TabsContent value="tower" className="space-y-4">
            <button onClick={handleRotation} className={`w-full p-5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg ${daysSinceRotation >= 7 ? 'bg-orange-600 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
                <Scissors size={18}/> {daysSinceRotation >= 7 ? "TOCA ROTAR AHORA" : `ROTAR EN ${7-daysSinceRotation} DÍAS`}
            </button>
            <div className="space-y-4">
              <div><p className="text-[10px] font-black text-slate-400 mb-1 uppercase">N1 - ARRIBA</p><LevelGrid lvl={1} /></div>
              <div><p className="text-[10px] font-black text-slate-400 mb-1 uppercase">N2 - CENTRO</p><LevelGrid lvl={2} /></div>
              <div><p className="text-[10px] font-black text-slate-400 mb-1 uppercase">N3 - ABAJO (COSECHA)</p><LevelGrid lvl={3} /></div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-4 rounded-2xl bg-indigo-950 text-white shadow-xl mb-6">
                <h3 className="text-[10px] font-black italic mb-3 text-indigo-300 uppercase">CALENDARIO DE TRABAJO</h3>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({length: 28}).map((_, i) => {
                        const day = i + 1;
                        const isM = day % 3 === 0; const isR = day % 7 === 0; const isC = day === 28;
                        return (
                            <div key={i} className={`h-8 flex items-center justify-center rounded-md text-[9px] font-black border ${isC ? 'bg-red-500' : isR ? 'bg-orange-500' : isM ? 'bg-blue-500' : 'bg-white/5 opacity-20'}`}>{day}</div>
                        )
                    })}
                </div>
            </Card>
            {history.map(h => (
                <div key={h.id} className="p-3 bg-white border rounded-xl mb-2 flex justify-between text-xs font-black italic">
                    <span className="text-slate-400">{h.date.split(',')[0]}</span>
                    <span>pH {h.pH} | EC {h.ec} | {h.temp}°C</span>
                </div>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="space-y-3">
            <Card className="p-4 rounded-2xl bg-orange-50 border-orange-200 border-2">
                <p className="text-xs font-black text-orange-800 uppercase mb-1">Lana de Roca</p>
                <p className="text-[10px] font-bold">Sumergir 24h en agua pH 5.5 antes de usar. Nunca apretar la lana; debe mantener aire para las raíces.</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-3">
            <button onClick={() => {if(confirm('¿RESET?')) {localStorage.removeItem("hydro_v17_fix"); window.location.reload();}}} className="w-full bg-red-100 text-red-600 p-6 rounded-2xl font-black">RESET APP</button>
            <button onClick={() => {setLastCleaning(new Date().toISOString()); alert('Hecho')}} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-[10px]">Depósito Limpiado Hoy</button>
          </TabsContent>
        </Tabs>
      </main>

      {showPlantSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-end p-4 z-[9999]">
          <div className="bg-white w-full max-w-md mx-auto rounded-3xl p-6 space-y-3">
            {Object.keys(VARIETY_CONFIG).map(v => (
              <button key={v} onClick={() => {setPlants([...plants, {id: Date.now(), variety: v, level: showPlantSelector.lvl, position: showPlantSelector.pos}]); setShowPlantSelector(null);}} className={`w-full p-4 rounded-xl font-black text-white ${VARIETY_CONFIG[v].bg}`}>{v}</button>
            ))}
            <button onClick={() => setShowPlantSelector(null)} className="w-full p-2 text-xs font-black uppercase text-slate-400">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
